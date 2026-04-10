from app.services.storage_service import read_json


def get_customer_context(customer_id: str) -> dict:
    profiles = read_json("customer_profiles.json")
    if not profiles:
        profiles = read_json("reference_customer_profiles.json")

    if customer_id in profiles:
        customer = profiles[customer_id]
        return {
            "title": "Customer Detail",
            "subtitle": "Risk profile, churn drivers, and recommended retention actions",
            "customer": {
                "customer_id": customer.get("customer_id", customer_id),
                "name": customer.get("name", "Unknown"),
                "geography": customer.get("geography", "Unknown"),
                "gender": customer.get("gender", "Unknown"),
                "age": customer.get("age", 0),
                "risk": customer.get("risk", "Medium"),
                "score": customer.get("score", 0.5),
                "recommended_action": customer.get("recommended_action", "Monitor"),
            },
            "drivers": customer.get("drivers", []),
            "history": customer.get("history", []),
        }

    return {
        "title": "Customer Detail",
        "subtitle": "Risk profile, churn drivers, and recommended retention actions",
        "customer": {
            "customer_id": customer_id,
            "name": "Henri Dupont",
            "geography": "France",
            "gender": "Male",
            "age": 42,
            "risk": "High",
            "score": 0.87,
            "recommended_action": "Personal call + balance incentive",
        },
        "drivers": [
            {"name": "Non-Active Member", "impact": "Very High"},
            {"name": "Zero Account Balance", "impact": "High"},
            {"name": "Low Credit Score", "impact": "High"},
            {"name": "Age Bracket 40-49", "impact": "Medium"},
        ],
        "history": [
            {
                "date": "2026-04-08",
                "type": "call",
                "description": "Outbound call: customer considering switching banks.",
            },
            {
                "date": "2026-03-22",
                "type": "digital",
                "description": "Mobile app login with low engagement behavior.",
            },
        ],
    }
