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
  { title: "Learn 10 Dutch phrases and use them all today", desc: "Learn 10 Dutch phrases in the morning — greetings, thank-you, excuse me, directions. By end of day, use every single one in actual conversations. No clustering them all at once.", category: "Mental", difficulty: "Easy", xp: 100 },
  { title: "Sketch a Dutch canal scene on location", desc: "Find a canal with bridges, bikes, and boats. Sit down and spend 30 minutes sketching what you see — no photos allowed as a substitute. Date and sign it.", category: "Creative", difficulty: "Easy", xp: 100 },
  { title: "Cook a Dutch stamppot from scratch", desc: "Buy Dutch staples — potatoes, rookworst, boerenkool or zuurkool — and cook a traditional stamppot entirely from scratch. No shortcuts, no premade mash.", category: "Creative", difficulty: "Medium", xp: 175 },
  { title: "Walk the top of a dike for an hour", desc: "Find a sea dike or river dike and walk along the crest for at least one hour. Notice the land below sea level on one side, water on the other. Think about what keeps it all in place.", category: "Adventure", difficulty: "Easy", xp: 75 },
  { title: "Cycle between two Dutch cities", desc: "Choose two cities at least 20km apart and cycle the route using fietspaden only. No trains, no buses, no cars as backup. Track it.", category: "Adventure", difficulty: "Medium", xp: 200 },
  { title: "Explore Hoge Veluwe on a free white bike", desc: "Get to the Hoge Veluwe National Park, borrow one of the free white bikes at the entrance, and spend at least 3 hours exploring the forests, heathlands, and sand drifts. No itinerary allowed.", category: "Adventure", difficulty: "Medium", xp: 225 },
  { title: "Have a genuine conversation entirely in Dutch", desc: "Have a 15+ minute conversation with a Dutch person entirely in Dutch — no switching to English, even when they offer. Order, ask for directions, or just chat. Stay in it.", category: "Social", difficulty: "Hard", xp: 350 },
  { title: "Swim in the North Sea", desc: "Get to a Dutch beach — Scheveningen, Zandvoort, or anywhere on the North Sea coast — and actually swim. Not wade in. Fully in, for at least 5 minutes. The cold is the point.", category: "Physical", difficulty: "Medium", xp: 200 },
  { title: "Cycle 80km in a single day on Dutch fietspaden", desc: "Plan an 80km route using only Dutch cycling paths. No e-bike. Track every kilometer. Fuel yourself with stroopwafels and water from Albert Heijn.", category: "Physical", difficulty: "Hard", xp: 400 },
  { title: "Eat raw herring from a haringkar", desc: "Find a traditional haringkar (herring cart) and eat a raw haring the Dutch way — chopped with raw onion and pickles, or held by the tail over your mouth. No ketchup. No hesitation.", category: "Travel", difficulty: "Easy", xp: 75 },
  { title: "Take a ferry to a Wadden Island for a day", desc: "Book a TESO or Doeksen ferry to Texel, Vlieland, or Terschelling. Rent a bike on arrival and cover as much of the island as you can before the last ferry home. No overnight bag allowed.", category: "Travel", difficulty: "Medium", xp: 250 },
  { title: "Visit a Dutch boerenmarkt and cook from what you buy", desc: "Go to a local farmers' market (boerenmarkt) and buy only things you've never cooked with before. Get home and cook a full meal from just those ingredients that evening.", category: "Travel", difficulty: "Medium", xp: 200 },
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

  document.querySelectorAll("#category-pills .pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("#category-pills .pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      selectedCategory = pill.dataset.value;
      rollQuest();
    });
  });
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
  const map = { Mental: "🧠", Creative: "🎨", Adventure: "🗺️", Social: "🤝", Physical: "💪", Travel: "✈️" };
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

