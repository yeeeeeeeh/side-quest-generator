# Workflow

- Commit and push straight to `main`. No feature branches or PRs.
- Static site served by GitHub Pages from `main`: no build step, plain JS in IIFEs, one file per tab (`retire.js`, `visa.js`, `java.js`), tabs registered in `TAB_PANELS` in `script.js`.
- When a JS or CSS file changes, bump its `?v=N` in `index.html` so phones don't keep the old copy.
- Test in Chromium at a 390×844 phone viewport (`python3 -m http.server` + Playwright) and check for page errors before pushing.
- `TODO.md` is the build queue: tick an item off (date + commit) when it ships.
- Map app data (github.com/yeeeeeeeh/map-app, private) is copied in as snapshots; credit the source and its date on the page.
- Direct flights: edit `visa/ams-destinations.json`, then run `python3 visa/build-ams.py`.
- Tax rules: only implement Dutch tax rules that are law. Proposals (e.g. the new box 3, Belastingplan figures not yet passed) may be mentioned as "proposed" in hints, never built into the calculator or used as defaults. Items under "On hold" in `TODO.md` are never picked.
