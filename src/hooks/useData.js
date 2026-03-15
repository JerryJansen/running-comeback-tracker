import { useState, useEffect, useCallback } from 'react';
import * as db from '../utils/db';

export function useData() {
  const [runs, setRuns] = useState([]);
  const [rehab, setRehab] = useState([]);
  const [pain, setPain] = useState([]);
  const [restDays, setRestDays] = useState([]);
  const [programStart, setProgramStart] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [weekExercises, setWeekExercises] = useState({});
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [startingWeek, setStartingWeek] = useState(1);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [r, rh, p, rd, ps, ex, wex, wp, sw] = await Promise.all([
      db.getAll('runs'),
      db.getAll('rehab'),
      db.getAll('pain'),
      db.getSetting('restDays'),
      db.getSetting('programStart'),
      db.getSetting('exercises'),
      db.getSetting('weekExercises'),
      db.getSetting('weeklyPlan'),
      db.getSetting('startingWeek'),
    ]);
    setRuns(r);
    setRehab(rh);
    setPain(p);
    setRestDays(rd || []);
    setProgramStart(ps || null);
    setExercises(ex || []);
    setWeekExercises(wex || {});
    setWeeklyPlan(wp || defaultWeeklyPlan());
    setStartingWeek(sw || 1);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveRun = async (run) => {
    await db.put('runs', run);
    await refresh();
  };

  const deleteRun = async (id) => {
    await db.del('runs', id);
    await refresh();
  };

  const saveRehab = async (session) => {
    await db.put('rehab', session);
    await refresh();
  };

  const deleteRehab = async (id) => {
    await db.del('rehab', id);
    await refresh();
  };

  const savePain = async (entry) => {
    await db.put('pain', entry);
    await refresh();
  };

  const deletePain = async (id) => {
    await db.del('pain', id);
    await refresh();
  };

  const saveProgramStart = async (date) => {
    await db.setSetting('programStart', date);
    setProgramStart(date);
  };

  const saveExercises = async (list) => {
    await db.setSetting('exercises', list);
    setExercises(list);
  };

  const saveWeeklyPlan = async (plan) => {
    await db.setSetting('weeklyPlan', plan);
    setWeeklyPlan(plan);
  };

  const saveRestDay = async (date) => {
    const updated = [...restDays.filter((d) => d !== date), date];
    await db.setSetting('restDays', updated);
    setRestDays(updated);
  };

  const removeRestDay = async (date) => {
    const updated = restDays.filter((d) => d !== date);
    await db.setSetting('restDays', updated);
    setRestDays(updated);
  };

  const saveStartingWeek = async (week) => {
    await db.setSetting('startingWeek', week);
    setStartingWeek(week);
  };

  const saveWeekExercises = async (weekNum, exerciseList) => {
    const updated = { ...weekExercises, [weekNum]: exerciseList };
    await db.setSetting('weekExercises', updated);
    setWeekExercises(updated);
  };

  const getExercisesForWeek = (weekNum) => {
    if (weekExercises[weekNum] && weekExercises[weekNum].length > 0) {
      return weekExercises[weekNum];
    }
    return exercises;
  };

  return {
    runs, rehab, pain, restDays, programStart, exercises, weekExercises, weeklyPlan, startingWeek, loading,
    saveRun, deleteRun, saveRehab, deleteRehab, savePain, deletePain,
    saveProgramStart, saveExercises, saveWeeklyPlan, saveStartingWeek, saveRestDay, removeRestDay,
    saveWeekExercises, getExercisesForWeek, refresh,
  };
}

function defaultWeeklyPlan() {
  return Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    targetKm: 0,
    numRuns: 0,
    runTypes: '',
    rehabFrequency: '',
  }));
}
