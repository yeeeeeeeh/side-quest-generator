"""Snapshot of UK Foreign Office (FCDO) travel advice per country into visa/advisory.json.
Source: GOV.UK Content API, https://www.gov.uk/api/content/foreign-travel-advice/<slug> (Open Government Licence v3.0).
Each country's "alert_status" becomes a level:
  4 = advise against all travel to the whole country
  3 = advise against all but essential travel to the whole country
  2 = advise against (all or all-but-essential) travel to parts of the country
  1 = no FCDO warning against travel
Countries are matched by the "govuk" slug in visa/countries.json. Run: python3 visa/build-advisory.py"""
import json, os, time, urllib.request, datetime

here = os.path.dirname(os.path.abspath(__file__))
API = "https://www.gov.uk/api/content/foreign-travel-advice"

def get(url):
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "side-quest-generator advisory snapshot"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def level(alerts):
    a = set(alerts or [])
    if "avoid_all_travel_to_whole_country" in a: return 4
    if "avoid_all_but_essential_travel_to_whole_country" in a: return 3
    if a & {"avoid_all_travel_to_parts", "avoid_all_but_essential_travel_to_parts"}: return 2
    return 1

countries = json.load(open(os.path.join(here, "countries.json"), encoding="utf-8"))["countries"]
# countries.json slugs that differ from GOV.UK's current ones (several places share one GOV.UK page).
ALIAS = {"burma": "myanmar", "turkiye": "turkey", "ivory-coast": "cote-d-ivoire", "gambia": "the-gambia", "the-bahamas": "bahamas",
         "republic-of-congo": "congo", "democratic-republic-of-congo": "democratic-republic-of-the-congo", "macau": "macao",
         "micronesia": "federated-states-of-micronesia", "the-occupied-palestinian-territories": "palestine",
         "caribbean-netherlands": "bonaire-st-eustatius-saba", "cook-islands": "cook-islands-tokelau-and-niue",
         "niue": "cook-islands-tokelau-and-niue", "tokelau": "cook-islands-tokelau-and-niue", "pitcairn-islands": "pitcairn-island",
         "south-georgia": "south-georgia-and-south-sandwich-islands", "saint-helena-ascension-and-tristan-da-cunha": "st-helena-ascension-and-tristan-da-cunha",
         "sint-maarten": "st-maarten", "saint-martin": "st-martin-and-st-barthelemy", "saint-barthelemy": "st-martin-and-st-barthelemy",
         "saint-pierre-and-miquelon": "st-pierre-and-miquelon", "antarctica": "antarctica-british-antarctic-territory"}
by_slug = {}
for c in countries:
    if c.get("govuk"): by_slug.setdefault(ALIAS.get(c["govuk"], c["govuk"]), []).append(c["code"])
index = {ch["details"]["country"]["slug"] for ch in get(API)["links"]["children"]}
out, missing = {}, []
for slug in sorted(by_slug):
    if slug not in index: missing.append(slug); continue
    d = get(f"{API}/{slug}")
    det = d["details"]
    entry = {"level": level(det.get("alert_status")), "updated": (d.get("public_updated_at") or "")[:10], "slug": slug}
    if det.get("change_description"): entry["change"] = det["change_description"][:200]
    for code in by_slug[slug]: out[code] = entry
    time.sleep(0.15)
json.dump({"source": "UK FCDO travel advice via GOV.UK (Open Government Licence v3.0)", "fetched": datetime.date.today().isoformat(), "levels": out},
          open(os.path.join(here, "advisory.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)} countries; no GOV.UK page for {len(missing)}: {', '.join(missing)}")
