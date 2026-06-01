// ── Constants & State ────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

let habits = loadFromStorage("ht_habits", []);
let checks = loadFromStorage("ht_checks", {});
let weekOffset = 0; // 0 = current week, -1 = last week, +1 = next week

// ── Storage Helpers ──────────────────────────────────
function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage() {
  localStorage.setItem("ht_habits", JSON.stringify(habits));
  localStorage.setItem("ht_checks", JSON.stringify(checks));
}

// ── Date Helpers ─────────────────────────────────────
function todayKey() {
  return localKey(new Date());
}

function localKey(date) {
  // Using local date (not UTC) to avoid midnight timezone bugs
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1)); // shift to Monday
  return d;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getWeekLabel(days) {
  const s = days[0], e = days[6];
  if (s.getMonth() === e.getMonth()) {
    return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
}

// ── Streak Logic ─────────────────────────────────────
function computeStreak(habitId) {
  // Walk backwards from today, count consecutive checked days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = new Date(today);

  while (true) {
    const key = localKey(cursor);
    if (checks[habitId]?.[key]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ── Unique ID ─────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── DOM References ───────────────────────────────────
const emptyState     = document.getElementById("empty-state");
const gridContainer  = document.getElementById("grid-container");
const gridHeader     = document.getElementById("grid-header");
const habitList      = document.getElementById("habit-list");
const weekNavEl      = document.getElementById("week-nav");
const weekLabelEl    = document.getElementById("week-label");
const weekRangeEl    = document.getElementById("week-range");
const jumpTodayBtn   = document.getElementById("jump-today");
const progressWrap   = document.getElementById("progress-wrap");
const progressFill   = document.getElementById("progress-fill");
const progressLabel  = document.getElementById("progress-label");
const addForm        = document.getElementById("add-form");
const addInput       = document.getElementById("add-input");
const openAddBtn     = document.getElementById("open-add-btn");
const emptyAddBtn    = document.getElementById("empty-add-btn");
const confirmAddBtn  = document.getElementById("confirm-add");
const cancelAddBtn   = document.getElementById("cancel-add");

// ── Main Render Function ─────────────────────────────
function render() {
  const today = todayKey();

  // Calculate which week to show
  const baseWeekStart = getWeekStart(new Date());
  const weekStart = new Date(baseWeekStart);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const days = getWeekDays(weekStart);

  const isCurrent = weekOffset === 0;
  const isFutureWeek = weekOffset > 0;

  // ── Week nav labels ──
  weekRangeEl.textContent = getWeekLabel(days);
  weekLabelEl.textContent = isCurrent ? "This week" : isFutureWeek ? "Future" : "Past";
  jumpTodayBtn.classList.toggle("hidden", isCurrent);

  // ── Show/hide empty state vs grid ──
  if (habits.length === 0) {
    emptyState.classList.remove("hidden");
    gridContainer.classList.add("hidden");
    progressWrap.classList.add("hidden");
    weekNavEl.classList.add("hidden");
    return; // nothing else to render
  }

  weekNavEl.classList.remove("hidden");
  emptyState.classList.add("hidden");
  gridContainer.classList.remove("hidden");

  // ── Render grid header (day columns) ──
  renderGridHeader(days, today);

  // ── Render habit rows ──
  renderHabitRows(days, today, isFutureWeek);

  // ── Render progress bar (current week only) ──
  if (isCurrent) {
    renderProgress(days, today);
    progressWrap.classList.remove("hidden");
  } else {
    progressWrap.classList.add("hidden");
  }
}

// ── Render Grid Header ───────────────────────────────
function renderGridHeader(days, today) {
  // Keep the spacer div, replace the day columns
  gridHeader.innerHTML = `<div class="grid-header-spacer"></div>`;

  days.forEach((day, i) => {
    const key = localKey(day);
    const isToday = key === today;

    const col = document.createElement("div");
    col.className = "day-col" + (isToday ? " today" : "");

    col.innerHTML = `
      <span class="day-lbl">${DAYS[i]}</span>
      <span class="day-num ${isToday ? "today" : ""}">${day.getDate()}</span>
    `;
    gridHeader.appendChild(col);
  });
}

// ── Render Habit Rows ────────────────────────────────
function renderHabitRows(days, today, isFutureWeek) {
  habitList.innerHTML = "";

  habits.forEach(habit => {
    const streak = computeStreak(habit.id);
    const flameColor = streak >= 3 ? "var(--fire)" : streak > 0 ? "var(--text-sub)" : "var(--muted)";

    // Build the row
    const row = document.createElement("div");
    row.className = "habit-row";
    row.dataset.id = habit.id;

    // Left side: name + actions + streak
    const meta = document.createElement("div");
    meta.className = "habit-meta";
    meta.innerHTML = `
      <div class="habit-name-wrap">
        <span class="habit-name" title="${escHtml(habit.name)}">${escHtml(habit.name)}</span>
        <div class="habit-actions">
          <button class="icon-btn rename-btn" data-id="${habit.id}" title="Rename">✎</button>
          <button class="icon-btn danger delete-btn" data-id="${habit.id}" title="Delete">✕</button>
        </div>
      </div>
      <div class="streak-badge" title="${streak} day streak">
        <span style="color:${flameColor}">🔥</span>
        <span style="color:${streak >= 1 ? 'var(--text)' : 'var(--muted)'}">${streak}</span>
      </div>
    `;
    row.appendChild(meta);

    // Right side: 7 cells
    days.forEach((day, i) => {
      const key = localKey(day);
      const checked  = !!(checks[habit.id]?.[key]);
      const isToday  = key === today;
      const isFuture = key > today;
      const isMissed = key < today && !checked;

      const cell = document.createElement("button");
      cell.className = [
        "cell",
        checked  ? "checked"  : "",
        isToday  ? "today"    : "",
        isMissed ? "missed"   : "",
        isFuture ? "future"   : "",
      ].filter(Boolean).join(" ");

      cell.textContent = checked ? "✓" : "";
      cell.disabled = isFuture;
      cell.dataset.id  = habit.id;
      cell.dataset.key = key;
      cell.setAttribute("aria-label",
        `${habit.name} on ${DAYS_FULL[i]}, ${checked ? "done" : "not done"}${isToday ? " (today)" : ""}`
      );
      if (!isFuture) cell.setAttribute("aria-pressed", checked);

      row.appendChild(cell);
    });

    habitList.appendChild(row);
  });
}

// ── Render Progress Bar ──────────────────────────────
function renderProgress(days, today) {
  const doneDays = days.filter(d => localKey(d) <= today);
  const total = habits.length * doneDays.length;
  const done  = habits.reduce((sum, h) =>
    sum + doneDays.filter(d => checks[h.id]?.[localKey(d)]).length, 0
  );

  const pct = total > 0 ? (done / total) * 100 : 0;
  progressFill.style.width = pct + "%";
  progressLabel.textContent = `${done}/${total} this week`;
}

// ── Escape HTML (security) ───────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

render();

// ── Event Listeners ───────────────────────────────────

// Open add form
function openAddForm() {
  addForm.classList.remove("hidden");
  addInput.focus();
}
openAddBtn.addEventListener("click", openAddForm);
emptyAddBtn.addEventListener("click", openAddForm);

// Close add form
function closeAddForm() {
  addForm.classList.add("hidden");
  addInput.value = "";
}
cancelAddBtn.addEventListener("click", closeAddForm);

// Confirm add habit
function addHabit() {
  const name = addInput.value.trim();
  if (!name) return;
  habits.push({ id: uid(), name: name, createdAt: todayKey() });
  saveToStorage();
  closeAddForm();
  render();
}
confirmAddBtn.addEventListener("click", addHabit);

// Also add on Enter key
addInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") addHabit();
  if (e.key === "Escape") closeAddForm();
});

// ── Cell toggle, rename, delete (event delegation) ───
// We attach ONE listener to the whole habit list
// instead of one per cell — more efficient
habitList.addEventListener("click", function(e) {

  // -- Toggle cell --
  const cell = e.target.closest(".cell");
  if (cell && !cell.disabled) {
    const { id, key } = cell.dataset;
    if (!checks[id]) checks[id] = {};
    checks[id][key] = !checks[id][key];
    saveToStorage();
    render();
    return;
  }

  // -- Delete habit --
  const deleteBtn = e.target.closest(".delete-btn");
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const habit = habits.find(h => h.id === id);
    if (!confirm(`Delete "${habit.name}" and all its history?`)) return;
    habits = habits.filter(h => h.id !== id);
    delete checks[id];
    saveToStorage();
    render();
    return;
  }

  // -- Rename habit --
  const renameBtn = e.target.closest(".rename-btn");
  if (renameBtn) {
    const id = renameBtn.dataset.id;
    const row = renameBtn.closest(".habit-row");
    const nameSpan = row.querySelector(".habit-name");
    const currentName = habits.find(h => h.id === id).name;

    // Replace span with input
    const input = document.createElement("input");
    input.className = "edit-input";
    input.value = currentName;
    input.maxLength = 60;
    nameSpan.replaceWith(input);
    input.select();

    function commitRename() {
      const newName = input.value.trim();
      if (newName && newName !== currentName) {
        habits = habits.map(h => h.id === id ? { ...h, name: newName } : h);
        saveToStorage();
      }
      render();
    }

    input.addEventListener("blur", commitRename);
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") commitRename();
      if (e.key === "Escape") render(); // cancel
    });
    return;
  }
});

// ── Week Navigation ───────────────────────────────────
document.getElementById("prev-week").addEventListener("click", function() {
  weekOffset--;
  render();
});

document.getElementById("next-week").addEventListener("click", function() {
  weekOffset++;
  render();
});

document.getElementById("jump-today").addEventListener("click", function() {
  weekOffset = 0;
  render();
});