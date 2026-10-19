// ===== Amazon JP vs Amazon NL vs bol.com =====
// Amazon and bol.com block reading their pages from another site and have no
// open price API, so this is a quick-check helper: paste a link, barcode or
// words, open the same product in each store, type the prices you see, and
// it converts yen to euro (ECB rate) and shows the cheapest.
// Everything is kept in the URL (#shop?q=…&jp=…&nl=…&bol=…) to share or edit.
const SHOP_FX_URL = "https://api.frankfurter.dev/v1/latest?from=JPY&to=EUR";
const SHOP_NL_VAT = 0.21;
const SHOP_JP_TAX = 0.10;
const SHOP_STORES = {
  jp:  { label: "🇯🇵 Amazon.co.jp", currency: "JPY" },
  nl:  { label: "🇳🇱 Amazon.nl", currency: "EUR" },
  bol: { label: "🇳🇱 bol.com", currency: "EUR" },
};

let shopRate = null; // EUR per JPY
let shopRateDate = "";

// Amazon link → { asin, words }, bol link → { words }, barcode → { code }, else { words }
function shopParseQuery(raw) {
  const q = raw.trim();
  if (!q) return {};
  const amazon = q.match(/amazon\.[a-z.]+\/(?:([^/?#]+)\/)?(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
  if (amazon) {
    const slug = amazon[1] && !/^(dp|gp)$/i.test(amazon[1]) ? decodeURIComponent(amazon[1]) : "";
    return { asin: amazon[2].toUpperCase(), words: slug.replace(/-/g, " ").trim() };
  }
  const bol = q.match(/bol\.com\/[a-z]{2}\/[a-z]{2}\/p\/([^/?#]+)\/(\d+)/i);
  if (bol) return { words: decodeURIComponent(bol[1]).replace(/-/g, " "), bolUrl: q };
  const code = q.replace(/[\s-]/g, "");
  if (/^\d{8}$|^\d{12,14}$/.test(code)) return { code };
  if (/^[A-Z0-9]{10}$/.test(q) && /\d/.test(q) && /[A-Z]/.test(q)) return { asin: q };
  return { words: q };
}

function shopLinks(parsed) {
  const term = parsed.code || parsed.words || "";
  const enc = encodeURIComponent(term);
  const links = { jp: [], nl: [], bol: [] };
  if (parsed.asin) {
    links.jp.push({ text: "Same ASIN", href: `https://www.amazon.co.jp/dp/${parsed.asin}` });
    links.nl.push({ text: "Same ASIN", href: `https://www.amazon.nl/dp/${parsed.asin}` });
  }
  if (term) {
    links.jp.push({ text: "Search", href: `https://www.amazon.co.jp/s?k=${enc}` });
    links.nl.push({ text: "Search", href: `https://www.amazon.nl/s?k=${enc}` });
  }
  if (parsed.bolUrl) links.bol.push({ text: "Product", href: parsed.bolUrl });
  if (term) links.bol.push({ text: "Search", href: `https://www.bol.com/nl/nl/s/?searchtext=${enc}` });
  return links;
}

// ===== Exchange rate =====
async function shopLoadRate() {
  if (shopRate) return;
  const el = document.getElementById("shop-rate");
  try {
    const res = await fetch(SHOP_FX_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    shopRate = data.rates.EUR;
    shopRateDate = data.date;
    el.textContent = `¥1,000 = ${shopEuro(shopRate * 1000)} · ECB rate ${shopRateDate}`;
  } catch (e) {
    el.textContent = "Couldn't load the exchange rate. Yen prices can't be converted.";
  }
  shopUpdate();
}

// ===== Calculate =====
// Accepts "12,800", "¥12800", "24,99", "1.234,56" and "1,234.56"
function shopNumber(id) {
  let s = document.getElementById(id).value.replace(/[^\d.,]/g, "");
  s = /,\d{1,2}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  const v = parseFloat(s);
  return v >= 0 ? v : null;
}

// Japan price in euro, depending on how you'd buy it
function shopJapanEuro(yen) {
  if (yen == null || !shopRate) return null;
  const mode = document.getElementById("shop-jp-mode").value;
  if (mode === "taxfree") return yen / (1 + SHOP_JP_TAX) * shopRate;
  if (mode === "injapan") return yen * shopRate;
  const shippingYen = shopNumber("shop-jp-ship") || 0;
  return (yen + shippingYen) * shopRate * (1 + SHOP_NL_VAT);
}

function shopUpdate() {
  const parsed = shopParseQuery(document.getElementById("shop-q").value);
  const links = shopLinks(parsed);
  const prices = {
    jp: shopJapanEuro(shopNumber("shop-jp-price")),
    nl: shopNumber("shop-nl-price"),
    bol: shopNumber("shop-bol-price"),
  };
  document.getElementById("shop-ship-row").hidden = document.getElementById("shop-jp-mode").value !== "shipped";

  Object.keys(SHOP_STORES).forEach(store => {
    document.getElementById(`shop-${store}-links`).innerHTML = links[store].length
      ? links[store].map(l => `<a class="shop-link" href="${shopEscape(l.href)}" target="_blank" rel="noopener">${l.text} ↗</a>`).join("")
      : `<span class="shop-hint">Paste a link, barcode or name</span>`;
  });
  document.getElementById("shop-jp-eur").textContent = prices.jp != null ? `≈ ${shopEuro(prices.jp)}` : "";

  const known = Object.entries(prices).filter(([, v]) => v != null && v > 0).sort((a, b) => a[1] - b[1]);
  Object.keys(SHOP_STORES).forEach(store => {
    document.getElementById(`shop-${store}-card`).classList.toggle("winner", known.length > 1 && known[0][0] === store && known[0][1] < known[1][1] - 0.004);
  });

  const out = document.getElementById("shop-result");
  if (known.length < 2) {
    out.innerHTML = `<p class="shop-hint">Enter at least two prices to compare.</p>`;
  } else {
    const [best, next] = known;
    const diff = next[1] - best[1];
    out.innerHTML = diff < 0.005
      ? `<p class="ikea-verdict even">${SHOP_STORES[best[0]].label} and ${SHOP_STORES[next[0]].label} cost the same</p>`
      : `<p class="ikea-verdict ${best[0]}">${SHOP_STORES[best[0]].label} is cheapest: <strong>${shopEuro(best[1])}</strong>, ${shopEuro(diff)} (${Math.round(diff / next[1] * 100)}%) less than ${SHOP_STORES[next[0]].label}</p>`;
  }
  shopSaveHash();
}

// ===== URL state =====
const SHOP_HASH_FIELDS = { q: "shop-q", jp: "shop-jp-price", nl: "shop-nl-price", bol: "shop-bol-price", mode: "shop-jp-mode", ship: "shop-jp-ship" };

function shopSaveHash() {
  if (!location.hash.startsWith("#shop")) return;
  const params = new URLSearchParams();
  Object.entries(SHOP_HASH_FIELDS).forEach(([key, id]) => {
    const v = document.getElementById(id).value.trim();
    if (v && !(key === "mode" && v === "shipped")) params.set(key, v);
  });
  const hash = params.toString() ? `#shop?${params}` : "#shop";
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

function shopLoadHash() {
  const m = location.hash.match(/^#shop\?(.*)$/);
  if (!m) return;
  const params = new URLSearchParams(m[1]);
  Object.entries(SHOP_HASH_FIELDS).forEach(([key, id]) => {
    if (params.has(key)) document.getElementById(id).value = params.get(key);
  });
}

// Called when the tab is shown (also after a manual URL change)
function shopInit() {
  shopLoadHash();
  shopLoadRate();
  shopUpdate();
}

function shopEuro(n) {
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function shopEscape(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shop-form");
  form.addEventListener("input", shopUpdate);
  form.addEventListener("submit", e => e.preventDefault());
});
