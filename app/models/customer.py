from dataclasses import dataclass


@dataclass
class Customer:
    customer_id: str
    name: str
    risk: str
    score: float
