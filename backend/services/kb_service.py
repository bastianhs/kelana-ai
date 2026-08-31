import os
from urllib.parse import unquote, urlparse

import boto3
from dotenv import load_dotenv

load_dotenv()

_kb_client: boto3.client = None


def get_kb_client() -> boto3.client:
    """Return a cached bedrock-agent-runtime client for Knowledge Base retrieval.

    Lazily initialised on first call so environment variables are loaded first.
    """
    global _kb_client
    if _kb_client is None:
        region = os.getenv("AWS_REGION")
        if not region:
            raise EnvironmentError("AWS_REGION is not set in the environment.")
        _kb_client = boto3.client(
            service_name="bedrock-agent-runtime",
            region_name=region,
        )
    return _kb_client


def _get_source_uri(location: dict) -> str | None:
    """Extract a source URI from a retrieval result's location block."""
    if not location:
        return None
    location_type = location.get("type")
    if not location_type:
        return None
    source = location.get(f"{location_type.lower()}Location", {})
    return source.get("uri") or source.get("url")


def _get_document_title(result: dict) -> str:
    """Derive a human-readable document title from a retrieval result."""
    metadata = result.get("metadata", {})
    for key in ("title", "document_title", "documentTitle", "file_name", "filename"):
        if metadata.get(key):
            return str(metadata[key])

    source_uri = _get_source_uri(result.get("location", {}))
    if source_uri:
        path = urlparse(source_uri).path
        filename = os.path.basename(unquote(path))
        if filename:
            return filename

    return "Untitled source"


def ask_knowledge_base(query: str) -> dict:
    """Retrieve relevant context from the Knowledge Base and generate an answer.

    Uses ``bedrock-agent-runtime`` to retrieve document chunks, then calls
    ``bedrock-runtime`` (via the cached bedrock client) to generate a grounded
    response — the same RAG pattern shown in the instructor slides.

    Args:
        query: The user's question or search text.

    Returns:
        A dict with:
            - ``answer``    (str):       Markdown-formatted answer from the model.
            - ``documents`` (list[str]): Titles of the source documents used.

    Raises:
        EnvironmentError: If required environment variables are missing.
        botocore.exceptions.ClientError: On AWS API errors.
    """
    knowledge_base_id = os.getenv("KNOWLEDGE_BASE_ID")
    if not knowledge_base_id:
        raise EnvironmentError("KNOWLEDGE_BASE_ID is not set in the environment.")

    model_id = os.getenv("MODEL_ID") or os.getenv("KNOWLEDGE_BASE_MODEL_ARN")
    if not model_id:
        raise EnvironmentError(
            "MODEL_ID or KNOWLEDGE_BASE_MODEL_ARN is not set in the environment."
        )

    region = os.getenv("AWS_REGION")
    if not region:
        raise EnvironmentError("AWS_REGION is not set in the environment.")

    # Step 1: retrieve relevant chunks from the Knowledge Base
    kb_client = get_kb_client()
    retrieved = kb_client.retrieve(
        knowledgeBaseId=knowledge_base_id,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": 5,
            },
        },
    )

    # Step 2: build context from retrieved chunks
    retrieval_results = retrieved.get("retrievalResults", [])
    chunks: list[str] = []
    documents: list[str] = []
    seen_documents: set[str] = set()

    for result in retrieval_results:
        text = result.get("content", {}).get("text")
        if not text:
            continue
        chunks.append(text)
        title = _get_document_title(result)
        if title not in seen_documents:
            seen_documents.add(title)
            documents.append(title)

    context = "\n\n".join(chunks) or "No relevant knowledge base context found."

    # Step 3: generate a grounded answer with bedrock-runtime
    prompt = (
        "Answer the question using the context below. "
        "Return the answer in markdown format.\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{query}"
    )

    bedrock_client = boto3.client(
        service_name="bedrock-runtime",
        region_name=region,
    )

    response = bedrock_client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
    )

    return {
        "answer": response["output"]["message"]["content"][0]["text"],
        "documents": documents,
    }
