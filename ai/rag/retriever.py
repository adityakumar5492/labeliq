import json
import os
import re

from source_fetcher import fetch_sources


KNOWLEDGE_BASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "knowledge",
    "ingredients.json",
)


def load_knowledge_base():
    with open(
        KNOWLEDGE_BASE_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def normalize_text(text):
    return re.sub(
        r"\s+",
        " ",
        text.lower().strip(),
    )


def ingredient_is_mentioned(
    query,
    ingredient_name,
):
    query = normalize_text(query)
    ingredient_name = normalize_text(
        ingredient_name
    )

    if not ingredient_name:
        return False

    pattern = (
        r"\b"
        + re.escape(ingredient_name)
        + r"\b"
    )

    return bool(
        re.search(pattern, query)
    )


def retrieve_local(query):
    documents = load_knowledge_base()

    results = []

    for document in documents:
        ingredient_name = document.get(
            "name",
            "",
        )

        if ingredient_is_mentioned(
            query,
            ingredient_name,
        ):
            results.append(
                {
                    "document": document,
                    "score": 10,
                }
            )

    return results


def retrieve(query):
    """
    Retrieve only ingredients explicitly mentioned
    in the user's question.
    """

    local_results = retrieve_local(
        query
    )

    external_sources = []

    for result in local_results:
        ingredient_name = result[
            "document"
        ].get("name")

        if not ingredient_name:
            continue

        sources = fetch_sources(
            ingredient_name
        )

        for source in sources:
            external_sources.append(
                {
                    "ingredient": ingredient_name,
                    "source": source,
                }
            )

    return {
        "local": local_results,
        "external": external_sources,
    }


def print_results(results):
    print("\nLocal knowledge:\n")

    if not results["local"]:
        print(
            "No local information found."
        )
    else:
        for result in results["local"]:
            document = result["document"]

            print(
                f"Ingredient: "
                f"{document['name']}"
            )

            print(
                f"Description: "
                f"{document['description']}"
            )

            print(
                f"Purpose: "
                f"{document['purpose']}"
            )

            print(
                f"Source: "
                f"{document['source']}"
            )

            print(
                f"Match score: "
                f"{result['score']}"
            )

            print("-" * 50)

    print(
        "\nTrusted external sources:\n"
    )

    if not results["external"]:
        print(
            "No external source information found."
        )
    else:
        for item in results["external"]:
            source = item["source"]

            print(
                f"Ingredient: "
                f"{item['ingredient']}"
            )

            print(
                f"Source: "
                f"{source['source']}"
            )

            print(
                f"Type: "
                f"{source['type']}"
            )

            print(
                f"URL: "
                f"{source['url']}"
            )

            if source.get("casNumber"):
                print(
                    f"CAS: "
                    f"{source['casNumber']}"
                )

            if source.get(
                "technicalEffects"
            ):
                print(
                    "Technical effects:"
                )

                for effect in source[
                    "technicalEffects"
                ]:
                    print(
                        f"  - {effect}"
                    )

            if source.get("regulation"):
                print(
                    f"Regulation: "
                    f"{source['regulation']}"
                )

            print("-" * 50)


if __name__ == "__main__":
    question = input(
        "Ask about an ingredient: "
    ).strip()

    if not question:
        print(
            "Question is required."
        )
        raise SystemExit

    results = retrieve(question)

    print_results(results)