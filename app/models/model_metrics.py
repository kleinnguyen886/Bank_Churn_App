from dataclasses import dataclass


@dataclass
class ModelMetrics:
    roc_auc: float
    precision: float
    recall: float
    last_trained: str
