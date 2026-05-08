# IROUP Project — Migration State
**Last updated: 2026-05-08 | Session: iroup-utils.js creation + report/travel migration**

> Living document. Update after every migration session.
> Source of truth for what is done, what is safe to do next, and what must not be touched.

---

## 1. Completed Migrations

### 1.1 Infrastructure Created

| Asset | Status | Notes |
|-------|--------|-------|
| `iroup-theme.css` | ✅ Done | 131 CSS custom-property tokens, 1649 lines. Backward-compat aliases for all old variable names. |
| `iroup-utils.js` | ✅ Done | v1.0. IIFE exposing `IU` namespace. Replaces copy-pasted helpers across all pages. |
| Git repository | ✅ Done | Local git repo initialised, connected to GitHub. |

### 1.2 Theme Linking (`iroup-theme.css`)

All private pages and most public pages have `iroup-theme.css` linked as the first stylesheet.

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
| `public/public-landing.html` | ⏸ Deferred (305 KB — needs separate audit first) |

### 1.3 Utility Adoption (`iroup-utils.js` / `IU.*`)

Full migration = `iroup-utils.js` loaded + all call sites use `IU.*` + local stubs can be removed.
Partial = script loaded, but local function definitions and some call sites still use local copies.

| File | Utils Loaded | Call Sites Migrated | Local Stubs Removable |
|------|-------------|--------------------|-----------------------|
| `report.html` | ✅ | ✅ Full | ✅ (local defs replaced with comments) |
| `travel.html` | ✅ | ✅ Full | ⏳ Not yet — kept by design, verify first |
| `dashboard.html` | ❌ | ❌ | ❌ |
| `mobility.html` | ❌ | ❌ | ❌ |
| `mou.html` | ❌ | ❌ | ❌ |
| `scholarship-events.html` | ❌ | ❌ | ❌ |
| `index.html` | ❌ | ❌ | ❌ (deferred — auth page) |
| `public/public-events.html` | ❌ | ❌ | ❌ |
| `public/public-mou.html` | ❌ | ❌ | ❌ |
| `public/public-mobility.html` | ❌ | ❌ | ❌ |
| `public/public-scholar.html` | ❌ | ❌ | ❌ |
| `public/public-landing.html` | ❌ | ❌ | ❌ (deferred) |

---

## 2. `IU` Namespace — Available Functions

```
IU.esc(v)                   HTML-safe escaping
IU.toDate(v)                Date parsing (ISO, Thai/intl, Buddhist Era)
IU.fmtDate(v)               Short Thai date: "10 ม.ค. 68"
IU.fmtDateFull(v)           Long Thai date: "10 มกราคม 2568"
IU.num(v)                   Number with Thai locale separators
IU.money(v)                 Currency with Thai locale separators
IU.group(arr)               Count occurrences: { A: 2, B: 1 }
IU.sum(rows, key)           Sum a numeric field across row objects
IU.statusMou(row)           → 'active' | 'soon' | 'expired'
IU.statusScholar(row)       → 'upcoming' | 'active' | 'soon' | 'urgent' | 'expired'
IU.statusEvent(row)         → 'upcoming' | 'active' | 'expired'
```

Load order in `<head>`: `iroup-config.js` → `iroup-utils.js` → `<style>`

---

## 3. Current Architecture State

### Script load order (correct pattern — as in `report.html` and `travel.html`)
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
| `iroup-sidebar.js` injected (full 220px) | `dashboard.html`, `report.html`, `travel.html` | Active — do not touch yet |
| Mini inline sidebar (64px icon strip) | `mobility.html`, `mou.html`, `scholarship-events.html` | Active — do not touch yet |
| No sidebar | All `/public/` pages | By design |

`iroup-sidebar.js` uses `!important` overrides — architectural problem, but replacement (`iroup-nav.js`) not built yet. Protected.

### API client (`iroup-config.js`)
Exposes `IROUP.getAll()`, `IROUP.add()`, `IROUP.edit()`, `IROUP.delete()`, `IROUP.getStats()`, `IROUP.getReport()`, `IROUP.SHEETS`, `IROUP.SCRIPT_URL`. Used by all 12 HTML pages. Do not modify.

---

## 4. Protected / Deferred Files

**Never touch during this refactor phase:**

| File / Folder | Reason |
|---|---|
| `peach-workload-portfolio/` (entire folder) | Completely separate SPA — different architecture, different CSS, different API |
| `iroup-config.js` | Working correctly, used by all pages. Any change breaks all pages. |
| `iroup-sidebar.js` | Still actively used. Replace only after `iroup-nav.js` is designed and tested. |
| `index.html` | Login/auth page. Google Sign-In flow, own session management. Separate migration. |
| `public/public-landing.html` | 305 KB — needs a dedicated audit before touching. Theme not yet linked. |
| `iroup-image-helper.js` | Orphaned (not linked anywhere) — leave as-is. |
| D3 / Chart.js styles inside pages | Visual output depends on them. High breakage risk. |
| Backend `Code.gs` | Out of scope for frontend refactor. |

---

## 5. Git Workflow

```bash
# Checkpoint before any edit session
git add -A && git commit -m "checkpoint: before <page> migration"

# After each page migration
git add Team\ IROUP/<page>.html
git commit -m "migrate <page>.html: add iroup-utils.js, switch call sites to IU.*"

# After removing local stubs (separate commit from call-site migration)
git add Team\ IROUP/<page>.html
git commit -m "cleanup <page>.html: remove local utility stubs now covered by IU.*"
```

Commits already made this session:
- `iroup-utils.js` creation
- `report.html` full migration (call sites + stub comments)
- `travel.html` migration (call sites switched; local stubs kept pending visual verification)
- Git + GitHub initial setup

---

## 6. Current Technical Debt

| Problem | Files Affected | Risk | Priority |
|---------|---------------|------|----------|
| Duplicate utility functions (esc, toDate, fmtDate, money, statusMou/Scholar/Event) | `dashboard`, `mobility`, `mou`, `scholarship-events`, 4× public pages | Medium — divergence risk as IU.* evolves | High — next to fix |
| Two competing sidebar systems | All private pages | High — visual inconsistency | Medium — blocked on `iroup-nav.js` build |
| Inline CSS in every page | All pages | Medium — hard to maintain | Low — wave-by-wave removal after IU migration |
| Duplicate Google Fonts `<link>` tags | All pages | Low — performance waste only | Low |
| Own `fetchReport()` logic bypassing `iroup-config.js` | `dashboard`, `index`, `report` | Medium — cache logic diverges | Medium |
| `travel.html` JS still minified into single lines | `travel.html` | Low — maintainability | Low |
| `public-landing.html` not yet theme-linked | `public-landing.html` | Low until 305 KB audit done | Deferred |

---

## 7. Safe Next Steps (In Order)

### Immediate (next session)

**Option A — Continue utils migration (recommended):**

Migrate `dashboard.html` next. It is the highest-value target:
- Has `esc`, `toDate`, `fmtDate`, `money`, `num`, `statusMou`, `statusScholar`, `statusEvent` — the full set
- Same sidebar type as `report.html` and `travel.html` (so visual pattern is established)
- Once done, most status logic lives only in `iroup-utils.js`

Migration rule (same as `travel.html`):
1. Add `<script src="iroup-utils.js"></script>` after `iroup-config.js`
2. Replace call sites with `IU.*`
3. Do NOT remove local function definitions yet
4. Do NOT touch CSS
5. Verify visually, then commit

**Option B — Remove local stubs from `travel.html`:**

Now that `travel.html`'s call sites are all on `IU.*`, the local `function esc`, `function toDate`, and `function fmtDate` definitions on lines 55–58 can be replaced with stub-removal comments (matching `report.html`'s pattern). Low risk — only do after visual verification passes.

### After `dashboard.html`

Migrate public pages in order of simplicity:
1. `public/public-scholar.html` — small, no charting
2. `public/public-events.html` — small, no charting
3. `scholarship-events.html` — medium, has `statusScholar` + `statusEvent`
4. `public/public-mou.html` — D3 present, check carefully
5. `public/public-mobility.html` — Chart.js + D3
6. `mobility.html` — large Chart.js
7. `mou.html` — most complex (D3 map + Chart.js)

### Later (separate sessions)

- Build `iroup-nav.js` to replace the two competing sidebar systems
- Remove inline CSS blocks one page at a time (only after IU migration complete)
- Audit and link theme to `public-landing.html`
- Migrate `index.html` last

---

## 8. Recommended Next Migration Target

**`dashboard.html`** — private page, 9.4 KB inline CSS, uses `iroup-sidebar.js` (same type as already-migrated pages), contains the widest set of utility functions to replace. Completing it means the three most-used private pages all run on `IU.*`.

Expected effort: ~10 surgical `Edit` operations (same technique as `travel.html`).

---

*This document covers the Team IROUP frontend only. `peach-workload-portfolio/` is a separate system not tracked here.*
