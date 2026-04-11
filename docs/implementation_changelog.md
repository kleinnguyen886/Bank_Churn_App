# Implementation Changelog

## 2026-04-11

### Backend and Data
- Added local raw CSV-first ingestion (`data/raw/Churn_Modelling.csv`) in training pipeline.
- Kept KaggleHub fallback when local raw file is unavailable.
- Added Python 3.9-safe typing compatibility in updated service modules.

### APIs
- Added paginated workspace API endpoint:
  - `GET /api/workspace?page=<int>&page_size=<int>&risk=<...>&status=<...>&owner=<...>&q=<...>`
- Pagination policy:
  - Default page size: `50`
  - Maximum page size: `200`
- Added async retraining API endpoints:
  - `POST /api/retraining/jobs`
  - `GET /api/retraining/jobs/current`
  - `GET /api/retraining/jobs/<job_id>`

### Chart and Trend Fixes
- Hardened dashboard/governance/campaign chart scripts:
  - HTTP status guards
  - payload shape guards
  - safe chart instance destroy/recreate
  - missing Chart.js guard
- Fixed chart canvas sizing so repeated rerenders do not increase panel height.
- Kept page buttons wired even when Chart.js is missing.
- Chart routes verified:
  - `/api/charts/dashboard`
  - `/api/charts/governance`
  - `/api/charts/campaigns`

### UI Functional Button Wiring
- Dashboard:
  - Last 30 Days toggle
  - Geography toggle
  - Export CSV
- Governance:
  - Export report JSON
  - Trigger retraining async job + status polling
- Campaigns:
  - Export table CSV
  - Create campaign action hook
- Workspace:
  - Bulk assign current page with backend persistence
  - Export current page CSV
  - Prev/Next and page-size pagination controls
- Customer detail:
  - Call customer (`tel:`)
  - Send email (`mailto:`)
  - Update status/risk badge cycle

### Workspace Filter Stability
- Added owner filter field.
- Preserved selected filter values and page size on form submit.
- Bulk-assign now updates `data/processed/workspace_view.csv` through the backend API.

### Governance Metrics
- Added F1-score to training output and governance summary artifacts.
- Expanded the governance KPI grid from 5 cards to 6 cards.

### Notebook
- Updated `bank-and-customer-churn.ipynb` for local project data path.
- Added stronger evaluation output:
  - classification report
  - ROC-AUC, precision, recall, F1
  - ROC and Precision-Recall visualizations
  - concise trend/conclusion markdown

### Validation Snapshot
- Backend reachable on `127.0.0.1:5000`
- Endpoint checks passed (`200`) for chart APIs and workspace pagination API
- Async retraining job endpoint checks passed (`202` start, `200` polling, `completed` terminal state)
- Page hook checks passed for new button IDs and scripts on dashboard, governance, campaigns, workspace, and customer detail pages
