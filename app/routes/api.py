from flask import Blueprint, jsonify, request

from app.services.api_service import get_api_snapshot, get_debug_state
from app.services.chart_service import (
    get_campaign_charts,
    get_dashboard_charts,
    get_governance_charts,
)
from app.services.retraining_service import (
    get_current_retraining_job,
    get_retraining_job,
    start_retraining_job,
)
from app.services.workspace_service import get_workspace_page


api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.get("/health")
def health():
    return jsonify({"status": "ok"})


@api_bp.get("/snapshot")
def snapshot():
    return jsonify(get_api_snapshot())


@api_bp.get("/debug/state")
def debug_state():
    return jsonify(get_debug_state())


@api_bp.get("/charts/dashboard")
def charts_dashboard():
    return jsonify(get_dashboard_charts())


@api_bp.get("/charts/governance")
def charts_governance():
    return jsonify(get_governance_charts())


@api_bp.get("/charts/campaigns")
def charts_campaigns():
    return jsonify(get_campaign_charts())


@api_bp.post("/retraining/jobs")
def retraining_jobs():
    payload = start_retraining_job()
    return jsonify(payload), 202 if payload.get("started") else 200


@api_bp.get("/retraining/jobs/current")
def retraining_jobs_current():
    job = get_current_retraining_job()
    return jsonify({"job": job, "message": "No retraining job is currently tracked." if job is None else None})


@api_bp.get("/retraining/jobs/<job_id>")
def retraining_jobs_status(job_id: str):
    job = get_retraining_job(job_id)
    if job is None:
        return jsonify({"error": "Retraining job not found"}), 404
    return jsonify({"job": job})


@api_bp.get("/workspace")
def workspace_rows():
    filters = {
        "risk": request.args.get("risk"),
        "status": request.args.get("status"),
        "owner": request.args.get("owner"),
        "q": request.args.get("q"),
    }

    try:
        page = int(request.args.get("page", "1"))
    except ValueError:
        page = 1

    try:
        page_size = int(request.args.get("page_size", "50"))
    except ValueError:
        page_size = 50

    return jsonify(get_workspace_page(filters=filters, page=page, page_size=page_size))
