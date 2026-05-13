# IROUP Database V2 Roadmap

Updated direction after shifting from frontend-first patching to database-first / backend-first architecture.

## Current State

Completed:

- Created new Google Sheet: `IROUP_DATABASE_V2`
- Ran `IROUP Database V2.2 Final Freeze Generator`
- Added schema builder: `Team IROUP/backend/database-v2/IROUP_DATABASE_V2_BUILDER.gs`
- Applied V2.2 Schema Fix Pass 1
- Created isolated V2 backend foundation:
  - `Team IROUP/backend/database-v2/IROUP_V2_CONFIG.gs`
  - `Team IROUP/backend/database-v2/IROUP_V2_DB.gs`
- Added V2 validation, seed sample data, admin auth guard, admin DTO APIs, public-safe DTO APIs, backend test runner, and root workspace auth gate.
- Added `Team IROUP/backend/database-v2/IROUP_V2_REPAIR.gs`.
- Ran `repairV22Headers()` successfully for `FILE_ROLE_MASTER`, `PUBLIC_CACHE`, and `TRAVEL_PARTICIPANT`.
- Reran `seedV2SampleData()` and seed diagnostics reported `failed=0`.

Important context:

- V1 data is mostly test data and does not need strict preservation.
- The project is no longer prioritizing V1 frontend patching.
- V2 backend and DTO contracts should stabilize before frontend migration.
- Backend foundation is validated.
- V2 Router/API endpoint layer has been created and smoke-tested.
- V2 API contract documentation has started in `V2-API-CONTRACT.md`.

## Current Blocker: Seed Physical Write Position

Resolved. This section is retained as implementation history.

Schema repair and seed validation had succeeded, but physical sheet inspection showed seed records were not consistently written into row 2 / the first true data row.

Evidence from `debugV2SheetRows()`:

- `ADMIN` `lastRow=1001` and row 2 contains real data.
- `COUNTRY_MASTER` `lastRow=1005` but row 2 is blank.
- `FILE_ROLE_MASTER` `lastRow=1015` but row 2 is blank.
- `MOU` `lastRow=1004` but row 2 is blank.
- `PUBLIC_CACHE` row 2 contains real data because it does not have the same large preformatted blank region problem.

Current status:

- Schema repair: success.
- Seed validation: success.
- Physical seed persistence position: fixed.
- Physical sheet writes: validated.
- Router/API endpoint layer: ready to begin.

Root cause hypothesis:

The seed writer used `appendRow()` / `getLastRow()+1` behavior. Google Sheets can count preformatted/validated checkbox rows as used rows, causing test data to land after the preformatted region around row 1000+.

Fix completed:

- `appendV2Row_()` no longer uses `appendRow()`.
- `appendV2Row_()` no longer uses `getLastRow()+1`.
- Added `findFirstEmptyRowByKey_(sheet, keyColumnIndex)`.
- Seed writes now locate the first truly empty key row, usually column A.
- Existing validations, checkbox formatting, formatting, and frozen headers are preserved.
- Fallback inserts a row only if all key rows are occupied.

Verification completed:

1. `cleanupV2SampleData()`
2. `seedV2SampleData()`
3. `debugV2SheetRows()`

Confirmed row 2 contains actual seed data for `COUNTRY_MASTER`, `FILE_ROLE_MASTER`, `MOU`, `MOBILITY_PROJECT`, `TRAVEL`, `TRAVEL_PARTICIPANT`, and `PUBLIC_CACHE`.

**Backend foundation validated. V2 Router/API endpoint layer created and ready for contract review.**

## Current Phase: V2 Router/API Contract Review

The V2 router foundation now exists, but frontend migration should not begin until the API contract is reviewed and stabilized.

Current router contract document:

```text
Team IROUP/backend/database-v2/V2-API-CONTRACT.md
```

Documented actions:

- `v2.health`
- `v2.schema`
- `v2.admin.mou.list`
- `v2.admin.mobility.list`
- `v2.admin.travel.list`
- `v2.admin.scholarship.list`
- `v2.admin.event.list`
- `v2.public.mou.list`
- `v2.public.mobility.summary`
- `v2.public.travel.summary`
- `v2.public.scholarship.list`
- `v2.public.event.list`

Contract review notes:

- Admin routes are protected by `requireV2Admin_()`.
- Public routes must return DTOs or aggregate summaries only.
- `v2.admin.travel.list` and `v2.public.travel.summary` currently use router-local helpers and should be replaced with finalized Travel DTO helpers before frontend migration depends on them.
- `v2.schema` is useful during testing but should be reviewed before public deployment.

Next gate:

- Stabilize the V2 API contract before frontend migration, production `Code.gs` wiring, or deployment.

## Frontend V2 API Audit

Created:

```text
Team IROUP/backend/database-v2/FRONTEND-V2-MIGRATION-PLAN.md
```

Audit conclusion:

- Current frontend still depends on V1 `iroup-config.js` and old production Apps Script actions.
- Do not replace `IROUP.SCRIPT_URL` globally.
- Add a separate V2 API client adapter before page migration.
- Frontend migration should start with low-risk public pages only after V2 deployment/client wiring is approved.
- Admin migration requires read/detail/write route contracts, not only list endpoints.

Key route gaps before frontend migration:

- `v2.public.stats`
- `v2.public.map`
- `v2.public.mobility.list`
- `v2.public.travel.list`
- `v2.admin.dashboard.summary`
- `v2.admin.report.summary`
- admin detail/create/update/delete routes per module
- person/country/unit lookup routes
- V2 file upload/relation routes
- V2 budget relation routes

## V2 Frontend API Adapter

Created:

```text
Team IROUP/iroup-v2-api.js
Team IROUP/backend/database-v2/V2-FRONTEND-ADAPTER.md
```

Purpose:

- Keep V1 `iroup-config.js` and V2 `iroup-v2-api.js` side by side.
- Avoid global replacement of `IROUP.SCRIPT_URL`.
- Standardize V2 router response handling before page migration.
- Centralize admin token lookup for future V2 admin routes.

Current rule:

- `public-scholar.html`, `public-events.html`, `public-mou.html`, and `public-mobility.html` are approved Public Migration Wave 1 pages using `iroup-v2-api.js`.
- Do not load `iroup-v2-api.js` into additional pages until each page migration is reviewed.
- Configure V2 endpoint explicitly during testing; the adapter intentionally has no hardcoded deployment URL.

## V2 Deployment Preparation

Created:

```text
Team IROUP/backend/database-v2/IROUP_V2_ENTRYPOINT.gs
Team IROUP/backend/database-v2/V2-DEPLOYMENT-PREP.md
```

Deployment direction:

- Use a separate V2 Apps Script deployment URL.
- Do not replace `IROUP.SCRIPT_URL`.
- Do not wire V2 routes into production `backend/Code.gs` during the pilot.
- Keep V1 and V2 deployments independently reversible.

V2 runtime files required for the future deployment:

- `IROUP_V2_ENTRYPOINT.gs`
- `IROUP_V2_CONFIG.gs`
- `IROUP_V2_DB.gs`
- `IROUP_V2_VALIDATION.gs`
- `IROUP_V2_AUTH.gs`
- `IROUP_V2_ROUTER.gs`
- `IROUP_V2_ADMIN_API.gs`
- `IROUP_V2_PUBLIC_API.gs`
- `IROUP_V2_DTO_AGGREGATE.gs`
- `IROUP_V2_DTO_LOOKUP.gs`
- `IROUP_V2_DTO_TRAVEL.gs`

V2 entrypoint status:

- `doGet(e)` and `doPost(e)` now exist in the V2-only entrypoint file.
- Both entrypoints route through `routeV2Request_(e)`.
- JSON output is returned through `ContentService.MimeType.JSON`.
- Production V1 `backend/Code.gs` remains untouched.

Remaining deployment gates:

- Confirm whether the V2 Apps Script project is bound to `IROUP_DATABASE_V2` or needs `IROUP_V2_SPREADSHEET_ID` set explicitly.
- Test `Session.getActiveUser().getEmail()` behavior under the exact web-app deployment access settings.
- Review whether `v2.schema` should remain public.
- Smoke-test public-safe file DTO filtering with representative public/private files.

## V2 Deployment Smoke-Test Plan

Created:

```text
Team IROUP/backend/database-v2/V2-SMOKE-TEST-PLAN.md
```

Smoke-test direction:

- Test the V2 deployment directly before any frontend page receives the live V2 URL.
- Use `v2.health` as the first public liveness check.
- Use `v2.schema` only as a controlled diagnostic until its public exposure is reviewed.
- Test public DTO routes before admin routes.
- Test admin auth failure before admin auth success.
- Activate the frontend V2 URL on one page only after direct endpoint tests pass.

Safest first frontend page:

```text
Team IROUP/public/public-scholar.html
```

Reason:

- It uses one public V2 list route.
- It has no map/chart dependency.
- It has no mobility/travel coupling.
- It has contained card/filter rendering.

Fallback rule:

- Do not add automatic V1 public fallback to migrated pages.
- Public page rollback should happen by removing or blanking the V2 endpoint config, not by silently reintroducing `IROUP.getPublic*` reads.
- `dashboard.html` remains the exception because its current V1 render architecture intentionally stays active while the V2 readiness chip is tested.

Critical deployment setting risk:

- Current admin auth uses `Session.getActiveUser().getEmail()`.
- A public web-app deployment may not provide a reliable end-user email.
- An execute-as-owner deployment could make admin routes unsafe if the owner email is treated as active for every request.
- If one deployment cannot safely support both public pages and admin auth, split public and admin deployment strategies before dashboard/admin activation.

## V2 First Deployment Dry Run Checklist

Created:

```text
Team IROUP/backend/database-v2/V2-FIRST-DEPLOYMENT-CHECKLIST.md
```

Purpose:

- Convert the smoke-test strategy into exact manual steps for the first isolated V2 Apps Script deployment.
- Keep the first deployment execution separate from frontend endpoint activation.
- Preserve V1 rollback by leaving `IROUP.SCRIPT_URL` and production `backend/Code.gs` untouched.

Checklist gates:

- Copy only required V2 runtime files into the separate Apps Script project.
- Decide bound spreadsheet vs standalone `IROUP_V2_SPREADSHEET_ID` explicitly.
- Confirm `ADMIN` sheet test accounts before admin smoke testing.
- Run editor-level checks before creating a web deployment.
- Test only `v2.health`, `v2.schema`, and `v2.public.scholarship.list` first.
- Run admin expected-fail tests before admin expected-success tests.
- Do not activate frontend V2 URL during the dry run.
- Roll back by disabling/removing only the V2 deployment or future endpoint config.

## V2 Deployment Readiness Review

Created:

```text
Team IROUP/backend/database-v2/V2-DEPLOYMENT-READINESS-REVIEW.md
```

Final readiness decision:

- GO for first isolated V2 backend deployment only, after manual checklist confirmation.
- NO-GO for frontend V2 URL activation during the deployment step.
- NO-GO for admin/dashboard V2 activation until admin auth behavior is proven under the exact Apps Script deployment settings.

Readiness findings:

- Required V2 runtime files are present.
- `IROUP_V2_ENTRYPOINT.gs` defines `doGet(e)` and `doPost(e)`.
- `IROUP_V2_ROUTER.gs` defines `routeV2Request_(e)`.
- Admin routes are structurally guarded by `requireV2Admin_()`.
- V2 remains isolated from production `backend/Code.gs`.
- `IROUP.SCRIPT_URL` remains unchanged as the V1 lane.

Remaining gates:

- Prove the deployment opens `IROUP_DATABASE_V2`, not the V1 production spreadsheet.
- Prove public DTO privacy against live representative rows.
- Prove `v2.admin.dashboard.summary` fails for unauthorized users.
- Prove `v2.admin.dashboard.summary` succeeds only for an active V2 admin.
- Keep `v2.schema` as controlled diagnostic until public exposure is reviewed.

Recommended activation order after direct endpoint success:

1. Public-only V2 activation.
2. Start with `public/public-scholar.html`.
3. Expand public pages one at a time.
4. Keep dashboard/admin readiness-only until admin auth is stable.

## First Isolated V2 Backend Deployment Execution Guide

Created:

```text
Team IROUP/backend/database-v2/V2-FIRST-LIVE-DEPLOYMENT.md
```

Purpose:

- Provide the exact manual procedure for creating the first isolated V2 Apps Script web app.
- Keep deployment execution limited to backend direct endpoint smoke testing.
- Keep frontend endpoint activation, dashboard/admin activation, and V1 changes out of this phase.

Execution guide includes:

- Apps Script creation steps.
- File copy/import order.
- Required V2 config values.
- Bound spreadsheet and standalone deployment paths.
- Deployment settings and execute/access recommendations.
- How to obtain the `/exec` V2 deployment URL.
- Temporary test URLs for:
  - `v2.health`
  - `v2.schema`
  - `v2.public.scholarship.list`
  - `v2.admin.dashboard.summary`
- Expected JSON response shapes.
- Admin auth expected-fail and expected-success checks.
- Rollback procedure.
- Post-deployment verification checklist.

Still blocked from this phase:

- Replacing `IROUP.SCRIPT_URL`.
- Activating frontend pages.
- Wiring dashboard/admin.
- Broadly exposing `v2.schema`.
- Runtime code changes.

## First Isolated V2 Backend Smoke Test Results

Status:

- Live isolated V2 backend deployment: successful.
- No frontend URL activation yet.
- No V1 replacement.
- Production `backend/Code.gs` remains untouched.

Live route results:

- `v2.health`: passed.
- `v2.schema`: initially failed, then passed after schema wrapper fix.
- `v2.public.scholarship.list`: passed.
- `v2.admin.dashboard.summary`: reachable.
- `v2.admin.dashboard.summary`: initially had inflated counts, then passed after aggregate primary-key filtering fix.

Live fixes confirmed:

- `getV2SchemaSummary_()` now unwraps `getV2Sheet_(name).data` and verifies a real Sheet-like object before calling `getV2Headers_()`.
- Dashboard/report aggregate counts now ignore preformatted blank rows by requiring non-empty primary keys:
  - `mou_id`
  - `mobility_id`
  - `travel_id`
  - `scholarship_id`
  - `event_id`
- Aggregate logic excludes `is_deleted=true` rows.
- Participant totals now sum only from valid parent records, preventing blank parent/participant row joins from inflating totals.

Next gate:

- Frontend endpoint activation should be a separate reviewed pass.
- Start with `public/public-scholar.html` only.
- Do not activate dashboard/admin frontend yet.
- Keep `v2.schema` as controlled diagnostic until public exposure is reviewed.

## Public Frontend V2 Endpoint Activation Pilot

Status:

- `public/public-scholar.html` is the first page wired to the V2 endpoint config.
- `public/public-events.html` is the second page wired to the V2 endpoint config.
- `public/public-mou.html` is the third page wired to the V2 endpoint config.
- `public/public-mobility.html` is the fourth page wired to the V2 endpoint config.
- `dashboard.html` has a V2 admin-safe read-only aggregate bridge for `IROUP_V2.admin.dashboardSummary()`.
- Dashboard rendering remains V1-backed through `IROUP.getReport(year)`.
- Admin CRUD/write/upload flows remain non-activated for V2 frontend use.
- V1 `IROUP.SCRIPT_URL` remains unchanged.

Created:

```text
Team IROUP/iroup-v2-endpoint.js
```

Activated only in:

```text
Team IROUP/public/public-scholar.html
Team IROUP/public/public-events.html
Team IROUP/public/public-mou.html
Team IROUP/public/public-mobility.html
Team IROUP/dashboard.html
```

Public page script load order:

```html
<script src="../iroup-config.js"></script>
<script src="../iroup-v2-endpoint.js"></script>
<script src="../iroup-v2-api.js"></script>
```

Dashboard read-only bridge load order:

```html
<script src="iroup-config.js"></script>
<script src="iroup-v2-endpoint.js"></script>
<script src="iroup-v2-api.js"></script>
```

Runtime note:

- `iroup-v2-endpoint.js` contains the live isolated V2 `/exec` URL.
- Dashboard uses it only for read-only aggregate summary readiness.
- Do not use it for admin CRUD, upload, edit/delete, write actions, or admin forms until each area receives its own reviewed activation pass.
- Local browser smoke currently reports the expected admin-auth caveat for V2 admin routes: `No active Apps Script user email available`. V1 dashboard rendering continues.
- Dashboard now performs a frontend-only V1 session preflight before the V2 summary sidecar. It reads `sessionStorage.iroup_user` / `sessionStorage.iroup_admin_token`, logs no token values, and keeps backend authorization with `requireV2Admin_()`.
- V2 backend auth now supports controlled admin-token authentication for read-only admin routes:
  - hashed token map script property: `IROUP_V2_ADMIN_TOKEN_MAP_JSON`
  - signed V2 admin token secret: `IROUP_V2_ADMIN_TOKEN_SECRET`
  - Google access/ID token verification
- Any token-derived email is still matched against the V2 `ADMIN` sheet and requires `active = TRUE`.
- The legacy V1 opaque UUID admin token cannot be decoded by the isolated V2 deployment unless its SHA-256 hash is mapped to an email in `IROUP_V2_ADMIN_TOKEN_MAP_JSON`.

Verification focus:

- V2 scholarship DTO render.
- Poster/file mapping.
- Status badges.
- Search/filter behavior.
- No primary scholarship load through `IROUP.getPublicScholarships()`.
- V2 event DTO render.
- Event poster/file URLs.
- Event status/date badges.
- Calendar render, date selection, type filter, and KPI rendering.
- No primary event load through `IROUP.getPublicEvents()`.
- V2 MOU DTO render.
- MOU KPI, table, chart, D3 map, local country aggregation, filters/search, and language behavior.
- No primary MOU load through `IROUP.getPublicMou()`.
- V2 public mobility/travel DTO render.
- Mobility KPI, cards, timeline, charts, D3 map, country filters, TH/EN controls, and layout.
- No private participant identity, contact, budget, internal notes, passport, or admin fields in rendered DOM.
- No primary mobility/travel load through `IROUP.getPublicMobility()` or `IROUP.getPublicTravel()`.
- Dashboard V2 aggregate bridge reaches `IROUP_V2.admin.dashboardSummary()` without replacing `IROUP.getReport(year)`.
- V2 summary failures remain graceful and V1 dashboard rendering continues.
- No dashboard CRUD/write/upload routes are modified or activated.

## Public Pilot Migration

Pilot pages:

```text
Team IROUP/public/public-scholar.html
Team IROUP/public/public-events.html
Team IROUP/public/public-mou.html
Team IROUP/public/public-mobility.html
```

Pilot scope:

- Primary public scholarship data-loading flow only.
- Primary public events data-loading flow only.
- Primary public MOU list data-loading flow only.
- Primary public mobility/travel list data-loading flows only.
- Existing UI/rendering/filter behavior preserved.
- V2 DTO fields adapted locally to the old render shape.
- Public MOU map aggregation remains page-local from list rows; `v2.public.mou.map` is not adopted yet.
- Public mobility/travel stats, charts, and map remain page-local from list rows; `v2.public.mobility.summary`, `v2.public.travel.summary`, and `v2.public.mobility.map` are not adopted yet.

Pilot blocker:

- Live data verification requires a configured/deployed V2 endpoint URL.

Next rule:

- Review the public scholarship, events, MOU list, and mobility/travel list pilots before migrating another public page or any admin page.

Verification pass:

- Public Migration Wave 1 source-pattern verification was completed on 2026-05-11.
- Verification record: `Team IROUP/backend/database-v2/PUBLIC-MIGRATION-VERIFICATION.md`.
- The four migrated public pages use `IROUP_V2.public.*` for primary public data loads.
- No remaining `IROUP.getPublic*`, direct `SCRIPT_URL`, or `action=getPublic*` bypass was found in the migrated public pages.
- Remaining V1 dependencies are utility-only status/date helpers from `iroup-config.js`.
- Before admin/dashboard migration, resolve or consciously accept the documented public cleanup items: continent helper parity, utility-helper ownership, public normalization helper duplication, local hosting script-path behavior, and live V2 endpoint visual smoke testing.

Admin/dashboard audit:

- Admin/Dashboard Migration Audit was completed on 2026-05-11.
- Audit record: `Team IROUP/backend/database-v2/ADMIN-MIGRATION-AUDIT.md`.
- Recommended first admin-side migration is `dashboard.html` as a read-only summary proof, followed by `report.html` as a separate read/report proof.
- CRUD migration should wait until V2 create/update/delete contracts are designed and tested per module.
- Upload migration should wait until V2 file upload plus normalized `FILES` relation workflow is locked.
- `mou.html`, `events.html`, `travel.html`, and `mobility.html` should begin with read-list/detail-only coexistence; keep V1 writes/uploads during the transition.

Dashboard readiness pilot:

- `dashboard.html` now runs a sidecar V2 admin-read readiness check through `IROUP_V2.admin.dashboardSummary()`.
- The existing dashboard render remains V1-backed through `IROUP.getReport(year)`.
- V2 readiness data is stored separately in `state.v2Summary` and does not feed KPIs, rankings, budget, insights, filters, or attention tables yet.
- This pilot validates V2 admin route access/coexistence only; full dashboard migration still requires either richer dashboard/report DTOs or a deliberate multi-route admin list mapping pass.

Endpoint configuration plan:

- V2 Endpoint Configuration Plan was completed on 2026-05-11.
- Plan record: `Team IROUP/backend/database-v2/V2-ENDPOINT-CONFIG-PLAN.md`.
- Keep `IROUP.SCRIPT_URL` unchanged for V1.
- Use a separate V2 Apps Script deployment URL through `window.IROUP_V2_SCRIPT_URL` / `IROUP_V2.setScriptUrl(url)`.
- Future implementation should use a dedicated `iroup-v2-endpoint.js` file loaded only by migrated pages.
- Do not reuse the current V1 production deployment for V2 unless `v2.*` routing is explicitly wired into production `Code.gs` and reviewed.

## Architecture Direction

```text
Database-first
-> Backend V2-first
-> API DTO-first
-> Frontend migration later
```

Core stack:

```text
Google Sheets: IROUP_DATABASE_V2
-> Apps Script V2 Backend
-> Normalized Admin/Public DTO APIs
-> Frontend pages
```

Google Sheets is treated as a production-lite database, not just a spreadsheet.

## Data Architecture Source of Truth

For IROUP V2, the normalized database schema is the source of truth.

Priority order:

1. V2 schema
2. V2 backend/API
3. V2 admin form design
4. V2 frontend UI polish

Old V1 dashboard forms may be used as visual, UX, and workflow reference only. They are not architecture constraints, and the V2 backend should not preserve old flat form structures when those structures conflict with normalized data quality.

Reason: if admin forms collect data in the wrong structure, the system cannot produce accurate analytics, reporting, public DTOs, or reliable relational joins. Frontend polish must follow correct operational data design.

## Roadmap Phases

### Phase 0: Stop Frontend Patching

- Pause non-critical V1 frontend patching.
- Do not refactor frontend until V2 backend/DTOs are stable.
- Keep existing V1 pages usable, but avoid more architecture debt unless explicitly requested.
- Treat V1 forms as references only, not as write-contract requirements for V2.

### Phase 1: Create and Lock IROUP_DATABASE_V2 Schema

- Finalize normalized tabs, headers, validation lists, tab colors, and frozen headers.
- Keep schema naming consistent with `IROUP_V2_CONFIG.gs`.
- Relations should use stable IDs, not display names.
- Lock public/private boundary fields before any migration.

### Phase 2: Build Isolated V2 Apps Script Backend

- Continue adding new files under `Team IROUP/backend/database-v2/`.
- Do not touch production `Code.gs` unless explicitly approved.
- Build Apps Script-compatible helpers for normalized reads/writes.
- Add validation for foreign-key-like references and soft-delete behavior.
- Admin APIs can expose full operational data but must be designed for future auth.

### Phase 3: Build V2 Admin Test Interface / API Tester

- Create a safe internal tester for V2 APIs before connecting real frontend pages.
- Test add/edit/delete flows against normalized sheets.
- Verify relation integrity and soft-delete filtering.
- Test form payloads against V2 schema shape, not old flat dashboard payloads.
- Router/API endpoint foundation has been created.
- Router/API contract review is now the active gate before frontend migration.

### Phase 4: Seed or Migrate Test Data

- Seed clean sample data or migrate selected V1 test data.
- V1 preservation is optional, not a strict compatibility constraint.
- Confirm project/participant splitting for Mobility and Travel.
- Seed/sample writes now use the primary key / ID column to find the first truly empty data row.
- V2 seed writes do not use `appendRow()` or `getLastRow()+1`.
- Verification completed with `cleanupV2SampleData()`, `seedV2SampleData()`, and `debugV2SheetRows()`.
- Row 2 now contains real seed data for `COUNTRY_MASTER`, `FILE_ROLE_MASTER`, `MOU`, `MOBILITY_PROJECT`, `TRAVEL`, `TRAVEL_PARTICIPANT`, and other seeded tables.

### Phase 5: Build Normalized Public APIs

- Public endpoints must return DTOs, not raw sheet rows.
- Public APIs must sanitize private data at the backend layer.
- Mobility/Travel participant personal data must never be exposed publicly.
- `FILES` may expose URLs only when the parent record is `public_visible` and file `visibility_level` is `public`.
- Soft-deleted rows must be excluded from public aggregates.

### Phase 6: Refactor Frontend to Consume V2 DTOs

- Migrate frontend one module at a time after DTO contracts are stable.
- Frontend should consume normalized fields only.
- Frontend must not depend on raw sheet headers or hide private fields client-side.
- Redesign admin add/edit forms where needed so writes match the normalized V2 data model.
- Do not begin frontend migration until `V2-API-CONTRACT.md` is reviewed and Travel DTO TODOs are resolved or explicitly accepted.
- Use `FRONTEND-V2-MIGRATION-PLAN.md` as the migration map.
- Keep V1 and V2 API clients side by side during transition.
- Use `iroup-v2-api.js` as the V2 client boundary once a page migration is explicitly approved.
- Start with public read-only pilots before admin pages.

### Phase 7: Retire Old V1 API Gradually

- Keep V1 available until each module is verified on V2.
- Retire old endpoints only after admin/public workflows are confirmed.
- Document final cutover and rollback steps.

## Core Principles

- Do not modify production `Code.gs` without explicit approval.
- Do not migrate data until V2 schema and backend behavior are stable.
- Do not deploy V2 backend until public/private boundaries are verified.
- Public APIs must sanitize private data.
- Admin APIs should support future auth enforcement.
- Relations should use IDs, not display names.
- Soft-deleted rows must be excluded from aggregates.
- Backend should stay Apps Script compatible.
- Public API output should be stable DTOs, not raw sheet rows.

## Future Admin Form Migration Rules

- MOU forms should write to `MOU`, plus related `FILES` and `BUDGET` rows where applicable.
- Mobility forms should separate `MOBILITY_PROJECT` from `MOBILITY_PARTICIPANT`.
- Travel forms should separate `TRAVEL` from `TRAVEL_PARTICIPANT`.
- Scholarship and Event forms should support `public_visible`, files, links, dates, status, pin, and visibility fields.
- Files should always include role and `visibility_level`.
- Budgets should be relation rows in `BUDGET`, not embedded text fields.
- Person data should use `PERSON_STUDENT`, `PERSON_STAFF`, or `PERSON_MANUAL` references, with snapshots only where operational history needs them.

## Public Data Boundary Rules

Never expose publicly:

- student IDs
- staff IDs
- person IDs
- row-level names for Mobility/Travel participants
- row-level gender for Mobility/Travel participants
- budget amounts or internal budget source details
- internal notes
- non-public files
- creator/updater identity fields

Safe public outputs are aggregates and public display data only, such as country, continent, unit display name, institution/partner organization, title/project name, participant counts, public dates, derived status, and explicitly public file URLs.

## Current Migration Milestone - Controlled V2 Admin Bridge Ready

Date: 2026-05-11

Status: achieved for read-only dashboard summary sidecar.

Confirmed behavior:

- Isolated V2 backend deployment is operational.
- V2 public endpoints are operational.
- Public V2 frontend activation is operational for major public pages.
- V2 admin auth bridge is operational through request-aware `adminToken` handling.
- V2 dashboard summary bridge is operational and browser-verified.
- `dashboard.html` shows `V2 admin: ready`.
- V1 dashboard rendering remains powered by `IROUP.getReport(year)`.
- V2 dashboard summary remains sidecar-only through `IROUP_V2.admin.dashboardSummary()`.

Architecture constraints still active:

- Do not replace `IROUP.SCRIPT_URL`.
- Do not force production cutover.
- Do not migrate CRUD/write/upload yet.
- Keep admin module migration page-by-page and reversible.
- Keep V1 operational until each V2 read/write path is independently verified.

Known temporary bridge:

- Existing V1 opaque session `adminToken` can be accepted by V2 only through the SHA-256 token map script property.
- This is a coexistence bridge, not the desired long-term production auth model.
- Preferred future directions are signed V2 admin tokens or Google token verification handoff.

Next recommended phase:

1. Add a read-only `report.html` V2 summary bridge.
2. Validate report/analytics aggregate DTOs.
3. Pilot normalized DTO rendering for read-only admin views.
4. Defer CRUD/write/upload migration until read-only admin stability is proven.

## Controlled Read-Only Expansion - Report Summary Sidecar

Date: 2026-05-11

Status: implemented for `report.html` as a sidecar only.

Confirmed design:

- `report.html` keeps the V1 report pipeline active.
- V2 calls only `IROUP_V2.admin.reportSummary(fiscalYear)`.
- V2 summary data is stored separately in `v2ReportSummary`.
- V2 summary data does not drive current KPIs, charts, tables, filters, or exports.
- V2 failure is graceful and does not break V1 report rendering.

Preserved V1 functions:

- `getReportFast()`
- `getAllFallback()`
- `loadAll()`
- `makeRows()`
- `applyReport()`
- `exportRaw()`
- `exportFilteredCsv()`

Next validation:

- Browser-smoke `report.html`.
- Confirm V1 data and exports still work.
- Confirm `V2 report: ready` when the token bridge is valid.
- Keep CRUD/write/upload deferred.

## Controlled Read-Only Expansion - Travel List Sidecar

Date: 2026-05-11

Status: implemented for `travel.html` as a sidecar only.

Confirmed design:

- `travel.html` keeps the V1 travel render pipeline active.
- V1 reads still load travel, staff, and country rows through `IROUP.getAll(...)`.
- V2 calls only `IROUP_V2.admin.travelList()`.
- V2 list data is stored separately in `v2TravelList`.
- V2 list data does not drive current KPIs, filters, table rows, modal hydration, exports, staff selectors, or upload behavior.
- V2 failure is graceful and does not break V1 travel rendering.

Preserved V1 functions:

- `submitTravel()`
- `deleteTravel()`
- `quickAddStaff()`
- `uploadFileFromInput()`

Next validation:

- Browser-smoke `travel.html`.
- Confirm V1 table, KPIs, filters, add/edit/delete, and upload controls still work.
- Confirm `V2 travel: ready` when the token bridge is valid.
- Keep CRUD/write/upload deferred.

## V2 Write Isolation Architecture Plan

Date: 2026-05-11

Status: documented only.

Created:

```text
Team IROUP/backend/database-v2/V2-WRITE-ISOLATION-PLAN.md
```

Planning conclusions:

- V2 writes must be module-specific, not generic sheet writes.
- V1 `IROUP.add/edit/delete/uploadFile/uploadImage` must remain available during pilots.
- Upload migration should be deferred until metadata-only writes are proven.
- V2 write routes should require admin role authorization and audit fields.
- Page-level rollback must be available before every pilot.

Recommended first future write pilot:

```text
events.html
event metadata-only create/update
```

Pilot boundaries:

- no delete in the first pass
- no upload migration
- no scholarship write migration in the same pass
- no multi-page activation
- no `IROUP.SCRIPT_URL` replacement

Next gate before implementation:

- review V2 event create/update backend contract
- add isolated backend test routes only after approval
- add explicit adapter wrappers only after backend contract review
- keep all frontend write handlers V1-backed until the pilot is explicitly approved

## Event Metadata Write Dry-Run Contract

Date: 2026-05-11

Status: backend dry-run contract implemented.

Routes:

```text
v2.admin.event.validate
v2.admin.event.create.dryRun
v2.admin.event.update.dryRun
```

Design:

- admin-only through existing `requireV2Admin_()` router guard
- validates event metadata payload shape
- normalizes into the current `EVENT` sheet preview shape
- resolves country/unit IDs where possible from V2 lookup tables
- preserves display fallbacks as warnings when IDs cannot be resolved
- returns `dry_run: true` and `write_enabled: false`

Blocked in this phase:

- sheet writes
- real create/update
- delete
- upload/image/file relation handling
- frontend submit wiring
- public route changes
- V1 runtime changes

Next gate:

- live smoke the dry-run routes with a valid admin token
- review normalized preview shape against `events.html` event form fields
- only then consider adapter wrappers and a frontend validation sidecar

## Event Draft Frontend Validation-Only Pilot

Date: 2026-05-11

Status: implemented for `events.html` as a validation-only helper.

Design:

- loads the live V2 endpoint config and V2 adapter on `events.html`
- keeps the existing V1 `round9Save()` path unchanged
- adds `buildV2EventDraftPayload(formData)` for EVENT metadata mapping
- adds manual `previewV2EventDraft(payload)` dry-run preview
- adds a temporary modal footer button: `Preview V2 Draft`
- uses `IROUP_V2.request()` against `v2.admin.event.create.dryRun` or `v2.admin.event.update.dryRun`

Boundaries:

- no real V2 write
- no sheet mutation
- no upload/image/file relation handling
- no delete migration
- no public rendering changes
- no export changes
- no auto-triggered dry-run

Next gate:

- browser smoke the existing V1 add/edit/delete/upload behavior
- manually test `Preview V2 Draft` from the Event modal
- confirm returned `dry_run === true` and `write_enabled === false`
- only then consider adapter convenience wrappers

## V2 Admin Google Token Handoff Stabilization

Date: 2026-05-11

Status: implemented for coexistence auth stabilization.

Design:

- V1 login continues to create the existing V1 admin session.
- The Google OAuth access token from login is preserved in session storage for V2 admin verification.
- `IROUP.getGoogleAccessToken()` exposes the token to frontend adapters without changing V1 write helpers.
- `iroup-v2-api.js` sends `googleAccessToken` on V2 admin requests and keeps legacy `adminToken` as fallback.
- `IROUP_V2_AUTH.gs` verifies Google tokens first, extracts the verified email, and checks the V2 `ADMIN` sheet for active access.
- `IROUP_V2_ADMIN_TOKEN_MAP_JSON` remains as fallback only.

Expected recovery:

- dashboard V2 sidecar after fresh login
- report V2 sidecar after fresh login
- travel V2 sidecar after fresh login
- event draft dry-run preview after fresh login

Still deferred:

- V2 CRUD/write/upload migration
- token-map removal
- auth hard cutover
- V1 runtime replacement
- public endpoint changes

## Backend-Only Real V2 Event Metadata Write Pilot

Date: 2026-05-12

Status: backend route contract implemented, frontend activation deferred.

Routes:

```text
v2.admin.event.create
v2.admin.event.update
```

Design:

- uses the existing event metadata normalizer from the dry-run contract
- writes only to the V2 `EVENT` sheet
- creates V2 event IDs with the `EVT` prefix
- updates existing non-deleted EVENT rows by `event_id`
- appends `created_by`, `updated_by`, `created_at`, and `updated_at` from the verified V2 admin identity
- returns `dry_run: false`, `write_enabled: true`, the persisted EVENT row, and skipped relation-operation markers

Feature flag:

```text
IROUP_V2_EVENT_WRITE_ENABLED=TRUE
```

The real routes fail closed unless this Script Property is set in the isolated V2 Apps Script deployment.

Still deferred:

- frontend submit wiring
- upload/image/file relation handling
- delete
- `FILES` writes
- budget relation writes
- scholarship writes
- V1 runtime changes
- production cutover

## Event Metadata Real Write Pilot — Live Smoke Test

Date: 2026-05-12

Status: completed. Feature flag disabled. Results verified.

Routes tested live:

- v2.admin.dashboard.summary: passed — Google token auth end-to-end confirmed
- v2.admin.event.create: passed — EVT-20260512185836-15148654, row 5, draft, not public
- v2.admin.event.update: passed — status patched to cancelled, audit fields correct

Deployment state after this session:

- IROUP_V2_AUTH.gs, IROUP_V2_ROUTER.gs, and IROUP_V2_ADMIN_API.gs are now current in
  the live V2 Apps Script project.
- appsscript.json now explicitly declares https://www.googleapis.com/auth/script.external_request
  in oauthScopes. The scope was activated by saving the manifest and re-authorizing
  the deployment — not by redeploy alone.
- Google access token verification through fetchV2GoogleUserInfo_ is confirmed working
  in the live deployment.

Key behavioral finding:

- v2.admin.event.update validates the normalized payload as a complete event shape. It does
  not load and merge the existing row before validation. This is acceptable for the backend
  isolation pilot. The frontend adapter must hydrate the existing row before update
  submission.

Actor confirmation:

- All write routes confirmed actor role: superadmin through Google token verified admin
  mapping. Role authorization was enforced correctly and not bypassed.

Feature flag:

- IROUP_V2_EVENT_WRITE_ENABLED is now FALSE.
- Set to TRUE in Script Properties to re-enable when frontend activation is approved.

Next gate:

- Frontend event write submit wiring requires: rollback checklist confirmation, V1 event
  flow smoke test, and update payload hydration pattern documented in the frontend adapter.

## Event Metadata Real Write Pilot — Live Smoke Test

Date: 2026-05-12

Status: completed. Feature flag disabled. Results verified.

Routes tested live:

- v2.admin.dashboard.summary: passed — Google token auth end-to-end confirmed
- v2.admin.event.create: passed — EVT-20260512185836-15148654, row 5, draft, not public
- v2.admin.event.update: passed — status patched to cancelled, audit fields correct

Deployment state after this session:

- IROUP_V2_AUTH.gs, IROUP_V2_ROUTER.gs, and IROUP_V2_ADMIN_API.gs are now current in
  the live V2 Apps Script project.
- appsscript.json now explicitly declares https://www.googleapis.com/auth/script.external_request
  in oauthScopes. The scope was activated by saving the manifest and re-authorizing
  the deployment — not by redeploy alone.
- Google access token verification through fetchV2GoogleUserInfo_ is confirmed working
  in the live deployment.

Key behavioral finding:

- v2.admin.event.update validates the normalized payload as a complete event shape. It does
  not load and merge the existing row before validation. This is acceptable for the backend
  isolation pilot. The frontend adapter must hydrate the existing row before update
  submission.

Actor confirmation:

- All write routes confirmed actor role: superadmin through Google token verified admin
  mapping. Role authorization was enforced correctly and not bypassed.

Feature flag:

- IROUP_V2_EVENT_WRITE_ENABLED is now FALSE.
- Set to TRUE in Script Properties to re-enable when frontend activation is approved.

Next gate:

- Frontend event write submit wiring requires: rollback checklist confirmation, V1 event
  flow smoke test, and update payload hydration pattern documented in the frontend adapter.
