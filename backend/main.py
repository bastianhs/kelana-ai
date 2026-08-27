from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Optional
from enum import Enum
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation
)
from models.trip import Trip
from database import init_db, SessionLocal
from services.bedrock_service import get_ai_recommendation
from dotenv import load_dotenv


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

class SortBy(str, Enum):
    latest = "latest"
    oldest = "oldest"
    highest_budget = "highest_budget"

class PaginatedTrips(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

load_dotenv()
init_db()
app: FastAPI = FastAPI()

# CORS configuration    
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # "https://kelana-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        travel_style=request.travel_style,
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

@app.post("/api/v1/trips/{id}/generate")
def generate_ai_recommendation(id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {id} not found")

    ai_recommendation: str = get_ai_recommendation(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        travel_style=trip.travel_style
    )
    trip.ai_recommendation = ai_recommendation
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.get("/api/v1/trips")
def list_trips(
    search: Optional[str] = Query(default=None, description="Keyword search against destination or travel style"),
    sort_by: SortBy = Query(default=SortBy.latest, description="Sort order: latest, oldest, highest_budget"),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
):
    db = SessionLocal()
    query = db.query(Trip)

    # Text search
    if search:
        term = f"%{search}%"
        query = query.filter(
            Trip.destination.ilike(term) | Trip.travel_style.ilike(term)
        )

    # Sorting
    if sort_by == SortBy.latest:
        query = query.order_by(Trip.created_at.desc())
    elif sort_by == SortBy.oldest:
        query = query.order_by(Trip.created_at.asc())
    elif sort_by == SortBy.highest_budget:
        query = query.order_by(Trip.budget.desc())

    total = query.count()
    total_pages = max(1, -(-total // page_size))  # ceiling division
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    db.close()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

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
