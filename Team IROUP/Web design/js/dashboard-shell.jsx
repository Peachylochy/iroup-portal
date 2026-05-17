/* global React */
const { useState, useEffect, useRef } = React;

// ============================================================
// IROUP Dashboard — Sidebar
// ============================================================
// Inline SVG icons — stroke style, scales with currentColor
const Ico = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3"  width="7" height="9" rx="1.6"/>
      <rect x="14" y="3" width="7" height="5" rx="1.6"/>
      <rect x="14" y="12" width="7" height="9" rx="1.6"/>
      <rect x="3" y="16" width="7" height="5" rx="1.6"/>
    </svg>
  ),
  mou: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11l2-2 2 2 2-2 3 3"/>
      <path d="M3 10l5-5 4 4"/>
      <path d="M21 10l-5-5-4 4"/>
      <path d="M3 10v6a2 2 0 0 0 2 2h4"/>
      <path d="M21 10v6a2 2 0 0 1-2 2h-4"/>
      <path d="M9 18l3 3 3-3"/>
    </svg>
  ),
  mobility: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18"/>
      <path d="M12 3a14 14 0 0 1 0 18"/>
      <path d="M12 3a14 14 0 0 0 0 18"/>
    </svg>
  ),
  travel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16.5L14 11V5a2 2 0 1 0-4 0v6L3 16.5V18l7-2v4l-2 1.5V22l4-1 4 1v-.5L14 20v-4l7 2v-1.5z"/>
    </svg>
  ),
  scholarship: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-4 10 4-10 4L2 9z"/>
      <path d="M6 10.5V15c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>
      <path d="M22 9v5"/>
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="17" rx="2"/>
      <path d="M3 10h18"/>
      <path d="M8 3v3M16 3v3"/>
      <circle cx="8" cy="15" r="1" fill="currentColor"/>
      <circle cx="12" cy="15" r="1" fill="currentColor"/>
      <circle cx="16" cy="15" r="1" fill="currentColor"/>
    </svg>
  ),
  news: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z"/>
      <path d="M19 8h2v9a2 2 0 0 1-2 2"/>
      <path d="M7 9h8M7 13h8M7 17h5"/>
    </svg>
  ),
  knowledge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v18H5.5A1.5 1.5 0 0 1 4 19.5v-15z"/>
      <path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H13v18h5.5a1.5 1.5 0 0 0 1.5-1.5v-15z"/>
      <path d="M7 7h2M7 10h2M15 7h2M15 10h2"/>
    </svg>
  ),
};

// Extra icons
Ico.report    = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <path d="M8 7h8M8 11h8M8 15h5"/>
    <circle cx="17" cy="16" r="3" fill="currentColor" opacity="0.18"/>
  </svg>
);
Ico.public    = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
  </svg>
);
Ico.workspace = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="13" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);
Ico.portfolio = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2"/>
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
    <path d="M3 12h18"/>
  </svg>
);

const MENU = [
  { id: 'dashboard',   icon: Ico.dashboard,   label: 'Executive Dashboard', section: 'OVERVIEW' },
  { id: 'mou',         icon: Ico.mou,         label: 'MOU',                 section: 'MANAGEMENT' },
  { id: 'mobility',    icon: Ico.mobility,    label: 'Mobility',            section: 'MANAGEMENT' },
  { id: 'travel',      icon: Ico.travel,      label: 'การเดินทาง',          section: 'MANAGEMENT' },
  { id: 'scholarship', icon: Ico.scholarship, label: 'ทุนการศึกษา',         section: 'MANAGEMENT' },
  { id: 'events',      icon: Ico.events,      label: 'กิจกรรม',             section: 'MANAGEMENT' },
  { id: 'news',        icon: Ico.news,        label: 'ข่าว',                 section: 'MANAGEMENT' },
  { id: 'knowledge',   icon: Ico.knowledge,   label: 'คลังความรู้',          section: 'MANAGEMENT' },
  { id: 'report',      icon: Ico.report,      label: 'รายงาน & Export',     section: 'MANAGEMENT' },
  { id: 'public',      icon: Ico.public,      label: 'Public View',         section: 'PUBLIC' },
  { id: 'workspace',   icon: Ico.workspace,   label: 'Workspace',           section: 'ECOSYSTEM' },
  { id: 'portfolio',   icon: Ico.portfolio,   label: 'Workload Portfolio',  section: 'ECOSYSTEM' },
];

function Sidebar({ active, onSelect }) {
  const sections = ['OVERVIEW', 'MANAGEMENT', 'PUBLIC', 'ECOSYSTEM'];
  return (
    <aside className="ir-sidebar">
      <div className="ir-sidebar-brand">
        <div className="ir-brand-mark">
          <span className="ir-brand-orb"></span>
          <span className="ir-brand-orb ir-brand-orb-2"></span>
        </div>
        <div className="ir-brand-text">
          <div className="ir-brand-name">iROUP</div>
          <div className="ir-brand-sub">International Relations<br/>University of Phayao</div>
        </div>
      </div>

      <nav className="ir-sidenav">
        {sections.map(s => (
          <div key={s} className="ir-sidenav-section">
            <div className="ir-sidenav-section-title">{s}</div>
            {MENU.filter(m => m.section === s).map(m => (
              <button
                key={m.id}
                className={`ir-nav-item ${active === m.id ? 'active' : ''}`}
                onClick={() => onSelect && onSelect(m.id)}
              >
                <span className="ir-nav-icon">{m.icon}</span>
                <span className="ir-nav-label">{m.label}</span>
                {active === m.id && <span className="ir-nav-dot"></span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="ir-sidebar-foot">
        <div className="ir-user-avatar">IR</div>
        <div className="ir-user-info">
          <div className="ir-user-name">งานวิเทศสัมพันธ์</div>
          <div className="ir-user-role">University of Phayao</div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// Header
// ============================================================
function Header({ theme, onToggleTheme, onAdd }) {
  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  return (
    <header className="ir-header">
      <div>
        <div className="ir-header-eyebrow">
          <span className="ir-pulse"></span> ภาพรวมระบบ · อัปเดตล่าสุด {today}
        </div>
        <h1 className="ir-header-title">Dashboard</h1>
        <p className="ir-header-sub">สวัสดีค่ะ ขอให้เป็นวันที่ดี ✨ — นี่คือสรุปงานวิเทศสัมพันธ์ของคุณวันนี้</p>
      </div>
      <div className="ir-header-actions">
        <div className="ir-search">
          <span className="ir-search-icon">🔍</span>
          <input className="ir-search-input" placeholder="ค้นหา MOU · ทุน · กิจกรรม..." />
          <kbd className="ir-kbd">⌘K</kbd>
        </div>
        <button className="ir-btn ir-btn-icon ir-btn-glass" title="การแจ้งเตือน">
          🔔<span className="ir-noti-dot"></span>
        </button>
        <button
          className="ir-btn ir-btn-icon ir-btn-glass"
          title={theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="ir-btn ir-btn-ghost ir-btn-sm" title="ออกจากระบบ">
          ⎋ Logout
        </button>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Header, MENU });
