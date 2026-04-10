from datetime import datetime


def utc_date() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d")
