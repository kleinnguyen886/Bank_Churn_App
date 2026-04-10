# Data Plan

## Source

Primary dataset is downloaded via KaggleHub:

```python
import kagglehub

path = kagglehub.dataset_download(
    "chetanmittal033/bank-dataset-for-customer-churn-prediction"
)
print("Path to dataset files:", path)
```

## Authentication

Use `kaggle.json` in the user profile `.kaggle` directory.

Windows default:

- `%USERPROFILE%/.kaggle/kaggle.json`

## Expected Files

- `Churn_Modelling.csv` as raw source table.

## Storage Rules

- Raw download references are tracked in `data/raw/`.
- Processed feature tables are written to `data/processed/`.
- Trained artifacts are written to `models/`.
