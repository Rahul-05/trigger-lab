# Trigger Lab — Design System

## 1. Design rationale

Trigger Lab is a calibration bench for humanitarian researchers and agency
staff who must defend a trigger threshold in an operational plan, in front of
colleagues who will ask where every number came from. It is not a public
dashboard and must not behave like one: the reader is a specialist weighing
a trade-off, not a visitor being persuaded.

The language therefore borrows from a river-gauge logbook and a chart-recorder
trace: ruled paper, ink headings, figures that align down a column, thin rules
instead of shadows, and every trace labelled at the line itself. Nothing shouts.
The most prominent panel is not a result but a caveat, because here the limit
of the evidence is part of the result. If the design feels quiet, dense where
it must be, and slightly bureaucratic, it is working.

## 2. Design tokens

All colours are flat. No gradients, shadows, or translucent overlays over data. Text is ink on paper, never reversed out of a saturated colour except a button label.

### Colour — paper, ink, river

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F4F2EC` | Page background |
| `--surface` | `#FFFFFF` | Panels, tables, chart cards |
| `--surface-warm` | `#ECE8DF` | Secondary panels, table header row |
| `--ink` | `#1B2420` | Headings, body text, primary buttons |
| `--ink-2` | `#44524B` | Secondary text, axis labels, captions |
| `--ink-3` | `#6E7B74` | Tertiary text, units, provenance lines only |
| `--rule` | `#CFC9BC` | Panel borders, table rules, dividers |
| `--rule-strong` | `#8A857A` | Masthead rule, section dividers |
| `--river` | `#1D5350` | Primary actions, links, selected site, POD line |
| `--river-dark` | `#123937` | Primary button hover, active control |
| `--river-pale` | `#E2EBE8` | Selected-row wash, active tab wash |

### Warning vs. danger — deliberately different

A caveat is routine scientific context; a danger state means something is wrong
with the computation or input and the result must not be used. They must never
be confused. **Caveat / drift (amber, non-alarmist):** background `#FFF6D8`,
border `#C49A2C`, 4 px left rule `#C49A2C`, text `#5C4300`. Use for the
model-vs-model caveat, the drift register, provisional values, and forthcoming-
basin notices. Never red, never an exclamation icon alone. **Danger / blocked
(red, rare):** background `#FBEAEA`, border `#9B2226`, text `#6E1418`. Use only
for failed computation, invalid input, a broken data file, or an unverifiable
export — always paired with text stating what failed and what to do next.
**No good/bad colouring of results.** Hit rate, false alarm ratio, and cost-loss
values are always ink. Never green for "good" and red for "bad": a high false
alarm ratio is a finding, not an error.

### Chart colours

Thresholds use a single deepening blue sequence, so a higher threshold reads as a darker, heavier trace. Colour is always reinforced by dash style and marker shape, so charts survive greyscale printing and cheap screens.

| Series | Colour | Line | Marker |
|---|---|---|---|
| Trigger 30% exceedance | `#6FA3B8` | Solid | Circle |
| Trigger 50% exceedance | `#2A6B8A` | Solid | Square |
| Trigger 70% exceedance | `#0F2F44` | Solid | Triangle |
| POD | `#1D5350` | Solid | Circle |
| FAR | `#9C6B0F` | Dashed | Diamond |
| Cost-loss curve | `#1B2420` | Solid | None; optimum = hollow diamond + mono label |
| Cost-loss reference / diagonal | `#9AA49E` | Dotted | None |
| Confidence band | Same series colour, 15% opacity; hatched fill in print | — | — |

### Typography — system stacks only, no webfonts, works offline

- **Dossier headings (serif):** `Iowan Old Style, Palatino, Palatino Linotype, Georgia, serif` — masthead title, section titles, printed annex headings only. This serif use signals "formal document."
- **Interface / body (sans):** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` — controls, table body, captions, explanatory text.
- **Figures / code (mono):** `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace` — every number in tables and readouts, thresholds, dates, coordinates, file/provenance identifiers, with `font-variant-numeric: tabular-nums`.
- **Scale (size / line-height / weight):** masthead title 28 px / 1.15 / 700 serif; section title 20 px / 1.25 / 700 serif; panel title 15 px / 1.35 / 700 sans; body and table 14 px / 1.5 / 400; small / caption / provenance 12 px / 1.5 / 400; tiny / axis tick / footnote 11 px / 1.45 / 400; metric value 28 px / 1.1 / 700 mono; metric label 11 px / 1.4 / 700 sans, uppercase, letter-spacing 0.06em. Body text is never below 14 px; captions never below 11 px.

### Spacing, borders, radii

Spacing scale (4 px base): `4, 8, 12, 16, 24, 32, 48 px`. Panel padding 16 px (24 px on the annex); gutter between panels 16 px; section gap 32 px. Borders: 1 px solid `--rule` on panels and tables; 2 px solid `--rule-strong` under the masthead and above the annex. No box shadows anywhere; a 1 px border carries the structure. Radii: `2 px` on panels, controls, and buttons; `0 px` on tables and on everything in print. Nothing pill-shaped, nothing bubbly.

## 3. Component patterns

### Header / masthead

Full-width bar, paper background, 2 px `--rule-strong` rule underneath. Left: "TRIGGER LAB" in serif 28 px, with a 12 px uppercase sans subtitle: "Forecast-based financing — trigger calibration workbench." Right, in mono 12 px: basin, period, and data version (e.g. "Teso, Uganda · 2009–2014 · GloFAS v4"). No logo mark, no illustration. Navigation only: Workbench / Method / Annex. Method opens the Coughlan de Perez et al. (NHESS 2015; HESS 2016) note, not a marketing page.

### Basin / site picker

One horizontal bar directly under the masthead, surface background, 1 px border.
Two labelled selects: **Basin** and **Site**. First basin: Teso, Uganda. Sites:
Magoro, Akokoro gauge pixel, Kapelebyong — each option shows its name and, in
muted text, its gauge or pixel identifier. A basin with no assembled data appears
disabled, labelled "Forthcoming — data not yet assembled," and cannot be selected
into a fake result (see §5). Changing basin or site recomputes the whole page
and updates the masthead line, caveat panel, and annex header together; the page
never shows one basin's name with another basin's numbers.

### Control panel

Left-rail panel, surface background, titled "Calibration controls," in this
order: threshold selector (three explicit radios — 30% / 50% / 70% ensemble
exceedance, each with its line colour and marker swatch); lead-time selector
(discrete steps, not a free slider, so every value maps to a computed lead time);
event definition (flood threshold and impact-record source, as selects with
provenance text beneath); "Recompute" primary button. Sliders are not used for
thresholds: a slider implies a continuum the verification does not support.
Every control has a visible label above it, never placeholder-only text, and its
current value in mono beside the label. Disabled controls are greyed with a
one-line reason, never silently inactive.

### Verification table

The core output. Surface background, 1 px border, header row in `--surface-warm`
with 11 px uppercase labels. Columns, in order: threshold, lead time, hits,
misses, false alarms, correct negatives, POD, FAR, cost-loss ratio at the selected
cost-loss ratio — numeric columns in mono, right-aligned, tabular figures. Rows
group by threshold with a thin rule between groups. The selected threshold row
carries a `--river-pale` wash plus a 2 px left rule in its threshold colour.
Tables scroll horizontally on narrow screens with the first column pinned; a
number never wraps across two lines. Directly beneath: a 12 px provenance line
(source files, reforecast version, impact-record source, computation date).

### Chart panel

Surface background, panel title in sans 15 px, subtitle stating exactly what is
plotted (metric, threshold set, lead-time range, n). Axes in ink with 11 px tick
labels; gridlines 1 px `#E3DFD5`, never darker than the data. Each line is labelled
at its end or optimum point, not only in a legend. Hover (desktop) and tap (touch)
show a readout with exact value, confidence interval, and n — never a bare point
value. Charts are inline SVG, no chart library asset, so they print as vector.
Cost-loss panels always show the reference diagonal and mark the minimum-cost
point with a hollow diamond and mono label.

### Caveat / drift panel

Full-width amber panel (§2) titled "Read this before using these numbers," in
fixed order: (1) the model-vs-model caveat in one plain sentence — verification
compares the GloFAS v4 forecast proxy against its own historical run, not against
independent ground truth; (2) the drift register as a compact table: ensemble
51 → 11 members; daily → Mon/Thu initialisations; lead-0 → 24 h proxy; v4.0 0.05°
grid vs. the paper's 0.1°; (3) what each drift item can and cannot change about
the reading. Expanded by default. It may collapse to a one-line summary bar keeping
the words "Model-vs-model — not ground truth" visible; it may never be dismissed
entirely, and it is repeated in condensed form at the top of the printed annex.

### Metric readout

A row of three to four readouts above the table: POD, FAR, and cost-loss value
for the selected threshold and lead time. Each readout: 11 px uppercase label,
28 px mono value, and beneath it a 12 px line giving the 95% confidence interval
and n (e.g. "95% CI 0.52–0.71 · n = 41 events"). If an interval cannot be computed,
the line reads "CI not computable — n too small" rather than omitting the line.
No readout ever shows a value without its interval line.

### Annex export panel

Panel titled "Early Action Protocol — trigger annex (draft)." It shows: annex
title, basin and site, selected threshold and lead time, headline verification
table, cost-loss figure, caveat and drift register, and provenance block. Two
buttons only: "Preview annex" (secondary) and "Print / save as PDF" (primary).
Preview renders the annex exactly as it will print, including page breaks. The
annex is always labelled "DRAFT — for agency review, not an operational trigger
until adopted." No export is offered without the caveat page included.

### Buttons

- **Primary:** `--river` background, white text, 14 px, 700 weight, 2 px radius,
  padding 10 px 16 px. Hover: `--river-dark`. One primary per panel.
- **Secondary:** transparent background, 1 px `--ink` border, ink text, same size
  and padding. Hover: `--surface-warm` wash.
- **Quiet:** borderless text button in `--river`, for "Show method note" and
  "Collapse" only. Never for a destructive or export action.
- All buttons have a visible 2 px focus outline offset by 2 px. Disabled buttons
  use `--ink-3` text on `--surface-warm` with a reason in adjacent text.

### Print styles (annex)

`@media print` resets to black ink on white paper: backgrounds removed except the
caveat panel, which prints with its amber border and a hatched left rule so it
survives greyscale printing. Controls, picker bar, and buttons are hidden. Serif
headings, mono figures, 12 pt body minimum. Page breaks fall before the annex
title, before the drift register, and before the provenance block — never through
a table row. Every printed page carries a footer in 10 px mono: basin, site,
threshold, lead time, data version, and page number ("Page X of Y").

## 4. Layout system

Desktop-first, for a specialist at a desk, with a usable field fallback. Page:
max-width 1440 px, centred, 24 px side padding, 16 px gutters, CSS grid (no
framework). Order on desktop (≥ 1100 px), top to bottom, no exceptions:
1. Masthead. 2. Basin/site picker bar. 3. Caveat/drift panel, full width.
4. Main row: control panel 300 px on the left; results column on the right,
containing metric readouts, verification table, then charts in two columns
(POD/FAR chart beside cost-loss chart). 5. Annex export panel, full width of
the results column. The caveat panel sits above the results and above the fold
on a typical laptop viewport: a reader must see it before, not after, the first
verification number. It is not in a sidebar, not in a tab, and not below the
charts. Mobile fallback (< 900 px): a single column in the same order. The
control panel collapses into a labelled disclosure ("Calibration controls —
50%, 7-day lead") that stays expandable; the caveat panel stays fully expanded.
Charts stack vertically; tables scroll horizontally. Between 900 px and 1100 px,
the control panel narrows to 260 px and the charts stack; nothing else changes order.

## 5. Accessibility and data-integrity rules

- **Contrast and focus:** body text at least 4.5:1 against its background; large
  headings at least 3:1; chart lines at least 3:1 against the panel, plus dash and
  marker encoding so no series relies on colour alone. Focus is always visible.
  Motion is limited to control-state changes; charts never animate on load.
- **Uncertainty is never optional.** Every point value — in a readout, table cell,
  chart tooltip, and annex — is accompanied by its 95% confidence interval and n,
  or by an explicit "CI not computable" line. A value without an interval is
  treated as a rendering bug.
- **No data is never a number.** A missing cell shows "—" with the caption
  "No record" and the reason (e.g. "No impact record for this window"). A
  forthcoming basin shows an empty-state panel, not a table: "No verification
  computed yet. Data assembly for this basin has not begun," with the expected
  sources listed. Zero is shown only when zero events were genuinely observed or
  forecast, and the cell then still carries its interval and n. Nothing is
  interpolated, smoothed over a gap, or filled with a neighbouring value without a
  visible "interpolated" flag — and the default is not to interpolate at all.
- **Copy tone:** plain, precise, no hype, no verdicts. Say "POD 0.62 (95% CI
  0.52–0.71)" rather than "strong performance." Never write "safe," "walk away,"
  "recommended trigger," or any equivalent verdict: the tool presents the
  trade-off and leaves adoption to the agency. Caveat sentences use "compared
  against" and "not against," never "only" as a softener. Method names, versions,
  and dates are stated in full on first use in each panel.

## 6. Do / do not

**Do:** put the caveat and drift register above the results, on every view and in
every export; label every line, axis, table, and figure with its metric, threshold,
lead time, period, and n; use mono tabular figures for all numbers and keep
intervals with their point values everywhere, including print; design for print
first for the annex, and for low light and cheap screens everywhere else — high
contrast, flat colour, no fine grey text on grey; write like a logbook: dated,
sourced, and revisable, with a provenance line on every panel.
**Do not:** use mascots, illustrations, playful cards, gamified badges, streaks, or
marketing visuals of any kind; use red/green good/bad colouring for verification
results, or red for caveats; bury uncertainty in footnotes, tooltips-only, or a
separate "details" page; fabricate a number for a missing record, disguise a gap
as zero, or show a forthcoming basin as if computed; issue verdicts ("safe,"
"walk away," "best trigger") or promotional language ("powerful," "game-changing,"
"AI-powered"); depend on paid fonts, stock imagery, external assets, accounts, or
billing — system stacks and inline SVG only; add a feature that hides the method:
every computed number must trace, on the same page, to its source files and version.

## 7. Simple view, place search, mobile, and porting (added October 30, 2026)

These patterns extend the system above; they do not replace it. The caveat
panel, drift register, and no-verdict rule apply identically in both views,
and every number in Simple view traces to the same embedded data as the
technical view.

### Simple view
- A Technical / Simple toggle sits above the picker. Both views share one
  page, one control rail, and one data object; switching views never
  recomputes or changes a number. The technical view is unchanged.
- Simple translates without dumbing down: the danger level is explained as
  "the river-flow level used here to mark a flood worth acting on";
  caught / missed / false alarm are defined in one clause each ("forecast
  warned and the river crossed" / "river crossed but no warning" / "warning
  but the river did not cross"); cost-loss is stated as spend per 100 units
  of flood damage, with the value as "the share of the gap between preparing
  every time and perfect foresight that the forecast route closes."
- The exceedance timeline shows one chip per study-window year; crossing
  years are filled river-teal, user-supplied years are dashed amber, a year
  in both gets both treatments. Years outside the study window are listed
  in text, never plotted.
- The river gauge is schematic, not a recording: a tube with a dashed
  danger line labelled with the real danger value, and water that rises to
  the line. The caption always says the animation is illustrative. This is
  the one sanctioned exception to "charts never animate on load": the gauge
  animates once on entering Simple view (a control-state change), and
  `prefers-reduced-motion` renders it statically at the final level.
- Simple view is hidden in print; the annex remains the printable record.

### Place search
- One search box in the picker, resolved only over a built-in gazetteer
  (basin and site names plus variant spellings; no live geocoder, no keys).
  Bare country names deliberately do not resolve — a country is not a basin.
- A packed basin resolves fully (a site name also selects that site). A
  planned basin resolves to its forthcoming state. Any other name gets an
  honest empty state naming what a pack for that place would require
  (pour point, sequential GloFAS pull, impact records) and that it can be
  requested. No numbers are ever shown for an unmatched or unpacked place.

### Mobile
- Below 600px the layout is a single column: picker stacks, readouts stack
  to one column, charts already stack from 900px. Below 390px padding and
  readout sizes tighten further.
- Every touch target is at least 44px tall (buttons, selects, radio rows,
  the range input). Charts are fluid by viewBox and need no special casing.
- Results tables become cards on phones: each row is a bordered card and
  each cell carries its column label via a `data-label` attribute rendered
  as a small caps prefix. The caveat drift table keeps horizontal scroll
  (it is reference text, not results).
- Layout at 360px and 390px is verified by CSS review plus DOM behaviour
  checks; a real-browser visual check is not possible from the build VM
  (the managed browser cannot reach VM localhost and blocks the file host),
  so the live Pages URL is the eyeball step.

### Data porting
- A pack is one basin's assembled data, described by `workbench/pack.json`:
  basin id, display name, per-site pour-point lat/lon (target + snapped),
  catchment area, data sources, licence notes, file list, status.
- The full pipeline (basin config → sequential EWDS pull → extract_points
  → reproduce → pack JSON → basin-list registration) is documented in
  PACKING.md, including the licence facts: CEMS-FLOODS data may be
  redistributed with attribution; EM-DAT data may never be in a pack.
- The workbench offers a basin data download (CSV verification rows, JSON
  site object) from the embedded data, and a bring-your-own impact-records
  overlay: client-side CSV parse only, never uploaded, marked
  user-supplied on the timeline, never included in the annex or any
  download. Unparseable lines are shown in the danger-styled error box
  and skipped.

### Rendering rules added with this pass
- Reference labels inside charts are right-aligned within the viewBox
  (`text-anchor: end`) so full text such as "Climatology (dotted)" is never
  cut off at the panel edge.
- Percentiles use true ordinals (93rd, 95th, 99th), never a blanket "th".
- An explicit 0.0 is always rendered as a number (e.g. "0.0000"). A missing
  value renders as "— (no record)", never as a blank. The bootstrap value
  uses this rule explicitly, because a blank beside a present CI reads as a
  dropped number.
