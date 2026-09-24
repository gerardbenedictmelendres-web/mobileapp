export const parseTime = (value: string) => {
  const [clock, meridiem = 'AM'] = value.split(' ');
  const [rawHours, rawMinutes] = clock.split(':').map(Number);
  const date = new Date();
  let hours = rawHours % 12;
  if (meridiem === 'PM') hours += 12;
  date.setHours(hours, rawMinutes || 0, 0, 0);
  return date;
};

export const formatTime = (date: Date) => 
  date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const formatDate = (date: Date) => 
  date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

export const parseDate = (value: string) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

// New Smart Date Context Feature
export const getDueDateContext = (dueDateStr: string) => {
  if (!dueDateStr) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return { text: 'Due Today', urgent: true };
  if (diffDays < 0) return { text: 'Overdue', urgent: true };
  if (diffDays === 1) return { text: 'Due Tomorrow', urgent: false };
  
  return { text: `Due ${dueDateStr}`, urgent: false };
};