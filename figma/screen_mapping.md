# Screen Mapping

Frame: Executive Dashboard
Route: /
Template: app/templates/dashboard/executive_dashboard.html
Data: KPI summaries
Interactions: page navigation

Frame: Retention Workspace
Route: /workspace
Template: app/templates/workspace/retention_workspace.html
Data: customer list, risk score, ownership
Interactions: search, filter, drilldown

Frame: Customer Detail
Route: /customer/<customer_id>
Template: app/templates/customer/customer_detail.html
Data: profile, score, recommendations
Interactions: action status updates

Frame: Model Governance
Route: /model-governance
Template: app/templates/governance/model_governance.html
Data: model metrics
Interactions: metric refresh (future)

Frame: Campaign Center
Route: /campaigns
Template: app/templates/campaigns/campaign_center.html
Data: campaign list and statuses
Interactions: status filter (future)
