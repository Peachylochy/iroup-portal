# V2 Endpoint Configuration Plan

Date: 2026-05-11

Scope:

- `Team IROUP/iroup-config.js`
- `Team IROUP/iroup-v2-api.js`
- `Team IROUP/dashboard.html`
- Migrated public pages under `Team IROUP/public/`
- V2 router/deployment wiring strategy

This is a planning/audit pass only. No runtime configuration, frontend behavior, deployment, production `Code.gs`, or `SCRIPT_URL` value was changed.

## Current Configuration State

V1 endpoint:

- Defined in `Team IROUP/iroup-config.js` as `IROUP.SCRIPT_URL`.
- Current value points to the existing production Apps Script deployment.
- All V1 helpers use this value for legacy actions such as `getReport`, `getAll`, `add`, `edit`, `delete`, `uploadFile`, and old public routes.
- Admin token support is attached by `iroup-config.js` through `sessionStorage.iroup_admin_token` or `sessionStorage.iroup_user.adminToken`.

V2 endpoint:

- `Team IROUP/iroup-v2-api.js` intentionally has no hardcoded URL.
- It reads `window.IROUP_V2_SCRIPT_URL` or a value set through `IROUP_V2.setScriptUrl(url)`.
- If no URL is configured, V2 calls fail safely with `IROUP_V2 SCRIPT_URL is not configured.`
- Admin token support is attached by `iroup-v2-api.js` through `workspace_admin_token`, `iroup_admin_token`, `workspace_user`, or `iroup_user`.

Migrated V2 frontend pages:

- `dashboard.html` loads `iroup-config.js`, then `iroup-v2-api.js`.
- `public-scholar.html`, `public-events.html`, `public-mou.html`, and `public-mobility.html` load `iroup-config.js`, then `../iroup-v2-api.js`.
- None of the migrated pages define `IROUP_V2_SCRIPT_URL`.

Backend/router state:

- V1 `backend/Code.gs` defines production `doGet(e)` and `doPost(e)` for legacy actions.
- V2 `IROUP_V2_ROUTER.gs` defines `routeV2Request_(e)` only.
- V2 router files are intentionally isolated and are not wired into production `Code.gs`.
- V2 auth currently uses Apps Script active-user email through `requireV2Admin_()`.

## Endpoint Decision

The safest activation strategy is a separate V2 Apps Script deployment URL, not reuse of the current V1 `IROUP.SCRIPT_URL`.

Reasons:

- The current V1 deployment is already serving production legacy actions.
- The V2 router is not wired into the current production `Code.gs`.
- Reusing the V1 URL would require production `Code.gs` changes to route `v2.*` actions, which is explicitly out of scope until reviewed.
- A separate V2 deployment preserves rollback: clearing the V2 URL disables V2 calls without affecting V1 pages.
- Public Migration Wave 1 and the dashboard readiness pilot already use safe failure behavior when the V2 URL is absent.

The current V1 URL should remain unchanged until a formal cutover phase.

## Recommended Configuration Strategy

Add a small separate frontend config file in a later reviewed implementation pass:

```text
Team IROUP/iroup-v2-endpoint.js
```

Suggested responsibility:

```javascript
window.IROUP_V2_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
```

Do not put the V2 URL into `iroup-config.js` during the pilot. Keeping the V2 URL in its own file makes the V1/V2 boundary visible and reversible.

Recommended load order:

Root pages:

```html
<script src="iroup-config.js"></script>
<script src="iroup-v2-endpoint.js"></script>
<script src="iroup-v2-api.js"></script>
```

Public pages:

```html
<script src="iroup-config.js"></script>
<script src="../iroup-v2-endpoint.js"></script>
<script src="../iroup-v2-api.js"></script>
```

The V2 adapter can technically read `window.IROUP_V2_SCRIPT_URL` at call time, but loading the endpoint file before `iroup-v2-api.js` is clearer and easier to audit.

## Rollout Steps

1. Deploy a separate V2 Apps Script web app containing the V2 router and required V2 backend files.
2. Verify the V2 deployment directly with `v2.health`.
3. Verify public V2 routes directly:
   - `v2.public.scholarship.list`
   - `v2.public.event.list`
   - `v2.public.mou.list`
   - `v2.public.mobility.list`
   - `v2.public.travel.list`
4. Verify admin V2 route access directly with an authorized admin account:
   - `v2.admin.dashboard.summary`
5. Add a dedicated `iroup-v2-endpoint.js` file with only `window.IROUP_V2_SCRIPT_URL`.
6. Load that file only on already migrated pages:
   - `dashboard.html`
   - `public/public-scholar.html`
   - `public/public-events.html`
   - `public/public-mou.html`
   - `public/public-mobility.html`
7. Run migrated page smoke tests:
   - public pages render V2 data
   - dashboard readiness chip changes to `V2 admin: ready`
   - V1 dashboard render still works through `IROUP.getReport(year)`
8. Keep all non-migrated pages on V1 only.
9. Do not migrate admin CRUD/upload until V2 write/upload contracts are ready.

## Verification Method

Static/source checks:

- Confirm `IROUP.SCRIPT_URL` is unchanged.
- Confirm migrated pages load `iroup-v2-endpoint.js` and `iroup-v2-api.js`.
- Confirm non-migrated pages do not load V2 endpoint config.
- Confirm no direct page-level `SCRIPT_URL` or `action=v2.*` fetch bypasses the adapter.

Direct endpoint checks:

- `?action=v2.health` returns `success: true`.
- public route calls return `success: true` and public-safe DTOs.
- admin route calls fail clearly when unauthenticated and pass for authorized admin sessions.

Browser checks:

- With V2 URL configured, public migrated pages load data through `IROUP_V2.public.*`.
- With V2 URL configured, `dashboard.html` readiness chip reports `V2 admin: ready` for authorized admins.
- With V2 URL removed or invalid, migrated pages fail gracefully according to each page's existing error handling and V1 dashboard rendering continues.

## Risks

- If the V2 deployment is created from the wrong Apps Script project, `Session.getActiveUser()` and spreadsheet access may behave differently from local tests.
- If the V2 deployment is public enough to run public routes, `v2.schema` may expose schema/header metadata unless restricted or accepted for debug.
- Admin routes currently depend on Apps Script active-user email, not only the frontend `adminToken` parameter. Token propagation is useful but may not be sufficient until V2 auth/session design is finalized.
- Public pages currently load `iroup-config.js` as a relative `public/` path, while V2 files are loaded from `../`. Local static hosting has shown this can 404 for `public/iroup-config.js`; production hosting behavior should be confirmed before endpoint activation.
- A hardcoded V2 endpoint file can accidentally enable live V2 calls on pages if included too broadly.

## Rollback

Rollback should not touch `IROUP.SCRIPT_URL`.

Safe rollback options:

1. Remove or blank `window.IROUP_V2_SCRIPT_URL` in the future endpoint config file.
2. Remove the endpoint config script tag from migrated pages.
3. Revert only the endpoint config file, leaving `iroup-v2-api.js` and page migrations intact.

With no V2 URL configured, the adapter returns safe client errors and V1-only flows continue where they still exist.

## Recommendation

Proceed with a separate V2 endpoint config file in the next implementation pass, after a reviewed V2 Apps Script deployment URL exists.

Do not:

- replace `IROUP.SCRIPT_URL`
- reuse the current V1 production deployment unless `v2.*` routing is explicitly wired and reviewed
- place the V2 URL inside `iroup-config.js`
- load V2 endpoint config globally across all pages
- migrate CRUD/upload flows as part of endpoint activation

