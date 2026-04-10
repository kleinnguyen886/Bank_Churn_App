from flask import Blueprint, render_template, request

from app.services.workspace_service import get_workspace_context


workspace_bp = Blueprint("workspace", __name__)


@workspace_bp.route("/workspace")
def retention_workspace():
    filters = {
        "risk": request.args.get("risk"),
        "segment": request.args.get("segment"),
        "owner": request.args.get("owner"),
        "q": request.args.get("q"),
    }
    return render_template(
        "workspace/retention_workspace.html",
        context=get_workspace_context(filters),
    )
