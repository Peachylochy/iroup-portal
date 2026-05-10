# IROUP Database V2 Sample Data Plan

Planning document for fake sample data used to test `IROUP_DATABASE_V2` backend behavior, validation, joins, aggregates, admin APIs, public APIs, and public/private boundaries.

This is documentation only. Do not create `IROUP_V2_SEED_SAMPLE_DATA.gs` until this plan is reviewed.

## Purpose

Sample data should verify that the normalized V2.2 schema works as a production-lite Google Sheets database through Apps Script middleware.

The sample set is for backend/API testing only and should be easy to remove. Future seed scripts should prefix all generated IDs with `TEST-`, `FAKE-`, or `DUMMY-`.

## Schema Corrections to Preserve

For polymorphic relations in `BUDGET`, `FILES`, `AUDIT_LOG`, and `PUBLIC_CACHE`, the `module` value must use the allowed V2 module enum:

```text
mou
mobility
travel
scholarship
event
```

Do not use sheet names such as `MOBILITY_PROJECT`, `TRAVEL`, or `SCHOLARSHIP` as module values.

`FILE_ROLE_MASTER` must match the Schema Fix Pass 1 fields:

```text
file_role_id
file_role_name
public_safe
active
sort_order
```

## Recommended Seed Order

1. System and master tables
2. Person tables
3. Transaction tables
4. Participant/detail tables
5. Budget/files polymorphic relations
6. Logs/cache

This order allows relation checks to pass as data is inserted.

## 1. System and Master Tables

### SYSTEM_SETTINGS

Seed fake but realistic settings:

- `SCHEMA_VERSION = 2.2`
- `PUBLIC_CACHE_MINUTES = 15`
- `DEFAULT_CURRENCY = THB`
- `MOU_SOON_THRESHOLD_DAYS = 90`

### ADMIN

Use clearly fake accounts:

- `TEST-ADMIN-001`, `admin.test@example.invalid`, `Test Admin`, `admin`, active
- `TEST-ADMIN-002`, `viewer.test@example.invalid`, `Test Viewer`, `viewer`, active

### COUNTRY_MASTER

Include countries needed across all modules:

- Thailand: `country_id = TEST-TH`, `iso2 = TH`, active
- Japan: `country_id = TEST-JP`, `iso2 = JP`, active
- South Korea: `country_id = TEST-KR`, `iso2 = KR`, active
- Australia: `country_id = TEST-AU`, `iso2 = AU`, active
- Inactive test country for validation checks

### UP_UNIT_MASTER

Include active and inactive units:

- `TEST-UNIT-IR`, International Relations Office, office
- `TEST-UNIT-SCI`, Faculty of Science, faculty
- `TEST-UNIT-ENG`, Faculty of Engineering, faculty
- `TEST-UNIT-OLD`, inactive unit for FK/active validation testing

### BUDGET_TYPE_MASTER

Seed budget types:

- `TEST-BUDGET-INTERNAL`, internal budget
- `TEST-BUDGET-UNIVERSITY`, university budget
- `TEST-BUDGET-EXTERNAL`, external partner budget
- `TEST-BUDGET-SELF`, self-funded
- `TEST-BUDGET-NONE`, no budget

### FILE_ROLE_MASTER

Use the current schema:

| file_role_id | file_role_name | public_safe | active | sort_order |
|---|---|---:|---:|---:|
| TEST-FILE-POSTER | poster | TRUE | TRUE | 10 |
| TEST-FILE-BANNER | banner | TRUE | TRUE | 20 |
| TEST-FILE-PUBLIC-PDF | public_pdf | TRUE | TRUE | 30 |
| TEST-FILE-EVIDENCE | evidence | FALSE | TRUE | 40 |
| TEST-FILE-LETTER | letter | FALSE | TRUE | 50 |

## 2. Person Tables

### PERSON_STUDENT

Use fake students only:

- `TEST-STU-001`, active, unit `TEST-UNIT-SCI`, degree level bachelor
- `TEST-STU-002`, active, unit `TEST-UNIT-ENG`, degree level master
- `TEST-STU-003`, inactive, used to test validation behavior

### PERSON_STAFF

Use fake staff only:

- `TEST-STF-001`, active, unit `TEST-UNIT-IR`, position officer
- `TEST-STF-002`, active, unit `TEST-UNIT-SCI`, position lecturer
- `TEST-STF-003`, inactive, used to test validation behavior

### PERSON_MANUAL

Use fake manual/external people:

- `TEST-PER-001`, person_type `guest`, unit `TEST-UNIT-IR`
- `TEST-PER-002`, person_type `external`, no UP unit or external affiliation in `program_or_position`

Manual people support guest/external participants while still using `person_source = MANUAL`.

## 3. Transaction Tables

### MOU

Create test rows:

- Public active MOU with country `TEST-JP`, unit `TEST-UNIT-IR`, `public_visible = TRUE`, `public_file_allowed = TRUE`
- Private/internal MOU with `public_visible = FALSE`
- Expired MOU for status/date testing
- Soft-deleted MOU with `is_deleted = TRUE`

### MOBILITY_PROJECT

Create mobility projects:

- Public inbound project, Japan, 3 participants, active date range
- Public outbound project, South Korea, 2 participants, upcoming date range
- Completed public project, Australia, completed date range
- Cancelled project with `status = cancelled`, `public_visible = TRUE`, should be excluded from public aggregate if API policy excludes cancelled records
- Private internal project with `public_visible = FALSE`
- Orphan project with zero participants
- No-budget project
- Soft-deleted parent project with `is_deleted = TRUE`

### TRAVEL

Create staff travel missions:

- Public mission with 2 staff participants
- Private mission with budget and internal files
- Completed mission for date/status testing
- Soft-deleted mission

### SCHOLARSHIP

Create scholarship rows:

- Public active scholarship with poster and public apply URL
- Draft/private scholarship
- Expired scholarship
- Pinned public scholarship

### EVENT

Create event rows:

- Public hybrid event with poster
- Private internal meeting
- Completed event
- Cancelled event

## 4. Participant / Detail Tables

### MOBILITY_PARTICIPANT

Test participant cases:

- Student participant linked to `PERSON_STUDENT`
- Staff participant linked to `PERSON_STAFF`
- Guest/external participant linked through `PERSON_MANUAL`
- Soft-deleted participant excluded from participant counts
- Snapshot fields populated from master data at creation time

Snapshot integrity test:

1. Seed participant with `full_name_snapshot`, `gender_snapshot`, `unit_id_snapshot`, and `program_or_position_snapshot`.
2. Later change the related master record.
3. Confirm participant snapshot stays unchanged for historical reporting.

### TRAVEL_PARTICIPANT

Test travel participant cases:

- Staff participant linked to `PERSON_STAFF`
- Manual participant for non-master person
- Soft-deleted participant excluded from aggregate counts
- `created_by` populated per Schema Fix Pass 1

## 5. Budget and Files Polymorphic Relations

### BUDGET

Use allowed module values only:

```text
mou
mobility
travel
scholarship
event
```

Budget test cases:

- `module = mobility`, `record_id = TEST-MOB-001`, internal unit budget
- `module = travel`, `record_id = TEST-TRV-001`, university budget
- `module = event`, `record_id = TEST-EVT-001`, external partner budget
- `module = mobility`, `record_id = TEST-MOB-NOBUDGET`, budget type no budget, amount blank or zero
- Soft-deleted budget excluded from summaries

Budget summary tests:

- Sum by module
- Sum by fiscal year
- Sum by budget type
- Sum THB using `amount_thb`
- Confirm public APIs never expose budget amount or internal budget source details

### FILES

Use allowed module values only:

```text
mou
mobility
travel
scholarship
event
```

File visibility test cases:

- Public poster on public scholarship: should be exposed
- Public PDF on public MOU with parent `public_visible = TRUE`: should be exposed
- Public file on private parent: must not be exposed
- Internal evidence file on public parent: must not be exposed
- Public visibility file on soft-deleted parent: must not be exposed
- Soft-deleted file: must not be exposed
- File role with `public_safe = FALSE`: must not be exposed even if `visibility_level = public`

Public file rule:

```text
parent.public_visible === TRUE
AND parent.is_deleted !== TRUE
AND file.visibility_level === "public"
AND file.is_deleted !== TRUE
AND FILE_ROLE_MASTER.public_safe === TRUE
```

## 6. Logs and Cache

### AUDIT_LOG

Seed fake logs for:

- create
- update
- soft_delete
- public_cache_refresh

Use allowed module values only.

### PUBLIC_CACHE

Cache test cases:

- module `mobility`, schema version `2.2`, valid `expires_at`
- expired cache row
- cache row for private/internal data should not exist

## Public / Private Visibility Test Cases

Public API tests should confirm:

- Only `public_visible = TRUE` parent rows are returned.
- `is_deleted = TRUE` parent rows are excluded.
- Mobility/Travel participant names, IDs, row-level gender, and person IDs are never returned.
- Participant counts are aggregated from non-deleted participant rows.
- Private budgets and internal notes are never returned.
- Files pass the full parent/file/role public rule before exposure.

## Mobility Aggregation Test Cases

Validate:

- inbound project count
- outbound project count
- inbound participant count
- outbound participant count
- active/upcoming/completed counts by date
- cancelled project excluded from public aggregate if policy requires
- orphan project with zero participants appears as project count but participant count 0
- soft-deleted project excluded from all aggregates
- soft-deleted participant excluded from participant counts

## Status / Date Test Cases

Use date ranges that force each status:

- upcoming: `start_date > today`
- active/ongoing: `start_date <= today <= end_date`
- completed/expired: `end_date < today`
- cancelled: manual status override
- draft: should not appear publicly unless policy explicitly allows

APIs should define whether derived status or stored status wins when they conflict.

## Edge Cases to Include

- Orphan mobility project with zero participants
- Soft-deleted parent record with active children
- Snapshot integrity after master data change
- No-budget project
- Cancelled project excluded from public aggregate
- Cross-module `record_id` collision, such as `TEST-001` used by both `mou` and `mobility`, proving `module + record_id` is required
- Public file on private parent
- Internal file role marked with `visibility_level = public`
- Participant with valid person source but inactive master row

## Review Gate Before Seed Script

Before writing `IROUP_V2_SEED_SAMPLE_DATA.gs`, review this plan for:

- exact fake IDs
- required field completeness
- relation integrity
- public/private expected outcomes
- date windows relative to the current test date
- cleanup/removal strategy
