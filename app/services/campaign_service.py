from app.services.storage_service import read_json


def get_campaign_context() -> dict:
    campaigns = read_json("campaigns_summary.json")
    if campaigns:
        return campaigns

    reference = read_json("reference_campaigns.json")
    if reference:
        return reference

    return {
        "title": "Campaign and Retention Offers Center",
        "subtitle": "Targeted campaigns based on churn segments and model insights",
        "kpis": [
            {"label": "Active Campaigns", "value": "9", "change": "+2"},
            {"label": "Customers Targeted", "value": "6,284", "change": "+840"},
            {"label": "Offer Acceptance Rate", "value": "38.6%", "change": "+4.1%"},
            {"label": "Churns Prevented", "value": "1,247", "change": "+318"},
        ],
        "campaigns": [
            {
                "name": "Germany Re-Engagement Drive",
                "segment": "Germany - All Risk Levels",
                "channel": "Personal Call + Email",
                "status": "Active",
            },
            {
                "name": "Women 40-60 Priority Outreach",
                "segment": "Female Age 40-60 - High Risk",
                "channel": "RM Personal Call",
                "status": "Active",
            },
            {
                "name": "3-Product Simplification Offer",
                "segment": "NumOfProducts >= 3 - Critical Risk",
                "channel": "Senior RM Escalation",
                "status": "Active",
            },
        ],
    }
