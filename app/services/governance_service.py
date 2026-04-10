from app.services.storage_service import read_json


def get_governance_context() -> dict:
    governance = read_json("governance_summary.json")
    if governance:
        return governance

    reference = read_json("reference_governance.json")
    if reference:
        return reference

    return {
        "title": "Model Governance Center",
        "subtitle": "Bank churn prediction governance and performance monitoring",
        "cards": [
            {"label": "Model Version", "value": "v2.4.1"},
            {"label": "Accuracy", "value": "86.4%", "change": "-0.9%"},
            {"label": "Precision", "value": "82.1%", "change": "+0.4%"},
            {"label": "Recall", "value": "78.3%", "change": "-1.8%"},
            {"label": "AUC-ROC", "value": "0.867", "change": "-0.012"},
        ],
        "metrics": {
            "roc_auc": 0.84,
            "precision": 0.73,
            "recall": 0.69,
            "last_trained": "2026-04-10",
        },
        "alerts": [
            {
                "severity": "high",
                "title": "Feature Drift - Age Distribution",
                "description": "Age distribution shifted versus training baseline.",
            },
            {
                "severity": "high",
                "title": "Recall Below Threshold",
                "description": "Recall dropped below 80% acceptable threshold.",
            },
        ],
    }
