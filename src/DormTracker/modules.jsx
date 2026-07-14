// ─────────────────────────────────────────────
// SECTION 4  DASHBOARD MODULES
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";


import {
  ChevronDown, Package, Utensils, Plus, Minus, BookOpen,
  ChevronLeft, ChevronRight, X, TrendingDown,
  Check, Trash2, Edit, GraduationCap, ListTodo, AlarmClock,
  Moon, Pill, Dumbbell, DollarSign,
  ArrowDownLeft, ArrowUpRight, Pencil, Coffee, BarChart2,
  Repeat, CalendarClock, BellRing,
} from "lucide-react";

import { Card, CardHeader, SoftAccentBtn } from "./primitives";
import { useLocalStorage } from "./hooks";
import { todayStr, calcSleepDuration, fmtDur, fmtDateShort, DOW_LABELS, fmtTime12, getMissedDates,
} from "./data";
import {
  useCurrentDate, syncNotifications, clearAllScheduled, REMINDER_HOUR, REMINDER_MINUTE,
  scheduleLocal, hashId,
} from "./notifications";


// ─────────────────────────────────────────────
// SECTION 4  DASHBOARD MODULES
// ─────────────────────────────────────────────

// 4a. Wallet
export function WalletModule({ money, setShowMoneyModal }) {
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
export function StocksModule({ inventory, setInventory }) {
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
          {foods.length === 0 ? <p className="text-center text-slate-300 text-sm py-4 italic">No food in stock.</p> : foods.map(([n, d]) => renderRow(n, d))}
        </div>
        <div>
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Household</p>
          {others.length === 0 ? <p className="text-center text-slate-300 text-sm py-4 italic">No household items stocked.</p> : others.map(([n, d]) => renderRow(n, d))}
        </div>
      </div>
    </Card>
  );
}

// 4c. Trends
export function TrendsModule({ logs, getDailyTotals, recentDays, setSelectedDate, setShowLogModal, settings }) {
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
                  {settings.trackCalories && <div className="w-3 bg-amber-400 rounded-t-sm transition-all duration-500 ease-out" style={{ height: `${Math.max((totalCals / maxC) * 100, 3)}%` }} />}
                  <div className="w-3 bg-rose-500 rounded-t-sm transition-all duration-500 ease-out" style={{ height: `${Math.max((totalSpent / maxE) * 100, 3)}%` }} />
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
export function TopExpensesModule({ logs }) {
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
        {top.length === 0 ? <p className="text-center text-slate-300 text-sm py-4 italic">No records found.</p> :
          top.map(([name, cost], i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold w-4 text-right text-xs">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                  <span className="text-xs font-bold text-rose-500">₱{Math.round(cost)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${(cost / Math.max(top[0][1], 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

// 4e. Top Calories
export function TopCaloriesModule({ logs }) {
  const ago = new Date(todayStr); ago.setDate(ago.getDate() - 30);
  const all = [];
  Object.entries(logs).forEach(([ds, day]) => { if (new Date(ds) >= ago) day.foods?.forEach(f => all.push(f)); });
  const totals = all.reduce((a, c) => { a[c.name] = (a[c.name] || 0) + c.cals; return a; }, {});
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <Card>
      <CardHeader icon={<Utensils size={20} className="text-amber-400" />} title="Top Calories (30 days)" />
      <div className="p-5 space-y-3">
        {top.length === 0 ? <p className="text-center text-slate-300 text-sm py-4 italic">No records found.</p> :
          top.map(([name, cals], i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold w-4 text-right text-xs">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                  <span className="text-xs font-bold text-amber-600">{cals} kcal</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${(cals / Math.max(top[0][1], 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

// 4f. Sleep Tracker
export function SleepModule({ sleepLogs, setSleepLogs, sleepSettings, setSleepSettings }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [addDate, setAddDate] = useState(todayStr);
  const [sleptTime, setSleptTime] = useState("23:00");
  const [wokeTime, setWokeTime] = useState("07:00");
  const [isNap, setIsNap] = useState(false);
  const [editTarget, setEditTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(sleepSettings.targetHrs.toString());

  // Live-updating "today" — shared hook (was a locally duplicated
  // interval + visibilitychange/focus pattern; see notifications.js).
  const currentDate = useCurrentDate();

  const getOffsetFrom = (base, offset) => {
    const d = new Date(base + "T00:00:00");
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const last7 = Array.from({ length: 7 }, (_, i) => getOffsetFrom(currentDate, -i));

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
  }, [currentDate]);

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

// ─────────────────────────────────────────────
// 4f2. Reading Notification Tracker
// ─────────────────────────────────────────────

export function ReadingModule({ readingSubjects, setReadingSubjects, readingLogs, setReadingLogs }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [time, setTime] = useState("19:00");
  const [days, setDays] = useState([]);
  const [pages, setPages] = useState("");
  const [expandedMissed, setExpandedMissed] = useState({}); // { [subjectId]: boolean }

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
    setExpandedMissed(prev => { const c = { ...prev }; delete c[id]; return c; });
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

  // Resolving a missed date marks it done, so it drops out of getMissedDates()
  const resolveMissed = (id, date) => {
    setReadingLogs(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [date]: true } }));
  };

  const toggleExpandMissed = (id) => {
    setExpandedMissed(prev => ({ ...prev, [id]: !prev[id] }));
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
              const isExpanded = !!expandedMissed[sub.id];

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
                    <div className="mt-2.5 bg-rose-50 border border-rose-100 rounded-lg p-2.5 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => toggleExpandMissed(sub.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="space-y-0.5">
                          <p className="text-[11px] font-bold text-rose-500">Missed Readings: {fmtDateShort(lastMissed)}</p>
                          {pagesMissed !== null && (
                            <p className="text-[11px] font-bold text-rose-500">Pages missed: {pagesMissed} ({missedDays} day{missedDays > 1 ? "s" : ""})</p>
                          )}
                        </span>
                        <ChevronDown size={14} className={`text-rose-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isExpanded && (
                        <div className="pt-1 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                          {missedDates.map(date => (
                            <div key={date} className="flex items-center justify-between bg-white border border-rose-100 rounded-lg px-2.5 py-1.5">
                              <span className="text-[11px] font-semibold text-slate-600">
                                {fmtDateShort(date)}
                                {sub.pages ? ` · ${sub.pages} pages` : ""}
                              </span>
                              <button
                                onClick={() => resolveMissed(sub.id, date)}
                                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition"
                              >
                                <Check size={12} /> Resolved
                              </button>
                            </div>
                          ))}
                        </div>
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

// Reading notifications: a repeating weekly schedule per (subject, day),
// plus a one-off nudge the moment a subject's missed-session count grows.
// Lives here (co-located with ReadingModule) but is called from the App
// root so it keeps firing even when the Reading card isn't on the dashboard.
export function useReadingNotifications(readingSubjects, readingLogs, cat) {
  const currentDate = useCurrentDate();
  const [scheduledMap, setScheduledMap] = useLocalStorage("dorm_notif_sched_reading_v1", {});
  const [missedCounts, setMissedCounts] = useLocalStorage("dorm_notif_reading_missed_v1", {});

  useEffect(() => {
    if (!cat || !cat.enabled) {
      clearAllScheduled(scheduledMap, setScheduledMap);
      return;
    }

    const desired = [];
    (readingSubjects || []).forEach(sub => {
      const [h, m] = (sub.time || "19:00").split(":").map(Number);
      (sub.days || []).forEach(weekday => {
        desired.push({
          key: `reading:${sub.id}:day${weekday}`,
          title: "Reading time",
          body: `${sub.subject}${sub.pages ? ` · ${sub.pages} pages` : ""}`,
          repeating: { weekday, hour: h, minute: m },
        });
      });
    });
    syncNotifications(desired, scheduledMap, setScheduledMap);

    // One-off nudge whenever a subject's missed-day count grows since the
    // last check (e.g. a scheduled day passed with nothing marked done).
    const nextMissed = { ...missedCounts };
    let missedChanged = false;
    (readingSubjects || []).forEach(sub => {
      const doneMap = (readingLogs || {})[sub.id] || {};
      const missed = getMissedDates(sub, doneMap).length;
      const prev = missedCounts[sub.id] || 0;
      if (missed > prev) {
        const fireSoon = new Date(Date.now() + 5000);
        // Distinct, date-stamped key so this fires at most once per check.
        scheduleLocalNudge(`reading-missed:${sub.id}:${currentDate}`, "Missed reading",
          `${sub.subject} has ${missed} missed session${missed > 1 ? "s" : ""}.`, fireSoon);
      }
      if (missed !== prev) { nextMissed[sub.id] = missed; missedChanged = true; }
    });
    if (missedChanged) setMissedCounts(nextMissed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, cat?.enabled, JSON.stringify(readingSubjects), JSON.stringify(readingLogs)]);
}

// Small local helper — kept next to its only user (useReadingNotifications).
function scheduleLocalNudge(key, title, body, at) {
  return scheduleLocal(hashId(key), title, body, at);
}

// 4g. Medicine Tracker
export function MedicineModule({ medicineLogs, setMedicineLogs, medicineSchedules, setMedicineSchedules }) {
  const [showAdd, setShowAdd] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medTime, setMedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [logDate, setLogDate] = useState(todayStr);
  const [savedMeds, setSavedMeds] = useLocalStorage("dorm_saved_meds_v1", []);

  // Scheduled daily reminders — separate from the ad-hoc "log an intake"
  // entries above. This is what useMedicineNotifications reads from.
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [schedName, setSchedName] = useState("");
  const [schedDose, setSchedDose] = useState("");
  const [schedTime, setSchedTime] = useState("08:00");

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

  const addSchedule = (e) => {
    e.preventDefault();
    if (!schedName.trim()) return;
    setMedicineSchedules(prev => [...(prev || []), {
      id: "medsch" + Date.now(), name: schedName.trim(), dose: schedDose.trim(), time: schedTime,
    }]);
    setSchedName(""); setSchedDose(""); setSchedTime("08:00"); setShowAddSchedule(false);
  };
  const delSchedule = (id) => setMedicineSchedules(prev => (prev || []).filter(s => s.id !== id));

  return (
    <Card>
      <CardHeader icon={<Pill size={20} className="text-emerald-500" />} title="Medicine Tracker"
        action={<SoftAccentBtn onClick={() => setShowAdd(!showAdd)}><Plus size={14} /> Log</SoftAccentBtn>} />
      <div className="p-5 space-y-5">
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
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
          ? <p className="text-center text-slate-300 text-sm py-4 italic">No medicine logged today.</p>
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

        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing size={13} /> Daily Reminders
            </p>
            <SoftAccentBtn onClick={() => setShowAddSchedule(!showAddSchedule)}><Plus size={13} /> Reminder</SoftAccentBtn>
          </div>
          {showAddSchedule && (
            <form onSubmit={addSchedule} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-3">
              <input type="text" required placeholder="Medicine name" value={schedName} onChange={e => setSchedName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-300" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Dose (optional)" value={schedDose} onChange={e => setSchedDose(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-300" />
                <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-300" />
              </div>
              <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-600 transition text-sm">Save Reminder</button>
            </form>
          )}
          {(medicineSchedules || []).length === 0
            ? <p className="text-center text-slate-300 text-xs py-2 italic">No daily reminders set.</p>
            : <div className="space-y-1.5">
                {(medicineSchedules || []).map(s => (
                  <div key={s.id} className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">{s.name}{s.dose ? ` · ${s.dose}` : ""} · {fmtTime12(s.time)}</span>
                    <button onClick={() => delSchedule(s.id)} className="text-slate-300 hover:text-rose-500 transition"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </Card>
  );
}

// Medicine notifications: one repeating daily schedule per scheduled entry.
export function useMedicineNotifications(medicineSchedules, cat) {
  const [scheduledMap, setScheduledMap] = useLocalStorage("dorm_notif_sched_medicine_v1", {});

  useEffect(() => {
    if (!cat || !cat.enabled) {
      clearAllScheduled(scheduledMap, setScheduledMap);
      return;
    }
    const desired = (medicineSchedules || []).map(med => {
      const [h, m] = (med.time || "08:00").split(":").map(Number);
      return {
        key: `medicine:${med.id}`,
        title: "Medicine reminder",
        body: `${med.name}${med.dose ? ` · ${med.dose}` : ""}`,
        repeating: { hour: h, minute: m },
      };
    });
    syncNotifications(desired, scheduledMap, setScheduledMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat?.enabled, JSON.stringify(medicineSchedules)]);
}

// 4h. Debts / Owe Records
export function DebtsModule({ debtRecords, setDebtRecords }) {
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
          ? <p className="text-center text-slate-300 text-sm py-6 italic">No debts or owed records.</p>
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

// Debts notifications: one notification per enabled leadDay, only for
// unsettled records that have a due date.
export function useDebtsNotifications(debtRecords, cat) {
  const currentDate = useCurrentDate();
  const [scheduledMap, setScheduledMap] = useLocalStorage("dorm_notif_sched_debts_v1", {});

  useEffect(() => {
    if (!cat || !cat.enabled) {
      clearAllScheduled(scheduledMap, setScheduledMap);
      return;
    }
    const leadDays = cat.leadDays || [];
    const desired = [];
    (debtRecords || []).filter(r => !r.settled && r.dueDate).forEach(r => {
      const due = new Date(r.dueDate + "T00:00:00");
      leadDays.forEach(lead => {
        const fireDate = new Date(due);
        fireDate.setDate(fireDate.getDate() - lead);
        fireDate.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
        desired.push({
          key: `debt:${r.id}:lead${lead}`,
          title: r.type === "owe" ? "Debt due soon" : "You're owed a payment",
          body: `${r.name} · ₱${r.amount.toLocaleString()} · due ${fmtDateShort(r.dueDate)}`,
          at: fireDate,
        });
      });
    });
    syncNotifications(desired, scheduledMap, setScheduledMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, cat?.enabled, JSON.stringify(cat?.leadDays), JSON.stringify(debtRecords)]);
}

// 4i. Gym Tracker
export function GymModule({ gymData, setGymData }) {
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
          ? <p className="text-center text-slate-300 text-sm py-4 italic">No training sessions yet.</p>
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

export function GymSessionDetail({ session, onBack, onUpdate }) {
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
export function ExamModule({ exams, setShowExamModal }) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcoming = exams.map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date + "T00:00:00") - now) / 86400000) }))
    .filter(e => e.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);
  return (
    <Card>
      <CardHeader icon={<GraduationCap size={20} className="text-violet-400" />} title="Exam Countdown"
        action={<SoftAccentBtn onClick={() => setShowExamModal(true)}><Plus size={14} /> Add Exam</SoftAccentBtn>} />
      <div className="p-5">
        {upcoming.length === 0
          ? <p className="text-center text-slate-300 text-sm py-3 italic">No upcoming exams.</p>
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
                      {/* today's exam gets a soft pulse to draw the eye without being obnoxious */}
                      <span className={`text-2xl font-extrabold block leading-none ${txt[u]} ${u === "today" ? "anim-pulse" : ""}`}>{exam.daysLeft === 0 ? "🔥" : exam.daysLeft}</span>
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

// Exam notifications: one notification per enabled leadDay per upcoming exam.
export function useExamNotifications(exams, cat) {
  const currentDate = useCurrentDate();
  const [scheduledMap, setScheduledMap] = useLocalStorage("dorm_notif_sched_exams_v1", {});

  useEffect(() => {
    if (!cat || !cat.enabled) {
      clearAllScheduled(scheduledMap, setScheduledMap);
      return;
    }
    const leadDays = cat.leadDays || [];
    const desired = [];
    (exams || []).forEach(exam => {
      const due = new Date(exam.date + "T00:00:00");
      leadDays.forEach(lead => {
        const fireDate = new Date(due);
        fireDate.setDate(fireDate.getDate() - lead);
        fireDate.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
        desired.push({
          key: `exam:${exam.id}:lead${lead}`,
          title: "Exam coming up",
          body: `${exam.subject}${exam.label ? ` — ${exam.label}` : ""} · ${fmtDateShort(exam.date)}`,
          at: fireDate,
        });
      });
    });
    syncNotifications(desired, scheduledMap, setScheduledMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, cat?.enabled, JSON.stringify(cat?.leadDays), JSON.stringify(exams)]);
}

// 4k. Closest Deadlines
export function DeadlinesModule({ todos, exams }) {
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

// Deadlines (todos) notifications: one notification per enabled leadDay,
// only for todos that aren't done yet. Exams have their own category
// (useExamNotifications above) even though both appear in this card's UI.
export function useDeadlinesNotifications(todos, cat) {
  const currentDate = useCurrentDate();
  const [scheduledMap, setScheduledMap] = useLocalStorage("dorm_notif_sched_deadlines_v1", {});

  useEffect(() => {
    if (!cat || !cat.enabled) {
      clearAllScheduled(scheduledMap, setScheduledMap);
      return;
    }
    const leadDays = cat.leadDays || [];
    const desired = [];
    Object.entries(todos || {}).forEach(([date, items]) => {
      (items || []).filter(t => !t.done).forEach(t => {
        const due = new Date(date + "T00:00:00");
        leadDays.forEach(lead => {
          const fireDate = new Date(due);
          fireDate.setDate(fireDate.getDate() - lead);
          fireDate.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
          desired.push({
            key: `todo:${t.id}:lead${lead}`,
            title: "To-do due soon",
            body: `${t.text} · due ${fmtDateShort(date)}`,
            at: fireDate,
          });
        });
      });
    });
    syncNotifications(desired, scheduledMap, setScheduledMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, cat?.enabled, JSON.stringify(cat?.leadDays), JSON.stringify(todos)]);
}

// ─────────────────────────────────────────────
// 4l. Incoming Payments (subscriptions / bills)
// ─────────────────────────────────────────────

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const iso = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const clampMonthDate = (y, m, day) => new Date(y, m, Math.min(day, daysInMonth(y, m)));

// Every due date for a payment, from its creation date up through `todayISO` (inclusive).
function dueDatesUpTo(payment, todayISO) {
  const start = new Date(payment.createdAt + "T00:00:00");
  const end = new Date(todayISO + "T00:00:00");
  const out = [];

  if (payment.recurrence === "yearly") {
    let d = new Date(start.getFullYear(), payment.month - 1, payment.day);
    if (d < start) d = new Date(d.getFullYear() + 1, payment.month - 1, payment.day);
    while (d <= end) { out.push(iso(d)); d = new Date(d.getFullYear() + 1, payment.month - 1, payment.day); }
  } else if (payment.recurrence === "monthly") {
    let y = start.getFullYear(), m = start.getMonth();
    let d = clampMonthDate(y, m, payment.day);
    if (d < start) { m++; if (m > 11) { m = 0; y++; } d = clampMonthDate(y, m, payment.day); }
    while (d <= end) { out.push(iso(d)); m++; if (m > 11) { m = 0; y++; } d = clampMonthDate(y, m, payment.day); }
  } else { // weekly — supports one or more selected weekdays
    const weekdays = (payment.weekdays && payment.weekdays.length) ? payment.weekdays : [payment.weekday ?? 0];
    const daySet = new Set();
    for (const wd of weekdays) {
      let d = new Date(start);
      d.setDate(d.getDate() + ((wd - d.getDay() + 7) % 7));
      while (d <= end) { daySet.add(iso(d)); d = new Date(d); d.setDate(d.getDate() + 7); }
    }
    out.push(...Array.from(daySet).sort());
  }
  return out;
}

function recurrenceLabel(p) {
  if (p.recurrence === "yearly") return `Every ${MONTH_LABELS[p.month - 1]} ${p.day}`;
  if (p.recurrence === "monthly") return `Day ${p.day} of every month`;
  const weekdays = (p.weekdays && p.weekdays.length) ? p.weekdays : [p.weekday ?? 0];
  return `Every ${weekdays.map(w => DOW_LABELS[w]).join(" & ")}`;
}

export function PaymentsModule({ payments, setPayments, money, setMoney, logs, setLogs }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState("monthly");
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [weekdays, setWeekdays] = useState([0]);
  const [affectsWallet, setAffectsWallet] = useState(true);

  // Live-updating "today" — shared hook (was a locally duplicated
  // interval + visibilitychange/focus pattern; see notifications.js).
  const currentDate = useCurrentDate();

  // Keep every payment's history stacked up to today — any due date that has
  // passed without a confirmation gets logged as a pending/missed entry.
  useEffect(() => {
    setPayments(prev => prev.map(p => {
      const due = dueDatesUpTo(p, currentDate);
      const known = new Set((p.history || []).map(h => h.period));
      const missing = due.filter(d => !known.has(d));
      if (missing.length === 0) return p;
      const added = missing.map(period => ({ period, confirmed: false, confirmedOn: null }));
      return { ...p, history: [...(p.history || []), ...added].sort((a, b) => a.period.localeCompare(b.period)) };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const addPayment = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (recurrence === "weekly" && weekdays.length === 0) return;
    const base = {
      id: "pay" + Date.now(),
      name: name.trim(),
      amount: amount.trim() === "" ? null : parseFloat(amount),
      recurrence,
      month: Number(month), day: Number(day), weekdays: [...weekdays].sort(),
      affectsWallet,
      createdAt: currentDate,
      history: [],
    };
    // Seed the first due entry immediately so it shows up right away.
    base.history = dueDatesUpTo(base, currentDate).map(period => ({ period, confirmed: false, confirmedOn: null }));
    setPayments(prev => [...prev, base]);
    setName(""); setAmount(""); setRecurrence("monthly"); setMonth(1); setDay(1); setWeekdays([0]); setAffectsWallet(true);
    setShowAdd(false);
  };

  const delPayment = (id) => setPayments(prev => prev.filter(p => p.id !== id));

  const confirm = (paymentId, period) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setPayments(prev => prev.map(p => p.id !== paymentId ? p : {
      ...p,
      history: p.history.map(h => h.period === period ? { ...h, confirmed: true, confirmedOn: currentDate } : h),
    }));

    if (payment.affectsWallet && payment.amount) {
      setMoney(m => m - payment.amount);
      setLogs(prev => {
        const day = prev[period] || {};
        const expense = { id: "exp" + Date.now(), name: payment.name, cost: payment.amount };
        return { ...prev, [period]: { ...day, expenses: [...(day.expenses || []), expense] } };
      });
    }
  };

  const unconfirm = (paymentId, period) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setPayments(prev => prev.map(p => p.id !== paymentId ? p : {
      ...p,
      history: p.history.map(h => h.period === period ? { ...h, confirmed: false, confirmedOn: null } : h),
    }));

    if (payment.affectsWallet && payment.amount) {
      setMoney(m => m + payment.amount);
      setLogs(prev => {
        const day = prev[period];
        if (!day) return prev;
        const expenses = (day.expenses || []).filter(exp => !(exp.name === payment.name && exp.cost === payment.amount));
        return { ...prev, [period]: { ...day, expenses } };
      });
    }
  };

  const toggleWeekday = (i) => {
    setWeekdays(prev => prev.includes(i) ? prev.filter(w => w !== i) : [...prev, i].sort((a, b) => a - b));
  };

  return (
    <Card>
      <CardHeader
        icon={<Repeat size={20} className="text-indigo-400" />}
        title="Incoming Payments"
        action={<SoftAccentBtn onClick={() => setShowAdd(!showAdd)}><Plus size={14} /> Add Payment</SoftAccentBtn>}
      />
      <div className="p-5 space-y-3">
        {showAdd && (
          <form onSubmit={addPayment} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <input required type="text" placeholder="Name (e.g. Netflix, Dorm rent)" value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-200" />

            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
              {[["yearly", "Yearly"], ["monthly", "Monthly"], ["weekly", "Weekly"]].map(([val, lab]) => (
                <button key={val} type="button" onClick={() => setRecurrence(val)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${recurrence === val ? "bg-white shadow text-indigo-600" : "text-slate-400"}`}>
                  {lab}
                </button>
              ))}
            </div>

            {recurrence === "yearly" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Month</label>
                  <select value={month} onChange={e => setMonth(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-200">
                    {MONTH_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Day</label>
                  <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
            )}

            {recurrence === "monthly" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Day of month</label>
                <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-200" />
              </div>
            )}

            {recurrence === "weekly" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Days of week (pick one or more)</label>
                <div className="flex gap-1.5">
                  {DOW_LABELS.map((lab, i) => (
                    <button type="button" key={i} onClick={() => toggleWeekday(i)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition ${weekdays.includes(i) ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Amount (optional)</label>
              <input type="number" step="0.01" min="0" placeholder="e.g. 149" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-200" />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg p-2.5 cursor-pointer">
              <input type="checkbox" checked={affectsWallet} onChange={e => setAffectsWallet(e.target.checked)}
                className="w-4 h-4 accent-indigo-500" />
              Deduct from wallet & log as an expense on the calendar when confirmed
            </label>

            <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-600 transition text-sm">Add Payment</button>
          </form>
        )}

        {payments.length === 0 && !showAdd ? (
          <p className="text-center text-slate-300 text-sm py-4 italic">No recurring payments yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map(p => {
              const pending = (p.history || []).filter(h => !h.confirmed).sort((a, b) => a.period.localeCompare(b.period));
              const confirmed = (p.history || []).filter(h => h.confirmed).sort((a, b) => b.period.localeCompare(a.period));
              const current = pending[pending.length - 1];
              const backlog = pending.slice(0, -1);

              return (
                <div key={p.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarClock size={16} className="text-indigo-400 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-slate-700">{p.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {recurrenceLabel(p)}{p.amount ? ` · ₱${p.amount.toLocaleString()}` : ""}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => delPayment(p.id)} className="text-slate-300 hover:text-rose-500 p-1 rounded transition shrink-0"><Trash2 size={14} /></button>
                  </div>

                  {current && (
                    <div className="mt-2.5 flex items-center justify-between gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                      <span className="text-xs font-bold text-amber-700">Due {fmtDateShort(current.period)}{p.amount ? ` · ₱${p.amount.toLocaleString()}` : ""}</span>
                      <button onClick={() => confirm(p.id, current.period)}
                        className="flex items-center gap-1 bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-600 transition">
                        <Check size={13} /> Confirm Payment
                      </button>
                    </div>
                  )}

                  {backlog.length > 0 && (
                    <div className="mt-2 bg-rose-50 border border-rose-100 rounded-lg p-2.5 space-y-1.5">
                      <p className="text-[11px] font-bold text-rose-500">Missed / stacked ({backlog.length})</p>
                      {backlog.map(h => (
                        <div key={h.period} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-rose-600">{fmtDateShort(h.period)}{p.amount ? ` · ₱${p.amount.toLocaleString()}` : ""}</span>
                          <button onClick={() => confirm(p.id, h.period)}
                            className="flex items-center gap-1 bg-white border border-rose-200 text-rose-600 font-bold px-2 py-1 rounded-lg text-[10px] hover:bg-rose-100 transition">
                            <Check size={11} /> Confirm
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {confirmed.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recently confirmed</p>
                      {confirmed.slice(0, 3).map(h => (
                        <div key={h.period} className="flex items-center justify-between text-[11px] text-slate-500 py-0.5">
                          <span className="flex items-center gap-1"><Check size={11} className="text-emerald-500" /> {fmtDateShort(h.period)}</span>
                          <button onClick={() => unconfirm(p.id, h.period)} className="text-slate-300 hover:text-rose-400 transition text-[10px] font-semibold">undo</button>
                        </div>
                      ))}
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

// Payments notifications: one notification per enabled leadDay, per
// unconfirmed pending/backlog entry — reuses the same dueDatesUpTo /
// history shape PaymentsModule already maintains.
export function usePaymentsNotifications(payments, cat) {
  const currentDate = useCurrentDate();
  const [scheduledMap, setScheduledMap] = useLocalStorage("dorm_notif_sched_payments_v1", {});

  useEffect(() => {
    if (!cat || !cat.enabled) {
      clearAllScheduled(scheduledMap, setScheduledMap);
      return;
    }
    const leadDays = cat.leadDays || [];
    const desired = [];
    (payments || []).forEach(p => {
      const pending = (p.history || []).filter(h => !h.confirmed);
      pending.forEach(h => {
        const due = new Date(h.period + "T00:00:00");
        leadDays.forEach(lead => {
          const fireDate = new Date(due);
          fireDate.setDate(fireDate.getDate() - lead);
          fireDate.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
          desired.push({
            key: `payment:${p.id}:${h.period}:lead${lead}`,
            title: "Payment due soon",
            body: `${p.name}${p.amount ? ` · ₱${p.amount.toLocaleString()}` : ""} · due ${fmtDateShort(h.period)}`,
            at: fireDate,
          });
        });
      });
    });
    syncNotifications(desired, scheduledMap, setScheduledMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, cat?.enabled, JSON.stringify(cat?.leadDays), JSON.stringify(payments)]);
}