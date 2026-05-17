/* global React, ReactDOM */
const { useState: useStateNW, useEffect: useEffectNW, useMemo: useMemoNW } = React;

const MOCK_NEWS = [
  { id:1, title:'ข่าวทดสอบ 1', date:'16 พฤษภาคม 2569', cats:['ประชาสัมพันธ์','เผยแพร่'], sdgs:['SDG-4','SDG-17'], excerpt:'เนื้อหาทดสอบสำหรับ ข่าวทดสอบ 1' },
  { id:2, title:'ข่าวทดสอบ 2', date:'16 พฤษภาคม 2569', cats:['วิชาการ','เผยแพร่'],     sdgs:['SDG-8'],         excerpt:'เนื้อหาทดสอบสำหรับ ข่าวทดสอบ 2' },
  { id:3, title:'ข่าวทดสอบ 3', date:'16 พฤษภาคม 2569', cats:['กิจกรรม','เผยแพร่'],     sdgs:['SDG-3','SDG-4'], excerpt:'เนื้อหาทดสอบสำหรับ ข่าวทดสอบ 3' },
  { id:4, title:'ข่าวทดสอบ 4', date:'16 พฤษภาคม 2569', cats:['ประชาสัมพันธ์','เผยแพร่'], sdgs:['SDG-4','SDG-17'], excerpt:'เนื้อหาทดสอบสำหรับ ข่าวทดสอบ 4' },
  { id:5, title:'ข่าวทดสอบ 5', date:'16 พฤษภาคม 2569', cats:['วิชาการ','เผยแพร่'],     sdgs:['SDG-8'],         excerpt:'เนื้อหาทดสอบสำหรับ ข่าวทดสอบ 5' },
  { id:6, title:'ข่าวประชาสัมพันธ์', date:'16 พฤษภาคม 2569', cats:['ประชาสัมพันธ์','เผยแพร่'], sdgs:['SDG-4','SDG-17'], excerpt:'สาดเดหาเดเาดาเ' },
];

function catBadge(c) {
  if (c === 'เผยแพร่') return 'ir-badge-green';
  if (c === 'วิชาการ') return 'ir-badge-violet';
  if (c === 'กิจกรรม') return 'ir-badge-warn';
  return 'ir-badge-blue';
}

function NewsStats({ rows }) {
  const total = rows.length;
  const pub = rows.filter(r => r.cats.includes('เผยแพร่')).length;
  return (
    <div className="ir-stat-strip three">
      <window.StatTile tint="blue"   icon="📰" value={total} label="ข่าวทั้งหมด"  trend={`+${total} ปีนี้`} />
      <window.StatTile tint="green"  icon="✓"  value={pub}   label="เผยแพร่แล้ว" trend="Public" />
      <window.StatTile tint="violet" icon="📅" value={total} label="เดือนนี้"     trend="This month" />
    </div>
  );
}

function NewsFilters({ filter, setFilter, onReset }) {
  return (
    <div className="ir-filter-bar cols-3">
      <input className="ir-input" placeholder="🔍  ค้นหาชื่อข่าว หรือหมวดหมู่"
        value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} />
      <select className="ir-select" value={filter.cat} onChange={e => setFilter({...filter, cat: e.target.value})}>
        <option value="all">ทุกหมวดหมู่</option>
        <option value="ประชาสัมพันธ์">ประชาสัมพันธ์</option>
        <option value="วิชาการ">วิชาการ</option>
        <option value="กิจกรรม">กิจกรรม</option>
      </select>
      <select className="ir-select" value={filter.sdg} onChange={e => setFilter({...filter, sdg: e.target.value})}>
        <option value="all">ทุก SDG</option>
        <option value="SDG-3">SDG-3</option>
        <option value="SDG-4">SDG-4</option>
        <option value="SDG-8">SDG-8</option>
        <option value="SDG-17">SDG-17</option>
      </select>
      <button className="ir-link-btn" onClick={onReset}>ล้างตัวกรอง</button>
    </div>
  );
}

function NewsCard({ item }) {
  return (
    <div className="ir-item-card">
      <div className="ir-news-thumb">NEWS</div>
      <div>
        <div className="ir-item-title">{item.title}</div>
        <div className="ir-item-sub">📅 {item.date}</div>
      </div>
      <div className="ir-item-badges">
        {item.cats.map(c => <span key={c} className={`ir-badge ${catBadge(c)}`}>{c}</span>)}
        {item.sdgs.map(s => <span key={s} className="ir-badge ir-badge-warn">{s}</span>)}
      </div>
      <p style={{fontSize: 13, color: 'var(--ir-text-body)', margin: 0, lineHeight: 1.55}}>
        {item.excerpt}
      </p>
      <div className="ir-item-foot">
        <button className="ir-btn ir-btn-ghost ir-btn-sm">✎ แก้ไข</button>
        <button className="ir-btn ir-btn-danger ir-btn-sm">🗑 ลบ</button>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useStateNW(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [lang, setLang] = useStateNW('TH');
  const [view, setView] = useStateNW('card');
  const [filter, setFilter] = useStateNW({ q:'', cat:'all', sdg:'all' });

  const [tweaks, setTweak] = window.usePageTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
  });

  useEffectNW(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iroup-theme', theme);
  }, [theme]);

  const filtered = useMemoNW(() => MOCK_NEWS.filter(r => {
    const q = filter.q.trim().toLowerCase();
    if (q && !(r.title.toLowerCase().includes(q) || r.cats.some(c => c.toLowerCase().includes(q)))) return false;
    if (filter.cat !== 'all' && !r.cats.includes(filter.cat)) return false;
    if (filter.sdg !== 'all' && !r.sdgs.includes(filter.sdg)) return false;
    return true;
  }), [filter]);

  return (
    <div className="ir-app">
      <window.Sidebar active="news" onSelect={id => window.navTo(id, 'news')} />
      <main className="ir-main">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

        <window.PageHead
          crumb="ข่าว"
          badge="V2 News"
          title="ข่าวและประชาสัมพันธ์"
          sub="จัดการข่าวประชาสัมพันธ์งานวิเทศสัมพันธ์ของมหาวิทยาลัยพะเยา"
          actions={
            <React.Fragment>
              <window.LangToggle value={lang} onChange={setLang} />
              <window.ViewToggle value={view} onChange={setView} labels={['การ์ด','ตาราง']} />
              <button className="ir-btn ir-btn-glass">↻ โหลดใหม่</button>
              <button className="ir-btn ir-btn-primary">＋ เพิ่มข่าว</button>
            </React.Fragment>
          } />

        <NewsStats rows={MOCK_NEWS} />
        <div style={{height: 14}}></div>
        <NewsFilters filter={filter} setFilter={setFilter}
          onReset={() => setFilter({ q:'', cat:'all', sdg:'all' })} />
        <div style={{height: 14}}></div>

        {filtered.length === 0 ? (
          <div className="ir-empty">
            <div className="ir-empty-icon">📭</div>
            <div>ไม่พบข่าวที่ตรงตามตัวกรอง</div>
          </div>
        ) : (
          <div className="ir-card-grid">
            {filtered.map(item => <NewsCard key={item.id} item={item} />)}
          </div>
        )}

        <window.PageFoot />
      </main>

      <window.StdTweaksPanel tweaks={tweaks} setTweak={setTweak} theme={theme} setTheme={setTheme} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
