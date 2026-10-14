// ===== Greenwheels =====
// Native front end for Greenwheels (NS) car booking.
// Greenwheels sends no CORS headers, so a scheduled GitHub Action
// (.github/workflows/greenwheels-data.yml) copies their public car feeds to
// the greenwheels-data branch, which raw.githubusercontent.com serves with CORS.
// "Boek nu" posts the same form Greenwheels' own Boek nu button posts.
const GW_DATA_URL = "https://raw.githubusercontent.com/yeeeeeeeh/side-quest-generator/greenwheels-data/greenwheels.json";
const GW_BOOK_URL = "https://ns.greenwheels.com/book/reservation/create/nl/create";
const GW_SLOT_MS = 15 * 60 * 1000;
const GW_MAX_MS = 48 * 60 * 60 * 1000;
const GW_TYPES = { compact: "Compact", midsize: "Station wagon", electric: "Electric", van: "Van" };
const GW_NEARBY_COUNT = 20;

let gwData = null;
let gwLoading = false;
let gwCurrentCity = null;

async function gwInit() {
  if (gwData || gwLoading) return;
  gwLoading = true;
  gwInitTimes();
  const status = document.getElementById("gw-status");
  status.textContent = "Loading cars…";
  try {
    const res = await fetch(GW_DATA_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    gwData = await res.json();
    document.getElementById("gw-city-list").innerHTML =
      gwData.cities.map(c => `<option value="${gwEscape(c.name)}"></option>`).join("");
    const cars = gwData.cities.reduce((n, c) => n + c.locations.reduce((m, l) => m + l.cars.length, 0), 0);
    status.textContent = `${gwData.cities.length} cities · ${cars.toLocaleString()} cars · updated ${gwAgo(gwData.updated)}`;

    const last = gwGetLastCity();
    if (last && gwFindCity(last)) {
      document.getElementById("gw-city").value = last;
      gwSelectCity(last);
    }
  } catch (e) {
    status.textContent = "Couldn't load Greenwheels cars. Tap Open ↗ to use their site.";
  } finally {
    gwLoading = false;
  }
}

// ===== Times =====
function gwInitTimes() {
  const start = document.getElementById("gw-start");
  const end = document.getElementById("gw-end");
  if (start.value) return;
  const s = Math.ceil(Date.now() / GW_SLOT_MS) * GW_SLOT_MS;
  start.value = gwToLocalInput(s);
  end.value = gwToLocalInput(s + 60 * 60 * 1000);
  start.min = gwToLocalInput(s);
  start.addEventListener("change", () => {
    const ms = gwFromLocalInput(start.value);
    if (gwFromLocalInput(end.value) <= ms) end.value = gwToLocalInput(ms + 60 * 60 * 1000);
  });
}

function gwToLocalInput(ms) {
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

function gwFromLocalInput(value) {
  // Round to Greenwheels' 15-minute slots
  return Math.round(new Date(value).getTime() / GW_SLOT_MS) * GW_SLOT_MS;
}

function gwGetTimes() {
  const start = gwFromLocalInput(document.getElementById("gw-start").value);
  const end = gwFromLocalInput(document.getElementById("gw-end").value);
  if (!start || !end) return { error: "Pick a start and end time." };
  if (end <= start) return { error: "End time must be after start time." };
  if (end - start > GW_MAX_MS) return { error: "Greenwheels allows at most 48 hours." };
  if (start < Date.now() - GW_SLOT_MS) return { error: "Start time is in the past." };
  return { start, end };
}

// ===== Search =====
function gwFindCity(name) {
  const q = name.trim().toLowerCase();
  return gwData?.cities.find(c => c.name.toLowerCase() === q);
}

function gwSelectCity(name) {
  const city = gwFindCity(name);
  if (!city || city === gwCurrentCity) return;
  gwCurrentCity = city;
  gwSetLastCity(city.name);
  const locs = [...city.locations].sort((a, b) =>
    b.railway - a.railway || b.cars.length - a.cars.length || a.addr.localeCompare(b.addr, "nl"));
  const cars = locs.reduce((n, l) => n + l.cars.length, 0);
  document.getElementById("gw-status").textContent = `${city.name}: ${locs.length} pickup points · ${cars} cars`;
  gwRenderLocations(locs);
}

function gwNearMe() {
  const status = document.getElementById("gw-status");
  if (!gwData) return;
  if (!navigator.geolocation) { status.textContent = "Location isn't available on this device."; return; }
  status.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const nearby = gwData.cities
      .flatMap(c => c.locations.map(l => ({ ...l, city: c.name, km: gwDistanceKm(latitude, longitude, l.geo[0], l.geo[1]) })))
      .filter(l => l.geo[0] || l.geo[1])
      .sort((a, b) => a.km - b.km)
      .slice(0, GW_NEARBY_COUNT);
    document.getElementById("gw-city").value = "";
    gwCurrentCity = null;
    status.textContent = `${nearby.length} nearest pickup points`;
    gwRenderLocations(nearby);
  }, () => {
    status.textContent = "Couldn't get your location. Search a city instead.";
  }, { enableHighAccuracy: true, timeout: 10000 });
}

function gwDistanceKm(lat1, lng1, lat2, lng2) {
  const rad = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lng2 - lng1) * rad / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

// ===== Render =====
function gwRenderLocations(locs) {
  const results = document.getElementById("gw-results");
  results.innerHTML = locs.length
    ? locs.map(gwLocationCard).join("")
    : `<p class="empty-state">No pickup points found.</p>`;
}

function gwLocationCard(l) {
  const meta = [
    l.railway ? `<span class="gw-tag">🚆 NS station</span>` : "",
    l.city ? `<span class="gw-tag">${gwEscape(l.city)}</span>` : "",
    l.km != null ? `<span class="gw-tag">${l.km < 1 ? `${Math.round(l.km * 1000)} m` : `${l.km.toFixed(1)} km`}</span>` : "",
  ].join("");
  return `
    <details class="gw-loc">
      <summary class="gw-loc-summary">
        <span class="gw-loc-main">
          <span class="gw-loc-name">📍 ${gwEscape(l.addr)}</span>
          ${meta}
        </span>
        <span class="gw-loc-cars">${l.cars.length} 🚗</span>
      </summary>
      <div class="gw-cars">${l.cars.map(gwCarRow).join("")}</div>
    </details>`;
}

function gwCarRow(car) {
  const details = [
    GW_TYPES[car.type] || car.type,
    car.battery != null ? `🔋 ${car.battery}%` : "",
  ].filter(Boolean).join(" · ");
  const state = car.booked
    ? `<span class="gw-car-state busy">Booked now${car.availableFrom ? ` · free from ${gwEscape(car.availableFrom)}` : ""}</span>`
    : `<span class="gw-car-state free">Available now</span>`;
  return `
    <div class="gw-car">
      <div class="gw-car-info">
        <span class="gw-car-model">${gwEscape(car.model)}</span>
        <span class="gw-car-plate">${gwEscape(car.license)}</span>
        <span class="gw-car-details">${details}</span>
        ${state}
      </div>
      <button class="btn btn-success gw-book" data-car="${gwEscape(car.id)}">Boek nu</button>
    </div>`;
}

// ===== Book =====
function gwBook(carId) {
  const times = gwGetTimes();
  if (times.error) {
    alert(times.error);
    document.getElementById("gw-start").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const form = document.createElement("form");
  form.method = "post";
  form.action = GW_BOOK_URL;
  form.target = "_blank";
  const fields = {
    fleetAndLang: "nl",
    "conceptReservation.reservationStart": times.start,
    "conceptReservation.reservationEnd": times.end,
    "conceptReservation.carId": carId,
    webCarId: carId,
  };
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

// ===== Helpers =====
function gwEscape(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function gwAgo(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  return `${Math.round(min / 60)} h ago`;
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
  input.addEventListener("input", () => { if (gwFindCity(input.value)) gwSelectCity(input.value); });
  document.getElementById("gw-near").addEventListener("click", gwNearMe);
  document.getElementById("gw-results").addEventListener("click", e => {
    const btn = e.target.closest(".gw-book");
    if (btn) gwBook(btn.dataset.car);
  });
});
