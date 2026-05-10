# DATA-MAPPING-BLUEPRINT.md
# Personal IR Workspace / iROUP Database Mapping Blueprint

Last updated: 2026-05-10  
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
---

# 13. IROUP Database v2 Schema Direction (May 2026)

## 13.1 Why v2 Is Needed

จากการทดสอบระบบหลัง Backend Governance และ Public-safe migration พบว่า pain point หลายอย่างไม่ได้เกิดจากหน้าเว็บเพียงอย่างเดียว แต่เกิดจากโครงสร้างชีทเดิมที่ยังเป็น prototype-era data model เช่น:

```text
- ประเทศถูกดึงจากข้อมูลเดิมที่เคยมี ไม่ได้ใช้ COUNTRY เป็น source of truth เดียว
- หน่วยงาน ม.พะเยา ยังไม่ได้ใช้ FACULTY / UP_UNIT_MASTER เป็น source of truth เดียวทุก module
- Mobility นับ “รายการ/โครงการ” กับ “จำนวนคน” ปนกัน
- Outbound/Travel มีหลายคนในหนึ่งรายการ แต่ไม่มี detail participant table
- Student/Staff lookup ยังไม่เป็น person model กลาง
- ถ้าค้นหาคนไม่เจอ ยังไม่มี manual person fallback ที่เป็นระบบ
- งบประมาณยังเป็น field กระจาย ไม่ได้เป็น reusable budget model
- ไฟล์แนบ/โปสเตอร์ยังไม่แยก public/private ชัดเจนทุก module
```

ดังนั้นการแก้ frontend ต่อไปโดยไม่ปรับ data model จะทำให้ระบบต้องเขียน adapter เฉพาะหน้าไปเรื่อย ๆ และยังมีโอกาสข้อมูลไม่ตรงกับ operational reality อยู่ดี

Core direction:

```text
ไม่ใช่ “แก้ชีท Mobility”
แต่คือ “ออกแบบฐานข้อมูลกลางให้ทุก section ใช้ร่วมกัน”
```

---

## 13.2 Database v2 Design Principle

IROUP Database v2 ควรออกแบบเป็น production-lite Google Sheets database โดยยังคงใช้งานง่ายสำหรับเจ้าหน้าที่ แต่มีโครงสร้างชัดพอสำหรับ Apps Script API, dashboard, reports, public-safe endpoints และ future R2R evidence layer

หลักการ:

```text
1. ใช้ MASTER DATA กลางสำหรับข้อมูลอ้างอิงทุก module
2. แยก TRANSACTION DATA ออกจาก DETAIL / RELATION DATA
3. ทุกตารางควรมี stable ID
4. Frontend ไม่ควรเดา raw Thai headers เอง
5. Apps Script ควร normalize row เป็น field กลางก่อนส่งออก
6. Public endpoints ต้อง sanitize ตั้งแต่ backend
7. ข้อมูลที่ใช้ทุก section เช่น ประเทศ หน่วยงาน บุคคล งบประมาณ ไฟล์ ต้องเป็น reusable system
```

---

## 13.3 Proposed v2 Tab Groups

### MASTER DATA

```text
ADMIN
COUNTRY_MASTER
UP_UNIT_MASTER
PERSON_STAFF
PERSON_STUDENT
PERSON_MANUAL
BUDGET_TYPE_MASTER
FILE_ROLE_MASTER
```

### TRANSACTION DATA

```text
MOU
MOBILITY_PROJECT
TRAVEL
SCHOLARSHIP
EVENT
```

### RELATION / DETAIL DATA

```text
MOBILITY_PARTICIPANT
TRAVEL_PARTICIPANT
BUDGET
FILES
```

Optional future tabs:

```text
ORGANIZATION_MASTER
PROGRAM_MASTER
AUDIT_LOG
PUBLICATION_LOG
R2R_EVIDENCE
```

---

## 13.4 Master Tables

## 13.4.1 COUNTRY_MASTER

Purpose:

```text
Country source of truth for every module: MOU, Mobility, Travel, Scholarship, Event, Public Map, Reports
```

Recommended columns:

```text
country_id
iso2
iso3
country_name_en
country_name_th
continent_en
continent_th
flag_emoji
search_alias
active
sort_order
```

Notes:

```text
- country_id or iso2 should be the stable key
- display language can use country_name_th / country_name_en
- search_alias may include common Thai/English variations
- map logic should use iso2/iso3 or country_name_en only after normalization
```

Used by:

```text
MOU.country_id
MOBILITY_PROJECT.country_id
TRAVEL.country_id
SCHOLARSHIP.country_id
EVENT.country_id
Public map aggregation
Country autocomplete
Reports/exports
```

---

## 13.4.2 UP_UNIT_MASTER

Purpose:

```text
UP unit source of truth for faculty/college/school/office/center across all modules
```

Recommended columns:

```text
unit_id
unit_code
unit_name_th
unit_name_en
unit_type
parent_unit_id
active
sort_order
```

Examples of unit_type:

```text
faculty
college
school
office
center
institute
other
```

Used by:

```text
MOU.up_unit_id
MOBILITY_PROJECT.up_unit_id
PERSON_STAFF.unit_id
PERSON_STUDENT.unit_id
TRAVEL_PARTICIPANT.unit_id_snapshot
EVENT.organizer_unit_id
BUDGET.budget_source_unit_id
Reports/filters
```

---

## 13.4.3 PERSON_STAFF

Purpose:

```text
Staff lookup/master imported from university or internal source. Admin only. Not public.
```

Recommended columns:

```text
staff_id
prefix_th
first_name_th
last_name_th
full_name_th
first_name_en
last_name_en
full_name_en
gender
unit_id
position
staff_type
active
updated_at
```

Notes:

```text
- Use for Travel and Mobility participant lookup
- Do not expose person-level staff data to public endpoints
- Public reporting may aggregate by unit/person_type only
```

---

## 13.4.4 PERSON_STUDENT

Purpose:

```text
Student lookup/master imported from student system. Admin only. Not public.
```

Recommended columns:

```text
student_id
prefix_th
first_name_th
last_name_th
full_name_th
gender
unit_id
program_th
degree_level
student_status
active
updated_at
```

Notes:

```text
- Use for Mobility participant lookup, especially Outbound
- Student ID and full name must never be returned from public endpoints
- Public reporting may aggregate by participant_count, unit, country, level
```

---

## 13.4.5 PERSON_MANUAL

Purpose:

```text
Fallback person table for people not found in PERSON_STAFF or PERSON_STUDENT
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
unit_id
program_or_position
source_note
created_at
created_by
active
```

Rules:

```text
- Admin forms should allow manual entry when lookup returns no result
- Manual person records can be reused later
- Public endpoints must not expose person-level manual data
```

---

## 13.4.6 BUDGET_TYPE_MASTER

Purpose:

```text
Reusable budget type/source options across Mobility, Travel, Event, and future modules
```

Recommended columns:

```text
budget_type_id
budget_type_name_th
budget_type_name_en
requires_source_unit
requires_amount
is_internal
active
sort_order
```

Example budget types:

```text
งบภายใน
งบมหาวิทยาลัย
งบคณะ
งบโครงการ
ทุนภายนอก
ไม่มีงบประมาณ
ผู้เข้าร่วมรับผิดชอบเอง
```

---

## 13.4.7 FILE_ROLE_MASTER

Purpose:

```text
Reusable file role classification for attachments and media
```

Recommended columns:

```text
file_role_id
file_role_name_th
file_role_name_en
public_allowed_default
active
sort_order
```

Example roles:

```text
poster
banner
attachment
pdf
evidence
cover
letter
photo
```

---

## 13.5 Transaction Tables

## 13.5.1 MOU

Recommended columns:

```text
mou_id
up_unit_id
partner_org_name
partner_org_name_en
country_id
mou_type
start_date
end_date
fiscal_year
status
public_visible
public_file_allowed
internal_note
created_at
created_by
updated_at
updated_by
```

Public-safe fields:

```text
mou_id
up_unit
partner_org_name
country
continent
mou_type
start_date
end_date
fiscal_year
status
public_file_url if public_file_allowed
```

Notes:

```text
- MOU should no longer store free-text country as the primary country key
- Apps Script may still output display text, but storage should prefer country_id
```

---

## 13.5.2 MOBILITY_PROJECT

Purpose:

```text
One row = one mobility project/activity/trip group, not one person
```

Recommended columns:

```text
mobility_id
direction
project_name
institution_name
country_id
city
up_unit_id
purpose
level
participant_group
start_date
end_date
fiscal_year
status
public_visible
internal_note
created_at
created_by
updated_at
updated_by
```

direction values:

```text
inbound
outbound
```

status should be derived where possible:

```text
upcoming
active
completed
cancelled
```

Operational status definitions:

```text
upcoming = start_date > today
active = start_date <= today <= end_date
completed = end_date < today
```

---

## 13.5.3 MOBILITY_PARTICIPANT

Purpose:

```text
One row = one participant in a mobility project
```

Recommended columns:

```text
participant_id
mobility_id
person_source
person_id
person_type
full_name_snapshot
gender_snapshot
unit_id_snapshot
program_or_position_snapshot
role
created_at
created_by
```

person_source values:

```text
student
staff
manual
external
```

Why this matters:

```text
- 1 project with 10 students should be project_count = 1 and participant_count = 10
- KPI can clearly choose whether to show records or people
- Public endpoints can aggregate participant_count without exposing names
```

---

## 13.5.4 TRAVEL

Purpose:

```text
One row = one staff travel mission/project
```

Recommended columns:

```text
travel_id
project_name
purpose
country_id
city
start_date
end_date
fiscal_year
status
public_visible
internal_note
created_at
created_by
updated_at
updated_by
```

---

## 13.5.5 TRAVEL_PARTICIPANT

Purpose:

```text
One row = one traveler in a travel record
```

Recommended columns:

```text
travel_participant_id
travel_id
person_source
person_id
full_name_snapshot
unit_id_snapshot
position_snapshot
created_at
created_by
```

---

## 13.5.6 SCHOLARSHIP

Recommended columns:

```text
scholarship_id
title_th
title_en
institution_name
country_id
level
publish_date
open_date
close_date
coverage_th
coverage_en
detail_url
apply_url
link_url
pin
status
public_visible
internal_note
created_at
created_by
updated_at
updated_by
```

Notes:

```text
- Poster/banner should be stored in FILES rather than only fixed poster_url if possible
- status can be derived from open_date/close_date, but manual override may be allowed later
```

---

## 13.5.7 EVENT

Recommended columns:

```text
event_id
title_th
title_en
event_type
organizer_unit_id
country_id
location
start_date
end_date
start_time
end_time
participant_count
detail_th
detail_en
link_url
pin
status
public_visible
internal_note
created_at
created_by
updated_at
updated_by
```

Notes:

```text
- If event is domestic/internal, country_id can be blank or TH depending on reporting rule
- Files/posters should be stored in FILES
```

---

## 13.6 Relation / Detail Tables

## 13.6.1 BUDGET

Purpose:

```text
Reusable budget tracking across modules without exposing budget publicly
```

Recommended columns:

```text
budget_id
module
record_id
budget_type_id
budget_source_type
budget_source_unit_id
budget_source_name
amount
currency
budget_note
is_internal
created_at
created_by
```

module values:

```text
mou
mobility
travel
scholarship
event
```

Budget examples:

```text
- Mobility project funded by faculty budget
- Travel mission funded by central university budget
- Event funded by external partner
- Scholarship with no UP budget
```

Public rule:

```text
BUDGET rows are admin-only. Public endpoints must not expose amount or internal budget source details.
```

---

## 13.6.2 FILES

Purpose:

```text
Centralized file/poster/attachment/evidence tracking
```

Recommended columns:

```text
file_id
module
record_id
file_role_id
file_name
file_url
drive_file_id
mime_type
is_public
uploaded_at
uploaded_by
note
```

Public rule:

```text
Only return file_url where is_public = TRUE and file_role is appropriate for public display.
```

---

## 13.7 KPI and Report Definitions

## Mobility KPI Definitions

```text
Inbound ทั้งหมด = count MOBILITY_PARTICIPANT where project.direction = inbound
Outbound ทั้งหมด = count MOBILITY_PARTICIPANT where project.direction = outbound

จำนวนรายการ Inbound = count MOBILITY_PROJECT where direction = inbound
จำนวนรายการ Outbound = count MOBILITY_PROJECT where direction = outbound

อยู่ที่ ม.พะเยาตอนนี้ = count participants where direction = inbound and today between project.start_date and project.end_date
กำลังจะมา = count participants where direction = inbound and project.start_date > today
กลับแล้ว = count participants where direction = inbound and project.end_date < today

กำลังเดินทาง = count participants where direction = outbound and today between project.start_date and project.end_date
รอเดินทาง = count participants where direction = outbound and project.start_date > today
กลับแล้ว = count participants where direction = outbound and project.end_date < today
```

Important distinction:

```text
project_count = จำนวนรายการ/โครงการ
participant_count = จำนวนคน
```

Dashboard labels must state clearly which one is being shown.

---

## 13.8 Public-Safe v2 Rules

Public endpoints should return normalized, sanitized data only.

Never return:

```text
student_id
staff_id
person_id
full_name
email
phone
gender at row-level
budget amount
budget source detail
internal_note
non-public files
created_by / updated_by
```

Allowed public outputs:

```text
country
continent
up_unit display name
institution/partner organization
project/event/scholarship title
participant_count aggregate
start/end dates
status
public poster/file URL where explicitly public
```

---

## 13.9 Migration Strategy to v2

Recommended staged approach:

```text
1. Backup current workbook.
2. Create IROUP Database v2 workbook as a new file, not by overwriting old production sheet.
3. Create MASTER tabs first: COUNTRY_MASTER, UP_UNIT_MASTER, PERSON_STAFF, PERSON_STUDENT, PERSON_MANUAL.
4. Create transaction/detail tabs with headers only.
5. Migrate COUNTRY and FACULTY data first.
6. Migrate MOU with country_id and unit_id mapping.
7. Migrate Mobility into MOBILITY_PROJECT + MOBILITY_PARTICIPANT.
8. Migrate Travel into TRAVEL + TRAVEL_PARTICIPANT.
9. Migrate Scholarships and Events.
10. Add BUDGET and FILES gradually.
11. Update Apps Script normalization layer to support v1/v2 compatibility temporarily.
12. Update frontend one module at a time.
13. Keep old workbook read-only until v2 is verified.
```

Do not:

```text
- delete old workbook immediately
- switch all frontend modules at once
- expose v2 public data before sanitizer is verified
- rely on frontend to hide private fields
```

---

## 13.10 Gemini Sheet Template Prompt

Use this prompt to generate a Google Sheets template draft from this blueprint:

```text
คุณคือ data architect ช่วยออกแบบ Google Sheets database template สำหรับระบบ International Relations Office (IROUP) v2

บริบท:
ระบบนี้ใช้ Google Sheets + Apps Script + GitHub Pages เป็น operational workspace สำหรับงานวิเทศสัมพันธ์ มหาวิทยาลัยพะเยา

ระบบมี modules:
1. MOU
2. Mobility Inbound/Outbound
3. Staff Travel
4. Scholarships
5. Events/Projects
6. Public View
7. Reports/Export

ปัญหาปัจจุบัน:
- ชีทเดิมเป็น prototype และ field ไม่ตรงกับ workflow จริง
- ประเทศและหน่วยงานไม่ได้ใช้ master data กลาง
- Mobility นับ “รายการ/โครงการ” กับ “จำนวนคน” ปนกัน
- Outbound บางโครงการมีหลายคนในรายการเดียว
- student/staff lookup ยังไม่ครบ
- ต้องมี manual person fallback ถ้าค้นไม่เจอ
- งบประมาณต้องเก็บได้ทุก section ที่เกี่ยวข้อง
- ไฟล์แนบ/โปสเตอร์ต้องแยก public/private
- Public endpoints ต้องไม่เปิดเผยชื่อ รหัสนิสิต อีเมล งบประมาณ หรือหมายเหตุภายใน

กรุณาออกแบบ Google Sheets template v2 โดยใช้หลัก:
- MASTER DATA แยกจาก TRANSACTION DATA
- ทุกตารางต้องมี stable ID
- ใช้ COUNTRY_MASTER เป็น source of truth สำหรับประเทศทุก module
- ใช้ UP_UNIT_MASTER เป็น source of truth สำหรับหน่วยงาน ม.พะเยาทุก module
- Mobility ต้องแยก MOBILITY_PROJECT กับ MOBILITY_PARTICIPANT
- Travel ต้องแยก TRAVEL กับ TRAVEL_PARTICIPANT
- ต้องรองรับ public-safe API ในอนาคต
- ต้องรองรับ dashboard, report, export, search, filter, map, chart
- ต้อง practical สำหรับใช้จริงใน Google Sheets ไม่ซับซ้อนเกินไป

ขอ output เป็นภาษาไทย โดยมี:
1. รายชื่อ tabs ทั้งหมดที่ควรมี
2. column headers ของแต่ละ tab
3. คำอธิบายแต่ละ field
4. data type ที่แนะนำ เช่น text, date, number, boolean, dropdown
5. recommended data validation/dropdown ของแต่ละ field
6. relationship ระหว่าง tables
7. public/admin visibility ของ field สำคัญ
8. ตัวอย่างข้อมูล 2-3 แถวต่อ tab
9. migration plan จากชีทเดิมไป v2
10. ข้อควรระวังสำหรับ Apps Script API และ public-safe endpoint

Tabs ขั้นต่ำที่ต้องมี:
- ADMIN
- COUNTRY_MASTER
- UP_UNIT_MASTER
- PERSON_STAFF
- PERSON_STUDENT
- PERSON_MANUAL
- BUDGET_TYPE_MASTER
- FILE_ROLE_MASTER
- MOU
- MOBILITY_PROJECT
- MOBILITY_PARTICIPANT
- TRAVEL
- TRAVEL_PARTICIPANT
- SCHOLARSHIP
- EVENT
- BUDGET
- FILES

กรุณาอย่าออกแบบแบบ database ซับซ้อนเกิน Google Sheets ใช้งานจริง แต่ต้องมีโครงสร้างพอสำหรับระบบ production-lite
```

Suggested attachments for Gemini:

```text
1. DATA-MAPPING-BLUEPRINT.md
2. screenshots of all current admin forms: MOU, Mobility Inbound, Mobility Outbound, Travel, Scholarship, Event
3. current sheet tab names and current headers
4. sample anonymized rows from each tab
5. notes about current pain points and desired KPI definitions
```
