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

### `v2.admin.mou.detail`

Purpose:

- Return one admin MOU detail DTO with relation summaries/details.

Classification:

- Admin.

Required params:

- `mou_id` or `id`
- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2AdminMOU_()`.

Private fields never exposed publicly:

- This is admin-only and must not be reused for public pages.

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

### `v2.admin.mobility.detail`

Purpose:

- Return one admin Mobility project detail DTO including participants, budgets, and files.

Classification:

- Admin.

Required params:

- `mobility_id` or `id`
- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2AdminMobilityProject_()`.

Private fields never exposed publicly:

- participant names
- `person_id`
- gender row-level data
- unit/person snapshots
- budgets
- internal files

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

- Implemented through finalized Travel DTO helper: `getV2AdminTravelList_()`.
- Router-local Travel admin helper has been removed.

### `v2.admin.travel.detail`

Purpose:

- Return one admin Travel detail DTO including participant DTOs, budget DTOs, files, summaries, and audit.

Classification:

- Admin.

Required params:

- `travel_id` or `id`
- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2AdminTravel_()`.

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

- Implemented through finalized Travel DTO helper.

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

### `v2.admin.scholarship.detail`

Purpose:

- Return one admin Scholarship detail DTO with relation summaries/details.

Classification:

- Admin.

Required params:

- `scholarship_id` or `id`
- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2AdminScholarship_()`.

Private fields never exposed publicly:

- creator/updater fields
- internal notes
- non-public files
- budgets if present

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

### `v2.admin.event.detail`

Purpose:

- Return one admin Event detail DTO with relation summaries/details.

Classification:

- Admin.

Required params:

- `event_id` or `id`
- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2AdminEvent_()`.

Private fields never exposed publicly:

- creator/updater fields
- internal notes
- non-public files
- private operational fields

TODO status:

- Implemented through existing Admin DTO helper.

### `v2.admin.event.validate`

Purpose:

- Validate and normalize an Event metadata-only write payload without writing to any sheet.

Classification:

- Admin.
- Dry-run/validation only.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.
- `title`, `title_th`, or `title_en`.
- `start_date`.

Optional params:

- `event_id` or `id`
- `type` or `event_type`
- `event_mode`
- `country_id` or country display fallback through `country`, `country_name`, or `countryName`
- `continent`
- `organizer_unit_id`, `unit_id`, or organizer/unit display fallback through `organizer`, `unit`, or `organizer_unit`
- `location`
- `meeting_url`
- `end_date`
- `time` or explicit `start_time` / `end_time`
- `participant_count`
- `detail`, `detail_th`, or `detail_en`
- `link`, `link_url`, or `detail_url`
- `public_visible`
- `status`
- `pin`

Response shape:

- Standard router response.
- `data.dry_run === true`.
- `data.write_enabled === false`.
- `data.normalized_event` previews the normalized `EVENT` row shape:

```javascript
{
  event_id: string,
  title_th: string,
  title_en: string,
  event_type: string,
  event_mode: string,
  organizer_unit_id: string,
  organizer_display: string,
  country_id: string,
  country_display: string,
  continent: string,
  location: string,
  meeting_url: string,
  start_date: string,
  end_date: string,
  start_time: string,
  end_time: string,
  participant_count: number,
  detail_th: string,
  detail_en: string,
  link_url: string,
  pin: boolean,
  status: string,
  public_visible: boolean,
  is_deleted: false
}
```

Blocked operations:

- sheet write
- file upload
- image upload
- file relation write
- delete

TODO status:

- Implemented as a validation/dry-run route only.
- No frontend wiring.
- No write route.

### `v2.admin.event.create.dryRun`

Purpose:

- Preview a future Event metadata-only create payload without writing to any sheet.

Classification:

- Admin.
- Dry-run only.

Required params:

- Same payload contract as `v2.admin.event.validate`.

Response shape:

- Same as `v2.admin.event.validate`.
- `data.mode === "create.dryRun"`.
- `data.write_enabled === false`.

TODO status:

- Implemented as dry-run only.
- No real create route exists yet.

### `v2.admin.event.update.dryRun`

Purpose:

- Preview a future Event metadata-only update payload without writing to any sheet.

Classification:

- Admin.
- Dry-run only.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.
- `event_id` or `id`.
- Same metadata payload contract as `v2.admin.event.validate`.

Response shape:

- Same as `v2.admin.event.validate`.
- `data.mode === "update.dryRun"`.
- `data.write_enabled === false`.

TODO status:

- Implemented as dry-run only.
- No real update route exists yet.

### `v2.admin.dashboard.summary`

Purpose:

- Return admin-safe dashboard aggregate counts for V2 modules.

Classification:

- Admin.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2AdminDashboardSummary_()`.

Private fields never exposed publicly:

- Admin aggregate only. Do not use this route on public pages.

TODO status:

- Implemented as a safe aggregate DTO.
- May need refinement once dashboard frontend requirements are finalized.

### `v2.admin.report.summary`

Purpose:

- Return admin-safe report aggregate counts for V2 modules, optionally filtered by fiscal year.

Classification:

- Admin.

Required params:

- Authenticated V2 admin session through `requireV2Admin_()`.

Optional params:

- `fiscal_year`
- `year`

Response shape:

- Standard router response.
- `data` is returned by `getV2AdminReportSummary_()`.

Private fields never exposed publicly:

- Admin aggregate only. Do not use this route on public pages.

TODO status:

- Implemented as a safe aggregate DTO.
- Export/report table DTOs are still future work.

### Lookup Routes

Purpose:

- Return active, sanitized master data for frontend selectors.

Classification:

- Public-safe lookup.

Required params:

- None.

Optional params:

- None currently stabilized.

Routes:

- `v2.lookup.countries`
- `v2.lookup.units`
- `v2.lookup.fileRoles` (normalized internally as `v2.lookup.fileroles`)
- `v2.lookup.budgetTypes` (normalized internally as `v2.lookup.budgettypes`)

Response shape:

- Standard router response.
- `data` is an array of active lookup DTOs.

Private fields never exposed:

- raw master rows
- audit fields
- soft-deleted rows

TODO status:

- Implemented through `IROUP_V2_DTO_LOOKUP.gs`.

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

### `v2.public.mou.map`

Purpose:

- Return public-safe MOU country map aggregates.

Classification:

- Public.

Required params:

- None.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2PublicMOUMapData_()`.

Private fields never exposed:

- raw MOU rows
- internal notes
- creator/updater fields
- budgets
- non-public files

TODO status:

- Implemented.

### `v2.public.stats`

Purpose:

- Return public-safe aggregate stats across public modules.

Classification:

- Public.

Required params:

- None.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2PublicStats_()`.

Private fields never exposed:

- participant identities
- budgets
- internal notes
- audit fields
- raw rows

TODO status:

- Implemented.

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

### `v2.public.mobility.list`

Purpose:

- Return public-safe Mobility project list DTOs.

Classification:

- Public.

Required params:

- None.

Optional params:

- None currently stabilized.

Response shape:

- Standard router response.
- `data` is returned by `listV2PublicMobility_()`.

Private fields never exposed:

- participant names
- `person_id`
- student/staff IDs
- gender row-level data
- unit snapshots tied to people
- budgets
- internal notes
- non-public files
- creator/updater fields

TODO status:

- Implemented through existing Public DTO helper.

### `v2.public.mobility.map`

Purpose:

- Return public-safe Mobility country map aggregates.

Classification:

- Public.

Required params:

- None.

Optional params:

- None.

Response shape:

- Standard router response.
- `data` is returned by `getV2PublicMobilityMapData_()`.

Private fields never exposed:

- participant identities
- budgets
- internal notes
- audit fields
- raw rows

TODO status:

- Implemented.

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

- Implemented through finalized Travel DTO helper: `getV2PublicTravelSummary_()`.
- Router-local Travel public summary helper has been removed.

### `v2.public.travel.list`

Purpose:

- Return public-safe Travel list DTOs.

Classification:

- Public.

Required params:

- None.

Optional params:

- None currently stabilized.

Response shape:

- Standard router response.
- `data` is returned by `listV2PublicTravel_()`.

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

- Implemented through finalized Travel DTO helper.

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
- Confirm exact DTO field names for each public page.
- Confirm admin list vs detail endpoints for each module.
- Add write contracts separately for admin add/edit/delete flows.
- Keep production `Code.gs` untouched until deployment wiring is explicitly approved.
