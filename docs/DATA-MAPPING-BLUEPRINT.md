# DATA-MAPPING-BLUEPRINT.md
# Personal IR Workspace / iROUP Database Mapping Blueprint

Last updated: 2026-05-09  
Source reviewed: `iROUP Database.xlsx`  
Purpose: ใช้เป็นคัมภีร์กลางสำหรับจัดโครง Google Sheets, Apps Script API, Admin UI, Public UI, Report/Export และ R2R evidence layer

---

## 0. Core Principle

ระบบนี้ควรมองเป็น 3 ชั้นข้อมูล:

```text
MASTER DATA
ข้อมูลอ้างอิง เช่น ประเทศ หน่วยงาน นิสิต บุคลากร

TRANSACTION DATA
ข้อมูลปฏิบัติงานจริง เช่น MOU, Inbound, Outbound, Travel, Scholarships, Events

PUBLIC VIEW DATA
ข้อมูลที่แสดงต่อสาธารณะ ต้องเป็น aggregate / sanitized data เท่านั้น
```

หลักสำคัญ:

```text
Admin = เห็นข้อมูลเต็มสำหรับปฏิบัติงาน
Public = เห็นเฉพาะข้อมูลที่เผยแพร่ได้
Apps Script = เป็นชั้น normalize / sanitize / aggregate
Frontend = ไม่ควรเดาชื่อคอลัมน์เอง
```

---

## 1. Privacy Rule

### 1.1 Admin Visibility

หน้า admin/dashboard สามารถใช้ข้อมูลเต็มได้ เช่น:

- ชื่อ-สกุล
- รหัสนิสิต
- คณะ/หน่วยงาน
- สาขา
- งบประมาณ
- ไฟล์แนบภายใน
- หมายเหตุภายใน
- รายละเอียดการเดินทาง
- รายชื่อผู้เข้าร่วม

### 1.2 Public Visibility

หน้า public ห้ามแสดงข้อมูลส่วนบุคคลและข้อมูลงบประมาณ

ไม่ควรส่งออกจาก public endpoint:

```text
ชื่อ-สกุล
รหัสนิสิต
ชื่อผู้เดินทาง
email
เบอร์โทร
จำนวนเงิน
งบประมาณ
ไฟล์ภายใน
หมายเหตุภายใน
```

Public page ควรแสดงเฉพาะ:

```text
จำนวนคน
ประเทศ
ทวีป
สถาบันต้นทาง/ปลายทาง
หน่วยงาน UP
ประเภทกิจกรรม
ชื่อโครงการที่เผยแพร่ได้
ช่วงเวลาแบบสรุป
```

### 1.3 Backend Rule

ข้อมูลส่วนบุคคลควรถูกตัดออกตั้งแต่ Apps Script public endpoint  
ไม่ควรใช้วิธีซ่อนด้วย CSS หรือ JavaScript ฝั่ง public เท่านั้น

---

## 2. Existing Workbook Structure

Current tabs:

```text
Admin
MOU
FACULTY
COUNTRY
ทุนการศึกษา
กิจกรรม
การเดินทาง
บุคลากร
Inbound
Outbound
STUDENT
```

Recommended conceptual groups:

```text
MASTER:
- Admin
- COUNTRY
- FACULTY
- STUDENT
- บุคลากร
- PERSON_MANUAL (recommended new tab)

TRANSACTION:
- MOU
- ทุนการศึกษา
- กิจกรรม
- การเดินทาง
- Inbound
- Outbound

RELATION / DETAIL:
- Outbound_Participants (recommended new tab)
- Travel_Participants (recommended new tab)
- Attachment_Log (optional future)
```

---

## 3. Master Data Mapping

## 3.1 COUNTRY

Current columns:

```text
code
th_name
en_name
continent
```

Role:

```text
Country master for all modules
```

Used by:

```text
MOU
Inbound
Outbound
Travel
Scholarships
Events
Public maps
Country autocomplete
Reports
```

Recommended additions later:

```text
iso2
flag
active
sort_order
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| code | country_code | ✅ | ✅ | Prefer as stable key |
| th_name | country_th | ✅ | ✅ | Thai display |
| en_name | country_en | ✅ | ✅ | English display |
| continent | continent | ✅ | ✅ | Normalize language later |

---

## 3.2 FACULTY

Current columns:

```text
code
th_name
en_name
type
```

Role:

```text
UP unit master
```

Used by:

```text
MOU
Inbound
Outbound
Travel
Reports
Admin filters
Public aggregate views
```

Recommended naming:

```text
UP_UNIT_MASTER
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| code | unit_code | ✅ | ✅ | Stable key |
| th_name | unit_th | ✅ | ✅ | Thai display |
| en_name | unit_en | ✅ | ✅ | English display |
| type | unit_type | ✅ | ✅ | school/office/center/etc. |

Data cleanup note:

```text
University of Phyao → University of Phayao
```

---

## 3.3 STUDENT

Current columns:

```text
รหัสนิสิต
ชื่อ-สกุล
เพศ
คณะ
สาขา
```

Role:

```text
Student lookup/master imported from central system
```

Important:

```text
This is not a public dataset.
Use only for admin autocomplete/autofill.
Do not expose student ID or name in public endpoint.
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| รหัสนิสิต | student_id | ❌ | ✅ | Private |
| ชื่อ-สกุล | full_name | ❌ | ✅ | Private |
| เพศ | gender | ❌ / aggregate only | ✅ | Public only if aggregated |
| คณะ | unit_th | ✅ aggregate | ✅ | Public count by unit allowed |
| สาขา | program_th | ❌ / aggregate optional | ✅ | Public only if needed as aggregate |

Recommended future split:

```text
prefix
first_name
last_name
```

---

## 3.4 บุคลากร

Current columns:

```text
รหัส
คำนำหน้า
ชื่อ
สกุล
ชื่ออังกฤษ
สกุลอังกฤษ
ทวีป
ต้นสังกัด
ตำแหน่ง
ประเภท
วัตถุประสงค์โครงการ
```

Role:

```text
Staff lookup/master imported from central or internal source
```

Important:

```text
This is not a public dataset.
Use for admin autocomplete/autofill.
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| รหัส | staff_id | ❌ | ✅ | Private |
| คำนำหน้า | prefix_th | ❌ | ✅ | Private |
| ชื่อ | first_name_th | ❌ | ✅ | Private |
| สกุล | last_name_th | ❌ | ✅ | Private |
| ชื่ออังกฤษ | first_name_en | ❌ | ✅ | Private |
| สกุลอังกฤษ | last_name_en | ❌ | ✅ | Private |
| ต้นสังกัด | unit_th | ✅ aggregate | ✅ | Public only aggregate |
| ตำแหน่ง | position | ❌ | ✅ | Private/internal |
| ประเภท | staff_type | ❌ / aggregate optional | ✅ | |
| วัตถุประสงค์โครงการ | default_purpose | ❌ | ✅ | likely not master-clean |

Potential issue:

```text
ทวีป appears in staff master but may not belong here unless used for travel/person context.
```

---

## 3.5 PERSON_MANUAL (Recommended New Tab)

Purpose:

```text
Store people not found in STUDENT or บุคลากร master.
Used by admin forms when user searches but no result appears.
```

Recommended columns:

```text
person_id
person_type
prefix
first_name
last_name
full_name
gender
unit
program_or_position
source_note
created_at
created_by
active
```

Rules:

```text
- Admin can add manual person.
- Manual person can be selected in Mobility/Travel.
- Public must never expose manual person-level data.
```

---

## 4. Transaction Data Mapping

## 4.1 MOU

Current columns:

```text
[blank column]
หน่วยงาน_UP
องค์กร_ตปท
ประเทศ
ทวีป
ประเภท
วันเริ่ม
วันสิ้นสุด
ปีงบ
หมายเหตุ
ไฟล์_URL
วันที่บันทึก
```

Critical cleanup:

```text
Rename first header from blank/space to ID
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| ID / blank current | mou_id | ✅ | ✅ | Must rename header |
| หน่วยงาน_UP | up_unit | ✅ | ✅ | Map to FACULTY |
| องค์กร_ตปท | partner_org | ✅ | ✅ | Foreign institution/org |
| ประเทศ | country | ✅ | ✅ | Prefer country_code later |
| ทวีป | continent | ✅ | ✅ | Can derive from COUNTRY |
| ประเภท | mou_type | ✅ | ✅ | MOU/MOA/etc |
| วันเริ่ม | start_date | ✅ | ✅ | |
| วันสิ้นสุด | end_date | ✅ | ✅ | Used for status |
| ปีงบ | fiscal_year | ✅ | ✅ | |
| หมายเหตุ | note | ❌ | ✅ | Internal by default |
| ไฟล์_URL | file_url | ✅ / optional | ✅ | If public file is allowed |
| วันที่บันทึก | created_at | ❌ | ✅ | Internal metadata |

Derived fields:

```text
status = active / soon / expired
days_until_expiry
is_public_file
```

Public MOU allowed fields:

```text
mou_id
up_unit
partner_org
country
continent
mou_type
start_date
end_date
fiscal_year
status
public_file_url if allowed
```

---

## 4.2 Inbound

Current columns:

```text
ID
คำนำหน้า
ชื่อ
ชื่อกลาง
สกุล
เพศ
ประเภทผู้เข้าร่วม
สถาบันต้นทาง
ประเทศ
ทวีป
ระดับ
หน่วยงาน_UP
ภาษา
วันมาถึง
วันกลับ
โครงการ
วัตถุประสงค์
ปีงบ
งบประเภท
จำนวนเงิน
ไฟล์_URL
หมายเหตุ
วันที่บันทึก
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| ID | inbound_id | ❌ / aggregate only | ✅ | |
| คำนำหน้า | prefix | ❌ | ✅ | PII |
| ชื่อ | first_name | ❌ | ✅ | PII |
| ชื่อกลาง | middle_name | ❌ | ✅ | PII |
| สกุล | last_name | ❌ | ✅ | PII |
| เพศ | gender | ❌ / aggregate optional | ✅ | |
| ประเภทผู้เข้าร่วม | participant_type | ✅ aggregate | ✅ | |
| สถาบันต้นทาง | origin_institution | ✅ | ✅ | Not personal |
| ประเทศ | country | ✅ | ✅ | |
| ทวีป | continent | ✅ | ✅ | Can derive |
| ระดับ | level | ✅ aggregate | ✅ | |
| หน่วยงาน_UP | up_unit | ✅ | ✅ | |
| ภาษา | language | ✅ aggregate optional | ✅ | |
| วันมาถึง | start_date | ✅ | ✅ | |
| วันกลับ | end_date | ✅ | ✅ | |
| โครงการ | project_name | ✅ | ✅ | |
| วัตถุประสงค์ | purpose | ✅ | ✅ | |
| ปีงบ | fiscal_year | ✅ | ✅ | |
| งบประเภท | budget_type | ❌ | ✅ | Internal |
| จำนวนเงิน | amount | ❌ | ✅ | Do not expose public |
| ไฟล์_URL | file_url | ❌ / optional | ✅ | Internal by default |
| หมายเหตุ | note | ❌ | ✅ | Internal |
| วันที่บันทึก | created_at | ❌ | ✅ | |

Public inbound endpoint should aggregate to:

```json
{
  "direction": "inbound",
  "participant_count": 1,
  "participant_type": "...",
  "origin_institution": "...",
  "country": "...",
  "continent": "...",
  "up_unit": "...",
  "level": "...",
  "start_date": "...",
  "end_date": "...",
  "project_name": "...",
  "purpose": "...",
  "fiscal_year": "..."
}
```

---

## 4.3 Outbound

Current columns:

```text
ID
จำนวน
รหัสนิสิต
ชื่อ-สกุล
เพศ
คณะ
สาขา
สถาบันปลายทาง
ประเทศ
ทวีป
ระดับ
วันออก
วันกลับ
โครงการ
วัตถุประสงค์
ปีงบ
งบประเภท
จำนวนเงิน
ไฟล์_URL
หมายเหตุ
วันที่บันทึก
```

Current structure:

```text
One row may contain multiple participants as comma-separated values.
```

This works for operations but is hard for person-level reporting.

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| ID | outbound_id | ❌ / aggregate only | ✅ | |
| จำนวน | participant_count | ✅ | ✅ | Public can show count |
| รหัสนิสิต | student_ids | ❌ | ✅ | PII/private |
| ชื่อ-สกุล | participant_names | ❌ | ✅ | PII |
| เพศ | gender_list | ❌ / aggregate optional | ✅ | |
| คณะ | unit_list | ✅ aggregate | ✅ | |
| สาขา | program_list | ❌ / aggregate optional | ✅ | |
| สถาบันปลายทาง | destination_institution | ✅ | ✅ | |
| ประเทศ | country | ✅ | ✅ | |
| ทวีป | continent | ✅ | ✅ | |
| ระดับ | level | ✅ aggregate | ✅ | |
| วันออก | start_date | ✅ | ✅ | |
| วันกลับ | end_date | ✅ | ✅ | |
| โครงการ | project_name | ✅ | ✅ | |
| วัตถุประสงค์ | purpose | ✅ | ✅ | |
| ปีงบ | fiscal_year | ✅ | ✅ | |
| งบประเภท | budget_type | ❌ | ✅ | |
| จำนวนเงิน | amount | ❌ | ✅ | |
| ไฟล์_URL | file_url | ❌ / optional | ✅ | |
| หมายเหตุ | note | ❌ | ✅ | |
| วันที่บันทึก | created_at | ❌ | ✅ | |

Recommended future detail tab:

```text
Outbound_Participants
```

Columns:

```text
outbound_id
person_id
person_source
person_type
student_id
full_name
gender
unit
program
created_at
```

Public outbound endpoint should aggregate to:

```json
{
  "direction": "outbound",
  "participant_count": 5,
  "destination_institution": "...",
  "country": "...",
  "continent": "...",
  "level": "...",
  "start_date": "...",
  "end_date": "...",
  "project_name": "...",
  "purpose": "...",
  "fiscal_year": "...",
  "unit_summary": ["คณะวิทยาศาสตร์", "คณะศิลปศาสตร์"]
}
```

---

## 4.4 การเดินทาง

Current columns:

```text
ID
ชื่อโครงการ
วัตถุประสงค์
วันเริ่ม
วันสิ้นสุด
ประเทศ
ทวีป
เมือง
จำนวน
รหัสผู้เดินทาง
ชื่อผู้เดินทาง
ปีงบ
งบประเภท
จำนวนเงิน
ไฟล์_URL
หมายเหตุ
วันที่บันทึก
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| ID | travel_id | ❌ / aggregate only | ✅ | |
| ชื่อโครงการ | project_name | ✅ | ✅ | |
| วัตถุประสงค์ | purpose | ✅ | ✅ | |
| วันเริ่ม | start_date | ✅ | ✅ | |
| วันสิ้นสุด | end_date | ✅ | ✅ | |
| ประเทศ | country | ✅ | ✅ | |
| ทวีป | continent | ✅ | ✅ | |
| เมือง | city | ✅ | ✅ | |
| จำนวน | participant_count | ✅ | ✅ | |
| รหัสผู้เดินทาง | traveler_ids | ❌ | ✅ | PII/private |
| ชื่อผู้เดินทาง | traveler_names | ❌ | ✅ | PII |
| ปีงบ | fiscal_year | ✅ | ✅ | |
| งบประเภท | budget_type | ❌ | ✅ | |
| จำนวนเงิน | amount | ❌ | ✅ | |
| ไฟล์_URL | file_url | ❌ / optional | ✅ | |
| หมายเหตุ | note | ❌ | ✅ | |
| วันที่บันทึก | created_at | ❌ | ✅ | |

Recommended future detail tab:

```text
Travel_Participants
```

Columns:

```text
travel_id
person_id
person_source
person_type
full_name
unit
position_or_program
created_at
```

---

## 4.5 ทุนการศึกษา

Current columns:

```text
ID
ชื่อทุน
สถาบัน
ประเทศ
ระดับ
วันประชาสัมพันธ์
วันเปิดรับ
วันปิดรับ
ครอบคลุม
Link
Poster_URL
ไฟล์_URL
Pin
หมายเหตุ
วันที่บันทึก
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| ID | scholarship_id | ✅ | ✅ | |
| ชื่อทุน | title_th | ✅ | ✅ | Add title_en later if needed |
| สถาบัน | institution | ✅ | ✅ | |
| ประเทศ | country | ✅ | ✅ | |
| ระดับ | level | ✅ | ✅ | |
| วันประชาสัมพันธ์ | publish_date | ✅ | ✅ | |
| วันเปิดรับ | open_date | ✅ | ✅ | |
| วันปิดรับ | close_date | ✅ | ✅ | |
| ครอบคลุม | coverage_th | ✅ | ✅ | Add coverage_en later |
| Link | link_url | ✅ | ✅ | Define as detail or apply |
| Poster_URL | poster_url | ✅ | ✅ | |
| ไฟล์_URL | file_url | ✅ | ✅ | public attachment allowed |
| Pin | pin | ✅ | ✅ | sorting |
| หมายเหตุ | note | ❌ | ✅ | Internal |
| วันที่บันทึก | created_at | ❌ | ✅ | |

Recommended additions:

```text
title_en
institution_en
detail_url
apply_url
public_visible
status
```

Derived public status:

```text
upcoming
open
urgent
last_day
closed
```

---

## 4.6 กิจกรรม

Current columns:

```text
ID
ชื่อกิจกรรม
ประเภท
วันเริ่ม
วันสิ้นสุด
เวลาเริ่ม
เวลาสิ้นสุด
สถานที่
หน่วยงาน
จำนวน
รายละเอียด
Poster_URL
ไฟล์_URL
วันที่บันทึก
```

Standard API fields:

| Sheet Column | Standard Field | Public | Admin | Notes |
|---|---|---:|---:|---|
| ID | event_id | ✅ | ✅ | |
| ชื่อกิจกรรม | title_th | ✅ | ✅ | Add title_en later |
| ประเภท | event_type | ✅ | ✅ | |
| วันเริ่ม | start_date | ✅ | ✅ | |
| วันสิ้นสุด | end_date | ✅ | ✅ | |
| เวลาเริ่ม | start_time | ✅ | ✅ | |
| เวลาสิ้นสุด | end_time | ✅ | ✅ | |
| สถานที่ | location | ✅ | ✅ | |
| หน่วยงาน | organizer_unit | ✅ | ✅ | |
| จำนวน | participant_count | ✅ | ✅ | If not PII |
| รายละเอียด | detail_th | ✅ | ✅ | |
| Poster_URL | poster_url | ✅ | ✅ | |
| ไฟล์_URL | file_url | ✅ | ✅ | if public |
| วันที่บันทึก | created_at | ❌ | ✅ | |

Recommended additions:

```text
title_en
detail_en
country
continent
link_url
pin
public_visible
status
```

---

## 5. Recommended New Tabs

## 5.1 PERSON_MANUAL

Reason:

```text
For students/staff/guests not found in imported master data.
```

Columns:

```text
person_id
person_type
prefix
first_name
last_name
full_name
gender
unit
program_or_position
source_note
created_at
created_by
active
```

---

## 5.2 Outbound_Participants

Reason:

```text
Outbound currently stores multiple participants in one comma-separated cell.
This makes person-level report difficult.
```

Columns:

```text
outbound_id
person_id
person_source
person_type
student_id
full_name
gender
unit
program
created_at
```

---

## 5.3 Travel_Participants

Reason:

```text
Travel currently stores multiple travelers in one text cell.
```

Columns:

```text
travel_id
person_id
person_source
person_type
full_name
unit
position_or_program
created_at
```

---

## 5.4 Attachment_Log (Optional Later)

Reason:

```text
Centralized attachment tracking across modules.
```

Columns:

```text
attachment_id
module
record_id
file_name
file_url
file_type
public_allowed
uploaded_at
uploaded_by
```

---

## 6. API Contract Recommendation

## 6.1 Admin Endpoints

Admin endpoints may return full operational data.

```text
getAll(MOU)
getAll(Inbound)
getAll(Outbound)
getAll(Travel)
getAll(Scholarships)
getAll(Events)
getStudents()
getStaff()
getManualPersons()
getCountries()
getUnits()
```

## 6.2 Public Endpoints

Public endpoints must return sanitized data only.

```text
getPublicMou()
getPublicMobility()
getPublicTravel()
getPublicScholarships()
getPublicEvents()
```

Public endpoint rules:

```text
- No names
- No student IDs
- No staff IDs
- No budget amount
- No internal notes
- No internal-only files
- Aggregate participant data before returning
```

---

## 7. Frontend Mapping Rules

Frontend should not depend directly on raw Thai column headers.

Apps Script should normalize raw sheet rows into stable fields:

Example:

```js
{
  id: row["ID"],
  country: row["ประเทศ"],
  continent: row["ทวีป"],
  up_unit: row["หน่วยงาน_UP"] || row["คณะ"],
  start_date: row["วันเริ่ม"] || row["วันออก"] || row["วันมาถึง"],
  end_date: row["วันสิ้นสุด"] || row["วันกลับ"],
  file_url: row["ไฟล์_URL"]
}
```

Then frontend uses:

```text
record.country
record.continent
record.up_unit
record.start_date
record.end_date
record.status
```

---

## 8. Bilingual Public Strategy

Thai/English data is allowed and recommended.

Use explicit bilingual fields where public text needs language toggle:

```text
title_th
title_en
detail_th
detail_en
country_th
country_en
unit_th
unit_en
coverage_th
coverage_en
```

Current COUNTRY/FACULTY already support bilingual display.

Do not remove Thai headers immediately if Apps Script already depends on them.  
Instead, normalize in Apps Script and gradually move toward standard names.

---

## 9. Migration Strategy

Recommended order:

```text
1. Freeze current workbook and backup.
2. Create this blueprint in repo as DATA-MAPPING-BLUEPRINT.md.
3. Rename only dangerous headers first, especially MOU blank first header → ID.
4. Add PERSON_MANUAL.
5. Add public_visible fields to Scholarships/Events if needed.
6. Add detail participant tabs later: Outbound_Participants and Travel_Participants.
7. Update Apps Script normalization layer.
8. Update frontend one module at a time.
9. Verify admin/public data consistency.
```

Avoid doing all at once.

---

## 10. Immediate Priorities

### Priority 1: MOU

```text
- Rename blank first header to ID
- Confirm file_url supports PDF/JPG/PNG
- Confirm public file visibility rule
```

### Priority 2: Mobility

```text
- Fix display limit 6 of 87 if unintended
- Connect country dropdown to COUNTRY
- Connect student/staff lookup to STUDENT/บุคลากร
- Add manual person flow
- Decide whether to add Outbound_Participants
```

### Priority 3: Travel

```text
- Fix form theme conflict
- Connect traveler lookup to STUDENT/บุคลากร/PERSON_MANUAL
- Keep budget private
```

### Priority 4: Scholarships/Events

```text
- Add country autocomplete
- Add export/report if needed
- Add public_visible
- Clarify Link vs Detail_URL vs Apply_URL
```

### Priority 5: Public Pages

```text
- Audit every public page
- Ensure public endpoints are sanitized
- Ensure no PII/budget/internal notes are exposed
```

---

## 11. Definition of Done

This database mapping phase is done when:

```text
- Every sheet has a documented field mapping.
- Every field has admin/public visibility.
- Master data is used for country/unit/person lookup.
- Apps Script returns normalized API fields.
- Public endpoints are sanitized.
- Admin/public pages no longer guess raw column names.
- No mock/static production data remains.
```

---

## 12. Core Statement

This workbook should evolve from:

```text
A set of operational Google Sheets
```

into:

```text
A structured operational database layer for the Personal IR Workspace ecosystem
```

without losing the practical flexibility needed for daily International Relations Office work.
