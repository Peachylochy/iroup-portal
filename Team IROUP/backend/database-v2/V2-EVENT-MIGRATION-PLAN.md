# V2 EVENT Migration Plan

Date: 2026-05-12

Status: planning only. No runtime changes, no frontend activation, no Apps Script
deployment changes are made by this document.

Operating constraint:
- `V2_EVENT_WRITE_UI_ENABLED = false`
- `IROUP_V2_EVENT_WRITE_ENABLED = FALSE` (Apps Script Script Property)

Source-of-truth direction:
- V2 is the intended source of truth for the new EVENT workflow.
- V1 remains a legacy fallback/runtime comparison source only.
- Legacy V1/V2 row parity is informational and is not a migration gate.
- Activation gates are V2 master readiness, V2 render stability, and V2 save stability.

---

## 1. Current V1 EVENT Lifecycle Audit

All current production EVENT operations in `scholarship-events.html`.

### 1.1 Data Load (READ)

```
round9LoadScholarEvent()
  -> IROUP.getAll(IROUP.SHEETS.SCHOLAR)   // V1 flat SCHOLAR sheet
  -> IROUP.getAll(IROUP.SHEETS.EVENT)     // V1 flat EVENT sheet
  -> round9RenderScholars(list)
  -> round9RenderEvents(list)
  -> KPI count updates
```

Data source: V1 production Apps Script via `IROUP.SCRIPT_URL`.  
Reads both SCHOLAR and EVENT in a single call pair.  
No pagination. Full table on every load.

### 1.2 Edit Modal Population (FORM FILL)

```
openModal(type, id)
  -> fillEventForm(row)  // hydrates modal inputs from V1 flat row
```

V1 field names used directly in `fillEventForm`:

| Input position | V1 field name   | V2 field name         |
|---------------|-----------------|----------------------|
| inputs[0]     | `ชื่อกิจกรรม`   | `title`              |
| inputs[1]     | `ประเภท`        | `type` / `event_type`|
| inputs[2]     | `หน่วยงาน`      | `organizer`          |
| inputs[3]     | `วันเริ่ม`      | `start_date`         |
| inputs[4]     | `วันสิ้นสุด`    | `end_date`           |
| inputs[5]     | `เวลาเริ่ม`     | `start_time`         |
| inputs[6]     | `เวลาสิ้นสุด`   | `end_time`           |
| inputs[7]     | `สถานที่`       | `location`           |
| inputs[8]     | `จำนวน`         | `participant_count`  |
| inputs[9]     | `รายละเอียด`    | `detail`             |
| asset input   | `Poster_URL`    | `Poster_URL` (V1 text URL; V2 FILES relation) |
| asset input   | `ไฟล์_URL`      | `ไฟล์_URL` (V1 text URL; V2 FILES relation) |

The field mapping is handled by `normalizeV2EventPayload()` and `buildV2EventFormPayload()`.

### 1.3 Create / Update (WRITE)

Current V1 path:
```
round9Save()  [type === 'event']
  -> collects V1 flat dict from eventForm inputs
  -> IROUP.add(IROUP.SHEETS.EVENT, data)       // new record
  -> IROUP.edit(IROUP.SHEETS.EVENT, id, data)  // existing record
  -> round9LoadScholarEvent()  // reload from V1
```

V2 gated path (currently disabled, `V2_EVENT_WRITE_UI_ENABLED = false`):
```
round9Save()  [type === 'event' && V2_EVENT_WRITE_UI_ENABLED]
  -> saveV2EventMetadataPilot(id)
       -> buildV2EventFormPayload(eventForm)
       -> buildHydratedV2EventUpdatePayload(existingRow, formPayload)  // for update
       -> normalizeV2EventPayload(formPayload)                         // for create
       -> IROUP_V2.admin.eventCreate(payload)  or  eventUpdate(payload)
  -> round9LoadScholarEvent()  // STILL reloads from V1 (source mismatch — see §4)
```

### 1.4 Upload / Image (V1 only, no V2 path)

```
roundFinalUploadAsset(input, kind, targetName)
  -> IROUP.uploadImage(base64, file.name)   // kind === 'image'
  -> IROUP.uploadFile(base64, file.name)    // kind === 'file'
  -> stores returned URL into form input (Poster_URL or ไฟล์_URL)
  -> URL is then saved as a flat text field in round9Save()
```

No V2 equivalent. V2 requires `v2.admin.file.upload` → `FILES` relation row.

### 1.5 Delete (V1 hard delete, no V2 path)

```
round9Delete('event', id)
  -> IROUP.delete(IROUP.SHEETS.EVENT, id)  // V1 hard delete
  -> round9LoadScholarEvent()
```

No V2 event delete route exists. V2 uses soft-delete semantics (`is_deleted = TRUE`).

### 1.6 SCHOLAR flows (must NOT be touched during EVENT migration)

All SCHOLAR operations in the same `round9Save()` and `round9Delete()` functions:
- Save: `IROUP.add/edit(IROUP.SHEETS.SCHOLAR, data)`
- Delete: `IROUP.delete(IROUP.SHEETS.SCHOLAR, id)`
- Upload: shares `roundFinalUploadAsset()` with EVENT
- Read: shares `round9LoadScholarEvent()` with EVENT

SCHOLAR migration is explicitly out of scope for all phases below.

---

## 2. V2 Backend Coverage Status

| Route                            | Backend exists | Adapter wrapper | Smoke tested |
|----------------------------------|----------------|-----------------|--------------|
| `v2.admin.event.list`            | ✅             | ✅ `eventList`   | partial      |
| `v2.admin.event.detail`          | ✅             | ✅ `eventDetail` | no           |
| `v2.admin.event.validate`        | ✅             | ✅ `eventValidate` | yes (dry-run session) |
| `v2.admin.event.create.dryrun`   | ✅             | ✅ `eventCreateDryRun` | yes |
| `v2.admin.event.update.dryrun`   | ✅             | ✅ `eventUpdateDryRun` | yes |
| `v2.admin.event.create`          | ✅             | ✅ `eventCreate` | ✅ live smoke |
| `v2.admin.event.update`          | ✅             | ✅ `eventUpdate` | ✅ live smoke |
| `v2.admin.event.delete`          | ❌ not yet     | ❌ not yet       | —            |
| `v2.admin.file.upload`           | ❌ not yet     | ❌ not yet       | —            |
| `v2.admin.file.attach`           | ❌ not yet     | ❌ not yet       | —            |
| `v2.admin.file.delete`           | ❌ not yet     | ❌ not yet       | —            |

---

## 3. V1 Dependency Map — EVENT Flows

| Flow              | V1 dependency                                 | Isolation risk | V2 equivalent status |
|-------------------|-----------------------------------------------|----------------|----------------------|
| Event list read   | `IROUP.getAll(IROUP.SHEETS.EVENT)`            | High — flat row shape couples to render | `v2.admin.event.list` exists |
| Event detail fill | V1 flat row from `IROUND9_events` array       | High — Thai field names | `v2.admin.event.detail` exists |
| Event create      | `IROUP.add(IROUP.SHEETS.EVENT, data)`         | High — writes V1 flat sheet | `v2.admin.event.create` exists & smoke tested |
| Event update      | `IROUP.edit(IROUP.SHEETS.EVENT, id, data)`    | High — V1 row ID | `v2.admin.event.update` exists & smoke tested |
| Event delete      | `IROUP.delete(IROUP.SHEETS.EVENT, id)`        | High — hard delete | ❌ no V2 route |
| Poster upload     | `IROUP.uploadImage(base64, name)`             | High — V1 Drive folder, flat URL | ❌ no V2 route |
| File upload       | `IROUP.uploadFile(base64, name)`              | High — V1 Drive folder, flat URL | ❌ no V2 route |
| Reload after save | `IROUP.getAll(IROUP.SHEETS.EVENT)` (V1)       | **Critical** — see §4 blocker | requires read migration |
| Scholar read      | `IROUP.getAll(IROUP.SHEETS.SCHOLAR)`          | Shared with EVENT load; do not touch | out of scope |
| Scholar write     | `IROUP.add/edit(IROUP.SHEETS.SCHOLAR, data)`  | Shared `round9Save()`; must stay V1 | out of scope |
| Scholar delete    | `IROUP.delete(IROUP.SHEETS.SCHOLAR, id)`      | Shared `round9Delete()`; must stay V1 | out of scope |
| Scholar upload    | shares `roundFinalUploadAsset()`              | Shared upload handler; must stay V1 | out of scope |

---

## 4. Critical Blockers and Risk Points

### 4.1 Read/Write Source Mismatch (Blocker for write activation)

**This is the most important architectural constraint.**

After `saveV2EventMetadataPilot()` succeeds, `round9LoadScholarEvent()` reloads from
**V1 via `IROUP.getAll(IROUP.SHEETS.EVENT)`**. V2 writes land in the isolated
`IROUP_DATABASE_V2` spreadsheet. V1 reload will not reflect V2-written rows.

Consequence if V2 writes are activated without read migration:
- A new event created via V2 will not appear in the rendered card list.
- An event updated via V2 will appear unchanged after reload.
- The admin will see stale data and may attempt to create duplicate records.

Resolution options (choose one before Phase C):

**Option A — Switch reads and writes together.**
Migrate `round9LoadScholarEvent()` to use `v2.admin.event.list` for the EVENT portion
at the same time as write activation. This is the cleanest path.

**Option B — Dual-write during transition.**
After V2 save succeeds, also call the V1 save path to keep V1 in sync as the
display source. Adds complexity and risk of partial-write states.

**Option C — Accept shadow-only V2 writes (not recommended for production).**
V2 writes are real but invisible in the UI until read migration. Only acceptable
for a controlled isolated test period, not for production activation.

**Recommended: Option A — coactivate list read + write migration.**

### 4.2 Form Field Coverage Gap

Current `buildV2EventFormPayload()` hardcodes several important V2 fields:

| V2 field         | Current form behavior | Required for production |
|------------------|-----------------------|------------------------|
| `status`         | hardcoded `'draft'`   | Admin should be able to set published/cancelled |
| `public_visible` | hardcoded `false`     | Admin must control public visibility |
| `pin`            | hardcoded `false`     | Admin may want to pin events |
| `link`           | not in form           | Event link/detail URL field needed |
| `country`        | not in form           | Country of event location |
| `continent`      | not in form           | Resolved from country; may be backend-only |
| `organizer_unit_id` | not in form        | V2 ID for organizer unit; lookup needed |
| `country_id`     | not in form           | V2 ID for country; lookup needed |

Fields like `organizer_unit_id` and `country_id` require lookup tables from
`v2.lookup.units` and `v2.lookup.countries`. During a first write pilot, display-name
fallbacks are acceptable. For production, the form should let admins select from
V2 unit/country lookups.

**Minimum required before Phase C production activation:**
- `status` must be user-settable (not hardcoded `draft`)
- `public_visible` must be user-settable

### 4.3 V1 Delete vs V2 Soft-Delete Mismatch

`round9Delete('event', id)` calls V1 hard delete. There is no V2 event delete route.
V2 uses soft-delete (`is_deleted = TRUE`). If V2 reads are active, soft-deleted V2
rows must be excluded from list results (already done in V2 backend aggregate queries).

If EVENT reads are migrated to V2 but delete remains V1, deleted events will vanish
from V1 but will still appear in V2 list queries unless the V2 row is also soft-deleted.

Resolution: add `v2.admin.event.softDelete(eventId)` route before migrating delete.

### 4.4 Upload Architecture Mismatch

V1 uploads return a flat Drive URL stored directly in `Poster_URL` / `ไฟล์_URL`.
V2 architecture requires a `FILES` relation row with `module`, `record_id`,
`file_role_id`, `visibility_level`, `public_file_url`, `drive_file_id`, and audit fields.

No V2 upload route exists. Upload migration is the most complex sub-phase and must
remain deferred until metadata writes and `FILES` relation DTOs are stable.

During the metadata-only write phase, poster and file URLs can continue to be handled
as V1 uploads with the resulting URL passed through the V2 event payload as flat fields
(`Poster_URL`, `ไฟล์_URL`). The V2 backend must accept these as optional flat URL
fields during the transition. This is an explicit temporary bridge — not the end state.

### 4.5 SCHOLAR Contamination Risk

`round9Save()`, `round9Delete()`, and `round9LoadScholarEvent()` all handle both
`'event'` and `'scholar'` types in the same functions. The gated V2 branch is already
isolated by `if(type === 'event' && V2_EVENT_WRITE_UI_ENABLED)`, but any refactoring
of these shared functions carries risk of accidentally altering the SCHOLAR path.

Mitigation: treat the shared save/delete/load functions as read-only during EVENT
migration phases. Any EVENT-specific changes must use the gated branch or new separate
handlers, never modifying the `type === 'scholar'` branch.

### 4.6 Reload After V2 Save Uses IROUND9_events (V1 array)

`getCurrentV2EventRow()` and `buildHydratedV2EventUpdatePayload()` look up the existing
event row from `IROUND9_events`, which is populated from V1. If reads are migrated to
V2, this lookup array must also be replaced with V2 list data.

---

## 5. V2 Fields Not Yet in EVENT Form

These fields are supported by the V2 backend and normalizer but have no form input:

| Field            | V2 normalizer key | Notes |
|------------------|-------------------|-------|
| `status`         | `status`          | Hardcoded `draft`. Admin needs a status dropdown. |
| `public_visible` | `public_visible`  | Hardcoded `false`. Admin needs a visibility toggle. |
| `pin`            | `pin`             | Hardcoded `false`. Admin may want a pin toggle. |
| `link`           | `link`            | No form input. Add link/URL field to event form. |
| `country`        | `country`         | Not in current event form. |
| `continent`      | `continent`       | May be resolved from country by backend. |
| `organizer_unit_id` | `organizer_unit_id` | Requires V2 unit lookup. |
| `country_id`     | `country_id`      | Requires V2 country lookup. |

For Phase A–B (sidecar + form enhancement), these should be added to the form
before full write activation. `status`, `public_visible`, `pin`, and `link` are the
most operationally important.

---

## 6. Phased Migration Checklist

### Phase A — V2 Event List Read Sidecar (no write activation)

Purpose: validate V2 admin event list data against V1 before any write migration.
Pattern: identical to the `travel.html` read-only list sidecar.

Pre-conditions:
- [ ] `v2.admin.event.list` returns correct data from live V2 deployment
- [ ] V2 event count matches V1 count (or differences are explainable by test rows)

Tasks:
- [ ] Add V2 admin event list sidecar call to `round9LoadScholarEvent()`:
      `IROUP_V2.admin.eventList()` after V1 load succeeds
- [ ] Store result in page-local `v2EventList` (do not feed into `IROUND9_events`)
- [ ] Add `#v2EventReadiness` badge: `V2 events: checking / ready / unavailable`
- [ ] Log V2 list to console with count and first row for manual comparison
- [ ] V2 failure must not throw into V1 load path

Rollback: remove or comment out the sidecar call. V1 rendering unchanged.

Gate before Phase B: V2 event list data confirmed correct in browser console.

---

### Phase B — Event Form Enhancement for V2 Fields

Purpose: add the missing V2 fields to the event modal form before write activation.

Pre-conditions:
- [ ] Phase A gate passed
- [ ] V2 backend field requirements reviewed against current form

Tasks:
- [x] Add `status` dropdown to event form (values: `draft`, `published`, `cancelled`)
- [x] Add `public_visible` toggle/checkbox to event form
- [x] Add `pin` toggle/checkbox to event form
- [x] Add `link` text input to event form
- [x] Update `buildV2EventFormPayload()` to read these new inputs instead of hardcoding
- [x] Update `fillEventForm(row)` to populate these new fields from the existing V1 row
      (map V1 flat values to new form inputs; V1 may not have all fields)
- [ ] Verify dry-run preview (`previewV2EventDraft`) returns correct normalized shape
      for payloads that include `status`, `public_visible`, `pin`, and `link`
- [ ] V1 save path must continue to include these new values (or ignore gracefully if V1
      sheet does not have matching columns)

Rollback: remove the new form fields. `buildV2EventFormPayload()` falls back to
hardcoded defaults. V1 save path unaffected.

Gate before Phase C: dry-run returns expected normalized EVENT shape with all new fields.

---

### Phase C — Activate V2 EVENT Metadata Writes (Controlled)

Purpose: switch EVENT create/update to the V2 write path for a controlled test period.
This must happen simultaneously with Phase D (read migration) to avoid source mismatch.

Pre-conditions:
- [ ] Phase B gate passed
- [ ] Phase D (EVENT list read from V2) is ready to activate at the same time
- [ ] V1 EVENT write flow confirmed working independently (V1 rollback test)
- [ ] Apps Script deployment is current (IROUP_V2_AUTH.gs, IROUP_V2_ROUTER.gs, IROUP_V2_ADMIN_API.gs are up to date)
- [ ] `IROUP_V2_EVENT_WRITE_ENABLED = TRUE` has been set in Script Properties
- [ ] Admin login verified (Google token auth working)

Tasks:
- [ ] Set `V2_EVENT_WRITE_UI_ENABLED = true` in `scholarship-events.html`
- [ ] Activate Phase D simultaneously (see below)
- [ ] Test EVENT create: fill all required fields, save, verify record appears in V2 list
- [ ] Test EVENT update: open existing event, modify fields, save, verify V2 list reflects changes
- [ ] Test that SCHOLAR save is unaffected (create/edit a scholarship record)
- [ ] Test that upload still works through V1 path (poster/file upload unaffected)
- [ ] Test that delete still works through V1 path (round9Delete uses V1)
- [ ] Document any validation errors observed during live test

Rollback procedure:
1. Set `V2_EVENT_WRITE_UI_ENABLED = false`
2. Set `IROUP_V2_EVENT_WRITE_ENABLED = FALSE` in Script Properties
3. Verify `round9Save()` falls through to `IROUP.add/edit()` (V1 path)
4. Verify event list renders correctly from V1 data

Gate before Phase E: EVENT create/update working in V2 for multiple cycles without errors.

---

### Phase D — Switch EVENT List Read to V2 (co-activate with Phase C)

Purpose: replace `IROUP.getAll(IROUP.SHEETS.EVENT)` with `v2.admin.event.list` as the
primary EVENT data source. Must happen at the same time as Phase C.

Pre-conditions:
- [ ] Phase A gate passed (V2 event list data validated against V1)
- [ ] V2 event DTO field names mapped to page-local render shape
- [ ] `IROUND9_events` population updated to receive V2 DTO rows
- [ ] `fillEventForm(row)` updated to read V2 field names alongside V1 field names

Tasks:
- [ ] In `round9LoadScholarEvent()`, replace V1 event load with `IROUP_V2.admin.eventList()`
      as the primary source (SCHOLAR load remains V1)
- [ ] Map V2 DTO fields to the existing render shape in `round9RenderEvents()`
      (existing V1 field references must be updated or aliased)
- [ ] Update `IROUND9_events` population to use V2 rows
- [ ] `getCurrentV2EventRow()` will now find rows with V2 field names — verify lookup still works
- [ ] Keep V1 event load as a fallback if V2 is unavailable (graceful degradation)
- [ ] Verify `fillEventForm(row)` correctly hydrates modal from V2 row fields

Rollback procedure:
1. Restore V1 `IROUP.getAll(IROUP.SHEETS.EVENT)` as primary event source
2. Restore V1 field name references in render and form fill functions

Gate before Phase E: EVENT list renders correctly from V2 source for multiple page loads.

---

### Phase E — V2 EVENT Soft-Delete

Purpose: replace V1 hard delete with V2 soft-delete for EVENT records.

Pre-conditions:
- [ ] Phase C and Phase D gates passed
- [ ] `v2.admin.event.softDelete(eventId)` backend route designed and implemented
- [ ] `IROUP_V2.admin.eventSoftDelete(eventId)` adapter wrapper added
- [ ] V2 event list query excludes `is_deleted = TRUE` rows (already done in backend)

Tasks:
- [ ] Add `v2.admin.event.softDelete` route to backend
- [ ] Add `eventSoftDelete(eventId)` wrapper to `iroup-v2-api.js`
- [ ] In `round9Delete()` for `type === 'event'`, call V2 soft-delete instead of `IROUP.delete()`
- [ ] SCHOLAR delete must continue to use `IROUP.delete(IROUP.SHEETS.SCHOLAR, id)`
- [ ] Test: delete an event, verify it disappears from V2 list, verify V2 sheet has `is_deleted = TRUE`
- [ ] Test: SCHOLAR delete is unaffected

Rollback procedure:
1. Revert `round9Delete()` event branch to `IROUP.delete(IROUP.SHEETS.EVENT, id)`
2. Manually restore `is_deleted = FALSE` for any rows soft-deleted during the test

Gate before Phase F: EVENT soft-delete confirmed working. SCHOLAR delete confirmed unaffected.

---

### Phase F — V2 FILE Upload and FILES Relation (deferred)

Purpose: replace V1 Drive upload with a V2-normalized file/image upload path that
creates `FILES` relation rows.

Pre-conditions:
- [ ] Phases C–E complete and stable
- [ ] `v2.admin.file.upload` backend route designed with `FILES` relation row contract
- [ ] `v2.admin.file.attach` route designed for attaching existing URLs
- [ ] File visibility (`public_file_url`, `visibility_level`) semantics agreed
- [ ] `file_role_id` values defined in `FILE_ROLE_MASTER` for poster and attachment roles

Tasks (design phase — implementation in a separate pass):
- [ ] Design V2 file upload request/response DTO
- [ ] Design `FILES` relation row shape for events
- [ ] Define `file_role_id` values: `event_poster`, `event_attachment`
- [ ] Design migration strategy for existing V1 flat URLs (retroactive attach vs accept as legacy)
- [ ] Design `roundFinalUploadAsset()` replacement or extension for events
- [ ] Document how SCHOLAR file upload will be handled (V1 or separate V2 phase)

Rollback: if V2 upload fails, the form still accepts manual URL input. V1 upload
remains available as a fallback during the transition period.

Gate: V2 FILES relation rows created correctly for event poster and attachment uploads.

---

### Phase G — EVENT Reads: Detail Route (post-Phase D)

Purpose: replace page-local V1 array lookup with `v2.admin.event.detail` for the
modal edit context.

Pre-conditions:
- [ ] Phase D complete (V2 list is primary source)

Tasks:
- [ ] In `openModal('event', id)`, call `IROUP_V2.admin.eventDetail(id)` instead of
      finding from `IROUND9_events` array
- [ ] `getCurrentV2EventRow()` may be replaced with a direct V2 detail call

This is a minor refinement after Phase D. The array lookup from `IROUND9_events` is
functionally equivalent if the list is already from V2.

---

## 7. Independent vs Coupled Migration Units

| Phase | Independent? | Depends on | Blocks |
|-------|-------------|------------|--------|
| A — Event list sidecar | ✅ Yes | none | Phase B gate |
| B — Form enhancement | ✅ Yes | Phase A gate | Phase C |
| C — Write activation | ❌ No — must co-activate with D | Phase B, Phase D | Phase E |
| D — Read migration | ❌ No — must co-activate with C | Phase A | Phase C, Phase E |
| E — Soft-delete | ✅ After C+D | Phase C+D | Phase F |
| F — Upload/FILES | ✅ Yes (design phase is independent) | Phases C+D stable | — |
| G — Detail route | ✅ After D | Phase D | — |

Key coupling: **C and D must activate together** to avoid the read/write source
mismatch described in §4.1.

Key independence: **A, B, and F design** can proceed in any order relative to each
other. They each have their own stable rollback path.

---

## 8. Recommended Rollout Order

```
Phase A  (event list sidecar)
  -> validate V2 event data in console
  -> gate: V2 list matches V1

Phase B  (form enhancement)
  -> add status, public_visible, pin, link to event form
  -> verify dry-run includes new fields
  -> gate: dry-run shape correct

Phase C + D  (write activation + read migration — simultaneously)
  -> set V2_EVENT_WRITE_UI_ENABLED = true
  -> set IROUP_V2_EVENT_WRITE_ENABLED = TRUE in Script Properties
  -> switch event load to V2 list source
  -> gate: create/update/reload cycle confirmed for multiple records

Phase E  (soft-delete)
  -> add backend delete route
  -> add adapter wrapper
  -> gate: soft-delete confirmed, SCHOLAR unaffected

Phase F design  (upload/FILES — can run in parallel with A-E)
  -> design only: route DTOs, FILES relation shape, file roles
  -> no implementation until Phases C-E stable

Phase G  (detail route — minor, after D)
```

---

## 9. Rollback Points Summary

| After phase | Rollback action | V1 state |
|-------------|----------------|----------|
| After Phase A | Remove sidecar call | V1 load/render unchanged |
| After Phase B | Remove new form fields, restore hardcoded values | V1 save unaffected |
| After Phase C+D | `V2_EVENT_WRITE_UI_ENABLED = false`, restore V1 event load | Full V1 restore |
| After Phase E | Revert delete branch to `IROUP.delete()` | Hard delete behavior restored |
| After Phase F | V1 upload path always available during transition | V1 upload unchanged |

V1 save handler (`IROUP.add/edit/delete`) and SCHOLAR flows are never removed during
any phase above. The gated branch pattern ensures the V1 path is always the fallback
if the flag is disabled.

---

## 10. What Is Explicitly Out of Scope in All Phases Above

- SCHOLAR metadata write migration
- SCHOLAR delete migration
- SCHOLAR upload migration
- `mou.html`, `mobility.html`, `travel.html` write migration
- `IROUP.SCRIPT_URL` replacement
- V1 `backend/Code.gs` changes
- Production Apps Script deployment changes (other than Script Property toggling)
- Any changes to public-facing pages
- Any changes to `dashboard.html`, `report.html`, or the read-only sidecars
- Any multi-page write activation in a single pass
- Any hard production cutover

---

## 11. Files Modified by This Plan (Documentation Only)

```
Team IROUP/backend/database-v2/V2-EVENT-MIGRATION-PLAN.md  (new — this document)
```

No runtime files are modified by this planning document.

---

## 12. Phase B.5 - Controlled Co-Activation Preparation Audit

Status: planning only. No runtime behavior changes.

This audit prepares `scholarship-events.html` for future V1/V2 EVENT
co-activation without switching the render source yet.

### 12.1 Current EVENT Rendering Lifecycle

```
round9LoadScholarEvent()
  -> IROUP.getAll(IROUP.SHEETS.SCHOLAR)
  -> IROUP.getAll(IROUP.SHEETS.EVENT)
  -> round9RenderScholars(IROUND9_scholars)
  -> round9RenderEvents(IROUND9_events)
  -> update KPI cards from V1 arrays
  -> IROUP_V2.admin.eventList() sidecar
       -> round9V2Events = v2Res.data
       -> console count comparison only
```

- V1 remains the only rendered EVENT source.
- V2 `eventList()` is read-only sidecar data and is not fed into `IROUND9_events`.
- Event reload after save/delete still calls `round9LoadScholarEvent()` and reloads
  `IROUND9_events` from V1.
- Modal edit loading uses `IROUND9_events.find(x => String(x['ID']) === String(id))`.
- Event search uses `Object.values(row).join(' ').toLowerCase()` over the current
  V1 row object, then re-renders with `round9RenderEvents(filteredV1Rows)`.
- Status pills and filter selects currently change visual state only; they do not
  apply data filtering or sorting.
- No active event sort routine was found.

### 12.2 V1 Row-Shape Assumptions

| Area | Current assumption | V2 impact |
|------|--------------------|-----------|
| Event identity | Card edit/delete buttons pass `x['ID']` | V2 rows use `event_id`; adapter must expose a stable `ID` alias or update all callers together. |
| Render title | `x['ชื่อกิจกรรม']` | V2 uses `title_th` / `title_en`. |
| Render type | `x['ประเภท']` | V2 uses `event_type`. |
| Render organizer | `x['หน่วยงาน']` | V2 uses nested `organizer_unit` with `unit_name_th` / `unit_name_en`. |
| Render location | `x['สถานที่']` | V2 uses `location`. |
| Render dates | `x['วันเริ่ม']`, `x['วันสิ้นสุด']` | V2 uses `start_date`, `end_date`. |
| Render times | `x['เวลาเริ่ม']`, `x['เวลาสิ้นสุด']` | V2 uses `start_time`, `end_time`. |
| Render participants | `x['จำนวน']` | V2 uses numeric `participant_count`. |
| Render detail | `x['รายละเอียด']` | V2 uses `detail_th` / `detail_en`. |
| Poster/file buttons | `assetUrl(x,'Poster_URL')`, `assetUrl(x,'ไฟล์_URL')` | V2 admin DTO uses `file_summary`/`files`; current metadata bridge may not provide these flat URL keys. |
| Edit modal | `fillEventForm(row)` reads V1 Thai keys by input position | Must accept V2 keys or receive an adapted V1-compatible render row. |
| Hydrated update | `getCurrentV2EventRow()` currently reads from `IROUND9_events` | If `IROUND9_events` becomes V2 rows, hydration must use V2 identity and normalized fields. |
| Delete | `round9Delete('event', id)` calls V1 hard delete | V2 needs a future soft-delete route; do not switch delete with read/render. |
| Search | `Object.values(row)` assumes a flat row | V2 rows contain nested `organizer_unit`, `country`, `audit`, and summaries; plain object values can stringify as `[object Object]`. |

### 12.3 Compatibility Checklist

Fields already compatible or low-risk:

| UI need | V1 field | V2 field | Notes |
|---------|----------|----------|-------|
| Start date | `วันเริ่ม` | `start_date` | Same date semantics after adapter aliasing. |
| End date | `วันสิ้นสุด` | `end_date` | Same date semantics after adapter aliasing. |
| Start time | `เวลาเริ่ม` | `start_time` | Same time semantics after adapter aliasing. |
| End time | `เวลาสิ้นสุด` | `end_time` | Same time semantics after adapter aliasing. |
| Location | `สถานที่` | `location` | Direct string mapping. |
| Participant count | `จำนวน` | `participant_count` | Convert to display-safe string/number. |
| Status | optional V1 `สถานะ` | `status` | New form field reads both; render still derives timing badge from dates. |
| Public visible | optional V1 `เผยแพร่` | `public_visible` | New form field reads both; not rendered yet. |
| Pin | optional V1 `Pin` | `pin` | New form field reads both; event render does not display pin yet. |
| Link URL | optional V1 `Link` / `link_url` | `link_url` | New form field reads both; not rendered yet. |

Fields needing adapter normalization before any render-source swap:

| UI need | V2 source | Proposed page-local alias |
|---------|-----------|---------------------------|
| Edit/delete id | `event_id` | `ID` and `event_id` |
| Title | `title_th || title_en` | `ชื่อกิจกรรม` |
| Type | `event_type` | `ประเภท` |
| Organizer | `organizer_unit.unit_name_th || organizer_unit.unit_name_en || organizer_unit.unit_code` | `หน่วยงาน` |
| Country display | `country.country_name_th || country.country_name_en` | optional `ประเทศ` |
| Detail | `detail_th || detail_en` | `รายละเอียด` |
| Poster URL | `file_summary` / future `files.public` role | transitional `Poster_URL` |
| Attachment URL | `file_summary` / future `files.public` role | transitional `ไฟล์_URL` |
| Search text | selected scalar fields from V2 DTO | explicit `_searchText` or search helper |

Fields missing or not yet first-class in V2 list for current admin rendering:

| Current UI expectation | Gap |
|------------------------|-----|
| `Poster_URL` flat image URL | V2 list returns file summaries, not the V1 flat URL used by `assetUrl()`. |
| `ไฟล์_URL` flat attachment URL | V2 list returns file summaries, not the V1 flat URL used by `assetUrl()`. |
| Thai organizer display as a scalar | V2 returns nested unit reference; page expects a flat string. |
| V1 row `ID` | V2 uses `event_id`; aliases are required for edit/delete buttons. |

Fields missing in V1 but present in V2:

| V2 field | V1 status | Current handling |
|----------|-----------|------------------|
| `event_id` | V1 uses generic `ID` | Hydration accepts both, but render/edit still expects `ID`. |
| `event_mode` | no current EVENT form field | Not rendered; can remain hidden for metadata phase. |
| `organizer_unit_id` | no ID column in V1 form | Display-name fallback only until lookup UI exists. |
| `country_id` and nested `country` | no ID column in current form | Needed later for country-aware UX. |
| `meeting_url` | no current form field | Could map from `link_url` only if semantics are agreed. |
| `detail_en`, `title_en` | no current form fields | TH-first fallback is acceptable for current page. |
| `audit`, `file_summary`, `budget_summary` | no V1 equivalent | Must stay ignored until dedicated UI exists. |

### 12.4 Risky Assumptions

- Do not feed raw V2 DTOs directly into `round9RenderEvents()`; it expects V1 Thai
  field names and flat URL fields.
- Do not rely on `Object.values(row)` for search after V2 rows are introduced because
  nested objects will not produce useful search text.
- Do not update edit/delete buttons to use `event_id` in only one place; modal lookup,
  hydration lookup, and delete all need the same identity contract.
- Do not switch read source while delete remains V1 unless event delete is explicitly
  left in V1 and documented as a temporary mismatch.
- Do not let V2 `file_summary`/`files` touch upload/delete/FILES/BUDGET flows during
  the metadata co-activation stage.

### 12.5 Recommended Co-Activation Strategy

Use a staged render migration with an adapter normalization layer.

1. Keep the existing V2 read sidecar and use V1 only as a legacy comparison source:
   compare counts and sampled normalized fields (`ID/event_id`, title, date, status,
   visibility), but treat mismatches as informational unless they reveal malformed
   V2 source data.
2. Add a page-local adapter such as `adaptV2EventForRound9Render(v2Row)` that maps
   V2 DTO rows into the existing V1-compatible flat render shape. This lets
   `round9RenderEvents()`, `fillEventForm()`, and search continue to run without a
   large simultaneous refactor.
3. In a controlled test only, render an adapted V2 shadow list in console or a hidden
   comparison object first; do not switch `IROUND9_events` yet.
4. When V2 master data is ready and the adapter output is stable, co-activate EVENT
   metadata write and EVENT read source together for create/update only. Keep
   scholarship, uploads, delete, FILES, and BUDGET on V1.
5. Keep V1 read fallback available during the first activation window.
6. Defer full render-source swap until V2 render stability is verified across list
   render, modal edit loading, search, post-save reload, and post-delete reload.

Rejected for now:

- Full raw render source swap: too risky because render and modal code are V1-shaped.
- Dual-write: adds partial-write failure states and does not solve render compatibility.
- Immediate delete migration: no V2 soft-delete route exists yet.

### 12.6 Revised Gate Criteria

Legacy V1/V2 row parity is no longer required for EVENT migration because V2 is the
source of truth for the new EVENT workflow. V1 mismatches should be logged as legacy
comparison diagnostics only.

Required gates before EVENT render/source activation:

- V2 master data readiness: required EVENT records exist in V2 with valid `event_id`,
  title, type, organizer, start date, status, and visibility metadata.
- V2 render stability: adapted V2 rows pass field-completeness diagnostics and hidden
  shadow render without errors.
- V2 save stability: controlled create/update tests succeed with hydrated payloads and
  `IROUP_V2_EVENT_WRITE_ENABLED` deliberately enabled for the test window.
- Rollback readiness: `V2_EVENT_WRITE_UI_ENABLED` can be restored to `false`, V1
  fallback remains available, and scholarship/upload/delete/FILES/BUDGET flows remain
  outside the activation.

### 12.7 Local V2 Render-Source Validation Completed

Status: completed locally; no production activation.

- `V2_EVENT_RENDER_UI_ENABLED` was temporarily enabled during local browser validation.
- Adapted V2 EVENT rows rendered successfully through the existing
  `round9RenderEvents()` path.
- The selected-source search/render pipeline remained stable.
- The fallback path to legacy V1 rows was confirmed.
- `V2_EVENT_RENDER_UI_ENABLED` was reverted to `false` after testing.
- `V2_EVENT_WRITE_UI_ENABLED` remains `false`.
- No save/upload/delete/FILES/BUDGET behavior was changed.

Next phase:

- Controlled production-safe activation planning for the V2 EVENT render source.
- Keep V2 as the EVENT source of truth for the new workflow.
- Keep V1 as fallback/runtime comparison only.

### 12.8 Controlled Production Render Activation

Status: planning only. Do not enable production rendering from this section alone.

Purpose: define the conditions and rollback protections required before enabling
adapted V2 EVENT rows as the visible admin EVENT render source.

Repository default:

- `V2_EVENT_RENDER_UI_ENABLED` must remain `false` in committed repository state.
- `V2_EVENT_WRITE_UI_ENABLED` must remain `false` unless a separate controlled write
  activation window is explicitly approved.
- Activation should first be local-only/manual, then reviewed before any production
  adoption.

Activation prerequisites:

- V2 master data readiness is confirmed for target production EVENT records:
  `event_id`, title, type, organizer display, start date, status, and visibility are
  populated enough for admin rendering.
- Local render validation has passed with `V2_EVENT_RENDER_UI_ENABLED = true`.
- Hidden shadow render diagnostics pass without exceptions.
- Search over the selected render source remains stable.
- Legacy comparison diagnostics show only explainable V1 fallback differences.
- V1 fallback still renders correctly with `V2_EVENT_RENDER_UI_ENABLED = false`.
- No save/upload/delete/FILES/BUDGET behavior is part of the render activation.

Recommended activation sequence:

1. Local test: temporarily set `V2_EVENT_RENDER_UI_ENABLED = true` locally and verify
   render, search, edit modal open, and reload behavior.
2. Manual temporary activation: enable the flag only for a reviewed test window.
3. Monitor runtime/search/render: watch console diagnostics, visible EVENT cards,
   search behavior, and fallback logs.
4. Roll back if unstable: restore `V2_EVENT_RENDER_UI_ENABLED = false` and verify V1
   rows render again.
5. Controlled adoption: after a stable test window, plan the smallest reviewed commit
   that changes the default only if the team accepts V2 render as production-ready.

Monitoring expectations:

- Console must show `[V2 Render Pilot] EVENT render source: V2_ADAPTED` only during an
  intentional activation window.
- V2 sidecar diagnostics should continue to log render compatibility, legacy comparison,
  and shadow render status.
- Any adapted-row render exception, empty visible list, broken search, or missing core
  card fields should trigger rollback.
- V1 mismatch logs are informational unless they reveal malformed V2 source data.

Safe fallback behavior:

- The page must automatically use V1 when the render flag is false.
- The page must automatically use V1 when adapted V2 rows are unavailable or fail the
  basic usable-row check.
- Rollback must be one-flag reversible by setting `V2_EVENT_RENDER_UI_ENABLED = false`.

Temporary coexistence behavior:

- V2 is the source of truth for the new EVENT workflow.
- V1 remains available as legacy fallback/runtime comparison while render activation is
  evaluated.
- Save, upload, delete, FILES, and BUDGET flows remain on their existing paths during
  this render-only phase.

### 12.9 V2 EVENT Save Activation Readiness

Status: readiness audit only. No write activation.

Purpose: verify whether the current admin EVENT form and V2 master data are ready for a
future controlled `v2.admin.event.create` / `v2.admin.event.update` activation.

Required V2 create/update contract:

- Required: `title` / `title_th` / `title_en`, and `start_date`.
- Optional metadata currently relevant to the form: `event_id`, `event_type`, organizer
  display or `organizer_unit_id`, country display or `country_id`, `location`,
  `start_time`, `end_time`, `participant_count`, `detail`, `link_url`, `status`,
  `public_visible`, and `pin`.
- Update requires a hydrated full payload. The backend validator does not merge partial
  update payloads with the existing EVENT row before validation.

Current form readiness:

| V2 field | Current form/source | Readiness |
|----------|---------------------|-----------|
| `title_th` / `title` | EVENT title input | Ready |
| `event_type` | Event type select | Ready as display value; master-coded type normalization still preferred |
| `organizer_unit_id` / organizer fallback | Organizer unit select | Ready as display fallback; V2 unit lookup/id selection deferred |
| `country_id` / country fallback | No dedicated country field | Deferred; can use location text only for now |
| `location` | Location input | Ready |
| `start_date` | Start date input | Ready and required |
| `end_date` | End date input | Ready |
| `start_time` / `end_time` | Time inputs | Ready |
| `participant_count` | Participant count input | Ready |
| `detail_th` / `detail` | Detail textarea | Ready |
| `link_url` | V2 link URL field | Ready |
| `status` | V2 status dropdown | Ready |
| `public_visible` | V2 visibility checkbox | Ready |
| `pin` | V2 pin checkbox | Ready |
| `event_mode` | No current form field | Deferred |
| `meeting_url` | No dedicated meeting URL field | Deferred; do not overload unless semantics are agreed |

Master data dependencies:

- Country: not ready for first-class V2 ID writes. A V2 country lookup/select is needed
  before production-quality `country_id` writes.
- Organizer unit / faculty / division: display fallback exists, but production-quality
  writes should use V2 `UNIT_MASTER` IDs.
- Event type: current select provides display/type text; final production writes should
  normalize against the V2 accepted event-type vocabulary if one is formalized.
- Status: ready with controlled dropdown values.
- `public_visible`: ready with checkbox.
- `pin`: ready with checkbox.

Deferred capabilities:

- Files/posters: deferred. Current page still uses V1 upload/image URL behavior. Do not
  write V2 `FILES` relations in the metadata save activation.
- Budget: deferred. No V2 BUDGET relation write should occur in the EVENT metadata
  save activation.
- Delete: deferred. EVENT delete remains V1 until a V2 soft-delete route is designed,
  implemented, and separately validated.

Readiness conclusion:

- EVENT metadata create/update can be tested in a controlled V2-only save window after
  V2 master data readiness is reviewed.
- The first production-safe write activation should remain metadata-only and should use
  hydrated payloads for updates.
- `V2_EVENT_WRITE_UI_ENABLED` must remain `false` in committed repository state until
  the activation window is explicitly approved.
- `IROUP_V2_EVENT_WRITE_ENABLED` must remain `FALSE` in Script Properties until the
  backend write window is deliberately opened.

### 12.10 EVENT Type Master-Data Readiness Plan

Status: readiness audit only. No runtime refactor.

Current frontend state:

- `scholarship-events.html` uses a hardcoded EVENT type dropdown in the EVENT modal.
- The current hardcoded values are:
  - `✈️ การเดินทาง`
  - `🌏 Inbound`
  - `🤝 ประชุม`
  - `📚 อบรม`
  - `🔄 Exchange`
- `buildV2EventFormPayload()` sends the selected display value as `type`, which the V2
  normalizer maps into `event_type`.

Current V2 backend state:

- No `EVENT_TYPE_MASTER`, `MASTER_EVENT_TYPES`, or equivalent sheet exists in the V2
  database builder/config.
- `EVENT.event_type` is currently a plain text field.
- Existing V2 seed rows use free-text/code-like values such as `seminar`, `meeting`,
  and `workshop`.

Proposed V2 event type master schema:

| Field | Purpose |
|-------|---------|
| `event_type_id` | Stable machine ID, e.g. `travel`, `inbound`, `meeting`, `training`, `exchange` |
| `name_th` | Thai display label |
| `name_en` | English display label |
| `icon` | Optional UI icon/emoji used by admin/public renderers |
| `is_active` | Boolean availability flag |
| `sort_order` | Numeric ordering for dropdowns and filters |

Recommended normalization path:

1. Add an `EVENT_TYPE_MASTER` sheet to V2 schema/config in a backend planning pass.
2. Seed the current frontend values as master rows, mapping labels to stable
   `event_type_id` values.
3. Add a lookup route/wrapper for active event types.
4. Replace the hardcoded frontend dropdown with a V2 master-driven dropdown.
5. Submit `event_type_id` or a backend-accepted event type code to V2 writes while
   preserving display labels for render.

Readiness conclusion:

- EVENT type is usable for local metadata pilot as display text.
- EVENT type is not yet production-normalized because there is no V2 event-type master.
- Production-quality V2 EVENT save activation should treat event type master-data work
  as a UX/data normalization task before broad adoption.
