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