from services.trip_service import calculate_total_estimated_cost, get_trip_category, calculate_daily_budget, recommended_places, get_transportation, get_travel_season


# receive user inputs
destination_list: list[str] = []
while True:
    destination: str = input("Enter your destinations (type \"x\" to finish): ")
    if destination == "x":
        break
    else:
        destination_list.append(destination)

country: str = input("Enter your country: ")
days: int = int(input("Enter the number of days you will stay: "))
budget: float = float(input("Enter your budget: "))
travel_style: str = input("Enter your travel style: ")
hotel_cost: float = float(input("Enter your hotel cost: "))
transportation_cost: float = float(input("Enter your transportation cost: "))
food_cost: float = float(input("Enter your food cost: "))
miscellaneous_cost: float = float(input("Enter your miscellaneous cost: "))
currency: str = input("Enter your currency: ")
travel_month: str = input("Enter your travel month: ")

# print the trip summary
def print_trip_summary(
    destination_list: list[str],
    country: str,
    days: int,
    budget: float,
    travel_style: str,
    hotel_cost: float,
    transportation_cost: float,
    food_cost: float,
    miscellaneous_cost: float,
    currency: str,
    travel_month: str
) -> None:
    print()
    print("========================")
    print("KelanaAI")
    print("========================")
    print()
    
    print(f"Destinations:")
    
    for idx, destination in enumerate(destination_list):
        print(f"{idx + 1}. {destination}")
    
    print(f"Country                   : {country}")
    print(f"Days                      : {days}")
    print(f"Budget                    : {budget} {currency}")
    print(f"Travel Style              : {travel_style}")

    total_estimated_cost = calculate_total_estimated_cost(hotel_cost, transportation_cost, food_cost, miscellaneous_cost)
    print(f"Total Estimated Cost      : {total_estimated_cost} {currency}")

    if total_estimated_cost > budget:
        print(f"!!! Budget exceeded !!!")

    print(f"Travel Month              : {travel_month}")
    print(f"Category                  : {get_trip_category(budget)}")
    print(f"Daily Budget              : {calculate_daily_budget(budget, days)} {currency}/day")
    print("Recommended Places:")
    
    for place in recommended_places:
        print(f"- {place}")
    
    print(f"Recommended Transportation: {get_transportation(get_trip_category(budget))}")
    print(f"Season                    : {get_travel_season(travel_month)}")

print_trip_summary(destination_list, country, days, budget, travel_style, hotel_cost, transportation_cost, food_cost, miscellaneous_cost, currency, travel_month)
