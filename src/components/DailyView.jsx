import { useState, useMemo } from 'react';
import { today, yesterday, formatDateFull, getCurrentWeek, getStreakCount, painColor } from '../utils/helpers';
import RunLogger from './RunLogger';
import RehabLogger from './RehabLogger';
import PainTracker from './PainTracker';

export default function DailyView({ data }) {
  const [activeLogger, setActiveLogger] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const todayStr = today();
  const yesterdayStr = yesterday();
  const currentWeek = getCurrentWeek(data.programStart);

  const todayRuns = useMemo(() => data.runs.filter((r) => r.date === todayStr), [data.runs, todayStr]);
  const todayRehab = useMemo(() => data.rehab.filter((r) => r.date === todayStr), [data.rehab, todayStr]);
  const todayPain = useMemo(() => data.pain.filter((p) => p.date === todayStr), [data.pain, todayStr]);
  const isRestDay = data.restDays.includes(todayStr);
  const streak = useMemo(
    () => getStreakCount(data.runs, data.rehab, data.pain, data.restDays),
    [data.runs, data.rehab, data.pain, data.restDays]
  );

  // Runs from yesterday that need next-morning pain filled in
  const needsMorningPain = useMemo(() => {
    return data.runs.filter((r) => r.date === yesterdayStr && r.painNextMorning === null);
  }, [data.runs, yesterdayStr]);

  // Smart pain guidance
  const guidance = useMemo(() => {
    const messages = [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentPain = data.pain.filter((p) => new Date(p.date) >= threeDaysAgo);

    // Pain trending up alert
    if (recentPain.length > 0) {
      const avg = recentPain.reduce((s, p) => s + p.level, 0) / recentPain.length;
      if (avg > 5) {
        messages.push({ type: 'danger', text: 'Pain averaging above 5 over 3 days. Consider a rest day or reduce intensity.' });
      }
    }

    // Check last run's pain levels
    const sortedRuns = [...data.runs].sort((a, b) => b.date.localeCompare(a.date));
    const lastRun = sortedRuns[0];
    if (lastRun) {
      if (lastRun.painDuring >= 4) {
        messages.push({ type: 'warning', text: `Pain during your last run was ${lastRun.painDuring}/10. Next run: reduce distance or switch to walk-run.` });
      }
      if (lastRun.painNextMorning !== null && lastRun.painNextMorning >= 5) {
        messages.push({ type: 'danger', text: `Next-morning pain after last run was ${lastRun.painNextMorning}/10. Skip your next run or drop distance significantly.` });
      }
      if (lastRun.painAfter >= 6) {
        messages.push({ type: 'warning', text: `Post-run pain was ${lastRun.painAfter}/10. Allow extra recovery before next run.` });
      }
    }

    // Pain trending down — positive feedback
    if (data.pain.length >= 7) {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const olderPain = data.pain.filter((p) => new Date(p.date) >= twoWeeksAgo && new Date(p.date) < oneWeekAgo);
      const newerPain = data.pain.filter((p) => new Date(p.date) >= oneWeekAgo);
      if (olderPain.length > 0 && newerPain.length > 0) {
        const oldAvg = olderPain.reduce((s, p) => s + p.level, 0) / olderPain.length;
        const newAvg = newerPain.reduce((s, p) => s + p.level, 0) / newerPain.length;
        if (newAvg < oldAvg - 1) {
          messages.push({ type: 'success', text: 'Pain trending down over the past 2 weeks. You may be ready to progress.' });
        }
      }
    }

    return messages;
  }, [data.pain, data.runs]);

  // Weekly plan info
  const weekPlan = currentWeek && data.weeklyPlan?.[currentWeek - 1];

  const openEditor = (type, item) => {
    setEditItem(item);
    setActiveLogger(type);
  };

  const handleBack = () => {
    setActiveLogger(null);
    setEditItem(null);
  };

  if (activeLogger === 'run') {
    return <RunLogger data={data} onBack={handleBack} editRun={editItem} />;
  }
  if (activeLogger === 'rehab') {
    return <RehabLogger data={data} onBack={handleBack} editSession={editItem} />;
  }
  if (activeLogger === 'pain') {
    return <PainTracker data={data} onBack={handleBack} editEntry={editItem} />;
  }

  const handleMorningPainSave = async (run, painLevel) => {
    await data.saveRun({ ...run, painNextMorning: painLevel });
  };

  const handleRestDay = async () => {
    if (isRestDay) {
      await data.removeRestDay(todayStr);
    } else {
      await data.saveRestDay(todayStr);
    }
  };

  return (
    <div className="daily-view">
      <div className="date-header">
        <h1>{formatDateFull(todayStr)}</h1>
        {currentWeek ? (
          <div className="week-badge">Week {currentWeek} of 8</div>
        ) : (
          <div className="week-badge week-badge--setup">Set program start date in Settings</div>
        )}
      </div>

      {/* Smart guidance alerts */}
      {guidance.map((g, i) => (
        <div key={i} className={`alert alert--${g.type}`}>
          {g.type === 'danger' ? '🔴' : g.type === 'warning' ? '🟡' : '🟢'} {g.text}
        </div>
      ))}

      {/* Next-morning pain follow-up */}
      {needsMorningPain.length > 0 && (
        <div className="card morning-pain-card">
          <h3>Morning Pain Check</h3>
          <p className="text-muted">How does your knee feel after yesterday's run?</p>
          {needsMorningPain.map((run) => (
            <MorningPainEntry key={run.id} run={run} onSave={handleMorningPainSave} />
          ))}
        </div>
      )}

      <div className="streak-card">
        <div className="streak-number">{streak}</div>
        <div className="streak-label">day streak</div>
      </div>

      {weekPlan && weekPlan.targetKm > 0 && (
        <div className="plan-summary">
          <h3>This Week's Plan</h3>
          <div className="plan-row">
            <span>Target: {weekPlan.targetKm} km</span>
            <span>{weekPlan.numRuns} runs</span>
            {weekPlan.runTypes && <span>{weekPlan.runTypes}</span>}
          </div>
        </div>
      )}

      <div className="today-summary">
        <h3>Today's Activity</h3>
        {todayRuns.length === 0 && todayRehab.length === 0 && todayPain.length === 0 && !isRestDay && (
          <p className="text-muted">No activity logged yet today</p>
        )}
        {isRestDay && (
          <div className="activity-chip activity-chip--rest">
            Intentional rest day
          </div>
        )}
        {todayRuns.map((r) => (
          <div key={r.id} className="activity-chip activity-chip--run" onClick={() => openEditor('run', r)}>
            Run: {r.distance} km in {r.duration} min — {r.type}
            <span className="edit-hint">tap to edit</span>
          </div>
        ))}
        {todayRehab.map((r) => (
          <div key={r.id} className="activity-chip activity-chip--rehab" onClick={() => openEditor('rehab', r)}>
            Rehab session — {r.exercises.filter((e) => e.completed).length}/{r.exercises.length} exercises
            <span className="edit-hint">tap to edit</span>
          </div>
        ))}
        {todayPain.map((p) => (
          <div key={p.id} className="activity-chip activity-chip--pain" onClick={() => openEditor('pain', p)} style={{ borderLeftColor: painColor(p.level) }}>
            Pain: {p.level}/10 — {p.context}
            <span className="edit-hint">tap to edit</span>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <button className="btn btn--primary btn--large" onClick={() => setActiveLogger('run')}>
          <span className="btn-icon">🏃</span>
          Log Run
        </button>
        <button className="btn btn--secondary btn--large" onClick={() => setActiveLogger('rehab')}>
          <span className="btn-icon">💪</span>
          Log Rehab
        </button>
        <button className="btn btn--accent btn--large" onClick={() => setActiveLogger('pain')}>
          <span className="btn-icon">📊</span>
          Log Pain
        </button>
      </div>

      <button
        className={`btn btn--full ${isRestDay ? 'btn--rest-active' : 'btn--rest'}`}
        onClick={handleRestDay}
      >
        {isRestDay ? '✓ Rest Day Logged — tap to undo' : '😴 Log Rest Day'}
      </button>
    </div>
  );
}

function MorningPainEntry({ run, onSave }) {
  const [level, setLevel] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(run, level);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="morning-pain-saved">
        Saved: {level}/10 for yesterday's {run.distance} km run
      </div>
    );
  }

  return (
    <div className="morning-pain-entry">
      <div className="morning-pain-run">{run.distance} km {run.type} run</div>
      <div className="form-group">
        <label>
          Pain now: <span style={{ color: painColor(level), fontWeight: 'bold' }}>{level}/10</span>
        </label>
        <input
          type="range" min="0" max="10" value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
          style={{ accentColor: painColor(level) }}
        />
      </div>
      <button className="btn btn--primary btn--sm" onClick={handleSave}>Save</button>
    </div>
  );
}
