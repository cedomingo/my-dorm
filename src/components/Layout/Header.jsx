// components/layout/Header.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

export function Header({ selectedDate }) {
  return (
    <header className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold tracking-tight">DormTracker</h1>
        <p className="text-[10px] text-indigo-200">Personal Calorie & Expense Manager</p>
      </div>
      <div className="flex items-center space-x-2 bg-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
        <Calendar size={16} />
        <span>{selectedDate}</span>
      </div>
    </header>
  );
}