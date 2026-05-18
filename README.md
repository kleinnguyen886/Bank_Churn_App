# Project_2: Bank Retention Platform

Flask-first churn prediction and retention operations platform for monitoring customer churn risk, planning retention actions, and reviewing model governance.

## Product Scope

The application supports four main stakeholder groups:

- Executive: KPI overview and business trend monitoring.
- Retention Agent: customer risk queue, drilldown, and action updates.
- Analyst: model metrics, drift tracking, and retraining visibility.
- Campaign Manager: campaign planning, performance, and status review.

Primary user flow:

1. Open the executive dashboard.
2. Move to the retention workspace.
3. Filter/search customers and select a customer.
4. Review customer detail and recommended action.
5. Check governance metrics and campaign status.

## Architecture

```text
Raw data -> preparation/training scripts -> processed CSV/JSON artifacts -> Flask services -> Jinja templates/CSS/JS -> Render
```

This repository now uses the Flask application as the runtime source of truth. The original Figma/React/Vite export was used as a migration reference and has been removed after the migration pass to keep the project lightweight.

Figma source:

```text
https://www.figma.com/design/DP7VJvHyZstxzNCWoruhUH/Bank-Retention-Platform-Design
```

## Run Locally

Create and activate a virtual environment, then install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start the Flask app:

```powershell
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

## Initialize Data And Model Artifacts

Export normalized reference data:

```powershell
python scripts/export_reference_data.py
```

Generate the enriched customer info file when needed:

```powershell
python scripts/generate_customer_general_info.py --input data/raw/Churn_Modelling.csv --output data/raw/Churn_Modelling_customer_general_info.csv
```

Train the model and generate processed artifacts:

```powershell
python scripts/train_and_prepare.py
```

Generated runtime artifacts include:

- `data/processed/dashboard_summary.json`
- `data/processed/workspace_view.csv`
- `data/processed/customer_profiles.json`
- `data/processed/governance_summary.json`
- `data/processed/campaigns_summary.json`
- `data/processed/customer_master.csv`
- `models/churn_model.joblib`

The model artifact and CatBoost training logs are generated files and are ignored by git.

## Helper Scripts

Backend initialization:

```powershell
./scripts/init_full_stack.ps1
```

This installs backend dependencies, exports reference data, and runs the training/artifact pipeline.

Backend startup:

```powershell
./scripts/start_full_stack.ps1
```

The script name is kept for compatibility, but the project now starts only the Flask app because the old Vite reference frontend has been removed.

## Routes

- `/` - Executive Dashboard
- `/workspace` - Retention Workspace
- `/customer/<customer_id>` - Customer Detail
- `/model-governance` - Model Governance
- `/campaigns` - Campaign Center

## API Endpoints

- `GET /api/health` - service liveness
- `GET /api/snapshot` - merged dashboard/governance/campaign payload
- `GET /api/debug/state` - artifact readiness and debug status
- `GET /api/charts/dashboard` - dashboard chart payload
- `GET /api/charts/governance` - governance trend payload
- `GET /api/charts/campaigns` - campaign chart payload
- `GET /api/workspace?page=1&page_size=50` - paginated workspace rows
- `GET /api/customer/<customer_id>` - enriched customer detail
- `POST /api/retraining/jobs` - start async retraining job
- `GET /api/retraining/jobs/current` - current/latest retraining job
- `GET /api/retraining/jobs/<job_id>` - poll retraining job status

If `ready` is `false` in `/api/debug/state`, rerun the initialization scripts.

## Data Plan

Primary raw source:

- `data/raw/Churn_Modelling.csv`

Enriched identity/contact/location source:

- `data/raw/Churn_Modelling_customer_general_info.csv`

Fallback source:

```python
import kagglehub

path = kagglehub.dataset_download(
    "chetanmittal033/bank-dataset-for-customer-churn-prediction"
)
print("Path to dataset files:", path)
```

Kaggle authentication should use `kaggle.json` in `%USERPROFILE%/.kaggle/kaggle.json`.

Runtime consumption:

- Dashboard, governance, and campaign services read processed summary JSON files first.
- Chart endpoints read processed data and return normalized Chart.js payloads.
- Workspace reads `data/processed/workspace_view.csv` through paginated API access.
- Services fall back to reference data where available when processed files are missing.

## Project Structure

- `app.py` - Flask entrypoint
- `wsgi.py` - Gunicorn entrypoint
- `config.py` - project paths and Flask config
- `app/` - routes, services, models, templates, and utilities
- `static/` - CSS, JavaScript, image, and favicon assets
- `data/raw/` - source datasets
- `data/processed/` - generated runtime CSV/JSON artifacts
- `models/` - generated trained model artifacts
- `outputs/` - generated evaluation outputs
- `scripts/` - data export, enrichment, training, and startup helpers
- `render.yaml` - Render deployment config
- `requirements.txt` - Python dependencies

## Screen Mapping

- Executive Dashboard -> `/` -> `app/templates/dashboard/executive_dashboard.html`
- Retention Workspace -> `/workspace` -> `app/templates/workspace/retention_workspace.html`
- Customer Detail -> `/customer/<customer_id>` -> `app/templates/customer/customer_detail.html`
- Model Governance -> `/model-governance` -> `app/templates/governance/model_governance.html`
- Campaign Center -> `/campaigns` -> `app/templates/campaigns/campaign_center.html`

## Design Tokens

- Primary: `#0B6E4F`
- Accent: `#FF7F11`
- Background: `#F4F7F2`
- Text: `#1F2933`
- Card radius: `12px`
- Badge radius: `999px`
- Base font: Segoe UI
- Heading weight: `700`
- Body weight: `400`

## Migration Status

Migrated from the React reference into Flask:

- App shell and side navigation.
- All five route mappings.
- Core page headers, KPI sections, summary panels, and data contexts.
- Data artifact pipeline integration with fallback reference data.
- API debug state endpoint.
- Chart endpoints/renderers for dashboard, governance, and campaigns.
- Server-side workspace pagination and client pagination controls.
- Header/action button handlers across major pages.
- Enriched workspace/customer detail API integration.

Remaining future polish:

- More advanced workspace interactions and status workflows.
- Customer detail benchmark/chart parity beyond the current Flask view.
- Final responsive pass for mobile/tablet parity.
- Unified toast/inline feedback instead of browser alerts.

React-specific architecture such as Radix UI, Recharts components, and component-local React state was intentionally replaced by Flask templates, Flask APIs, and Chart.js.

## Implementation Plan

Completed:

- M1: Flask shell and page routing.
- M2: Data ingestion and model artifact pipeline.
- M3: All five pages rendering with core live service data.

Pending:

- M4: Final production verification and deployment pass.

Immediate next steps:

1. Add a unified user feedback component.
2. Complete responsive/UX parity review against the Figma source.
3. Finish production verification on Render.

## Deployment

Render settings:

- Root directory: `Project_2`
- Service type: Web Service
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn wsgi:app`
- Config file: `render.yaml`
- Python version: `3.11.9`
- Health check path: `/api/health`

Deployment checklist:

- `render.yaml` exists at repository root.
- `requirements.txt` includes `gunicorn`.
- `app.py` exposes `app = create_app()`.
- `data/processed/` has the latest generated artifacts.
- `/api/health` returns `{"status": "ok"}` after deployment.

The retraining job registry is currently in memory. It works for one web instance but is not durable across restarts or multiple dynos.

## Validation Snapshot

Previously validated locally:

- `/api/charts/dashboard` -> `200`
- `/api/charts/governance` -> `200`
- `/api/charts/campaigns` -> `200`
- `/api/workspace?page=1&page_size=50` -> valid pagination payload
- `/api/retraining/jobs` -> `202` start and `200` polling
- `/api/customer/C-15634602` -> `200`
- `/`, `/workspace`, `/model-governance`, `/campaigns` -> `200`

## Changelog

### 2026-05-02

- Added enriched customer profile loading from `data/raw/Churn_Modelling_customer_general_info.csv`.
- Added normalized customer ID handling (`CustomerId` -> `C-<id>`).
- Extended workspace API output with profile enrichment fields.
- Added `GET /api/customer/<customer_id>`.
- Updated customer/workspace/API services for enriched profile assembly.
- Regenerated enriched raw customer info data.
- Verified workspace loading with `10,000` records and customer detail navigation.

### 2026-04-15

- Added CatBoost to the training pipeline and dependency set.
- Added retraining model selection: Auto Select Best, CatBoost, Random Forest, Logistic Regression.
- Added Confusion Matrix and Feature Importance sections to Model Governance.
- Added sidebar author-credit UI and updated sidebar layout.
- Added dashboard model snapshot block.
- Added Lucide-inspired icon coverage across Flask pages.

### 2026-04-11

- Added local raw CSV-first ingestion with KaggleHub fallback.
- Added paginated workspace API with default page size `50` and max `200`.
- Added async retraining job endpoints.
- Hardened chart scripts with HTTP/payload guards and safe rerender handling.
- Wired dashboard, governance, campaigns, workspace, and customer-detail buttons.
- Added owner filter preservation and bulk assignment persistence.
- Added F1-score to governance metrics and training output.

## Attribution

The original Figma Make bundle included components from `shadcn/ui` under the MIT license and photos from Unsplash under the Unsplash license.
