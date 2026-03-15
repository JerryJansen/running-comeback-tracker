import { useState, useMemo } from 'react';
import { today, formatDateFull, getCurrentWeek, getStreakCount } from '../utils/helpers';
import RunLogger from './RunLogger';
import RehabLogger from './RehabLogger';
import PainTracker from './PainTracker';

export default function DailyView({ data }) {
  const [activeLogger, setActiveLogger] = useState(null);
  const todayStr = today();
  const currentWeek = getCurrentWeek(data.programStart);

  const todayRuns = useMemo(() => data.runs.filter((r) => r.date === todayStr), [data.runs, todayStr]);
  const todayRehab = useMemo(() => data.rehab.filter((r) => r.date === todayStr), [data.rehab, todayStr]);
  const todayPain = useMemo(() => data.pain.filter((p) => p.date === todayStr), [data.pain, todayStr]);
  const streak = useMemo(() => getStreakCount(data.runs, data.rehab, data.pain), [data.runs, data.rehab, data.pain]);

  // Pain alert: average > 5 over last 3 days
  const painAlert = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentPain = data.pain.filter((p) => new Date(p.date) >= threeDaysAgo);
    if (recentPain.length === 0) return false;
    const avg = recentPain.reduce((sum, p) => sum + p.level, 0) / recentPain.length;
    return avg > 5;
  }, [data.pain]);

  // Weekly plan info
  const weekPlan = currentWeek && data.weeklyPlan?.[currentWeek - 1];

  if (activeLogger === 'run') {
    return <RunLogger data={data} onBack={() => setActiveLogger(null)} />;
  }
  if (activeLogger === 'rehab') {
    return <RehabLogger data={data} onBack={() => setActiveLogger(null)} />;
  }
  if (activeLogger === 'pain') {
    return <PainTracker data={data} onBack={() => setActiveLogger(null)} />;
  }

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

      {painAlert && (
        <div className="alert alert--danger">
          ⚠ Pain trending up — average &gt; 5 over 3 days. Consider a rest day.
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
        {todayRuns.length === 0 && todayRehab.length === 0 && todayPain.length === 0 && (
          <p className="text-muted">No activity logged yet today</p>
        )}
        {todayRuns.map((r) => (
          <div key={r.id} className="activity-chip activity-chip--run">
            Run: {r.distance} km in {r.duration} min — {r.type}
          </div>
        ))}
        {todayRehab.map((r) => (
          <div key={r.id} className="activity-chip activity-chip--rehab">
            Rehab session — {r.exercises.filter((e) => e.completed).length}/{r.exercises.length} exercises
          </div>
        ))}
        {todayPain.map((p) => (
          <div key={p.id} className="activity-chip activity-chip--pain" style={{ borderLeftColor: p.level <= 3 ? '#10b981' : p.level <= 6 ? '#f59e0b' : '#ef4444' }}>
            Pain: {p.level}/10 — {p.context}
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
    </div>
  );
}
