# Implementation Plan

Last updated: 2026-04-11

## Phase 1: Foundation

- Build Flask scaffolding and page routes.
- Establish shared template shell and static theme.
- Add Project_2 documentation baseline.

Status: Completed

## Phase 2: Data and Model

- Add KaggleHub data download step.
- Extract reusable training pipeline from notebook.
- Save model artifacts for application use.

Status: Completed

Implemented detail:
- Training script now prefers local raw input from `data/raw/Churn_Modelling.csv`.
- Fallback to KaggleHub remains available for missing local raw input.

## Phase 3: UI Delivery

- Implement pages in order: dashboard, workspace, customer, governance, campaigns.
- Add filters, search, and page-level actions.

Status: In progress (major functionality complete)

Implemented detail:
- Added data-driven charts for dashboard, governance, and campaigns.
- Added chart client hardening (status checks, payload guards, missing-library guard).
- Locked chart canvas height so the trend panels no longer grow on repeated renders.
- Implemented workspace server-side pagination (`/api/workspace`) with default 50/max 200.
- Wired page-level actions/buttons across dashboard, workspace, governance, campaigns, and customer detail.
- Replaced the governance retraining simulation with an async job + status polling flow.

## Phase 4: Deployment

- Add Render config and startup process.
- Validate route rendering and static assets in production.

Status: In progress

## Milestones

- M1: Flask shell and page routing complete.
- M2: Data ingestion and model artifacts complete.
- M3: All 5 pages rendering with live service data.
- M4: Render deployment complete.

Current checkpoint:
- M1 complete
- M2 complete
- M3 complete for core functionality, with additional UX polish pending
- M4 pending final production verification pass

## Immediate Next Steps

1. Add unified user feedback component (toast/inline notice) instead of browser alerts.
2. Complete final responsive/UX parity pass against reference design screens.
3. Finish final production verification and deployment checks.
