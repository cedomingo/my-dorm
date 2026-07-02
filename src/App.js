// ============================================================
// DormTracker v2.1
// Sections: hooks → data → utils → primitives →
//           modules → dashboard → views → modals → App
// ============================================================

import { useState, useEffect, useRef } from "react";
import {
  Wallet, Package, Utensils, Plus, Minus, BookOpen,
  Calendar, CalendarDays, ChevronLeft, ChevronRight, X, TrendingDown,
  Activity, Check, Trash2, Edit, GraduationCap, ListTodo, AlarmClock,
  Moon, Pill, Settings, LayoutDashboard, Wrench, GripVertical,
  Coffee, BarChart2, BookMarked, Users, Dumbbell, DollarSign,
  ArrowDownLeft, ArrowUpRight, Pencil, FileText, Ruler
} from "lucide-react";
import "./DormTracker.css";
// ─────────────────────────────────────────────
// SECTION 1  HOOKS
// ─────────────────────────────────────────────

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = (value) => {
    try {
      const v = value instanceof Function ? value(storedValue) : value;
      setStoredValue(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch { }
  };
  return [storedValue, setValue];
}

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
const todayStr = getTodayStr();

const getOffsetDateStr = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Empty initial data
const initialDict = [];
const initialInventory = {};
const initialLogs = {};

// All possible dashboard modules
const ALL_MODULES = [
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
];

const DEFAULT_MODULE_ORDER = ["wallet", "stocks", "trends", "topexp", "exam", "deadlines"];
const DEFAULT_SETTINGS = { trackCalories: true, accent: "indigo" };
const DEFAULT_SLEEP_SETTINGS = { targetHrs: 8 };
const DEFAULT_DASHBOARD_CONFIG = { order: DEFAULT_MODULE_ORDER, visible: DEFAULT_MODULE_ORDER };

const ACCENTS = [
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
const calcSleepDuration = (slept, woke) => {
  const s = parseTimeToMins(slept), w = parseTimeToMins(woke);
  if (s === null || w === null) return 0;
  let d = w - s; if (d <= 0) d += 1440; return d;
};
const fmtDur = (mins) => {
  if (mins === null || mins === undefined || isNaN(mins)) return "0h 0m";
  return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
};
const fmtDateShort = (ds) => {
  const d = new Date(ds + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

// ─────────────────────────────────────────────
// SECTION 3  SHARED UI PRIMITIVES
// ─────────────────────────────────────────────

function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${active ? "accent-nav-active" : "text-slate-400 hover:text-slate-600"}`}>
      {icon}
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );
}

function ModalWrapper({ close, title, children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={close} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-1.5 rounded-full transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>;
}

function CardHeader({ icon, title, action }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 p-5 pb-4">
      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">{icon}{title}</h2>
      {action}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        on ? "accent-toggle-on" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          on ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function AccentBtn({ onClick, children, className = "" }) {
  return (
    <button onClick={onClick} className={`accent-btn rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${className}`}>
      {children}
    </button>
  );
}

function SoftAccentBtn({ onClick, children, className = "" }) {
  return (
    <button onClick={onClick} className={`accent-soft-btn rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${className}`}>
      {children}
    </button>
  );
}

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="p-10 text-center">
      <div className="text-slate-300 mx-auto mb-3 flex justify-center">{icon}</div>
      <p className="text-slate-500 font-semibold">{title}</p>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 4  DASHBOARD MODULES
// ─────────────────────────────────────────────

// 4a. Wallet
function WalletModule({ money, setShowMoneyModal }) {
  return (
    <Card>
      <div className="p-5 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Current Wallet</p>
          <p className="text-3xl font-extrabold text-slate-800">₱{Math.round(money)}</p>
        </div>
        <button onClick={() => setShowMoneyModal(true)} className="accent-bg-soft accent-text p-3 rounded-xl hover:accent-bg-100 transition">
          <Plus size={24} />
        </button>
      </div>
    </Card>
  );
}

// 4b. Stocks
function StocksModule({ inventory, setInventory }) {
  const [isEditing, setIsEditing] = useState(false);
  const fmtQty = (qty, unit) => unit.toLowerCase() === "cups" ? Number(qty).toFixed(1) : Math.round(qty).toString();

  const adjust = (name, amt) => setInventory(prev => {
    const curr = prev[name]; if (!curr) return prev;
    const nq = Math.max(0, curr.qty + amt);
    if (nq === 0) { const c = { ...prev }; delete c[name]; return c; }
    return { ...prev, [name]: { ...curr, qty: nq } };
  });
  const manualChange = (name, unit, val) => {
    const isCups = unit.toLowerCase() === "cups";
    const p = isCups ? parseFloat(val) : parseInt(val, 10);
    setInventory(prev => {
      if (isNaN(p) || p <= 0) { const c = { ...prev }; delete c[name]; return c; }
      return { ...prev, [name]: { ...prev[name], qty: p } };
    });
  };
  const del = (name) => setInventory(prev => { const c = { ...prev }; delete c[name]; return c; });

  const foods  = Object.entries(inventory).filter(([, i]) => i.type === "food" && i.qty > 0);
  const others = Object.entries(inventory).filter(([, i]) => i.type === "household" && i.qty > 0);

  const renderRow = (name, data) => {
    const step = data.unit.toLowerCase() === "cups" ? 0.5 : 1;
    return (
      <div key={name} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1.5 min-h-[44px]">
        <span className="text-slate-700 font-medium truncate flex-1 pr-2">{name}</span>
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <button onClick={() => adjust(name, -step)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded transition"><Minus size={12} /></button>
            <input type="number" step={step} className="border border-slate-200 rounded px-1 py-0.5 text-xs w-14 text-center outline-none font-bold bg-slate-50"
              value={data.qty} onChange={e => manualChange(name, data.unit, e.target.value)} />
            <span className="text-[10px] text-slate-400 font-bold uppercase w-8">{data.unit}</span>
            <button onClick={() => adjust(name, step)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded transition"><Plus size={12} /></button>
            <button onClick={() => del(name)} className="p-1 text-slate-300 hover:text-rose-500 rounded transition"><Trash2 size={14} /></button>
          </div>
        ) : (
          <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${data.type === "food" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
            {fmtQty(data.qty, data.unit)} {data.unit}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader
        icon={<Package size={20} className="text-slate-500" />}
        title="Current Item Stocks"
        action={
          <button onClick={() => setIsEditing(!isEditing)}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${isEditing ? "bg-emerald-100 text-emerald-700" : "accent-soft-btn"}`}>
            {isEditing ? <><Check size={14} /> Done</> : <><Edit size={14} /> Edit</>}
          </button>
        }
      />
      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Foods in Stock</p>
          {foods.length === 0 ? <p className="text-sm text-slate-300 italic">No food in stock.</p> : foods.map(([n, d]) => renderRow(n, d))}
        </div>
        <div>
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Household</p>
          {others.length === 0 ? <p className="text-sm text-slate-300 italic">No household items stocked.</p> : others.map(([n, d]) => renderRow(n, d))}
        </div>
      </div>
    </Card>
  );
}

// 4c. Trends
function TrendsModule({ logs, getDailyTotals, recentDays, setSelectedDate, setShowLogModal, settings }) {
  const maxC = Math.max(...recentDays.map(d => getDailyTotals(d).totalCals), 1);
  const maxE = Math.max(...recentDays.map(d => getDailyTotals(d).totalSpent), 1);
  return (
    <Card>
      <CardHeader icon={<BarChart2 size={20} className="text-slate-500" />} title="Trends" />
      <div className="p-5">
        <div className="flex gap-4 justify-center text-xs mb-4">
          {settings.trackCalories && <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-sm" /><span className="text-slate-500">Calories</span></div>}
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-sm" /><span className="text-slate-500">Expenses (₱)</span></div>
        </div>
        <div className="flex items-end h-36 gap-2 border-b border-slate-100 pb-4 mb-4 pt-4">
          {recentDays.map(date => {
            const { totalCals, totalSpent } = getDailyTotals(date);
            return (
              <div key={date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div className="absolute -top-6 text-[9px] bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition z-10 whitespace-nowrap">
                  {settings.trackCalories && <>{totalCals}c | </>}₱{Math.round(totalSpent)}
                </div>
                <div className="flex items-end justify-center w-full h-full gap-0.5">
                  {settings.trackCalories && <div className="w-3 bg-amber-400 rounded-t-sm" style={{ height: `${Math.max((totalCals / maxC) * 100, 3)}%` }} />}
                  <div className="w-3 bg-rose-500 rounded-t-sm" style={{ height: `${Math.max((totalSpent / maxE) * 100, 3)}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-semibold">{new Date(date).toLocaleDateString("en-US", { weekday: "short" })}</span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recentDays.slice(-4).reverse().map(date => {
            const t = getDailyTotals(date);
            const isToday = date === todayStr;
            return (
              <div key={date} onClick={() => { setSelectedDate(date); setShowLogModal(true); }}
                className="bg-slate-50 border border-slate-100 p-3 rounded-xl cursor-pointer hover:border-slate-300 shadow-sm transition">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-sm ${isToday ? "accent-text" : "text-slate-700"}`}>
                    {isToday ? "Today" : new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
                {settings.trackCalories && <div className="text-xs text-slate-500 mb-1 flex justify-between"><span>Cals:</span><span className="font-bold text-amber-600">{t.totalCals}</span></div>}
                <div className="text-xs text-slate-500 flex justify-between"><span>Spent:</span><span className="font-bold text-rose-500">₱{Math.round(t.totalSpent)}</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// 4d. Top Expenses
function TopExpensesModule({ logs }) {
  const ago = new Date(todayStr); ago.setDate(ago.getDate() - 30);
  const all = [];
  Object.entries(logs).forEach(([ds, day]) => {
    if (new Date(ds) >= ago) {
      day.purchases?.forEach(p => all.push({ name: p.name, cost: p.cost }));
      day.expenses?.forEach(e => all.push({ name: e.name, cost: e.cost }));
    }
  });
  const totals = all.reduce((a, c) => { a[c.name] = (a[c.name] || 0) + c.cost; return a; }, {});
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <Card>
      <CardHeader icon={<TrendingDown size={20} className="text-rose-400" />} title="Top Expenses (30 days)" />
      <div className="p-5 space-y-3">
        {top.length === 0 ? <p className="text-sm text-slate-300 italic">No records found.</p> :
          top.map(([name, cost], i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold w-4 text-right text-xs">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                  <span className="text-xs font-bold text-rose-500">₱{Math.round(cost)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${(cost / Math.max(top[0][1], 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

// 4e. Top Calories
function TopCaloriesModule({ logs }) {
  const ago = new Date(todayStr); ago.setDate(ago.getDate() - 30);
  const all = [];
  Object.entries(logs).forEach(([ds, day]) => { if (new Date(ds) >= ago) day.foods?.forEach(f => all.push(f)); });
  const totals = all.reduce((a, c) => { a[c.name] = (a[c.name] || 0) + c.cals; return a; }, {});
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <Card>
      <CardHeader icon={<Utensils size={20} className="text-amber-400" />} title="Top Calories (30 days)" />
      <div className="p-5 space-y-3">
        {top.length === 0 ? <p className="text-sm text-slate-300 italic">No records found.</p> :
          top.map(([name, cals], i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold w-4 text-right text-xs">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                  <span className="text-xs font-bold text-amber-600">{cals} kcal</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(cals / Math.max(top[0][1], 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

// 4f. Sleep Tracker
function SleepModule({ sleepLogs, setSleepLogs, sleepSettings, setSleepSettings }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [addDate, setAddDate] = useState(todayStr);
  const [sleptTime, setSleptTime] = useState("23:00");
  const [wokeTime, setWokeTime] = useState("07:00");
  const [isNap, setIsNap] = useState(false);
  const [editTarget, setEditTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(sleepSettings.targetHrs.toString());

  const last7 = Array.from({ length: 7 }, (_, i) => getOffsetDateStr(-i));

  // Auto-delete sleep logs older than the past 7 days
  useEffect(() => {
    setSleepLogs(prev => {
      const keep = new Set(last7);
      let changed = false;
      const next = {};
      Object.keys(prev).forEach(ds => {
        if (keep.has(ds)) next[ds] = prev[ds];
        else changed = true;
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let debtMins = 0;
  last7.forEach(date => {
    const entries = sleepLogs[date] || [];
    if (entries.length === 0) return; // unlogged days don't count

    const nightSleepMins = entries
      .filter(e => !e.isNap)
      .reduce((s, e) => s + e.durationMins, 0);

    const napMins = entries
      .filter(e => e.isNap)
      .reduce((s, e) => s + e.durationMins, 0);

    const targetMins = sleepSettings.targetHrs * 60;

    // Cap night sleep at target — extra sleep is voided, not carried over
    const effectiveNightMins = Math.min(nightSleepMins, targetMins);
    const nightDebt = targetMins - effectiveNightMins;

    debtMins += nightDebt;   // add this day's shortfall
    debtMins -= napMins;     // naps from any day chip away at the global pool
  });

  debtMins = Math.max(0, debtMins); // debt floor is 0

  // Most recent single sleep entry across all logged days (today first, then going back)
  let mostRecent = null, mostRecentDate = null;
  for (const date of last7) {
    const entries = sleepLogs[date] || [];
    if (entries.length > 0) { mostRecent = entries[entries.length - 1]; mostRecentDate = date; break; }
  }

  const handleAdd = (e) => {
    e.preventDefault();
    const dur = calcSleepDuration(sleptTime, wokeTime);
    if (dur <= 0) return;
    setSleepLogs(prev => ({ ...prev, [addDate]: [...(prev[addDate] || []), { id: "sl" + Date.now(), sleptTime, wokeTime, durationMins: dur, isNap, label: isNap ? "Nap" : "Night sleep" }] }));
    setShowAdd(false); setSleptTime("23:00"); setWokeTime("07:00"); setIsNap(false);
  };
  const del = (date, id) => setSleepLogs(prev => {
    const upd = (prev[date] || []).filter(e => e.id !== id);
    const c = { ...prev }; if (upd.length === 0) delete c[date]; else c[date] = upd; return c;
  });

  return (
    <Card>
      <CardHeader icon={<Moon size={20} className="text-violet-400" />} title="Sleep Tracker"
        action={
          <div className="flex gap-1.5">
            <SoftAccentBtn onClick={() => { setShowEdit(!showEdit); setShowAdd(false); }}><Edit size={14} /> Edit</SoftAccentBtn>
            <SoftAccentBtn onClick={() => { setShowAdd(!showAdd); setShowEdit(false); }}><Plus size={14} /> Log Sleep</SoftAccentBtn>
          </div>
        } />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-violet-50 p-3 rounded-xl border border-violet-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target / Night</p>
            {editTarget ? (
              <div className="flex gap-1 items-center">
                <input type="number" min="1" max="12" step="0.5" className="w-14 border border-violet-200 rounded p-1 text-sm font-bold outline-none bg-white"
                  value={targetInput} onChange={e => setTargetInput(e.target.value)} />
                <span className="text-xs text-slate-400">hrs</span>
                <button onClick={() => { const v = parseFloat(targetInput); if (!isNaN(v)) setSleepSettings(p => ({ ...p, targetHrs: v })); setEditTarget(false); }}
                  className="p-1 bg-violet-500 text-white rounded"><Check size={12} /></button>
              </div>
            ) : (
              <button onClick={() => setEditTarget(true)} className="flex items-center gap-1 text-lg font-extrabold text-violet-700 hover:underline">
                {sleepSettings.targetHrs}h <Edit size={12} className="text-violet-300 mt-0.5" />
              </button>
            )}
          </div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sleep Debt (7 days)</p>
            <p className="text-lg font-extrabold text-rose-500">{fmtDur(debtMins)}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-2">Most Recent Sleep</p>
          {!mostRecent ? <p className="text-xs text-slate-300 italic">No sleep logged in the past 7 days.</p> : (
            <div className="flex justify-between items-center text-xs py-1">
              <span className={`font-medium flex items-center gap-1 ${mostRecent.isNap ? "text-amber-600" : "text-violet-600"}`}>
                {mostRecent.isNap ? <Coffee size={11} /> : <Moon size={11} />} {mostRecent.label}: {mostRecent.sleptTime} → {mostRecent.wokeTime}
                <span className="text-slate-400 ml-1">({fmtDateShort(mostRecentDate)})</span>
              </span>
              <span className="font-bold text-slate-600">{fmtDur(mostRecent.durationMins)}</span>
            </div>
          )}
        </div>

        {showEdit && (
          <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 mb-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <p className="text-xs font-bold text-slate-500">Logged Sleep — Last 7 Days</p>
            {last7.every(date => (sleepLogs[date] || []).length === 0) ? (
              <p className="text-xs text-slate-300 italic">No sleep logs in the past 7 days.</p>
            ) : (
              last7.map(date => {
                const entries = sleepLogs[date] || [];
                if (entries.length === 0) return null;
                return (
                  <div key={date}>
                    <p className="text-[11px] font-bold text-slate-400 mb-1">{fmtDateShort(date)}</p>
                    {entries.map(e => (
                      <div key={e.id} className="flex justify-between items-center text-xs py-1 bg-white rounded-lg px-2.5 mb-1 border border-slate-100">
                        <span className={`font-medium flex items-center gap-1 ${e.isNap ? "text-amber-600" : "text-violet-600"}`}>
                          {e.isNap ? <Coffee size={11} /> : <Moon size={11} />} {e.label}: {e.sleptTime} → {e.wokeTime}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-600">{fmtDur(e.durationMins)}</span>
                          <button onClick={() => del(date, e.id)} className="text-slate-300 hover:text-rose-400 transition"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}

        {showAdd && (
          <form onSubmit={handleAdd} className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button type="button" onClick={() => setIsNap(false)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${!isNap ? "bg-white shadow text-violet-600" : "text-slate-400"}`}><Moon size={11} className="inline mr-1" />Night</button>
              <button type="button" onClick={() => setIsNap(true)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${isNap ? "bg-white shadow text-amber-600" : "text-slate-400"}`}><Coffee size={11} className="inline mr-1" />Nap</button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Wake-up date</label>
              <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-violet-300" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Slept</label>
                <input type="time" value={sleptTime} onChange={e => setSleptTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Woke up</label>
                <input type="time" value={wokeTime} onChange={e => setWokeTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-violet-300" />
              </div>
            </div>
            {sleptTime && wokeTime && <p className="text-xs text-violet-600 font-bold bg-violet-50 px-3 py-1.5 rounded-lg">Duration: {fmtDur(calcSleepDuration(sleptTime, wokeTime))}</p>}
            <button type="submit" className="w-full bg-violet-500 text-white font-bold py-2.5 rounded-lg hover:bg-violet-600 transition text-sm">Save Entry</button>
          </form>
        )}
      </div>
    </Card>
  );
}

// 4f2. Reading Notification Tracker
const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const fmtTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};
// Returns array of date strings (oldest first) between subject creation and yesterday
// that fall on a scheduled day-of-week and were not marked done.
const getMissedDates = (subject, doneMap) => {
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

function ReadingModule({ readingSubjects, setReadingSubjects, readingLogs, setReadingLogs }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [time, setTime] = useState("19:00");
  const [days, setDays] = useState([]);
  const [pages, setPages] = useState("");

  const toggleDay = (d) => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d].sort());

  const addSubject = (e) => {
    e.preventDefault();
    if (!name.trim() || days.length === 0) return;
    setReadingSubjects(prev => [...prev, {
      id: "rd" + Date.now(), subject: name.trim(), time, days,
      pages: pages.trim() === "" ? null : Number(pages),
      createdAt: todayStr,
    }]);
    setName(""); setTime("19:00"); setDays([]); setPages(""); setShowAdd(false);
  };

  const delSubject = (id) => {
    setReadingSubjects(prev => prev.filter(s => s.id !== id));
    setReadingLogs(prev => { const c = { ...prev }; delete c[id]; return c; });
  };

  const markDone = (id) => {
    setReadingLogs(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [todayStr]: true } }));
  };
  const unmarkDone = (id) => {
    setReadingLogs(prev => {
      const sub = { ...(prev[id] || {}) }; delete sub[todayStr];
      return { ...prev, [id]: sub };
    });
  };

  return (
    <Card>
      <CardHeader icon={<BookOpen size={20} className="text-emerald-500" />} title="Reading Notification"
        action={<SoftAccentBtn onClick={() => setShowAdd(!showAdd)}><Plus size={14} /> Add Subject</SoftAccentBtn>} />
      <div className="p-5 space-y-3">
        {showAdd && (
          <form onSubmit={addSubject} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <input required type="text" placeholder="Subject (e.g. Soc Sci 2)" value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-200" />
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Days of the week</label>
              <div className="flex gap-1.5">
                {DOW_LABELS.map((lab, i) => (
                  <button type="button" key={i} onClick={() => toggleDay(i)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition ${days.includes(i) ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                    {lab}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Notify time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Pages (optional)</label>
                <input type="number" min="0" placeholder="e.g. 8" value={pages} onChange={e => setPages(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-200" />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-600 transition text-sm">Add Subject</button>
          </form>
        )}

        {readingSubjects.length === 0 ? (
          <p className="text-center text-slate-300 text-sm py-4 italic">No reading subjects added yet.</p>
        ) : (
          <div className="space-y-3">
            {readingSubjects.map(sub => {
              const doneMap = readingLogs[sub.id] || {};
              const missedDates = getMissedDates(sub, doneMap);
              const missedDays = missedDates.length;
              const pagesMissed = sub.pages ? sub.pages * missedDays : null;
              const lastMissed = missedDates[missedDates.length - 1];
              const scheduledToday = sub.days.includes(new Date(todayStr + "T00:00:00").getDay());
              const doneToday = !!doneMap[todayStr];

              return (
                <div key={sub.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-sm text-slate-700">{sub.subject}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sub.days.map(d => DOW_LABELS[d]).join(" ")} · {fmtTime12(sub.time)}
                        {sub.pages ? ` · ${sub.pages} pages` : ""}
                      </p>
                    </div>
                    <button onClick={() => delSubject(sub.id)} className="text-slate-300 hover:text-rose-500 p-1 rounded transition shrink-0"><Trash2 size={14} /></button>
                  </div>

                  {scheduledToday && (
                    <div className="mt-2.5">
                      {doneToday ? (
                        <button onClick={() => unmarkDone(sub.id)}
                          className="w-full flex items-center justify-center gap-1.5 bg-emerald-100 text-emerald-700 font-bold py-2 rounded-lg text-xs hover:bg-emerald-200 transition">
                          <Check size={14} /> Done for today
                        </button>
                      ) : (
                        <button onClick={() => markDone(sub.id)}
                          className="w-full flex items-center justify-center gap-1.5 bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs hover:bg-emerald-600 transition">
                          <Check size={14} /> Mark DONE for today
                        </button>
                      )}
                    </div>
                  )}

                  {missedDays > 0 && (
                    <div className="mt-2.5 bg-rose-50 border border-rose-100 rounded-lg p-2.5 space-y-0.5">
                      <p className="text-[11px] font-bold text-rose-500">Missed Readings: {fmtDateShort(lastMissed)}</p>
                      {pagesMissed !== null && (
                        <p className="text-[11px] font-bold text-rose-500">Pages missed: {pagesMissed} ({missedDays} day{missedDays > 1 ? "s" : ""})</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

// 4g. Medicine Tracker
function MedicineModule({ medicineLogs, setMedicineLogs }) {
  const [showAdd, setShowAdd] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medTime, setMedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [logDate, setLogDate] = useState(todayStr);
  const [savedMeds, setSavedMeds] = useLocalStorage("dorm_saved_meds_v1", []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!medName.trim()) return;
    const entry = { id: "med" + Date.now(), name: medName.trim(), dose: medDose.trim(), time: medTime, date: logDate };
    setMedicineLogs(prev => ({ ...prev, [logDate]: [...(prev[logDate] || []), entry] }));
    if (!savedMeds.includes(medName.trim())) setSavedMeds(p => [...p, medName.trim()]);
    setMedName(""); setMedDose(""); setShowAdd(false);
  };
  const del = (date, id) => setMedicineLogs(prev => {
    const upd = (prev[date] || []).filter(e => e.id !== id);
    const c = { ...prev }; if (upd.length === 0) delete c[date]; else c[date] = upd; return c;
  });
  const todayEntries = medicineLogs[todayStr] || [];

  return (
    <Card>
      <CardHeader icon={<Pill size={20} className="text-emerald-500" />} title="Medicine Tracker"
        action={<SoftAccentBtn onClick={() => setShowAdd(!showAdd)}><Plus size={14} /> Log</SoftAccentBtn>} />
      <div className="p-5">
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3 mb-4">
            <input type="text" required placeholder="Medicine name" value={medName} onChange={e => setMedName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-300" list="saved-meds" />
            <datalist id="saved-meds">{savedMeds.map(m => <option key={m} value={m} />)}</datalist>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Dose (e.g. 500mg)" value={medDose} onChange={e => setMedDose(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-300" />
              <input type="time" value={medTime} onChange={e => setMedTime(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-300" />
            </div>
            <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-300" />
            <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-600 transition text-sm">Log Medicine</button>
          </form>
        )}
        {todayEntries.length === 0
          ? <p className="text-sm text-slate-300 italic text-center py-4">No medicine logged today.</p>
          : <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today</p>
              {todayEntries.map(e => (
                <div key={e.id} className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div>
                    <p className="text-sm font-bold text-emerald-800">{e.name}</p>
                    <p className="text-xs text-emerald-600">{e.dose && `${e.dose} · `}{e.time}</p>
                  </div>
                  <button onClick={() => del(todayStr, e.id)} className="text-slate-300 hover:text-rose-500 p-1 rounded transition"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
        }
      </div>
    </Card>
  );
}

// 4h. Debts / Owe Records
function DebtsModule({ debtRecords, setDebtRecords }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("owe"); // "owe" = I owe them | "debt" = they owe me
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    setDebtRecords(prev => [...prev, { id: "debt" + Date.now(), name: name.trim(), type, amount: parseFloat(amount), dueDate, note: note.trim(), settled: false }]);
    setName(""); setAmount(""); setDueDate(""); setNote(""); setShowAdd(false);
  };
  const toggleSettle = (id) => setDebtRecords(prev => prev.map(r => r.id === id ? { ...r, settled: !r.settled } : r));
  const del = (id) => setDebtRecords(prev => prev.filter(r => r.id !== id));

  const active = debtRecords.filter(r => !r.settled);
  const settled = debtRecords.filter(r => r.settled);
  const iOwe = active.filter(r => r.type === "owe").reduce((s, r) => s + r.amount, 0);
  const owedMe = active.filter(r => r.type === "debt").reduce((s, r) => s + r.amount, 0);

  const RecordRow = ({ r }) => (
    <div className={`p-3 rounded-xl border transition ${r.settled ? "opacity-50 bg-slate-50 border-slate-100" : r.type === "owe" ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2 flex-1">
          {r.type === "owe"
            ? <ArrowUpRight size={16} className="text-rose-400 mt-0.5 shrink-0" />
            : <ArrowDownLeft size={16} className="text-emerald-500 mt-0.5 shrink-0" />}
          <div>
            <p className="font-bold text-sm text-slate-800">{r.name}</p>
            <p className="text-xs text-slate-500">
              {r.type === "owe" ? "I owe them" : "They owe me"}
              {r.dueDate && ` · Due ${new Date(r.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </p>
            {r.note && <p className="text-xs text-slate-400 mt-0.5 italic">{r.note}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={`font-extrabold text-sm ${r.type === "owe" ? "text-rose-500" : "text-emerald-600"}`}>₱{r.amount.toLocaleString()}</span>
          <button onClick={() => toggleSettle(r.id)} title={r.settled ? "Mark unsettled" : "Mark settled"}
            className={`p-1.5 rounded-lg transition ${r.settled ? "bg-slate-200 text-slate-500 hover:bg-slate-300" : "bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300"}`}>
            <Check size={13} />
          </button>
          <button onClick={() => del(r.id)} className="p-1 text-slate-300 hover:text-rose-500 rounded transition"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader icon={<DollarSign size={20} className="text-rose-400" />} title="Owe / Debt Records"
        action={<SoftAccentBtn onClick={() => setShowAdd(!showAdd)}><Plus size={14} /> Add</SoftAccentBtn>} />
      <div className="p-5">
        {debtRecords.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">I Owe</p>
              <p className="text-lg font-extrabold text-rose-500">₱{iOwe.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Owed to Me</p>
              <p className="text-lg font-extrabold text-emerald-600">₱{owedMe.toLocaleString()}</p>
            </div>
          </div>
        )}
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-4 animate-in slide-in-from-top-2 duration-150">
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button type="button" onClick={() => setType("owe")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${type === "owe" ? "bg-white shadow text-rose-600" : "text-slate-400"}`}>I Owe Them</button>
              <button type="button" onClick={() => setType("debt")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${type === "debt" ? "bg-white shadow text-emerald-600" : "text-slate-400"}`}>They Owe Me</button>
            </div>
            <input required type="text" placeholder="Name / Who" value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-300" />
            <div className="grid grid-cols-2 gap-2">
              <input required type="number" step="0.01" placeholder="Amount (₱)" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-300" />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-300" />
            </div>
            <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-300" />
            <button type="submit" className="w-full accent-btn py-2.5 rounded-lg font-bold text-sm transition">Add Record</button>
          </form>
        )}
        {debtRecords.length === 0 && !showAdd
          ? <p className="text-sm text-slate-300 italic text-center py-6">No debts or owed records.</p>
          : <div className="space-y-2">
              {active.map(r => <RecordRow key={r.id} r={r} />)}
              {settled.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Settled</p>
                  {settled.map(r => <RecordRow key={r.id} r={r} />)}
                </>
              )}
            </div>
        }
      </div>
    </Card>
  );
}

// 4i. Gym Tracker
function GymModule({ gymData, setGymData }) {
  const [view, setView] = useState("list"); // list | session
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  const addSession = (e) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    const s = { id: "gs" + Date.now(), name: newSessionName.trim(), exercises: [] };
    setGymData(prev => ({ ...prev, sessions: [...(prev.sessions || []), s] }));
    setNewSessionName(""); setShowAddSession(false);
  };
  const deleteSession = (id) => setGymData(prev => ({ ...prev, sessions: (prev.sessions || []).filter(s => s.id !== id) }));
  const openSession = (id) => { setActiveSessionId(id); setView("session"); };

  if (view === "session" && activeSessionId) {
    const session = (gymData.sessions || []).find(s => s.id === activeSessionId);
    if (!session) { setView("list"); return null; }
    return <GymSessionDetail session={session} onBack={() => setView("list")}
      onUpdate={updated => setGymData(prev => ({ ...prev, sessions: (prev.sessions || []).map(s => s.id === updated.id ? updated : s) }))} />;
  }

  const sessions = gymData.sessions || [];
  return (
    <Card>
      <CardHeader icon={<Dumbbell size={20} className="text-orange-400" />} title="Gym Tracker"
        action={<SoftAccentBtn onClick={() => setShowAddSession(!showAddSession)}><Plus size={14} /> Session</SoftAccentBtn>} />
      <div className="p-5">
        {showAddSession && (
          <form onSubmit={addSession} className="flex gap-2 mb-4">
            <input required type="text" placeholder="Session name (e.g. Push Day, Upper A)" value={newSessionName} onChange={e => setNewSessionName(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-orange-300" />
            <button type="submit" className="bg-orange-500 text-white px-3 rounded-lg font-bold hover:bg-orange-600 transition"><Check size={16} /></button>
            <button type="button" onClick={() => setShowAddSession(false)} className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><X size={16} /></button>
          </form>
        )}
        {sessions.length === 0 && !showAddSession
          ? <EmptyState icon={<Dumbbell size={32} />} title="No training sessions yet" subtitle="Add a session to start tracking your lifts" />
          : <div className="space-y-2">
              {sessions.map(s => (
                <button key={s.id} onClick={() => openSession(s.id)}
                  className="w-full text-left flex justify-between items-center p-3.5 rounded-xl bg-orange-50 border border-orange-100 hover:border-orange-300 transition">
                  <div>
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
        }
      </div>
    </Card>
  );
}

function GymSessionDetail({ session, onBack, onUpdate }) {
  const [showAddEx, setShowAddEx] = useState(false);
  const [exName, setExName] = useState("");
  const [sets, setSets] = useState("3–4");
  const [rest, setRest] = useState("90");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("lbs");
  const [editingId, setEditingId] = useState(null);
  const [editWeight, setEditWeight] = useState("");

  const addExercise = (e) => {
    e.preventDefault();
    if (!exName.trim()) return;
    const ex = { id: "ex" + Date.now(), name: exName.trim(), sets, rest, weight: parseFloat(weight) || 0, unit };
    onUpdate({ ...session, exercises: [...session.exercises, ex] });
    setExName(""); setSets("3–4"); setRest("90"); setWeight(""); setShowAddEx(false);
  };
  const deleteEx = (id) => onUpdate({ ...session, exercises: session.exercises.filter(e => e.id !== id) });
  const updateWeight = (id) => {
    const w = parseFloat(editWeight);
    if (isNaN(w)) return;
    onUpdate({ ...session, exercises: session.exercises.map(e => e.id === id ? { ...e, weight: w } : e) });
    setEditingId(null); setEditWeight("");
  };

  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"><ChevronLeft size={18} /></button>
          <div className="flex-1">
            <h2 className="font-extrabold text-slate-800">{session.name}</h2>
            <p className="text-xs text-slate-400">{session.exercises.length} exercises</p>
          </div>
        </div>

        {session.exercises.length > 0 && (
          <div className="space-y-2 mb-4">
            {session.exercises.map(ex => (
              <div key={ex.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                  <button onClick={() => deleteEx(ex.id)} className="text-slate-300 hover:text-rose-500 p-0.5 transition"><Trash2 size={14} /></button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{ex.sets} sets</span>
                  <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">{ex.rest}s rest</span>
                  <div className="flex items-center gap-1">
                    {editingId === ex.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)}
                          className="w-16 border border-orange-200 rounded px-1.5 py-0.5 text-xs font-bold outline-none bg-white"
                          placeholder={ex.weight.toString()} />
                        <span className="text-[11px] text-slate-400">{ex.unit}</span>
                        <button onClick={() => updateWeight(ex.id)} className="p-0.5 bg-emerald-500 text-white rounded"><Check size={11} /></button>
                        <button onClick={() => setEditingId(null)} className="p-0.5 text-slate-400"><X size={11} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(ex.id); setEditWeight(ex.weight.toString()); }}
                        className="text-[11px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold hover:bg-slate-300 transition flex items-center gap-1">
                        {ex.weight > 0 ? `${ex.weight} ${ex.unit}` : `0 ${ex.unit}`} <Pencil size={9} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddEx ? (
          <form onSubmit={addExercise} className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <input required type="text" placeholder="Exercise name (e.g. Bench Press, OHP)" value={exName} onChange={e => setExName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-orange-300" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Sets (e.g. 3–4)</label>
                <input type="text" value={sets} onChange={e => setSets(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Rest (seconds)</label>
                <input type="number" value={rest} onChange={e => setRest(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-orange-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Current weight</label>
                <input type="number" step="0.5" placeholder="0" value={weight} onChange={e => setWeight(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Unit</label>
                <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg h-[42px]">
                  <button type="button" onClick={() => setUnit("lbs")} className={`flex-1 text-xs font-bold rounded-md transition ${unit === "lbs" ? "bg-white shadow text-orange-600" : "text-slate-400"}`}>lbs</button>
                  <button type="button" onClick={() => setUnit("kg")} className={`flex-1 text-xs font-bold rounded-md transition ${unit === "kg" ? "bg-white shadow text-orange-600" : "text-slate-400"}`}>kg</button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddEx(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition">Add Exercise</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowAddEx(true)}
            className="w-full py-2.5 border border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:border-orange-300 hover:text-orange-500 transition flex items-center justify-center gap-1">
            <Plus size={15} /> Add Exercise
          </button>
        )}
      </div>
    </Card>
  );
}

// 4j. Exam Countdown
function ExamModule({ exams, setShowExamModal }) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcoming = exams.map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date + "T00:00:00") - now) / 86400000) }))
    .filter(e => e.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);
  return (
    <Card>
      <CardHeader icon={<GraduationCap size={20} className="text-violet-400" />} title="Exam Countdown"
        action={<SoftAccentBtn onClick={() => setShowExamModal(true)}><Plus size={14} /> Add Exam</SoftAccentBtn>} />
      <div className="p-5">
        {upcoming.length === 0
          ? <p className="text-sm text-slate-300 italic text-center py-3">No upcoming exams.</p>
          : <div className="space-y-3">
              {upcoming.map(exam => {
                const u = exam.daysLeft === 0 ? "today" : exam.daysLeft <= 3 ? "soon" : "normal";
                const cls = { today: "bg-rose-50 border-rose-200", soon: "bg-amber-50 border-amber-200", normal: "bg-violet-50 border-violet-100" };
                const txt = { today: "text-rose-700", soon: "text-amber-700", normal: "text-violet-700" };
                return (
                  <div key={exam.id} className={`flex justify-between items-center p-3 rounded-xl border ${cls[u]}`}>
                    <div>
                      <p className={`font-bold text-sm ${txt[u]}`}>{exam.subject}</p>
                      {exam.label && <p className={`text-[11px] ${txt[u]} opacity-75`}>{exam.label}</p>}
                      <p className="text-[11px] text-slate-400 mt-0.5">{new Date(exam.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-extrabold block leading-none ${txt[u]}`}>{exam.daysLeft === 0 ? "🔥" : exam.daysLeft}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${txt[u]} opacity-70`}>{exam.daysLeft === 0 ? "TODAY" : exam.daysLeft === 1 ? "day left" : "days left"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    </Card>
  );
}

// 4k. Closest Deadlines
function DeadlinesModule({ todos, exams }) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const pendingTodos = Object.entries(todos).flatMap(([date, items]) => {
    const diff = Math.ceil((new Date(date + "T00:00:00") - now) / 86400000);
    if (diff < 0) return [];
    return items.filter(t => !t.done).map(t => ({ type: "todo", date, text: t.text, daysLeft: diff }));
  });
  const upcomingExams = exams.map(e => {
    const diff = Math.ceil((new Date(e.date + "T00:00:00") - now) / 86400000);
    return { type: "exam", date: e.date, text: e.subject + (e.label ? ` — ${e.label}` : ""), daysLeft: diff };
  }).filter(e => e.daysLeft >= 0);
  const all = [...pendingTodos, ...upcomingExams].sort((a, b) => a.daysLeft - b.daysLeft);
  if (all.length === 0) return null;
  const min = all[0].daysLeft;
  const closest = all.filter(i => i.daysLeft === min);
  const upcoming = all.filter(i => i.daysLeft > min).slice(0, 3);
  const fmtD = d => d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`;
  return (
    <Card>
      <CardHeader icon={<AlarmClock size={20} className="text-rose-400" />} title="Closest Deadlines" />
      <div className="p-5 space-y-2">
        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Due {fmtD(min)} — {closest[0].date}</p>
        {closest.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border ${item.type === "exam" ? "bg-violet-50 border-violet-100" : "bg-rose-50 border-rose-100"}`}>
            {item.type === "exam" ? <GraduationCap size={14} className="text-violet-400 shrink-0" /> : <ListTodo size={14} className="text-rose-400 shrink-0" />}
            <span className="text-sm font-semibold text-slate-700 flex-1">{item.text}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === "exam" ? "bg-violet-100 text-violet-700" : "bg-rose-100 text-rose-700"}`}>{item.type === "exam" ? "Exam" : "Task"}</span>
          </div>
        ))}
        {upcoming.length > 0 && (
          <>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Up Next</p>
            {upcoming.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                {item.type === "exam" ? <GraduationCap size={14} className="text-violet-300 shrink-0" /> : <ListTodo size={14} className="text-slate-300 shrink-0" />}
                <span className="text-sm text-slate-500 flex-1">{item.text}</span>
                <span className="text-[10px] text-slate-400 font-bold">{fmtD(item.daysLeft)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// SECTION 5  DASHBOARD VIEW
// ─────────────────────────────────────────────

function Dashboard({ money, inventory, setInventory, logs, getDailyTotals, recentDays, setShowMoneyModal, setSelectedDate, setShowLogModal, exams, setShowExamModal, todos, settings, sleepLogs, setSleepLogs, sleepSettings, setSleepSettings, readingSubjects, setReadingSubjects, readingLogs, setReadingLogs, medicineLogs, setMedicineLogs, debtRecords, setDebtRecords, gymData, setGymData, dashboardConfig, setDashboardConfig }) {
  const [editMode, setEditMode] = useState(false);
  const [showAddModules, setShowAddModules] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(null);

  const active = dashboardConfig.order.filter(id => dashboardConfig.visible.includes(id));

  const toggleModule = (id) => {
    setDashboardConfig(prev => {
      const visible = prev.visible.includes(id) ? prev.visible.filter(v => v !== id) : [...prev.visible, id];
      const order = visible.includes(id) && !prev.order.includes(id) ? [...prev.order, id] : prev.order;
      return { ...prev, visible, order };
    });
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setDashboardConfig(prev => {
      const order = [...prev.order];
      const fi = order.indexOf(dragging), ti = order.indexOf(targetId);
      if (fi === -1 || ti === -1) return prev;
      order.splice(fi, 1); order.splice(ti, 0, dragging);
      return { ...prev, order };
    });
    setDragging(null); setDragOver(null);
  };

  const renderModule = (id) => {
    switch (id) {
      case "wallet":    return <WalletModule money={money} setShowMoneyModal={setShowMoneyModal} />;
      case "stocks":    return <StocksModule inventory={inventory} setInventory={setInventory} />;
      case "trends":    return <TrendsModule logs={logs} getDailyTotals={getDailyTotals} recentDays={recentDays} setSelectedDate={setSelectedDate} setShowLogModal={setShowLogModal} settings={settings} />;
      case "topexp":    return <TopExpensesModule logs={logs} />;
      case "topcals":   return settings.trackCalories ? <TopCaloriesModule logs={logs} /> : null;
      case "sleep":     return <SleepModule sleepLogs={sleepLogs} setSleepLogs={setSleepLogs} sleepSettings={sleepSettings} setSleepSettings={setSleepSettings} />;
      case "reading":   return <ReadingModule readingSubjects={readingSubjects} setReadingSubjects={setReadingSubjects} readingLogs={readingLogs} setReadingLogs={setReadingLogs} />;
      case "medicine":  return <MedicineModule medicineLogs={medicineLogs} setMedicineLogs={setMedicineLogs} />;
      case "debts":     return <DebtsModule debtRecords={debtRecords} setDebtRecords={setDebtRecords} />;
      case "gym":       return <GymModule gymData={gymData} setGymData={setGymData} />;
      case "exam":      return <ExamModule exams={exams} setShowExamModal={setShowExamModal} />;
      case "deadlines": return <DeadlinesModule todos={todos} exams={exams} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex gap-2">
        <button onClick={() => { setEditMode(!editMode); setShowAddModules(false); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition ${editMode ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
          {editMode ? <><Check size={16} /> Done Editing</> : <><LayoutDashboard size={16} /> Edit Dashboard</>}
        </button>
        {editMode && (
          <button onClick={() => setShowAddModules(!showAddModules)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold accent-btn transition">
            <Plus size={16} /> Add Modules
          </button>
        )}
      </div>
      {showAddModules && (
        <Card className="overflow-hidden animate-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-bold text-slate-800">Available Modules</p>
            <p className="text-xs text-slate-400 mt-0.5">Toggle to show/hide on your dashboard</p>
          </div>
          <div className="p-3 space-y-2">
            {ALL_MODULES.map(mod => {
              const isActive = dashboardConfig.visible.includes(mod.id);
              return (
                <div key={mod.id} className={`p-3 rounded-xl border transition ${isActive ? "accent-border accent-bg-soft" : "border-slate-100 bg-slate-50"}`}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{mod.label}</p>
                      <p className="text-xs text-slate-400">{mod.desc}</p>
                    </div>
                    <button onClick={() => toggleModule(mod.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition ${isActive ? "bg-rose-100 text-rose-600 hover:bg-rose-200" : "accent-btn"}`}>
                      {isActive ? "Remove" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {active.map(id => (
        <div key={id} draggable={editMode}
          onDragStart={() => setDragging(id)}
          onDragOver={e => { e.preventDefault(); setDragOver(id); }}
          onDrop={e => handleDrop(e, id)}
          className={`relative transition-all ${dragOver === id ? "ring-2 ring-offset-1 rounded-2xl" : ""}`}
          style={dragOver === id ? { "--tw-ring-color": "var(--accent-400)" } : {}}>
          {editMode && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-lg p-1 cursor-grab shadow-sm">
              <GripVertical size={16} className="text-slate-300" />
            </div>
          )}
          <div className={editMode ? "ml-5" : ""}>{renderModule(id)}</div>
          {editMode && (
            <button onClick={() => toggleModule(id)}
              className="absolute -right-1 -top-1 z-10 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 transition"><X size={14} /></button>
          )}
        </div>
      ))}
      {active.length === 0 && (
        <Card>
          <EmptyState icon={<LayoutDashboard size={32} />} title="No modules on your dashboard" subtitle={'Tap "Edit Dashboard" → "Add Modules" to get started'} />
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 6  CALENDAR VIEW
// ─────────────────────────────────────────────

function CalendarView({ logs, getDailyTotals, setSelectedDate, setShowLogModal, todos, onOpenTodo, settings, sleepLogs }) {
  const [cur, setCur] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const y = cur.getFullYear(), m = cur.getMonth();
  const mNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInM = new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(y, m, 1).getDay();
  let tSpent = 0, loggedDays = 0, tCals = 0;
  Array.from({ length: daysInM }, (_, i) => i + 1).forEach(d => {
    const k = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const t = getDailyTotals(k);
    tSpent += t.totalSpent;
    if (t.totalCals > 0 || t.totalSpent > 0) { loggedDays++; tCals += t.totalCals; }
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Card>
        <div className="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{mNames[m]} {y} Overview</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="accent-bg-soft p-3 rounded-xl border accent-border">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</span>
              <p className="text-2xl font-extrabold accent-text">₱{Math.round(tSpent)}</p>
            </div>
            {settings.trackCalories && (
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Avg. Daily Cals</span>
                <p className="text-2xl font-extrabold text-amber-600">{loggedDays > 0 ? Math.round(tCals / loggedDays) : 0} <span className="text-xs">kcal</span></p>
              </div>
            )}
          </div>
        </div>
      </Card>
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCur(p => new Date(p.getFullYear(), p.getMonth()-1, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition"><ChevronLeft size={20} /></button>
            <h2 className="font-extrabold text-slate-800">{mNames[m]} {y}</h2>
            <button onClick={() => setCur(p => new Date(p.getFullYear(), p.getMonth()+1, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => <div key={`p${i}`} className="h-16 bg-slate-50/30 rounded-lg" />)}
            {Array.from({ length: daysInM }, (_, i) => {
              const dayNum = i + 1;
              const ds = `${y}-${String(m+1).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
              const { totalCals: dc, totalSpent: ds2 } = getDailyTotals(ds);
              const isToday = ds === todayStr;
              const dt = todos[ds] || [];
              const hasTodos = dt.length > 0, allDone = hasTodos && dt.every(t => t.done);
              const hasSleep = (sleepLogs[ds] || []).length > 0;
              return (
                <button key={ds} onClick={() => { setSelectedDate(ds); setShowLogModal(true); }}
                  onDoubleClick={e => { e.preventDefault(); onOpenTodo(ds); }}
                  className={`h-16 flex flex-col justify-between p-1.5 rounded-lg border transition-all text-left ${isToday ? "border-current accent-text bg-opacity-5 accent-bg-soft font-bold" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] leading-none ${isToday ? "accent-text font-extrabold" : "text-slate-400"}`}>{dayNum}</span>
                    <span role="button" onClick={e => { e.stopPropagation(); onOpenTodo(ds); }}
                      className={`p-0.5 rounded transition ${hasTodos ? (allDone ? "text-emerald-400" : "text-rose-400") : "text-slate-300 hover:text-slate-500"}`}>
                      <ListTodo size={11} />
                    </span>
                  </div>
                  <div className="w-full space-y-0.5">
                    {settings.trackCalories && dc > 0 && <div className="text-[8px] bg-amber-50 text-amber-700 px-1 py-0.5 rounded font-extrabold truncate">{dc}c</div>}
                    {ds2 > 0 && <div className="text-[8px] bg-rose-50 text-rose-600 px-1 py-0.5 rounded font-extrabold truncate">₱{Math.round(ds2)}</div>}
                    {hasSleep && dc === 0 && ds2 === 0 && <div className="text-[8px] bg-violet-50 text-violet-600 px-1 py-0.5 rounded font-extrabold">😴</div>}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">Tap to log. Double-tap or <ListTodo size={10} className="inline" /> for to-dos.</p>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 7  PRESETS VIEW
// ─────────────────────────────────────────────

function DictionaryView({ dictionary, onEdit, onDelete, onAdd }) {
  const tc = { food: "bg-amber-100 text-amber-700", household: "bg-rose-100 text-rose-700", service: "bg-slate-100 text-slate-600" };
  return (
    <Card className="overflow-hidden animate-in fade-in duration-200">
      <CardHeader icon={<BookOpen size={20} className="text-slate-500" />} title="Presets Dictionary"
        action={<SoftAccentBtn onClick={onAdd}><Plus size={15} /> Add Preset</SoftAccentBtn>} />
      {dictionary.length === 0
        ? <EmptyState icon={<BookOpen size={32} />} title="No presets yet" subtitle="Add food, household, or service presets for quick logging" action={<SoftAccentBtn onClick={onAdd}><Plus size={15} /> Add Preset</SoftAccentBtn>} />
        : <div className="divide-y divide-slate-100">
            {dictionary.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition flex justify-between items-center">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${tc[item.type]}`}>{item.type}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex gap-4">
                    <span>₱{Math.round(item.cost)}</span>
                    {item.type === "food" && <span>{item.calories} kcal</span>}
                  </div>
                  {item.purchaseUnit !== item.unit && (
                    <div className="text-[10px] accent-text font-medium accent-bg-soft px-2 py-0.5 rounded mt-1 max-w-max">
                      {item.purchaseUnit} → {item.convertRate} {item.unit}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(item)} className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><Edit size={16} /></button>
                  <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
      }
    </Card>
  );
}

// ─────────────────────────────────────────────
// SECTION 8  TOOLS VIEW (Grades + Absents)
// ─────────────────────────────────────────────

function ToolsView() {
  const [tab, setTab] = useState("grades");
  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      <Card>
        <div className="flex p-1.5 gap-1">
          {[{ id: "grades", label: "Grades", icon: <GraduationCap size={15} /> }, { id: "absents", label: "Absents", icon: <Users size={15} /> }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${tab === t.id ? "accent-btn" : "text-slate-400 hover:text-slate-600"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </Card>
      {tab === "grades" ? <GradesTracker /> : <AbsentsTracker />}
    </div>
  );
}

// Grades helpers
const calcGrade = (subject) => {
  let total = 0, tw = 0;
  subject.components.forEach(c => {
    if (c.scores.length === 0) return;
    const avg = c.scores.reduce((a, s) => a + s.score, 0) / c.scores.reduce((a, s) => a + s.max, 0);
    total += avg * c.weight; tw += c.weight;
  });
  if (tw === 0) return null;
  const score = total / (tw / 100);
  return { score: Math.round(score * 10) / 10, passing: score >= subject.passingGrade };
};
const calcNeeded = (subject) => {
  const fc = subject.components.find(c => c.name.toLowerCase().includes("final"));
  if (!fc || fc.scores.length > 0) return null;
  let earned = 0, ew = 0;
  subject.components.forEach(c => {
    if (c.name.toLowerCase().includes("final") || c.scores.length === 0) return;
    const avg = c.scores.reduce((a, s) => a + s.score, 0) / c.scores.reduce((a, s) => a + s.max, 0);
    earned += avg * c.weight; ew += c.weight;
  });
  const needed = ((subject.passingGrade - earned) / fc.weight) * 100;
  return Math.max(0, Math.min(100, Math.round(needed * 10) / 10));
};

function GradesTracker() {
  const [subjects, setSubjects] = useLocalStorage("dorm_subjects_v1", []);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  if (selected) {
    const subj = subjects.find(s => s.id === selected);
    if (!subj) { setSelected(null); return null; }
    return <SubjectDetail subject={subj}
      onUpdate={u => setSubjects(prev => prev.map(s => s.id === u.id ? u : s))}
      onBack={() => setSelected(null)}
      onDelete={id => { setSubjects(prev => prev.filter(s => s.id !== id)); setSelected(null); }} />;
  }

  return (
    <div className="space-y-4">
      {showAdd && <AddSubjectForm onAdd={s => { setSubjects(prev => [...prev, s]); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />}
      {subjects.length === 0 && !showAdd
        ? <Card><EmptyState icon={<BookMarked size={32} />} title="No subjects yet" subtitle="Add a subject to start tracking grades"
            action={<button onClick={() => setShowAdd(true)} className="accent-btn px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16} /> Add Subject</button>} /></Card>
        : <>
            {subjects.map(s => <SubjectCard key={s.id} subject={s} onClick={() => setSelected(s.id)} />)}
            <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-slate-400 hover:text-slate-600 transition text-sm">
              <Plus size={16} /> Add Subject
            </button>
          </>
      }
    </div>
  );
}

function SubjectCard({ subject, onClick }) {
  const grade = calcGrade(subject);
  const needed = calcNeeded(subject);
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-slate-300 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-bold text-slate-800">{subject.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">Passing: {subject.passingGrade}% · {subject.components.length} components</p>
        </div>
        <div className="text-right">
          {grade !== null
            ? <><span className={`text-2xl font-extrabold block ${grade.passing ? "text-emerald-600" : "text-rose-500"}`}>{grade.score}%</span>
                <span className={`text-[10px] font-bold uppercase ${grade.passing ? "text-emerald-500" : "text-rose-400"}`}>{grade.passing ? "Passing" : "Failing"}</span></>
            : <span className="text-slate-300 text-sm">No data</span>
          }
        </div>
      </div>
      {needed !== null && (
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs font-bold text-amber-700">
          Need {needed}% in Finals to pass
        </div>
      )}
    </button>
  );
}

function AddSubjectForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [passing, setPassing] = useState("60");
  const [comps, setComps] = useState([
    { id: "c1", name: "Quizzes", weight: 25, scores: [] },
    { id: "c2", name: "Groupwork", weight: 25, scores: [] },
    { id: "c3", name: "Attendance", weight: 25, scores: [] },
    { id: "c4", name: "Finals", weight: 25, scores: [] },
  ]);
  const [cn, setCn] = useState(""), [cw, setCw] = useState("");
  const total = comps.reduce((a, c) => a + c.weight, 0);
  const addComp = () => {
    if (!cn.trim() || !cw) return;
    setComps(p => [...p, { id: "c" + Date.now(), name: cn.trim(), weight: parseFloat(cw), scores: [] }]);
    setCn(""); setCw("");
  };
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || total !== 100) return;
    onAdd({ id: "sub" + Date.now(), name: name.trim(), passingGrade: parseFloat(passing) || 60, components: comps, notes: "" });
  };
  return (
    <Card>
      <CardHeader icon={<Plus size={20} className="text-slate-500" />} title="Add Subject" />
      <form onSubmit={submit} className="p-5 space-y-4">
        <input required type="text" placeholder="Subject name" value={name} onChange={e => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-3 outline-none text-sm focus:ring-2 focus:ring-slate-300" />
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Grade Needed to Pass (%)</label>
          <input type="number" min="0" max="100" value={passing} onChange={e => setPassing(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 outline-none text-sm focus:ring-2 focus:ring-slate-300" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-500">Components</label>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${total === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{total}% / 100%</span>
          </div>
          <div className="space-y-2">
            {comps.map(c => (
              <div key={c.id} className="flex gap-2 items-center">
                <input type="text" value={c.name} onChange={e => setComps(p => p.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))}
                  className="flex-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-slate-200" />
                <input type="number" min="0" max="100" value={c.weight} onChange={e => setComps(p => p.map(x => x.id === c.id ? { ...x, weight: parseFloat(e.target.value) || 0 } : x))}
                  className="w-16 border border-slate-200 rounded-lg p-2 text-sm text-center outline-none focus:ring-2 focus:ring-slate-200" />
                <span className="text-xs text-slate-400">%</span>
                <button type="button" onClick={() => setComps(p => p.filter(x => x.id !== c.id))} className="text-slate-300 hover:text-rose-500 transition"><X size={16} /></button>
              </div>
            ))}
            <div className="flex gap-2 items-center pt-1 border-t border-slate-100">
              <input type="text" placeholder="Component name" value={cn} onChange={e => setCn(e.target.value)}
                className="flex-1 border border-dashed border-slate-200 rounded-lg p-2 text-sm outline-none bg-slate-50" />
              <input type="number" placeholder="%" value={cw} onChange={e => setCw(e.target.value)}
                className="w-16 border border-dashed border-slate-200 rounded-lg p-2 text-sm text-center outline-none bg-slate-50" />
              <button type="button" onClick={addComp} className="accent-soft-btn rounded-lg p-2 transition"><Plus size={16} /></button>
            </div>
          </div>
        </div>
        {total !== 100 && <p className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">⚠ Weights must total exactly 100%</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={total !== 100} className="flex-1 py-3 accent-btn rounded-xl text-sm font-bold disabled:opacity-40 transition">Save Subject</button>
        </div>
      </form>
    </Card>
  );
}

function SubjectDetail({ subject, onUpdate, onBack, onDelete }) {
  const [activeComp, setActiveComp] = useState(null);
  const [si, setSi] = useState(""), [mi, setMi] = useState(""), [sl, setSl] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(subject.notes || "");
  const grade = calcGrade(subject);
  const needed = calcNeeded(subject);

  const addScore = (compId) => {
    const s = parseFloat(si), mx = parseFloat(mi);
    if (isNaN(s) || isNaN(mx) || mx <= 0) return;
    onUpdate({ ...subject, components: subject.components.map(c => c.id === compId ? { ...c, scores: [...c.scores, { id: "sc" + Date.now(), score: s, max: mx, label: sl.trim() }] } : c) });
    setSi(""); setMi(""); setSl(""); setActiveComp(null);
  };
  const delScore = (compId, scId) => onUpdate({ ...subject, components: subject.components.map(c => c.id === compId ? { ...c, scores: c.scores.filter(s => s.id !== scId) } : c) });
  const saveNotes = () => { onUpdate({ ...subject, notes }); setShowNotes(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <h2 className="font-extrabold text-slate-800 text-lg">{subject.name}</h2>
          <p className="text-xs text-slate-400">Passing: {subject.passingGrade}%</p>
        </div>
        <button onClick={() => setShowNotes(true)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition" title="Notes"><FileText size={18} /></button>
        <button onClick={() => onDelete(subject.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"><Trash2 size={18} /></button>
      </div>

      {showNotes && (
        <Card>
          <div className="p-5">
            <p className="text-sm font-bold text-slate-700 mb-2">Notes for {subject.name}</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6} placeholder="Dump anything here — formulas, reminders, tips..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-slate-300 resize-none" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setNotes(subject.notes || ""); setShowNotes(false); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={saveNotes} className="flex-1 py-2.5 accent-btn rounded-xl text-sm font-bold transition">Save Notes</button>
            </div>
          </div>
        </Card>
      )}

      {grade !== null && (
        <Card>
          <div className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Grade</p>
              <p className={`text-4xl font-extrabold ${grade.passing ? "text-emerald-600" : "text-rose-500"}`}>{grade.score}%</p>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold ${grade.passing ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
              {grade.passing ? "✓ Passing" : "✗ Failing"}
            </div>
          </div>
          {needed !== null && (
            <div className="px-5 pb-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm font-bold text-amber-700">Need {needed}% in Finals to pass</div>
            </div>
          )}
        </Card>
      )}

      {subject.components.map(comp => {
        const hasScores = comp.scores.length > 0;
        const tScore = comp.scores.reduce((a, s) => a + s.score, 0);
        const tMax = comp.scores.reduce((a, s) => a + s.max, 0);
        const pct = tMax > 0 ? Math.round((tScore / tMax) * 100 * 10) / 10 : null;
        const isFinals = comp.name.toLowerCase().includes("final");
        return (
          <Card key={comp.id}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-slate-800">{comp.name}</p>
                  <p className="text-xs text-slate-400">{comp.weight}% of grade</p>
                </div>
                {pct !== null
                  ? <span className={`text-lg font-extrabold ${pct >= subject.passingGrade ? "text-emerald-600" : "text-rose-500"}`}>{pct}%</span>
                  : isFinals && needed !== null
                    ? <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">Need {needed}%</span>
                    : <span className="text-slate-300 text-xs">No scores</span>
                }
              </div>
              {hasScores && (
                <div className="space-y-1.5 mb-3">
                  {comp.scores.map(sc => (
                    <div key={sc.id} className="flex justify-between items-center text-sm bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-slate-500">{sc.label || `Score #${comp.scores.indexOf(sc) + 1}`}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{sc.score}/{sc.max}</span>
                        <span className="text-xs text-slate-400">({Math.round((sc.score / sc.max) * 100)}%)</span>
                        <button onClick={() => delScore(comp.id, sc.id)} className="text-slate-300 hover:text-rose-500 transition"><X size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeComp === comp.id ? (
                <div className="accent-bg-soft border accent-border rounded-xl p-3 space-y-2 animate-in slide-in-from-top-1 duration-100">
                  <input type="text" placeholder="Label (optional, e.g. Quiz 1)" value={sl} onChange={e => setSl(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-300" />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Score</label>
                      <input type="number" min="0" placeholder="e.g. 12" value={si} onChange={e => setSi(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-300" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Max</label>
                      <input type="number" min="1" placeholder="e.g. 15" value={mi} onChange={e => setMi(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-300" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveComp(null)} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg font-bold text-slate-400 hover:bg-slate-50 transition">Cancel</button>
                    <button onClick={() => addScore(comp.id)} className="flex-1 py-2 text-sm accent-btn rounded-lg font-bold transition">Add Score</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setActiveComp(comp.id)} className="w-full py-2 text-xs font-bold accent-text accent-bg-soft rounded-xl hover:accent-bg-100 transition flex items-center justify-center gap-1">
                  <Plus size={13} /> Add Score
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AbsentsTracker() {
  const [subjects] = useLocalStorage("dorm_subjects_v1", []);
  const [absentLogs, setAbsentLogs] = useLocalStorage("dorm_absents_v1", {});
  const [showAdd, setShowAdd] = useState(null);
  const [absentDate, setAbsentDate] = useState(todayStr);
  const [maxOverride, setMaxOverride] = useLocalStorage("dorm_abs_max_v1", {});
  const [editMax, setEditMax] = useState(null);
  const [maxInput, setMaxInput] = useState("");

  const log = (subjId) => {
    const key = `${subjId}_${absentDate}`;
    setAbsentLogs(prev => { if (Object.keys(prev).includes(key)) return prev; return { ...prev, [key]: { subjId, date: absentDate, id: key } }; });
    setShowAdd(null);
  };
  const del = (key) => setAbsentLogs(prev => { const c = { ...prev }; delete c[key]; return c; });
  const getAbsents = (id) => Object.values(absentLogs).filter(a => a.subjId === id).sort((a, b) => a.date.localeCompare(b.date));

  if (subjects.length === 0)
    return <Card><EmptyState icon={<Users size={32} />} title="No subjects added" subtitle="Add subjects first in the Grades tab" /></Card>;

  return (
    <div className="space-y-4">
      {subjects.map(subj => {
        const abs = getAbsents(subj.id);
        const max = maxOverride[subj.id] ?? 6;
        const pct = Math.min(100, (abs.length / max) * 100);
        return (
          <Card key={subj.id}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-slate-800">{subj.name}</p>
                  {editMax === subj.id ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <input type="number" min="1" value={maxInput} onChange={e => setMaxInput(e.target.value)}
                        className="w-14 border border-slate-200 rounded p-1 text-xs font-bold outline-none bg-white" />
                      <span className="text-xs text-slate-400">max</span>
                      <button onClick={() => { setMaxOverride(p => ({ ...p, [subj.id]: parseInt(maxInput) || 6 })); setEditMax(null); }}
                        className="p-0.5 bg-emerald-500 text-white rounded"><Check size={11} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditMax(subj.id); setMaxInput(max.toString()); }}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-0.5">
                      Max: {max} <Edit size={9} />
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xl font-extrabold block ${abs.length >= max ? "text-rose-500" : abs.length >= max * 0.7 ? "text-amber-500" : "text-emerald-600"}`}>
                    {abs.length}/{max}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Absents</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                <div className={`h-2 rounded-full transition-all ${abs.length >= max ? "bg-rose-500" : abs.length >= max * 0.7 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
              </div>
              {abs.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {abs.map(a => (
                    <div key={a.id} className="flex justify-between items-center text-xs bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                      <span className="font-bold text-rose-700">{new Date(a.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                      <button onClick={() => del(a.id)} className="text-slate-300 hover:text-rose-500 transition"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              {showAdd === subj.id ? (
                <div className="flex gap-2 items-center">
                  <input type="date" value={absentDate} onChange={e => setAbsentDate(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-rose-300" />
                  <button onClick={() => log(subj.id)} className="bg-rose-500 text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-rose-600 transition">Log</button>
                  <button onClick={() => setShowAdd(null)} className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><X size={16} /></button>
                </div>
              ) : (
                <button onClick={() => { setShowAdd(subj.id); setAbsentDate(todayStr); }}
                  className="w-full py-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition flex items-center justify-center gap-1">
                  <Plus size={13} /> Log Absent
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 9  SETTINGS VIEW
// ─────────────────────────────────────────────

function SettingsView({ settings, setSettings }) {
  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      <Card>
        <CardHeader icon={<Utensils size={20} className="text-slate-500" />} title="Calorie Tracking" />
        <div className="p-5">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Track Calories</p>
              <p className="text-xs text-slate-400 mt-0.5">Show calorie inputs, logs, and graphs across the app</p>
            </div>
            <Toggle on={settings.trackCalories} onToggle={() => setSettings(p => ({ ...p, trackCalories: !p.trackCalories }))} />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Settings size={20} className="text-slate-500" />} title="Accent Color" />
        <div className="p-5">
          <p className="text-xs text-slate-400 mb-3">Changes the color theme throughout the app</p>
          <div className="grid grid-cols-4 gap-3">
            {ACCENTS.map(a => (
              <button key={a.value} onClick={() => setSettings(p => ({ ...p, accent: a.value }))}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition ${settings.accent === a.value ? "border-2 bg-slate-50" : "border-slate-100 hover:border-slate-300"}`}
                style={settings.accent === a.value ? { borderColor: a.hex } : {}}>
                <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: a.hex }}>
                  {settings.accent === a.value && <div className="w-full h-full rounded-full flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                </div>
                <span className="text-[10px] font-bold text-slate-500">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 10  MODALS
// ─────────────────────────────────────────────

function AdjustMoneyModal({ money, setMoney, close }) {
  const [amount, setAmount] = useState("");
  const [isAdding, setIsAdding] = useState(true);
  const submit = (e) => {
    e.preventDefault();
    const v = parseInt(amount, 10);
    if (!isNaN(v)) { setMoney(prev => isAdding ? prev + v : prev - v); close(); }
  };
  return (
    <ModalWrapper close={close} title="Adjust Wallet">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button type="button" onClick={() => setIsAdding(true)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${isAdding ? "bg-white shadow accent-text" : "text-slate-400"}`}>Add Money</button>
          <button type="button" onClick={() => setIsAdding(false)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${!isAdding ? "bg-white shadow text-rose-600" : "text-slate-400"}`}>Deduct</button>
        </div>
        <input type="number" step="1" required autoFocus placeholder="0" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-3 text-lg focus:ring-2 focus:ring-slate-200 outline-none" />
        <button type="submit" className="w-full accent-btn py-3 rounded-xl font-bold transition">Confirm</button>
      </form>
    </ModalWrapper>
  );
}

function AddDictionaryModal({ dictionary, setDictionary, editingPreset, close }) {
  const [type, setType] = useState(editingPreset?.type ?? "food");
  const [name, setName] = useState(editingPreset?.name ?? "");
  const [unit, setUnit] = useState(editingPreset?.unit ?? "pcs");
  const [pu, setPu] = useState(editingPreset?.purchaseUnit ?? "pcs");
  const [cr, setCr] = useState(editingPreset?.convertRate?.toString() ?? "1");
  const [cost, setCost] = useState(editingPreset?.cost?.toString() ?? "");
  const [cals, setCals] = useState(editingPreset?.calories?.toString() ?? "");
  const submit = (e) => {
    e.preventDefault();
    const item = { id: editingPreset ? editingPreset.id : "d" + Date.now(), name, type, unit, purchaseUnit: pu, convertRate: parseFloat(cr) || 1, cost: Math.round(parseFloat(cost)) || 0, calories: type === "food" ? Math.round(parseFloat(cals)) || 0 : 0 };
    if (editingPreset) setDictionary(prev => prev.map(i => i.id === editingPreset.id ? item : i));
    else setDictionary([...dictionary, item]);
    close();
  };
  return (
    <ModalWrapper close={close} title={editingPreset ? "Edit Preset" : "Create Preset"}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          {["food","household","service"].map(t => (
            <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg transition capitalize ${type === t ? "bg-white shadow accent-text" : "text-slate-400"}`}>{t}</button>
          ))}
        </div>
        <input required type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-3 outline-none text-sm focus:ring-2 focus:ring-slate-200" />
        {type !== "service" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Buy Unit</label>
                <input required type="text" value={pu} onChange={e => setPu(e.target.value)} placeholder="kilos, pack..."
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none text-sm focus:ring-2 focus:ring-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Stock Unit</label>
                <input required type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="cups, pcs..."
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none text-sm focus:ring-2 focus:ring-slate-200" />
              </div>
            </div>
            {pu !== unit && (
              <div className="accent-bg-soft p-3 rounded-xl border accent-border">
                <label className="block text-xs font-bold accent-text mb-1">1 {pu || "buy"} =</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.1" required value={cr} onChange={e => setCr(e.target.value)}
                    className="w-20 border border-slate-200 rounded p-1.5 outline-none bg-white focus:ring-2 focus:ring-slate-200" />
                  <span className="text-sm accent-text">{unit || "pcs"} in stock</span>
                </div>
              </div>
            )}
          </>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Price (₱)</label>
            <input required type="number" step="1" value={cost} onChange={e => setCost(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 outline-none text-sm focus:ring-2 focus:ring-slate-200" />
          </div>
          {type === "food" && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Calories per stock unit</label>
              <input required type="number" value={cals} onChange={e => setCals(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 outline-none text-sm focus:ring-2 focus:ring-slate-200" />
            </div>
          )}
        </div>
        <button type="submit" className="w-full accent-btn py-3 rounded-xl font-bold transition">{editingPreset ? "Update Preset" : "Save Preset"}</button>
      </form>
    </ModalWrapper>
  );
}

function DailyLogModal({ date, logs, setLogs, inventory, setInventory, dictionary, money, setMoney, close, settings }) {
  const [tab, setTab] = useState(settings.trackCalories ? "ate" : "purchase");
  const day = logs[date] || { foods: [], purchases: [], expenses: [] };
  const [selItem, setSelItem] = useState("");
  const [qty, setQty] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customCost, setCustomCost] = useState("");
  const [eatNow, setEatNow] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [qn, setQn] = useState(""), [qc, setQc] = useState(""), [qcal, setQcal] = useState("");

  const ud = (() => {
    if (tab === "ate" && !quickMode) { const inv = inventory[selItem]; return { unit: inv?.unit || "", isCups: inv?.unit?.toLowerCase() === "cups" }; }
    if (tab === "purchase") { const d = dictionary.find(x => x.id === selItem); return { unit: d?.purchaseUnit || "", isCups: d?.purchaseUnit?.toLowerCase() === "cups" }; }
    return { unit: "", isCups: false };
  })();
  const selDict = dictionary.find(d => d.id === selItem);
  const invFoods = Object.entries(inventory).filter(([, i]) => i.type === "food" && i.qty > 0);
  const purchPresets = dictionary.filter(d => d.type === "food" || d.type === "household");
  const svcPresets = dictionary.filter(d => d.type === "service");

  const logAte = (e) => {
    e.preventDefault();
    const nl = { ...logs }; if (!nl[date]) nl[date] = { foods: [], purchases: [], expenses: [] };
    if (quickMode) {
      const n = qn || "Direct Meal"; const c = Math.round(parseFloat(qc)) || 0; const cal = Math.round(parseFloat(qcal)) || 0;
      if (c > 0) setMoney(p => Math.round(p - c));
      nl[date].foods.push({ name: n + " (Quick)", qty: 1, cals: cal, isQuick: true, quickCost: c });
      if (c > 0) nl[date].expenses.push({ name: n + " (Outside Cost)", cost: c, isQuickLinked: true, quickName: n + " (Quick)" });
      setLogs(nl); setQn(""); setQc(""); setQcal(""); setQuickMode(false); return;
    }
    if (!selItem || !qty) return;
    const inv = inventory[selItem]; if (!inv) return;
    const dict = dictionary.find(d => d.id === inv.dictId);
    const isCups = inv.unit.toLowerCase() === "cups";
    const pq = isCups ? parseFloat(qty) : Math.round(parseFloat(qty));
    const cals = dict ? Math.round(dict.calories * pq) : 0;
    const ni = { ...inventory }; ni[selItem].qty = Math.max(0, ni[selItem].qty - pq);
    const idx = nl[date].foods.findIndex(f => f.name === selItem);
    if (idx > -1) { nl[date].foods[idx].qty += pq; nl[date].foods[idx].cals += cals; }
    else nl[date].foods.push({ name: selItem, qty: pq, cals });
    setInventory(ni); setLogs(nl); setQty(""); setSelItem("");
  };

  const logPurchase = (e) => {
    e.preventDefault(); if (!selItem || !qty) return;
    const dict = dictionary.find(d => d.id === selItem);
    const isCups = dict.purchaseUnit.toLowerCase() === "cups";
    const pq = isCups ? parseFloat(qty) : Math.round(parseFloat(qty));
    const cost = customCost ? Math.round(parseFloat(customCost)) : Math.round(dict.cost * pq);
    setMoney(p => Math.round(p - cost));
    const nl = { ...logs }; if (!nl[date]) nl[date] = { foods: [], purchases: [], expenses: [] };
    const ni = { ...inventory };
    if (eatNow && dict.type === "food") {
      const sq = pq * (dict.convertRate || 1);
      nl[date].foods.push({ name: dict.name, qty: sq, cals: Math.round(dict.calories * sq), cameFromImmediateBuy: true, buyCost: cost });
      nl[date].purchases.push({ name: dict.name, qty: pq, cost, wasEatenImmediately: true });
    } else {
      const sq = pq * (dict.convertRate || 1);
      if (ni[dict.name]) ni[dict.name].qty += sq;
      else ni[dict.name] = { unit: dict.unit, qty: sq, type: dict.type, dictId: dict.id };
      nl[date].purchases.push({ name: dict.name, qty: pq, cost });
    }
    setInventory(ni); setLogs(nl); setQty(""); setCustomCost(""); setSelItem(""); setEatNow(false);
  };

  const logExpense = (e) => {
    e.preventDefault(); if (!selItem && !customDesc) return;
    let n = customDesc, c = Math.round(parseFloat(customCost));
    if (selItem) { const d = dictionary.find(x => x.id === selItem); n = d.name; if (!c) c = Math.round(d.cost); }
    setMoney(p => Math.round(p - c));
    const nl = { ...logs }; if (!nl[date]) nl[date] = { foods: [], purchases: [], expenses: [] };
    nl[date].expenses.push({ name: n, cost: c });
    setLogs(nl); setCustomDesc(""); setCustomCost(""); setSelItem("");
  };

  const delFood = (i) => {
    const nl = { ...logs }; const d = nl[date]; if (!d) return;
    const item = d.foods[i]; if (!item) return;
    if (!item.isQuick && !item.cameFromImmediateBuy) { const ni = { ...inventory }; if (ni[item.name]) { ni[item.name].qty += item.qty; setInventory(ni); } }
    if (item.isQuick && item.quickCost > 0) { setMoney(p => p + item.quickCost); d.expenses = d.expenses.filter(e => !(e.isQuickLinked && e.quickName === item.name)); }
    if (item.cameFromImmediateBuy) { setMoney(p => p + item.buyCost); d.purchases = d.purchases.filter(p => !(p.name === item.name && p.wasEatenImmediately)); }
    d.foods.splice(i, 1); setLogs(nl);
  };
  const delPurch = (i) => {
    const nl = { ...logs }; const d = nl[date]; if (!d) return;
    const item = d.purchases[i]; if (!item) return;
    setMoney(p => p + item.cost);
    if (item.wasEatenImmediately) d.foods = d.foods.filter(f => !(f.name === item.name && f.cameFromImmediateBuy));
    else { const ni = { ...inventory }; if (ni[item.name]) { const dict = dictionary.find(x => x.name === item.name); ni[item.name].qty = Math.max(0, ni[item.name].qty - item.qty * (dict?.convertRate || 1)); setInventory(ni); } }
    d.purchases.splice(i, 1); setLogs(nl);
  };
  const delExp = (i) => {
    const nl = { ...logs }; const d = nl[date]; if (!d) return;
    const item = d.expenses[i]; if (!item) return;
    setMoney(p => p + item.cost);
    if (item.isQuickLinked) d.foods = d.foods.filter(f => !(f.isQuick && f.name === item.quickName));
    d.expenses.splice(i, 1); setLogs(nl);
  };

  const tc = day.foods.reduce((s, f) => s + (f.cals || 0), 0);
  const ts = day.purchases.reduce((s, p) => s + (p.cost || 0), 0) + day.expenses.reduce((s, e) => s + (e.cost || 0), 0);

  const tabCls = (t, color) => `flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === t ? `border-current ${color}` : "border-transparent text-slate-400"}`;

  return (
    <ModalWrapper close={close} title={new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}>
      <div className="flex gap-3 mb-5">
        {settings.trackCalories && (
          <div className="flex-1 bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Calories</p>
            <p className="text-xl font-extrabold text-amber-500">{tc}</p>
          </div>
        )}
        <div className="flex-1 bg-rose-50 rounded-xl p-3 border border-rose-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Spent</p>
          <p className="text-xl font-extrabold text-rose-500">₱{Math.round(ts)}</p>
        </div>
      </div>
      <div className="flex border-b border-slate-200 mb-5">
        {settings.trackCalories && <button onClick={() => { setTab("ate"); setSelItem(""); setQty(""); setQuickMode(false); }} className={tabCls("ate", "accent-text")}>Foods Ate</button>}
        <button onClick={() => { setTab("purchase"); setSelItem(""); setQty(""); }} className={tabCls("purchase", "accent-text")}>Purchases</button>
        <button onClick={() => { setTab("expense"); setSelItem(""); setQty(""); }} className={tabCls("expense", "text-rose-500")}>Expenses</button>
      </div>

      {tab === "ate" && settings.trackCalories && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-100">
            <div>
              <span className="text-xs font-bold text-amber-800 block">Quick Log Outside Meal</span>
              <span className="text-[10px] text-slate-400">Fast on-the-fly meal logging</span>
            </div>
            <button type="button" onClick={() => setQuickMode(!quickMode)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${quickMode ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
              {quickMode ? "Custom Mode" : "Stock Mode"}
            </button>
          </div>
          {quickMode ? (
            <form onSubmit={logAte} className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3">
              <input required type="text" placeholder="Meal name" value={qn} onChange={e => setQn(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
              <div className="grid grid-cols-2 gap-2">
                <input required type="number" step="1" placeholder="Cost (₱)" value={qc} onChange={e => setQc(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
                <input required type="number" step="1" placeholder="Calories" value={qcal} onChange={e => setQcal(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg hover:bg-amber-600 transition text-sm">Log Meal</button>
            </form>
          ) : (
            <form onSubmit={logAte} className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
              <select required value={selItem} onChange={e => setSelItem(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200">
                <option value="">-- Select from Stocked Foods --</option>
                {invFoods.map(([n, d]) => <option key={n} value={n}>{n} (Stock: {d.unit === "cups" ? Number(d.qty).toFixed(1) : Math.round(d.qty)} {d.unit})</option>)}
              </select>
              <div className="flex gap-3">
                <input required type="number" step={ud.isCups ? "0.1" : "1"} min={ud.isCups ? "0.1" : "1"} placeholder={`Qty (${ud.unit || "unit"})`} value={qty} onChange={e => setQty(e.target.value)}
                  className="w-1/2 border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
                <button type="submit" className="w-1/2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition text-sm">Log Consumed</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === "purchase" && (
        <form onSubmit={logPurchase} className="mb-6 accent-bg-soft p-4 rounded-xl border accent-border space-y-3">
          <select required value={selItem} onChange={e => { setSelItem(e.target.value); setEatNow(false); }}
            className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200">
            <option value="">-- Choose Preset to Buy --</option>
            {purchPresets.map(d => <option key={d.id} value={d.id}>{d.name} (₱{Math.round(d.cost)} per {d.purchaseUnit})</option>)}
          </select>
          {selDict?.type === "food" && settings.trackCalories && (
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-100 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" checked={eatNow} onChange={e => setEatNow(e.target.checked)} />
              <div>
                <p className="text-amber-700">Eat Immediately (Outside Food)</p>
                <p className="text-[10px] text-slate-400 font-normal">Adds calories instantly, skips stock.</p>
              </div>
            </label>
          )}
          <div className="flex gap-3">
            <input required type="number" step={ud.isCups ? "0.1" : "1"} min={ud.isCups ? "0.1" : "1"} placeholder={`Qty (${ud.unit || "units"})`} value={qty} onChange={e => setQty(e.target.value)}
              className="w-1/3 border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
            <input type="number" step="1" placeholder="Override Cost" value={customCost} onChange={e => setCustomCost(e.target.value)}
              className="w-1/3 border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
            <button type="submit" className="w-1/3 accent-btn font-bold rounded-lg text-sm">Buy & Add</button>
          </div>
        </form>
      )}

      {tab === "expense" && (
        <form onSubmit={logExpense} className="mb-6 bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-3">
          <select value={selItem} onChange={e => { setSelItem(e.target.value); setCustomDesc(""); }}
            className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200">
            <option value="">-- Choose Preset or Type Custom --</option>
            {svcPresets.map(d => <option key={d.id} value={d.id}>{d.name} (₱{Math.round(d.cost)})</option>)}
          </select>
          {!selItem && (
            <input required type="text" placeholder="Custom description" value={customDesc} onChange={e => setCustomDesc(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
          )}
          <div className="flex gap-3">
            <input required={!selItem} type="number" step="1" placeholder="Cost (₱)" value={customCost} onChange={e => setCustomCost(e.target.value)}
              className="w-2/3 border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-slate-200" />
            <button type="submit" className="w-1/3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition text-sm">Log</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {settings.trackCalories && day.foods.length > 0 && (
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase mb-2 tracking-wider">Foods Ate</p>
            <ul className="space-y-1">
              {day.foods.map((f, i) => (
                <li key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-100">
                  <span className="text-slate-600">{f.name.toLowerCase().includes("rice") ? Number(f.qty).toFixed(1) : Math.round(f.qty)}x {f.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-500">{Math.round(f.cals)} kcal</span>
                    <button onClick={() => delFood(i)} className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition"><Trash2 size={13} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {day.purchases.length > 0 && (
          <div>
            <p className="text-xs font-bold accent-text uppercase mb-2 tracking-wider">Purchases</p>
            <ul className="space-y-1">
              {day.purchases.map((p, i) => (
                <li key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-100">
                  <span className="text-slate-600">{Math.round(p.qty)}x {p.name} {p.wasEatenImmediately && <span className="text-[10px] text-amber-500 font-bold">(Eaten)</span>}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-500">₱{Math.round(p.cost)}</span>
                    <button onClick={() => delPurch(i)} className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition"><Trash2 size={13} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {day.expenses.length > 0 && (
          <div>
            <p className="text-xs font-bold text-rose-400 uppercase mb-2 tracking-wider">Other Expenses</p>
            <ul className="space-y-1">
              {day.expenses.map((ex, i) => (
                <li key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-100">
                  <span className="text-slate-600">{ex.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-500">₱{Math.round(ex.cost)}</span>
                    <button onClick={() => delExp(i)} className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition"><Trash2 size={13} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {day.foods.length === 0 && day.purchases.length === 0 && day.expenses.length === 0 && (
          <p className="text-center text-slate-300 text-sm py-6 italic">No records for this day.</p>
        )}
      </div>
    </ModalWrapper>
  );
}

function TodoModal({ date, todos, setTodos, close }) {
  const [text, setText] = useState("");
  const dt = todos[date] || [];
  const add = (e) => { e.preventDefault(); if (!text.trim()) return; setTodos(p => ({ ...p, [date]: [...(p[date] || []), { id: "t" + Date.now(), text: text.trim(), done: false }] })); setText(""); };
  const toggle = (id) => setTodos(p => ({ ...p, [date]: (p[date] || []).map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  const del = (id) => setTodos(p => { const u = (p[date] || []).filter(t => t.id !== id); const c = { ...p }; if (u.length === 0) delete c[date]; else c[date] = u; return c; });
  return (
    <ModalWrapper close={close} title={`To-Do — ${new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input type="text" autoFocus placeholder="Add a task..." className="flex-1 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          value={text} onChange={e => setText(e.target.value)} />
        <button type="submit" className="accent-btn font-bold px-4 rounded-xl"><Plus size={18} /></button>
      </form>
      {dt.length === 0 ? <p className="text-center text-slate-300 text-sm py-6 italic">No tasks yet.</p> :
        <ul className="space-y-2">
          {dt.map(t => (
            <li key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50">
              <button onClick={() => toggle(t.id)} className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition ${t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-slate-500"}`}>
                {t.done && <Check size={12} />}
              </button>
              <span className={`text-sm flex-1 ${t.done ? "line-through text-slate-400" : "text-slate-700"}`}>{t.text}</span>
              <button onClick={() => del(t.id)} className="text-slate-300 hover:text-rose-500 p-1 rounded transition"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      }
    </ModalWrapper>
  );
}

function ExamModalComp({ exams, setExams, close }) {
  const [subj, setSubj] = useState(""), [date, setDate] = useState(todayStr), [label, setLabel] = useState("");
  const add = (e) => { e.preventDefault(); if (!subj.trim() || !date) return; setExams(p => [...p, { id: "e" + Date.now(), subject: subj.trim(), date, label: label.trim() }]); setSubj(""); setLabel(""); };
  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <ModalWrapper close={close} title="Exam Countdown">
      <form onSubmit={add} className="space-y-3 mb-5 bg-violet-50/50 p-4 rounded-xl border border-violet-100">
        <input required type="text" placeholder="Subject / Exam Name" value={subj} onChange={e => setSubj(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-violet-200" />
        <div className="grid grid-cols-2 gap-2">
          <input required type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-violet-200" />
          <input type="text" placeholder="Label (optional)" value={label} onChange={e => setLabel(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-violet-200" />
        </div>
        <button type="submit" className="w-full bg-violet-500 text-white font-bold py-2.5 rounded-lg hover:bg-violet-600 transition text-sm">Add Exam</button>
      </form>
      {sorted.length === 0 ? <p className="text-center text-slate-300 text-sm py-4 italic">No exams added yet.</p> :
        <ul className="space-y-2">
          {sorted.map(ex => (
            <li key={ex.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div>
                <p className="font-bold text-sm text-slate-700">{ex.subject}</p>
                <p className="text-[11px] text-slate-400">{new Date(ex.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}{ex.label && ` · ${ex.label}`}</p>
              </div>
              <button onClick={() => setExams(p => p.filter(e => e.id !== ex.id))} className="text-slate-300 hover:text-rose-500 p-1.5 rounded hover:bg-rose-50 transition"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      }
    </ModalWrapper>
  );
}

// ─────────────────────────────────────────────
// SECTION 11  ROOT APP
// ─────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [money, setMoney] = useLocalStorage("dorm_money_v4", 0);
  const [dictionary, setDictionary] = useLocalStorage("dorm_dict_v4", initialDict);
  const [inventory, setInventory] = useLocalStorage("dorm_inv_v4", initialInventory);
  const [logs, setLogs] = useLocalStorage("dorm_logs_v4", initialLogs);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [todos, setTodos] = useLocalStorage("dorm_todos_v1", {});
  const [exams, setExams] = useLocalStorage("dorm_exams_v1", []);
  const [settings, setSettings] = useLocalStorage("dorm_settings_v1", DEFAULT_SETTINGS);
  const [sleepLogs, setSleepLogs] = useLocalStorage("dorm_sleep_v1", {});
  const [sleepSettings, setSleepSettings] = useLocalStorage("dorm_sleep_settings_v1", DEFAULT_SLEEP_SETTINGS);
  const [readingSubjects, setReadingSubjects] = useLocalStorage("dorm_reading_subjects_v1", []);
  const [readingLogs, setReadingLogs] = useLocalStorage("dorm_reading_logs_v1", {});
  const [medicineLogs, setMedicineLogs] = useLocalStorage("dorm_medicine_v1", {});
  const [debtRecords, setDebtRecords] = useLocalStorage("dorm_debts_v1", []);
  const [gymData, setGymData] = useLocalStorage("dorm_gym_v1", { sessions: [] });
  const [dashboardConfig, setDashboardConfig] = useLocalStorage("dorm_dashboard_config_v1", DEFAULT_DASHBOARD_CONFIG);

  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDictModal, setShowDictModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [todoModalDate, setTodoModalDate] = useState(todayStr);
  const [showExamModal, setShowExamModal] = useState(false);

  // Apply accent to <html> data attr so CSS vars take effect
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", settings.accent || "indigo");
  }, [settings.accent]);

  const getDailyTotals = (ds) => {
    const d = logs[ds] || { foods: [], purchases: [], expenses: [] };
    return {
      totalCals: d.foods.reduce((s, f) => s + (f.cals || 0), 0),
      totalSpent: d.purchases.reduce((s, p) => s + (p.cost || 0), 0) + d.expenses.reduce((s, e) => s + (e.cost || 0), 0),
    };
  };

  const recentDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(todayStr); d.setDate(d.getDate() - (4 - i));
    return d.toISOString().split("T")[0];
  });

  const tabs = [
    { id: "dashboard",  label: "Home",     icon: <Activity size={22} /> },
    { id: "calendar",   label: "Calendar", icon: <CalendarDays size={22} /> },
    { id: "dictionary", label: "Presets",  icon: <BookOpen size={22} /> },
    { id: "tools",      label: "Tools",    icon: <Wrench size={22} /> },
    { id: "settings",   label: "Settings", icon: <Settings size={22} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28">
      <header className="accent-header text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">DormNiCeej</h1>
          <p className="text-[10px] accent-header-sub">kalalaking tao nagttrack ng kalidad ng buhay</p>
        </div>
        <button onClick={() => { setSelectedDate(todayStr); setShowLogModal(true); }}
          className="flex items-center gap-1.5 bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold transition">
          <Calendar size={14} /> {todayStr}
        </button>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {activeTab === "dashboard" && (
          <Dashboard money={money} inventory={inventory} setInventory={setInventory}
            logs={logs} getDailyTotals={getDailyTotals} recentDays={recentDays}
            setShowMoneyModal={setShowMoneyModal} setSelectedDate={setSelectedDate} setShowLogModal={setShowLogModal}
            exams={exams} setShowExamModal={() => setShowExamModal(true)} todos={todos} settings={settings}
            sleepLogs={sleepLogs} setSleepLogs={setSleepLogs} sleepSettings={sleepSettings} setSleepSettings={setSleepSettings}
            readingSubjects={readingSubjects} setReadingSubjects={setReadingSubjects} readingLogs={readingLogs} setReadingLogs={setReadingLogs}
            medicineLogs={medicineLogs} setMedicineLogs={setMedicineLogs}
            debtRecords={debtRecords} setDebtRecords={setDebtRecords}
            gymData={gymData} setGymData={setGymData}
            dashboardConfig={dashboardConfig} setDashboardConfig={setDashboardConfig} />
        )}
        {activeTab === "calendar" && (
          <CalendarView logs={logs} getDailyTotals={getDailyTotals} setSelectedDate={setSelectedDate}
            setShowLogModal={setShowLogModal} todos={todos}
            onOpenTodo={date => { setTodoModalDate(date); setShowTodoModal(true); }}
            settings={settings} sleepLogs={sleepLogs} />
        )}
        {activeTab === "dictionary" && (
          <DictionaryView dictionary={dictionary}
            onEdit={p => { setEditingPreset(p); setShowDictModal(true); }}
            onDelete={id => setDictionary(p => p.filter(i => i.id !== id))}
            onAdd={() => { setEditingPreset(null); setShowDictModal(true); }} />
        )}
        {activeTab === "tools" && <ToolsView />}
        {activeTab === "settings" && <SettingsView settings={settings} setSettings={setSettings} />}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-10 max-w-md left-1/2 -translate-x-1/2">
        <div className="flex justify-around p-2">
          {tabs.map(t => <NavButton key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
        </div>
      </nav>

      {showMoneyModal && <AdjustMoneyModal money={money} setMoney={setMoney} close={() => setShowMoneyModal(false)} />}
      {showDictModal && <AddDictionaryModal dictionary={dictionary} setDictionary={setDictionary} editingPreset={editingPreset} close={() => { setShowDictModal(false); setEditingPreset(null); }} />}
      {showLogModal && <DailyLogModal date={selectedDate} logs={logs} setLogs={setLogs} inventory={inventory} setInventory={setInventory} dictionary={dictionary} money={money} setMoney={setMoney} settings={settings} close={() => setShowLogModal(false)} />}
      {showTodoModal && <TodoModal date={todoModalDate} todos={todos} setTodos={setTodos} close={() => setShowTodoModal(false)} />}
      {showExamModal && <ExamModalComp exams={exams} setExams={setExams} close={() => setShowExamModal(false)} />}
    </div>
  );
}