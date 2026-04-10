from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from config import DATA_DIR


PROCESSED_DIR = DATA_DIR / "processed"


def json_exists(name: str) -> bool:
    return (PROCESSED_DIR / name).exists()


def csv_exists(name: str) -> bool:
    return (PROCESSED_DIR / name).exists()


def read_json(name: str, default: dict | None = None) -> dict:
    path = PROCESSED_DIR / name
    if not path.exists():
        return default or {}
    return json.loads(path.read_text(encoding="utf-8"))


def read_csv(name: str) -> pd.DataFrame:
    path = PROCESSED_DIR / name
    if not path.exists():
        return pd.DataFrame()
    return pd.read_csv(path)


def file_status() -> dict:
    expected = [
        "dashboard_summary.json",
        "workspace_view.csv",
        "governance_summary.json",
        "campaigns_summary.json",
        "customer_profiles.json",
        "reference_dashboard.json",
        "reference_workspace.csv",
        "reference_governance.json",
        "reference_campaigns.json",
        "reference_customer_profiles.json",
    ]
    return {
        name: (PROCESSED_DIR / name).exists() for name in expected
    }
