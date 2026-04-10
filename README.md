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
