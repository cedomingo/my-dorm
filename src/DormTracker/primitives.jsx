// ─────────────────────────────────────────────
// SECTION 3  SHARED UI PRIMITIVES
// ─────────────────────────────────────────────
import { X } from "lucide-react";

// ─────────────────────────────────────────────
// SECTION 3  SHARED UI PRIMITIVES
// ─────────────────────────────────────────────

export function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${active ? "accent-nav-active" : "text-slate-400 hover:text-slate-600"}`}>
      {icon}
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );
}

export function ModalWrapper({ close, title, children }) {
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

export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>;
}

export function CardHeader({ icon, title, action }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 p-5 pb-4">
      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">{icon}{title}</h2>
      {action}
    </div>
  );
}

export function Toggle({ on, onToggle }) {
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

export function AccentBtn({ onClick, children, className = "" }) {
  return (
    <button onClick={onClick} className={`accent-btn rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${className}`}>
      {children}
    </button>
  );
}

export function SoftAccentBtn({ onClick, children, className = "" }) {
  return (
    <button onClick={onClick} className={`accent-soft-btn rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${className}`}>
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="p-10 text-center">
      <div className="text-slate-300 mx-auto mb-3 flex justify-center">{icon}</div>
      <p className="text-slate-500 font-semibold">{title}</p>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}