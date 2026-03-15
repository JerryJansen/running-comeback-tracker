import { useState } from 'react';
import { getCurrentWeek } from '../utils/helpers';

export default function ProgramPlanner({ data }) {
  const [plan, setPlan] = useState(data.weeklyPlan);
  const [dirty, setDirty] = useState(false);
  const currentWeek = getCurrentWeek(data.programStart);

  const updateWeek = (idx, field, value) => {
    setPlan((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    await data.saveWeeklyPlan(plan);
    setDirty(false);
  };

  return (
    <div className="planner">
      <h2>8-Week Plan</h2>
      <p className="text-muted">Define targets for each week of your comeback program.</p>

      <div className="plan-grid">
        {plan.map((week, idx) => (
          <div
            key={idx}
            className={`plan-week-card ${currentWeek === idx + 1 ? 'plan-week-card--current' : ''} ${currentWeek && idx + 1 < currentWeek ? 'plan-week-card--past' : ''}`}
          >
            <div className="plan-week-header">
              <h3>Week {idx + 1}</h3>
              {currentWeek === idx + 1 && <span className="badge badge--cyan">Current</span>}
              {currentWeek && idx + 1 < currentWeek && <span className="badge badge--gray">Done</span>}
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
        ))}
      </div>

      {dirty && (
        <button className="btn btn--primary btn--full btn--sticky" onClick={handleSave}>
          Save Plan
        </button>
      )}
    </div>
  );
}
