# V2 Deployment Readiness Review

Date: 2026-05-11

Scope:

- Final architecture/safety review before the first live isolated V2 Apps Script deployment
- Deployment-related docs, V2 runtime file list, router entrypoints, endpoint config strategy, public/admin separation, and smoke-test order

Not in scope:

- No deployment
- No URL activation
- No runtime behavior change
- No production `Code.gs` change
- No push

## Reviewed Documents

- `V2-ENDPOINT-CONFIG-PLAN.md`
- `V2-DEPLOYMENT-PREP.md`
- `V2-SMOKE-TEST-PLAN.md`
- `V2-FIRST-DEPLOYMENT-CHECKLIST.md`
- `PROJECT-STATE.md`
- `V2-ROADMAP.md`

## Reviewed Runtime Surface

V2 runtime files present under `Team IROUP/backend/database-v2/`:

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

Optional setup/test files are present and should remain optional:

- `IROUP_DATABASE_V2_BUILDER.gs`
- `IROUP_V2_REPAIR.gs`
- `IROUP_V2_SEED_SAMPLE_DATA.gs`
- `IROUP_V2_ROUTER_TEST.gs`
- `IROUP_V2_TEST_RUNNER.gs`

## Readiness Decision

Decision: **GO for first isolated V2 backend deployment only, after manual checklist confirmation.**

Decision: **NO-GO for frontend V2 URL activation during the deployment step.**

Decision: **NO-GO for admin/dashboard V2 activation until admin auth is proven under the exact Apps Script deployment settings.**

This means the next reviewed action may create a separate V2 Apps Script web app and test direct URLs only. It should not load the V2 URL into frontend pages yet.

## Verification Findings

### Runtime File Coverage

Status: **Ready**

- Required V2 runtime files are present.
- `IROUP_V2_ENTRYPOINT.gs` exists.
- `IROUP_V2_ENTRYPOINT.gs` defines `doGet(e)` and `doPost(e)`.
- `IROUP_V2_ROUTER.gs` defines `routeV2Request_(e)` and `createV2Response_(...)`.
- `IROUP_V2_AUTH.gs` defines `requireV2Admin_()`.

No missing required runtime files were found for the first isolated deployment.

### Router Entrypoints

Status: **Ready**

Expected request flow exists:

```text
doGet(e) / doPost(e)
  -> handleV2WebRequest_(e)
  -> routeV2Request_(e)
  -> createV2Response_(...)
  -> ContentService.MimeType.JSON
```

The entrypoint wrapper catches unexpected top-level failures and returns a standard V2 JSON error response.

### Production V1 Isolation

Status: **Ready**

- V2 deployment docs consistently require a separate Apps Script deployment.
- V2 docs explicitly prohibit copying or editing production `Team IROUP/backend/Code.gs`.
- V2 router is isolated under `backend/database-v2`.
- No readiness step requires wiring V2 routes into V1 production `Code.gs`.

### V1 `SCRIPT_URL` Protection

Status: **Ready**

- `iroup-v2-api.js` has no hardcoded deployment URL.
- The V2 adapter reads `window.IROUP_V2_SCRIPT_URL` or `IROUP_V2.setScriptUrl(url)`.
- Migrated public pages and `dashboard.html` load `iroup-v2-api.js` but do not define a live V2 URL.
- The endpoint plan keeps `IROUP.SCRIPT_URL` unchanged and reserves future V2 activation for a separate endpoint config file.

### Public/Admin Separation

Status: **Conditionally ready**

Positive findings:

- `IROUP_V2_ROUTER.gs` marks admin routes with `access: 'admin'`.
- `routeV2Request_(e)` calls `requireV2Admin_()` before running admin handlers.
- Public routes use public DTO helpers rather than raw sheet rows.
- `IROUP_V2_PUBLIC_API.gs` documents and implements public parent visibility checks, soft-delete filtering, public file visibility checks, and file-role public-safety checks.

Remaining condition:

- Public DTO privacy must still be validated against live representative V2 data before the V2 URL is published to frontend pages.

### Admin Auth Assumptions

Status: **Risky until manually proven**

Current admin auth depends on:

```javascript
Session.getActiveUser().getEmail()
```

This is the main readiness risk.

Why it matters:

- Apps Script web-app access settings can change whether an active user email is available.
- Public unauthenticated route access and admin identity enforcement may not be compatible in a single deployment mode.
- An execute-as-owner deployment must be tested carefully to ensure admin routes do not pass for every caller as the owner.

Required manual proof before admin activation:

- Unauthorized admin route request fails safely.
- Non-admin signed-in request fails safely.
- Authorized active V2 admin request succeeds.
- The observed active-user email behavior is understood for the exact deployment setting.

If these cannot all be proven, split public and admin deployment strategies before dashboard/admin activation.

### `v2.schema` Exposure

Status: **Acceptable for controlled diagnostic only**

`v2.schema` is currently public.

This is not a blocker for a controlled first deployment smoke test, but it is a blocker for broad sharing of the V2 endpoint unless explicitly accepted.

Recommendation:

- Test `v2.schema` only during controlled deployment validation.
- Do not use `v2.schema` as a public page dependency.
- Before broad public endpoint sharing, make a reviewed decision to keep it public, make it admin-only, or treat it as debug-only.

### Smoke-Test Sequence

Status: **Safe**

The current sequence is safe because it isolates risk by layer:

1. Apps Script editor-level tests.
2. Direct `v2.health` endpoint test.
3. Controlled `v2.schema` diagnostic.
4. Direct `v2.public.scholarship.list` endpoint test.
5. Public DTO privacy inspection.
6. Admin expected-fail test.
7. Admin expected-success test.
8. One-page frontend activation later, starting with `public/public-scholar.html`.

No deployment-order mistake was found in the current plan.

## Required Manual Checks Before Deployment

Complete these before creating the V2 web-app deployment:

- [ ] Confirm the Apps Script project is separate from the V1 production project.
- [ ] Confirm production `Team IROUP/backend/Code.gs` is not copied into the V2 project.
- [ ] Confirm only required V2 runtime files are copied for the first production-like deployment.
- [ ] Decide bound project vs standalone project.
- [ ] If bound, confirm the project is bound to `IROUP_DATABASE_V2`.
- [ ] If standalone, set `IROUP_V2_SPREADSHEET_ID` to the `IROUP_DATABASE_V2` spreadsheet ID.
- [ ] Confirm `IROUP_V2_SPREADSHEET_ID` does not point to the V1 production spreadsheet.
- [ ] Confirm the V2 `ADMIN` sheet contains the intended active admin email.
- [ ] Run editor-level `routeV2Request_({ action: 'v2.health' })`.
- [ ] Run editor-level `routeV2Request_({ action: 'v2.schema' })`.
- [ ] Run editor-level `routeV2Request_({ action: 'v2.public.scholarship.list' })`.

## Required Manual Checks After Deployment

Before any frontend activation:

- [ ] Direct `?action=v2.health` returns JSON.
- [ ] `v2.health` opens the intended V2 spreadsheet.
- [ ] Direct `?action=v2.schema` works only as controlled diagnostic.
- [ ] Direct `?action=v2.public.scholarship.list` returns public-safe DTOs.
- [ ] Public scholarship DTOs do not expose private fields.
- [ ] Direct `?action=v2.admin.dashboard.summary` fails safely for unauthorized access.
- [ ] Direct `?action=v2.admin.dashboard.summary` succeeds only for an active admin account.
- [ ] Deployment setting behavior for `Session.getActiveUser().getEmail()` is documented.

## Public-Only Before Admin Activation

Recommendation: **Yes. Public-only V2 activation should happen before admin V2 activation.**

Reason:

- Public routes are already migrated and verified through the V2 adapter.
- Public scholarship is the smallest frontend smoke surface.
- Admin auth depends on Apps Script active-user behavior that must be proven separately.
- Dashboard already has a safe readiness-only pilot and should remain V1-rendered until admin auth is stable.

Recommended activation order after direct endpoint tests:

1. `public/public-scholar.html`
2. `public/public-events.html`
3. `public/public-mou.html`
4. `public/public-mobility.html`
5. `dashboard.html` readiness check only

Do not migrate dashboard render architecture, report pages, CRUD, or upload in this deployment cycle.

## Remaining Risks

Risks that are acceptable for controlled deployment smoke testing:

- `v2.schema` is public while used as a controlled diagnostic.
- Public DTO privacy still needs live representative-data inspection.
- Public pages will show visible V2 failure states if the endpoint is unavailable.

Risks that block frontend/admin activation:

- Unknown `Session.getActiveUser().getEmail()` behavior under the chosen deployment setting.
- Any unauthorized success from `v2.admin.dashboard.summary`.
- Any public DTO leak of private rows, IDs, row-level gender, budgets, audit fields, internal notes, or private files.
- Any sign that the V2 deployment is reading the V1 production spreadsheet.
- Any need to edit production `Code.gs` or replace `IROUP.SCRIPT_URL`.

## Final Recommendation

Proceed with the first isolated V2 Apps Script deployment only if the manual pre-deployment checks pass.

The deployment should be treated as backend-only smoke testing:

- Direct endpoint tests only.
- No frontend URL activation.
- No admin/dashboard activation.
- No V1 deployment changes.

After direct endpoint tests pass, perform a separate reviewed activation pass for `public/public-scholar.html` only.
