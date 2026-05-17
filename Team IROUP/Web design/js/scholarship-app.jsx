/* global React, ReactDOM */
const { useState: useStateSC, useEffect: useEffectSC, useMemo: useMemoSC } = React;

const MOCK_SCHOLARSHIP = [
  { id:1, name:'ทุนการศึกษา 1',  institute:'cocochanel Uni',  country:'ฝรั่งเศส',         flag:'🇫🇷', level:'ทุนป.โท',  amount:'ทุนเต็มจำนวน', target:'นิสิตและบุคลากร', closeIn:14, deadline:'31 พฤษภาคม พ.ศ. 2569', published:true, perks:'ค่าเล่าเรียน · ค่าตั๋วเครื่องบิน · ค่าใช้จ่ายรายเดือน' },
  { id:2, name:'ทุนวิจัย 2',     institute:'Hermas Uni',      country:'สหราชอาณาจักร',    flag:'🇬🇧', level:'ทุนป.เอก', amount:'ทุนบางส่วน',   target:'นิสิตและบุคลากร', closeIn:20, deadline:'6 มิถุนายน พ.ศ. 2569',   published:true, perks:'ค่าเล่าเรียน · ค่าใช้จ่ายรายเดือน' },
  { id:3, name:'ทุนแลกเปลี่ยน Erasmus+', institute:'Erasmus Consortium', country:'เยอรมนี', flag:'🇩🇪', level:'ป.ตรี-โท', amount:'ทุนเต็มจำนวน', target:'นิสิตปริญญาตรี-โท', closeIn:45, deadline:'1 กรกฎาคม พ.ศ. 2569', published:true, perks:'ค่าเล่าเรียน · ค่าตั๋วเครื่องบิน · ค่าเดินทาง' },
  { id:4, name:'ทุน MEXT',       institute:'Japan Government', country:'ญี่ปุ่น',          flag:'🇯🇵', level:'ทุนป.โท-เอก', amount:'ทุนเต็มจำนวน', target:'นิสิตและบุคลากร', closeIn:62, deadline:'18 กรกฎาคม พ.ศ. 2569', published:false, perks:'ค่าเล่าเรียน · ค่าใช้จ่ายรายเดือน · ตั๋วเครื่องบิน' },
];

function ScholarshipStats({ rows }) {
  const total = rows.length;
  const open = rows.filter(r => r.closeIn > 0).length;
  const closing = rows.filter(r => r.closeIn <= 30).length;
  const published = rows.filter(r => r.published).length;
  return (
    <div className="ir-stat-strip">
      <window.StatTile tint="violet" icon="🎓" value={total}     label="ทุนทั้งหมด"            trend={`+${total} ปีนี้`} />
      <window.StatTile tint="green"  icon="✓"  value={open}      label="เปิดรับสมัคร"          trend="กำลังเปิด" />
      <window.StatTile tint="orange" icon="⏰" value={closing}   label="ใกล้ปิดรับ (≤30 วัน)"  trend={closing > 0 ? 'ดูด่วน' : 'ปลอดภัย'} trendClass={closing > 0 ? 'warn' : ''} />
      <window.StatTile tint="blue"   icon="📢" value={published} label="เผยแพร่บน Public View" trend="Public" />
    </div>
  );
}

function ScholarshipFilters({ filter, setFilter, onReset }) {
  return (
    <div className="ir-filter-bar">
      <input className="ir-input" placeholder="🔍  ค้นหาชื่อทุน / สถาบัน / ประเทศ / ประเภท"
        value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} />
      <select className="ir-select" value={filter.level} onChange={e => setFilter({...filter, level: e.target.value})}>
        <option value="all">ทุกประเภท</option>
        <option value="ทุนป.โท">ทุนป.โท</option>
        <option value="ทุนป.เอก">ทุนป.เอก</option>
        <option value="ป.ตรี">ป.ตรี</option>
      </select>
      <select className="ir-select" value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
        <option value="all">ทุกสถานะ</option>
        <option value="open">เปิดรับสมัคร</option>
        <option value="closing">ใกล้ปิดรับ</option>
        <option value="published">เผยแพร่แล้ว</option>
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

function ScholarshipCard({ item, onEdit }) {
  const urgent = item.closeIn <= 20;
  return (
    <div className="ir-item-card">
      <div className="ir-news-thumb" style={{height: 120, fontSize: 48}}>🎓</div>
      <div>
        <div className="ir-item-title">{item.name}</div>
        <div className="ir-item-sub">{item.institute} <span className="ir-ml-2">{item.flag} {item.country}</span></div>
      </div>
      <div className="ir-item-badges">
        <span className="ir-badge ir-badge-blue">{item.amount}</span>
        <span className="ir-badge ir-badge-green">{item.target}</span>
        {item.published && <span className="ir-badge ir-badge-violet">เผยแพร่</span>}
      </div>
      <span className={`ir-badge ${urgent ? 'ir-badge-warn' : 'ir-badge-gray'}`} style={{alignSelf:'flex-start'}}>
        ⏰ ปิดรับใน {item.closeIn} วัน
      </span>
      <div className="ir-item-info">
        <div className="ir-item-info-cell">
          <div className="ir-item-info-label">ประเภท</div>
          <div className="ir-item-info-value">{item.level}</div>
        </div>
        <div className="ir-item-info-cell">
          <div className="ir-item-info-label">วันปิดรับ</div>
          <div className="ir-item-info-value">{item.deadline}</div>
        </div>
      </div>
      <p style={{fontSize: 12.5, color: 'var(--ir-text-muted)', margin: 0, lineHeight: 1.5}}>
        {item.perks}
      </p>
      <div className="ir-item-foot">
        <button className="ir-btn ir-btn-ghost ir-btn-sm" onClick={onEdit}>✎ แก้ไข</button>
        <button className="ir-btn ir-btn-danger ir-btn-sm">🗑 ลบ</button>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useStateSC(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [lang, setLang] = useStateSC('TH');
  const [view, setView] = useStateSC('card');
  const [filter, setFilter] = useStateSC({ q:'', level:'all', status:'all', year:'all' });

  const [tweaks, setTweak] = window.usePageTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
  });

  useEffectSC(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iroup-theme', theme);
  }, [theme]);

  const filtered = useMemoSC(() => MOCK_SCHOLARSHIP.filter(r => {
    const q = filter.q.trim().toLowerCase();
    if (q && ![r.name, r.institute, r.country, r.level].some(s => s.toLowerCase().includes(q))) return false;
    if (filter.level !== 'all' && !r.level.includes(filter.level)) return false;
    if (filter.status === 'open' && r.closeIn <= 0) return false;
    if (filter.status === 'closing' && r.closeIn > 30) return false;
    if (filter.status === 'published' && !r.published) return false;
    return true;
  }), [filter]);

  return (
    <div className="ir-app">
      <window.Sidebar active="scholarship" onSelect={id => window.navTo(id, 'scholarship')} />
      <main className="ir-main">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

        <window.PageHead
          crumb="ทุนการศึกษา"
          badge="V2 Scholarship"
          title="ทุนการศึกษานานาชาติ"
          sub="จัดการข้อมูลทุน · เผยแพร่บน Public View · แจ้งเตือนวันปิดรับสมัคร"
          actions={
            <React.Fragment>
              <window.LangToggle value={lang} onChange={setLang} />
              <window.ViewToggle value={view} onChange={setView} />
              <button className="ir-btn ir-btn-glass">↻ โหลดใหม่</button>
              <button className="ir-btn ir-btn-primary">＋ เพิ่มทุนการศึกษา</button>
            </React.Fragment>
          } />

        <ScholarshipStats rows={MOCK_SCHOLARSHIP} />
        <div style={{height: 14}}></div>
        <ScholarshipFilters filter={filter} setFilter={setFilter}
          onReset={() => setFilter({ q:'', level:'all', status:'all', year:'all' })} />
        <div style={{height: 14}}></div>

        {filtered.length === 0 ? (
          <div className="ir-empty">
            <div className="ir-empty-icon">🔍</div>
            <div>ไม่พบทุนที่ตรงตามตัวกรอง</div>
          </div>
        ) : (
          <div className="ir-card-grid">
            {filtered.map(item => <ScholarshipCard key={item.id} item={item} />)}
          </div>
        )}

        <window.PageFoot />
      </main>

      <window.StdTweaksPanel tweaks={tweaks} setTweak={setTweak} theme={theme} setTheme={setTheme}
        extraSection={
          <window.TweakSection title="View">
            <window.TweakRadio label="Layout" value={view} onChange={setView} options={['card','table']} />
          </window.TweakSection>
        } />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
