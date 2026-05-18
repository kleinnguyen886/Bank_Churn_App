from dataclasses import dataclass


@dataclass
class RetentionCase:
    customer_id: str
    owner: str
    status: str
    recommendation: str
