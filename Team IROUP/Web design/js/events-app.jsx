/* global React, ReactDOM */
const { useState: useStateEV, useEffect: useEffectEV, useMemo: useMemoEV } = React;

const MOCK_EVENTS = [
  { id:1, name:'โครงการเทสเตอร์ 1', type:'ประชุม', mode:'ออนไซต์', status:'active', state:'เสร็จสิ้น', public:true, start:'14 พฤษภาคม 2569', year:2569, unit:'คณะทันตแพทยศาสตร์',  country:'AU ออสเตรเลีย', flag:'🇦🇺' },
  { id:2, name:'โครงการเทสเตอร์ 2', type:'ประชุม', mode:'ออนไลน์', status:'active', state:'เสร็จสิ้น', public:true, start:'16 พฤษภาคม 2569', year:2569, unit:'คณะเภสัชศาสตร์',     country:'JP ญี่ปุ่น',     flag:'🇯🇵' },
  { id:3, name:'โครงการเทสเตอร์ 3', type:'ประชุม', mode:'ไฮบริด',  status:'active', state:'เหลืออีก 3 วัน', public:true, start:'20 พฤษภาคม 2569', year:2569, unit:'คณะวิศวกรรมศาสตร์', country:'TH ไทย',         flag:'🇹🇭' },
  { id:4, name:'workshop AI for Education', type:'อบรม',  mode:'ไฮบริด',  status:'active', state:'เริ่มใน 12 วัน', public:false, start:'1 มิถุนายน 2569',  year:2569, unit:'ICT',         country:'TH ไทย',     flag:'🇹🇭' },
  { id:5, name:'ASEAN Mobility Summit',     type:'สัมมนา', mode:'ออนไซต์', status:'active', state:'เริ่มใน 24 วัน', public:true,  start:'15 มิถุนายน 2569', year:2569, unit:'IRO',         country:'SG สิงคโปร์', flag:'🇸🇬' },
  { id:6, name:'นิทรรศการศิลปะนานาชาติ',     type:'นิทรรศการ', mode:'ออนไซต์', status:'active', state:'เปิดรับงาน', public:true, start:'10 กรกฎาคม 2569', year:2569, unit:'คณะศิลปกรรมศาสตร์', country:'KR เกาหลีใต้', flag:'🇰🇷' },
];

function EventsStats({ rows }) {
  const total = rows.length;
  const upcoming = rows.filter(r => r.state.includes('เริ่ม') || r.state.includes('เหลือ')).length;
  const done = rows.filter(r => r.state === 'เสร็จสิ้น').length;
  const pub = rows.filter(r => r.public).length;
  return (
    <div className="ir-stat-strip">
      <window.StatTile tint="blue"   icon="📅" value={total}    label="กิจกรรมทั้งหมด" trend={`+${total} ปีนี้`} />
      <window.StatTile tint="orange" icon="🕒" value={upcoming} label="กำลังจะถึง"     trend="Upcoming" trendClass="warn" />
      <window.StatTile tint="green"  icon="✓"  value={done}     label="ดำเนินการแล้ว"   trend="Done" />
      <window.StatTile tint="violet" icon="📢" value={pub}      label="เผยแพร่สู่สาธารณะ" trend="Public" />
    </div>
  );
}

function EventsFilters({ filter, setFilter, onReset }) {
  return (
    <div className="ir-filter-bar">
      <input className="ir-input" placeholder="🔍  ค้นหาชื่อกิจกรรม / สถานที่ / หน่วยงาน"
        value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} />
      <select className="ir-select" value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
        <option value="all">ทุกประเภท</option>
        <option value="ประชุม">ประชุม</option>
        <option value="อบรม">อบรม</option>
        <option value="สัมมนา">สัมมนา</option>
        <option value="นิทรรศการ">นิทรรศการ</option>
      </select>
      <select className="ir-select" value={filter.state} onChange={e => setFilter({...filter, state: e.target.value})}>
        <option value="all">ทุกสถานะ</option>
        <option value="upcoming">กำลังจะถึง</option>
        <option value="done">เสร็จสิ้น</option>
      </select>
      <select className="ir-select" value={filter.year} onChange={e => setFilter({...filter, year: e.target.value})}>
        <option value="all">ทุกปี</option>
        <option value="2569">2569</option>
        <option value="2568">2568</option>
      </select>
      <button className="ir-link-btn" onClick={onReset}>ล้างตัวกรอง</button>
    </div>
  );
}

function modeBadge(mode) {
  if (mode === 'ออนไลน์') return { ico: '💻', cls: 'ir-badge-blue' };
  if (mode === 'ไฮบริด')  return { ico: '🔀', cls: 'ir-badge-violet' };
  return { ico: '🏢', cls: 'ir-badge-gray' };
}

function EventCard({ item, onEdit }) {
  const mb = modeBadge(item.mode);
  const urgent = item.state.includes('3 วัน') || item.state.includes('12 วัน');
  return (
    <div className="ir-item-card">
      <div className="ir-item-card-head">
        <div className="ir-item-icon">📋</div>
        <div className="ir-item-title-wrap">
          <div className="ir-item-title">{item.name}</div>
          <div className="ir-item-sub">{item.type}</div>
        </div>
      </div>
      <div className="ir-item-badges">
        <span className="ir-badge ir-badge-green">{item.status}</span>
        <span className={`ir-badge ${mb.cls}`}>{mb.ico} {item.mode}</span>
        <span className={`ir-badge ${urgent ? 'ir-badge-warn' : 'ir-badge-gray'}`}>{item.state}</span>
        {item.public && <span className="ir-badge ir-badge-violet">Public</span>}
      </div>
      <div className="ir-item-info">
        <div className="ir-item-info-cell">
          <div className="ir-item-info-label">วันที่เริ่ม</div>
          <div className="ir-item-info-value">{item.start}</div>
        </div>
        <div className="ir-item-info-cell">
          <div className="ir-item-info-label">ปีงบประมาณ</div>
          <div className="ir-item-info-value">{item.year}</div>
        </div>
        <div className="ir-item-info-cell">
          <div className="ir-item-info-label">หน่วยงาน</div>
          <div className="ir-item-info-value">{item.unit}</div>
        </div>
        <div className="ir-item-info-cell">
          <div className="ir-item-info-label">ประเทศ</div>
          <div className="ir-item-info-value">{item.flag} {item.country}</div>
        </div>
      </div>
      <div className="ir-item-foot">
        <button className="ir-btn ir-btn-ghost ir-btn-sm" onClick={onEdit}>✎ แก้ไข</button>
        <button className="ir-btn ir-btn-danger ir-btn-sm">🗑 ลบ</button>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useStateEV(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [lang, setLang] = useStateEV('TH');
  const [view, setView] = useStateEV('card');
  const [filter, setFilter] = useStateEV({ q:'', type:'all', state:'all', year:'all' });

  const [tweaks, setTweak] = window.usePageTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
  });

  useEffectEV(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iroup-theme', theme);
  }, [theme]);

  const filtered = useMemoEV(() => MOCK_EVENTS.filter(r => {
    const q = filter.q.trim().toLowerCase();
    if (q && ![r.name, r.unit, r.country, r.type].some(s => s.toLowerCase().includes(q))) return false;
    if (filter.type !== 'all' && r.type !== filter.type) return false;
    if (filter.state === 'done' && r.state !== 'เสร็จสิ้น') return false;
    if (filter.state === 'upcoming' && r.state === 'เสร็จสิ้น') return false;
    if (filter.year !== 'all' && String(r.year) !== filter.year) return false;
    return true;
  }), [filter]);

  return (
    <div className="ir-app">
      <window.Sidebar active="events" onSelect={id => window.navTo(id, 'events')} />
      <main className="ir-main">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

        <window.PageHead
          crumb="กิจกรรม"
          badge="V2 Events"
          title="กิจกรรมและโครงการนานาชาติ"
          sub="จัดการกิจกรรม / โครงการ / อบรม / สัมมนา ที่เกี่ยวข้องกับงานวิเทศสัมพันธ์"
          actions={
            <React.Fragment>
              <window.LangToggle value={lang} onChange={setLang} />
              <window.ViewToggle value={view} onChange={setView} labels={['Card', 'List']} />
              <button className="ir-btn ir-btn-glass">↻ โหลดใหม่</button>
              <button className="ir-btn ir-btn-primary">＋ เพิ่มกิจกรรม</button>
            </React.Fragment>
          } />

        <EventsStats rows={MOCK_EVENTS} />
        <div style={{height: 14}}></div>
        <EventsFilters filter={filter} setFilter={setFilter}
          onReset={() => setFilter({ q:'', type:'all', state:'all', year:'all' })} />
        <div style={{height: 14}}></div>

        {filtered.length === 0 ? (
          <div className="ir-empty">
            <div className="ir-empty-icon">📭</div>
            <div>ไม่พบกิจกรรมที่ตรงตามตัวกรอง</div>
          </div>
        ) : (
          <div className="ir-card-grid">
            {filtered.map(item => <EventCard key={item.id} item={item} />)}
          </div>
        )}

        <window.PageFoot />
      </main>

      <window.StdTweaksPanel tweaks={tweaks} setTweak={setTweak} theme={theme} setTheme={setTheme} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
