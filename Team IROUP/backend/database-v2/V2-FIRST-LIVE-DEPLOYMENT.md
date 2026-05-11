# V2 First Live Deployment Execution Guide

Date: 2026-05-11

Purpose:

Exact manual procedure for the first isolated V2 Apps Script backend deployment and smoke test.

Decision boundary:

- GO for isolated V2 backend deployment only, after checklist confirmation.
- NO-GO for frontend V2 URL activation.
- NO-GO for dashboard/admin activation.
- NO-GO for production V1 changes.

Do not deploy automatically from this repository. This guide is for manual Apps Script execution only.

## Live Execution Result

Status: first isolated V2 backend deployment succeeded.

Confirmed live routes:

- `v2.health`: passed.
- `v2.schema`: initially failed, then passed after the router schema wrapper fix.
- `v2.public.scholarship.list`: passed.
- `v2.admin.dashboard.summary`: reachable.
- `v2.admin.dashboard.summary`: initially had inflated aggregate counts, then passed after aggregate primary-key filtering.

No frontend URL activation has happened yet. `IROUP.SCRIPT_URL` and the V1 production lane remain unchanged.

## 0. Hard Safety Rules

Do not:

- Replace `IROUP.SCRIPT_URL`.
- Put the V2 URL into `iroup-config.js`.
- Add or enable `iroup-v2-endpoint.js`.
- Add the V2 deployment URL to any HTML page.
- Wire dashboard to V2 data rendering.
- Migrate admin/report/CRUD/upload flows.
- Copy V2 entrypoints into the V1 Apps Script project.
- Copy V1 production `Code.gs` into the V2 Apps Script project.
- Expose `v2.schema` broadly.
- Push before review.

## 1. Required Source Files

Use files from:

```text
Team IROUP/backend/database-v2/
```

Required runtime copy order:

1. `IROUP_V2_CONFIG.gs`
2. `IROUP_V2_DB.gs`
3. `IROUP_V2_VALIDATION.gs`
4. `IROUP_V2_AUTH.gs`
5. `IROUP_V2_DTO_LOOKUP.gs`
6. `IROUP_V2_DTO_TRAVEL.gs`
7. `IROUP_V2_DTO_AGGREGATE.gs`
8. `IROUP_V2_PUBLIC_API.gs`
9. `IROUP_V2_ADMIN_API.gs`
10. `IROUP_V2_ROUTER.gs`
11. `IROUP_V2_ENTRYPOINT.gs`

Apps Script does not require dependency order at runtime, but this copy order keeps the project easy to inspect: config first, dependencies next, route handlers next, router and web entrypoint last.

Optional files for staging/editor testing only:

- `IROUP_V2_ROUTER_TEST.gs`
- `IROUP_V2_TEST_RUNNER.gs`

Do not include these in the first production-like deployment unless explicitly reviewed:

- `IROUP_DATABASE_V2_BUILDER.gs`
- `IROUP_V2_REPAIR.gs`
- `IROUP_V2_SEED_SAMPLE_DATA.gs`

## 2. Create The Isolated Apps Script Project

Preferred path: create a container-bound script from the `IROUP_DATABASE_V2` spreadsheet.

Steps:

1. Open the `IROUP_DATABASE_V2` Google Sheet.
2. Open **Extensions > Apps Script**.
3. Name the project clearly, for example:

```text
IROUP_DATABASE_V2_API
```

4. Confirm this is not the existing V1 production Apps Script project.
5. Create one `.gs` file per required runtime file.
6. Paste each required file's contents in the copy order above.
7. Save the project.

Standalone fallback path:

1. Create a new standalone Apps Script project.
2. Name it clearly, for example:

```text
IROUP_DATABASE_V2_API_STANDALONE
```

3. Copy the required runtime files.
4. Set `IROUP_V2_SPREADSHEET_ID` in `IROUP_V2_CONFIG.gs` to the `IROUP_DATABASE_V2` spreadsheet ID.
5. Save the project.

## 3. Required Config Values

Open `IROUP_V2_CONFIG.gs`.

### Bound Spreadsheet Project

Use when the script is opened from `IROUP_DATABASE_V2`.

Required value:

```javascript
const IROUP_V2_SPREADSHEET_ID = '';
```

Expected behavior:

- `getV2SS_()` uses `SpreadsheetApp.getActiveSpreadsheet()`.
- `v2.health` reports the intended V2 spreadsheet name.

### Standalone Project

Use only if the project is not container-bound.

Required value:

```javascript
const IROUP_V2_SPREADSHEET_ID = '<IROUP_DATABASE_V2_SPREADSHEET_ID>';
```

Required check:

- The ID must be the V2 spreadsheet ID.
- The ID must not be the V1 production spreadsheet ID.
- The deploying account must have access to the V2 spreadsheet.

No script properties are required for the first deployment. The current V2 backend reads `IROUP_V2_SPREADSHEET_ID` from `IROUP_V2_CONFIG.gs`.

## 4. Pre-Deployment Editor Checks

Before deploying as a web app, run direct router calls inside the Apps Script editor.

Run:

```javascript
routeV2Request_({ action: 'v2.health' })
```

Expected JSON-like object:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "api_version": "2.2",
    "database_name": "IROUP_DATABASE_V2",
    "spreadsheet_id_configured": false,
    "sheets_expected": 18,
    "sheets_found": 18
  },
  "error": "",
  "meta": {
    "action": "v2.health",
    "api_version": "2.2",
    "timestamp": "..."
  }
}
```

Notes:

- `spreadsheet_id_configured` may be `false` for a bound project.
- `spreadsheet_id_configured` should be `true` for a standalone project.
- `sheets_expected` and `sheets_found` may differ if the schema changes later; investigate any degraded result before deployment.

Run:

```javascript
routeV2Request_({ action: 'v2.schema' })
```

Expected:

```json
{
  "success": true,
  "data": {
    "api_version": "2.2",
    "sheets": []
  },
  "error": "",
  "meta": {
    "action": "v2.schema",
    "api_version": "2.2",
    "timestamp": "..."
  }
}
```

The `sheets` array should contain schema metadata. Use this as controlled diagnostic only.

Run:

```javascript
routeV2Request_({ action: 'v2.public.scholarship.list' })
```

Expected:

```json
{
  "success": true,
  "data": [],
  "error": "",
  "meta": {
    "action": "v2.public.scholarship.list",
    "api_version": "2.2",
    "timestamp": "...",
    "total": 0
  }
}
```

`data` may be an empty array if no public scholarship rows are available. If rows exist, verify they are public DTOs and not raw sheet rows.

Stop before deployment if any editor check:

- Throws an unhandled exception.
- Opens the wrong spreadsheet.
- Returns non-standard response shape.
- Exposes private fields in public DTOs.

## 5. Deployment Settings

Create a new web app deployment only after the editor checks pass.

Recommended first deployment posture:

- Deployment type: **Web app**
- Description: `V2 backend smoke test`
- Execute as: **User accessing the web app**, if available and compatible with the tenant.
- Who has access: **Anyone within University of Phayao** or the narrowest setting that still allows the intended smoke testers to open direct route URLs.

If public unauthenticated routes must be tested:

- Use the narrowest access setting that can support that test.
- Treat admin auth as untrusted until tested separately.

Why execute-as-user is preferred for the first admin auth test:

- V2 admin guard uses `Session.getActiveUser().getEmail()`.
- Execute-as-user is more likely to reflect the caller identity.
- Execute-as-owner can be risky if admin routes see the owner as the active user for every request.

If execute-as-user is unavailable or does not support public route testing:

- Record the exact deployment setting.
- Run the admin expected-fail test before any success test.
- Do not activate dashboard/admin until behavior is understood.

## 6. Create Deployment And Obtain URL

Steps:

1. In Apps Script, click **Deploy > New deployment**.
2. Select **Web app**.
3. Enter description:

```text
V2 backend smoke test
```

4. Choose the deployment settings from Section 5.
5. Click **Deploy**.
6. Approve permissions if prompted.
7. Copy the web app URL ending in `/exec`.
8. Store it privately as:

```text
V2_DEPLOYMENT_URL=<copied /exec URL>
```

Do not paste this URL into any repository file during this deployment.

## 7. Temporary Test URL Examples

Replace `<V2_DEPLOYMENT_URL>` with the copied `/exec` URL.

Health:

```text
<V2_DEPLOYMENT_URL>?action=v2.health
```

Schema diagnostic:

```text
<V2_DEPLOYMENT_URL>?action=v2.schema
```

Public scholarship:

```text
<V2_DEPLOYMENT_URL>?action=v2.public.scholarship.list
```

Admin dashboard summary:

```text
<V2_DEPLOYMENT_URL>?action=v2.admin.dashboard.summary
```

Short alias parameter also exists, but use `action` for first smoke tests:

```text
<V2_DEPLOYMENT_URL>?a=v2.health
```

## 8. Backend Smoke Test Sequence

### 8.1 Test `v2.health`

Open:

```text
<V2_DEPLOYMENT_URL>?action=v2.health
```

Expected:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "api_version": "2.2",
    "database_name": "IROUP_DATABASE_V2",
    "spreadsheet_id_configured": false,
    "sheets_expected": 18,
    "sheets_found": 18
  },
  "error": "",
  "meta": {
    "action": "v2.health",
    "api_version": "2.2",
    "timestamp": "..."
  }
}
```

Pass criteria:

- JSON response.
- `success === true`.
- `data.database_name` is the V2 spreadsheet.
- `meta.action === 'v2.health'`.

Stop if:

- Response is HTML.
- Response is a Google permission page.
- Response names the wrong spreadsheet.
- Response exposes a raw stack trace.

### 8.2 Test `v2.schema`

Open:

```text
<V2_DEPLOYMENT_URL>?action=v2.schema
```

Expected:

```json
{
  "success": true,
  "data": {
    "api_version": "2.2",
    "sheets": []
  },
  "error": "",
  "meta": {
    "action": "v2.schema",
    "api_version": "2.2",
    "timestamp": "..."
  }
}
```

Pass criteria:

- JSON response.
- `success === true`.
- `meta.action === 'v2.schema'`.

Warning:

- `v2.schema` is currently public.
- Use it only as a controlled diagnostic.
- Do not share the endpoint broadly while `v2.schema` is public unless this exposure is explicitly accepted.

### 8.3 Test `v2.public.scholarship.list`

Open:

```text
<V2_DEPLOYMENT_URL>?action=v2.public.scholarship.list
```

Expected empty-data shape:

```json
{
  "success": true,
  "data": [],
  "error": "",
  "meta": {
    "action": "v2.public.scholarship.list",
    "api_version": "2.2",
    "timestamp": "...",
    "total": 0
  }
}
```

Expected populated-data shape:

```json
{
  "success": true,
  "data": [
    {
      "scholarship_id": "SCH...",
      "title_th": "...",
      "title_en": "...",
      "institution_name": "...",
      "country": {},
      "continent": {},
      "files": []
    }
  ],
  "error": "",
  "meta": {
    "action": "v2.public.scholarship.list",
    "api_version": "2.2",
    "timestamp": "...",
    "total": 1
  }
}
```

Privacy pass criteria:

- No `person_id`.
- No student IDs.
- No staff IDs.
- No row-level gender.
- No budget details.
- No internal notes.
- No creator/updater/audit fields.
- No restricted/private/confidential files.
- No raw sheet rows.

## 9. Admin Auth Tests

Admin route:

```text
<V2_DEPLOYMENT_URL>?action=v2.admin.dashboard.summary
```

### 9.1 Expected Fail Test

Test first with one of:

- Incognito or signed-out browser, if the deployment allows access.
- A signed-in non-admin Google account.
- A signed-in account not active in the V2 `ADMIN` sheet.

Expected failure shape:

```json
{
  "success": false,
  "data": null,
  "error": "No active Apps Script user email available",
  "meta": {
    "action": "v2.admin.dashboard.summary",
    "api_version": "2.2",
    "timestamp": "..."
  }
}
```

Other acceptable safe errors:

- `Email is not authorized for V2 admin access`
- `Admin account is inactive`
- `V2 admin authorization failed.`

Pass criteria:

- `success === false`.
- No dashboard data.
- No raw rows.
- No private operational data.

Stop immediately if:

- Unauthorized user receives `success === true`.
- Unauthorized response includes admin summary data.

### 9.2 Expected Success Test

Test with an active admin Google account listed in the V2 `ADMIN` sheet.

Expected success shape:

```json
{
  "success": true,
  "data": {
    "counts": {},
    "participants": {}
  },
  "error": "",
  "meta": {
    "action": "v2.admin.dashboard.summary",
    "api_version": "2.2",
    "timestamp": "..."
  }
}
```

The exact dashboard summary fields may vary by DTO version. The key checks are:

- `success === true`.
- `data` is present.
- `meta.action === 'v2.admin.dashboard.summary'`.
- No raw sheet row internals.

If authorized success fails:

- Check whether `Session.getActiveUser().getEmail()` is blank.
- Check deployment execute/access settings.
- Check V2 `ADMIN` sheet email spelling.
- Check `ADMIN.active`.
- Do not activate dashboard/admin frontend.

## 10. Post-Deployment Verification Checklist

Complete before declaring backend smoke test passed:

- [ ] Deployment URL is stored privately.
- [ ] No repository file contains the live V2 URL.
- [ ] `IROUP.SCRIPT_URL` is unchanged.
- [ ] `iroup-config.js` is unchanged.
- [ ] No frontend page was modified.
- [ ] `v2.health` returns JSON success.
- [ ] `v2.health` confirms the intended V2 spreadsheet.
- [ ] `v2.schema` works only as controlled diagnostic.
- [ ] `v2.public.scholarship.list` returns public-safe DTOs.
- [ ] Admin expected-fail test fails safely.
- [ ] Admin expected-success test succeeds only for an active V2 admin.
- [ ] Deployment settings are recorded.
- [ ] Observed `Session.getActiveUser().getEmail()` behavior is recorded.

## 11. Rollback Procedure

If backend smoke test fails before frontend activation:

1. Do not change V1 deployment.
2. Do not change `IROUP.SCRIPT_URL`.
3. Do not create or load `iroup-v2-endpoint.js`.
4. Disable, archive, or delete only the new V2 Apps Script deployment.
5. Fix the isolated V2 Apps Script project or V2 config.
6. Re-run editor-level tests.
7. Create a replacement V2 deployment only after the editor checks pass.

If the deployment URL was accidentally shared internally:

1. Disable/delete the V2 deployment.
2. Create a new deployment version after fixes.
3. Treat the old URL as invalid.

If any admin route succeeds for an unauthorized user:

1. Disable/delete the V2 deployment immediately.
2. Do not proceed with public frontend activation.
3. Review Apps Script execute/access settings.
4. Consider separate public/admin deployments before trying again.

## 12. Next Step After A Passed Backend Smoke Test

Do not activate all pages.

The next reviewed task should be a separate frontend endpoint activation pass for one page only:

```text
public/public-scholar.html
```

That later task should create or load the dedicated V2 endpoint config without changing `IROUP.SCRIPT_URL`.
