# IROUP V2.2 API Contract

This document stabilizes the current router/API contract before any frontend migration.

Scope:

- Apps Script V2 router foundation only.
- No production `Code.gs` wiring yet.
- No deployment yet.
- No V1 API replacement yet.
- No frontend dependency should be added until this contract is reviewed.

Current router file:

```text
Team IROUP/backend/database-v2/IROUP_V2_ROUTER.gs
```

## Contract Status

Current status:

- V2 backend foundation validated.
- Seed persistence fixed.
- V2 router endpoint layer created.
- Router smoke tests passed.
- GitHub checkpoint pushed.

Next rule:

Frontend migration must consume DTO responses from this router/API layer, not raw Google Sheet rows.

## Request Contract

The router entrypoint is:

```javascript
routeV2Request_(e)
```

Supported request sources:

- `e.parameter.action`
- `e.parameter.a`
- JSON body `action` from `e.postData.contents`
- direct test object `{ action: 'v2.health' }`

If no action is provided, the router defaults to:

```text
v2.health
```

## Standard Response Shape

All router actions return:

```javascript
{
  success: boolean,
  data: any,
  error: string,
  meta: {
    action: string,
    api_version: "2.2",
    timestamp: string,
    total: number
  }
}
```

Notes:

- `meta.timestamp` is generated at response time.
- `meta.total` should represent item count where available.
- Failed responses must set `success: false` and a safe `error` message.
- Router responses should not expose raw `SpreadsheetApp` objects, ranges, or sheet row internals.

## Global Public Safety Rules

Public endpoints must never expose:

- `person_id`
- student IDs
- staff IDs
- Mobility or Travel participant names
- row-level gender data
- unit snapshots tied to a person
- creator/updater identity fields
- internal notes
- audit logs
- budgets or budget source details
- restricted, confidential, internal, or private files
- raw sheet rows that include private operational fields

Public file exposure is allowed only when all conditions are true:

- parent record has `public_visible === TRUE`
- file has `visibility_level === "public"`
- file is not soft-deleted
- file role is `public_safe === TRUE` when `FILE_ROLE_MASTER` is available

## Global Admin Rules

Admin routes:

- require `requireV2Admin_()`
- read from `IROUP_DATABASE_V2`
- may return fuller operational DTOs
- must still avoid returning raw sheet rows directly
- must exclude soft-deleted rows unless an explicit archive option is provided

Current optional archive parameter:

```text
includeArchived=true
include_archived=true
```

## Actions

### `v2.health`

Purpose:

- Check whether the V2 backend can open the configured spreadsheet and see expected sheets.

Classification:

- Public diagnostic.

Required params:

- None.

Optional params:

- None.

Response data shape:

```javascript
{
  status: "ok" | "degraded",
  api_version: "2.2",
  database_name: string,
  spreadsheet_id_configured: boolean,
  sheets_expected: number,
  sheets_found: number
}
```

Private fields never exposed:

- spreadsheet contents
- admin rows
- person data
- budgets
- files

TODO status:

- Implemented.
- Keep public only while it exposes metadata, not data rows.

### `v2.schema`

Purpose:

- Return a schema/header summary for V2 sheet verification.

Classification:

- Public diagnostic for pre-deployment testing.
- Review before public deployment because it exposes sheet names and headers.

Required params:

- None.

Optional params:

- None.

Response data shape:

```javascript
{
  api_version: "2.2",
  sheets: [
    {
      sheet_name: string,
      exists: boolean,
      headers: string[],
      header_count: number,
      last_row: number,
      last_column: number
    }
  ]
}
```

Private fields never exposed:

- data rows
- person values
- admin values
- files
- budgets

TODO status:

- Implemented.
- Before public deployment, consider restricting this to admin-only or a debug mode.

### `v2.admin.mou.list`

Purpose:

- Return admin MOU summary DTOs for operational review and future admin UI migration.

Classification:

- Admin.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- `includeArchived=true`
- `include_archived=true`

Response shape:

- Standard router response.
- `data` is an array returned by `listV2AdminMOUs_()`.

Private fields never exposed publicly:

- admin DTO must not be reused directly in public pages.
- creator/updater fields must remain admin-only if included by future DTOs.
- budgets/files from related tables must not be surfaced publicly through this action.

TODO status:

- Implemented through existing Admin DTO helper.

### `v2.admin.mobility.list`

Purpose:

- Return admin Mobility project summary DTOs with operational aggregates.

Classification:

- Admin.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- `includeArchived=true`
- `include_archived=true`

Response shape:

- Standard router response.
- `data` is an array returned by `listV2AdminMobilityProjects_()`.

Private fields never exposed publicly:

- participant names
- `person_id`
- gender row-level data
- unit/person snapshots
- budgets
- internal files
- creator/updater fields

TODO status:

- Implemented through existing Admin DTO helper.

### `v2.admin.travel.list`

Purpose:

- Return admin Travel summary DTOs for router smoke testing and future admin UI planning.

Classification:

- Admin.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- `includeArchived=true`
- `include_archived=true`

Current response data shape:

```javascript
[
  {
    travel_id: string,
    title: string,
    purpose: string,
    country_id: string,
    city: string,
    start_date: string,
    end_date: string,
    fiscal_year: string,
    status: string,
    public_visible: boolean,
    participant_count: number,
    is_deleted: boolean
  }
]
```

Private fields never exposed publicly:

- Travel participant names
- `person_id`
- staff/student IDs
- gender row-level data
- unit/person snapshots
- budgets
- internal notes
- creator/updater fields
- restricted files

TODO status:

- Uses a router-local helper: `listV2RouterAdminTravel_()`.
- TODO: replace with a finalized Admin Travel DTO helper that joins `TRAVEL_PARTICIPANT`, `BUDGET`, and `FILES` safely for admin workflows.

### `v2.admin.scholarship.list`

Purpose:

- Return admin Scholarship summary DTOs for operational review and future admin UI migration.

Classification:

- Admin.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- `includeArchived=true`
- `include_archived=true`

Response shape:

- Standard router response.
- `data` is an array returned by `listV2AdminScholarships_()`.

Private fields never exposed publicly:

- creator/updater fields
- internal notes
- non-public files
- budget/internal planning fields if added later

TODO status:

- Implemented through existing Admin DTO helper.

### `v2.admin.event.list`

Purpose:

- Return admin Event summary DTOs for operational review and future admin UI migration.

Classification:

- Admin.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- `includeArchived=true`
- `include_archived=true`

Response shape:

- Standard router response.
- `data` is an array returned by `listV2AdminEvents_()`.

Private fields never exposed publicly:

- creator/updater fields
- internal notes
- non-public files
- private meeting/location fields if marked non-public in future schema

TODO status:

- Implemented through existing Admin DTO helper.

### `v2.public.mou.list`

Purpose:

- Return public-safe MOU list DTOs.

Classification:

- Public.

Required params:

- None.

Optional params:

- None currently stabilized.

Response shape:

- Standard router response.
- `data` is an array returned by `listV2PublicMOUs_()`.

Private fields never exposed:

- internal notes
- creator/updater fields
- non-public files
- budgets
- raw sheet rows

TODO status:

- Implemented through existing Public DTO helper.

### `v2.public.mobility.summary`

Purpose:

- Return public-safe Mobility aggregate summary.

Classification:

- Public.

Required params:

- None.

Optional params:

- None currently stabilized.

Current response data shape:

```javascript
{
  project_count: number,
  participant_count: number,
  inbound_project_count: number,
  outbound_project_count: number,
  by_country: [
    {
      country_id: string,
      project_count: number,
      participant_count: number
    }
  ]
}
```

Private fields never exposed:

- participant names
- `person_id`
- student/staff IDs
- gender row-level data
- unit snapshots
- budgets
- internal notes
- non-public files
- creator/updater fields

TODO status:

- Implemented through router aggregate helper using `listV2PublicMobility_()`.
- Future public Mobility detail/list endpoints should continue using sanitized DTOs only.

### `v2.public.travel.summary`

Purpose:

- Return public-safe Travel aggregate summary.

Classification:

- Public.

Required params:

- None.

Optional params:

- None currently stabilized.

Current response data shape:

```javascript
{
  travel_count: number,
  participant_count: number,
  by_country: [
    {
      country_id: string,
      travel_count: number,
      participant_count: number
    }
  ]
}
```

Private fields never exposed:

- Travel participant names
- `person_id`
- student/staff IDs
- gender row-level data
- unit/person snapshots
- budgets
- internal notes
- non-public files
- creator/updater fields

TODO status:

- Uses a router-local helper: `getV2RouterPublicTravelSummary_()`.
- TODO: replace with finalized Public Travel DTO helper after Travel public contract is fully designed.

### `v2.public.scholarship.list`

Purpose:

- Return public-safe Scholarship list DTOs.

Classification:

- Public.

Required params:

- None.

Optional params:

- None currently stabilized.

Response shape:

- Standard router response.
- `data` is an array returned by `listV2PublicScholarships_()`.

Private fields never exposed:

- creator/updater fields
- internal notes
- non-public files
- budgets
- raw sheet rows

TODO status:

- Implemented through existing Public DTO helper.

### `v2.public.event.list`

Purpose:

- Return public-safe Event list DTOs.

Classification:

- Public.

Required params:

- None.

Optional params:

- None currently stabilized.

Response shape:

- Standard router response.
- `data` is an array returned by `listV2PublicEvents_()`.

Private fields never exposed:

- creator/updater fields
- internal notes
- non-public files
- private operational fields
- raw sheet rows

TODO status:

- Implemented through existing Public DTO helper.

## Pre-Frontend Migration Checklist

Before frontend migration starts:

- Review this contract.
- Decide whether `v2.schema` remains public, admin-only, or debug-only.
- Replace router-local Travel helpers with finalized Admin/Public Travel DTO helpers.
- Confirm exact DTO field names for each public page.
- Confirm admin list vs detail endpoints for each module.
- Add write contracts separately for admin add/edit/delete flows.
- Keep production `Code.gs` untouched until deployment wiring is explicitly approved.

