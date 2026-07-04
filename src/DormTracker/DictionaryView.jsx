// ─────────────────────────────────────────────
// SECTION 7  PRESETS VIEW
// ─────────────────────────────────────────────
import { BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardHeader, SoftAccentBtn, EmptyState } from "./primitives";


// ─────────────────────────────────────────────
// SECTION 7  PRESETS VIEW
// ─────────────────────────────────────────────

export function DictionaryView({ dictionary, onEdit, onDelete, onAdd }) {
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