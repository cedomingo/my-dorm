// utils/calculations.js
export const getDailyTotals = (logs, dateString) => {
  const dayLogs = logs[dateString] || { foods: [], purchases: [], expenses: [] };
  const totalCals = dayLogs.foods.reduce((sum, f) => sum + (f.cals || 0), 0);
  const totalSpent = 
    dayLogs.purchases.reduce((sum, p) => sum + (p.cost || 0), 0) + 
    dayLogs.expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
  return { totalCals, totalSpent };
};

export const formatQty = (qty, unit) => {
  if (unit?.toLowerCase() === 'cups') {
    return Number(qty).toFixed(1);
  }
  return Math.round(qty).toString();
};

export const calculateExamDaysLeft = (examDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const examDateObj = new Date(examDate + 'T00:00:00');
  const diffMs = examDateObj - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const calculateSleepDebt = (sleepEntries, targetHours, days = 7) => {
  // Implementation for sleep debt calculation
  // Will be fully implemented in Phase 5
  return { totalMinutes: 0, debtMinutes: 0, display: '0h 0m' };
};