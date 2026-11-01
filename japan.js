// ===== Japan shopping =====
// For the Japan trip: find a product across Japanese electronics shops and drugstores, work out
// what it really costs after tourist coupons and the tax refund, and keep a shopping list.
// Japanese shops don't allow cross-origin requests, so the shop buttons open their own search pages.
// Live prices come from Rakuten's Ichiba Item Search API, which does allow it; it needs the owner's
// App ID + Access Key, kept in this browser only (never in the repo). Exchange rate: ECB via frankfurter.dev.
(function () {
const KEY = "japanShop";
const RATE_KEY = "japanRate";
const RAKUTEN_API = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";
const REFUND_MIN = 5000;     // ¥ before tax, per shop per day
const ALLOWANCE = 430;       // € Dutch customs allowance by air
const enc = encodeURIComponent;
const site = (domain, q) => `https://www.google.com/search?q=${enc(`${q} site:${domain}`)}`;
const SHOPS = {
  elec: [
    ["価格.com", "Price comparison, most shops", q => `https://search.kakaku.com/${enc(q)}/`],
    ["Bic Camera", "ビックカメラ", q => `https://www.biccamera.com/bc/category/?q=${enc(q)}`],
    ["Yodobashi", "ヨドバシ", q => `https://www.yodobashi.com/?word=${enc(q)}`],
    ["Yamada Denki", "ヤマダ電機", q => site("yamada-denkiweb.com", q)],
    ["Amazon.co.jp", "", q => `https://www.amazon.co.jp/s?k=${enc(q)}`],
    ["Rakuten", "楽天市場", q => `https://search.rakuten.co.jp/search/mall/${enc(q)}/`],
    ["Yahoo! Shopping", "", q => `https://shopping.yahoo.co.jp/search?p=${enc(q)}`],
  ],
  drug: [
    ["Matsukiyo", "マツキヨ online", q => site("matsukiyococokara-online.com", q)],
    ["Sundrug", "サンドラッグ online", q => site("sundrug-online.com", q)],
    ["Tsuruha", "ツルハ", q => site("tsuruha.co.jp", q)],
    ["@cosme", "Reviews & rankings", q => site("cosme.net", q)],
    ["価格.com", "", q => `https://search.kakaku.com/${enc(q)}/`],
    ["Amazon.co.jp", "", q => `https://www.amazon.co.jp/s?k=${enc(q)}`],
    ["Rakuten", "楽天市場", q => `https://search.rakuten.co.jp/search/mall/${enc(q)}/`],
  ],
};
const COUPONS = [[0, "None"], [3, "3%"], [5, "5%"], [7, "7%"], [10, "10%"]];

const esc = s => String(s ?? "").replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" }[c]));
const $ = s => document.querySelector(s);
const yen = n => "¥" + Math.round(n).toLocaleString("en-US");
const eur = n => "€" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toLocaleDateString("sv-SE");

let S = { view: "search", q: "", cat: "elec", rk: { id: "", key: "" }, fee: 0, calc: {}, list: [] };
try { S = { ...S, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

let rate = null; // { v: € per ¥, date }
try { rate = JSON.parse(localStorage.getItem(RATE_KEY) || "null"); } catch {}
async function loadRate() {
  if (rate && Date.now() - rate.fetched < 6 * 3600e3) return;
  try {
    const r = await fetch("https://api.frankfurter.dev/v1/latest?base=JPY&symbols=EUR");
    const d = await r.json();
    rate = { v: d.rates.EUR, date: d.date, fetched: Date.now() };
    try { localStorage.setItem(RATE_KEY, JSON.stringify(rate)); } catch {}
    render();
  } catch {}
}
const toEur = jpy => rate ? jpy * rate.v : null;

// Price after coupon and the tax refund. Shelf prices show both 税込 (incl.) and 税抜 (excl.) tax.
// Food and drinks are taxed at 8%, everything else at 10%. The coupon is taken off the
// tax-included price; the refund is the tax in what you paid, if the shop's total that day is
// at least ¥5,000 before tax.
function price(c) {
  const r = c.tax / 100, shelf = +c.price || 0;
  const incl = c.incl ? shelf : shelf * (1 + r);
  const paid = incl * (1 - (+c.coupon || 0) / 100);
  const refund = c.refund ? paid * r / (1 + r) : 0;
  const net = (paid - refund) * (1 + (+S.fee || 0) / 100);
  return { incl, paid, refund, net, eur: toEur(net) };
}

function shopsBlock() {
  const q = S.q.trim();
  return `<div class="jp-seg" role="group" aria-label="Category">${[["elec", "📱 Electronics"], ["drug", "🧴 Drugstore"]].map(([k, t]) => `<button data-cat="${k}" class="${S.cat === k ? "on" : ""}">${t}</button>`).join("")}</div>
    <div class="jp-shops">${SHOPS[S.cat].map(([n, sub, url]) => q ? `<a class="jp-shop" href="${esc(url(q))}" target="_blank" rel="noopener"><b>${esc(n)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</a>` : `<span class="jp-shop off"><b>${esc(n)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span>`).join("")}</div>
    <p class="jp-note">${q ? "Opens each shop's own search." : "Type a product to search the shops."} Online prices; shop prices on the street can differ, and Don Quijote has no online prices.</p>`;
}

function searchView() {
  return `<form class="gw-city-row" id="jp-form" role="search">
      <input class="gw-search" id="jp-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="AirPods Pro 2, 4549980…, Melano CC" value="${esc(S.q)}">
      <button class="btn btn-primary" type="submit">Search</button>
    </form>
    <p class="jp-note">Name, model number or the barcode number (JAN) on the box.</p>
    ${shopsBlock()}
    <h3 class="jp-h">Rakuten live prices</h3>
    <div id="jp-rk">${S.rk.id && S.rk.key ? (S.q.trim() ? '<p class="jp-note">Loading…</p>' : '<p class="jp-note">Search to see prices.</p>') : `<p class="jp-note">Add your Rakuten App ID and Access Key in ⚙️ to see live online prices here. Everything else works without them.</p>`}</div>`;
}

let rkSeq = 0;
async function rakuten() {
  const box = $("#jp-rk"), q = S.q.trim();
  if (!box || !q || !S.rk.id || !S.rk.key) return;
  const seq = ++rkSeq;
  try {
    const p = new URLSearchParams({ applicationId: S.rk.id, accessKey: S.rk.key, keyword: q, format: "json", formatVersion: 2, hits: 20, availability: 1 });
    const r = await fetch(`${RAKUTEN_API}?${p}`);
    const d = await r.json();
    if (seq !== rkSeq) return;
    if (!r.ok || d.errors || d.error) throw new Error(d.errors?.errorMessage || d.error_description || d.error || `HTTP ${r.status}`);
    const items = (d.Items || []).map(i => i.Item || i).sort((a, b) => a.itemPrice - b.itemPrice);
    box.innerHTML = items.length ? `<p class="jp-note">Cheapest first. Check it's the same model, not an accessory.</p><div class="jp-list">${items.slice(0, 12).map((i, n) => `<div class="jp-item">
        ${i.mediumImageUrls?.[0] ? `<img src="${esc((i.mediumImageUrls[0].imageUrl || i.mediumImageUrls[0]).replace(/^http:/, "https:"))}" alt="" loading="lazy" onerror="this.remove()">` : ""}
        <div class="jp-it"><a href="${esc(i.itemUrl)}" target="_blank" rel="noopener">${esc(i.itemName.slice(0, 90))}</a><small>${esc(i.shopName)}</small></div>
        <div class="jp-ip"><b>${yen(i.itemPrice)}</b>${rate ? `<small>${eur(toEur(i.itemPrice))}</small>` : ""}<button class="jp-mini" data-use="${n}" title="Use in calculator">🧮</button></div></div>`).join("")}</div>` : '<p class="jp-note">No results on Rakuten.</p>';
    box.querySelectorAll("[data-use]").forEach(b => b.onclick = () => {
      const i = items[+b.dataset.use];
      S.calc = { ...S.calc, name: i.itemName.slice(0, 60), price: i.itemPrice, incl: true };
      setView("calc");
    });
  } catch (e) {
    if (seq === rkSeq) box.innerHTML = `<p class="jp-note bad">Rakuten: ${esc(e.message)}. Check the App ID, Access Key and the website registered for the app in ⚙️.</p>`;
  }
}

function calcView() {
  const c = S.calc = { name: S.q, price: "", incl: true, tax: 10, coupon: 0, refund: true, nl: "", store: "", ...S.calc };
  const p = price(c), nl = +c.nl || 0, diff = p.eur != null && nl ? nl - p.eur : null;
  const row = (l, v, cls = "") => `<div class="jp-line ${cls}"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="jp-card">
    <label class="jp-f"><span>Product</span><input id="c-name" value="${esc(c.name)}" placeholder="What is it?"></label>
    <div class="jp-two">
      <label class="jp-f"><span>Shelf price ¥</span><input id="c-price" type="number" inputmode="numeric" min="0" value="${esc(c.price)}" placeholder="29800"></label>
      <label class="jp-f"><span>Dutch price €</span><input id="c-nl" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(c.nl)}" placeholder="optional"></label>
    </div>
    <div class="jp-seg small" role="group" aria-label="Shelf price">${[[true, "税込 incl. tax"], [false, "税抜 excl. tax"]].map(([v, t]) => `<button data-incl="${v}" class="${c.incl === v ? "on" : ""}">${t}</button>`).join("")}</div>
    <div class="jp-seg small" role="group" aria-label="Tax rate">${[[10, "10% most goods"], [8, "8% food & drink"]].map(([v, t]) => `<button data-tax="${v}" class="${c.tax === v ? "on" : ""}">${t}</button>`).join("")}</div>
    <div class="jp-f"><span>Tourist coupon</span><div class="jp-seg small">${COUPONS.map(([v, t]) => `<button data-coupon="${v}" class="${+c.coupon === v ? "on" : ""}">${t}</button>`).join("")}</div></div>
    <label class="jp-chk"><input type="checkbox" id="c-refund" ${c.refund ? "checked" : ""}> Tax refund at the airport (shop total that day ≥ ${yen(REFUND_MIN)} before tax)</label>
    <label class="jp-f"><span>Shop</span><input id="c-store" value="${esc(c.store)}" placeholder="Bic Camera Shinjuku"></label>
  </div>
  <div class="jp-card jp-result">
    ${row("Price incl. tax", yen(p.incl))}
    ${+c.coupon ? row(`Coupon −${c.coupon}%`, "−" + yen(p.incl - p.paid)) : ""}
    ${row("You pay at the till", yen(p.paid))}
    ${c.refund ? row(`Tax refund (${c.tax}%)`, "−" + yen(p.refund), "ok") : ""}
    ${+S.fee ? row(`Card fee ${S.fee}%`, "+" + yen(p.net - (p.paid - p.refund))) : ""}
    ${row("Real cost", `${yen(p.net)}${p.eur != null ? ` · ${eur(p.eur)}` : ""}`, "big")}
    ${diff != null ? `<p class="jp-verdict ${diff > 0 ? "ok" : "bad"}">${diff > 0 ? `✅ ${eur(diff)} cheaper than in NL (${Math.round(diff / nl * 100)}%)` : `❌ ${eur(-diff)} more than in NL`}</p>` : ""}
    <p class="jp-note">${rate ? `ECB rate ${rate.date}: ¥1,000 = ${eur(rate.v * 1000)}.` : "Loading exchange rate…"} The refund may be a bit less if the kiosk charges a fee.${p.eur != null && p.eur > ALLOWANCE ? ` <b class="bad">Over the €${ALLOWANCE} customs allowance on its own: Dutch VAT (21%) and maybe import duty apply.</b>` : ""}</p>
    <button class="btn btn-primary jp-wide" id="c-add" ${+c.price ? "" : "disabled"}>＋ Add to shopping list</button>
  </div>
  ${tipsCard()}`;
}

function tipsCard() {
  return `<details class="jp-card jp-tips"><summary>ℹ️ Tax refund, customs and electronics tips</summary>
    <ul>
      <li><b>New tax-free rules from 1 Nov 2026:</b> you pay the full price with tax, show your passport at the till, and get the tax back at a customs kiosk at the airport before you leave, with the goods. No more sealed bags. Shops in a chain can combine your same-day purchases to reach ${yen(REFUND_MIN)}.</li>
      <li>Keep consumables (cosmetics, medicine, snacks) unused until you leave, and keep receipts.</li>
      <li><b>Dutch customs:</b> by air you can bring goods worth up to €${ALLOWANCE} tax-free. Above that, declare it: 21% VAT on the whole amount, plus duty for some goods.</li>
      <li><b>Tourist coupons:</b> Bic Camera, Yodobashi, Matsukiyo, Sundrug and Don Quijote have coupons for foreign visitors (often 5–10% above a minimum spend). Search "<shop> tourist coupon" before you go.</li>
      <li><b>Electronics:</b> Japan uses 100 V and type A plugs (most chargers are fine). Laptops have Japanese keyboards. Warranties are often Japan-only. iPhones sold in Japan always make the camera shutter sound.</li>
    </ul>
    <p class="jp-note">Rules as reported by travel sources in Oct 2026; check the official Japan Tax-free Shop guidance before you shop.</p></details>`;
}

function listView() {
  const L = S.list;
  if (!L.length) return `<p class="jp-empty">Nothing on the list yet. Add items from the 🧮 calculator.</p>${tipsCard()}`;
  const bought = L.filter(i => i.bought);
  const groups = {};
  bought.forEach(i => { const k = `${i.day} · ${i.store || "Unknown shop"}`; (groups[k] ||= []).push(i); });
  const totalEur = bought.reduce((s, i) => s + (toEur(i.net) || 0), 0);
  const pct = Math.min(100, totalEur / ALLOWANCE * 100);
  return `<div class="jp-card">
      <div class="jp-line big"><span>Bought so far</span><b>${eur(totalEur)}</b></div>
      <span class="jp-bar"><i class="${totalEur > ALLOWANCE ? "bad" : ""}" style="width:${pct}%"></i></span>
      <p class="jp-note">${totalEur > ALLOWANCE ? `<b class="bad">Over the €${ALLOWANCE} customs allowance: declare it when you land.</b>` : `${eur(ALLOWANCE - totalEur)} left of the €${ALLOWANCE} customs allowance.`}</p>
      ${Object.entries(groups).map(([k, items]) => { const pre = items.reduce((s, i) => s + i.paid / (1 + i.tax / 100), 0); return `<div class="jp-line"><span>${esc(k)}</span><b class="${pre >= REFUND_MIN ? "ok" : ""}">${yen(pre)} ${pre >= REFUND_MIN ? "✓ refund" : `<small>${yen(REFUND_MIN - pre)} short</small>`}</b></div>`; }).join("")}
    </div>
    <div class="jp-list">${L.map((i, n) => `<div class="jp-item${i.bought ? " got" : ""}">
      <input type="checkbox" data-buy="${n}" ${i.bought ? "checked" : ""} aria-label="Bought">
      <div class="jp-it"><b>${esc(i.name || "Item")}</b><small>${esc(i.store || "")}${i.bought ? ` · ${esc(i.day)}` : ""}${i.nl ? ` · NL ${eur(+i.nl)}` : ""}</small></div>
      <div class="jp-ip"><b>${yen(i.net)}</b>${rate ? `<small>${eur(toEur(i.net))}</small>` : ""}<button class="jp-mini" data-del="${n}" title="Remove">✕</button></div></div>`).join("")}</div>
    <p class="jp-note">Tick an item when you buy it: it's dated today and counts toward the shop's refund threshold and your customs allowance.</p>
    ${bought.length ? `<details class="jp-card"><summary>🛫 Airport refund checklist</summary><ul>${Object.entries(groups).map(([k, items]) => `<li><b>${esc(k)}</b>: ${items.map(i => esc(i.name)).join(", ")}</li>`).join("")}</ul><p class="jp-note">Have these with you (unused) and your passport at the customs kiosk.</p></details>` : ""}
    ${tipsCard()}`;
}

function settings() {
  return `<div class="jp-card jp-settings" id="jp-settings" hidden>
    <b>⚙️ Settings</b>
    <label class="jp-f"><span>Rakuten App ID</span><input id="s-id" autocomplete="off" value="${esc(S.rk.id)}"></label>
    <label class="jp-f"><span>Rakuten Access Key</span><input id="s-key" type="password" autocomplete="off" value="${esc(S.rk.key)}"></label>
    <p class="jp-note">Free from webservice.rakuten.co.jp → new app. Set its website to <code>yeeeeeeeh.github.io</code>. Stored only in this browser and sent only to Rakuten.</p>
    <label class="jp-f"><span>Card fee on ¥ payments %</span><input id="s-fee" type="number" inputmode="decimal" min="0" step="0.1" value="${esc(S.fee)}"></label>
    <button class="btn btn-primary" id="s-save">Save</button>
  </div>`;
}

function render() {
  const body = $("#jp-body");
  if (!body) return;
  const scroll = body.scrollTop, open = $("#jp-settings")?.hidden === false;
  // Keep what's being typed (and the cursor) when a late exchange rate or result redraws the tab
  const typed = [...body.querySelectorAll("input[id]:not([type=checkbox])")].map(i => [i.id, i.value]);
  const active = document.activeElement?.closest?.("#jp-body") ? document.activeElement : null;
  const focus = active?.id ? [active.id, active.selectionStart, active.selectionEnd] : null;
  const views = { search: ["🔎 Search", searchView], calc: ["🧮 Worth it?", calcView], list: [`📝 List${S.list.length ? ` (${S.list.length})` : ""}`, listView] };
  body.innerHTML = settings() + `<div class="jp-seg jp-tabs" role="tablist">${Object.entries(views).map(([k, [t]]) => `<button data-view="${k}" role="tab" aria-selected="${S.view === k}" class="${S.view === k ? "on" : ""}">${t}</button>`).join("")}</div>` + views[S.view][1]();
  if (open) $("#jp-settings").hidden = false;
  typed.forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.value = v; });
  if (focus) { const el = document.getElementById(focus[0]); if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(focus[1], focus[2]); } catch {} } }
  body.scrollTop = scroll;
  wire();
}

function setView(v) { S.view = v; save(); render(); $("#jp-body").scrollTop = 0; if (v === "search") rakuten(); }

function wire() {
  document.querySelectorAll("#jp-body [data-view]").forEach(b => b.onclick = () => setView(b.dataset.view));
  $("#s-save").onclick = () => {
    S.rk = { id: $("#s-id").value.trim(), key: $("#s-key").value.trim() };
    S.fee = Math.max(0, +$("#s-fee").value || 0);
    save(); $("#jp-settings").hidden = true; render(); if (S.view === "search") rakuten();
  };
  if (S.view === "search") {
    $("#jp-form").onsubmit = e => { e.preventDefault(); S.q = $("#jp-q").value; save(); $("#jp-q").blur(); render(); rakuten(); };
    document.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { S.cat = b.dataset.cat; save(); render(); rakuten(); });
  }
  if (S.view === "calc") {
    const c = S.calc, upd = () => { save(); render(); };
    [["c-name", "name"], ["c-price", "price"], ["c-nl", "nl"], ["c-store", "store"]].forEach(([id, k]) => {
      const el = $("#" + id);
      el.oninput = () => { c[k] = el.value; save(); };
      el.onchange = upd;
    });
    document.querySelectorAll("[data-incl]").forEach(b => b.onclick = () => { c.incl = b.dataset.incl === "true"; upd(); });
    document.querySelectorAll("[data-tax]").forEach(b => b.onclick = () => { c.tax = +b.dataset.tax; upd(); });
    document.querySelectorAll("[data-coupon]").forEach(b => b.onclick = () => { c.coupon = +b.dataset.coupon; upd(); });
    $("#c-refund").onchange = e => { c.refund = e.target.checked; upd(); };
    $("#c-add").onclick = () => {
      const p = price(c);
      S.list.push({ id: Date.now(), name: c.name, store: c.store, tax: c.tax, paid: Math.round(p.paid), net: Math.round(p.net), nl: c.nl, bought: false, day: "" });
      S.calc = { tax: c.tax, coupon: c.coupon, refund: c.refund, incl: c.incl, store: c.store };
      setView("list");
    };
  }
  if (S.view === "list") {
    document.querySelectorAll("[data-buy]").forEach(b => b.onchange = () => { const i = S.list[+b.dataset.buy]; i.bought = b.checked; i.day = b.checked ? today() : ""; save(); render(); });
    document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { S.list.splice(+b.dataset.del, 1); save(); render(); });
  }
}

let started = false;
window.japanInit = function () {
  if (!started) {
    started = true;
    $("#jp-gear").onclick = () => { const s = $("#jp-settings"); s.hidden = !s.hidden; if (!s.hidden) $("#jp-body").scrollTop = 0; };
    loadRate();
  }
  render();
  if (S.view === "search") rakuten();
};
})();
