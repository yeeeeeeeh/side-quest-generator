// ===== Quest Data =====
const quests = [
  // Mental
  { title: "Meditate for 10 minutes", desc: "Find a quiet spot, set a timer for 10 minutes, and focus only on your breathing. No music, no distractions.", category: "Mental", difficulty: "Easy", xp: 75 },
  { title: "Write your thoughts for 20 minutes", desc: "Open a notebook or blank doc and write continuously for 20 minutes. Don't stop, don't edit — just let it flow.", category: "Mental", difficulty: "Easy", xp: 75 },
  { title: "Learn one new fact every hour today", desc: "Set hourly reminders. Each hour, stop and look up one genuinely interesting fact about any topic. Share one with someone by day's end.", category: "Mental", difficulty: "Easy", xp: 100 },
  { title: "Stay off your phone for 4 hours straight", desc: "No social media, no texts, no mindless scrolling. Do something analog instead. Notice how your mind reacts.", category: "Mental", difficulty: "Medium", xp: 150 },
  { title: "Do a digital detox for 24 hours", desc: "No social media, no streaming, no non-essential apps for a full day. Use the time to be bored — that's where ideas come from.", category: "Mental", difficulty: "Hard", xp: 300 },
  { title: "Read for 1 hour without stopping", desc: "Pick up any book you've been putting off. Read for a full uninterrupted hour. No phone, no pausing.", category: "Mental", difficulty: "Easy", xp: 100 },
  { title: "Write a letter to your future self", desc: "Write a letter to yourself 5 years from now. Seal it and set a calendar reminder to open it.", category: "Mental", difficulty: "Medium", xp: 175 },
  { title: "Learn to solve a Rubik's cube", desc: "Watch tutorials, practice until you can solve it from start to finish at least once. Time yourself.", category: "Mental", difficulty: "Hard", xp: 350 },
  { title: "Spend one hour in complete silence", desc: "No music, no podcasts, no TV. Just you and your thoughts. It's harder than it sounds.", category: "Mental", difficulty: "Medium", xp: 125 },
  { title: "Memorize a poem", desc: "Pick a poem (at least 12 lines) and memorize it completely. Recite it to at least one other person.", category: "Mental", difficulty: "Medium", xp: 200 },

  // Creative
  { title: "Draw something from memory", desc: "Without looking it up, draw your childhood bedroom from memory as accurately as possible.", category: "Creative", difficulty: "Easy", xp: 75 },
  { title: "Write a short story in 30 minutes", desc: "Set a timer. Pick a random first sentence generator online and run with it. 300+ words. Go.", category: "Creative", difficulty: "Medium", xp: 150 },
  { title: "Compose and record a song", desc: "Write and record a song — any genre, any length over 90 seconds. Instruments, voice, or beats. Just make it.", category: "Creative", difficulty: "Hard", xp: 400 },
  { title: "Take 20 interesting photos today", desc: "Capture 20 photos that are genuinely interesting or beautiful to you. No food pics unless they're incredible.", category: "Creative", difficulty: "Easy", xp: 100 },
  { title: "Teach yourself origami", desc: "Learn to fold at least 3 different origami shapes from scratch, without video (use diagrams only).", category: "Creative", difficulty: "Medium", xp: 175 },
  { title: "Paint or draw something abstract", desc: "No references, no plan. Just colors and shapes that express something you're feeling right now.", category: "Creative", difficulty: "Easy", xp: 75 },
  { title: "Write 10 poems in one sitting", desc: "No minimum length. One topic each. Go weird with it.", category: "Creative", difficulty: "Medium", xp: 200 },
  { title: "Make a collage from old magazines", desc: "Find magazines or newspapers, cut them up, and create a collage that tells a story or makes a statement.", category: "Creative", difficulty: "Easy", xp: 100 },
  { title: "Design your ideal life on paper", desc: "Spend an hour mapping out your perfect 10-year future — career, relationships, home, lifestyle. Make it specific and visual.", category: "Creative", difficulty: "Medium", xp: 150 },
  { title: "Learn to draw one thing really well", desc: "Choose one object and draw it 10 times, each time trying to improve on the last. Compare the first and last attempt.", category: "Creative", difficulty: "Medium", xp: 175 },

  // Adventure
  { title: "Touch grass", desc: "Go outside. Walk for at least 20 minutes without a destination or podcast. Just move and observe.", category: "Adventure", difficulty: "Easy", xp: 50 },
  { title: "Board a random bus and explore the last stop", desc: "Pick a bus route you've never taken. Ride it all the way to the last stop. Spend at least 20 minutes exploring before heading back.", category: "Adventure", difficulty: "Medium", xp: 200 },
  { title: "Visit a part of your city you've never been to", desc: "Look at a map and pick a neighbourhood you've always passed by. Spend 2+ hours there — no phone navigation after arrival.", category: "Adventure", difficulty: "Medium", xp: 175 },
  { title: "Camp overnight somewhere new", desc: "Find a legal camping spot and spend one night outdoors with minimal gear. No hotel fallback allowed.", category: "Adventure", difficulty: "Hard", xp: 400 },
  { title: "Go for a sunrise walk", desc: "Wake up before the sun. Walk outside and watch the sunrise from start to finish. Bring nothing but yourself.", category: "Adventure", difficulty: "Easy", xp: 100 },
  { title: "Explore a trail you've never hiked", desc: "Find a hiking trail you haven't done and complete it. Minimum 5km. No shortcuts.", category: "Adventure", difficulty: "Medium", xp: 200 },
  { title: "Spend a full day outdoors", desc: "From wake-up to sunset, conduct your entire day outside. Eat outside, read outside, think outside.", category: "Adventure", difficulty: "Hard", xp: 350 },
  { title: "Visit a local landmark you've never seen", desc: "Pick a famous or noteworthy spot in your city or region that you've always meant to visit and actually go.", category: "Adventure", difficulty: "Easy", xp: 100 },
  { title: "Go stargazing far from city lights", desc: "Drive or travel at least 30 minutes from the nearest city center and watch the night sky for at least an hour.", category: "Adventure", difficulty: "Medium", xp: 225 },
  { title: "Do something you're afraid of", desc: "Identify one thing that genuinely scares you (heights, water, crowds) and face it in a safe, controlled way.", category: "Adventure", difficulty: "Hard", xp: 450 },

  // Social
  { title: "Strike up a conversation with a stranger", desc: "Start a genuine conversation with someone you've never met — not just small talk. Learn something real about them.", category: "Social", difficulty: "Easy", xp: 100 },
  { title: "Call someone you haven't spoken to in over a year", desc: "Don't text — call. Reconnect with an old friend, family member, or mentor. Have a real conversation.", category: "Social", difficulty: "Easy", xp: 100 },
  { title: "Organize a social event for 5+ people", desc: "Plan and execute a gathering — dinner, game night, outdoor trip — for at least 5 people. You handle logistics.", category: "Social", difficulty: "Hard", xp: 350 },
  { title: "Do something kind for a stranger anonymously", desc: "Pay for someone's coffee, leave a note on a car, or help someone out — without expecting thanks or recognition.", category: "Social", difficulty: "Easy", xp: 100 },
  { title: "Have a 1-hour conversation with no phones", desc: "Sit down with a friend and talk for a full hour with both phones face-down and silent.", category: "Social", difficulty: "Medium", xp: 150 },
  { title: "Volunteer for half a day", desc: "Find a local volunteer opportunity and give 4+ hours of your time. Food bank, shelter, cleanup — anything that helps.", category: "Social", difficulty: "Medium", xp: 250 },
  { title: "Give 5 genuine compliments today", desc: "Tell 5 different people something specific and genuine you appreciate about them. No recycling the same compliment.", category: "Social", difficulty: "Easy", xp: 75 },
  { title: "Join a club, class, or group activity", desc: "Sign up for a recurring group activity you've never tried — a sports league, book club, cooking class, dance lesson.", category: "Social", difficulty: "Hard", xp: 300 },
  { title: "Write and send handwritten letters to 3 people", desc: "Physically write letters to 3 people who matter to you. Mail them. Real stamps, real envelopes.", category: "Social", difficulty: "Medium", xp: 200 },
  { title: "Ask someone to teach you something they love", desc: "Find someone passionate about a skill, hobby, or topic. Ask them to teach you for at least an hour. Actually learn.", category: "Social", difficulty: "Medium", xp: 175 },

  // Physical
  { title: "Stay hydrated — drink 2L of water today", desc: "Track your water intake and make sure you hit 2 full liters before the day ends. No substitutions.", category: "Physical", difficulty: "Easy", xp: 50 },
  { title: "Do 100 push-ups throughout the day", desc: "Spread them out however you like — sets of 10, 20, or more. Just hit 100 total by midnight.", category: "Physical", difficulty: "Medium", xp: 150 },
  { title: "Learn how to do a backflip", desc: "Work with a coach or in a safe environment (gymnastics gym, trampoline park) to learn and land a backflip.", category: "Physical", difficulty: "Hard", xp: 500 },
  { title: "Work out for 45 minutes", desc: "Get a full 45-minute workout in — gym, run, yoga, HIIT, whatever. No half-measures, no cheating the clock.", category: "Physical", difficulty: "Easy", xp: 100 },
  { title: "Run your first 5K", desc: "Whether you walk-run or sprint the whole way, complete a 5K distance today. Track it on your phone.", category: "Physical", difficulty: "Medium", xp: 200 },
  { title: "Try a completely new physical activity", desc: "Rock climbing, paddleboarding, fencing, archery, martial arts — pick something you've never done and do it.", category: "Physical", difficulty: "Medium", xp: 225 },
  { title: "Hold a plank for 5 minutes", desc: "Not in a row, necessarily. Total plank time of 5 minutes in one session. Track every second.", category: "Physical", difficulty: "Medium", xp: 175 },
  { title: "Go for a 10km walk or hike", desc: "Strap on your shoes and cover 10 kilometers on foot. No driving shortcuts. Track it.", category: "Physical", difficulty: "Medium", xp: 200 },
  { title: "Do a cold shower every day for a week", desc: "Commit to ending every shower with at least 2 minutes of cold water for 7 consecutive days. No skipping.", category: "Physical", difficulty: "Hard", xp: 300 },
  { title: "Sleep 8 hours and wake up without an alarm", desc: "Go to bed early enough to naturally wake up after 8 hours of sleep — no alarm, no snooze, no exceptions.", category: "Physical", difficulty: "Easy", xp: 100 },

  // Travel
  { title: "Eat at a local restaurant with no English menu", desc: "Find a spot where you can't read the menu. Point, ask the server's recommendation, or use a photo. Try something you'd never order at home.", category: "Travel", difficulty: "Easy", xp: 100 },
  { title: "Get lost on purpose for two hours", desc: "Leave your phone's navigation off, pick a direction, and wander. The only rule: find your way back without GPS.", category: "Travel", difficulty: "Medium", xp: 200 },
  { title: "Learn 10 phrases in the local language", desc: "Before your next day out, learn and practice greetings, thank-you, excuse me, where is, and how much. Use them all by end of day.", category: "Travel", difficulty: "Easy", xp: 75 },
  { title: "Take a day trip to a nearby town you've never visited", desc: "Research and travel to a town within 2 hours. Spend at least 4 hours exploring with no pre-planned agenda.", category: "Travel", difficulty: "Medium", xp: 225 },
  { title: "Strike up a conversation with a fellow traveler", desc: "At a hostel, café, or transport stop — introduce yourself and have a genuine 20-minute conversation. Exchange travel tips.", category: "Travel", difficulty: "Easy", xp: 100 },
  { title: "Visit a market and cook a meal from local ingredients", desc: "Head to a local market, buy only unfamiliar produce or ingredients, and cook something edible with them that evening.", category: "Travel", difficulty: "Hard", xp: 350 },
  { title: "Take the slow route — no planes or expressways", desc: "Get from point A to point B using only local transport: buses, ferries, regional trains. Embrace the journey.", category: "Travel", difficulty: "Hard", xp: 400 },
  { title: "Sketch or journal one place you visit today", desc: "Pick one spot and spend 30 minutes writing or drawing it in detail. No photos allowed as a substitute.", category: "Travel", difficulty: "Easy", xp: 75 },
  { title: "Attend a local event or festival", desc: "Find something happening today — a market, street performance, religious ceremony, or sports event — and show up.", category: "Travel", difficulty: "Medium", xp: 175 },
  { title: "Wake up before sunrise and watch the city come alive", desc: "Set an alarm. Be outside and in position before first light. Stay until the streets are fully awake. No phone scrolling.", category: "Travel", difficulty: "Medium", xp: 150 },

  // Netherlands
  { title: "Learn 10 Dutch phrases and use them all today", desc: "Learn 10 Dutch phrases in the morning — greetings, thank-you, excuse me, directions. By end of day, use every single one in actual conversations. No clustering them all at once.", category: "Netherlands", difficulty: "Easy", xp: 100 },
  { title: "Sketch a Dutch canal scene on location", desc: "Find a canal with bridges, bikes, and boats. Sit down and spend 30 minutes sketching what you see — no photos allowed as a substitute. Date and sign it.", category: "Netherlands", difficulty: "Easy", xp: 100 },
  { title: "Cook a Dutch stamppot from scratch", desc: "Buy Dutch staples — potatoes, rookworst, boerenkool or zuurkool — and cook a traditional stamppot entirely from scratch. No shortcuts, no premade mash.", category: "Netherlands", difficulty: "Medium", xp: 175 },
  { title: "Walk the top of a dike for an hour", desc: "Find a sea dike or river dike and walk along the crest for at least one hour. Notice the land below sea level on one side, water on the other. Think about what keeps it all in place.", category: "Netherlands", difficulty: "Easy", xp: 75 },
  { title: "Cycle between two Dutch cities", desc: "Choose two cities at least 20km apart and cycle the route using fietspaden only. No trains, no buses, no cars as backup. Track it.", category: "Netherlands", difficulty: "Medium", xp: 200 },
  { title: "Explore Hoge Veluwe on a free white bike", desc: "Get to the Hoge Veluwe National Park, borrow one of the free white bikes at the entrance, and spend at least 3 hours exploring the forests, heathlands, and sand drifts. No itinerary allowed.", category: "Netherlands", difficulty: "Medium", xp: 225 },
  { title: "Have a genuine conversation entirely in Dutch", desc: "Have a 15+ minute conversation with a Dutch person entirely in Dutch — no switching to English, even when they offer. Order, ask for directions, or just chat. Stay in it.", category: "Netherlands", difficulty: "Hard", xp: 350 },
  { title: "Swim in the North Sea", desc: "Get to a Dutch beach — Scheveningen, Zandvoort, or anywhere on the North Sea coast — and actually swim. Not wade in. Fully in, for at least 5 minutes. The cold is the point.", category: "Netherlands", difficulty: "Medium", xp: 200 },
  { title: "Cycle 80km in a single day on Dutch fietspaden", desc: "Plan an 80km route using only Dutch cycling paths. No e-bike. Track every kilometer. Fuel yourself with stroopwafels and water from Albert Heijn.", category: "Netherlands", difficulty: "Hard", xp: 400 },
  { title: "Eat raw herring from a haringkar", desc: "Find a traditional haringkar (herring cart) and eat a raw haring the Dutch way — chopped with raw onion and pickles, or held by the tail over your mouth. No ketchup. No hesitation.", category: "Netherlands", difficulty: "Easy", xp: 75 },
  { title: "Take a ferry to a Wadden Island for a day", desc: "Book a TESO or Doeksen ferry to Texel, Vlieland, or Terschelling. Rent a bike on arrival and cover as much of the island as you can before the last ferry home. No overnight bag allowed.", category: "Netherlands", difficulty: "Medium", xp: 250 },
  { title: "Visit a Dutch boerenmarkt and cook from what you buy", desc: "Go to a local farmers' market (boerenmarkt) and buy only things you've never cooked with before. Get home and cook a full meal from just those ingredients that evening.", category: "Netherlands", difficulty: "Medium", xp: 200 },

  // Cape Town
  { title: "Ride the cable car to Table Mountain", desc: "Take the aerial cableway to the top of Table Mountain. Walk to the furthest viewing point, sit down, and spend 20 minutes just observing the city, ocean, and Cape Peninsula below.", category: "Cape Town", difficulty: "Easy", xp: 100 },
  { title: "Walk Boulders Beach boardwalk at sunrise", desc: "Get to Boulders Beach before 8am. Walk the full boardwalk, observe the African penguin colony up close, and stay until the morning light hits the boulders. No feeding, no touching.", category: "Cape Town", difficulty: "Easy", xp: 100 },
  { title: "Explore Bo-Kaap and photograph the colorful houses", desc: "Walk the steep streets of the Bo-Kaap neighborhood. Photograph at least 10 different house colors. Strike up a conversation with a local and ask about the neighborhood's history.", category: "Cape Town", difficulty: "Easy", xp: 75 },
  { title: "Buy produce at the Oranjezicht City Farm Market", desc: "Visit the OZCF market on a Saturday morning. Buy breakfast from local vendors, talk to at least two stallholders about what they grow or make, and leave with something you've never cooked before.", category: "Cape Town", difficulty: "Easy", xp: 75 },
  { title: "Watch the sunset from Signal Hill", desc: "Drive or hike up to Signal Hill before golden hour. Stay until the sun disappears below the horizon. Note what direction the sun sets relative to the ocean.", category: "Cape Town", difficulty: "Easy", xp: 75 },
  { title: "Learn 10 Afrikaans phrases and use them today", desc: "Before leaving your accommodation, learn 10 Afrikaans phrases — greetings, thanks, please, asking directions. Use all 10 in genuine conversations throughout the day.", category: "Cape Town", difficulty: "Easy", xp: 100 },
  { title: "Swim at Clifton Beach before 9am", desc: "Set your alarm. Arrive at Clifton (any of the four beaches) before 9am when the crowds are gone. Swim in the Atlantic, no wetsuit. The water will be cold. Do it anyway.", category: "Cape Town", difficulty: "Easy", xp: 100 },
  { title: "Eat a Cape Malay samosa from a local vendor", desc: "Find a street vendor or local shop in Salt River, Woodstock, or Bo-Kaap selling Cape Malay food. Order whatever they recommend — no chain restaurants. Eat it there.", category: "Cape Town", difficulty: "Easy", xp: 75 },
  { title: "Walk the V&A Waterfront without spending money", desc: "Spend two hours at the V&A Waterfront without making a single purchase. Observe the street performers, the harbor seals, the boats, and the mountain behind it all.", category: "Cape Town", difficulty: "Easy", xp: 50 },
  { title: "Visit Kirstenbosch for a morning walk", desc: "Enter Kirstenbosch Botanical Garden when it opens. Walk the Boomslang canopy walkway, identify five plant species you've never seen before, and stay for at least 90 minutes.", category: "Cape Town", difficulty: "Easy", xp: 100 },
  { title: "Hike Lion's Head at sunrise", desc: "Start the Lion's Head trail at least 90 minutes before sunrise. Reach the summit peak for first light over Cape Town and the ocean. Complete the full circular route before 9am.", category: "Cape Town", difficulty: "Medium", xp: 200 },
  { title: "Visit Robben Island and walk the prison tour", desc: "Take the Robben Island ferry from the V&A. Complete the full guided tour of the prison, including Nelson Mandela's cell. Stay for the entire experience — no rushing.", category: "Cape Town", difficulty: "Medium", xp: 175 },
  { title: "Day trip to Stellenbosch wine farms by bike", desc: "Take a bus or train to Stellenbosch. Rent a bike. Visit two wine farms on the Stellenbosch wine route, taste their flagship wines, and cycle back to the town before sunset.", category: "Cape Town", difficulty: "Medium", xp: 225 },
  { title: "Explore Cape of Good Hope on foot", desc: "Take transport to the Cape of Good Hope Nature Reserve. Walk the coastal trail from the main parking area to the Cape Point lighthouse and back. No shortcuts. Four hours minimum.", category: "Cape Town", difficulty: "Medium", xp: 200 },
  { title: "Walk the Woodstock street art mural route", desc: "Navigate the Woodstock neighborhood on foot without a guided tour. Find and photograph at least 15 distinct street murals. Research the artists of your three favourites when you get back.", category: "Cape Town", difficulty: "Medium", xp: 175 },
  { title: "Cook Cape Malay bobotie from scratch", desc: "Buy all fresh ingredients from a market — mince, apricot jam, eggs, curry spices, bay leaves. Cook a traditional Cape Malay bobotie entirely from scratch. Serve it to someone else.", category: "Cape Town", difficulty: "Medium", xp: 200 },
  { title: "Cycle from Muizenberg to Simon's Town", desc: "Rent a bicycle in Muizenberg. Cycle the coastal road along False Bay to Simon's Town (30km roundtrip). Stop at Fish Hoek beach. Return before dark.", category: "Cape Town", difficulty: "Medium", xp: 200 },
  { title: "Spend a morning volunteering in Khayelitsha or Langa", desc: "Contact a local NGO in Khayelitsha or Langa the day before and arrange a morning of volunteering. Show up on time. Do the work. Stay for at least 3 hours.", category: "Cape Town", difficulty: "Medium", xp: 250 },
  { title: "Attend live jazz at a Cape Town venue", desc: "Find a live music session — jazz, kwaito, or Cape Minstrel music — at a local venue (not a tourist-facing hotel). Buy a drink, stay for the full set, talk to one musician afterward.", category: "Cape Town", difficulty: "Medium", xp: 175 },
  { title: "Watch the sunset from Chapman's Peak layby", desc: "Drive to Chapman's Peak Drive and find a layby or viewpoint facing the Atlantic. Arrive 30 minutes before sunset. Watch the full event. Do not photograph it — just watch.", category: "Cape Town", difficulty: "Medium", xp: 150 },
  { title: "Hike the full Table Mountain Platteklip & Skeleton Gorge circuit", desc: "Start at Platteklip Gorge, summit Table Mountain, cross the plateau, descend via Skeleton Gorge to Kirstenbosch, and make your way back. Full circuit, single day, no cable car.", category: "Cape Town", difficulty: "Hard", xp: 400 },
  { title: "Cycle Chapman's Peak Drive and back to the city", desc: "Cycle the complete Chapman's Peak Drive from Hout Bay to Noordhoek and back to Cape Town. 70km+ roundtrip. Track every kilometer. Do it before noon to beat the heat.", category: "Cape Town", difficulty: "Hard", xp: 450 },
  { title: "Surf Muizenberg for a 3-hour session", desc: "Rent or borrow a surfboard and take a lesson or paddle out at Muizenberg. Stay in the water for a full 3 hours. Fall as many times as needed. Catch at least 10 waves, even small ones.", category: "Cape Town", difficulty: "Hard", xp: 400 },
  { title: "Complete a Cape Peninsula loop by bicycle", desc: "Cycle the full Cape Peninsula loop from Cape Town — through Simon's Town, Cape of Good Hope, Noordhoek, Hout Bay, and back to the city. 100km+. Start before dawn.", category: "Cape Town", difficulty: "Hard", xp: 500 },
  { title: "Hike the coastal trail from Hout Bay to Cape Point", desc: "Walk the Hoerikwaggo Trail section from Hout Bay to Scarborough or further without a safety net plan. Navigate by map. Carry your food and water. Complete the full section in one day.", category: "Cape Town", difficulty: "Hard", xp: 450 },
  { title: "Cook a full Cape Malay feast for 8+ people", desc: "Plan, shop, and cook a full Cape Malay spread: bobotie, breyani, koeksisters, and samosas — entirely from scratch using Bo-Kaap or Salt River market ingredients. Serve it to a group.", category: "Cape Town", difficulty: "Hard", xp: 500 },
  { title: "Kayak from the V&A Waterfront to Clifton and back", desc: "Rent a sea kayak and paddle from the V&A Waterfront along the Atlantic seaboard to Clifton Beach and back. 15km+ on open ocean. Do not turn back early.", category: "Cape Town", difficulty: "Hard", xp: 450 },
  { title: "Complete the full Two Oceans running route", desc: "Run the full 56km Two Oceans route (or the classic 21km Constantia Nek loop) from start to finish without stopping for more than 5 minutes. Track every kilometer.", category: "Cape Town", difficulty: "Hard", xp: 500 },
  { title: "Spend 24 hours in Cape Town using only minibus taxis", desc: "Navigate Cape Town for a full 24-hour period using only minibus taxis (kombis) and your feet — no Uber, no car, no tour bus. Cross at least 6 different neighborhoods.", category: "Cape Town", difficulty: "Hard", xp: 400 },
  { title: "Do a nighttime Table Mountain hike with a certified guide", desc: "Book a guided nighttime hike on Table Mountain. Summit in darkness, navigate the plateau by headlamp, and reach a viewpoint for the city lights below. Descend by first light.", category: "Cape Town", difficulty: "Hard", xp: 400 },

  // Windhoek
  { title: "Walk Independence Avenue from end to end", desc: "Walk the full length of Independence Avenue, Windhoek's main boulevard. Stop at every market stall. Speak to at least three vendors. Don't rush.", category: "Windhoek", difficulty: "Easy", xp: 75 },
  { title: "Try kapana from the Katutura Soweto Market", desc: "Find the Soweto Market in Katutura. Order kapana — grilled street meat — from a vendor. Eat it there at the market, not back at your accommodation.", category: "Windhoek", difficulty: "Easy", xp: 100 },
  { title: "Visit the Alte Feste historical museum", desc: "Walk through the Alte Feste fort and its attached State Museum. Read every placard. Learn the history of German colonial Windhoek and Namibian independence.", category: "Windhoek", difficulty: "Easy", xp: 75 },
  { title: "Watch the sunset from Avis Dam viewpoint", desc: "Drive or hike to the Avis Dam viewpoint before sunset. Stay for the full golden hour over the city. Count how many languages you can hear spoken around you.", category: "Windhoek", difficulty: "Easy", xp: 75 },
  { title: "Learn 10 Otjiherero or Afrikaans phrases and use them", desc: "Before going out, learn 10 Otjiherero or Afrikaans phrases. Use all 10 in genuine interactions throughout the day — shops, markets, restaurants, strangers on the street.", category: "Windhoek", difficulty: "Easy", xp: 100 },
  { title: "Photograph all three German colonial churches", desc: "Find and photograph the Christuskirche, the Lutheran Rhenish Mission Church, and the Roman Catholic Cathedral. Read the history of each one from a placard or local.", category: "Windhoek", difficulty: "Easy", xp: 75 },
  { title: "Eat an oryx steak at a local Windhoek restaurant", desc: "Find a restaurant (not a tourist lodge) serving game meat. Order oryx steak. Learn from the waiter or menu where the game comes from before eating it.", category: "Windhoek", difficulty: "Easy", xp: 100 },
  { title: "Visit the Namibia Craft Centre and talk to the artisans", desc: "Walk through the Namibia Craft Centre. Don't just browse — talk to at least three artisans about their craft, their material, and how long it takes to make what's on display.", category: "Windhoek", difficulty: "Easy", xp: 75 },
  { title: "Walk from the CBD to the Independence Memorial Museum", desc: "Walk from the city center to the Independence Memorial Museum on foot. Visit the museum, then walk back. Total 3–4km. No taxis.", category: "Windhoek", difficulty: "Easy", xp: 75 },
  { title: "Have a Windhoek Lager at a shebeen and talk to a local", desc: "Find a shebeen (informal bar) in a local neighborhood. Order a Windhoek Lager. Stay for at least 45 minutes, get talking to someone, and learn something about their daily life.", category: "Windhoek", difficulty: "Easy", xp: 100 },
  { title: "Day trip to Daan Viljoen Game Reserve", desc: "Drive or arrange transport to Daan Viljoen Game Reserve. Spend the full day on the hiking trail. Spot and identify at least 5 different animal species. No rushing back to the city.", category: "Windhoek", difficulty: "Medium", xp: 200 },
  { title: "Hike the Auas Mountains trail for 3+ hours", desc: "Drive to the base of the Auas Mountains and hike the trail for a minimum of 3 hours. Carry your own water and food. No shortcuts back via vehicle.", category: "Windhoek", difficulty: "Medium", xp: 200 },
  { title: "Drive the Khomas Hochland scenic route at sunset", desc: "Rent a vehicle and drive the gravel road through the Khomas Hochland plateau west of Windhoek. Reach a viewpoint in time for sunset. Return to the city after dark.", category: "Windhoek", difficulty: "Medium", xp: 175 },
  { title: "Explore Katutura on foot with a local", desc: "Find a local willing to walk Katutura with you — ask at your guesthouse, hostel, or via a community organization. Walk for at least 2 hours. No tourist guide — someone who actually lives there.", category: "Windhoek", difficulty: "Medium", xp: 225 },
  { title: "Attend a Herero or Damara cultural ceremony", desc: "Research cultural events happening in or near Windhoek. Find and attend a traditional Herero or Damara ceremony or performance. Observe respectfully. Ask permission before photographing.", category: "Windhoek", difficulty: "Medium", xp: 225 },
  { title: "Spend a half-day at the Penduka craft village", desc: "Take transport to the Penduka Women's Craft Village on Goreangab Dam. Spend at least 3 hours there. Buy something directly from the maker. Learn about the cooperative's origin.", category: "Windhoek", difficulty: "Medium", xp: 175 },
  { title: "Cook a traditional Namibian pap and omaere breakfast", desc: "Source maize meal and omaere (fermented sour milk) from a local market or grocery. Cook the traditional Namibian breakfast from scratch. Eat it before 9am.", category: "Windhoek", difficulty: "Medium", xp: 175 },
  { title: "Sample food from five Soweto Market vendors in one go", desc: "Go to the Soweto Market in Katutura and eat something from five different food stalls in one afternoon. Ask each vendor what their specialty is and why. No repeats.", category: "Windhoek", difficulty: "Medium", xp: 175 },
  { title: "Visit the Trans-Namibia railway yard and photograph the locomotives", desc: "Find the historic railway yard in Windhoek. Photograph the vintage rolling stock. Research the history of the Trans-Namibian railway and when it last ran passenger service.", category: "Windhoek", difficulty: "Medium", xp: 150 },
  { title: "Visit Okapuka Ranch for a sundowner game drive", desc: "Book a late-afternoon game drive at Okapuka Ranch just north of Windhoek. Stay for the full drive, spot as many species as possible, and watch the sun set from the bush.", category: "Windhoek", difficulty: "Medium", xp: 200 },
  { title: "Drive to Sossusvlei, climb Dune 45, and return in 48 hours", desc: "Drive the 500km from Windhoek to Sossusvlei. Arrive before sunrise. Climb Dune 45 in the early morning heat. Visit the Dead Vlei salt pan. Drive back to Windhoek. 48 hours total.", category: "Windhoek", difficulty: "Hard", xp: 500 },
  { title: "Complete a full mountain bike day in the Khomas Hochland", desc: "Plan and complete a full mountain bike route in the Khomas Hochland with 1000m+ elevation gain. Carry all your own food and water. No e-bike, no support vehicle.", category: "Windhoek", difficulty: "Hard", xp: 450 },
  { title: "Spend 24 hours on a working farm with no electricity or phone", desc: "Arrange to stay on a working Namibian farm outside Windhoek for 24 hours. No phone, no electricity, no internet. Help with whatever work needs doing. Eat what they eat.", category: "Windhoek", difficulty: "Hard", xp: 400 },
  { title: "Track a cheetah at AfriCat, Okonjima", desc: "Drive or arrange transport to the AfriCat Foundation at Okonjima. Join the monitoring team on a cheetah or leopard tracking session in the bush. Stay the full day.", category: "Windhoek", difficulty: "Hard", xp: 450 },
  { title: "Drive the Spreetshoogte Pass gravel road and back in one day", desc: "Drive the D1463 gravel road from the Khomas Hochland to Spreetshoogte Pass, overlooking the Namib escarpment. Continue to the base and return the same day via a different route.", category: "Windhoek", difficulty: "Hard", xp: 400 },
  { title: "Hike to the highest point visible from Windhoek before sunrise", desc: "Identify the highest hill or ridge visible from central Windhoek. Hike to the summit arriving before sunrise. Spend 30 minutes watching the city wake up. Descend by 9am.", category: "Windhoek", difficulty: "Hard", xp: 400 },
  { title: "Cook a full Namibian braai feast for 8+ people", desc: "Buy fresh game and produce from the Soweto Market. Cook a full Namibian braai spread — oryx, lamb chops, boerewors, pap, chakalaka — entirely from scratch for eight or more people.", category: "Windhoek", difficulty: "Hard", xp: 500 },
  { title: "Cycle from Windhoek to Okahandja in one day", desc: "Cycle the 70km from Windhoek to Okahandja along the B1 road. Start at dawn. Track every kilometer. No support vehicle or car fallback allowed.", category: "Windhoek", difficulty: "Hard", xp: 500 },
  { title: "Join an open pickup soccer game in Katutura", desc: "Head to a sports field in Katutura on a weekend afternoon. Find an open football game and ask to join — or just show up and play when there's space. Stay for the full session.", category: "Windhoek", difficulty: "Hard", xp: 350 },
  { title: "Spend a full day learning San bush skills outside the city", desc: "Arrange a day with a San community outside Windhoek. Learn to build a fire without matches, identify edible plants, and track animal footprints. Stay from sunrise to sunset.", category: "Windhoek", difficulty: "Hard", xp: 450 },

  // Dubai
  { title: "Watch the Dubai Fountain show from the waterfront", desc: "Position yourself at the Burj Khalifa Lake waterfront before the 6pm show. Stay for at least two performances. Watch the full show both times without taking out your phone.", category: "Dubai", difficulty: "Easy", xp: 75 },
  { title: "Take an abra across Dubai Creek", desc: "Find the Deira abra station near Al Sabkha Road. Pay the 1 AED fare and cross Dubai Creek on a traditional wooden boat. Cross back. Notice how the two banks differ.", category: "Dubai", difficulty: "Easy", xp: 75 },
  { title: "Eat a shawarma from a hole-in-the-wall, not a chain", desc: "Find a small local shawarma shop — not a franchise, not a hotel restaurant. Order their house shawarma. Eat it standing outside. Ask the owner where the recipe comes from.", category: "Dubai", difficulty: "Easy", xp: 100 },
  { title: "Walk the Gold Souk and Spice Souk without buying anything", desc: "Walk the full length of both Deira souks. Talk to three vendors about what they sell. Buy nothing. Practice saying 'just looking' in Arabic.", category: "Dubai", difficulty: "Easy", xp: 75 },
  { title: "Learn 10 Arabic phrases and use them today", desc: "Before going out, learn 10 Arabic phrases — greetings, please, thank you, excuse me, where is, how much. Use every single one in real interactions before the day ends.", category: "Dubai", difficulty: "Easy", xp: 100 },
  { title: "Watch the sunset from the Al Seef heritage promenade", desc: "Walk the Al Seef heritage waterfront along the Creek. Find a spot with no modern skyline in the frame. Watch the full sunset and stay until the Creek lights reflect on the water.", category: "Dubai", difficulty: "Easy", xp: 75 },
  { title: "Visit the Al Fahidi Historical Neighbourhood wind tower", desc: "Walk through the Al Fahidi area. Find the oldest wind tower (barjeel) still standing. Learn how it works for natural air conditioning. Ask a local or read the placard.", category: "Dubai", difficulty: "Easy", xp: 75 },
  { title: "Find a majlis café and sit for an hour with Arabic coffee", desc: "Find a traditional majlis-style café (not a chain). Order Arabic coffee (qahwa) and dates. Sit for at least one hour with no phone. Observe and listen.", category: "Dubai", difficulty: "Easy", xp: 100 },
  { title: "Ride the Dubai Metro from end to end", desc: "Board the Red or Green Line at one terminal. Ride the entire line to the opposite terminal without getting off. Observe how the city changes from one end to the other.", category: "Dubai", difficulty: "Easy", xp: 75 },
  { title: "Visit the Dubai Museum in Al Fahidi Fort", desc: "Visit the Dubai Museum — one of the city's oldest buildings. Walk every exhibit. Learn the city's history before the towers were built. Spend at least 90 minutes inside.", category: "Dubai", difficulty: "Easy", xp: 100 },
  { title: "Take a desert safari and spend the night in a Bedouin camp", desc: "Book an overnight desert safari. Experience dune bashing, a camel ride, henna painting, and dinner at a Bedouin camp. Sleep in the camp. Wake up and watch sunrise over the dunes.", category: "Dubai", difficulty: "Medium", xp: 225 },
  { title: "Cycle the Al Qudra track for 50km before sunrise", desc: "Rent or bring a bicycle and start the Al Qudra cycling track before 5am. Complete 50km before the desert heat peaks. Watch the flamingos at Al Qudra Lakes on the way.", category: "Dubai", difficulty: "Medium", xp: 225 },
  { title: "Explore Al Fahidi neighborhood on foot for half a day", desc: "Spend 4 hours on foot in the Al Fahidi Historical Neighbourhood. Visit the Sheikh Mohammed Centre for Cultural Understanding. Walk every alley. Sketch or journal one scene in detail.", category: "Dubai", difficulty: "Medium", xp: 175 },
  { title: "Haggle in the Textile Souk and dress yourself for under AED 150", desc: "Go to the Textile Souk (Bur Dubai) and negotiate a complete outfit — shirt, trousers, shoes — for under AED 150. No fixed-price stores. Haggle every item.", category: "Dubai", difficulty: "Medium", xp: 200 },
  { title: "Cook a full Emirati breakfast from scratch", desc: "Source balaleet (sweet vermicelli with eggs), chebab (Emirati pancakes), and ful medames from a local market. Cook the full Emirati breakfast from scratch. Serve it before 9am.", category: "Dubai", difficulty: "Medium", xp: 200 },
  { title: "Spend a morning birdwatching at Ras Al Khor Wildlife Sanctuary", desc: "Get to the Ras Al Khor flamingo hide before 7am. Spend a minimum of 2 hours observing and photographing the flamingo colony and other waterfowl without disturbing them.", category: "Dubai", difficulty: "Medium", xp: 175 },
  { title: "Ride every abra route through Dubai Creek in one afternoon", desc: "Map out all the abra ferry routes across Dubai Creek. Ride every single route in one afternoon — from every Deira terminal to every Bur Dubai terminal. Count the number of crossings.", category: "Dubai", difficulty: "Medium", xp: 175 },
  { title: "Visit the Dubai Frame at sunset", desc: "Book tickets for the Dubai Frame in the late afternoon. Stand in the glass floor walkway at the top as the sun sets. Photograph old Dubai to the north and new Dubai to the south from the same spot.", category: "Dubai", difficulty: "Medium", xp: 175 },
  { title: "Eat at a restaurant from 7 different Arab countries in one day", desc: "Dubai has every Arab cuisine represented. In a single day, eat a dish from 7 different Arab countries at 7 different restaurants. No chains. Plan your route in advance.", category: "Dubai", difficulty: "Medium", xp: 250 },
  { title: "Attend the guided cultural visit at Jumeirah Mosque", desc: "Book a spot on the Sheikh Mohammed Centre for Cultural Understanding Open Doors tour at Jumeirah Mosque. Attend the full session. Ask at least two genuine questions.", category: "Dubai", difficulty: "Medium", xp: 175 },
  { title: "Skydive over the Palm Jumeirah", desc: "Book a certified tandem skydive with Skydive Dubai over the Palm Jumeirah. Complete the full jump including freefall and canopy descent. Do not reschedule when nervous.", category: "Dubai", difficulty: "Hard", xp: 500 },
  { title: "Cycle the full 86km Al Qudra desert loop before noon", desc: "Start the full 86km Al Qudra cycling loop before 4am. Complete the entire route before noon before the desert heat makes it dangerous. No support vehicle, no taxi fallback.", category: "Dubai", difficulty: "Hard", xp: 500 },
  { title: "Spend 24 hours in Dubai without entering any mall, hotel, or tourist zone", desc: "From midnight to midnight, navigate Dubai using only local neighborhoods, public markets, mosques, and parks. No malls, no hotels, no tourist attractions. Document everywhere you go.", category: "Dubai", difficulty: "Hard", xp: 400 },
  { title: "Hike the Hatta Mountain Trail in the Hajar Mountains", desc: "Drive to Hatta. Complete the 6km mountain trail through the Hajar Mountain foothills in full sun. Carry all your water. Do not cut the trail short. Return to Dubai the same day.", category: "Dubai", difficulty: "Hard", xp: 400 },
  { title: "Cook a full Emirati wedding feast for 8+ people", desc: "Buy all ingredients — lamb, saffron rice, dried limes, laban, luqaimat, Om Ali — from Deira souks and traditional grocers. Cook a full Emirati feast from scratch for 8 or more people.", category: "Dubai", difficulty: "Hard", xp: 500 },
  { title: "Complete a dawn-to-dusk photography project across old and new Dubai", desc: "Start shooting at first light in Al Fahidi. Spend the entire day capturing 50 images that tell the story of Dubai — old and new, rich and working-class. Print your three best shots.", category: "Dubai", difficulty: "Hard", xp: 450 },
  { title: "Navigate Dubai for a full day speaking only Arabic", desc: "From the moment you leave your accommodation until you return, communicate only in Arabic. No English, no translation apps, no pointing. Use what you've learned and learn the rest on the fly.", category: "Dubai", difficulty: "Hard", xp: 450 },
  { title: "Complete the Jebel Jais Flight zipline and hike back to the peak", desc: "Drive to Jebel Jais in Ras Al Khaimah. Complete the World's Longest Zipline. Then hike up the Jebel Jais mountain trail independently. Reach the viewing deck before sunset.", category: "Dubai", difficulty: "Hard", xp: 500 },
  { title: "Visit all 7 emirate capitals in a single 24-hour trip", desc: "Plan a route and use public transport, intercity buses, and taxis to touch ground in all 7 emirate capitals within 24 hours. Photograph a landmark in each. No shortcuts.", category: "Dubai", difficulty: "Hard", xp: 500 },
  { title: "Spend a night stargazing in the Empty Quarter desert", desc: "Arrange transport to the Liwa oasis area or the Empty Quarter edge. Camp overnight away from all artificial lighting. Identify 10 constellations. Do not use city lodging.", category: "Dubai", difficulty: "Hard", xp: 450 },

  // South Holland
  { title: "Cycle through Bollenstreek tulip fields in bloom season", desc: "Rent a bicycle in Lisse or Hillegom during bloom season (late March–May). Cycle through the bulb fields for at least 2 hours. Stop and identify at least five different tulip varieties.", category: "South Holland", difficulty: "Easy", xp: 100 },
  { title: "Take the waterbus from Rotterdam to Dordrecht", desc: "Board the waterbus (waterbus) at Rotterdam and ride it to Dordrecht along the Maas. Look out the window the entire journey. Notice the industrial landscape giving way to water and polders.", category: "South Holland", difficulty: "Easy", xp: 75 },
  { title: "Walk Leiden city center and find the Pilgrim Fathers church", desc: "Walk through Leiden's historic center. Find the Pieterskerk where the Pilgrim Fathers worshipped before sailing to America. Read the placard and tell one person what you learned.", category: "South Holland", difficulty: "Easy", xp: 75 },
  { title: "Try a fresh stroopwafel from a market vendor", desc: "Find a market in Gouda, Delft, or The Hague selling fresh, made-on-site stroopwafels. Buy one warm from the iron. Eat it immediately. No supermarket packets.", category: "South Holland", difficulty: "Easy", xp: 75 },
  { title: "Attend the Gouda cheese market on a Thursday morning", desc: "Get to the Gouda cheese market when it opens on Thursday morning. Watch the traditional cheese-weighing ceremony. Buy a wedge of aged Gouda directly from a farmer.", category: "South Holland", difficulty: "Easy", xp: 100 },
  { title: "Photograph Delft from Vermeer's exact viewpoint", desc: "Study Vermeer's 'View of Delft' at the Mauritshuis. Identify the exact vantage point across the Schie canal and take a photograph from the same spot. Compare them.", category: "South Holland", difficulty: "Easy", xp: 100 },
  { title: "Find and cross 5 historic drawbridges in Dordrecht in one day", desc: "Walk Dordrecht on foot. Find and cross five different historic drawbridges or ophaalbrug in a single day. Photograph each one. Dordrecht has more than 20 — no excuses.", category: "South Holland", difficulty: "Easy", xp: 75 },
  { title: "Learn 10 Hollands regional phrases and use them today", desc: "Learn 10 South Holland dialect phrases or local idioms before going out. Use each one in a genuine interaction throughout the day. Ask a local if you said them correctly.", category: "South Holland", difficulty: "Easy", xp: 100 },
  { title: "Visit Madurodam and find the miniature Royal Palace", desc: "Walk through Madurodam in The Hague. Find the miniature of the Paleis Noordeinde. Identify at least five miniature landmarks you recognize from real life.", category: "South Holland", difficulty: "Easy", xp: 75 },
  { title: "Watch a water sluice or polder pumping station in action", desc: "Find a working gemaal (pumping station) or sluice in South Holland. Watch it operate. Ask a manager or placard how many liters per minute it pumps to keep the land dry.", category: "South Holland", difficulty: "Easy", xp: 100 },
  { title: "Cycle the Bollenstreek Flower Route (30km+)", desc: "Cycle the full Bollenstreek bulb field route — minimum 30km. Use cycling paths only. Plan your route to pass through the fields at the most colorful stretches during bloom season.", category: "South Holland", difficulty: "Medium", xp: 200 },
  { title: "Visit Delft, Leiden, Gouda, and Dordrecht in a single day", desc: "Take a single day to visit all four historic cities by bike and train. Spend at least 45 minutes on foot in each. Do not use a car or taxi.", category: "South Holland", difficulty: "Medium", xp: 250 },
  { title: "Full-day kayak trip through the Biesbosch", desc: "Rent a kayak or canoe at Biesbosch National Park. Paddle for a full day through the tidal wetlands. Navigate by waterway map only. Spot and identify 5 bird species.", category: "South Holland", difficulty: "Medium", xp: 225 },
  { title: "Visit Keukenhof during peak bloom and sketch one flowerbed", desc: "Buy a ticket for Keukenhof during peak season (late March–mid May). Walk every path. Choose one flowerbed and spend 30 minutes sketching it in detail. No photos as a substitute.", category: "South Holland", difficulty: "Medium", xp: 200 },
  { title: "Tour Kinderdijk windmills and speak to a miller", desc: "Take transport to Kinderdijk. Walk the full windmill path. Find a windmill where a miller is present. Ask them to explain how the mill pumps water and how they live inside it.", category: "South Holland", difficulty: "Medium", xp: 200 },
  { title: "Cook traditional Leidse hutspot from market ingredients", desc: "Shop at a South Holland boerenmarkt for fresh carrots, onions, and potatoes. Cook the traditional Leidse hutspot — the dish that ended the Spanish siege of Leiden in 1574 — entirely from scratch.", category: "South Holland", difficulty: "Medium", xp: 200 },
  { title: "Paint or sketch the Delft cityscape from a canal bridge", desc: "Walk Delft until you find a canal bridge with a classic view of the old town. Spend a minimum of 45 minutes sketching or painting what you see. Date and keep it.", category: "South Holland", difficulty: "Medium", xp: 175 },
  { title: "Visit the Peace Palace and research an active ICJ case", desc: "Visit the Vredespaleis (Peace Palace) in The Hague on a public tour day. After the tour, go to a café and read about one current International Court of Justice case.", category: "South Holland", difficulty: "Medium", xp: 175 },
  { title: "Cycle the North Sea coast from The Hague to Hoek van Holland", desc: "Cycle the coastal dune path from Scheveningen to Hoek van Holland (45km+). Stay on the North Sea side. No shortcuts inland. Track every kilometer.", category: "South Holland", difficulty: "Medium", xp: 225 },
  { title: "Take a canal boat tour through old Dordrecht", desc: "Book a canal boat tour (rondvaart) through Dordrecht's oldest streets. Stay for the whole journey. Ask the guide which buildings are from before 1600.", category: "South Holland", difficulty: "Medium", xp: 175 },
  { title: "Cycle Rotterdam to Leiden to Delft to The Hague in one day", desc: "Plan and complete an 80km+ cycling day from Rotterdam through Leiden and Delft to The Hague using only fietspaden. Start before 7am. No e-bike.", category: "South Holland", difficulty: "Hard", xp: 500 },
  { title: "Complete the Delta Works cycling route in one day", desc: "Ride the complete Delta Works route — over the Maeslantkering, Haringvlietdam, and Brouwersdam — in a single day (100km+). Start at dawn. Track every kilometer.", category: "South Holland", difficulty: "Hard", xp: 500 },
  { title: "Spend 24 hours in the Biesbosch without leaving the park", desc: "Arrive at Biesbosch National Park at dawn. Spend a full 24 hours in the wetlands without returning to a town. Camp in a designated spot. Carry all your food and water.", category: "South Holland", difficulty: "Hard", xp: 450 },
  { title: "Learn to sail a traditional Dutch boeier in one lesson", desc: "Book a sailing lesson on a traditional flat-bottomed Dutch boeier or klipper on one of the South Holland lakes or inlets. Complete the lesson without switching to a motorboat.", category: "South Holland", difficulty: "Hard", xp: 400 },
  { title: "Cook a full traditional South Holland feast for 10 people", desc: "Cook erwtensoep (split pea soup), stamppot met boerenkool, raw herring with uitjes, and homemade speculaas biscuits from scratch for 10 people, using only local market ingredients.", category: "South Holland", difficulty: "Hard", xp: 500 },
  { title: "Row a flat-bottomed boat through all 19 Kinderdijk windmill canals", desc: "Rent a rowing boat or flat-bottomed vessel at Kinderdijk. Row through all 19 windmill canals without using a motor. Complete the full route before closing time.", category: "South Holland", difficulty: "Hard", xp: 450 },
  { title: "Walk all former city gates of Leiden in one unbroken loop", desc: "Research the locations of all former Leiden stadspoorten (city gates). Walk an unbroken 6+ hour route connecting every site. No tram, no bus, no stopping for more than 10 minutes.", category: "South Holland", difficulty: "Hard", xp: 450 },
  { title: "Spend a full day documenting three working vessels in Rotterdam harbor", desc: "Go to the Rotterdam harbor on a weekday. Find three working vessels — cargo, tugboat, pilot boat. Board each (with permission) or speak to crew dockside. Document with photos and notes.", category: "South Holland", difficulty: "Hard", xp: 400 },
  { title: "Swim across the Hollandsch Diep with a certified group", desc: "Join an organized open-water swimming event or safety-supervised crossing of the Hollandsch Diep. Complete the crossing. Do not use a wetsuit if temperature allows.", category: "South Holland", difficulty: "Hard", xp: 500 },
  { title: "Complete the Deltaroute cycling loop in one day", desc: "Cycle the full Deltaroute from Rotterdam to Hoek van Holland and up to The Hague and back via the coast. 100km+. Start before 6am, finish before dark.", category: "South Holland", difficulty: "Hard", xp: 500 },

  // Amsterdam
  { title: "Cycle the Amsterdam canal ring without a map", desc: "Rent a bicycle. Navigate the four main grachtengordel canals — Prinsengracht, Keizersgracht, Herengracht, Singel — in a complete ring without using your phone or a map.", category: "Amsterdam", difficulty: "Easy", xp: 100 },
  { title: "Photograph the Bloemenmarkt before 8am", desc: "Arrive at the floating flower market on the Singel before 8am. Photograph the stalls before the crowds arrive. Stay for the market opening. Buy one flower you don't know the name of.", category: "Amsterdam", difficulty: "Easy", xp: 75 },
  { title: "Take the free GVB ferry to Amsterdam Noord", desc: "Walk to the IJ ferry terminal behind Amsterdam Centraal. Take the free GVB ferry to Amsterdam Noord. Spend at least one hour on the north bank. Return via the same or different ferry.", category: "Amsterdam", difficulty: "Easy", xp: 75 },
  { title: "Eat raw haring the Dutch way at a canal bridge haringkar", desc: "Find a haringkar (herring cart) near a canal or square. Order a raw haring with chopped raw onion and pickles. Eat it the Dutch way — held by the tail over your mouth.", category: "Amsterdam", difficulty: "Easy", xp: 100 },
  { title: "Find the Night Watch in the Rijksmuseum without a floor plan", desc: "Enter the Rijksmuseum without picking up a map or opening the app. Navigate to the Night Watch by instinct and signage only. Once you find it, spend 10 minutes standing in front of it.", category: "Amsterdam", difficulty: "Easy", xp: 100 },
  { title: "Walk the Jordaan and find a secondhand vinyl shop", desc: "Walk the Jordaan neighborhood for at least 90 minutes without a route. Find at least one secondhand vinyl record store. Browse for 20 minutes and buy one record you don't already own.", category: "Amsterdam", difficulty: "Easy", xp: 75 },
  { title: "Kayak through the Amsterdam canals for one hour", desc: "Rent a kayak or canoe from a canal-side outfitter. Paddle through the Prinsengracht or Keizersgracht for at least one hour. Stay in the canal lanes and follow the rules.", category: "Amsterdam", difficulty: "Easy", xp: 100 },
  { title: "Spend 2 hours at OBA Amsterdam without your phone", desc: "Visit the Amsterdam Public Library (OBA) on the Oosterdokskade. Put your phone on silent in your bag. Spend 2 hours reading, browsing, or just sitting. No scrolling allowed.", category: "Amsterdam", difficulty: "Easy", xp: 75 },
  { title: "Find and photograph the narrowest house on Singel canal", desc: "Find Singel 7 — one of the narrowest houses in Amsterdam. Photograph it from across the canal. Then find two more narrow houses in the city and add them to your collection.", category: "Amsterdam", difficulty: "Easy", xp: 75 },
  { title: "Sit on a canal bench for 30 minutes and write observations", desc: "Find a bench directly on any Amsterdam canal. Sit for a full 30 minutes without your phone. Write down everything you observe — boats, people, reflections, sounds, smells.", category: "Amsterdam", difficulty: "Easy", xp: 75 },
  { title: "Cycle a 40km route through all four grachtengordel canals", desc: "Plan and cycle a 40km+ loop that includes all four of the main Amsterdam canal ring layers and extends into outer neighborhoods like De Pijp, Oost, and Noord.", category: "Amsterdam", difficulty: "Medium", xp: 200 },
  { title: "Rent a canal boat and navigate by paper map only", desc: "Rent a self-drive canal boat for a half-day. Navigate Amsterdam's canals using only a paper canal map, no phone, no app. Return without going aground.", category: "Amsterdam", difficulty: "Medium", xp: 225 },
  { title: "Queue from opening time at the Anne Frank House", desc: "Do not pre-book. Arrive at the Anne Frank House before it opens and queue. Enter and spend the full visit at the museum. Read every panel. Do not rush through for a photo.", category: "Amsterdam", difficulty: "Medium", xp: 200 },
  { title: "Find and document 10 pieces of urban art at NDSM Wharf", desc: "Take the ferry to NDSM Wharf. Walk the entire arts district. Find and photograph 10 distinct pieces of urban art or street art. Research the artist of your three favorites.", category: "Amsterdam", difficulty: "Medium", xp: 175 },
  { title: "Day trip to Marken and Volendam by bike and ferry", desc: "Cycle from Amsterdam to Marken (20km). Take the ferry to Volendam. Cycle back to Amsterdam via Edam. Full day, no trains or buses.", category: "Amsterdam", difficulty: "Medium", xp: 225 },
  { title: "Cook Dutch erwtensoep from scratch with a fresh rookworst", desc: "Buy fresh split peas, a rookworst sausage, celeriac, and leeks from a market. Cook a traditional Dutch erwtensoep entirely from scratch. Serve it thick enough for the spoon to stand up.", category: "Amsterdam", difficulty: "Medium", xp: 200 },
  { title: "Sketch Amsterdam canal houses from three different bridges", desc: "Choose three bridges with canal house views — none within 500m of each other. Spend a minimum of 20 minutes sketching from each. Compare the three sketches at the end.", category: "Amsterdam", difficulty: "Medium", xp: 200 },
  { title: "Walk all of Vondelpark and attend a free performance", desc: "Walk every path in Vondelpark in a single visit. Find the Openluchttheater (open-air theatre). Attend any free performance that's happening. Stay for the full show.", category: "Amsterdam", difficulty: "Medium", xp: 175 },
  { title: "Photograph one image at every night tram stop", desc: "Take the night tram (nachtbus or tram) across Amsterdam. Get one photograph at every single stop. Use only natural street light — no flash, no extra lighting.", category: "Amsterdam", difficulty: "Medium", xp: 200 },
  { title: "Spend an evening at a bruine kroeg and play a board game", desc: "Find a traditional Dutch brown café (bruine kroeg — not a tourist bar). Order a biertje or jenever. Ask if they have a board game. Stay for at least two hours and play.", category: "Amsterdam", difficulty: "Medium", xp: 175 },
  { title: "Cycle Amsterdam to Haarlem to Zandvoort and back in one day", desc: "Cycle from Amsterdam to Haarlem, continue to Zandvoort beach, take a swim, and cycle back. 80km+ total. Start before 8am. No trains or support vehicles.", category: "Amsterdam", difficulty: "Hard", xp: 500 },
  { title: "Spend 24 hours in Amsterdam without entering any paid tourist attraction", desc: "From midnight to midnight, explore Amsterdam without paying entry to a single museum, gallery, or ticketed site. Find everything the city offers for free.", category: "Amsterdam", difficulty: "Hard", xp: 400 },
  { title: "Kayak the complete historic canal ring in a single day", desc: "Rent a kayak and paddle the complete historic Grachtengordel ring — all four canal layers — in a single day. Navigate by the canal map only. Cover every section.", category: "Amsterdam", difficulty: "Hard", xp: 450 },
  { title: "Walk all 17th-century canal houses in one unbroken 12km loop", desc: "Research the complete Grachtengordel UNESCO boundary. Walk the entire 12km+ perimeter in one unbroken session, stopping to read the plaques on at least 20 historic canal houses.", category: "Amsterdam", difficulty: "Hard", xp: 450 },
  { title: "Cycle every street in the Grachtengordel in one day", desc: "Plan a route and cycle every street inside the Grachtengordel historic district in a single day — bridges, side streets, and all four main canals. GPS-track your route to verify coverage.", category: "Amsterdam", difficulty: "Hard", xp: 500 },
  { title: "Cook an Indonesian rijsttafel for 8+ people using Albert Cuyp Market ingredients", desc: "Buy all ingredients — tempeh, sambal, rendang spices, ketjap manis, kroepoek — from the Albert Cuyp Market. Cook a full 12-dish Indonesian rijsttafel from scratch for eight people.", category: "Amsterdam", difficulty: "Hard", xp: 500 },
  { title: "Cycle through 20 Amsterdam neighborhoods overnight", desc: "Start at midnight. Plan a cycling route that passes through 20 distinct Amsterdam neighborhoods before dawn. Document one photo from each.", category: "Amsterdam", difficulty: "Hard", xp: 450 },
  { title: "Cycle the Amstel river route to Amstelveen and back at night", desc: "After 10pm, cycle from the Amstel in the city center along the river to Amstelveen and back. 50km. No main roads. Ride the river path the whole way.", category: "Amsterdam", difficulty: "Hard", xp: 450 },
  { title: "Visit all 7 windmills in the Amsterdam region in one cycling day", desc: "Map the 7 windmills within or near Amsterdam — including De Gooyer, Molen van Sloten, and others. Cycle to every single one in a single day. Photograph each with your bike.", category: "Amsterdam", difficulty: "Hard", xp: 500 },
  { title: "Volunteer a full day at an Amsterdam stadstuinen", desc: "Find and sign up in advance to volunteer at one of Amsterdam's community gardens (stadstuinen). Show up on time. Work for the full day — planting, weeding, building. No early exits.", category: "Amsterdam", difficulty: "Hard", xp: 400 },
];

// ===== Levels =====
const levels = [
  { level: 1, xp: 0,    rank: "Rookie Adventurer" },
  { level: 2, xp: 500,  rank: "Rising Explorer" },
  { level: 3, xp: 1200, rank: "Seasoned Wanderer" },
  { level: 4, xp: 2500, rank: "Bold Pathfinder" },
  { level: 5, xp: 4500, rank: "Elite Quester" },
  { level: 6, xp: 7000, rank: "Legendary Hero" },
];

// ===== Cookies =====
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.split("; ").find(row => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function saveState() {
  setCookie("userXP", userXP, 365);
  setCookie("completedQuests", JSON.stringify(completedQuests), 365);
}

function loadState() {
  const xp = getCookie("userXP");
  if (xp !== null) userXP = parseInt(xp, 10) || 0;
  const quests = getCookie("completedQuests");
  if (quests !== null) {
    try { completedQuests = JSON.parse(quests); } catch (e) { completedQuests = []; }
  }
}


// ===== State =====
let userXP = 0;
let completedQuests = [];
let currentQuest = null;
let selectedDifficulty = "any";
let selectedCategory = "any";

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  rollQuest();
  updateProgress();
  updateHeaderXP();
  initPills();
});

// ===== Pill Filters =====
function initPills() {
  document.querySelectorAll("#difficulty-pills .pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("#difficulty-pills .pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      selectedDifficulty = pill.dataset.value;
      rollQuest();
    });
  });

  const categorySelect = document.getElementById("category-select");
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      selectedCategory = categorySelect.value;
      rollQuest();
    });
  }
}

// ===== Roll Quest =====
function rollQuest() {
  const card = document.getElementById("quest-card");
  card.classList.add("rolling");

  setTimeout(() => {
    let pool = quests.filter(q => {
      const diffOk = selectedDifficulty === "any" || q.difficulty === selectedDifficulty;
      const catOk  = selectedCategory  === "any" || q.category  === selectedCategory;
      return diffOk && catOk;
    });

    if (!pool.length) pool = quests;

    let pick;
    do {
      pick = pool[Math.floor(Math.random() * pool.length)];
    } while (pool.length > 1 && currentQuest && pick.title === currentQuest.title);

    currentQuest = pick;
    renderQuest(pick);
    hideCompletion();
    card.classList.remove("rolling");
  }, 200);
}

// ===== Render Quest =====
function renderQuest(quest) {
  document.getElementById("quest-category").textContent  = `${categoryEmoji(quest.category)} ${quest.category}`;
  document.getElementById("quest-difficulty").textContent = quest.difficulty;
  document.getElementById("quest-difficulty").className   = `quest-difficulty-badge ${quest.difficulty}`;
  document.getElementById("quest-xp").textContent         = `+${quest.xp} XP`;
  document.getElementById("quest-title").textContent      = quest.title;
  document.getElementById("quest-desc").textContent       = quest.desc;
}

function categoryEmoji(cat) {
  const map = {
    Mental: "🧠", Creative: "🎨", Adventure: "🗺️", Social: "🤝", Physical: "💪", Travel: "✈️",
    "Cape Town": "🌍", "Windhoek": "🦁", "Dubai": "🌆", "South Holland": "🌷", "Amsterdam": "🚲", "Netherlands": "🧀"
  };
  return map[cat] || "⚡";
}

// ===== Complete Quest =====
function completeQuest() {
  if (!currentQuest) return;

  const alreadyDone = completedQuests.some(q => q.title === currentQuest.title);
  if (alreadyDone) {
    showCompletion("You already completed this quest!", false);
    return;
  }

  userXP += currentQuest.xp;
  completedQuests.unshift({ ...currentQuest });
  saveState();

  updateProgress();
  updateHeaderXP();
  showCompletion(`+${currentQuest.xp} XP earned! Quest complete!`, true);
}

// ===== Progress =====
function updateProgress() {
  const lvl = getLevel(userXP);
  const next = levels[lvl.idx + 1];

  document.getElementById("current-level").textContent = lvl.level;
  document.getElementById("current-rank").textContent  = lvl.rank;
  document.getElementById("total-xp").textContent      = userXP.toLocaleString();

  const xpIntoLevel = userXP - lvl.xp;
  const xpToNext    = next ? next.xp - lvl.xp : 1;
  const pct         = next ? Math.min(100, Math.round((xpIntoLevel / xpToNext) * 100)) : 100;

  document.getElementById("xp-bar").style.width = `${pct}%`;
  document.getElementById("xp-current-label").textContent = `${xpIntoLevel.toLocaleString()} XP`;
  document.getElementById("xp-next-label").textContent    = next
    ? `${(next.xp - userXP).toLocaleString()} XP to Level ${next.level}`
    : "Max Level Reached!";

  renderCompletedList();
}

function getLevel(xp) {
  let current = levels[0];
  let idx = 0;
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].xp) { current = levels[i]; idx = i; }
  }
  return { ...current, idx };
}

function renderCompletedList() {
  const list = document.getElementById("completed-list");
  if (!completedQuests.length) {
    list.innerHTML = `<p class="empty-state">No quests completed yet. Roll one above and get started!</p>`;
    return;
  }
  list.innerHTML = completedQuests.map(q => `
    <div class="completed-item">
      <span>${categoryEmoji(q.category)}</span>
      <span>${q.title}</span>
      <span class="completed-item-cat">${q.category}</span>
      <span class="completed-item-xp">+${q.xp} XP</span>
    </div>
  `).join("");
}

// ===== Header XP =====
function updateHeaderXP() {
  document.getElementById("header-xp").textContent = userXP.toLocaleString();
}

// ===== Completion Banner =====
function showCompletion(msg, success) {
  const banner = document.getElementById("completion-banner");
  document.getElementById("completion-text").textContent = msg;
  banner.classList.remove("hidden");
  if (!success) banner.style.background = "linear-gradient(135deg,#FEE2E2,#FECACA)";
  else banner.style.background = "";
}

function hideCompletion() {
  document.getElementById("completion-banner").classList.add("hidden");
}

