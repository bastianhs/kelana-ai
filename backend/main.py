def print_trip_summary(destination, country, days, budget, currency, travel_month):
    trip_summary = f"""
========================
KelanaAI
========================
Destination : {destination}
Country     : {country}
Days        : {days}
Budget      : {budget} {currency}
Currency    : {currency}
Travel Month: {travel_month}
"""

    print(trip_summary)

# receive user inputs
destination = input("Enter your destination: ")
country = input("Enter your country: ")
days = int(input("Enter the number of days you will stay: "))
budget = float(input("Enter your budget: "))
currency = input("Enter your currency: ")
travel_month = input("Enter your travel month: ")

# print the trip summary
print_trip_summary(destination, country, days, budget, currency, travel_month)
