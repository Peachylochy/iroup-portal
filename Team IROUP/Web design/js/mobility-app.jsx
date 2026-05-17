/* global React, ReactDOM */
const { useState, useEffect } = React;

const MOCK_MOBILITY = [
  { name: 'แลกเปลี่ยนไต้หวัน 1', institute: 'Taiwan Uni',       country: 'ไต้หวัน',   flag: '🇹🇼', cc: 'tw', direction: 'Inbound',  people: 10, period: '15 พ.ค. 2569 - 5 มิ.ย. 2569',   year: 2569, status: 'กำลังดำเนินการ' },
  { name: 'แลกเปลี่ยนจีน',        institute: 'China normal',     country: 'จีน',       flag: '🇨🇳', cc: 'cn', direction: 'Outbound', people: 20, period: '1 มิ.ย. 2569 - 20 มิ.ย. 2569',  year: 2569, status: 'กำลังดำเนินการ' },
  { name: 'แลกเปลี่ยนฝรั่งเศส',    institute: 'France Ex',        country: 'ฝรั่งเศส',  flag: '🇫🇷', cc: 'fr', direction: 'Inbound',  people: 5,  period: '30 พ.ค. 2569 - 30 ก.ค. 2569',  year: 2569, status: 'กำลังดำเนินการ' },
  { name: 'วิจัย 1',              institute: 'Germany Reserach', country: 'เยอรมนี',   flag: '🇩🇪', cc: 'de', direction: 'Outbound', people: 5,  period: '5 มิ.ย. 2569 - 30 ก.ค. 2569',   year: 2569, status: 'กำลังดำเนินการ' },
];

const DEFAULT_FILTER = { q: '', direction: 'all', status: 'all', year: 'all' };

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [active, setActive] = useState('mobility');
  const [view, setView]   = useState('card');
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [modalOpen, setModalOpen] = useState(false);

  // Tweaks
  const t = window.useTweaks ? window.useTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
    kpiStyle: 'classic',
  }) : null;
  const tweaks   = t ? t[0] : { accent:'iroup', density:'comfy', bgStyle:'aurora', sidebarStyle:'glass', kpiStyle:'classic' };
  const setTweak = t ? t[1] : () => {};

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iroup-theme', theme);
  }, [theme]);

  useEffect(() => {
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
    document.body.dataset.density = tweaks.density;
    document.body.dataset.bg = tweaks.bgStyle;
    document.body.dataset.sidebar = tweaks.sidebarStyle;
    document.body.dataset.kpi = tweaks.kpiStyle;
  }, [tweaks.accent, tweaks.density, tweaks.bgStyle, tweaks.sidebarStyle, tweaks.kpiStyle]);

  // Filter mobility list
  const filtered = MOCK_MOBILITY.filter(m => {
    const q = filter.q.toLowerCase();
    if (q && ![m.name, m.institute, m.country].some(s => s.toLowerCase().includes(q))) return false;
    if (filter.direction !== 'all' && m.direction.toLowerCase() !== filter.direction) return false;
    if (filter.year !== 'all' && String(m.year) !== filter.year) return false;
    return true;
  });

  const inbound  = MOCK_MOBILITY.filter(m => m.direction === 'Inbound').length;
  const outbound = MOCK_MOBILITY.filter(m => m.direction === 'Outbound').length;
  const people   = MOCK_MOBILITY.reduce((s, m) => s + m.people, 0);
  const countries = new Set(MOCK_MOBILITY.map(m => m.country)).size;

  const stats = { inbound, outbound, people, countries };

  const goTo = id => {
    if (id === 'dashboard') window.location.href = 'dashboard.html';
    else if (id === 'mou')  window.location.href = 'mou.html';
    else if (id === 'mobility') setActive('mobility');
    else setActive(id);
  };

  return (
    <div className="ir-app">
      <window.Sidebar active={active} onSelect={goTo} />

      <main className="ir-main">
        <div className="ir-top-bar">
          <div className="ir-flex ir-items-center ir-gap-2">
            <button className="ir-btn ir-btn-icon ir-btn-glass" title="แจ้งเตือน">🔔<span className="ir-noti-dot"></span></button>
            <button className="ir-btn ir-btn-icon ir-btn-glass"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="ir-btn ir-btn-ghost ir-btn-sm">⎋ Logout</button>
          </div>
        </div>

        <window.MobilityHeader
          view={view} setView={setView}
          onAdd={() => setModalOpen(true)}
          onReload={() => {}} />

        <window.MobilityKPI stats={stats} />

        <window.MobilityFilters
          filter={filter} setFilter={setFilter}
          onReset={() => setFilter(DEFAULT_FILTER)} />

        {view === 'card'
          ? <window.MobilityGrid  items={filtered} onEdit={() => setModalOpen(true)} />
          : <window.MobilityTable items={filtered} onEdit={() => setModalOpen(true)} />
        }

        <footer className="ir-footer">
          <div><strong>iROUP</strong> · International Relations Office · University of Phayao</div>
          <div className="ir-footer-meta">v2.0 · Personal IR Workspace · © 2569</div>
        </footer>
      </main>

      <window.AddMobilityModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Theme">
            <window.TweakColor label="Accent" value={tweaks.accent} onChange={v => setTweak('accent', v)}
              options={[
                ['#1A6DB5','#4BBDE8','#7B5AE8'],
                ['#4F46E5','#818CF8','#EC4899'],
                ['#0E9488','#5EEAD4','#F59E0B'],
                ['#EA580C','#FB923C','#DB2777'],
              ]} />
            <window.TweakSelect label="KPI style" value={tweaks.kpiStyle}
              onChange={v => setTweak('kpiStyle', v)}
              options={['classic','glass','tinted','stroke','dark','spark','bento','ring']} />
            <window.TweakRadio label="View" value={view} onChange={setView} options={['card','list']} />
            <window.TweakRadio label="Density" value={tweaks.density} onChange={v => setTweak('density', v)} options={['compact','comfy']} />
            <window.TweakRadio label="Background" value={tweaks.bgStyle} onChange={v => setTweak('bgStyle', v)} options={['aurora','mesh','plain']} />
          </window.TweakSection>
          <window.TweakSection title="Actions">
            <window.TweakButton onClick={() => setModalOpen(true)}>เปิด Modal เพิ่ม Mobility</window.TweakButton>
            <window.TweakButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              สลับ {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </window.TweakButton>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
