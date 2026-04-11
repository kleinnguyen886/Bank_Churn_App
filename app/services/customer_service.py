from app.services.storage_service import read_json


def _default_email(customer_id: str, name: str) -> str:
    safe_name = "".join(ch.lower() for ch in name if ch.isalnum())
    if not safe_name:
        safe_name = customer_id.lower().replace("-", "")
    return f"{safe_name}@example-bank.com"


def _default_phone(customer_id: str) -> str:
    suffix = "".join(ch for ch in customer_id if ch.isdigit())[-7:]
    suffix = suffix.rjust(7, "0")
    return f"+1-800-{suffix[:3]}-{suffix[3:]}"


def get_customer_context(customer_id: str) -> dict:
    profiles = read_json("customer_profiles.json")
    if not profiles:
        profiles = read_json("reference_customer_profiles.json")

    if customer_id in profiles:
        customer = profiles[customer_id]
        name = customer.get("name", "Unknown")
        return {
            "title": "Customer Detail",
            "subtitle": "Risk profile, churn drivers, and recommended retention actions",
            "customer": {
                "customer_id": customer.get("customer_id", customer_id),
                "name": name,
                "geography": customer.get("geography", "Unknown"),
                "gender": customer.get("gender", "Unknown"),
                "age": customer.get("age", 0),
                "risk": customer.get("risk", "Medium"),
                "score": customer.get("score", 0.5),
                "recommended_action": customer.get("recommended_action", "Monitor"),
                "email": customer.get("email") or _default_email(customer_id, name),
                "phone": customer.get("phone") or _default_phone(customer_id),
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
            "email": _default_email(customer_id, "Henri Dupont"),
            "phone": _default_phone(customer_id),
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
