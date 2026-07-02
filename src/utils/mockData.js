import { getOffsetDateStr, getTodayStr } from './dateUtils';

const todayStr = getTodayStr();
const yesterdayStr = getOffsetDateStr(-1);
const dayBeforeStr = getOffsetDateStr(-2);

export const initialDict = [
  { id: 'd1', name: 'Raw Rice', type: 'food', unit: 'cups', purchaseUnit: 'kilos', convertRate: 6.6, cost: 60, calories: 735 },
  { id: 'd2', name: 'Century Tuna', type: 'food', unit: 'pcs', purchaseUnit: 'pcs', convertRate: 1, cost: 35, calories: 240 },
  { id: 'd3', name: 'Pancit Canton Kasalo', type: 'food', unit: 'pcs', purchaseUnit: 'pcs', convertRate: 1, cost: 25, calories: 560 },
  { id: 'd4', name: 'Burger Steak (6-pack)', type: 'food', unit: 'pcs', purchaseUnit: 'pack', convertRate: 6, cost: 50, calories: 150 },
  { id: 'd5', name: 'Chicken McDo with Rice', type: 'food', unit: 'pcs', purchaseUnit: 'pcs', convertRate: 1, cost: 120, calories: 389 },
  { id: 'd6', name: 'Laundry detergent', type: 'household', unit: 'pcs', purchaseUnit: 'pcs', convertRate: 1, cost: 15, calories: 0 },
  { id: 'd7', name: 'Gym Session', type: 'service', unit: 'session', purchaseUnit: 'session', convertRate: 1, cost: 50, calories: 0 },
  { id: 'd8', name: 'Jeepney Ride', type: 'service', unit: 'trip', purchaseUnit: 'trip', convertRate: 1, cost: 15, calories: 0 },
];

export const initialInventory = {
  'Century Tuna': { unit: 'pcs', qty: 3, type: 'food', dictId: 'd2' },
  'Raw Rice': { unit: 'cups', qty: 6.6, type: 'food', dictId: 'd1' },
  'Burger Steak (6-pack)': { unit: 'pcs', qty: 6, type: 'food', dictId: 'd4' },
  'Laundry detergent': { unit: 'pcs', qty: 4, type: 'household', dictId: 'd6' }
};

export const initialLogs = {
  '2026-06-01': {
    foods: [{ name: 'Raw Rice', qty: 1, cals: 735 }, { name: 'Century Tuna', qty: 1, cals: 240 }],
    purchases: [{ name: 'Century Tuna', qty: 3, cost: 105 }],
    expenses: []
  },
  '2026-06-02': {
    foods: [{ name: 'Pancit Canton Kasalo', qty: 1, cals: 560 }],
    purchases: [],
    expenses: [{ name: 'Jeepney Ride', cost: 15 }]
  },
  [dayBeforeStr]: { 
    foods: [{ name: 'Raw Rice', qty: 2, cals: 1470 }, { name: 'Century Tuna', qty: 1, cals: 240 }], 
    purchases: [{ name: 'Pancit Canton Kasalo', qty: 3, cost: 75 }], 
    expenses: [{ name: 'Laundry Service', cost: 150 }] 
  },
  [yesterdayStr]: { 
    foods: [{ name: 'Pancit Canton Kasalo', qty: 1, cals: 560 }], 
    purchases: [], 
    expenses: [{ name: 'Gym Session', cost: 50 }] 
  },
  [todayStr]: {
    foods: [{ name: 'Chicken McDo with Rice', qty: 1, cals: 389 }], 
    purchases: [{ name: 'Chicken McDo with Rice', qty: 1, cost: 120 }], 
    expenses: [{ name: 'Jeepney Ride', cost: 15 }]
  }
};

export const initialTodos = {};

export const initialExams = [];
