from flask import Blueprint, jsonify

from app.services.api_service import get_api_snapshot, get_debug_state
from app.services.chart_service import (
    get_campaign_charts,
    get_dashboard_charts,
    get_governance_charts,
)


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
