// ─────────────────────────────────────────────
// SECTION 2  STATIC DATA & UTILS
// ─────────────────────────────────────────────
const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
export const todayStr = getTodayStr();
export { getTodayStr };
export const getOffsetDateStr = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Empty initial data
export const initialDict = [];
export const initialInventory = {};
export const initialLogs = {};

// All possible dashboard modules
export const ALL_MODULES = [
  { id: "wallet",    label: "Current Wallet",    desc: "Track your cash balance" },
  { id: "stocks",    label: "Current Item Stocks",     desc: "Food & household inventory" },
  { id: "trends",    label: "Trends",             desc: "Calorie & expense bar chart" },
  { id: "topexp",    label: "Top Expenses",       desc: "Highest spending categories (30 days)" },
  { id: "topcals",   label: "Top Calories",       desc: "Highest calorie foods (30 days)" },
  { id: "sleep",     label: "Sleep Tracker",      desc: "Log sleep & track sleep debt" },
  { id: "reading",   label: "Reading Notification", desc: "Schedule reading & track missed sessions" },
  { id: "medicine",  label: "Medicine Tracker",   desc: "Log when you take medicine" },
  { id: "debts",     label: "Owe / Debt Records", desc: "Track money you owe or are owed" },
  { id: "gym",       label: "Gym Tracker",        desc: "Log training sessions & exercises" },
  { id: "exam",      label: "Exam Countdown",     desc: "Days until your next exam" },
  { id: "deadlines", label: "Closest Deadlines",  desc: "Upcoming todos & exams" },
  { id: "payments",  label: "Incoming Payments",  desc: "Track subscriptions & recurring bills" },
];

const DEFAULT_MODULE_ORDER = ["wallet", "stocks", "trends", "topexp", "exam", "deadlines", "payments"];
export const DEFAULT_SETTINGS = {
  trackCalories: false,
  accent: "indigo",
  budgetTracker: { enabled: true, days: [true, true, true, true, true, true, true] }, // index 0=Sun ... 6=Sat
};
export const DEFAULT_SLEEP_SETTINGS = { targetHrs: 8 };
export const DEFAULT_DASHBOARD_CONFIG = { order: DEFAULT_MODULE_ORDER, visible: DEFAULT_MODULE_ORDER };

export const ACCENTS = [
  { name: "Indigo",   value: "indigo",  hex: "#4f46e5" },
  { name: "Violet",   value: "violet",  hex: "#7c3aed" },
  { name: "Blue",     value: "blue",    hex: "#2563eb" },
  { name: "Teal",     value: "teal",    hex: "#0d9488" },
  { name: "Rose",     value: "rose",    hex: "#e11d48" },
  { name: "Emerald",  value: "emerald", hex: "#059669" },
  { name: "Yellow",    value: "yellow",   hex: "#d97706" },
  { name: "Pink",     value: "pink",    hex: "#db2777" },
];

const parseTimeToMins = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const calcSleepDuration = (slept, woke) => {
  const s = parseTimeToMins(slept), w = parseTimeToMins(woke);
  if (s === null || w === null) return 0;
  let d = w - s; if (d <= 0) d += 1440; return d;
};
export const fmtDur = (mins) => {
  if (mins === null || mins === undefined || isNaN(mins)) return "0h 0m";
  return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
};
export const fmtDateShort = (ds) => {
  const d = new Date(ds + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

// ─────────────────────────────────────────────
// Reading Notification Tracker helpers
// (previously duplicated locally in modules.jsx — now the single source of truth)
// ─────────────────────────────────────────────
export const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export const fmtTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

// Returns array of date strings (oldest first) between subject creation and yesterday
// that fall on a scheduled day-of-week and were not marked done.
export const getMissedDates = (subject, doneMap) => {
  const missed = [];
  const start = new Date(subject.createdAt + "T00:00:00");
  const yesterday = new Date(todayStr + "T00:00:00");
  yesterday.setDate(yesterday.getDate() - 1);
  if (start > yesterday) return missed;
  // safety cap so a very old subject doesn't loop forever
  const cap = new Date(yesterday); cap.setDate(cap.getDate() - 120);
  const from = start > cap ? start : cap;
  for (let d = new Date(from); d <= yesterday; d.setDate(d.getDate() + 1)) {
    if (!subject.days.includes(d.getDay())) continue;
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    const ds = `${y}-${m}-${day}`;
    if (!(doneMap[ds])) missed.push(ds);
  }
  return missed;
};


// New helper — computes daily budget based on which days are "in" the cycle.
// The cycle always ends on the last enabled day of the week; daysRemaining counts
// today through that day inclusively (wrapping to next week if today is already past it).
export const getBudgetInfo = (money, days) => {
  const enabledIndices = (days || []).map((v, i) => (v ? i : null)).filter(v => v !== null);
  if (enabledIndices.length === 0) {
    return { daysRemaining: 0, dailyBudget: 0, lastDayIdx: null };
  }
  const todayIdx = new Date().getDay();
  const lastEnabled = Math.max(...enabledIndices);

  // Days strictly AFTER today, through (and including) the last enabled day of the cycle.
  let diff = (lastEnabled - todayIdx + 7) % 7;

  // If today IS the last enabled day, there are no future days left in this cycle —
  // treat the rest of today as the only day left, so the full remaining wallet is "today's" budget.
  const daysRemaining = diff === 0 ? 1 : diff;

  const dailyBudget = daysRemaining > 0 ? money / daysRemaining : money;
  return { daysRemaining, dailyBudget, lastDayIdx: lastEnabled };
};