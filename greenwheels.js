// ===== Greenwheels =====
// Native front end for the public Greenwheels (NS) booking endpoints.
// Their API sends no CORS headers, but these two endpoints support JSONP,
// so we load them with <script> tags.
const GW_BASE = "https://ns.greenwheels.com";
const GW_SEARCH_URL = `${GW_BASE}/book/search/nl/index`;

let gwCities = [];
let gwLoaded = false;
let gwJsonpId = 0;

function gwJsonp(path, params) {
  return new Promise((resolve, reject) => {
    const cb = `gwCb${Date.now()}_${gwJsonpId++}`;
    const qs = new URLSearchParams({ ...params, callback: cb });
    const script = document.createElement("script");
    const timer = setTimeout(() => cleanup(new Error("timeout")), 15000);

    function cleanup(err, data) {
      clearTimeout(timer);
      delete window[cb];
      script.remove();
      err ? reject(err) : resolve(data);
    }

    window[cb] = data => cleanup(null, data);
    script.onerror = () => cleanup(new Error("network"));
    script.src = `${GW_BASE}${path}?${qs}`;
    document.head.appendChild(script);
  });
}

async function gwInit() {
  if (gwLoaded) return;
  gwLoaded = true;
  const status = document.getElementById("gw-status");
  status.textContent = "Loading cities…";
  try {
    const res = await gwJsonp("/book/ajax/location/getcities", { fullList: true });
    gwCities = (res.success?.cities || []).filter(c => c.visible && c.totalNumberOfCars > 0);
    const list = document.getElementById("gw-city-list");
    list.innerHTML = gwCities.map(c => `<option value="${gwEscape(c.cityName)}"></option>`).join("");
    status.textContent = `${gwCities.length} cities · ${gwCities.reduce((n, c) => n + c.totalNumberOfCars, 0).toLocaleString()} cars`;

    const last = gwGetLastCity();
    if (last && gwCities.some(c => c.cityName === last)) {
      document.getElementById("gw-city").value = last;
      gwSelectCity(last);
    }
  } catch (e) {
    gwLoaded = false;
    status.textContent = "Couldn't reach Greenwheels. Tap Open ↗ to use their site.";
  }
}

async function gwSelectCity(name) {
  const city = gwCities.find(c => c.cityName.toLowerCase() === name.trim().toLowerCase());
  const results = document.getElementById("gw-results");
  const status = document.getElementById("gw-status");
  if (!city) return;

  gwSetLastCity(city.cityName);
  status.textContent = `Loading pickup points in ${city.cityName}…`;
  results.innerHTML = "";
  try {
    const res = await gwJsonp("/book/ajax/location/getlocations", { "carSearchRequest.cityIdEquals": city.id });
    const locs = (res.success?.locations || [])
      .filter(l => l.visible)
      .sort((a, b) => b.totalNumberOfCars - a.totalNumberOfCars || a.locationName.localeCompare(b.locationName));
    status.textContent = `${city.cityName}: ${locs.length} pickup points · ${city.totalNumberOfCars} cars`;
    results.innerHTML = locs.length ? locs.map(gwLocationCard).join("") : `<p class="empty-state">No pickup points found.</p>`;
  } catch (e) {
    status.textContent = "Couldn't load pickup points. Try again.";
  }
}

function gwLocationCard(l) {
  const href = `${GW_SEARCH_URL}?location=${encodeURIComponent(l.locationId)}`;
  const tags = [
    l.freeFloating ? "Free-floating" : "",
    l.specialAccess ? "Special access" : "",
  ].filter(Boolean).map(t => `<span class="gw-tag">${t}</span>`).join("");
  return `
    <a class="gw-loc" href="${href}" target="_blank" rel="noopener">
      <span class="gw-loc-main">
        <span class="gw-loc-name">📍 ${gwEscape(l.locationName)}</span>
        ${tags}
      </span>
      <span class="gw-loc-cars">${l.totalNumberOfCars} 🚗</span>
    </a>`;
}

function gwEscape(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function gwGetLastCity() {
  try { return localStorage.getItem("gwCity"); } catch (e) { return null; }
}

function gwSetLastCity(name) {
  try { localStorage.setItem("gwCity", name); } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("gw-city");
  input.addEventListener("change", () => gwSelectCity(input.value));
  input.addEventListener("input", () => {
    if (gwCities.some(c => c.cityName === input.value)) gwSelectCity(input.value);
  });
});
