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
function nextLesson() {
  for (const u of C.units) for (const l of u.lessons) if (!lessonDone(l)) return { u, l };
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
  body.innerHTML = `
  <div class="j-hero">
    <div class="j-kicker">${esc(ex.code)}</div>
    <h2 class="j-h">${esc(ex.title)}</h2>
    <div class="j-meta">${ex.questions} questions · ${ex.minutes} min · pass ${ex.passPercent}%</div>
    <div class="j-stats">
      <div><b>${r.total ? pct(r.score) : "—"}</b><span>readiness</span></div>
      <div><b>${r.covered}/${r.of}</b><span>objectives tried</span></div>
      <div><b>${done}/${all}</b><span>lessons</span></div>
    </div>
    ${next ? `<button class="btn btn-primary j-wide" id="j-cont">▶ ${done ? "Continue" : "Start"}: ${esc(next.l.title)}<small>Unit ${next.u.info.number} · ${next.l.minutes} min</small></button>` : `<p class="j-sub">Every lesson is done. Keep sharp with mock exams and drills.</p>`}
  </div>
  ${weak.length ? `<h3 class="j-sec">Weakest objectives</h3><div class="j-list">${weak.map(x => `<div class="j-row"><span>${esc(x.o.id)} · ${esc(x.o.title)}</span><b class="${x.s >= 0.68 ? "ok" : "bad"}">${pct(x.s)}</b></div>`).join("")}</div>` : ""}
  <h3 class="j-sec">Practice</h3>
  <div class="j-grid">
    <button class="j-tile" data-go="mocks">📝<b>Mock exams</b><small>${C.mocks.length} sets, timed</small></button>
    <button class="j-tile" data-go="fixbug">🐞<b>Fix the bug</b><small>${C.fixbug.length} programs</small></button>
    <button class="j-tile" data-go="write">⌨️<b>Write it</b><small>${C.write.length} from memory</small></button>
    <button class="j-tile" data-go="trace">🔍<b>Trace it</b><small>${C.trace.length} step by step</small></button>
    <button class="j-tile" data-go="tips">💡<b>Tips &amp; traps</b><small>${C.tips.length} short notes</small></button>
    <button class="j-tile" data-go="ready">🎯<b>Readiness</b><small>by objective</small></button>
  </div>
  <h3 class="j-sec">Units</h3>
  <div class="j-list">${C.units.map((u, i) => {
    const d = u.lessons.filter(lessonDone).length;
    return `<button class="j-unit" data-unit="${i}"><span class="j-num">${u.info.number}</span><span class="j-ut"><b>${esc(u.info.title)}</b><small>${esc(u.info.summary)}</small>
      <span class="j-bar"><i style="width:${u.lessons.length ? (d / u.lessons.length * 100) : 0}%"></i></span></span><span class="j-cnt">${d}/${u.lessons.length}</span></button>`;
  }).join("")}</div>
  <p class="j-foot">Content from the vocab app. The community quiz is from <a href="https://github.com/Anasss/java21docCards" target="_blank" rel="noopener">java21docCards</a> (MIT, see <a href="java/THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener">notices</a>).</p>`;
  const cont = $("#j-cont"); if (cont) cont.onclick = () => go(lesson, next.u, next.l);
  on(body, "[data-unit]", "click", b => go(unit, C.units[+b.dataset.unit]));
  const views = { mocks, fixbug: drillMenu, write: drillMenu, trace: traceMenu, tips, ready: readinessView };
  on(body, "[data-go]", "click", b => go(views[b.dataset.go], b.dataset.go));
}

// ---------- unit ----------
function unit(body, u) {
  body.innerHTML = `<div class="j-kicker">Unit ${u.info.number}</div><h2 class="j-h">${esc(u.info.title)}</h2>
  <p class="j-sub">${esc(u.info.summary)}</p>
  <div class="j-chips">${u.info.objectives.map(id => `<span class="j-chip" title="${esc((C.objectives[id] || {}).title)}">Obj ${esc(id)}${objScore(id) != null ? " · " + pct(objScore(id)) : ""}</span>`).join("")}</div>
  <div class="j-list">${u.lessons.map((l, i) => {
    const st = P.lessons[l.id];
    return `<button class="j-lesson${st && st.done ? " done" : ""}" data-i="${i}"><span class="j-check">${st && st.done ? "✓" : i + 1}</span>
      <span class="j-ut"><b>${esc(l.title)}</b><small>${esc(l.summary)}</small></span>
      <span class="j-cnt">${l.minutes} min${st && st.best != null ? `<br>best ${pct(st.best)}` : ""}</span></button>`;
  }).join("")}</div>`;
  on(body, "[data-i]", "click", b => go(lesson, u, u.lessons[+b.dataset.i]));
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
function lesson(body, u, l) {
  // Exercises answered wrong come back once at the end, like the app's session.
  const queue = l.steps.map(s => ({ s, retry: false }));
  let i = 0, firstTry = {}, current = null, checked = false;
  const exCount = l.steps.filter(s => s.type === "exercise").length;
  body.innerHTML = `<div class="j-lhead"><div class="j-kicker">Unit ${u.info.number} · ${esc(l.title)}</div><div class="j-bar big"><i id="j-prog"></i></div></div>
    <div class="j-card" id="j-step"></div><div class="j-feedback" id="j-fb" hidden></div>
    <div class="j-actions"><button class="btn btn-primary j-wide" id="j-next">Continue</button></div>`;
  const step = $("#j-step"), fb = $("#j-fb"), nextBtn = $("#j-next");
  function render() {
    $("#j-prog").style.width = (i / queue.length * 100) + "%";
    fb.hidden = true; checked = false;
    const { s, retry } = queue[i];
    if (s.type === "page") {
      step.innerHTML = `<h3 class="j-pt">${esc(s.title)}</h3>${s.blocks.map(blockHtml).join("")}`;
      current = null; nextBtn.textContent = "Continue";
    } else {
      step.innerHTML = retry ? '<div class="j-retry">↻ Try this one again</div>' : "";
      const box = h("div"); step.appendChild(box);
      current = exercise(box, s); nextBtn.textContent = "Check";
    }
    body.scrollTop = 0;
  }
  nextBtn.onclick = () => {
    const { s, retry } = queue[i];
    if (current && !checked) {
      const r = current.check();
      if (!r.ready) { nextBtn.classList.add("shake"); setTimeout(() => nextBtn.classList.remove("shake"), 400); return; }
      checked = true;
      if (!retry) { firstTry[s.id] = r.correct; recordAnswer(s.objective, r.correct); save(); }
      if (!r.correct && !retry) queue.push({ s, retry: true });
      fb.className = "j-feedback " + (r.correct ? "ok" : "bad"); fb.hidden = false;
      fb.innerHTML = `<b>${r.correct ? "✓ Correct" : "✗ Not quite"}</b>${mdP(s.explanation)}`;
      nextBtn.textContent = "Continue";
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    i++;
    if (i < queue.length) return render();
    // Done: score is the share of exercises right on the first try.
    const right = Object.values(firstTry).filter(Boolean).length, score = exCount ? right / exCount : 1;
    const st = P.lessons[l.id] || {};
    P.lessons[l.id] = { done: true, best: Math.max(st.best ?? 0, score), at: Date.now() }; save();
    const nx = nextLesson();
    body.innerHTML = `<div class="j-done"><div class="j-big">🎉</div><h2 class="j-h">${esc(l.title)} done</h2>
      <p class="j-sub">${exCount ? `${right} of ${exCount} right on the first try (${pct(score)}).` : "Lesson read."}</p>
      ${nx ? `<button class="btn btn-primary j-wide" id="j-nx">Next: ${esc(nx.l.title)}</button>` : ""}
      <button class="btn j-wide j-ghost" id="j-home">Back to unit</button></div>`;
    if (nx) $("#j-nx").onclick = () => { stack.pop(); go(lesson, nx.u, nx.l); };
    $("#j-home").onclick = back;
  };
  render();
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
    P.mocks[m.setId] = { best: Math.max(st.best, score), last: score, attempts: st.attempts + 1, at: Date.now() }; save();
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
    const it = items[k], done = ok => { P.drills[mode][it.id] = { ok, at: Date.now() }; recordAnswer(it.objective, ok); save(); if (ok) score++; k++; };
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
      const ok = +b.dataset.c === cp.answer; asked[cp.step] = ok; if (ok) right++;
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
    P = { lessons: {}, answers: {}, mocks: {}, drills: { fixbug: {}, write: {}, trace: {} } }; save();
    try { localStorage.removeItem(MOCK_KEY); } catch (_) {}
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
