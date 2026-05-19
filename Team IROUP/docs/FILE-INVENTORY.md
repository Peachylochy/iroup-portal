# IROUP Project — File Inventory & Migration Plan
**Generated: 2026-05-08 | Status: Analysis only — no files modified**

---

## 1. File Classification

### 1.1 Shared Infrastructure (Core)
Files that are already shared across multiple pages or are the new foundation.

| File | Role | Used By | Notes |
|------|------|---------|-------|
| `iroup-theme.css` | ✅ NEW unified design system | (not yet linked) | 131 tokens, 1649 lines, verified balanced |
| `iroup-config.js` | Shared API client | ALL 12 HTML pages | `IROUP.getAll/add/edit/delete/getStats/getReport` |
| `iroup-sidebar.js` | Sidebar patch script | 6 private pages | ⚠️ Uses `!important` overrides — architectural problem |
| `iroup-image-helper.js` | Drive URL utility | 0 pages (not linked) | `iroupImageUrl()`, `iroupPickImage()` — orphaned |
| `iroup-logo.png` | Brand asset | Used inline in pages | — |
| `Globy_IROUP.png` | Brand asset | Used inline in pages | — |

---

### 1.2 Private Dashboard Pages (Dark Mode)
Internal-only pages behind login. All use `iroup-config.js` and `iroup-sidebar.js`.

| File | Size | Inline CSS | Inline JS | External Libs | Sidebar Type |
|------|------|-----------|-----------|---------------|--------------|
| `dashboard.html` | 34 KB | 9.4 KB | 16.6 KB | — | `iroup-sidebar.js` (full) |
| `mobility.html` | 188 KB | 16.7 KB | 24.5 KB | Chart.js | mini (64px) |
| `mou.html` | 192 KB | 17.8 KB | 33.4 KB | Chart.js + D3 + TopoJSON | mini (64px) |
| `report.html` | 28 KB | 5.1 KB | 14.4 KB | Chart.js | `iroup-sidebar.js` (full) |
| `events.html` | 183 KB | 21.6 KB | 18.4 KB | — | mini (64px) |
| `travel.html` | 31 KB | 6.9 KB | 12.2 KB | — | `iroup-sidebar.js` (full) |

---

### 1.3 Login / Auth Page

| File | Size | Notes |
|------|------|-------|
| `index.html` | 133 KB | Google Sign-In SDK, own fetch logic, session management |

---

### 1.4 Public Pages (Light Mode)
No login required. All under `/public/` folder. Use `iroup-config.js` but NOT `iroup-sidebar.js`.

| File | Size | Inline CSS | External Libs |
|------|------|-----------|---------------|
| `public/public-landing.html` | **305 KB** | 19.1 KB | D3 + TopoJSON (world map) |
| `public/public-mou.html` | 31 KB | 10.7 KB | Chart.js + D3 + TopoJSON |
| `public/public-mobility.html` | 37 KB | 10.8 KB | Chart.js + D3 + TopoJSON |
| `public/public-events.html` | 21 KB | 8.1 KB | — |
| `public/public-scholar.html` | 18 KB | 7.2 KB | — |

---

### 1.5 Separate Sub-system: Peach Workload Portfolio
Completely independent SPA. Different architecture, different CSS, different API layer.
**Do not touch this sub-system during Team IROUP refactoring.**

| File | Role |
|------|------|
| `peach-workload-portfolio/frontend/index.html` | SPA shell |
| `peach-workload-portfolio/frontend/css/style.css` | Own CSS system |
| `peach-workload-portfolio/frontend/js/api.js` | Clean IIFE API module |
| `peach-workload-portfolio/frontend/js/app.js` | SPA router + controller |
| `peach-workload-portfolio/frontend/js/pages/dashboard.js` | Dashboard page module |
| `peach-workload-portfolio/frontend/js/pages/all-workloads.js` | Workloads list |
| `peach-workload-portfolio/frontend/js/pages/add-workload.js` | Add/edit form |
| `peach-workload-portfolio/frontend/js/pages/annual-summary.js` | Annual report view |
| `peach-workload-portfolio/frontend/js/pages/categories.js` | Category management |
| `peach-workload-portfolio/frontend/js/pages/evidence.js` | Evidence upload |
| `peach-workload-portfolio/backend/Code.gs` | Google Apps Script API |
| `peach-workload-portfolio/backend/appsscript.json` | GAS config |
| `peach-workload-portfolio/docs/SETUP.md` | Setup guide |
| `peach-workload-portfolio/README.md` | Project readme |

---

### 1.6 Shared CSS Candidates (Does Not Exist Yet)
These files should eventually be created — but not yet.

| Candidate File | What it Would Contain |
|---------------|----------------------|
| `public/public-nav.css` or class in `iroup-theme.css` | Public nav bar (currently copy-pasted in all 5 public pages) |

*`iroup-theme.css` already contains `.ir-pub-nav` — public nav styles are ready, just not linked.*

---

### 1.7 Shared JS Candidates (Does Not Exist Yet)
These utility functions are copy-pasted across multiple HTML files. A future `iroup-utils.js` would centralize them.

| Function | Found In | Description |
|----------|---------|-------------|
| `function esc(s)` | dashboard, report, scholarship-events, travel | HTML-escape for safe rendering |
| `function fmtDate(d)` | dashboard, mobility, report, travel | Date formatting |
| `function toDate(s)` | dashboard, mobility, report, travel | Date parsing |
| `function money(n)` | dashboard, report | Thai currency formatting |
| `function num(n)` | dashboard | Number formatting |
| `function statusMou()` | dashboard, mou, report, travel | MOU status calculation |
| `function statusScholar()` | dashboard, report, scholarship-events | Scholarship status |
| `function statusEvent()` | dashboard, report, scholarship-events | Event status |
| Own `fetchReport()` | dashboard, index, report | Bypasses `iroup-config.js` — reimplements fetch+cache |

---

### 1.8 Duplicated / Problematic Patterns

| Problem | Files Affected | Risk |
|---------|---------------|------|
| Own `:root` CSS block (conflicts with theme) | ALL 12 HTML files | Medium — resolved by link order |
| Duplicate Google Fonts `<link>` (5 different weight sets) | ALL pages | Low — performance waste |
| Own fetch logic bypassing `iroup-config.js` | dashboard, index, report | Medium — cache logic diverges |
| Two competing sidebar systems | dashboard, report, travel vs. mobility, mou, scholarship-events | High — visual inconsistency |
| `iroup-image-helper.js` never linked | — | Low — dead code |
| `travel.html` has all CSS minified to one line | travel | Medium — unmaintainable |
| `public-landing.html` is 305 KB | public-landing | High — needs audit separately |

---

### 1.9 Archive-Only Files
No files are currently archive-only. All files appear to be in active use.

---

## 2. Migration Plan: Linking `iroup-theme.css`

### How linking works safely
Because `iroup-theme.css` defines backward-compat aliases for every old variable name,
linking it **before** each page's own `<style>` block is completely safe:
```html
<!-- Add this ONE line at the top of <head>, before everything else -->
<link rel="stylesheet" href="iroup-theme.css">
<!-- or for public pages: -->
<link rel="stylesheet" href="../iroup-theme.css">
```
The page's own `<style>` block comes after → its `:root` values override the theme → nothing breaks.
The theme only adds value for variables the page hasn't defined locally.

---

### Wave 1 — Link theme first (least inline CSS, lowest risk)
These pages have the smallest inline `<style>` blocks and fewest custom overrides.
**Estimated effort: add 1 line to each file.**

| File | Inline CSS | Why Safe |
|------|-----------|----------|
| `report.html` | 5.1 KB | Smallest private page, Chart.js only |
| `travel.html` | 6.9 KB | No charting library |
| `public-scholar.html` | 7.2 KB | Simple table layout, no D3 |
| `public-events.html` | 8.1 KB | Simple table layout, no D3 |

---

### Wave 2 — Link theme (medium size, check visually)

| File | Inline CSS | Watch For |
|------|-----------|-----------|
| `dashboard.html` | 9.4 KB | Has own `fetchReport` + 5 utility functions |
| `public-mou.html` | 10.7 KB | D3 world map styling may conflict |
| `public-mobility.html` | 10.8 KB | Chart.js + D3 styling |

---

### Wave 3 — Link theme (large, requires care)

| File | Inline CSS | Watch For |
|------|-----------|-----------|
| `mobility.html` | 16.7 KB | Large Chart.js styling — check chart colors |
| `mou.html` | 17.8 KB | D3 map + Chart — most complex private page |
| `public-landing.html` | 19.1 KB | 305 KB total — needs separate audit first |
| `events.html` | 21.6 KB | Largest inline CSS block |

---

### Wave 4 — Last (special cases)

| File | Reason for Last |
|------|----------------|
| `index.html` | Login/auth page — unique layout, Google Sign-In, separate flow |

---

## 3. Inline CSS Removal Plan (Future — Not Now)

After each wave is linked and **visually verified**, the inline CSS can be removed in phases.

**Removal order within each file:**
1. Remove duplicate `:root` variable declarations (token block) — safest, just aliases now
2. Remove duplicate font `<link>` tags — theme already imports Prompt + Sarabun
3. Remove component styles already covered by theme (`.btn`, `.card`, `.panel`, `.status`, `.badge`, `.data-table`) — only after visual check confirms theme styles match
4. Keep page-specific layout rules (chart containers, page-specific grids, custom components)

**Never remove:**
- Chart.js canvas sizing rules
- D3 / TopoJSON map-specific styles
- Page-specific grid layouts not in theme
- Any animation or transition that is unique to a page feature

---

## 4. What Must NOT Be Touched Yet

| Item | Reason |
|------|--------|
| `peach-workload-portfolio/` (entire folder) | Separate system, separate architecture |
| `iroup-config.js` | Working correctly, used by all pages |
| `index.html` | Auth/login flow — separate migration |
| D3 / Chart.js custom styles inside pages | Visual output depends on them — high breakage risk |
| `iroup-sidebar.js` | Still actively used — replace only after `iroup-nav.js` is built |
| `public-landing.html` | 305 KB — needs a dedicated audit before touching |
| Backend `Code.gs` | Not in scope for frontend refactor |

---

## 5. Recommended Next Steps (In Order)

| Step | Action | Risk |
|------|--------|------|
| **Next** | Create `iroup-utils.js` — centralize `esc`, `fmtDate`, `money`, status functions | Low |
| After that | Wave 1: add `<link>` to 4 pages, test visually | Very Low |
| After that | Wave 2: add `<link>` to 3 pages, test visually | Low |
| After that | Create `iroup-nav.js` — replace `iroup-sidebar.js` patch | Medium |
| Later | Wave 3 linking | Medium |
| Much later | Begin inline CSS removal, one page at a time | Medium–High |
| Last | Migrate `public-landing.html` (305 KB audit first) | High |

---

*This document is analysis only. No files were modified to produce it.*
