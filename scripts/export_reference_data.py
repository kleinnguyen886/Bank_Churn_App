from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"


def _write_json(name: str, payload: dict) -> None:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    (PROCESSED / name).write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _write_csv(name: str, rows: list[dict]) -> None:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(rows).to_csv(PROCESSED / name, index=False)


def main() -> None:
    dashboard = {
        "title": "Executive Overview Dashboard",
        "subtitle": "Bank churn prediction monitoring - 10,000 customers tracked",
        "top_segments": [
            {"segment": "Germany - Non-Active Members", "customers": 486, "churn_rate": "48.2%", "change": "+6.4%"},
            {"segment": "Age 50-59 - Female", "customers": 394, "churn_rate": "51.7%", "change": "+9.1%"},
            {"segment": "3+ Product Holders", "customers": 326, "churn_rate": "82.7%", "change": "+2.3%"},
        ],
        "recent_alerts": [
            {"title": "Germany Churn Rate Spike", "description": "Germany churn rate exceeded 32% and is above monthly threshold.", "severity": "high"},
            {"title": "Model Drift Alert", "description": "Prediction accuracy on recent data dropped to 84.2%.", "severity": "medium"},
        ],
    }

    workspace_rows = [
        {"customer_id": "C-15634602", "name": "Henri Dupont", "geography": "France", "risk": "High", "score": 0.87, "owner": "Sarah Johnson", "status": "new"},
        {"customer_id": "C-15647311", "name": "Klara Muller", "geography": "Germany", "risk": "High", "score": 0.94, "owner": "Robert Chen", "status": "in-progress"},
        {"customer_id": "C-15619304", "name": "Ana Garcia", "geography": "Spain", "risk": "High", "score": 0.72, "owner": "Sarah Johnson", "status": "in-progress"},
        {"customer_id": "C-15701122", "name": "Franz Weber", "geography": "Germany", "risk": "Medium", "score": 0.68, "owner": "Maria Garcia", "status": "new"},
        {"customer_id": "C-15784802", "name": "Sophie Laurent", "geography": "France", "risk": "High", "score": 0.98, "owner": "Robert Chen", "status": "new"},
        {"customer_id": "C-15613022", "name": "Luca Romano", "geography": "France", "risk": "Low", "score": 0.38, "owner": "Sarah Johnson", "status": "completed"},
    ]

    customer_profiles = {
        "C-15634602": {
            "customer_id": "C-15634602",
            "name": "Henri Dupont",
            "geography": "France",
            "gender": "Male",
            "age": 42,
            "risk": "High",
            "score": 0.87,
            "recommended_action": "Personal call + balance incentive",
            "drivers": [
                {"name": "Non-Active Member", "impact": "Very High"},
                {"name": "Zero Account Balance", "impact": "High"},
                {"name": "Low Credit Score", "impact": "High"},
                {"name": "Age Bracket 40-49", "impact": "Medium"},
            ],
            "history": [
                {"date": "2026-04-08", "type": "call", "description": "Outbound call: customer considering switching banks."},
                {"date": "2026-03-22", "type": "digital", "description": "Mobile app login with low engagement behavior."},
            ],
        }
    }

    governance = {
        "title": "Model Governance Center",
        "subtitle": "Bank churn prediction governance and performance monitoring",
        "cards": [
            {"label": "Model Version", "value": "v2.4.1"},
            {"label": "Accuracy", "value": "86.4%", "change": "-0.9%"},
            {"label": "Precision", "value": "82.1%", "change": "+0.4%"},
            {"label": "Recall", "value": "78.3%", "change": "-1.8%"},
            {"label": "AUC-ROC", "value": "0.867", "change": "-0.012"},
        ],
        "alerts": [
            {"severity": "high", "title": "Feature Drift - Age Distribution", "description": "Age distribution shifted versus training baseline."},
            {"severity": "high", "title": "Recall Below Threshold", "description": "Recall dropped below 80% acceptable threshold."},
        ],
    }

    campaigns = {
        "title": "Campaign and Retention Offers Center",
        "subtitle": "Targeted campaigns based on churn segments and model insights",
        "kpis": [
            {"label": "Active Campaigns", "value": "9", "change": "+2"},
            {"label": "Customers Targeted", "value": "6,284", "change": "+840"},
            {"label": "Offer Acceptance Rate", "value": "38.6%", "change": "+4.1%"},
            {"label": "Churns Prevented", "value": "1,247", "change": "+318"},
        ],
        "campaigns": [
            {"name": "Germany Re-Engagement Drive", "segment": "Germany - All Risk Levels", "channel": "Personal Call + Email", "status": "Active"},
            {"name": "Women 40-60 Priority Outreach", "segment": "Female Age 40-60 - High Risk", "channel": "RM Personal Call", "status": "Active"},
            {"name": "3-Product Simplification Offer", "segment": "NumOfProducts >= 3 - Critical Risk", "channel": "Senior RM Escalation", "status": "Active"},
        ],
    }

    _write_json("reference_dashboard.json", dashboard)
    _write_csv("reference_workspace.csv", workspace_rows)
    _write_json("reference_customer_profiles.json", customer_profiles)
    _write_json("reference_governance.json", governance)
    _write_json("reference_campaigns.json", campaigns)

    print("Reference data exported to", PROCESSED)


if __name__ == "__main__":
    main()
