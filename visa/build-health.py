"""Builds visa/health.json from map-app's MapApp/Resources/country_risks.yaml and
the Chinese texts in MapApp/Data/CountryRiskDatabase.swift.
Usage: python3 visa/build-health.py <map-app dir>"""
import json, re, sys, yaml, os

app = sys.argv[1]
data = yaml.safe_load(open(os.path.join(app, "MapApp/Resources/country_risks.yaml"), encoding="utf-8"))
swift = open(os.path.join(app, "MapApp/Data/CountryRiskDatabase.swift"), encoding="utf-8").read()

def texts(var):
    # Body of `var <name>: String { switch self { ... } }`, then each `case .a, .b: return "..."`.
    body = swift.split(f"var {var}: String {{", 1)[1].split("\n    }\n", 1)[0]
    out = {}
    for cases, text in re.findall(r"case ([.\w,\s]+?):\s*return \"([^\"]*)\"", body):
        for c in re.findall(r"\.(\w+)", cases):
            out[c] = text
    return out

label, about, how, prevent = texts("label"), texts("explanation"), texts("transmission"), texts("prevention")
english = texts("englishName")
EMOJI = {"yellowFever": "🟡", "malaria": "🦟", "dengue": "🦟", "japaneseEncephalitis": "🦟", "polio": "💧",
         "chikungunya": "🦟", "rabies": "🐕", "typhoid": "💧", "tickBorneEncephalitis": "🕷", "schistosomiasis": "🌊",
         "hepatitisA": "💧", "hepatitisB": "🩸"}
meta = data["metadata"]
risks = {}
for key, codes in data["healthRisks"].items():
    risks[key] = {"zh": label[key], "en": english[key][0].upper() + english[key][1:], "emoji": EMOJI.get(key, "⚕️"),
                  "about": about[key], "how": how[key], "prevent": prevent[key],
                  "source": meta.get(key + "Source", ""), "codes": sorted(set(codes))}
json.dump({"reviewed": meta["healthRisksReviewed"], "note": meta["note"], "risks": risks},
          open(os.path.join(os.path.dirname(__file__), "health.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print({k: len(v["codes"]) for k, v in risks.items()})
