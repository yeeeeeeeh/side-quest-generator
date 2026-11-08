# To-do

A scheduled task builds the **first unchecked item** each day (one item per day), ticks it off
with the date and commit, and pushes to `main`. Reorder or delete lines to change what comes next.
When fewer than 3 items are left unchecked, it scans the map app (github.com/yeeeeeeeh/map-app)
for ideas and appends new ones under "From the map app".

Sizes are rough % of one session's usage.

## Next up

- [ ] 🛂 **Travel advisory level** per country (GOV.UK), coloured on the list and the map, with an advisory map layer. Map-app: `TravelAdvisoryStore`. (5–8%)
- [ ] 🛂 **Iconic attraction** per country on the detail sheet (text only, no photos). Map-app: `iconic_attractions.yaml`. (2–4%)
- [ ] 🛂 **Ramadan note** for countries where it affects travel, with this year's dates. Map-app: `ramadan_facts.yaml`. (1–3%)
- [ ] 🌐 **Tab bar "More" menu**: room for more tabs without squeezed labels on phones. (2–3%)
- [ ] 🛂 **Travel finder**: "where next" filter over unvisited countries: visa-free/eTA, direct flight, low advisory, few health risks. Best after the advisory item. Map-app: `CountryTravelFacts` + Explore filters. (5–8%)
- [ ] 🛂 **Capital quiz**: Kahoot-style "guess the capital" for countries you haven't visited. Map-app: `CapitalQuizView`. (4–6%)
- [ ] ☕ **Answer log**: full answer history with filters and "copy as Markdown for AI chat" (also for saved items). (4–6%)
- [ ] 💰 **Hillen rule and the higher forfait** for homes over ~€1.3M, for a more precise mortgage deduction. (2–4%)
- [ ] 💰 **Gross → net salary**: enter gross pay, get Dutch net income (income tax, credits). (6–10%)
- [ ] 🌐 **Works offline (PWA)**: installable on the home screen, usable without internet. (4–6%)
- [ ] ☕ **Pearson VUE exam look** for mocks, with the "review marked questions" screen. (4–6%)
- [ ] ☕ **Arcade**: Survival (lives), Speed run (timer), Boss fight per unit; feeds review. (8–12%)
- [ ] ☕ **Flight plan**: long study session in blocks with guided breaks and a final mock. (8–12%)
- [ ] 🛂 **Dutch passport column**: side-by-side with Taiwan in the list and the detail sheet, plus a "Dutch is easier" filter. Data: map-app `dutch_visa_requirements.txt` + `DutchVisaDatabase`. (4–6%) Blocked (2026-11-06): the scheduled job can attach map-app but cloning it was refused by the permission check; allow the clone and move this back up.

## From the map app

## On hold (do not build)

Not picked by the daily job. Move back to "Next up" only when the condition is met.

- 💰 **New box 3 as in the latest plan (B)**: dividends taxed yearly, gains only on sale, €1,000 tax-free; tax hit when switching ETFs at retirement. (5–7%) On hold (owner, 2026-11-07): not law yet; build only after both Kamers pass it, with the final figures.

## Done

- [x] 🛂 Wishlist: ⭐ countries with notes, list filter, gold outline on the map, Stats section (2026-11-08, 8771b26)
- [x] 🌐 One backup for all tabs: export / restore everything as one JSON file, Quests home (2026-11-07, 64d80b0)
- [x] ☕ Readiness planner: exam countdown, lessons a day, mock trend, lessons vs mocks (2026-11-07, 49bdb11)
- [x] ☕ Compiles or not?: 325 yes/no snippets from the Fix-the-bug drill, misses go to review (2026-11-06, a439ebf)
- [x] 🌐 Light mode for Quests and IKEA; light tokens now site-wide, 🌗 in every toolbar (2026-11-05, 1348beb)
- [x] 🌐 Light mode for Retire and Visa, map included (2026-11-04, 8b80c40)
- [x] 🇯🇵 Japan: shopping list export / import as a JSON file (2026-11-03, 39d81ec)
- [x] 🇯🇵 Japan: barcode scan with the camera, or from a photo (2026-11-02, 705e557)
- [x] 🇯🇵 Japan shopping tab: shop search, Rakuten live prices, "worth it?" calculator, shopping list (2026-11-01, f1521e6)
- [x] ☕ Light mode for Java, with Auto / Light / Dark switch (2026-10-29, 7f8cbe7)
- [x] 🛂 Direct flights from Schiphol (9ff8ec2)
- [x] 🛂 Visited stats (c7f7d92)
- [x] 🛂 Health & vaccines (8b23ddc)
- [x] 💰 Pay box 3 from salary (5542200)

## Not doing

- ☕ AI tutor: needs a paid API key and a backend.
- ☕ Playground (compile and run): skipped on request.
