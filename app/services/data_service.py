from __future__ import annotations

from pathlib import Path

import kagglehub

from config import DATA_DIR


def local_raw_churn_csv() -> Path | None:
    csv_path = DATA_DIR / "raw" / "Churn_Modelling.csv"
    if csv_path.exists():
        return csv_path
    return None


def download_churn_dataset() -> Path:
    """Download the latest churn dataset and return local directory path."""
    path = kagglehub.dataset_download(
        "chetanmittal033/bank-dataset-for-customer-churn-prediction"
    )
    return Path(path)


def resolve_churn_csv(dataset_dir: Path) -> Path:
    csv_path = dataset_dir / "Churn_Modelling.csv"
    if not csv_path.exists():
        raise FileNotFoundError(
            f"Expected dataset file not found at {csv_path}. Check kaggle.json credentials."
        )
    return csv_path
