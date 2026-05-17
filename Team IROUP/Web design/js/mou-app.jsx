/* global React, ReactDOM */
const { useState, useEffect } = React;

const MOCK_MOUS = [
  {
    unit:    'คณะเทคโนโลยีสารสนเทศและการสื่อสาร',
    org:     'มหาวิทยาลัยอเมริกา',
    country: 'สหรัฐอเมริกา',
    flag:    '🇺🇸',
    type:    'MOU',
    period:  '30 พ.ค. 2569 – 31 ต.ค. 2570',
    year:    '2569',
    status:  'Active',
    files:   1,
  },
];

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  const [active, setActive] = useState('mou');
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState({ q: '', continent: 'all', status: 'all' });

  // Tweaks
  const t = window.useTweaks ? window.useTweaks({
    accent: 'iroup', density: 'comfy', bgStyle: 'aurora', sidebarStyle: 'glass',
  }) : null;
  const tweaks   = t ? t[0] : { accent:'iroup', density:'comfy', bgStyle:'aurora', sidebarStyle:'glass' };
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
  }, [tweaks.accent, tweaks.density, tweaks.bgStyle, tweaks.sidebarStyle]);

  const stats = {
    total: 1, active: 1, expiring: 0, countries: 1
  };

  return (
    <div className="ir-app">
      <window.Sidebar active={active} onSelect={id => {
        if (id === 'dashboard') window.location.href = 'dashboard.html';
        else if (id === 'mobility') window.location.href = 'mobility.html';
        else setActive(id);
      }} />

      <main className="ir-main">
        {/* top mini-bar: theme + logout */}
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

        <window.MOUHeader onAdd={() => setModalOpen(true)} />
        <window.MOUAlert count={stats.expiring} />
        <window.MOUKPI stats={stats} />
        <window.MOUFilters filter={filter} setFilter={setFilter} />

        <div className="ir-mou-row">
          <window.WorldMap countByCountry={{ US: 1 }} />
          <window.FacultyChart />
        </div>

        <window.MOUTable rows={MOCK_MOUS} />

        <footer className="ir-footer">
          <div><strong>iROUP</strong> · International Relations Office · University of Phayao</div>
          <div className="ir-footer-meta">v2.0 · Personal IR Workspace · © 2569</div>
        </footer>
      </main>

      <window.AddMOUModal open={modalOpen} onClose={() => setModalOpen(false)} />

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
            <window.TweakRadio label="Density" value={tweaks.density} onChange={v => setTweak('density', v)} options={['compact','comfy']} />
            <window.TweakRadio label="Background" value={tweaks.bgStyle} onChange={v => setTweak('bgStyle', v)} options={['aurora','mesh','plain']} />
            <window.TweakRadio label="Sidebar" value={tweaks.sidebarStyle} onChange={v => setTweak('sidebarStyle', v)} options={['glass','solid']} />
          </window.TweakSection>
          <window.TweakSection title="Actions">
            <window.TweakButton onClick={() => setModalOpen(true)}>เปิด Modal เพิ่ม MOU</window.TweakButton>
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
