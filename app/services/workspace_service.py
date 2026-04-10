from app.services.storage_service import read_csv


def get_workspace_context(filters: dict) -> dict:
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
    if not workspace_df.empty:
        rows = workspace_df.to_dict(orient="records")

    query = (filters.get("q") or "").lower().strip()
    risk_filter = (filters.get("risk") or "").lower()
    status_filter = (filters.get("status") or "").lower()

    filtered_rows = []
    for row in rows:
        if query and query not in f"{row['name']} {row['customer_id']} {row['geography']}".lower():
            continue
        if risk_filter and row["risk"].lower() != risk_filter:
            continue
        if status_filter and row["status"].lower() != status_filter:
            continue
        filtered_rows.append(row)

    return {
        "title": "Retention Action Workspace",
        "subtitle": "Review and manage churn risk cases across France, Germany, and Spain",
        "filters": filters,
        "stats": {
            "new_high_risk": len([r for r in rows if r["status"] == "new" and r["risk"] == "High"]),
            "in_progress": len([r for r in rows if r["status"] == "in-progress"]),
            "completed": len([r for r in rows if r["status"] == "completed"]),
            "total_high_risk": len([r for r in rows if r["risk"] == "High"]),
        },
        "rows": filtered_rows,
    }
