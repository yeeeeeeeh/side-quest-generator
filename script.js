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
  setCookie("savedTodos", JSON.stringify(savedTodos), 365);
}

function loadState() {
  const xp = getCookie("userXP");
  if (xp !== null) userXP = parseInt(xp, 10) || 0;
  const quests = getCookie("completedQuests");
  if (quests !== null) {
    try { completedQuests = JSON.parse(quests); } catch (e) { completedQuests = []; }
  }
  const todos = getCookie("savedTodos");
  if (todos !== null) {
    try { savedTodos = JSON.parse(todos); } catch (e) { savedTodos = []; }
  }
}


// ===== State =====
let userXP = 0;
let completedQuests = [];
let savedTodos = [];
let currentQuest = null;
let selectedDifficulty = "any";
let selectedCategory = "any";

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  pickAndApplyQuest();
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
function pickAndApplyQuest() {
  let pool = quests.filter(q => {
    const diffOk = selectedDifficulty === "any" || q.difficulty === selectedDifficulty;
    const excludedFromAny = ["Dubai", "Cape Town", "Windhoek"];
    const catOk  = selectedCategory === "any"
      ? !excludedFromAny.includes(q.category)
      : q.category === selectedCategory;
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
}

function rollQuest() {
  const card = document.getElementById("quest-card");
  card.classList.add("rolling");
  setTimeout(() => {
    pickAndApplyQuest();
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

// ===== Save as Todo =====
function saveAsTodo() {
  if (!currentQuest) return;
  const alreadySaved = savedTodos.some(q => q.title === currentQuest.title);
  if (alreadySaved) {
    showCompletion("Quest already in your saved list!", false);
    return;
  }
  savedTodos.push({ ...currentQuest });
  saveState();
  renderTodoList();
  showCompletion("📌 Quest saved for later!", true);
}

function completeTodoQuest(index) {
  const quest = savedTodos[index];
  if (!quest) return;
  savedTodos.splice(index, 1);
  const alreadyDone = completedQuests.some(q => q.title === quest.title);
  if (!alreadyDone) {
    userXP += quest.xp;
    completedQuests.unshift({ ...quest });
  }
  saveState();
  updateProgress();
  updateHeaderXP();
  renderTodoList();
  showCompletion(
    alreadyDone ? "Quest removed from saved list (already completed)." : `+${quest.xp} XP earned! Quest complete!`,
    true
  );
}

function removeTodo(index) {
  savedTodos.splice(index, 1);
  saveState();
  renderTodoList();
}

function renderTodoList() {
  const list = document.getElementById("todo-list");
  if (!list) return;
  if (!savedTodos.length) {
    list.innerHTML = `<p class="empty-state">No quests saved yet. Hit 📌 Save for Later on any quest!</p>`;
    return;
  }
  list.innerHTML = savedTodos.map((q, i) => `
    <div class="todo-item">
      <div class="todo-item-body">
        <div class="todo-item-header">
          <span>${categoryEmoji(q.category)}</span>
          <span class="todo-title">${q.title}</span>
          <span class="completed-item-cat">${q.category}</span>
          <span class="completed-item-xp">+${q.xp} XP</span>
        </div>
        <p class="todo-desc">${q.desc}</p>
      </div>
      <div class="todo-actions">
        <button class="btn-inline btn-inline-success" onclick="completeTodoQuest(${i})" title="Mark complete">✅</button>
        <button class="btn-inline btn-inline-remove" onclick="removeTodo(${i})" title="Remove">✕</button>
      </div>
    </div>
  `).join("");
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
  renderTodoList();
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

