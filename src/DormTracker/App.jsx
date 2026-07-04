// ─────────────────────────────────────────────
// SECTION 11  ROOT APP
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Activity, CalendarDays, BookOpen, Wrench, Settings, Calendar } from "lucide-react";
import "./DormTracker.css";

import { useLocalStorage } from "./hooks";
import {
  initialDict, initialInventory, initialLogs, todayStr,
  DEFAULT_SETTINGS, DEFAULT_SLEEP_SETTINGS, DEFAULT_DASHBOARD_CONFIG,
} from "./data";
import { NavButton } from "./primitives";
import { Dashboard } from "./Dashboard";
import { CalendarView } from "./CalendarView";
import { DictionaryView } from "./DictionaryView";
import { ToolsView } from "./ToolsView";
import { SettingsView } from "./SettingsView";
import {
  AdjustMoneyModal, AddDictionaryModal, DailyLogModal, TodoModal, ExamModalComp,
} from "./Modals";


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
  const [payments, setPayments] = useLocalStorage("dorm_payments_v1", []);
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
    const d = logs[ds] || {};
    const foods = d.foods || [];
    const purchases = d.purchases || [];
    const expenses = d.expenses || [];
    return {
      totalCals: foods.reduce((s, f) => s + (f.cals || 0), 0),
      totalSpent: purchases.reduce((s, p) => s + (p.cost || 0), 0) + expenses.reduce((s, e) => s + (e.cost || 0), 0),
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
          <h1 className="text-xl font-bold tracking-tight">Bahay ng Kolek</h1>
          <p className="text-[10px] accent-header-sub">kalalaking tao nagttrack ng kalidad ng buhay</p>
        </div>
        <button onClick={() => { setSelectedDate(todayStr); setShowLogModal(true); }}
          className="flex items-center gap-1.5 bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold transition">
          <Calendar size={14} /> {todayStr}
        </button>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {activeTab === "dashboard" && (
          <Dashboard money={money} setMoney={setMoney} inventory={inventory} setInventory={setInventory}
            logs={logs} setLogs={setLogs} getDailyTotals={getDailyTotals} recentDays={recentDays}
            setShowMoneyModal={setShowMoneyModal} setSelectedDate={setSelectedDate} setShowLogModal={setShowLogModal}
            exams={exams} setShowExamModal={() => setShowExamModal(true)} todos={todos} settings={settings}
            sleepLogs={sleepLogs} setSleepLogs={setSleepLogs} sleepSettings={sleepSettings} setSleepSettings={setSleepSettings}
            readingSubjects={readingSubjects} setReadingSubjects={setReadingSubjects} readingLogs={readingLogs} setReadingLogs={setReadingLogs}
            medicineLogs={medicineLogs} setMedicineLogs={setMedicineLogs}
            debtRecords={debtRecords} setDebtRecords={setDebtRecords}
            gymData={gymData} setGymData={setGymData}
            payments={payments} setPayments={setPayments}
            dashboardConfig={dashboardConfig} setDashboardConfig={setDashboardConfig} />
        )}
        {activeTab === "calendar" && (
          <CalendarView logs={logs} getDailyTotals={getDailyTotals} setSelectedDate={setSelectedDate}
            setShowLogModal={setShowLogModal} todos={todos}
            onOpenTodo={date => { setTodoModalDate(date); setShowTodoModal(true); }}
            settings={settings} sleepLogs={sleepLogs} money={money} />
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