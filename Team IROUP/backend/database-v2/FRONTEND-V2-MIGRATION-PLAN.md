# Frontend V2 Migration Plan

Audit pass for preparing Team IROUP frontend migration to the V2 router layer.

Scope:

- Audit/planning only.
- No frontend behavior changes.
- No production `Code.gs` edits.
- No deployment.
- No V1 API removal.

Current V2 target:

```text
Frontend pages
-> V2 API client adapter
-> Apps Script V2 Router
-> IROUP_DATABASE_V2 normalized DTOs
```

Current V1 API source:

```text
Team IROUP/iroup-config.js
-> IROUP.SCRIPT_URL
-> old production Apps Script / V1 sheets
```

## Summary Findings

Most pages call the backend through `IROUP.*` helpers in `iroup-config.js`, not direct page-level Apps Script `fetch()` calls.

Primary legacy patterns:

- `IROUP.getAll(sheet)` for raw sheet rows.
- `IROUP.getReport(year)` for combined dashboard/report payloads.
- `IROUP.getStats()` and `IROUP.getMouByCountry()` for V1 aggregates.
- `IROUP.add/edit/delete()` for flat-sheet writes.
- `IROUP.uploadFile/uploadImage()` for V1 Drive uploads.
- `IROUP.getPublic*()` public-safe V1 helper methods.
- Direct root login calls to Google userinfo and legacy `checkAdmin`.

V2 migration should not directly swap URLs inside current pages. Create a V2 API client/adapter first, then migrate pages module by module.

## Current V1 Helper Inventory

Defined in `Team IROUP/iroup-config.js`:

| Helper | Current V1 action | Current assumption | V2 target direction |
|---|---|---|---|
| `createAdminSession(accessToken)` | `createAdminSession` | V1 Apps Script auth/session | Replace with V2 auth endpoint after router deployment wiring |
| `getPublicMou()` | `getPublicMou` | public data array in `data` | `v2.public.mou.list` |
| `getPublicMobility()` | `getPublicMobility` | returns mobility payload, often `{ data }` | `v2.public.mobility.summary` now; future public mobility list/detail route needed |
| `getPublicTravel()` | `getPublicTravel` | public travel rows array | `v2.public.travel.summary` now; future public travel list/detail route needed |
| `getPublicScholarships()` | `getPublicScholarships` | public scholarship array in `data` | `v2.public.scholarship.list` |
| `getPublicEvents()` | `getPublicEvents` | public event array in `data` | `v2.public.event.list` |
| `getPublicStats()` | `getPublicStats` | stats in `stats` | future route should wrap `getV2PublicStats_()` |
| `uploadFile()` | `uploadFile` | V1 Drive upload response URL | future V2 admin file upload route, then `FILES` relation write |
| `uploadImage()` | `uploadImage` | V1 Drive upload response URL | future V2 admin file upload route, then `FILES` relation write |
| `getAll(sheet)` | `getAll` | raw flat sheet row array | module-specific V2 admin DTO list routes |
| `search(sheet, q)` | `search` | raw sheet search | future V2 admin search routes |
| `searchStaff(q)` | `searchStaff` | V1 staff lookup | future V2 person/staff search route |
| `add(sheet, data)` | `add` | flat row write | future V2 admin create routes by module |
| `edit(sheet, id, data)` | `edit` | flat row update | future V2 admin update routes by module |
| `delete(sheet, id)` | `delete` | V1 row delete | future V2 admin soft-delete routes by module |
| `getStats()` | `getStats` | V1 dashboard stats | future V2 admin stats/dashboard route |
| `getReport(year)` | `getReport` | combined report payload | future V2 admin report/aggregate route |
| `getMouByCountry()` | `getMouByCountry` | V1 MOU map aggregate | future public/admin map route; public equivalent can use `getV2PublicMapData_()` |

## Direct Fetch Findings

| Location | Usage | Risk | V2 note |
|---|---|---|---|
| `iroup-config.js` | central `fetch()` wrapper to `IROUP.SCRIPT_URL` | High: all V1 API traffic flows here | Add separate V2 client instead of rewriting V1 helper in place |
| `index.html` | Google userinfo `fetch()` | Expected auth flow | Keep until V2 auth endpoint is deployed |
| `index.html` | legacy `checkAdmin` direct URL fallback | Medium: checks old V1 backend | Replace with V2 auth route after V2 deployment; temporary allowlist/root gate remains separate |
| `mou.html` | CDN world-atlas fetch | Not backend/API | Keep; unrelated to V2 backend |
| `public/public-mou.html` | CDN world-atlas fetch | Not backend/API | Keep |
| `public/public-landing.html` | CDN world-atlas fetch | Not backend/API | Keep |
| `index-design-v1.html` | design artifact script/image fetching | Low; not operational frontend | Exclude from V2 migration unless this file becomes active |

## Page Migration Map

### `dashboard.html`

Current API usage:

- `IROUP.getReport(year)`
- Assumes V1 combined report response with `success`, `error`, and dashboard/report-shaped raw data.
- Uses local caching keyed by year.

Target V2 route:

- Future `v2.admin.dashboard.summary` or `v2.admin.report.summary`.
- Existing routes can partially support source lists:
  - `v2.admin.mou.list`
  - `v2.admin.mobility.list`
  - `v2.admin.travel.list`
  - `v2.admin.scholarship.list`
  - `v2.admin.event.list`

Migration risk:

- High. Dashboard depends on a combined aggregate payload, not just module lists.

Dependency blockers:

- Need finalized V2 admin dashboard/report aggregate route.
- Need V2 API client adapter.
- Need auth/session wiring for V2 admin routes.

Recommended phase:

- Phase 4 or later, after module DTOs and aggregate/report routes are stable.

### `report.html`

Current API usage:

- `IROUP.getReport()`
- `IROUP.getAll()` for inbound, outbound, travel, MOU, scholarship, and event sheets.
- Assumes V1 flat Thai/legacy sheet headers.

Target V2 route:

- Future `v2.admin.report.summary`.
- Future `v2.admin.report.export`.
- Existing admin list routes can support module-level reads only.

Migration risk:

- High. Reporting aggregates must be rebuilt from normalized V2 DTOs.

Dependency blockers:

- Need V2 report DTO contract.
- Need mapping from normalized Mobility/Travel project/participant rows into report metrics.
- Need export contract if current export UI remains.

Recommended phase:

- Phase 5, after admin/public module DTOs and dashboard aggregates are stable.

### `mobility.html`

Current API usage:

- `IROUP.getAll(IROUP.SHEETS.INBOUND)`
- `IROUP.getAll(IROUP.SHEETS.OUTBOUND)`
- `IROUP.add/edit/delete()` on `INBOUND` and `OUTBOUND`
- `IROUP.searchStaff()`
- Assumes flat inbound/outbound rows with participant personal data embedded in the row.

Target V2 route:

- Read: `v2.admin.mobility.list`
- Future detail: `v2.admin.mobility.get`
- Future writes:
  - `v2.admin.mobility.create`
  - `v2.admin.mobility.update`
  - `v2.admin.mobility.delete`
  - participant-specific routes for `MOBILITY_PARTICIPANT`
- Future search: `v2.admin.person.search`

Migration risk:

- Very high. Current form shape is flat and conflicts with V2 normalized `MOBILITY_PROJECT` + `MOBILITY_PARTICIPANT`.

Dependency blockers:

- Need V2 Mobility detail/create/update/delete contracts.
- Need V2 person search/lookup.
- Need redesigned admin form payloads.

Recommended phase:

- First admin module migration after V2 write contracts exist, because Mobility was the operational priority.

### `travel.html`

Current API usage:

- `IROUP.getAll(IROUP.SHEETS.TRAVEL)`
- `IROUP.getAll(IROUP.SHEETS.STAFF)`
- `IROUP.getAll('COUNTRY')`
- `IROUP.add/edit/delete()` on Travel.
- `IROUP.add()` for quick staff creation.
- `IROUP.uploadFile()`

Target V2 route:

- Read: `v2.admin.travel.list`
- Future detail: `v2.admin.travel.get`
- Future writes:
  - `v2.admin.travel.create`
  - `v2.admin.travel.update`
  - `v2.admin.travel.delete`
  - participant-specific routes for `TRAVEL_PARTICIPANT`
- Future support:
  - `v2.admin.person.staff.list/search`
  - `v2.admin.country.list`
  - V2 file upload/create route writing `FILES`

Migration risk:

- High. Current form mixes travel mission data, staff lookup, participants, and file upload into flat V1 calls.

Dependency blockers:

- Need V2 Travel detail/write routes.
- Need staff/person search route.
- Need file upload/storage route and `FILES` relation write.

Recommended phase:

- After Mobility admin migration pattern is proven.

### `mou.html`

Current API usage:

- `IROUP.getAll(IROUP.SHEETS.MOU)`
- `IROUP.add/edit/delete(IROUP.SHEETS.MOU)`
- `IROUP.uploadFile()`
- CDN world-atlas `fetch()`
- Assumes V1 flat MOU rows and V1 upload response.

Target V2 route:

- Read: `v2.admin.mou.list`
- Future detail: `v2.admin.mou.get`
- Future writes:
  - `v2.admin.mou.create`
  - `v2.admin.mou.update`
  - `v2.admin.mou.delete`
  - V2 file relation route for `FILES`
  - V2 budget relation route for `BUDGET` where applicable

Migration risk:

- Medium-high. MOU is simpler than Mobility/Travel but still needs file/budget relation handling.

Dependency blockers:

- Need V2 MOU detail/write routes.
- Need country/unit master lookup routes.
- Need V2 file upload/relation routes.

Recommended phase:

- After read-only public MOU migration and after V2 file relation contract is ready.

### `events.html`

Current API usage:

- `IROUP.getAll(IROUP.SHEETS.SCHOLAR)`
- `IROUP.getAll(IROUP.SHEETS.EVENT)`
- `IROUP.add/edit/delete()` for scholarships/events.
- `IROUP.uploadImage()` and `IROUP.uploadFile()`.
- Assumes V1 flat scholarship/event rows and upload URL fields.

Target V2 route:

- Reads:
  - `v2.admin.scholarship.list`
  - `v2.admin.event.list`
- Future details/writes:
  - `v2.admin.scholarship.get/create/update/delete`
  - `v2.admin.event.get/create/update/delete`
  - V2 file relation route for posters/files

Migration risk:

- Medium-high. Public fields are mostly compatible conceptually, but write payloads need normalized file/link/status/pin handling.

Dependency blockers:

- Need admin detail/write routes.
- Need V2 file upload/relation route.

Recommended phase:

- Good candidate after Mobility/Travel write patterns are established.

### `index.html`

Current API usage:

- Google Identity Services token flow.
- Direct Google userinfo `fetch()`.
- `IROUP.createAdminSession(access_token)` against V1 backend.
- fallback direct `checkAdmin` call against V1 `IROUP.SCRIPT_URL`.
- fallback hardcoded allowlist if V1 check fails.

Target V2 route:

- Future `v2.auth.session.create` or equivalent.
- Future root workspace gate should use V2 `ADMIN` table through a deployed V2 auth endpoint.

Migration risk:

- Medium-high because auth affects all protected admin pages.

Dependency blockers:

- Need deployed V2 router entrypoint.
- Need V2 auth endpoint that can validate Google identity/token or trusted Apps Script session.
- Need decision on root workspace gate vs Team IROUP module guard.

Recommended phase:

- Separate Workspace/V2 Auth integration phase before admin frontend migration.

### `public/public-mou.html`

Current API usage:

- `IROUP.getPublicMou()`
- CDN world-atlas `fetch()`
- Uses adapter from sanitized V1 payload to existing render shape.

Target V2 route:

- `v2.public.mou.list`

Migration risk:

- Low-medium. Public DTO exists, but field names differ from current adapter assumptions.

Dependency blockers:

- Need V2 public API client adapter.
- Confirm public MOU field mapping.

Recommended phase:

- First public page migration candidate.

### `public/public-scholar.html`

Current API usage:

- `IROUP.getPublicScholarships()`
- Uses sanitized V1 public adapter.

Target V2 route:

- `v2.public.scholarship.list`

Migration risk:

- Low-medium.

Dependency blockers:

- Need V2 public API client adapter.
- Confirm scholarship file/poster field mapping.

Recommended phase:

- Early public migration candidate.

### `public/public-events.html`

Current API usage:

- `IROUP.getPublicEvents()`
- Uses sanitized V1 public adapter.

Target V2 route:

- `v2.public.event.list`

Migration risk:

- Low-medium.

Dependency blockers:

- Need V2 public API client adapter.
- Confirm event location/meeting URL public-safety rules.

Recommended phase:

- Early public migration candidate after scholarship.

### `public/public-mobility.html`

Current API usage:

- `IROUP.getPublicMobility()`
- `IROUP.getPublicTravel()`
- Assumes list-like public Mobility/Travel rows for cards, map, filters, modal details, and timeline.

Target V2 route:

- Current available:
  - `v2.public.mobility.summary`
  - `v2.public.travel.summary`
- Needed before equivalent page migration:
  - future `v2.public.mobility.list`
  - future `v2.public.travel.list`

Migration risk:

- High. Current public page renders records/details, but current V2 router only exposes summary aggregates for Mobility/Travel.

Dependency blockers:

- Need public-safe Mobility list/detail DTO.
- Need public-safe Travel list/timeline DTO.
- Must confirm no participant names/person IDs/gender leak.

Recommended phase:

- Later public migration, after public Mobility/Travel list DTOs are designed.

### `public/public-landing.html`

Current API usage:

- `IROUP.getPublicStats()`
- `IROUP.getPublicMou()`
- `IROUP.getPublicEvents()`
- `IROUP.getPublicScholarships()`
- CDN world-atlas `fetch()`
- Assumes V1 public stats shape and list arrays.

Target V2 route:

- Future route for stats: add router action for `getV2PublicStats_()`.
- Future route for map data: add router action for `getV2PublicMapData_()`.
- Existing:
  - `v2.public.mou.list`
  - `v2.public.scholarship.list`
  - `v2.public.event.list`

Migration risk:

- Medium-high due to combined landing stats/map aggregation assumptions.

Dependency blockers:

- Router currently lacks `v2.public.stats` and `v2.public.map`.
- Need landing DTO contract to avoid client-side recomputation from raw lists.

Recommended phase:

- After adding V2 public stats/map router actions.

## Legacy Response Assumptions To Remove

Current pages commonly assume:

- API helpers return arrays directly.
- V1 public helpers unwrap `data` or `stats` inside `iroup-config.js`.
- Admin reads return raw rows with Thai/legacy headers.
- Writes accept `{ sheet, data }` flat rows.
- Delete accepts `{ sheet, id }`.
- Upload returns `url` or `fileUrl` for direct embedding into the parent row.

V2 expectations:

- Router response always has `{ success, data, error, meta }`.
- Frontend should read `response.data`, not raw top-level arrays.
- Admin writes must target module-specific normalized routes.
- Files should be separate `FILES` relation rows.
- Budgets should be separate `BUDGET` relation rows.
- Mobility and Travel participants should be separate participant rows.

## Target V2 Route Gaps

Routes already available:

- `v2.health`
- `v2.schema`
- `v2.admin.mou.list`
- `v2.admin.mobility.list`
- `v2.admin.travel.list`
- `v2.admin.scholarship.list`
- `v2.admin.event.list`
- `v2.public.mou.list`
- `v2.public.mobility.summary`
- `v2.public.travel.summary`
- `v2.public.scholarship.list`
- `v2.public.event.list`

Routes likely needed before meaningful frontend migration:

- `v2.public.stats`
- `v2.public.map`
- `v2.public.mobility.list`
- `v2.public.travel.list`
- `v2.admin.dashboard.summary`
- `v2.admin.report.summary`
- `v2.admin.<module>.get`
- `v2.admin.<module>.create`
- `v2.admin.<module>.update`
- `v2.admin.<module>.delete`
- `v2.admin.person.search`
- `v2.admin.country.list`
- `v2.admin.unit.list`
- V2 file upload/create/link route
- V2 budget create/update/delete relation routes

## Recommended Migration Phases

### Phase F0: Do Not Touch Frontend Yet

- Keep V1 frontend stable.
- Keep `iroup-config.js` pointing at V1 until V2 deployment wiring is approved.
- Do not replace `IROUP.SCRIPT_URL` globally.

### Phase F1: Create V2 Client Adapter

- Add a separate V2 client file later, for example `iroup-v2-api.js`.
- Keep V1 and V2 clients side by side.
- Standardize router request/response handling.
- Add endpoint feature flags if needed.

### Phase F2: Public Low-Risk Pages

- Migrate `public/public-scholar.html`.
- Migrate `public/public-events.html`.
- Migrate `public/public-mou.html`.

### Phase F3: Add Missing Public Aggregates

- Add `v2.public.stats`.
- Add `v2.public.map`.
- Add public Mobility/Travel list routes if preserving current public mobility page behavior.

### Phase F4: Public Landing And Public Mobility

- Migrate `public/public-landing.html`.
- Migrate `public/public-mobility.html` only after public Mobility/Travel list DTOs exist.

### Phase F5: Admin Read-Only Migration

- Build V2 admin tester/page or adapters first.
- Migrate admin pages to V2 read-only DTOs without write actions.

### Phase F6: Admin Write Migration

- Redesign forms around normalized V2 payloads.
- Start with Mobility only after create/update/delete contracts exist.
- Then Travel, MOU, Scholarship/Event.

### Phase F7: Dashboard/Report Migration

- Migrate dashboard/report after V2 aggregate/report routes are stable.

## Auth And Governance Notes

- Current root/index auth still contains V1 `createAdminSession` / `checkAdmin` behavior.
- Root workspace auth gate and Team IROUP admin guard should remain layered.
- V2 admin routes require `requireV2Admin_()` in Apps Script.
- Frontend migration needs a deployed V2 auth/session strategy before admin pages can depend on V2 admin routes.
- Public pages should never receive private fields and should not rely on client-side hiding.

## Go / No-Go

Current recommendation:

- No-go for frontend migration today.
- Go for adding missing V2 read DTO routes and a separate V2 API client adapter.
- Go for planning public low-risk page adapters after `v2.public.stats` / map decisions are made.

