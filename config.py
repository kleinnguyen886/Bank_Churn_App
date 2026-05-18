from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
OUTPUTS_DIR = BASE_DIR / "outputs"


class Config:
    SECRET_KEY = "dev-secret-change-me"
    JSON_SORT_KEYS = False
