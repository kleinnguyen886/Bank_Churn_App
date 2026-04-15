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
from app.services.workspace_service import get_workspace_page, update_workspace_owners


api_bp = Blueprint("api", __name__, url_prefix="/api")


def _clean_filter_value(value: object) -> str:
    if value is None:
        return ""

    text = str(value).strip()
    if text.lower() in {"none", "null", "undefined"}:
        return ""

    return text


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
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        payload = {}

    requested_model = payload.get("model_name") or payload.get("model") or request.args.get("model")

    try:
        job_payload = start_retraining_job(model_name=requested_model)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(job_payload), 202 if job_payload.get("started") else 200


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
        "risk": _clean_filter_value(request.args.get("risk")),
        "status": _clean_filter_value(request.args.get("status")),
        "owner": _clean_filter_value(request.args.get("owner")),
        "q": _clean_filter_value(request.args.get("q")),
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


@api_bp.post("/workspace/bulk-assign")
def workspace_bulk_assign():
    payload = request.get_json(silent=True) or {}
    customer_ids = payload.get("customer_ids") or []
    owner = str(payload.get("owner") or "").strip()

    if not isinstance(customer_ids, list):
        return jsonify({"error": "customer_ids must be a list"}), 400

    updated_count = update_workspace_owners([str(customer_id) for customer_id in customer_ids], owner)
    if updated_count == 0:
        return jsonify({"updated": 0, "message": "No workspace rows were updated."}), 200

    return jsonify({"updated": updated_count, "message": f"Updated {updated_count} workspace rows."})
