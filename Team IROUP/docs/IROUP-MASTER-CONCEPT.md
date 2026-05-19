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

Status addendum — Travel V2-native baseline:

- `travel.html` remains ⏳ in progress: the V2-native baseline is in place, but
  the budget save preflight bug is still under investigation.
- `mobility.html` remains ⏳ in progress: participant create flow has been added
  and the participant section now appears in create mode.

Status addendum — Travel V2-native baseline complete:

- `travel.html` is ✅ done as a V2-native admin baseline.

---

*Document created: 2026-05-13*
*Next update: หลัง rewrite แต่ละ module เสร็จ*

---

## Status Addendum - News V2-Native Baseline (2026-05-16)

- `news.html` is in progress as a new V2-native admin page.
- NEWS backend routes and sheet schema have been added.
- `news.html` has Card/List views, TH/EN toggle, SDG filters, create/edit, soft
  delete, and FILES-based cover/content image upload wiring.
- NEWS is now linked from the dashboard/shared sidebar between Events and Report.
- Live spreadsheet setup remains: run `ensureV2NewsSheet_()` and seed sample rows
  before final browser validation.


## Status Addendum - Knowledge V2-Native Baseline (2026-05-17)

- `knowledge.html` is ✅ validated as a V2-native admin page.
- Routes: v2.admin.knowledge.list/detail/create/update/delete
- FILES relation: module=knowledge, file_role_id=image (≤10), file_role_id=pdf
- Features: Card/List, TH/EN toggle, category combobox, file-type filter,
  video_url, link_url, pdf_url, public_visible, soft delete
- Sidebar: uses iroup-sidebar.js (KN entry added)
- Browser-validated: save, upload, and card render confirmed

## Status Addendum - Sidebar Unified (2026-05-17)

- iroup-sidebar.js now includes all 7 admin modules in order:
  MOU → Mobility → การเดินทาง → ทุนการศึกษา → กิจกรรม → ข่าว → คลังความรู้ → รายงาน
- news.html and knowledge.html migrated from inline sidebar to iroup-sidebar.js
- Modal z-index standardized to 100000 across news.html and knowledge.html
  to prevent sidebar overlay conflicts

## Status Addendum - Public NEWS & Knowledge V2 Activation + UX Alignment (2026-05-17)

- `public-news.html` and `public-knowledge.html` are active against the V2 public
  runtime.
- Verified public routes:
  - `v2.public.news.list`
  - `v2.public.knowledge.list`
- Public NEWS and Knowledge now use real V2 runtime records for validation, with no
  mock runtime data and no V1 fallback usage.
- Public NEWS has gallery/lightbox behavior for thumbnails, modal viewing,
  previous/next navigation, keyboard support, and image counters.
- Public Knowledge now opens a detail modal before external navigation; external
  links and media are explicit actions, and image gallery behavior is aligned with
  NEWS.
- `dashboard.html`, `news.html`, and `knowledge.html` received an admin visual
  alignment pass while preserving backend/runtime/API logic.
- Dashboard visual direction is now the primary reference for later stabilization
  and refinement passes.
- Knowledge save slowness is suspected to come from sequential V2 file uploads;
  lightweight diagnostics were added before optimization.

## Status Addendum - Knowledge Cover Image Support (2026-05-17)

- Added dedicated Knowledge cover-image support without backend contract changes.
- `knowledge.html` received a dedicated รูปปก upload/preview section. Cover uploads
  use `file_role_id = cover`; gallery images continue to use `file_role_id = image`.
  Upload progress, retry handling, diagnostics, and sequential upload behavior are
  all preserved.
- `public-knowledge.html` public cards now prioritize the dedicated cover image, with
  fallback order: cover image → first gallery image → placeholder.
- `public-knowledge-detail.html` hero section prioritizes the dedicated cover image;
  the gallery section remains separate from the cover.
- Preserved: V2 endpoint strategy, public privacy filtering, existing upload
  architecture, and existing DTO compatibility.
- No backend/App Script changes were required. No mock data was added.
- Verification: inline script parse checks passed; `git diff --check` passed with
  CRLF warnings only; browser smoke tests passed (admin cover picker visible,
  public list cover rendering works, detail hero rendering works, no console errors).
- Strategic direction: Knowledge articles are evolving from generic repository records
  into publication-style content entries with distinct hero/cover presentation
  separate from gallery media.

---

## Current Status Addendum - Public UX Redesign (2026-05-18)

- `public-landing.html` is now the active cinematic V2 public landing page with live MOU atlas, KPI overlap, Mobility Flow graph, country flags, and light/dark theme support.
- `public-mou.html` has been redesigned with live V2 public MOU data, real D3/TopoJSON map, Chart.js summary, filters, table, and the new MOU hero assets.
- `public-mobility.html` has been redesigned as a compact no-hero dashboard page with live V2 public Mobility/Travel data, charts, map, cards, timeline, and 10-item pagination.

---

## Current Status Addendum - Public Mobility Stabilization (2026-05-18)

- `public-mobility.html` is now stabilized after the dashboard-first redesign.
- Data loading uses the correct V2 adapter script stack from `js/` and continues to use live V2 public Mobility/Travel routes.
- TH/EN switching is active through `iroup_public_lang` localStorage.
- Thai encoding and country object rendering issues are fixed.

---

## Current Status Addendum - Public Landing/MOU/Mobility Stabilized (2026-05-18)

- `public-landing.html` is now the active cinematic V2 public landing page.
- The landing page includes live V2 MOU atlas integration, KPI overlap content,
  Mobility Flow graph, country flags, and light/dark theme support.
- `public-mou.html` is redesigned around live V2 public MOU DTOs with a real
  D3/TopoJSON world map, Chart.js summary, redesigned filters, redesigned table,
  and new MOU hero assets.
- `public-mobility.html` is redesigned as a compact dashboard-first page using
  live V2 public Mobility and Travel routes, charts, map, cards, timeline, and
  pagination.
- Public TH/EN switching for Mobility is stabilized through
  `localStorage.iroup_public_lang`.
- Thai encoding, country object rendering, and V2 adapter loading path issues are
  fixed for the redesigned Mobility page.
- Public pages remain V2-only with no V1 fallback.
- Public/private DTO boundaries remain mandatory; Mobility and Travel participant
  personal data must not be exposed publicly.
- For data-heavy public pages, dashboard-first UX is now preferred over oversized
  hero-first layouts.

Next direction:

- Begin incremental Design System migration using `Team IROUP/css/iroup-design.css`
  and `Team IROUP/js/iroup-theme.js`.
- Use `ir-*` classes incrementally and keep the migration reversible and CSS-first.
- Do not refactor backend/API/auth/session logic during UI redesign.

---

## Current Status Addendum - Public News/Knowledge Redesign (2026-05-18)

- `public-news.html` and `public-news-detail.html` are now redesigned as a complete
  public NEWS list/detail system.
- `public-knowledge.html` and `public-knowledge-detail.html` are now redesigned as a
  complete public Knowledge list/detail system.
- Both systems preserve their live V2 public routes and public DTO boundaries:
  - `v2.public.news.list`
  - `v2.public.knowledge.list`
- Both systems now follow the public redesign pattern:
  hero graphic, dark/light mode, TH/EN switching, unified public nav, live V2 card
  grid, search/filter controls, detail pages, and media/gallery support.
- NEWS detail pages now support cover/content presentation and additional image
  gallery viewing.
- Knowledge detail pages now support cover/content presentation plus PDF, video,
  external link, and image gallery actions.
- Public language state uses `localStorage.iroup_public_lang`.
- Public theme state uses `localStorage.iroup_public_theme`.

Current public redesign wave status:

- Landing: active cinematic V2 portal, pending final ecosystem polish.
- MOU: redesigned V2 atlas/dashboard page.
- Mobility: redesigned compact dashboard-first page.
- News: redesigned list/detail complete.
- Knowledge: redesigned list/detail complete.
- Scholarship: next recommended page.
- Events: recommended after Scholarship.

Strategic framing:

- The public side is now evolving from a basic information website into an
  International Relations Public Information System with three layers:
  information portal, international intelligence dashboard, and knowledge/service
  platform.

---

## Current Status Addendum - Public Scholarship Redesign (2026-05-19)

- `public-scholar.html` is now redesigned as the public Scholarship opportunity page.
- It preserves the live V2 public route `v2.public.scholarship.list`.
- It uses the current public redesign pattern: hero graphic, dark/light mode, TH/EN
  switching, unified public nav, live V2 cards, search/filter controls, and status
  sections.
- Scholarship hero assets:
  - `scholarship-hero-dark.webp`
  - `scholarship-hero-light.webp`
- Scholarship public UX now emphasizes open opportunities, deadline urgency, country,
  level/target group, funding/status tags, apply links, and public files.

Updated public redesign wave status:

- Landing: active cinematic V2 portal, pending final ecosystem polish.
- MOU: redesigned V2 atlas/dashboard page.
- Mobility: redesigned compact dashboard-first page.
- News: redesigned list/detail complete.
- Knowledge: redesigned list/detail complete.
- Scholarship: redesigned opportunity page complete.
- Events: next recommended page.

---

## Current Status Addendum - Scholarship Article Detail Support (2026-05-19)

- Scholarship has been confirmed as a public system module, not only a card/list
  announcement page.
- The public Scholarship flow should become:
  - `public-scholar.html` = opportunity list and filters.
  - `public-scholar-detail.html?id=...` = full scholarship reading/detail page.
- The detail page should follow the same content-reading pattern as NEWS and
  Knowledge, but tuned for scholarship opportunity metadata.
- To keep data entry practical, Scholarship will use article-style long content
  fields instead of many separate long sections:
  - `content_th`
  - `content_en`
- Existing structured Scholarship fields remain useful for cards, filters, search,
  deadline state, funding tags, country, institution, application links, and files.
- Admin Scholarship form must support the new long content fields before Peach adds
  real scholarship records.
- Existing live V2 sheets need a schema repair step to add the new columns without
  shifting old data:
  - run `addV2ScholarshipContentColumns()` after the updated V2 repair script is in
    the Apps Script project.
- Public/private DTO boundaries remain mandatory; the future Scholarship detail page
  must consume public DTO data only.

---

## Current Status Addendum - Global Country Master (2026-05-19)

- `COUNTRY_MASTER` is now prepared for real worldwide data entry.
- A new helper `upsertV2GlobalCountryMaster()` adds/updates 249 ISO 3166-1
  country/territory rows.
- Stable country IDs remain based on alpha-2 codes:
  - `CTRY-TH`
  - `CTRY-MY`
  - `CTRY-JP`
  - `CTRY-US`
- The helper preserves existing references by updating rows in place when the
  `country_id` already exists.
- Country rows include alpha-2, alpha-3, English/Thai display names, continent,
  flag emoji, search alias, active flag, and sort order.
- Real data entry for MOU, Mobility, Travel, Scholarship, and Events should use
  `COUNTRY_MASTER` IDs instead of free-text country names.
