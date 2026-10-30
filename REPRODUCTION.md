# Trigger Lab — first GloFAS extraction and reproduction run

*Run date: October 22, 2026 (01:57–03:50 UTC and continuing in the background).
Status at write time: **Stage 1 complete. Stage 2 partially complete — the
bulk pull is still running against a severely degraded EWDS service (see the
throughput record in §2.2); Stage 3 has not been run on pulled data, and no
reproduction numbers are claimed yet.** Everything that could be validated
without the bulk data has been validated (§2.4, §3.1). The pull is resumable
and continues unattended; §5 says how to check and resume it.*

---

## 1. Stage 1 — smoke test: PASS (after three diagnosed request-shape fixes)

One minimal `cems-glofas-reforecast` request (hyear 2022, January init dates,
control member only, lead 24 h only, spec area box [2.3, 33.3, 1.4, 34.4])
completed end to end:

| Quantity | Value |
|---|---|
| Job processing time (submit → results ready) | **84 s** |
| Download time | 3.7 s |
| GRIB size | **12,915 bytes** |
| Content | 9 initialisation dates (Jan 1, 4, 8, …, 29 2022), variable `dis24`, 18 × 22 cells at 0.05° |
| Auth | Token accepted; account id resolved; accepted licences reported by the API: **`cems-floods`, `terms-of-use-cems`** |

Three request-shape defects were found and fixed, in order — this is the
precise diagnosis trail, because each fix changed exactly one thing:

1. **Wrong date keys.** The spec assumed `year`/`month`/`day`. The EWDS form
   uses **`hyear`/`hmonth`/`hday`** (hindcast initialisation dates). Server:
   HTTP 400 "Request has not produced a valid combination of values".
2. **`data_format`.** Must be `grib2`. The legacy `cdsapi` client silently
   rewrites `grib2` → `grib`, which the EWDS validator rejects — the legacy
   client **cannot** submit GRIB requests to this dataset. The modern
   `ecmwf.datastores` client (v0.5.3) submits values verbatim and works.
3. **`hydrological_model`.** For `version_4_0` the only valid value is
   **`lisflood`**, not `htessel_lisflood` (that value belongs to the legacy
   versions; the constraints file's v4 entries and `apply_constraints`
   agree). With this single change the identical request went from 400 to
   accepted, cost 9.0 (limit 950).

Sizing from the smoke result: ~1.4 KB per field (396 cells, GRIB2-packed).
A spec-shape chunk (2 months, both product types, leads 24–240) is ~1,900
fields ≈ 2.7 MB; the full spec (PHASE1 §3) totals roughly 350–400 MB across
139 chunks. **Data volume was never the problem. Service throughput is
(§2.2).**

---

## 2. Stage 2 — the pull

### 2.1 What the spec asked for vs what was attempted

PHASE1 §3: Request A — reforecast v4.0, hyears 2003–2022, all Mon/Thu inits,
leads 24–240 h, control + perturbed, chunked by year; Request B — historical
consolidated daily 2003–2022; plus `glofas_upArea.nc`. Valid `hday` sets per
(hyear, hmonth) were taken verbatim from the EWDS constraints file (the init
calendar is irregular: e.g. 2003 begins Mar 27/30; day patterns shift by
year). Chunking was validated with `estimate_costs` (per-request limit 950):
(2-month, both products, 10 leads) ≈ 360; (1 year, all months, flat day
union) ≈ 7,300 — over the limit, because phantom (month × day) combinations
are costed. Final v1 chunking: per (hyear, 2-month pair) → 119 A-jobs +
20 B-jobs = **139 jobs**.

### 2.2 Measured EWDS behaviour (the blocker, documented)

All times UTC, Oct 22, 2026, from the API job list and local logs:

- **01:57–01:59** — smoke job: submitted, ran, succeeded in **84 s**. The
  account was fresh.
- **02:03** — v1 pull launched with 6 parallel workers. Of the first 19
  submissions, **15 were `rejected`** within seconds, 2 `accepted`,
  1 `running`, 1 `successful` (the smoke). The server sustains only ~3–4 of
  this account's jobs in (accepted + running) at once; further submissions
  are rejected ~10–15 s after a transient `accepted`.
- The one `running` chunk (a spec-shape A chunk) showed **no completion
  after 23 minutes**. v1 was stopped; queued orphans dismissed via the API.
- **02:21–02:48** — controlled timing test, one identical chunk, queue
  otherwise empty: `running` at +33 s, **still running at +26 min**, then
  dismissed by us to free the queue. No result.
- **02:38–03:50** — historical-2009 probe + v3 pull (below). Queue behaviour:
  jobs sit `accepted` for 15–25 min before starting; the first v3 chunk
  started 03:03:29 and was **still `running` at 03:38 (35 min)** when last
  successfully observed. The API itself intermittently read-times-out on
  job-list polls (observed 03:09, 03:21–03:36, 03:44).
- ECMWF's own best-practice documentation states the mechanism plainly:
  *"the CDS system penalises users that submit too many requests,
  decreasing the priority of their requests"* (CEMS-Flood CDS Best
  Practices, Confluence). The v1 burst (139 rapid submissions plus
  resubmission retries) very likely triggered exactly this penalty on top
  of an already slow backend: per-chunk processing went from 84 s
  (smoke, pre-burst) to **>26–35 min and counting** (post-burst), with
  only ~1 job running at a time.

**Conclusion:** the full-spec pull (139 chunks × 20 years × 10 leads) is
not completable in a reasonable time through EWDS as it behaved on
2026-10-22. This is a service-throughput finding, not a request-shape or
licence problem — Stage 1 proves the path works.

#### Addendum (2026-10-22, ~04:40 UTC) — queue repair and sequential pull

- **04:17–04:20** — v3's two workers exhausted their retries on
  2009 Q1/Q2/Q4; each attempt failed at ~850 s, at the results endpoint:
  *"The job has been rejected — Maximum number queued requests for this
  dataset has been reached. Please configure your scripts to request
  data sequentially."*
- **Queue audit (04:22, `ecmwf.datastores` `get_jobs`)** — 60 account
  jobs: **55 rejected, 2 successful, 2 accepted, 1 running**. The 55
  rejected were already terminal. The live clog on
  `cems-glofas-reforecast` was two `accepted` zombies: **5a798536**
  (created 04:10, a v3 retry submission) and **7b96de8d** (created
  02:49, v3's first submission, still unstarted after ~95 min). The
  one `running` job was 948de583 (historical 2009, started 04:21:54).
- **Repair (04:23)** — `pull_v3.py` and `adopt_hist.py` processes
  stopped; both zombies dismissed via the API. Post-dismissal, the
  account's only live job was 948de583.
- **Sequential runner** — `pull/pull_seq.py` replaces both pullers:
  one job in flight at a time (submit → poll at 45 s, tolerant of the
  API's read timeouts → download → next chunk), at most one
  resubmission per chunk after a 300 s pause, same `.done.json`
  markers, the 948de583 adoption folded in as phase 0. Two latent
  download bugs were found and fixed on the way (never exercised
  before, present in `adopt_hist.py` too): `get_remote` takes the bare
  job id (a full URL doubles the path → 404), and datastores 0.5.3
  `Results` wrap a single asset (`.location` / `.download(target)`) —
  there is no `.assets` list.
- **First outcomes** — adopted job 948de583 reached `successful`;
  **`historical_2009_0.grib` (517,935 bytes) downloaded and marked at
  04:28 UTC: the first pilot chunk has landed.** The first sequential
  submission, `reforecast_2009_Q1` (job f1a914d7, submitted 04:29:02
  into an empty queue), was `accepted` at +1 s and **`running` at
  +47 s** (started 04:30:02) — against 15–25 min accepted-waits and
  cap rejections in the burst era. It was still `running` at 04:40
  (processing, not queueing, is now the slow part); a job-list check
  at 04:39 confirmed it is the account's only live job.

### 2.3 Scope reduction (v3 pull, running now)

Kept: everything the reproduction (Stage 3) actually consumes, over the
**paper's own analysis window**:

- **Request A′** — reforecast v4.0, hyears **2009–2014**, leads
  **24 / 96 / 168 h** (lead-0 proxy + the 4-day and 7-day action leads),
  both product types, chunks per (hyear, quarter) — cost ≈ 330, 24 jobs.
  The spec's leads 192–240 and years 2003–2008 / 2015–2022 are deferred,
  not cancelled: the chunker in `pull/pull_full.py` still encodes them and
  the v3 puller (`pull/pull_v3.py`) is marker-resumable.
- **Request B′** — historical consolidated daily, **2009–2014**, per-year
  jobs (2009 via the probe job, adopted by `pull/adopt_hist.py` after the
  probe script died on a network timeout; 2010–2014 in v3).
- Both pullers run detached with ≤2 workers and rejection-tolerant
  resubmission. First deliverable expected: 2009 quarters + historical
  2009, enabling a one-year pilot pass through extraction and the core
  before the full window lands.

### 2.4 Ancillary grid and snapping — a scientific finding

`glofas_upArea.nc` was obtained (the v4.0 file `uparea_glofas_v4_0.nc`,
86 MB, ECMWF CEMS-Flood auxiliary data via Confluence) and the snapping
analysis produced a result that changes the extraction rule:

| Target | PHASE1 rule (max uparea ≤ 0.15°) | Paper's rule (nearest box; ties → larger uparea) |
|---|---|---|
| Akokoro gauge (1.86, 33.85) | (1.725, 33.825), 13,249 km² | **(1.875, 33.825), 13,003 km²** |
| Apapi at Magoro (≈1.9, ≈34.0) | (1.775, 33.875), 13,218 km² | **(1.875, 34.025), 800 km²** |
| Akokoro at Kapelebyong (≈2.0, ≈33.65) | (1.875, 33.725), 369 km² | **(1.975, 33.625), 123 km²** |

The PHASE1 refinement collapses both Katakwi targets onto the **same
~13,000 km² main-stem channel** — a different watercourse from the Apapi
and from the Akokoro tributary. At the Magoro target the nearest cells are
a plausible 615–800 km² tributary; the max-uparea rule jumps 0.13° away to
the main stem. **Primary extraction therefore uses the paper's own
nearest-grid-box rule** (with distance ties broken by larger upstream
area); the PHASE1 snap is retained as `*_maxup` sensitivity series in the
pack. `pull/extract_points.py` implements both.

A second, independent observation: in the v4 network the pixel nearest
the published Akokoro gauge coordinate itself carries **13,003 km²** of
upstream area, while the gauge's actual catchment is far smaller. The
paper's gauge check (correlation **0.52**, PHASE0 §3) was computed against
a 0.1° nearest box in the pre-operational model; in v4 the nearest box is
a main-stem pixel, so a like-for-like gauge correlation — were the gauge
series obtainable — would be expected to degrade further. The check
remains uncomputable here regardless: the Akokoro gauge series is not
openly available (PHASE0 §3 gap table), and we do not substitute a
model-vs-model correlation and call it the paper's number.

### 2.5 Pipeline validation on the smoke GRIB

The full extraction path (snap → cfgrib read → tidy parquet) was run
end-to-end on the smoke file: 54 rows (3 primary + 3 sensitivity points ×
9 inits), schema exactly as the core consumes
(`point_id, init_date, lead_days, member, discharge`; control = member 0).
When v3 chunks land in `pull/raw/A|B/`, `pull/extract_points.py` produces
`data/glofas/teso_v4/{forecasts,analysis}.parquet` + `pack_metadata.json`
unmodified.

---

## 3. Stage 3 — reproduction run: RUN 2026-10-30 (full 2009–2014 pack)

Run 2026-10-30 UTC on the completed pull (30 markers: 24 reforecast
quarters + 6 historical years; `pull/extract_points.py` → 207,900
forecast rows, 13,146 analysis rows; `pull/reproduce.py` →
`data/glofas/teso_v4/results.json`). Headline site is Magoro
(`apapi_magoro`); the numbers below are that site unless stated.
**Caveat that governs the whole table:** verification here is
model-vs-model — the "truth" series is the GloFAS v4 lead-24h ensemble
median proxy (and the consolidated historical run), not an independent
gauge or impact record, so near-zero FAR is consistency of one model
family with itself, not demonstrated skill against the real world.
Proxy-vs-historical correlation at Magoro is 0.9999 (n = 1,050).

### 3.1 The acceptance table (paper, PHASE0 §3) vs this run

| Quantity | Paper (Coughlan de Perez et al. 2016) | This run |
|---|---|---|
| Danger level | 95th pct of lead-0 series; exceedance years at Magoro **2010, 2011, 2012** (exact match to impact record; <93rd admits false years, >99th almost none) | 95th pct of lead-24h proxy = **7.71 m³/s** (hist 95th: 7.56); exceedance years **2010, 2011, 2012, 2013** (53 days) — the paper's three years plus an extra 2013; 93rd (7.19) also gives 2010–2013, 99th (9.67) narrows to 2011, 2012 |
| P(FAR > 0.5), trigger 30% | **24%** (60-day block bootstrap, 10,000 resamples; 30-day lifetime, 4-day lead) | **0.0%** (same bootstrap protocol; FAR 95% CI 0–0.069, n_valid 9,998) |
| P(FAR > 0.5), trigger 50% | **19%** | **0.0%** (FAR 95% CI 0–0.083, n_valid 9,996) |
| P(FAR > 0.5), trigger 70% | **18%** | **0.0%** (FAR 95% CI 0–0.091, n_valid 9,993) |
| POD / FAR per action (Table 1: water storage 4d/30d, drainage 4d/90d, food storage 7d/30d) | reported graphically in the paper; FAR tolerance 0.5 | Water storage 4d/30d: POD 0.29 / 0.23 / 0.20 at 30/50/70%, pair FAR 0.02 / 0.03 / 0.03, operational FAR **0.0** (8/8, 8/8, 7/7 actions hit). Drainage 4d/90d: POD 0.17 / 0.13 / 0.11, pair FAR 0.0, operational FAR 0.0. Food storage 7d/30d: POD 0.26 / 0.19 / 0.12, pair FAR 0.07 / 0.06 / 0.10, operational FAR 0.0 |
| GloFAS vs Akokoro gauge correlation | **0.52** (n = 2,014 daily pairs, 2009–2014) | **not computable** — gauge series not openly available (PHASE0 gap); will not be approximated or substituted. The 0.9999 proxy-vs-historical correlation above is model-vs-model and is NOT this number |
| Reliability | formally indeterminate (95% CIs span ~0–1) | FAR bootstrap CIs here are narrow (upper bounds 0.07–0.09 at Magoro) — but per the drift register this reflects model-vs-model verification, not skill; it does not overturn the paper's indeterminacy against independent truth |

### 3.2 DesInventar cross-check inputs (ready, from PHASE1 §1)

Deduplicated district flood years (date + district) in the paper window:
Katakwi records in 2010 (25), 2011 (2), 2012 (10), 2013 (2), 2014 (4);
Amuria 2010 (5), 2011 (2), 2012 (9), 2013 (3). Magoro + Ngariam sub-county
records: 7 in 2009–2014 (**2010: 5, 2012: 2, none in 2011**) against the
paper's 8 events in 2010/2011/2012 drawn from DesInventar **plus Red Cross
internal records that are not public** — the 2011 Magoro gap is a known
input difference, documented in PHASE1 §1, and the cross-check will
report exceedance-year agreement against both the district-level record
(2010–2014 all present) and the sub-county record (2011 missing), without
silently re-basing to either.

### 3.3 Drift register (applies whenever the numbers land)

1. **Ensemble size 51 → 11.** Trigger probabilities quantise to member
   counts: 30/50/70% become ≥4/11, ≥6/11, ≥8/11 (36/55/73% effective).
   FAR bootstrap distributions will be coarser and wider.
2. **Sampling daily → Mon/Thu-pattern inits** (~104/yr from the v4
   hindcast calendar, irregular day sets per year). Verification pairs
   are initialisation dates, not days; the 60-day bootstrap block is
   ~17 samples at this spacing.
3. **Lead-0 → 24 h proxy.** The paper's danger level and ungauged-site
   truth were the lead-0 ensemble median; the v4 archive's shortest lead
   is 24 h. The proxy series is the lead-24h ensemble median, with the
   consolidated historical run as the climatology cross-check. Exceedance
   timing can shift by a day against reported flood dates.
4. **Model/resolution change.** Paper: pre-operational 0.1°, 2009–2014.
   Here: v4.0 at 0.05°, LISFLOOD with ERA5-forced reforecast meteorology.
   Discharge magnitudes at snapped pixels are not expected to match the
   paper's; the *method's behaviour* (danger-level selection, FAR
   intolerability pattern) is the reproduction target, per PHASE0 §3.
5. **Pixel/catchment mismatch at the gauge point** (§2.4): the v4 nearest
   box to the Akokoro gauge coordinate is a 13,003 km² main-stem pixel.
   At Magoro the nearest box is an 800 km² tributary pixel — the
   reproduction's headline site is the better-matched one, as in the
   paper (whose FAR analysis is also the ungauged Magoro analysis).

---

## 4. Honest read (rewritten 2026-10-30, after the completed run)

The reproduction **has now been demonstrated, and it diverges from the
paper in exactly the place a calibration workbench exists to check.**
Run 2026-10-30 on the completed pull (30 markers: 24 reforecast
quarters + 6 historical years; 207,900 forecast rows, 13,146 analysis
rows) fills the §3.1 acceptance table. The pipeline itself is proven
end-to-end on real v4 data: account, licence, request shape, snapping,
extraction, and the computation core (11/11 hand-computed tests, PHASE1
§2) all check out, and the numbers in §3.1 are computed from that data,
not from the paper's tables.

The verdict, at the headline site Magoro:

- **Exceedance years reproduce, plus one.** The 95th-percentile danger
  level (7.71 m³/s proxy, 7.56 historical) gives exceedance years 2010,
  2011, 2012, **2013** — the paper's three years plus an extra year the
  paper's record is silent on. The 93rd percentile gives the same four
  years; the 99th narrows to 2011–2012.
- **The intolerability pattern does not reproduce.** P(FAR > 0.5) is
  **0.0%** at all three triggers (30/50/70%), against the paper's 24% /
  19% / 18%, and operational FAR is 0.0 for every action at every
  trigger. POD is modest (water storage 0.29 / 0.23 / 0.20 at 30/50/70%),
  so this is not a story of a sharper system — it is a story of a
  system whose false alarms, in this window and on this model version,
  never accumulate into an intolerable year.
- **The narrow FAR confidence intervals do not overturn the paper.**
  The bootstrap CIs here (upper bounds 0.07–0.09 at Magoro) look tight
  only because verification is **model-vs-model**: the "truth" series
  is the GloFAS v4 lead-24h ensemble-median proxy checked against its
  own consolidated historical run (correlation 0.9999), not an
  independent gauge or impact record. Near-zero FAR is consistency of
  one model family with itself, not demonstrated skill against real
  floods. The paper's formal indeterminacy against independent truth
  stands; this run does not claim otherwise.

What is **not** demonstrated, and must not be claimed: skill against
real flood events (the Akokoro gauge correlation of 0.52 is still not
computable — the gauge series is not open and will not be approximated
or substituted); transfer to any other basin; reliability (the paper
could not establish it, and neither does this run); or that the
divergence is caused by any single drift item in §3.3. The drift
register is the honest partial account — 51 → 11 members quantises the
30/50/70% triggers to effective 36/55/73%, Mon/Thu initialisations
replace daily sampling, the 24h proxy replaces lead-0, and v4.0 at
0.05° replaces the paper's pre-operational 0.1° — but attributing the
gap to one of these, rather than their combination plus the different
window behaviour, would itself be an unverified claim.

The reason this result strengthens rather than weakens the project: a
researcher who trusted the paper's intolerability pattern to set a
trigger on current GloFAS data would have been calibrating against a
pattern that does not hold on that data. That is precisely what the
workbench is for — letting the researcher run the check themselves,
with the drift and the model-vs-model caveat visible, before writing
the trigger into an Early Action Protocol.

## 5. How to check / resume the pull

- Progress: `pull/pull_v3_stdout.log`, `pull/pull_log_v3.jsonl`,
  markers `pull/raw/A|B/*.done.json`; hist adoption:
  `pull/adopt_hist_stdout.log`.
- If the pullers are dead (machine restart kills them; a service restart
  did so once during this run): relaunch with
  `setsid nohup .venv/bin/python pull/pull_v3.py >> pull/pull_v3_stdout.log 2>&1 < /dev/null &`
  and the same for `pull/adopt_hist.py`. Markers make both resumable;
  already-downloaded chunks are skipped.
- When all 29 v3 jobs show `ok`/`skipped`: run
  `.venv/bin/python pull/extract_points.py` then
  `.venv/bin/python pull/reproduce.py`, and fill §3.1 from
  `data/glofas/teso_v4/results.json`.
- To extend later to the full PHASE1 spec (2003–2022, leads 24–240):
  `pull/pull_full.py` encodes it — but submit in small batches over
  days, not a burst, to avoid re-triggering the priority penalty.

**Addendum (2026-10-22, ~04:40 UTC):** the v3 puller and
`adopt_hist.py` are retired (superseded, markers compatible). The pull
now runs under **`pull/pull_seq.py`** — strictly one job at a time, per
the server's explicit instruction — covering the same v3 scope
(2009–2014 quarters, leads 24/96/168, plus historical per-year jobs;
historical 2009 already landed via adoption of job 948de583). Progress:
`pull/pull_seq_stdout.log`, `pull/pull_log_seq.jsonl`, markers
`pull/raw/A|B/*.done.json`. If the runner is dead, relaunch with
`setsid nohup .venv/bin/python pull/pull_seq.py >> pull/pull_seq_stdout.log 2>&1 < /dev/null &`
(run from `~/workspace/trigger-lab`). Do not relaunch `pull_v3.py` or
run anything in parallel with `pull_seq.py` — parallel submitters are
what clogged the per-dataset queue. Q1's total runtime will be the
first clean (post-penalty) per-chunk processing measurement; at
tens-of-minutes per chunk the 29-chunk window is an unattended
many-hours run, with the 2009 pilot set (Q1–Q4 + historical 2009)
landing first.

---

## 6. 2009 pilot (2026-10-23)

*Scope: the five 2009 chunks only (reforecast Q1–Q4 + historical 2009).
This supersedes the §4 "not yet run" status for the pilot scope only;
the §3.1 acceptance table still awaits the 2009–2014 pack. Full pilot
output: `data/glofas/teso_v4/results_pilot2009.json` (driver:
`pull/reproduce_pilot2009.py`, same core calls, censoring rule and seed
as `pull/reproduce.py`).*

**Adaptations and one defect found.** Extraction ran from
`pull/extract_points_pilot.py`, a copy of `extract_points.py` differing
in exactly two places: (1) its RAW path points at `pull/raw_pilot/`,
a staging directory of symlinks to the five 2009 GRIBs only, so the
still-running sequential pull (2010 Q1 in flight) cannot leak later
years into the pilot pack; (2) a fix for a real defect in
`extract_points.py` as shipped: in this environment
`xr.open_datasets` does not exist, and the fallback plain
`xr.open_dataset` on a mixed control+perturbed GRIB raises cfgrib
`DatasetBuildError` ("multiple values for unique key"). The pilot copy
opens the two dataTypes separately (`filter_by_keys={'dataType':
'cf'|'pf'}`, as cfgrib itself suggests). **The defect is also in
`extract_points.py` and must be ported before the full-window run** —
the §2.5 smoke validation never hit it because the smoke file was
control-only. The computation core was used unmodified.

### 6.1 What the 2009 pack contains

- **175 initialisation dates per point** in 2009 (Jan 1 – Dec 28),
  leads 1/4/7 days, **11 members complete for every (init, lead)**
  (525/525). The as-pulled v4 hindcast calendar is *denser* than the
  ~104/yr Mon/Thu estimate in PHASE0 §3 / §2.3 above: gaps of 1–4 days,
  median spacing 2 days. Consequences: pilot pair counts are larger
  than planned, and the bootstrap's 60-day block is **30 samples**
  (core computes this from spacing), not ~17.
- Proxy (lead-24h ensemble median) span: 2009-01-02 – 2009-12-29,
  175 samples per point. Historical consolidated: 365 daily values per
  point spanning **2009-01-02 – 2010-01-01** (the "2009" file starts a
  day late and ends a day into 2010 — a boundary quirk of the product,
  recorded here because one Kapelebyong exceedance date below is
  2010-01-01).
- Proxy-vs-historical correlation on shared dates: 0.998 (Magoro),
  0.99997 (gauge), 0.968 (Kapelebyong). This is model-vs-model
  consistency under shared forcing — **not** validation against
  observations, and not the paper's 0.52 gauge check.

### 6.2 Danger levels, exceedances, and the DesInventar 2009 record

DesInventar first, because it frames everything: **zero flood records
in 2009 for Katakwi, for Amuria, and for the Magoro, Ngariam and
Kapelebyong sub-counties** (24 flood records nationally). The paper's
flood years were 2010–2012; 2009 is a no-reported-flood year in the
study area, exactly as PHASE1 §1's table implied.

Danger levels below are *within-2009* percentiles (the pilot computes
them on the single year on disk; the paper's were computed on its full
record). A percentile produces exceedances by construction, so a
no-flood year cannot "pass" the paper's year-matching test on its own —
the test only discriminates across years. What 2009 can show is where
the exceedances fall and whether they are hydrologically coherent.

| Point | Danger 95 (proxy) | Danger 95 (hist) | Proxy exceedance samples at p95 |
|---|---|---|---|
| Apapi at Magoro (800 km²) | 0.572 m³/s | 0.713 m³/s | 9 — **all in January**: Jan 2, 5, 9, 12, 16, 19, 23, 26, 30 |
| Akokoro gauge pixel (13,003 km²) | 2.519 m³/s | 2.488 m³/s | 9 — Apr 19, 21, 23; May 17, 19, 21, 23, 24; Jun 4 |
| Akokoro at Kapelebyong (123 km²) | 0.0938 m³/s | 0.0938 m³/s | 7 — Apr 14, 16; May 14; Oct 10, 11, 31; Dec 29 |

Sensitivity (proxy): Magoro p93 = 0.438 (11 samples, Jan + May 17),
p99 = 0.982 (2 samples, Jan 2/5). Gauge p93 = 2.347 (13 samples),
p99 = 3.432 (2 samples, May 19/21). Kapelebyong: **p93 level equals
the p95 level (0.0938 m³/s)** — discharge at this 123 km² pixel is so
coarsely quantised in the GRIB (0.031/0.063/0.094/0.125 …) that
percentile selection between 93 and 95 is meaningless there in a
single year; p99 = 0.133 (2 samples).

The pattern is coherent at two of three points: the gauge pixel's
exceedances sit in the April–June long rains (its historical monthly
maximum is in May), and Kapelebyong's split across the April–May and
October–December seasons. **Magoro is the exception** (see §6.4):
every one of its top flows is a single decaying episode occupying the
first ~3 weeks of the record (historical daily values fall smoothly
from 1.17 m³/s on Jan 2 through 0.72 on Jan 20 to 0.28 by Feb 13;
January's monthly maximum, 1.17, is more than double any other
month's). The episode's peak sits at or before the window's first
day — the event began in December 2008, outside the pulled record.

### 6.3 Action scoring, 2009 (pair counts shown; all provisional)

Scored initialisations after the right-censoring rule: water storage
(4 d lead / 30 d life) 165/175; water drainage (4 d / 90 d) 131/175;
food storage (7 d / 30 d) 164/175. H/M/FA/CN are pair counts;
POD = hit rate; FAR = pair false alarm ratio; "op." = the operational
(suppression) protocol: actions fired / hit, and its FAR.

**Apapi at Magoro** — every observed-event pair traces to the single
January episode:

| Action | Trig | H | M | FA | CN | POD | FAR | op. actions (hit) | op. FAR |
|---|---|---|---|---|---|---|---|---|---|
| water storage | 0.30 | 8 | 0 | 0 | 157 | 1.00 | 0.00 | 1 (1) | 0.00 |
| water storage | 0.50 | 7 | 1 | 0 | 157 | 0.88 | 0.00 | 1 (1) | 0.00 |
| water storage | 0.70 | 7 | 1 | 0 | 157 | 0.88 | 0.00 | 1 (1) | 0.00 |
| water drainage | 0.30 | 8 | 0 | 0 | 123 | 1.00 | 0.00 | 1 (1) | 0.00 |
| water drainage | 0.50 | 7 | 1 | 0 | 123 | 0.88 | 0.00 | 1 (1) | 0.00 |
| food storage | 0.30 | 7 | 0 | 1 | 156 | 1.00 | 0.13 | 1 (1) | 0.00 |
| food storage | 0.70 | 6 | 1 | 1 | 156 | 0.86 | 0.14 | 1 (1) | 0.00 |

**Akokoro gauge pixel** — the long-rains season makes many
initialisations "event" pairs (30-day windows reaching the Apr–Jun
exceedance cluster), and the ensemble rarely reached even the 0.30
trigger ahead of them; it also never false-alarmed:

| Action | Trig | H | M | FA | CN | POD | FAR | op. actions (hit) | op. FAR |
|---|---|---|---|---|---|---|---|---|---|
| water storage | 0.30 | 11 | 30 | 0 | 124 | 0.27 | 0.00 | 2 (2) | 0.00 |
| water storage | 0.70 | 10 | 31 | 0 | 124 | 0.24 | 0.00 | 2 (2) | 0.00 |
| water drainage | 0.30 | 11 | 47 | 0 | 73 | 0.19 | 0.00 | 1 (1) | 0.00 |
| food storage | 0.30 | 12 | 28 | 0 | 124 | 0.30 | 0.00 | 2 (2) | 0.00 |
| food storage | 0.70 | 6 | 34 | 0 | 124 | 0.15 | 0.00 | 1 (1) | 0.00 |

**Akokoro at Kapelebyong** — the weakest site by a wide margin: seven
isolated exceedance samples make 59–94 of the scored pairs "event"
pairs (30–90-day windows around each), and the forecasts almost never
predicted them:

| Action | Trig | H | M | FA | CN | POD | FAR | op. actions (hit) | op. FAR |
|---|---|---|---|---|---|---|---|---|---|
| water storage | 0.30 | 3 | 56 | 1 | 105 | 0.05 | 0.25 | 2 (2) | 0.00 |
| water storage | 0.50 | 1 | 58 | 1 | 105 | 0.02 | 0.50 | 2 (1) | 0.50 |
| water storage | 0.70 | 0 | 59 | 0 | 106 | 0.00 | — | 0 (0) | — |
| water drainage | 0.30 | 1 | 93 | 1 | 36 | 0.01 | 0.50 | 1 (1) | 0.00 |
| water drainage | 0.50 | 0 | 94 | 1 | 36 | 0.00 | 1.00 | 1 (0) | 1.00 |
| food storage | 0.30 | 6 | 54 | 2 | 102 | 0.10 | 0.25 | 2 (2) | 0.00 |
| food storage | 0.70 | 0 | 60 | 0 | 104 | 0.00 | — | 0 (0) | — |

**Headline bootstrap** (water storage, 60-day blocks, 10,000 resamples,
seed as in `reproduce.py`) — read with §6.4 before quoting any of it:

| Point | P(FAR > 0.5) @ 0.30 | @ 0.50 | @ 0.70 | FAR 95% CI |
|---|---|---|---|---|
| Magoro | 0.00 | 0.00 | 0.00 | [0, 0] at all triggers |
| Gauge pixel | 0.00 | 0.00 | 0.00 | [0, 0] at all triggers |
| Kapelebyong | 0.009 | 0.394 | undefined — no forecast-yes in any resample | [0, 0.5] @ 0.30; [0, 1] @ 0.50 |

### 6.4 What this pilot does and does not establish — bluntly

The [0, 0] intervals at Magoro and the gauge pixel are **not**
evidence that those systems are tolerable. They are what a block
bootstrap returns when the observed sample contains zero false alarms
in one or two episodes: resampling cannot manufacture the false alarms
the single year never produced. The paper's reliability was
indeterminate with intervals spanning ~[0, 1]; a one-year pilot
returning a zero-width interval is the opposite failure shape —
overconfidence from a tiny, single-episode sample — and any narrower
reading is a misread. Kapelebyong's [0, 1] interval at the 0.50
trigger is the only pilot bootstrap output with the honest shape.

What the pilot **does** establish:

1. The full chain runs on real data end to end — GRIB → snapped point
   series → tested core → contingency tables and bootstrap — with no
   component substituted or stubbed.
2. The extraction/snapping layer is consistent with §2.4's analysis
   (identical snapped pixels and upstream areas), and the *_maxup
   sensitivity series behave as predicted (Magoro-maxup, on the
   main stem, reproduces the gauge pixel's Apr–Jun exceedance
   pattern rather than the Apapi's January one).
3. 2009 is a legitimately quiet year in the impact record and the
   modelled exceedances are seasonally coherent at two of three
   points; the verification machinery behaves sanely in a no-flood
   year (few firings, hits only where episodes occurred,
   Kapelebyong's near-zero detection exposed rather than hidden).
4. The one open scientific question the pilot raises: Magoro's
   January episode. It is a smooth model hydrograph, not a spike, and
   it appears in both the reforecast proxy and the consolidated run
   (which share forcing, so their agreement does not discriminate).
   Whether early January 2009 was a real Apapi high-flow spell — an
   event whose peak predates the record and which DesInventar does
   not report — or a model/forcing behaviour at that pixel can only
   be judged against the longer record: the full-window run will show
   whether January stands out in 2009 alone or recurs.

What it does **not** establish: anything about the paper's headline
numbers. P(FAR > 0.5) of 24/19/18% was computed over six flood
seasons including three flood years; a single no-flood year with one
to four exceedance episodes per point cannot confirm, refute, or be
averaged toward them. The danger levels here are within-2009
percentiles and will move when the window widens. Every statistic in
§6.2–6.3 is provisional and will be recomputed, not carried forward,
by the 2009–2014 run.

**Operational note (2026-10-23):** the sequential pull continues
(`pull/pull_seq.py` running detached; 2010 Q1 in flight at pilot
time). No systemd unit named `trigger-lab-pull.service` exists on
this machine — a restart attempt against that name was observed and
cannot have taken effect; the pull is the detached process §5's
addendum describes.

### 6.4 Port of the pilot extraction fix into `extract_points.py` (2026-10-23)

The §6 defect is fixed in the main script: `pull/extract_points.py`'s
`extract_reforecast` now opens each GRIB with a plain `xr.open_dataset`
and, on failure, falls back to opening the two dataTypes separately
(`filter_by_keys={'dataType': 'cf'|'pf'}`) — the pilot copy's logic,
ported without changing the script's RAW path, outputs, points,
snapping rules, or CLI behaviour. Verification: the ported script was
run against exactly the five 2009 chunks (reforecast Q1–Q4 + historical
2009) and its output compared with the pilot pack that produced
`results_pilot2009.json`. Identical: 34,650 forecast rows (525 per
point x member, all six points, members 0–10) and 2,190 analysis rows
(365 per point), with max discharge and lead0_proxy difference 0.0 on
every merged row and identical NaN patterns (spot check: apapi_magoro,
init 2009-01-01, lead 1, member 0 = 1.171875 in both). The full-window
2009–2014 run will use the ported script.
