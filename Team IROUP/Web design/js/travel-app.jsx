/* global React, ReactDOM */
const { useState: useStateTV, useEffect: useEffectTV, useMemo: useMemoTV } = React;

// ============================================================
// Travel — mock data
// ============================================================
const MOCK_TRAVEL = [
  { id: 1, mission: 'เข้าร่วมประชุม', country: 'สหรัฐอเมริกา',  flag: '🇺🇸', objective: 'ประชุมวิชาการ',     people: 1, start: '20 ก.ค. 2569', end: '24 ก.ค. 2569', year: 2569, status: 'กำลังดำเนินการ' },
  { id: 2, mission: 'เข้าร่วมวิจัย',   country: 'จีน',          flag: '🇨🇳', objective: 'นำเสนอผลงานวิจัย', people: 1, start: '21 มิ.ย. 2569', end: '25 มิ.ย. 2569', year: 2569, status: 'กำลังดำเนินการ' },
  { id: 3, mission: 'เข้าร่วมวิจัย',   country: 'ออสเตรเลีย',   flag: '🇦🇺', objective: 'นำเสนอผลงานวิจัย', people: 1, start: '16 มิ.ย. 2569', end: '19 มิ.ย. 2569', year: 2569, status: 'เสร็จสิ้น' },
  { id: 4, mission: 'เข้าร่วมประชุม', country: 'ออสเตรเลีย',   flag: '🇦🇺', objective: 'นำเสนอผลงานวิจัย', people: 2, start: '1 มิ.ย. 2569',  end: '4 มิ.ย. 2569',  year: 2569, status: 'กำลังดำเนินการ' },
  { id: 5, mission: 'เข้าร่วมประชุม', country: 'เกาหลีใต้',     flag: '🇰🇷', objective: 'นำเสนอผลงานวิจัย', people: 1, start: '30 พ.ค. 2569', end: '4 มิ.ย. 2569',  year: 2569, status: 'กำลังดำเนินการ' },
  { id: 6, mission: 'เข้าร่วมประชุม', country: 'ไต้หวัน',       flag: '🇹🇼', objective: 'นำเสนอผลงานวิจัย', people: 1, start: '29 พ.ค. 2569', end: '4 มิ.ย. 2569',  year: 2569, status: 'กำลังดำเนินการ' },
  { id: 7, mission: 'เข้าร่วมประชุม', country: 'ฝรั่งเศส',       flag: '🇫🇷', objective: 'นำเสนอผลงานวิจัย', people: 1, start: '28 พ.ค. 2569', end: '30 พ.ค. 2569', year: 2569, status: 'กำลังดำเนินการ' },
  { id: 8, mission: 'เข้าร่วมประชุม', country: 'เยอรมนี',       flag: '🇩🇪', objective: 'นำเสนอผลงานวิจัย', people: 2, start: '20 พ.ค. 2569', end: '3 มิ.ย. 2569',  year: 2569, status: 'กำลังดำเนินการ' },
  { id: 9, mission: 'สัมมนา',         country: 'สหราชอาณาจักร', flag: '🇬🇧', objective: 'นำเสนอผลงานวิจัย', people: 1, start: '16 พ.ค. 2569', end: '19 พ.ค. 2569', year: 2569, status: 'กำลังดำเนินการ' },
];

function statusBadge(s) {
  if (s === 'เสร็จสิ้น')          return 'ir-badge-blue';
  if (s === 'กำลังดำเนินการ')      return 'ir-badge-green';
  if (s === 'รออนุมัติ')           return 'ir-badge-warn';
  return 'ir-badge-gray';
}

// ============================================================
// Travel KPI strip
// ============================================================
function TravelStats({ rows }) {
  const total = rows.length;
  const ongoing = rows.filter(r => r.status === 'กำลังดำเนินการ').length;
  const people = rows.reduce((s, r) => s + r.people, 0);
  const countries = new Set(rows.map(r => r.country)).size;
  return (
    <div className="ir-stat-strip">
      <window.StatTile tint="blue"   icon="✈️"  value={total}     label="ภารกิจทั้งหมด" trend={`+${total} ปีนี้`} />
      <window.StatTile tint="green"  icon="⏳"  value={ongoing}   label="กำลังดำเนินการ" trend="Active" />
      <window.StatTile tint="violet" icon="👥"  value={people}    label="จำนวนผู้เดินทางรวม" trend={`${people} คน`} />
      <window.StatTile tint="orange" icon="🌐"  value={countries} label="ประเทศที่ไป" trend={`${countries} ประเทศ`} />
    </div>
  );
}

// ============================================================
// Travel Filters
// ============================================================
function TravelFilters({ filter, setFilter, onReset }) {
  return (
    <div className="ir-filter-bar">
      <input
        className="ir-input"
        placeholder="🔍  ค้นหาชื่อภารกิจ / วัตถุประสงค์ / ประเทศ"
        value={filter.q}
        onChange={e => setFilter({...filter, q: e.target.value})}
      />
      <select className="ir-select" value={filter.status}
        onChange={e => setFilter({...filter, status: e.target.value})}>
        <option value="all">ทั้งหมด</option>
        <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
        <option value="เสร็จสิ้น">เสร็จสิ้น</option>
        <option value="รออนุมัติ">รออนุมัติ</option>
      </select>
      <select className="ir-select" value={filter.year}
        onChange={e => setFilter({...filter, year: e.target.value})}>
        <option value="all">ทุกปีงบประมาณ</option>
        <option value="2569">2569</option>
        <option value="2568">2568</option>
      </select>
      <select className="ir-select" value={filter.mission}
        onChange={e => setFilter({...filter, mission: e.target.value})}>
        <option value="all">ทุกประเภทภารกิจ</option>
        <option value="ประชุม">ประชุม</option>
        <option value="วิจัย">วิจัย</option>
        <option value="สัมมนา">สัมมนา</option>
      </select>
      <button className="ir-link-btn" onClick={onReset}>ล้างตัวกรอง</button>
    </div>
  );
}

// ============================================================
// Travel Table
// ============================================================
function TravelTable({ rows, onEdit }) {
  return (
    <div className="ir-card" style={{padding: 0, overflow: 'hidden'}}>
      <div className="ir-card-head" style={{padding: '18px 22px 6px'}}>
        <div>
          <h3 className="ir-card-title">📋 รายการเดินทาง</h3>
          <p className="ir-card-sub">แสดง {rows.length} รายการ · เรียงตามวันที่ล่าสุด</p>
        </div>
        <div className="ir-flex ir-gap-2">
          <button className="ir-btn ir-btn-ghost ir-btn-sm">⬇ Export Excel</button>
          <button className="ir-btn ir-btn-ghost ir-btn-sm">🖨 พิมพ์</button>
        </div>
      </div>
      <div className="ir-table-wrap">
        <table className="ir-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อภารกิจ</th>
              <th>ประเทศ</th>
              <th>วัตถุประสงค์</th>
              <th>ผู้เดินทาง</th>
              <th>ช่วงเวลา</th>
              <th>ปีงบประมาณ</th>
              <th>สถานะ</th>
              <th className="ta-r">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="9" style={{padding: '40px', textAlign: 'center', color: 'var(--ir-text-muted)'}}>
                ไม่พบรายการที่ตรงตามตัวกรอง
              </td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="ir-text-muted">{String(i + 1).padStart(2,'0')}</td>
                <td><div className="ir-font-semi ir-text-heading">{r.mission}</div></td>
                <td><span className="ir-flag">{r.flag}</span> <span className="ir-ml-1">{r.country}</span></td>
                <td>{r.objective}</td>
                <td><span className="ir-badge ir-badge-warn">{r.people} คน</span></td>
                <td className="ir-text-sm">{r.start} – {r.end}</td>
                <td className="ir-text-muted">{r.year}</td>
                <td><span className={`ir-badge ${statusBadge(r.status)}`}>
                  <span className="ir-status-dot"></span>{r.status}
                </span></td>
                <td className="ta-r">
                  <div className="ir-row-actions">
                    <button className="ir-icon-btn" title="แก้ไข" onClick={onEdit}>✎</button>
                    <button className="ir-icon-btn danger" title="ลบ">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// App
// ============================================================
function App() {
  const [theme, setTheme] = useStateTV(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [lang, setLang] = useStateTV('TH');
  const [filter, setFilter] = useStateTV({ q:'', status:'all', year:'all', mission:'all' });

  const [tweaks, setTweak] = window.usePageTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
  });

  useEffectTV(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iroup-theme', theme);
  }, [theme]);

  const filtered = useMemoTV(() => MOCK_TRAVEL.filter(r => {
    const q = filter.q.trim().toLowerCase();
    if (q && ![r.mission, r.objective, r.country].some(s => s.toLowerCase().includes(q))) return false;
    if (filter.status !== 'all' && r.status !== filter.status) return false;
    if (filter.year !== 'all' && String(r.year) !== filter.year) return false;
    if (filter.mission !== 'all' && !r.mission.includes(filter.mission)) return false;
    return true;
  }), [filter]);

  return (
    <div className="ir-app">
      <window.Sidebar active="travel" onSelect={id => window.navTo(id, 'travel')} />
      <main className="ir-main">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

        <window.PageHead
          crumb="การเดินทาง"
          badge="V2 Travel"
          title="การเดินทางบุคลากร"
          sub="จัดการข้อมูลการเดินทางและภารกิจต่างประเทศของบุคลากร มพย."
          actions={
            <React.Fragment>
              <window.LangToggle value={lang} onChange={setLang} />
              <button className="ir-btn ir-btn-glass">↻ โหลดใหม่</button>
              <button className="ir-btn ir-btn-primary">＋ เพิ่มการเดินทาง</button>
            </React.Fragment>
          } />

        <TravelStats rows={MOCK_TRAVEL} />
        <div style={{height: 14}}></div>
        <TravelFilters filter={filter} setFilter={setFilter}
          onReset={() => setFilter({ q:'', status:'all', year:'all', mission:'all' })} />
        <div style={{height: 14}}></div>
        <TravelTable rows={filtered} />

        <window.PageFoot />
      </main>

      <window.StdTweaksPanel tweaks={tweaks} setTweak={setTweak} theme={theme} setTheme={setTheme} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
