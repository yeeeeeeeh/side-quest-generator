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
let prefs = { visited: [], hideVisited: false, territories: true, type: "all", q: "" };
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
      ${prefs.type !== "all" ? `<button class="v-clear" id="v-all">Show all types ✕</button>` : ""}
    </div>
    <div class="v-colhead"><span>Country</span><span>Taiwan 🇹🇼</span></div>
    ${groups.length ? groups.map(([r, cs]) => `<h3 class="v-region">${esc(r)} <small>${cs.length}</small></h3>
      <div class="v-list">${cs.map(c => { const t = typeOf(c), x = TYPES[t];
        return `<button class="v-row${isVisited(c) ? " visited" : ""}" data-code="${c.code}"><span class="v-flag">${c.flag}</span>
          <span class="v-name">${esc(c.name)}${c.zh ? ` <small>${esc(c.zh)}</small>` : ""}</span>
          <span class="v-stay">${c.visa ? esc(c.visa.stay) : SPECIAL_NOTES[c.code] ? "see note" : ""}</span><span class="v-badge v-${x.cls}">${x.short}</span></button>`; }).join("")}</div>`).join("")
      : `<p class="v-empty">No matching countries.</p>`}
    <p class="v-foot">Taiwan passport rules from the <a href="${esc(D.sourceUrl)}" target="_blank" rel="noopener">Bureau of Consular Affairs</a> (as in the map app). Always check the official page before you travel. Country list from <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener">mledoze/countries</a> (ODbL).</p>`;
  const q = $("#v-q");
  q.oninput = () => { prefs.q = q.value; save(); const pos = q.selectionStart; render(); const n = $("#v-q"); n.focus(); n.setSelectionRange(pos, pos); };
  $("#v-hide").onchange = e => { prefs.hideVisited = e.target.checked; save(); render(); };
  $("#v-terr").onchange = e => { prefs.territories = e.target.checked; save(); render(); };
  const all2 = $("#v-all"); if (all2) all2.onclick = () => { prefs.type = "all"; save(); render(); };
  document.querySelectorAll("#v-body [data-type]").forEach(b => b.onclick = () => { prefs.type = prefs.type === b.dataset.type ? "all" : b.dataset.type; save(); render(); });
  document.querySelectorAll("#v-body [data-code]").forEach(b => b.onclick = () => detail(D.countries.find(c => c.code === b.dataset.code)));
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
    <label class="v-visit"><input type="checkbox" id="v-visited" ${isVisited(c) ? "checked" : ""}> I've visited ${esc(c.name)}</label>
    <div class="v-links">${links.map(([href, t2, sub]) => `<a href="${esc(href)}" target="_blank" rel="noopener"><b>${t2}</b><small>${esc(sub)}</small></a>`).join("")}</div>
  </div>`;
  sheet.hidden = false;
  const close = () => { sheet.hidden = true; sheet.innerHTML = ""; };
  $("#v-close").onclick = close;
  sheet.onclick = e => { if (e.target === sheet) close(); };
  $("#v-visited").onchange = e => {
    prefs.visited = e.target.checked ? [...new Set([...prefs.visited, c.code])] : prefs.visited.filter(v => v !== c.code);
    save(); render();
  };
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
  render();
};
})();
