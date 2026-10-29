# To-do

A scheduled task builds the **first unchecked item** each day (one item per day), ticks it off
with the date and commit, and pushes to `main`. Reorder or delete lines to change what comes next.
When fewer than 3 items are left unchecked, it scans the map app (github.com/yeeeeeeeh/map-app)
for ideas and appends new ones under "From the map app".

Sizes are rough % of one session's usage.

## Next up

- [ ] 🌐 **Light mode for Retire and Visa**: add `themed` to their panels and swap hard-coded dark colours for tokens (see "Light theme" in style.css); Visa map in light colours too. Add the 🌗 theme button to their toolbars. (5–8%)
- [ ] 🌐 **Light mode for Quests and IKEA**: same for the Quests home (cards, filters, progress panel) and IKEA; once every tab is themed, move the light tokens to `:root` and put the theme button in all toolbars. (5–8%)
- [ ] 🛂 **Dutch passport column**: side-by-side with Taiwan in the list and the detail sheet, plus a "Dutch is easier" filter. Data: map-app `dutch_visa_requirements.txt` + `DutchVisaDatabase`. (4–6%)
- [ ] ☕ **Compiles or not?**: quick yes/no game on the labelled snippets already in the Java course; misses feed review. (4–6%)
- [ ] ☕ **Readiness planner**: exam date countdown, lessons per day to finish, mock score trend, lesson vs mock mastery. (5–7%)
- [ ] 🌐 **One backup for all tabs**: export/import everything (Java progress, Retire inputs, Visa visited/wishlist) as one JSON file. (2–4%)
- [ ] 🛂 **Wishlist**: mark countries to visit with a note; filter the list and highlight them on the map; count them in Stats. (3–5%)
- [ ] 🛂 **Travel advisory level** per country (GOV.UK), coloured on the list and the map, with an advisory map layer. Map-app: `TravelAdvisoryStore`. (5–8%)
- [ ] 🛂 **Iconic attraction** per country on the detail sheet (text only, no photos). Map-app: `iconic_attractions.yaml`. (2–4%)
- [ ] 🛂 **Ramadan note** for countries where it affects travel, with this year's dates. Map-app: `ramadan_facts.yaml`. (1–3%)
- [ ] 🌐 **Tab bar "More" menu**: room for more tabs without squeezed labels on phones. (2–3%)
- [ ] 🛂 **Travel finder**: "where next" filter over unvisited countries: visa-free/eTA, direct flight, low advisory, few health risks. Best after the advisory item. Map-app: `CountryTravelFacts` + Explore filters. (5–8%)
- [ ] 🛂 **Capital quiz**: Kahoot-style "guess the capital" for countries you haven't visited. Map-app: `CapitalQuizView`. (4–6%)
- [ ] ☕ **Answer log**: full answer history with filters and "copy as Markdown for AI chat" (also for saved items). (4–6%)
- [ ] 💰 **New box 3 as in the latest plan (B)**: dividends taxed yearly, gains only on sale, €1,000 tax-free; tax hit when switching ETFs at retirement. (5–7%)
- [ ] 💰 **Hillen rule and the higher forfait** for homes over ~€1.3M, for a more precise mortgage deduction. (2–4%)
- [ ] 💰 **Gross → net salary**: enter gross pay, get Dutch net income (income tax, credits). (6–10%)
- [ ] 🌐 **Works offline (PWA)**: installable on the home screen, usable without internet. (4–6%)
- [ ] ☕ **Pearson VUE exam look** for mocks, with the "review marked questions" screen. (4–6%)
- [ ] ☕ **Arcade**: Survival (lives), Speed run (timer), Boss fight per unit; feeds review. (8–12%)
- [ ] ☕ **Flight plan**: long study session in blocks with guided breaks and a final mock. (8–12%)

## From the map app

## Done

- [x] ☕ Light mode for Java, with Auto / Light / Dark switch (2026-10-29, 7f8cbe7)
- [x] 🛂 Direct flights from Schiphol (9ff8ec2)
- [x] 🛂 Visited stats (c7f7d92)
- [x] 🛂 Health & vaccines (8b23ddc)
- [x] 💰 Pay box 3 from salary (5542200)

## Not doing

- ☕ AI tutor: needs a paid API key and a backend.
- ☕ Playground (compile and run): skipped on request.
