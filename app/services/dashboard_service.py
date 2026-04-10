from app.services.storage_service import read_json


def get_dashboard_context() -> dict:
    dashboard = read_json("dashboard_summary.json")
    if dashboard:
        return dashboard

    reference = read_json("reference_dashboard.json")
    if reference:
        return reference

    return {
        "title": "Executive Overview Dashboard",
        "subtitle": "Bank churn prediction monitoring - 10,000 customers tracked",
        "kpis": [
            {"label": "Total Customers", "value": "10,000", "change": "+1.2%"},
            {
                "label": "Predicted Churners",
                "value": "2,037",
                "change": "+4.1%",
                "alert": True,
            },
            {
                "label": "Overall Churn Rate",
                "value": "20.4%",
                "change": "+0.8%",
                "alert": True,
            },
            {
                "label": "Retention Success Rate",
                "value": "68.5%",
                "change": "+3.2%",
            },
        ],
        "top_segments": [
            {
                "segment": "Germany - Non-Active Members",
                "customers": 486,
                "churn_rate": "48.2%",
                "change": "+6.4%",
            },
            {
                "segment": "Age 50-59 - Female",
                "customers": 394,
                "churn_rate": "51.7%",
                "change": "+9.1%",
            },
            {
                "segment": "3+ Product Holders",
                "customers": 326,
                "churn_rate": "82.7%",
                "change": "+2.3%",
            },
        ],
        "recent_alerts": [
            {
                "title": "Germany Churn Rate Spike",
                "description": "Germany churn rate exceeded 32% and is above monthly threshold.",
                "severity": "high",
            },
            {
                "title": "Model Drift Alert",
                "description": "Prediction accuracy on recent data dropped to 84.2%.",
                "severity": "medium",
            },
        ],
    }
