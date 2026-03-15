import { useState, useMemo } from 'react';
import { today, yesterday, formatDateFull, getCurrentWeek, getStreakCount, painColor } from '../utils/helpers';
import { getTodaySuggestion, RUNNING_PLAN, PHASE_NAMES, PAIN_RULES, WARMUP, COOLDOWN, CADENCE_ADVICE, WEEKLY_EXERCISES } from '../utils/pfpsProgram';
import { getWeekSchedule } from '../utils/scheduleTracker';
import RunLogger from './RunLogger';
import RehabLogger from './RehabLogger';
import PainTracker from './PainTracker';

export default function DailyView({ data }) {
  const [activeLogger, setActiveLogger] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const todayStr = today();
  const yesterdayStr = yesterday();
  const currentWeek = getCurrentWeek(data.programStart, data.startingWeek || 1);

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

  // Dynamic schedule with sliding rescheduling
  const weekSchedule = useMemo(() => {
    return getWeekSchedule(data.programStart, currentWeek, data.runs, data.rehab, data.restDays, data.startingWeek || 1);
  }, [data.programStart, currentWeek, data.runs, data.rehab, data.restDays, data.startingWeek]);

  // Effective week accounts for sliding: if you missed days, you're still on an earlier program week
  const effectiveWeek = weekSchedule?.effectiveWeek || currentWeek;

  // PFPS daily suggestion — use effective week from sliding schedule
  const suggestion = useMemo(() => {
    return getTodaySuggestion(effectiveWeek, new Date().getDay());
  }, [effectiveWeek]);

  // Weekly plan info — use effective week so targets match the shifted schedule
  const weekPlan = effectiveWeek && data.weeklyPlan?.[effectiveWeek - 1];

  // Use rescheduled plan for today if available, otherwise fall back to static suggestion
  const todayPlan = weekSchedule?.todayPlan || null;
  const effectiveActivity = todayPlan?.planned || suggestion?.activity || null;
  const isRescheduled = todayPlan?.isRescheduled || false;

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
          <div className="week-badge">
            Week {weekSchedule?.effectiveWeek || currentWeek} of 8
            {weekSchedule?.daysShifted > 0 && (
              <span className="text-muted" style={{ fontSize: 11, marginLeft: 6 }}>
                ({weekSchedule.daysShifted}d shifted)
              </span>
            )}
          </div>
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

      {/* PFPS Daily Suggestion — uses rescheduled plan if available */}
      {(suggestion || todayPlan) && (
        <div className={`card suggestion-card ${isRescheduled ? 'suggestion-card--rescheduled' : ''}`}>
          <div className="suggestion-header">
            <span className="suggestion-phase">{suggestion?.phaseName || `Week ${currentWeek}`}</span>
            <span className={`suggestion-type suggestion-type--${effectiveActivity}`}>
              {effectiveActivity === 'run' ? '🏃 Run Day' : effectiveActivity === 'rehab' ? '💪 Rehab Day' : '😴 Rest Day'}
            </span>
          </div>

          {isRescheduled && (
            <div className="rescheduled-badge">
              Rescheduled — {todayPlan.description}
            </div>
          )}

          {!isRescheduled && todayPlan && (
            <p className="suggestion-description">{todayPlan.description}</p>
          )}
          {!todayPlan && suggestion && (
            <p className="suggestion-description">{suggestion.description}</p>
          )}

          {todayPlan?.extraActivities?.length > 0 && (
            <div className="extra-activities">
              <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>Also rescheduled for today:</div>
              {todayPlan.extraActivities.map((ea, i) => (
                <div key={i} className="rescheduled-badge">
                  {ea.type === 'run' ? '🏃' : '💪'} {ea.description}
                </div>
              ))}
            </div>
          )}

          {effectiveActivity === 'run' && suggestion?.runPlan && (
            <RunWorkoutCard runPlan={suggestion.runPlan} weekNum={effectiveWeek} />
          )}

          {effectiveActivity === 'rehab' && (
            <RehabWorkoutCard weekNum={effectiveWeek} phaseGoal={suggestion?.phaseGoal} />
          )}

          {effectiveActivity === 'rest' && !isRescheduled && (
            <RestDayCard />
          )}
        </div>
      )}

      {/* Week schedule overview */}
      {weekSchedule && (
        <div className="card week-schedule-card">
          <div className="week-schedule-header">
            <h4>This Week</h4>
            <span className="text-muted">{weekSchedule.completedCount}/{weekSchedule.totalPlanned} done</span>
          </div>
          <div className="week-schedule-dots">
            {weekSchedule.schedule.map((day, i) => (
              <div key={i} className={`schedule-dot schedule-dot--${day.status} ${day.isRescheduled ? 'schedule-dot--rescheduled' : ''}`}
                title={`${day.dayName}: ${day.planned}${day.isRescheduled ? ' (rescheduled)' : ''}`}
              >
                <div className="schedule-dot-label">{day.dayName.slice(0, 2)}</div>
                <div className={`schedule-dot-icon schedule-dot-icon--${day.planned}`}>
                  {day.status === 'done' ? '✓' : day.status === 'missed' ? '✗' : day.planned === 'run' ? '🏃' : day.planned === 'rehab' ? '💪' : '·'}
                </div>
                {day.isRescheduled && <div className="schedule-dot-resched">↑</div>}
              </div>
            ))}
          </div>
          {weekSchedule.daysShifted > 0 && (
            <div className="text-muted" style={{ fontSize: 11, marginTop: 6 }}>
              Program shifted {weekSchedule.daysShifted} day{weekSchedule.daysShifted > 1 ? 's' : ''} forward due to missed sessions
            </div>
          )}
        </div>
      )}

      {weekPlan && weekPlan.targetKm > 0 && (
        <div className="plan-summary">
          <h3>Week {effectiveWeek} Target</h3>
          <div className="plan-row">
            <span>~{weekPlan.targetKm} km</span>
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

// ─── Full Run Workout Card ──────────────────────────────────────
function RunWorkoutCard({ runPlan, weekNum }) {
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);

  return (
    <div className="workout-card">
      <div className="suggestion-reminder" style={{ marginBottom: 10 }}>
        Pain must stay ≤ 2/10 during running. Stop and walk if it rises above.
      </div>

      {/* Warm-up */}
      <div className="workout-section">
        <button className="workout-section-toggle" onClick={() => setShowWarmup(!showWarmup)}>
          <span className="workout-section-title">Warm-up (~10 min)</span>
          <span>{showWarmup ? '▾' : '▸'}</span>
        </button>
        {showWarmup && (
          <div className="workout-exercise-list">
            {WARMUP.map((item, i) => (
              <div key={i} className="workout-exercise-item">
                <div className="workout-exercise-name">{item.name}</div>
                <div className="workout-exercise-meta">
                  {item.duration || item.reps}
                  {item.detail && <span className="workout-exercise-detail"> — {item.detail}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run protocol */}
      <div className="workout-section workout-section--highlight">
        <div className="workout-section-title">Run Protocol</div>
        <div className="workout-run-protocol">
          <div className="workout-run-summary">
            <strong>{runPlan.runMin} min run / {runPlan.walkMin} min walk</strong>
            <span> × {runPlan.intervals} intervals</span>
          </div>
          <div className="workout-run-meta">
            {runPlan.totalMin} min total — ~{runPlan.approxKm} km — {runPlan.sessions} sessions this week
          </div>

          <div className="workout-run-intervals">
            {Array.from({ length: runPlan.intervals }, (_, i) => (
              <div key={i} className="workout-interval">
                <span className="workout-interval-num">#{i + 1}</span>
                <span className="workout-interval-run">Run {runPlan.runMin} min</span>
                {i < runPlan.intervals - 1 && (
                  <span className="workout-interval-walk">Walk {runPlan.walkMin} min</span>
                )}
              </div>
            ))}
          </div>

          <div className="workout-run-notes">{runPlan.notes}</div>
        </div>

        <div className="workout-cadence-tip">
          <strong>Cadence tip:</strong> {CADENCE_ADVICE.instruction} {CADENCE_ADVICE.reason}
        </div>
      </div>

      {/* Cool-down */}
      <div className="workout-section">
        <button className="workout-section-toggle" onClick={() => setShowCooldown(!showCooldown)}>
          <span className="workout-section-title">Cool-down & Stretching (~15 min)</span>
          <span>{showCooldown ? '▾' : '▸'}</span>
        </button>
        {showCooldown && (
          <div className="workout-exercise-list">
            {COOLDOWN.map((item, i) => (
              <div key={i} className="workout-exercise-item">
                <div className="workout-exercise-name">{item.name}</div>
                <div className="workout-exercise-meta">
                  {item.duration || item.hold}
                  {item.detail && <span className="workout-exercise-detail"> — {item.detail}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Full Rehab Workout Card ────────────────────────────────────
function RehabWorkoutCard({ weekNum, phaseGoal }) {
  const exercises = WEEKLY_EXERCISES[weekNum] || [];

  // Group exercises by category
  const categories = {};
  for (const ex of exercises) {
    const cat = ex.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(ex);
  }

  const categoryLabels = {
    hip: 'Hip & Glutes',
    quad: 'Quadriceps',
    hamstring: 'Hamstrings',
    calf: 'Calves',
    balance: 'Balance & Proprioception',
    other: 'Other',
  };

  return (
    <div className="workout-card">
      <div className="suggestion-reminder" style={{ marginBottom: 10 }}>
        Pain must stay ≤ 4/10 during exercises. Ideally below 2/10.
      </div>

      {phaseGoal && (
        <div className="workout-phase-goal">
          <strong>Goal:</strong> {phaseGoal}
        </div>
      )}

      {/* Warm-up (collapsed by default) */}
      <RehabWarmupSection />

      {/* Exercise list by category */}
      {Object.entries(categories).map(([cat, exList]) => (
        <div key={cat} className="workout-section">
          <div className="workout-section-title workout-category-title">
            {categoryLabels[cat] || cat}
          </div>
          <div className="workout-exercise-list">
            {exList.map((ex, i) => (
              <div key={i} className="workout-exercise-item workout-exercise-item--detailed">
                <div className="workout-exercise-header">
                  <span className="workout-exercise-name">{ex.name}</span>
                  <span className="workout-exercise-sets">
                    {ex.sets} × {ex.reps}{ex.reps === 1 ? '' : ''}
                  </span>
                </div>
                {ex.tempo && (
                  <div className="workout-exercise-tempo">Tempo: {ex.tempo}</div>
                )}
                {ex.notes && (
                  <div className="workout-exercise-notes">{ex.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="workout-total">
        {exercises.length} exercises — ~{Math.round(exercises.length * 2.5)} min total
      </div>
    </div>
  );
}

function RehabWarmupSection() {
  const [show, setShow] = useState(false);
  return (
    <div className="workout-section">
      <button className="workout-section-toggle" onClick={() => setShow(!show)}>
        <span className="workout-section-title">Warm-up (~10 min)</span>
        <span>{show ? '▾' : '▸'}</span>
      </button>
      {show && (
        <div className="workout-exercise-list">
          {WARMUP.map((item, i) => (
            <div key={i} className="workout-exercise-item">
              <div className="workout-exercise-name">{item.name}</div>
              <div className="workout-exercise-meta">
                {item.duration || item.reps}
                {item.detail && <span className="workout-exercise-detail"> — {item.detail}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rest Day Card ──────────────────────────────────────────────
function RestDayCard() {
  return (
    <div className="workout-card">
      <div className="workout-section">
        <div className="workout-section-title">Recovery Day</div>
        <p className="text-muted" style={{ margin: '6px 0' }}>
          Recovery is training. Your body rebuilds stronger on rest days.
        </p>
        <div className="workout-exercise-list">
          <div className="workout-exercise-item">
            <div className="workout-exercise-name">Foam rolling</div>
            <div className="workout-exercise-meta">5-10 min — quads, IT band, hamstrings, calves, glutes</div>
          </div>
          <div className="workout-exercise-item">
            <div className="workout-exercise-name">Gentle stretching</div>
            <div className="workout-exercise-meta">10 min — focus on quads, hip flexors, hamstrings, calves</div>
          </div>
          <div className="workout-exercise-item">
            <div className="workout-exercise-name">Easy walk (optional)</div>
            <div className="workout-exercise-meta">15-20 min — flat surface, comfortable pace</div>
          </div>
        </div>
      </div>
    </div>
  );
}
