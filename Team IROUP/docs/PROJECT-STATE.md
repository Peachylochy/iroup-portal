# IROUP Project — Migration State
**Last updated: 2026-05-17 | Session: Public NEWS & Knowledge V2 Activation + UX Alignment**

> Living document. Update after every migration session.
> Source of truth for what is done, what is safe to do next, and what must not be touched.
>
> Core principle: **Stabilize → Modularize → Optimize → Expand**

---

## Latest Public NEWS & Knowledge V2 Activation + UX Alignment

### Session: 2026-05-17 - Public NEWS & Knowledge V2 Activation + UX Alignment

Completed:

- Activated `public-news.html` against the V2 public runtime.
- Activated `public-knowledge.html` against the V2 public runtime.
- Verified public routes:
  - `v2.public.news.list`
  - `v2.public.knowledge.list`
- Added real runtime validation using actual NEWS and KNOWLEDGE records.
- Added public NEWS gallery/lightbox:
  - thumbnail click
  - modal image gallery
  - previous/next navigation
  - keyboard support
  - image counter
- Fixed public KNOWLEDGE behavior:
  - card click opens detail modal first
  - external link no longer hijacks the entire card
  - explicit buttons for external links/media
  - image gallery behavior aligned with NEWS
- Added lightweight save-performance diagnostics to `knowledge.html`.
- Confirmed:
  - no mock runtime data
  - V2 public adapters remain the primary source
  - no V1 fallback usage on public NEWS/Knowledge pages
- Performed admin visual alignment pass:
  - `dashboard.html`
  - `news.html`
  - `knowledge.html`
- Standardized:
  - dark admin shell direction
  - KPI spacing
  - filter bar rhythm
  - modal shell styling
  - sidebar consistency
- Preserved all backend/runtime/API logic.

Notes:

- Current UI phase is stabilization/unification, not full redesign.
- Dashboard visual direction is becoming the primary design reference for later
  refinement passes.
- Knowledge save slowness is likely caused by sequential file uploads via the V2
  file upload pipeline; diagnostics were added before optimization.

---

## Latest Public News V2 Page

### Session: 2026-05-17 - Public News V2 Page

Public NEWS outcomes:

- Confirmed `v2.public.news.list` already exists in the V2 public router.
- Confirmed `IROUP_V2.public.newsList()` already exists in `iroup-v2-api.js`.
- Updated public NEWS DTO behavior to prefer `file_role_id = cover` for
  `cover_url`, with `file_role_id = image` as fallback.
- Created `Team IROUP/public/public-news.html`.
- `public-news.html` uses the isolated V2 public route as its primary runtime data
  source: `IROUP_V2.public.newsList()`.
- Public page features:
  - card grid
  - TH/EN toggle
  - category filter
  - SDG filter and badges
  - detail modal
  - cover image from public FILES relation
  - content image strip from public FILES relation
  - loading, empty, and error states

Safety notes:

- Public NEWS route returns only public-visible, non-deleted NEWS rows.
- Public NEWS files are filtered through existing public file safety rules:
  parent must be public, file `visibility_level` must be `public`, file must not be
  soft-deleted, and unsafe file roles are blocked when `FILE_ROLE_MASTER` marks
  them as not public-safe.
- No V1 production lane or `Code.gs` changes were made.
- Travel public page was not touched.
- Dashboard redesign was not touched.

Next:

- Browser-test `public/public-news.html` against live V2 data after NEWS sample rows
  and public cover/image files exist.
- Consider adding `public-news.html` to `public-landing.html` navigation in a later
  reviewed pass.

---

## Latest News V2-Native Baseline

### Session: 2026-05-16 - News V2-Native Baseline

News outcomes:

- Added NEWS backend baseline in V2:
  - `IROUP_V2_SHEETS.NEWS`
  - NEWS sheet schema in `IROUP_DATABASE_V2_BUILDER.gs`
  - `v2.admin.news.list`
  - `v2.admin.news.detail`
  - `v2.admin.news.create`
  - `v2.admin.news.update`
  - `v2.admin.news.delete`
- Added `news` to `IROUP_V2_MODULES` so `v2.admin.file.upload` accepts
  `module = news`.
- Created `news.html` as a V2-native admin page.
- `news.html` includes:
  - Card/List views
  - TH/EN toggle
  - KPI cards
  - text/category/SDG filters
  - create/edit modal
  - SDG 1-17 checkbox workflow
  - soft delete via `v2.admin.news.delete`
  - cover image and content image upload UI via `FILES` relation
- Added NEWS navigation to:
  - `dashboard.html` static sidebar block
  - shared `js/iroup-sidebar.js` final sidebar generator

Current caveats:

- NEWS sheet must be created in the live `IROUP_DATABASE_V2` spreadsheet by
  running `ensureV2NewsSheet_()` manually in Apps Script, or by running the
  builder that creates V2 sheets.
- Sample NEWS rows still need to be seeded in the live spreadsheet.
- `news.html` should be opened through the normal login/session path:
  `index.html` login -> `dashboard.html` -> sidebar `ข่าว`, so Google token
  session storage is available for V2 admin requests.

Validation completed locally:

- `git diff --check -- "Team IROUP/news.html"`
- inline script parse check for `news.html`
- V1 API scan found no V1 calls in `news.html`
- `git diff --check -- "Team IROUP/js/iroup-sidebar.js" "Team IROUP/dashboard.html"`

Next:

- Run `ensureV2NewsSheet_()` in Apps Script and seed 5 sample NEWS rows.
- Browser-validate `news.html` through the dashboard sidebar after token login.
- Verify cover/image upload succeeds with `module = news`.

---

## Latest Travel V2-Native Baseline Complete

### Session: 2026-05-15 - Travel V2-Native Baseline Complete

Travel outcomes:

- Added `v2.admin.travel.create`, `v2.admin.travel.update`, and
  `v2.admin.travel.delete` routes.
- Added `v2.admin.travel.participant.list`,
  `v2.admin.travel.participant.add`, and
  `v2.admin.travel.participant.delete`.
- Added `v2.admin.travel.budget.save` and `v2.admin.travel.budget.get` routes.
- Rewrote `travel.html` V2-native.
- Fixed `getV2AdminTravel_()` in `IROUP_V2_DTO_TRAVEL.gs`.
- Fixed `budget_source_type` enum validation in `IROUP_V2_DB.gs`.
- Fixed `TRAVEL_PARTICIPANT` `person_source` enum validation.
- Budget supports ภายใน/ภายนอก with a free-text source field.
- Participant section appears in both create and edit.
- Edit modal hydration is working.

---

## Latest Travel V2-Native Baseline

### Session: 2026-05-15 - Travel V2-Native Baseline

Travel outcomes:

- Added `v2.admin.travel.create`, `v2.admin.travel.update`, and
  `v2.admin.travel.delete` routes.
- Added `v2.admin.travel.participant.list`,
  `v2.admin.travel.participant.add`, and
  `v2.admin.travel.participant.delete`.
- Added `v2.admin.travel.budget.save` and `v2.admin.travel.budget.get` routes.
- Rewrote `travel.html` V2-native.
- Participant section shows in both create and edit.
- Pending participant flow works in create mode.
- Budget section supports ภายใน/ภายนอก with a free-text source field.
- `budget_source_type` validation was loosened to accept any string.
- Budget save preflight error remains under investigation.

Mobility outcomes:

- Participant section now shows in the create modal too.
- Pending participant flow was added for create mode.
- Form section reordered with ผู้เข้าร่วม first.

Bug in progress:

- Travel budget save still reports: `V2 append preflight failed for BUDGET`.
- Debug response was added to the backend for the next session.

Next:

- Fix the travel budget save bug.
- Continue with remaining modules.

---

## Latest MOU and Mobility V2-Native Baseline Addendum

### Session: 2026-05-14 - MOU and Mobility V2-Native Baseline

MOU outcomes:

- Added `v2.admin.mou.create`, `v2.admin.mou.update`, and
  `v2.admin.mou.delete` backend routes.
- Rewrote `mou.html` V2-native while keeping the existing layout.
- Preserved the D3 world map, Chart.js chart, KPI cards, and table.
- Fixed empty-row filtering in `listV2AdminMOUs_()`.
- Fixed sidebar active state.
- Fixed world map country name matching via a `resolveMapCountryName()` override
  table.
- Added continent auto-fill from `COUNTRY_MASTER`.
- Added continent field support to the MOU schema and backend.

Mobility outcomes:

- Added `v2.admin.mobility.create`, `v2.admin.mobility.update`, and
  `v2.admin.mobility.delete` routes.
- Added `v2.admin.mobility.participant.list`,
  `v2.admin.mobility.participant.add`, and
  `v2.admin.mobility.participant.delete`.
- Added `v2.lookup.students` and `v2.lookup.staff` routes.
- Added `seedV2PersonSampleData()` for test data.
- Rewrote `mobility.html` V2-native.
- Fixed empty-row filtering in `listV2AdminMobilityProjects_()`.
- Added participant management UI in the edit modal.
- Edit modal hydration bug remains in progress, with debug added.

Standards confirmed:

- Empty-row filter pattern:
  `if (!String(row.[id] || '').trim()) return false`
- World map country names need `resolveMapCountryName()` for common name
  mismatches.
- Never call `detail()` once per row on page load.

Next:

- Fix Mobility edit modal hydration; debug is in progress.
- Continue with the `travel.html` V2-native rewrite.

---

## Latest MOU and Mobility V2-Native Baseline

### Session: 2026-05-14 - MOU and Mobility V2-Native Baseline

MOU outcomes:

- Added `v2.admin.mou.create`, `v2.admin.mou.update`, and
  `v2.admin.mou.delete` backend routes.
- Rewrote `mou.html` as a V2-native admin page while keeping the existing layout.
- Preserved the D3 world map, Chart.js chart, KPI cards, and table structure.
- Fixed empty-row filtering in `listV2AdminMOUs_()`.
- Fixed world map country name matching with a `resolveMapCountryName()` override
  layer.
- Added continent auto-fill from `COUNTRY_MASTER`.
- Added continent field support to the MOU schema and backend.

Mobility outcomes:

- Added `v2.admin.mobility.create`, `v2.admin.mobility.update`, and
  `v2.admin.mobility.delete` routes.
- Added `v2.admin.mobility.participant.list`, `v2.admin.mobility.participant.add`,
  and `v2.admin.mobility.participant.delete`.
- Added `v2.lookup.students` and `v2.lookup.staff` routes.
- Rewrote `mobility.html` as a V2-native admin page.
- Fixed empty-row filtering in `listV2AdminMobilityProjects_()`.
- Added participant management UI in the edit modal.
- Edit modal hydration bug remains in progress.

Standards confirmed:

- Empty-row filtering by primary key is now the standard pattern for every new
  module list handler.
- World maps need a `resolveMapCountryName()` normalization layer.
- Never call `detail()` once per row on page load.

Next:

- Fix the Mobility edit modal hydration bug.
- Rewrite `travel.html` as V2-native.

---

## Latest Scholarship V2-Native Baseline

### Session: 2026-05-14 - Scholarship V2-Native Baseline

Outcomes:

- Added `v2.admin.scholarship.delete` backend route using soft delete, following
  the same pattern as EVENT delete.
- Created `scholarship.html` as a V2-native admin page following the validated
  `events.html` baseline pattern.
- Fixed empty-row filtering in `listV2AdminScholarships_()` using the same
  primary-key guard pattern as the EVENT empty-row fix.
- Fixed TH/EN toggle behavior for scholarship cards and list view.
- Fixed the country field to use a searchable combobox backed by `COUNTRY_MASTER`.
- Fixed `scholarship_type` to use a free-type combobox with suggestions from
  existing V2 scholarship rows.
- Fixed page load performance by removing `hydrateScholarshipDetails()`, which was
  firing one `scholarshipDetail()` request per row on every page load.
- Reduced scholarship page load from 21+ calls to 2 calls in the tested dataset:
  one countries lookup and one scholarship list request.
- `scholarshipDetail()` now fires only on explicit edit action for a single record.

Standards confirmed for next modules:

- Render from list data only on page load.
- Never call `detail()` per row on page load.
- `detail()` should only fire on explicit user action such as edit/view.

Next:

- UI redesign later as a coordinated all-pages pass.
- Continue with the next V2-native module using the Scholarship/Events baseline.

---

## Latest V2 Events Internal Admin Baseline

### Session: 2026-05-14 - Local Validation of V2-Native Events Workflow

Current outcome:

- `events.html` is working well in local validation as a V2-native internal admin
  workflow baseline.
- V2 Events display successfully in both Card and List views.
- Create and edit flows work through the V2 EVENT metadata routes.
- Card/List rendering, EVENT mode badges, and countdown/status badges were validated.
- Soft delete works through the V2 route and keeps row history by setting
  `is_deleted = TRUE`.
- Delete actions are available from both Card view and List view, with equivalent
  action coverage.
- File upload UI is wired for poster/cover image and attachment selection.
- File upload backend route was added and writes through the V2 `FILES` relation
  instead of embedding file fields directly in the EVENT transaction row.

Backend/admin routes now included in the V2 Events baseline:

- `v2.admin.event.create`
- `v2.admin.event.update`
- `v2.admin.event.delete`
- `v2.admin.file.upload`

File handling standard confirmed:

- Drive folder: `IROUP_V2_FILES`
- Drive sharing: anyone with link can view
- EVENT file relation values:
  - `module = event`
  - `file_role_id = poster` for poster/cover image
  - `file_role_id = attachment` for other files
  - `visibility_level = public` for poster/banner
  - `visibility_level = internal` for other attachments

Pattern for next modules:

- Every add/edit data module should expose delete actions wherever edit actions are
  available.
- Delete should be soft delete by default whenever the schema supports `is_deleted`.
- Card and List views must expose equivalent row actions.
- Uploads should write V2 `FILES` relation rows, not flat file URL columns inside
  transaction sheets.
- Events is now the internal admin workflow baseline for the next V2-native modules.

Next:

- Apply the same V2-native admin pattern to Scholarship next.
- Continue using `FILES` relation semantics for module uploads.
- Keep soft-delete, equivalent Card/List actions, and relation-based files as default
  design rules for MOU, Mobility, Travel, Scholarship, News, and Knowledge rewrites.

---

## Latest V2-Native EVENT Form Save Wiring

### Session: 2026-05-13 - V2-Native EVENT Create Path

Current outcome:

- V2-native EVENT form save works end-to-end in the controlled V2 path.
- V2-native master dropdowns load from V2 lookup data:
  `event_types`, `units`, and `countries`.
- The topbar `+ เพิ่มกิจกรรม` button is now gated by
  `V2_EVENT_WRITE_UI_ENABLED`.
- When `V2_EVENT_WRITE_UI_ENABLED === true`, the EVENT create button opens the
  V2-native EVENT modal.
- When `V2_EVENT_WRITE_UI_ENABLED === false`, the EVENT create button keeps opening
  the existing V1 form.
- V2-native save feedback now alerts `บันทึกสำเร็จ (V2)` on success and shows
  `response.error` on failure.

Still safe/default:

- `V2_EVENT_WRITE_UI_ENABLED` remains false in repository state.
- V1 remains the default production lane while the flag is false.
- The scholarship create button and V1 form/save path were not changed.

Next:

- Test the V2-native SCHOLARSHIP form.
- Add the same controlled button wiring for scholarship after scholarship V2 form
  testing is complete.

---

## Latest MASTER_EVENT_TYPES Foundation Planning

### Session: 2026-05-13 - Dynamic EVENT Type Master Architecture

Planning outcome:

- Proposed dedicated V2 master sheet: `MASTER_EVENT_TYPES`.
- Intended relation: `EVENT.event_type_id -> MASTER_EVENT_TYPES.event_type_id`.
- Proposed fields: `event_type_id`, `name_th`, `name_en`, `icon`, `color_token`,
  `is_active`, `sort_order`, `created_at`, and `updated_at`.
- Builder foundation added in `IROUP_DATABASE_V2_BUILDER.gs` for the
  `MASTER_EVENT_TYPES` header schema and `is_active` checkbox validation.

Country/unit master audit:

- `COUNTRY_MASTER` already provides stable `country_id` rows with ISO codes,
  Thai/English names, continent metadata, `active`, and `sort_order`.
- `UP_UNIT_MASTER` already provides stable `unit_id` rows with code, Thai/English
  names, unit type, parent unit, `active`, and `sort_order`.
- EVENT already has `country_id` and `organizer_unit_id` columns, but the frontend
  still needs dynamic master-bound selectors before production V2 save activation.
- Location text remains separate from country identity and must not be auto-derived
  into `country_id`.

Future frontend behavior:

- EVENT type dropdown should load dynamically from V2 lookup data.
- Dropdown should support search, active/inactive filtering, stable sort order, and
  fallback to existing hardcoded values if lookup data is unavailable.
- Existing adapters should temporarily support legacy plain-text `event_type` while
  new records move toward `event_type_id`.

Still not doing:

- no runtime dropdown refactor yet
- no Apps Script deployment changes
- no V2 write activation
- no production behavior change

---

## Latest V2 EVENT Type Master Readiness

### Session: 2026-05-13 - EVENT Type UX/Data Normalization Audit

Current finding:

- The EVENT modal still uses a hardcoded frontend type dropdown:
  `การเดินทาง`, `Inbound`, `ประชุม`, `อบรม`, and `Exchange`.
- V2 currently has no `EVENT_TYPE_MASTER` / `MASTER_EVENT_TYPES` equivalent.
- V2 `EVENT.event_type` is a plain text field today.

Planned normalization task:

- Add an `EVENT_TYPE_MASTER` concept with `event_type_id`, `name_th`, `name_en`,
  `icon`, `is_active`, and `sort_order`.
- Move the EVENT type dropdown from hardcoded frontend options to a V2 master-driven
  lookup before broad production save adoption.
- Keep current hardcoded values usable only for local/controlled metadata pilot work.

Still not doing:

- no runtime dropdown refactor yet
- no V2 write activation
- no production behavior change

---

## Latest V2 EVENT Save Activation Readiness

### Session: 2026-05-13 - Metadata Save Readiness Audit

Current state:

- V2 EVENT render pilot is proven locally.
- V2 remains the intended source of truth for the new EVENT workflow.
- `V2_EVENT_RENDER_UI_ENABLED` remains `false` in repository state.
- `V2_EVENT_WRITE_UI_ENABLED` remains `false`.
- No production save switch has been enabled.

Readiness finding:

- Current EVENT form fields cover the core V2 metadata create/update contract:
  title, type display, organizer display fallback, location, dates, times,
  participant count, detail, link URL, status, visibility, and pin.
- V2 update activation must continue to use hydrated full payloads because the backend
  validator does not merge partial updates with existing EVENT rows.
- Country and organizer unit should move to V2 master-data-backed selects before
  production-quality ID writes.

Deferred from metadata save activation:

- files/posters and V2 `FILES` relations
- budget relations
- delete / V2 soft-delete
- scholarship migration
- upload/image migration

Next recommended phase:

- Review V2 country/unit/event-type master readiness, then plan a controlled
  metadata-only V2 EVENT save activation window.

---

## Latest V2 EVENT Production Render Activation Planning

### Session: 2026-05-13 - Controlled Production-Safe Render Plan

Current state:

- Local-only V2 EVENT render activation is proven.
- Adapted V2 EVENT rows rendered successfully through the existing EVENT render path.
- Production render activation has not been enabled.
- `V2_EVENT_RENDER_UI_ENABLED` must remain `false` in committed repository state until
  a reviewed activation decision.
- `V2_EVENT_WRITE_UI_ENABLED` remains `false`.

Planning outcome:

- Production render activation must be one-flag reversible.
- Activation should follow: local test -> manual temporary activation -> monitor
  runtime/search/render -> rollback if unstable -> controlled adoption.
- V2 remains the intended EVENT source of truth.
- V1 remains legacy fallback/runtime comparison during the render-only phase.

Still not doing:

- no production render activation yet
- no V2 write activation
- no save/upload/delete/FILES/BUDGET migration
- no `IROUP.SCRIPT_URL` replacement

---

## Latest V2 EVENT Render Pilot Validation

### Session: 2026-05-13 - Local-Only Adapted V2 EVENT Render Activation

**Phase goal:** Validate that adapted V2 EVENT rows can pass through the existing
`round9RenderEvents()` card/search pipeline when a page-local render flag is
temporarily enabled. This was a local-only validation pass, not production activation.

Validation result:

- Temporarily enabled `V2_EVENT_RENDER_UI_ENABLED` locally for browser validation.
- Adapted V2 EVENT rows rendered successfully through the existing EVENT render path.
- The search/render pipeline remained stable while using the selected render source.
- The safe fallback path to legacy V1 rows was confirmed.
- No production activation was performed.

Rollback and safety confirmation:

- `V2_EVENT_RENDER_UI_ENABLED` was reverted to `false` after testing.
- `V2_EVENT_WRITE_UI_ENABLED` remains `false`.
- V2 write activation remains off.
- Scholarship, upload, delete, FILES, and BUDGET flows remain untouched.
- `IROUP.SCRIPT_URL` remains unchanged.

Next recommended phase:

- Controlled production-safe V2 EVENT render activation planning, with V2 as the
  source of truth and V1 retained as fallback/runtime comparison only.

---

## Latest V2 EVENT Source-of-Truth Direction

### Session: 2026-05-13 - Align EVENT Migration Strategy Around V2

Current latest EVENT-sidecar commits:

- `76365e4 feat(v2-sidecar): classify V2 event parity gaps`
- `d9301d4 feat(v2-sidecar): add V2 event dataset parity audit`
- `732abff feat(v2-sidecar): add hidden V2 event shadow render test`
- `ec15e45 feat(v2-sidecar): add V2 event render compatibility diagnostics`
- `7258961 feat(v2-sidecar): add V2 event render adapter groundwork`
- `870db82 docs: audit EVENT render compatibility for V2 co-activation`

Direction change:

- V2 is the intended source of truth for the new EVENT workflow.
- V1 remains a legacy fallback/runtime comparison source only.
- V1/V2 row parity is informational and is no longer a migration gate.
- Legacy comparison diagnostics in `events.html` classify unmigrated or
  malformed V1 rows, but mismatches do not block the V2 path by default.

Current gates for future EVENT activation:

- V2 master readiness: target EVENT records exist in V2 with valid required metadata.
- V2 render stability: adapted V2 rows pass completeness diagnostics and hidden shadow
  render tests.
- V2 save stability: controlled V2 create/update succeeds with hydrated payloads during
  an explicitly enabled test window.
- Rollback readiness: `V2_EVENT_WRITE_UI_ENABLED` remains restorable to `false`, V1
  fallback remains available, and scholarship/upload/delete/FILES/BUDGET flows stay
  outside activation.

Still not doing:

- no V2 render-source switch yet
- no V2 write activation by default
- no scholarship migration
- no upload/delete/FILES/BUDGET migration
- no `IROUP.SCRIPT_URL` replacement

---

## Latest V2 EVENT Metadata UI Pilot - Local Activation Test

### Session: 2026-05-12 - Controlled Page-Local V2 EVENT Metadata Save Pilot

**Phase goal:** Temporarily activate the disabled page-local EVENT metadata write branch
in `events.html` for a local browser UI smoke test only, then roll it back.
No production activation, no commit, no push, no scholarship write migration, no upload
migration, no delete migration, no FILES/BUDGET relation writes, and no `IROUP.SCRIPT_URL`
replacement.

Local test result:

- Temporarily changed `V2_EVENT_WRITE_UI_ENABLED` from `false` to `true`.
- Browser UI EVENT metadata create path succeeded end to end:
  UI form -> hydration helpers -> gated V2 branch -> `IROUP_V2.admin.eventCreate()` ->
  Google-token-backed V2 admin auth -> validation -> isolated V2 backend -> EVENT sheet write.
- The observed success message was:
  `V2 EVENT metadata pilot save succeeded. V1 remains the default data source.`
- Hydration helpers successfully prepared full V2-compatible EVENT payloads for the
  UI pilot path.

Validation and behavior findings:

- The V2 backend update validator still requires a full required-field payload and does
  not merge with the existing EVENT row before validation.
- The frontend hydration helper pattern is therefore required before any future
  `IROUP_V2.admin.eventUpdate()` activation.
- The page-local V2 branch calls only EVENT metadata `eventCreate()` / `eventUpdate()`
  when the local flag is deliberately enabled.

Rollback and safety confirmation:

- `V2_EVENT_WRITE_UI_ENABLED` has been restored to `false`.
- Default `round9Save()` behavior remains V1-backed through `IROUP.add()` /
  `IROUP.edit()`.
- Scholarship save remains V1-only.
- Upload/image flows remain V1-only through `IROUP.uploadImage()` / `IROUP.uploadFile()`.
- Delete remains V1-only through `IROUP.delete()`.
- No FILES or BUDGET relation writes were activated.
- `IROUP_V2_EVENT_WRITE_ENABLED` is expected to remain `FALSE` in isolated Apps Script
  Script Properties before any future reviewed activation.

Still not doing:

- production frontend V2 save activation
- scholarship V2 writes
- upload/image/FILES/BUDGET/delete migration
- `IROUP.SCRIPT_URL` replacement
- V1 runtime replacement
- commit or push

---

## Latest V2 Event Write Pilot — First Live Smoke Test

### Session: 2026-05-12 — V2 Admin Event Metadata Real Write Pilot Live Smoke Test

**Phase goal:** Run the first controlled browser-console smoke test of V2 real event
create and update routes against the live isolated V2 Apps Script deployment. No frontend
submit wiring, no FILES/BUDGET relation writes, no upload migration, no V1 production
change, no IROUP.SCRIPT_URL replacement.

Pre-smoke-test issues discovered and resolved:

- The live V2 Apps Script deployment was running outdated backend files (pre-session 45).
  IROUP_V2_AUTH.gs did not include Google token verification (fetchV2GoogleUserInfo_ /
  fetchV2GoogleTokenInfo_), causing all admin routes to fall through to
  Session.getActiveUser().getEmail() which always returns empty under
  "Execute as: Me, Anyone" deployment settings.
- Fix: replaced IROUP_V2_AUTH.gs, IROUP_V2_ROUTER.gs, and IROUP_V2_ADMIN_API.gs in the
  Apps Script editor with current local versions and redeployed.
- appsscript.json did not declare https://www.googleapis.com/auth/script.external_request.
  This scope is required for UrlFetchApp.fetch() used in Google token verification.
  Fix: added oauthScopes to appsscript.json including the scope, saved the manifest,
  and re-authorized the deployment.
- IROUP_V2_EVENT_WRITE_ENABLED=TRUE was confirmed set in Script Properties before smoke test.

Smoke test results:

- v2.admin.dashboard.summary: success: true. Auth confirmed end-to-end via Google access
  token through fetchV2GoogleUserInfo_. Actor: panpancake17@gmail.com,
  role: superadmin through Google token verified admin mapping.
- v2.admin.event.create: success: true, dry_run: false, write_enabled: true.
  Generated ID: EVT-20260512185836-15148654. Status: draft. public_visible: false.
  Written to EVENT sheet row 5. created_by/updated_by: panpancake17@gmail.com.
  Relation writes: none. Skipped: file_upload, image_upload, file_relation_write,
  budget_relation_write, delete.
- v2.admin.event.update (first attempt): success: false. Validation failed —
  TITLE_REQUIRED and START_DATE_REQUIRED. The update validator normalizes the incoming
  payload alone without merging with the existing row. This behavior is acceptable for
  the backend isolation pilot. The frontend adapter must hydrate the existing row before
  update submission.
- v2.admin.event.update (corrected full payload): success: true, dry_run: false.
  Status patched draft → cancelled. detail_th updated. created_at preserved,
  updated_at advanced to 2026-05-12T12:03:45.526Z.
- EVENT sheet row 5 verified: EVT-20260512185836-15148654, status: cancelled,
  created_by/updated_by correct, updated_at refreshed.

Post-smoke-test:

- IROUP_V2_EVENT_WRITE_ENABLED set to FALSE in Script Properties.
- Test row EVT-20260512185836-15148654 remains in EVENT sheet for reference
  until cleanup policy is defined.

Key findings:

- Update requires full required-field set in payload. The update validator does not load
  and merge the existing row. This is acceptable for the backend isolation pilot.
  The frontend adapter must hydrate the existing row before update submission.
- appsscript.json must explicitly declare https://www.googleapis.com/auth/script.external_request
  for Google token verification to work. Adding the scope to oauthScopes and
  re-authorizing the deployment is sufficient — a full redeploy is not required solely
  for this change.
- Google OAuth access tokens expire after 3600 seconds. Smoke tests should be run within
  the same login session.

Safety boundary preserved:

- No frontend submit wiring.
- No FILES, BUDGET, upload, or image relation writes.
- No delete route tested.
- No V1 production Code.gs changes.
- No IROUP.SCRIPT_URL replacement.
- V2 deployment URL unchanged.
- V1 scholarship/event flows remain operational as production fallback.

---

## Latest V2 Backend Admin Token Auth Bridge

### Session: 2026-05-11 - V2 Admin Token Authentication

**Phase goal:** Allow isolated V2 admin read-only routes to authenticate from a verifiable `adminToken` handoff when Apps Script active-user email is unavailable. No CRUD/write/upload migration, public route change, V1 runtime change, backend deployment, or `IROUP.SCRIPT_URL` replacement.

Implementation:

- Updated only V2 backend auth/router files:
  - `Team IROUP/backend/database-v2/IROUP_V2_AUTH.gs`
  - `Team IROUP/backend/database-v2/IROUP_V2_ROUTER.gs`
- `routeV2Request_(e)` now passes the normalized request to `requireV2Admin_(request)`.
- `requireV2Admin_(request)` now tries verifiable `adminToken` auth before falling back to `Session.getActiveUser().getEmail()`.
- Token auth supports:
  - hashed token map via script property `IROUP_V2_ADMIN_TOKEN_MAP_JSON`
  - signed V2 token format `v2adm.<payload>.<signature>` using script property `IROUP_V2_ADMIN_TOKEN_SECRET`
  - Google access/ID token verification through Google token APIs
- Authenticated token email is still checked against the V2 `ADMIN` sheet and requires `active = TRUE`.

Scope boundary:

- V2 public routes remain unchanged.
- V1 `backend/Code.gs` remains unchanged.
- Frontend remains unchanged for this backend pass.
- Current V2 admin routes are read-only list/detail/summary routes; no V2 CRUD/write/upload route was added.

Runtime note:

- Existing V1 opaque UUID `adminToken` values are stored in the V1 Apps Script cache and cannot be decoded by the isolated V2 deployment unless mapped by hash in `IROUP_V2_ADMIN_TOKEN_MAP_JSON`.
- Invalid, unmapped, expired, or inactive-admin tokens are rejected before route handlers run.
- Session active-user auth remains available as a fallback.

Expected runtime checks after review/redeploy:

- `v2.health` remains public and passes.
- Public V2 routes remain public and pass.
- `v2.admin.dashboard.summary` succeeds for a verified token mapped/signed to `panpancake17@gmail.com`.
- Invalid or unmapped token is rejected.
- Inactive admin email is rejected.
- Dashboard V1 fallback still renders if V2 auth fails.

Expected runtime checks:

- Dashboard V1 cards/charts/tables still render from `IROUP.getReport(year)`.
- `v2Readiness` reports V2 summary bridge status.
- No CRUD/write/upload flow changes.
- No `IROUP.SCRIPT_URL` replacement.

---

## Latest V2 Live Backend Smoke Test

### Session: 2026-05-11 - First Isolated V2 Backend Smoke Test Results

**Phase goal:** Record first live isolated V2 Apps Script backend smoke test outcome. No frontend URL activation and no V1 replacement.

Result:

- **Live V2 backend deployment is successful.**
- `v2.health` passed.
- `v2.schema` initially failed with `sheet.getLastColumn is not a function`, then passed after the router schema wrapper fix.
- `v2.public.scholarship.list` passed.
- `v2.admin.dashboard.summary` was reachable.
- `v2.admin.dashboard.summary` initially returned inflated counts from preformatted/validated blank rows, then passed after the aggregate primary-key filtering fix.

Fixes validated by live smoke testing:

- `IROUP_V2_ROUTER.gs`: `getV2SchemaSummary_()` now unwraps `getV2Sheet_(name).data` and checks for a real Sheet-like object before calling `getV2Headers_()`.
- `IROUP_V2_DTO_AGGREGATE.gs`: dashboard/report aggregate rows are counted only after filtering by non-empty primary key and excluding `is_deleted=true` rows.
- `IROUP_V2_ROUTER_TEST.gs`: schema shape and aggregate blank-row filtering tests were strengthened.

Safety boundary preserved:

- No frontend V2 URL activation yet.
- No `IROUP.SCRIPT_URL` replacement.
- No V1 production deployment replacement.
- No dashboard/admin frontend activation.
- Production `backend/Code.gs` remains untouched.

Next recommended phase:

- Prepare a reviewed frontend endpoint activation pass for one page only, starting with `public/public-scholar.html`.
- Keep `v2.schema` controlled diagnostic only until public exposure is explicitly accepted or restricted.
- Keep dashboard/admin frontend activation blocked until admin auth behavior and dashboard readiness are reviewed separately.

---

## Latest V2 First Live Deployment Guide

### Session: 2026-05-11 - First Isolated V2 Backend Deployment Execution Guide

**Phase goal:** Prepare the exact manual execution procedure for the first isolated V2 Apps Script backend deployment and smoke test. Documentation only.

Execution guide:

```text
Team IROUP/backend/database-v2/V2-FIRST-LIVE-DEPLOYMENT.md
```

Guide coverage:

- exact Apps Script project creation steps
- required V2 file copy/import order
- bound spreadsheet vs standalone `IROUP_V2_SPREADSHEET_ID` configuration
- deployment setting recommendations
- who should execute as and who should have access
- how to obtain and privately store the V2 `/exec` deployment URL
- temporary direct test URL examples
- expected JSON outputs for:
  - `v2.health`
  - `v2.schema`
  - `v2.public.scholarship.list`
- admin auth expected-fail and expected-success tests
- rollback procedure
- post-deployment verification checklist

Safety boundary:

- Do not replace `IROUP.SCRIPT_URL`.
- Do not activate frontend pages yet.
- Do not wire dashboard/admin yet.
- Do not expose `v2.schema` broadly yet.
- Do not modify runtime logic.
- Do not deploy automatically.
- Do not push until reviewed.

---

## Latest V2 Deployment Readiness Review

### Session: 2026-05-11 - V2 Live Deployment Readiness Review

**Phase goal:** Final architecture/safety review before the first live isolated V2 Apps Script deployment. No deployment, URL activation, runtime behavior change, production `Code.gs` touch, or push.

Readiness review:

```text
Team IROUP/backend/database-v2/V2-DEPLOYMENT-READINESS-REVIEW.md
```

Decision:

- **GO** for first isolated V2 backend deployment only, after manual checklist confirmation.
- **NO-GO** for frontend V2 URL activation during the deployment step.
- **NO-GO** for admin/dashboard V2 activation until admin auth is proven under the exact Apps Script deployment settings.

Findings:

- Required V2 runtime files are present.
- V2 web-app entrypoints `doGet(e)` and `doPost(e)` exist in `IROUP_V2_ENTRYPOINT.gs`.
- V2 router entrypoint `routeV2Request_(e)` exists.
- V2 admin routes are guarded through `requireV2Admin_()`.
- V2 remains isolated from production `backend/Code.gs`.
- `IROUP.SCRIPT_URL` remains a V1 lane and should not be replaced.
- Public/admin route separation is structurally sufficient for smoke testing, but live DTO privacy must still be verified.

Main risk:

- Admin auth depends on Apps Script `Session.getActiveUser().getEmail()`. Public route access and admin identity enforcement may conflict depending on deployment settings.

Recommendation:

- Run direct backend endpoint smoke tests first.
- Keep `v2.schema` controlled diagnostic only.
- Activate public V2 before admin V2.
- Start future frontend activation with `public/public-scholar.html` only.

---

## Latest V2 First Deployment Checklist

### Session: 2026-05-11 - V2 First Deployment Dry Run Checklist

**Phase goal:** Create an exact manual checklist for the first isolated V2 Apps Script deployment and smoke test. Documentation/checklist only.

Checklist:

```text
Team IROUP/backend/database-v2/V2-FIRST-DEPLOYMENT-CHECKLIST.md
```

Checklist coverage:

- required V2 runtime files to copy
- Apps Script project setup steps
- bound vs standalone spreadsheet configuration
- `IROUP_V2_SPREADSHEET_ID` decision points
- deployment setting cautions for `Session.getActiveUser().getEmail()`
- first route tests: `v2.health`, `v2.schema`, `v2.public.scholarship.list`
- admin auth expected-fail and expected-success sequence
- rollback steps that do not touch V1
- explicit "what not to do" list

Still not doing:

- runtime code changes
- deployment
- production URL changes
- frontend V2 endpoint activation
- V1 deployment changes
- push

---

## Latest V2 Deployment Smoke-Test Plan

### Session: 2026-05-11 - V2 Deployment Smoke Test Planning Pass

**Phase goal:** Plan the first live V2 deployment smoke test. No deployment, no production URL change, no frontend endpoint activation, no V1 deployment change, and no push.

Smoke-test plan:

```text
Team IROUP/backend/database-v2/V2-SMOKE-TEST-PLAN.md
```

Recommended sequence:

1. Run editor-level `routeV2Request_()` checks before web deployment.
2. Deploy the separate V2 web app only after review approval.
3. Test direct V2 endpoint URLs before any frontend page receives the live URL.
4. Start with `v2.health`.
5. Test public list routes and inspect DTO privacy.
6. Test admin route failure for unauthorized access.
7. Test admin route success only with an active V2 admin account.
8. Activate the V2 URL for one frontend page only, starting with `public/public-scholar.html`.
9. Expand page activation one page at a time.

Important recommendation:

- Do not add automatic V1 public fallback inside migrated public pages.
- Keep rollback at the V2 endpoint config/page activation layer.
- Keep dashboard V2 as readiness-only until admin auth behavior is proven under the exact Apps Script deployment settings.

Critical risk to resolve before frontend activation:

- V2 admin auth currently depends on `Session.getActiveUser().getEmail()`.
- Apps Script web-app access settings must be tested because public unauthenticated routes and active-user admin identity may require different deployment behavior.
- If one deployment cannot safely support both, split public and admin deployment strategies before admin activation.

---

## Latest V2 Deployment Preparation

### Session: 2026-05-11 - V2 Deployment Preparation Pass

**Phase goal:** Prepare a separate V2 Apps Script deployment structure. No deployment, no V1 `Code.gs` change, no frontend endpoint activation, and no push.

Prepared deployment record:

```text
Team IROUP/backend/database-v2/V2-DEPLOYMENT-PREP.md
```

Implementation:

- Added V2-only web-app entrypoint file: `Team IROUP/backend/database-v2/IROUP_V2_ENTRYPOINT.gs`.
- The entrypoint defines `doGet(e)` and `doPost(e)` for the separate V2 deployment only.
- Both entrypoints call `routeV2Request_(e)` and return JSON through `ContentService.MimeType.JSON`.
- Unexpected top-level failures are wrapped in the standard V2 `{ success, data, error, meta }` shape.

Required V2 runtime files for the future separate Apps Script deployment:

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

Important risks before deployment:

- `IROUP_V2_SPREADSHEET_ID` is blank by design and must be valid for the selected project type.
- V2 admin auth depends on Apps Script active-user email, so deployment access settings must be tested.
- `v2.schema` is currently public and should be reviewed before broad public exposure.
- Public file DTO behavior should be smoke-tested with representative public/private file rows.

Still not doing:

- deploying the V2 web app
- changing `IROUP.SCRIPT_URL`
- editing production `backend/Code.gs`
- activating a live frontend V2 endpoint
- pushing changes

---

## Latest V2 Public Migration Verification

### Session: 2026-05-11 - Public Migration Wave 1 Verification Pass

**Phase goal:** Stabilization/audit only. No UI refactor, backend route change, admin/dashboard migration, deployment, or push.

Verified migrated public pages:

- `public/public-scholar.html`
- `public/public-events.html`
- `public/public-mou.html`
- `public/public-mobility.html`

Verification result:

- All primary public data loads now use `IROUP_V2.public.*`.
- No remaining `IROUP.getPublic*` calls were found in the four migrated public pages.
- No direct `SCRIPT_URL` or `action=getPublic*` bypass was found in the four migrated public pages.
- All migrated V2 list calls check `response.success` before consuming `response.data || []`.
- Remaining V1 dependencies are utility-only: status/date helpers from `iroup-config.js`.
- Public/private leakage scan found no direct page references to person IDs, student IDs, staff IDs, gender, budget, audit, creator, or updater fields.

Verification record:

```text
Team IROUP/backend/database-v2/PUBLIC-MIGRATION-VERIFICATION.md
```

Known cleanup before admin/dashboard migration:

- Add `continent_en` / `continent_th` support to the events and MOU page-local continent helpers.
- Decide whether V1 `IROUP` utility helpers should remain during admin migration or move to `IU`/page-local helpers.
- Standardize public country/continent/unit/file normalization helpers after behavior is visually verified.
- Run live V2 endpoint browser smoke tests for all four public pages.

---

## Latest Admin/Dashboard Migration Audit

### Session: 2026-05-11 - Admin/Dashboard Migration Audit Pass

**Phase goal:** Audit/planning/stabilization only. No operational page behavior, frontend refactor, backend route change, deployment, or push.

Audited target pages:

- `dashboard.html`
- `report.html`
- `mobility.html`
- `mou.html`
- `events.html`
- `travel.html`

Audit result:

- `dashboard.html` is the safest first admin-side candidate because it is read-only and uses one aggregate V1 call: `IROUP.getReport(year)`.
- `report.html` should migrate separately from dashboard because it depends on row-level report/export behavior and has V1 `getAll(...)` fallback reads.
- `mou.html`, `events.html`, `travel.html`, and `mobility.html` are mixed read/write operational pages and should not start with V2 CRUD.
- Upload flows are still V1-only through `IROUP.uploadFile()` / `IROUP.uploadImage()`.
- V2 admin list/detail routes exist, but V2 create/update/delete/upload/person/staff routes are not ready for frontend migration.
- Admin token propagation is centralized in both clients, but mixed V1/V2 pages need a page-local readiness check before enabling V2 admin reads.

Audit record:

```text
Team IROUP/backend/database-v2/ADMIN-MIGRATION-AUDIT.md
```

Recommended migration order:

1. `dashboard.html` read-only V2 summary proof.
2. `report.html` read-only summary/report proof, separate from dashboard.
3. Module read-list pilots only: MOU, scholarship/events, travel, mobility.
4. V2 detail reads where needed.
5. V2 create/update/delete only after write contracts are locked.
6. V2 upload/file relation workflow only after CRUD contracts stabilize.

---

## Latest Dashboard V2 Readiness Pilot

### Session: 2026-05-11 - Dashboard V2 Admin-Read Readiness Pilot

**Phase goal:** Validate V2 admin endpoint access, admin token propagation, and V1/V2 coexistence inside `dashboard.html`. No dashboard render architecture migration.

Implementation:

- `dashboard.html` now loads `iroup-v2-api.js` after `iroup-config.js`.
- Added a sidecar `fetchV2DashboardSummary()` call using `IROUP_V2.admin.dashboardSummary()`.
- V2 summary result is stored separately in `state.v2Summary`.
- Added a tiny readiness chip: `V2 admin: checking/ready/unavailable`.
- V2 failure is graceful and does not block the existing V1 `IROUP.getReport(year)` dashboard render.

Intentionally unchanged:

- `fetchReport(year)`
- `reloadData()`
- `filteredReport()`
- `makeSummary()`
- KPI rendering from `state.raw`
- budget snapshot, rankings, attention tables, auto insights, quick search, and fiscal-year generation

Known configuration note:

- The V2 adapter still requires `IROUP_V2_SCRIPT_URL` or `IROUP_V2.setScriptUrl(url)` for live V2 access. Without it, the readiness chip reports unavailable while V1 dashboard rendering continues.

---

## Latest V2 Endpoint Configuration Strategy

### Session: 2026-05-11 - V2 Endpoint / Config Activation Planning

**Phase goal:** Plan live V2 endpoint activation without breaking V1 pages. No config value, frontend behavior, backend route, deployment, or production `Code.gs` change.

Plan record:

```text
Team IROUP/backend/database-v2/V2-ENDPOINT-CONFIG-PLAN.md
```

Configuration decision:

- Keep `IROUP.SCRIPT_URL` in `iroup-config.js` unchanged for V1.
- Use a separate V2 Apps Script deployment URL for `IROUP_V2_SCRIPT_URL`.
- Do not reuse the current V1 production deployment unless `v2.*` routing is explicitly wired and reviewed.
- Do not put the V2 URL into `iroup-config.js` during the pilot.
- Future implementation should add a small dedicated endpoint config file, such as `iroup-v2-endpoint.js`, loaded only by migrated pages.

Recommended future load order:

```html
<script src="iroup-config.js"></script>
<script src="iroup-v2-endpoint.js"></script>
<script src="iroup-v2-api.js"></script>
```

Public pages would use `../iroup-v2-endpoint.js` and `../iroup-v2-api.js`.

Key risks:

- V2 admin auth currently depends on Apps Script active-user email, so frontend token propagation alone may not be sufficient.
- `v2.schema` should be reviewed before a broadly reachable deployment.
- Public page script path behavior for `iroup-config.js` should be verified in the real hosting context.

---

## 0. UI Polish Log

### Session: 2026-05-09 — Readability & Contrast Pass + Login Page Improvement

**Phase goal:** CSS/UI polish only. No API changes, no JS refactor, no layout rewrites. All changes incremental and reversible.

#### `iroup-theme.css` — Contrast token fix (propagates to all pages automatically)

| Token | Before | After | Reason |
|-------|--------|-------|--------|
| `--ir-text-muted` (dark mode `:root`) | `#4a6880` (~2:1 contrast) | `#607a9a` (~3.5:1 contrast) | WCAG AA fail on dark `#07101f` bg |
| `--ir-text-muted` (light mode `[data-theme="light"]`) | `#94a3b8` (~2.3:1 contrast) | `#7a8fa8` | Better legibility on white bg |

Downstream tokens automatically improved: `.ir-label`, `.ir-input::placeholder`, `.ir-table th`, `.ir-badge--expired`, `.ir-kpi__sub`, `.ir-sidebar__user-sub`, `.ir-nav-section`, `.ir-footer-note`, `.ir-empty`.

#### `index.html` — Login page polish (9 targeted CSS changes)

| Change | Before | After |
|--------|--------|-------|
| Body background palette | blue-green-yellow gradient | blue-purple-blue (`#E8F0FC → #EDE8FA → #E8F4FD`) |
| Orb 2 colour | green `rgba(91,173,62,0.1)` | purple `rgba(124,58,237,0.12)` |
| Orb 3 colour | gold `rgba(245,166,35,0.08)` | blue `rgba(26,109,181,0.10)` |
| Card bg opacity | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.92)` |
| Card border | white-glass | blue-tinted glass `rgba(75,189,232,0.28)` |
| Card shadow | `0 20px 60px rgba(15,45,90,0.12)` | `0 24px 72px rgba(15,45,90,0.18)` |
| Globy mascot | `width:100px; opacity:0.15` (invisible) | `width:120px; opacity:0.55` (visible brand element) |
| Logo icon gradient | blue → blue (flat) | blue → purple `#5A32D0` (premium) |
| Google button weight | `font-weight:600` | `font-weight:700` |

**Visual direction:** soft blue/purple palette, glassmorphism card, mascot-assisted branding, professional university feel.

**Pending:** Visual verification in browser (user's responsibility before next index.html change).

---

### Session: 2026-05-09 — Login Experience Redesign (v1 Concept)

**Phase goal:** Elevate `index.html` from a polished single-card login into a premium split-layout experience. CSS/layout exploration only. No JS, no API, no auth flow changes.

**Why this phase started now:**
The previous readability pass (contrast fix + palette alignment) produced a cleaner card but revealed a structural ceiling — a centered single-card layout cannot communicate the platform's identity or scale regardless of how well the CSS is tuned. The mascot (Globy) and brand assets were present but underused. The login page is the first impression for all users; the gap between its appearance and the dashboard's quality became the clear next design priority.

#### Design direction — v1 Concept (tentatively approved)

| Dimension | Direction |
|-----------|-----------|
| Layout | Split-panel: left brand panel + right login form panel |
| Aesthetic | Premium SaaS-inspired university platform feel |
| Colour palette | Soft blue/purple gradient — consistent with previous session's palette shift |
| Depth technique | Subtle glassmorphism on form card; layered orb/blur effects on brand panel |
| Visual motif | International/global: globe, connectivity, network — aligned with IR Office identity |
| Mascot role | Globy promoted from background decoration to active brand element on left panel |
| Typography hierarchy | Stronger size contrast between headline, subtitle, and form labels |
| Enterprise signal | Cleaner spacing, reduced noise, intentional whitespace |

#### Emerging design language (v1 tokens)

```
Brand panel:   deep blue → purple gradient (#0F2D5A → #2D1B69 or similar)
Form side:     white/near-white, high contrast, clean
Accent:        blue-purple range (#4B8FD4, #5A32D0)
Glassmorphism: rgba(255,255,255,0.12–0.18) + blur(16–24px) on panel elements
Shadow:        0 24px 72px rgba(15,45,90,0.18) — same depth scale as previous session
```

**Design exploration method:** Claude Design (AI-assisted layout exploration) used to generate and evaluate composition candidates. v1 selected as the working direction.

**Status:** v1 concept approved. Implementation in `index.html` is the next step.
**Constraint:** All changes remain CSS/layout only — auth flow, Google Sign-In SDK, session logic are untouched.

---

## 1. Migration Checklist

### 1.1 Infrastructure

| Asset | Status | Notes |
|-------|--------|-------|
| `iroup-theme.css` | ✅ Done | 131 CSS custom-property tokens. Backward-compat aliases for all old variable names. |
| `iroup-utils.js` | ✅ Done | v1.0. IIFE exposing `IU` namespace. Replaces copy-pasted helpers across all pages. |
| Git repository | ✅ Done | Local git repo + GitHub. |

---

### 1.2 Per-Page Migration Status

Legend: `[✓]` fully migrated · `[~]` partial / stabilized · `[ ]` pending

| File | Status | Utils Loaded | Call Sites | Local Stubs | Notes |
|------|--------|-------------|-----------|-------------|-------|
| `report.html` | `[✓]` migrated | ✅ | ✅ Full (all IU.*) | ✅ Replaced with comments | Complete. Reference implementation. |
| `travel.html` | `[~]` partial | ✅ | ✅ Full (all IU.*) | ⏳ Kept — verify visually before removing | Call sites done; stubs pending cleanup commit. |
| `dashboard.html` | `[~]` partial | ✅ | ✅ Full (46 IU.* calls) | ⏳ Kept — verify visually before removing | Migrated 2026-05-09. Stubs have TODO markers. |
| `events.html` | `[~]` partial | ✅ | ⚠️ Stabilized only — `IU.toDate` at 3 sites; `esc`/`IROUP.formatDate` not yet migrated | ✅ Local `esc` kept + TODO marker | Crash fix: `IROUP.parseDate` → `IU.toDate`. Full IU migration is a future step. |
| `mou.html` | `[ ]` pending | ❌ | ❌ | N/A — `htmlSafe()` local, TODO marked | Uses `IROUP.getMouStatus()` and local `htmlSafe()`. Migration planned. |
| `mobility.html` | `[ ]` pending | ❌ | ❌ | N/A — `r9e()` + `formatDate()` local, TODO marked | Uses `r9e()` (esc) and local `formatDate()`. Migration planned. |
| `index.html` | `[ ]` deferred | ❌ | ❌ | ❌ | Auth/login page — v1 layout concept approved. CSS/layout implementation next. JS/auth untouched. |
| `public/public-scholar.html` | `[~]` public-safe endpoint migrated | ❌ | ❌ | ❌ | Governance Pass 2C-B Phase 1 complete. |
| `public/public-events.html` | `[~]` public-safe endpoint migrated | ❌ | ❌ | ❌ | Governance Pass 2C-B Phase 2 complete. |
| `public/public-mou.html` | `[~]` public-safe endpoint migrated | ❌ | ❌ | ❌ | Governance Pass 2C-B Phase 3 complete. D3 preserved. |
| `public/public-mobility.html` | `[~]` public-safe endpoint migrated | ❌ | ❌ | ❌ | Governance Pass 2C-B Phase 4 complete. Chart.js + D3 preserved. |
| `public/public-landing.html` | `[ ]` deferred | ❌ | ❌ | ❌ | 305 KB — needs dedicated audit first. Theme not yet linked. |

---

### 1.3 Theme Linking (`iroup-theme.css`)

| File | Theme Linked |
|------|-------------|
| `dashboard.html` | ✅ |
| `mobility.html` | ✅ |
| `mou.html` | ✅ |
| `report.html` | ✅ |
| `events.html` | ✅ |
| `travel.html` | ✅ |
| `index.html` | ✅ |
| `public/public-events.html` | ✅ |
| `public/public-mou.html` | ✅ |
| `public/public-mobility.html` | ✅ |
| `public/public-scholar.html` | ✅ |
| `public/public-landing.html` | ⏸ Deferred |

---

## 2. `IU` Namespace — Available Functions

Categorized for planning purposes. No restructuring needed — this is documentation only.

### Formatting utilities
```
IU.esc(v)                   HTML-safe escaping (& < > ' ")
IU.num(v)                   Number with Thai locale separators: 12,500
IU.money(v)                 Currency with Thai locale separators: 150,000
                            ⚠️  Does NOT append ' บาท' — use IU.money(x)+' บาท' where suffix needed
```

### Date utilities
```
IU.toDate(v)                Date parsing — ISO, Thai dd/mm/yyyy, Buddhist Era (BE → CE), native fallback
IU.fmtDate(v)               Short Thai date: "10 ม.ค. 68"   (2-digit year)
IU.fmtDateFull(v)           Long Thai date: "10 มกราคม 2568" (4-digit year)
```

### Aggregation utilities
```
IU.group(arr)               Count occurrences: ['A','B','A'] → { A: 2, B: 1 }
IU.sum(rows, key)           Sum a numeric field across row objects (strips commas)
```

### Render helpers / status calculators
```
IU.statusMou(row)           → 'active' | 'soon' | 'expired'      (reads 'วันสิ้นสุด')
IU.statusScholar(row)       → 'upcoming' | 'active' | 'soon' | 'urgent' | 'expired'
IU.statusEvent(row)         → 'upcoming' | 'active' | 'expired'  (reads 'วันเริ่ม', 'วันสิ้นสุด')
```

Load order in `<head>`: `iroup-config.js` → `iroup-utils.js` → `<style>`

---

## 3. Migration Markers Added This Session

Lightweight `// TODO: migrate to IU.*` comments added (no code changed) to:

| File | Location | What to migrate |
|------|----------|----------------|
| `dashboard.html` | Line ~158 | `esc`, `num`, `money`, `toDate`, `fmtDate` local stubs → remove after visual check |
| `dashboard.html` | Line ~287 | `group`, `sum` local stubs → remove; `uniqueCount` stays (local wrapper) |
| `events.html` | Line ~730 | `esc` → `IU.esc`; `IROUP.formatDate` call sites → `IU.fmtDate` |
| `mou.html` | Line ~567 | `htmlSafe` → `IU.esc`; `IROUP.getMouStatus` → `IU.statusMou`; add `iroup-utils.js` |
| `mobility.html` | Line ~699 | `formatDate` → `IU.fmtDate`; add `iroup-utils.js` |
| `mobility.html` | Line ~813 | `r9e` → `IU.esc` |

---

## 4. Current Architecture State

### Script load order (correct pattern — as in `report.html`, `travel.html`, `dashboard.html`)
```html
<head>
  <link rel="stylesheet" href="iroup-theme.css">   <!-- 1. shared design tokens -->
  <script src="iroup-config.js"></script>            <!-- 2. API client (IROUP.*) -->
  <script src="iroup-utils.js"></script>             <!-- 3. shared utilities (IU.*) -->
  <style>/* page-specific overrides */</style>       <!-- 4. inline page CSS -->
</head>
...
<script src="iroup-sidebar.js"></script>             <!-- last, before </body> -->
```

### Sidebar systems (two competing — not yet resolved)
| Sidebar Type | Pages | Status |
|---|---|---|
| `iroup-sidebar.js` injected (full 220px) | `dashboard.html`, `report.html`, `travel.html` | Active — do not touch |
| Mini inline sidebar (64px icon strip) | `mobility.html`, `mou.html`, `events.html` | Active — do not touch |
| No sidebar | All `/public/` pages | By design |

`iroup-sidebar.js` uses `!important` overrides — architectural problem, but replacement (`iroup-nav.js`) not built yet. Protected.

### API client (`iroup-config.js`)
Exposes `IROUP.getAll()`, `IROUP.add()`, `IROUP.edit()`, `IROUP.delete()`, `IROUP.getStats()`, `IROUP.getReport()`, `IROUP.getMouStatus()`, `IROUP.formatDate()`, `IROUP.SHEETS`, `IROUP.SCRIPT_URL`. Used by all 12 HTML pages. Do not modify.

Note: `IROUP.parseDate()` does NOT exist — use `IU.toDate()` instead.

---

## 5. Protected / Deferred Files

| File / Folder | Reason |
|---|---|
| `peach-workload-portfolio/` | Separate SPA — different architecture, different CSS, different API. Out of scope. |
| `iroup-config.js` | Working correctly, used by all pages. Any change breaks everything. |
| `iroup-sidebar.js` | Still actively used. Replace only after `iroup-nav.js` is designed and tested. |
| `index.html` | Login/auth page. Google Sign-In flow, own session management. Migrate last. |
| `public/public-landing.html` | 305 KB — needs a dedicated audit. Theme not yet linked. |
| `iroup-image-helper.js` | Orphaned (not linked anywhere) — leave as-is. |
| D3 / Chart.js styles inside pages | Visual output depends on them. High breakage risk. |
| Backend `Code.gs` | Out of scope for frontend refactor. |

---

## 6. Current Technical Debt

| Problem | Files Affected | Risk | Priority |
|---------|---------------|------|----------|
| Local utility stubs pending removal | `dashboard.html`, `travel.html` | Low — stubs are inert, call sites already on IU.* | Next cleanup pass |
| Partial IU migration | `events.html` | Medium — esc/formatDate still local | Next migration session |
| No IU loaded at all | `mou.html`, `mobility.html`, 4× public pages | Medium — divergence as IU.* evolves | Upcoming sessions |
| Two competing sidebar systems | All private pages | High — visual inconsistency | Blocked on `iroup-nav.js` |
| Inline CSS in every page | All pages | Medium | Low — after IU migration complete |
| `IROUP.parseDate` called but missing | Fixed in `events.html` | ✅ Resolved | — |
| `--ir-text-muted` contrast fail (dark + light) | All pages using theme tokens | ✅ Resolved — token raised in `iroup-theme.css` | — |
| Duplicate Google Fonts `<link>` tags | All pages | Low — performance only | Low |

---

## 7. Safe Next Steps (In Order)

### Immediate
1. **Visual verification** — open `index.html` (login page) in browser to confirm UI polish renders correctly.
2. **Visual verification** — open `dashboard.html` and `travel.html` to confirm IU migration rendering is correct.
3. **Stub removal** — once verified, remove local stubs from `travel.html` (committed separately from call-site migration per git workflow).
4. **Consistency check** — scan `dashboard.html`, `report.html`, `travel.html`, `events.html` for any inline CSS overriding `--ir-text-muted` that may need a matching manual fix.
5. **Login redesign implementation** — implement v1 split-layout concept in `index.html` (CSS/layout only; auth flow untouched).

### Next migration targets (in order of simplicity)
1. `public/public-scholar.html` — small, no charting, good warm-up
2. `public/public-events.html` — small, no charting
3. `events.html` full pass — migrate remaining `esc`/`IROUP.formatDate` call sites to IU.*
4. `public/public-mou.html` — has D3, check carefully
5. `public/public-mobility.html` — Chart.js + D3
6. `mobility.html` — large Chart.js page
7. `mou.html` — most complex (D3 map + Chart.js + `IROUP.getMouStatus`)

### Later (separate sessions)
- Build `iroup-nav.js` to replace competing sidebar systems
- Remove inline CSS blocks one page at a time (only after IU migration complete)
- Audit and link theme to `public-landing.html`
- Migrate `index.html` last

---

## 8. Git Workflow

```bash
# Checkpoint before any edit session
git add -A && git commit -m "checkpoint: before <page> migration"

# After call-site migration (keep stubs)
git add Team\ IROUP/<page>.html
git commit -m "migrate <page>.html: add iroup-utils.js, switch call sites to IU.*"

# After stub removal (separate commit)
git add Team\ IROUP/<page>.html
git commit -m "cleanup <page>.html: remove local utility stubs now covered by IU.*"
```

Commits made across sessions:
- `iroup-utils.js` creation
- `report.html` full migration (call sites + stub comments)
- `travel.html` migration (call sites switched; local stubs kept pending visual verification)
- `dashboard.html` migration (call sites switched; local stubs + TODO markers kept)
- `events.html` stabilization (iroup-utils.js added; `IROUP.parseDate` → `IU.toDate`)
- Migration markers added to `mou.html`, `mobility.html`
- Git + GitHub initial setup

---

*This document covers the Team IROUP frontend only. `peach-workload-portfolio/` is a separate system not tracked here.*

---

## 9. Login Polish Pass - Motion (2026-05-09)

- `index.html` received a CSS-only subtle motion polish pass.
- Google auth logic, sessionStorage, redirect flow, and HTML structure were not modified.
- Motion changes were limited to login card entrance, Google button hover/active response, public link hover/active response, and reduced-motion safeguards.
- `prefers-reduced-motion: reduce` continues to disable login animations and interactive transforms.
- Mascot positioning and text colors were intentionally left unchanged.

## 10. Login Polish Pass - Mascot Positioning (2026-05-09)

- `index.html` received a CSS-only Globy mascot placement pass using the existing `Globy_IROUP.png` asset.
- The mascot is rendered as a decorative `.brand::after` layer, so no HTML structure or auth logic changed.
- Desktop placement keeps Globy low and subtle inside the brand panel, behind primary brand content.
- Tablet sizing and opacity are reduced at `max-width:1080px`.
- The mascot layer is hidden at `max-width:880px` to preserve the collapsed/mobile login layout and avoid overlap with controls.
- Text colors, Google auth logic, sessionStorage, and redirect flow remain unchanged.

## 11. Ecosystem Readability / Contrast Pass - Start (2026-05-09)

- Began a non-redesign readability pass with `iroup-theme.css` and `dashboard.html`.
- Strengthened secondary and muted slate text tokens while preserving the soft premium palette.
- Slightly firmed light-mode borders and shadows to reduce the washed-out card/table feel.
- Improved shared table header readability, hero/topbar supporting text, labels, and KPI/panel supporting copy.
- Mirrored key readability values in `dashboard.html` because its inline CSS currently overrides shared theme tokens.
- No JavaScript, auth, sessionStorage, redirect flow, spacing system, or layout structure changes were made.

## 12. Readability / Contrast Pass - Selects and Report Tables (2026-05-09)

- Continued the focused readability pass with `iroup-theme.css` and `report.html`.
- Improved shared select/dropdown selected-value, option, placeholder, and label readability without changing control sizing or layout.
- Mirrored select readability values in `report.html` because its inline CSS overrides shared form-control styles.
- Improved report/export table readability by strengthening header color, base cell color, and muted supporting columns.
- Preserved the existing palette, responsive behavior, spacing, and report/export JavaScript.

## 13. Ecosystem Navigation Foundation (2026-05-09)

- Added lightweight cross-module navigation awareness between Team IROUP and `peach-workload-portfolio/frontend`.
- Team IROUP private sidebar now includes an `ECOSYSTEM` section with links back to the root workspace portal and across to PEACH Workload Portfolio.
- PEACH Workload Portfolio sidebar now includes matching ecosystem links back to the root workspace portal and across to Team IROUP.
- Links remain relative for GitHub Pages compatibility.
- Auth, sessionStorage, redirect logic, dashboard routing, and module internals were not refactored.

## 14. Light Theme Contrast Stabilization - Continued (2026-05-09)

- Continued the CSS-first light-mode readability pass across `travel.html`, `dashboard.html`, `report.html`, `mobility.html`, and `events.html`.
- Strengthened shared light theme secondary/muted text tokens and placeholder coverage in `iroup-theme.css`.
- Improved global table body readability and expired/gray badge label contrast without changing table structure.
- Stabilized older page-local gray scales and inline theme variables where those pages bypass shared tokens.
- Improved placeholder, helper, KPI support, empty/loading, metadata, and subdued badge text contrast while preserving layout and spacing.
- No JavaScript, auth/session/redirect logic, Apps Script/API logic, routing, or module architecture changes were made.

## 15. Final Light Theme Readability Stabilization Pass (2026-05-09)

- Final light-theme readability stabilization pass for MOU/report/travel/mobility minor contrast issues.
- Added page-local CSS override blocks only, preserving existing layout, spacing, JavaScript, auth/session/API logic, routing, and GitHub Pages compatibility.
- Strengthened remaining pale MOU placeholders, KPI subtext, file-empty text, row indexes, and empty/no-result text.
- Strengthened report table columns 3-7 and select display text.
- Darkened the travel completed badge and optional mobility row-index text.

## 16. MOU Real-Data Synchronization Pass (2026-05-09)

- MOU real-data synchronization pass: KPI, warning banner, map counts, popup, department chart, and filters now derive from liveMouList instead of mixed static/mock sources.
- Kept the existing MOU layout, D3 map rendering style, table structure, and Apps Script/API contract intact.
- Added small page-local helpers for live row normalization, status, country/dept aggregation, expiring rows, date filters, and status pills.
- API failure now renders safe empty states instead of mixing local fallback rows with live data.

## 17. Backend Governance Pass 1 (2026-05-09)

- Backend Governance Pass 1: added public-safe endpoint layer for MOU, Mobility, Travel, Scholarships, Events, and public stats. Raw admin endpoints remain for compatibility but are marked as admin-only legacy endpoints pending auth enforcement.

## 18. Backend Governance Pass 2A (2026-05-09)

- Backend Governance Pass 2A: added admin auth guard foundation in compatibility mode. Public endpoints remain open. Legacy admin endpoints are classified and ready for enforcement, but not blocked yet to preserve dashboard compatibility.

## 19. Backend Governance Pass 2B (2026-05-09)

- Backend Governance Pass 2B: added frontend admin token propagation from Google login to backend admin session. Admin token is stored in sessionStorage and attached to legacy admin API calls when available. Backend remains in compatibility mode; enforcement is deferred.

## 20. Backend Governance Pass 2C-A (2026-05-09)

- Backend Governance Pass 2C-A: removed remaining admin direct-fetch bypasses for reports/uploads by routing them through token-aware IROUP helpers. Added public-safe IROUP.getPublic* helper methods for upcoming public page migration. Backend remains in compatibility mode.

## 21. Backend Governance Pass 2C-B Phase 1 (2026-05-09)

- Backend Governance Pass 2C-B Phase 1: migrated public-scholar.html to public-safe scholarship endpoints using sanitized payload adapters while preserving existing public UI behavior.

## 22. Backend Governance Pass 2C-B Phase 2 (2026-05-09)

- Backend Governance Pass 2C-B Phase 2: migrated public-events.html to public-safe event endpoints using sanitized payload adapters while preserving existing public UI behavior.

## 23. Backend Governance Pass 2C-B Phase 3 (2026-05-09)

- Backend Governance Pass 2C-B Phase 3: migrated public-mou.html to public-safe MOU endpoints using a sanitized payload adapter while preserving existing public map, chart, table, filter, and status behavior.

## 24. Backend Governance Pass 2C-B Phase 4 (2026-05-09)

- Backend Governance Pass 2C-B Phase 4: migrated public-mobility.html to public-safe mobility/travel endpoints using sanitized aggregate adapters while preserving existing public dashboard behavior.

## 25. Backend Governance Pass 2C-B Final Phase (2026-05-09)

- Backend Governance Pass 2C-B Final Phase: migrated public-landing.html to public-safe endpoints for stats, scholarships, events count, and MOU map aggregation. Landing now avoids raw getStats/getMouByCountry/getAll calls while preserving existing UI behavior.

## 26. Admin Stabilization Pass 1 (2026-05-10)

- Admin Stabilization Pass 1: fixed urgent admin UX/data integrity issues for MOU upload payload, Mobility mock-data first render, Scholarship/Event inactive view toggles, and empty-state add actions.

## 27. Mobility Workflow Usability Stabilization (2026-05-10)

- Stabilized `mobility.html` add/edit modal state without changing backend governance, auth flow, or page architecture.
- Add actions now clear stale form values and reset any previous edit id before opening the modal.
- Edit actions continue to hydrate from the loaded live row, with explicit modal mode tracking.
- Save action now guards against double-submit and refreshes live Mobility data after successful add/edit.
- Mobility live loading now uses a single idempotent workflow loader with stale-response protection and parallel inbound/outbound fetches.
- Verification: inline script syntax check passed; local HTML serving check returned HTTP 200. Browser visual check was blocked by the in-app browser client on localhost.

---

## 28. IROUP Database V2.2 Final Freeze (2026-05-10)

### Direction Shift

The project has shifted from V1 frontend-first patching to a database-first / backend-first rebuild.

Current architecture direction:

```text
Database-first
-> Backend V2-first
-> API DTO-first
-> Frontend migration later
```

The old V1 frontend/UI is now primarily:

- visual reference
- UX reference
- workflow reference

It is not the long-term architecture source of truth.

### Data Architecture Is Source of Truth

For IROUP V2, admin forms must follow the normalized backend schema. If the current dashboard add/edit forms are not suitable for the V2 backend, they should be redesigned later to match the V2 data model instead of forcing V2 APIs to preserve old flat form structures.

Priority order:

1. V2 schema
2. V2 backend/API
3. V2 admin form design
4. V2 frontend UI polish

Old V1 dashboard forms may be used as UX/reference only, not as architecture constraints.

Reason: if input forms collect data in the wrong structure, the platform cannot produce accurate analytics, reporting, public DTOs, or reliable relational joins. Frontend quality depends on correct operational data design first.

### New Operational Platform Foundation

The new architecture is being rebuilt around:

- normalized relational-style Google Sheets
- isolated V2 Apps Script backend
- DTO-based admin/public APIs
- public/private data separation
- validation and governance layers
- future maintainability

Google Sheets is now treated as a production-lite operational database layer, not just a spreadsheet.

Core stack:

```text
IROUP_DATABASE_V2
-> Apps Script V2 Backend
-> Normalized Admin/Public DTO APIs
-> Frontend pages
```

### Completed V2 Schema Work

- Created new Google Sheet: `IROUP_DATABASE_V2`
- Ran safe V2.2 schema generator
- Added `Team IROUP/backend/database-v2/IROUP_DATABASE_V2_BUILDER.gs`
- Applied V2.2 Schema Fix Pass 1
- Added `Team IROUP/backend/database-v2/V2-ROADMAP.md`

Important V2 assumptions:

- V1 data is mostly test data and is not a strict preservation constraint.
- No production API replacement has happened yet.
- No frontend migration has happened yet.
- Production `Code.gs` remains intentionally isolated during V2 development unless explicitly approved.

---

## 29. V2 Backend Foundation Phase (2026-05-10)

### Files Added

V2 backend files now exist under:

```text
Team IROUP/backend/database-v2/
```

Foundation files:

```text
IROUP_DATABASE_V2_BUILDER.gs
IROUP_V2_CONFIG.gs
IROUP_V2_DB.gs
V2-ROADMAP.md
```

### Current Priority

Future work should prioritize V2 backend/API work before frontend migration.

Immediate next direction:

- build isolated V2 Apps Script admin/public APIs
- define normalized DTO contracts
- validate relation-like IDs before writes
- exclude soft-deleted rows from aggregates
- sanitize public endpoints at the backend layer
- design future admin form payloads around normalized V2 tables
- only then migrate frontend pages module by module

### Future Admin Form Migration Rules

- MOU form should write to `MOU`, plus related `FILES` and `BUDGET` rows where applicable.
- Mobility form should separate `MOBILITY_PROJECT` and `MOBILITY_PARTICIPANT`.
- Travel form should separate `TRAVEL` and `TRAVEL_PARTICIPANT`.
- Scholarship/Event forms should support `public_visible`, files, links, dates, status, pin, and visibility.
- Files should have role and `visibility_level`.
- Budgets should be relation rows, not embedded text fields.
- Person data should use `PERSON_STUDENT`, `PERSON_STAFF`, or `PERSON_MANUAL` references, with snapshots where operational history requires them.

### Public/Private Boundary Rules

Public APIs must sanitize private operational and person data.

Public endpoints must never expose:

- student IDs
- staff IDs
- person IDs
- Mobility/Travel participant names
- row-level participant gender
- internal notes
- budget amounts or internal budget source details
- non-public files
- creator/updater identity fields

`FILES` may expose URLs only when:

- parent record has `public_visible = TRUE`
- file has `visibility_level = public`
- file is not soft-deleted
- file role is public-safe

### Development Guardrails

- Do not refactor frontend until V2 backend/DTO contracts are stable.
- Do not modify production `Code.gs` unless explicitly approved.
- Do not migrate data until V2 schema and backend behavior are verified.
- V1 frontend stabilization is no longer the primary architectural direction.
- Frontend pages should eventually consume normalized DTO APIs instead of raw sheet rows.

---

## 30. V2.2 Header Repair And Seed Diagnostics (2026-05-11)

### Completed

- `IROUP_DATABASE_V2` schema exists.
- V2.2 normalized schema direction is frozen.
- V2 backend foundation files exist.
- Validation layer exists.
- Seed sample data system exists.
- Admin auth guard exists.
- Admin DTO APIs exist.
- Public-safe DTO APIs exist.
- Root workspace auth gate exists.
- Backend test runner exists.
- V2 backend tests previously passed.
- Created `Team IROUP/backend/database-v2/IROUP_V2_REPAIR.gs`.
- Ran `repairV22Headers()`.
- Header repair succeeded for:
  - `FILE_ROLE_MASTER`
  - `PUBLIC_CACHE`
  - `TRAVEL_PARTICIPANT`
- Reran `seedV2SampleData()`.
- Seed diagnostics reported `failed=0`.

### Important Correction

Although seed diagnostics report `failed=0`, physical inspection showed many seed records are being appended after preformatted checkbox/validation rows around row 1000+, instead of starting at row 2.

Evidence from `debugV2SheetRows()`:

- `ADMIN` `lastRow=1001` and row 2 contains real data.
- `COUNTRY_MASTER` `lastRow=1005` but row 2 is blank.
- `FILE_ROLE_MASTER` `lastRow=1015` but row 2 is blank.
- `MOU` `lastRow=1004` but row 2 is blank.
- `PUBLIC_CACHE` row 2 contains real data because it does not have the same large preformatted blank region problem.

Current accurate status:

- Schema repair: success.
- Seed validation: success.
- Physical seed persistence position: inconsistent.
- V2 Router/API endpoint layer: blocked until Seed Write Position Fix Pass is completed and verified.

Root cause hypothesis:

The seed writer likely uses `appendRow()` or `getLastRow()+1`. Google Sheets counts preformatted/validated checkbox rows as used rows, so sample data is appended after those rows.

### Next Required Phase: Seed Write Position Fix Pass

Requirements:

- Do not recreate sheets.
- Do not clear production data.
- Do not touch frontend.
- Do not deploy.
- Do not touch production `Code.gs`.
- Fix only V2 seed/sample write behavior.
- Do not use `appendRow()` for V2 seed writes.
- Do not use `getLastRow()+1` for V2 seed writes.
- Add helper such as `findFirstEmptyRowByKey_(sheet, keyColumnIndex)`.
- Use primary key / ID column, usually column A, to find first truly empty row.
- Preserve existing validation, checkbox formatting, formatting, and frozen headers.

After fix, run:

1. `cleanupV2SampleData()`
2. `seedV2SampleData()`
3. `debugV2SheetRows()`

Expected result:

Row 2 should contain real seed data for `COUNTRY_MASTER`, `FILE_ROLE_MASTER`, `MOU`, `MOBILITY_PROJECT`, `TRAVEL`, `TRAVEL_PARTICIPANT`, and other seeded tables.

---

## 31. V2.2 Seed Write Position Fix Pass Complete (2026-05-11)

### Confirmed Status

V2.2 Seed Write Position Fix Pass completed successfully.

Previous issue:

- Seed validation passed, but physical rows were appended after preformatted checkbox/validation rows around row 1000+.
- Google Sheets counted formatted checkbox/validation rows as used rows.

Root cause:

- V2 seed writing used `appendRow()` / `getLastRow()+1` behavior, which is unsafe when sheets contain preformatted validation/checkbox ranges.

Fix implemented in `Team IROUP/backend/database-v2/IROUP_V2_DB.gs`:

- `appendV2Row_()` no longer uses `appendRow()`.
- `appendV2Row_()` no longer uses `getLastRow()+1`.
- Added `findFirstEmptyRowByKey_(sheet, keyColumnIndex)`.
- Seed writes now locate the first truly empty key row, usually column A.
- Existing validations, checkbox formatting, formatting, and frozen headers are preserved.
- Fallback inserts a row only if all key rows are occupied.

Verification completed:

1. `cleanupV2SampleData()`
2. `seedV2SampleData()`
3. `debugV2SheetRows()`

Confirmed row 2 contains actual seed data for:

- `COUNTRY_MASTER`
- `FILE_ROLE_MASTER`
- `MOU`
- `MOBILITY_PROJECT`
- `TRAVEL`
- `TRAVEL_PARTICIPANT`
- `PUBLIC_CACHE`

Current accurate status:

- V2 schema freeze: complete.
- Header repair: complete.
- Validation layer: working.
- Seed diagnostics: passed.
- Seed persistence positioning: fixed.
- Physical sheet writes: validated.
- Backend foundation: validated.

**Backend foundation validated and ready for V2 Router/API endpoint layer.**

### Next Phase

Proceed to V2 Router/API endpoint layer.

Still not doing:

- deployment
- frontend refactor
- production migration
- production enforcement
- public launch

---

## 32. V2 Router/API Contract Documentation Pass (2026-05-11)

### Current Confirmed State

- V2 backend foundation validated.
- Seed persistence fixed.
- V2 Router/API endpoint layer created.
- Router smoke tests passed.
- GitHub checkpoint pushed.

### Contract Documentation Added

Created:

```text
Team IROUP/backend/database-v2/V2-API-CONTRACT.md
```

The contract documents the current router entrypoint, request normalization rules, standard response shape, admin/public route classification, route parameters, public/private data boundary rules, and endpoint TODO status before frontend migration begins.

Documented router actions:

- `v2.health`
- `v2.schema`
- `v2.admin.mou.list`
- `v2.admin.mobility.list`
- `v2.admin.travel.list`
- `v2.admin.scholarship.list`
- `v2.admin.event.list`
- `v2.public.mou.list`
- `v2.public.mobility.summary`
- `v2.public.travel.summary`
- `v2.public.scholarship.list`
- `v2.public.event.list`

### Contract Notes

- Admin routes require `requireV2Admin_()`.
- Public routes must return sanitized DTOs or aggregates only.
- Public APIs must never expose Mobility/Travel participant personal data, person IDs, row-level gender data, budgets, internal notes, audit fields, or restricted files.
- `v2.admin.travel.list` and `v2.public.travel.summary` currently use router-local helpers and should be replaced with finalized Travel DTO helpers before frontend migration relies on them.
- `v2.schema` is currently a public diagnostic route; before deployment, decide whether it should become admin-only or debug-only.

### Next Phase

Review and stabilize the V2 API contract before any frontend migration or deployment wiring.

Still not doing:

- frontend refactor
- production `Code.gs` edits
- deployment
- V1 API replacement
- production migration

---

## 33. V2 Frontend API Audit Pass (2026-05-11)

### Purpose

Prepared frontend migration to the V2 router layer without refactoring frontend behavior.

Created:

```text
Team IROUP/backend/database-v2/FRONTEND-V2-MIGRATION-PLAN.md
```

### Audit Findings

Most frontend pages use `Team IROUP/iroup-config.js` as the V1 API client. The main legacy patterns are:

- `IROUP.getAll(sheet)` raw sheet reads
- `IROUP.getReport(year)` dashboard/report aggregate
- `IROUP.getStats()` and `IROUP.getMouByCountry()`
- `IROUP.add/edit/delete()` flat-sheet writes
- `IROUP.uploadFile/uploadImage()` V1 Drive upload behavior
- `IROUP.getPublic*()` V1 public-safe helper methods
- root login fallback calls to old `createAdminSession` / `checkAdmin`

Direct `fetch()` calls found:

- central `fetch()` in `iroup-config.js`
- Google userinfo and old `checkAdmin` in `index.html`
- CDN world-atlas requests in map pages
- design artifact fetches in `index-design-v1.html`

### Migration Readiness

Current recommendation:

- No frontend migration yet.
- Do not replace `IROUP.SCRIPT_URL` globally.
- Create a separate V2 API client adapter later.
- Migrate public low-risk pages first only after V2 router deployment/client wiring is approved.

Important blockers:

- V2 router currently lacks public stats/map actions needed by `public-landing.html`.
- Public Mobility/Travel pages need list/detail DTOs, not only summary routes.
- Admin pages need detail/create/update/delete routes before forms can migrate.
- Dashboard/report need V2 aggregate/report contracts.
- Admin frontend migration depends on V2 auth/session deployment strategy.

### Page-Level Direction

- Early public candidates: `public-scholar.html`, `public-events.html`, `public-mou.html`
- Later public candidates: `public-landing.html`, `public-mobility.html`
- Admin read-only migration should precede admin writes.
- Mobility admin write migration remains the operational priority, but only after V2 normalized write contracts exist.

Still not doing:

- frontend refactor
- production `Code.gs` edits
- deployment
- V1 API replacement
- production migration

---

## 34. V2 Frontend API Adapter Pass (2026-05-11)

### Purpose

Created a safe frontend-side V2 API adapter layer for gradual migration without changing existing frontend behavior.

Created:

```text
Team IROUP/iroup-v2-api.js
Team IROUP/backend/database-v2/V2-FRONTEND-ADAPTER.md
```

### Adapter Strategy

The V2 adapter exposes:

- `IROUP_V2.public.*`
- `IROUP_V2.admin.*`
- `IROUP_V2.lookup.*`
- top-level diagnostics: `IROUP_V2.health()` and `IROUP_V2.schema()`

It standardizes:

- V2 route calls
- response normalization
- graceful client-side error normalization
- admin token lookup from `workspace_admin_token`, `iroup_admin_token`, `workspace_user`, and `iroup_user`

### Safety Notes

- Existing pages were not modified.
- `iroup-config.js` was not replaced.
- `IROUP.SCRIPT_URL` was not changed.
- `public/public-scholar.html`, `public/public-events.html`, `public/public-mou.html`, and `public/public-mobility.html` now load `iroup-v2-api.js` for approved public read-only pilot flows.
- The adapter has no hardcoded deployed V2 URL; it must be configured later with `IROUP_V2.setScriptUrl(url)` or `window.IROUP_V2_SCRIPT_URL`.

Current status:

- V1 and V2 clients can coexist safely.
- Frontend migration has started in limited public read-only pilot form.
- Admin write migration remains blocked until V2 write routes and normalized form contracts exist.

---

## 35. Public Pilot Migration Pass - Scholarship Page (2026-05-11)

### Purpose

Started the first safe frontend migration pilot using the V2 adapter layer.

Target page:

```text
Team IROUP/public/public-scholar.html
```

### Changes

- Added `../iroup-v2-api.js` to the public scholarship page.
- Migrated only the primary scholarship data-loading call from `IROUP.getPublicScholarships()` to `IROUP_V2.public.scholarshipList()`.
- Kept existing UI, rendering structure, styling, filters, search, language controls, and card layout intact.
- Added a page-local compatibility normalization path from V2 DTO fields into the existing render shape.

### DTO Compatibility Notes

The pilot exposed expected V1/V2 field differences:

- V1 expected `title`, `country`, `institution`, `level`, and `public_file_url`.
- V2 provides `title_th/title_en`, structured `country`, `institution_name`, `target_group/scholarship_type`, and `files[]`.

The page now adapts those fields locally without changing the rendering layer.

### Current Limitation

The V2 adapter still has no hardcoded deployed V2 URL. Live browser data loading requires explicit V2 endpoint configuration through `IROUP_V2.setScriptUrl(url)` or `window.IROUP_V2_SCRIPT_URL`.

Still not doing:

- admin page migration
- dashboard/report migration
- auth flow changes
- production `Code.gs` edits
- deployment
- V1 helper removal

---

## 36. Public Migration Wave 1 - Events Page (2026-05-11)

### Purpose

Continued the gradual public-page migration using the isolated V2 adapter.

Target page:

```text
Team IROUP/public/public-events.html
```

### Changes

- Added `../iroup-v2-api.js` to the public events page.
- Migrated only the primary events data-loading call from `IROUP.getPublicEvents()` to `IROUP_V2.public.eventList()`.
- Kept existing calendar, status calculation, sorting, filters, poster fallback, file button, KPI rendering, and page UI behavior intact.
- Hardened the page-local compatibility normalization path for V2 event DTOs.

### DTO Compatibility Notes

The events page still renders through its existing V1-style local shape. The mapper now adapts:

- `title_th/title_en`, `event_type`, `detail_th/detail_en`, `link_url/meeting_url`
- structured `organizer`, `country`, and `continent` objects
- public `files[]` entries for poster and file URLs

### Current Limitation

Live data verification still requires explicit V2 endpoint configuration through `IROUP_V2.setScriptUrl(url)` or `window.IROUP_V2_SCRIPT_URL`.

Still not doing:

- admin page migration
- dashboard/report migration
- auth flow changes
- production `Code.gs` edits
- deployment
- V1 helper removal

---

## 37. Public Migration Wave 1 - MOU List Page (2026-05-11)

### Purpose

Continued public read-only migration by moving the public MOU page's primary list data source to the V2 adapter.

Target page:

```text
Team IROUP/public/public-mou.html
```

### Changes

- Added `../iroup-v2-api.js` to the public MOU page.
- Migrated only the primary MOU list data-loading call from `IROUP.getPublicMou()` to `IROUP_V2.public.mouList()`.
- Kept existing KPI, table, chart, filter/search, D3 map rendering, local country aggregation, `IROUP.getMouStatus()`, `IROUP.formatDate()`, and world-atlas CDN behavior intact.
- Hardened the page-local compatibility normalization path for V2 MOU DTOs.

### DTO Compatibility Notes

The MOU page still renders through its existing V1-style local shape. The mapper now adapts:

- `partner_org_name/partner_org_name_en`
- structured `country`, `continent`, and `unit` objects
- `mou_type`
- public `files[]` entries for file URLs

### Current Limitation

Live data verification still requires explicit V2 endpoint configuration through `IROUP_V2.setScriptUrl(url)` or `window.IROUP_V2_SCRIPT_URL`. The page intentionally does not use `IROUP_V2.public.mouMap()` yet; map counts remain derived from the normalized list rows to preserve current behavior.

Still not doing:

- V2 MOU map aggregate route adoption
- admin page migration
- dashboard/report migration
- auth flow changes
- production `Code.gs` edits
- deployment
- V1 helper removal

---

## 38. Public Migration Wave 1 - Mobility/Travel List Page (2026-05-11)

### Purpose

Completed the remaining major Public Migration Wave 1 page by moving public mobility and travel list data sources to the V2 adapter.

Target page:

```text
Team IROUP/public/public-mobility.html
```

### Changes

- Added `../iroup-v2-api.js` to the public mobility page.
- Migrated only the primary list data-loading calls from `IROUP.getPublicMobility()` / `IROUP.getPublicTravel()` to `IROUP_V2.public.mobilityList()` / `IROUP_V2.public.travelList()`.
- Kept existing KPI rendering, charts, D3 map, local country aggregation, filters/search, top countries, detail modal, timeline, `personCount()`, and visual behavior intact.
- Hardened only the page-local compatibility normalization paths for V2 mobility and travel DTOs.

### DTO Compatibility Notes

The page still renders through its existing V1-style local shape. The mapper now adapts:

- structured `country`, `continent`, and `unit` objects where available
- `institution_name` and `project_name`
- `participant_group`, `level`, `participant_count`, and `participant_counts`
- public `files[]` entries for file URLs, although the current public UI does not actively render those links

### Current Limitation

Live data verification still requires explicit V2 endpoint configuration through `IROUP_V2.setScriptUrl(url)` or `window.IROUP_V2_SCRIPT_URL`. The page intentionally does not use `IROUP_V2.public.mobilitySummary()`, `IROUP_V2.public.travelSummary()`, or `IROUP_V2.public.mobilityMap()` yet; all stats/map/chart output remains derived from normalized list rows to preserve current behavior.

Still not doing:

- V2 mobility/travel aggregate route adoption
- admin page migration
- dashboard/report migration
- auth flow changes
- production `Code.gs` edits
- deployment
- V1 helper removal

---

## 39. Controlled V2 Admin Bridge Activation Milestone (2026-05-11)

### Confirmed Live State

The controlled V2 admin-safe sidecar bridge is now operational.

Confirmed in browser:

```text
dashboard.html -> V2 admin: ready
```

### Runtime Architecture

- V1 dashboard rendering remains active through `IROUP.getReport(year)`.
- V2 is currently used only as an isolated admin-safe read-only sidecar through `IROUP_V2.admin.dashboardSummary()`.
- V1 and V2 coexistence is preserved.
- No admin CRUD/write/upload migration has started.
- No production V1 runtime replacement or cutover has occurred.

### Milestones Completed

- Isolated V2 backend deployment is operational.
- Public V2 endpoints are operational.
- Controlled public frontend activation is operational.
- Request-aware V2 admin auth bridge is operational.
- Existing V1 session `adminToken` handoff reaches V2.
- SHA-256 token-map validation works through isolated V2 Script Properties.
- Apps Script `/exec` redirect-safe browser fetch handling is stabilized.
- V2 admin summary timeout/abort handling is stabilized.
- Dashboard runtime bridge resolves the V2 summary successfully.

### Lessons Learned

- Apps Script `/exec` normally returns an initial 302 redirect before the final `script.googleusercontent.com` JSON response.
- V1 `adminToken` is ephemeral and session-scoped.
- The current token-map bridge is a temporary coexistence mechanism.
- Long-term admin auth should move toward signed V2 admin tokens or Google token verification handoff.

### Next Recommended Phase

Controlled V2 read-only expansion:

1. `report.html` summary bridge.
2. Analytics/report aggregate DTO validation.
3. Normalized DTO rendering pilots.
4. Later, controlled admin module migration after read-only stability.

Still not doing:

- forced production cutover
- V1 `SCRIPT_URL` replacement
- admin CRUD/write/upload migration
- global dashboard/admin architecture rewrite
- production `Code.gs` changes

---

## 40. Report Page V2 Read-Only Summary Sidecar (2026-05-11)

### Purpose

Started the next controlled V2 admin-safe read-only expansion by adding a V2 report summary sidecar to `report.html`.

### Runtime Architecture

- `report.html` still renders from the existing V1 report flow.
- V1 functions remain the operational source:
  - `getReportFast()`
  - `getAllFallback()`
  - `loadAll()`
  - `makeRows()`
  - `applyReport()`
  - `exportRaw()`
  - `exportFilteredCsv()`
- V2 is used only as a non-blocking readiness sidecar through `IROUP_V2.admin.reportSummary(fiscalYear)`.
- V2 summary data is stored only in page-local `v2ReportSummary`.
- V2 data is not used for KPIs, tables, charts, filters, or exports.

### Changes

- Added `iroup-v2-endpoint.js` and `iroup-v2-api.js` between `iroup-config.js` and `iroup-utils.js`.
- Added `#v2ReportReadiness` badge with default text `V2 report: checking`.
- Added report-scoped V1 session metadata preflight without logging token values.
- Added `fetchV2ReportSummary(fiscalYear)` with graceful failure handling.
- Called the sidecar only after successful V1 load/render.

Still not doing:

- replacing `IROUP.SCRIPT_URL`
- replacing V1 report data source
- feeding V2 data into report rendering
- CRUD/write/upload migration
- admin form/session/login changes
- production cutover

---

## 41. Travel Page V2 Read-Only List Sidecar (2026-05-11)

### Purpose

Added the next controlled V2 admin read-only sidecar to `travel.html` only.

### Runtime Architecture

- `travel.html` still renders from the existing V1 travel pipeline.
- V1 travel, staff, and country reads remain active through `IROUP.getAll(...)`.
- V1 write/upload flows remain unchanged:
  - `submitTravel()`
  - `deleteTravel()`
  - `quickAddStaff()`
  - `uploadFileFromInput()`
- V2 is used only as a non-blocking list-readiness sidecar through `IROUP_V2.admin.travelList()`.
- V2 list data is stored only in page-local `v2TravelList`.
- V2 data is not used for KPIs, filters, table rows, modal hydration, staff selectors, exports, or upload behavior.

### Changes

- Added `iroup-v2-endpoint.js` and `iroup-v2-api.js` between `iroup-config.js` and `iroup-utils.js`.
- Added `#v2TravelReadiness` badge with default text `V2 travel: checking`.
- Added travel-scoped V1 session metadata preflight without logging token values.
- Added `fetchV2TravelListSidecar()` with graceful failure handling.
- Called the V2 sidecar only after successful V1 load/render.

Still not doing:

- replacing `IROUP.SCRIPT_URL`
- replacing V1 travel data source
- feeding V2 data into travel rendering
- CRUD/write/upload migration
- staff/country lookup migration
- admin form/session/login changes
- production cutover

---

## 42. V2 Write Isolation Architecture Plan (2026-05-11)

### Purpose

Created the documentation-only V2 write isolation plan before any admin CRUD migration begins.

Document:

```text
Team IROUP/backend/database-v2/V2-WRITE-ISOLATION-PLAN.md
```

### Scope Covered

- current V1 write surface map
- page-level migration risk matrix for `mou.html`, `mobility.html`, `travel.html`, and `events.html`
- DTO normalization strategy
- upload isolation plan
- admin auth direction for future writes
- rollback model
- recommended phased write strategy

### First Safe Write Candidate

Recommended first future pilot:

```text
events.html
event metadata-only create/update
```

The first pilot should exclude delete and upload migration, keep V1 write handlers available, and use explicit V2 module write routes only after backend contracts are reviewed.

Still not doing:

- runtime code changes
- frontend changes
- backend route changes
- V2 write activation
- CRUD/write/upload migration
- `IROUP.SCRIPT_URL` replacement
- commit or push

---

## 43. Event Metadata Write Dry-Run Contract (2026-05-11)

### Purpose

Prepared the first controlled V2 write pilot backend contract for `events.html` event metadata, without enabling real writes.

### Routes Added

```text
v2.admin.event.validate
v2.admin.event.create.dryRun
v2.admin.event.update.dryRun
```

### Runtime Behavior

- Admin auth is required through the existing V2 admin guard.
- Routes validate and normalize event metadata payloads only.
- Routes return a normalized `EVENT` preview with `dry_run: true` and `write_enabled: false`.
- No sheet writes, uploads, image uploads, file relation writes, deletes, or frontend wiring were added.

### Event Metadata Contract

Supported payload fields include:

- `title`, `title_th`, `title_en`
- `type` / `event_type`
- `country_id` or country display fallback
- `continent`
- `organizer_unit_id`, `unit_id`, or organizer/unit display fallback
- `location`
- `start_date`, `end_date`
- `time`, `start_time`, `end_time`
- `detail`, `detail_th`, `detail_en`
- `link`, `link_url`, `detail_url`
- `public_visible`
- `status`
- `pin`

Still not doing:

- real event create/update
- delete
- upload/image/file handling
- frontend submit wiring
- public route changes
- V1 `Code.gs` changes
- `IROUP.SCRIPT_URL` replacement
- commit or push

---

## 44. Event Draft Frontend Validation-Only Pilot (2026-05-11)

### Purpose

Added a frontend-side validation-only pilot to `events.html` for EVENT metadata.

### Scope

- Loaded `iroup-v2-endpoint.js` and `iroup-v2-api.js` beside the existing V1 config/utils.
- Added `buildV2EventDraftPayload(formData)` for page-local EVENT metadata mapping.
- Added `previewV2EventDraft(payload)` for manual dry-run validation.
- Added a temporary `Preview V2 Draft` button in the modal footer.
- Exposed `window.previewV2EventDraft` for console-triggered testing.

### Runtime Behavior

- The helper collects current EVENT form fields only.
- The helper calls `v2.admin.event.create.dryRun` for new modal state and `v2.admin.event.update.dryRun` when an edit ID is present.
- The helper logs the request payload, normalized preview, warnings, `dry_run`, and `write_enabled` to the browser console.
- V2 failure is caught locally and does not affect V1 UI.

Still not doing:

- replacing existing submit
- intercepting save
- real V2 create/update
- sheet mutation
- upload/image/file relation handling
- delete migration
- public rendering changes
- export changes
- auto-triggered dry-run
- `IROUP.SCRIPT_URL` replacement
- commit or push

---

## 45. V2 Admin Google Token Handoff Stabilization (2026-05-11)

### Purpose

Stabilized V2 admin authentication so browser-session V2 admin sidecars no longer depend primarily on manually maintained `IROUP_V2_ADMIN_TOKEN_MAP_JSON` entries.

### Changes

- `index.html` now preserves the Google OAuth `access_token` in `sessionStorage.iroup_google_access_token` after successful login.
- `iroup-config.js` exposes `IROUP.getGoogleAccessToken()`.
- `iroup-v2-api.js` prefers `googleAccessToken` for V2 admin requests and still sends legacy `adminToken` when available.
- `IROUP_V2_AUTH.gs` verifies explicit Google tokens through Google userinfo/tokeninfo and then validates the resolved email against the V2 `ADMIN` sheet.
- Legacy token-map auth remains available as fallback.

### Expected Impact

Fresh login should restore:

- dashboard V2 summary sidecar
- report V2 summary sidecar
- travel V2 list sidecar
- event draft dry-run preview

without manually updating the V2 token-map script property.

Still not doing:

- V1 `SCRIPT_URL` replacement
- V1 CRUD/upload changes
- public route changes
- save/delete behavior changes
- real V2 writes
- token-map removal
- hard auth cutover
- commit or push

---

## 46. Backend-Only Real V2 Event Metadata Write Pilot (2026-05-12)

### Purpose

Added backend-only real V2 EVENT metadata create/update routes as the first controlled write pilot.

### Routes

- `v2.admin.event.create`
- `v2.admin.event.update`

### Safety Controls

- Real writes are feature-flagged by isolated Apps Script Script Property:
  - `IROUP_V2_EVENT_WRITE_ENABLED=TRUE`
- Existing dry-run routes remain unchanged and available.
- Admin auth is still required through the V2 router.
- Write actors must be `admin`, `superadmin`, `super_admin`, or `owner`.
- Created/updated audit fields are populated from the verified V2 admin identity.

Still not doing:

- frontend submit wiring
- upload/image/file handling
- `FILES` relation writes
- budget relation writes
- delete migration
- scholarship write migration
- V1 `SCRIPT_URL` replacement
- V1 runtime changes
- production cutover

---

## Session: 2026-05-17 — knowledge.html + Sidebar Fixes Complete

knowledge.html outcomes:
- Created Team IROUP/knowledge.html as V2-native admin page
- Routes: v2.admin.knowledge.list/detail/create/update/delete
- v2.admin.file.upload with module=knowledge
- Features: Card/List views, TH/EN toggle, KPI cards (3),
  text/category/file-type filters, create/edit modal,
  image upload (≤10), PDF upload, video_url, link_url,
  public_visible toggle, soft delete, V2_KNOWLEDGE_WRITE_UI_ENABLED flag
- Browser-validated: card renders, save succeeds (V2), images upload OK

Sidebar fixes:
- iroup-sidebar.js: added KN คลังความรู้ entry between NW and RP
- news.html: removed inline sidebar, added iroup-sidebar.js script tag,
  fixed modal z-index (80 → 100000)
- knowledge.html: same sidebar migration applied, modal z-index fixed,
  input field dark color bug fixed (!important on background/color)

Admin pages — ALL COMPLETE ✅:
events.html ✅, scholarship.html ✅, mou.html ✅,
mobility.html ✅, travel.html ✅, news.html ✅, knowledge.html ✅

Public pages status:
- public-landing.html ✅, public-mou.html ✅, public-mobility.html ✅
- public-scholar.html ✅, public-events.html ✅ (all V2-native)
- public-news.html ❌ not yet created
- public-knowledge.html ❌ not yet created

Next tasks:
1. Add v2.public.news.list + v2.public.knowledge.list to backend
2. Create public-news.html
3. Create public-knowledge.html
4. UI Redesign (later — all pages together)
5. Facebook Auto-Post (phase 2)

---

## Session: 2026-05-17 — Knowledge Cover Image Support

### Completed

- Added dedicated Knowledge cover-image support without backend contract changes.
- `knowledge.html`:
  - Added dedicated รูปปก upload/preview section.
  - Cover uploads use `file_role_id = cover`.
  - Gallery images continue using `file_role_id = image`.
  - Preserved upload progress, retry handling, diagnostics, and sequential upload behavior.
- `public-knowledge.html`:
  - Public cards prioritize dedicated cover image.
  - Fallback order:
    1. cover image
    2. first gallery image
    3. placeholder
- `public-knowledge-detail.html`:
  - Hero section prioritizes dedicated cover image.
  - Gallery remains separate from cover.
- Preserved:
  - V2 endpoint strategy
  - public privacy filtering
  - existing upload architecture
  - existing DTO compatibility
- No backend/App Script changes required.
- No mock data added.

### Verification

- Inline script parse checks passed.
- `git diff --check` passed with CRLF warnings only.
- Browser smoke tests passed:
  - Admin cover picker visible.
  - Public list cover rendering works.
  - Detail hero rendering works.
  - No console errors observed.

### Strategic Direction

Knowledge articles are evolving from generic repository records into publication-style content entries with distinct hero/cover presentation separate from gallery media.

---

## Session: 2026-05-18 - Public Pages Visual Redesign Continuation

Public outcomes:
- Promoted `public-landing.html` into the cinematic live V2 landing page with the real MOU atlas, light/dark mode, country flags, and Mobility Flow graph.
- Redesigned `public-mou.html` with the new MOU hero assets, correct public navigation order, live V2 MOU data, D3/TopoJSON map, Chart.js summary, filters, and light/dark mode.
- Redesigned `public-mobility.html` as a no-hero dashboard-first public page, keeping live V2 public Mobility and Travel routes.
- Added 10-item pagination to the Mobility card list and Staff Travel timeline so long datasets do not make the page grow endlessly.
- Preserved D3/TopoJSON map rendering and Chart.js dashboard behavior for Mobility.

Standards confirmed:
- Public pages should share the top navigation order: ข่าวสาร, คลังความรู้, ทุนการศึกษา, กิจกรรม, MOU, Mobility.
- Public pages need a localStorage-backed light/dark mode toggle using `iroup_public_theme`.
- Long public lists should paginate by default, with 10 rows/cards per page unless a module has a stronger reason to show more.

Next:
- Continue redesigning remaining public pages one by one, starting with News / Knowledge / Scholarship / Events as needed.

---

## Session: 2026-05-18 - Public Mobility Stabilization

Public Mobility outcomes:
- Fixed `public-mobility.html` data loading after redesign by restoring the correct script order and paths: `iroup-v2-endpoint.js`, `iroup-config.js`, then `iroup-v2-api.js` from the `js/` folder.
- Added working TH/EN language toggle for the Mobility public page using `iroup_public_lang` in localStorage.
- Fixed Thai text encoding that had displayed as `????` by restoring the Thai translation set.
- Fixed country display when the V2 DTO returns `country` as an object, preventing `[object Object]` in the top-country panel.
- Kept live V2 public routes unchanged: `IROUP_V2.public.mobilityList()` and `IROUP_V2.public.travelList()`.

Verification:
- Inline script parse passed.
- `git diff --check` passed with CRLF warnings only.
- Local smoke test returned HTTP 200.
- Confirmed the Thai page title renders correctly in the browser and no `????` markers remain.

---

## Session: 2026-05-18 - Public Landing + Public MOU + Public Mobility Redesign Stabilization

Completed:

- `public-landing.html` is now the active cinematic V2 public landing page.
- Added live V2 MOU atlas integration.
- Added live KPI overlap section.
- Added Mobility Flow graph.
- Added country flags support.
- Added light/dark theme support.
- Preserved V2 public runtime architecture.

Public MOU outcomes:

- `public-mou.html` redesigned with:
  - live V2 public MOU route
  - real D3/TopoJSON world map
  - Chart.js summary section
  - redesigned filters
  - redesigned table
  - new MOU hero assets
- Existing V2 public DTO architecture preserved.

Public Mobility outcomes:

- `public-mobility.html` redesigned into compact dashboard-first layout.
- Uses live V2 public Mobility/Travel routes.
- Added charts, map, cards, timeline, and pagination.
- TH/EN switching stabilized using localStorage: `iroup_public_lang`.
- Fixed Thai encoding problems.
- Fixed country object rendering problems.
- Corrected V2 adapter loading from `js/` path.
- Stabilized browser rendering after redesign.

Standards confirmed:

- Preserve V2 public DTO boundaries.
- Do not expose participant personal data.
- Public pages remain V2-only with no V1 fallback.
- Dashboard-first UX direction is now preferred over oversized hero-first layouts for data-heavy pages.

Next recommended phase:

- Begin Design System migration using:
  - `Team IROUP/css/iroup-design.css`
  - `Team IROUP/js/iroup-theme.js`
- Migrate pages incrementally using the new `ir-*` component classes.
- Keep migration reversible and CSS-first.
- Do not refactor backend/API/auth/session logic during UI redesign.

Important constraints:

- Preserve Google OAuth/session behavior.
- Preserve V2 runtime architecture.
- Preserve GitHub Pages compatibility.
- Preserve D3 and Chart.js functionality.
- Preserve public/private DTO safety boundaries.
- Append documentation only; do not rewrite prior history.

---

## Session: 2026-05-18 - Public News + Public Knowledge Redesign Wave

Completed:

- Redesigned `public-news.html` as the current public NEWS list page.
- Redesigned `public-news-detail.html` as the current public NEWS detail page.
- Redesigned `public-knowledge.html` as the current public Knowledge list page.
- Redesigned `public-knowledge-detail.html` as the current public Knowledge detail page.
- Preserved the existing live V2 public routes:
  - `IROUP_V2.public.newsList()` / `v2.public.news.list`
  - `IROUP_V2.public.knowledgeList()` / `v2.public.knowledge.list`
- No backend/App Script route changes were required.
- No V1 public fallback was reintroduced.

Public NEWS outcomes:

- `public-news.html` now uses the redesigned public visual pattern:
  - dark/light mode using `iroup_public_theme`
  - TH/EN switching using `iroup_public_lang`
  - unified public nav order
  - hero graphics for dark/light modes
  - live V2 card grid
  - search/filter/category/SDG controls
  - KPI summary from live records
  - 10-item pagination
  - card/detail navigation through `public-news-detail.html?id=...`
- Removed the old list-page modal/gallery behavior in favor of the detail page flow.
- `public-news-detail.html` now renders live NEWS records by URL id and includes:
  - cover image support
  - badges, publish date, category, and SDG tags
  - content rendering
  - action panel
  - additional image gallery
  - gallery modal for viewing additional images
  - dark/light and TH/EN support

Public Knowledge outcomes:

- `public-knowledge.html` now uses the redesigned public visual pattern:
  - dark/light mode using `iroup_public_theme`
  - TH/EN switching using `iroup_public_lang`
  - unified public nav order
  - hero graphics for dark/light modes
  - live V2 card grid
  - search/category filters
  - type filters for all/PDF/video/image
  - card/detail navigation through `public-knowledge-detail.html?id=...`
- `public-knowledge-detail.html` now renders live Knowledge records by URL id and includes:
  - cover image support
  - content rendering
  - PDF/video/link action panel
  - image gallery
  - dark/light and TH/EN support

Standards confirmed:

- Public list/detail modules should use the shared public redesign pattern:
  hero graphic, dark/light, TH/EN, unified nav, live V2 route, glass/card styling,
  search/filter controls, pagination where useful, and detail pages for full content.
- Public pages must keep consuming V2 public DTOs only.
- Public pages must not call admin routes.
- Public pages must not expose private/internal fields.
- UI redesign must not refactor backend/API/auth/session logic.

Validation noted from the implementation session:

- Inline script parse checks passed for the redesigned NEWS and Knowledge pages.
- `git diff --check` passed with CRLF warnings only.
- Local HTTP smoke tests returned 200 for list/detail pages.
- Visual smoke checks passed for NEWS and Knowledge list/detail pages.

Next recommended phase:

- Continue the public redesign wave with `public-scholar.html`.
- After Scholarship, continue to `public-events.html`.
- Revisit `public-mobility.html`, `public-mou.html`, and `public-landing.html` after
  the list/detail module pattern is stable.

---

## Session: 2026-05-19 - Public Scholarship Redesign

Completed:

- Redesigned `public-scholar.html` using the current public redesign pattern.
- Added dark/light hero support using:
  - `Team IROUP/assets/scholarship-hero-dark.webp`
  - `Team IROUP/assets/scholarship-hero-light.webp`
- Preserved the existing live V2 public Scholarship route:
  - `IROUP_V2.public.scholarshipList()` / `v2.public.scholarship.list`
- No backend/App Script route changes were made.
- No V1 public fallback was reintroduced.

Public Scholarship outcomes:

- Added public top navigation consistent with News/Knowledge:
  ข่าวสาร, คลังความรู้, ทุนการศึกษา, กิจกรรม, MOU, Mobility.
- Added dark/light mode persistence through `iroup_public_theme`.
- Added TH/EN persistence through `iroup_public_lang`.
- Added hero KPI summary for total scholarships, open scholarships, and upcoming scholarships.
- Added dashboard-style filter bar:
  - search
  - country filter
  - level/target filter
  - status pills
- Added separate sections:
  - currently open scholarships
  - all scholarships
- Added scholarship cards with poster/cover preview, status pill, tags, summary,
  apply/file actions, deadline, and days-left indicator.

Standards confirmed:

- `public-scholar.html` now belongs to the redesigned content/opportunity public module pattern.
- Public Scholarship remains V2-only and public DTO-safe.
- Scholarship redesign did not touch admin routes, auth/session behavior, or backend contracts.

Validation:

- Inline script parse check passed.
- `git diff --check` passed with CRLF warnings only.
- Local HTTP smoke test returned 200.
- File-based Chrome visual smoke confirmed the hero and layout render; live data requires the normal V2 endpoint runtime.

Next recommended phase:

- Continue public redesign with `public-events.html`.

---

## Session: 2026-05-19 - Scholarship Article Content Fields

Completed:

- Added article-style scholarship content fields:
  - `content_th`
  - `content_en`
- Updated the V2 Scholarship schema builder so new V2 sheets include these columns.
- Added a repair helper for the existing live V2 sheet:
  - `addV2ScholarshipContentColumns()`
- Updated V2 Scholarship admin write normalization and sheet-row mapping.
- Updated V2 admin Scholarship DTOs to return `content_th/content_en`.
- Updated V2 public Scholarship DTOs to return `content_th/content_en`.
- Updated Scholarship sample seed rows with content values.
- Updated `scholarship.html` admin modal with two large textareas:
  - เนื้อหารายละเอียดทุน (TH)
  - Scholarship detail content (EN)
- Updated `public-scholar.html` normalization/search fallback so content fields are available for the next detail page.

Design decision:

- Scholarship detail content will follow the News/Knowledge model: one long
  article-style content field per language, instead of many rigid subsection fields.
- Structured fields remain for filtering/cards: title, country, institution, type,
  funding, target group, dates, status, apply link, files, and poster.

Operational note:

- Before adding real Scholarship content in the live spreadsheet, run
  `addV2ScholarshipContentColumns()` in the isolated V2 Apps Script project so the
  existing `SCHOLARSHIP` sheet gains `content_th/content_en` without shifting old data.

Next recommended phase:

- Create `public-scholar-detail.html`.
- Update `public-scholar.html` cards to open `public-scholar-detail.html?id=...`
  while keeping apply/file actions available.

---

## Session: 2026-05-19 - Global Country Master Prepared

Completed:

- Added a V2 global country master upsert helper:
  - `upsertV2GlobalCountryMaster()`
- Added 249 ISO 3166-1 alpha-2 / alpha-3 country and territory codes for
  `COUNTRY_MASTER`.
- Country IDs use the existing stable pattern:
  - `CTRY-TH`
  - `CTRY-MY`
  - `CTRY-US`
  - etc.
- Added generated country display support:
  - English country name
  - Thai country name where Apps Script `Intl.DisplayNames` is available
  - flag emoji
  - continent bucket
  - search alias
  - active status
  - sort order
- Updated `seedCountryMaster()` so it now delegates to the global upsert instead of
  reseeding only the old 10-country baseline.

Operational note:

- Before Peach enters real MOU, Mobility, Travel, Scholarship, or Event data that
  references countries, run:
  - `upsertV2GlobalCountryMaster()`
- The function updates existing `CTRY-*` rows and inserts missing rows. It does not
  delete custom/test country rows.
- Existing references to stable IDs such as `CTRY-TH`, `CTRY-JP`, and `CTRY-MY`
  remain safe.

Source basis:

- ISO 3166-1 alpha-2 / alpha-3 country code list mirrored by RIPE NCC.
- Operational continent buckets are used for IROUP filters/reporting.

---

## Session: 2026-05-19 - Events Public Page Redesign

Completed:

- **Redesigned `public-events.html`** to match the stable public redesign pattern
  (same as News / Knowledge / Scholarship).
  - Old design: gradient-only hero, list layout, no dark/light mode, no proper TH/EN,
    old-style nav with emojis.
  - New design:
    - Dark/light hero webp assets: `events-hero-dark.webp` / `events-hero-light.webp`
    - Dark/light mode via `iroup_public_theme` localStorage
    - TH/EN toggle via `iroup_public_lang` localStorage
    - Unified public nav order: ข่าวสาร / คลังความรู้ / ทุนการศึกษา / กิจกรรม (active) / MOU / Mobility
    - Card grid (auto-fill, minmax 320px) replacing old list+calendar layout
    - Two sections: "กำลังดำเนินการและกำลังจะมาถึง" + "กิจกรรมทั้งหมด"
    - KPI bar: total / upcoming / ongoing
    - Filters: search, country dropdown, event type dropdown, status pills
    - Event-specific card UX: poster/cover from FILES, status badge (upcoming/ongoing/done),
      date range (start–end), event_mode badge (online/onsite/hybrid), country flag,
      organizer (unit), participant_count, join link (meeting_url), attachment file
    - Cards link to `public-events-detail.html?id=...`
  - V2 public DTO boundary preserved: only `IROUP_V2.public.eventList()` called.
  - No admin routes, no participant personal data exposed.

- **Created `public-events-detail.html`** (new file, did not exist before).
  - Same nav/hero/theme/lang pattern as scholarship detail.
  - Hero: events-hero-dark/light.webp assets with 98%→8% gradient overlay.
  - Loads full event list via `IROUP_V2.public.eventList()`, finds by `event_id`.
  - Layout: cover image + article (detail_th/detail_en) + sticky facts panel.
  - Facts panel: date range, time range, location, country + flag, organizer, event type,
    event mode, participant count.
  - Action buttons: Join (meeting_url), Event Website (link_url if different), Attachment.
  - Status badge in hero: upcoming / ongoing / done derived from start_date / end_date.
  - "Back to Events" link returns to `public-events.html`.

Files changed:
- `public/public-events.html` — full rewrite (redesign)
- `public/public-events-detail.html` — new file created

V2 API route used: `v2.public.event.list` → `IROUP_V2.public.eventList()`

---

## Session: 2026-05-19 - Public Scholarship Card/Detail Fixes

Completed:

- Enlarged Scholarship public card poster area and aligned the card grid closer to
  the News card pattern.
- Added country flag support on public Scholarship cards.
- Fixed Scholarship card action labels:
  - internal detail: `อ่านรายละเอียด`
  - application link: `สมัครทุน`
  - attachment link: `ไฟล์แนบ`
- Added `public-scholar-detail.html` as the public Scholarship detail baseline.
- Scholarship cards now link to `public-scholar-detail.html?id=...`.
- Public detail page uses the Scholarship hero family, TH/EN state, dark/light state,
  poster image, article-style `content_th/content_en`, facts panel, apply link,
  external detail link, and attachment link.
- Public Scholarship file button now excludes poster/cover/image files so the
  attachment action does not open the cover image.
- Admin Scholarship uploads now save attachment files with public visibility because
  scholarship attachments are intended for public opportunity pages.
- Added repair helper for existing Scholarship attachments uploaded before this fix:
  - `makeV2ScholarshipAttachmentsPublic()`

Operational note:

- If existing Scholarship attachments were uploaded before this change and should
  appear publicly, run `makeV2ScholarshipAttachmentsPublic()` once after deploying
  the updated V2 repair script.

---

## Session: 2026-05-19 - UP_UNIT_MASTER Real Data

Completed:

- Created `IROUP_V2_UP_UNIT_MASTER.gs` with full official UP unit list.
- Added `upsertV2UPUnitMaster()` — safe to re-run; existing rows updated in place
  by `unit_id`, new rows appended.
- Covered 51 units across all types: คณะ, วิทยาลัย, วิทยาเขต, โรงเรียน, กอง,
  ศูนย์, สำนักงาน, สถาบัน, หน่วย, งาน, อุทยาน, โรงพยาบาล.
- `unit_id` format: `UPUNIT-[CODE]` (e.g. `UPUNIT-AGRI`, `UPUNIT-ICT`).
- `unit_code` (abbreviation) confirmed per official bilingual unit list with
  two corrections: AGRI (Agriculture), DOES (Division of Educational Services).
- Added `UPUNIT-UPILI` — สถาบันนวัตกรรมการเรียนรู้ / Innovative Learning Institute.
- `UPUNIT-UPLC` (ศูนย์ภาษา) has `parent_unit_id = UPUNIT-LA` (คณะศิลปศาสตร์).
- Excluded venue-only entries: ห้องประชุมอธิการบดี, ห้องประชุม อพ.สธ.,
  อาคารสงวนเสริมศรี.
- Old sample unit rows (`UNIT-*` prefix) manually deleted from the live sheet
  before running the upsert — `cleanupV2SampleData()` does not cover this prefix.

Deployment steps:

1. Copy `IROUP_V2_UP_UNIT_MASTER.gs` into the Apps Script project.
2. Run `upsertV2UPUnitMaster()` once from the editor.
3. Verify rows in the `UP_UNIT_MASTER` sheet.

---

## Session: 2026-05-19 - UP Unit Reference Audit/Repair

Completed:

- Added Unit reference audit/repair helpers to `IROUP_V2_UP_UNIT_MASTER.gs`.
- The audit covers every V2 sheet/field that currently stores a UP unit id:
  - `PERSON_STUDENT.unit_id`
  - `PERSON_STAFF.unit_id`
  - `PERSON_MANUAL.unit_id`
  - `MOU.up_unit_id`
  - `MOBILITY_PROJECT.up_unit_id`
  - `MOBILITY_PARTICIPANT.unit_id_snapshot`
  - `TRAVEL_PARTICIPANT.unit_id_snapshot`
  - `EVENT.organizer_unit_id`
  - `BUDGET.budget_source_unit_id`
- Added `auditV2UPUnitReferences()` to scan live data for unit ids that do not
  exist in the current `UP_UNIT_MASTER`.
- Added `repairV2LegacyUPUnitReferences()` to replace known legacy/sample ids
  with the current `UPUNIT-*` ids when the mapping is unambiguous.
- Added central university-level unit:
  - `UPUNIT-UP`
  - `unit_code = UP`
  - `unit_name_th = มหาวิทยาลัยพะเยา`
  - `unit_name_en = University of Phayao`
- Confirmed International Relations sample ids should map to the university-level
  unit because IR records are entered on behalf of University of Phayao:
  - `TEST-UNIT-IR -> UPUNIT-UP`
  - `UNIT-IR -> UPUNIT-UP`
  - `UNIT-IR-001 -> UPUNIT-UP`
- Known safe mappings include sample faculty/school ids such as
  `TEST-UNIT-SCI -> UPUNIT-SCI`, `TEST-UNIT-ENG -> UPUNIT-ENG`,
  `UNIT-ICT-001 -> UPUNIT-ICT`, and other direct faculty/unit matches.

Important:

- `UNIT-IR`, `TEST-UNIT-IR`, and `UNIT-IR-001` are now treated as central
  University of Phayao records and can be repaired automatically.
- If the audit returns other unresolved IR/unit variants, confirm whether they
  should also map to `UPUNIT-UP` before adding another mapping.
- Do not run `seedV2SampleData()` against the real data workbook.

Recommended Apps Script order:

1. Copy/update `IROUP_V2_UP_UNIT_MASTER.gs` in the Apps Script project.
2. Run `upsertV2UPUnitMaster()`.
3. Run `auditV2UPUnitReferences()`.
4. If the audit only shows mapped legacy/sample ids, run
   `repairV2LegacyUPUnitReferences()`.
5. Run `auditV2UPUnitReferences()` again and confirm `invalid = 0`.
6. If unresolved rows remain, paste the audit log back into Codex before doing
   manual edits.

---

## Session: 2026-05-19 - End-of-Office Handoff Before Home Move

Completed before handoff:

- Public Events redesign and `public-events-detail.html` were completed and pushed
  to GitHub in commit `8d57423`.
- Public Scholarship card/detail fixes remain in the current workspace:
  - larger card poster area
  - country flag fallback
  - clearer internal detail action (`อ่านต่อ`)
  - clearer apply/external/file actions
  - cover/poster images excluded from the public attachment button
- UP Unit master stabilization remains in the current workspace:
  - `UPUNIT-UP` added for University of Phayao / มหาวิทยาลัยพะเยา
  - legacy IR unit ids map to `UPUNIT-UP`
  - audit/repair helpers added for all V2 unit reference fields

Current next discussion:

- Do not start another large redesign before moving devices.
- Next investigation after pulling at home should focus on `public-landing.html`
  and admin/dashboard navigation:
  - sidebar/public links still look text-heavy or old-system-like
  - some public navigation links may still point to old paths or produce errors
  - landing ecosystem/module section needs review against the latest public
    redesign direction
- Preserve V2 runtime architecture and avoid backend/API refactors during this
  handoff unless a broken route is confirmed.

---

## Session: 2026-05-19 - Dashboard Sidebar Navigation Stabilization

Completed:

- Confirmed the reported old-looking navigation issue was on `dashboard.html`,
  not the public landing page.
- Restored `public/public-landing.html` back to its previous version after the
  mistaken landing-page pass.
- Updated the dashboard sidebar fallback markup and shared sidebar injector:
  - replaced old letter badges `NW`, `KN`, `WS`, and `PW` with icon-style labels
  - added Knowledge to the dashboard fallback sidebar
  - fixed dashboard Public Web / Public View links to use
    `public/public-landing.html`
- Kept the change scoped to frontend navigation only.

Verification:

- `dashboard.html`, `news.html`, `knowledge.html`, and
  `public/public-landing.html` returned HTTP 200 on the local live server.
- Browser DOM check confirmed the active dashboard sidebar no longer renders the
  old `NW`, `KN`, `WS`, or `PW` text badges.
- No backend, DTO, V2 adapter, or public data route changes were made.

Next recommended work:

- Continue with Admin UX + Data Quality Stabilization.
- Use the dashboard as the immediate admin-side UX stabilization target before
  adding new public modules.

---

## Session: 2026-05-19 - Dashboard Visual System Pass

Completed:

- Applied a limited visual/system pass to the live `dashboard.html` page using
  the `Team IROUP/Web design` dashboard direction as reference.
- Kept the existing dashboard data flow intact:
  - `getReport` rendering remains in place
  - V2 dashboard readiness bridge remains diagnostic/read-only
  - no backend, DTO, API adapter, auth, or schema changes
- Upgraded the dashboard shell:
  - softer design-system page background
  - glass-style fixed sidebar
  - icon-box navigation states
  - lighter dashboard header
  - refined hero, KPI, toolbar, panel, and insight card styling
- Added a small ecosystem quick-link strip for Public Web, Workspace, and
  Workload Portfolio so the ecosystem area is no longer only sidebar text.

Verification:

- Browser DOM check confirmed sidebar navigation still has 12 links, no old
  `NW`, `KN`, `WS`, or `PW` badges, and Public View still points to
  `public/public-landing.html`.
- Layout check confirmed the dashboard has no horizontal overflow at the tested
  desktop viewport and the hero remains a two-column layout.
- `git diff --check` passed with Windows CRLF warning only.

Follow-up adjustment:

- Applied a smaller dashboard palette alignment pass after review showed the
  page still felt too close to the previous dark-blue dashboard.
- Shifted the live dashboard colors closer to the Web design reference:
  - pastel blue/lavender page background
  - light glass sidebar
  - white/light hero panel instead of the large dark-blue hero block
  - softer white topbar, cards, panels, and ecosystem links
- Kept Globy and the current layout in place for now to avoid a larger
  structural rewrite.
- No backend, API, DTO, auth, or dashboard data-flow changes were made.

Icon follow-up:

- Replaced the visible dashboard shell icons with a small inline SVG icon set:
  - shared dashboard sidebar navigation
  - dashboard top action buttons
  - KPI cards
  - ecosystem quick-link cards
- Kept emoji usage inside lower content labels/titles for now where it is not
  part of the primary navigation/KPI icon system.
- Browser DOM verification confirmed the active sidebar renders 12 SVG icons,
  KPI cards render 6 SVG icons, top actions render 3 SVG icons, and ecosystem
  quick links render 3 SVG icons.

Data parity follow-up:

- Confirmed the dashboard scholarship KPI/list and the Scholarship admin page
  were reading different sources:
  - dashboard used legacy `IROUP.getReport()` aggregate scholarship rows
  - `scholarship.html` used `IROUP_V2.admin.scholarshipList()`
- Updated the dashboard to hydrate only scholarship rows from
  `IROUP_V2.admin.scholarshipList()` after `getReport()` loads.
- The dashboard now keeps the legacy report aggregate for other modules for now,
  but scholarship count/table/insights are based on the same V2 admin source as
  the Scholarship module page.
- Inline dashboard script syntax check passed.

---

## Session: 2026-05-20 - MOU V2 Admin/Public Stabilization Pass

Completed:

- Fixed the admin MOU detail route dependency by updating
  `validateModuleRecordLinkV2_()` in `IROUP_V2_VALIDATION.gs` to return the
  matched parent row. This restored `v2.admin.mou.detail` hydration for MOU
  edit modals and related FILES data.
- Confirmed live `FILES.record_id` values already match full `MOU.mou_id`
  values; no repair helper is required for MOU file IDs.
- Improved admin MOU file attachment handling:
  - removed the blocking alert flow from the table file button
  - fetches detail before opening files when the list DTO only has
    `file_summary`
  - accepts `file_url`, `public_file_url`, `url`, `drive_url`,
    `web_view_link`, `webViewLink`, and fallback `drive_file_id`
  - renders existing modal attachments as clickable `เปิด` links when a URL or
    Drive ID is available
- Updated the executive dashboard to hydrate MOU rows from
  `IROUP_V2.admin.mouList()` so dashboard MOU counts/lists align with the MOU
  admin page instead of legacy report aggregate data.
- Stabilized admin MOU table UX:
  - shows 10 rows per page
  - adds previous/next pagination
  - keeps row numbering aligned across pages
  - shows country flags using `flag_emoji` or ISO2 fallback
- Added the shared `iroup-sidebar.js` sidebar bridge to `mou.html` so admin
  navigation can include the newer News/Knowledge/Ecosystem-style entries.
- Reworked MOU admin/public layout:
  - map is full-width
  - chart is a separate full-width panel
  - public MOU content width is expanded for data-heavy display
- Changed `MOU Active แยกตามหน่วยงาน` chart behavior:
  - switched to a vertical bar chart
  - uses shortened unit labels with full labels in tooltips
  - uses gradient colors instead of flat blue
  - includes all active units rather than slicing to a small subset
- Updated admin and public MOU maps:
  - active countries remain color-filled by MOU count
  - route/dashed-line overlay was removed after review
  - maps now support D3 SVG pan/zoom
  - added `+`, `−`, and reset controls

Verification:

- Inline script syntax checks passed for:
  - `mou.html`
  - `public/public-mou.html`
- Local HTTP smoke test returned 200 for:
  - `Team IROUP/mou.html`
  - `Team IROUP/public/public-mou.html`
- `git diff --check` passed with Windows CRLF warnings only.

Important operational note:

- The Apps Script project must include the updated
  `IROUP_V2_VALIDATION.gs`; otherwise `v2.admin.mou.detail` will keep failing
  on the deployed backend even though the local source is fixed.

Current uncommitted files:

- `Team IROUP/backend/database-v2/IROUP_V2_VALIDATION.gs`
- `Team IROUP/dashboard.html`
- `Team IROUP/mou.html`
- `Team IROUP/public/public-mou.html`

Recommended next work:

- Browser-check admin `mou.html` after a hard refresh to confirm live
  authenticated data loads after the `chartGradient` fix.
- Continue MOU admin visual polish only after data load is confirmed stable.
- Then proceed to the next Admin UX + Data Quality module, likely Mobility or
  Events, using the same sequence: data parity, edit hydration, files, table
  pagination, visual layout.

Follow-up:

- Admin MOU was user-confirmed live after hard refresh:
  - MOU data loads.
  - `chartGradient` / `dataIndex` console error is resolved.
- Added a fixed public MOU map reference marker for University of Phayao:
  - label: `UP, Phayao`
  - approximate coordinate: Phayao / University of Phayao
  - marker zooms/pans with the D3 SVG map layer
  - route/dashed-line overlay remains removed.
- Verification:
  - inline script syntax passed for `public/public-mou.html`
  - `git diff --check -- "Team IROUP/public/public-mou.html"` passed
  - browser smoke confirmed `.up-map-pin` renders and no `stroke-dasharray`
    route/dashed-line element is present.

Admin visual polish follow-up:

- Applied a small, CSS-only MOU admin polish pass to `mou.html`.
- Scope was intentionally limited to visual surface alignment:
  - softer dashboard-like page background
  - rounded/glassier topbar
  - refined sidebar active state
  - softer KPI/filter/chart/table panel radius and shadows
  - cleaner input, pill, pager, modal, and table hover styling
- No backend, API adapter, auth/session, MOU list/detail/write/delete, file, map
  data, or chart data logic was changed.
- Verification:
  - inline script syntax passed for `mou.html`
  - `git diff --check -- "Team IROUP/mou.html"` passed
  - local browser smoke confirmed no horizontal overflow at the tested desktop
    viewport.

---

## Session: 2026-05-20 - Mobility Admin Stabilization Kickoff

Completed:

- Began Mobility admin stabilization using the MOU admin page as the current
  baseline for data-safe UX work.
- Updated `mobility.html` list/card rendering:
  - added 10-row pagination for list view
  - added matching pagination for card view
  - keeps row numbering aligned across pages
- Hardened Mobility initial data load:
  - lookup/list calls now use `Promise.allSettled`
  - Mobility list failure still fails the page clearly
  - country/unit lookup hiccups no longer fail before the list response can be
    inspected
- Cleaned Mobility edit hydration:
  - uses `IROUP_V2.admin.mobilityDetail()` adapter wrapper
  - removed temporary debug console logs from edit open flow
- Updated dashboard Mobility parity:
  - dashboard now hydrates Mobility rows from
    `IROUP_V2.admin.mobilityList()` after the legacy report loads
  - inbound/outbound dashboard counts now align with the Mobility admin source
    when V2 admin auth is available

Verification:

- Inline script syntax checks passed for:
  - `mobility.html`
  - `dashboard.html`
- `git diff --check` passed with Windows CRLF warnings only.
- Local browser smoke opened `mobility.html` without horizontal overflow.

Current caveat:

- Local Codex browser cannot validate authenticated Mobility live data because it
  does not have Peach's Google/admin session; it shows `Google token missing`.
- Next live user check should hard refresh `mobility.html` in the authenticated
  browser and confirm:
  - V2 Mobility rows load
  - pagination appears when rows exceed 10
  - edit modal detail hydration works
  - participant list loads in edit mode

---

## Session: 2026-05-20 - Mobility Admin/Public Redesign Pass

Completed:

- Applied a small, data-safe Admin Mobility visual refresh based on the
  `Team IROUP/Web design` direction:
  - aurora admin background
  - glassy topbar and panels
  - cleaner KPI, toolbar, table/card, pager, and modal surfaces
  - more stable add/edit modal spacing for participant rows and long forms
- Follow-up fix after live screenshot review:
  - Mobility add/edit modal now sits above the shared admin sidebar
  - modal height is clamped to the viewport
  - only the modal body scrolls
  - form fields are constrained to prevent horizontal overflow
  - modal centering now uses fixed viewport positioning instead of shell flex
    alignment so it stays centered even with the shared sidebar loaded
  - Admin Mobility page title is anchored inside the topbar instead of floating
    above the header surface
- Connected `mobility.html` to the shared `js/iroup-sidebar.js` sidebar so the
  admin navigation set matches the current admin shell.
- Kept Admin Mobility runtime data/write logic on the V2 admin adapters.
- Public Mobility remains linked to current V2 public data routes:
  - `IROUP_V2.public.mobilityList()`
  - `IROUP_V2.public.travelList()`
- Expanded Public Mobility map country normalization so active countries from
  the current Mobility/Travel data are more reliably highlighted on the D3 map.
- Updated Public Mobility Chart.js charts to use generated gradients for:
  - summary doughnut
  - inbound/outbound bar chart
  - trend area fill

Verification:

- User-confirmed live Admin Mobility after hard refresh:
  - V2 Mobility rows load.
  - Add/edit modal opens correctly.
  - Edit/detail hydration works.
  - Participant list behavior is acceptable in the authenticated browser.
- User-confirmed Public Mobility is acceptable after the redesign pass.
- Follow-up visual fix:
  - changed Mobility modal form controls from dark navy fills to white/light
    blue surfaces across normal, hover, focus, invalid, and autofill states.
  - kept the change scoped to CSS only in `mobility.html`.
- Validation:
  - inline script syntax passed for `mobility.html`
  - `git diff --check -- "Team IROUP/mobility.html"` passed with Windows CRLF
    warning only.

Next recommended work:

- Commit the Mobility verification/color fix.
- Proceed to the next Admin UX + Data Quality module, likely Events, using the
  same data-safe sequence: data parity, edit hydration, file behavior, table/list
  ergonomics, then visual layout.

---

## Session: 2026-05-20 - Events Admin Stabilization Kickoff

Completed:

- Began Events admin stabilization using the current Dashboard/MOU/Mobility admin
  shell direction.
- Kept Events runtime data/write logic on the existing V2 admin adapters:
  - `IROUP_V2.admin.eventList()`
  - `IROUP_V2.admin.eventCreate()`
  - `IROUP_V2.admin.eventUpdate()`
  - `IROUP_V2.admin.eventDelete()`
  - `IROUP_V2.admin.fileUpload()`
- Connected `events.html` to the shared `js/iroup-sidebar.js` sidebar so admin
  navigation includes the current News/Knowledge/Ecosystem entries.
- Added 10-record pagination for both card and list views.
- Updated the Events modal shell to match the newer Mobility pattern:
  - fixed viewport-centered panel
  - modal body scrolls independently
  - page scroll locks while modal is open
  - form controls use light surfaces across normal/hover/focus states
- Applied a small CSS-only visual alignment pass:
  - softer admin background
  - glassy topbar and toolbar
  - cleaner cards/table/pager/modal surfaces
- Follow-up public Events pagination:
  - `public/public-events.html` now limits each event section to 10 cards per page.
  - Ongoing/upcoming and past/all sections each have independent previous/next
    pagination.
  - Pagination resets when search, country, type, or status filters change.
- Follow-up public Events calendar:
  - Added a month-view calendar to `public/public-events.html`.
  - Calendar highlights days that contain Events from the currently filtered result
    set.
  - Multi-day Events are shown on every date within their start/end range.
  - Users can move between months, jump back to today, and click a date to see
    the Events on that day.

Verification:

- Inline script syntax passed for `events.html`.
- Inline script syntax passed for `public/public-events.html`.
- `git diff --check -- "Team IROUP/events.html"` passed with Windows CRLF warning
  only.
- `git diff --check -- "Team IROUP/public/public-events.html"` passed with Windows
  CRLF warning only.
- Local HTTP smoke returned 200 for `events.html`.
- Local HTTP smoke returned 200 for `public/public-events.html`.
- User-confirmed live authenticated Events page after hard refresh.
- User-confirmed Public Events pagination and calendar behavior after review.

Next recommended work:

- Commit the Events admin stabilization pass.
- Continue Admin UX + Data Quality stabilization with the next module, likely
  Travel, using the same sequence: data parity, edit hydration, files/relations,
  table/list ergonomics, then visual layout.
