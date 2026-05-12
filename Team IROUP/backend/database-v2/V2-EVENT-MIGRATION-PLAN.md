# V2 EVENT Migration Plan

Date: 2026-05-12

Status: planning only. No runtime changes, no frontend activation, no Apps Script
deployment changes are made by this document.

Operating constraint:
- `V2_EVENT_WRITE_UI_ENABLED = false`
- `IROUP_V2_EVENT_WRITE_ENABLED = FALSE` (Apps Script Script Property)

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
- [ ] Add `status` dropdown to event form (values: `draft`, `published`, `cancelled`)
- [ ] Add `public_visible` toggle/checkbox to event form
- [ ] Add `pin` toggle/checkbox to event form
- [ ] Add `link` text input to event form
- [ ] Update `buildV2EventFormPayload()` to read these new inputs instead of hardcoding
- [ ] Update `fillEventForm(row)` to populate these new fields from the existing V1 row
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
