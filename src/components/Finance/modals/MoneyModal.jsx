// components/money/MoneyModal.jsx
import React, { useState } from 'react';
import { ModalWrapper } from '../layout/ModalWrapper';

export function MoneyModal({ money, setMoney, close }) {
  const [amount, setAmount] = useState('');
  const [isAdding, setIsAdding] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(amount, 10);
    if (!isNaN(val)) {
      setMoney(prev => isAdding ? prev + val : prev - val);
      close();
    }
  };

  return (
    <ModalWrapper close={close} title="Adjust Wallet">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button type="button" onClick={() => setIsAdding(true)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${isAdding ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Add Money</button>
          <button type="button" onClick={() => setIsAdding(false)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${!isAdding ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}>Deduct</button>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Php - Whole Numbers Only)</label>
          <input 
            type="number" step="1" required autoFocus
            className="w-full border border-slate-200 rounded-xl p-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">
          Confirm
        </button>
      </form>
    </ModalWrapper>
  );
}