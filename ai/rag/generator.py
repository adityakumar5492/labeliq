import os

from dotenv import load_dotenv
from google import genai

from retriever import retrieve


load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def build_context(results):
    context_parts = []

    # Local knowledge
    for result in results.get("local", []):
        document = result["document"]

        context_parts.append(
            f"""
LOCAL KNOWLEDGE
Ingredient: {document.get("name")}
Description: {document.get("description")}
Purpose: {document.get("purpose")}
Source: {document.get("source")}
""".strip()
        )

    # Trusted external sources
    for item in results.get("external", []):
        source = item["source"]

        technical_effects = source.get(
            "technicalEffects",
            [],
        )

        effects_text = ", ".join(
            technical_effects
        )

        context_parts.append(
            f"""
TRUSTED EXTERNAL SOURCE
Ingredient: {item.get("ingredient")}
Source: {source.get("source")}
Type: {source.get("type")}
CAS number: {source.get("casNumber") or "Not available"}
Possible food uses: {effects_text or "Not available"}
Regulation: {source.get("regulation") or "Not available"}
Source URL: {source.get("url")}
""".strip()
        )

    return "\n\n".join(
        context_parts
    )


def retrieve_product_evidence(product):
    """
    Retrieve evidence for the ingredients present
    in a product.

    This returns the evidence used by Gemini,
    allowing the same trusted-source information
    to be exposed to other parts of LabelIQ without
    performing a second retrieval.
    """

    ingredients = product.get(
        "ingredients",
        [],
    )

    all_results = {
        "local": [],
        "external": [],
    }

    seen_local = set()
    seen_external = set()

    for ingredient in ingredients:
        if isinstance(
            ingredient,
            dict,
        ):
            ingredient_name = ingredient.get(
                "name"
            )
        else:
            ingredient_name = ingredient

        if not ingredient_name:
            continue

        ingredient_results = retrieve(
            f"What is {ingredient_name}?"
        )

        for result in ingredient_results.get(
            "local",
            [],
        ):
            document = result["document"]

            name = document.get(
                "name"
            )

            if name and name not in seen_local:
                all_results["local"].append(
                    result
                )

                seen_local.add(name)

        for item in ingredient_results.get(
            "external",
            [],
        ):
            source = item["source"]

            key = (
                item.get("ingredient"),
                source.get("source"),
            )

            if key not in seen_external:
                all_results["external"].append(
                    item
                )

                seen_external.add(key)

    return all_results


def build_product_context(
    product,
    user_preferences,
    evidence,
    nutrition_analysis=None,
):
    nutrition = product.get(
        "nutrition",
        {},
    )

    serving_size = product.get(
        "servingSize"
    )

    ingredients = product.get(
        "ingredients",
        [],
    )

    ingredient_names = []

    for ingredient in ingredients:
        if isinstance(
            ingredient,
            dict,
        ):
            name = ingredient.get(
                "name"
            )
        else:
            name = ingredient

        if name:
            ingredient_names.append(name)

    nutrition_analysis = (
        nutrition_analysis or {}
    )

    grade = nutrition_analysis.get(
        "grade"
    )

    assessment = nutrition_analysis.get(
        "assessment"
    )

    score = nutrition_analysis.get(
        "score"
    )

    confidence = nutrition_analysis.get(
        "confidence"
    )

    goal_alignment = nutrition_analysis.get(
        "goalAlignment"
    )

    reasons = nutrition_analysis.get(
        "reasons",
        [],
    )

    missing_data = nutrition_analysis.get(
        "missingData",
        [],
    )

    return f"""
PRODUCT INFORMATION

Product name:
{product.get("name", "Not provided")}

Brand:
{product.get("brand", "Not provided")}

Category:
{product.get("category", "Not provided")}

Serving size:
{serving_size or "Not provided"}

Nutrition per serving:
{nutrition or "Not provided"}

Ingredients:
{", ".join(ingredient_names) or "Not provided"}


DETERMINISTIC LABELIQ ASSESSMENT

IMPORTANT:
The following assessment was calculated by LabelIQ's
deterministic nutrition analysis engine.

Grade:
{grade or "Insufficient data"}

Score:
{score if score is not None else "Not available"}

Assessment:
{assessment or "insufficient-data"}

Confidence:
{confidence or "low"}

Goal alignment:
{goal_alignment or "Not available"}

Assessment reasons:
{reasons or "Not available"}

Missing nutrition data:
{missing_data or "None reported"}


USER PREFERENCES

Goal:
{user_preferences.get("goal", "general")
 if user_preferences
 else "general"}

Dietary preference:
{user_preferences.get("dietaryPreference", "none")
 if user_preferences
 else "none"}

Allergens:
{user_preferences.get("allergens", [])
 if user_preferences
 else []}

Ingredients to avoid:
{user_preferences.get("ingredientsToAvoid", [])
 if user_preferences
 else []}


REFERENCE EVIDENCE

{build_context(evidence)}
""".strip()


def generate_answer(
    question=None,
    product=None,
    user_preferences=None,
    nutrition_analysis=None,
    return_evidence=False,
):
    # Product analysis flow
    if product:
        evidence = retrieve_product_evidence(
            product
        )

        context = build_product_context(
            product,
            user_preferences or {},
            evidence,
            nutrition_analysis,
        )

        prompt = f"""
You are LabelIQ, a food-label analysis assistant.

Your job is to explain the product using the
product information, the deterministic LabelIQ
assessment, and the available reference evidence.

IMPORTANT RULES:

1. NEVER calculate, change, replace, or override the
   provided LabelIQ grade or overall assessment.

2. The deterministic LabelIQ assessment is the
   SOURCE OF TRUTH for:
   - Grade
   - Score
   - Overall assessment
   - Confidence
   - Goal alignment

3. Your job is to EXPLAIN the provided assessment,
   not create a new assessment.

4. If the provided assessment is:
   Everyday
   then your response MUST say:
   "Overall assessment: Everyday"

5. If the provided assessment is:
   Regular
   then your response MUST say:
   "Overall assessment: Regular"

6. If the provided assessment is:
   Occasional
   then your response MUST say:
   "Overall assessment: Occasional"

7. If the provided assessment is:
   insufficient-data
   then your response MUST say:
   "Overall assessment: Insufficient data"

8. Do not independently decide that the product is
   Everyday, Regular, Occasional, or Insufficient data.

9. Never invent nutrition values, ingredient quantities,
   health effects, risks, benefits, or missing information.

10. Do not automatically call a product or ingredient
    "good", "bad", "healthy", or "unhealthy".

11. Use the product's actual nutrition values and serving
    size when explaining the deterministic assessment.

12. If an ingredient amount is not provided, say:
    "Amount not provided on the label."

13. If an ingredient's exact purpose in this product
    is unknown, say so.

14. FDA technical effects describe possible food uses.
    Do not claim that a specific use definitely applies
    to this product unless the product information proves it.

15. Do not make medical recommendations.

16. Do not tell the user exactly how many servings they
    should eat per day.

17. If there is not enough reliable information,
    clearly state that information is unavailable.

18. Explain technical information in simple language.

19. Clearly distinguish:
    - information directly from the product label
    - information from trusted sources
    - LabelIQ's deterministic assessment
    - AI explanation

20. Mention the relevant trusted sources by name.

21. Do not contradict the deterministic LabelIQ assessment.

22. Do not create a different score or grade.

Use this structure:

Overall assessment:
Use EXACTLY the assessment provided by the
deterministic LabelIQ engine.

Why:
Explain why the deterministic engine produced
this assessment using its provided reasons and
the available nutrition information.

Nutrition:
Explain the important nutrition values and serving size.

Ingredient insights:
Explain only the ingredients for which useful evidence
is available.

Personalized insight:
Explain how the product relates to the user's selected goal.

What we cannot determine:
Mention important missing information, including
ingredient quantities that are not present on the label.

Sources:
List the trusted sources used.

IMPORTANT:
The "Overall assessment" must match the deterministic
LabelIQ assessment exactly.

Do not replace "Everyday" with "Regular".
Do not replace "Regular" with "Occasional".
Do not replace "Occasional" with "Everyday".
Do not create your own assessment.

PRODUCT AND REFERENCE INFORMATION:

{context}
"""

    # Existing ingredient-question flow
    else:
        if not question:
            return (
                "A question or product is required."
            )

        results = retrieve(question)

        if (
            not results.get("local")
            and not results.get("external")
        ):
            return (
                "I could not find enough trusted "
                "information to answer this question."
            )

        context = build_context(
            results
        )

        prompt = f"""
You are LabelIQ, a food-label explanation assistant.

Your job is to explain food ingredients using
the evidence provided below.

IMPORTANT RULES:

1. Use only the provided reference information.

2. Do not invent facts, quantities, health effects,
   risks, benefits, or nutritional values.

3. Do not automatically describe an ingredient as
   "good", "bad", "healthy", or "unhealthy".

4. If the amount of an ingredient is not provided,
   clearly say that its amount is unknown.

5. If a source lists possible food uses, explain that
   these are possible uses and do NOT claim that the
   ingredient is definitely serving that function in
   the user's particular product.

6. Do not turn a regulatory reference into a health
   recommendation.

7. If the evidence is insufficient, say so clearly.

8. Mention the relevant source by name.

9. Keep the explanation simple enough for a normal
   food consumer.

10. Do not expose unnecessary technical database
    details unless they help answer the question.

Structure the answer like this when appropriate:

What it is:
A simple explanation.

Why it may be used:
Explain the documented food uses in simple language.

What this means:
Explain what can and cannot be concluded from
the available information.

Source:
Name the trusted source.

REFERENCE INFORMATION:

{context}

USER QUESTION:

{question}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    answer = response.text

    if product and return_evidence:
        return {
            "answer": answer,
            "evidence": evidence,
        }

    return answer


if __name__ == "__main__":
    question = input(
        "Ask about an ingredient: "
    ).strip()

    if not question:
        print(
            "Question is required."
        )
        raise SystemExit

    answer = generate_answer(
        question=question
    )

    print("\nLabelIQ:\n")
    print(answer)