/* global React */
const { useState: useStateMC, useMemo: useMemoMC } = React;

// ============================================================
// Stylized World Map (SVG)
// ============================================================
const CONTINENTS = [
  // simplified silhouettes (Mercator-ish), viewBox 0 0 800 400
  { id: 'NA', d: 'M 60,70 Q 80,40 130,45 Q 200,40 240,75 Q 270,120 250,170 Q 210,220 150,215 Q 90,200 65,160 Q 50,110 60,70 Z' },
  { id: 'SA', d: 'M 200,240 Q 250,225 270,275 Q 285,335 240,370 Q 210,385 185,355 Q 170,310 185,275 Z' },
  { id: 'EU', d: 'M 365,75 Q 425,55 455,90 Q 470,125 425,145 Q 380,150 360,120 Q 350,90 365,75 Z' },
  { id: 'AF', d: 'M 385,170 Q 460,170 485,235 Q 480,310 440,345 Q 395,345 380,275 Q 370,215 385,170 Z' },
  { id: 'AS', d: 'M 470,65 Q 580,40 720,80 Q 770,130 720,200 Q 640,225 520,200 Q 460,165 470,65 Z' },
  { id: 'IN', d: 'M 555,200 Q 580,200 590,235 Q 580,265 560,265 Q 545,250 545,225 Z' },
  { id: 'OC', d: 'M 650,290 Q 710,275 750,305 Q 740,345 695,340 Q 645,330 650,290 Z' },
  { id: 'AN', d: 'M 60,380 Q 400,365 740,380 L 740,395 L 60,395 Z' },
];

// Approximate country positions (cx, cy in 800x400 viewBox)
const COUNTRIES = [
  { code: 'US', name: 'สหรัฐอเมริกา',   cx: 140, cy: 130, count: 1, active: true,  flag: '🇺🇸' },
  { code: 'BR', name: 'บราซิล',         cx: 230, cy: 290, count: 0, flag: '🇧🇷' },
  { code: 'UK', name: 'สหราชอาณาจักร',  cx: 388, cy: 100, count: 0, flag: '🇬🇧' },
  { code: 'DE', name: 'เยอรมนี',        cx: 415, cy: 105, count: 0, flag: '🇩🇪' },
  { code: 'FR', name: 'ฝรั่งเศส',         cx: 398, cy: 118, count: 0, flag: '🇫🇷' },
  { code: 'CN', name: 'จีน',            cx: 645, cy: 140, count: 0, flag: '🇨🇳' },
  { code: 'JP', name: 'ญี่ปุ่น',          cx: 710, cy: 145, count: 0, flag: '🇯🇵' },
  { code: 'KR', name: 'เกาหลีใต้',       cx: 685, cy: 135, count: 0, flag: '🇰🇷' },
  { code: 'AU', name: 'ออสเตรเลีย',     cx: 700, cy: 310, count: 0, flag: '🇦🇺' },
  { code: 'TH', name: 'ม.พะเยา',         cx: 620, cy: 200, isOrigin: true,         flag: '📍' },
];

function arcPath(x1, y1, x2, y2, lift = 60) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - lift;
  return `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`;
}

function WorldMap({ countByCountry }) {
  const [hover, setHover] = useStateMC(null);
  const origin = COUNTRIES.find(c => c.isOrigin);
  const activeCountries = COUNTRIES.filter(c => !c.isOrigin && c.count > 0);

  return (
    <div className="ir-card ir-map-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">🗺 แผนที่ความร่วมมือนานาชาติ</h3>
          <p className="ir-card-sub">คลิกประเทศเพื่อดูรายละเอียด MOU · {activeCountries.length} ประเทศใน {activeCountries.length} ทวีป</p>
        </div>
        <div className="ir-map-legend">
          <span className="lg lg-1"></span> 1–3 MOU
          <span className="lg lg-2"></span> 4–7 MOU
          <span className="lg lg-3"></span> 8+ MOU
          <span className="lg lg-0"></span> ไม่มี
        </div>
      </div>

      <div className="ir-map-wrap">
        <svg viewBox="0 0 800 400" className="ir-map-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="var(--ir-primary-soft)" stopOpacity="0.05"/>
              <stop offset="100%" stopColor="var(--ir-primary)"      stopOpacity="0.10"/>
            </linearGradient>
            <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#4BBDE8" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#4BBDE8" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#B7A0FF" stopOpacity="0.75"/>
              <stop offset="100%" stopColor="#B7A0FF" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="continentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#3A6CC8" stopOpacity="0.32"/>
              <stop offset="100%" stopColor="#7B5AE8" stopOpacity="0.22"/>
            </linearGradient>
          </defs>

          {/* Latitude grid */}
          {[80,160,240,320].map((y, i) => (
            <line key={i} x1="0" x2="800" y1={y} y2={y}
              stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6"/>
          ))}
          {[160,320,480,640].map((x, i) => (
            <line key={i} x1={x} x2={x} y1="0" y2="400"
              stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6"/>
          ))}

          {/* Continents */}
          {CONTINENTS.map(c => (
            <path key={c.id} d={c.d}
              fill="url(#continentFill)"
              stroke="rgba(123,187,255,0.55)" strokeWidth="0.9"/>
          ))}

          {/* Dotted texture overlay */}
          <g opacity="0.55">
            {CONTINENTS.flatMap(c => {
              const pts = [];
              for (let i = 0; i < 50; i++) {
                // sample random points; we'll just place small dots at fixed offsets per continent
              }
              return pts;
            })}
          </g>

          {/* Connection arcs from origin */}
          {activeCountries.map(c => (
            <path key={`arc-${c.code}`} d={arcPath(origin.cx, origin.cy, c.cx, c.cy, 70)}
              fill="none" stroke="#B7A0FF" strokeWidth="1.4"
              strokeDasharray="4 4" opacity="0.85">
              <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2.4s" repeatCount="indefinite"/>
            </path>
          ))}

          {/* Origin (Thailand / UP) */}
          <g transform={`translate(${origin.cx}, ${origin.cy})`}>
            <circle r="22" fill="url(#originGlow)"/>
            <circle r="6"  fill="#B7A0FF" stroke="white" strokeWidth="2.5"/>
            <text y="-14" textAnchor="middle" fontSize="11" fontWeight="700" fill="#F0F6FF">
              ม.พะเยา
            </text>
          </g>

          {/* Active country markers */}
          {activeCountries.map(c => (
            <g key={c.code} transform={`translate(${c.cx}, ${c.cy})`}
               onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)}
               style={{cursor: 'pointer'}}>
              <circle r="18" fill="url(#markerGlow)"/>
              <circle r="7"  fill="#4BBDE8" stroke="white" strokeWidth="2.5">
                <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite"/>
              </circle>
              <text y="-14" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#F0F6FF">
                {c.flag} {c.name}
              </text>
              <text y="-2" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.65)">
                {c.count} MOU
              </text>
            </g>
          ))}

          {/* Inactive country dots */}
          {COUNTRIES.filter(c => !c.isOrigin && !c.count).map(c => (
            <g key={c.code} transform={`translate(${c.cx}, ${c.cy})`} opacity="0.5">
              <circle r="3" fill="rgba(180,200,240,0.7)"/>
            </g>
          ))}
        </svg>

        {hover && (
          <div className="ir-map-tooltip">
            <div className="ir-map-tt-title">{hover.flag} {hover.name}</div>
            <div className="ir-map-tt-meta">{hover.count} ความร่วมมือ · คลิกเพื่อดู</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Active by Faculty — small bar chart
// ============================================================
function FacultyChart() {
  const items = [
    { name: 'เทคโนโลยีสารสนเทศและการสื่อสาร', val: 1 },
    { name: 'วิทยาศาสตร์',                  val: 0 },
    { name: 'วิศวกรรมศาสตร์',                val: 0 },
    { name: 'แพทยศาสตร์',                   val: 0 },
    { name: 'การศึกษา',                     val: 0 },
  ];
  const max = Math.max(...items.map(i => i.val), 1);
  return (
    <div className="ir-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">📊 MOU Active แยกตามหน่วยงาน</h3>
          <p className="ir-card-sub">แสดงเฉพาะหน่วยงานที่มี MOU Active</p>
        </div>
      </div>
      <div className="ir-faculty-list">
        {items.map((f, i) => (
          <div className="ir-faculty-row" key={i}>
            <div className="ir-faculty-name">{f.name}</div>
            <div className="ir-faculty-bar-wrap">
              <div className="ir-faculty-bar" style={{ width: `${(f.val / max) * 100}%`, opacity: f.val ? 1 : 0.15 }}></div>
              <span className="ir-faculty-val">{f.val}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MOU Table
// ============================================================
function MOUTable({ rows }) {
  return (
    <div className="ir-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">📋 รายการ MOU ทั้งหมด</h3>
          <p className="ir-card-sub">แสดง {rows.length} รายการ · เรียงตามปีงบประมาณล่าสุด</p>
        </div>
        <div className="ir-flex ir-gap-2">
          <button className="ir-btn ir-btn-ghost ir-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
            Export Excel
          </button>
          <button className="ir-btn ir-btn-ghost ir-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            พิมพ์รายงาน
          </button>
        </div>
      </div>

      <div className="ir-table-wrap">
        <table className="ir-table">
          <thead>
            <tr>
              <th>#</th>
              <th>หน่วยงาน ม.พะเยา</th>
              <th>องค์กรต่างประเทศ</th>
              <th>ประเทศ</th>
              <th>ประเภท</th>
              <th>ช่วงความร่วมมือ</th>
              <th>ปีงบประมาณ</th>
              <th>สถานะ</th>
              <th>ไฟล์แนบ</th>
              <th className="ta-r">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="ir-text-muted">{String(i + 1).padStart(2, '0')}</td>
                <td>
                  <div className="ir-font-semi ir-text-heading">{r.unit}</div>
                </td>
                <td>{r.org}</td>
                <td>
                  <span className="ir-flag">{r.flag}</span>
                  <span className="ir-ml-1">{r.country}</span>
                </td>
                <td><span className="ir-badge ir-badge-blue">{r.type}</span></td>
                <td className="ir-text-sm">{r.period}</td>
                <td className="ir-text-muted">{r.year}</td>
                <td>
                  <span className={`ir-badge ${r.status === 'Active' ? 'ir-badge-green' : r.status === 'Soon' ? 'ir-badge-warn' : 'ir-badge-red'}`}>
                    <span className="ir-status-dot"></span> {r.status}
                  </span>
                </td>
                <td>
                  <span className="ir-file-chip">📎 {r.files} ไฟล์</span>
                </td>
                <td className="ta-r">
                  <div className="ir-row-actions">
                    <button className="ir-icon-btn" title="แก้ไข">✎</button>
                    <button className="ir-icon-btn" title="ดูไฟล์">📎</button>
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

Object.assign(window, { WorldMap, FacultyChart, MOUTable });
