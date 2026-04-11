# Pipeline

This project has two execution paths:

- Local development, where Flask runs with the optional Vite reference frontend.
- Render hosting, where only the Flask app is deployed as a web service.

## Local Pipeline

### What runs locally

1. A Python virtual environment for the Flask backend.
2. Optional Node.js tooling for the reference frontend folder.
3. Data preparation scripts that build the processed CSV and JSON artifacts.
4. The Flask app on `http://127.0.0.1:5000`.
5. The reference frontend on `http://127.0.0.1:5173` when `start_full_stack.ps1` is used.

### Local data flow

- `data/raw/Churn_Modelling.csv` is the preferred input for training.
- `scripts/train_and_prepare.py` generates the processed artifacts used by the app.
- The Flask routes read from `data/processed/` first.
- If a processed file is missing, the services fall back to reference data where available.
- Charts, workspace pagination, and retraining status are all served through Flask API endpoints.

### Local startup steps

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scripts/export_reference_data.py
python scripts/train_and_prepare.py
python app.py
```

For the one-command full stack flow:

```powershell
./scripts/init_full_stack.ps1
./scripts/start_full_stack.ps1
```

### Local verification

After startup, check these endpoints:

- `/api/health`
- `/api/debug/state`
- `/api/snapshot`
- `/api/charts/dashboard`
- `/api/charts/governance`
- `/api/charts/campaigns`
- `/api/workspace?page=1&page_size=50`
- `/api/retraining/jobs/current`

The governance retraining button now starts a background job with polling against `/api/retraining/jobs/<job_id>`.

## Render Pipeline

### What Render runs

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn wsgi:app`
- Python version: `3.11.9`

### How Render works

1. Render pulls the GitHub repository.
2. Render installs Python dependencies.
3. Gunicorn starts the Flask app through `wsgi.py`.
4. Flask serves the HTML templates, CSS, JavaScript, and API routes.
5. The deployed UI reads the committed processed data and model artifacts from the repo.

### Important Render notes

- The current retraining job registry is in memory. It works well on one web instance, but it is not durable across restarts or multiple dynos.
- The `Bank Retention Platform Design/` folder is a local reference frontend and is gitignored, so it is not part of the Render deployment.
- Render does not need the Vite dev server for this Flask-first app.
- The build step does not retrain the model. If you change the data or model pipeline, regenerate the artifacts locally before you deploy.

### Recommended Render settings

- Root directory: `Project_2`
- Service type: Web Service
- Auto-deploy: enabled
- Health check path: `/api/health`

## Push Plan To Render

1. Make sure the app runs locally with `python app.py` or `./scripts/start_full_stack.ps1`.
2. Regenerate artifacts if you changed the training or export scripts.
3. Verify the key endpoints locally, especially `/api/health`, `/api/debug/state`, and the chart endpoints.
4. Commit the code, docs, and any updated processed artifacts.
5. Push the branch to GitHub.
6. In Render, connect the GitHub repository to a new Web Service or update the existing one.
7. Let Render use `render.yaml`, or confirm the build and start commands match the file.
8. Set `PYTHON_VERSION=3.11.9` if Render does not pick it up from `render.yaml`.
9. Deploy and watch the build logs for dependency or import errors.
10. After deploy, test `/api/health`, `/api/debug/state`, the dashboard pages, and the retraining status endpoints.

## Simple Git Flow

```powershell
git status
git add .
git commit -m "Add deployment pipeline docs and async retraining workflow"
git push origin main
```

If your default branch is not `main`, replace it with your branch name.

## Deployment Checklist

- `render.yaml` exists at the repository root.
- `requirements.txt` includes `gunicorn`.
- `app.py` exposes `app = create_app()` for Gunicorn.
- `data/processed/` has the latest generated artifacts.
- `models/churn_model.joblib` is present if you want the trained model artifact deployed.
- `/api/health` returns `{"status": "ok"}` after deployment.