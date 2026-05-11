# Public Migration Verification

Date: 2026-05-11

Scope:

- `Team IROUP/public/public-scholar.html`
- `Team IROUP/public/public-events.html`
- `Team IROUP/public/public-mou.html`
- `Team IROUP/public/public-mobility.html`

This pass verifies the Public Migration Wave 1 pages after moving their primary public data-loading flows to `iroup-v2-api.js`. No admin/dashboard pages, backend routes, UI rendering, deployment, or push operations were changed during this verification pass.

## Summary

Public Migration Wave 1 is source-pattern clean for the primary public data flows:

- All four migrated public pages load `../iroup-v2-api.js` after `iroup-config.js`.
- All primary migrated public list calls go through `IROUP_V2.public.*`.
- No `IROUP.getPublic*` calls remain in the four migrated pages.
- No direct `SCRIPT_URL` or Apps Script `action=getPublic*` bypass was found in the four migrated pages.
- All migrated V2 list calls check `response.success` before consuming `response.data || []`.
- Existing page-local UI/render/filter/stat/map behavior remains backed by compatibility normalizers rather than broad refactors.

## Data Loading Matrix

| Page | V2 public call(s) | `response.success` check | Remaining V1 dependency | Direct operational fetch |
| --- | --- | --- | --- | --- |
| `public-scholar.html` | `IROUP_V2.public.scholarshipList()` | Yes | `IROUP.getScholarStatus()`, `IROUP.formatDate()` utilities | None found |
| `public-events.html` | `IROUP_V2.public.eventList()` | Yes | `IROUP.getStatus()` utility | None found |
| `public-mou.html` | `IROUP_V2.public.mouList()` | Yes | `IROUP.getMouStatus()`, `IROUP.formatDate()` utilities | None found; CDN world-atlas fetch remains for D3 map |
| `public-mobility.html` | `IROUP_V2.public.mobilityList()`, `IROUP_V2.public.travelList()` | Yes, both responses | None for public data; local helpers remain | None found; CDN world-atlas load remains through D3 |

## Remaining V1 Dependencies

The remaining `IROUP.*` usage in migrated public pages is utility-only:

- Scholarship status/date formatting.
- Event status calculation.
- MOU status/date formatting.

No remaining `IROUP.getPublic*` data helper calls were found. `iroup-config.js` remains intentionally loaded beside `iroup-v2-api.js` for this transition period and should not be removed globally until the utility replacement plan is explicit.

## DTO Compatibility Findings

Country normalization is mostly compatible but not identical across pages:

- `public-scholar.html` resolves country objects and falls back to the raw row value in the mapper.
- `public-events.html` resolves country strings and objects with `country_name_en`, `country_name_th`, and `country_id`.
- `public-mou.html` also supports `name_en` and `name_th`.
- `public-mobility.html` has the broadest helper and supports strings plus `country_name_en`, `country_name_th`, `name_en`, `name_th`, and `country_id`.

Continent normalization is the highest-priority mismatch:

- V2 public country refs expose continent objects as `{ continent_en, continent_th }`.
- `public-mobility.html` already supports `continent_en` and `continent_th`.
- `public-events.html` and `public-mou.html` currently prefer `continent_name_en`, `continent_name_th`, `name_en`, `name_th`, or `continent_id`, so V2 continent display can fall back poorly for those pages.

Unit normalization is mostly compatible:

- Events and MOU support V2 unit objects.
- Mobility supports V2 unit objects for mobility records.
- Public travel DTOs currently do not expose a unit object, so travel unit display can remain blank on `public-mobility.html`.

File extraction is page-local and intentionally duplicated:

- Scholarship and events extract poster images from `files[]` by `mime_type` and public file URLs from `files[].file_url`.
- MOU extracts the first public file URL into `public_file_url`.
- Mobility/travel stores `public_file_url` when available, but the existing UI does not currently render a file button for those rows.

## Public/Private Data Boundary

No obvious public/private leakage risks were found in the migrated page code:

- No direct references to private participant identity fields were found in the four pages.
- No direct references to student IDs, staff IDs, person IDs, row-level gender, budget, audit, creator, or updater fields were found.
- The public pages consume V2 public DTOs and page-local aggregate/display fields rather than raw backend/admin rows.

This verification does not replace backend public DTO boundary tests. The backend rule remains: public DTOs must exclude private participant identity, internal budget fields, internal notes, non-public files, and creator/updater metadata.

## Adapter Gaps

- `iroup-v2-api.js` intentionally has no hardcoded deployment URL. Live data verification still requires `IROUP_V2.setScriptUrl(url)` or `window.IROUP_V2_SCRIPT_URL`.
- Public summary/map routes exist for MOU and mobility/travel but are intentionally not adopted by Wave 1 pages yet.
- DTO normalization is still duplicated per page. This is acceptable for the incremental migration but should be centralized after public behavior is stable.

## Known Temporary Compatibility Hacks

- MOU map aggregation remains page-local from list rows instead of using `IROUP_V2.public.mouMap()`.
- Mobility/travel KPI, chart, top-country, and map data remain page-local from list rows instead of using public summary/map routes.
- `personCount()` behavior in `public-mobility.html` preserves existing UI behavior and can treat missing counts as one person.
- Static local hosting can expose a pre-existing script-path issue because public pages reference `iroup-config.js` relative to the `public/` folder while `../iroup-v2-api.js` resolves from the repository layout. Do not change this without a separate hosting-path decision.

## Recommended Cleanup Before Admin Migration

1. Add `continent_en` and `continent_th` support to the page-local continent helpers in `public-events.html` and `public-mou.html`.
2. Decide whether public pages should keep V1 `IROUP` utility helpers or move status/date formatting to `IU` or page-local helpers.
3. Standardize country, continent, unit, and public file extraction helpers across the four public pages.
4. Decide whether the static local hosting `iroup-config.js` path should be fixed before more browser-level smoke tests.
5. Run a live V2 endpoint visual smoke test for all four pages before starting admin/dashboard migration.
6. Add a small repeatable smoke check that parses public inline scripts and asserts no `IROUP.getPublic*` or direct `SCRIPT_URL` usage in migrated public pages.

