import React, { useState } from 'react';
import { ModalWrapper } from '../../Shared/ModalWrapper';

export function LogExpenseModal({ 
  isOpen, 
  onClose, 
  dictionary,
  onExpense,
  date 
}) {
  const [selectedItem, setSelectedItem] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCost, setCustomCost] = useState('');

  const servicePresets = dictionary.filter(d => d.type === 'service');
  const selectedPreset = dictionary.find(d => d.id === selectedItem);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem && !customDesc) return;

    const name = selectedItem ? selectedPreset.name : customDesc;
    const cost = customCost 
      ? Math.round(parseFloat(customCost)) 
      : (selectedPreset ? Math.round(selectedPreset.cost) : 0);

    onExpense({
      name,
      cost,
    });

    setSelectedItem('');
    setCustomDesc('');
    setCustomCost('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Log Expense" size="md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <select 
          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-rose-400"
          value={selectedItem} 
          onChange={e => {setSelectedItem(e.target.value); setCustomDesc('');}}
        >
          <option value="">-- Choose Preset or Type Custom --</option>
          {servicePresets.map(d => (
            <option key={d.id} value={d.id}>{d.name} (₱{Math.round(d.cost)})</option>
          ))}
        </select>

        {!selectedItem && (
          <input 
            required 
            type="text" 
            placeholder="Custom description (e.g., Trike ride home)" 
            className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-rose-400"
            value={customDesc} 
            onChange={e => setCustomDesc(e.target.value)}
          />
        )}

        <div className="flex gap-3">
          <input 
            required={!selectedItem} 
            type="number" 
            step="1" 
            placeholder="Cost Amount (₱)" 
            className="w-2/3 border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white focus:ring-2 focus:ring-rose-400"
            value={customCost} 
            onChange={e => setCustomCost(e.target.value)}
          />
          <button 
            type="submit" 
            className="w-1/3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition text-sm"
          >
            Log Expense
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
