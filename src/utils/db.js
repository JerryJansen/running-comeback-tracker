import { openDB } from 'idb';

const DB_NAME = 'comeback-tracker';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('runs')) {
      const runStore = db.createObjectStore('runs', { keyPath: 'id' });
      runStore.createIndex('date', 'date');
    }
    if (!db.objectStoreNames.contains('rehab')) {
      const rehabStore = db.createObjectStore('rehab', { keyPath: 'id' });
      rehabStore.createIndex('date', 'date');
    }
    if (!db.objectStoreNames.contains('pain')) {
      const painStore = db.createObjectStore('pain', { keyPath: 'id' });
      painStore.createIndex('date', 'date');
    }
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
    }
  },
});

export async function getAll(store) {
  return (await dbPromise).getAll(store);
}

export async function getByDate(store, date) {
  const all = await getAll(store);
  return all.filter((item) => item.date === date);
}

export async function getByDateRange(store, startDate, endDate) {
  const all = await getAll(store);
  return all.filter((item) => item.date >= startDate && item.date <= endDate);
}

export async function put(store, value) {
  return (await dbPromise).put(store, value);
}

export async function del(store, key) {
  return (await dbPromise).delete(store, key);
}

export async function getSetting(key) {
  const db = await dbPromise;
  const result = await db.get('settings', key);
  return result?.value;
}

export async function setSetting(key, value) {
  return (await dbPromise).put('settings', { key, value });
}

export async function exportAllData() {
  const [runs, rehab, pain, settings] = await Promise.all([
    getAll('runs'),
    getAll('rehab'),
    getAll('pain'),
    getAll('settings'),
  ]);
  return { runs, rehab, pain, settings, exportedAt: new Date().toISOString() };
}

export async function importAllData(data) {
  const db = await dbPromise;
  const tx = db.transaction(['runs', 'rehab', 'pain', 'settings'], 'readwrite');
  // Clear existing
  await Promise.all([
    tx.objectStore('runs').clear(),
    tx.objectStore('rehab').clear(),
    tx.objectStore('pain').clear(),
    tx.objectStore('settings').clear(),
  ]);
  // Import
  for (const run of data.runs || []) await tx.objectStore('runs').put(run);
  for (const r of data.rehab || []) await tx.objectStore('rehab').put(r);
  for (const p of data.pain || []) await tx.objectStore('pain').put(p);
  for (const s of data.settings || []) await tx.objectStore('settings').put(s);
  await tx.done;
}
