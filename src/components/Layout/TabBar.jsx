// components/layout/Navigation.jsx
import React from 'react';
import { Activity, CalendarDays, BookOpen, TrendingUp, Settings } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'dictionary', label: 'Presets', icon: BookOpen },
  { id: 'rankings', label: 'Rankings', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 pb-safe z-10 max-w-md left-1/2 -translate-x-1/2">
      {TABS.map(({ id, label, icon: Icon }) => (
        <NavButton
          key={id}
          icon={<Icon size={22} />}
          label={label}
          active={activeTab === id}
          onClick={() => onTabChange(id)}
        />
      ))}
    </nav>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}
    >
      {icon}
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );
}