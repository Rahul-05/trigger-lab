# PACKING.md — How to port Trigger Lab to a new basin

A **pack** is one basin's assembled data: GloFAS forecast + historical runs plus
the impact-record summary the workbench may show. A pack is registered in two
places: the machine-readable manifest (`workbench/pack.json`) and the page
itself (`workbench/app.js`: the basin picker, the place gazetteer, and the
forthcoming list). No pack, no numbers — the page must never show a number for
a basin whose pack does not exist.

## Licence facts (do not bend these)

- **CEMS-FLOODS data may be redistributed with attribution.** The GloFAS
  reforecast and historical runs in a pack are covered by the CEMS-FLOODS
  licence; every pack and every download must carry attribution to ECMWF /
  CEMS-Floods. That is why packs can ship on the public site at all.
- **EM-DAT data may NOT be redistributed.** EM-DAT records must never be
  embedded in a pack, in `data.js`, or in a download. EM-DAT is a
  bring-your-own source only: a visitor who has EM-DAT access uploads their
  own CSV in the browser, and that file never leaves their machine.
- **DesInventar record years are public impact data.** The Teso pack embeds
  DesInventar record years by district/sub-county only (no personal data).
  Treat any new impact source the same way: years and counts only, and check
  its licence before embedding anything.

## Pipeline, end to end

### 1. Basin config

Write the basin down before touching EWDS:

- `basin_id` (short, lowercase, e.g. `teso`), display name, study window.
- **Pour point**: the latitude/longitude the basin drains through, and the
  target coordinates for each site in the basin. For Teso these live in
  `pull/extract_points.py` (`TARGETS`) and in the pack manifest.
- **Request box** (north/west/south/east) covering the basin on the GloFAS grid.
- Which impact records exist for the basin, and under which licence.

Record all of it in the new pack's manifest entry in `workbench/pack.json`
first, with `status` left as `forthcoming` until step 5 passes.

### 2. Sequential EWDS pull

Use the sequential runner (`pull/pull_seq.py`), one job at a time:

- EWDS throttles bursts (ECMWF's own docs describe a request-volume priority
  penalty) and the queue caps reject parallel submissions. **Exactly one
  puller may run.** Parallel submitters caused a clog in the Teso pull.
- Scope the pull to the paper's window where applicable: reforecast years at
  leads 24/96/168 h only, plus the historical run per year. The Teso pull was
  29 chunks (24 reforecast quarters + historical 2010–2014) plus historical
  2009 adopted from phase 0 — 30 markers total.
- The EWDS API token lives in `~/.config/trigger-lab/cdsapirc` (never print
  it, never commit it). The CEMS-FLOODS licence must be accepted for both
  `cems-glofas-reforecast` and `cems-glofas-historical` before pulling.
- Track completion with marker files (`pull/raw/A|B/*.done.json`); do not
  start extraction until every marker is present.

### 3. Extract points

Run `pull/extract_points.py`:

- Snapping rule (the paper's): **nearest grid box** to each target
  coordinate; exact distance ties go to the larger upstream area. The
  max-upstream-area rule from the phase-1 spec is wrong for this paper and
  is kept only as a `*_maxup` sensitivity series, never as the headline.
- Output: per-point forecast/analysis series plus `pack_metadata.json`
  (target coordinates, snapped coordinates, upstream areas). Check the
  snapped areas against the basin's known catchment sizes before proceeding
  (Teso: Magoro ~800 km², Akokoro gauge pixel ~13,003 km², Kapelebyong
  ~123 km²).

### 4. Reproduce

Run `pull/reproduce.py`:

- Computes danger levels (95th percentile), sensitivity percentiles,
  exceedance years, action matching with no-retrigger suppression, POD /
  FAR / POFD, the 60-day block bootstrap for P(FAR > 0.5), and cost-loss.
- Output: `data/glofas/<basin>/results.json`. Verify it against the paper
  where a paper exists (comparison table + drift register in
  REPRODUCTION.md), and never substitute a model-vs-model number for a
  gauge comparison the data cannot support.

### 5. Pack JSON

- Add the basin's entry to `workbench/pack.json`: basin id, display name,
  pour-point lat/lon per site (target + snapped), catchment area per site,
  data sources, licence notes, file list. Set `status` to `complete` only
  when the data below verifies.
- Generate the page data with `pull/make_data_js.py` — it copies
  `results.json` into `workbench/data.js` and applies the site labels
  (results.json carries null labels). Never hand-edit numbers into
  `data.js`. Prove the regeneration with `python3 pull/make_data_js.py
  --check` (it must print that data.js matches).
- Re-run the embedded-data verification (every displayed number traced to
  `results.json`: danger levels, sensitivity, exceedance years,
  correlations, all actions × all triggers, bootstrap, impact record years).
  The Teso precedent is 348/348 checks passing.

### 6. Register in the basin list

In `workbench/app.js`:

- Move the basin out of `FORTHCOMING` into the picker list, add its sites,
  and add its names and variant spellings to `GAZETTEER`.
- The place search resolves names **only** over packed + planned basins.
  Bare country names must not resolve (a country is not a basin). An
  unmatched name gets the honest empty state, never numbers.

### 7. Publish

Sync `workbench/` plus `DESIGN.md` and this file into the site copy, commit,
push to `main`, and verify the Pages URL returns 200 with the new content.
Never publish the unsubmitted grant draft or any token.

## Bring-your-own impact records (visitor overlay, not a pack)

The workbench also accepts a visitor's own flood-year CSV (Simple view,
"Your own flood years"). Rules:

- Client-side parse only (FileReader). The file never leaves the browser.
- Format: a CSV with a year column (a header containing "year", or a bare
  4-digit year in the first column). Other columns are kept as labels.
- The overlay is drawn on the exceedance timeline, clearly marked
  user-supplied, and years outside the study window are listed, not plotted.
- User-supplied years are **never** included in the annex download, the CSV
  download, or any pack. Unparseable lines are shown in the danger-styled
  error box and skipped.
