# V2 Write Isolation Plan

Date: 2026-05-11

Status: planning only. No V2 write routes, frontend write flows, upload flows, or production cutover are implemented by this document.

## Purpose

Define the safest architecture for introducing V2 admin writes after the current coexistence milestones:

- public V2 activation
- dashboard read-only V2 summary sidecar
- report read-only V2 summary sidecar
- travel read-only V2 list sidecar

The goal is to avoid a hard cutover from V1 generic sheet writes to V2 normalized writes. V1 must remain operational and recoverable while each V2 write path is designed, validated, and activated one page at a time.

## Current V1 Write Surface Map

The current production write surface lives in `Team IROUP/iroup-config.js`.

| Helper | Method | Current role | Isolation risk |
|---|---|---|---|
| `IROUP.add(sheet, data)` | POST | Generic flat-sheet create | High: accepts sheet names and raw page-local payloads |
| `IROUP.edit(sheet, id, data)` | POST | Generic flat-sheet update | High: flat row mutation by V1 sheet ID |
| `IROUP.delete(sheet, id)` | POST | Generic delete | High: delete semantics may not match V2 soft-delete/audit requirements |
| `IROUP.uploadFile(base64, fileName, folderName)` | POST | V1 Drive upload | High: uploads are not normalized into V2 `FILES` relation rows |
| `IROUP.uploadImage(base64, fileName, folderName)` | POST | V1 image upload | High: poster/public visibility metadata is implicit |
| `IROUP.searchStaff(query)` | GET | Staff lookup for forms | Medium: read-only, but tightly coupled to write forms and person snapshots |
| Modal form hydration | DOM/local state | Fills edit forms from V1 flat rows | High: V2 DTOs are normalized and relation-based |
| Inline table mutations | DOM/local arrays | Edits/deletes from rendered rows | Medium-high: assumes V1 row IDs and immediate reload behavior |

## Page Risk Matrix

| Page | Read dependencies | Write dependencies | Upload dependencies | Modal/form coupling | Normalization complexity | Risk |
|---|---|---|---|---|---|---|
| `mou.html` | V1 `getAll(MOU)`, map/table local aggregation | `IROUP.add/edit/delete(MOU)` | `uploadMouFile()` via `IROUP.uploadFile` | custom country picker, MOU modal, file URL field | MOU parent plus `FILES` and later `BUDGET` relation rows | Medium-high |
| `mobility.html` | V1 `getAll(INBOUND/OUTBOUND)`, staff search | `IROUP.add/edit/delete(INBOUND/OUTBOUND)` | none found in current scan | duplicated/overlaid save/render paths, inline table actions | V2 requires `MOBILITY_PROJECT` plus `MOBILITY_PARTICIPANT` split | High |
| `travel.html` | V1 `getAll(TRAVEL/STAFF/COUNTRY)` | `IROUP.add/edit/delete(TRAVEL)`, `quickAddStaff()` | `uploadFileFromInput()` via `IROUP.uploadFile` | staff chips, selected staff snapshots, country lookup | V2 requires `TRAVEL` plus `TRAVEL_PARTICIPANT` split | High |
| `scholarship-events.html` | V1 `getAll(SCHOLAR/EVENT)` | `IROUP.add/edit/delete(SCHOLAR/EVENT)` | `uploadImage()` and `uploadFile()` for poster/file URLs | dual scholarship/event modal, poster/file URL fields | parent row plus `FILES`; event metadata is comparatively simple | Medium |

## DTO Strategy

Do not wrap V1 flat form payloads directly into V2 writes.

Each write migration needs an explicit module DTO builder:

- Page form state -> canonical V2 write payload.
- V2 write payload -> backend validation.
- Backend validation -> normalized sheet rows and relation rows.
- Response DTO -> optional page-local compatibility adapter for display.

Recommended shape:

```text
page form data
  -> buildV2<Event|Scholarship|MOU|Travel|Mobility>WritePayload()
  -> IROUP_V2.admin.<module><Create|Update>()
  -> V2 backend validation
  -> normalized rows
  -> read DTO returned from detail route
```

DTO rules:

- Use V2 IDs, not display names, where lookup relations exist.
- Keep V1 display-name fallbacks only inside temporary adapter layers.
- Treat `FILES`, `BUDGET`, `MOBILITY_PARTICIPANT`, and `TRAVEL_PARTICIPANT` as relation rows, not embedded text blobs.
- Use explicit `public_visible`, `visibility_level`, `status`, `created_by`, and `updated_by` fields.
- Use soft-delete semantics for delete routes.
- Keep backend validation authoritative; frontend validation is only ergonomic.

## Upload Isolation Plan

Do not migrate uploads in the first V2 write pilot.

Initial V2 write pilot should be metadata-only:

- accept existing manual URL fields if already present
- do not upload binary files through V2
- do not create V2 `FILES` rows from uploaded files until upload routes are designed

Later V2 upload route family:

| Proposed route | Purpose |
|---|---|
| `v2.admin.file.upload` | Upload binary file to controlled Drive folder |
| `v2.admin.file.attach` | Attach an existing URL/file ID to a module record |
| `v2.admin.file.update` | Update role/visibility/title metadata |
| `v2.admin.file.delete` | Soft-delete file relation metadata |

Upload requirements:

- require admin auth and role authorization
- validate parent module and record ID
- write `FILES` relation rows with `module`, `record_id`, `file_role_id`, `visibility_level`, `public_file_url`, `drive_file_id`, and audit fields
- default files to non-public unless explicitly marked public
- never rely on frontend filtering to hide private files

## Auth Direction

Current V2 admin auth is sufficient for read-only sidecars but should be hardened before writes.

Current bridge:

- existing V1 session `adminToken`
- SHA-256 token map in isolated V2 Script Properties
- active admin lookup in V2 `ADMIN` sheet
- fallback to `Session.getActiveUser()` where available

Recommended write auth:

- require `requireV2AdminRole_()` for every write route
- allow only `admin` or `superadmin` roles for create/update
- reserve destructive/restore operations for `superadmin` where appropriate
- write audit fields from the authenticated V2 admin user
- keep token-map bridge only as a temporary coexistence path
- move toward signed V2 admin tokens or Google access/ID token verification

## Rollback Model

V2 writes must be reversible at the page level.

Rollback principles:

- never replace `IROUP.SCRIPT_URL`
- never remove V1 helpers during a pilot
- keep V1 submit path intact until V2 create/update/delete is proven
- add V2 writes behind page-local feature switches or isolated handlers
- activate only one page and one write type at a time
- after V2 write success, reload from the same page's current source until read migration is intentionally approved
- if V2 write fails, surface the error and keep V1 flow available
- use soft-delete instead of hard delete in V2

Rollback checklist:

1. Disable the page-local V2 write switch.
2. Re-enable the existing V1 `IROUP.add/edit/delete` path.
3. Keep V2 read-only sidecars harmless or remove only the affected page script activation.
4. Do not touch the V1 Apps Script deployment.
5. Verify the existing V1 page can create/edit/delete again.

## Recommended Phases

1. **Backend write contract design**
   - Define V2 create/update/delete request and response DTOs per module.
   - Document required fields, optional fields, relation rows, and validation errors.

2. **Backend test-only write routes**
   - Add isolated V2 routes without frontend activation.
   - Require admin role authorization.
   - Use soft-delete and audit fields.

3. **Adapter wrappers**
   - Add explicit wrappers such as `IROUP_V2.admin.eventCreate(payload)`.
   - Do not add generic `add/edit/delete` V2 helpers.

4. **Page-local DTO builder**
   - Build payload from existing modal form state.
   - Keep existing V1 submit handler active.

5. **Dry-run validation**
   - Add non-mutating validation where possible before real writes.
   - Compare frontend payload to backend expected DTO.

6. **First metadata-only create/update pilot**
   - One page.
   - One module.
   - No uploads.
   - No delete initially.

7. **Soft-delete pilot**
   - Add delete only after create/update and reload behavior are stable.

8. **Upload pilot**
   - Add V2 upload only after metadata writes and file relation DTOs are stable.

9. **Read-source migration**
   - Only after writes are proven, switch that page's rendered data source to V2.

10. **Retire V1 page writes**
   - Only after repeated live verification and rollback rehearsal.

## First Safe Write Migration Candidate

Recommended first write pilot:

```text
scholarship-events.html
event metadata-only create/update
```

Why this is safest:

- event metadata is simpler than MOU budgets/files and mobility/travel participant splits
- public event DTO rendering has already been migrated and validated
- the page already separates event and scholarship modal sections
- event create/update can initially exclude upload handling
- no staff/person relation migration is required for the first pilot

Pilot boundaries:

- event create/update only
- no delete in the first pass
- no upload migration
- no scholarship write migration in the same pass
- no dashboard/report/admin architecture changes
- keep V1 event write handler available for rollback

Required preconditions:

- V2 backend routes for event create/update exist and are tested outside the frontend
- V2 adapter exposes explicit event create/update wrappers
- backend validates admin role, required fields, status/date fields, visibility flags, and audit fields
- browser smoke confirms V1 event and scholarship flows still work if V2 is unavailable

## Explicit Non-Goals

- no replacement of `IROUP.SCRIPT_URL`
- no hard production cutover
- no generic V2 sheet write helper
- no frontend rewrite
- no auth rewrite in the first write pilot
- no upload migration in the first write pilot
- no multi-page write activation
- no production `Code.gs` changes
