from copy import deepcopy

from app.services.retraining_service import get_retraining_model_options, normalize_model_choice
from app.services.storage_service import read_json


def _as_float(value: object, default: float = 0.0) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return parsed


def _safe_fraction(value: object) -> float:
    parsed = _as_float(value)
    if parsed <= 0:
        return 0.0
    if parsed > 1.0:
        return parsed / 100.0
    return parsed


def _build_confusion_overview(confusion_matrix: dict, metrics: dict) -> dict:
    tn = int(_as_float(confusion_matrix.get("tn", 0)))
    fp = int(_as_float(confusion_matrix.get("fp", 0)))
    fn = int(_as_float(confusion_matrix.get("fn", 0)))
    tp = int(_as_float(confusion_matrix.get("tp", 0)))

    total = tn + fp + fn + tp
    positives = tp + fn

    precision = tp / (tp + fp) if (tp + fp) else _safe_fraction(metrics.get("precision"))
    recall = tp / (tp + fn) if (tp + fn) else _safe_fraction(metrics.get("recall"))
    specificity = tn / (tn + fp) if (tn + fp) else 0.0

    return {
        "has_values": total > 0,
        "test_size": total,
        "positive_count": positives,
        "tp": tp,
        "fn": fn,
        "fp": fp,
        "tn": tn,
        "precision_pct": round(precision * 100, 1),
        "recall_pct": round(recall * 100, 1),
        "specificity_pct": round(specificity * 100, 1),
    }


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
    context["confusion_matrix"] = context.get("confusion_matrix") if isinstance(context.get("confusion_matrix"), dict) else {}
    context["confusion_overview"] = _build_confusion_overview(context["confusion_matrix"], metrics)
    context["feature_importance"] = context.get("feature_importance") if isinstance(context.get("feature_importance"), list) else []
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
        "confusion_matrix": {
            "predicted_labels": ["Predicted Stay", "Predicted Churn"],
            "rows": [],
            "tn": 0,
            "fp": 0,
            "fn": 0,
            "tp": 0,
        },
        "feature_importance": [],
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
