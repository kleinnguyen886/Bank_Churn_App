from pathlib import Path

import joblib


def save_model_artifact(model, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)


def load_model_artifact(model_path: Path):
    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact not found: {model_path}")
    return joblib.load(model_path)
