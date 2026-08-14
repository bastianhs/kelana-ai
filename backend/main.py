from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation
)


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app: FastAPI = FastAPI()

@app.get("/")
def home() -> dict[str, str]:
    return {
        "message": "Welcome to KelanaAI"
    }

@app.get("/health")
def check_health() -> dict[str, str]:
    return {
        "status": "OK"
    }

@app.post("/api/v1/trips")
def create_trip(request: TripRequest) -> dict[str, Any]:
    daily_budget: float = calculate_daily_budget(request.budget, request.days)
    category: str = get_trip_category(request.budget)
    transportation: str = get_transportation(request.travel_style)
    
    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category,
        "recommendation_transport": transportation
    }

@app.get("/api/v1/trip-categories")
def get_trip_categories() -> list[str]:
    return [
        "Backpacker",
        "Standard",
        "Luxury"
    ]

@app.get("/api/v1/recommendations")
def get_trip_recommendations() -> list[str]:
    return [
        "Tokyo Tower",
        "Mount Fuji",
        "Shibuya"
    ]

@app.get("/api/v1/transportations")
def get_trip_transportations() -> list[str]:
    return [
        "Bus",
        "Train",
        "Flight"
    ]
