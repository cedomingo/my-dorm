import { useState } from "react";
import { ChevronLeft, ChevronRight, ListTodo, Wallet } from "lucide-react";
import { Card } from "./primitives";
import { todayStr, getBudgetInfo } from "./data";

export function CalendarView({ logs, getDailyTotals, setSelectedDate, setShowLogModal, todos, onOpenTodo, settings, sleepLogs, money }) {
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

  const budgetOn = settings?.budgetTracker?.enabled;
  const { daysRemaining, dailyBudget } = budgetOn
    ? getBudgetInfo(money, settings.budgetTracker.days)
    : { daysRemaining: 0, dailyBudget: 0 };

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
          {/* keying on year+month replays anim-fade-in whenever the user
              navigates to a different month */}
          <div key={`${y}-${m}`} className="grid grid-cols-7 gap-1 anim-fade-in">
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

      {budgetOn && (
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} className="text-slate-400" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Budget Insights</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-100 col-span-2 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Wallet Balance</span>
                <span className="text-lg font-extrabold text-slate-800">₱{Math.round(money)}</span>
              </div>
              <div className="accent-bg-soft p-3 rounded-xl border accent-border">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Budget Left</span>
                <p className="text-xl font-extrabold accent-text">₱{dailyBudget.toFixed(0)}<span className="text-xs">/day</span></p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Days Remaining</span>
                <p className="text-xl font-extrabold text-slate-700">{daysRemaining}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}