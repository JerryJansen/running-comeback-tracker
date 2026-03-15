import { useState, useEffect } from 'react';
import { useData } from './hooks/useData';
import DailyView from './components/DailyView';
import ProgressDashboard from './components/ProgressDashboard';
import ProgramPlanner from './components/ProgramPlanner';
import History from './components/History';
import PfpsGuide from './components/PfpsGuide';
import Settings from './components/Settings';
import './App.css';

const TABS = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'progress', label: 'Progress', icon: '📈' },
  { id: 'plan', label: 'Plan', icon: '🗓' },
  { id: 'guide', label: 'Guide', icon: '📖' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function App() {
  const [tab, setTab] = useState('today');
  const data = useData();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const hours = now.getHours();
      const lastReminder = localStorage.getItem('lastReminderDate');
      const todayStr = now.toISOString().slice(0, 10);

      if (hours >= 8 && hours < 9 && lastReminder !== todayStr + '-morning') {
        new Notification('Morning Check-in', {
          body: 'How does your knee feel this morning?',
          icon: '/icon-192.svg',
        });
        localStorage.setItem('lastReminderDate', todayStr + '-morning');
      }

      if (hours >= 20 && hours < 21 && lastReminder !== todayStr + '-evening') {
        const hasActivity = data.runs.some((r) => r.date === todayStr) ||
          data.rehab.some((r) => r.date === todayStr);
        if (!hasActivity) {
          new Notification('Activity Reminder', {
            body: "You haven't logged any activity today. Don't forget!",
            icon: '/icon-192.svg',
          });
          localStorage.setItem('lastReminderDate', todayStr + '-evening');
        }
      }
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, [data.runs, data.rehab]);

  if (data.loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        {tab === 'today' && <DailyView data={data} />}
        {tab === 'progress' && <ProgressDashboard data={data} />}
        {tab === 'plan' && <ProgramPlanner data={data} />}
        {tab === 'guide' && <PfpsGuide />}
        {tab === 'history' && <History data={data} />}
        {tab === 'settings' && <Settings data={data} />}
      </main>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-item ${tab === t.id ? 'tab-item--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
