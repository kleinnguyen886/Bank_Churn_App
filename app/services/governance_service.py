from copy import deepcopy

from app.services.retraining_service import get_retraining_model_options, normalize_model_choice
from app.services.storage_service import read_json


def _prepare_governance_context(governance: dict) -> dict:
    context = deepcopy(governance)
    cards = list(context.get("cards") or [])
    metrics = context.get("metrics") or {}
    selected_model = metrics.get("model_name")
    if not selected_model:
        for card in cards:
            if str(card.get("label", "")).strip().lower() == "selected model":
                selected_model = card.get("value")
                break

    context["cards"] = [
        card for card in cards if str(card.get("label", "")).strip().lower() != "selected model"
    ]
    context["model_options"] = get_retraining_model_options()
    context["active_model"] = normalize_model_choice(selected_model) if selected_model else "auto"
    return context


def get_governance_context() -> dict:
    governance = read_json("governance_summary.json")
    if governance:
        return _prepare_governance_context(governance)

    reference = read_json("reference_governance.json")
    if reference:
        return _prepare_governance_context(reference)

    return _prepare_governance_context({
        "title": "Model Governance Center",
        "subtitle": "Bank churn prediction governance and performance monitoring",
        "cards": [
            {"label": "Model Version", "value": "v2.4.1"},
            {"label": "Accuracy", "value": "86.4%", "change": "-0.9%"},
            {"label": "Precision", "value": "82.1%", "change": "+0.4%"},
            {"label": "Recall", "value": "78.3%", "change": "-1.8%"},
            {"label": "F1-Score", "value": "79.9%", "change": "+0.1%"},
            {"label": "AUC-ROC", "value": "0.867", "change": "-0.012"},
        ],
        "metrics": {
            "roc_auc": 0.84,
            "precision": 0.73,
            "recall": 0.69,
            "f1_score": 0.71,
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
    })
