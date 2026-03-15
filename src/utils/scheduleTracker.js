/**
 * Dynamic schedule tracker with sliding rescheduling.
 *
 * Instead of rescheduling missed sessions within a single week, the entire
 * program slides forward when workouts are missed.  The 56-day ideal sequence
 * is treated as a queue: each completed day advances the cursor, each missed
 * day leaves the cursor in place so the same activity appears the next day.
 * This naturally extends the program duration when sessions are skipped.
 */
import { WEEKLY_SCHEDULES } from './pfpsProgram';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  r.setHours(0, 0, 0, 0);
  return r;
}

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Build the full ideal program sequence (one entry per program day).
 * If startingWeek > 1 only weeks from startingWeek onwards are included.
 */
function buildIdealSequence(startingWeek = 1) {
  const seq = [];
  for (let week = startingWeek; week <= 8; week++) {
    const template = week <= 4 ? WEEKLY_SCHEDULES.early : WEEKLY_SCHEDULES.late;
    // Template days are Mon-Sun
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const dayName of dayOrder) {
      const entry = template.days.find((t) => t.day === dayName);
      seq.push({
        programWeek: week,
        dayName,
        activity: entry?.activity || 'rest',
        description: entry?.description || 'Rest day',
      });
    }
  }
  return seq;
}

/**
 * Check if an activity was completed on a given date.
 */
function wasCompleted(date, activityType, runs, rehab, restDays) {
  if (activityType === 'run') return runs.some((r) => r.date === date);
  if (activityType === 'rehab') return rehab.some((r) => r.date === date);
  if (activityType === 'rest') return true;
  return false;
}

/**
 * Generate the full sliding program schedule.
 *
 * The ideal program is a linear queue of activities. We walk calendar days
 * from programStart forward. For each past day we check whether the planned
 * activity was completed:
 *   - Completed (or rest): advance the queue cursor.
 *   - Missed: do NOT advance — the same activity appears the next day and
 *     everything downstream slides forward by one day.
 *
 * For today and future days we simply lay out the remaining queue.
 *
 * Returns an object with:
 *   schedule        – array of day entries for the current calendar week
 *   todayPlan       – today's entry (with effective program week & activity)
 *   effectiveWeek   – which program week the cursor is currently in
 *   missedCount     – total missed days across the whole program so far
 *   completedCount  – total completed days
 *   totalPlanned    – total non-rest activities remaining + completed
 *   daysShifted     – how many calendar days behind the original schedule
 *   rescheduledCount – number of days that shifted into the current week
 */
export function getWeekSchedule(programStart, programWeek, runs, rehab, restDays, startingWeek = 1) {
  if (!programStart) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = fmt(today);

  const start = new Date(programStart + 'T00:00:00');
  start.setHours(0, 0, 0, 0);

  // If programStart is in the future, nothing to show yet
  if (start > today) return null;

  const ideal = buildIdealSequence(startingWeek);
  if (ideal.length === 0) return null;

  let cursor = 0;        // position in ideal sequence
  let missedCount = 0;
  let completedCount = 0;

  // Walk every calendar day from programStart through today
  // to determine where the cursor should be
  const calendarDays = [];
  let d = new Date(start);
  while (d < today && cursor < ideal.length) {
    const dateStr = fmt(d);
    const planned = ideal[cursor];

    if (planned.activity === 'rest') {
      calendarDays.push({ ...planned, date: dateStr, status: 'done' });
      completedCount++;
      cursor++;
    } else {
      const done = wasCompleted(dateStr, planned.activity, runs, rehab, restDays);
      if (done) {
        calendarDays.push({ ...planned, date: dateStr, status: 'done' });
        completedCount++;
        cursor++;
      } else {
        calendarDays.push({ ...planned, date: dateStr, status: 'missed' });
        missedCount++;
        // cursor stays — activity slides to next day
      }
    }
    d = addDays(d, 1);
  }

  // Now lay out today + future days from the remaining queue
  const futureDays = [];
  let futureDate = new Date(today);
  let futureCursor = cursor;
  // Show enough days to cover at least 14 days into the future
  const horizon = addDays(today, 14);
  while (futureDate <= horizon && futureCursor < ideal.length) {
    const dateStr = fmt(futureDate);
    const planned = ideal[futureCursor];
    const isToday = dateStr === todayStr;

    futureDays.push({
      ...planned,
      date: dateStr,
      status: isToday ? 'today' : 'upcoming',
    });
    futureCursor++;
    futureDate = addDays(futureDate, 1);
  }

  // Calculate which days originally belonged to this week vs were shifted
  const thisMonday = getMonday(today);
  const thisSunday = addDays(thisMonday, 6);

  // Build the current calendar week view (Mon-Sun)
  const weekSchedule = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = addDays(thisMonday, i);
    const weekDateStr = fmt(weekDate);

    // Find this date in our calendar days (past) or future days
    const pastEntry = calendarDays.find((e) => e.date === weekDateStr);
    const futureEntry = futureDays.find((e) => e.date === weekDateStr);
    const entry = pastEntry || futureEntry;

    if (entry) {
      // Check if this activity was shifted from its original position
      const originalDayIndex = ideal.indexOf(ideal.find((item, idx) => {
        // Find which ideal index this entry corresponds to
        // For past entries, we need to figure out the original date
        return false; // We'll handle isRescheduled differently below
      }));

      weekSchedule.push({
        ...entry,
        dayName: DAY_NAMES[weekDate.getDay()],
      });
    } else {
      // Day exists but no planned activity (program finished or not started)
      weekSchedule.push({
        date: weekDateStr,
        dayName: DAY_NAMES[weekDate.getDay()],
        activity: 'rest',
        description: cursor >= ideal.length ? 'Program complete' : 'Not started',
        status: weekDate < today ? 'done' : weekDate.getTime() === today.getTime() ? 'today' : 'upcoming',
        programWeek: null,
      });
    }
  }

  // Mark rescheduled entries: any future day whose activity doesn't match
  // what the original (non-shifted) schedule would have assigned
  const originalProgramDayForToday = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const daysShifted = missedCount; // each missed day shifts program by 1

  if (daysShifted > 0) {
    for (const entry of weekSchedule) {
      if (entry.status === 'today' || entry.status === 'upcoming') {
        const calendarDay = Math.floor((new Date(entry.date + 'T00:00:00') - start) / (1000 * 60 * 60 * 24));
        const originalIndex = calendarDay; // without shifts, day N maps to ideal[N]
        const shiftedIndex = calendarDay - daysShifted; // with shifts, we're behind

        // This day shows a different activity than originally planned
        if (originalIndex < ideal.length && calendarDay !== (cursor + (new Date(entry.date + 'T00:00:00') - today) / (1000 * 60 * 60 * 24))) {
          // Simplified: if the program has shifted at all, mark future entries
          // that would have been different without the shift
          if (originalIndex < ideal.length) {
            const originalActivity = ideal[originalIndex]?.activity;
            if (entry.activity !== originalActivity) {
              entry.isRescheduled = true;
              entry.originalActivity = originalActivity;
            }
          }
        }
      }
    }
  }

  // Effective program week = the week of whatever the cursor is pointing at
  const effectiveWeek = cursor < ideal.length ? ideal[cursor].programWeek : 8;
  const todayEntry = weekSchedule.find((s) => s.date === todayStr);

  // Count non-rest activities across the whole program
  const totalNonRest = ideal.filter((d) => d.activity !== 'rest').length;

  return {
    schedule: weekSchedule,
    missedCount,
    completedCount,
    totalPlanned: totalNonRest,
    todayPlan: todayEntry || null,
    effectiveWeek,
    daysShifted,
    rescheduledCount: daysShifted > 0 ? weekSchedule.filter((d) => d.isRescheduled).length : 0,
    programComplete: cursor >= ideal.length,
  };
}

function formatNiceDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[d.getDay()];
}

/**
 * Check overall program adherence across all completed days.
 * Uses the sliding model: counts completed vs missed across the whole timeline.
 */
export function getProgramAdherence(programStart, currentWeek, runs, rehab, restDays, startingWeek = 1) {
  if (!programStart) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(programStart + 'T00:00:00');
  start.setHours(0, 0, 0, 0);

  const ideal = buildIdealSequence(startingWeek);
  let cursor = 0;
  const weekBuckets = {}; // programWeek → { planned, done, missed }

  let d = new Date(start);
  while (d < today && cursor < ideal.length) {
    const dateStr = fmt(d);
    const planned = ideal[cursor];
    const week = planned.programWeek;

    if (!weekBuckets[week]) weekBuckets[week] = { week, planned: 0, done: 0, missed: 0 };

    if (planned.activity === 'rest') {
      cursor++;
    } else {
      weekBuckets[week].planned++;
      const done = wasCompleted(dateStr, planned.activity, runs, rehab, restDays);
      if (done) {
        weekBuckets[week].done++;
        cursor++;
      } else {
        weekBuckets[week].missed++;
      }
    }
    d = addDays(d, 1);
  }

  const summary = Object.values(weekBuckets).sort((a, b) => a.week - b.week);
  const totalPlanned = summary.reduce((s, w) => s + w.planned, 0);
  const totalDone = summary.reduce((s, w) => s + w.done, 0);

  return {
    weeksSummary: summary,
    overallRate: totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : 100,
  };
}
