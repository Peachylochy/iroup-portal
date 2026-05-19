# IROUP Design System
**Version: 1.0 | Date: 2026-05-17**

> ใช้ไฟล์นี้เป็น spec สำหรับ UI Redesign pass
> เปิด conversation ใหม่ + upload ไฟล์นี้ แล้วบอกว่า "ทำ UI Redesign"

---

## Architecture

```
Team IROUP/
  css/
    iroup-theme.css     ← มีอยู่แล้ว (อย่าแตะ)
    iroup-design.css    ← สร้างใหม่ (design system)
  js/
    iroup-theme.js      ← สร้างใหม่ (dark mode toggle)
```

---

## Design Direction

- **Style:** iOS Liquid Glass — clean, airy, soft gradient
- **Font:** Prompt (Google Fonts — มีอยู่แล้ว)
- **Background:** gradient ม่วง-ฟ้าอ่อน (เหมือน index.html)
- **Dark Mode:** toggle ได้ บันทึกใน localStorage
- **Language:** TH/EN toggle (public pages)

---

## Color Palette

```css
:root {
  /* Brand */
  --ir-primary:       #1A6DB5;
  --ir-primary-light: #4BBDE8;
  --ir-navy:          #0F2D5A;

  /* Background */
  --ir-bg-gradient: linear-gradient(135deg, #EEF2FF, #E8F4FD, #F5E8FF);
  --ir-bg-card:     #FFFFFF;
  --ir-bg-input:    #F5F8FC;
  --ir-bg-page:     #F8FAFF;

  /* Text */
  --ir-text-heading: #0F2D5A;
  --ir-text-body:    #26364E;
  --ir-text-muted:   #6B7F96;

  /* Border */
  --ir-border:       #E6EDF6;
  --ir-border-focus: #1A6DB5;

  /* Status */
  --ir-success: #15803D;
  --ir-warning: #B7791F;
  --ir-danger:  #C2410C;
}
```

---

## Dark Mode

```css
[data-theme="dark"] {
  --ir-bg-gradient: linear-gradient(135deg, #0F0F1A, #1A1A2E, #16213E);
  --ir-bg-card:     #1E2A3A;
  --ir-bg-input:    #253447;
  --ir-bg-page:     #0F1923;
  --ir-text-heading: #F0F6FF;
  --ir-text-body:    #B8C8DC;
  --ir-text-muted:   #6B8099;
  --ir-border:       #2A3A4E;
}
```

---

## Typography

```css
/* Font */
font-family: 'Prompt', sans-serif;

/* Size */
--ir-font-xs:   12px;
--ir-font-sm:   14px;
--ir-font-base: 16px;
--ir-font-lg:   18px;
--ir-font-xl:   24px;
--ir-font-2xl:  32px;
--ir-font-3xl:  48px;

/* Weight */
--ir-weight-regular: 400;
--ir-weight-medium:  500;
--ir-weight-bold:    700;
--ir-weight-black:   900;
```

---

## Border Radius

```css
--ir-radius-sm:   8px;    /* badge, tag */
--ir-radius-md:   12px;   /* button, input */
--ir-radius-lg:   18px;   /* card */
--ir-radius-xl:   22px;   /* modal, panel */
--ir-radius-full: 999px;  /* pill */
```

---

## Shadows

```css
--ir-shadow-sm: 0 2px 8px rgba(15,45,90,0.06);
--ir-shadow-md: 0 8px 24px rgba(15,45,90,0.10);
--ir-shadow-lg: 0 16px 48px rgba(15,45,90,0.14);
```

---

## Components

### Card
```css
.ir-card {
  background: var(--ir-bg-card);
  border: 1px solid var(--ir-border);
  border-radius: var(--ir-radius-lg);
  box-shadow: var(--ir-shadow-md);
  padding: 24px;
}
```

### Input / Select / Textarea
```css
.ir-input,
.ir-select,
.ir-textarea {
  background: var(--ir-bg-input);
  border: 1px solid var(--ir-border);
  border-radius: var(--ir-radius-md);
  padding: 12px 16px;
  font-family: 'Prompt', sans-serif;
  font-size: var(--ir-font-base);
  color: var(--ir-text-body);
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ir-input:focus,
.ir-select:focus,
.ir-textarea:focus {
  border-color: var(--ir-border-focus);
  outline: none;
  box-shadow: 0 0 0 3px rgba(26,109,181,0.15);
}
```

### Buttons
```css
.ir-btn {
  border-radius: var(--ir-radius-md);
  padding: 12px 24px;
  font-family: 'Prompt', sans-serif;
  font-weight: var(--ir-weight-bold);
  font-size: var(--ir-font-sm);
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.ir-btn-primary {
  background: var(--ir-primary);
  color: #fff;
}
.ir-btn-primary:hover {
  background: var(--ir-navy);
}
.ir-btn-ghost {
  background: transparent;
  color: var(--ir-text-body);
  border: 1px solid var(--ir-border);
}
.ir-btn-ghost:hover {
  background: var(--ir-bg-input);
}
.ir-btn-danger {
  background: transparent;
  color: var(--ir-danger);
  border: 1px solid #FFC9C4;
}
```

### Modal
```css
.ir-modal {
  position: fixed;
  inset: 0;
  background: rgba(9,24,45,0.56);
  z-index: 100000;
  display: none;
  align-items: flex-start;
  justify-content: center;
  padding: 26px;
  overflow: auto;
}
.ir-modal.open {
  display: flex;
}
.ir-modal-panel {
  background: var(--ir-bg-card);
  border-radius: var(--ir-radius-xl);
  box-shadow: var(--ir-shadow-lg);
  max-width: 1120px;
  width: 100%;
  overflow: hidden;
}
.ir-modal-head {
  padding: 22px 24px;
  border-bottom: 1px solid var(--ir-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.ir-modal-body {
  padding: 22px;
  max-height: calc(100vh - 210px);
  overflow: auto;
}
.ir-modal-foot {
  position: sticky;
  bottom: 0;
  background: var(--ir-bg-card);
  border-top: 1px solid var(--ir-border);
  padding: 16px 22px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
```

### Badge
```css
.ir-badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--ir-radius-full);
  padding: 4px 10px;
  font-size: var(--ir-font-xs);
  font-weight: var(--ir-weight-bold);
}
.ir-badge-blue   { background: #EDF5FF; color: #075985; }
.ir-badge-green  { background: #EAF8EE; color: #15803D; }
.ir-badge-red    { background: #FFF1F0; color: #B42318; }
.ir-badge-warn   { background: #FFF7ED; color: #9A3412; }
.ir-badge-gray   { background: #F7F7F8; color: #596579; }
```

### KPI Card
```css
.ir-kpi {
  background: var(--ir-bg-card);
  border: 1px solid var(--ir-border);
  border-radius: var(--ir-radius-lg);
  padding: 20px 24px;
  box-shadow: var(--ir-shadow-sm);
}
.ir-kpi-value {
  font-size: var(--ir-font-2xl);
  font-weight: var(--ir-weight-black);
  color: var(--ir-navy);
  line-height: 1;
}
.ir-kpi-label {
  font-size: var(--ir-font-sm);
  color: var(--ir-text-muted);
  font-weight: var(--ir-weight-medium);
  margin-top: 8px;
}
```

---

## Dark Mode Toggle (JS)

```javascript
// css/iroup-theme.js

// Auto-load saved preference on page load
(function() {
  const saved = localStorage.getItem('iroup-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

function irToggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('iroup-theme', next);
}
```

**Toggle Button HTML:**
```html
<button onclick="irToggleTheme()" class="ir-theme-toggle">
  <span class="icon-light">☀️</span>
  <span class="icon-dark">🌙</span>
</button>
```

---

## Migration Plan

### Step 1 — สร้างไฟล์ใหม่
- สร้าง `Team IROUP/css/iroup-design.css`
- สร้าง `Team IROUP/js/iroup-theme.js`

### Step 2 — Link ใน HTML ทุกหน้า
```html
<link rel="stylesheet" href="css/iroup-design.css">
<script src="js/iroup-theme.js"></script>
```

### Step 3 — เปลี่ยน class
| Class เดิม | Class ใหม่ |
|-----------|-----------|
| `.input` | `.ir-input` |
| `.select` | `.ir-select` |
| `.textarea` | `.ir-textarea` |
| `.btn` | `.ir-btn` |
| `.btn.primary` | `.ir-btn-primary` |
| `.btn.danger` | `.ir-btn-danger` |
| `.modal-panel` | `.ir-modal-panel` |
| `.kpi` | `.ir-kpi` |
| `.badge` | `.ir-badge` |

### Step 4 — ลบ inline CSS ที่ซ้ำ
ลบ CSS rules ที่ define ซ้ำใน `<style>` ของแต่ละหน้าออก

### Step 5 — Test
- light mode ✓
- dark mode ✓
- responsive ✓
- modal overlay ✓

---

## Pages ที่ต้อง migrate

### Admin Pages (7 หน้า)
- [ ] events.html
- [ ] scholarship.html
- [ ] mou.html
- [ ] mobility.html
- [ ] travel.html
- [ ] news.html
- [ ] knowledge.html

### Public Pages (ทำใหม่ได้เลย — ใช้ ir-* class ตั้งแต่ต้น)
- [ ] public-news.html
- [ ] public-knowledge.html

### Other
- [ ] index.html
- [ ] dashboard.html

---

## Public Page Extra Spec

Public pages ควรมีเพิ่มจาก admin:

```css
/* Hero Section */
.ir-hero {
  background: var(--ir-bg-gradient);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

/* Hero Headline */
.ir-hero-title {
  font-size: var(--ir-font-3xl);
  font-weight: var(--ir-weight-black);
  color: var(--ir-text-heading);
  line-height: 1.2;
}

/* Language Toggle */
.ir-lang-toggle {
  display: flex;
  gap: 4px;
  background: var(--ir-bg-input);
  border-radius: var(--ir-radius-full);
  padding: 4px;
}
.ir-lang-btn {
  border-radius: var(--ir-radius-full);
  padding: 6px 16px;
  font-weight: var(--ir-weight-bold);
  border: none;
  cursor: pointer;
}
.ir-lang-btn.active {
  background: var(--ir-primary);
  color: #fff;
}
```

---

*Created: 2026-05-17*

---

## Implementation Addendum - Public Redesign Stabilization (2026-05-18)

Current stabilized public redesign state:

- `public-landing.html` is the active cinematic V2 public landing page.
- `public-mou.html` has been redesigned with live V2 public MOU data, D3/TopoJSON,
  Chart.js, redesigned filters/table, light/dark support, and new MOU hero assets.
- `public-mobility.html` has been redesigned as a compact dashboard-first public
  page with live V2 Mobility/Travel data, charts, map, cards, timeline, and
  pagination.
- Mobility TH/EN switching uses `localStorage.iroup_public_lang`.
- Public theme persistence uses `localStorage.iroup_public_theme` where active.

Updated UX rule:

- For data-heavy public pages, prefer compact dashboard-first layouts over oversized
  hero-first pages.
- Large cinematic hero treatment is appropriate for the public landing page and
  selected narrative pages, but analytics-heavy pages should expose filters, KPIs,
  charts, maps, and lists quickly.

Migration rule:

- Start the Design System migration incrementally with `Team IROUP/css/iroup-design.css`
  and `Team IROUP/js/iroup-theme.js`.
- Add `ir-*` classes CSS-first and keep each page reversible.
- Do not refactor V2 adapters, backend routes, OAuth/session behavior, or DTO
  boundaries during UI migration.
- Preserve D3 and Chart.js behavior when migrating public MOU and Mobility styling.

---

## Implementation Addendum - News/Knowledge Public Pattern (2026-05-18)

Completed public list/detail pattern:

- `public-news.html`
- `public-news-detail.html`
- `public-knowledge.html`
- `public-knowledge-detail.html`

Pattern now considered stable for content-style public modules:

- dark/light mode persisted with `localStorage.iroup_public_theme`
- TH/EN persisted with `localStorage.iroup_public_lang`
- unified public nav order:
  ข่าวสาร, คลังความรู้, ทุนการศึกษา, กิจกรรม, MOU, Mobility
- dark/light hero graphics per module
- live V2 public route as the only data source
- search and filter controls
- glass/card-based list presentation
- detail pages for full content
- media/action panel on detail pages
- image gallery support where records include public image files
- pagination for long public lists when useful

NEWS-specific pattern:

- List page links to `public-news-detail.html?id=...`.
- Detail page renders cover, badges, content, action panel, and additional image
  gallery.
- Old list-page modal/gallery behavior should not be the primary reading flow.

Knowledge-specific pattern:

- List page links to `public-knowledge-detail.html?id=...`.
- Detail page renders cover, content, PDF/video/link actions, and image gallery.
- Knowledge cards and detail hero should prefer dedicated cover images when present.

Next UI migration target:

- `public-scholar.html` should reuse this content-module pattern, adjusted for
  deadline, level, country, application status, and urgency badge behavior.

---

## Implementation Addendum - Scholarship Public Pattern (2026-05-19)

Completed public opportunity pattern:

- `public-scholar.html`

Scholarship page pattern:

- dark/light hero graphics:
  - `scholarship-hero-dark.webp`
  - `scholarship-hero-light.webp`
- live V2 public route only: `IROUP_V2.public.scholarshipList()`
- shared public state keys:
  - `iroup_public_theme`
  - `iroup_public_lang`
- unified public nav order
- hero KPI summary
- search, country, level/target, and status filters
- separate open-now and all-scholarship sections
- cards with cover/poster preview, status, type/funding/target tags, summary,
  apply/file actions, deadline, and days-left indicator

Next UI migration target:

- `public-events.html`, adapted for calendar/timeline/event status behavior.

---

## Implementation Addendum - Scholarship Detail Content Pattern (2026-05-19)

Scholarship is now treated as a content-style public system with list/detail flow:

- `public-scholar.html`
- `public-scholar-detail.html`

Design pattern for the future detail page:

- Reuse the Scholarship hero asset family for both dark and light mode.
- Keep dark/light mode persisted with `iroup_public_theme`.
- Keep TH/EN persisted with `iroup_public_lang`.
- Use the same unified public nav order as NEWS, Knowledge, and Scholarship list.
- Render scholarship metadata as compact opportunity facts: country, institution,
  funding type, target group, status, apply deadline, and days-left where available.
- Render `content_th` / `content_en` as the main article-style body so Peach can paste
  full scholarship descriptions without splitting every section into separate fields.
- Keep action panels for application link, detail link, and public file downloads.
- Cards on `public-scholar.html` should eventually navigate to
  `public-scholar-detail.html?id=...` when the detail page is added.

Admin/data-entry implication:

- Scholarship admin needs article body textareas for `content_th` and `content_en`.
- Existing structured fields should remain because they power filters, tags, cards,
  and deadline behavior.

*Use with: Cowork / Codex — "ทำ UI Redesign ตาม IROUP-DESIGN-SYSTEM.md"*
