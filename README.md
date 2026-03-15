# Running Comeback Tracker

A progressive web app (PWA) for tracking your return to running after knee injury (patellofemoral pain syndrome). Works offline, installable on your phone's home screen.

## Features

- **Daily View** — Today's activities, streak counter, weekly plan summary, pain alerts
- **Run Logger** — Distance, duration, pace, run type, surface, pain during/after/next morning
- **Rehab Logger** — Configurable exercise checklist with sets/reps/pain tracking
- **Pain Tracker** — Standalone pain logging with context (stairs, sitting, activity, etc.)
- **Progress Dashboard** — Weekly volume chart, pain trend, calendar heatmap, plan vs actual
- **8-Week Program Planner** — Set weekly targets for distance, runs, and rehab
- **History** — Filterable log of all entries with detail expansion and delete
- **Alerts** — Pain trending warning, evening activity reminder, morning check-in
- **Data Management** — Export/import JSON backups, all data stored client-side (IndexedDB)
- **PWA** — Installable, offline-capable, mobile-first dark theme

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 on your phone (same WiFi) or desktop browser.

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo at vercel.com for automatic deploys.

### Netlify

```bash
npm run build
```

Then drag the `dist/` folder to app.netlify.com/drop, or connect your repo for CI/CD.

### Netlify CLI

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Install as PWA

After deploying to a public URL (HTTPS required):

1. Open the URL on your phone's browser
2. **iOS**: Tap Share > "Add to Home Screen"
3. **Android**: Tap the browser menu > "Install app" or "Add to Home Screen"

## Tech Stack

- React 19 + Vite
- Chart.js (via react-chartjs-2) for progress charts
- IndexedDB (via idb) for client-side data persistence
- Service Worker for offline support
- No backend — all data stays on your device
