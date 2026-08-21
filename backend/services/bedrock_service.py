import os
import boto3
from dotenv import load_dotenv

load_dotenv()

# boto3 automatically picks up AWS_BEARER_TOKEN_BEDROCK from the environment
# as the bearer-token credential for Bedrock API key auth.
# No manual credential wiring is required.
_client: boto3.client = None


def get_bedrock_client() -> boto3.client:
    """Return a cached bedrock-runtime client.

    The client is lazily initialised on first call so that environment
    variables are guaranteed to be loaded before boto3 reads them.
    """
    global _client
    if _client is None:
        region = os.getenv("AWS_REGION")
        if not region:
            raise EnvironmentError("AWS_REGION is not set in the environment.")
        if not os.getenv("AWS_BEARER_TOKEN_BEDROCK"):
            raise EnvironmentError(
                "AWS_BEARER_TOKEN_BEDROCK is not set in the environment."
            )
        _client = boto3.client(
            service_name="bedrock-runtime",
            region_name=region,
        )
    return _client


def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
) -> str:
    """Call Amazon Bedrock and return a travel itinerary recommendation.

    Args:
        destination:   The travel destination (e.g. "Bali, Indonesia").
        days:          Number of days for the trip.
        budget:        Total budget in USD.
        travel_style:  Traveller style (e.g. "adventure", "luxury", "budget").

    Returns:
        The model's plain-text recommendation.

    Raises:
        EnvironmentError: If required env vars are missing.
        botocore.exceptions.ClientError: On Bedrock API errors.
    """
    model_id = os.getenv("MODEL_ID")
    if not model_id:
        raise EnvironmentError("MODEL_ID is not set in the environment.")

    prompt = (
        f"You are an experienced travel planner.\n\n"
        f"Plan a {days}-days itinerary for {destination}\n"
        f"Budget: USD {budget}\n"
        f"Travel Style: {travel_style}\n\n"
        f"Give the following information:\n"
        f"1. Daily itinerary\n"
        f"2. Estimated daily budget\n"
        f"3. Local food recommendations\n"
        f"4. Transportation suggestions\n\n"
        f"Give a structured daily plans consists of:\n"
        f"1. Morning activities: 2-3 activities\n"
        f"2. Afternoon activities: include cultural sites and experieces\n"
        f"3. Evening activities: suggest dinner spots and nightlifes\n\n"
        f"Format the response in markdown format"
    )

    client = get_bedrock_client()

    response = client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
    )

    return response["output"]["message"]["content"][0]["text"]
