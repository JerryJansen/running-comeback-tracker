import { useState } from 'react';
import { EDUCATION_TIPS, PAIN_RULES, EQUIPMENT, SURFACES, CADENCE_ADVICE, WARMUP, COOLDOWN, WEEKLY_EXERCISES, RUNNING_PLAN, PHASE_NAMES, PHASE_GOALS } from '../utils/pfpsProgram';

export default function PfpsGuide() {
  const [openSection, setOpenSection] = useState(null);
  const [openTip, setOpenTip] = useState(null);
  const [viewWeek, setViewWeek] = useState(null);

  const toggle = (id) => setOpenSection(openSection === id ? null : id);

  return (
    <div className="pfps-guide">
      <h2>PFPS Rehab Guide</h2>
      <p className="text-muted">Evidence-based guidance for patellofemoral pain recovery.</p>
      <p className="text-muted disclaimer">Based on JOSPT 2019 CPG, BJSM 2024 Best Practice Guide. Not a substitute for professional medical advice.</p>

      {/* Pain Traffic Light */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('pain')}>
          <h3>Pain Traffic Light System</h3>
          <span>{openSection === 'pain' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'pain' && (
          <div className="section-content">
            {PAIN_RULES.trafficLight.map((rule, i) => (
              <div key={i} className={`traffic-light-row traffic-light-row--${rule.color}`}>
                <div className="traffic-dot" style={{ background: rule.color === 'green' ? '#10b981' : rule.color === 'amber' ? '#f59e0b' : '#ef4444' }} />
                <div>
                  <strong>{rule.range[0]}-{rule.range[1]}/10</strong>
                  <p>{rule.action}</p>
                </div>
              </div>
            ))}
            <div className="rule-list">
              <h4>Key Rules</h4>
              <p><strong>During exercise:</strong> {PAIN_RULES.duringExercise}</p>
              <p><strong>During running:</strong> {PAIN_RULES.duringRunning}</p>
              <p><strong>24-hour rule:</strong> {PAIN_RULES.rule24h}</p>
              <p><strong>48-hour rule:</strong> {PAIN_RULES.rule48h}</p>
              <p><strong>Morning stiffness:</strong> {PAIN_RULES.morningStiffness}</p>
              <p><strong>Swelling:</strong> {PAIN_RULES.swelling}</p>
            </div>
            <div className="rule-list">
              <h4>Progression Criteria (meet ALL before advancing)</h4>
              {PAIN_RULES.progressionCriteria.map((c, i) => (
                <p key={i}>✓ {c}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Running Plan Overview */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('running')}>
          <h3>8-Week Return-to-Running Plan</h3>
          <span>{openSection === 'running' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'running' && (
          <div className="section-content">
            <p className="text-muted">All runs at easy conversational pace. Run every other day. 5-min walk warm-up and cool-down not counted.</p>
            <div className="running-plan-table">
              {RUNNING_PLAN.map((w) => (
                <div key={w.week} className="running-plan-row">
                  <div className="running-plan-week">Wk {w.week}</div>
                  <div className="running-plan-detail">
                    <strong>{w.runMin}min run / {w.walkMin}min walk × {w.intervals}</strong>
                    <div className="text-muted">{w.totalMin} min total · ~{w.approxKm} km · {w.sessions}x/week</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{w.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Program */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('exercises')}>
          <h3>Exercise Program by Phase</h3>
          <span>{openSection === 'exercises' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'exercises' && (
          <div className="section-content">
            <div className="week-exercise-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                <button key={w} className={`chip ${viewWeek === w ? 'chip--active' : ''}`} onClick={() => setViewWeek(viewWeek === w ? null : w)}>
                  Wk {w}
                </button>
              ))}
            </div>
            {viewWeek && (
              <div className="exercise-preview">
                <h4>{PHASE_NAMES[viewWeek]} (Week {viewWeek})</h4>
                <p className="text-muted">{PHASE_GOALS[viewWeek]}</p>
                {['hip', 'quad', 'hamstring', 'calf', 'balance'].map((cat) => {
                  const catExercises = WEEKLY_EXERCISES[viewWeek].filter((e) => e.category === cat);
                  if (catExercises.length === 0) return null;
                  return (
                    <div key={cat} className="exercise-category">
                      <h5>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h5>
                      {catExercises.map((ex, i) => (
                        <div key={i} className="exercise-preview-item">
                          <div className="exercise-preview-name">{ex.name}</div>
                          <div className="exercise-preview-sets">{ex.sets} × {ex.reps}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>{ex.notes}{ex.tempo ? ` (${ex.tempo})` : ''}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warm-up & Cool-down */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('warmup')}>
          <h3>Warm-up & Cool-down Protocols</h3>
          <span>{openSection === 'warmup' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'warmup' && (
          <div className="section-content">
            <h4>Warm-up (7-10 min) — Before every session</h4>
            <p className="text-muted">Never static stretch cold muscles. Foam roll first, then dynamic movement.</p>
            {WARMUP.map((item, i) => (
              <div key={i} className="protocol-item">
                <span>{item.name}</span>
                <span className="text-muted">{item.duration || item.reps}</span>
              </div>
            ))}

            <h4 style={{ marginTop: 16 }}>Cool-down (8-12 min) — After every session</h4>
            {COOLDOWN.map((item, i) => (
              <div key={i} className="protocol-item">
                <span>{item.name}</span>
                <span className="text-muted">{item.hold || item.duration}</span>
                {item.detail && <div className="text-muted" style={{ fontSize: 11 }}>{item.detail}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Surface Recommendations */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('surfaces')}>
          <h3>Running Surface Guide</h3>
          <span>{openSection === 'surfaces' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'surfaces' && (
          <div className="section-content">
            {SURFACES.map((s, i) => (
              <div key={i} className="surface-row">
                <div>
                  <strong>{s.name}</strong>
                  <span className={`surface-rating surface-rating--${s.rating.toLowerCase().replace(/\s+/g, '-')}`}> {s.rating}</span>
                </div>
                <p className="text-muted">{s.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cadence */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('cadence')}>
          <h3>Cadence & Running Form</h3>
          <span>{openSection === 'cadence' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'cadence' && (
          <div className="section-content">
            <p><strong>{CADENCE_ADVICE.instruction}</strong></p>
            <p>{CADENCE_ADVICE.reason}</p>
            <p className="text-muted">{CADENCE_ADVICE.example}</p>
            <p className="text-muted" style={{ fontSize: 11 }}>Source: {CADENCE_ADVICE.source}</p>
          </div>
        )}
      </div>

      {/* Equipment */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('equipment')}>
          <h3>Equipment Needed</h3>
          <span>{openSection === 'equipment' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'equipment' && (
          <div className="section-content">
            {EQUIPMENT.map((item, i) => (
              <div key={i} className="equipment-item">• {item}</div>
            ))}
          </div>
        )}
      </div>

      {/* Education Tips */}
      <div className="card">
        <div className="section-header" onClick={() => toggle('tips')}>
          <h3>Understanding PFPS</h3>
          <span>{openSection === 'tips' ? '▲' : '▼'}</span>
        </div>
        {openSection === 'tips' && (
          <div className="section-content">
            {EDUCATION_TIPS.map((tip, i) => (
              <div key={i} className="tip-card" onClick={() => setOpenTip(openTip === i ? null : i)}>
                <div className="tip-title">{tip.title} {openTip === i ? '▲' : '▼'}</div>
                {openTip === i && <p className="tip-content">{tip.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
