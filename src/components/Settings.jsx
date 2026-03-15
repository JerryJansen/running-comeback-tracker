import { useState } from 'react';
import { exportAllData, importAllData } from '../utils/db';

export default function Settings({ data }) {
  const [programStart, setProgramStart] = useState(data.programStart || '');
  const [exercises, setExercises] = useState(
    data.exercises.length > 0 ? data.exercises : [{ name: '', sets: 3, reps: 10 }]
  );
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState('');

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
        <h3>Rehab Exercises</h3>
        <p className="text-muted">Configure your rehab exercise list.</p>
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
