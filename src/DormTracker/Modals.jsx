// ─────────────────────────────────────────────
// SECTION 10  MODALS
// ─────────────────────────────────────────────
import { useState } from "react";
import { Trash2, Check, Plus} from "lucide-react";
import { ModalWrapper } from "./primitives";
import { todayStr } from "./data";



// ─────────────────────────────────────────────
// SECTION 10  MODALS
// ─────────────────────────────────────────────

export function AdjustMoneyModal({ money, setMoney, close }) {
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

export function AddDictionaryModal({ dictionary, setDictionary, editingPreset, close }) {
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

export function DailyLogModal({ date, logs, setLogs, inventory, setInventory, dictionary, money, setMoney, close, settings }) {
  const [tab, setTab] = useState(settings.trackCalories ? "ate" : "purchase");
    const rawDay = logs[date] || {};
    const day = {
    foods: rawDay.foods || [],
    purchases: rawDay.purchases || [],
    expenses: rawDay.expenses || [],
    };
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
    const nl = { ...logs };
    const d = nl[date]; if (!d) return;
    d.foods = d.foods || []; d.purchases = d.purchases || []; d.expenses = d.expenses || [];
    const item = d.foods[i]; if (!item) return;
    if (!item.isQuick && !item.cameFromImmediateBuy) { const ni = { ...inventory }; if (ni[item.name]) { ni[item.name].qty += item.qty; setInventory(ni); } }
    if (item.isQuick && item.quickCost > 0) { setMoney(p => p + item.quickCost); d.expenses = d.expenses.filter(e => !(e.isQuickLinked && e.quickName === item.name)); }
    if (item.cameFromImmediateBuy) { setMoney(p => p + item.buyCost); d.purchases = d.purchases.filter(p => !(p.name === item.name && p.wasEatenImmediately)); }
    d.foods.splice(i, 1); setLogs(nl);
    };
    const delPurch = (i) => {
    const nl = { ...logs };
    const d = nl[date]; if (!d) return;
    d.foods = d.foods || []; d.purchases = d.purchases || []; d.expenses = d.expenses || [];
    const item = d.purchases[i]; if (!item) return;
    setMoney(p => p + item.cost);
    if (item.wasEatenImmediately) d.foods = d.foods.filter(f => !(f.name === item.name && f.cameFromImmediateBuy));
    else { const ni = { ...inventory }; if (ni[item.name]) { const dict = dictionary.find(x => x.name === item.name); ni[item.name].qty = Math.max(0, ni[item.name].qty - item.qty * (dict?.convertRate || 1)); setInventory(ni); } }
    d.purchases.splice(i, 1); setLogs(nl);
    };
    const delExp = (i) => {
    const nl = { ...logs };
    const d = nl[date]; if (!d) return;
    d.foods = d.foods || []; d.purchases = d.purchases || []; d.expenses = d.expenses || [];
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

export function TodoModal({ date, todos, setTodos, close }) {
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

export function ExamModalComp({ exams, setExams, close }) {
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
