import { useState } from 'react';
import { getCurrentWeek } from '../utils/helpers';
import { PHASE_NAMES } from '../utils/pfpsProgram';

export default function ProgramPlanner({ data }) {
  const [plan, setPlan] = useState(data.weeklyPlan);
  const [dirty, setDirty] = useState(false);
  const [selectedStartWeek, setSelectedStartWeek] = useState(data.startingWeek || 1);
  const currentWeek = getCurrentWeek(data.programStart);

  const updateWeek = (idx, field, value) => {
    setPlan((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    setDirty(true);
  };

  const handleStartWeekChange = async (week) => {
    setSelectedStartWeek(week);
    await data.saveStartingWeek(week);

    // Set programStart to today — the sliding schedule uses startingWeek
    // to determine which phase exercises to start with, no need to backdate
    if (!data.programStart) {
      const startStr = new Date().toISOString().slice(0, 10);
      await data.saveProgramStart(startStr);
    }
  };

  const handleSave = async () => {
    await data.saveWeeklyPlan(plan);
    setDirty(false);
  };

  const isBeforeStart = (weekNum) => weekNum < selectedStartWeek;

  return (
    <div className="planner">
      <h2>8-Week Plan</h2>
      <p className="text-muted">Define targets for each week of your comeback program.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Where are you starting?</h3>
        <p className="text-muted" style={{ fontSize: 13 }}>
          If you've already done some rehab, pick the week that matches your current level. Earlier weeks will be skipped.
        </p>
        <div className="week-selector-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <button
              key={w}
              className={`chip chip--large ${selectedStartWeek === w ? 'chip--active' : ''}`}
              onClick={() => handleStartWeekChange(w)}
            >
              <div>Week {w}</div>
              <div className="chip-sub">{PHASE_NAMES[w]}</div>
            </button>
          ))}
        </div>
        {selectedStartWeek > 1 && (
          <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
            Starting at week {selectedStartWeek} ({PHASE_NAMES[selectedStartWeek]}). Weeks 1-{selectedStartWeek - 1} will be skipped.
          </p>
        )}
      </div>

      <div className="plan-grid">
        {plan.map((week, idx) => {
          const weekNum = idx + 1;
          const skipped = isBeforeStart(weekNum);
          return (
            <div
              key={idx}
              className={`plan-week-card ${currentWeek === weekNum ? 'plan-week-card--current' : ''} ${skipped ? 'plan-week-card--skipped' : ''} ${currentWeek && weekNum < currentWeek && !skipped ? 'plan-week-card--past' : ''}`}
              style={skipped ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
            >
              <div className="plan-week-header">
                <h3>Week {weekNum}</h3>
                {skipped && <span className="badge badge--gray">Skipped</span>}
                {!skipped && currentWeek === weekNum && <span className="badge badge--cyan">Current</span>}
                {!skipped && currentWeek && weekNum < currentWeek && <span className="badge badge--gray">Done</span>}
              </div>

              <div className="plan-fields">
                <div className="form-group form-group--inline">
                  <label>Target km</label>
                  <input
                    type="number"
                    value={week.targetKm}
                    onChange={(e) => updateWeek(idx, 'targetKm', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="form-group form-group--inline">
                  <label># Runs</label>
                  <input
                    type="number"
                    value={week.numRuns}
                    onChange={(e) => updateWeek(idx, 'numRuns', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="form-group form-group--inline">
                  <label>Run types</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 easy, 1 interval"
                    value={week.runTypes}
                    onChange={(e) => updateWeek(idx, 'runTypes', e.target.value)}
                  />
                </div>
                <div className="form-group form-group--inline">
                  <label>Rehab freq</label>
                  <input
                    type="text"
                    placeholder="e.g. daily, 5x/week"
                    value={week.rehabFrequency}
                    onChange={(e) => updateWeek(idx, 'rehabFrequency', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {dirty && (
        <button className="btn btn--primary btn--full btn--sticky" onClick={handleSave}>
          Save Plan
        </button>
      )}
    </div>
  );
}
