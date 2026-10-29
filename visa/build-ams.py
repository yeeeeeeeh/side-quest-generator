"""Copies visa/ams-destinations.json (direct flights from Schiphol) into visa/countries.json.
Each destination is {"city", "countryCode", "lat", "lon"}; edit that file, then run:
python3 visa/build-ams.py"""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(here, "ams-destinations.json"), encoding="utf-8"))
path = os.path.join(here, "countries.json")
data = json.load(open(path, encoding="utf-8"))
by_code = {}
for d in src["destinations"]:
    by_code.setdefault(d["countryCode"].upper(), []).append({"city": d["city"], "lat": d["lat"], "lon": d["lon"]})
known = {c["code"] for c in data["countries"]}
missing = sorted(set(by_code) - known)
if missing:
    raise SystemExit(f"Unknown country codes: {missing}")
for c in data["countries"]:
    cities = sorted(by_code.get(c["code"], []), key=lambda a: a["city"])
    if cities:
        c["ams"] = cities
    else:
        c.pop("ams", None)
data["amsSource"] = f'{src["source"]}, updated {src["updated"]}'
json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f'{len(src["destinations"])} cities in {len(by_code)} countries')
