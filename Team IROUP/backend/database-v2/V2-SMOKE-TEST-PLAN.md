# V2 Deployment Smoke Test Plan

Date: 2026-05-11

Scope:

- First live smoke-test strategy for the isolated V2 Apps Script deployment
- V2 backend entrypoint, router, public/admin routes, adapter, migrated public pages, and dashboard readiness pilot
- Planning/safety verification only

Not in scope:

- No deployment
- No production URL change
- No frontend endpoint activation
- No frontend behavior change
- No V1 deployment change
- No push

## Live Smoke Result

Status: completed successfully.

Live route outcomes:

- `v2.health`: passed.
- `v2.schema`: initially failed with `sheet.getLastColumn is not a function`, then passed after the schema wrapper fix.
- `v2.public.scholarship.list`: passed.
- `v2.admin.dashboard.summary`: reachable.
- `v2.admin.dashboard.summary`: initially returned inflated counts, then passed after aggregate primary-key filtering.

Safety boundary preserved:

- No frontend V2 URL activation.
- No `IROUP.SCRIPT_URL` replacement.
- No V1 production replacement.
- No dashboard/admin frontend activation.

## Current Readiness

Prepared V2 deployment structure:

- `IROUP_V2_ENTRYPOINT.gs` defines V2-only `doGet(e)` and `doPost(e)`.
- Both entrypoints call `routeV2Request_(e)`.
- Output is JSON through `ContentService.MimeType.JSON`.
- Top-level entrypoint failures are wrapped in the standard V2 response shape.

Prepared V2 frontend architecture:

- `iroup-v2-api.js` has no hardcoded URL.
- It reads `window.IROUP_V2_SCRIPT_URL` or `IROUP_V2.setScriptUrl(url)`.
- If no URL is configured, it fails safely with `IROUP_V2 SCRIPT_URL is not configured.`
- Public pages now call `IROUP_V2.public.*`.
- `dashboard.html` has a sidecar `IROUP_V2.admin.dashboardSummary()` readiness check and keeps the V1 dashboard render path.

## Primary Smoke-Test Principle

Test the V2 deployment directly before any frontend page receives the live V2 URL.

The smoke sequence should prove:

1. The V2 web app can return JSON.
2. The V2 deployment is connected to the intended V2 spreadsheet.
3. Public routes return public-safe DTOs.
4. Admin routes fail for unauthorized access.
5. Admin routes pass only for an authorized admin under the actual Apps Script deployment settings.
6. Frontend activation remains reversible by clearing or removing only the V2 endpoint config.

## Required Apps Script Deployment Checks

Before creating the deployment:

- Confirm this is a separate V2 Apps Script project/deployment.
- Confirm production `Team IROUP/backend/Code.gs` is not copied or edited.
- Confirm the V2 runtime bundle is present.
- Confirm whether the project is bound to `IROUP_DATABASE_V2`.
- If standalone, set `IROUP_V2_SPREADSHEET_ID` to the `IROUP_DATABASE_V2` spreadsheet ID.
- Confirm the V2 `ADMIN` sheet contains the intended test admin email with `active = TRUE`.

Required runtime bundle:

```text
IROUP_V2_ENTRYPOINT.gs
IROUP_V2_CONFIG.gs
IROUP_V2_DB.gs
IROUP_V2_VALIDATION.gs
IROUP_V2_AUTH.gs
IROUP_V2_ROUTER.gs
IROUP_V2_ADMIN_API.gs
IROUP_V2_PUBLIC_API.gs
IROUP_V2_DTO_AGGREGATE.gs
IROUP_V2_DTO_LOOKUP.gs
IROUP_V2_DTO_TRAVEL.gs
```

## Deployment Setting Caution

The current V2 admin guard uses:

```javascript
Session.getActiveUser().getEmail()
```

This must be tested under the exact web-app deployment settings before any admin route is trusted.

Critical risk:

- A deployment setting that allows public access may not provide a reliable end-user email to `Session.getActiveUser()`.
- A deployment setting that executes as the script owner can make admin route behavior unsafe if the owner email is treated as the active user for all requests.
- A deployment setting that requires Google sign-in may protect admin identity but may not support truly public unauthenticated pages.

Smoke-test implication:

- Do not activate the live V2 URL in frontend pages until both public access and admin auth behavior are proven.
- If one deployment cannot safely satisfy both public routes and admin routes, split the rollout into separate public and admin deployment strategies before admin activation.

## Recommended First Live Deployment Sequence

### Phase 0: Editor-Level Checks

Run inside the Apps Script editor before web deployment:

1. `routeV2Request_({ action: 'v2.health' })`
2. `routeV2Request_({ action: 'v2.schema' })`
3. `routeV2Request_({ action: 'v2.public.scholarship.list' })`
4. `routeV2Request_({ action: 'v2.public.event.list' })`
5. `routeV2Request_({ action: 'v2.public.mou.list' })`
6. `routeV2Request_({ action: 'v2.public.mobility.list' })`
7. `routeV2Request_({ action: 'v2.public.travel.list' })`

Expected:

- All responses use `{ success, data, error, meta }`.
- `meta.action` matches the requested action.
- `meta.api_version` is `2.2`.
- Public DTOs do not expose private fields.

### Phase 1: Direct Web-App Endpoint Checks

After creating the V2 web-app deployment, test direct URLs before frontend activation:

1. `?action=v2.health`
2. `?action=v2.public.scholarship.list`
3. `?action=v2.public.event.list`
4. `?action=v2.public.mou.list`
5. `?action=v2.public.mobility.list`
6. `?action=v2.public.travel.list`

Expected success behavior:

- HTTP response is reachable.
- Body is parseable JSON.
- `success === true`.
- `data` is present.
- `error` is empty.
- `meta.action` matches.

Expected acceptable failure behavior:

- `success === false` with a clear safe error.
- No raw Apps Script stack trace as the primary response body.
- No private row data in `data` or `error`.

Stop conditions:

- Non-JSON response.
- Spreadsheet permission error.
- `IROUP_DATABASE_V2` not opened.
- Public response includes raw/private fields.
- Unexpected admin data appears in public routes.

### Phase 2: Public Diagnostic Routes

Test `v2.health` publicly first.

Use `v2.schema` only as a controlled diagnostic, not as a broad public validation route.

Recommendation:

- `v2.health` may be tested publicly first because it is the smallest liveness check.
- `v2.schema` can be tested during deployment validation, but should be reviewed before any broad public exposure because it may reveal schema/header metadata.
- If possible, restrict, remove, or treat `v2.schema` as debug-only before the public endpoint is widely shared.

### Phase 3: Public DTO Safety Checks

For each public list route, inspect at least the first few records.

Routes:

- `v2.public.scholarship.list`
- `v2.public.event.list`
- `v2.public.mou.list`
- `v2.public.mobility.list`
- `v2.public.travel.list`

Must not expose:

- `person_id`
- student IDs
- staff IDs
- participant names in mobility/travel public responses
- row-level gender
- budgets
- internal notes
- creator/updater/audit fields
- restricted/private/confidential files
- raw sheet rows

File-specific checks:

- Public files only.
- Soft-deleted files excluded.
- Restricted/confidential/internal files excluded.
- Parent record must be public-visible.
- File-role safety should be honored where available.

### Phase 4: Admin Auth Negative Tests

Before testing an authorized admin, test unauthorized behavior.

Direct route:

- `?action=v2.admin.dashboard.summary`

Expected unauthorized behavior:

- `success === false`.
- Error is clear and safe.
- No dashboard data returned.
- No raw row data returned.

Required negative contexts:

- Not signed in, if deployment allows it.
- Signed in as a non-admin Google account, if possible.
- Browser/incognito session, if possible.

Stop condition:

- Admin route returns `success === true` for an unauthenticated or unauthorized user.

### Phase 5: Admin Auth Positive Test

Then test with an authorized admin account listed in the V2 `ADMIN` sheet.

Route:

- `?action=v2.admin.dashboard.summary`

Expected:

- `success === true`.
- `data` contains dashboard summary DTOs.
- `meta.action === 'v2.admin.dashboard.summary'`.
- No raw sheet row internals are returned.

If this fails:

- Check `Session.getActiveUser().getEmail()` behavior under the deployment settings.
- Check the `ADMIN` sheet active flag and normalized email.
- Do not proceed to frontend dashboard activation.

## Safest First Frontend Activation

Do not activate all migrated pages at once.

Safest first page:

```text
public/public-scholar.html
```

Reason:

- It uses a single V2 public list route.
- It has no D3 map dependency.
- It has no combined mobility/travel coupling.
- It has simple card rendering and filter behavior.
- Failure is visible and contained to the public scholarship page.

Recommended activation order after direct endpoint tests pass:

1. `public/public-scholar.html`
2. `public/public-events.html`
3. `public/public-mou.html`
4. `public/public-mobility.html`
5. `dashboard.html` readiness badge only

Do not activate dashboard admin validation until admin auth negative and positive tests pass.

## Public Page Fallback Decision

Do not add automatic V1 public fallback inside migrated public pages.

Reason:

- Public migration intentionally removed `IROUP.getPublic*` data paths from migrated pages.
- Reintroducing automatic V1 fallback would hide V2 failures and weaken migration verification.
- Rollback should happen through endpoint config removal or page-level script activation changes, not through silent dual-read behavior.

Acceptable temporary behavior:

- Public pages may show their existing visible load failure state if V2 fails.
- Dashboard may continue its existing V1 render while the V2 readiness chip reports unavailable.

## Frontend Smoke-Test Method

Preferred first method:

- Use direct endpoint URLs first.
- Then use a temporary local/test-only V2 URL configuration in the browser or a reviewed endpoint config file loaded by one page.

Do not:

- Put the V2 URL into `iroup-config.js`.
- Replace `IROUP.SCRIPT_URL`.
- Load V2 endpoint config globally.
- Activate all migrated pages in the same first smoke test.

Expected page behaviors:

- `public-scholar.html`: scholarship cards render, filters still work, poster fallback still works.
- `public-events.html`: event list/calendar render, date selection/type filter still work, poster/file buttons still work.
- `public-mou.html`: KPIs/table/chart/map render, country aggregation still works.
- `public-mobility.html`: mobility cards, travel timeline, KPIs, charts, map, top countries, modal still work.
- `dashboard.html`: V1 dashboard render continues; V2 readiness chip changes to `V2 admin: ready` only for authorized admin.

## Rollback Strategy

Rollback must not touch `IROUP.SCRIPT_URL`.

Safe rollback options:

1. Remove or blank `window.IROUP_V2_SCRIPT_URL` in the future V2 endpoint config file.
2. Remove the future endpoint config script tag from the page being tested.
3. Revert only the page-level endpoint activation change.
4. Disable or delete only the separate V2 Apps Script deployment if the backend itself is faulty.

Expected rollback result:

- V1 production pages remain unaffected.
- V1 admin/dashboard operational pages remain unaffected.
- Migrated public pages return to safe unconfigured V2 failure behavior until reactivated.
- Dashboard V1 render continues while the V2 readiness chip reports unavailable.

## Failure-Isolation Strategy

Keep each test layer independent:

- Backend editor tests before web deployment.
- Direct web endpoint tests before frontend activation.
- Public route tests before admin route tests.
- Admin negative tests before admin positive tests.
- One frontend page before all migrated public pages.
- Public frontend page before dashboard readiness activation.

Do not continue to the next layer after a stop condition.

## Minimal Smoke-Test Checklist

Pre-deployment:

- [ ] Separate V2 Apps Script project confirmed.
- [ ] V2 runtime bundle copied.
- [ ] Production `backend/Code.gs` untouched.
- [ ] Bound spreadsheet or `IROUP_V2_SPREADSHEET_ID` confirmed.
- [ ] V2 `ADMIN` sheet has the intended active admin.
- [ ] `routeV2Request_({ action: 'v2.health' })` succeeds in editor.

Direct endpoint:

- [ ] `?action=v2.health` returns JSON success.
- [ ] `?action=v2.public.scholarship.list` returns public-safe DTOs.
- [ ] `?action=v2.public.event.list` returns public-safe DTOs.
- [ ] `?action=v2.public.mou.list` returns public-safe DTOs.
- [ ] `?action=v2.public.mobility.list` returns public-safe DTOs.
- [ ] `?action=v2.public.travel.list` returns public-safe DTOs.
- [ ] `?action=v2.schema` reviewed only as controlled diagnostic.

Admin auth:

- [ ] Unauthorized dashboard summary request fails safely.
- [ ] Non-admin signed-in request fails safely.
- [ ] Authorized admin dashboard summary request succeeds.
- [ ] Active-user email behavior is understood for the deployment settings.

Frontend:

- [ ] Activate V2 URL for one page only.
- [ ] Start with `public/public-scholar.html`.
- [ ] Confirm cards and filters render.
- [ ] Confirm no console private-data leakage.
- [ ] Clear/remove V2 URL and confirm rollback behavior.
- [ ] Only then proceed page by page.

## Recommendation

Proceed only after review with this order:

1. Deploy separate V2 web app.
2. Test `v2.health`.
3. Test public list routes directly.
4. Inspect DTO privacy.
5. Test admin auth failure.
6. Test admin auth success.
7. Activate the V2 URL for `public-scholar.html` only.
8. Expand frontend activation one page at a time.
9. Keep dashboard as readiness-only until admin auth behavior is proven stable.
