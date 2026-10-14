// Fetches the public Greenwheels (NS) car feeds and writes one compact JSON
// file the site can load. Greenwheels sends no CORS headers, so the browser
// can't read these feeds directly.
import { writeFileSync } from "node:fs";

const BASE = "https://ns.greenwheels.com/book/js/nl";
const out = process.argv[2] || "greenwheels.json";

async function feed(name) {
  const res = await fetch(`${BASE}/${name}/`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

const [cities, availableFrom, booked, battery] = await Promise.all([
  feed("citiesAndLocations"),
  feed("availableFromCars"),
  feed("bookedCars"),
  feed("electricCarEnergyLevels"),
]);

const data = {
  updated: new Date().toISOString(),
  cities: cities
    .map(c => ({
      name: c.name,
      locations: c.locations
        .filter(l => l.cars.length)
        .map(l => ({
          id: l.id,
          addr: l.addr.replace(/\s+/g, " ").trim(),
          geo: l.geo,
          railway: l.railway,
          cars: l.cars.map(car => ({
            id: car.id,
            license: car.license,
            model: car.model,
            type: car.type,
            ...(car.id in battery && { battery: battery[car.id] }),
            ...(booked[car.id] && { booked: true }),
            ...(car.id in availableFrom && { availableFrom: availableFrom[car.id] }),
          })),
        })),
    }))
    .filter(c => c.locations.length)
    .sort((a, b) => a.name.localeCompare(b.name, "nl")),
};

if (!data.cities.length) throw new Error("No cities returned");
writeFileSync(out, JSON.stringify(data));
console.log(`${data.cities.length} cities, ${data.cities.reduce((n, c) => n + c.locations.length, 0)} locations`);
