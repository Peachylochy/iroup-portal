/* global React */

// ============================================================
// Mobility Card
// ============================================================
function MobilityCard({ item, onEdit, onDelete }) {
  const dir = item.direction;
  const dirCls = dir === 'Inbound' ? 'ir-badge-blue' : 'ir-badge-violet';
  const dirIcon = dir === 'Inbound' ? '↘' : '↗';

  return (
    <div className="ir-mob-card">
      <div className="ir-mob-card-top">
        <div className="ir-mob-flag-circle">
          {item.cc
            ? <img src={`https://hatscripts.github.io/circle-flags/flags/${item.cc}.svg`} alt={item.country} className="ir-mob-flag-img" />
            : <span className="ir-mob-flag">{item.flag}</span>
          }
        </div>
        <div className="ir-mob-meta">
          <div className="ir-mob-title">{item.name}</div>
          <div className="ir-mob-sub">
            <span>{item.institute}</span>
            <span className="dot">|</span>
            <span>{item.country}</span>
          </div>
        </div>
      </div>

      <div className="ir-mob-badges">
        <span className={`ir-badge ${dirCls}`}>{dirIcon} {dir}</span>
        <span className={`ir-badge ${item.status === 'เสร็จสิ้น' ? 'ir-badge-gray' : 'ir-badge-warn'}`}>
          {item.status}
        </span>
        <span className="ir-badge ir-badge-green">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {item.people} คน
        </span>
      </div>

      <div className="ir-mob-info">
        <div className="ir-mob-info-row">
          <span className="ir-mob-info-label">ช่วงเวลา</span>
          <span className="ir-mob-info-value">{item.period}</span>
        </div>
        <div className="ir-mob-info-row">
          <span className="ir-mob-info-label">ปีงบประมาณ</span>
          <span className="ir-mob-info-value">{item.year}</span>
        </div>
      </div>

      <div className="ir-mob-actions">
        <button className="ir-btn ir-btn-ghost ir-btn-sm" onClick={onEdit}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          แก้ไข
        </button>
        <button className="ir-btn ir-btn-danger ir-btn-sm" onClick={onDelete}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
          ลบ
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Mobility Grid
// ============================================================
function MobilityGrid({ items, onEdit }) {
  return (
    <div className="ir-mob-grid">
      {items.map((it, i) => (
        <MobilityCard key={i} item={it} onEdit={() => onEdit(it)} onDelete={() => {}} />
      ))}
    </div>
  );
}

// ============================================================
// Mobility Table
// ============================================================
function MobilityTable({ items, onEdit }) {
  return (
    <div className="ir-card">
      <div className="ir-table-wrap">
        <table className="ir-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อโครงการ</th>
              <th>สถาบัน</th>
              <th>ประเทศ</th>
              <th>ทิศทาง</th>
              <th>จำนวนคน</th>
              <th>ช่วงเวลา</th>
              <th>ปีงบประมาณ</th>
              <th>สถานะ</th>
              <th className="ta-r">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={i}>
                <td className="ir-text-muted">{i + 1}</td>
                <td><div className="ir-font-semi ir-text-heading">{r.name}</div></td>
                <td>{r.institute}</td>
                <td><span className="ir-flag">{r.flag}</span><span className="ir-ml-1">{r.country}</span></td>
                <td>
                  <span className={`ir-badge ${r.direction === 'Inbound' ? 'ir-badge-blue' : 'ir-badge-violet'}`}>
                    {r.direction === 'Inbound' ? '↘' : '↗'} {r.direction}
                  </span>
                </td>
                <td className="ir-font-semi">{r.people}</td>
                <td className="ir-text-sm">{r.period}</td>
                <td className="ir-text-muted">{r.year}</td>
                <td>
                  <span className={`ir-badge ${r.status === 'เสร็จสิ้น' ? 'ir-badge-gray' : 'ir-badge-warn'}`}>
                    <span className="ir-status-dot"></span> {r.status}
                  </span>
                </td>
                <td className="ta-r">
                  <div className="ir-row-actions">
                    <button className="ir-icon-btn" title="แก้ไข" onClick={() => onEdit(r)}>✎</button>
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

Object.assign(window, { MobilityCard, MobilityGrid, MobilityTable });
