// ─────────────────────────────────────────────
// SECTION 5  DASHBOARD VIEW
// ─────────────────────────────────────────────
import { useState } from "react";
import { LayoutDashboard, Plus, GripVertical, X, Check } from "lucide-react";

import { Card, EmptyState } from "./primitives";
import { ALL_MODULES } from "./data";
import {
  WalletModule, StocksModule, TrendsModule, TopExpensesModule, TopCaloriesModule,
  SleepModule, ReadingModule, MedicineModule, DebtsModule, GymModule,
  ExamModule, DeadlinesModule, PaymentsModule,
} from "./modules";

export function Dashboard({
  money, setMoney, inventory, setInventory, logs, setLogs, getDailyTotals, recentDays,
  setShowMoneyModal, setSelectedDate, setShowLogModal, exams, setShowExamModal, todos,
  settings, sleepLogs, setSleepLogs, sleepSettings, setSleepSettings, readingSubjects,
  setReadingSubjects, readingLogs, setReadingLogs, medicineLogs, setMedicineLogs,
  debtRecords, setDebtRecords, gymData, setGymData, payments, setPayments,
  dashboardConfig, setDashboardConfig,
}) {
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
      case "payments":  return <PaymentsModule payments={payments} setPayments={setPayments} money={money} setMoney={setMoney} logs={logs} setLogs={setLogs} />;
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
