# App Specification

## Screens

1. Executive Dashboard (`/`)
2. Retention Workspace (`/workspace`)
3. Customer Detail (`/customer/<customer_id>`)
4. Model Governance (`/model-governance`)
5. Campaign Center (`/campaigns`)

## Interaction Scope (MVP)

- filter and search in workspace
- customer detail drilldown
- campaign list review
- governance metric display

## API Scope (MVP)

- `GET /api/health`
- `GET /api/snapshot`

## Non-Goals (MVP)

- full SPA rewrite
- multi-tenant authentication
- production-grade workflow orchestration
