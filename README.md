# Trigger Lab

An open calibration workbench for forecast-based flood early action.

Humanitarian researchers and agencies can calibrate forecast-based financing
triggers themselves: pick a basin, and the tool assembles archived flood
forecasts and historical impact records to compute hit rates, false alarm
ratios, and cost–loss curves across trigger thresholds, and exports a draft
Early Action Protocol (EAP) trigger annex.

**Live workbench:** https://rahul-05.github.io/trigger-lab/

**Method anchor:** Coughlan de Perez et al., NHESS 2015 + HESS 2016.

## Reproduction (Teso, Uganda, 2009–2014)

The workbench ships with a full reproduction on GloFAS v4 reforecast +
historical data for the Teso basin. Headline site Magoro:

- Danger level (95th percentile): 7.71 m³/s
- Exceedance years: 2010, 2011, 2012, 2013 (paper: 2010–2012)
- P(FAR > 0.5): 0.0% at 30/50/70% triggers (paper: 24/19/18%)

**Caveat that governs the numbers:** verification here is model-vs-model
(GloFAS v4 lead-24h proxy vs the consolidated historical run), not against
independent ground truth. The paper's gauge correlation (0.52) is not
computable — the gauge series is not openly available — and is never
approximated or substituted. See REPRODUCTION.md for the full comparison
table and drift register.

## Contents

- `index.html`, `styles.css`, `app.js`, `data.js` — the workbench (static, no build step)
- `DESIGN.md` — the design system
- `REPRODUCTION.md` — the full reproduction record
