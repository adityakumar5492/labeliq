import html
import re
import sys

import requests


FDA_BASE_URL = (
    "https://www.hfpappexternal.fda.gov/"
    "scripts/fdcc/index.cfm"
)


def debug_log(message):
    # stderr only - never touches stdout, so it can't corrupt
    # the JSON response that api.py prints on stdout.
    print(
        f"[source_fetcher] {message}",
        file=sys.stderr,
    )


def normalize_ingredient_name(name):
    return re.sub(
        r"\s+",
        " ",
        name.strip().lower(),
    )


def build_id_candidates(ingredient_name):
    """
    FDA's FoodSubstances catalog frequently lists compound
    names inverted, alphabetized by the primary chemical term
    (e.g. "CITRIC ACID" is listed as "ACID, CITRIC"). A plain
    substring match against the name as typed silently fails
    for any ingredient listed this way.

    This returns an ordered list of candidate ids to try:
      1. The name as-is.
      2. An inverted "LAST, REST" form, for multi-word names.
    """

    candidates = [ingredient_name]

    words = ingredient_name.split(" ")

    if len(words) >= 2:
        inverted = (
            f"{words[-1]}, "
            f"{' '.join(words[:-1])}"
        )

        if inverted not in candidates:
            candidates.append(inverted)

    return candidates


def clean_html(text):
    if not text:
        return ""

    text = html.unescape(text)

    text = re.sub(
        r"<script.*?</script>",
        " ",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )

    text = re.sub(
        r"<style.*?</style>",
        " ",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )

    text = re.sub(
        r"<[^>]+>",
        " ",
        text,
    )

    text = html.unescape(text)

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def extract_field(text, pattern):
    match = re.search(
        pattern,
        text,
        re.IGNORECASE,
    )

    if not match:
        return None

    value = match.group(1)

    value = re.sub(
        r"\s+",
        " ",
        value,
    ).strip()

    return value


def fetch_fda_for_id(display_name, id_value):
    """
    Attempt a single FDA lookup for a specific id string.
    Returns the parsed source dict, or None if this particular
    id did not resolve to a match.
    """

    params = {
        "id": id_value.upper(),
        "set": "FoodSubstances",
    }

    try:
        response = requests.get(
            FDA_BASE_URL,
            params=params,
            timeout=10,
        )
    except requests.RequestException as error:
        debug_log(
            f"request failed for id={id_value!r}: {error}"
        )
        return None

    if response.status_code != 200:
        debug_log(
            f"non-200 status ({response.status_code}) "
            f"for id={id_value!r}"
        )
        return None

    text = clean_html(
        response.text
    )

    id_upper = id_value.upper()

    if id_upper not in text:
        debug_log(
            f"no match in FDA response for id={id_value!r} "
            f"(display_name={display_name!r})"
        )
        return None

    cas_number = extract_field(
        text,
        r"CAS Reg\. No\.\s*\(or other ID\)\*?:?\s*"
        r"(.*?)(?=\s+Substance\s*\*?:)",
    )

    technical_effect = extract_field(
        text,
        r"Used for\s*\*?\s*†?\s*"
        r"\(Technical Effect\):?\s*"
        r"(.*?)(?=\s+Food additive and GRAS regulations)",
    )

    regulation = extract_field(
        text,
        r"Food additive and GRAS regulations"
        r"\s*\(21 CFR Parts 170-186\)\*?:?\s*"
        r"(.*?)(?=\s+\*Definitions|\s+CAS Reg)",
    )

    if technical_effect:
        technical_effect = (
            technical_effect
            .replace("†", "")
            .strip()
        )

    if regulation:
        regulation = (
            regulation
            .replace("\xa0", " ")
            .strip()
        )

    technical_effects = []

    if technical_effect:
        technical_effects = [
            item.strip().lower()
            for item in technical_effect.split(",")
            if item.strip()
        ]

    debug_log(
        f"match found for id={id_value!r} "
        f"(display_name={display_name!r})"
    )

    return {
        "source": "FDA",
        "type": "food-regulatory",
        "ingredient": display_name,
        "casNumber": cas_number,
        "technicalEffects": technical_effects,
        "regulation": regulation,
        "url": response.url,
    }


def fetch_fda(ingredient_name):
    display_name = normalize_ingredient_name(
        ingredient_name
    )

    if not display_name:
        return None

    for candidate_id in build_id_candidates(display_name):
        result = fetch_fda_for_id(
            display_name,
            candidate_id,
        )

        if result:
            return result

    debug_log(
        f"no FDA match for any candidate id, "
        f"ingredient={ingredient_name!r}"
    )

    return None


def fetch_sources(ingredient_name):
    sources = []

    fda_source = fetch_fda(
        ingredient_name
    )

    if fda_source:
        sources.append(fda_source)

    return sources


if __name__ == "__main__":
    ingredient = input(
        "Enter an ingredient: "
    ).strip()

    if not ingredient:
        print(
            "Ingredient is required."
        )
        raise SystemExit

    sources = fetch_sources(
        ingredient
    )

    if not sources:
        print(
            "\nNo trusted-source information found."
        )
        raise SystemExit

    print("\nAvailable sources:\n")

    for source in sources:
        print(
            f"Source: {source['source']}"
        )

        print(
            f"Type: {source['type']}"
        )

        print(
            f"Ingredient: {source['ingredient']}"
        )

        print(
            f"CAS number: "
            f"{source['casNumber'] or 'Not available'}"
        )

        print(
            "Technical effects:"
        )

        if source["technicalEffects"]:
            for effect in source[
                "technicalEffects"
            ]:
                print(
                    f"  - {effect}"
                )
        else:
            print(
                "  Not available"
            )

        print(
            f"Regulation: "
            f"{source['regulation'] or 'Not available'}"
        )

        print(
            f"URL: {source['url']}"
        )

        print("-" * 50)