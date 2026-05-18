from flask import Blueprint, render_template

from app.services.governance_service import get_governance_context


governance_bp = Blueprint("governance", __name__)


@governance_bp.route("/model-governance")
def model_governance():
    return render_template(
        "governance/model_governance.html",
        context=get_governance_context(),
    )
