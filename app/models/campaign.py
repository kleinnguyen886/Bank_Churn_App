from dataclasses import dataclass


@dataclass
class Campaign:
    name: str
    segment: str
    status: str
