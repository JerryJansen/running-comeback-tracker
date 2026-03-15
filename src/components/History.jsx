import { useMemo, useState } from 'react';
import { formatDate, painColor, calculatePace } from '../utils/helpers';
import RunLogger from './RunLogger';
import RehabLogger from './RehabLogger';
import PainTracker from './PainTracker';

export default function History({ data }) {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState(null); // { type, item }

  const items = useMemo(() => {
    let all = [];
    if (filter === 'all' || filter === 'runs') {
      all.push(...data.runs.map((r) => ({ ...r, _type: 'run' })));
    }
    if (filter === 'all' || filter === 'rehab') {
      all.push(...data.rehab.map((r) => ({ ...r, _type: 'rehab' })));
    }
    if (filter === 'all' || filter === 'pain') {
      all.push(...data.pain.map((p) => ({ ...p, _type: 'pain' })));
    }
    return all.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [data.runs, data.rehab, data.pain, filter]);

  const handleDelete = async (item) => {
    if (!confirm('Delete this entry?')) return;
    if (item._type === 'run') await data.deleteRun(item.id);
    else if (item._type === 'rehab') await data.deleteRehab(item.id);
    else await data.deletePain(item.id);
  };

  const handleEdit = (item) => {
    const cleanItem = { ...item };
    delete cleanItem._type;
    setEditing({ type: item._type, item: cleanItem });
  };

  if (editing) {
    if (editing.type === 'run') {
      return <RunLogger data={data} onBack={() => setEditing(null)} editRun={editing.item} />;
    }
    if (editing.type === 'rehab') {
      return <RehabLogger data={data} onBack={() => setEditing(null)} editSession={editing.item} />;
    }
    if (editing.type === 'pain') {
      return <PainTracker data={data} onBack={() => setEditing(null)} editEntry={editing.item} />;
    }
  }

  return (
    <div className="history">
      <h2>History</h2>

      <div className="chip-group">
        {['all', 'runs', 'rehab', 'pain'].map((f) => (
          <button key={f} className={`chip ${filter === f ? 'chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {items.length === 0 && <p className="text-muted">No entries yet.</p>}

      <div className="history-list">
        {items.map((item) => (
          <div
            key={item.id}
            className={`history-item history-item--${item._type}`}
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          >
            <div className="history-item-header">
              <span className="history-date">{formatDate(item.date)}</span>
              <span className={`history-type-badge history-type-badge--${item._type}`}>
                {item._type === 'run' ? '🏃 Run' : item._type === 'rehab' ? '💪 Rehab' : '📊 Pain'}
              </span>
            </div>

            {item._type === 'run' && (
              <div className="history-summary">
                {item.distance} km · {item.duration} min · {calculatePace(item.distance, item.duration)} · {item.type}
                {item.type === 'walk-run' && item.walkRunRepeats && (
                  <span className="text-muted"> ({item.walkRunRepeats}× {item.walkRunMin}/{item.walkRunWalkMin} min)</span>
                )}
              </div>
            )}
            {item._type === 'rehab' && (
              <div className="history-summary">
                {item.exercises.filter((e) => e.completed).length}/{item.exercises.length} exercises completed
              </div>
            )}
            {item._type === 'pain' && (
              <div className="history-summary">
                <span style={{ color: painColor(item.level) }}>Pain: {item.level}/10</span> · {item.context} · {item.knee} knee
              </div>
            )}

            {expandedId === item.id && (
              <div className="history-detail">
                {item._type === 'run' && (
                  <>
                    <p>Surface: {item.surface}</p>
                    <p>Pain during: <span style={{ color: painColor(item.painDuring) }}>{item.painDuring}/10</span></p>
                    <p>Pain after: <span style={{ color: painColor(item.painAfter) }}>{item.painAfter}/10</span></p>
                    {item.painNextMorning !== null ? (
                      <p>Pain next morning: <span style={{ color: painColor(item.painNextMorning) }}>{item.painNextMorning}/10</span></p>
                    ) : (
                      <p className="text-muted">Next-morning pain: not yet filled in</p>
                    )}
                    {item.notes && <p className="history-notes">{item.notes}</p>}
                  </>
                )}
                {item._type === 'rehab' && (
                  <>
                    {item.exercises.map((ex, i) => (
                      <div key={i} className="history-exercise">
                        <span>{ex.name}: </span>
                        {ex.completed ? (
                          <span className="text-green">{ex.completedSets}×{ex.completedReps} (pain: {ex.pain}/10)</span>
                        ) : ex.skipped ? (
                          <span className="text-red">Skipped{ex.skipReason ? ` — ${ex.skipReason}` : ''}</span>
                        ) : (
                          <span className="text-muted">Not done</span>
                        )}
                      </div>
                    ))}
                    {item.notes && <p className="history-notes">{item.notes}</p>}
                  </>
                )}
                {item._type === 'pain' && item.notes && (
                  <p className="history-notes">{item.notes}</p>
                )}
                <div className="history-actions">
                  <button className="btn btn--secondary btn--sm" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                    Edit
                  </button>
                  <button className="btn btn--ghost btn--sm text-red" onClick={(e) => { e.stopPropagation(); handleDelete(item); }}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
