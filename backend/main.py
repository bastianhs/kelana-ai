from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation
)
from models.trip import Trip
from database import init_db, SessionLocal
from services.bedrock_service import get_ai_recommendation


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

init_db()
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
def create_trip(request: TripRequest):
    daily_budget: float = calculate_daily_budget(request.budget, request.days)
    category: str = get_trip_category(request.budget)
    transportation: str = get_transportation(request.travel_style)
    ai_recommendation: str = get_ai_recommendation(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_style=request.travel_style
    )

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        ai_recommendation=ai_recommendation
    )
    
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip
    # return {
    #     "destination": request.destination,
    #     "days": request.days,
    #     "budget": request.budget,
    #     "daily_budget": daily_budget,
    #     "category": category,
    #     "recommendation_transport": transportation
    # }

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()

    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    return trip

@app.put("/api/v1/trips/{id}")
def update_trip(id: int, request: TripRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {id} not found")

    category: str = get_trip_category(request.budget)
    daily_budget: float = calculate_daily_budget(request.budget, request.days)
    trip.destination = request.destination
    trip.days = request.days
    trip.budget = request.budget
    trip.category = category
    trip.daily_budget = daily_budget
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.delete("/api/v1/trips/{id}")
def delete_trip(id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {id} not found")

    db.delete(trip)
    db.commit()
    db.close()

    return trip

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
