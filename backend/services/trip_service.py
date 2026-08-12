def calculate_total_estimated_cost(
    hotel_cost: float,
    transportation_cost: float,
    food_cost: float,
    miscellaneous_cost: float
) -> float:
    return hotel_cost + transportation_cost + food_cost + miscellaneous_cost

def get_trip_category(budget: float) -> str:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000: 
        return "Standard"
    else:
        return "Luxury"

def calculate_daily_budget(budget: float, days: int) -> float:
    return budget / days

recommended_places: list[str] = [
    "Tokyo Tower",
    "Shibuya",
    "Mount Fuji"
]

def get_transportation(trip_category: str) -> str:
    if trip_category == "Backpacker":
        return "Bus"
    elif trip_category == "Standard":
        return "Train"
    else:
        return "Flight"

def get_travel_season(month: str) -> str:
    if month.lower() == "december" or month == "12":
        return "Peak Season"
    elif month.lower() == "june" or month == "6":
        return "Holiday Season"
    else:
        return "Regular Season"
