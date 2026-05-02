from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from config import DATA_DIR


RAW_DIR = DATA_DIR / "raw"
ENRICHED_CSV = RAW_DIR / "Churn_Modelling_customer_general_info.csv"

_CACHE_MTIME: float | None = None
_CACHE_LOOKUP: dict[str, dict[str, Any]] = {}


def normalize_customer_id(customer_id: Any) -> str:
    text = str(customer_id).strip()
    if text.startswith("C-"):
        return text
    return f"C-{text}"


def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "customer_id": normalize_customer_id(row.get("CustomerId", "")),
        "synthetic_first_name": str(row.get("SyntheticFirstName", "") or ""),
        "customer_full_name": str(row.get("CustomerFullName", "") or ""),
        "country_iso2": str(row.get("CountryISO2", "") or ""),
        "locale": str(row.get("Locale", "") or ""),
        "timezone": str(row.get("TimeZone", "") or ""),
        "local_currency": str(row.get("LocalCurrency", "") or ""),
        "region": str(row.get("Region", "") or ""),
        "city": str(row.get("City", "") or ""),
        "postal_code": str(row.get("PostalCode", "") or ""),
        "street_address": str(row.get("StreetAddress", "") or ""),
        "phone_country_code": str(row.get("PhoneCountryCode", "") or ""),
        "synthetic_phone": str(row.get("SyntheticPhone", "") or ""),
        "synthetic_email": str(row.get("SyntheticEmail", "") or ""),
        "customer_age_group": str(row.get("CustomerAgeGroup", "") or ""),
        "credit_score": int(row.get("CreditScore", 0) or 0),
        "age": int(row.get("Age", 0) or 0),
        "tenure": int(row.get("Tenure", 0) or 0),
        "balance": float(row.get("Balance", 0.0) or 0.0),
        "num_products": int(row.get("NumOfProducts", 0) or 0),
        "has_cr_card": bool(int(row.get("HasCrCard", 0) or 0)),
        "is_active_member": bool(int(row.get("IsActiveMember", 0) or 0)),
        "estimated_salary": float(row.get("EstimatedSalary", 0.0) or 0.0),
        "gender": str(row.get("Gender", "") or ""),
        "geography": str(row.get("Geography", "") or ""),
    }


def _load_lookup_from_file(path: Path) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}

    df = pd.read_csv(path)
    if df.empty or "CustomerId" not in df.columns:
        return {}

    lookup: dict[str, dict[str, Any]] = {}
    for _, row in df.iterrows():
        row_dict = _normalize_row(row.to_dict())
        lookup[row_dict["customer_id"]] = row_dict

    return lookup


def load_enriched_customer_lookup() -> dict[str, dict[str, Any]]:
    global _CACHE_LOOKUP, _CACHE_MTIME

    if not ENRICHED_CSV.exists():
        _CACHE_MTIME = None
        _CACHE_LOOKUP = {}
        return _CACHE_LOOKUP

    mtime = ENRICHED_CSV.stat().st_mtime
    if _CACHE_MTIME is None or _CACHE_MTIME != mtime:
        _CACHE_LOOKUP = _load_lookup_from_file(ENRICHED_CSV)
        _CACHE_MTIME = mtime

    return _CACHE_LOOKUP


def get_enriched_customer(customer_id: Any) -> dict[str, Any]:
    lookup = load_enriched_customer_lookup()
    return lookup.get(normalize_customer_id(customer_id), {})
