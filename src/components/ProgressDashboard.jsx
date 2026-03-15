import { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { format, parseISO, startOfWeek, eachWeekOfInterval, subWeeks, eachDayOfInterval, subDays } from 'date-fns';
import { painColor, getCurrentWeek } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' }, beginAtZero: true },
  },
};

export default function ProgressDashboard({ data }) {
  const currentWeek = getCurrentWeek(data.programStart);

  // Weekly volume (last 8 weeks)
  const weeklyVolume = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval(
      { start: subWeeks(now, 7), end: now },
      { weekStartsOn: 1 }
    );
    const labels = weeks.map((w) => format(w, 'MMM d'));
    const values = weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');
      return data.runs
        .filter((r) => r.date >= startStr && r.date <= endStr)
        .reduce((sum, r) => sum + r.distance, 0);
    });
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: '#22d3ee',
        borderRadius: 6,
      }],
    };
  }, [data.runs]);

  // Pain trend (last 30 days)
  const painTrend = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 29), end: now });
    const labels = days.map((d) => format(d, 'M/d'));
    const values = days.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayPain = data.pain.filter((p) => p.date === dateStr);
      if (dayPain.length === 0) return null;
      return dayPain.reduce((sum, p) => sum + p.level, 0) / dayPain.length;
    });

    const colors = values.map((v) => v !== null ? painColor(v) : '#475569');

    return {
      labels,
      datasets: [{
        data: values,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.3,
        spanGaps: true,
        pointBackgroundColor: colors,
        pointRadius: 3,
      }],
    };
  }, [data.pain]);

  // Longest run
  const longestRun = useMemo(() => {
    if (data.runs.length === 0) return 0;
    return Math.max(...data.runs.map((r) => r.distance));
  }, [data.runs]);

  // Total km
  const totalKm = useMemo(() => data.runs.reduce((s, r) => s + r.distance, 0), [data.runs]);

  // Average pace
  const avgPace = useMemo(() => {
    const runsWithPace = data.runs.filter((r) => r.distance && r.duration);
    if (runsWithPace.length === 0) return null;
    const totalMin = runsWithPace.reduce((s, r) => s + r.duration, 0);
    const totalDist = runsWithPace.reduce((s, r) => s + r.distance, 0);
    const pace = totalMin / totalDist;
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')} /km`;
  }, [data.runs]);

  // Calendar heatmap (last 42 days = 6 weeks)
  const heatmap = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 41), end: now });
    return days.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const hasActivity = data.runs.some((r) => r.date === dateStr) || data.rehab.some((r) => r.date === dateStr);
      const dayPain = data.pain.filter((p) => p.date === dateStr);
      const avgPain = dayPain.length > 0 ? dayPain.reduce((s, p) => s + p.level, 0) / dayPain.length : 0;
      const isHighPain = avgPain > 6;
      return { date: dateStr, dayLabel: format(d, 'E')[0], dayNum: format(d, 'd'), hasActivity, isHighPain };
    });
  }, [data.runs, data.rehab, data.pain]);

  // 10% rule: check if current week volume exceeds previous week by >10%
  const tenPercentWarning = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

    const thisWeekStartStr = format(thisWeekStart, 'yyyy-MM-dd');
    const nowStr = format(now, 'yyyy-MM-dd');
    const lastWeekStartStr = format(lastWeekStart, 'yyyy-MM-dd');
    const lastWeekEndStr = format(lastWeekEnd, 'yyyy-MM-dd');

    const thisWeekKm = data.runs
      .filter((r) => r.date >= thisWeekStartStr && r.date <= nowStr)
      .reduce((s, r) => s + r.distance, 0);
    const lastWeekKm = data.runs
      .filter((r) => r.date >= lastWeekStartStr && r.date <= lastWeekEndStr)
      .reduce((s, r) => s + r.distance, 0);

    if (lastWeekKm === 0 || thisWeekKm === 0) return null;
    const increase = ((thisWeekKm - lastWeekKm) / lastWeekKm) * 100;
    if (increase > 10) {
      return { increase: increase.toFixed(0), thisWeekKm: thisWeekKm.toFixed(1), lastWeekKm: lastWeekKm.toFixed(1) };
    }
    return null;
  }, [data.runs]);

  // Week plan vs actual
  const weekComparison = useMemo(() => {
    if (!currentWeek || !data.weeklyPlan) return null;
    const plan = data.weeklyPlan[currentWeek - 1];
    if (!plan) return null;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(now, 'yyyy-MM-dd');
    const weekRuns = data.runs.filter((r) => r.date >= startStr && r.date <= endStr);
    const actualKm = weekRuns.reduce((s, r) => s + r.distance, 0);
    const actualRuns = weekRuns.length;
    return { plan, actualKm, actualRuns };
  }, [currentWeek, data.weeklyPlan, data.runs]);

  return (
    <div className="dashboard">
      <h2>Progress</h2>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{totalKm.toFixed(1)}</div>
          <div className="stat-label">Total km</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{longestRun}</div>
          <div className="stat-label">Longest run (km)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.runs.length}</div>
          <div className="stat-label">Total runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgPace || '—'}</div>
          <div className="stat-label">Avg pace</div>
        </div>
      </div>

      {tenPercentWarning && (
        <div className="alert alert--warning">
          🟡 Volume up {tenPercentWarning.increase}% vs last week ({tenPercentWarning.thisWeekKm} km vs {tenPercentWarning.lastWeekKm} km). The 10% rule suggests limiting weekly increases to avoid re-injury.
        </div>
      )}

      {weekComparison && (
        <div className="card">
          <h3>Week {currentWeek}: Plan vs Actual</h3>
          <div className="comparison-row">
            <div className="comparison-item">
              <span className="comparison-label">Distance</span>
              <span className={`comparison-value ${weekComparison.actualKm >= weekComparison.plan.targetKm ? 'text-green' : ''}`}>
                {weekComparison.actualKm.toFixed(1)} / {weekComparison.plan.targetKm} km
              </span>
              <TrafficLight actual={weekComparison.actualKm} target={weekComparison.plan.targetKm} />
            </div>
            <div className="comparison-item">
              <span className="comparison-label">Runs</span>
              <span className={`comparison-value ${weekComparison.actualRuns >= weekComparison.plan.numRuns ? 'text-green' : ''}`}>
                {weekComparison.actualRuns} / {weekComparison.plan.numRuns}
              </span>
              <TrafficLight actual={weekComparison.actualRuns} target={weekComparison.plan.numRuns} />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Weekly Running Volume (km)</h3>
        <div className="chart-container">
          <Bar data={weeklyVolume} options={chartOptions} />
        </div>
      </div>

      <div className="card">
        <h3>Pain Trend (30 days)</h3>
        <div className="chart-container">
          <Line data={painTrend} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: 10 } } }} />
        </div>
      </div>

      <div className="card">
        <h3>Activity Calendar</h3>
        <div className="heatmap">
          {heatmap.map((d) => (
            <div
              key={d.date}
              className={`heatmap-cell ${d.hasActivity ? 'heatmap-cell--active' : ''} ${d.isHighPain ? 'heatmap-cell--pain' : ''}`}
              title={`${d.date}${d.hasActivity ? ' - Active' : ''}${d.isHighPain ? ' - High Pain' : ''}`}
            >
              {d.dayNum}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span><span className="legend-dot legend-dot--rest"></span> Rest</span>
          <span><span className="legend-dot legend-dot--active"></span> Active</span>
          <span><span className="legend-dot legend-dot--pain"></span> High pain</span>
        </div>
      </div>
    </div>
  );
}

function TrafficLight({ actual, target }) {
  const ratio = target > 0 ? actual / target : 0;
  let color, label;
  if (ratio >= 0.9) { color = '#10b981'; label = 'On track'; }
  else if (ratio >= 0.5) { color = '#f59e0b'; label = 'Behind'; }
  else { color = '#ef4444'; label = 'Behind'; }
  if (ratio > 1.2) { color = '#3b82f6'; label = 'Ahead'; }
  return (
    <span className="traffic-light" style={{ color }}>● {label}</span>
  );
}
