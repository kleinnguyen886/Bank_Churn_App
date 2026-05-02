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


def _coerce_str(value: Any, default: str = "") -> str:
    if pd.isna(value):
        return default
    text = str(value)
    return text if text != "nan" else default


def _coerce_int(value: Any, default: int = 0) -> int:
    if pd.isna(value):
        return default
    try:
        return int(float(value))
    except Exception:
        return default


def _coerce_float(value: Any, default: float = 0.0) -> float:
    if pd.isna(value):
        return default
    try:
        return float(value)
    except Exception:
        return default


def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "customer_id": normalize_customer_id(row.get("CustomerId", "")),
        "synthetic_first_name": _coerce_str(row.get("SyntheticFirstName", "")),
        "customer_full_name": _coerce_str(row.get("CustomerFullName", "")),
        "country_iso2": _coerce_str(row.get("CountryISO2", "")),
        "locale": _coerce_str(row.get("Locale", "")),
        "timezone": _coerce_str(row.get("TimeZone", "")),
        "local_currency": _coerce_str(row.get("LocalCurrency", "")),
        "region": _coerce_str(row.get("Region", "")),
        "city": _coerce_str(row.get("City", "")),
        "postal_code": _coerce_str(row.get("PostalCode", "")),
        "street_address": _coerce_str(row.get("StreetAddress", "")),
        "phone_country_code": _coerce_str(row.get("PhoneCountryCode", "")),
        "synthetic_phone": _coerce_str(row.get("SyntheticPhone", "")),
        "synthetic_email": _coerce_str(row.get("SyntheticEmail", "")),
        "customer_age_group": _coerce_str(row.get("CustomerAgeGroup", "")),
        "credit_score": _coerce_int(row.get("CreditScore", 0)),
        "age": _coerce_int(row.get("Age", 0)),
        "tenure": _coerce_int(row.get("Tenure", 0)),
        "balance": _coerce_float(row.get("Balance", 0.0)),
        "num_products": _coerce_int(row.get("NumOfProducts", 0)),
        "has_cr_card": bool(_coerce_int(row.get("HasCrCard", 0))),
        "is_active_member": bool(_coerce_int(row.get("IsActiveMember", 0))),
        "estimated_salary": _coerce_float(row.get("EstimatedSalary", 0.0)),
        "gender": _coerce_str(row.get("Gender", "")),
        "geography": _coerce_str(row.get("Geography", "")),
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
