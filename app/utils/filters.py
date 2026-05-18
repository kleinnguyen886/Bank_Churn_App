def apply_contains_filter(rows: list[dict], query: str, key: str = "name") -> list[dict]:
    if not query:
        return rows
    q = query.lower().strip()
    return [row for row in rows if q in str(row.get(key, "")).lower()]
