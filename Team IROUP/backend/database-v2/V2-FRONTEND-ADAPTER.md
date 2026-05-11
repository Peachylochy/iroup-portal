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
```

`public-scholar.html` now loads `iroup-v2-api.js` and uses `IROUP_V2.public.scholarshipList()` for its primary public data flow. The adapter still has no hardcoded deployment URL, so live data requires explicit V2 endpoint configuration.

`public-events.html` now loads `iroup-v2-api.js` and uses `IROUP_V2.public.eventList()` for its primary public data flow. It keeps existing calendar, status, filter, poster, file, and KPI behavior by mapping V2 DTO fields into the page-local render shape.

`public-mou.html` now loads `iroup-v2-api.js` and uses `IROUP_V2.public.mouList()` for its primary public list data flow. It keeps existing KPI, table, chart, filter/search, D3 map rendering, and local country aggregation behavior by mapping V2 DTO fields into the page-local render shape. It does not use `IROUP_V2.public.mouMap()` yet.

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

- `public-scholar.html` completed steps 1, 3, and 4.
- `public-events.html` completed steps 1, 3, and 4.
- `public-mou.html` completed steps 1, 3, and 4 for list data only.
- Step 2 is blocked until a V2 deployment URL is available.
- Step 5 requires live V2 endpoint verification.

Do not migrate admin writes until V2 write routes and normalized form contracts exist.
