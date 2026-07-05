import { useState } from "react";
import { Utensils, Settings, Check, Wallet, Bell, Repeat, DollarSign, ListTodo, GraduationCap, BookOpen, Pill, ChevronDown, Heart } from "lucide-react";
import { Card, CardHeader, Toggle } from "./primitives";
import { ACCENTS, DOW_LABELS } from "./data";

// Shared default shape for settings.notifications — merged in defensively so
// existing users who already have a settings object in localStorage don't
// end up with missing categories after this update ships.
const DEFAULT_NOTIF_SETTINGS = {
  payments:   { enabled: true, leadDays: [1, 0] },
  debts:      { enabled: true, leadDays: [1, 0] },
  deadlines:  { enabled: true, leadDays: [0] },
  exams:      { enabled: true, leadDays: [7, 3, 1, 0] },
  reading:    { enabled: true },
  medicine:   { enabled: true },
};

const LEAD_DAY_OPTIONS = [
  { value: 7, label: "7d" },
  { value: 3, label: "3d" },
  { value: 1, label: "1d" },
  { value: 0, label: "Day of" },
];

// Collapsed by default (compact "off state" list) — tap the row to expand
// and reveal the subtitle + lead-day chips. The enable/disable Toggle is
// always visible and lives outside the expand click target, so flipping a
// category on/off doesn't require opening it first.
function NotifCategoryRow({ icon, title, subtitle, cat, onToggle, onToggleLead, showLeadDays }) {
  const [open, setOpen] = useState(false);
  const leadSummary = showLeadDays && (cat.leadDays || []).length > 0
    ? [...cat.leadDays].sort((a, b) => b - a).map(d => d === 0 ? "Day of" : `${d}d`).join(", ")
    : null;

  return (
    <div className="border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between py-3.5 gap-2">
        <button type="button" onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
          <span className="text-slate-400 shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm">{title}</p>
            {!open && cat.enabled && leadSummary && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{leadSummary}</p>
            )}
          </div>
          <ChevronDown size={14} className={`text-slate-300 shrink-0 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <Toggle on={cat.enabled} onToggle={onToggle} />
      </div>

      {open && (
        <div className="pb-3.5 pl-[30px] animate-in slide-in-from-top-1 duration-150">
          {subtitle && <p className="text-xs text-slate-400 mb-2">{subtitle}</p>}
          {showLeadDays && cat.enabled && (
            <div className="flex gap-1.5 flex-wrap">
              {LEAD_DAY_OPTIONS.map(opt => {
                const active = (cat.leadDays || []).includes(opt.value);
                return (
                  <button key={opt.value} type="button" onClick={() => onToggleLead(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${active ? "accent-bg-soft accent-text border-2 accent-border" : "border border-slate-200 text-slate-400 hover:border-slate-300"}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
          {showLeadDays && !cat.enabled && (
            <p className="text-[11px] text-slate-300 italic">Turn on to choose lead times.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function SettingsView({ settings, setSettings }) {
  const budget = settings.budgetTracker || { enabled: true, days: [true,true,true,true,true,true,true] };
  const notif = { ...DEFAULT_NOTIF_SETTINGS, ...(settings.notifications || {}) };

  const toggleDay = (idx) => {
    setSettings(p => {
      const b = p.budgetTracker || budget;
      const days = [...b.days];
      days[idx] = !days[idx];
      return { ...p, budgetTracker: { ...b, days } };
    });
  };

  const toggleNotifEnabled = (key) => {
    setSettings(p => {
      const n = { ...DEFAULT_NOTIF_SETTINGS, ...(p.notifications || {}) };
      return { ...p, notifications: { ...n, [key]: { ...n[key], enabled: !n[key].enabled } } };
    });
  };

  const toggleNotifLeadDay = (key, day) => {
    setSettings(p => {
      const n = { ...DEFAULT_NOTIF_SETTINGS, ...(p.notifications || {}) };
      const current = n[key].leadDays || [];
      const leadDays = current.includes(day) ? current.filter(d => d !== day) : [...current, day].sort((a, b) => b - a);
      return { ...p, notifications: { ...n, [key]: { ...n[key], leadDays } } };
    });
  };

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
        <CardHeader icon={<Wallet size={20} className="text-slate-500" />} title="Daily Budget Tracker" />
        <div className="p-5 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Show Budget Insights</p>
              <p className="text-xs text-slate-400 mt-0.5">Show daily budget & days remaining on the Calendar tab</p>
            </div>
            <Toggle on={budget.enabled} onToggle={() => setSettings(p => ({ ...p, budgetTracker: { ...budget, enabled: !budget.enabled } }))} />
          </label>

          {budget.enabled && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Days counted in the budget cycle (cycle ends on the last day checked)</p>
              <div className="flex gap-1.5">
                {DOW_LABELS.map((label, idx) => (
                  <button key={idx} onClick={() => toggleDay(idx)}
                    className={`w-9 h-9 rounded-full text-xs font-bold border transition ${budget.days[idx] ? "accent-bg-soft accent-text border-2 accent-border" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Bell size={20} className="text-slate-500" />} title="Notifications" />
        <div className="px-5">
          <p className="text-xs text-slate-400 pt-4 pb-1">
            Get reminded before things are due. Lead-time chips control how many notifications fire per item.
          </p>
          <div className="pb-1">
            <NotifCategoryRow
              icon={<Repeat size={18} />}
              title="Incoming Payments"
              subtitle="Bills & subscriptions coming due"
              cat={notif.payments}
              showLeadDays
              onToggle={() => toggleNotifEnabled("payments")}
              onToggleLead={(d) => toggleNotifLeadDay("payments", d)}
            />
            <NotifCategoryRow
              icon={<DollarSign size={18} />}
              title="Debts / Owe Records"
              subtitle="Unsettled records with a due date"
              cat={notif.debts}
              showLeadDays
              onToggle={() => toggleNotifEnabled("debts")}
              onToggleLead={(d) => toggleNotifLeadDay("debts", d)}
            />
            <NotifCategoryRow
              icon={<ListTodo size={18} />}
              title="Deadlines / To-dos"
              subtitle="Pending tasks with a due date"
              cat={notif.deadlines}
              showLeadDays
              onToggle={() => toggleNotifEnabled("deadlines")}
              onToggleLead={(d) => toggleNotifLeadDay("deadlines", d)}
            />
            <NotifCategoryRow
              icon={<GraduationCap size={18} />}
              title="Exam Countdown"
              subtitle="Upcoming exams"
              cat={notif.exams}
              showLeadDays
              onToggle={() => toggleNotifEnabled("exams")}
              onToggleLead={(d) => toggleNotifLeadDay("exams", d)}
            />
            <NotifCategoryRow
              icon={<BookOpen size={18} />}
              title="Reading Notification"
              subtitle="Reminders at each subject's scheduled time"
              cat={notif.reading}
              onToggle={() => toggleNotifEnabled("reading")}
            />
            <NotifCategoryRow
              icon={<Pill size={18} />}
              title="Medicine Tracker"
              subtitle="Daily reminder at each medicine's scheduled time"
              cat={notif.medicine}
              onToggle={() => toggleNotifEnabled("medicine")}
            />
          </div>
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

      <div className="text-center py-2">
        <p className="text-[11px] text-slate-300">
          made by ceej domingo · pasend gcash 0997 529 6479
        </p>
      </div>
    </div>
  );
}