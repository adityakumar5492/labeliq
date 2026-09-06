import json
import sys

from generator import (
    generate_answer,
    retrieve_product_evidence,
)


def main():
    if len(sys.argv) < 2:
        print(
            json.dumps({
                "success": False,
                "message": "Input is required",
            })
        )
        return

    raw_input = sys.argv[1]

    try:
        input_data = json.loads(
            raw_input
        )

    except json.JSONDecodeError:
        print(
            json.dumps({
                "success": False,
                "message": "Invalid JSON input",
            })
        )
        return

    try:
        # Backward compatibility:
        # allow the old format:
        # {"question": "..."}
        question = input_data.get(
            "question"
        )

        product = input_data.get(
            "product"
        )

        user_preferences = input_data.get(
            "userPreferences"
        )

        # Deterministic LabelIQ nutrition analysis
        nutrition_analysis = input_data.get(
            "nutritionAnalysis"
        )

        # Evidence-only mode is used by the
        # Ingredient Insights endpoint.
        #
        # It retrieves trusted/local evidence without
        # making a Gemini request.
        evidence_only = input_data.get(
            "evidenceOnly",
            False,
        )

        if (
            not question
            and not product
        ):
            print(
                json.dumps({
                    "success": False,
                    "message": (
                        "Question or product "
                        "information is required"
                    ),
                })
            )
            return

        # -------------------------------------------------
        # Evidence-only product flow
        # -------------------------------------------------
        #
        # Used by:
        # GET /ingredients/products/:productId
        #
        # This must NOT call Gemini.
        #
        if product and evidence_only:
            evidence = retrieve_product_evidence(
                product
            )

            response = {
                "success": True,
                "question": question,
                "answer": None,
                "evidence": evidence,
            }

            print(
                json.dumps(response)
            )
            return

        # -------------------------------------------------
        # Normal product analysis flow
        # -------------------------------------------------
        #
        # Gemini receives the deterministic assessment
        # and the same retrieved evidence.
        #
        if product:
            result = generate_answer(
                question=question,
                product=product,
                user_preferences=user_preferences,
                nutrition_analysis=nutrition_analysis,
                return_evidence=True,
            )

            response = {
                "success": True,
                "question": question,
                "answer": result["answer"],
                "evidence": result["evidence"],
            }

        # -------------------------------------------------
        # Existing standalone ingredient-question flow
        # -------------------------------------------------
        else:
            answer = generate_answer(
                question=question,
                user_preferences=user_preferences,
                nutrition_analysis=nutrition_analysis,
            )

            response = {
                "success": True,
                "question": question,
                "answer": answer,
            }

        print(
            json.dumps(response)
        )

    except Exception as error:
        print(
            json.dumps({
                "success": False,
                "message": str(error),
            })
        )


if __name__ == "__main__":
    main()