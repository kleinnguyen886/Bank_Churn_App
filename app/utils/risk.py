def risk_band(score: float) -> str:
    if score >= 0.75:
        return "High"
    if score >= 0.45:
        return "Medium"
    return "Low"
