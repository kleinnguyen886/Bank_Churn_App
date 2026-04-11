# Project_2: Bank Retention Platform

Flask-first implementation for churn prediction and retention operations.

## Architecture

Figma handoff -> Flask templates (HTML/CSS/JS) -> optional Flask API endpoints -> Render.

## Run Locally

1. Create and activate a virtual environment.
2. Install Node.js LTS (for frontend scripts, includes `npm`).
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Start the app:

```bash
python app.py
```

5. Open `http://127.0.0.1:5000`.

## Initialize Data And Model Artifacts

1. Export normalized reference data from design-aligned seed values:

```bash
python scripts/export_reference_data.py
```

2. Download Kaggle dataset, train model, and generate processed artifacts:

```bash
python scripts/train_and_prepare.py
```

Generated artifacts are written to:

- `data/processed/dashboard_summary.json`
- `data/processed/workspace_view.csv`
- `data/processed/customer_profiles.json`
- `data/processed/governance_summary.json`
- `data/processed/campaigns_summary.json`
- `models/churn_model.joblib`

## One-Command Full Initialization (Backend + Frontend)

From `Project_2` folder:

```powershell
./scripts/init_full_stack.ps1
```

This script will:

1. install backend dependencies,
2. export reference design data,
3. download/train model and generate artifacts,
4. install frontend dependencies in `Bank Retention Platform Design`.

## Keeping Repository Lightweight

To avoid very large commits, the frontend reference folder is git-ignored:

- `Bank Retention Platform Design/`
- `Bank Retention Platform Design.zip`

Each collaborator should download/extract the frontend locally before running full-stack scripts.
Use the Figma link and handoff docs in:

- `figma/figma_link.txt`
- `figma_handoff.md`
- `figma/screen_mapping.md`

If `npm` is not installed, the script still completes backend initialization and prints a warning for the frontend step.

## Start Full Stack (Backend + Frontend)

From `Project_2` folder:

```powershell
./scripts/start_full_stack.ps1
```

It opens two PowerShell windows:

- Flask backend: `http://127.0.0.1:5000`
- Vite frontend reference: `http://127.0.0.1:5173`

If `npm` is not installed, it starts only backend and warns about the frontend prerequisite.

## Debug Endpoints

- `GET /api/health`: service liveness
- `GET /api/snapshot`: merged dashboard/governance/campaign payload
- `GET /api/debug/state`: artifact file readiness and debug status
- `GET /api/charts/dashboard`: dashboard chart payload
- `GET /api/charts/governance`: governance trend payload
- `GET /api/charts/campaigns`: campaign chart payload
- `POST /api/retraining/jobs`: start an async retraining job
- `GET /api/retraining/jobs/current`: current or latest retraining job
- `GET /api/retraining/jobs/<job_id>`: poll retraining job status
- `GET /api/workspace?page=1&page_size=50`: paginated workspace rows

If `ready` is `false` in `/api/debug/state`, rerun initialization scripts.

## Routes

- `/` Executive Dashboard
- `/workspace` Retention Workspace
- `/customer/<customer_id>` Customer Detail
- `/model-governance` Model Governance
- `/campaigns` Campaign Center

## Deployment (Render)

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Config file: `render.yaml`

## Notes

- Existing React implementation in `Bank Retention Platform Design/` is kept as reference.
- This Flask project is the MVP runtime.

## Recent Implementation Updates (2026-04-11)

1. Data pipeline
- Training now uses local raw input `data/raw/Churn_Modelling.csv` first.
- Kaggle download is only used as fallback when local raw input is missing.

2. Dashboard/governance/campaign chart fixes
- Added robust status checks, payload guards, and chart re-render safety.
- Added client-side handling when Chart.js is unavailable.
- Locked chart canvas height so the trend panels stay stable across rerenders.

3. Workspace table scalability
- Implemented server-side pagination in `/api/workspace`.
- Added default page size 50 and max 200.
- Workspace UI now fetches paged rows and supports page navigation.

4. Button functionality
- Dashboard buttons: range toggle, geography toggle, export CSV.
- Governance buttons: export JSON, async retraining job start/status polling.
- Campaign buttons: export CSV, create-campaign action hook.
- Workspace buttons: bulk assign (current page), export current page.
- Customer detail buttons: call, email, and update status action.

5. Notebook improvements
- `bank-and-customer-churn.ipynb` now reads local raw data path.
- Added stronger evaluation output: classification report, ROC-AUC, precision/recall/F1, ROC/PR charts, and trend conclusion.

Verification snapshot:
- `/api/charts/dashboard` -> 200
- `/api/charts/governance` -> 200
- `/api/charts/campaigns` -> 200
- `/api/workspace?page=1&page_size=50` -> valid pagination payload
