import { useState } from 'react';
import { exportAllData, importAllData } from '../utils/db';
import { WEEKLY_EXERCISES, RUNNING_PLAN, EQUIPMENT, PHASE_NAMES } from '../utils/pfpsProgram';

export default function Settings({ data }) {
  const [programStart, setProgramStart] = useState(data.programStart || '');
  const [exercises, setExercises] = useState(
    data.exercises.length > 0 ? data.exercises : [{ name: '', sets: 3, reps: 10 }]
  );
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [weekOverrideOpen, setWeekOverrideOpen] = useState(null);
  const [weekExForm, setWeekExForm] = useState({});

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: '', sets: 3, reps: 10 }]);
  };

  const removeExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateExercise = (idx, field, value) => {
    setExercises((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    await data.saveProgramStart(programStart);
    await data.saveExercises(exercises.filter((e) => e.name.trim()));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Per-week exercise overrides
  const openWeekOverride = (week) => {
    const existing = data.weekExercises[week] || exercises.filter((e) => e.name.trim());
    setWeekExForm({ [week]: existing.length > 0 ? [...existing] : [{ name: '', sets: 3, reps: 10 }] });
    setWeekOverrideOpen(week);
  };

  const updateWeekEx = (week, idx, field, value) => {
    setWeekExForm((prev) => {
      const list = [...(prev[week] || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [week]: list };
    });
  };

  const addWeekEx = (week) => {
    setWeekExForm((prev) => ({
      ...prev,
      [week]: [...(prev[week] || []), { name: '', sets: 3, reps: 10 }],
    }));
  };

  const removeWeekEx = (week, idx) => {
    setWeekExForm((prev) => ({
      ...prev,
      [week]: (prev[week] || []).filter((_, i) => i !== idx),
    }));
  };

  const saveWeekOverride = async (week) => {
    const list = (weekExForm[week] || []).filter((e) => e.name.trim());
    await data.saveWeekExercises(week, list);
    setWeekOverrideOpen(null);
  };

  const clearWeekOverride = async (week) => {
    await data.saveWeekExercises(week, []);
    setWeekOverrideOpen(null);
  };

  const loadPfpsProgram = async () => {
    if (!confirm('This will load the full evidence-based PFPS rehab program into all 8 weeks, and set the running plan targets. Continue?')) return;

    // Set default exercises to Phase 1
    const phase1 = WEEKLY_EXERCISES[1].map((e) => ({ name: e.name, sets: e.sets, reps: e.reps }));
    setExercises(phase1);
    await data.saveExercises(phase1);

    // Set per-week exercise overrides for all 8 weeks
    for (let w = 1; w <= 8; w++) {
      const weekEx = WEEKLY_EXERCISES[w].map((e) => ({ name: e.name, sets: e.sets, reps: e.reps }));
      await data.saveWeekExercises(w, weekEx);
    }

    // Set the running plan targets
    const plan = RUNNING_PLAN.map((w) => ({
      targetKm: w.approxKm,
      numRuns: w.sessions,
      runTypes: `${w.runMin}min run / ${w.walkMin}min walk × ${w.intervals}`,
      rehabFrequency: w.week <= 4 ? 5 : 4,
    }));
    await data.saveWeeklyPlan(plan);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = async () => {
    const allData = await exportAllData();
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comeback-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.runs || !parsed.rehab || !parsed.pain) {
        throw new Error('Invalid backup file');
      }
      await importAllData(parsed);
      await data.refresh();
      setImportStatus('Data imported successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (err) {
      setImportStatus('Import failed: ' + err.message);
    }
    e.target.value = '';
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('Comeback Tracker', { body: 'Notifications enabled!' });
      }
    }
  };

  return (
    <div className="settings">
      <h2>Settings</h2>

      <div className="card pfps-setup-card">
        <h3>Quick Setup: PFPS Program</h3>
        <p className="text-muted">
          Load a complete evidence-based 8-week patellofemoral pain rehab program with progressive exercises and return-to-running plan.
        </p>
        <ul className="pfps-features-list">
          <li>4 phases of progressive rehab exercises (11-12 exercises per phase)</li>
          <li>Week-by-week return-to-running with walk/run intervals</li>
          <li>Hip, quad, hamstring, calf & balance work</li>
          <li>Equipment: resistance bands, foam roller, step, chair</li>
        </ul>
        <button className="btn btn--primary btn--full" onClick={loadPfpsProgram}>
          Load PFPS Rehab Program
        </button>
      </div>

      <div className="card">
        <h3>Program Start Date</h3>
        <p className="text-muted">When did (or will) your 8-week program begin?</p>
        <input
          type="date"
          value={programStart}
          onChange={(e) => setProgramStart(e.target.value)}
        />
      </div>

      <div className="card">
        <h3>Default Rehab Exercises</h3>
        <p className="text-muted">Used unless a week has custom exercises below.</p>
        {exercises.map((ex, idx) => (
          <div key={idx} className="exercise-config">
            <input
              type="text"
              placeholder="Exercise name"
              value={ex.name}
              onChange={(e) => updateExercise(idx, 'name', e.target.value)}
              className="exercise-name-input"
            />
            <div className="exercise-config-nums">
              <input
                type="number"
                value={ex.sets}
                onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                min="0"
                placeholder="Sets"
              />
              <span>×</span>
              <input
                type="number"
                value={ex.reps}
                onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                min="0"
                placeholder="Reps"
              />
              <button className="btn btn--ghost btn--sm" onClick={() => removeExercise(idx)}>✕</button>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary" onClick={addExercise}>+ Add Exercise</button>
      </div>

      <button className="btn btn--primary btn--full" onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      <div className="card">
        <h3>Per-Week Exercise Progression</h3>
        <p className="text-muted">Override exercises for specific weeks as rehab progresses.</p>
        <div className="week-exercise-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
            const hasOverride = data.weekExercises[week] && data.weekExercises[week].length > 0;
            return (
              <button
                key={week}
                className={`chip ${hasOverride ? 'chip--active' : ''} ${weekOverrideOpen === week ? 'chip--active' : ''}`}
                onClick={() => weekOverrideOpen === week ? setWeekOverrideOpen(null) : openWeekOverride(week)}
              >
                Wk {week} {hasOverride ? '✓' : ''}
              </button>
            );
          })}
        </div>

        {weekOverrideOpen && (
          <div className="week-override-editor">
            <h4>Week {weekOverrideOpen} Exercises</h4>
            {(weekExForm[weekOverrideOpen] || []).map((ex, idx) => (
              <div key={idx} className="exercise-config">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={ex.name}
                  onChange={(e) => updateWeekEx(weekOverrideOpen, idx, 'name', e.target.value)}
                  className="exercise-name-input"
                />
                <div className="exercise-config-nums">
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) => updateWeekEx(weekOverrideOpen, idx, 'sets', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={ex.reps}
                    onChange={(e) => updateWeekEx(weekOverrideOpen, idx, 'reps', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <button className="btn btn--ghost btn--sm" onClick={() => removeWeekEx(weekOverrideOpen, idx)}>✕</button>
                </div>
              </div>
            ))}
            <div className="week-override-actions">
              <button className="btn btn--secondary btn--sm" onClick={() => addWeekEx(weekOverrideOpen)}>+ Add</button>
              <button className="btn btn--primary btn--sm" onClick={() => saveWeekOverride(weekOverrideOpen)}>Save Week {weekOverrideOpen}</button>
              <button className="btn btn--ghost btn--sm text-red" onClick={() => clearWeekOverride(weekOverrideOpen)}>Use defaults</button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Notifications</h3>
        <button className="btn btn--secondary" onClick={requestNotificationPermission}>
          Enable Notifications
        </button>
      </div>

      <div className="card">
        <h3>Data Management</h3>
        <div className="data-actions">
          <button className="btn btn--secondary" onClick={handleExport}>
            Export Data (JSON)
          </button>
          <label className="btn btn--secondary file-upload-btn">
            Import Data (JSON)
            <input type="file" accept=".json" onChange={handleImport} hidden />
          </label>
        </div>
        {importStatus && <p className="import-status">{importStatus}</p>}
      </div>
    </div>
  );
}
