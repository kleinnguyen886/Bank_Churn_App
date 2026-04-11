from __future__ import annotations

from app.services.storage_service import read_csv


DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 200


def _load_workspace_rows() -> list[dict]:
    rows = [
        {
            "customer_id": "C-15634602",
            "name": "Henri Dupont",
            "geography": "France",
            "risk": "High",
            "score": 0.87,
            "owner": "Sarah Johnson",
            "status": "new",
        },
        {
            "customer_id": "C-15647311",
            "name": "Klara Muller",
            "geography": "Germany",
            "risk": "High",
            "score": 0.94,
            "owner": "Robert Chen",
            "status": "in-progress",
        },
        {
            "customer_id": "C-15701122",
            "name": "Franz Weber",
            "geography": "Germany",
            "risk": "Medium",
            "score": 0.68,
            "owner": "Maria Garcia",
            "status": "new",
        },
        {
            "customer_id": "C-15613022",
            "name": "Luca Romano",
            "geography": "France",
            "risk": "Low",
            "score": 0.38,
            "owner": "Sarah Johnson",
            "status": "completed",
        },
    ]

    workspace_df = read_csv("workspace_view.csv")
    if workspace_df.empty:
        workspace_df = read_csv("reference_workspace.csv")
    if workspace_df.empty:
        return rows

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

    expected = ["customer_id", "name", "geography", "risk", "score", "owner", "status"]
    for col in expected:
        if col not in normalized:
            normalized[col] = "" if col != "score" else 0.0

    normalized["customer_id"] = normalized["customer_id"].astype(str).apply(
        lambda x: x if x.startswith("C-") else f"C-{x}"
    )
    normalized["name"] = normalized["name"].fillna("Unknown").astype(str)
    normalized["geography"] = normalized["geography"].fillna("Unknown").astype(str)
    normalized["risk"] = normalized["risk"].fillna("Medium").astype(str).str.title()
    normalized["score"] = normalized["score"].fillna(0.0).astype(float).round(3)
    normalized["owner"] = normalized["owner"].fillna("Unassigned").astype(str)
    normalized["status"] = normalized["status"].fillna("new").astype(str).str.lower()

    return normalized[expected].to_dict(orient="records")


def _filter_rows(rows: list[dict], filters: dict) -> list[dict]:
    query = (filters.get("q") or "").lower().strip()
    risk_filter = (filters.get("risk") or "").lower()
    status_filter = (filters.get("status") or "").lower()
    owner_filter = (filters.get("owner") or "").lower()

    filtered_rows = []
    for row in rows:
        if query and query not in f"{row['name']} {row['customer_id']} {row['geography']}".lower():
            continue
        if risk_filter and str(row["risk"]).lower() != risk_filter:
            continue
        if status_filter and str(row["status"]).lower() != status_filter:
            continue
        if owner_filter and owner_filter not in str(row["owner"]).lower():
            continue
        filtered_rows.append(row)

    return filtered_rows


def _safe_page_size(page_size: int | None) -> int:
    if not page_size:
        return DEFAULT_PAGE_SIZE
    return min(max(int(page_size), 1), MAX_PAGE_SIZE)


def get_workspace_page(filters: dict, page: int = 1, page_size: int = DEFAULT_PAGE_SIZE) -> dict:
    all_rows = _load_workspace_rows()
    filtered_rows = _filter_rows(all_rows, filters)

    safe_page_size = _safe_page_size(page_size)
    total_rows = len(filtered_rows)
    total_pages = max((total_rows + safe_page_size - 1) // safe_page_size, 1)
    safe_page = min(max(int(page), 1), total_pages)

    start = (safe_page - 1) * safe_page_size
    end = start + safe_page_size
    page_rows = filtered_rows[start:end]

    return {
        "rows": page_rows,
        "page": safe_page,
        "page_size": safe_page_size,
        "total_rows": total_rows,
        "total_pages": total_pages,
        "has_prev": safe_page > 1,
        "has_next": safe_page < total_pages,
    }


def get_workspace_context(filters: dict) -> dict:
    rows = _load_workspace_rows()
    filtered_rows = _filter_rows(rows, filters)
    first_page = get_workspace_page(filters, page=1, page_size=DEFAULT_PAGE_SIZE)

    return {
        "title": "Retention Action Workspace",
        "subtitle": "Review and manage churn risk cases across France, Germany, and Spain",
        "filters": filters,
        "pagination": {
            "page": first_page["page"],
            "page_size": first_page["page_size"],
            "total_rows": first_page["total_rows"],
            "total_pages": first_page["total_pages"],
            "has_prev": first_page["has_prev"],
            "has_next": first_page["has_next"],
        },
        "stats": {
            "new_high_risk": len([r for r in rows if r["status"] == "new" and r["risk"] == "High"]),
            "in_progress": len([r for r in rows if r["status"] == "in-progress"]),
            "completed": len([r for r in rows if r["status"] == "completed"]),
            "total_high_risk": len([r for r in rows if r["risk"] == "High"]),
        },
        "rows": first_page["rows"],
        "filtered_total": len(filtered_rows),
    }
