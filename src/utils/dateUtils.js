// utils/dates.js
export const getTodayStr = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const getOffsetDateStr = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const getRecentDays = (todayStr, count = 5) => {
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const formatDisplayDate = (dateStr, format = 'short') => {
  const date = new Date(dateStr + 'T00:00:00');
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
  if (format === 'weekday') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US');
};

export const getMonthNames = () => [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];