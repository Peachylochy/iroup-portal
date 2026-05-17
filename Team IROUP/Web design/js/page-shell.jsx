/* global React */
// ============================================================
// Shared page-shell helpers for sub-pages
// ============================================================

// ---------- Top bar (notification + theme + logout) ----------
function TopBar({ theme, onToggleTheme }) {
  return (
    <div className="ir-top-bar">
      <div className="ir-flex ir-items-center ir-gap-2">
        <button className="ir-btn ir-btn-icon ir-btn-glass" title="แจ้งเตือน">
          🔔<span className="ir-noti-dot"></span>
        </button>
        <button className="ir-btn ir-btn-icon ir-btn-glass"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="ir-btn ir-btn-ghost ir-btn-sm">⎋ Logout</button>
      </div>
    </div>
  );
}

// ---------- Page header (breadcrumb + title + actions) ----------
function PageHead({ crumb, title, sub, badge, actions }) {
  return (
    <div className="ir-page-head">
      <div>
        <div className="ir-breadcrumb">
          <a>iROUP</a>
          <span className="sep">›</span>
          <span className="curr">{crumb}</span>
          {badge && <span className="ir-badge ir-badge-blue ir-ml-2">{badge}</span>}
        </div>
        <h1 className="ir-page-title">{title}</h1>
        <p className="ir-page-sub">{sub}</p>
      </div>
      <div className="ir-page-actions">{actions}</div>
    </div>
  );
}

// ---------- Language + View toggles ----------
function LangToggle({ value, onChange }) {
  return (
    <div className="ir-lang-toggle">
      <button className={`ir-lang-btn ${value === 'TH' ? 'active' : ''}`} onClick={() => onChange && onChange('TH')}>TH</button>
      <button className={`ir-lang-btn ${value === 'EN' ? 'active' : ''}`} onClick={() => onChange && onChange('EN')}>EN</button>
    </div>
  );
}

function ViewToggle({ value, onChange, labels }) {
  const a = labels?.[0] || 'การ์ด';
  const b = labels?.[1] || 'ตาราง';
  return (
    <div className="ir-pill-row">
      <button className={`ir-pill ${value === 'card' ? 'active' : ''}`} onClick={() => onChange('card')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></svg>
        {a}
      </button>
      <button className={`ir-pill ${value === 'table' ? 'active' : ''}`} onClick={() => onChange('table')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        {b}
      </button>
    </div>
  );
}

// ---------- Reusable stat tile (compact strip) ----------
function StatTile({ icon, tint, value, label, trend, trendClass }) {
  return (
    <div className="ir-stat">
      <div className={`ir-stat-icon tint-${tint || 'blue'}`}>{icon}</div>
      <div className="ir-stat-body">
        <div className="ir-stat-val">{value}</div>
        <div className="ir-stat-label">{label}</div>
      </div>
      {trend && <span className={`ir-stat-trend ${trendClass || ''}`}>{trend}</span>}
    </div>
  );
}

// ---------- Page footer ----------
function PageFoot() {
  return (
    <footer className="ir-footer">
      <div><strong>iROUP</strong> · International Relations Office · University of Phayao</div>
      <div className="ir-footer-meta">v2.0 · Personal IR Workspace · © 2569</div>
    </footer>
  );
}

// ---------- Standard navigation helper ----------
function navTo(id, current) {
  const map = {
    dashboard:   'dashboard.html',
    mou:         'mou.html',
    mobility:    'mobility.html',
    travel:      'travel.html',
    scholarship: 'scholarship.html',
    events:      'events.html',
    news:        'news.html',
    knowledge:   'knowledge.html',
    report:      'report.html',
  };
  if (id === current) return;
  if (map[id]) window.location.href = map[id];
}

// ---------- Standard theme/tweaks effect hook ----------
function usePageTweaks(defaults) {
  const t = window.useTweaks ? window.useTweaks(defaults) : null;
  const tweaks   = t ? t[0] : defaults;
  const setTweak = t ? t[1] : () => {};

  React.useEffect(() => {
    const root = document.documentElement;
    const palettes = {
      iroup:  { p:'#1A6DB5', ps:'#4BBDE8', pd:'#0F4F8E', ac:'#7B5AE8' },
      indigo: { p:'#4F46E5', ps:'#818CF8', pd:'#3730A3', ac:'#EC4899' },
      teal:   { p:'#0E9488', ps:'#5EEAD4', pd:'#0F766E', ac:'#F59E0B' },
      sunset: { p:'#EA580C', ps:'#FB923C', pd:'#C2410C', ac:'#DB2777' },
    };
    const pal = palettes[tweaks.accent] || palettes.iroup;
    root.style.setProperty('--ir-primary', pal.p);
    root.style.setProperty('--ir-primary-soft', pal.ps);
    root.style.setProperty('--ir-primary-deep', pal.pd);
    root.style.setProperty('--ir-accent', pal.ac);
    document.body.dataset.density = tweaks.density || 'comfy';
    document.body.dataset.bg = tweaks.bgStyle || 'aurora';
    document.body.dataset.sidebar = tweaks.sidebarStyle || 'glass';
  }, [tweaks.accent, tweaks.density, tweaks.bgStyle, tweaks.sidebarStyle]);

  return [tweaks, setTweak];
}

// ---------- Standard tweaks panel (re-used) ----------
function StdTweaksPanel({ tweaks, setTweak, theme, setTheme, extraSection }) {
  if (!window.TweaksPanel) return null;
  return (
    <window.TweaksPanel title="Tweaks">
      <window.TweakSection title="Theme">
        <window.TweakColor label="Accent" value={tweaks.accent} onChange={v => setTweak('accent', v)}
          options={[
            ['#1A6DB5','#4BBDE8','#7B5AE8'],
            ['#4F46E5','#818CF8','#EC4899'],
            ['#0E9488','#5EEAD4','#F59E0B'],
            ['#EA580C','#FB923C','#DB2777'],
          ]} />
        <window.TweakRadio label="Density" value={tweaks.density} onChange={v => setTweak('density', v)} options={['compact','comfy']} />
        <window.TweakRadio label="Background" value={tweaks.bgStyle} onChange={v => setTweak('bgStyle', v)} options={['aurora','mesh','plain']} />
        <window.TweakRadio label="Sidebar" value={tweaks.sidebarStyle} onChange={v => setTweak('sidebarStyle', v)} options={['glass','solid']} />
      </window.TweakSection>
      {extraSection}
      <window.TweakSection title="Mode">
        <window.TweakButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          สลับ {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </window.TweakButton>
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

Object.assign(window, { TopBar, PageHead, LangToggle, ViewToggle, StatTile, PageFoot, navTo, usePageTweaks, StdTweaksPanel });
