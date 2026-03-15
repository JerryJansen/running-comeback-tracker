import { useState } from 'react';
import { today, generateId, painColor } from '../utils/helpers';

const CONTEXTS = ['morning stiffness', 'during activity', 'after activity', 'stairs', 'sitting'];
const KNEES = ['left', 'right', 'both'];

export default function PainTracker({ data, onBack }) {
  const [form, setForm] = useState({
    date: today(),
    level: 3,
    context: 'morning stiffness',
    knee: 'left',
    notes: '',
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const entry = {
      ...form,
      id: generateId(),
    };
    await data.savePain(entry);
    onBack();
  };

  return (
    <div className="logger">
      <div className="logger-header">
        <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        <h2>Log Pain</h2>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
      </div>

      <div className="form-group">
        <label>
          Pain Level: <span className="pain-badge" style={{ background: painColor(form.level) }}>{form.level}/10</span>
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={form.level}
          onChange={(e) => update('level', parseInt(e.target.value))}
          className="pain-slider pain-slider--large"
          style={{ accentColor: painColor(form.level) }}
        />
        <div className="slider-labels"><span>None</span><span>Moderate</span><span>Severe</span></div>
      </div>

      <div className="form-group">
        <label>Context</label>
        <div className="chip-group">
          {CONTEXTS.map((c) => (
            <button
              key={c}
              className={`chip ${form.context === c ? 'chip--active' : ''}`}
              onClick={() => update('context', c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Which Knee</label>
        <div className="chip-group">
          {KNEES.map((k) => (
            <button
              key={k}
              className={`chip ${form.knee === k ? 'chip--active' : ''}`}
              onClick={() => update('knee', k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          placeholder="Any additional observations..."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
        />
      </div>

      <button className="btn btn--primary btn--full" onClick={handleSave}>
        Save Pain Entry
      </button>
    </div>
  );
}
