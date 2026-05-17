/* global React */
const { useState: useStateMOU, useMemo: useMemoMOU } = React;

// ============================================================
// MOU — Page Header (breadcrumb + actions)
// ============================================================
function MOUHeader({ onAdd }) {
  return (
    <div className="ir-page-head">
      <div>
        <div className="ir-breadcrumb">
          <a>iROUP</a>
          <span className="sep">›</span>
          <span className="curr">MOU ต่างประเทศ</span>
          <span className="ir-badge ir-badge-blue ir-ml-2">V2 Native MOU</span>
        </div>
        <h1 className="ir-page-title">บันทึกข้อตกลงความร่วมมือนานาชาติ</h1>
        <p className="ir-page-sub">จัดการ MOU · MOA · LOI ระหว่างมหาวิทยาลัยพะเยากับสถาบันต่างประเทศ</p>
      </div>
      <div className="ir-page-actions">
        <div className="ir-lang-toggle">
          <button className="ir-lang-btn active">TH</button>
          <button className="ir-lang-btn">EN</button>
        </div>
        <button className="ir-btn ir-btn-glass">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export รายงาน
        </button>
        <button className="ir-btn ir-btn-primary" onClick={onAdd}>＋ เพิ่ม MOU</button>
      </div>
    </div>
  );
}

// ============================================================
// Alert banner
// ============================================================
function MOUAlert({ count }) {
  if (count === 0) {
    return (
      <div className="ir-alert ir-alert-info">
        <span className="ir-alert-icon">✓</span>
        <div>
          <strong>ไม่มี MOU ที่จะหมดอายุภายใน 90 วัน</strong>
          <span className="ir-text-muted ir-ml-2">ทุกข้อตกลงยังอยู่ในระยะปลอดภัย — ระบบจะแจ้งเตือนล่วงหน้าเสมอ</span>
        </div>
      </div>
    );
  }
  return (
    <div className="ir-alert ir-alert-warn">
      <span className="ir-alert-icon">⚠</span>
      <div>
        <strong>มี MOU {count} ฉบับที่จะหมดอายุภายใน 90 วัน</strong>
        <span className="ir-text-muted ir-ml-2">ควรพิจารณาต่ออายุก่อนสิ้นสุดสัญญา</span>
      </div>
      <button className="ir-btn ir-btn-ghost ir-btn-sm">ดูรายการ</button>
    </div>
  );
}

// ============================================================
// MOU KPI cards (4 big tiles)
// ============================================================
function MOUKPI({ stats }) {
  const items = [
    { val: stats.total,    label: 'MOU ทั้งหมด',     sub: 'หมดอายุ 0 รายการ',     icon: '🤝', tint: 'blue',   delta: '+2 ปีนี้',  up: true },
    { val: stats.active,   label: 'Active',         sub: '100% ของทั้งหมด',       icon: '✓',  tint: 'green',  delta: 'คงที่',     up: true },
    { val: stats.expiring, label: 'ใกล้หมดอายุ',     sub: 'ภายใน 90 วัน',          icon: '⏰', tint: 'orange', delta: '0 ฉบับ',    up: true },
    { val: stats.countries,label: 'ประเทศทั่วโลก',   sub: '1 ทวีป',                icon: '🌐', tint: 'violet', delta: '+0',        up: true },
  ];
  return (
    <div className="ir-kpi-grid ir-kpi-grid-4">
      {items.map((it, i) => (
        <div className="ir-kpi" key={i}>
          <div className={`ir-kpi-icon tint-${it.tint}`}>{it.icon}</div>
          <div className="ir-kpi-value">{it.val}</div>
          <div className="ir-kpi-label">{it.label}</div>
          <div className="ir-kpi-foot">
            <span className="ir-kpi-sub">{it.sub}</span>
            <span className={`ir-kpi-delta ${it.up ? 'up' : 'down'}`}>{it.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Filter Bar
// ============================================================
function MOUFilters({ filter, setFilter }) {
  const tabs = [
    { id: 'all',      label: 'ทั้งหมด',     count: 1 },
    { id: 'active',   label: 'Active',     count: 1 },
    { id: 'expiring', label: 'ใกล้หมด',     count: 0 },
    { id: 'expired',  label: 'หมดอายุ',     count: 0 },
  ];
  return (
    <div className="ir-card ir-filter-card">
      <div className="ir-filter-row">
        <div className="ir-filter-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          ค้นหา & กรอง
        </div>
        <div className="ir-filter-search">
          <input className="ir-input" placeholder="ค้นหาชื่อองค์กร ประเทศ หรือหน่วยงาน..."
            value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} />
        </div>
        <div className="ir-filter-date">
          <input className="ir-input" type="date" placeholder="วันที่เริ่ม" />
          <span className="ir-text-muted">ถึง</span>
          <input className="ir-input" type="date" placeholder="วันที่สิ้นสุด" />
        </div>
        <select className="ir-select ir-filter-continent"
          value={filter.continent} onChange={e => setFilter({...filter, continent: e.target.value})}>
          <option value="all">ทุกทวีป</option>
          <option value="asia">เอเชีย</option>
          <option value="europe">ยุโรป</option>
          <option value="america">อเมริกา</option>
          <option value="oceania">โอเชียเนีย</option>
          <option value="africa">แอฟริกา</option>
        </select>
      </div>
      <div className="ir-filter-tabs">
        {tabs.map(t => (
          <button key={t.id}
            className={`ir-filter-tab ${filter.status === t.id ? 'active' : ''}`}
            onClick={() => setFilter({...filter, status: t.id})}>
            {t.label}
            <span className="ir-tab-count">{t.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MOUHeader, MOUAlert, MOUKPI, MOUFilters });
