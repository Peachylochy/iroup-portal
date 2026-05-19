// ============================================================
// iROUP Sidebar FINAL LAYOUT FIX
// อัปทับ iroup-sidebar.js
// - เมนูเหมือนหน้าแรกทุกหน้า
// - ไม่มี "Dashboard เดิม"
// - sidebar เป็น fixed เพื่อไม่ดัน content ลงล่าง
// ============================================================
(function () {
  const current = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
  const ICONS = {
    dashboard:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.5"></rect><rect x="14" y="4" width="6" height="6" rx="1.5"></rect><rect x="4" y="14" width="6" height="6" rx="1.5"></rect><rect x="14" y="14" width="6" height="6" rx="1.5"></rect></svg>',
    mou:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12l3 3a3 3 0 0 0 4 0l3-3"></path><path d="M3 9l4-4 4 4"></path><path d="M21 9l-4-4-4 4"></path><path d="M7 5v8"></path><path d="M17 5v8"></path></svg>',
    globe:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M4 12h16"></path><path d="M12 4a12 12 0 0 1 0 16"></path><path d="M12 4a12 12 0 0 0 0 16"></path></svg>',
    plane:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l18-7-7 18-3-8-8-3z"></path><path d="M11 14l4-4"></path></svg>',
    scholar:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l9-4 9 4-9 4-9-4z"></path><path d="M7 10v5c2 2 8 2 10 0v-5"></path><path d="M21 8v6"></path></svg>',
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 10h16"></path></svg>',
    news:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5z"></path><path d="M8 9h8"></path><path d="M8 13h8"></path><path d="M8 17h5"></path></svg>',
    knowledge:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4z"></path><path d="M5 4v12"></path><path d="M9 8h6"></path><path d="M9 12h6"></path></svg>',
    report:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5"></path><path d="M10 13h6"></path><path d="M10 17h4"></path></svg>',
    public:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M4 12h16"></path><path d="M12 4v16"></path></svg>',
    workspace:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="12" rx="2"></rect><path d="M9 21h6"></path><path d="M12 17v4"></path></svg>',
    portfolio:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2"></rect><path d="M9 7V5h6v2"></path><path d="M4 12h16"></path></svg>'
  };

  const MENU = [
    { section: 'OVERVIEW', items: [
      { icon: 'dashboard', label: 'Executive Dashboard', href: 'dashboard.html', match: ['dashboard.html','dashboard-full.html',''] }
    ]},
    { section: 'MANAGEMENT', items: [
      { icon: 'mou', label: 'MOU', href: 'mou.html', match: ['mou.html'] },
      { icon: 'globe', label: 'Mobility', href: 'mobility.html', match: ['mobility.html'] },
      { icon: 'plane', label: 'การเดินทาง', href: 'travel.html', match: ['travel.html'] },
      { icon: 'scholar', label: 'ทุนการศึกษา', href: 'scholarship.html', match: ['scholarship.html'] },
      { icon: 'calendar', label: 'กิจกรรม', href: 'events.html', match: ['events.html'] },
      { icon: 'news', label: 'ข่าว', href: 'news.html', match: ['news.html'] },
      { icon: 'knowledge', label: 'คลังความรู้', href: 'knowledge.html', match: ['knowledge.html'] },
      { icon: 'report', label: 'รายงาน & Export', href: 'report.html', match: ['report.html'] }
    ]},
    { section: 'PUBLIC', items: [
      { icon: 'public', label: 'Public View', href: 'public/public-landing.html', match: ['public-landing.html'] }
    ]},
    { section: 'ECOSYSTEM', items: [
      { icon: 'workspace', label: 'Workspace', href: '../index.html', match: [] },
      { icon: 'portfolio', label: 'Workload Portfolio', href: '../peach-workload-portfolio/frontend/index.html', match: [] }
    ]}
  ];

  function active(item){ return item.match.includes(current); }

  function html(){
    return `
      <div class="ir-final-brand">
        <img src="assets/iroup-logo.png" alt="iROUP" onerror="this.style.display='none'">
        <div class="ir-final-brand-title"><b>iROUP</b><br>International<br>Relations Office</div>
      </div>
      <nav class="ir-final-nav">
        ${MENU.map(g => `
          <div class="ir-final-section">${g.section}</div>
          ${g.items.map(i => `
            <a class="ir-final-link ${active(i) ? 'active' : ''}" href="${i.href}">
              <span class="ir-final-icon">${ICONS[i.icon] || i.icon}</span>
              <span>${i.label}</span>
            </a>
          `).join('')}
        `).join('')}
      </nav>
      <div class="ir-final-user">
        <div class="ir-final-avatar">IR</div>
        <div>
          <div class="ir-final-user-name">งานวิเทศสัมพันธ์</div>
          <div class="ir-final-user-sub">University of Phayao</div>
        </div>
      </div>
    `;
  }

  function style(){
    if(document.getElementById('iroupSidebarFinalLayoutStyle')) return;
    const s=document.createElement('style');
    s.id='iroupSidebarFinalLayoutStyle';
    s.textContent=`
      #iroupSidebar,.iroup-sidebar,.iroup-shell{display:none!important}
      body{margin-left:0!important;padding-left:0!important}
      .sidebar{
        width:256px!important;min-width:256px!important;max-width:256px!important;
        height:100vh!important;background:rgba(239,246,255,.82)!important;color:#10233f!important;
        border-right:1px solid rgba(230,237,246,.82)!important;display:flex!important;flex-direction:column!important;
        align-items:stretch!important;padding:0!important;gap:0!important;
        position:fixed!important;left:0!important;top:0!important;z-index:99999!important;
        box-shadow:10px 0 34px rgba(15,45,90,.06)!important;font-family:'Prompt',sans-serif!important;overflow:hidden!important;
        backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important;
      }
      .sidebar>*:not(.ir-final-brand):not(.ir-final-nav):not(.ir-final-user){display:none!important}

      .app{display:block!important;min-height:100vh!important}
      .main,.main-layout,.page{
        margin-left:256px!important;
        width:calc(100% - 256px)!important;
        max-width:none!important;
        min-width:0!important;
      }
      .page{padding-left:20px!important;padding-right:20px!important}
      .main .content,.main-layout .content{max-width:none!important}

      .ir-final-brand{min-height:82px;display:flex;align-items:center;gap:12px;padding:18px 18px 14px;border-bottom:0;flex-shrink:0}
      .ir-final-brand img{width:68px;height:auto;object-fit:contain;display:block}
      .ir-final-brand-title{font-size:12px;color:#66758a;line-height:1.25}
      .ir-final-brand-title b{color:#0F2D5A;font-weight:900}
      .ir-final-nav{padding:8px 14px 18px;overflow:auto;flex:1}
      .ir-final-section{font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin:18px 10px 8px;letter-spacing:.12em}
      .ir-final-link{width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;color:#26364e!important;font-weight:800;font-size:14px;cursor:pointer;font-family:'Prompt',sans-serif;transition:.18s;text-decoration:none!important;margin-bottom:4px;background:transparent;border:0}
      .ir-final-link:hover{background:#F1F7FD;color:#1A6DB5!important;transform:translateX(1px)}
      .ir-final-link.active{background:linear-gradient(135deg,rgba(26,109,181,.14),rgba(123,90,232,.12));color:#0f2d5a!important;box-shadow:none}
      .ir-final-icon{font-size:17px;width:34px;height:34px;border-radius:11px;display:inline-grid;place-items:center;text-align:center;flex:0 0 34px;background:#fff;border:1px solid #e6edf6;box-shadow:0 2px 8px rgba(15,45,90,.04)}
      .ir-final-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .ir-final-link.active .ir-final-icon{background:linear-gradient(135deg,#1a6db5,#0f4f8e);color:#fff;border-color:transparent}
      .ir-final-user{margin-top:auto;padding:16px;border-top:1px solid #E6EDF6;display:flex;align-items:center;gap:10px;flex-shrink:0}
      .ir-final-avatar{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#4BBDE8,#1A6DB5);display:grid;place-items:center;color:#fff;font-weight:900}
      .ir-final-user-name{font-size:12px;font-weight:900;color:#10233f}
      .ir-final-user-sub{font-size:11px;color:#66758a}

      @media(max-width:900px){
        .sidebar{position:relative!important;width:100%!important;min-width:100%!important;max-width:100%!important;height:auto!important}
        .main,.main-layout,.page{margin-left:0!important;width:100%!important}
        .ir-final-brand{height:auto;padding:14px 16px}
        .ir-final-nav{display:flex;gap:6px;overflow-x:auto;padding:10px 12px}
        .ir-final-section{display:none}
        .ir-final-link{width:auto;white-space:nowrap;margin-bottom:0}
        .ir-final-user{display:none}
      }
    `;
    document.head.appendChild(s);
  }

  function cleanup(){
    document.querySelectorAll('.iroup-shell').forEach(shell=>{
      const main=shell.querySelector('.iroup-main');
      if(main){ while(main.firstChild) document.body.appendChild(main.firstChild); }
      shell.remove();
    });
    document.querySelectorAll('.iroup-sidebar').forEach(x=>x.remove());
    document.querySelectorAll('a[href="dashboard-full.html"]').forEach(a=>a.href='dashboard.html');
  }

  function mount(){
    style();
    cleanup();
    let sidebar=document.querySelector('.sidebar');
    if(!sidebar){
      sidebar=document.createElement('aside');
      sidebar.className='sidebar';
      document.body.insertBefore(sidebar, document.body.firstChild);
    }
    sidebar.innerHTML=html();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount);
  else mount();
})();
