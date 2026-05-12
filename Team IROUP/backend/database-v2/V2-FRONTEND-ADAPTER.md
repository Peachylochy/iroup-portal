# V2 Frontend API Adapter

Infrastructure-only pass for gradual V2 frontend migration.

Created:

```text
Team IROUP/iroup-v2-api.js
```

## Purpose

The V2 adapter creates a safe frontend-side API boundary without replacing the existing V1 `iroup-config.js` helpers.

Current coexistence model:

```text
Current pages -> iroup-config.js -> V1 production Apps Script
Future migrated pages -> iroup-v2-api.js -> V2 router Apps Script
```

Current pilot pages:

```text
Team IROUP/public/public-scholar.html
Team IROUP/public/public-events.html
Team IROUP/public/public-mou.html
Team IROUP/public/public-mobility.html
Team IROUP/dashboard.html
```

`public-scholar.html` now loads `iroup-v2-endpoint.js` before `iroup-v2-api.js` and uses `IROUP_V2.public.scholarshipList()` for its primary public data flow. It is the first single-page V2 endpoint activation pilot.

`public-events.html` now loads `iroup-v2-endpoint.js` before `iroup-v2-api.js` and uses `IROUP_V2.public.eventList()` for its primary public data flow. It is the second single-page V2 endpoint activation pilot and keeps existing calendar, status, filter, poster, file, and KPI behavior by mapping V2 DTO fields into the page-local render shape.

`public-mou.html` now loads `iroup-v2-endpoint.js` before `iroup-v2-api.js` and uses `IROUP_V2.public.mouList()` for its primary public list data flow. It is the third single-page V2 endpoint activation pilot and keeps existing KPI, table, chart, filter/search, D3 map rendering, language behavior, and local country aggregation behavior by mapping V2 DTO fields into the page-local render shape. It does not use `IROUP_V2.public.mouMap()` yet.

`public-mobility.html` now loads `iroup-v2-endpoint.js` before `iroup-v2-api.js` and uses `IROUP_V2.public.mobilityList()` plus `IROUP_V2.public.travelList()` for its primary public list data flow. It is the fourth single-page V2 endpoint activation pilot and keeps existing KPI, charts, D3 map rendering, top countries, filters/search, detail modal, timeline behavior, TH/EN controls, and layout by mapping V2 DTO fields into the page-local render shape. It does not use public summary or map aggregate helpers yet.

`dashboard.html` now loads `iroup-v2-endpoint.js` before `iroup-v2-api.js` for an admin-safe read-only aggregate bridge only. It calls `IROUP_V2.admin.dashboardSummary()` as a sidecar check, stores the result in `state.v2Summary`, and leaves the existing V1 `IROUP.getReport(year)` dashboard rendering path unchanged. CRUD, upload, edit/delete, admin forms, and auth/session logic remain V1-backed and untouched.

Current dashboard bridge caveat: local browser smoke can reach the live V2 admin route, but Apps Script may return `No active Apps Script user email available` outside the expected signed-in execution context. This failure is handled as a readiness failure and does not block V1 dashboard rendering.

Dashboard frontend handoff: `dashboard.html` now checks the existing V1 session metadata before attempting the read-only V2 summary sidecar. It uses `sessionStorage.iroup_user` and `sessionStorage.iroup_admin_token` only to decide whether the bridge should run and to emit non-secret diagnostics. It does not create a V2 session, does not expose token values, and does not bypass backend `requireV2Admin_()`.

## Safety Rules

- Do not replace `IROUP.SCRIPT_URL` globally.
- Do not remove V1 helpers.
- Do not load the V2 adapter into pages until a specific migration phase.
- Keep V1 and V2 clients side by side during transition.
- Configure the V2 endpoint explicitly with `IROUP_V2.setScriptUrl(url)` or `window.IROUP_V2_SCRIPT_URL`.

## Configuration

The adapter intentionally ships with no hardcoded deployed V2 URL:

```javascript
IROUP_V2.setScriptUrl('https://script.google.com/macros/s/.../exec');
```

The dedicated endpoint config file is:

```text
Team IROUP/iroup-v2-endpoint.js
```

Current endpoint activation load order for `public/public-scholar.html`, `public/public-events.html`, `public/public-mou.html`, and `public/public-mobility.html`:

```html
<script src="../iroup-config.js"></script>
<script src="../iroup-v2-endpoint.js"></script>
<script src="../iroup-v2-api.js"></script>
```

`iroup-v2-endpoint.js` contains the live isolated V2 `/exec` URL. Keep it loaded only by reviewed pilot pages until the rollout advances.

Dashboard uses the root-relative load order because it is not under `/public/`:

```html
<script src="iroup-config.js"></script>
<script src="iroup-v2-endpoint.js"></script>
<script src="iroup-v2-api.js"></script>
```

If no V2 URL is configured, calls return a normalized client error:

```javascript
{
  success: false,
  data: null,
  error: "IROUP_V2 SCRIPT_URL is not configured.",
  meta: {
    action: "...",
    api_version: "2.2",
    timestamp: "..."
  }
}
```

## Response Handling

Every adapter call returns the standard V2 response:

```javascript
{
  success: boolean,
  data: any,
  error: string,
  meta: {
    action: string,
    api_version: "2.2",
    timestamp: string,
    total?: number
  }
}
```

Frontend pages should check `success` and read `data`.

## Auth Token Handling

The adapter centralizes admin token lookup from:

- `sessionStorage.workspace_admin_token`
- `sessionStorage.iroup_admin_token`
- `sessionStorage.workspace_user.adminToken`
- `sessionStorage.iroup_user.adminToken`

For admin routes, the adapter attaches `adminToken` as a request parameter when available.

Current caveat:

- V2 Apps Script admin auth now tries verifiable `adminToken` authentication before `Session.getActiveUser()` fallback.
- Supported backend token verification paths are hashed token map, signed V2 admin token, and Google access/ID token verification.
- Existing opaque V1 UUID admin tokens are not self-describing. The isolated V2 deployment can use them only if their SHA-256 hash is mapped to an admin email in `IROUP_V2_ADMIN_TOKEN_MAP_JSON`.
- Any token-derived email is still checked against the V2 `ADMIN` sheet and requires `active = TRUE`.

## Helper Groups

### `IROUP_V2.public.*`

- `stats()`
- `mouList()`
- `mouMap()`
- `mobilityList()`
- `mobilityMap()`
- `mobilitySummary()`
- `travelList()`
- `travelSummary()`
- `scholarshipList()`
- `eventList()`

### `IROUP_V2.admin.*`

- `mouList(params)`
- `mouDetail(mouId)`
- `mobilityList(params)`
- `mobilityDetail(mobilityId)`
- `travelList(params)`
- `travelDetail(travelId)`
- `scholarshipList(params)`
- `scholarshipDetail(scholarshipId)`
- `eventList(params)`
- `eventDetail(eventId)`
- `eventValidate(payload)`
- `eventCreateDryRun(payload)`
- `eventUpdateDryRun(payload)`
- `eventCreate(payload)`
- `eventUpdate(payload)`
- `dashboardSummary()`
- `reportSummary(fiscalYear)`

Event write wrapper notes:

- The event validation, dry-run, and real create/update wrappers post `{ payload }` to the explicit V2 admin event routes with admin auth.
- `eventCreate(payload)` and `eventUpdate(payload)` are adapter surface only at this stage. They are not wired to any frontend save button.
- `eventUpdate(payload)` callers must hydrate the full required event payload before calling the wrapper. The backend update route validates the incoming payload as a complete event shape and does not merge with the existing row first.

`scholarship-events.html` hydration groundwork:

- The page now exposes isolated EVENT metadata helpers for console/manual dry-run preparation only: `buildV2EventDraftPayload()`, `buildHydratedV2EventUpdatePayload()`, and `buildV2EventDryRunPayload()`.
- Update hydration merges the existing event row with the current form payload, with form values taking precedence, before calling `IROUP_V2.admin.eventUpdateDryRun()`.
- The production save path remains `round9Save()` through V1 `IROUP.add()` / `IROUP.edit()`. Real V2 `eventCreate()` / `eventUpdate()` wrappers remain unused by the UI.

### `IROUP_V2.lookup.*`

- `countries()`
- `units()`
- `fileRoles()`
- `budgetTypes()`

### Top-level diagnostics

- `IROUP_V2.health()`
- `IROUP_V2.schema()`
- `IROUP_V2.request(action, params, options)`

## Migration Use

Recommended pilot pattern:

1. Load `iroup-v2-api.js` on one low-risk public page.
2. Configure a V2 deployment URL for test only.
3. Replace one public helper call with a V2 adapter call.
4. Keep the page-local adapter from V2 DTO fields to existing render fields.
5. Verify no private fields are exposed.

Pilot status:

- `public-scholar.html` completed steps 1, 2, 3, and 4 for the single-page endpoint activation pilot.
- `public-events.html` completed steps 1, 2, 3, and 4 for the second single-page endpoint activation pilot.
- `public-mou.html` completed steps 1, 2, 3, and 4 for the third single-page endpoint activation pilot.
- `public-mobility.html` completed steps 1, 2, 3, and 4 for the fourth single-page endpoint activation pilot.
- `dashboard.html` completed step 2 for the admin-safe read-only aggregate bridge using `IROUP_V2.admin.dashboardSummary()` without migrating dashboard rendering.
- Step 2 remains inactive for admin CRUD/write/upload pages and flows.
- Step 5 browser verification remains required page by page after each endpoint activation.

Do not migrate admin writes until V2 write routes and normalized form contracts exist.

## Dashboard Admin Bridge Stabilization

Date: 2026-05-11

`dashboard.html` now has a browser-verified read-only V2 admin summary bridge.

Confirmed live behavior:

- `dashboard.html` loads the live V2 endpoint config and V2 adapter.
- The V2 adapter attaches the existing V1 session `adminToken` to `v2.admin.*` requests.
- `IROUP_V2.admin.dashboardSummary()` resolves successfully.
- The dashboard readiness badge shows `V2 admin: ready`.
- The dashboard still renders from V1 `IROUP.getReport(year)`.
- V2 summary data remains stored separately in `state.v2Summary`.

Fetch handling notes:

- Apps Script `/exec` returns an initial 302 redirect in normal operation.
- The adapter keeps browser-safe Apps Script fetch defaults:
  - `mode: cors`
  - `redirect: follow`
  - `credentials: omit`
  - `cache: no-store`
  - `referrerPolicy: no-referrer`
- Admin read-only summary calls use a longer timeout than public page reads.
- Abort errors are normalized into a clear V2 client error.

Auth bridge notes:

- Current V1 `adminToken` is opaque and session-scoped.
- The isolated V2 backend accepts it only when the token SHA-256 hash is mapped to an active admin email through `IROUP_V2_ADMIN_TOKEN_MAP_JSON`.
- The token-map approach is temporary.
- Future production direction should prefer signed V2 admin tokens or Google token verification handoff.

Still not migrated:

- dashboard rendering data source
- admin CRUD/write/upload flows
- admin forms
- V1 runtime
- production cutover

## Report Read-Only Summary Sidecar

Date: 2026-05-11

`report.html` now has a controlled V2 read-only report summary sidecar.

Implementation pattern:

```html
<script src="iroup-config.js"></script>
<script src="iroup-v2-endpoint.js"></script>
<script src="iroup-v2-api.js"></script>
<script src="iroup-utils.js"></script>
```

Behavior:

- `report.html` calls `IROUP_V2.admin.reportSummary(fiscalYear)` only after the V1 report load/render path succeeds.
- The result is stored in page-local `v2ReportSummary`.
- The badge `#v2ReportReadiness` reports `V2 report: checking`, `V2 report: ready`, or `V2 report: unavailable`.
- V2 failure is caught locally and never throws into `loadAll()`.
- Existing report KPIs, tables, charts, filters, and exports remain V1-backed.

Still not migrated:

- `getReportFast()`
- `getAllFallback()`
- `loadAll()`
- `makeRows()`
- `applyReport()`
- `exportRaw()`
- `exportFilteredCsv()`
- admin CRUD/write/upload

## Travel Read-Only List Sidecar

Date: 2026-05-11

`travel.html` now has a controlled V2 read-only list sidecar.

Implementation pattern:

```html
<script src="iroup-config.js"></script>
<script src="iroup-v2-endpoint.js"></script>
<script src="iroup-v2-api.js"></script>
<script src="iroup-utils.js"></script>
```

Behavior:

- `travel.html` calls `IROUP_V2.admin.travelList()` only after the V1 travel load/render path succeeds.
- The result is stored in page-local `v2TravelList`.
- The badge `#v2TravelReadiness` reports `V2 travel: checking`, `V2 travel: ready`, or `V2 travel: unavailable`.
- V2 failure is caught locally and never throws into `loadAll()`.
- Existing travel KPIs, filters, table, modal hydration, exports, staff selector, and upload flow remain V1-backed.

Still not migrated:

- V1 travel render source
- `submitTravel()`
- `deleteTravel()`
- `quickAddStaff()`
- `uploadFileFromInput()`
- admin CRUD/write/upload
- staff/country lookup behavior
