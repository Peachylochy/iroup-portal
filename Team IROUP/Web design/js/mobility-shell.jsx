/* global React */
const { useState: useStateMob } = React;

// ============================================================
// Mobility — Page Header
// ============================================================
function MobilityHeader({ view, setView, onAdd, onReload }) {
  return (
    <div className="ir-page-head">
      <div>
        <div className="ir-breadcrumb">
          <a>iROUP</a>
          <span className="sep">›</span>
          <span className="curr">Mobility</span>
          <span className="ir-badge ir-badge-violet ir-ml-2">V2-native API</span>
        </div>
        <h1 className="ir-page-title">นักศึกษาแลกเปลี่ยน & Mobility</h1>
        <p className="ir-page-sub">บริหารโครงการแลกเปลี่ยน Inbound &amp; Outbound · นิสิตและบุคลากร</p>
      </div>
      <div className="ir-page-actions">
        <div className="ir-lang-toggle">
          <button className="ir-lang-btn active">TH</button>
          <button className="ir-lang-btn">EN</button>
        </div>
        <div className="ir-segmented ir-view-toggle">
          <button className={`ir-seg ${view === 'card' ? 'active' : ''}`} onClick={() => setView('card')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            การ์ด
          </button>
          <button className={`ir-seg ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            ตาราง
          </button>
        </div>
        <button className="ir-btn ir-btn-glass" onClick={onReload}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15A9 9 0 1 1 5.64 5.64L1 10"/></svg>
          โหลดใหม่
        </button>
        <button className="ir-btn ir-btn-primary" onClick={onAdd}>＋ เพิ่ม Mobility</button>
      </div>
    </div>
  );
}

// ============================================================
// Mobility KPI cards (4 cards: Inbound, Outbound, จำนวนคน, ประเทศ)
// ============================================================
function MobilityKPI({ stats }) {
  const items = [
    { val: stats.inbound,  label: 'Inbound ทั้งหมด',  sub: 'นิสิต/บุคลากรเข้ามา',  icon: '↘',  tint: 'blue',   delta: '+1 ปีนี้', up: true },
    { val: stats.outbound, label: 'Outbound ทั้งหมด', sub: 'นิสิต/บุคลากรออกไป',  icon: '↗',  tint: 'violet', delta: '+1 ปีนี้', up: true },
    { val: stats.people,   label: 'จำนวนคนรวม',       sub: 'Inbound + Outbound',  icon: '👥', tint: 'teal',   delta: '+8',       up: true },
    { val: stats.countries,label: 'ประเทศ',           sub: 'ขอบเขตความร่วมมือ',   icon: '🌐', tint: 'pink',   delta: 'คงที่',   up: true },
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
function MobilityFilters({ filter, setFilter, onReset }) {
  return (
    <div className="ir-card ir-filter-card">
      <div className="ir-filter-row ir-filter-row-mob">
        <input className="ir-input" placeholder="🔍 ค้นหาโครงการ / สถาบัน / ประเทศ..."
          value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} />
        <select className="ir-select" value={filter.direction} onChange={e => setFilter({...filter, direction: e.target.value})}>
          <option value="all">ทั้งหมด</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
        <select className="ir-select" value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
          <option value="all">ทุกสถานะ</option>
          <option value="active">กำลังดำเนินการ</option>
          <option value="completed">เสร็จสิ้น</option>
          <option value="planned">วางแผน</option>
        </select>
        <select className="ir-select" value={filter.year} onChange={e => setFilter({...filter, year: e.target.value})}>
          <option value="all">ทุกปีงบประมาณ</option>
          <option value="2569">2569</option>
          <option value="2568">2568</option>
          <option value="2567">2567</option>
        </select>
        <button className="ir-btn ir-btn-ghost" onClick={onReset}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ล้างตัวกรอง
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { MobilityHeader, MobilityKPI, MobilityFilters });
