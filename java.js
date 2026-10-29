// ===== Java SE 21 learner =====
// Web version of the Java learner in the vocab app: the 1Z0-830 course (units of lessons with pages and six kinds
// of exercises), timed mock exams, three drills (fix the bug, write it, trace it), tips and per-objective readiness.
// Content is the app's JSON, served from java/. Progress lives in localStorage. Code is not compiled or run here:
// "Write it" is checked token by token against accepted solutions, like the app does offline.
(function () {
"use strict";

const BASE = "java/";
const UNIT_FILES = ["unit01-foundations", "u02-control-flow", "unit03-classes-objects", "u04-inheritance-polymorphism",
  "u05-exceptions", "u06-arrays-collections", "u07-lambdas-streams", "u08-concurrency", "u09-io-nio",
  "u10-datetime-localization", "u11-modules-packaging"];
const MOCK_FILES = ["set01", "set02", "set90-java21doccards"];
const ROUND = 5;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[<>&'"]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&#39;",'"':"&quot;"}[c]));
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pct = v => Math.round(v * 100) + "%";

// ---------- content ----------
let C = null; // {catalog, units:[{info, lessons}], mocks:[...], fixbug:[...], write:[...], trace:[...], tips:[...]}

async function loadContent() {
  const get = f => fetch(BASE + f, { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`); return r.json(); });
  const [catalog, units, mocks, fixbug, write, trace, tips] = await Promise.all([
    get("JavaCourse-catalog.json"),
    Promise.all(UNIT_FILES.map(f => get(`JavaCourse-${f}.json`))),
    Promise.all(MOCK_FILES.map(f => get(`JavaMock-${f}.json`))),
    get("JavaDrill-fixbug.json"), get("JavaDrill-write.json"), get("JavaDrill-trace.json"), get("JavaTips-extra.json"),
  ]);
  const byId = Object.fromEntries(units.map(u => [u.unitId, u.lessons]));
  return {
    catalog,
    objectives: Object.fromEntries(catalog.objectives.map(o => [o.id, o])),
    units: catalog.units.map(info => ({ info, lessons: byId[info.id] || [] })),
    mocks, fixbug: fixbug.items, write: write.items, trace: trace.programs, tips,
  };
}

// ---------- progress ----------
const KEY = "javaProgress";
let P = { lessons: {}, answers: {}, mocks: {}, drills: { fixbug: {}, write: {}, trace: {} } };
try { P = Object.assign(P, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (_) {} };

// One answered question towards readiness for its exam objective.
function recordAnswer(objective, correct) {
  if (!objective) return;
  const a = P.answers[objective] || (P.answers[objective] = { right: 0, total: 0 });
  a.total++; if (correct) a.right++;
}
function readiness() {
  const ids = C.catalog.objectives.map(o => o.id);
  const seen = ids.filter(id => P.answers[id] && P.answers[id].total);
  const right = seen.reduce((n, id) => n + P.answers[id].right, 0), total = seen.reduce((n, id) => n + P.answers[id].total, 0);
  return { score: total ? right / total : 0, covered: seen.length, of: ids.length, total };
}
const objScore = id => { const a = P.answers[id]; return a && a.total ? a.right / a.total : null; };
const lessonDone = l => !!(P.lessons[l.id] && P.lessons[l.id].done);
// Lessons unlock in order within a unit; the first lesson of every unit is open.
const lessonUnlocked = (u, i) => i === 0 || lessonDone(u.lessons[i]) || lessonDone(u.lessons[i - 1]);
// Next lesson: the first not done in the unit of the last lesson played, else the first not done anywhere.
function nextLesson() {
  const last = P.lastLesson && C.units.find(u => u.lessons.some(l => l.id === P.lastLesson));
  if (last) { const l = last.lessons.find(x => !lessonDone(x)); if (l) return { u: last, l }; }
  for (const u of C.units) for (const l of u.lessons) if (!lessonDone(l)) return { u, l };
  return null;
}

// XP, daily goal and streak, as in the app: lesson 10 XP (+5 when perfect), reviews 1 XP per right answer.
const LESSON_XP = 10, PERFECT_XP = 5, MOCK_XP = 20, GOALS = [10, 20, 30, 50];
P.xpByDay = P.xpByDay || {}; P.goalMet = P.goalMet || []; P.goal = P.goal || 20;
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayXP = () => P.xpByDay[dayKey()] || 0;
const totalXP = () => Object.values(P.xpByDay).reduce((n, v) => n + v, 0);
function addXP(n) {
  if (!n) return;
  const k = dayKey(); P.xpByDay[k] = (P.xpByDay[k] || 0) + n;
  if (P.xpByDay[k] >= P.goal && !P.goalMet.includes(k)) P.goalMet.push(k);
  save();
}
// Days in a row with the goal met, ending today, or yesterday while today is still open.
function streak() {
  const met = k => P.goalMet.includes(k) || (k === dayKey() && todayXP() >= P.goal);
  const d = new Date(); if (!met(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0; while (met(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function completeLesson(l, score) {
  const st = P.lessons[l.id] || {};
  P.lessons[l.id] = { done: true, best: Math.max(st.best ?? 0, score), at: Date.now() };
  P.lastLesson = l.id;
  const xp = LESSON_XP + (score >= 1 ? PERFECT_XP : 0);
  addXP(xp); save();
  return xp;
}
// Marks a lesson done without playing it: the next one unlocks, but there is no XP or score.
function skipLesson(l) {
  if (lessonDone(l)) return;
  P.lessons[l.id] = { done: true, skipped: true, at: Date.now() }; P.lastLesson = l.id; save();
}
// Undoes a lesson's progress: a skipped one becomes not started; a played one too (its XP is kept).
function resetLesson(l) {
  delete P.lessons[l.id];
  const p = pausedLesson(); if (p && p.l.id === l.id) { try { localStorage.removeItem(PAUSE_KEY); } catch (_) {} }
  save();
}
// ---------- review (spaced repetition) ----------
// Leitner boxes like the app: right moves an exercise up a box (due again in 1, 3, 7, 14 or 30 days), a miss moves
// it down one box and brings it back tomorrow. Guesses count as misses.
const INTERVAL_DAYS = [1, 3, 7, 14, 30], REVIEW_SIZE = 10;
P.ex = P.ex || {};
function reviewRecord(id, correct) {
  const prev = P.ex[id] || { a: 0, c: 0, box: 0 };
  const box = correct ? Math.min(prev.box + 1, INTERVAL_DAYS.length) : Math.max(prev.box - 1, 1);
  const due = new Date(); due.setHours(0, 0, 0, 0); due.setDate(due.getDate() + (correct ? INTERVAL_DAYS[box - 1] : 1));
  P.ex[id] = { a: prev.a + 1, c: prev.c + (correct ? 1 : 0), box, due: due.getTime(), last: Date.now() };
  save();
}
let EXERCISES = null; // id -> {ex, u, l}
function exerciseIndex() {
  if (!EXERCISES) { EXERCISES = {}; C.units.forEach(u => u.lessons.forEach(l => l.steps.forEach(st => { if (st.type === "exercise") EXERCISES[st.id] = { ex: st, u, l }; }))); }
  return EXERCISES;
}
// Due exercises that still exist in the course, lowest box first, then the longest overdue.
function dueExercises() {
  const idx = exerciseIndex(), now = Date.now();
  return Object.entries(P.ex).filter(([id, st]) => idx[id] && st.due <= now)
    .sort((a, b) => a[1].box - b[1].box || a[1].due - b[1].due).map(([id]) => idx[id]);
}
function nextDue() {
  const idx = exerciseIndex(), later = Object.entries(P.ex).filter(([id, st]) => idx[id] && st.due > Date.now()).map(([, st]) => st.due);
  return later.length ? Math.min(...later) : null;
}

// ---------- saved (bookmarks and notes) ----------
// A page or question the learner bookmarked or wrote a note on. Questions are keyed by exercise id so the same
// question saved from a lesson or a review is one item; pages by lesson id and step index.
P.saved = P.saved || {};
const savedKey = (l, k) => { const st = l.steps[k]; return st.type === "exercise" ? st.id : `${l.id}#${k}`; };
function savedEntry(l, k) { return P.saved[savedKey(l, k)]; }
function updateSaved(l, k, change) {
  const key = savedKey(l, k), cur = P.saved[key] || { lessonId: l.id, step: k, at: Date.now() };
  Object.assign(cur, change, { at: Date.now() });
  if (!cur.bookmark && !cur.note) delete P.saved[key]; else P.saved[key] = cur;
  save();
}
function findLesson(id) { for (const u of C.units) { const l = u.lessons.find(x => x.id === id); if (l) return { u, l }; } return null; }
// The right answer to a question, as text, for read-only views.
function solutionHtml(ex) {
  switch (ex.kind) {
    case "singleChoice": return ex.codeOptions ? codeView(ex.options[ex.answer]) : mdP(ex.options[ex.answer]);
    case "multiChoice": return ex.answers.map(i => ex.codeOptions ? codeView(ex.options[i]) : mdP(ex.options[i])).join("");
    case "trueFalse": return `<p><b>${ex.answer ? "True" : "False"}</b></p>`;
    case "tapLine": return codeView(ex.code, { lineClass: n => n === ex.answer ? "right" : "" });
    case "fillBlanks": { let k = 0; return codeView(ex.code.replace(/___/g, () => ex.answers[k++])); }
    case "orderLines": return codeView(ex.lines.join("\n"));
  }
  return "";
}
// One saved page or question, read-only, with its note.
function savedItem(body, key) {
  const it = P.saved[key], f = it && findLesson(it.lessonId);
  if (!f) { body.innerHTML = '<p class="j-sub">This item is no longer in the course.</p>'; return; }
  const st = f.l.steps[it.step];
  body.innerHTML = `<div class="j-kicker">Unit ${f.u.info.number} · ${esc(f.l.title)}</div>
    <div class="j-card">${st.type === "page" ? `<h3 class="j-pt">${esc(st.title)}</h3>${st.blocks.map(blockHtml).join("")}`
      : `<div class="j-prompt">${md(st.prompt)}</div>${st.kind !== "tapLine" && st.code ? codeView(st.code) : ""}<div class="j-hint">Answer</div>${solutionHtml(st)}<div class="j-feedback ok">${mdP(st.explanation)}</div>`}</div>
    <h3 class="j-sec">Note</h3><textarea class="j-code j-note-edit" id="j-note" rows="4" placeholder="Your note">${esc(it.note || "")}</textarea>
    <div class="j-actions j-two"><button class="btn j-ghost" id="j-unbm">${it.bookmark ? "★ Remove bookmark" : "☆ Bookmark"}</button><button class="btn btn-primary" id="j-open">Open lesson</button></div>`;
  $("#j-note").onchange = e => updateSaved(f.l, it.step, { note: e.target.value.trim() });
  $("#j-unbm").onclick = () => { updateSaved(f.l, it.step, { bookmark: !it.bookmark }); P.saved[key] ? show() : back(); };
  $("#j-open").onclick = () => { if (lessonUnlocked(f.u, f.u.lessons.indexOf(f.l))) openLesson(f.u, f.l); else alert("That lesson is still locked."); };
}
function savedList(body, kind) {
  const items = Object.entries(P.saved).filter(([, v]) => kind === "bookmark" ? v.bookmark : v.note).sort((a, b) => b[1].at - a[1].at);
  body.innerHTML = `<h2 class="j-h">${kind === "bookmark" ? "★ Bookmarks" : "✎ Notes"}</h2>
    ${items.length ? `<div class="j-list">${items.map(([key, v]) => { const f = findLesson(v.lessonId), st = f && f.l.steps[v.step]; if (!st) return "";
      return `<button class="j-lesson" data-key="${esc(key)}"><span class="j-check">${st.type === "page" ? "📄" : "❓"}</span><span class="j-ut"><b>${esc(st.type === "page" ? st.title : st.prompt.replace(/[`*]/g, "").slice(0, 90))}</b>
        <small>${kind === "note" ? esc(v.note.slice(0, 120)) : `Unit ${f.u.info.number} · ${esc(f.l.title)}`}</small></span></button>`; }).join("")}</div>`
      : `<p class="j-sub">${kind === "bookmark" ? "Tap ☆ on a lesson page or question to save it here." : "Tap ✎ on a lesson page or question to write a note."}</p>`}`;
  on(body, "[data-key]", "click", b => go(savedItem, b.dataset.key));
}

// ---------- lesson reader ----------
// Every page of a lesson in one scroll, without the exercises: for reading or rereading.
function reader(body, u, l) {
  const pages = l.steps.map((st, k) => [st, k]).filter(([st]) => st.type === "page");
  const exCount = l.steps.length - pages.length, i = u.lessons.indexOf(l);
  body.innerHTML = `<div class="j-kicker">Unit ${u.info.number} · Lesson ${i + 1} · read</div><h2 class="j-h">${esc(l.title)}</h2>
    <p class="j-sub">${esc(l.summary)} · ${pages.length} page${pages.length === 1 ? "" : "s"}${exCount ? `, ${exCount} exercises not shown` : ""}</p>
    <nav class="j-toc">${pages.map(([st, k], n) => `<a href="#" data-to="${k}">${n + 1}. ${esc(st.title)}</a>`).join("")}</nav>
    ${pages.map(([st, k]) => { const e = savedEntry(l, k) || {};
      return `<section class="j-card j-rpage" id="j-rp-${k}"><div class="j-rhead"><h3 class="j-pt">${esc(st.title)}</h3><button class="j-mini${e.bookmark ? " on" : ""}" data-bm="${k}" aria-label="Bookmark">${e.bookmark ? "★" : "☆"}</button></div>
        ${st.blocks.map(blockHtml).join("")}${e.note ? `<div class="j-notebox">✎ ${esc(e.note)}</div>` : ""}</section>`; }).join("")}
    <div class="j-actions j-two j-static">${i + 1 < u.lessons.length ? `<button class="btn j-ghost" id="j-rnext">Read next ›</button>` : ""}<button class="btn btn-primary" id="j-rplay">${lessonDone(l) ? "Practise this lesson" : "Start this lesson"}</button></div>`;
  on(body, "[data-to]", "click", (a, e) => { e.preventDefault(); $("#j-rp-" + a.dataset.to).scrollIntoView({ behavior: "smooth", block: "start" }); });
  on(body, "[data-bm]", "click", b => { const k = +b.dataset.bm; updateSaved(l, k, { bookmark: !(savedEntry(l, k) || {}).bookmark }); const on2 = !!(savedEntry(l, k) || {}).bookmark; b.textContent = on2 ? "★" : "☆"; b.classList.toggle("on", on2); });
  const nx = $("#j-rnext"); if (nx) nx.onclick = () => { stack.pop(); go(reader, u, u.lessons[i + 1]); };
  $("#j-rplay").onclick = () => { if (lessonUnlocked(u, i)) { stack.pop(); openLesson(u, l); } else alert("Finish or skip the lesson before this one to unlock it (tap it on the path)."); };
}

// ---------- unit essentials ----------
// The exam-critical points of a unit in one place: its objectives, then every "On the exam" and trap callout from its
// lessons, grouped by lesson.
function essentials(body, u) {
  let filter = "all";
  const render = () => {
    const groups = u.lessons.map(l => ({ l, pts: l.steps.flatMap(st => st.type === "page" ? st.blocks.filter(b => b.type === "callout" && (b.kind === "exam" || b.kind === "trap") && (filter === "all" || b.kind === filter)) : []) })).filter(g => g.pts.length);
    body.innerHTML = `<div class="j-kicker">Unit ${u.info.number} essentials</div><h2 class="j-h">${esc(u.info.title)}</h2>
      <div class="j-list">${u.info.objectives.map(id => `<div class="j-row"><span><b>${esc(id)}</b> · ${esc((C.objectives[id] || {}).title || "")}</span></div>`).join("")}</div>
      <div class="j-seg" style="margin-top:14px">${[["all", "All"], ["exam", "🎯 On the exam"], ["trap", "⚠️ Traps"]].map(([k, t]) => `<button data-k="${k}" class="${k === filter ? "on" : ""}">${t}</button>`).join("")}</div>
      ${groups.map(g => `<h3 class="j-sec">${esc(g.l.title)}</h3>${g.pts.map(blockHtml).join("")}`).join("") || '<p class="j-sub">Nothing here.</p>'}`;
    on(body, "[data-k]", "click", b => { filter = b.dataset.k; render(); });
  };
  render();
}

const PAUSE_KEY = "javaPaused";
function pausedLesson() {
  let p = null; try { p = JSON.parse(localStorage.getItem(PAUSE_KEY) || "null"); } catch (_) {}
  if (!p) return null;
  for (const u of C.units) { const l = u.lessons.find(x => x.id === p.lessonId); if (l && p.items.every(([k]) => l.steps[k])) return { u, l, state: p }; }
  return null;
}

// ---------- text and code rendering ----------
// Inline markdown used by the content: `code`, **bold**, *italic*, paragraphs on blank lines.
function md(text) {
  return String(text ?? "").split(/\n{2,}/).map(par => par.split(/(`[^`]*`)/).map(part => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) return `<code>${esc(part.slice(1, -1))}</code>`;
    return esc(part).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>").replace(/\n/g, "<br>");
  }).join("")).join("</p><p>");
}
const mdP = text => `<p>${md(text)}</p>`;

const KEYWORDS = new Set(("abstract assert boolean break byte case catch char class const continue default do double else enum extends final " +
  "finally float for goto if implements import instanceof int interface long native new package private protected public return short " +
  "static strictfp super switch synchronized this throw throws transient try void volatile while var record sealed permits non-sealed yield " +
  "true false null module requires exports opens uses provides to with transitive open when").split(" "));
// Light syntax colouring for one line of Java.
function highlight(line) {
  return line.replace(/("""|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|\/\*.*?\*\/|\b\d[\d_.]*[lLfFdD]?\b|\b[A-Za-z_$][\w$]*\b|[^"'\/\w]+|.)/g, tok => {
    if (/^\/\/|^\/\*/.test(tok)) return `<span class="jc-com">${esc(tok)}</span>`;
    if (/^["']/.test(tok)) return `<span class="jc-str">${esc(tok)}</span>`;
    if (/^\d/.test(tok)) return `<span class="jc-num">${esc(tok)}</span>`;
    if (KEYWORDS.has(tok)) return `<span class="jc-kw">${esc(tok)}</span>`;
    if (/^[A-Z][\w$]*$/.test(tok)) return `<span class="jc-type">${esc(tok)}</span>`;
    return esc(tok);
  });
}
// A code block with line numbers. lineClass(n) adds a class per 1-based line; tappable lines get data-line.
function codeView(code, { lineClass = () => "", tappable = false, lineHtml = null } = {}) {
  const lines = String(code).replace(/\n$/, "").split("\n");
  return `<div class="jc${tappable ? " jc-tap" : ""}">${lines.map((l, i) => {
    const n = i + 1, inner = lineHtml ? lineHtml(l, n) : (highlight(l) || " ");
    return `<div class="jc-line ${lineClass(n)}"${tappable ? ` data-line="${n}" role="button" tabindex="0"` : ""}><span class="jc-no">${n}</span><span class="jc-src">${inner}</span></div>`;
  }).join("")}</div>`;
}
const outputBox = text => `<pre class="j-out">${esc(text) || "<em>nothing</em>"}</pre>`;
function outcomeText(o) {
  if (!o) return "Works";
  if (o.kind === "compile") return "Doesn't compile";
  if (o.kind === "exception") return `Throws <code>${esc(o.value || "an exception")}</code>`;
  return o.value ? `Prints <code>${esc(o.value.replace(/\n/g, " ⏎ "))}</code>` : "Prints nothing";
}

function blockHtml(b) {
  switch (b.type) {
    case "paragraph": return mdP(b.text);
    case "code": return codeView(b.code);
    case "bullets": return `<ul class="j-bul">${b.items.map(i => `<li>${md(i)}</li>`).join("")}</ul>`;
    case "table": return `<div class="j-tblwrap"><table class="j-tbl"><thead><tr>${b.header.map(h => `<th>${md(h)}</th>`).join("")}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${md(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    case "callout": {
      const icon = { trap: "⚠️", tip: "💡", python: "🐍", exam: "🎯" }[b.kind] || "ℹ️";
      return `<div class="j-call j-call-${esc(b.kind)}"><div class="j-call-t">${icon} ${esc(b.title || "")}</div>${mdP(b.text)}</div>`;
    }
    default: return "";
  }
}

// ---------- navigation ----------
// A small view stack inside the panel: each view is a function that fills #j-body; Back pops.
const stack = [];
let leaveGuard = null; // a view can ask before leaving (running exam)
function go(view, ...args) { stack.push([view, args]); show(); }
function back() {
  if (leaveGuard && !leaveGuard()) return;
  editingProgress = false;
  leaveGuard = null; stack.pop(); show();
}
function show() {
  const [view, args] = stack[stack.length - 1];
  $("#j-back").hidden = stack.length < 2;
  const body = $("#j-body");
  body.innerHTML = "";
  body.scrollTop = 0;
  view(body, ...args);
}
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
function on(el, sel, ev, fn) { el.querySelectorAll(sel).forEach(x => x.addEventListener(ev, e => fn(x, e))); }

// ---------- home ----------
function home(body) {
  const ex = C.catalog.exam, r = readiness(), next = nextLesson();
  const done = C.units.reduce((n, u) => n + u.lessons.filter(lessonDone).length, 0), all = C.units.reduce((n, u) => n + u.lessons.length, 0);
  const weak = C.catalog.objectives.map(o => ({ o, s: objScore(o.id), n: (P.answers[o.id] || {}).total || 0 }))
    .filter(x => x.s != null && x.n >= 3).sort((a, b) => a.s - b.s).slice(0, 3);
  const paused = pausedLesson(), today = todayXP(), stk = streak(), dueCount = dueExercises().length;
  body.innerHTML = `
  <div class="j-xphead">
    <div class="j-xpstat"><b>🔥 ${stk}</b><span>day streak</span></div>
    <button class="j-goal" id="j-goal" title="Change daily goal"><span class="j-ring" style="--p:${Math.min(1, today / P.goal)}"><i>${today >= P.goal ? "✓" : today}</i></span><span><b>${today}/${P.goal} XP</b><small>today's goal ✎</small></span></button>
    <div class="j-xpstat"><b>⚡ ${totalXP()}</b><span>total XP</span></div>
  </div>
  <div class="j-hero">
    <div class="j-kicker">${esc(ex.code)}</div>
    <h2 class="j-h">${esc(ex.title)}</h2>
    <div class="j-meta">${ex.questions} questions · ${ex.minutes} min · pass ${ex.passPercent}%</div>
    <div class="j-stats">
      <div><b>${r.total ? pct(r.score) : "—"}</b><span>readiness</span></div>
      <div><b>${r.covered}/${r.of}</b><span>objectives tried</span></div>
      <div><b>${done}/${all}</b><span>lessons</span></div>
    </div>
    ${paused ? `<button class="btn btn-primary j-wide" id="j-resume">⏸ Resume: ${esc(paused.l.title)}<small>Unit ${paused.u.info.number} · ${Math.round(paused.state.index / paused.state.items.length * 100)}% done</small></button>`
      : next ? `<button class="btn btn-primary j-wide" id="j-cont">▶ ${done ? "Continue" : "Start"}: ${esc(next.l.title)}<small>Unit ${next.u.info.number} · ${next.l.minutes} min</small></button>` : `<p class="j-sub">Every lesson is done. Keep sharp with reviews, mock exams and drills.</p>`}
  </div>
  ${weak.length ? `<h3 class="j-sec">Weakest objectives</h3><div class="j-list">${weak.map(x => `<div class="j-row"><span>${esc(x.o.id)} · ${esc(x.o.title)}</span><b class="${x.s >= 0.68 ? "ok" : "bad"}">${pct(x.s)}</b></div>`).join("")}</div>` : ""}
  ${dueCount ? `<button class="j-review" id="j-review"><span class="j-big2">🔁</span><span><b>Review ${Math.min(dueCount, REVIEW_SIZE)} exercise${dueCount === 1 ? "" : "s"}</b><small>${dueCount} due · +1 XP each</small></span><span class="j-go">›</span></button>` : ""}
  <h3 class="j-sec">Practice</h3>
  <div class="j-grid">
    <button class="j-tile" data-go="review">🔁<b>Review</b><small>${dueCount ? `${dueCount} due now` : `${Object.keys(P.ex).length} scheduled`}</small></button>
    <button class="j-tile" data-go="mocks">📝<b>Mock exams</b><small>${C.mocks.length} sets, timed</small></button>
    <button class="j-tile" data-go="fixbug">🐞<b>Fix the bug</b><small>${C.fixbug.length} programs</small></button>
    <button class="j-tile" data-go="write">⌨️<b>Write it</b><small>${C.write.length} from memory</small></button>
    <button class="j-tile" data-go="trace">🔍<b>Trace it</b><small>${C.trace.length} step by step</small></button>
    <button class="j-tile" data-go="tips">💡<b>Tips &amp; traps</b><small>${C.tips.length} short notes</small></button>
    <button class="j-tile" data-go="ready">🎯<b>Readiness</b><small>by objective</small></button>
  </div>
  <h3 class="j-sec">Saved</h3>
  <div class="j-grid">
    <button class="j-tile" data-saved="bookmark">★<b>Bookmarks</b><small>${Object.values(P.saved).filter(v => v.bookmark).length} saved</small></button>
    <button class="j-tile" data-saved="note">✎<b>Notes</b><small>${Object.values(P.saved).filter(v => v.note).length} written</small></button>
  </div>
  <h3 class="j-sec">Units</h3>
  <div class="j-list">${C.units.map((u, i) => {
    const d = u.lessons.filter(lessonDone).length;
    return `<button class="j-unit" data-unit="${i}"><span class="j-num">${u.info.number}</span><span class="j-ut"><b>${esc(u.info.title)}</b><small>${esc(u.info.summary)}</small>
      <span class="j-bar"><i style="width:${u.lessons.length ? (d / u.lessons.length * 100) : 0}%"></i></span></span><span class="j-cnt">${d}/${u.lessons.length}</span></button>`;
  }).join("")}</div>
  <p class="j-foot">Content from the vocab app. The community quiz is from <a href="https://github.com/Anasss/java21docCards" target="_blank" rel="noopener">java21docCards</a> (MIT, see <a href="java/THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener">notices</a>).</p>`;
  const cont = $("#j-cont"); if (cont) cont.onclick = () => openLesson(next.u, next.l);
  const res = $("#j-resume"); if (res) res.onclick = () => go(lesson, paused.u, paused.l, paused.state);
  $("#j-goal").onclick = () => {
    const g = prompt(`Daily goal in XP (${GOALS.join(", ")}). A lesson gives ${LESSON_XP} XP, ${LESSON_XP + PERFECT_XP} when perfect.`, P.goal);
    const v = parseInt(g, 10); if (!v || v < 1) return;
    P.goal = v; if (todayXP() >= v && !P.goalMet.includes(dayKey())) P.goalMet.push(dayKey()); save(); show();
  };
  on(body, "[data-unit]", "click", b => go(unit, C.units[+b.dataset.unit]));
  const views = { mocks, fixbug: drillMenu, write: drillMenu, trace: traceMenu, tips, ready: readinessView, review };
  const rv = $("#j-review"); if (rv) rv.onclick = () => go(review);
  on(body, "[data-saved]", "click", b => go(savedList, b.dataset.saved));
  on(body, "[data-go]", "click", b => go(views[b.dataset.go], b.dataset.go));
}

// ---------- unit ----------
// A path of lesson circles like Duolingo: done (gold), current (pulsing), locked (grey). The current lesson can be
// skipped: it is marked done without XP and the next one unlocks.
let editingProgress = false;
function unit(body, u) {
  const offsets = [0, 34, 52, 34, 0, -34, -52, -34];
  const cur = u.lessons.findIndex((l, i) => lessonUnlocked(u, i) && !lessonDone(l));
  const paused = pausedLesson(), edit = editingProgress;
  body.innerHTML = `<div class="j-kicker">Unit ${u.info.number}</div><h2 class="j-h">${esc(u.info.title)}</h2>
  <p class="j-sub">${esc(u.info.summary)}</p>
  <div class="j-chips">${u.info.objectives.map(id => `<span class="j-chip" title="${esc((C.objectives[id] || {}).title)}">Obj ${esc(id)}${objScore(id) != null ? " · " + pct(objScore(id)) : ""}</span>`).join("")}</div>
  <div class="j-two j-unitbtns"><button class="btn j-ghost" id="j-ess">⚡ Essentials</button><button class="btn ${edit ? "btn-primary" : "j-ghost"}" id="j-edit">${edit ? "✓ Done editing" : "✎ Edit progress"}</button></div>
  ${edit ? `<div class="j-editbar"><p>Tap a lesson to mark it skipped or undo it. Skipped lessons count as done, without XP.</p>
    <div class="j-two"><button class="btn j-ghost" id="j-skipall">⤼ Skip whole unit</button><button class="btn j-ghost" id="j-resetall">↺ Reset unit</button></div></div>` : ""}
  <div class="j-path${edit ? " editing" : ""}">${u.lessons.map((l, i) => {
    const st = P.lessons[l.id] || {}, open = lessonUnlocked(u, i), isCur = i === cur, dx = offsets[i % offsets.length];
    const cls = st.done ? (st.skipped ? "skip" : "done") : isCur ? "cur" : open ? "open" : "lock";
    const icon = st.done ? (st.skipped ? "⤼" : st.best >= 1 ? "★" : "✓") : edit ? "○" : open ? (paused && paused.l.id === l.id ? "⏸" : "▶") : "🔒";
    const state = st.done ? (st.skipped ? "skipped" : "played") : "not started";
    return `<div class="j-node ${cls}" style="--dx:${dx}px">
      <button class="j-dot" data-i="${i}" aria-label="${esc(l.title)}">${icon}</button>
      <div class="j-nlabel"><b>${esc(l.title)}</b><small>${edit ? `${state} · tap to ${st.done ? "undo" : "skip"}` : `${l.minutes} min${st.skipped ? " · skipped" : st.best != null ? ` · best ${pct(st.best)}` : ""}${paused && paused.l.id === l.id ? " · in progress" : ""}`}</small>
      ${!edit ? `<div class="j-nbtns"><button class="j-skip" data-read="${i}">📖 Read</button>${isCur && !(paused && paused.l.id === l.id) ? `<button class="j-skip" data-skip="${i}">Skip lesson</button>` : ""}</div>` : ""}</div></div>`;
  }).join("")}</div>`;
  on(body, "[data-i]", "click", b => {
    const i = +b.dataset.i, l = u.lessons[i], st = P.lessons[l.id] || {};
    if (edit) {
      if (!st.done) skipLesson(l);
      else if (st.skipped || confirm(`Reset "${l.title}"? It becomes not started (your XP is kept).`)) resetLesson(l);
      return show();
    }
    if (!lessonUnlocked(u, i)) {
      // Skip everything before it in this unit so it unlocks.
      const before = u.lessons.slice(0, i).filter(x => !lessonDone(x));
      if (!confirm(`Skip the ${before.length} lesson${before.length === 1 ? "" : "s"} before "${l.title}" so it unlocks? They're marked done without XP; you can still play them later.`)) return;
      before.forEach(skipLesson); show(); return;
    }
    openLesson(u, l);
  });
  $("#j-ess").onclick = () => go(essentials, u);
  on(body, "[data-read]", "click", b => go(reader, u, u.lessons[+b.dataset.read]));
  $("#j-edit").onclick = () => { editingProgress = !editingProgress; show(); };
  const sa = $("#j-skipall"); if (sa) sa.onclick = () => { u.lessons.forEach(skipLesson); show(); };
  const ra = $("#j-resetall"); if (ra) ra.onclick = () => {
    if (!confirm(`Reset all ${u.lessons.length} lessons of "${u.info.title}" to not started? Your XP is kept.`)) return;
    u.lessons.forEach(resetLesson); show();
  };
  on(body, "[data-skip]", "click", b => {
    const l = u.lessons[+b.dataset.skip];
    if (!confirm(`"${l.title}" will be marked done without XP and the next lesson unlocks. You can still play it later.`)) return;
    skipLesson(l); show();
  });
}

// ---------- exercises ----------
// Renders one exercise into `box` and returns {check(): {correct, ready}}; ready=false means nothing answered yet.
function exercise(box, ex) {
  const parts = [`<div class="j-prompt">${md(ex.prompt)}</div>`];
  let state = {};
  const opts = (list, multi) => `<div class="j-opts">${list.map((o, i) => `<button class="j-opt${ex.codeOptions ? " code" : ""}" data-o="${i}">${multi ? '<span class="j-box"></span>' : ""}${ex.codeOptions ? `<code>${esc(o)}</code>` : md(o)}</button>`).join("")}</div>`;
  switch (ex.kind) {
    case "singleChoice": case "multiChoice": case "trueFalse": {
      if (ex.code) parts.push(codeView(ex.code));
      const multi = ex.kind === "multiChoice";
      if (multi) parts.push(`<div class="j-hint">Choose ${ex.answers.length}.</div>`);
      parts.push(ex.kind === "trueFalse" ? `<div class="j-opts j-tf"><button class="j-opt" data-o="1">True</button><button class="j-opt" data-o="0">False</button></div>` : opts(ex.options, multi));
      box.innerHTML = parts.join("");
      state.sel = new Set();
      on(box, "[data-o]", "click", b => {
        if (state.locked) return;
        const i = +b.dataset.o;
        if (multi) { state.sel.has(i) ? state.sel.delete(i) : state.sel.add(i); }
        else state.sel = new Set([i]);
        box.querySelectorAll("[data-o]").forEach(x => x.classList.toggle("sel", state.sel.has(+x.dataset.o)));
      });
      return { check() {
        if (!state.sel.size) return { ready: false };
        state.locked = true;
        const want = ex.kind === "trueFalse" ? new Set([ex.answer ? 1 : 0]) : new Set(multi ? ex.answers : [ex.answer]);
        const correct = want.size === state.sel.size && [...want].every(i => state.sel.has(i));
        box.querySelectorAll("[data-o]").forEach(x => { const i = +x.dataset.o; x.classList.toggle("right", want.has(i)); x.classList.toggle("wrong", state.sel.has(i) && !want.has(i)); });
        return { ready: true, correct };
      } };
    }
    case "tapLine": {
      box.innerHTML = parts.join("") + `<div class="j-hint">Tap a line.</div>` + codeView(ex.code, { tappable: true });
      on(box, "[data-line]", "click", l => {
        if (state.locked) return;
        state.line = +l.dataset.line;
        box.querySelectorAll("[data-line]").forEach(x => x.classList.toggle("sel", +x.dataset.line === state.line));
      });
      return { check() {
        if (!state.line) return { ready: false };
        state.locked = true;
        const correct = state.line === ex.answer;
        box.querySelectorAll("[data-line]").forEach(x => { const n = +x.dataset.line; x.classList.toggle("right", n === ex.answer); x.classList.toggle("wrong", n === state.line && !correct); });
        return { ready: true, correct };
      } };
    }
    case "fillBlanks": {
      state.fill = ex.answers.map(() => null);
      const render = () => {
        let k = 0;
        const code = codeView(ex.code, { lineHtml: line => line.split("___").map((seg, i) => (i ? `<button class="j-blank${state.fill[k] != null ? " full" : ""}" data-b="${k}">${state.fill[k] != null ? esc(state.fill[k++]) : (k++, "&nbsp;&nbsp;&nbsp;&nbsp;")}</button>` : "") + (highlight(seg) || "")).join("") || " " });
        box.innerHTML = parts.join("") + code + `<div class="j-bank">${ex.bank.map(w => `<button class="j-chipbtn" data-w="${esc(w)}"><code>${esc(w)}</code></button>`).join("")}</div>`;
        on(box, "[data-w]", "click", b => { if (state.locked) return; const i = state.fill.indexOf(null); if (i < 0) return; state.fill[i] = b.dataset.w; render(); });
        on(box, "[data-b]", "click", b => { if (state.locked) return; state.fill[+b.dataset.b] = null; render(); });
      };
      render();
      return { check() {
        if (state.fill.some(f => f == null)) return { ready: false };
        state.locked = true;
        const ok = state.fill.map((f, i) => f === ex.answers[i]);
        box.querySelectorAll("[data-b]").forEach(b => b.classList.add(ok[+b.dataset.b] ? "right" : "wrong"));
        return { ready: true, correct: ok.every(Boolean) };
      } };
    }
    case "orderLines": {
      const pool = shuffle([...ex.lines, ...(ex.distractors || [])].map((t, i) => ({ t, i })));
      state.picked = [];
      const render = () => {
        const used = new Set(state.picked.map(p => p.i));
        box.innerHTML = parts.join("") + `<div class="j-hint">Tap lines in order. Tap a placed line to take it back.</div>
          <div class="j-order">${state.picked.length ? state.picked.map((p, k) => `<button class="j-ol" data-k="${k}"><code>${esc(p.t)}</code></button>`).join("") : '<div class="j-empty">Your program</div>'}</div>
          <div class="j-pool">${pool.filter(p => !used.has(p.i)).map(p => `<button class="j-ol" data-p="${p.i}"><code>${esc(p.t.trim())}</code></button>`).join("")}</div>`;
        on(box, "[data-p]", "click", b => { if (state.locked) return; state.picked.push(pool.find(p => p.i === +b.dataset.p)); render(); });
        on(box, "[data-k]", "click", b => { if (state.locked) return; state.picked.splice(+b.dataset.k, 1); render(); });
      };
      render();
      return { check() {
        if (!state.picked.length) return { ready: false };
        state.locked = true;
        // Lines are shown without indentation, so two lines that read the same (like two "}") are interchangeable.
        const same = (k, t) => ex.lines[k] != null && t.trim() === ex.lines[k].trim();
        const correct = state.picked.length === ex.lines.length && state.picked.every((p, k) => same(k, p.t));
        box.querySelectorAll("[data-k]").forEach(b => b.classList.add(same(+b.dataset.k, state.picked[+b.dataset.k].t) ? "right" : "wrong"));
        if (!correct) box.insertAdjacentHTML("beforeend", `<div class="j-hint">Correct order:</div>${codeView(ex.lines.join("\n"))}`);
        return { ready: true, correct };
      } };
    }
  }
  box.innerHTML = parts.join("") + `<p class="j-sub">This exercise type isn't supported here.</p>`;
  return { check: () => ({ ready: true, correct: true }) };
}

// ---------- lesson player ----------
// Like the app's session: pages and exercises in order; a missed exercise comes back at the end until it is answered
// right. Back is always allowed (answered exercises show read-only). The session is saved after every step, so a
// lesson can be left and resumed. A first-try right answer can be marked "I guessed": review then treats it as a miss.
function lesson(body, u, l, resume) {
  const S = resume || { lessonId: l.id, items: l.steps.map((_, k) => [k, 0]), index: 0, results: {}, firstTry: {}, guessed: [] };
  const persist = () => { try { localStorage.setItem(PAUSE_KEY, JSON.stringify(S)); } catch (_) {} };
  persist();
  const exercises = l.steps.filter(st => st.type === "exercise"), pages = l.steps.length - exercises.length;
  let current = null, checked = false;
  body.innerHTML = `<div class="j-lhead"><div class="j-lrow"><button class="j-lback" id="j-lprev" aria-label="Previous step">‹</button>
      <div class="j-bar big"><i id="j-prog"></i></div><button class="j-mini" id="j-bm" aria-label="Bookmark">☆</button><button class="j-mini" id="j-nt" aria-label="Note">✎</button><span class="j-xpchip">⚡${todayXP()}</span></div>
      <div class="j-kicker">Unit ${u.info.number} · ${esc(l.title)}</div></div>
    <div class="j-card" id="j-step"></div><div class="j-notebox" id="j-notebox" hidden></div><div class="j-feedback" id="j-fb" hidden></div>
    <div class="j-actions"><button class="btn btn-primary j-wide" id="j-next">Continue</button></div>`;
  const step = $("#j-step"), fb = $("#j-fb"), nextBtn = $("#j-next");
  const savedUi = () => {
    const k = S.items[S.index][0], e = savedEntry(l, k) || {};
    $("#j-bm").textContent = e.bookmark ? "★" : "☆"; $("#j-bm").classList.toggle("on", !!e.bookmark);
    $("#j-nt").classList.toggle("on", !!e.note);
    $("#j-notebox").hidden = !e.note; $("#j-notebox").innerHTML = e.note ? `✎ ${esc(e.note)}` : "";
  };
  $("#j-bm").onclick = () => { const k = S.items[S.index][0]; updateSaved(l, k, { bookmark: !(savedEntry(l, k) || {}).bookmark }); savedUi(); };
  $("#j-nt").onclick = () => {
    const k = S.items[S.index][0], cur = (savedEntry(l, k) || {}).note || "";
    const note = prompt("Note for this step (empty to delete):", cur); if (note == null) return;
    updateSaved(l, k, { note: note.trim() }); savedUi();
  };
  const progress = () => {
    const passedPages = new Set(), doneEx = new Set();
    S.items.forEach(([k], idx) => { const st = l.steps[k]; if (st.type === "page" && idx < S.index) passedPages.add(k); if (st.type === "exercise" && S.results[idx]) doneEx.add(st.id); });
    return (passedPages.size + doneEx.size) / (pages + exercises.length || 1);
  };
  const feedback = (st, correct, idx) => {
    const canGuess = correct && !S.items[idx][1] && S.firstTry[st.id] === true;
    fb.className = "j-feedback " + (correct ? "ok" : "bad"); fb.hidden = false;
    fb.innerHTML = `<b>${correct ? "✓ Correct" : "✗ Not quite, it comes back at the end"}</b>${mdP(st.explanation)}
      ${canGuess ? `<button class="j-guess${S.guessed.includes(st.id) ? " on" : ""}" id="j-guess">🎲 I guessed</button>` : ""}`;
    const g = $("#j-guess");
    if (g) g.onclick = () => {
      const k = S.guessed.indexOf(st.id); k < 0 ? S.guessed.push(st.id) : S.guessed.splice(k, 1);
      g.classList.toggle("on", k < 0); persist();
    };
  };
  function render() {
    $("#j-prog").style.width = (progress() * 100) + "%";
    $("#j-lprev").style.visibility = S.index > 0 ? "visible" : "hidden";
    fb.hidden = true; checked = false; current = null; savedUi();
    const [k, retry] = S.items[S.index], st = l.steps[k], done = S.results[S.index];
    if (st.type === "page") {
      step.innerHTML = `<h3 class="j-pt">${esc(st.title)}</h3>${st.blocks.map(blockHtml).join("")}`;
      nextBtn.textContent = "Continue";
    } else if (done != null) {
      // Revisited after going back: read-only.
      step.innerHTML = `<div class="j-prompt">${md(st.prompt)}</div>${st.code ? codeView(st.code) : ""}`;
      feedback(st, done, S.index); checked = true; nextBtn.textContent = "Continue";
    } else {
      step.innerHTML = retry ? '<div class="j-retry">↻ Try this one again</div>' : "";
      const box = h("div"); step.appendChild(box);
      current = exercise(box, st); nextBtn.textContent = "Check";
    }
    $("#j-body").scrollTop = 0;
  }
  $("#j-lprev").onclick = () => { if (S.index > 0) { S.index--; persist(); render(); } };
  nextBtn.onclick = () => {
    const [k] = S.items[S.index], st = l.steps[k];
    if (current && !checked) {
      const r = current.check();
      if (!r.ready) { nextBtn.classList.add("shake"); setTimeout(() => nextBtn.classList.remove("shake"), 400); return; }
      checked = true;
      S.results[S.index] = r.correct;
      if (S.firstTry[st.id] == null) { S.firstTry[st.id] = r.correct; recordAnswer(st.objective, r.correct); save(); }
      if (!r.correct) S.items.push([k, 1]);
      persist();
      feedback(st, r.correct, S.index);
      nextBtn.textContent = "Continue";
      $("#j-prog").style.width = (progress() * 100) + "%";
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    S.index++; persist();
    if (S.index < S.items.length) return render();
    finish();
  };
  function finish() {
    try { localStorage.removeItem(PAUSE_KEY); } catch (_) {}
    const ids = Object.keys(S.firstTry), right = ids.filter(id => S.firstTry[id]).length, score = ids.length ? right / ids.length : 1;
    ids.forEach(id => reviewRecord(id, S.firstTry[id] && !S.guessed.includes(id)));
    const before = streak(), xp = completeLesson(l, score), after = streak(), nx = nextLesson();
    body.innerHTML = `<div class="j-done"><div class="j-big">${score >= 1 ? "🌟" : "🎉"}</div><h2 class="j-h">${score >= 1 ? "Perfect lesson!" : "Lesson complete"}</h2>
      <div class="j-stats"><div><b class="j-xpc">+${xp}</b><span>XP earned</span></div><div><b>${ids.length ? pct(score) : "—"}</b><span>first try</span></div><div><b>🔥 ${after}</b><span>day streak</span></div></div>
      ${after > before ? `<p class="j-sub">Daily goal reached. Your streak is now ${after} day${after === 1 ? "" : "s"}!</p>` : todayXP() < P.goal ? `<p class="j-sub">${P.goal - todayXP()} XP to today's goal.</p>` : ""}
      ${nx ? `<button class="btn btn-primary j-wide" id="j-nx">Next: ${esc(nx.l.title)}<small>Unit ${nx.u.info.number} · ${nx.l.minutes} min</small></button>` : ""}
      <button class="btn j-wide j-ghost" id="j-home">Done</button></div>`;
    if (nx) $("#j-nx").onclick = () => { stack.pop(); go(lesson, nx.u, nx.l); };
    $("#j-home").onclick = back;
  }
  render();
}
// ---------- review session ----------
// Up to 10 due exercises, each shown once (no repeats), 1 XP per right answer, then rescheduled.
function review(body) {
  const items = dueExercises().slice(0, REVIEW_SIZE);
  if (!items.length) return reviewEmpty(body);
  let i = 0, right = 0, current = null, checked = false, guessed = false;
  body.innerHTML = `<div class="j-lhead"><div class="j-lrow"><div class="j-bar big"><i id="j-prog"></i></div><span class="j-xpchip">🔁 ${items.length}</span></div>
    <div class="j-kicker" id="j-rk"></div></div><div class="j-card" id="j-step"></div><div class="j-feedback" id="j-fb" hidden></div>
    <div class="j-actions"><button class="btn btn-primary j-wide" id="j-next">Check</button></div>`;
  const step = $("#j-step"), fb = $("#j-fb"), nextBtn = $("#j-next");
  const render = () => {
    const it = items[i];
    $("#j-prog").style.width = (i / items.length * 100) + "%";
    $("#j-rk").textContent = `Review ${i + 1} of ${items.length} · Unit ${it.u.info.number} · ${it.l.title}`;
    fb.hidden = true; checked = false; guessed = false;
    step.innerHTML = ""; const box = h("div"); step.appendChild(box);
    current = exercise(box, it.ex); nextBtn.textContent = "Check";
    $("#j-body").scrollTop = 0;
  };
  nextBtn.onclick = () => {
    const it = items[i];
    if (!checked) {
      const r = current.check();
      if (!r.ready) { nextBtn.classList.add("shake"); setTimeout(() => nextBtn.classList.remove("shake"), 400); return; }
      checked = true; it.correct = r.correct;
      recordAnswer(it.ex.objective, r.correct);
      fb.className = "j-feedback " + (r.correct ? "ok" : "bad"); fb.hidden = false;
      fb.innerHTML = `<b>${r.correct ? "✓ Correct" : "✗ Not quite, it comes back tomorrow"}</b>${mdP(it.ex.explanation)}${r.correct ? '<button class="j-guess" id="j-guess">🎲 I guessed</button>' : ""}`;
      const g = $("#j-guess"); if (g) g.onclick = () => { guessed = !guessed; g.classList.toggle("on", guessed); };
      nextBtn.textContent = "Continue";
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    const ok = it.correct && !guessed;
    reviewRecord(it.ex.id, ok); if (it.correct) { right++; addXP(1); }
    if (++i < items.length) return render();
    const left = dueExercises().length;
    body.innerHTML = `<div class="j-done"><div class="j-big">🔁</div><h2 class="j-h">Review done</h2>
      <div class="j-stats"><div><b class="j-xpc">+${right}</b><span>XP earned</span></div><div><b>${right}/${items.length}</b><span>right</span></div><div><b>🔥 ${streak()}</b><span>day streak</span></div></div>
      ${left ? `<button class="btn btn-primary j-wide" id="j-more">Review ${Math.min(left, REVIEW_SIZE)} more<small>${left} still due</small></button>` : `<p class="j-sub">Nothing else is due today.</p>`}
      <button class="btn j-wide j-ghost" id="j-home">Done</button></div>`;
    const more = $("#j-more"); if (more) more.onclick = () => { stack.pop(); go(review); };
    $("#j-home").onclick = back;
  };
  render();
}
function reviewEmpty(body) {
  const nd = nextDue(), boxes = [1, 2, 3, 4, 5].map(b => Object.values(P.ex).filter(st => st.box === b).length);
  body.innerHTML = `<div class="j-done"><div class="j-big">✅</div><h2 class="j-h">Nothing to review</h2>
    <p class="j-sub">${Object.keys(P.ex).length ? `Next review ${nd ? new Date(nd).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }) : "later"}.` : "Exercises you answer in lessons come back here on a schedule."}</p></div>
    <h3 class="j-sec">Your exercises by box</h3><div class="j-boxes">${boxes.map((n, k) => `<div><b>${n}</b><span>box ${k + 1} · ${INTERVAL_DAYS[k]}d</span></div>`).join("")}</div>`;
}

// Opens a lesson, resuming it when it was left part-way.
function openLesson(u, l) {
  const p = pausedLesson();
  go(lesson, u, l, p && p.l.id === l.id ? p.state : null);
}

// ---------- mock exams ----------
const MOCK_KEY = "javaMockRun";
function mocks(body) {
  let run = null; try { run = JSON.parse(localStorage.getItem(MOCK_KEY) || "null"); } catch (_) {}
  body.innerHTML = `<h2 class="j-h">Mock exams</h2><p class="j-sub">Timed like the real exam (${C.catalog.exam.minutes} min for ${C.catalog.exam.questions} questions), pass at ${C.catalog.exam.passPercent}%.</p>
  ${run ? `<button class="btn btn-primary j-wide" id="j-resume">▶ Resume ${esc((C.mocks.find(m => m.setId === run.setId) || {}).title || "exam")}</button>` : ""}
  <div class="j-list">${C.mocks.map((m, i) => {
    const st = P.mocks[m.setId];
    return `<button class="j-lesson" data-m="${i}"><span class="j-check">📝</span><span class="j-ut"><b>${esc(m.title)}</b><small>${m.questions.length} questions · ${minutesFor(m)} min${m.credit ? ` · ${esc(m.credit)}` : ""}</small></span>
      <span class="j-cnt">${st ? `best <b class="${st.best >= C.catalog.exam.passPercent / 100 ? "ok" : "bad"}">${pct(st.best)}</b><br>${st.attempts}×` : ""}</span></button>`;
  }).join("")}</div>`;
  if (run) $("#j-resume").onclick = () => go(exam, C.mocks.find(m => m.setId === run.setId), run);
  on(body, "[data-m]", "click", b => {
    const m = C.mocks[+b.dataset.m];
    if (run && !confirm("Start a new exam? The unfinished one will be discarded.")) return;
    go(exam, m, null);
  });
}
const minutesFor = m => Math.round(C.catalog.exam.minutes * m.questions.length / C.catalog.exam.questions);

function exam(body, m, resume) {
  const run = resume || { setId: m.setId, order: shuffle(m.questions.map((_, i) => i)), answers: {}, flags: {}, idx: 0, endsAt: Date.now() + minutesFor(m) * 60000 };
  const persist = () => { try { localStorage.setItem(MOCK_KEY, JSON.stringify(run)); } catch (_) {} };
  persist();
  let timer = null;
  leaveGuard = () => { clearInterval(timer); return true; }; // the run is saved; it can be resumed from the list
  body.innerHTML = `<div class="j-ehead"><span id="j-qn"></span><span class="j-timer" id="j-time"></span><button class="j-flag" id="j-flag">⚑ Flag</button></div>
    <div class="j-card" id="j-q"></div>
    <div class="j-actions j-two"><button class="btn j-ghost" id="j-prev">‹ Prev</button><button class="btn btn-primary" id="j-nextq">Next ›</button></div>
    <div class="j-qgrid" id="j-grid"></div><button class="btn j-wide j-ghost" id="j-submit">Submit exam</button>`;
  const q = () => m.questions[run.order[run.idx]];
  function tick() {
    const left = Math.max(0, run.endsAt - Date.now()), mm = Math.floor(left / 60000), ss = Math.floor(left / 1000) % 60;
    const t = $("#j-time"); if (!t) return clearInterval(timer);
    t.textContent = `${mm}:${String(ss).padStart(2, "0")}`; t.classList.toggle("bad", left < 5 * 60000);
    if (left <= 0) finish();
  }
  function render() {
    const qq = q(), sel = new Set(run.answers[qq.id] || []), multi = qq.kind === "multiChoice";
    $("#j-qn").textContent = `Question ${run.idx + 1} of ${m.questions.length}`;
    $("#j-flag").classList.toggle("on", !!run.flags[qq.id]);
    $("#j-q").innerHTML = `<div class="j-prompt">${md(qq.prompt)}</div>${qq.code ? codeView(qq.code) : ""}${multi ? `<div class="j-hint">Choose ${qq.answers.length}.</div>` : ""}
      <div class="j-opts">${qq.options.map((o, i) => `<button class="j-opt${qq.codeOptions ? " code" : ""}${sel.has(i) ? " sel" : ""}" data-o="${i}">${multi ? '<span class="j-box"></span>' : `<span class="j-letter">${"ABCDEFGH"[i]}</span>`}${qq.codeOptions ? `<code>${esc(o)}</code>` : md(o)}</button>`).join("")}</div>`;
    on($("#j-q"), "[data-o]", "click", b => {
      const i = +b.dataset.o, cur = new Set(run.answers[qq.id] || []);
      if (multi) { cur.has(i) ? cur.delete(i) : cur.add(i); } else { cur.clear(); cur.add(i); }
      run.answers[qq.id] = [...cur]; persist(); render(); grid();
    });
    $("#j-prev").disabled = run.idx === 0;
    $("#j-nextq").textContent = run.idx === m.questions.length - 1 ? "Review ›" : "Next ›";
    body.scrollTop = 0;
  }
  function grid() {
    $("#j-grid").innerHTML = run.order.map((qi, k) => { const id = m.questions[qi].id;
      return `<button class="j-gq${(run.answers[id] || []).length ? " ans" : ""}${run.flags[id] ? " flag" : ""}${k === run.idx ? " cur" : ""}" data-k="${k}">${k + 1}</button>`; }).join("");
    on($("#j-grid"), "[data-k]", "click", b => { run.idx = +b.dataset.k; persist(); render(); grid(); });
  }
  function finish() {
    clearInterval(timer); leaveGuard = null;
    try { localStorage.removeItem(MOCK_KEY); } catch (_) {}
    const results = m.questions.map(qq => {
      const want = qq.kind === "multiChoice" ? qq.answers : [qq.answer], got = run.answers[qq.id] || [];
      const correct = want.length === got.length && want.every(i => got.includes(i));
      recordAnswer(qq.objective, correct);
      return { qq, got, want, correct };
    });
    const score = results.filter(r => r.correct).length / results.length;
    const st = P.mocks[m.setId] || { best: 0, attempts: 0 };
    P.mocks[m.setId] = { best: Math.max(st.best, score), last: score, attempts: st.attempts + 1, at: Date.now() }; save(); addXP(MOCK_XP);
    stack.pop(); go(examResult, m, results, score);
  }
  $("#j-flag").onclick = () => { const id = q().id; run.flags[id] = !run.flags[id]; persist(); render(); grid(); };
  $("#j-prev").onclick = () => { run.idx--; persist(); render(); grid(); };
  $("#j-nextq").onclick = () => { if (run.idx < m.questions.length - 1) { run.idx++; persist(); render(); grid(); } else $("#j-grid").scrollIntoView({ behavior: "smooth" }); };
  $("#j-submit").onclick = () => {
    const left = m.questions.filter(qq => !(run.answers[qq.id] || []).length).length;
    if (confirm(left ? `${left} question${left > 1 ? "s are" : " is"} unanswered. Submit anyway?` : "Submit the exam?")) finish();
  };
  render(); grid(); tick(); timer = setInterval(tick, 1000);
}

function examResult(body, m, results, score) {
  const pass = score >= C.catalog.exam.passPercent / 100;
  const byObj = {};
  results.forEach(r => { const o = byObj[r.qq.objective] || (byObj[r.qq.objective] = { right: 0, total: 0 }); o.total++; if (r.correct) o.right++; });
  body.innerHTML = `<div class="j-done"><div class="j-big">${pass ? "✅" : "📚"}</div><h2 class="j-h">${pct(score)} · ${pass ? "Pass" : "Not yet"}</h2>
    <p class="j-sub">${results.filter(r => r.correct).length} of ${results.length} right. Pass mark ${C.catalog.exam.passPercent}%.</p></div>
    <h3 class="j-sec">By objective</h3><div class="j-list">${Object.entries(byObj).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })).map(([id, o]) =>
      `<div class="j-row"><span>${esc(id)} · ${esc((C.objectives[id] || {}).title || "")}</span><b class="${o.right / o.total >= 0.68 ? "ok" : "bad"}">${o.right}/${o.total}</b></div>`).join("")}</div>
    <h3 class="j-sec">Review <label class="j-onlywrong"><input type="checkbox" id="j-ow" checked> only mistakes</label></h3><div id="j-rev"></div>`;
  const rev = () => {
    const only = $("#j-ow").checked;
    $("#j-rev").innerHTML = results.map((r, k) => only && r.correct ? "" : `<div class="j-card j-revq ${r.correct ? "ok" : "bad"}">
      <div class="j-kicker">Q${k + 1} · ${r.correct ? "✓ right" : "✗ wrong"} · Obj ${esc(r.qq.objective)}</div><div class="j-prompt">${md(r.qq.prompt)}</div>${r.qq.code ? codeView(r.qq.code) : ""}
      <div class="j-opts">${r.qq.options.map((o, i) => `<div class="j-opt${r.qq.codeOptions ? " code" : ""}${r.want.includes(i) ? " right" : ""}${r.got.includes(i) && !r.want.includes(i) ? " wrong" : ""}">${r.qq.codeOptions ? `<code>${esc(o)}</code>` : md(o)}</div>`).join("")}</div>
      <div class="j-feedback">${mdP(r.qq.explanation)}</div></div>`).join("") || '<p class="j-sub">No mistakes. 🎉</p>';
  };
  $("#j-ow").onchange = rev; rev();
}

// ---------- drills: fix the bug, write it ----------
// A round is 5 items: never tried first, then the ones last answered wrong, then the oldest.
function pickRound(items, mode) {
  const st = P.drills[mode];
  const rank = it => { const s = st[it.id]; return !s ? 0 : !s.ok ? 1 : 2; };
  return shuffle(items).sort((a, b) => rank(a) - rank(b) || ((st[a.id] || {}).at || 0) - ((st[b.id] || {}).at || 0)).slice(0, ROUND);
}
function drillMenu(body, mode) {
  const items = mode === "fixbug" ? C.fixbug : C.write, st = P.drills[mode];
  const tried = items.filter(i => st[i.id]).length, right = items.filter(i => st[i.id] && st[i.id].ok).length;
  const title = mode === "fixbug" ? "🐞 Fix the bug" : "⌨️ Write it";
  const sub = mode === "fixbug" ? "Spot the faulty line, then pick the fix that makes the program work." : "Type Java from memory. Checked token by token: spacing and indentation don't matter.";
  body.innerHTML = `<h2 class="j-h">${title}</h2><p class="j-sub">${sub}</p>
    <div class="j-stats"><div><b>${tried}/${items.length}</b><span>tried</span></div><div><b>${right}</b><span>last right</span></div></div>
    <button class="btn btn-primary j-wide" id="j-round">▶ Play a round of ${ROUND}</button>
    <h3 class="j-sec">By unit</h3><div class="j-list">${C.units.map(u => {
      const its = items.filter(i => i.unit === u.info.id); if (!its.length) return "";
      return `<button class="j-lesson" data-u="${u.info.id}"><span class="j-check">${u.info.number}</span><span class="j-ut"><b>${esc(u.info.title)}</b><small>${its.filter(i => st[i.id] && st[i.id].ok).length} of ${its.length} right</small></span></button>`;
    }).join("")}</div>`;
  $("#j-round").onclick = () => go(drillRound, mode, pickRound(items, mode));
  on(body, "[data-u]", "click", b => go(drillRound, mode, pickRound(items.filter(i => i.unit === b.dataset.u), mode)));
}
function drillRound(body, mode, items) {
  let k = 0, score = 0;
  const next = () => {
    if (k >= items.length) {
      body.innerHTML = `<div class="j-done"><div class="j-big">${score === items.length ? "🏆" : "💪"}</div><h2 class="j-h">${score} of ${items.length}</h2>
        <button class="btn btn-primary j-wide" id="j-again">Another round</button><button class="btn j-wide j-ghost" id="j-back2">Done</button></div>`;
      $("#j-again").onclick = () => { stack.pop(); go(drillRound, mode, pickRound(mode === "fixbug" ? C.fixbug : C.write, mode)); };
      $("#j-back2").onclick = back;
      return;
    }
    const it = items[k], done = ok => { P.drills[mode][it.id] = { ok, at: Date.now() }; recordAnswer(it.objective, ok); save(); if (ok) { score++; addXP(mode === "write" ? 2 : 1); } k++; };
    body.innerHTML = `<div class="j-kicker">${mode === "fixbug" ? "Fix the bug" : "Write it"} · ${k + 1} of ${items.length} · Obj ${esc(it.objective)}</div><div id="j-dr"></div>`;
    (mode === "fixbug" ? fixBugCard : writeCard)($("#j-dr"), it, ok => { done(ok); }, next);
    body.scrollTop = 0;
  };
  next();
}
function fixBugCard(box, it, record, next) {
  let phase = "find", tapped = null, lineRight = false;
  const order = shuffle(it.options.map((_, i) => i));
  const files = it.files ? Object.entries(it.files).map(([name, code]) => `<details class="j-file"><summary>${esc(name)}</summary>${codeView(code)}</details>`).join("") : "";
  const render = () => {
    const lineClass = n => phase === "find" ? (n === tapped ? "sel" : "") : n === it.bugLine ? (lineRight ? "right" : "sel") : n === tapped ? "wrong" : "";
    box.innerHTML = `<h2 class="j-h">${esc(it.title)}</h2>
      <div class="j-goal"><div class="j-kicker">Goal</div>${mdP(it.goal)}<div class="j-hint">Expected output</div>${outputBox(it.output)}</div>
      ${it.context ? `<p class="j-sub">ℹ️ ${md(it.context)}</p>` : ""}${files}
      ${phase !== "find" ? `<p class="j-sym">⚠️ Right now: ${outcomeText(it.symptom)}</p>` : `<button class="j-link" id="j-sym">👁 Show what goes wrong</button>`}
      ${phase === "find" ? `<div class="j-hint">Tap the line with the bug.</div>` : ""}
      ${codeView(it.code, { tappable: phase === "find", lineClass })}
      ${!it.mainModule ? `<p class="j-foot">Imports are assumed, as on the exam.</p>` : ""}
      ${phase !== "find" ? `<div class="j-feedback ${lineRight ? "ok" : "bad"}">${lineRight ? "✓ Right line." : `✗ The bug is on line ${it.bugLine}.`} Now pick the fix for line ${it.bugLine}:</div>
        <div class="j-opts">${order.map(i => `<button class="j-opt code" data-f="${i}"><code>${esc(it.options[i])}</code>${phase === "done" ? `<small>${outcomeText(it.outcomes[i])}</small>` : ""}</button>`).join("")}</div>` : ""}
      <div id="j-rev2"></div>
      <div class="j-actions"><button class="btn btn-primary j-wide" id="j-go">${phase === "find" ? "Check line" : phase === "fix" ? "Pick a fix" : "Next"}</button></div>`;
    const sym = $("#j-sym"); if (sym) sym.onclick = () => { sym.outerHTML = `<p class="j-sym">⚠️ Right now: ${outcomeText(it.symptom)}</p>`; };
    on(box, "[data-line]", "click", l => { tapped = +l.dataset.line; render(); });
    on(box, "[data-f]", "click", b => {
      if (phase !== "fix") return;
      const pick = +b.dataset.f, ok = lineRight && pick === it.answer;
      phase = "done"; record(ok); render();
      box.querySelectorAll("[data-f]").forEach(x => { const i = +x.dataset.f; x.classList.toggle("right", i === it.answer); x.classList.toggle("wrong", i === pick && i !== it.answer); });
      $("#j-rev2").innerHTML = `<div class="j-feedback ${ok ? "ok" : "bad"}"><b>${ok ? "✓ Fixed" : "✗ Not this time"}</b>${mdP(it.explanation)}</div>`;
      $("#j-rev2").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    $("#j-go").onclick = () => {
      if (phase === "find") { if (!tapped) return; lineRight = tapped === it.bugLine; phase = "fix"; render(); }
      else if (phase === "done") next();
    };
  };
  render();
}

// Tokenizer and matcher ported from the app (JavaDrills.swift): code is compared token by token, comments and
// whitespace ignored, text blocks normalised, and "renameable" identifiers may be renamed consistently.
const OPS = ["...", "->", "::", "++", "--", "&&", "||", "==", "!=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^="];
function tokenize(src) {
  const s = src.replace(/[“”]/g, '"').replace(/[‘’]/g, "'"), n = s.length, out = [];
  const idStart = c => /[\p{L}_$]/u.test(c), idPart = c => /[\p{L}\p{N}_$]/u.test(c), dig = c => c != null && /[0-9]/.test(c);
  let i = 0;
  while (i < n) {
    const c = s[i];
    if (/\s/.test(c)) i++;
    else if (c === "/" && s[i + 1] === "/") { while (i < n && s[i] !== "\n") i++; }
    else if (c === "/" && s[i + 1] === "*") { const j = s.indexOf("*/", i + 2); i = j < 0 ? n : j + 2; }
    else if (s.startsWith('"""', i)) {
      let j = i + 3, end = n;
      while (j < n) { if (s[j] === "\\") { j += 2; continue; } if (s.startsWith('"""', j)) { end = j + 3; break; } j++; }
      out.push({ k: "str", t: normTextBlock(s.slice(i, end)) }); i = end;
    } else if (c === '"' || c === "'") {
      let j = i + 1; while (j < n && s[j] !== c && s[j] !== "\n") j += s[j] === "\\" ? 2 : 1;
      const end = j < n && s[j] === c ? j + 1 : Math.min(j, n); out.push({ k: "str", t: s.slice(i, end) }); i = end;
    } else if (dig(c) || (c === "." && dig(s[i + 1]))) {
      const hex = c === "0" && /[xX]/.test(s[i + 1] || ""); let j = i + 1;
      while (j < n) { const d = s[j], p = s[j - 1]; if (/[A-Za-z0-9_.]/.test(d)) j++; else if ((d === "+" || d === "-") && (hex ? /[pP]/.test(p) : /[eE]/.test(p))) j++; else break; }
      out.push({ k: "num", t: s.slice(i, j) }); i = j;
    } else if (idStart(c)) {
      let j = i + 1; while (j < n && idPart(s[j])) j++;
      const w = s.slice(i, j); out.push({ k: KEYWORDS.has(w) ? "kw" : "id", t: w }); i = j;
    } else { const op = OPS.find(o => s.startsWith(o, i)) || c; out.push({ k: "p", t: op }); i += op.length; }
  }
  return out;
}
function normTextBlock(raw) {
  const q = '"""', u = raw.replace(/\r\n/g, "\n");
  let inner = u.slice(3); if (u.length >= 6 && u.endsWith(q)) inner = inner.slice(0, -3);
  const nl = inner.indexOf("\n"); if (nl < 0) return raw;
  const lines = inner.slice(nl + 1).split("\n"), blank = l => /^[ \t]*$/.test(l);
  const sig = lines.slice(0, -1).filter(l => !blank(l)); sig.push(lines[lines.length - 1]);
  const indent = Math.min(...sig.map(l => l.match(/^[ \t]*/)[0].length));
  return q + "\n" + lines.map(l => blank(l) ? "" : l.slice(indent).replace(/[ \t]+$/, "")).join("\n") + q;
}
function matchCount(learner, sol, renameable) {
  const fixed = new Set(sol.filter(t => t.k === "id" && !renameable.has(t.t)).map(t => t.t)), fwd = {}, bwd = {};
  let i = 0;
  for (; i < learner.length && i < sol.length; i++) {
    const a = learner[i], b = sol[i];
    if (b.k === "id" && renameable.has(b.t)) {
      if (a.k !== "id") break;
      if (fwd[b.t] != null) { if (fwd[b.t] !== a.t) break; }
      else { if (bwd[a.t] != null || fixed.has(a.t)) break; fwd[b.t] = a.t; bwd[a.t] = b.t; }
    } else if (a.t !== b.t) break;
  }
  return i;
}
function matchCode(src, solutions, renameable) {
  const learner = tokenize(src); let best = null;
  solutions.forEach((sol, idx) => {
    const exp = tokenize(sol), cnt = matchCount(learner, exp, new Set(renameable || []));
    const m = { learner, exp, idx, cnt, ok: cnt === learner.length && cnt === exp.length };
    if (!best || m.ok && !best.ok || (!best.ok && cnt > best.cnt)) best = m;
  });
  return best;
}
function writeCard(box, it, record, next) {
  let tries = 0, finished = false;
  const files = it.files ? Object.entries(it.files).map(([name, code]) => `<details class="j-file"><summary>${esc(name)}</summary>${codeView(code)}</details>`).join("") : "";
  box.innerHTML = `<h2 class="j-h">${esc(it.title)}</h2><div class="j-prompt">${md(it.prompt)}</div>${files}
    ${it.hint ? `<details class="j-file"><summary>Hint</summary>${mdP(it.hint)}</details>` : ""}
    <textarea class="j-code" id="j-src" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" rows="7" placeholder="${it.shell ? "Type the command" : "Type your Java here"}"></textarea>
    <div id="j-wfb"></div>
    <div class="j-actions j-two"><button class="btn j-ghost" id="j-show">Show answer</button><button class="btn btn-primary" id="j-chk">Check</button></div>`;
  const src = $("#j-src"), fb = $("#j-wfb");
  // Tab inserts spaces instead of leaving the box.
  src.addEventListener("keydown", e => { if (e.key === "Tab") { e.preventDefault(); src.setRangeText("    ", src.selectionStart, src.selectionEnd, "end"); } });
  // matched: the learner's code is right now; it only counts as right when it was right on the first try.
  const reveal = matched => {
    finished = true; record(matched && tries === 0);
    const ok = matched;
    fb.innerHTML = `<div class="j-feedback ${ok ? "ok" : "bad"}"><b>${ok ? tries ? "✓ Matches (on a later try)" : "✓ Matches" : "Answer"}</b>${ok ? "" : codeView(it.solutions[0])}${mdP(it.explanation)}${it.output ? `<div class="j-hint">It prints</div>${outputBox(it.output)}` : ""}</div>`;
    $("#j-chk").textContent = "Next"; $("#j-show").hidden = true;
  };
  $("#j-chk").onclick = () => {
    if (finished) return next();
    if (!src.value.trim()) return;
    const m = matchCode(src.value, it.solutions, it.renameable);
    if (m.ok) return reveal(true);
    tries++;
    const found = m.learner[m.cnt], want = m.exp[m.cnt];
    fb.innerHTML = `<div class="j-feedback bad">✗ ${m.cnt} token${m.cnt === 1 ? "" : "s"} match, then ${found ? `you have <code>${esc(found.t)}</code>` : "your code stops"}${want ? ` where <code>${esc(want.t)}</code> fits` : " but the answer already ended"}. Try again${tries >= 2 ? " or show the answer" : ""}.</div>`;
  };
  $("#j-show").onclick = () => reveal(false);
}

// ---------- drills: trace it ----------
function traceMenu(body) {
  const st = P.drills.trace;
  body.innerHTML = `<h2 class="j-h">🔍 Trace it</h2><p class="j-sub">Step through a program like a debugger. At checkpoints, predict the value before it's revealed.</p>
    <div class="j-list">${C.trace.map((p, i) => `<button class="j-lesson${st[p.id] ? " done" : ""}" data-t="${i}"><span class="j-check">${st[p.id] ? (st[p.id].ok ? "✓" : "•") : p.unit}</span>
      <span class="j-ut"><b>${esc(p.title)}</b><small>Unit ${p.unit} · Obj ${esc(p.objective)} · ${p.checkpoints.length} checkpoint${p.checkpoints.length === 1 ? "" : "s"}</small></span></button>`).join("")}</div>`;
  on(body, "[data-t]", "click", b => go(trace, C.trace[+b.dataset.t]));
}
function trace(body, p) {
  let s = -1, right = 0; // -1: before the first line runs
  const asked = {};
  body.innerHTML = `<h2 class="j-h">${esc(p.title)}</h2><div id="j-tc"></div><div class="j-tstate" id="j-ts"></div><div id="j-tq"></div>
    <div class="j-actions j-two"><button class="btn j-ghost" id="j-tb">‹ Back</button><button class="btn btn-primary" id="j-tn">Run first line ›</button></div>`;
  const render = () => {
    const st = p.steps[s], cp = p.checkpoints.find(c => c.step === s + 1);
    $("#j-tc").innerHTML = codeView(p.code, { lineClass: n => st && n === st.line ? "cur" : "" });
    $("#j-ts").innerHTML = st ? `<div class="j-kicker">Step ${s + 1} of ${p.steps.length} · line ${st.line} ran${st.frame ? ` · ${esc(st.frame)}` : ""}</div>
      <table class="j-vars"><tbody>${p.watch.filter(v => st.vars[v] != null).map(v => `<tr><td><code>${esc(v)}</code></td><td><code>${esc(st.vars[v])}</code></td></tr>`).join("") || '<tr><td colspan="2" class="j-sub">No variables yet</td></tr>'}</tbody></table>
      ${st.note ? `<p class="j-note">💬 ${md(st.note)}</p>` : ""}<div class="j-hint">Output so far</div>${outputBox(st.output)}` : `<p class="j-sub">Nothing has run yet.</p>`;
    $("#j-tb").disabled = s < 0;
    $("#j-tn").textContent = s + 1 >= p.steps.length ? "Finish" : cp && !asked[cp.step] ? "Predict ›" : "Next line ›";
    $("#j-tq").innerHTML = "";
  };
  const ask = cp => {
    $("#j-tq").innerHTML = `<div class="j-card j-cp"><div class="j-kicker">Checkpoint</div><div class="j-prompt">${md(cp.question)}</div>
      <div class="j-opts">${cp.options.map((o, i) => `<button class="j-opt code" data-c="${i}"><code>${esc(o)}</code></button>`).join("")}</div></div>`;
    $("#j-tq").scrollIntoView({ behavior: "smooth", block: "nearest" });
    on($("#j-tq"), "[data-c]", "click", b => {
      if (asked[cp.step] != null) return;
      const ok = +b.dataset.c === cp.answer; asked[cp.step] = ok; if (ok) { right++; addXP(1); }
      recordAnswer(p.objective, ok); save();
      $("#j-tq").querySelectorAll("[data-c]").forEach(x => { const i = +x.dataset.c; x.classList.toggle("right", i === cp.answer); x.classList.toggle("wrong", i === +b.dataset.c && !ok); });
      $("#j-tn").textContent = "Reveal ›";
    });
  };
  $("#j-tn").onclick = () => {
    if (s + 1 >= p.steps.length) {
      const ok = right === p.checkpoints.length;
      P.drills.trace[p.id] = { ok, at: Date.now() }; save();
      body.innerHTML = `<div class="j-done"><div class="j-big">${ok ? "🏆" : "🔍"}</div><h2 class="j-h">${right} of ${p.checkpoints.length} predicted</h2>
        <div class="j-hint">The program prints</div>${outputBox(p.finalOutput)}${p.takeaway ? `<div class="j-feedback ok">${mdP(p.takeaway)}</div>` : ""}
        <button class="btn btn-primary j-wide" id="j-tback">Done</button></div>`;
      $("#j-tback").onclick = back; return;
    }
    const cp = p.checkpoints.find(c => c.step === s + 1);
    if (cp && asked[cp.step] == null) { if (!$("#j-tq").innerHTML) ask(cp); return; }
    s++; render();
  };
  $("#j-tb").onclick = () => { s--; render(); };
  render();
}

// ---------- tips and readiness ----------
function tips(body) {
  let kind = "all";
  const render = () => {
    const groups = {};
    C.tips.filter(t => kind === "all" || t.kind === kind).forEach(t => (groups[t.objective] = groups[t.objective] || []).push(t));
    body.innerHTML = `<h2 class="j-h">💡 Tips &amp; traps</h2><div class="j-seg">${["all", "trap", "tip", "exam"].map(k => `<button data-k="${k}" class="${k === kind ? "on" : ""}">${{ all: "All", trap: "⚠️ Traps", tip: "💡 Tips", exam: "🎯 Exam" }[k]}</button>`).join("")}</div>
      ${Object.keys(groups).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(id => `<h3 class="j-sec">${esc(id)} · ${esc((C.objectives[id] || {}).title || "")}</h3>
        ${groups[id].map(t => `<div class="j-call j-call-${esc(t.kind)}"><div class="j-call-t">${{ trap: "⚠️", tip: "💡", exam: "🎯" }[t.kind] || "ℹ️"} ${esc(t.title)}</div>${mdP(t.text)}</div>`).join("")}`).join("")}`;
    on(body, "[data-k]", "click", b => { kind = b.dataset.k; render(); });
  };
  render();
}
function readinessView(body) {
  const r = readiness();
  body.innerHTML = `<h2 class="j-h">🎯 Readiness</h2><p class="j-sub">Share of questions answered right per exam objective, across lessons, mock exams and drills. Aim for ${C.catalog.exam.passPercent}% or more everywhere.</p>
    <div class="j-stats"><div><b>${r.total ? pct(r.score) : "—"}</b><span>overall</span></div><div><b>${r.total}</b><span>answers</span></div></div>
    <div class="j-list">${C.catalog.objectives.map(o => { const a = P.answers[o.id], s = objScore(o.id);
      return `<div class="j-row j-rrow"><span>${esc(o.id)} · ${esc(o.title)}<span class="j-bar"><i class="${s == null ? "" : s >= 0.68 ? "ok" : "bad"}" style="width:${s == null ? 0 : s * 100}%"></i></span></span><b class="${s == null ? "" : s >= 0.68 ? "ok" : "bad"}">${s == null ? "—" : `${pct(s)}<small> ${a.right}/${a.total}</small>`}</b></div>`; }).join("")}</div>
    <button class="btn j-wide j-ghost" id="j-reset">Reset all Java progress</button>`;
  $("#j-reset").onclick = () => {
    if (!confirm("Erase all lesson, exam and drill progress for the Java course?")) return;
    P = { lessons: {}, answers: {}, mocks: {}, drills: { fixbug: {}, write: {}, trace: {} }, xpByDay: {}, goalMet: [], goal: P.goal, ex: {} }; save();
    try { localStorage.removeItem(MOCK_KEY); localStorage.removeItem(PAUSE_KEY); } catch (_) {}
    stack.length = 0; go(home);
  };
}

// ---------- entry ----------
let started = false;
window.javaInit = async function () {
  if (started) { if (stack.length === 1) show(); return; } // refresh home numbers when coming back
  started = true;
  $("#j-back").onclick = back;
  $("#j-body").innerHTML = '<p class="j-sub">Loading the course…</p>';
  try { C = await loadContent(); }
  catch (e) { started = false; $("#j-body").innerHTML = `<p class="j-sub">Couldn't load the course: ${esc(e.message)}. Check your connection and open the tab again.</p>`; return; }
  go(home);
};
})();
