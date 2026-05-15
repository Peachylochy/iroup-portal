# IROUP System — Master Concept Document
Version: 1.0 | Date: 2026-05-13

## ภาพรวมระบบ

**ชื่อระบบ:** One Ecosystem for International Relations Office, University of Phayao
**วัตถุประสงค์:** ระบบรวมทุกงานของนักวิเทศสัมพันธ์ มหาวิทยาลัยพะเยา ในแพลตฟอร์มเดียว
**ผู้ใช้หลัก:** นักวิเทศสัมพันธ์ 1 คน (Personal Workspace)
**เป้าหมาย:** ใช้เป็น R2R เพื่อขอตำแหน่งชำนาญการ

---

## Architecture Overview

```
Login (Google OAuth 2.0) — ชั้นที่ 1
    ↓
Ecosystem Hub — เลือก Module
    ↓
Module Login — ชั้นที่ 2 (Admin guard)
    ↓
┌─────────────────────────────────────┐
│ IROUP System (หลัก)                  │
│  1. MOU                             │
│  2. Mobility                        │
│  3. Official Travel                 │
│  4. Scholarship                     │
│  5. Events                          │
│  6. News                            │
│  7. Knowledge                       │
│  8. Report/Dashboard                │
│  9. Public Page                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ PEACH Workload Portfolio (มีแล้ว)   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Travel Calculator (มีแล้ว)          │
└─────────────────────────────────────┘
```

---

## มาตรฐานระบบ

### รูปแบบวันที่
- **เก็บใน DB:** `YYYY-MM-DD` (ค.ศ.) เช่น `2025-10-01`
- **แสดงผล TH:** วว เดือน ปปปป (พ.ศ.) เช่น `1 ตุลาคม 2568`
- **แสดงผล EN:** `October 1, 2025`
- **แปลง พ.ศ.:** ค.ศ. + 543

### ปีงบประมาณ
- นับแบบไทย: 1 ต.ค. → 30 ก.ย.
- ถ้าเดือน >= 10 → ปีงบฯ = ปี พ.ศ. + 1
- ถ้าเดือน < 10 → ปีงบฯ = ปี พ.ศ.
- เช่น 1 ต.ค. 2568 → ปีงบฯ 2569

### Terminology Standard (คำที่ใช้ร่วมกันทุก Module)
| หัวข้อ | คำที่ใช้ |
|--------|---------|
| ประเทศ | ประเทศ |
| หน่วยงาน ม.พะเยา | หน่วยงาน |
| วันที่เริ่ม | วันที่เริ่ม |
| วันที่สิ้นสุด | วันที่สิ้นสุด |
| สถานะ | สถานะ |
| ปีงบประมาณ | ปีงบประมาณ |
| ไฟล์แนบ | ไฟล์แนบ |
| รูปปก | รูปปก |
| รายละเอียด | รายละเอียด |

### Dynamic Master (Auto-suggest)
- **ทุก field ที่ใช้ master** — พิมพ์แล้ว suggest จากข้อมูลที่มีอยู่
- ถ้าไม่มีในระบบ → พิมพ์เพิ่มได้ → ระบบเก็บอัตโนมัติเพื่อใช้ครั้งต่อไป
- ข้อมูล master ที่ใช้ร่วมกันทุก module:

| Master Table | ใช้ใน |
|-------------|-------|
| COUNTRY_MASTER | ทุก module |
| UP_UNIT_MASTER | ทุก module |
| PERSON_STUDENT | Mobility |
| PERSON_STAFF | Official Travel |
| BUDGET_TYPE_MASTER | Official Travel |
| FILE_ROLE_MASTER | ทุก module ที่มีไฟล์ |

---

## Module 1: MOU

### ข้อมูลที่เก็บ
| Field | รายละเอียด |
|-------|-----------|
| mou_id | รหัส MOU |
| up_unit_id | หน่วยงาน ม.พะเยา |
| partner_org_name | ชื่อองค์กรคู่สัญญา (TH) |
| partner_org_name_en | ชื่อองค์กรคู่สัญญา (EN) |
| country_id | ประเทศ |
| mou_type | ประเภท (MOU/MOA/etc) |
| start_date | วันที่เริ่ม |
| end_date | วันที่สิ้นสุด |
| fiscal_year | ปีงบประมาณ |
| status | active/expired/cancelled |
| public_visible | แสดงสาธารณะ |
| ไฟล์แนบ | ดูได้แต่ไม่ให้ดาวน์โหลด (public) |

### สถานะ
- **Active** — ปกติ
- **ใกล้หมดอายุ** — เหลือน้อยกว่า 90 วัน (badge เตือน)
- **Expired** — หมดอายุแล้ว

### หน้า Public แสดง
- แผนที่โลก แสดง active MOU
- จำนวน MOU ทั้งหมด/active
- รายชื่อ MOU + ประเทศ + สถานะ
- ดูไฟล์ได้แต่ไม่ให้ดาวน์โหลด
- 2 ภาษา TH/EN

### หน้า Dashboard แสดง
- แผนที่โลก active MOU
- สถิติ/กราฟ
- filter หน่วยงาน/ประเทศ/ปี

---

## Module 2: Mobility

### ข้อมูลที่เก็บ (MOBILITY_PROJECT)
| Field | Inbound | Outbound |
|-------|---------|---------|
| direction | inbound | outbound |
| project_name | ชื่อโครงการ | ชื่อโครงการ |
| institution_name | สถาบันต้นทาง | สถาบันปลายทาง |
| country_id | มาจากประเทศ | ไปประเทศ |
| city | เมือง | เมือง |
| up_unit_id | หน่วยงานที่รับผิดชอบ | คณะต้นสังกัด |
| purpose | วัตถุประสงค์ | วัตถุประสงค์ |
| level | ระดับการศึกษา | ระดับการศึกษา |
| participant_group | student/staff | student/staff |
| start_date | วันที่เริ่ม | วันที่เริ่ม |
| end_date | วันที่สิ้นสุด | วันที่สิ้นสุด |
| fiscal_year | ปีงบประมาณ | ปีงบประมาณ |
| participant_count | จำนวนคน | จำนวนคน |
| status | สถานะ | สถานะ |
| public_visible | แสดงสาธารณะ | แสดงสาธารณะ |

### ข้อมูลผู้เข้าร่วม (MOBILITY_PARTICIPANT)
- **Outbound (นิสิตไทย):** ค้นหาจาก PERSON_STUDENT — ดึงข้อมูลอัตโนมัติ
- **Inbound (ชาวต่างชาติ):** พิมพ์เพิ่มเองใน PERSON_MANUAL
- 1 project → หลาย participants ได้

### หน้า Public แสดง
- สถิติ inbound/outbound count
- รายชื่อโครงการ + จำนวนคน
- ไม่แสดงชื่อผู้เข้าร่วม (privacy)
- ไม่มีแผนที่โลก

---

## Module 3: Official Travel (การเดินทางไปราชการ)

### ข้อมูลที่เก็บ (TRAVEL)
| Field | รายละเอียด |
|-------|-----------|
| travel_id | รหัสภารกิจ |
| project_name | ชื่อภารกิจ |
| purpose | วัตถุประสงค์ |
| country_id | ประเทศ |
| city | เมือง |
| start_date | วันที่เริ่ม |
| end_date | วันที่สิ้นสุด |
| fiscal_year | ปีงบประมาณ |
| status | สถานะ |
| participant_count | จำนวนคน |
| public_visible | แสดงสาธารณะ |
| ไฟล์แนบ | ไฟล์แนบการเดินทาง |

### งบประมาณ (BUDGET — แยก relation)
- ค่าใช้จ่ายในการเดินทาง (บาท)
- เบิกจ่ายจากหน่วยงาน (ค้นหาได้)

### ข้อมูลผู้เดินทาง (TRAVEL_PARTICIPANT)
- ค้นหาจาก PERSON_STAFF — ดึงข้อมูลอัตโนมัติ
- 1 ภารกิจ → หลายคนได้

### หน้า Public แสดง
- สถิติจำนวนภารกิจ + จำนวนคน
- รายชื่อภารกิจ + ประเทศ + จำนวนคน
- ไม่แสดงชื่อบุคลากร (privacy)
- ไม่แสดงงบประมาณ (internal)
- ไม่มีแผนที่โลก

---

## Module 4: Scholarship (ทุนการศึกษา)

### ข้อมูลที่เก็บ
| Field | รายละเอียด |
|-------|-----------|
| scholarship_id | รหัสทุน |
| title_th | ชื่อทุน (TH) |
| title_en | ชื่อทุน (EN) |
| institution_name | สถาบันที่ให้ทุน |
| country_id | ประเทศ |
| scholarship_type | ประเภทการสนับสนุน |
| funding_type | full/partial/self |
| target_group | student/staff/both |
| coverage_th | รายละเอียดทุน (TH) |
| coverage_en | รายละเอียดทุน (EN) |
| open_date | วันเปิดรับสมัคร |
| close_date | วันปิดรับสมัคร |
| publish_date | วันที่ประกาศ |
| apply_url | ลิงก์สมัคร |
| detail_url | ลิงก์รายละเอียด |
| link_url | ลิงก์ไฟล์แนบ |
| รูปปก | poster |
| status | draft/active/closed |
| public_visible | แสดงสาธารณะ |
| pin | ปักหมุด |

### หน้า Public แสดง
- Card แสดงสรุป (ชื่อ, ประเทศ, วันปิดรับสมัคร, badge สถานะ)
- Badge นับวันที่เหลือก่อนปิดรับสมัคร
- แสดงประเทศที่ไปได้
- กดเข้าดูรายละเอียดเต็ม
- 2 ภาษา TH/EN toggle
- filter ประเทศ/ประเภท/สถานะ

---

## Module 5: Events (กิจกรรม/โครงการ/อบรม)

### ข้อมูลที่เก็บ
| Field | รายละเอียด |
|-------|-----------|
| event_id | รหัสกิจกรรม |
| title_th | ชื่อกิจกรรม (TH) |
| title_en | ชื่อกิจกรรม (EN) |
| event_type_id | ประเภท → MASTER_EVENT_TYPES |
| organizer_unit_id | หน่วยงานที่รับผิดชอบ |
| country_id | ประเทศ |
| start_date | วันที่เริ่ม |
| end_date | วันที่สิ้นสุด |
| start_time | เวลาเริ่ม |
| end_time | เวลาสิ้นสุด |
| location | สถานที่ |
| meeting_url | ลิงก์ online |
| participant_count | จำนวนผู้เข้าร่วม |
| detail_th | รายละเอียด (TH) |
| detail_en | รายละเอียด (EN) |
| apply_url | ลิงก์สมัคร |
| detail_url | ลิงก์รายละเอียด |
| link_url | ลิงก์ไฟล์แนบ |
| รูปปก | poster |
| status | draft/active/cancelled |
| public_visible | แสดงสาธารณะ |
| pin | ปักหมุด |

### หน้า Public แสดง
- Card แสดงสรุป (ชื่อ, วันที่, สถานที่, badge สถานะ)
- กดเข้าดูรายละเอียดเต็ม
- 2 ภาษา TH/EN toggle
- filter ประเภท/สถานะ/วันที่

---

## Module 6: News (ข่าวประชาสัมพันธ์)

### ข้อมูลที่เก็บ
| Field | รายละเอียด |
|-------|-----------|
| news_id | รหัสข่าว |
| title_th | ชื่อข่าว (TH) |
| title_en | ชื่อข่าว (EN) |
| content_th | เนื้อหาข่าว (TH) |
| content_en | เนื้อหาข่าว (EN) |
| publish_date | วันที่ลงข่าว |
| category | หมวดหมู่ข่าว (Dynamic Master) |
| sdg_tags | หมวดหมู่ SDG (เลือกได้หลายอัน) |
| credit | credit ข่าว |
| images | รูปภาพ (upload ได้หลายรูป ไม่เกิน 30 รูป) |
| link_url | ลิงก์รายละเอียดเพิ่มเติม |
| public_visible | แสดงสาธารณะ |

### หมวดหมู่ SDG
- เลือกได้จาก SDG 1-17
- แสดง badge รูป SDG บน card

### หน้า Public แสดง
- Card แสดงรูปปก + ชื่อข่าว
- badge SDG
- กดเข้าดูรายละเอียดเต็มพร้อมรูปภาพทั้งหมด
- 2 ภาษา TH/EN toggle
- filter หมวดหมู่/SDG

---

## Module 7: Knowledge (คลังความรู้)

### ข้อมูลที่เก็บ
| Field | รายละเอียด |
|-------|-----------|
| knowledge_id | รหัสบทความ |
| title_th | ชื่อบทความ (TH) |
| title_en | ชื่อบทความ (EN) |
| content_th | เนื้อหา (TH) |
| content_en | เนื้อหา (EN) |
| images | รูปภาพ (ไม่จำกัดจำนวน) |
| pdf_url | ลิงก์ไฟล์ PDF |
| video_url | ลิงก์วิดีโอ YouTube |
| link_url | ลิงก์รายละเอียดเพิ่มเติม |
| category | หมวดหมู่ (Dynamic Master) |
| public_visible | แสดงสาธารณะ |

### ประเภทไฟล์ที่รองรับ
- รูปภาพ ✅
- PDF ✅
- ลิงก์ YouTube ✅
- คู่มือ (อัพโหลดเป็น PDF) ✅
- Presentation (แปลงเป็น PDF ก่อน) ✅
- ❌ ไม่รับอัพโหลดวิดีโอโดยตรง

### หน้า Public แสดง
- Card แสดงสรุป
- กดเข้าดูรายละเอียดเต็ม
- 2 ภาษา TH/EN toggle

---

## Module 8: Report & Dashboard

### Admin Dashboard
- สรุปรายปีงบประมาณ
- กราฟ/chart ทุก module
- filter หน่วยงาน/ประเทศ/ปี
- export Excel/PDF
- Auto Insight
- Budget Snapshot

### Public Statistics
- แสดงเฉพาะ MOU, Mobility, Official Travel
- บอกแค่จำนวน + ประเทศ (ไม่มีข้อมูลส่วนตัว)
- filter ตามคณะ/หน่วยงาน
- filter ตามปีงบประมาณ
- กราฟ/chart
- ไม่แสดงงบประมาณ

---

## File Structure (หน้าที่ต้องมี)

### Admin Pages
```
index.html              ← Ecosystem Hub (login)
Team IROUP/
  index.html            ← IROUP login
  dashboard.html        ← Executive Dashboard
  mou.html              ← MOU
  mobility.html         ← Mobility
  travel.html           ← Official Travel
  scholarship.html      ← Scholarship (แยกจาก events)
  events.html           ← Events (แยกจาก scholarship)
  news.html             ← News
  knowledge.html        ← Knowledge
  report.html           ← Report & Export
```

### Public Pages
```
Team IROUP/public/
  public-landing.html   ← หน้าหลัก public
  public-mou.html       ← MOU public
  public-mobility.html  ← Mobility public
  public-travel.html    ← Official Travel public
  public-scholar.html   ← Scholarship public
  public-events.html    ← Events public
  public-news.html      ← News public
  public-knowledge.html ← Knowledge public
  public-stats.html     ← Statistics public
```

---

## Backend V2 (Google Apps Script + Sheets)

### Database: IROUP_DATABASE_V2
- Schema Version: 2.2
- Hosted: Google Sheets
- API: Apps Script Web App

### Master Tables (ใช้ร่วมกัน)
```
SYSTEM_SETTINGS
MASTER_EVENT_TYPES
ADMIN
COUNTRY_MASTER
UP_UNIT_MASTER
PERSON_STUDENT
PERSON_STAFF
PERSON_MANUAL
BUDGET_TYPE_MASTER
FILE_ROLE_MASTER
```

### Transaction Tables
```
MOU
MOBILITY_PROJECT
MOBILITY_PARTICIPANT
TRAVEL
TRAVEL_PARTICIPANT
SCHOLARSHIP
EVENT
```

### Relation Tables
```
BUDGET
FILES
```

### FILES Relation Standard

- File uploads use the shared `FILES` relation table instead of embedding file fields
  directly in transaction rows.
- Admin upload route baseline: `v2.admin.file.upload`.
- Drive folder baseline: `IROUP_V2_FILES`.
- Uploaded Drive files are shared as anyone-with-link view.
- Standard relation fields: `module`, `record_id`, `file_role_id`, `file_name`,
  `mime_type`, `drive_file_id`, `file_url`, `thumbnail_url`, `visibility_level`,
  `is_deleted`, `uploaded_by`, `uploaded_at`, and `note`.
- For Events: `module = event`, `file_role_id = poster` for poster/cover images,
  `file_role_id = attachment` for general attachments, `visibility_level = public`
  for poster/banner, and `visibility_level = internal` for other attachments.

### Admin Action Standard

- Every add/edit data module should expose delete wherever edit is available.
- Delete should be soft delete by default when the sheet has `is_deleted`.
- Card and List views should expose equivalent actions for each row.
- Hard delete should be reserved for explicit maintenance/cleanup workflows, not normal
  admin UX.

### Log/Cache
```
AUDIT_LOG
PUBLIC_CACHE
```

---

## Current Status (2026-05-14)

### เสร็จแล้ว ✅
- V2 Backend (schema, auth, router, DTOs)
- Public pages migrate แล้วทั้ง 4 หน้า
- V2 EVENT save ทำงานได้จริง (end-to-end)
- MASTER_EVENT_TYPES พร้อม
- Master dropdowns โหลดจาก V2
- V2-native `events.html` validated locally as the internal admin workflow baseline
- V2 Events Card/List rendering, create/edit, soft delete, badges/countdown, and
  relation-based file upload wiring are validated locally
- V2-native `scholarship.html` validated locally
- Scholarship Card/List views, create/edit, soft delete, TH/EN toggle, and file
  upload wiring are complete
- V2-native `mou.html` baseline completed with existing map/chart/KPI/table layout
  preserved

### กำลังทำ ⏳
- Use the validated Events pattern for next V2-native modules
- `mobility.html` V2-native baseline is in progress; edit modal hydration remains
  the next fix

### ยังไม่ได้ทำ 📋
- mou.html rewrite
- mobility.html rewrite
- travel.html rewrite
- news.html (ใหม่)
- knowledge.html (ใหม่)
- UI/UX redesign (Claude Design)

Status addendum:

- `mou.html rewrite` is now completed and should be treated as ✅ done.
- `mobility.html rewrite` remains ⏳ in progress.

Status addendum — MOU and Mobility V2-native baseline:

- `mou.html` is ✅ validated locally as a V2-native admin page.
- MOU world map, KPI cards, table, create/edit, and soft delete are working.
- `mobility.html` is ⏳ in progress: the V2-native rewrite is done, but edit
  modal hydration remains under active debugging.

---

*Document created: 2026-05-13*
*Next update: หลัง rewrite แต่ละ module เสร็จ*
