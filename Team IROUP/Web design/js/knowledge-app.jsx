/* global React, ReactDOM */
const { useState: useStateKN, useEffect: useEffectKN, useMemo: useMemoKN } = React;

const MOCK_KN = [
  { id:1, title:'เทสคลัง', cats:['ขั้นตอนการทำงาน','เผยแพร่'], type:'PDF', code:'KN', updated:'16 พ.ค. 2569', size:'2.1 MB' },
  { id:2, title:'คู่มือการขอวีซ่า Schengen', cats:['คู่มือ','เผยแพร่'], type:'PDF', code:'VS', updated:'12 พ.ค. 2569', size:'4.8 MB' },
  { id:3, title:'แบบฟอร์มรายงานการเดินทาง', cats:['ฟอร์ม','ภายใน'], type:'DOCX', code:'FM', updated:'9 พ.ค. 2569', size:'128 KB' },
  { id:4, title:'แนวปฏิบัติการต้อนรับผู้แทนต่างประเทศ', cats:['คู่มือ','เผยแพร่'], type:'PDF', code:'HS', updated:'2 พ.ค. 2569', size:'1.4 MB' },
];

function KnowledgeStats({ rows }) {
  const total = rows.length;
  const pub = rows.filter(r => r.cats.includes('เผยแพร่')).length;
  const cats = new Set(rows.flatMap(r => r.cats.filter(c => c !== 'เผยแพร่' && c !== 'ภายใน'))).size;
  return (
    <div className="ir-stat-strip three">
      <window.StatTile tint="blue"   icon="📚" value={total} label="บทความ/เอกสาร" trend={`+${total} ปีนี้`} />
      <window.StatTile tint="green"  icon="✓"  value={pub}   label="เผยแพร่แล้ว"   trend="Public" />
      <window.StatTile tint="violet" icon="🏷"  value={cats}  label="หมวดหมู่"      trend={`${cats} หมวด`} />
    </div>
  );
}

function KnowledgeFilters({ filter, setFilter, onReset }) {
  return (
    <div className="ir-filter-bar cols-3">
      <input className="ir-input" placeholder="🔍  ค้นหาชื่อบทความ หรือหมวดหมู่"
        value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} />
      <select className="ir-select" value={filter.cat} onChange={e => setFilter({...filter, cat: e.target.value})}>
        <option value="all">ทุกหมวดหมู่</option>
        <option value="คู่มือ">คู่มือ</option>
        <option value="ขั้นตอนการทำงาน">ขั้นตอนการทำงาน</option>
        <option value="ฟอร์ม">ฟอร์ม</option>
      </select>
      <select className="ir-select" value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
        <option value="all">ทุกประเภทไฟล์</option>
        <option value="PDF">PDF</option>
        <option value="DOCX">DOCX</option>
        <option value="XLSX">XLSX</option>
      </select>
      <button className="ir-link-btn" onClick={onReset}>ล้างตัวกรอง</button>
    </div>
  );
}

function fileTypeCls(t) {
  if (t === 'PDF') return 'ir-badge-red';
  if (t === 'DOCX') return 'ir-badge-blue';
  if (t === 'XLSX') return 'ir-badge-green';
  return 'ir-badge-gray';
}

function KnowledgeCard({ item }) {
  return (
    <div className="ir-item-card">
      <div className="ir-kn-thumb">{item.code}</div>
      <div>
        <div className="ir-item-title">{item.title}</div>
        <div className="ir-item-sub">📅 อัปเดต {item.updated} · {item.size}</div>
      </div>
      <div className="ir-item-badges">
        {item.cats.map(c => (
          <span key={c} className={`ir-badge ${c === 'เผยแพร่' ? 'ir-badge-green' : c === 'ภายใน' ? 'ir-badge-warn' : 'ir-badge-blue'}`}>{c}</span>
        ))}
        <span className={`ir-badge ${fileTypeCls(item.type)}`}>📄 {item.type}</span>
      </div>
      <div className="ir-item-foot">
        <button className="ir-btn ir-btn-ghost ir-btn-sm">⬇ ดาวน์โหลด</button>
        <button className="ir-btn ir-btn-ghost ir-btn-sm">✎ แก้ไข</button>
        <button className="ir-btn ir-btn-danger ir-btn-sm">🗑 ลบ</button>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useStateKN(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [lang, setLang] = useStateKN('TH');
  const [view, setView] = useStateKN('card');
  const [filter, setFilter] = useStateKN({ q:'', cat:'all', type:'all' });

  const [tweaks, setTweak] = window.usePageTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
  });

  useEffectKN(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iroup-theme', theme);
  }, [theme]);

  const filtered = useMemoKN(() => MOCK_KN.filter(r => {
    const q = filter.q.trim().toLowerCase();
    if (q && !(r.title.toLowerCase().includes(q) || r.cats.some(c => c.toLowerCase().includes(q)))) return false;
    if (filter.cat !== 'all' && !r.cats.includes(filter.cat)) return false;
    if (filter.type !== 'all' && r.type !== filter.type) return false;
    return true;
  }), [filter]);

  return (
    <div className="ir-app">
      <window.Sidebar active="knowledge" onSelect={id => window.navTo(id, 'knowledge')} />
      <main className="ir-main">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

        <window.PageHead
          crumb="คลังความรู้"
          badge="V2 Knowledge"
          title="คลังบทความและเอกสาร"
          sub="จัดการบทความ คู่มือ ฟอร์ม และเอกสารงานวิเทศสัมพันธ์"
          actions={
            <React.Fragment>
              <window.LangToggle value={lang} onChange={setLang} />
              <window.ViewToggle value={view} onChange={setView} labels={['การ์ด','ตาราง']} />
              <button className="ir-btn ir-btn-glass">↻ โหลดใหม่</button>
              <button className="ir-btn ir-btn-primary">＋ เพิ่มบทความ</button>
            </React.Fragment>
          } />

        <KnowledgeStats rows={MOCK_KN} />
        <div style={{height: 14}}></div>
        <KnowledgeFilters filter={filter} setFilter={setFilter}
          onReset={() => setFilter({ q:'', cat:'all', type:'all' })} />
        <div style={{height: 14}}></div>

        {filtered.length === 0 ? (
          <div className="ir-empty">
            <div className="ir-empty-icon">📭</div>
            <div>ไม่พบบทความที่ตรงตามตัวกรอง</div>
          </div>
        ) : (
          <div className="ir-card-grid">
            {filtered.map(item => <KnowledgeCard key={item.id} item={item} />)}
          </div>
        )}

        <window.PageFoot />
      </main>

      <window.StdTweaksPanel tweaks={tweaks} setTweak={setTweak} theme={theme} setTheme={setTheme} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
