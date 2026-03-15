import { useState } from 'react';
import { today, generateId, painColor, getCurrentWeek } from '../utils/helpers';
import { WARMUP, COOLDOWN, WEEKLY_EXERCISES, PHASE_NAMES, PHASE_GOALS } from '../utils/pfpsProgram';

export default function RehabLogger({ data, onBack, editSession }) {
  const isEdit = !!editSession;
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [warmupDone, setWarmupDone] = useState(false);
  const [cooldownDone, setCooldownDone] = useState(false);
  const currentWeek = getCurrentWeek(data.programStart);
  const exerciseList = currentWeek
    ? data.getExercisesForWeek(currentWeek)
    : (data.exercises.length > 0 ? data.exercises : []);

  const defaultExercises = exerciseList.length > 0
    ? exerciseList
    : [{ name: 'Add exercises in Settings', sets: 3, reps: 10 }];

  const [form, setForm] = useState(editSession || {
    date: today(),
    exercises: defaultExercises.map((ex) => ({
      name: ex.name,
      targetSets: ex.sets,
      targetReps: ex.reps,
      completedSets: 0,
      completedReps: 0,
      completed: false,
      skipped: false,
      skipReason: '',
      pain: 0,
    })),
    notes: '',
  });

  const updateExercise = (idx, field, value) => {
    setForm((f) => {
      const exercises = [...f.exercises];
      exercises[idx] = { ...exercises[idx], [field]: value };
      if (field === 'completed' && value) {
        exercises[idx].skipped = false;
        exercises[idx].completedSets = exercises[idx].targetSets;
        exercises[idx].completedReps = exercises[idx].targetReps;
      }
      if (field === 'skipped' && value) {
        exercises[idx].completed = false;
        exercises[idx].completedSets = 0;
        exercises[idx].completedReps = 0;
      }
      return { ...f, exercises };
    });
  };

  const handleSave = async () => {
    const session = {
      id: editSession?.id || generateId(),
      date: form.date,
      exercises: form.exercises,
      notes: form.notes,
    };
    await data.saveRehab(session);
    onBack();
  };

  return (
    <div className="logger">
      <div className="logger-header">
        <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        <h2>{isEdit ? 'Edit Rehab' : 'Log Rehab Session'}</h2>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
      </div>

      {currentWeek && (
        <div className="card suggestion-run-banner">
          <strong>{PHASE_NAMES[currentWeek]}</strong> — Week {currentWeek}
          <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{PHASE_GOALS[currentWeek]}</div>
        </div>
      )}

      {/* Warm-up checklist */}
      {!isEdit && (
        <div className={`card checklist-card ${warmupDone ? 'checklist-card--done' : ''}`}>
          <div className="checklist-header" onClick={() => setShowWarmup(!showWarmup)}>
            <span>{warmupDone ? '✓' : '○'} Warm-up (7-10 min)</span>
            <span className="text-muted">{showWarmup ? '▲' : '▼'}</span>
          </div>
          {showWarmup && (
            <div className="checklist-items">
              {WARMUP.map((item, i) => (
                <div key={i} className="checklist-item">
                  <span className="checklist-name">{item.name}</span>
                  <span className="text-muted">{item.duration || item.reps}</span>
                </div>
              ))}
              <button className={`btn btn--sm ${warmupDone ? 'btn--ghost' : 'btn--secondary'}`} onClick={() => setWarmupDone(!warmupDone)}>
                {warmupDone ? 'Undo' : 'Done with warm-up'}
              </button>
            </div>
          )}
        </div>
      )}

      {data.exercises.length === 0 && !editSession && (
        <div className="alert alert--info">
          No exercises configured yet. Add your exercises in the Settings tab.
        </div>
      )}

      <div className="exercise-list">
        {form.exercises.map((ex, idx) => (
          <div key={idx} className={`exercise-card ${ex.completed ? 'exercise-card--done' : ''} ${ex.skipped ? 'exercise-card--skipped' : ''}`}>
            <div className="exercise-header">
              <h4>{ex.name}</h4>
              <span className="exercise-target">{ex.targetSets} × {ex.targetReps}</span>
            </div>
            {/* Show notes from PFPS program if available */}
            {currentWeek && WEEKLY_EXERCISES[currentWeek] && (() => {
              const pfpsEx = WEEKLY_EXERCISES[currentWeek].find((e) => e.name === ex.name);
              return pfpsEx?.notes ? <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>{pfpsEx.notes}{pfpsEx.tempo ? ` Tempo: ${pfpsEx.tempo}` : ''}</div> : null;
            })()}

            <div className="exercise-actions">
              <button
                className={`chip ${ex.completed ? 'chip--active chip--green' : ''}`}
                onClick={() => updateExercise(idx, 'completed', !ex.completed)}
              >
                ✓ Done
              </button>
              <button
                className={`chip ${ex.skipped ? 'chip--active chip--red' : ''}`}
                onClick={() => updateExercise(idx, 'skipped', !ex.skipped)}
              >
                ✗ Skip
              </button>
            </div>

            {ex.completed && (
              <div className="exercise-details">
                <div className="inline-inputs">
                  <div className="form-group form-group--inline">
                    <label>Sets</label>
                    <input
                      type="number"
                      value={ex.completedSets}
                      onChange={(e) => updateExercise(idx, 'completedSets', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="form-group form-group--inline">
                    <label>Reps</label>
                    <input
                      type="number"
                      value={ex.completedReps}
                      onChange={(e) => updateExercise(idx, 'completedReps', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    Pain: <span style={{ color: painColor(ex.pain), fontWeight: 'bold' }}>{ex.pain}/10</span>
                  </label>
                  <input
                    type="range" min="0" max="10" value={ex.pain}
                    onChange={(e) => updateExercise(idx, 'pain', parseInt(e.target.value))}
                    style={{ accentColor: painColor(ex.pain) }}
                  />
                </div>
              </div>
            )}

            {ex.skipped && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Reason for skipping..."
                  value={ex.skipReason}
                  onChange={(e) => updateExercise(idx, 'skipReason', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cool-down checklist */}
      {!isEdit && (
        <div className={`card checklist-card ${cooldownDone ? 'checklist-card--done' : ''}`}>
          <div className="checklist-header" onClick={() => setShowCooldown(!showCooldown)}>
            <span>{cooldownDone ? '✓' : '○'} Cool-down & Stretching (8-12 min)</span>
            <span className="text-muted">{showCooldown ? '▲' : '▼'}</span>
          </div>
          {showCooldown && (
            <div className="checklist-items">
              {COOLDOWN.map((item, i) => (
                <div key={i} className="checklist-item">
                  <span className="checklist-name">{item.name}</span>
                  <span className="text-muted">{item.hold || item.duration}</span>
                  {item.detail && <div className="text-muted" style={{ fontSize: 11 }}>{item.detail}</div>}
                </div>
              ))}
              <button className={`btn btn--sm ${cooldownDone ? 'btn--ghost' : 'btn--secondary'}`} onClick={() => setCooldownDone(!cooldownDone)}>
                {cooldownDone ? 'Undo' : 'Done with cool-down'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label>Notes</label>
        <textarea
          placeholder="Session notes..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <button className="btn btn--primary btn--full" onClick={handleSave}>
        {isEdit ? 'Update Rehab Session' : 'Save Rehab Session'}
      </button>
    </div>
  );
}
