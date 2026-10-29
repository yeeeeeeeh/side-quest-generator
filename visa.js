// ===== Taiwan passport visas =====
// Web port of the map app's passport-visa list (Taiwan passport only): every country with its entry rule from the
// Taiwan MOFA Bureau of Consular Affairs (BOCA) list, searchable and filterable, with a detail sheet per country.
// Data: visa/countries.json, built from map-app's VisaData.swift and countries.json. Visited countries are kept in
// this browser only.
(function () {
"use strict";

const TYPES = {
  free: { label: "Visa-free", short: "Free", icon: "✅", cls: "free" },
  eta: { label: "eTA / e-visa", short: "eTA", icon: "📲", cls: "eta" },
  voa: { label: "Visa on arrival", short: "VOA", icon: "🛬", cls: "voa" },
  visa: { label: "Visa required", short: "VISA", icon: "📄", cls: "visa" },
};
const REGIONS = ["Europe", "Asia", "Americas", "Africa", "Oceania", "Antarctic"];
const EMBASSY_NL = "Taipei Representative Office in the Netherlands Van Stolkweg 23 Den Haag";
const KEY = "visaPrefs";
// Places where Taiwan residents don't use a visa even though they aren't on BOCA's visa-free list.
const SPECIAL_NOTES = {
  CN: "Taiwan residents enter with the Mainland Travel Permit for Taiwan Residents (台胞證) instead of a visa.",
  HK: "Taiwan residents can apply online for free pre-arrival registration (網上快證) instead of a visa.",
};
// Chinese names in Traditional characters as used in Taiwan (the data's names are Simplified), like the app's
// zh_Hant_TW locale; falls back to the data when the browser can't name a region.
let zhNames = null;
try { zhNames = new Intl.DisplayNames(["zh-Hant-TW"], { type: "region" }); } catch (_) {}
function zhName(c) {
  try { const n = zhNames && zhNames.of(c.code); if (n && n !== c.code) return n; } catch (_) {}
  return c.zh;
}

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" }[c]));
let D = null;
let prefs = { visited: [], hideVisited: false, territories: true, type: "all", q: "", direct: false, amsLayer: true };
try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (_) {} };

const typeOf = c => c.code === "TW" ? "home" : c.visa ? c.visa.type : "visa";
const isVisited = c => prefs.visited.includes(c.code);
const matches = (c, q) => !q || [c.name, c.zh, c.code, c.iso3].some(v => v && v.toLowerCase().includes(q));

function shown() {
  const q = prefs.q.trim().toLowerCase();
  return D.countries.filter(c => c.code !== "TW"
    && (prefs.territories || c.independent)
    && !(prefs.hideVisited && isVisited(c))
    && (prefs.type === "all" || typeOf(c) === prefs.type)
    && (!prefs.direct || c.ams)
    && matches(c, q));
}

function render() {
  const all = D.countries.filter(c => c.code !== "TW" && (prefs.territories || c.independent));
  const count = t => all.filter(c => typeOf(c) === t).length;
  const list = shown();
  const groups = REGIONS.map(r => [r, list.filter(c => c.region === r).sort((a, b) => a.name.localeCompare(b.name))]).filter(([, cs]) => cs.length);
  $("#v-body").innerHTML = `
    <div class="v-summary">${Object.entries(TYPES).map(([t, x]) => `<button class="v-stat v-${x.cls}${prefs.type === t ? " on" : ""}" data-type="${t}"><b>${count(t)}</b><span>${x.icon} ${x.short}</span></button>`).join("")}</div>
    <input class="gw-search v-search" id="v-q" type="search" placeholder="Search countries (English or 中文)" value="${esc(prefs.q)}" autocomplete="off">
    <div class="v-opts">
      <label><input type="checkbox" id="v-hide" ${prefs.hideVisited ? "checked" : ""}> Hide visited (${prefs.visited.length})</label>
      <label><input type="checkbox" id="v-terr" ${prefs.territories ? "checked" : ""}> Include territories</label>
      <label><input type="checkbox" id="v-direct" ${prefs.direct ? "checked" : ""}> ✈️ Direct from Amsterdam</label>
      ${prefs.type !== "all" ? `<button class="v-clear" id="v-all">Show all types ✕</button>` : ""}
    </div>
    <div class="v-colhead"><span>Country</span><span>Taiwan 🇹🇼</span></div>
    ${groups.length ? groups.map(([r, cs]) => `<h3 class="v-region">${esc(r)} <small>${cs.length}</small></h3>
      <div class="v-list">${cs.map(c => { const t = typeOf(c), x = TYPES[t];
        return `<button class="v-row${isVisited(c) ? " visited" : ""}" data-code="${c.code}"><span class="v-flag">${c.flag}</span>
          <span class="v-name">${esc(c.name)}${c.zh ? ` <small>${esc(c.zh)}</small>` : ""}</span>${c.ams ? '<span class="v-plane" title="Direct flights from Amsterdam">✈️</span>' : ""}
          <span class="v-stay">${c.visa ? esc(c.visa.stay) : SPECIAL_NOTES[c.code] ? "see note" : ""}</span><span class="v-badge v-${x.cls}">${x.short}</span></button>`; }).join("")}</div>`).join("")
      : `<p class="v-empty">No matching countries.</p>`}
    <p class="v-foot">Taiwan passport rules from the <a href="${esc(D.sourceUrl)}" target="_blank" rel="noopener">Bureau of Consular Affairs</a> (as in the map app). Always check the official page before you travel. Country list from <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener">mledoze/countries</a> (ODbL). Health risks from WHO/CDC lists, as in the map app; not medical advice.</p>`;
  const q = $("#v-q");
  q.oninput = () => { prefs.q = q.value; save(); const pos = q.selectionStart; render(); const n = $("#v-q"); n.focus(); n.setSelectionRange(pos, pos); };
  $("#v-hide").onchange = e => { prefs.hideVisited = e.target.checked; save(); render(); };
  $("#v-terr").onchange = e => { prefs.territories = e.target.checked; save(); render(); };
  $("#v-direct").onchange = e => { prefs.direct = e.target.checked; save(); render(); if (map) drawMap(); };
  const all2 = $("#v-all"); if (all2) all2.onclick = () => { prefs.type = "all"; save(); render(); };
  document.querySelectorAll("#v-body [data-type]").forEach(b => b.onclick = () => { prefs.type = prefs.type === b.dataset.type ? "all" : b.dataset.type; save(); render(); });
  document.querySelectorAll("#v-body [data-code]").forEach(b => b.onclick = () => detail(D.countries.find(c => c.code === b.dataset.code)));
}

// ---------- map ----------
// Countries coloured by Taiwan-passport status, like the app's visa map layer. Shapes are a simplified copy of the
// app's GeoJSON (visa/world.json); places too small to draw are dots at their centre. Leaflet loads on first use.
const COLORS = { free: "#10B981", eta: "#F59E0B", voa: "#3B82F6", visa: "#EF4444", home: "#E5E7EB" };
let map = null, world = null, mapLayer = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  const css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
  document.head.appendChild(css);
  return new Promise((ok, bad) => {
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = ok; js.onerror = () => bad(new Error("couldn't load the map library"));
    document.head.appendChild(js);
  });
}
function styleFor(c) {
  const t = typeOf(c), dim = (prefs.type !== "all" && t !== prefs.type && t !== "home") || (prefs.direct && !c.ams && t !== "home");
  return { fillColor: COLORS[t], fillOpacity: dim ? 0.08 : isVisited(c) ? 0.35 : 0.75, color: isVisited(c) ? "#fff" : "#0F172A", weight: isVisited(c) ? 1.5 : 0.6 };
}
function drawMap() {
  if (mapLayer) mapLayer.remove();
  const byCode = Object.fromEntries(D.countries.map(c => [c.code, c]));
  mapLayer = L.layerGroup().addTo(map);
  const withShape = new Set();
  L.geoJSON(world, {
    filter: f => f.properties.c !== "AQ", // Antarctica would fill the bottom of the map
    style: f => byCode[f.properties.c] ? styleFor(byCode[f.properties.c]) : { fillOpacity: 0, weight: 0 },
    onEachFeature: (f, layer) => {
      const c = byCode[f.properties.c]; if (!c) return;
      withShape.add(c.code);
      layer.bindTooltip(`${c.flag} ${esc(c.name)} · ${TYPES[typeOf(c)] ? TYPES[typeOf(c)].short : "Home"}`, { sticky: true });
      layer.on("click", () => detail(c));
    },
  }).addTo(mapLayer);
  if (prefs.amsLayer) D.countries.filter(c => c.ams).forEach(c => c.ams.forEach(a => {
    L.circleMarker([a.lat, a.lon], { radius: 3.5, weight: 1.5, color: "#fff", fillColor: "#111827", fillOpacity: 1, pane: "markerPane" })
      .bindTooltip(`✈️ ${esc(a.city)}, ${esc(c.name)}`).on("click", () => detail(c)).addTo(mapLayer);
  }));
  D.countries.filter(c => !withShape.has(c.code) && c.latlng && c.code !== "TW").forEach(c => {
    L.circleMarker(c.latlng, Object.assign(styleFor(c), { radius: 5, weight: 1, color: "#0F172A" }))
      .bindTooltip(`${c.flag} ${esc(c.name)} · ${TYPES[typeOf(c)].short}`).on("click", () => detail(c)).addTo(mapLayer);
  });
}
async function showMap() {
  const box = $("#v-mapwrap");
  if (!map) {
    box.innerHTML = '<p class="v-empty">Loading map…</p>';
    try {
      await loadLeaflet();
      if (!world) { const r = await fetch("visa/world.json"); if (!r.ok) throw new Error(`HTTP ${r.status}`); world = await r.json(); }
    } catch (e) { box.innerHTML = `<p class="v-empty">Couldn't load the map: ${esc(e.message)}.</p>`; return; }
    box.innerHTML = `<div id="v-map"></div><div class="v-legend">${Object.entries(TYPES).map(([t, x]) => `<button data-mtype="${t}" class="${prefs.type === t ? "on" : ""}"><i style="background:${COLORS[t]}"></i>${x.short}</button>`).join("")}<button data-ams class="${prefs.amsLayer ? "on" : ""}">✈️ AMS</button></div>`;
    map = L.map("v-map", { worldCopyJump: true, minZoom: 1, maxZoom: 7, zoomSnap: 0.5, attributionControl: false }).setView([25, 15], 1.5);
    box.querySelectorAll("[data-mtype]").forEach(b => b.onclick = () => {
      prefs.type = prefs.type === b.dataset.mtype ? "all" : b.dataset.mtype; save();
      box.querySelectorAll("[data-mtype]").forEach(x => x.classList.toggle("on", x.dataset.mtype === prefs.type));
      drawMap(); render();
    });
    box.querySelector("[data-ams]").onclick = e => { prefs.amsLayer = !prefs.amsLayer; save(); e.currentTarget.classList.toggle("on", prefs.amsLayer); drawMap(); };
  }
  drawMap();
  setTimeout(() => map.invalidateSize(), 0);
}
function setView(v) {
  prefs.view = v; save();
  $("#visa-panel").classList.toggle("v-mapmode", v === "map");
  $("#visa-panel").classList.toggle("v-statsmode", v === "stats");
  if (v === "stats") stats();
  document.querySelectorAll("[data-view]").forEach(b => b.classList.toggle("on", b.dataset.view === v));
  if (v === "map") showMap();
}

// ---------- stats ----------
// Like the app's Statistics: a level named for the number of countries visited (the app's 101 names and 7 tiers),
// progress to the next 5-country milestone, visited per continent, and what's left by Taiwan-passport status.
const TIERS = [[0, "🚶", "#9CA3AF"], [10, "🔭", "#10B981"], [25, "🎒", "#3B82F6"], [50, "✈️", "#A855F7"], [75, "🌍", "#F59E0B"], [100, "⭐", "#EF4444"], [150, "👑", "#FACC15"]];
function stats() {
  const scope = D.countries.filter(c => c.code !== "TW" && (prefs.territories || c.independent) && c.region !== "Antarctic");
  const visited = scope.filter(isVisited), n = visited.length, total = scope.length;
  const tier = TIERS.filter(([min]) => n >= min).pop();
  const name = D.levels[n] || (n > 100 ? `World Legend · ${n}` : `Explorer · ${n}`);
  const lower = Math.floor(n / 5) * 5, next = lower + 5;
  const regions = REGIONS.filter(r => r !== "Antarctic").map(r => { const all = scope.filter(c => c.region === r); return [r, all.filter(isVisited).length, all.length]; });
  const left = scope.filter(c => !isVisited(c)), byType = t => left.filter(c => typeOf(c) === t).length;
  const easy = left.filter(c => c.ams && (typeOf(c) === "free" || typeOf(c) === "eta"));
  const pctOf = (a, b) => b ? Math.round(a / b * 100) : 0;
  $("#v-stats").innerHTML = `
    <div class="v-level" style="--tier:${tier[2]}"><span class="v-tier">${tier[1]}</span>
      <div class="v-lvtext"><b>${esc(name)}</b><small>${n} ${n === 1 ? "country" : "countries"} visited</small></div><span class="v-lv">Lv.${n}</span>
      <div class="v-lvbar"><i style="width:${(n - lower) / 5 * 100}%"></i></div><small class="v-lvnext">${next - n} more to ${esc(D.levels[next] || `Lv.${next}`)}</small></div>
    <div class="v-big"><div><b>${n}</b><span>visited</span></div><div><b>${total}</b><span>${prefs.territories ? "countries &amp; territories" : "countries"}</span></div><div><b>${pctOf(n, total)}%</b><span>of the world</span></div></div>
    <h3 class="v-region">By continent</h3>
    <div class="v-conts">${regions.map(([r, v, a]) => `<div class="v-cont"><span>${esc(r)}</span><div class="v-cbar"><i style="width:${pctOf(v, a)}%"></i></div><b>${v}/${a}</b></div>`).join("")}</div>
    <h3 class="v-region">Still to visit, with a Taiwan passport</h3>
    <div class="v-summary">${Object.entries(TYPES).map(([t, x]) => `<button class="v-stat v-${x.cls}" data-left="${t}"><b>${byType(t)}</b><span>${x.icon} ${x.short}</span></button>`).join("")}</div>
    <h3 class="v-region">Easy next trips <small>${easy.length}</small></h3>
    <p class="v-note">Not visited yet, visa-free or eTA, and a direct flight from Amsterdam.</p>
    <div class="v-list">${easy.sort((a, b) => a.name.localeCompare(b.name)).map(c => `<button class="v-row" data-code="${c.code}"><span class="v-flag">${c.flag}</span><span class="v-name">${esc(c.name)}${c.zh ? ` <small>${esc(c.zh)}</small>` : ""}</span>
      <span class="v-stay">${esc(c.ams.map(a => a.city).join(", "))}</span><span class="v-badge v-${TYPES[typeOf(c)].cls}">${TYPES[typeOf(c)].short}</span></button>`).join("") || '<p class="v-empty">None left. Time for a longer trip!</p>'}</div>
    ${n ? "" : `<p class="v-foot">Mark countries as visited from their detail sheet (tap any country in the list or on the map).</p>`}`;
  document.querySelectorAll("#v-stats [data-code]").forEach(b => b.onclick = () => detail(D.countries.find(c => c.code === b.dataset.code)));
  document.querySelectorAll("#v-stats [data-left]").forEach(b => b.onclick = () => { prefs.type = b.dataset.left; prefs.hideVisited = true; save(); render(); setView("list"); });
}

// Skyscanner search from Amsterdam to a country for next month (same link as the app: /ams/<cc>/<yymm>/<yymm>/).
function skyscanner(code) {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + 1);
  const yymm = String(d.getFullYear() % 100).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0");
  return `https://www.skyscanner.net/transport/flights/ams/${code.toLowerCase()}/${yymm}/${yymm}/?adults=1&cabinclass=economy&rtn=1`;
}

// Detail sheet for one country, over the list.
function detail(c) {
  const t = typeOf(c), x = TYPES[t] || TYPES.visa;
  const zhQuery = `${c.zh || c.name} 簽證 背包客棧`;
  const links = [
    [`https://www.google.com/search?q=${encodeURIComponent(zhQuery)}&hl=zh-TW`, "🔎 Search visa discussions", "背包客棧 and others, in Chinese"],
    [D.sourceUrl, "🏛 BOCA visa list", "Official Taiwan passport entry rules"],
    [`https://www.gov.uk/foreign-travel-advice/${encodeURIComponent(c.govuk)}`, "⚠️ Travel advice", "GOV.UK safety, entry and local laws"],
    ...(t === "visa" ? [[`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EMBASSY_NL)}`, "🗺 Taipei office in The Hague", "For visa questions from the Netherlands"]] : []),
  ];
  const sheet = $("#v-sheet");
  sheet.innerHTML = `<div class="v-card" role="dialog" aria-label="${esc(c.name)} visa details">
    <button class="v-close" id="v-close" aria-label="Close">✕</button>
    <div class="v-head"><span class="v-bigflag">${c.flag}</span><div><h2>${esc(c.name)}</h2><small>${esc(c.zh || "")}${c.zh ? " · " : ""}${esc(c.subregion || c.region)}</small></div></div>
    <div class="v-pass"><div class="v-passhead">🇹🇼 Taiwan passport</div>
      <div class="v-rule v-${x.cls}"><span>${x.icon} ${x.label}</span>${c.visa ? `<b>${esc(c.visa.stay)}</b>` : ""}</div>
      ${c.visa && c.visa.note ? `<p class="v-note">ⓘ ${esc(c.visa.note)}</p>` : ""}
      ${SPECIAL_NOTES[c.code] ? `<p class="v-note v-special">ⓘ ${esc(SPECIAL_NOTES[c.code])}</p>` : t === "visa" ? `<p class="v-note">Not on the visa-free, eTA or visa-on-arrival list: apply for a visa before you travel.</p>` : ""}
      ${t === "eta" ? `<p class="v-note">Apply online before you travel.</p>` : ""}
    </div>
    ${c.ams ? `<div class="v-pass v-ams"><div class="v-passhead">✈️ Direct from Amsterdam (AMS)</div>
      <p class="v-note">${c.ams.map(a => esc(a.city)).join(" · ")}</p>
      <a class="v-sky" href="${esc(skyscanner(c.code))}" target="_blank" rel="noopener">Search flights next month on Skyscanner ↗</a></div>` : ""}
    ${healthBox(c)}
    <label class="v-visit"><input type="checkbox" id="v-visited" ${isVisited(c) ? "checked" : ""}> I've visited ${esc(c.name)}</label>
    <div class="v-links">${links.map(([href, t2, sub]) => `<a href="${esc(href)}" target="_blank" rel="noopener"><b>${t2}</b><small>${esc(sub)}</small></a>`).join("")}</div>
  </div>`;
  sheet.hidden = false;
  const close = () => { sheet.hidden = true; sheet.innerHTML = ""; };
  $("#v-close").onclick = close;
  sheet.onclick = e => { if (e.target === sheet) close(); };
  $("#v-visited").onchange = e => {
    prefs.visited = e.target.checked ? [...new Set([...prefs.visited, c.code])] : prefs.visited.filter(v => v !== c.code);
    save(); render(); if (map) drawMap(); if (prefs.view === "stats") stats();
  };
}

// Health & vaccines, copied from map-app's country_risks.yaml (WHO/CDC lists, see visa/build-health.py).
// Optional: if health.json fails to load the sheet just leaves the section out.
let H = null;
function healthBox(c) {
  if (!H) return "";
  const risks = Object.entries(H.risks).filter(([, r]) => r.codes.includes(c.code));
  return `<div class="v-pass v-health"><div class="v-passhead">💉 Health &amp; vaccines</div>
    ${risks.length ? risks.map(([, r]) => `<details class="v-risk"><summary>${r.emoji} ${esc(r.en)} <small>${esc(r.zh)}</small></summary>
      <p>${esc(r.about)}</p><p><b>傳播</b> ${esc(r.how)}</p><p><b>預防</b> ${esc(r.prevent)}</p>${r.source ? `<p class="v-src">Source: ${esc(r.source)}</p>` : ""}</details>`).join("")
      : `<p class="v-note">None of the tracked risks (${Object.keys(H.risks).length} diseases) are listed for ${esc(c.name)}. Routine vaccines still apply.</p>`}
    <p class="v-note v-src">Snapshot reviewed ${esc(H.reviewed)}. ${esc(H.note)} See a travel clinic (旅遊醫學門診) 4–6 weeks before you go.</p>
    <a class="v-sky" href="https://wwwnc.cdc.gov/travel/destinations/list" target="_blank" rel="noopener">CDC Travelers' Health by destination ↗</a></div>`;
}

let started = false;
window.visaInit = async function () {
  if (started) return;
  started = true;
  $("#v-body").innerHTML = '<p class="v-empty">Loading…</p>';
  try {
    const res = await fetch("visa/countries.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    D = await res.json();
    D.countries.forEach(c => { c.zh = zhName(c); });
  } catch (e) {
    started = false;
    $("#v-body").innerHTML = `<p class="v-empty">Couldn't load the visa list: ${esc(e.message)}. Open the tab again to retry.</p>`;
    return;
  }
  fetch("visa/health.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).then(h => { H = h; }).catch(() => {});
  render();
  document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => setView(b.dataset.view));
  setView(["map", "stats"].includes(prefs.view) ? prefs.view : "list");
};
})();
