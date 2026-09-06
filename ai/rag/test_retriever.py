from retriever import retrieve


query = input("Ask about an ingredient: ")

results = retrieve(query)

if not results:
    print("\nNo relevant information found.")
else:
    print("\nRelevant information:\n")

    for result in results:
        document = result["document"]

        print(f"Ingredient: {document['name']}")
        print(f"Description: {document['description']}")
        print(f"Purpose: {document['purpose']}")
        print(f"Source: {document['source']}")
        print(f"Match score: {result['score']}")
        print("-" * 50)