/* global React */
const { useMemo: useMemoKPI } = React;

// ============================================================
// KPI Cards
// ============================================================
function KPIRow({ accent }) {
  const items = [
    { label: 'MOU ทั้งหมด',  value: '9',   sub: '6 Active · 1 ใกล้หมดอายุ',  icon: '🤝', tint: 'blue',   delta: '+12%', up: true },
    { label: 'ทุนการศึกษา',   value: '6',   sub: '5 เปิดรับสมัคร',             icon: '🎓', tint: 'violet', delta: '+2',   up: true },
    { label: 'กิจกรรม',       value: '12',  sub: '4 กิจกรรมเดือนนี้',          icon: '📅', tint: 'green',  delta: '+24%', up: true },
    { label: 'Mobility',     value: '45',  sub: 'In 19 · Out 26',           icon: '🌐', tint: 'teal',   delta: '+8',   up: true },
    { label: 'การเดินทาง',    value: '9',   sub: '1 กำลังเดินทาง',             icon: '✈️', tint: 'orange', delta: '-2',   up: false },
    { label: 'งบประมาณรวม',  value: '10.4M',sub: 'จาก 6 หมวด · ฿ บาท',         icon: '💰', tint: 'pink',   delta: '+15%', up: true },
  ];

  return (
    <div className="ir-kpi-grid">
      {items.map((it, i) => (
        <div className="ir-kpi" key={i}>
          <div className={`ir-kpi-icon tint-${it.tint}`}>{it.icon}</div>
          <div className="ir-kpi-value">{it.value}</div>
          <div className="ir-kpi-label">{it.label}</div>
          <div className="ir-kpi-foot">
            <span className="ir-kpi-sub">{it.sub}</span>
            <span className={`ir-kpi-delta ${it.up ? 'up' : 'down'}`}>
              {it.up ? '▲' : '▼'} {it.delta}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Activity Chart (SVG)
// ============================================================
function ActivityChart({ range, setRange }) {
  // monthly data — engagement points
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const mou      = [2,3,4,3,5,7,8,6,9,8,10,9];
  const mobility = [10,14,18,15,22,28,32,30,38,42,40,45];
  const events   = [1,2,2,3,5,7,9,8,11,10,12,12];

  const W = 720, H = 240, P = { l: 36, r: 16, t: 16, b: 30 };
  const maxY = Math.max(...mobility) * 1.15;
  const xs = months.map((_, i) => P.l + (i * (W - P.l - P.r)) / (months.length - 1));
  const y = v => H - P.b - (v / maxY) * (H - P.t - P.b);

  const path = (arr, smooth = true) => {
    const pts = arr.map((v, i) => [xs[i], y(v)]);
    if (!smooth) return 'M' + pts.map(p => p.join(',')).join('L');
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return d;
  };
  const area = arr => path(arr) + ` L ${xs[xs.length - 1]},${H - P.b} L ${xs[0]},${H - P.b} Z`;

  const ranges = ['1เดือน','3เดือน','6เดือน','1ปี'];

  return (
    <div className="ir-card ir-chart-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">📈 Engagement & Activity</h3>
          <p className="ir-card-sub">ภาพรวมการเคลื่อนไหวของ MOU · Mobility · กิจกรรม รายเดือน</p>
        </div>
        <div className="ir-segmented">
          {ranges.map(r => (
            <button key={r} className={`ir-seg ${r === range ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="ir-chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="ir-chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradMob" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ir-primary)" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="var(--ir-primary)" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="gradEv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ir-accent)" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="var(--ir-accent)" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* grid */}
          {[0, .25, .5, .75, 1].map((t, i) => (
            <line key={i} x1={P.l} x2={W - P.r}
              y1={P.t + t * (H - P.t - P.b)} y2={P.t + t * (H - P.t - P.b)}
              stroke="var(--ir-border-soft)" strokeDasharray="4 4" />
          ))}
          {/* y labels */}
          {[0, .25, .5, .75, 1].map((t, i) => (
            <text key={i} x={P.l - 8} y={P.t + (1 - t) * (H - P.t - P.b) + 4}
              fontSize="10" textAnchor="end" fill="var(--ir-text-muted)">
              {Math.round(maxY * t)}
            </text>
          ))}
          {/* x labels */}
          {months.map((m, i) => (
            <text key={i} x={xs[i]} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ir-text-muted)">{m}</text>
          ))}

          {/* areas */}
          <path d={area(mobility)} fill="url(#gradMob)" />
          <path d={area(events)}   fill="url(#gradEv)" />

          {/* lines */}
          <path d={path(mobility)} fill="none" stroke="var(--ir-primary)"      strokeWidth="2.5" />
          <path d={path(events)}   fill="none" stroke="var(--ir-accent)"       strokeWidth="2.5" />
          <path d={path(mou)}      fill="none" stroke="var(--ir-primary-soft)" strokeWidth="2.5" strokeDasharray="4 4"/>

          {/* dots on last point */}
          {[
            { v: mobility[mobility.length - 1], c: 'var(--ir-primary)' },
            { v: events[events.length - 1],     c: 'var(--ir-accent)' },
            { v: mou[mou.length - 1],           c: 'var(--ir-primary-soft)' },
          ].map((d, i) => (
            <circle key={i} cx={xs[xs.length - 1]} cy={y(d.v)} r="4" fill="white" stroke={d.c} strokeWidth="2.5" />
          ))}

          {/* peak callout on mobility */}
          <g transform={`translate(${xs[9]}, ${y(mobility[9]) - 26})`}>
            <rect x="-32" y="-14" rx="8" width="64" height="22" fill="var(--ir-bg-card)" stroke="var(--ir-border)"/>
            <text x="0" y="2" fontSize="11" textAnchor="middle" fill="var(--ir-text-heading)" fontWeight="700">Peak · 42</text>
          </g>
        </svg>
      </div>

      <div className="ir-chart-legend">
        <span className="ir-legend"><i style={{background:'var(--ir-primary)'}}></i> Mobility</span>
        <span className="ir-legend"><i style={{background:'var(--ir-accent)'}}></i> กิจกรรม</span>
        <span className="ir-legend"><i style={{background:'var(--ir-primary-soft)',outline:'2px dashed var(--ir-primary-soft)',outlineOffset:'-2px',background:'transparent'}}></i> MOU</span>
      </div>
    </div>
  );
}

// ============================================================
// Side Insights (Budget Snapshot)
// ============================================================
function BudgetSnapshot() {
  const rows = [
    { label: 'Inbound Mobility',  val: 5644300, pct: 54, color: 'var(--ir-primary)' },
    { label: 'Outbound Mobility', val: 4610000, pct: 44, color: 'var(--ir-accent)' },
    { label: 'การเดินทาง',         val: 145200,  pct: 1.4, color: 'var(--ir-primary-soft)' },
    { label: 'ทุนการศึกษา',        val: 0,       pct: 0, color: '#94A3B8' },
  ];
  const total = 10399500;
  const fmt = n => n.toLocaleString('th-TH');

  return (
    <div className="ir-card">
      <div className="ir-card-head">
        <div>
          <h3 className="ir-card-title">💰 Budget Snapshot</h3>
          <p className="ir-card-sub">สรุปงบประมาณรวม ปีงบประมาณ 2569</p>
        </div>
      </div>

      <div className="ir-budget-total">
        <div className="ir-budget-amount">
          ฿ {fmt(total)}
        </div>
        <div className="ir-budget-cap">งบประมาณที่บันทึกในระบบ</div>
      </div>

      <div className="ir-budget-list">
        {rows.map((r, i) => (
          <div className="ir-budget-row" key={i}>
            <div className="ir-budget-meta">
              <span className="ir-budget-dot" style={{background: r.color}}></span>
              <span className="ir-budget-label">{r.label}</span>
              <span className="ir-budget-val">฿ {fmt(r.val)}</span>
            </div>
            <div className="ir-budget-bar">
              <div className="ir-budget-fill" style={{width: `${Math.max(r.pct, 1)}%`, background: r.color}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { KPIRow, ActivityChart, BudgetSnapshot });
