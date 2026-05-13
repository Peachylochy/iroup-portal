# Admin/Dashboard Migration Audit

Date: 2026-05-11

Scope:

- `Team IROUP/dashboard.html`
- `Team IROUP/report.html`
- `Team IROUP/mobility.html`
- `Team IROUP/mou.html`
- `Team IROUP/events.html`
- `Team IROUP/travel.html`

This is an audit/planning pass only. No operational page behavior, frontend architecture, backend route, deployment, or push action was changed.

## Executive Summary

Admin/dashboard migration should not start with CRUD writes. The safest next migration lane is read-only admin summary/list consumption, using `iroup-v2-api.js` beside `iroup-config.js`, while preserving V1 write/upload flows until V2 write contracts are designed and tested.

Recommended sequence:

1. `dashboard.html` read-only summary pilot.
2. `report.html` read-only report/summary pilot, separate from dashboard.
3. Module read-list pilots only: MOU, scholarship/events, travel, mobility.
4. Detail-read adoption where needed.
5. Only after reads stabilize: add V2 create/update/delete contracts per module.
6. Only after CRUD contracts stabilize: add V2 upload/file relation workflow.

## Page Classification

| Page | Category | Current V1 data flow | Writes | Uploads | Chart/map/stat risk | Migration risk |
| --- | --- | --- | --- | --- | --- | --- |
| `dashboard.html` | Read-only aggregate dashboard | `IROUP.getReport(year)` | No | No | High response-shape dependency, no external charts | Lowest |
| `report.html` | Read-only report/export | `IROUP.getReport()`, fallback `IROUP.getAll(...)` for six sheets | No | No | Chart.js, CSV export, cached raw rows | Low-medium |
| `mou.html` | Mixed read/write operational page | `IROUP.getAll(IROUP.SHEETS.MOU)` | `add/edit/delete` | `IROUP.uploadFile` | Chart.js + D3/topojson map + country aggregation | High |
| `events.html` | Mixed read/write, upload-heavy | `IROUP.getAll(SCHOLAR)`, `IROUP.getAll(EVENT)` | `add/edit/delete` | `IROUP.uploadImage`, `IROUP.uploadFile` | KPI/card rendering, date/status logic | High |
| `travel.html` | Mixed read/write, staff-coupled | `IROUP.getAll(TRAVEL)`, `IROUP.getAll(STAFF)`, `IROUP.getAll('COUNTRY')` | travel add/edit/delete, quick-add staff | `IROUP.uploadFile` | KPIs, country filters, CSV export | Very high |
| `mobility.html` | High-risk operational page | repeated `IROUP.getAll(INBOUND/OUTBOUND)`, `IROUP.searchStaff` | add/edit/delete inbound/outbound | No direct upload in current audit | Chart.js, duplicated workflow blocks, staff search/autofill, private fields | Highest |

## Current V2 Route Coverage

Available through `iroup-v2-api.js`:

- `IROUP_V2.admin.dashboardSummary()`
- `IROUP_V2.admin.reportSummary(fiscalYear)`
- `IROUP_V2.admin.mouList(params)` / `mouDetail(mouId)`
- `IROUP_V2.admin.mobilityList(params)` / `mobilityDetail(mobilityId)`
- `IROUP_V2.admin.travelList(params)` / `travelDetail(travelId)`
- `IROUP_V2.admin.scholarshipList(params)` / `scholarshipDetail(scholarshipId)`
- `IROUP_V2.admin.eventList(params)` / `eventDetail(eventId)`
- lookup routes for countries, units, file roles, and budget types.

Missing or not yet safe for migration:

- V2 create/update/delete routes for MOU.
- V2 create/update/delete routes for Mobility projects and participants.
- V2 create/update/delete routes for Travel and travel participants.
- V2 create/update/delete routes for Scholarship and Event records.
- V2 staff/person search route equivalent to `IROUP.searchStaff()`.
- V2 staff/person quick-add route equivalent to `IROUP.add(IROUP.SHEETS.STAFF, ...)`.
- V2 upload route and normalized file relation workflow.
- V2 report table/export DTOs. `v2.admin.report.summary` is summary-only by contract.
- Dashboard/report frontend-ready aggregate DTO parity is not yet proven against existing UI expectations.

## Page Findings

### `dashboard.html`

Current flow:

- Loads `iroup-config.js`, `iroup-utils.js`, and `iroup-sidebar.js`.
- Uses `IROUP.getReport(year)` as its only backend data source.
- Checks `json.success` and stores the full response in `state.raw`.
- Caches report payloads in `localStorage` under `iroup_dashboard_full_*`.
- Builds KPIs, top countries, unit summaries, upcoming scholarship/event tables, and expiring MOU rows from old flat report response shape.

Risks:

- Existing UI expects old report shape: `response.data` with arrays like `mou`, `scholar`, `event`, `inbound`, `outbound`, and `travel`.
- `IROUP_V2.admin.dashboardSummary()` is likely aggregate-only and may not contain the raw arrays needed by current table sections.
- Cache invalidation can hide migration failures during testing.

Recommendation:

- Migrate separately as the first read-only pilot only if the V2 dashboard summary DTO is intentionally mapped to the current dashboard sections.
- Do not mix dashboard migration with report migration.

### `report.html`

Current flow:

- Loads Chart.js, `iroup-config.js`, `iroup-utils.js`, and `iroup-sidebar.js`.
- Primary read is `IROUP.getReport()`.
- Fallback reads six V1 sheets through `IROUP.getAll(...)`.
- Uses `localStorage` cache under `iroup_report_cache_v2`.
- Builds a normalized client-side table from flat Thai-header rows and exports raw/filtered CSV.

Risks:

- `v2.admin.report.summary` is summary-only and does not replace the current row-level report table/export workflow.
- Current fallback depends on six raw V1 sheets.
- CSV export currently exposes whatever fields exist in raw rows for `exportRaw(key)`.

Recommendation:

- Keep `report.html` separate from dashboard.
- Do not migrate until V2 report table DTOs or per-module list aggregation strategy is chosen.
- If migrated early, only migrate the summary layer and leave row-level raw export V1-backed with clear labeling.

### `mou.html`

Current flow:

- Loads Chart.js, D3, topojson, `iroup-config.js`, and sidebar.
- Reads `IROUP.getAll(IROUP.SHEETS.MOU)`.
- Writes with `IROUP.add`, `IROUP.edit`, and `IROUP.delete`.
- Uploads attachment files through `IROUP.uploadFile`.
- Builds KPI, table, department chart, and D3 world map from local flat rows.

Risks:

- V2 has admin MOU list/detail, but no write or upload relation contract.
- Current form writes flat Thai-header fields directly to one sheet.
- V2 MOU writes must likely split parent MOU data from related `FILES` and `BUDGET`.
- Existing map and chart logic expects country display strings and local aliases.

Recommendation:

- Good candidate for a read-list-only pilot after dashboard/report decisions.
- Keep add/edit/delete/upload V1-backed until V2 MOU write and file relation contracts exist.

### `events.html`

Current flow:

- Loads `iroup-config.js`, `iroup-utils.js`, and sidebar.
- Reads scholarship and event sheets through `IROUP.getAll`.
- Writes both modules through `IROUP.add`, `IROUP.edit`, and `IROUP.delete`.
- Uploads posters through `IROUP.uploadImage` and documents through `IROUP.uploadFile`.
- Uses card rendering, status/date logic, local asset URL helpers, and pin/poster/file fields.

Risks:

- V2 has admin list/detail for scholarship and event, but no write/upload routes.
- Existing page combines two modules in one UI, so migration can accidentally couple two DTO contracts.
- Upload migration needs file role, visibility, parent relation, and public/private semantics.

Recommendation:

- Split migration into two read-only passes internally: scholarship list first, event list second.
- Keep writes/uploads V1-backed until V2 create/update/delete and file relation routes are ready.

### `travel.html`

Current flow:

- Loads `iroup-config.js`, `iroup-utils.js`, and sidebar.
- Reads travel rows, staff rows, and country rows through `IROUP.getAll`.
- Writes travel rows through `IROUP.add/edit/delete`.
- Quick-adds staff through `IROUP.add(IROUP.SHEETS.STAFF, ...)`.
- Uploads files through `IROUP.uploadFile`.
- Uses selected-staff chip state, country/continent autofill, KPIs, filters, table rendering, and CSV export.

Risks:

- V2 Travel is normalized around travel records, participants, budgets, files, and person references.
- Existing UI writes denormalized traveler names/codes/counts into one flat row.
- Staff quick-add is outside the current V2 admin route surface.
- Upload migration requires V2 file relation design.

Recommendation:

- Do not migrate writes early.
- If needed, do a read-list-only pilot after MOU/scholarship/events read pilots.
- Keep staff lookup/quick-add V1-backed until person/staff lookup and create contracts exist.

### `mobility.html`

Current flow:

- Large operational page with multiple overlapping script blocks.
- Loads Chart.js, `iroup-utils.js`, `iroup-config.js`, `iroup-selectors.js`, and sidebar.
- Reads inbound/outbound through repeated `IROUP.getAll(IROUP.SHEETS.INBOUND/OUTBOUND)`.
- Writes inbound/outbound with `IROUP.add/edit/delete`.
- Searches staff through `IROUP.searchStaff`.
- Renders tabs, KPIs, Chart.js charts, tables, filters, CSV export, and edit modal state.

Risks:

- Highest state and duplication risk among target pages.
- Existing inbound/outbound flat sheets do not map cleanly to normalized V2 mobility projects and participants.
- Page includes private operational fields like gender and staff/student identifiers, which are admin-safe but must not leak into public DTO logic.
- Staff search/autofill has no V2 equivalent yet.

Recommendation:

- Migrate last among module pages.
- First stabilize V2 read-only admin mobility list/detail independently.
- Defer writes until Mobility project/participant write contracts are designed and tested.

## Auth/Admin Token Handling

Current V1 behavior:

- Admin token handling is centralized in `iroup-config.js`.
- `iroup-config.js` reads `sessionStorage.iroup_admin_token` and `sessionStorage.iroup_user.adminToken`.
- Existing pages do not pass tokens manually; they depend on V1 helper behavior.

V2 behavior:

- `iroup-v2-api.js` reads `workspace_admin_token`, `iroup_admin_token`, `workspace_user`, and `iroup_user`.
- V2 admin adapter methods add `adminToken` automatically for `v2.admin.*` routes.

Risks:

- Token key parity is mostly good, but dashboard/admin pages must load `iroup-v2-api.js` after `iroup-config.js` during coexistence.
- Missing or stale session tokens will cause V2 admin calls to fail even if V1 calls still work.
- Mixed V1/V2 pages can show partial data if V2 reads fail but V1 writes remain enabled.

Recommendation:

- Add a small page-local V2 admin readiness check before enabling V2 admin reads.
- Do not remove V1 helper loading during mixed mode.
- During coexistence, fail closed for V2 admin-only data and keep write buttons on V1 until write contracts are ready.

## Temporary Coexistence Strategy

- Load `iroup-v2-api.js` only on the page being migrated.
- Keep `iroup-config.js` and existing V1 helpers during transition.
- For each module page, migrate read-list data first and keep add/edit/delete/upload flows V1-backed.
- Use page-local DTO adapters to preserve old render shapes during the first pass.
- Disable or clearly isolate any V2 read path that cannot maintain current write/edit assumptions.
- Do not migrate dashboard/report and CRUD pages in the same pass.
- Do not adopt V2 uploads until file role, visibility, parent relation, and returned URL contracts are locked.

## Recommended Migration Order

1. `dashboard.html` read-only V2 summary proof, if V2 summary can satisfy existing panels.
2. `report.html` summary-only or per-module list-backed read proof, with raw export explicitly left V1-backed if needed.
3. `mou.html` read-list-only pilot; keep write/upload V1.
4. `events.html` read-list-only, split scholarship and event internally; keep write/upload V1.
5. `travel.html` read-list-only; keep staff/country lookup, quick-add, writes, and uploads V1.
6. `mobility.html` read-list/detail-only after other reads stabilize; keep staff search and writes V1.
7. Add V2 write routes one module at a time.
8. Add V2 upload/file relation workflow after CRUD payloads are stable.

## Blockers Before CRUD Migration

- V2 create/update/delete contracts per module.
- V2 validation payload contracts matching normalized schema, not old flat form fields.
- V2 person/staff lookup and create/update route design.
- V2 file upload and `FILES` relation route design.
- V2 budget relation route design for MOU, mobility, and travel.
- Admin detail route payload verification against edit-modal requirements.
- A repeatable smoke test for admin token propagation and V2 admin route failures.

