import { format, differenceInCalendarDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';

export function today() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return format(d, 'yyyy-MM-dd');
}

export function formatDate(dateStr) {
  return format(parseISO(dateStr), 'EEE, MMM d');
}

export function formatDateFull(dateStr) {
  return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function calculatePace(distanceKm, durationMin) {
  if (!distanceKm || !durationMin) return null;
  const paceMin = durationMin / distanceKm;
  const mins = Math.floor(paceMin);
  const secs = Math.round((paceMin - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}

export function painColor(level) {
  if (level <= 3) return '#10b981'; // green
  if (level <= 6) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function painLabel(level) {
  if (level <= 3) return 'Low';
  if (level <= 6) return 'Moderate';
  return 'High';
}

export function getCurrentWeek(programStartDate, startingWeek = 1) {
  if (!programStartDate) return null;
  const start = parseISO(programStartDate);
  const diff = differenceInCalendarDays(new Date(), start);
  if (diff < 0) return 0;
  const calendarWeek = Math.floor(diff / 7) + 1;
  // Offset by starting week: calendar week 1 = startingWeek
  const week = calendarWeek + (startingWeek - 1);
  return Math.min(week, 8);
}

export function getWeekDates(dateStr) {
  const date = parseISO(dateStr);
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
}

export function getStreakCount(runs, rehab, pain, restDays = []) {
  const allDates = new Set();
  [...runs, ...rehab, ...pain].forEach((item) => allDates.add(item.date));
  restDays.forEach((d) => allDates.add(d));
  const sorted = [...allDates].sort().reverse();

  let streak = 0;
  const todayStr = today();
  let checkDate = todayStr;

  for (let i = 0; i < 365; i++) {
    if (sorted.includes(checkDate)) {
      streak++;
    } else if (checkDate !== todayStr) {
      break;
    }
    const d = parseISO(checkDate);
    d.setDate(d.getDate() - 1);
    checkDate = format(d, 'yyyy-MM-dd');
  }
  return streak;
}
