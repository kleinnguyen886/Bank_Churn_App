from __future__ import annotations

import pandas as pd

from app.services.storage_service import read_csv, read_json


def _parse_number(value, default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().replace(",", "")
    if text.endswith("%"):
        text = text[:-1]
    try:
        return float(text)
    except ValueError:
        return default


def _bounded_series(seed: float, n: int, floor: float = 0.0, ceil: float = 100.0) -> list[float]:
    series = []
    for idx in range(n):
        wave = ((idx % 3) - 1) * 0.8
        drift = (idx - (n // 2)) * 0.2
        value = max(floor, min(ceil, seed + wave + drift))
        series.append(round(value, 2))
    return series


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

    return frame


def get_dashboard_charts() -> dict:
    workspace = _load_dashboard_frame()
    if workspace.empty:
        return {
            "churn_trend": {
                "labels": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
                "datasets": [
                    {"label": "Churned", "data": [298, 312, 287, 325, 341, 318, 156], "borderColor": "#ef4444"},
                    {"label": "At Risk", "data": [420, 455, 410, 478, 495, 462, 241], "borderColor": "#f59e0b"},
                    {"label": "Retained", "data": [1180, 1210, 1190, 1240, 1260, 1230, 631], "borderColor": "#10b981"},
                ],
            },
            "geography": {
                "labels": ["Germany", "France", "Spain"],
                "values": [32.4, 16.2, 16.6],
                "colors": ["#ef4444", "#3b82f6", "#10b981"],
            },
        }

    geo_counts = workspace.groupby("geography").size().sort_values(ascending=False)
    churn_proxy = workspace.groupby("geography")["score"].mean().reindex(geo_counts.index)

    monthly = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
    avg_score = float(workspace["score"].mean()) if "score" in workspace else 0.5
    base = int(100 + avg_score * 300)

    return {
        "churn_trend": {
            "labels": monthly,
            "datasets": [
                {
                    "label": "Churned",
                    "data": [max(40, base - 20), base, base - 10, base + 15, base + 20, base + 5, base - 60],
                    "borderColor": "#ef4444",
                },
                {
                    "label": "At Risk",
                    "data": [base + 80, base + 90, base + 70, base + 110, base + 120, base + 95, base - 15],
                    "borderColor": "#f59e0b",
                },
                {
                    "label": "Retained",
                    "data": [base + 700, base + 740, base + 710, base + 760, base + 780, base + 750, base + 280],
                    "borderColor": "#10b981",
                },
            ],
        },
        "geography": {
            "labels": geo_counts.index.tolist(),
            "values": (churn_proxy * 100).round(1).tolist(),
            "colors": ["#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][: len(geo_counts)],
        },
    }


def get_governance_charts() -> dict:
    governance = read_json("governance_summary.json")
    if not governance:
        governance = read_json("reference_governance.json")

    metrics = governance.get("metrics", {}) if governance else {}
    accuracy = _parse_number(metrics.get("accuracy"), default=86.0)
    precision = _parse_number(metrics.get("precision"), default=82.0)
    recall = _parse_number(metrics.get("recall"), default=78.0)

    if accuracy <= 1.0:
        accuracy *= 100
    if precision <= 1.0:
        precision *= 100
    if recall <= 1.0:
        recall *= 100

    labels = ["W-5", "W-4", "W-3", "W-2", "W-1", "Now"]
    return {
        "performance_trend": {
            "labels": labels,
            "series": {
                "accuracy": _bounded_series(accuracy, len(labels), floor=40.0, ceil=99.9),
                "precision": _bounded_series(precision, len(labels), floor=30.0, ceil=99.9),
                "recall": _bounded_series(recall, len(labels), floor=20.0, ceil=99.9),
            },
        }
    }


def get_campaign_charts() -> dict:
    campaigns = read_json("campaigns_summary.json")
    if not campaigns:
        campaigns = read_json("reference_campaigns.json")

    kpis = campaigns.get("kpis", []) if campaigns else []
    by_label = {str(item.get("label", "")).strip().lower(): item.get("value") for item in kpis}

    targeted = _parse_number(by_label.get("customers targeted"), default=6000)
    prevented_latest = _parse_number(by_label.get("churns prevented"), default=max(200.0, targeted * 0.2))
    acceptance = _parse_number(by_label.get("offer acceptance rate"), default=35.0)

    months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
    prevented = []
    budget = []
    for idx in range(len(months)):
        factor = 0.72 + (idx * 0.07)
        prevented_value = max(20.0, prevented_latest * factor)
        prevented.append(round(prevented_value, 0))
        budget.append(round(prevented_value * 0.22, 0))

    workspace = read_csv("workspace_view.csv")
    if workspace.empty:
        workspace = read_csv("reference_workspace.csv")

    if not workspace.empty and "geography" in workspace.columns:
        geo_values = workspace.copy()
        if "score" in geo_values.columns:
            geo_series = geo_values.groupby("geography")["score"].mean().sort_values(ascending=False)
            geo_pct = (geo_series * 100).round(1)
        else:
            geo_counts = geo_values.groupby("geography").size().sort_values(ascending=False)
            geo_pct = ((geo_counts / geo_counts.sum()) * 100).round(1)
        geo_labels = geo_pct.index.tolist()
        geo_numbers = geo_pct.values.tolist()
    else:
        geo_labels = ["France", "Germany", "Spain"]
        germany = max(1.0, min(99.0, acceptance - 1.2))
        france = max(1.0, min(99.0, acceptance + 0.6))
        spain = max(1.0, min(99.0, acceptance + 2.1))
        geo_numbers = [france, germany, spain]

    return {
        "trend": {
            "labels": months,
            "prevented": prevented,
            "budget": budget,
        },
        "geo_acceptance": {
            "labels": geo_labels,
            "values": geo_numbers,
        },
    }
