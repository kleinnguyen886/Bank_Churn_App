# Data Plan

Last updated: 2026-04-11

## Source

Primary source is local raw CSV:

- `data/raw/Churn_Modelling.csv`

Fallback source is KaggleHub:

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

- Raw: `data/raw/Churn_Modelling.csv`
- Processed outputs:
    - `data/processed/workspace_view.csv`
    - `data/processed/dashboard_summary.json`
    - `data/processed/governance_summary.json`
    - `data/processed/campaigns_summary.json`
    - `data/processed/customer_profiles.json`
    - `data/processed/customer_master.csv`

## Storage Rules

- Raw download references are tracked in `data/raw/`.
- Processed feature tables are written to `data/processed/`.
- Trained artifacts are written to `models/`.

## Runtime Consumption

- Dashboard/governance/campaign page contexts read processed summary JSON files first.
- Chart endpoints read processed data and return normalized payloads for Chart.js.
- Workspace table reads `workspace_view.csv` and exposes paginated API access via `/api/workspace`.
