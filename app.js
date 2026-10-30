/* Trigger Lab workbench — plain JS, no dependencies. All displayed numbers
   come from window.TRIGGERLAB_DATA (data.js), copied programmatically from
   data/glofas/teso_v4/results.json. Cost-loss formula matches
   core/triggerlab/costloss.py exactly. No verdicts are issued. */
(function () {
  "use strict";
  var D = window.TRIGGERLAB_DATA;
  if (!D) { document.body.innerHTML = "<p>Data file failed to load. Check that data.js sits beside index.html and loads before app.js.</p>"; return; }

  var SITES = [
    { id: "apapi_magoro", name: "Magoro", idLabel: "apapi_magoro" },
    { id: "akokoro_gauge", name: "Akokoro gauge pixel", idLabel: "akokoro_gauge" },
    { id: "akokoro_kapelebyong", name: "Kapelebyong", idLabel: "akokoro_kapelebyong" }
  ];
  var ACTIONS = {
    water_storage_purification: { label: "Water storage & purification", lead: 4, lifetime: 30 },
    water_drainage: { label: "Water drainage (trenches)", lead: 4, lifetime: 90 },
    food_storage: { label: "Food storage", lead: 7, lifetime: 30 }
  };
  var TRIGGERS = ["0.30", "0.50", "0.70"];
  var TRIG_LABEL = { "0.30": "30%", "0.50": "50%", "0.70": "70%" };
  var TRIG_COLOUR = { "0.30": "#6FA3B8", "0.50": "#2A6B8A", "0.70": "#0F2F44" };
  /* PAPER values — labelled PAPER everywhere, never mixed with this run. */
  var PAPER = {
    exceedanceYears: "2010–2012",
    pFarGt05: { "0.30": "24%", "0.50": "19%", "0.70": "18%" },
    gaugeCorr: "not computable — gauge series not open",
    source: "Coughlan de Perez et al. (NHESS 2015; HESS 2016), Teso study"
  };
  var FORTHCOMING = [
    { id: "karnali", name: "Karnali (Nepal)" },
    { id: "piura", name: "Piura (Peru)" },
    { id: "magdalena", name: "Magdalena (Colombia)" },
    { id: "zambezi", name: "Lower Zambezi" }
  ];

  var state = { basin: "teso", site: "apapi_magoro", leadFilter: "all", action: "water_storage_purification", trigger: "0.50", cl: 0.20 };

  function $(id) { return document.getElementById(id); }
  function fmt(x, d) { if (x === null || x === undefined || isNaN(x)) return "—"; return Number(x).toFixed(d === undefined ? 3 : d); }
  function pct(x, d) { if (x === null || x === undefined || isNaN(x)) return "—"; return (Number(x) * 100).toFixed(d === undefined ? 1 : d) + "%"; }
  function years(arr) { return arr.join(", "); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* Exact formula from core/triggerlab/costloss.py. */
  function costLoss(counts, cl) {
    var n = counts.hits + counts.misses + counts.false_alarms + counts.correct_negatives;
    var base = (counts.hits + counts.misses) / n;
    var expenseFcst = ((counts.hits + counts.false_alarms) * cl + counts.misses) / n;
    var expenseClim = Math.min(cl, base);
    var expensePerf = base * cl;
    var denom = expenseClim - expensePerf;
    var value = denom > 0 ? (expenseClim - expenseFcst) / denom : NaN;
    return { n: n, baseRate: base, expenseFcst: expenseFcst, expenseClim: expenseClim, expensePerf: expensePerf, value: value };
  }
  function clGrid(counts) {
    var out = [];
    for (var i = 1; i <= 99; i++) { var cl = i / 100; var r = costLoss(counts, cl); out.push({ cl: cl, expense: r.expenseFcst, clim: r.expenseClim, value: r.value }); }
    return out;
  }

  function visibleActions() {
    return Object.keys(ACTIONS).filter(function (k) {
      if (state.leadFilter === "all") return true;
      return String(ACTIONS[k].lead) === state.leadFilter;
    });
  }
  function point() { return D.points[state.site]; }
  function row(action, trig) { return point().actions[action].by_trigger[trig]; }

  function buildPicker() {
    var basin = $("basin-select");
    basin.innerHTML = '<option value="teso">Teso, Uganda — data assembled</option>' +
      FORTHCOMING.map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + ' — Forthcoming — data not yet assembled</option>'; }).join("");
    basin.value = state.basin;
    var site = $("site-select");
    site.innerHTML = SITES.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + ' (' + s.idLabel + ')</option>'; }).join("");
    site.value = state.site;
  }
  function buildActionOptions() {
    var sel = $("action-select");
    var vis = visibleActions();
    if (vis.indexOf(state.action) === -1) state.action = vis[0];
    sel.innerHTML = vis.map(function (k) {
      return '<option value="' + k + '">' + esc(ACTIONS[k].label) + ' — ' + ACTIONS[k].lead + '-day lead, ' + ACTIONS[k].lifetime + '-day lifetime</option>';
    }).join("");
    sel.value = state.action;
  }
  function syncControls() {
    $("basin-select").value = state.basin;
    $("site-select").value = state.site;
    $("site-select").disabled = state.basin !== "teso";
    $("site-note").textContent = state.basin !== "teso" ? "Site selection is unavailable: no data assembled for this basin." : "Changing site recomputes the whole page.";
    $("lead-select").value = state.leadFilter;
    buildActionOptions();
    $("action-select").disabled = state.basin !== "teso";
    document.querySelectorAll('input[name="trigger"]').forEach(function (r) {
      r.checked = (r.value === state.trigger); r.disabled = state.basin !== "teso";
    });
    $("cl-slider").disabled = state.basin !== "teso";
    $("cl-slider").value = Math.round(state.cl * 100);
    $("cl-value").textContent = state.cl.toFixed(2);
    $("controls-summary").textContent = "Calibration controls — " + TRIG_LABEL[state.trigger] + ", " +
      (state.leadFilter === "all" ? "all lead times" : state.leadFilter + "-day lead");
    $("masthead-meta").textContent = (state.basin === "teso" ? "Teso, Uganda · " + point().label + " · 2009–2014 · GloFAS v4" : "Basin forthcoming — no data assembled");
    $("print-footer-text").textContent = "Basin: " + (state.basin === "teso" ? "Teso, Uganda" : state.basin) +
      " · Site: " + (state.basin === "teso" ? point().label : "—") +
      " · Trigger: " + TRIG_LABEL[state.trigger] +
      " · Lead: " + (state.leadFilter === "all" ? ACTIONS[state.action].lead + "-day (selected action)" : state.leadFilter + "-day") +
      " · GloFAS v4 · 2009–2014";
  }

  function renderCaveat() {
    var di = D.desinventar;
    $("desinventar-lines").innerHTML =
      "<li>MAGORO (sub-county) record years: " + esc(di.MAGORO.record_years.join(", ")) + " (n records " + di.MAGORO.n_records + ").</li>" +
      "<li>KATAKWI (district) record years: " + esc(di.KATAKWI.record_years.join(", ")) + " (n records " + di.KATAKWI.n_records + ").</li>" +
      "<li>AMURIA (district) record years: " + esc(di.AMURIA.record_years.join(", ")) + " (n records " + di.AMURIA.n_records + ").</li>";
  }

  function renderResults() {
    var p = point(), a = ACTIONS[state.action], r = row(state.action, state.trigger);
    var boot = p.headline_bootstrap[state.trigger];
    var clRes = costLoss(r, state.cl);
    var nScored = p.actions[state.action].n_inits_scored;

    $("site-heading").textContent = p.label + " — " + a.label;
    $("selection-line").textContent = "Teso, Uganda · " + p.label + " (" + p.point_id + ") · " + a.label +
      " · " + a.lead + "-day lead, " + a.lifetime + "-day lifetime · trigger " + TRIG_LABEL[state.trigger] +
      " · C/L " + state.cl.toFixed(2) + " · proxy span " + p.proxy_span[0] + " to " + p.proxy_span[1];
    $("danger-proxy").textContent = fmt(p.danger95_proxy, 4);
    $("danger-proxy-n").textContent = "95th percentile of lead-24h proxy · n = " + p.n_proxy_days + " proxy days · CI not computable — no interval in source results";
    $("danger-hist").textContent = fmt(p.danger95_hist, 4);
    $("danger-hist-n").textContent = "95th percentile of consolidated historical run · n = " + p.n_hist_days + " historical days · CI not computable — no interval in source results";
    $("exceed-years").textContent = years(p.hist95_exceedance_years);
    $("exceed-years-paper").textContent = PAPER.exceedanceYears;
    $("proxy-corr").textContent = fmt(p.proxy_vs_hist_corr, 5);
    $("proxy-corr-n").textContent = "Lead-24h proxy compared against its own historical run · n = " + p.proxy_vs_hist_n + " · CI not computable — no interval in source results";
    $("gauge-corr").textContent = PAPER.gaugeCorr;
    $("readout-pod").textContent = fmt(r.pod, 3);
    $("readout-pod-ci").textContent = "CI not computable — no interval in source results · n = " + nScored + " scored initialisations";
    $("readout-far").textContent = fmt(r.far_pairs, 3);
    $("readout-far-ci").textContent = "Pair FAR · CI not computable — no interval in source results · n = " + nScored + " scored initialisations";
    $("readout-opfar").textContent = fmt(r.operational_far, 3);
    $("readout-opfar-ci").textContent = "Operational FAR · actions " + r.n_actions_hit + " of " + r.n_actions + " hit · CI not computable — no interval in source results";
    $("readout-value").textContent = isNaN(clRes.value) ? "—" : fmt(clRes.value, 3);
    $("readout-value-ci").textContent = "Computed from the displayed contingency counts at C/L " + state.cl.toFixed(2) + " — not measured data · n = " + clRes.n;

    /* Verification table: all three triggers for the selected action. */
    $("verify-body").innerHTML = TRIGGERS.map(function (t) {
      var rr = row(state.action, t), cc = costLoss(rr, state.cl);
      var sel = t === state.trigger ? ' class="selected"' : "";
      var sw = t === "0.30" ? "●" : (t === "0.50" ? "■" : "▲");
      return "<tr" + sel + "><td class=\"txt\"><span style=\"color:" + TRIG_COLOUR[t] + "\">" + sw + "</span> " + TRIG_LABEL[t] + " exceedance</td>" +
        "<td class=\"txt\">" + a.lead + "-day</td><td>" + rr.hits + "</td><td>" + rr.misses + "</td><td>" + rr.false_alarms + "</td><td>" + rr.correct_negatives + "</td>" +
        "<td>" + fmt(rr.pod, 3) + "</td><td>" + fmt(rr.far_pairs, 3) + "</td><td>" + fmt(rr.pofd, 4) + "</td>" +
        "<td>" + fmt(rr.operational_far, 3) + "</td><td>" + rr.n_actions_hit + " / " + rr.n_actions + "</td>" +
        "<td>" + (isNaN(cc.value) ? "—" : fmt(cc.value, 3)) + "</td><td>" + nScored + "</td></tr>";
    }).join("");
    $("verify-note").textContent = "POD, pair FAR, POFD and operational FAR carry no confidence interval in the source results — the line below each readout states this explicitly rather than omitting it. " +
      "Cost-loss value is computed from the displayed contingency counts at the selected C/L, not measured data. Source: data/glofas/teso_v4/results.json · GloFAS v4 · 2009–2014.";

    /* Sensitivity table with paper comparison column. */
    $("sens-body").innerHTML = p.sensitivity_proxy.map(function (s) {
      return "<tr><td class=\"txt\">" + fmt(s.percentile, 0) + "th percentile</td><td>" + fmt(s.level, 4) + "</td><td>" + s.n_exceedance_days + "</td><td class=\"txt\">" + years(s.exceedance_years) + "</td>" +
        "<td class=\"txt\">" + (s.percentile === 95 ? PAPER.exceedanceYears + " (PAPER)" : "— No record") + "</td></tr>";
    }).join("");

    /* Bootstrap panel. */
    $("boot-p").textContent = fmt(boot["p_far_gt_0.5"], 4);
    $("boot-ci").textContent = "95% CI " + fmt(boot.far_ci_low, 3) + "–" + fmt(boot.far_ci_high, 3) + " · n_valid = " + boot.n_valid + " · block samples = " + boot.block_samples;
    $("boot-paper").textContent = "PAPER: P(FAR > 0.5) = " + PAPER.pFarGt05[state.trigger] + " at " + TRIG_LABEL[state.trigger] + " (" + PAPER.source + ").";
    $("boot-note").textContent = "Bootstrap values are this run's headline bootstrap for " + p.label + " at trigger " + TRIG_LABEL[state.trigger] + ". The PAPER figure is a different study's result, shown for comparison only.";

    renderPodFarChart();
    renderCostLossCharts(r);
    renderAnnexPreview(p, a, r, boot, clRes, nScored);
  }

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    parent.appendChild(el); return el;
  }
  function axes(svg, W, H, L, T, R, B, xTicks, yTicks, xLabel, yLabel) {
    /* xTicks/yTicks: [{v,label}] in data coords mapped by caller via scales passed as functions on svg._sx/_sy */
    var sx = svg._sx, sy = svg._sy;
    yTicks.forEach(function (t) {
      svgEl("line", { x1: L, y1: sy(t.v), x2: W - R, y2: sy(t.v), stroke: "#E3DFD5", "stroke-width": 1 }, svg);
      svgEl("text", { x: L - 6, y: sy(t.v) + 4, "text-anchor": "end", class: "tick" }, svg).textContent = t.label;
    });
    xTicks.forEach(function (t) {
      svgEl("line", { x1: sx(t.v), y1: T, x2: sx(t.v), y2: H - B, stroke: "#E3DFD5", "stroke-width": 1 }, svg);
      svgEl("text", { x: sx(t.v), y: H - B + 16, "text-anchor": "middle", class: "tick" }, svg).textContent = t.label;
    });
    svgEl("line", { x1: L, y1: H - B, x2: W - R, y2: H - B, stroke: "#1B2420", "stroke-width": 1 }, svg);
    svgEl("line", { x1: L, y1: T, x2: L, y2: H - B, stroke: "#1B2420", "stroke-width": 1 }, svg);
    svgEl("text", { x: (L + W - R) / 2, y: H - 2, "text-anchor": "middle", class: "axis-label" }, svg).textContent = xLabel;
    svgEl("text", { x: 12, y: (T + H - B) / 2, "text-anchor": "middle", class: "axis-label", transform: "rotate(-90 12 " + ((T + H - B) / 2) + ")" }, svg).textContent = yLabel;
  }
  function marker(svg, shape, cx, cy, colour, filled) {
    if (shape === "circle") svgEl("circle", { cx: cx, cy: cy, r: 5, fill: filled ? colour : "#fff", stroke: colour, "stroke-width": 2 }, svg);
    else if (shape === "square") svgEl("rect", { x: cx - 5, y: cy - 5, width: 10, height: 10, fill: filled ? colour : "#fff", stroke: colour, "stroke-width": 2 }, svg);
    else if (shape === "diamond") svgEl("rect", { x: cx - 5, y: cy - 5, width: 10, height: 10, fill: filled ? colour : "#fff", stroke: colour, "stroke-width": 2, transform: "rotate(45 " + cx + " " + cy + ")" }, svg);
    else if (shape === "triangle") svgEl("path", { d: "M " + cx + " " + (cy - 6) + " L " + (cx - 6) + " " + (cy + 5) + " L " + (cx + 6) + " " + (cy + 5) + " Z", fill: filled ? colour : "#fff", stroke: colour, "stroke-width": 2 }, svg);
  }

  function renderPodFarChart() {
    var box = $("chart-podfar"); box.innerHTML = "";
    var W = 560, H = 300, L = 48, T = 16, R = 90, B = 44;
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "POD and pair FAR across trigger thresholds" }, box);
    svg._sx = function (i) { return L + i * (W - L - R) / 2; };
    svg._sy = function (v) { return T + (1 - v) * (H - T - B); };
    axes(svg, W, H, L, T, R, B,
      [{ v: 0, label: "30%" }, { v: 1, label: "50%" }, { v: 2, label: "70%" }],
      [0, 0.25, 0.5, 0.75, 1].map(function (v) { return { v: v, label: v.toFixed(2) }; }),
      "Trigger threshold (ensemble exceedance)", "POD / pair FAR");
    var pods = TRIGGERS.map(function (t) { return row(state.action, t).pod; });
    var fars = TRIGGERS.map(function (t) { return row(state.action, t).far_pairs; });
    function line(vals, colour, dash) {
      var d = vals.map(function (v, i) { return (i ? "L" : "M") + svg._sx(i).toFixed(1) + " " + svg._sy(v).toFixed(1); }).join(" ");
      var p = svgEl("path", { d: d, fill: "none", stroke: colour, "stroke-width": 2 }, svg);
      if (dash) p.setAttribute("stroke-dasharray", "6 4");
    }
    line(pods, "#1D5350"); line(fars, "#9C6B0F", true);
    pods.forEach(function (v, i) { marker(svg, "circle", svg._sx(i), svg._sy(v), "#1D5350", true); });
    fars.forEach(function (v, i) { marker(svg, "diamond", svg._sx(i), svg._sy(v), "#9C6B0F", true); });
    svgEl("text", { x: W - R + 8, y: svg._sy(pods[2]) + 4, class: "tick", fill: "#1D5350" }, svg).textContent = "POD " + fmt(pods[2], 3);
    svgEl("text", { x: W - R + 8, y: svg._sy(fars[2]) + 4, class: "tick", fill: "#9C6B0F" }, svg).textContent = "FAR " + fmt(fars[2], 3);
    $("podfar-values").innerHTML = TRIGGERS.map(function (t) {
      var rr = row(state.action, t);
      return "<li>" + TRIG_LABEL[t] + ": POD " + fmt(rr.pod, 3) + ", pair FAR " + fmt(rr.far_pairs, 3) + " — CI not computable — no interval in source results · n = " + point().actions[state.action].n_inits_scored + " scored.</li>";
    }).join("");
    $("podfar-subtitle").textContent = "POD (solid, circle, #1D5350) and pair FAR (dashed, diamond, #9C6B0F) across 30 / 50 / 70% triggers · " +
      ACTIONS[state.action].label + " · " + point().label + " · n = " + point().actions[state.action].n_inits_scored + " scored initialisations per trigger.";
  }

  function renderCostLossCharts(counts) {
    var grid = clGrid(counts);
    function oneChart(boxId, seriesFn, yDomain, yLabel, refFn, refLabel) {
      var box = $(boxId); box.innerHTML = "";
      var W = 560, H = 280, L = 48, T = 16, R = 110, B = 44;
      var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img" }, box);
      svg._sx = function (cl) { return L + cl * (W - L - R); };
      svg._sy = function (v) { return T + (yDomain[1] - v) / (yDomain[1] - yDomain[0]) * (H - T - B); };
      var yt = [];
      for (var k = 0; k <= 4; k++) { var v = yDomain[0] + (yDomain[1] - yDomain[0]) * k / 4; yt.push({ v: v, label: v.toFixed(2) }); }
      axes(svg, W, H, L, T, R, B,
        [0, 0.25, 0.5, 0.75, 1].map(function (v) { return { v: v, label: v.toFixed(2) }; }), yt,
        "Cost-loss ratio C/L", yLabel);
      if (refFn) {
        var rd = grid.map(function (g) { return (grid.indexOf(g) ? "L" : "M") + svg._sx(g.cl).toFixed(1) + " " + svg._sy(refFn(g)).toFixed(1); }).join(" ");
        var rp = svgEl("path", { d: rd, fill: "none", stroke: "#9AA49E", "stroke-width": 1.5, "stroke-dasharray": "2 3" }, svg);
        void rp;
      }
      var d = grid.map(function (g, i) { return (i ? "L" : "M") + svg._sx(g.cl).toFixed(1) + " " + svg._sy(seriesFn(g)).toFixed(1); }).join(" ");
      svgEl("path", { d: d, fill: "none", stroke: "#1B2420", "stroke-width": 2 }, svg);
      /* Selected C/L marker. */
      var sel = costLoss(counts, state.cl);
      var selY = seriesFn({ cl: state.cl, expense: sel.expenseFcst, clim: sel.expenseClim, value: sel.value });
      svgEl("line", { x1: svg._sx(state.cl), y1: T, x2: svg._sx(state.cl), y2: H - B, stroke: "#1D5350", "stroke-width": 1.5 }, svg);
      svgEl("text", { x: Math.min(svg._sx(state.cl) + 4, W - R - 70), y: T + 12, class: "tick", fill: "#1D5350" }, svg).textContent = "Selected C/L " + state.cl.toFixed(2);
      /* Optimum: hollow diamond + mono label. */
      var best = grid[0]; grid.forEach(function (g) { if (seriesFn(g) < seriesFn(best) && boxId === "chart-expense") best = g; if (seriesFn(g) > seriesFn(best) && boxId === "chart-value") best = g; });
      /* For the value chart the "best" initialisation above must start from the max, so recompute cleanly: */
      if (boxId === "chart-value") { best = grid.reduce(function (m, g) { return seriesFn(g) > seriesFn(m) ? g : m; }, grid[0]); }
      if (boxId === "chart-expense") { best = grid.reduce(function (m, g) { return seriesFn(g) < seriesFn(m) ? g : m; }, grid[0]); }
      marker(svg, "diamond", svg._sx(best.cl), svg._sy(seriesFn(best)), "#1B2420", false);
      svgEl("text", { x: Math.max(L, Math.min(svg._sx(best.cl) + 8, W - R - 90)), y: Math.max(T + 12, svg._sy(seriesFn(best)) - 8), class: "tick" }, svg).textContent =
        "Optimum C/L " + best.cl.toFixed(2) + " = " + fmt(seriesFn(best), 3);
      if (refLabel) svgEl("text", { x: W - R + 8, y: T + 12, class: "tick", fill: "#44524B" }, svg).textContent = refLabel;
      return { sel: sel, best: best };
    }
    var e = oneChart("chart-expense", function (g) { return g.expense; }, [0, 0.25], "Expense ratio (E / L)", function (g) { return g.clim; }, "Climatology (dotted)");
    var v = oneChart("chart-value", function (g) { return g.value; }, [-1, 1], "Relative value", function () { return 0; }, "Zero value (dotted)");
    $("costloss-subtitle").textContent = "Computed from the displayed contingency counts (hits " + counts.hits + ", misses " + counts.misses + ", false alarms " + counts.false_alarms +
      ", correct negatives " + counts.correct_negatives + ", n = " + (counts.hits + counts.misses + counts.false_alarms + counts.correct_negatives) +
      ") — not measured data · " + ACTIONS[state.action].label + " at trigger " + TRIG_LABEL[state.trigger] + " · " + point().label +
      " · expense at selected C/L " + fmt(e.sel.expenseFcst, 3) + ", relative value " + fmt(v.sel.value, 3) + ".";
    $("costloss-note").textContent = "Formula (core/triggerlab/costloss.py): expense_fcst = ((hits + false_alarms) × C/L + misses) / n; expense_clim = min(C/L, base_rate); " +
      "expense_perf = base_rate × C/L; value = (expense_clim − expense_fcst) / (expense_clim − expense_perf); base_rate = (hits + misses) / n.";
  }

  function annexText(p, a, r, boot, clRes, nScored) {
    var L = [];
    L.push("# Early Action Protocol — trigger annex (DRAFT)");
    L.push("");
    L.push("DRAFT — requires agency review before operational use. This is not an operational trigger until adopted.");
    L.push("");
    L.push("## Selection");
    L.push("");
    L.push("- Basin: Teso, Uganda");
    L.push("- Site: " + p.label + " (" + p.point_id + ")");
    L.push("- Action: " + a.label + " — " + a.lead + "-day lead, " + a.lifetime + "-day lifetime");
    L.push("- Trigger: " + TRIG_LABEL[state.trigger] + " ensemble exceedance");
    L.push("- Danger level (95th percentile): proxy " + fmt(p.danger95_proxy, 4) + " (n = " + p.n_proxy_days + " proxy days); historical " + fmt(p.danger95_hist, 4) + " (n = " + p.n_hist_days + " historical days)");
    L.push("- Cost-loss ratio C/L (selected): " + state.cl.toFixed(2));
    L.push("");
    L.push("## Verification — this run (GloFAS v4, 2009–2014)");
    L.push("");
    L.push("- Exceedance years (historical 95th percentile): " + years(p.hist95_exceedance_years));
    L.push("- Hits " + r.hits + " · misses " + r.misses + " · false alarms " + r.false_alarms + " · correct negatives " + r.correct_negatives + " · n scored " + nScored);
    L.push("- POD " + fmt(r.pod, 3) + " (CI not computable — no interval in source results)");
    L.push("- Pair FAR " + fmt(r.far_pairs, 3) + " (CI not computable — no interval in source results)");
    L.push("- POFD " + fmt(r.pofd, 4) + " (CI not computable — no interval in source results)");
    L.push("- Operational FAR " + fmt(r.operational_far, 3) + " · actions " + r.n_actions_hit + " of " + r.n_actions + " hit (CI not computable — no interval in source results)");
    L.push("- Bootstrap P(FAR > 0.5) " + fmt(boot["p_far_gt_0.5"], 4) + " · 95% CI " + fmt(boot.far_ci_low, 3) + "–" + fmt(boot.far_ci_high, 3) + " · n_valid = " + boot.n_valid);
    L.push("- Cost-loss at C/L " + state.cl.toFixed(2) + " (computed from the counts above, not measured data): expense ratio " + fmt(clRes.expenseFcst, 3) + " · relative value " + (isNaN(clRes.value) ? "—" : fmt(clRes.value, 3)));
    L.push("");
    L.push("## Paper comparison (PAPER — not this run)");
    L.push("");
    L.push("- Source: " + PAPER.source);
    L.push("- Exceedance years (PAPER): " + PAPER.exceedanceYears);
    L.push("- P(FAR > 0.5) (PAPER): 24% at 30%, 19% at 50%, 18% at 70%");
    L.push("- Gauge correlation (PAPER): 0.52 — " + PAPER.gaugeCorr + " in this run; no number is shown for it here.");
    L.push("");
    L.push("## Caveat and drift register");
    L.push("");
    L.push("Verification is MODEL-VS-MODEL: the GloFAS v4 lead-24h proxy is compared against its own consolidated historical run, NOT against independent ground truth.");
    L.push("");
    L.push("- Ensemble: 51 members in the paper → 11 members here; triggers quantise to effective 36/55/73%.");
    L.push("- Initialisations: daily in the paper → Monday/Thursday here.");
    L.push("- Lead: lead-0 in the paper → 24h proxy here.");
    L.push("- Grid/model: pre-operational 0.1° in the paper → v4.0 0.05° LISFLOOD/ERA5 here.");
    L.push("- Gauge correlation: " + PAPER.gaugeCorr + ".");
    L.push("");
    L.push("## DesInventar note");
    L.push("");
    L.push("- District flood years present 2010–2014.");
    L.push("- MAGORO (sub-county) record years: " + D.desinventar.MAGORO.record_years.join(", ") + ". The sub-county Magoro record has no 2011 event; the paper used additional non-public Red Cross records. Nothing in this workbench is re-based on that difference.");
    L.push("- KATAKWI (district) record years: " + D.desinventar.KATAKWI.record_years.join(", ") + ".");
    L.push("- AMURIA (district) record years: " + D.desinventar.AMURIA.record_years.join(", ") + ".");
    L.push("");
    L.push("## Provenance");
    L.push("");
    L.push("- Source file: data/glofas/teso_v4/results.json · GloFAS v4 · proxy span " + p.proxy_span[0] + " to " + p.proxy_span[1] + " · cost-loss formula: core/triggerlab/costloss.py.");
    return L.join("\n");
  }
  function renderAnnexPreview(p, a, r, boot, clRes, nScored) {
    var txt = annexText(p, a, r, boot, clRes, nScored);
    $("annex-preview").textContent = txt;
    $("annex-title").textContent = "Early Action Protocol — trigger annex (draft): Teso, Uganda · " + p.label + " · " + a.label + " · " + TRIG_LABEL[state.trigger];
  }
  function downloadAnnex() {
    var p = point(), a = ACTIONS[state.action], r = row(state.action, state.trigger), boot = p.headline_bootstrap[state.trigger];
    var txt = annexText(p, a, r, boot, costLoss(r, state.cl), p.actions[state.action].n_inits_scored);
    var blob = new Blob([txt], { type: "text/markdown" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url; link.download = "trigger-annex-teso-" + state.site + "-" + state.action + "-" + state.trigger.replace(".", "_") + ".md";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function render() {
    renderCaveat();
    syncControls();
    if (state.basin === "teso") {
      $("forthcoming-panel").hidden = true;
      $("results-col").hidden = false;
      $("annex-panel").hidden = false;
      renderResults();
    } else {
      $("forthcoming-panel").hidden = false;
      $("results-col").hidden = true;
      $("annex-panel").hidden = true;
      $("forthcoming-name").textContent = FORTHCOMING.find(function (b) { return b.id === state.basin; }).name;
    }
  }

  $("basin-select").addEventListener("change", function (e) { state.basin = e.target.value; render(); });
  $("site-select").addEventListener("change", function (e) { state.site = e.target.value; render(); });
  $("lead-select").addEventListener("change", function (e) { state.leadFilter = e.target.value; render(); });
  $("action-select").addEventListener("change", function (e) { state.action = e.target.value; render(); });
  document.querySelectorAll('input[name="trigger"]').forEach(function (r) {
    r.addEventListener("change", function (e) { state.trigger = e.target.value; render(); });
  });
  $("cl-slider").addEventListener("input", function (e) { state.cl = Number(e.target.value) / 100; render(); });
  $("caveat-toggle").addEventListener("click", function () {
    var c = $("caveat-panel"); c.classList.toggle("collapsed");
    $("caveat-toggle").textContent = c.classList.contains("collapsed") ? "Expand" : "Collapse";
  });
  $("method-nav").addEventListener("click", function () { $("method-note").hidden = false; $("method-toggle").textContent = "Hide method note"; });
  $("method-toggle").addEventListener("click", function () {
    var n = $("method-note"); n.hidden = !n.hidden;
    $("method-toggle").textContent = n.hidden ? "Show method note" : "Hide method note";
  });
  $("annex-download").addEventListener("click", downloadAnnex);
  $("annex-print").addEventListener("click", function () { window.print(); });

  buildPicker();
  render();
})();
