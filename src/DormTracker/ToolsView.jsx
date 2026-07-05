// ─────────────────────────────────────────────
// SECTION 8  TOOLS VIEW (Grades + Absents)
// ─────────────────────────────────────────────
import { useState } from "react";
import {
  GraduationCap, Users, BookMarked, Plus, ChevronLeft,
  Trash2, FileText, X, Check, Edit, ShieldCheck, Undo2,
} from "lucide-react";

import { Card, CardHeader, EmptyState } from "./primitives";
import { useLocalStorage } from "./hooks";
import { todayStr } from "./data";

export function ToolsView() {
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
    if (c.skipped) return; // exempted component contributes nothing, weight excluded
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
  if (!fc || fc.skipped || fc.scores.length > 0) return null;
  let earned = 0, ew = 0;
  subject.components.forEach(c => {
    if (c.name.toLowerCase().includes("final") || c.skipped || c.scores.length === 0) return;
    const avg = c.scores.reduce((a, s) => a + s.score, 0) / c.scores.reduce((a, s) => a + s.max, 0);
    earned += avg * c.weight; ew += c.weight;
  });
  const needed = ((subject.passingGrade - earned) / fc.weight) * 100;
  return Math.max(0, Math.min(100, Math.round(needed * 10) / 10));
};

// Checks whether the student is currently eligible to skip a given (finals) component:
// no scores logged yet for it, and the grade from everything else already passes.
const canSkip = (subject, comp) => {
  if (comp.skipped || comp.scores.length > 0) return false;
  const grade = calcGrade(subject); // already excludes comp since it has no scores
  return grade !== null && grade.passing;
};

export function GradesTracker() {
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

export function SubjectCard({ subject, onClick }) {
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

export function AddSubjectForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [passing, setPassing] = useState("60");
  const [comps, setComps] = useState([
    { id: "c1", name: "Quizzes", weight: 25, scores: [], skipped: false },
    { id: "c2", name: "Groupwork", weight: 25, scores: [], skipped: false },
    { id: "c3", name: "Attendance", weight: 25, scores: [], skipped: false },
    { id: "c4", name: "Finals", weight: 25, scores: [], skipped: false },
  ]);
  const [cn, setCn] = useState(""), [cw, setCw] = useState("");
  const total = comps.reduce((a, c) => a + c.weight, 0);
  const addComp = () => {
    if (!cn.trim() || !cw) return;
    setComps(p => [...p, { id: "c" + Date.now(), name: cn.trim(), weight: parseFloat(cw), scores: [], skipped: false }]);
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

// New: inline editor for an existing subject's components (rename / reweight / delete / add)
function EditComponentsPanel({ subject, onSave, onCancel }) {
  const [comps, setComps] = useState(subject.components.map(c => ({ ...c })));
  const [cn, setCn] = useState(""), [cw, setCw] = useState("");
  const total = comps.reduce((a, c) => a + c.weight, 0);

  const addComp = () => {
    if (!cn.trim() || !cw) return;
    setComps(p => [...p, { id: "c" + Date.now(), name: cn.trim(), weight: parseFloat(cw), scores: [], skipped: false }]);
    setCn(""); setCw("");
  };
  const removeComp = (id) => setComps(p => p.filter(c => c.id !== id));
  const rename = (id, name) => setComps(p => p.map(c => c.id === id ? { ...c, name } : c));
  const reweight = (id, weight) => setComps(p => p.map(c => c.id === id ? { ...c, weight: parseFloat(weight) || 0 } : c));

  return (
    <Card>
      <CardHeader icon={<Edit size={18} className="text-slate-500" />} title="Edit Components" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-500">Components</label>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${total === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{total}% / 100%</span>
        </div>
        <div className="space-y-2">
          {comps.map(c => (
            <div key={c.id} className="flex gap-2 items-center">
              <input type="text" value={c.name} onChange={e => rename(c.id, e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-slate-200" />
              <input type="number" min="0" max="100" value={c.weight} onChange={e => reweight(c.id, e.target.value)}
                className="w-16 border border-slate-200 rounded-lg p-2 text-sm text-center outline-none focus:ring-2 focus:ring-slate-200" />
              <span className="text-xs text-slate-400">%</span>
              <button type="button" onClick={() => removeComp(c.id)} className="text-slate-300 hover:text-rose-500 transition" title="Delete component (removes its scores too)">
                <Trash2 size={16} />
              </button>
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
        {total !== 100 && <p className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">⚠ Weights must total exactly 100%</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
          <button type="button" disabled={total !== 100} onClick={() => onSave(comps)} className="flex-1 py-2.5 accent-btn rounded-xl text-sm font-bold disabled:opacity-40 transition">Save Changes</button>
        </div>
      </div>
    </Card>
  );
}

export function SubjectDetail({ subject, onUpdate, onBack, onDelete }) {
  const [activeComp, setActiveComp] = useState(null);
  const [si, setSi] = useState(""), [mi, setMi] = useState(""), [sl, setSl] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showEditComps, setShowEditComps] = useState(false);
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
  const saveComps = (newComps) => { onUpdate({ ...subject, components: newComps }); setShowEditComps(false); };
  const toggleSkip = (compId, skip) => onUpdate({ ...subject, components: subject.components.map(c => c.id === compId ? { ...c, skipped: skip } : c) });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <h2 className="font-extrabold text-slate-800 text-lg">{subject.name}</h2>
          <p className="text-xs text-slate-400">Passing: {subject.passingGrade}%</p>
        </div>
        <button onClick={() => setShowEditComps(true)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition" title="Edit components"><Edit size={18} /></button>
        <button onClick={() => setShowNotes(true)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition" title="Notes"><FileText size={18} /></button>
        <button onClick={() => onDelete(subject.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"><Trash2 size={18} /></button>
      </div>

      {showEditComps && (
        <EditComponentsPanel subject={subject} onSave={saveComps} onCancel={() => setShowEditComps(false)} />
      )}

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
        const skippable = isFinals && canSkip(subject, comp);
        return (
          <Card key={comp.id}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-slate-800">{comp.name}</p>
                  <p className="text-xs text-slate-400">{comp.weight}% of grade</p>
                </div>
                {comp.skipped
                  ? <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1"><ShieldCheck size={13} /> Exempted</span>
                  : pct !== null
                    ? <span className={`text-lg font-extrabold ${pct >= subject.passingGrade ? "text-emerald-600" : "text-rose-500"}`}>{pct}%</span>
                    : isFinals && needed !== null
                      ? <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">Need {needed}%</span>
                      : <span className="text-slate-300 text-xs">No scores</span>
                }
              </div>

              {isFinals && comp.skipped && (
                <button onClick={() => toggleSkip(comp.id, false)} className="w-full mb-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-1">
                  <Undo2 size={13} /> Undo exemption
                </button>
              )}

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

              {!comp.skipped && (activeComp === comp.id ? (
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
                <div className="space-y-2">
                  <button onClick={() => setActiveComp(comp.id)} className="w-full py-2 text-xs font-bold accent-text accent-bg-soft rounded-xl hover:accent-bg-100 transition flex items-center justify-center gap-1">
                    <Plus size={13} /> Add Score
                  </button>
                  {skippable && (
                    <button onClick={() => toggleSkip(comp.id, true)} className="w-full py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition flex items-center justify-center gap-1">
                      <ShieldCheck size={13} /> Skip Finals — already passing
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function AbsentsTracker() {
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