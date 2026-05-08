# 🌏 PEACH Workload Portfolio

ระบบบันทึกและติดตามภาระงาน **นางสาวธาราทิพย์ สูงขาว**  
กองวิเทศสัมพันธ์ มหาวิทยาลัยมหาสารคาม

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 · CSS3 · Vanilla JS (SPA) |
| Hosting | GitHub Pages |
| Backend API | Google Apps Script |
| Database | Google Sheets (5 sheets) |
| File Storage | Google Drive |
| Font | Prompt (Google Fonts) |
| Charts | Chart.js |

## Theme

- Background: `#0F1117`
- Accent: `#22D3EE` (Cyan)
- Mode: Dark

## Pages / หน้า

| หน้า | คำอธิบาย |
|------|----------|
| 📊 Dashboard | สรุปภาพรวม สถิติ กราฟรายเดือน |
| ➕ เพิ่มภาระงาน | บันทึกภาระงานใหม่ พร้อมเลือกหมวด |
| 📋 ภาระงานทั้งหมด | ตารางรายการ ค้นหา กรอง แก้ไข ลบ |
| 🗂️ คลังหลักฐาน | อัปโหลดและจัดการไฟล์หลักฐาน |
| 📈 สรุปรายปี | รายงานประจำปี Export ได้ |

## 12 หมวดภาระงาน

1. 🤝 การต้อนรับแขกต่างชาติ
2. 📝 การจัดทำ MOU/MOA
3. 🎓 การประสานงานทุนการศึกษา
4. 🌐 การแปลเอกสาร
5. 📚 การจัดอบรม/สัมมนา
6. 🏛️ การประชุมวิเทศสัมพันธ์
7. ✈️ งานโครงการแลกเปลี่ยน
8. 🌏 การดูแลนักศึกษาต่างชาติ
9. 📄 การจัดทำเอกสาร/รายงาน
10. ⭐ การพัฒนาตนเอง
11. 🗂️ งานธุรการวิเทศ
12. 📌 อื่นๆ

## Seed Data

มีข้อมูล Seed ปี 2567 (2024) จำนวน **50 รายการ** ครอบคลุมทุกเดือน  
ครอบคลุมกิจกรรมจริงของงานวิเทศสัมพันธ์มหาวิทยาลัย

## การติดตั้ง

ดูคำแนะนำโดยละเอียดที่ [docs/SETUP.md](docs/SETUP.md)

### Quick Start

```bash
# 1. Clone หรือ Download โปรเจกต์นี้
git clone https://github.com/yourusername/peach-workload-portfolio.git

# 2. ไปที่ script.google.com → สร้าง Project ใหม่
#    Copy เนื้อหา backend/Code.gs ใส่ใน Code.gs ใหม่

# 3. ตั้งค่า CONFIG.SPREADSHEET_ID และ CONFIG.DRIVE_FOLDER_ID

# 4. Run initSpreadsheet() แล้ว seedData()

# 5. Deploy เป็น Web App → คัดลอก URL

# 6. เปิด frontend/index.html → ⚙️ ตั้งค่า → ใส่ Web App URL
```

## Demo Mode

หากยังไม่ได้ตั้งค่า API URL ระบบจะแสดงข้อมูล **Demo** เพื่อให้เห็น UI  
ข้อมูล Demo มาจาก `js/api.js → DEMO_DATA`

---

&copy; 2567 · PEACH Workload Portfolio · นางสาวธาราทิพย์ สูงขาว · มหาวิทยาลัยมหาสารคาม
