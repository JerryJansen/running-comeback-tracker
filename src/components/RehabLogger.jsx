import { useState } from 'react';
import { today, generateId, painColor, getCurrentWeek } from '../utils/helpers';

export default function RehabLogger({ data, onBack, editSession }) {
  const isEdit = !!editSession;
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

      {currentWeek && exerciseList.length > 0 && (
        <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Using Week {currentWeek} exercises
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
