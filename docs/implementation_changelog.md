# Implementation Changelog

## 2026-05-02

### Workspace and Customer Detail Integration
- Added enriched customer profile loading from `data/raw/Churn_Modelling_customer_general_info.csv`.
- Added normalized customer ID handling (`CustomerId` -> `C-<id>`) for consistent API and UI routing.
- Extended workspace API output with profile enrichment fields:
  - full name
  - first name
  - city
  - region
  - age group
  - contact details
- Added dedicated customer detail API endpoint:
  - `GET /api/customer/<customer_id>`

### Backend Service Updates
- Added `app/services/enriched_customer_service.py` for loading and serving enriched profile records.
- Updated `app/services/customer_service.py` to support enriched customer detail assembly.
- Updated `app/services/workspace_service.py` to merge workspace rows with enriched profile data.
- Updated `app/routes/api.py` to:
  - expose the new customer detail endpoint
  - extend workspace filtering behavior and response fields

### Frontend API and UI Refactor (React/Vite)
- Added `Bank Retention Platform Design/src/app/lib/api.ts` as shared typed API client utilities.
- Reworked `Bank Retention Platform Design/src/app/components/RetentionWorkspace.tsx` to fetch live paginated API data instead of static/reference-only data.
- Reworked `Bank Retention Platform Design/src/app/components/CustomerDetail.tsx` to fetch customer detail via route parameter (`/customer/:customerId`).
- Updated `Bank Retention Platform Design/vite.config.ts` with `/api` proxy mapping to Flask backend.

### Data Pipeline Artifact
- Regenerated `data/raw/Churn_Modelling_customer_general_info.csv` for enriched identity/contact/location fields consumed by backend services.

### Runtime Validation Snapshot
- Completed live full-stack verification with both servers running:
  - Flask API: `127.0.0.1:5000`
  - Vite frontend: `127.0.0.1:5173`
- Verified workspace screen loaded real API payload with `10,000` records.
- Verified quick-view panel opened and displayed enriched profile summary.
- Verified navigation to `/customer/C-15634602` and successful enriched detail rendering.
- Verified backend request logs for:
  - `GET /api/workspace` -> `200`
  - `GET /api/customer/C-15634602` -> `200`

### Files Updated In This Implementation Wave
- `app/services/enriched_customer_service.py`
- `app/services/customer_service.py`
- `app/services/workspace_service.py`
- `app/routes/api.py`
- `Bank Retention Platform Design/src/app/lib/api.ts`
- `Bank Retention Platform Design/src/app/components/RetentionWorkspace.tsx`
- `Bank Retention Platform Design/src/app/components/CustomerDetail.tsx`
- `Bank Retention Platform Design/vite.config.ts`
- `data/raw/Churn_Modelling_customer_general_info.csv`

## 2026-04-15

### Model Training and Retraining
- Added CatBoost to the training pipeline and installed the matching dependency set.
- Added selectable retraining targets in the governance flow:
  - Auto Select Best
  - CatBoost
  - Random Forest
  - Logistic Regression
- Wired the selected retraining model through the governance header, async retraining API, and training script.
- Kept the best-model selection path available when Auto Select Best is chosen.

### Governance UI Cleanup
- Removed the duplicated `Selected Model` KPI from the governance card grid.
- Added a compact model selector to the governance header next to the retrain action.
- Added Confusion Matrix and Feature Importance sections to the Model Governance tab.

### Sidebar and Layout
- Added an author-credit info button in the shared sidebar.
- Anchored the credit button to the bottom-right of the sidebar footer.
- Kept the sidebar fixed to the viewport while the main content scrolls independently.
- Tightened the sidebar brand title styling so `Bank Retention` stays compact inside the 250px rail.
- Replaced the sidebar BR badge with the copied logo asset from `Bank Retention Platform Design/src/imports/image.png` via `static/image.png`.
- Updated the sidebar credit copy to show the lecturer and student names.

### Dashboard Snapshot
- Added a model snapshot block to the executive dashboard showing:
  - model name
  - model version
  - ROC-AUC
  - accuracy
  - recall
  - selected threshold

### Icon Enhancement
- Borrowed icon treatment ideas from the Figma design bundle and added Lucide icons across Flask pages.
- Added icon coverage for sidebar navigation, action buttons, KPI cards, filters, and section headings.

### Validation Snapshot
- Verified Flask page renders for the home page and governance page.
- Verified the governance context exposes the retrain model options and sanitized KPI cards.
- Verified the updated layout CSS and sidebar template compile cleanly.

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
