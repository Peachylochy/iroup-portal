# IROUP Project — Migration State
**Last updated: 2026-05-09 | Session: Login Experience Redesign — v1 Concept (split-layout, SaaS-inspired)**

> Living document. Update after every migration session.
> Source of truth for what is done, what is safe to do next, and what must not be touched.
>
> Core principle: **Stabilize → Modularize → Optimize → Expand**

---

## 0. UI Polish Log

### Session: 2026-05-09 — Readability & Contrast Pass + Login Page Improvement

**Phase goal:** CSS/UI polish only. No API changes, no JS refactor, no layout rewrites. All changes incremental and reversible.

#### `iroup-theme.css` — Contrast token fix (propagates to all pages automatically)

| Token | Before | After | Reason |
|-------|--------|-------|--------|
| `--ir-text-muted` (dark mode `:root`) | `#4a6880` (~2:1 contrast) | `#607a9a` (~3.5:1 contrast) | WCAG AA fail on dark `#07101f` bg |
| `--ir-text-muted` (light mode `[data-theme="light"]`) | `#94a3b8` (~2.3:1 contrast) | `#7a8fa8` | Better legibility on white bg |

Downstream tokens automatically improved: `.ir-label`, `.ir-input::placeholder`, `.ir-table th`, `.ir-badge--expired`, `.ir-kpi__sub`, `.ir-sidebar__user-sub`, `.ir-nav-section`, `.ir-footer-note`, `.ir-empty`.

#### `index.html` — Login page polish (9 targeted CSS changes)

| Change | Before | After |
|--------|--------|-------|
| Body background palette | blue-green-yellow gradient | blue-purple-blue (`#E8F0FC → #EDE8FA → #E8F4FD`) |
| Orb 2 colour | green `rgba(91,173,62,0.1)` | purple `rgba(124,58,237,0.12)` |
| Orb 3 colour | gold `rgba(245,166,35,0.08)` | blue `rgba(26,109,181,0.10)` |
| Card bg opacity | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.92)` |
| Card border | white-glass | blue-tinted glass `rgba(75,189,232,0.28)` |
| Card shadow | `0 20px 60px rgba(15,45,90,0.12)` | `0 24px 72px rgba(15,45,90,0.18)` |
| Globy mascot | `width:100px; opacity:0.15` (invisible) | `width:120px; opacity:0.55` (visible brand element) |
| Logo icon gradient | blue → blue (flat) | blue → purple `#5A32D0` (premium) |
| Google button weight | `font-weight:600` | `font-weight:700` |

**Visual direction:** soft blue/purple palette, glassmorphism card, mascot-assisted branding, professional university feel.

**Pending:** Visual verification in browser (user's responsibility before next index.html change).

---

### Session: 2026-05-09 — Login Experience Redesign (v1 Concept)

**Phase goal:** Elevate `index.html` from a polished single-card login into a premium split-layout experience. CSS/layout exploration only. No JS, no API, no auth flow changes.

**Why this phase started now:**
The previous readability pass (contrast fix + palette alignment) produced a cleaner card but revealed a structural ceiling — a centered single-card layout cannot communicate the platform's identity or scale regardless of how well the CSS is tuned. The mascot (Globy) and brand assets were present but underused. The login page is the first impression for all users; the gap between its appearance and the dashboard's quality became the clear next design priority.

#### Design direction — v1 Concept (tentatively approved)

| Dimension | Direction |
|-----------|-----------|
| Layout | Split-panel: left brand panel + right login form panel |
| Aesthetic | Premium SaaS-inspired university platform feel |
| Colour palette | Soft blue/purple gradient — consistent with previous session's palette shift |
| Depth technique | Subtle glassmorphism on form card; layered orb/blur effects on brand panel |
| Visual motif | International/global: globe, connectivity, network — aligned with IR Office identity |
| Mascot role | Globy promoted from background decoration to active brand element on left panel |
| Typography hierarchy | Stronger size contrast between headline, subtitle, and form labels |
| Enterprise signal | Cleaner spacing, reduced noise, intentional whitespace |

#### Emerging design language (v1 tokens)

```
Brand panel:   deep blue → purple gradient (#0F2D5A → #2D1B69 or similar)
Form side:     white/near-white, high contrast, clean
Accent:        blue-purple range (#4B8FD4, #5A32D0)
Glassmorphism: rgba(255,255,255,0.12–0.18) + blur(16–24px) on panel elements
Shadow:        0 24px 72px rgba(15,45,90,0.18) — same depth scale as previous session
```

**Design exploration method:** Claude Design (AI-assisted layout exploration) used to generate and evaluate composition candidates. v1 selected as the working direction.

**Status:** v1 concept approved. Implementation in `index.html` is the next step.
**Constraint:** All changes remain CSS/layout only — auth flow, Google Sign-In SDK, session logic are untouched.

---

## 1. Migration Checklist

### 1.1 Infrastructure

| Asset | Status | Notes |
|-------|--------|-------|
| `iroup-theme.css` | ✅ Done | 131 CSS custom-property tokens. Backward-compat aliases for all old variable names. |
| `iroup-utils.js` | ✅ Done | v1.0. IIFE exposing `IU` namespace. Replaces copy-pasted helpers across all pages. |
| Git repository | ✅ Done | Local git repo + GitHub. |

---

### 1.2 Per-Page Migration Status

Legend: `[✓]` fully migrated · `[~]` partial / stabilized · `[ ]` pending

| File | Status | Utils Loaded | Call Sites | Local Stubs | Notes |
|------|--------|-------------|-----------|-------------|-------|
| `report.html` | `[✓]` migrated | ✅ | ✅ Full (all IU.*) | ✅ Replaced with comments | Complete. Reference implementation. |
| `travel.html` | `[~]` partial | ✅ | ✅ Full (all IU.*) | ⏳ Kept — verify visually before removing | Call sites done; stubs pending cleanup commit. |
| `dashboard.html` | `[~]` partial | ✅ | ✅ Full (46 IU.* calls) | ⏳ Kept — verify visually before removing | Migrated 2026-05-09. Stubs have TODO markers. |
| `scholarship-events.html` | `[~]` partial | ✅ | ⚠️ Stabilized only — `IU.toDate` at 3 sites; `esc`/`IROUP.formatDate` not yet migrated | ✅ Local `esc` kept + TODO marker | Crash fix: `IROUP.parseDate` → `IU.toDate`. Full IU migration is a future step. |
| `mou.html` | `[ ]` pending | ❌ | ❌ | N/A — `htmlSafe()` local, TODO marked | Uses `IROUP.getMouStatus()` and local `htmlSafe()`. Migration planned. |
| `mobility.html` | `[ ]` pending | ❌ | ❌ | N/A — `r9e()` + `formatDate()` local, TODO marked | Uses `r9e()` (esc) and local `formatDate()`. Migration planned. |
| `index.html` | `[ ]` deferred | ❌ | ❌ | ❌ | Auth/login page — v1 layout concept approved. CSS/layout implementation next. JS/auth untouched. |
| `public/public-scholar.html` | `[ ]` pending | ❌ | ❌ | ❌ | Small page, good next target. |
| `public/public-events.html` | `[ ]` pending | ❌ | ❌ | ❌ | Small page, good next target. |
| `public/public-mou.html` | `[ ]` pending | ❌ | ❌ | ❌ | Has D3 — check carefully. |
| `public/public-mobility.html` | `[ ]` pending | ❌ | ❌ | ❌ | Has Chart.js + D3. |
| `public/public-landing.html` | `[ ]` deferred | ❌ | ❌ | ❌ | 305 KB — needs dedicated audit first. Theme not yet linked. |

---

### 1.3 Theme Linking (`iroup-theme.css`)

| File | Theme Linked |
|------|-------------|
| `dashboard.html` | ✅ |
| `mobility.html` | ✅ |
| `mou.html` | ✅ |
| `report.html` | ✅ |
| `scholarship-events.html` | ✅ |
| `travel.html` | ✅ |
| `index.html` | ✅ |
| `public/public-events.html` | ✅ |
| `public/public-mou.html` | ✅ |
| `public/public-mobility.html` | ✅ |
| `public/public-scholar.html` | ✅ |
| `public/public-landing.html` | ⏸ Deferred |

---

## 2. `IU` Namespace — Available Functions

Categorized for planning purposes. No restructuring needed — this is documentation only.

### Formatting utilities
```
IU.esc(v)                   HTML-safe escaping (& < > ' ")
IU.num(v)                   Number with Thai locale separators: 12,500
IU.money(v)                 Currency with Thai locale separators: 150,000
                            ⚠️  Does NOT append ' บาท' — use IU.money(x)+' บาท' where suffix needed
```

### Date utilities
```
IU.toDate(v)                Date parsing — ISO, Thai dd/mm/yyyy, Buddhist Era (BE → CE), native fallback
IU.fmtDate(v)               Short Thai date: "10 ม.ค. 68"   (2-digit year)
IU.fmtDateFull(v)           Long Thai date: "10 มกราคม 2568" (4-digit year)
```

### Aggregation utilities
```
IU.group(arr)               Count occurrences: ['A','B','A'] → { A: 2, B: 1 }
IU.sum(rows, key)           Sum a numeric field across row objects (strips commas)
```

### Render helpers / status calculators
```
IU.statusMou(row)           → 'active' | 'soon' | 'expired'      (reads 'วันสิ้นสุด')
IU.statusScholar(row)       → 'upcoming' | 'active' | 'soon' | 'urgent' | 'expired'
IU.statusEvent(row)         → 'upcoming' | 'active' | 'expired'  (reads 'วันเริ่ม', 'วันสิ้นสุด')
```

Load order in `<head>`: `iroup-config.js` → `iroup-utils.js` → `<style>`

---

## 3. Migration Markers Added This Session

Lightweight `// TODO: migrate to IU.*` comments added (no code changed) to:

| File | Location | What to migrate |
|------|----------|----------------|
| `dashboard.html` | Line ~158 | `esc`, `num`, `money`, `toDate`, `fmtDate` local stubs → remove after visual check |
| `dashboard.html` | Line ~287 | `group`, `sum` local stubs → remove; `uniqueCount` stays (local wrapper) |
| `scholarship-events.html` | Line ~730 | `esc` → `IU.esc`; `IROUP.formatDate` call sites → `IU.fmtDate` |
| `mou.html` | Line ~567 | `htmlSafe` → `IU.esc`; `IROUP.getMouStatus` → `IU.statusMou`; add `iroup-utils.js` |
| `mobility.html` | Line ~699 | `formatDate` → `IU.fmtDate`; add `iroup-utils.js` |
| `mobility.html` | Line ~813 | `r9e` → `IU.esc` |

---

## 4. Current Architecture State

### Script load order (correct pattern — as in `report.html`, `travel.html`, `dashboard.html`)
```html
<head>
  <link rel="stylesheet" href="iroup-theme.css">   <!-- 1. shared design tokens -->
  <script src="iroup-config.js"></script>            <!-- 2. API client (IROUP.*) -->
  <script src="iroup-utils.js"></script>             <!-- 3. shared utilities (IU.*) -->
  <style>/* page-specific overrides */</style>       <!-- 4. inline page CSS -->
</head>
...
<script src="iroup-sidebar.js"></script>             <!-- last, before </body> -->
```

### Sidebar systems (two competing — not yet resolved)
| Sidebar Type | Pages | Status |
|---|---|---|
| `iroup-sidebar.js` injected (full 220px) | `dashboard.html`, `report.html`, `travel.html` | Active — do not touch |
| Mini inline sidebar (64px icon strip) | `mobility.html`, `mou.html`, `scholarship-events.html` | Active — do not touch |
| No sidebar | All `/public/` pages | By design |

`iroup-sidebar.js` uses `!important` overrides — architectural problem, but replacement (`iroup-nav.js`) not built yet. Protected.

### API client (`iroup-config.js`)
Exposes `IROUP.getAll()`, `IROUP.add()`, `IROUP.edit()`, `IROUP.delete()`, `IROUP.getStats()`, `IROUP.getReport()`, `IROUP.getMouStatus()`, `IROUP.formatDate()`, `IROUP.SHEETS`, `IROUP.SCRIPT_URL`. Used by all 12 HTML pages. Do not modify.

Note: `IROUP.parseDate()` does NOT exist — use `IU.toDate()` instead.

---

## 5. Protected / Deferred Files

| File / Folder | Reason |
|---|---|
| `peach-workload-portfolio/` | Separate SPA — different architecture, different CSS, different API. Out of scope. |
| `iroup-config.js` | Working correctly, used by all pages. Any change breaks everything. |
| `iroup-sidebar.js` | Still actively used. Replace only after `iroup-nav.js` is designed and tested. |
| `index.html` | Login/auth page. Google Sign-In flow, own session management. Migrate last. |
| `public/public-landing.html` | 305 KB — needs a dedicated audit. Theme not yet linked. |
| `iroup-image-helper.js` | Orphaned (not linked anywhere) — leave as-is. |
| D3 / Chart.js styles inside pages | Visual output depends on them. High breakage risk. |
| Backend `Code.gs` | Out of scope for frontend refactor. |

---

## 6. Current Technical Debt

| Problem | Files Affected | Risk | Priority |
|---------|---------------|------|----------|
| Local utility stubs pending removal | `dashboard.html`, `travel.html` | Low — stubs are inert, call sites already on IU.* | Next cleanup pass |
| Partial IU migration | `scholarship-events.html` | Medium — esc/formatDate still local | Next migration session |
| No IU loaded at all | `mou.html`, `mobility.html`, 4× public pages | Medium — divergence as IU.* evolves | Upcoming sessions |
| Two competing sidebar systems | All private pages | High — visual inconsistency | Blocked on `iroup-nav.js` |
| Inline CSS in every page | All pages | Medium | Low — after IU migration complete |
| `IROUP.parseDate` called but missing | Fixed in `scholarship-events.html` | ✅ Resolved | — |
| `--ir-text-muted` contrast fail (dark + light) | All pages using theme tokens | ✅ Resolved — token raised in `iroup-theme.css` | — |
| Duplicate Google Fonts `<link>` tags | All pages | Low — performance only | Low |

---

## 7. Safe Next Steps (In Order)

### Immediate
1. **Visual verification** — open `index.html` (login page) in browser to confirm UI polish renders correctly.
2. **Visual verification** — open `dashboard.html` and `travel.html` to confirm IU migration rendering is correct.
3. **Stub removal** — once verified, remove local stubs from `travel.html` (committed separately from call-site migration per git workflow).
4. **Consistency check** — scan `dashboard.html`, `report.html`, `travel.html`, `scholarship-events.html` for any inline CSS overriding `--ir-text-muted` that may need a matching manual fix.
5. **Login redesign implementation** — implement v1 split-layout concept in `index.html` (CSS/layout only; auth flow untouched).

### Next migration targets (in order of simplicity)
1. `public/public-scholar.html` — small, no charting, good warm-up
2. `public/public-events.html` — small, no charting
3. `scholarship-events.html` full pass — migrate remaining `esc`/`IROUP.formatDate` call sites to IU.*
4. `public/public-mou.html` — has D3, check carefully
5. `public/public-mobility.html` — Chart.js + D3
6. `mobility.html` — large Chart.js page
7. `mou.html` — most complex (D3 map + Chart.js + `IROUP.getMouStatus`)

### Later (separate sessions)
- Build `iroup-nav.js` to replace competing sidebar systems
- Remove inline CSS blocks one page at a time (only after IU migration complete)
- Audit and link theme to `public-landing.html`
- Migrate `index.html` last

---

## 8. Git Workflow

```bash
# Checkpoint before any edit session
git add -A && git commit -m "checkpoint: before <page> migration"

# After call-site migration (keep stubs)
git add Team\ IROUP/<page>.html
git commit -m "migrate <page>.html: add iroup-utils.js, switch call sites to IU.*"

# After stub removal (separate commit)
git add Team\ IROUP/<page>.html
git commit -m "cleanup <page>.html: remove local utility stubs now covered by IU.*"
```

Commits made across sessions:
- `iroup-utils.js` creation
- `report.html` full migration (call sites + stub comments)
- `travel.html` migration (call sites switched; local stubs kept pending visual verification)
- `dashboard.html` migration (call sites switched; local stubs + TODO markers kept)
- `scholarship-events.html` stabilization (iroup-utils.js added; `IROUP.parseDate` → `IU.toDate`)
- Migration markers added to `mou.html`, `mobility.html`
- Git + GitHub initial setup

---

*This document covers the Team IROUP frontend only. `peach-workload-portfolio/` is a separate system not tracked here.*

---

## 9. Login Polish Pass - Motion (2026-05-09)

- `index.html` received a CSS-only subtle motion polish pass.
- Google auth logic, sessionStorage, redirect flow, and HTML structure were not modified.
- Motion changes were limited to login card entrance, Google button hover/active response, public link hover/active response, and reduced-motion safeguards.
- `prefers-reduced-motion: reduce` continues to disable login animations and interactive transforms.
- Mascot positioning and text colors were intentionally left unchanged.

## 10. Login Polish Pass - Mascot Positioning (2026-05-09)

- `index.html` received a CSS-only Globy mascot placement pass using the existing `Globy_IROUP.png` asset.
- The mascot is rendered as a decorative `.brand::after` layer, so no HTML structure or auth logic changed.
- Desktop placement keeps Globy low and subtle inside the brand panel, behind primary brand content.
- Tablet sizing and opacity are reduced at `max-width:1080px`.
- The mascot layer is hidden at `max-width:880px` to preserve the collapsed/mobile login layout and avoid overlap with controls.
- Text colors, Google auth logic, sessionStorage, and redirect flow remain unchanged.

## 11. Ecosystem Readability / Contrast Pass - Start (2026-05-09)

- Began a non-redesign readability pass with `iroup-theme.css` and `dashboard.html`.
- Strengthened secondary and muted slate text tokens while preserving the soft premium palette.
- Slightly firmed light-mode borders and shadows to reduce the washed-out card/table feel.
- Improved shared table header readability, hero/topbar supporting text, labels, and KPI/panel supporting copy.
- Mirrored key readability values in `dashboard.html` because its inline CSS currently overrides shared theme tokens.
- No JavaScript, auth, sessionStorage, redirect flow, spacing system, or layout structure changes were made.

## 12. Readability / Contrast Pass - Selects and Report Tables (2026-05-09)

- Continued the focused readability pass with `iroup-theme.css` and `report.html`.
- Improved shared select/dropdown selected-value, option, placeholder, and label readability without changing control sizing or layout.
- Mirrored select readability values in `report.html` because its inline CSS overrides shared form-control styles.
- Improved report/export table readability by strengthening header color, base cell color, and muted supporting columns.
- Preserved the existing palette, responsive behavior, spacing, and report/export JavaScript.

## 13. Ecosystem Navigation Foundation (2026-05-09)

- Added lightweight cross-module navigation awareness between Team IROUP and `peach-workload-portfolio/frontend`.
- Team IROUP private sidebar now includes an `ECOSYSTEM` section with links back to the root workspace portal and across to PEACH Workload Portfolio.
- PEACH Workload Portfolio sidebar now includes matching ecosystem links back to the root workspace portal and across to Team IROUP.
- Links remain relative for GitHub Pages compatibility.
- Auth, sessionStorage, redirect logic, dashboard routing, and module internals were not refactored.

## 14. Light Theme Contrast Stabilization - Continued (2026-05-09)

- Continued the CSS-first light-mode readability pass across `travel.html`, `dashboard.html`, `report.html`, `mobility.html`, and `scholarship-events.html`.
- Strengthened shared light theme secondary/muted text tokens and placeholder coverage in `iroup-theme.css`.
- Improved global table body readability and expired/gray badge label contrast without changing table structure.
- Stabilized older page-local gray scales and inline theme variables where those pages bypass shared tokens.
- Improved placeholder, helper, KPI support, empty/loading, metadata, and subdued badge text contrast while preserving layout and spacing.
- No JavaScript, auth/session/redirect logic, Apps Script/API logic, routing, or module architecture changes were made.

## 15. Final Light Theme Readability Stabilization Pass (2026-05-09)

- Final light-theme readability stabilization pass for MOU/report/travel/mobility minor contrast issues.
- Added page-local CSS override blocks only, preserving existing layout, spacing, JavaScript, auth/session/API logic, routing, and GitHub Pages compatibility.
- Strengthened remaining pale MOU placeholders, KPI subtext, file-empty text, row indexes, and empty/no-result text.
- Strengthened report table columns 3-7 and select display text.
- Darkened the travel completed badge and optional mobility row-index text.
