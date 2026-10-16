// ===== IKEA DE vs NL =====
// Compares IKEA prices in the Netherlands and Germany. IKEA's public search
// API (sik.search.blue.cdtapps.com) allows cross-origin requests, and article
// numbers are the same in every country.
// Accepts an ikea.com product link (any country), an article number
// (00263850, 002.638.50, s69xxxxxx) or a search like "billy".
// The search is kept in the URL (#ikea?q=billy) so it can be shared or edited.
const IKEA_API = "https://sik.search.blue.cdtapps.com";
const IKEA_MARKETS = {
  nl: { path: "nl/nl", label: "🇳🇱 NL" },
  de: { path: "de/de", label: "🇩🇪 DE" },
};
const IKEA_MAX_RESULTS = 12;

let ikeaSearchId = 0;

// "https://www.ikea.com/de/de/p/billy-...-00263850/" → { itemNo: "00263850", market: "de" }
// "002.638.50" → { itemNo: "00263850" }, "billy" → { text: "billy" }
function ikeaParseQuery(raw) {
  const q = raw.trim();
  const url = q.match(/ikea\.com\/([a-z]{2})\/[a-z]{2}\/p\/[^/?#]*?-?(s?\d{8})(?:[/?#]|$)/i);
  if (url) return { itemNo: url[2].toLowerCase().replace(/^s/, ""), market: url[1].toLowerCase() };
  const num = q.replace(/[.\s-]/g, "").match(/^s?(\d{8})$/i);
  if (num) return { itemNo: num[1] };
  return { text: q };
}

async function ikeaSearch(market, q, size) {
  const params = new URLSearchParams({ q, size, types: "PRODUCT" });
  const res = await fetch(`${IKEA_API}/${IKEA_MARKETS[market].path}/search-result-page?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.searchResultPage?.products?.main?.items || []).map(i => i.product).filter(Boolean);
}

// Exact article lookup (the search is fuzzy, so match the number ourselves)
async function ikeaLookup(market, itemNo) {
  try {
    const products = await ikeaSearch(market, itemNo, 10);
    return products.find(p => p.itemNo === itemNo || p.itemNoGlobal === itemNo) || null;
  } catch (e) {
    return null;
  }
}

async function ikeaRun(raw) {
  const id = ++ikeaSearchId;
  const status = document.getElementById("ikea-status");
  const results = document.getElementById("ikea-results");
  const query = raw.trim();
  ikeaSetHashQuery(query);
  if (!query) {
    status.textContent = "";
    results.innerHTML = "";
    return;
  }

  const parsed = ikeaParseQuery(query);
  status.textContent = "Searching IKEA…";
  results.innerHTML = "";
  try {
    let pairs;
    if (parsed.itemNo) {
      const [nl, de] = await Promise.all([ikeaLookup("nl", parsed.itemNo), ikeaLookup("de", parsed.itemNo)]);
      pairs = nl || de ? [{ nl, de }] : [];
    } else {
      const base = document.getElementById("ikea-lang").value;
      const other = base === "nl" ? "de" : "nl";
      const found = (await ikeaSearch(base, parsed.text, IKEA_MAX_RESULTS)).slice(0, IKEA_MAX_RESULTS);
      const matches = await Promise.all(found.map(p => ikeaLookup(other, p.itemNo)));
      pairs = found.map((p, i) => ({ [base]: p, [other]: matches[i] }));
    }
    if (id !== ikeaSearchId) return;

    status.textContent = pairs.length
      ? `${pairs.length} product${pairs.length === 1 ? "" : "s"}${ikeaSummary(pairs)}`
      : "No IKEA products found.";
    results.innerHTML = pairs.map(ikeaCard).join("");
  } catch (e) {
    if (id !== ikeaSearchId) return;
    status.textContent = "Couldn't reach IKEA. Try again.";
  }
}

function ikeaSummary(pairs) {
  const both = pairs.filter(p => p.nl && p.de);
  if (both.length < 2) return "";
  const nlCheaper = both.filter(p => p.nl.salesPrice.numeral < p.de.salesPrice.numeral).length;
  const deCheaper = both.filter(p => p.de.salesPrice.numeral < p.nl.salesPrice.numeral).length;
  return ` · cheaper in NL: ${nlCheaper} · in DE: ${deCheaper}`;
}

// ===== Render =====
function ikeaCard({ nl, de }) {
  const p = nl || de;
  const nlPrice = nl?.salesPrice?.numeral;
  const dePrice = de?.salesPrice?.numeral;
  let verdict = "";
  if (nlPrice != null && dePrice != null) {
    const diff = Math.abs(nlPrice - dePrice);
    const cheaper = diff < 0.005 ? null : (nlPrice < dePrice ? "nl" : "de");
    verdict = cheaper
      ? `<p class="ikea-verdict ${cheaper}">${IKEA_MARKETS[cheaper].label} cheaper by <strong>${ikeaEuro(diff)}</strong> (${Math.round(diff / Math.max(nlPrice, dePrice) * 100)}%)</p>`
      : `<p class="ikea-verdict even">Same price in both</p>`;
  } else {
    verdict = `<p class="ikea-verdict even">Only sold in ${nl ? IKEA_MARKETS.nl.label : IKEA_MARKETS.de.label}</p>`;
  }

  return `
    <article class="ikea-card">
      <div class="ikea-head">
        ${p.mainImageUrl ? `<img class="ikea-img" src="${ikeaEscape(p.mainImageUrl)}?f=xs" alt="" loading="lazy" />` : ""}
        <div class="ikea-info">
          <span class="ikea-name">${ikeaEscape(p.name)}</span>
          <span class="ikea-type">${ikeaEscape(p.typeName || "")}${p.itemMeasureReferenceText ? ` · ${ikeaEscape(p.itemMeasureReferenceText)}` : ""}</span>
          <span class="ikea-no">${ikeaFormatItemNo(p.itemNo)}</span>
        </div>
      </div>
      <div class="ikea-prices">
        ${ikeaPriceCell("nl", nl, dePrice)}
        ${ikeaPriceCell("de", de, nlPrice)}
      </div>
      ${verdict}
    </article>`;
}

function ikeaPriceCell(market, product, otherPrice) {
  const label = IKEA_MARKETS[market].label;
  if (!product) return `<div class="ikea-price missing"><span class="ikea-market">${label}</span><span class="ikea-amount">—</span><span class="ikea-note">Not available</span></div>`;
  const sp = product.salesPrice;
  const price = sp.numeral;
  const winner = otherPrice != null && price < otherPrice - 0.004;
  const notes = [
    sp.tagText || "",
    sp.previous ? `Was ${ikeaEuro(ikeaPrevious(sp.previous))}` : "",
  ].filter(Boolean).map(ikeaEscape).join(" · ");
  return `
    <a class="ikea-price${winner ? " winner" : ""}" href="${ikeaEscape(product.pipUrl)}" target="_blank" rel="noopener">
      <span class="ikea-market">${label} ↗</span>
      <span class="ikea-amount">${ikeaEuro(price)}</span>
      ${notes ? `<span class="ikea-note">${notes}</span>` : ""}
    </a>`;
}

function ikeaPrevious(prev) {
  return parseFloat(`${prev.wholeNumber}.${prev.decimals || "0"}`);
}

function ikeaFormatItemNo(no) {
  return /^\d{8}$/.test(no) ? `${no.slice(0, 3)}.${no.slice(3, 6)}.${no.slice(6)}` : ikeaEscape(no);
}

function ikeaEuro(n) {
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function ikeaEscape(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

// ===== URL state =====
function ikeaGetHashQuery() {
  const m = location.hash.match(/^#ikea\?(.*)$/);
  return m ? new URLSearchParams(m[1]).get("q") || "" : "";
}

function ikeaSetHashQuery(q) {
  if (!location.hash.startsWith("#ikea")) return;
  const hash = q ? `#ikea?${new URLSearchParams({ q })}` : "#ikea";
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

// Called when the IKEA tab is shown (also after a manual URL change)
function ikeaInit() {
  const input = document.getElementById("ikea-q");
  const q = ikeaGetHashQuery();
  if (q && q !== input.value) {
    input.value = q;
    ikeaRun(q);
  }
  if (!q && !input.value) input.focus({ preventScroll: true });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("ikea-q");
  document.getElementById("ikea-form").addEventListener("submit", e => {
    e.preventDefault();
    input.blur();
    ikeaRun(input.value);
  });
  // Pasting a link or article number searches right away
  input.addEventListener("paste", () => setTimeout(() => {
    if (!ikeaParseQuery(input.value).text) ikeaRun(input.value);
  }));
  document.getElementById("ikea-lang").addEventListener("change", () => {
    if (input.value.trim()) ikeaRun(input.value);
  });
});
