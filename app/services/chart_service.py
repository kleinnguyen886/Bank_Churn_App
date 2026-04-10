from __future__ import annotations

import pandas as pd

from app.services.storage_service import read_csv


def get_dashboard_charts() -> dict:
    workspace = read_csv("workspace_view.csv")
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
    return {
        "performance_trend": {
            "labels": ["Mar 1", "Mar 8", "Mar 15", "Mar 22", "Mar 29", "Apr 5"],
            "series": {
                "accuracy": [87.3, 87.0, 86.8, 86.5, 86.2, 86.4],
                "precision": [83.0, 82.8, 82.5, 82.2, 82.0, 82.1],
                "recall": [80.1, 79.5, 79.0, 78.6, 78.1, 78.3],
            },
        }
    }


def get_campaign_charts() -> dict:
    return {
        "trend": {
            "labels": ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
            "prevented": [820, 1050, 920, 1180, 1420, 1247],
            "budget": [195, 248, 221, 312, 380, 342],
        },
        "geo_acceptance": {
            "labels": ["France", "Germany", "Spain"],
            "values": [42.1, 38.4, 44.8],
        },
    }
