import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '../../Shared/ModalWrapper';

export function DictModal({ 
  isOpen, 
  onClose, 
  dictionary, 
  onAddPreset, 
  onEditPreset,
  editingPreset = null 
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('food');
  const [unit, setUnit] = useState('pcs');
  const [purchaseUnit, setPurchaseUnit] = useState('pcs');
  const [convertRate, setConvertRate] = useState(1);
  const [cost, setCost] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    if (editingPreset) {
      setName(editingPreset.name);
      setType(editingPreset.type);
      setUnit(editingPreset.unit);
      setPurchaseUnit(editingPreset.purchaseUnit);
      setConvertRate(editingPreset.convertRate);
      setCost(editingPreset.cost.toString());
      setCalories(editingPreset.calories.toString());
    }
  }, [editingPreset]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const preset = {
      id: editingPreset?.id || `d${Date.now()}`,
      name,
      type,
      unit,
      purchaseUnit,
      convertRate: parseFloat(convertRate),
      cost: parseFloat(cost),
      calories: parseFloat(calories),
    };

    if (editingPreset) {
      onEditPreset(preset);
    } else {
      onAddPreset(preset);
    }

    // Reset form
    setName('');
    setType('food');
    setUnit('pcs');
    setPurchaseUnit('pcs');
    setConvertRate(1);
    setCost('');
    setCalories('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={editingPreset ? 'Edit Preset' : 'Add Food/Item Preset'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="food">Food</option>
          <option value="household">Household</option>
          <option value="service">Service</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Unit (e.g., pcs, cups)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Purchase Unit"
            value={purchaseUnit}
            onChange={(e) => setPurchaseUnit(e.target.value)}
            className="border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <input
          type="number"
          step="0.1"
          placeholder="Convert Rate (unit per purchase)"
          value={convertRate}
          onChange={(e) => setConvertRate(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="1"
            placeholder="Cost (₱)"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="number"
            step="1"
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          {editingPreset ? 'Update Preset' : 'Add Preset'}
        </button>
      </form>
    </ModalWrapper>
  );
}
