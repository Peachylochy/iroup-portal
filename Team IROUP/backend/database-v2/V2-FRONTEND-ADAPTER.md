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

- V2 Apps Script admin auth currently uses `Session.getActiveUser()` through `requireV2Admin_()`.
- Token-based V2 auth/session behavior still needs a deployment/auth design pass.

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
- `dashboardSummary()`
- `reportSummary(fiscalYear)`

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
