from app.services.campaign_service import get_campaign_context
from app.services.dashboard_service import get_dashboard_context
from app.services.governance_service import get_governance_context
from app.services.storage_service import file_status


def get_api_snapshot() -> dict:
    return {
        "dashboard": get_dashboard_context(),
        "governance": get_governance_context(),
        "campaigns": get_campaign_context(),
    }


def get_debug_state() -> dict:
    files = file_status()
    return {
        "artifact_files": files,
        "ready": all(
            files.get(key, False)
            for key in [
                "dashboard_summary.json",
                "workspace_view.csv",
                "governance_summary.json",
                "campaigns_summary.json",
                "customer_profiles.json",
            ]
        ),
    }
