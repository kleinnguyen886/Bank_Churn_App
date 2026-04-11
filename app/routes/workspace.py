from flask import Blueprint, render_template, request

from app.services.workspace_service import get_workspace_context


workspace_bp = Blueprint("workspace", __name__)


def _clean_filter_value(value: object) -> str:
    if value is None:
        return ""

    text = str(value).strip()
    if text.lower() in {"none", "null", "undefined"}:
        return ""

    return text


@workspace_bp.route("/workspace")
def retention_workspace():
    filters = {
        "risk": _clean_filter_value(request.args.get("risk")),
        "status": _clean_filter_value(request.args.get("status")),
        "segment": _clean_filter_value(request.args.get("segment")),
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

    return render_template(
        "workspace/retention_workspace.html",
        context=get_workspace_context(filters, page=page, page_size=page_size),
    )
