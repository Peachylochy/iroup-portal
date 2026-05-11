# V2 First Deployment Dry Run Checklist

Date: 2026-05-11

Purpose:

Create an exact manual checklist for the first isolated V2 Apps Script deployment and smoke test.

This is a dry-run checklist only. Do not deploy, change URLs, activate frontend V2 config, touch V1 deployment, or push until reviewed.

## 0. Safety Boundary

Before starting, confirm:

- [ ] This is a new isolated V2 Apps Script deployment.
- [ ] V1 production `Team IROUP/backend/Code.gs` will not be copied, edited, or replaced.
- [ ] V1 `IROUP.SCRIPT_URL` in `Team IROUP/iroup-config.js` will not be changed.
- [ ] No frontend page will receive a live V2 URL during this dry run.
- [ ] No admin/dashboard CRUD or upload flow is part of this test.

## 1. Files To Copy Into The V2 Apps Script Project

Copy these runtime files into the new V2 Apps Script project:

- [ ] `IROUP_V2_ENTRYPOINT.gs`
- [ ] `IROUP_V2_CONFIG.gs`
- [ ] `IROUP_V2_DB.gs`
- [ ] `IROUP_V2_VALIDATION.gs`
- [ ] `IROUP_V2_AUTH.gs`
- [ ] `IROUP_V2_ROUTER.gs`
- [ ] `IROUP_V2_ADMIN_API.gs`
- [ ] `IROUP_V2_PUBLIC_API.gs`
- [ ] `IROUP_V2_DTO_AGGREGATE.gs`
- [ ] `IROUP_V2_DTO_LOOKUP.gs`
- [ ] `IROUP_V2_DTO_TRAVEL.gs`

Optional setup/test files for controlled staging only:

- [ ] `IROUP_DATABASE_V2_BUILDER.gs`
- [ ] `IROUP_V2_REPAIR.gs`
- [ ] `IROUP_V2_SEED_SAMPLE_DATA.gs`
- [ ] `IROUP_V2_ROUTER_TEST.gs`
- [ ] `IROUP_V2_TEST_RUNNER.gs`

Recommendation:

- Do not include seed/repair/test files in the first production-like web deployment unless there is a reviewed reason.
- Do not copy Markdown documentation into Apps Script.

## 2. Apps Script Project Setup

- [ ] Create or open the separate V2 Apps Script project.
- [ ] Confirm the project name clearly marks it as V2, for example `IROUP_DATABASE_V2_API`.
- [ ] Confirm the project is separate from the existing V1 production Apps Script project.
- [ ] Add the required V2 runtime files.
- [ ] Save the project.
- [ ] Confirm no duplicate `doGet(e)` or `doPost(e)` functions exist except the ones in `IROUP_V2_ENTRYPOINT.gs`.
- [ ] Confirm `routeV2Request_(e)` exists in `IROUP_V2_ROUTER.gs`.
- [ ] Confirm `requireV2Admin_()` exists in `IROUP_V2_AUTH.gs`.

## 3. Spreadsheet Binding / Spreadsheet ID Check

Open `IROUP_V2_CONFIG.gs` and verify:

```javascript
const IROUP_V2_SPREADSHEET_ID = '';
```

Choose exactly one model:

### Bound Project Model

Use this if the Apps Script project is bound to `IROUP_DATABASE_V2`.

- [ ] Confirm the script is container-bound to the correct `IROUP_DATABASE_V2` spreadsheet.
- [ ] Leave `IROUP_V2_SPREADSHEET_ID` blank.
- [ ] Confirm `SpreadsheetApp.getActiveSpreadsheet()` opens the V2 spreadsheet.

### Standalone Project Model

Use this if the Apps Script project is standalone.

- [ ] Set `IROUP_V2_SPREADSHEET_ID` to the actual `IROUP_DATABASE_V2` spreadsheet ID.
- [ ] Confirm it does not point to the V1 production spreadsheet.
- [ ] Confirm the account deploying the script can open the V2 spreadsheet.

Stop if:

- [ ] You are unsure which spreadsheet the V2 deployment will open.
- [ ] The ID points to the V1 production spreadsheet.
- [ ] The script cannot read the V2 spreadsheet.

## 4. Admin Sheet Check

In `IROUP_DATABASE_V2`, confirm:

- [ ] The `ADMIN` sheet exists.
- [ ] The intended test admin email exists.
- [ ] The intended test admin row has `active = TRUE`.
- [ ] The email is spelled exactly as the Google account used for admin smoke testing.
- [ ] A non-admin Google account is available for negative testing, if possible.

## 5. Editor-Level Smoke Checks Before Deployment

Run these in the Apps Script editor before creating a web deployment:

- [ ] `routeV2Request_({ action: 'v2.health' })`
- [ ] `routeV2Request_({ action: 'v2.schema' })`
- [ ] `routeV2Request_({ action: 'v2.public.scholarship.list' })`

Expected for all:

- [ ] Response is an object.
- [ ] Response has `success`.
- [ ] Response has `data`.
- [ ] Response has `error`.
- [ ] Response has `meta`.
- [ ] `meta.action` matches the requested action.
- [ ] `meta.api_version` is `2.2`.

Stop if:

- [ ] The response is not standard V2 shape.
- [ ] Spreadsheet permission fails.
- [ ] `v2.health` cannot find expected sheets.
- [ ] Public scholarship data exposes private fields.

## 6. Deployment Setting Recommendations

The first deployment is for smoke testing, not broad production activation.

Recommended first setting to evaluate public routes:

- Execute as: the deploying account or project owner.
- Who has access: start with the narrowest setting that still lets the tester open public route URLs.

Important caution:

V2 admin auth uses:

```javascript
Session.getActiveUser().getEmail()
```

Therefore:

- [ ] Record the exact deployment setting used.
- [ ] Test whether `Session.getActiveUser().getEmail()` is available under that setting.
- [ ] Do not trust admin routes until unauthorized failure and authorized success are both proven.
- [ ] If public access and admin identity conflict, pause and split public/admin deployment strategy before frontend activation.

Do not assume frontend `adminToken` alone is enough for V2 admin access.

## 7. Create The Test Deployment

Only after the editor-level checks pass:

- [ ] Create a new Apps Script web-app deployment.
- [ ] Record the deployment URL in a private deployment note.
- [ ] Do not paste the URL into `iroup-config.js`.
- [ ] Do not create `iroup-v2-endpoint.js` yet.
- [ ] Do not add the URL to any HTML file yet.

## 8. First Public Routes To Test

Use direct URLs only. Replace `<V2_DEPLOYMENT_URL>` with the new V2 web-app URL.

### 8.1 Health

```text
<V2_DEPLOYMENT_URL>?action=v2.health
```

Expected success:

- [ ] JSON response.
- [ ] `success === true`.
- [ ] `data.status` is `ok` or clearly explainable as `degraded`.
- [ ] `data.database_name` is the intended V2 spreadsheet.
- [ ] `meta.action === 'v2.health'`.

Stop if:

- [ ] Response is HTML or plain text error.
- [ ] Spreadsheet is wrong.
- [ ] Response exposes stack traces.

### 8.2 Schema

```text
<V2_DEPLOYMENT_URL>?action=v2.schema
```

Expected success:

- [ ] JSON response.
- [ ] `success === true`.
- [ ] `meta.action === 'v2.schema'`.

Use only as controlled diagnostic.

Review before broad public exposure:

- [ ] Does schema output reveal more sheet/header metadata than acceptable?
- [ ] Should `v2.schema` become admin-only or debug-only before public sharing?

### 8.3 Public Scholarship List

```text
<V2_DEPLOYMENT_URL>?action=v2.public.scholarship.list
```

Expected success:

- [ ] JSON response.
- [ ] `success === true`.
- [ ] `data` is an array or a documented public DTO structure.
- [ ] `meta.action === 'v2.public.scholarship.list'`.

Privacy check:

- [ ] No `person_id`.
- [ ] No student IDs.
- [ ] No staff IDs.
- [ ] No row-level gender.
- [ ] No budget details.
- [ ] No internal notes.
- [ ] No creator/updater/audit fields.
- [ ] No restricted/private/confidential files.
- [ ] No raw sheet rows.

## 9. Admin Auth Test Sequence

Direct route:

```text
<V2_DEPLOYMENT_URL>?action=v2.admin.dashboard.summary
```

### 9.1 Expected Fail: Unauthenticated Or Unauthorized

Test one or more:

- [ ] Incognito / not signed in, if deployment setting permits access.
- [ ] Signed in as a non-admin Google account.
- [ ] Signed in as an account not listed active in the V2 `ADMIN` sheet.

Expected:

- [ ] JSON response.
- [ ] `success === false`.
- [ ] `error` is clear and safe.
- [ ] No dashboard summary data.
- [ ] No raw rows.
- [ ] No private operational data.

Stop immediately if:

- [ ] Admin route succeeds for an unauthorized user.
- [ ] Admin route exposes data when auth fails.

### 9.2 Expected Success: Authorized Admin

Test with the active admin Google account from the V2 `ADMIN` sheet.

Expected:

- [ ] JSON response.
- [ ] `success === true`.
- [ ] `data` contains dashboard summary DTOs.
- [ ] `meta.action === 'v2.admin.dashboard.summary'`.
- [ ] No raw sheet internals.

If it fails:

- [ ] Check whether `Session.getActiveUser().getEmail()` is blank.
- [ ] Check deployment execute/access settings.
- [ ] Check admin email normalization.
- [ ] Check `ADMIN.active`.
- [ ] Do not proceed to dashboard frontend activation.

## 10. Rollback Steps

If anything fails:

- [ ] Do not modify V1 production deployment.
- [ ] Do not change `IROUP.SCRIPT_URL`.
- [ ] Do not activate frontend endpoint config.
- [ ] Disable or delete only the new V2 Apps Script deployment if needed.
- [ ] Fix only the isolated V2 Apps Script project or V2 docs/config.
- [ ] Re-run editor-level checks before creating a replacement deployment.

If frontend activation has not happened, rollback is simply:

- [ ] Stop using the V2 deployment URL.
- [ ] Disable/delete the separate V2 deployment if necessary.
- [ ] Leave V1 production untouched.

## 11. What Not To Do

Do not:

- [ ] Edit `Team IROUP/backend/Code.gs`.
- [ ] Replace `IROUP.SCRIPT_URL`.
- [ ] Put the V2 URL into `iroup-config.js`.
- [ ] Add `iroup-v2-endpoint.js` during this dry run.
- [ ] Add the V2 deployment URL to any HTML page during this dry run.
- [ ] Copy V1 production backend files into the V2 project.
- [ ] Copy V2 entrypoints into the V1 project.
- [ ] Enable dashboard/admin frontend activation before admin auth is proven.
- [ ] Add automatic V1 public fallback to migrated public pages.
- [ ] Deploy CRUD/upload/admin write behavior.
- [ ] Push before review.

## 12. Pass Criteria

The first deployment dry run is considered ready for reviewed execution only when:

- [ ] Required V2 runtime files are identified.
- [ ] Spreadsheet binding/ID decision is explicit.
- [ ] Deployment settings and auth risks are understood.
- [ ] `v2.health`, `v2.schema`, and `v2.public.scholarship.list` have clear expected outcomes.
- [ ] Admin expected-fail and expected-success tests are defined.
- [ ] Rollback does not touch V1.
- [ ] No frontend activation is bundled into the deployment step.
