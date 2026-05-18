from __future__ import annotations

import pandas as pd

from app.services.enriched_customer_service import load_enriched_customer_lookup, normalize_customer_id
from app.services.storage_service import read_csv


DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 200
COMMUNICATION_STATUSES = {"new", "on-going", "failed"}


def _normalize_workspace_status(value: object, fallback: str = "new") -> str:
    if value is None:
        return fallback

    try:
        if pd.isna(value):
            return fallback
    except TypeError:
        pass

    text = str(value).strip().lower()
    if not text:
        return fallback

    text = text.replace("_", "-")
    text = "-".join(text.split())
    if text in {"ongoing", "on-going"}:
        return "on-going"
    if text in COMMUNICATION_STATUSES:
        return text
    return fallback


def _prepare_customer_master_frame(customer_master_df: pd.DataFrame) -> pd.DataFrame:
    if customer_master_df.empty:
        return customer_master_df

    prepared = customer_master_df.copy()
    if "churn_probability" in prepared.columns and "score" not in prepared.columns:
        prepared = prepared.rename(columns={"churn_probability": "score"})
    return prepared


def _apply_workspace_overrides(base_frame: pd.DataFrame, override_frame: pd.DataFrame) -> pd.DataFrame:
    if base_frame.empty or override_frame.empty:
        return base_frame

    overrides = override_frame.copy()
    if "customer_id" not in overrides.columns and "CustomerId" in overrides.columns:
        overrides = overrides.rename(columns={"CustomerId": "customer_id"})
    if "owner" not in overrides.columns and "Owner" in overrides.columns:
        overrides = overrides.rename(columns={"Owner": "owner"})
    if "status" not in overrides.columns and "Status" in overrides.columns:
        overrides = overrides.rename(columns={"Status": "status"})

    if "customer_id" not in overrides.columns:
        return base_frame

    overlay_columns = ["customer_id"]
    if "owner" in overrides.columns:
        overlay_columns.append("owner")
    if "status" in overrides.columns:
        overlay_columns.append("status")

    overrides = overrides[overlay_columns].copy()
    overrides["customer_id"] = overrides["customer_id"].astype(str).apply(normalize_customer_id)
    overrides = overrides.drop_duplicates(subset=["customer_id"], keep="last")

    merged = base_frame.merge(overrides, on="customer_id", how="left", suffixes=("", "_override"))
    if "owner_override" in merged.columns:
        merged["owner"] = merged["owner_override"].fillna(merged["owner"])
        merged = merged.drop(columns=["owner_override"])
    if "status_override" in merged.columns:
        merged["status"] = merged["status_override"].fillna(merged["status"])
        merged = merged.drop(columns=["status_override"])

    return merged


def _load_workspace_frame() -> tuple[pd.DataFrame, str]:
    customer_master_df = _prepare_customer_master_frame(read_csv("customer_master.csv"))
    workspace_df = read_csv("workspace_view.csv")

    if not customer_master_df.empty:
        normalized = _normalize_workspace_frame(customer_master_df)
        if not workspace_df.empty:
            normalized = _apply_workspace_overrides(normalized, workspace_df)
        source_label = "customer_master.csv"
        if not workspace_df.empty:
            source_label = "customer_master.csv + workspace_view.csv"
        return normalized, source_label

    if not workspace_df.empty:
        return _normalize_workspace_frame(workspace_df), "workspace_view.csv"

    return pd.DataFrame(), ""


def _normalize_workspace_frame(workspace_df: pd.DataFrame) -> pd.DataFrame:
    normalized = workspace_df.rename(
        columns={
            "Risk": "risk",
            "Score": "score",
            "Owner": "owner",
            "Status": "status",
            "Name": "name",
            "Surname": "name",
            "Geography": "geography",
            "CustomerId": "customer_id",
        }
    ).copy()

    if "owner" not in normalized:
        normalized["owner"] = "Unassigned"
    if "status" not in normalized:
        normalized["status"] = "new"

    expected = [
        "customer_id",
        "name",
        "geography",
        "risk",
        "score",
        "owner",
        "status",
        "city",
        "region",
        "customer_age_group",
        "synthetic_email",
        "synthetic_phone",
    ]
    for col in expected:
        if col not in normalized:
            normalized[col] = "" if col != "score" else 0.0

    normalized["customer_id"] = normalized["customer_id"].astype(str).apply(normalize_customer_id)
    normalized["name"] = normalized["name"].fillna("Unknown").astype(str)
    normalized["geography"] = normalized["geography"].fillna("Unknown").astype(str)
    normalized["risk"] = normalized["risk"].fillna("Medium").astype(str).str.title()
    normalized["score"] = normalized["score"].fillna(0.0).astype(float).round(3)
    normalized["owner"] = normalized["owner"].fillna("Unassigned").astype(str)
    normalized["status"] = normalized["status"].apply(_normalize_workspace_status)

    lookup = load_enriched_customer_lookup()
    if lookup:
        enriched_series = normalized["customer_id"].map(lookup)
        normalized["city"] = enriched_series.apply(
            lambda item: item.get("city", "") if isinstance(item, dict) else ""
        )
        normalized["region"] = enriched_series.apply(
            lambda item: item.get("region", "") if isinstance(item, dict) else ""
        )
        normalized["customer_age_group"] = enriched_series.apply(
            lambda item: item.get("customer_age_group", "") if isinstance(item, dict) else ""
        )
        normalized["synthetic_email"] = enriched_series.apply(
            lambda item: item.get("synthetic_email", "") if isinstance(item, dict) else ""
        )
        normalized["synthetic_phone"] = enriched_series.apply(
            lambda item: item.get("synthetic_phone", "") if isinstance(item, dict) else ""
        )
        normalized["name"] = normalized.apply(
            lambda row: (
                lookup.get(row["customer_id"], {}).get("customer_full_name")
                or row["name"]
            ),
            axis=1,
        )

    for col in expected:
        if col not in normalized:
            normalized[col] = "" if col not in {"score"} else 0.0

    return normalized[expected]


def _save_workspace_frame(frame: pd.DataFrame) -> None:
    from app.services.storage_service import PROCESSED_DIR

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    frame.to_csv(PROCESSED_DIR / "workspace_view.csv", index=False)


def get_workspace_customer(customer_id: str) -> dict:
    normalized_customer_id = normalize_customer_id(customer_id)
    workspace_frame, _ = _load_workspace_frame()
    if workspace_frame.empty:
        return {}

    matches = workspace_frame[workspace_frame["customer_id"].astype(str) == normalized_customer_id]
    if matches.empty:
        return {}

    return matches.iloc[0].to_dict()


def _update_workspace_column(customer_ids: list[str], column: str, value: str) -> int:
    if not customer_ids or not str(value).strip():
        return 0

    workspace_frame, _ = _load_workspace_frame()
    if workspace_frame.empty or column not in workspace_frame.columns:
        return 0

    id_set = {normalize_customer_id(customer_id) for customer_id in customer_ids if str(customer_id).strip()}
    updated_mask = workspace_frame["customer_id"].astype(str).isin(id_set)
    updated_count = int(updated_mask.sum())
    if updated_count == 0:
        return 0

    workspace_frame.loc[updated_mask, column] = value
    _save_workspace_frame(workspace_frame)
    return updated_count


def update_workspace_owners(customer_ids: list[str], owner: str) -> int:
    return _update_workspace_column(customer_ids, "owner", owner)


def update_workspace_statuses(customer_ids: list[str], status: str) -> int:
    normalized_status = _normalize_workspace_status(status, fallback="")
    if normalized_status not in COMMUNICATION_STATUSES:
        return 0

    return _update_workspace_column(customer_ids, "status", normalized_status)


def _load_workspace_rows() -> list[dict]:
    normalized, _ = _load_workspace_frame()
    if normalized.empty:
        return []

    return normalized.to_dict(orient="records")


def _sorted_unique_values(rows: list[dict], key: str) -> list[str]:
    values = {
        str(row.get(key, "")).strip()
        for row in rows
        if str(row.get(key, "")).strip()
    }
    return sorted(values)


def _filter_rows(rows: list[dict], filters: dict) -> list[dict]:
    query = (filters.get("q") or "").lower().strip()
    risk_filter = (filters.get("risk") or "").lower()
    status_filter = _normalize_workspace_status(filters.get("status"), fallback="") if (filters.get("status") or "").strip() else ""
    owner_filter = (filters.get("owner") or "").lower()
    geography_filter = (filters.get("geography") or filters.get("segment") or "").lower()

    filtered_rows = []
    for row in rows:
        search_blob = " ".join(
            [
                str(row.get("name", "")),
                str(row.get("customer_id", "")),
                str(row.get("geography", "")),
                str(row.get("city", "")),
                str(row.get("region", "")),
                str(row.get("synthetic_email", "")),
                str(row.get("synthetic_phone", "")),
            ]
        ).lower()
        if query and query not in search_blob:
            continue
        if risk_filter and str(row["risk"]).lower() != risk_filter:
            continue
        if status_filter and str(row["status"]).lower() != status_filter:
            continue
        if owner_filter and owner_filter not in str(row["owner"]).lower():
            continue
        if geography_filter and geography_filter not in str(row.get("geography", "")).lower():
            continue
        filtered_rows.append(row)

    return filtered_rows


def _safe_page_size(page_size: int | None) -> int:
    if not page_size:
        return DEFAULT_PAGE_SIZE
    return min(max(int(page_size), 1), MAX_PAGE_SIZE)


def get_workspace_page(filters: dict, page: int = 1, page_size: int = DEFAULT_PAGE_SIZE) -> dict:
    all_frame, data_source_label = _load_workspace_frame()
    all_rows = all_frame.to_dict(orient="records")
    filtered_rows = _filter_rows(all_rows, filters)

    safe_page_size = _safe_page_size(page_size)
    total_rows = len(filtered_rows)
    total_pages = max((total_rows + safe_page_size - 1) // safe_page_size, 1)
    safe_page = min(max(int(page), 1), total_pages)

    if total_rows > 0:
        start = (safe_page - 1) * safe_page_size
        end = start + safe_page_size
        page_rows = filtered_rows[start:end]
    else:
        page_rows = []

    if not all_rows:
        empty_message = "No prepared churn data yet. Please run scripts/train_and_prepare.py to generate customer_master.csv and workspace_view.csv."
    elif total_rows == 0:
        empty_message = "No customers match the current filters. Clear the filters to view the full scored dataset."
    else:
        empty_message = ""

    return {
        "rows": page_rows,
        "page": safe_page,
        "page_size": safe_page_size,
        "total_rows": total_rows,
        "total_pages": total_pages,
        "has_prev": safe_page > 1,
        "has_next": safe_page < total_pages,
        "data_ready": bool(all_rows),
        "data_source_label": data_source_label or "No prepared data yet",
        "source_total_rows": len(all_rows),
        "empty_message": empty_message,
    }


def get_workspace_context(filters: dict, page: int = 1, page_size: int = DEFAULT_PAGE_SIZE) -> dict:
    all_rows = _load_workspace_rows()
    filtered_rows = _filter_rows(all_rows, filters)
    first_page = get_workspace_page(filters, page=page, page_size=page_size)
    available_geographies = _sorted_unique_values(all_rows, "geography")
    available_owners = _sorted_unique_values(all_rows, "owner")

    return {
        "title": "Retention Action Workspace",
        "subtitle": "Review the full churn-scored customer base across France, Germany, and Spain",
        "filters": filters,
        "data_ready": first_page["data_ready"],
        "data_source_label": first_page["data_source_label"],
        "source_total_rows": first_page["source_total_rows"],
        "empty_message": first_page["empty_message"],
        "pagination": {
            "page": first_page["page"],
            "page_size": first_page["page_size"],
            "total_rows": first_page["total_rows"],
            "total_pages": first_page["total_pages"],
            "has_prev": first_page["has_prev"],
            "has_next": first_page["has_next"],
        },
        "stats": {
            "new_high_risk": len([r for r in all_rows if r["status"] == "new" and r["risk"] == "High"]),
            "status_new": len([r for r in all_rows if r["status"] == "new"]),
            "status_on_going": len([r for r in all_rows if r["status"] == "on-going"]),
            "status_failed": len([r for r in all_rows if r["status"] == "failed"]),
            "total_high_risk": len([r for r in all_rows if r["risk"] == "High"]),
        },
        "available_geographies": available_geographies,
        "available_owners": available_owners,
        "rows": first_page["rows"],
        "filtered_total": len(filtered_rows),
    }
