# IROUP Database V2 Roadmap

Updated direction after shifting from frontend-first patching to database-first / backend-first architecture.

## Current State

Completed:

- Created new Google Sheet: `IROUP_DATABASE_V2`
- Ran `IROUP Database V2.2 Final Freeze Generator`
- Added schema builder: `Team IROUP/backend/database-v2/IROUP_DATABASE_V2_BUILDER.gs`
- Applied V2.2 Schema Fix Pass 1
- Created isolated V2 backend foundation:
  - `Team IROUP/backend/database-v2/IROUP_V2_CONFIG.gs`
  - `Team IROUP/backend/database-v2/IROUP_V2_DB.gs`
- Added V2 validation, seed sample data, admin auth guard, admin DTO APIs, public-safe DTO APIs, backend test runner, and root workspace auth gate.
- Added `Team IROUP/backend/database-v2/IROUP_V2_REPAIR.gs`.
- Ran `repairV22Headers()` successfully for `FILE_ROLE_MASTER`, `PUBLIC_CACHE`, and `TRAVEL_PARTICIPANT`.
- Reran `seedV2SampleData()` and seed diagnostics reported `failed=0`.

Important context:

- V1 data is mostly test data and does not need strict preservation.
- The project is no longer prioritizing V1 frontend patching.
- V2 backend and DTO contracts should stabilize before frontend migration.
- Backend foundation is validated and ready for V2 Router/API endpoint layer.

## Current Blocker: Seed Physical Write Position

Resolved. This section is retained as implementation history.

Schema repair and seed validation had succeeded, but physical sheet inspection showed seed records were not consistently written into row 2 / the first true data row.

Evidence from `debugV2SheetRows()`:

- `ADMIN` `lastRow=1001` and row 2 contains real data.
- `COUNTRY_MASTER` `lastRow=1005` but row 2 is blank.
- `FILE_ROLE_MASTER` `lastRow=1015` but row 2 is blank.
- `MOU` `lastRow=1004` but row 2 is blank.
- `PUBLIC_CACHE` row 2 contains real data because it does not have the same large preformatted blank region problem.

Current status:

- Schema repair: success.
- Seed validation: success.
- Physical seed persistence position: fixed.
- Physical sheet writes: validated.
- Router/API endpoint layer: ready to begin.

Root cause hypothesis:

The seed writer used `appendRow()` / `getLastRow()+1` behavior. Google Sheets can count preformatted/validated checkbox rows as used rows, causing test data to land after the preformatted region around row 1000+.

Fix completed:

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

Confirmed row 2 contains actual seed data for `COUNTRY_MASTER`, `FILE_ROLE_MASTER`, `MOU`, `MOBILITY_PROJECT`, `TRAVEL`, `TRAVEL_PARTICIPANT`, and `PUBLIC_CACHE`.

**Backend foundation validated and ready for V2 Router/API endpoint layer.**

## Architecture Direction

```text
Database-first
-> Backend V2-first
-> API DTO-first
-> Frontend migration later
```

Core stack:

```text
Google Sheets: IROUP_DATABASE_V2
-> Apps Script V2 Backend
-> Normalized Admin/Public DTO APIs
-> Frontend pages
```

Google Sheets is treated as a production-lite database, not just a spreadsheet.

## Data Architecture Source of Truth

For IROUP V2, the normalized database schema is the source of truth.

Priority order:

1. V2 schema
2. V2 backend/API
3. V2 admin form design
4. V2 frontend UI polish

Old V1 dashboard forms may be used as visual, UX, and workflow reference only. They are not architecture constraints, and the V2 backend should not preserve old flat form structures when those structures conflict with normalized data quality.

Reason: if admin forms collect data in the wrong structure, the system cannot produce accurate analytics, reporting, public DTOs, or reliable relational joins. Frontend polish must follow correct operational data design.

## Roadmap Phases

### Phase 0: Stop Frontend Patching

- Pause non-critical V1 frontend patching.
- Do not refactor frontend until V2 backend/DTOs are stable.
- Keep existing V1 pages usable, but avoid more architecture debt unless explicitly requested.
- Treat V1 forms as references only, not as write-contract requirements for V2.

### Phase 1: Create and Lock IROUP_DATABASE_V2 Schema

- Finalize normalized tabs, headers, validation lists, tab colors, and frozen headers.
- Keep schema naming consistent with `IROUP_V2_CONFIG.gs`.
- Relations should use stable IDs, not display names.
- Lock public/private boundary fields before any migration.

### Phase 2: Build Isolated V2 Apps Script Backend

- Continue adding new files under `Team IROUP/backend/database-v2/`.
- Do not touch production `Code.gs` unless explicitly approved.
- Build Apps Script-compatible helpers for normalized reads/writes.
- Add validation for foreign-key-like references and soft-delete behavior.
- Admin APIs can expose full operational data but must be designed for future auth.

### Phase 3: Build V2 Admin Test Interface / API Tester

- Create a safe internal tester for V2 APIs before connecting real frontend pages.
- Test add/edit/delete flows against normalized sheets.
- Verify relation integrity and soft-delete filtering.
- Test form payloads against V2 schema shape, not old flat dashboard payloads.
- Router/API endpoint work may now proceed after seed physical write position was fixed and verified.

### Phase 4: Seed or Migrate Test Data

- Seed clean sample data or migrate selected V1 test data.
- V1 preservation is optional, not a strict compatibility constraint.
- Confirm project/participant splitting for Mobility and Travel.
- Seed/sample writes now use the primary key / ID column to find the first truly empty data row.
- V2 seed writes do not use `appendRow()` or `getLastRow()+1`.
- Verification completed with `cleanupV2SampleData()`, `seedV2SampleData()`, and `debugV2SheetRows()`.
- Row 2 now contains real seed data for `COUNTRY_MASTER`, `FILE_ROLE_MASTER`, `MOU`, `MOBILITY_PROJECT`, `TRAVEL`, `TRAVEL_PARTICIPANT`, and other seeded tables.

### Phase 5: Build Normalized Public APIs

- Public endpoints must return DTOs, not raw sheet rows.
- Public APIs must sanitize private data at the backend layer.
- Mobility/Travel participant personal data must never be exposed publicly.
- `FILES` may expose URLs only when the parent record is `public_visible` and file `visibility_level` is `public`.
- Soft-deleted rows must be excluded from public aggregates.

### Phase 6: Refactor Frontend to Consume V2 DTOs

- Migrate frontend one module at a time after DTO contracts are stable.
- Frontend should consume normalized fields only.
- Frontend must not depend on raw sheet headers or hide private fields client-side.
- Redesign admin add/edit forms where needed so writes match the normalized V2 data model.

### Phase 7: Retire Old V1 API Gradually

- Keep V1 available until each module is verified on V2.
- Retire old endpoints only after admin/public workflows are confirmed.
- Document final cutover and rollback steps.

## Core Principles

- Do not modify production `Code.gs` without explicit approval.
- Do not migrate data until V2 schema and backend behavior are stable.
- Do not deploy V2 backend until public/private boundaries are verified.
- Public APIs must sanitize private data.
- Admin APIs should support future auth enforcement.
- Relations should use IDs, not display names.
- Soft-deleted rows must be excluded from aggregates.
- Backend should stay Apps Script compatible.
- Public API output should be stable DTOs, not raw sheet rows.

## Future Admin Form Migration Rules

- MOU forms should write to `MOU`, plus related `FILES` and `BUDGET` rows where applicable.
- Mobility forms should separate `MOBILITY_PROJECT` from `MOBILITY_PARTICIPANT`.
- Travel forms should separate `TRAVEL` from `TRAVEL_PARTICIPANT`.
- Scholarship and Event forms should support `public_visible`, files, links, dates, status, pin, and visibility fields.
- Files should always include role and `visibility_level`.
- Budgets should be relation rows in `BUDGET`, not embedded text fields.
- Person data should use `PERSON_STUDENT`, `PERSON_STAFF`, or `PERSON_MANUAL` references, with snapshots only where operational history needs them.

## Public Data Boundary Rules

Never expose publicly:

- student IDs
- staff IDs
- person IDs
- row-level names for Mobility/Travel participants
- row-level gender for Mobility/Travel participants
- budget amounts or internal budget source details
- internal notes
- non-public files
- creator/updater identity fields

Safe public outputs are aggregates and public display data only, such as country, continent, unit display name, institution/partner organization, title/project name, participant counts, public dates, derived status, and explicitly public file URLs.
