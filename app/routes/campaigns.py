from flask import Blueprint, render_template

from app.services.campaign_service import get_campaign_context


campaigns_bp = Blueprint("campaigns", __name__)


@campaigns_bp.route("/campaigns")
def campaign_center():
    return render_template(
        "campaigns/campaign_center.html",
        context=get_campaign_context(),
    )
