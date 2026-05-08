# คู่มือติดตั้งและใช้งาน PEACH Workload Portfolio

## ขั้นตอนที่ 1 — เตรียม Google Sheets

1. ไปที่ [Google Sheets](https://sheets.google.com) → สร้าง Spreadsheet ใหม่
2. ตั้งชื่อ `PEACH Workload Portfolio 2567`
3. คัดลอก **Spreadsheet ID** จาก URL:
   `https://docs.google.com/spreadsheets/d/**{SPREADSHEET_ID}**/edit`

## ขั้นตอนที่ 2 — เตรียม Google Drive Folder

1. ไปที่ [Google Drive](https://drive.google.com) → สร้างโฟลเดอร์ใหม่
2. ตั้งชื่อ `PEACH Evidence Files`
3. คัดลอก **Folder ID** จาก URL:
   `https://drive.google.com/drive/folders/**{FOLDER_ID}**`

## ขั้นตอนที่ 3 — ติดตั้ง Google Apps Script

1. ไปที่ [script.google.com](https://script.google.com) → New Project
2. ตั้งชื่อโปรเจกต์ว่า `PEACH Workload Backend`
3. แทนที่ `Code.gs` ด้วยเนื้อหาจากไฟล์ `backend/Code.gs`
4. แทนที่ `appsscript.json` (Project Settings → Show "appsscript.json")
5. แก้ไข CONFIG ในไฟล์:
   ```javascript
   var CONFIG = {
     SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
     DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE',
     ...
   };
   ```
6. **Save** (Ctrl+S)

## ขั้นตอนที่ 4 — Initialize Spreadsheet

1. ใน Apps Script Editor → เลือก function `initSpreadsheet`
2. กด **Run** → อนุญาต Permissions ที่ขอ
3. ตรวจสอบว่า Google Sheet มี 5 sheets: Workloads, Evidence, Categories, Users, Settings

## ขั้นตอนที่ 5 — Seed ข้อมูลปี 2567

1. ใน Apps Script Editor → เลือก function `seedData`
2. กด **Run**
3. ตรวจสอบใน Google Sheet ว่ามีข้อมูลภาระงาน 50 รายการ

## ขั้นตอนที่ 6 — Deploy Web App

1. ใน Apps Script Editor → **Deploy** → **New Deployment**
2. เลือก Type: **Web app**
3. ตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone** (หรือ Anyone with Google Account)
4. กด **Deploy** → คัดลอก **Web App URL**

## ขั้นตอนที่ 7 — Deploy Frontend (GitHub Pages)

1. สร้าง Repository ใหม่บน GitHub: `peach-workload-portfolio`
2. Push โฟลเดอร์ `frontend/` ไปยัง repo
3. ไปที่ Repository Settings → Pages
4. Source: **main branch / root** หรือ **/docs folder**
5. เปิด URL ที่ได้ เช่น `https://yourusername.github.io/peach-workload-portfolio/`

## ขั้นตอนที่ 8 — ตั้งค่า API URL

1. เปิดเว็บไซต์
2. คลิก ⚙️ **ตั้งค่าระบบ** ในเมนูด้านซ้าย
3. ใส่ **Web App URL** จากขั้นตอนที่ 6
4. กด **บันทึก**

---

## โครงสร้าง Google Sheets

| Sheet | คำอธิบาย |
|-------|----------|
| Workloads | ข้อมูลภาระงานทั้งหมด |
| Evidence | ข้อมูลไฟล์หลักฐาน |
| Categories | 12 หมวดภาระงาน |
| Users | ข้อมูลผู้ใช้งาน |
| Settings | การตั้งค่าระบบ |

## โครงสร้างโปรเจกต์

```
peach-workload-portfolio/
├── backend/
│   ├── Code.gs              ← Google Apps Script (copy ไปใส่ใน GAS)
│   └── appsscript.json      ← Manifest file
├── frontend/
│   ├── index.html           ← หน้าหลัก SPA
│   ├── css/
│   │   └── style.css        ← Stylesheet
│   └── js/
│       ├── api.js           ← API Client
│       ├── app.js           ← Main Controller + Router
│       └── pages/
│           ├── dashboard.js
│           ├── add-workload.js
│           ├── all-workloads.js
│           ├── evidence.js
│           └── annual-summary.js
├── docs/
│   └── SETUP.md             ← คู่มือนี้
└── README.md
```
