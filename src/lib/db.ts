import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'fitcheck-studio';
const DB_VERSION = 1;
const STORE_NAME = 'fit-history';

export interface SavedFit {
  id: string;
  image: Blob;
  score: number;
  message: string;
  date: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('date', 'date');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveFit(fit: SavedFit): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, fit);
}

export async function getAllFits(): Promise<SavedFit[]> {
  const db = await getDB();
  const fits = await db.getAllFromIndex(STORE_NAME, 'date');
  return fits.reverse(); // newest first
}

export async function deleteFit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getFitCount(): Promise<number> {
  const db = await getDB();
  return db.count(STORE_NAME);
}

/**
 * Migrate existing localStorage fit history to IndexedDB.
 * Runs once, then sets a flag to skip on future loads.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (localStorage.getItem('fitcheck_idb_migrated')) return;

  const existing = localStorage.getItem('fitCheckHistory');
  if (!existing) {
    localStorage.setItem('fitcheck_idb_migrated', 'true');
    return;
  }

  try {
    const history: Array<{
      id: string;
      image: string; // base64 data URL
      score: number;
      message: string;
      date: string;
    }> = JSON.parse(existing);

    for (const fit of history) {
      // Convert base64 data URL to Blob
      const response = await fetch(fit.image);
      const blob = await response.blob();

      await saveFit({
        id: fit.id,
        image: blob,
        score: fit.score,
        message: fit.message,
        date: fit.date,
      });
    }

    // Clean up localStorage after successful migration
    localStorage.removeItem('fitCheckHistory');
    localStorage.setItem('fitcheck_idb_migrated', 'true');
  } catch (error) {
    console.warn('Failed to migrate fit history to IndexedDB:', error);
  }
}
