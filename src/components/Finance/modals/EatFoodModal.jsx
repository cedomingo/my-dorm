import React, { useState } from 'react';
import { ModalWrapper } from '../../Shared/ModalWrapper';

export function EatFoodModal({ 
  isOpen, 
  onClose, 
  inventory, 
  dictionary,
  onEatFood,
  date 
}) {
  const [selectedItem, setSelectedItem] = useState('');
  const [qty, setQty] = useState('');
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [quickMealName, setQuickMealName] = useState('');
  const [quickMealCals, setQuickMealCals] = useState('');

  const inventoryFoods = Object.entries(inventory)
    .filter(([name, item]) => item.type === 'food' && item.qty > 0)
    .map(([name, item]) => {
      const dictItem = dictionary.find(d => d.dictId === item.dictId);
      return { name, ...item, dictItem };
    });

  const selectedFood = inventoryFoods.find(f => f.name === selectedItem);
  const selectedDictItem = selectedFood?.dictItem;
  const isCups = selectedDictItem?.unit.toLowerCase().includes('cups');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isQuickAdd) {
      if (!quickMealName || !quickMealCals) return;
      onEatFood({
        type: 'quick',
        name: quickMealName,
        calories: parseFloat(quickMealCals),
      });
      setQuickMealName('');
      setQuickMealCals('');
    } else {
      if (!selectedItem || !qty) return;
      onEatFood({
        type: 'inventory',
        itemName: selectedItem,
        qty: parseFloat(qty),
      });
      setSelectedItem('');
      setQty('');
    }

    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Log Food Eaten" size="md">
      {/* Quick Toggle */}
      <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-100 mb-4">
        <div>
          <span className="text-xs font-bold text-amber-800 block">Quick Log Outside Meal</span>
          <span className="text-[10px] text-slate-500">Fast on-the-fly meals with zero preset configuration.</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isQuickAdd}
            onChange={(e) => setIsQuickAdd(e.target.checked)}
            className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {isQuickAdd ? (
          <>
            <input
              required
              type="text"
              placeholder="Meal name (e.g., Jollibee Meal)"
              value={quickMealName}
              onChange={(e) => setQuickMealName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              required
              type="number"
              step="1"
              min="1"
              placeholder="Calories (estimated)"
              value={quickMealCals}
              onChange={(e) => setQuickMealCals(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </>
        ) : (
          <>
            <select
              required
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Choose Food from Inventory --</option>
              {inventoryFoods.map(food => (
                <option key={food.name} value={food.name}>
                  {food.name} (Available: {isCups ? Number(food.qty).toFixed(1) : Math.round(food.qty)} {food.unit})
                </option>
              ))}
            </select>

            {selectedFood && (
              <div className="text-xs bg-amber-50 text-amber-700 p-2 rounded-lg font-medium">
                💡 Per {selectedDictItem?.unit || 'unit'}: {selectedDictItem?.calories || 0} kcal
              </div>
            )}

            <input
              required
              type="number"
              step={isCups ? "0.1" : "1"}
              min={isCups ? "0.1" : "1"}
              placeholder={`Qty (${selectedDictItem?.unit || 'units'})`}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition"
        >
          Log Food
        </button>
      </form>
    </ModalWrapper>
  );
}
