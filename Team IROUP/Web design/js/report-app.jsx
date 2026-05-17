/* global React, ReactDOM */
const { useState: useStateRP, useEffect: useEffectRP, useMemo: useMemoRP } = React;

// ============================================================
// Report data
// ============================================================
const SUMMARY = [
  { val: 77,  label: 'ภารกิจ',         tint: 'blue',   icon: '✈️' },
  { val: 9,   label: 'MOU',            tint: 'violet', icon: '🤝' },
  { val: 6,   label: 'ทุน',            tint: 'orange', icon: '🎓' },
  { val: 12,  label: 'ข่าวสาร',         tint: 'green',  icon: '📰' },
  { val: 76,  label: 'Mobility/Travel', tint: 'red',    icon: '🌐' },
];

// 12-month mobility trend (last 12 months ending May 2569)
const TREND = [
  { m: '67/06', v: 2  }, { m: '67/07', v: 4  }, { m: '67/08', v: 7  },
  { m: '67/09', v: 14 }, { m: '67/10', v: 22 }, { m: '67/11', v: 28 },
  { m: '67/12', v: 18 }, { m: '68/01', v: 9  }, { m: '68/02', v: 6  },
  { m: '68/03', v: 8  }, { m: '68/04', v: 16 }, { m: '68/05', v: 30 },
];

const COUNTRY_DIST = [
  { name: 'จีน',          val: 24 },
  { name: 'ญี่ปุ่น',        val: 18 },
  { name: 'เกาหลีใต้',     val: 12 },
  { name: 'ไต้หวัน',       val: 9  },
  { name: 'สหราชอาณาจักร', val: 8  },
  { name: 'เยอรมนี',      val: 5  },
];
const TYPE_DIST = [
  { name: 'Inbound',      val: 30 },
  { name: 'Outbound',     val: 28 },
  { name: 'Travel',       val: 12 },
  { name: 'MOU Renewal',  val: 4  },
  { name: 'Scholarship',  val: 6  },
];
const FACULTY_DIST = [
  { name: 'ICT',                 val: 18 },
  { name: 'วิศวกรรมศาสตร์',       val: 14 },
  { name: 'แพทยศาสตร์',          val: 11 },
  { name: 'ศิลปกรรมศาสตร์',       val: 9  },
  { name: 'การศึกษา',            val: 7  },
  { name: 'วิทยาศาสตร์',         val: 6  },
];

const EXPORTS = [
  { code: 'Inbound CSV',  icon: '↘️', desc: 'รายงานนิสิต/บุคลากรที่เข้ามา' },
  { code: 'Outbound CSV', icon: '↗️', desc: 'รายงานนิสิต/บุคลากรที่เดินทางออก' },
  { code: 'Travel CSV',   icon: '✈️', desc: 'การเดินทางบุคลากร' },
  { code: 'MOU CSV',      icon: '🤝', desc: 'ข้อตกลงความร่วมมือ' },
  { code: 'ทุน CSV',       icon: '🎓', desc: 'ทุนการศึกษา' },
  { code: 'ข่าวสาร CSV',    icon: '📰', desc: 'ข่าวประชาสัมพันธ์' },
  { code: 'Filtered Export CSV', icon: '⚙️', desc: 'ตามตัวกรองปัจจุบัน' },
];

const TABLE = [
  { type:'Inbound',  name:'John Robert Smith', institute:'UK Exchange Program',   country:'ออสเตรเลีย', objective:'แลกเปลี่ยน', start:'1 ก.ย. 68 – 21 ม.ค. 69', year:2569, people:1, budget:120000 },
  { type:'Inbound',  name:'Mei Ling',           institute:'Summer Camp 2026',     country:'จีน',       objective:'แลกเปลี่ยน', start:'15 มิ.ย. 69 – 6 ก.ค. 68', year:2569, people:1, budget:50000  },
  { type:'Inbound',  name:'Yuki Tanaka',        institute:'Sakura Exchange',      country:'ญี่ปุ่น',     objective:'แลกเปลี่ยน', start:'1 ม.ค. 69 – 21 มี.ค. 69', year:2569, people:1, budget:80000  },
  { type:'Outbound', name:'อ. กิตติศักดิ์',       institute:'NTU Singapore',         country:'สิงคโปร์',   objective:'นำเสนองาน', start:'10 ก.พ. 69 – 14 ก.พ. 69', year:2569, people:1, budget:65000  },
  { type:'Outbound', name:'อ. วีรพล',          institute:'Kyoto University',      country:'ญี่ปุ่น',     objective:'วิจัย',      start:'5 มี.ค. 69 – 25 มี.ค. 69', year:2569, people:1, budget:95000  },
  { type:'MOU',      name:'Shanghai Open Univ', institute:'Shanghai Open Univ',   country:'จีน',       objective:'ลงนาม MOU',  start:'18 มี.ค. 69',              year:2569, people:2, budget:0      },
  { type:'ทุน',       name:'MEXT Scholarship',   institute:'Japan Government',     country:'ญี่ปุ่น',     objective:'ทุน ป.โท',    start:'1 ก.ค. 69',                year:2569, people:2, budget:0      },
  { type:'ข่าวสาร',    name:'ASEAN Mobility Day', institute:'IRO',                  country:'ไทย',       objective:'เผยแพร่',     start:'9 พ.ค. 69',                year:2569, people:0, budget:0      },
];

function typeBadge(t) {
  switch (t) {
    case 'Inbound':  return 'ir-badge-blue';
    case 'Outbound': return 'ir-badge-violet';
    case 'MOU':      return 'ir-badge-green';
    case 'ทุน':       return 'ir-badge-warn';
    case 'ข่าวสาร':    return 'ir-badge-gray';
    default: return 'ir-badge-gray';
  }
}

// ============================================================
// Summary stats — uses .ir-stat-strip with 5 cols
// ============================================================
function ReportStats() {
  return (
    <div className="ir-stat-strip" style={{gridTemplateColumns: 'repeat(5, 1fr)'}}>
      {SUMMARY.map((s, i) => (
        <window.StatTile key={i} tint={s.tint} icon={s.icon} value={s.val} label={s.label} trend="ภายในเดือนนี้" />
      ))}
    </div>
  );
}

// ============================================================
// Trend chart — area sparkline
// ============================================================
function TrendChart({ range, onRange }) {
  const max = Math.max(...TREND.map(t => t.v));
  const W = 720, H = 220, P = { l: 36, r: 16, t: 16, b: 30 };
  const innerW = W - P.l - P.r;
  const innerH = H - P.t - P.b;
  const x = (i) => P.l + (i / (TREND.length - 1)) * innerW;
  const y = (v) => P.t + innerH - (v / max) * innerH;

  const linePts = TREND.map((t, i) => `${x(i)},${y(t.v)}`).join(' ');
  const fillPath = `M ${x(0)},${P.t + innerH} L ${TREND.map((t, i) => `${x(i)},${y(t.v)}`).join(' L ')} L ${x(TREND.length-1)},${P.t + innerH} Z`;

  return (
    <div className="ir-card ir-chart-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">📈 Mobility/Travel แนวโน้ม</h3>
          <p className="ir-card-sub">ตามจำนวนต่อเดือน · ย้อนหลัง 12 เดือน</p>
        </div>
        <div className="ir-pill-row">
          {['6 เดือน', '1 ปี', '3 ปี'].map(r => (
            <button key={r} className={`ir-pill ${range === r ? 'active' : ''}`} onClick={() => onRange(r)}>{r}</button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="ir-spark">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--ir-primary)" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="var(--ir-primary)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* axis grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1={P.l} x2={W - P.r}
            y1={P.t + innerH - p * innerH} y2={P.t + innerH - p * innerH}
            className="ir-spark-axis" />
        ))}
        {[0, 0.5, 1].map((p, i) => (
          <text key={i} x={P.l - 8} y={P.t + innerH - p * innerH + 4} textAnchor="end" className="ir-spark-tick">
            {Math.round(p * max)}
          </text>
        ))}
        {/* fill + line */}
        <path d={fillPath} className="ir-spark-fill"/>
        <polyline points={linePts} className="ir-spark-line"/>
        {/* points */}
        {TREND.map((t, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(t.v)} r="4" fill="var(--ir-primary)" stroke="var(--ir-bg-card)" strokeWidth="2">
              <title>{t.m}: {t.v}</title>
            </circle>
            {i % 2 === 0 && (
              <text x={x(i)} y={H - 10} textAnchor="middle" className="ir-spark-tick">{t.m}</text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// Bar list (horizontal)
// ============================================================
function BarList({ title, sub, items, color }) {
  const max = Math.max(...items.map(i => i.val), 1);
  return (
    <div className="ir-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">{title}</h3>
          <p className="ir-card-sub">{sub}</p>
        </div>
      </div>
      <div className="ir-faculty-list">
        {items.map((f, i) => (
          <div className="ir-faculty-row" key={i}>
            <div className="ir-faculty-name">{f.name}</div>
            <div className="ir-faculty-bar-wrap">
              <div className="ir-faculty-bar" style={{
                width: `${(f.val / max) * 100}%`,
                background: color || undefined,
              }}></div>
              <span className="ir-faculty-val">{f.val}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Quick Export panel
// ============================================================
function QuickExport() {
  return (
    <div className="ir-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">⚡ Quick Export</h3>
          <p className="ir-card-sub">ดาวน์โหลดรายงานแต่ละหมวดเป็นไฟล์ CSV ทันที</p>
        </div>
      </div>
      <div className="ir-rep-grid-3">
        {EXPORTS.map((e, i) => (
          <div className="ir-exp-tile" key={i}>
            <div className="ir-exp-emoji">{e.icon}</div>
            <div>
              <div className="ir-exp-title">{e.code}</div>
              <div className="ir-exp-sub">{e.desc}</div>
            </div>
            <button className="ir-btn ir-btn-ghost ir-btn-sm" style={{marginLeft: 'auto'}}>⬇</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Detail table
// ============================================================
function DetailTable() {
  return (
    <div className="ir-card" style={{padding: 0, overflow: 'hidden'}}>
      <div className="ir-card-head" style={{padding: '18px 22px 6px'}}>
        <div>
          <h3 className="ir-card-title">📋 รายงานละเอียด</h3>
          <p className="ir-card-sub">รวมทุกประเภทรายงาน · กรองและพิมพ์ได้</p>
        </div>
        <div className="ir-flex ir-gap-2">
          <button className="ir-btn ir-btn-ghost ir-btn-sm">⬇ Export</button>
          <button className="ir-btn ir-btn-primary ir-btn-sm">🖨 Export และ Filter</button>
        </div>
      </div>
      <div className="ir-table-wrap">
        <table className="ir-table">
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>ชื่อ/หัวข้อ</th>
              <th>หน่วยงาน</th>
              <th>ประเทศ</th>
              <th>วัตถุประสงค์</th>
              <th>ช่วงเวลา</th>
              <th>ปี</th>
              <th>จำนวน</th>
              <th className="ta-r">งบประมาณ (บาท)</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {TABLE.map((r, i) => (
              <tr key={i}>
                <td><span className={`ir-badge ${typeBadge(r.type)}`}>{r.type}</span></td>
                <td><div className="ir-font-semi ir-text-heading">{r.name}</div></td>
                <td>{r.institute}</td>
                <td>{r.country}</td>
                <td className="ir-text-sm">{r.objective}</td>
                <td className="ir-text-sm">{r.start}</td>
                <td className="ir-text-muted">{r.year}</td>
                <td>{r.people}</td>
                <td className="ta-r">{r.budget ? r.budget.toLocaleString() : '—'}</td>
                <td><button className="ir-icon-btn">…</button></td>
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
  const [theme, setTheme] = useStateRP(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [range, setRange] = useStateRP('1 ปี');

  const [tweaks, setTweak] = window.usePageTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
  });

  useEffectRP(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iroup-theme', theme);
  }, [theme]);

  return (
    <div className="ir-app">
      <window.Sidebar active="report" onSelect={id => window.navTo(id, 'report')} />
      <main className="ir-main">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

        <window.PageHead
          crumb="รายงาน & Export"
          badge="V2 Reports"
          title="รายงานและการส่งออกข้อมูล"
          sub="สรุปและส่งออกข้อมูลทุกหมวด · MOU · Mobility · Travel · ทุน · ข่าว"
          actions={
            <React.Fragment>
              <button className="ir-btn ir-btn-glass">⬇ ส่งออกทั้งหมด</button>
              <button className="ir-btn ir-btn-primary">＋ Export และ Filter</button>
            </React.Fragment>
          } />

        <ReportStats />
        <div style={{height: 14}}></div>

        <div className="ir-rep-grid-2">
          <TrendChart range={range} onRange={setRange} />
          <BarList title="🌍 ประเทศ Top 6" sub="กระจายความร่วมมือนานาชาติ" items={COUNTRY_DIST} />
        </div>
        <div style={{height: 14}}></div>

        <div className="ir-rep-grid-2">
          <BarList title="📊 ประเภทรายงาน" sub="แยกตามหมวดประเภท" items={TYPE_DIST} />
          <BarList title="🏛 หน่วยงาน" sub="กิจกรรมรวมตามคณะ/หน่วยงาน" items={FACULTY_DIST} />
        </div>
        <div style={{height: 14}}></div>

        <QuickExport />
        <div style={{height: 14}}></div>

        <DetailTable />

        <window.PageFoot />
      </main>

      <window.StdTweaksPanel tweaks={tweaks} setTweak={setTweak} theme={theme} setTheme={setTheme} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
