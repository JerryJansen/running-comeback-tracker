import { useState } from 'react';
import { today, generateId, calculatePace, painColor } from '../utils/helpers';

const DISTANCES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const RUN_TYPES = ['easy', 'intervals', 'walk-run', 'tempo'];
const SURFACES = ['treadmill', 'road', 'trail', 'track'];

export default function RunLogger({ data, onBack, editRun }) {
  const isEdit = !!editRun;
  const [form, setForm] = useState(editRun || {
    distance: '',
    duration: '',
    type: 'easy',
    surface: 'road',
    painDuring: 0,
    painAfter: 0,
    painNextMorning: null,
    notes: '',
    date: today(),
    // Walk-run interval fields
    walkRunMin: 1,
    walkRunWalkMin: 2,
    walkRunRepeats: 5,
  });

  const pace = calculatePace(parseFloat(form.distance), parseFloat(form.duration));

  const handleSave = async () => {
    if (!form.distance || !form.duration) return;
    const run = {
      ...form,
      id: editRun?.id || generateId(),
      distance: parseFloat(form.distance),
      duration: parseFloat(form.duration),
      pace,
    };
    await data.saveRun(run);
    onBack();
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="logger">
      <div className="logger-header">
        <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        <h2>{isEdit ? 'Edit Run' : 'Log Run'}</h2>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
      </div>

      <div className="form-group">
        <label>Distance (km)</label>
        <div className="distance-grid">
          {DISTANCES.map((d) => (
            <button
              key={d}
              className={`chip ${parseFloat(form.distance) === d ? 'chip--active' : ''}`}
              onClick={() => update('distance', d)}
            >
              {d}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom distance"
          value={form.distance}
          onChange={(e) => update('distance', e.target.value)}
          step="0.1"
          min="0"
        />
      </div>

      <div className="form-group">
        <label>Duration (minutes)</label>
        <input
          type="number"
          placeholder="Minutes"
          value={form.duration}
          onChange={(e) => update('duration', e.target.value)}
          min="0"
        />
        {pace && <div className="pace-display">Pace: {pace}</div>}
      </div>

      <div className="form-group">
        <label>Run Type</label>
        <div className="chip-group">
          {RUN_TYPES.map((t) => (
            <button
              key={t}
              className={`chip ${form.type === t ? 'chip--active' : ''}`}
              onClick={() => update('type', t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Walk-run interval structure */}
      {form.type === 'walk-run' && (
        <div className="card interval-card">
          <h4>Interval Structure</h4>
          <div className="interval-fields">
            <div className="form-group form-group--inline">
              <label>Run</label>
              <input
                type="number"
                value={form.walkRunMin || 1}
                onChange={(e) => update('walkRunMin', parseFloat(e.target.value) || 0)}
                min="0.5"
                step="0.5"
              />
              <span className="text-muted">min</span>
            </div>
            <div className="form-group form-group--inline">
              <label>Walk</label>
              <input
                type="number"
                value={form.walkRunWalkMin || 2}
                onChange={(e) => update('walkRunWalkMin', parseFloat(e.target.value) || 0)}
                min="0.5"
                step="0.5"
              />
              <span className="text-muted">min</span>
            </div>
            <div className="form-group form-group--inline">
              <label>Repeats</label>
              <input
                type="number"
                value={form.walkRunRepeats || 5}
                onChange={(e) => update('walkRunRepeats', parseInt(e.target.value) || 0)}
                min="1"
              />
              <span className="text-muted">×</span>
            </div>
          </div>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
            {form.walkRunRepeats || 0}× ({form.walkRunMin || 0} min run / {form.walkRunWalkMin || 0} min walk) = {((form.walkRunMin || 0) + (form.walkRunWalkMin || 0)) * (form.walkRunRepeats || 0)} min total
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Surface</label>
        <div className="chip-group">
          {SURFACES.map((s) => (
            <button
              key={s}
              className={`chip ${form.surface === s ? 'chip--active' : ''}`}
              onClick={() => update('surface', s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>
          Knee Pain During Run: <span style={{ color: painColor(form.painDuring), fontWeight: 'bold' }}>{form.painDuring}/10</span>
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={form.painDuring}
          onChange={(e) => update('painDuring', parseInt(e.target.value))}
          className="pain-slider"
          style={{ accentColor: painColor(form.painDuring) }}
        />
        <div className="slider-labels"><span>0</span><span>5</span><span>10</span></div>
      </div>

      <div className="form-group">
        <label>
          Knee Pain After Run: <span style={{ color: painColor(form.painAfter), fontWeight: 'bold' }}>{form.painAfter}/10</span>
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={form.painAfter}
          onChange={(e) => update('painAfter', parseInt(e.target.value))}
          className="pain-slider"
          style={{ accentColor: painColor(form.painAfter) }}
        />
        <div className="slider-labels"><span>0</span><span>5</span><span>10</span></div>
      </div>

      <div className="form-group">
        <label>
          Knee Pain Next Morning: {form.painNextMorning !== null ? (
            <span style={{ color: painColor(form.painNextMorning), fontWeight: 'bold' }}>{form.painNextMorning}/10</span>
          ) : (
            <span className="text-muted">(fill in tomorrow)</span>
          )}
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={form.painNextMorning ?? 0}
          onChange={(e) => update('painNextMorning', parseInt(e.target.value))}
          className="pain-slider"
          style={{ accentColor: painColor(form.painNextMorning ?? 0) }}
        />
        <div className="slider-labels"><span>0</span><span>5</span><span>10</span></div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          placeholder="How did it feel? Any observations..."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
        />
      </div>

      <button className="btn btn--primary btn--full" onClick={handleSave}>
        {isEdit ? 'Update Run' : 'Save Run'}
      </button>
    </div>
  );
}
