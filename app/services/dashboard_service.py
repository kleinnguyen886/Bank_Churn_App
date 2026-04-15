from typing import Optional

import pandas as pd

from app.services.storage_service import read_csv, read_json


def _extract_card_value(cards: list[dict], label: str) -> Optional[str]:
    target = label.strip().lower()
    for card in cards:
        if str(card.get("label", "")).strip().lower() == target:
            value = card.get("value")
            if value is None:
                return None
            return str(value)
    return None


def _format_percentage(value: object) -> str:
    fraction = _coerce_fraction(value)
    if fraction is None:
        return "n/a"
    return f"{fraction * 100:.1f}%"


def _format_decimal(value: object, places: int = 3) -> str:
    if value is None:
        return "n/a"
    try:
        return f"{float(value):.{places}f}"
    except (TypeError, ValueError):
        return str(value)


def _build_model_snapshot(governance: dict) -> dict:
    cards = governance.get("cards", []) if governance else []
    metrics = governance.get("metrics", {}) if governance else {}

    model_name = _extract_card_value(cards, "Selected Model") or str(metrics.get("model_name") or "Churn Model")
    model_version = _extract_card_value(cards, "Model Version") or str(metrics.get("model_version") or "v1")

    return {
        "model_name": model_name,
        "model_version": model_version,
        "accuracy": _format_percentage(metrics.get("accuracy")),
        "precision": _format_percentage(metrics.get("precision")),
        "recall": _format_percentage(metrics.get("recall")),
        "f1_score": _format_percentage(metrics.get("f1_score")),
        "roc_auc": _format_decimal(metrics.get("roc_auc")),
        "selected_threshold": _format_decimal(metrics.get("selected_threshold")),
        "last_trained": str(metrics.get("last_trained") or "n/a"),
    }


def _load_dashboard_frame() -> pd.DataFrame:
    workspace = read_csv("workspace_view.csv")
    if not workspace.empty:
        frame = workspace.copy()
    else:
        customer_master = read_csv("customer_master.csv")
        if customer_master.empty:
            return pd.DataFrame()
        frame = customer_master.copy()

    frame = frame.rename(
        columns={
            "Geography": "geography",
            "Exited": "exited",
            "churn_probability": "score",
        }
    )

    if "geography" not in frame.columns:
        frame["geography"] = "Unknown"
    frame["geography"] = frame["geography"].fillna("Unknown").astype(str)

    if "score" in frame.columns:
        frame["score"] = pd.to_numeric(frame["score"], errors="coerce").fillna(0.0)
    else:
        frame["score"] = 0.0

    if "exited" in frame.columns:
        frame["exited"] = pd.to_numeric(frame["exited"], errors="coerce").fillna(0).astype(int)
    else:
        frame["exited"] = (frame["score"] >= 0.5).astype(int)

    if "risk" not in frame.columns:
        frame["risk"] = frame["score"].apply(
            lambda value: "High" if value >= 0.75 else "Medium" if value >= 0.45 else "Low"
        )
    else:
        frame["risk"] = frame["risk"].fillna("Medium").astype(str).str.title()

    return frame


def _coerce_fraction(value: object) -> Optional[float]:
    if value is None:
        return None

    try:
        parsed = float(str(value).strip().replace("%", ""))
    except ValueError:
        return None

    if parsed > 1.0:
        parsed /= 100.0
    return parsed


def _build_live_dashboard_context() -> dict:
    frame = _load_dashboard_frame()
    if frame.empty:
        return read_json("reference_dashboard.json") or {}

    governance = read_json("governance_summary.json")
    metrics = governance.get("metrics", {}) if governance else {}
    model_snapshot = _build_model_snapshot(governance or {})
    recall = _coerce_fraction(metrics.get("recall"))
    f1_score = _coerce_fraction(metrics.get("f1_score"))

    total_customers = int(len(frame))
    predicted_churners = int((frame["score"] >= 0.5).sum())
    overall_churn_rate = float(frame["exited"].mean() * 100.0)
    retention_success_rate = (1.0 - recall) * 100.0 if recall is not None else max(0.0, 100.0 - overall_churn_rate)

    top_segments = (
        frame.groupby("geography")
        .agg(customers=("geography", "size"), churn_rate=("exited", "mean"))
        .reset_index()
        .sort_values(["churn_rate", "customers"], ascending=[False, False])
        .head(3)
        .assign(
            segment=lambda data: data["geography"],
            churn_rate=lambda data: (data["churn_rate"] * 100).round(1).astype(str) + "%",
            change="from latest retrain",
        )[["segment", "customers", "churn_rate", "change"]]
        .to_dict(orient="records")
    )

    high_risk_count = int((frame["risk"].astype(str).str.lower() == "high").sum())
    alerts = []
    if high_risk_count:
        alerts.append(
            {
                "title": "High Risk Customers Updated",
                "description": f"{high_risk_count:,} customers are tagged High Risk from the latest retraining run.",
                "severity": "high" if high_risk_count >= max(100, total_customers * 0.1) else "medium",
            }
        )
    if recall is not None:
        alerts.append(
            {
                "title": "Latest Retraining Metrics Loaded",
                "description": f"Recall is {recall * 100:.1f}% and F1-score is {(f1_score or 0.0) * 100:.1f}%.",
                "severity": "medium",
            }
        )

    if not alerts:
        alerts = read_json("reference_dashboard.json").get("recent_alerts", []) if read_json("reference_dashboard.json") else []

    return {
        "title": "Executive Overview Dashboard",
        "subtitle": "Bank churn prediction monitoring from latest retraining artifacts",
        "model_snapshot": model_snapshot,
        "kpis": [
            {"label": "Total Customers", "value": f"{total_customers:,}", "change": "latest dataset"},
            {
                "label": "Predicted Churners",
                "value": f"{predicted_churners:,}",
                "change": "score >= 0.5",
                "alert": True,
            },
            {
                "label": "Overall Churn Rate",
                "value": f"{overall_churn_rate:.1f}%",
                "change": "from retraining output",
                "alert": True,
            },
            {
                "label": "Retention Success Rate",
                "value": f"{retention_success_rate:.1f}%",
                "change": "derived from recall",
            },
        ],
        "top_segments": top_segments,
        "recent_alerts": alerts,
    }


def get_dashboard_context() -> dict:
    dashboard = read_json("dashboard_summary.json")
    if dashboard:
        if not dashboard.get("model_snapshot"):
            governance = read_json("governance_summary.json") or read_json("reference_governance.json") or {}
            if governance:
                dashboard["model_snapshot"] = _build_model_snapshot(governance)
        return dashboard

    live_context = _build_live_dashboard_context()
    if live_context:
        return live_context

    reference = read_json("reference_dashboard.json")
    if reference:
        return reference

    return {
        "title": "Executive Overview Dashboard",
        "subtitle": "Bank churn prediction monitoring - 10,000 customers tracked",
        "model_snapshot": {
            "model_name": "Churn Model",
            "model_version": "v2.4.1",
            "accuracy": "86.4%",
            "precision": "82.1%",
            "recall": "78.3%",
            "f1_score": "79.9%",
            "roc_auc": "0.867",
            "selected_threshold": "0.500",
            "last_trained": "2026-04-10",
        },
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
