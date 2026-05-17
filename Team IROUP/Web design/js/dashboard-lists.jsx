/* global React */

// ============================================================
// Section: Scholarships ใกล้ปิดรับ
// ============================================================
function ScholarshipList() {
  const items = [
    { name: 'Test China Fund 2026',           org: 'China Fund 2026',     country: '🇲🇾 Malaysia',  level: 'ป.โท',     deadline: '31 พ.ค. 69',   days: 14, status: 'urgent' },
    { name: 'Scholar test v2',                org: 'Hillion',             country: '🇩🇪 Germany',   level: 'ป.ตรี',    deadline: '31 พ.ค. 69',   days: 14, status: 'urgent' },
    { name: 'ทุน TEST VS3',                    org: 'CLOCLO',              country: '🇲🇾 มาเลเซีย', level: 'ป.โท',     deadline: '5 มิ.ย. 69',    days: 19, status: 'open' },
    { name: 'JASSO Student Exchange',         org: 'JASSO',               country: '🇯🇵 Japan',     level: 'ป.ตรี/โท', deadline: '15 มิ.ย. 69',  days: 29, status: 'open' },
    { name: 'Chinese Government Scholarship', org: 'CSC',                 country: '🇨🇳 China',     level: 'ป.โท/เอก', deadline: '1 ก.ค. 69',     days: 45, status: 'open' },
  ];

  return (
    <div className="ir-card ir-list-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">🎓 ทุนที่กำลังเปิดรับ</h3>
          <p className="ir-card-sub">เรียงตามวันปิดรับสมัคร · {items.length} รายการ</p>
        </div>
        <a className="ir-link">ดูทั้งหมด →</a>
      </div>

      <div className="ir-list">
        {items.map((s, i) => (
          <div key={i} className="ir-list-row">
            <div className="ir-list-icon tint-violet">🎓</div>
            <div className="ir-list-main">
              <div className="ir-list-title">{s.name}</div>
              <div className="ir-list-meta">
                <span>{s.org}</span>
                <span className="dot">·</span>
                <span>{s.country}</span>
                <span className="dot">·</span>
                <span>{s.level}</span>
              </div>
            </div>
            <div className="ir-list-right">
              <div className="ir-list-date">{s.deadline}</div>
              <span className={`ir-badge ${s.status === 'urgent' ? 'ir-badge-warn' : 'ir-badge-green'}`}>
                เหลือ {s.days} วัน
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Section: Upcoming Events
// ============================================================
function EventList() {
  const items = [
    { name: 'Event test',                                 type: 'อบรม',     dept: 'คณะแพทยศาสตร์',     date: '20 พ.ค.',  time: '09:00', mode: 'ออนไซต์', country: 'TH' },
    { name: 'test V2 superadmin',                         type: 'ประชุม',   dept: 'คณะวิทยาศาสตร์',    date: '24 พ.ค.',  time: '13:30', mode: 'ออนไลน์', country: 'TH' },
    { name: 'คณะผู้แทน Keimyung University เยือน UP',      type: 'Inbound',  dept: 'งานวิเทศสัมพันธ์', date: '30 พ.ค.',  time: '10:00', mode: 'ออนไซต์', country: 'KR' },
    { name: 'Immersion Hub @ Shanghai Open University',   type: 'การเดินทาง',dept: 'สำนักงานวิเทศฯ',   date: '29 พ.ค.',  time: '08:00', mode: 'ออนไซต์', country: 'CN' },
  ];

  const tintMap = { 'อบรม':'green','ประชุม':'blue','Inbound':'violet','การเดินทาง':'orange' };

  return (
    <div className="ir-card ir-list-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">📅 กิจกรรมใกล้ถึง</h3>
          <p className="ir-card-sub">7-30 วันข้างหน้า · {items.length} รายการ</p>
        </div>
        <a className="ir-link">ดูทั้งหมด →</a>
      </div>

      <div className="ir-list">
        {items.map((e, i) => (
          <div key={i} className="ir-list-row">
            <div className="ir-event-date">
              <div className="ir-event-day">{e.date.split(' ')[0]}</div>
              <div className="ir-event-mo">{e.date.split(' ')[1]}</div>
            </div>
            <div className="ir-list-main">
              <div className="ir-list-title">{e.name}</div>
              <div className="ir-list-meta">
                <span className={`ir-badge ir-badge-${tintMap[e.type] === 'violet' ? 'violet' : tintMap[e.type] === 'green' ? 'green' : tintMap[e.type] === 'blue' ? 'blue' : 'warn'}`}>{e.type}</span>
                <span className="dot">·</span>
                <span>{e.dept}</span>
              </div>
            </div>
            <div className="ir-list-right">
              <div className="ir-list-date">{e.time}</div>
              <span className="ir-badge ir-badge-gray">{e.mode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Section: MOU ใกล้หมดอายุ
// ============================================================
function MOUExpiringList({ onOpenModal }) {
  const items = [
    { dept: 'คณะวิทยาศาสตร์',       org: 'Beijing Science Academy',  country: '🇨🇳 China',   end: '30 พ.ค. 70', days: 13, status: 'urgent' },
    { dept: 'วิทยาลัยการศึกษา',     org: 'Hikikik University',       country: '🇫🇷 France',  end: '30 ก.ค. 70', days: 74, status: 'soon' },
    { dept: 'คณะวิศวกรรมศาสตร์',    org: 'Tokyo Tech Lab',           country: '🇯🇵 Japan',   end: '15 ส.ค. 70', days: 90, status: 'soon' },
  ];

  return (
    <div className="ir-card ir-list-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">⏰ MOU ใกล้หมดอายุ</h3>
          <p className="ir-card-sub">ภายใน 90 วัน · ควรพิจารณาต่ออายุ</p>
        </div>
        <button className="ir-btn ir-btn-primary ir-btn-sm" onClick={onOpenModal}>+ เพิ่ม MOU</button>
      </div>

      <div className="ir-list">
        {items.map((m, i) => (
          <div key={i} className="ir-list-row">
            <div className="ir-list-icon tint-orange">🤝</div>
            <div className="ir-list-main">
              <div className="ir-list-title">{m.dept}</div>
              <div className="ir-list-meta">
                <span>{m.org}</span>
                <span className="dot">·</span>
                <span>{m.country}</span>
              </div>
            </div>
            <div className="ir-list-right">
              <div className="ir-list-date">{m.end}</div>
              <span className={`ir-badge ${m.status === 'urgent' ? 'ir-badge-red' : 'ir-badge-warn'}`}>
                {m.days} วัน
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ScholarshipList, EventList, MOUExpiringList });
