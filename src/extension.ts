import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {

  const lastReminder = context.globalState.get<string>("typerefine-reminder");
  const today = new Date().toDateString();

  if (lastReminder !== today) {
    setTimeout(() => {
      vscode.window.showInformationMessage(
        "⌨️ TypeRefine: 5 minutes today keeps your speed sharp."
      );
      context.globalState.update("typerefine-reminder", today);
    }, 3000);
  }

  const disposable = vscode.commands.registerCommand(
    "typerefine.start",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "typerefine",
        "TypeRefine",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = getWebviewContent();
    }
  );

  context.subscriptions.push(disposable);
}


function getWebviewContent(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>TypeRefine</title>

<style>

:root {
  --key: 46px;
  --gap: 6px;
  --radius: 6px;
}

body {
  margin: 0;
  height: 100vh;
  background: #1e1e1e;
  font-family: system-ui;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.practice {
  margin-bottom: 24px;
  font-size: 24px;
  letter-spacing: 1px;
  font-weight: 500;
  text-align: center;
  max-width: 800px;
}

.practice span { opacity: 0.5; }
.practice .current { text-decoration: underline; opacity: 1; }
.practice .done { color: #4caf50; opacity: 1; }
.practice .error { color: #d9534f; opacity: 1; }

.keyboard {
  background: #252526;
  padding: 20px;
  border-radius: 14px;
}

.row {
  display: grid;
  grid-template-columns: repeat(15, var(--key));
  gap: var(--gap);
  margin-bottom: var(--gap);
}

.key {
  height: var(--key);
  background: #2f3b33;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cce6d0;
  font-size: 14px;
  user-select: none;
  transition: background 40ms linear, transform 40ms linear, box-shadow 40ms linear;
}

.key.active {
  background: #4caf50;
  box-shadow: 0 0 0 2px rgba(76,175,80,0.6);
  transform: scale(0.94);
}

.key.error {
  background: #d9534f;
  box-shadow: 0 0 0 2px rgba(217,83,79,0.6);
}
  /* Heatmap */
.key.heat-low {
  background: #3b6f4f;
}

.key.heat-mid {
  background: #8a7f3a;
}

.key.heat-high {
  background: #7a2e2e;
}
  .keyboard.idle {
  filter: blur(3px) brightness(0.6);
  pointer-events: none;
}

.practice.idle {
  opacity: 0.6;
}

/* ---------- SESSION SUMMARY ---------- */
.summary {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.summary-card {
  background: #252526;
  border-radius: 12px;
  padding: 24px 28px;
  width: 420px;
  color: #ddd;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
}

.summary-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
}

.summary-card ul {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.summary-card li {
  margin: 6px 0;
  font-size: 14px;
}

.summary-card button {
  margin-top: 14px;
  width: 100%;
  background: #4caf50;
  color: #000;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
}

</style>
</head>

<body tabindex="0">
<div class="app">
<div class="summary" id="summary">
  <div class="summary-card">
    <h2>Session Summary</h2>
    <ul id="summary-content"></ul>
    <button id="summary-close">Continue</button>
  </div>
</div>


  <div class="practice">
  <button id="reset"
  style="margin-top:10px; background:#333; color:#ccc; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;">
  Reset stats

</button>
  <div id="stats" style="margin-top:8px; font-size:14px; opacity:0.8;"></div><div id="text">
	</div>
  </div>

  <div class="keyboard">

    <div class="row">
      <div class="key" data-code="Backquote">~</div>
      <div class="key" data-code="Digit1">1</div>
      <div class="key" data-code="Digit2">2</div>
      <div class="key" data-code="Digit3">3</div>
      <div class="key" data-code="Digit4">4</div>
      <div class="key" data-code="Digit5">5</div>
      <div class="key" data-code="Digit6">6</div>
      <div class="key" data-code="Digit7">7</div>
      <div class="key" data-code="Digit8">8</div>
      <div class="key" data-code="Digit9">9</div>
      <div class="key" data-code="Digit0">0</div>
      <div class="key" data-code="Minus">-</div>
      <div class="key" data-code="Equal">=</div>
      <div class="key" data-code="Backspace" style="grid-column: span 2;">Back</div>
    </div>

    <div class="row">
      <div class="key" data-code="Tab" style="grid-column: span 2;">Tab</div>
      <div class="key" data-code="KeyQ">Q</div>
      <div class="key" data-code="KeyW">W</div>
      <div class="key" data-code="KeyE">E</div>
      <div class="key" data-code="KeyR">R</div>
      <div class="key" data-code="KeyT">T</div>
      <div class="key" data-code="KeyY">Y</div>
      <div class="key" data-code="KeyU">U</div>
      <div class="key" data-code="KeyI">I</div>
      <div class="key" data-code="KeyO">O</div>
      <div class="key" data-code="KeyP">P</div>
      <div class="key" data-code="BracketLeft">[</div>
      <div class="key" data-code="BracketRight">]</div>
      <div class="key" data-code="Backslash">\\</div>
    </div>

    <div class="row">
      <div class="key" data-code="CapsLock" style="grid-column: span 2;">Caps</div>
      <div class="key" data-code="KeyA">A</div>
      <div class="key" data-code="KeyS">S</div>
      <div class="key" data-code="KeyD">D</div>
      <div class="key" data-code="KeyF">F</div>
      <div class="key" data-code="KeyG">G</div>
      <div class="key" data-code="KeyH">H</div>
      <div class="key" data-code="KeyJ">J</div>
      <div class="key" data-code="KeyK">K</div>
      <div class="key" data-code="KeyL">L</div>
      <div class="key" data-code="Semicolon">;</div>
      <div class="key" data-code="Quote">'</div>
      <div class="key" data-code="Enter" style="grid-column: span 2;">Enter</div>
    </div>

    <div class="row">
      <div class="key" data-code="ShiftLeft" style="grid-column: span 2;">Shift</div>
      <div class="key" data-code="KeyZ">Z</div>
      <div class="key" data-code="KeyX">X</div>
      <div class="key" data-code="KeyC">C</div>
      <div class="key" data-code="KeyV">V</div>
      <div class="key" data-code="KeyB">B</div>
      <div class="key" data-code="KeyN">N</div>
      <div class="key" data-code="KeyM">M</div>
      <div class="key" data-code="Comma">,</div>
      <div class="key" data-code="Period">.</div>
      <div class="key" data-code="Slash">/</div>
      <div class="key" data-code="ShiftRight" style="grid-column: span 3;">Shift</div>
    </div>

    <div class="row">
      <div class="key" data-code="ControlLeft" style="grid-column: span 2;">Ctrl</div>
      <div class="key" data-code="AltLeft" style="grid-column: span 2;">Alt</div>
      <div class="key" data-code="Space" style="grid-column: span 7;">Space</div>
      <div class="key" data-code="AltRight" style="grid-column: span 2;">Alt</div>
      <div class="key" data-code="ControlRight" style="grid-column: span 2;">Ctrl</div>
    </div>

  </div>
</div>

<script>
let difficulty = localStorage.getItem("typerefine-difficulty") || "flow";

const DIFFICULTY_CONFIG = {
  beginner: { words: 15, duration: 90 },
  flow: { words: 25, duration: 60 },
  sprint: { words: 40, duration: 30 }
};

let armed = false; 

const victorySound = new Audio(
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
);
let streak = JSON.parse(
  localStorage.getItem("typerefine-streak") ||
  '{"count":0,"last":null}'
);


/* ---------------- CORE DATA ---------------- */

const DICTIONARY = [
  "hope","pace","practice","progress","people",
  "system","typing","focus","learn","build",
  "logic","memory","correct","improve","flow"
];

const keyStats = JSON.parse(
  localStorage.getItem("typerefine-keystats") || "{}"
);
const bigramStats = JSON.parse(
  localStorage.getItem("typerefine-bigrams") || "{}"
);

let lastChar = null;


const errorIndexes = new Set();

let index = 0;
let sessionStart = null;
let sessionDuration = 60; 
let timerId = null;
let totalKeystrokes = 0;


/* ---------------- WEAKNESS ENGINE ---------------- */

function getWeakKeys(limit = 5) {
  return Object.entries(keyStats)
    .map(([code, s]) => ({
      key: code.replace("Key", "").toLowerCase(),
      rate: s.errors / Math.max(s.hits, 1)
    }))
    .filter(k => k.rate > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit)
    .map(k => k.key);
}

function recordBigram(prev, curr) {
  if (!prev || !curr || prev === " " || curr === " ") return;
  const key = prev + curr;
  bigramStats[key] = (bigramStats[key] || 0) + 1;
}

function getWeakBigrams(limit = 5) {
  return Object.entries(bigramStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([bg]) => bg);
}

function generateText(words = 5) {
  const weakKeys = getWeakKeys();
  const weakBigrams = getWeakBigrams();
  const weighted = [];

  DICTIONARY.forEach(word => {
    let score = 1;
    weakKeys.forEach(k => {
      if (word.includes(k)) score += 2;
    });

    weakBigrams.forEach(bg => {
      if (word.includes(bg)) score += 3;
    });

    for (let i = 0; i < score; i++) weighted.push(word);
  });

  return Array.from({ length: words }, () =>
    weighted[Math.floor(Math.random() * weighted.length)]
).join(" ");
}


/* ---------------- UI ---------------- */

let practiceText = generateText(
  DIFFICULTY_CONFIG[difficulty].words
);
sessionDuration = DIFFICULTY_CONFIG[difficulty].duration;

const textEl = document.getElementById("text");

function renderText() {
  textEl.innerHTML = "";

  for (let i = 0; i < practiceText.length; i++) {
    const span = document.createElement("span");
    span.textContent = practiceText[i];

    if (errorIndexes.has(i)) {
      span.className = "error";
      span.title = "Weak key detected";
    } else if (i < index) {
      span.className = "done";
    } else if (i === index) {
      span.className = "current";
    }

    textEl.appendChild(span);
  }
}

renderText();
document.body.focus();
document.querySelector(".keyboard").classList.add("idle");
document.querySelector(".practice").classList.add("idle");

document.getElementById("stats").textContent =
  "Press any key to start";


/* ---------------- INPUT ---------------- */

const keyMap = new Map();
document.querySelectorAll(".key").forEach(k => {
  if (k.dataset.code) keyMap.set(k.dataset.code, k);
});

function flash(code, cls) {
  const key = keyMap.get(code);
  if (!key) return;
  key.classList.add(cls);
  setTimeout(() => key.classList.remove(cls), 70);
}
  function updateHeatmap() {
  for (const [code, stats] of Object.entries(keyStats)) {
    const key = keyMap.get(code);
    if (!key) continue;

    const rate = stats.errors / Math.max(stats.hits, 1);

    key.classList.remove("heat-low", "heat-mid", "heat-high");

    if (rate > 0.25) key.classList.add("heat-high");
    else if (rate > 0.1) key.classList.add("heat-mid");
    else if (rate > 0) key.classList.add("heat-low");
  }
}

function saveStats() {
  localStorage.setItem(
    "typerefine-keystats",
    JSON.stringify(keyStats)
  );
}

function getVictoryMessage(wpm, accuracy) {
  if (accuracy >= 98 && wpm >= 60)
    return "🔥 Elite control. Speed and precision aligned.";
  if (accuracy >= 95)
    return "💪 Accuracy improving. Muscle memory is locking in.";
  if (wpm >= 60)
    return "⚡ Speed unlocked. Now tame the errors.";
  if (accuracy < 90)
    return "🎯 Control first. Speed will follow.";
  return "🚀 Solid session. Consistency beats intensity.";
}


function showSummary(wpm) {
  const summary = document.getElementById("summary");
  const list = document.getElementById("summary-content");

  const entries = Object.entries(keyStats).map(([code, s]) => ({
    key: code.replace("Key", ""),
    hits: s.hits,
    errors: s.errors,
    rate: s.errors / Math.max(s.hits, 1)
  }));

  const totalErrors = entries.reduce((a, b) => a + b.errors, 0);
  const accuracy = totalKeystrokes
    ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100)
    : 100;
  const victory = getVictoryMessage(wpm, accuracy);
const streakText = streak.count > 1
  ? "🔥 " + streak.count + "-day streak"
  : "🌱 New streak started";



  const weakKeys = entries
    .filter(e => e.errors > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  const worstKey = weakKeys[0];

list.innerHTML =
  '<li><strong>WPM:</strong> ' + wpm + '</li>' +
  '<li><strong>Accuracy:</strong> ' + accuracy + '%</li>' +
  '<li><strong>Total Keystrokes:</strong> ' + totalKeystrokes + '</li>' +
  '<li><strong>Worst Key:</strong> ' + (worstKey ? worstKey.key : "—") + '</li>' +
  '<li><strong>Top Weak Keys:</strong> ' + (weakKeys.map(k => k.key).join(", ") || "None") + '</li>' +
  '<li style="margin-top:10px; color:#4caf50;"><strong>' + victory + '</strong></li>' +
  '<li><strong>Streak:</strong> ' + streakText + '</li>';


  victorySound.play().catch(() => {});
  summary.style.display = "flex";
}


function startSession() {
	if (timerId) clearInterval(timerId);

  sessionStart = Date.now();
  totalKeystrokes = 0;

  timerId = setInterval(() => {
    const elapsed = (Date.now() - sessionStart) / 1000;
    const remaining = Math.max(0, sessionDuration - elapsed);

document.getElementById("stats").textContent =
  "Time left: " + Math.ceil(remaining) + "s";


    if (remaining <= 0) endSession();
  }, 500);
}

function endSession() {
const today = new Date().toDateString();

if (streak.last === today) {
} else if (
  streak.last === new Date(Date.now() - 86400000).toDateString()
) {
  streak.count++;
} else {
  streak.count = 1;
}

streak.last = today;
localStorage.setItem("typerefine-streak", JSON.stringify(streak));

  clearInterval(timerId);

  const minutes = sessionDuration / 60;
  const wpm = Math.round((totalKeystrokes / 5) / minutes);

  document.getElementById("stats").textContent =
    "Session over - WPM: " + wpm;

  showSummary(wpm);
}

function shouldIgnoreSpace(e, expectedChar) {
  return e.code === "Space" && expectedChar !== " ";
}

  
window.addEventListener("keydown", e => {


  if (!armed) {
    armed = true;

    document.querySelector(".keyboard").classList.remove("idle");
    document.querySelector(".practice").classList.remove("idle");

    startSession();
    renderText();
    return;
  }

  e.preventDefault(); 

  if (e.code === "Backspace") {
  if (index > 0) {
    index--;
    errorIndexes.delete(index);
    totalKeystrokes = Math.max(0, totalKeystrokes - 1); 
  }
  flash("Backspace", "active");
  renderText();
  return;
  }

  const expected = practiceText[index];
  
  if (shouldIgnoreSpace(e, expected)) {
  flash("Space", "error"); 
  return;
}

  const typed = e.key === " " ? " " : e.key.length === 1 ? e.key : null;

  if (!typed) return;
  if (!sessionStart) startSession();
totalKeystrokes++;



  if (!keyStats[e.code]) keyStats[e.code] = { hits: 0, errors: 0 };
  keyStats[e.code].hits++;

  if (typed === expected) {
    flash(e.code, "active");
  } else {
    flash(e.code, "error");
    errorIndexes.add(index);
    keyStats[e.code].errors++;
  }
    /* 🔥 STEP 7.4 — RECORD BIGRAM (PASTE HERE) */
recordBigram(lastChar, typed);
lastChar = typed;

localStorage.setItem(
  "typerefine-bigrams",
  JSON.stringify(bigramStats)
);
/* 🔥 END BIGRAM RECORD */


  index++;

  if (index >= practiceText.length) {
practiceText = generateText(DIFFICULTY_CONFIG[difficulty].words);
    index = 0;
    errorIndexes.clear();
    lastChar = null;

  }

  renderText();
  updateHeatmap();
  saveStats();
  


});
document.getElementById("reset").onclick = () => {
/* 🔥 STEP 7.5 — CLEAR BIGRAMS */
localStorage.removeItem("typerefine-bigrams");
for (const k in bigramStats) delete bigramStats[k];
lastChar = null;
/* 🔥 END BIGRAM RESET */

clearInterval(timerId);
timerId = null;
sessionStart = null;
totalKeystrokes = 0;
index = 0;
localStorage.removeItem("typerefine-keystats");
for (const k in keyStats) delete keyStats[k];
errorIndexes.clear();

practiceText = generateText(DIFFICULTY_CONFIG[difficulty].words);
renderText();

  updateHeatmap();
  armed = false;

document.querySelector(".keyboard").classList.add("idle");
document.querySelector(".practice").classList.add("idle");

document.getElementById("stats").textContent =
  "Press any key to start";
  document.body.focus();

};
document.getElementById("summary-close").onclick = () => {
  document.getElementById("summary").style.display = "none";

  practiceText = generateText(DIFFICULTY_CONFIG[difficulty].words)
;
  index = 0;
  errorIndexes.clear();
  totalKeystrokes = 0;
  lastChar = null;

  document.querySelector(".keyboard").classList.add("idle");
  document.querySelector(".practice").classList.add("idle");
  document.getElementById("stats").textContent = "Press any key to start";

  armed = false;
  document.body.focus();
};

</script>

</body>
</html>
`;
}

export function deactivate() { }
