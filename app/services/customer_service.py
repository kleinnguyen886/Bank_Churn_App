from app.services.storage_service import read_json
from app.services.enriched_customer_service import get_enriched_customer, normalize_customer_id
from app.services.workspace_service import get_workspace_customer


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
    normalized_customer_id = normalize_customer_id(customer_id)
    profiles = read_json("customer_profiles.json")
    if not profiles:
        profiles = read_json("reference_customer_profiles.json")

    enriched = get_enriched_customer(normalized_customer_id)
    workspace_row = get_workspace_customer(normalized_customer_id)

    if normalized_customer_id in profiles:
        customer = profiles[normalized_customer_id]
        enriched_name = enriched.get("customer_full_name")
        name = enriched_name or customer.get("name", "Unknown")
        return {
            "title": "Customer Detail",
            "subtitle": "Risk profile, churn drivers, and recommended retention actions",
            "customer": {
                "customer_id": customer.get("customer_id", normalized_customer_id),
                "name": name,
                "geography": enriched.get("geography") or customer.get("geography", "Unknown"),
                "gender": enriched.get("gender") or customer.get("gender", "Unknown"),
                "age": enriched.get("age") or customer.get("age", 0),
                "tenure": enriched.get("tenure", 0),
                "credit_score": enriched.get("credit_score", 0),
                "balance": enriched.get("balance", 0.0),
                "num_products": enriched.get("num_products", 0),
                "has_cr_card": enriched.get("has_cr_card", False),
                "is_active_member": enriched.get("is_active_member", False),
                "estimated_salary": enriched.get("estimated_salary", 0.0),
                "risk": customer.get("risk", "Medium"),
                "score": customer.get("score", 0.5),
                "recommended_action": customer.get("recommended_action", "Monitor"),
                "status": workspace_row.get("status") or customer.get("status") or "new",
                "email": customer.get("email") or enriched.get("synthetic_email") or _default_email(normalized_customer_id, name),
                "phone": customer.get("phone") or enriched.get("synthetic_phone") or _default_phone(normalized_customer_id),
                "synthetic_first_name": enriched.get("synthetic_first_name", ""),
                "country_iso2": enriched.get("country_iso2", ""),
                "locale": enriched.get("locale", ""),
                "timezone": enriched.get("timezone", ""),
                "local_currency": enriched.get("local_currency", ""),
                "region": enriched.get("region", ""),
                "city": enriched.get("city", ""),
                "postal_code": enriched.get("postal_code", ""),
                "street_address": enriched.get("street_address", ""),
                "phone_country_code": enriched.get("phone_country_code", ""),
                "customer_age_group": enriched.get("customer_age_group", ""),
            },
            "drivers": customer.get("drivers", []),
            "history": customer.get("history", []),
        }

    fallback_name = enriched.get("customer_full_name") or "Henri Dupont"

    return {
        "title": "Customer Detail",
        "subtitle": "Risk profile, churn drivers, and recommended retention actions",
        "customer": {
            "customer_id": normalized_customer_id,
            "name": fallback_name,
            "geography": enriched.get("geography", "France"),
            "gender": enriched.get("gender", "Male"),
            "age": enriched.get("age", 42),
            "tenure": enriched.get("tenure", 0),
            "credit_score": enriched.get("credit_score", 0),
            "balance": enriched.get("balance", 0.0),
            "num_products": enriched.get("num_products", 0),
            "has_cr_card": enriched.get("has_cr_card", False),
            "is_active_member": enriched.get("is_active_member", False),
            "estimated_salary": enriched.get("estimated_salary", 0.0),
            "risk": "High",
            "score": 0.87,
            "recommended_action": "Personal call + balance incentive",
            "status": workspace_row.get("status") or "new",
            "email": enriched.get("synthetic_email") or _default_email(normalized_customer_id, fallback_name),
            "phone": enriched.get("synthetic_phone") or _default_phone(normalized_customer_id),
            "synthetic_first_name": enriched.get("synthetic_first_name", ""),
            "country_iso2": enriched.get("country_iso2", ""),
            "locale": enriched.get("locale", ""),
            "timezone": enriched.get("timezone", ""),
            "local_currency": enriched.get("local_currency", ""),
            "region": enriched.get("region", ""),
            "city": enriched.get("city", ""),
            "postal_code": enriched.get("postal_code", ""),
            "street_address": enriched.get("street_address", ""),
            "phone_country_code": enriched.get("phone_country_code", ""),
            "customer_age_group": enriched.get("customer_age_group", ""),
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
