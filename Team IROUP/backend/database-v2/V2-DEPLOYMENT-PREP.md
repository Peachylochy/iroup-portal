# V2 Deployment Preparation

Date: 2026-05-11

Scope:

- V2 Apps Script files under `Team IROUP/backend/database-v2/`
- Separate V2 Apps Script deployment preparation only
- No production `Code.gs` change
- No V1 deployment change
- No frontend endpoint activation
- No deployment or push

## Summary

The V2 backend has a router and DTO layer, but it did not previously include Apps Script web-app entrypoints under `database-v2`.

Added:

```text
Team IROUP/backend/database-v2/IROUP_V2_ENTRYPOINT.gs
```

This file defines V2-only `doGet(e)` and `doPost(e)` functions that route requests through `routeV2Request_(e)` and return `ContentService.MimeType.JSON`.

The production V1 file remains untouched:

```text
Team IROUP/backend/Code.gs
```

## Required V2 Runtime Files

Include these files in the separate V2 Apps Script project/deployment:

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

These are the minimum runtime files needed for:

- V2 web-app entrypoints
- V2 spreadsheet access
- request routing
- public/admin route separation
- admin guard checks
- public-safe DTO responses
- admin/list/detail summary DTO responses
- lookup and aggregate DTO helpers

## Optional Setup, Repair, Seed, And Test Files

These files are useful during setup or staging, but are not required for the production V2 runtime bundle:

```text
IROUP_DATABASE_V2_BUILDER.gs
IROUP_V2_REPAIR.gs
IROUP_V2_SEED_SAMPLE_DATA.gs
IROUP_V2_ROUTER_TEST.gs
IROUP_V2_TEST_RUNNER.gs
```

Recommended handling:

- Include builder/repair/seed files only in a controlled setup or staging project.
- Avoid including seed sample data in a production web-app deployment unless there is a specific reviewed reason.
- Test files may be included while validating the deployment, then omitted from a lean production runtime project.

Markdown files are documentation only and do not need to be copied into Apps Script.

## Entrypoint Verification

Current V2 router entrypoint:

```javascript
routeV2Request_(e)
```

Current web-app entrypoints after this pass:

```javascript
doGet(e)
doPost(e)
```

Request flow:

```text
doGet(e) / doPost(e)
  -> handleV2WebRequest_(e)
  -> routeV2Request_(e)
  -> createV2Response_(success, data, error, meta)
  -> ContentService JSON output
```

The V2 router already returns the standard shape:

```javascript
{
  success: boolean,
  data: any,
  error: string,
  meta: {
    action: string,
    api_version: string,
    timestamp: string,
    total: number
  }
}
```

The entrypoint wrapper also catches unexpected top-level failures and returns a JSON V2 error response instead of allowing a raw Apps Script exception to become the response body.

## Spreadsheet Configuration

`IROUP_V2_CONFIG.gs` currently has:

```javascript
const IROUP_V2_SPREADSHEET_ID = '';
```

Safe deployment options:

1. If the V2 Apps Script project is bound to the `IROUP_DATABASE_V2` spreadsheet, leaving this blank is acceptable.
2. If the V2 Apps Script project is standalone, set `IROUP_V2_SPREADSHEET_ID` to the `IROUP_DATABASE_V2` spreadsheet ID before deployment.

Do not point V2 files at the V1 production spreadsheet.

## Public/Admin Separation

The route table in `IROUP_V2_ROUTER.gs` classifies routes with `access: 'public'` or `access: 'admin'`.

Admin route behavior:

- `routeV2Request_(e)` calls `requireV2Admin_()` before executing admin handlers.
- `requireV2Admin_()` uses Apps Script active-user email and the V2 `ADMIN` sheet.
- Admin routes return DTOs rather than raw sheet rows.

Public route behavior:

- Public routes use public DTO helpers and aggregate helpers.
- Public contract rules prohibit exposing raw private rows, person IDs, student/staff IDs, row-level gender, budgets, internal notes, audit fields, private files, or restricted files.

Current public exposure review item:

- `v2.schema` is currently public. It is useful for diagnostics, but should be restricted, removed, or explicitly accepted before broad public deployment.

## Deployment Risks

- Apps Script active-user email may be blank depending on the web-app deployment access setting and the user/session context.
- A single V2 deployment must support public unauthenticated reads while still protecting admin routes. The admin guard should be tested under the exact deployment access setting.
- A standalone project with blank `IROUP_V2_SPREADSHEET_ID` will not reliably open the intended V2 spreadsheet.
- Accidentally copying `IROUP_V2_ENTRYPOINT.gs` into the V1 production project would create route ownership ambiguity. Keep it V2-only.
- Including seed/repair/test files in production increases the number of callable editor functions. They are not web routes, but they should still be treated as setup-only unless needed.
- `v2.schema` may disclose schema/header metadata if left public on a broadly reachable deployment.
- Public file DTOs depend on `visibility_level`, soft-delete flags, parent public visibility, and file-role safety checks. These should be smoke-tested with representative public/private file rows.

## Manual Deployment Steps For Later

Do these only after review approval:

1. Create or confirm a separate Apps Script project for V2.
2. Bind it to `IROUP_DATABASE_V2` or set `IROUP_V2_SPREADSHEET_ID` in `IROUP_V2_CONFIG.gs`.
3. Copy the required V2 runtime files listed above into the V2 project.
4. Do not copy or modify `Team IROUP/backend/Code.gs`.
5. Confirm the V2 `ADMIN` sheet contains the authorized admin email with `active = TRUE`.
6. In the Apps Script editor, run a direct smoke call such as `routeV2Request_({ action: 'v2.health' })`.
7. If test files are included, run the V2 router/test runner functions in the editor.
8. Create a new V2 web-app deployment.
9. Test direct public endpoint URLs:
   - `?action=v2.health`
   - `?action=v2.public.scholarship.list`
   - `?action=v2.public.event.list`
   - `?action=v2.public.mou.list`
   - `?action=v2.public.mobility.list`
   - `?action=v2.public.travel.list`
10. Test direct admin endpoint behavior:
    - unauthenticated or unauthorized user should fail safely
    - authorized admin should pass for `?action=v2.admin.dashboard.summary`
11. Review public DTOs for private-field leakage before publishing the V2 URL to frontend config.
12. Only after endpoint review, add the separate frontend endpoint config file described in `V2-ENDPOINT-CONFIG-PLAN.md`.

## Not Done

- No deployment was performed.
- No production `Code.gs` edit was made.
- No V1 deployment URL was changed.
- No frontend endpoint URL was configured.
- No public/admin page behavior was changed.
- No push was performed.
