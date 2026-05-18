from flask import Blueprint, render_template

from app.services.dashboard_service import get_dashboard_context


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/")
def executive_dashboard():
    return render_template(
        "dashboard/executive_dashboard.html",
        context=get_dashboard_context(),
    )
