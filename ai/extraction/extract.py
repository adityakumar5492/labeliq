import base64
import json
import os
import sys

from dotenv import load_dotenv
from google import genai


load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

DEBUG_EXTRACTION = os.getenv("DEBUG_EXTRACTION") == "1"


EXTRACTION_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "name": {
            "type": "STRING",
            "nullable": True
        },
        "brand": {
            "type": "STRING",
            "nullable": True
        },
        "category": {
            "type": "STRING",
            "nullable": True
        },
        "servingSize": {
            "type": "OBJECT",
            "properties": {
                "value": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "unit": {
                    "type": "STRING",
                    "nullable": True
                }
            },
            "required": ["value", "unit"]
        },
        "nutrition": {
            "type": "OBJECT",
            "properties": {
                "calories": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "protein": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "carbohydrates": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "totalFat": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "saturatedFat": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "sugar": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "fiber": {
                    "type": "NUMBER",
                    "nullable": True
                },
                "sodium": {
                    "type": "NUMBER",
                    "nullable": True
                }
            },
            "required": [
                "calories",
                "protein",
                "carbohydrates",
                "totalFat",
                "saturatedFat",
                "sugar",
                "fiber",
                "sodium"
            ]
        },
        "ingredients": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {
                        "type": "STRING"
                    }
                },
                "required": ["name"]
            }
        },
        "confidence": {
            "type": "STRING",
            "enum": [
                "high",
                "medium",
                "low"
            ]
        },
        "uncertainFields": {
            "type": "ARRAY",
            "items": {
                "type": "STRING"
            }
        }
    },
    "required": [
        "name",
        "brand",
        "category",
        "servingSize",
        "nutrition",
        "ingredients",
        "confidence",
        "uncertainFields"
    ]
}


def extract_product(image_base64, mime_type):
    prompt = """
You are the food-label extraction engine for LabelIQ.

Your ONLY job is to carefully read the visible food-label image
and return structured product information.

Do NOT perform nutrition analysis.
Do NOT calculate anything.
Do NOT give a health opinion.
Do NOT give a grade or score.
Do NOT recommend whether the product is healthy.

==================================================
IMAGE ORIENTATION
==================================================

Food-label photos are frequently rotated. The nutrition table in
particular is very often printed sideways (rotated 90 degrees) on
the packaging itself, independent of how the photo was taken.

Before giving up on a table, mentally rotate the image and check
whether the text reads correctly in a different orientation.
Small, sideways-printed nutrition tables are common and must still
be read carefully, row by row.

==================================================
CRITICAL IMAGE READING INSTRUCTIONS
==================================================

Inspect the ENTIRE image carefully before producing the result.

Pay special attention to:

1. PRODUCT NAME
2. BRAND
3. CATEGORY
4. SERVING SIZE
5. NUTRITION FACTS TABLE
6. INGREDIENT LIST

The nutrition table is especially important.

Read each nutrition row individually, one at a time. Do not skip
a row just because the surrounding text is small or the table is
rotated.

Do NOT assume that a nutrition value is missing simply because
the table text is small or sideways.

Carefully inspect the numbers associated with:

- Calories
- Protein
- Carbohydrates
- Total Fat
- Saturated Fat
- Sugar
- Fiber
- Sodium

If the nutrition table contains multiple columns such as:

- Per 100 g
- Per serving
- Per 20 g
- % Daily Value

identify the serving-size column that corresponds to the
identified serving size and extract the values from that column.

Do NOT accidentally extract % Daily Value instead of the
actual nutrient quantity.

==================================================
PRODUCT NAME
==================================================

Only fill "name" if a distinct product name is visibly printed on
THIS image (for example, on a front-of-pack panel). Many photos
show only the back-of-pack ingredients/nutrition panel, where no
standalone product name is printed — in that case "name" must be
null. Do not infer the name from the brand, category, or general
knowledge of the product.

==================================================
SERVING SIZE
==================================================

Find the actual serving size printed on the label.

For example:

Serving Size: 20 g

should become:

{
  "value": 20,
  "unit": "g"
}

Allowed units:

- g
- ml
- piece

Do not calculate serving size.

==================================================
NUTRITION
==================================================

Extract the ACTUAL numeric quantity printed on the label.

Examples:

Calories: 100 kcal
Protein: 2 g
Carbohydrates: 12 g
Total Fat: 5 g
Saturated Fat: 2 g
Sugar: 1 g
Fiber: 1 g
Sodium: 200 mg

The JSON must contain numbers, not strings.

For example:

"protein": 2

NOT:

"protein": "2g"

Convert ONLY the displayed unit when necessary:

- grams → grams
- milligrams → milligrams
- kcal → kcal

Do NOT calculate or derive values.

If a nutrient is genuinely not visible or cannot be reliably
read even after checking for rotated text, return null.

IMPORTANT:

Do NOT use 0 for an unreadable or missing value.

Use null.

==================================================
INGREDIENTS
==================================================

Read the ingredient list carefully.

Preserve the exact order in which ingredients appear.

Do not invent ingredients.

Do not remove ingredients simply because they are unfamiliar.

If the ingredient list contains groups such as:

"Spices and Condiments"

preserve the visible wording.

Return:

[
  {"name": "Ingredient 1"},
  {"name": "Ingredient 2"}
]

==================================================
UNCERTAIN FIELDS
==================================================

Use uncertainFields only when information is visible but difficult
to read or ambiguous.

For example:

"uncertainFields": [
  "nutrition.sodium"
]

If information is completely absent, use null and do not add it
to uncertainFields.

==================================================
CONFIDENCE
==================================================

Use:

high:
Information is clearly readable.

medium:
Most information is readable but some fields are difficult.

low:
Important information is significantly unclear or unreadable.

==================================================
NO GUESSING
==================================================

NEVER infer information from:

- common food products
- brand knowledge
- typical nutrition values
- another product
- internet knowledge
- nutritional calculations

Only use information visibly present in the supplied image.

==================================================
OUTPUT
==================================================

Return ONLY the requested JSON structure.

No markdown.
No explanation.
No comments.
No ```json block.
"""

    image_bytes = base64.b64decode(
        image_base64
    )

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            {
                "text": prompt
            },
            {
                "inline_data": {
                    "mime_type": mime_type,
                    "data": image_bytes,
                }
            },
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": EXTRACTION_SCHEMA,
        },
    )

    text = response.text.strip()

    if DEBUG_EXTRACTION:
        # Temporary debugging output. Written to stderr only, so it
        # never interferes with the JSON contract on stdout that
        # Node parses. Remove once the root cause is confirmed.
        print(
            "----- DEBUG: raw Gemini response.text -----",
            file=sys.stderr,
        )
        print(text, file=sys.stderr)

        try:
            candidate = response.candidates[0]
            print(
                "finish_reason=" + str(candidate.finish_reason),
                file=sys.stderr,
            )
        except Exception:
            pass

        print(
            "----- END DEBUG -----",
            file=sys.stderr,
        )

    if text.startswith("```"):
        text = text.replace(
            "```json",
            "",
        ).replace(
            "```",
            "",
        ).strip()

    result = json.loads(text)

    return result


def main():
    try:
        raw_input = sys.stdin.read().strip()

        if not raw_input:
            print(
                json.dumps({
                    "success": False,
                    "message": "Input is required",
                })
            )
            return

        data = json.loads(raw_input)

        image_base64 = data.get(
            "imageBase64"
        )

        mime_type = data.get(
            "mimeType"
        )

        if not image_base64:
            raise ValueError(
                "Image data is required."
            )

        if not mime_type:
            raise ValueError(
                "Image MIME type is required."
            )

        result = extract_product(
            image_base64,
            mime_type,
        )

        print(
            json.dumps({
                "success": True,
                "data": result,
            })
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