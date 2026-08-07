import { JobApplication } from '../types';
import { generateAvatarSvgUrl } from './mediaUtils';

const STORAGE_KEY = 'dstech_applications';

// Local storage helpers
function getLocalApps(): Record<string, JobApplication> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    // Remove stale demo seed if present
    if (parsed && parsed['seed-hassan-demo']) {
      delete parsed['seed-hassan-demo'];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed || {};
  } catch (e) {
    return {};
  }
}

function saveLocalApps(apps: Record<string, JobApplication>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'applications';

export async function apiGetApplications(): Promise<JobApplication[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JobApplication[];
    
    // Merge server data into local storage to keep them in sync/backed up
    const locals = getLocalApps();
    data.forEach((app: JobApplication) => {
      locals[app.id] = app;
    });
    saveLocalApps(locals);
    
    return data;
  } catch (err) {
    console.warn('Firestore GET failed. Falling back to LocalStorage.', err);
    const locals = getLocalApps();
    return Object.values(locals).filter(a => a.id !== 'seed-hassan-demo');
  }
}

export function apiSubscribeToApplications(callback: (apps: JobApplication[]) => void): () => void {
  const q = query(collection(db, COLLECTION_NAME));
  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JobApplication[];
    callback(apps);
  }, (err) => console.error("Applications sub error:", err));
}

export async function apiGetApplication(id: string): Promise<JobApplication> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Application not found');
    const data = { id: docSnap.id, ...docSnap.data() } as JobApplication;
    
    // Save/sync locally
    const locals = getLocalApps();
    locals[id] = data;
    saveLocalApps(locals);
    
    return data;
  } catch (err) {
    console.warn(`Firestore get for ${id} failed. Falling back to LocalStorage.`, err);
    const locals = getLocalApps();
    const app = locals[id];
    if (!app) {
      throw new Error('This Application ID is either invalid, expired, or has been purged from memory.');
    }
    return app;
  }
}

export async function apiSaveApplication(formData: Omit<JobApplication, 'id' | 'createdAt'>): Promise<JobApplication> {
  try {
    const id = doc(collection(db, COLLECTION_NAME)).id;
    const now = new Date().toISOString();
    const newApp: JobApplication = {
      id,
      createdAt: now,
      status: 'pending',
      ...formData,
    } as JobApplication;
    
    await setDoc(doc(db, COLLECTION_NAME, id), newApp);
    
    // Sync locally
    const locals = getLocalApps();
    locals[id] = newApp;
    saveLocalApps(locals);
    
    return newApp;
  } catch (err) {
    console.error('Firestore save failed', err);
    throw err;
  }
}

export async function apiUpdateApplication(id: string, updatedFields: Partial<JobApplication>): Promise<JobApplication> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatedFields);
    
    const updatedApp = await apiGetApplication(id);
    return updatedApp;
  } catch (err) {
    console.error('Firestore update failed', err);
    throw err;
  }
}

export async function apiDeleteApplication(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    
    const locals = getLocalApps();
    delete locals[id];
    saveLocalApps(locals);
    
    return true;
  } catch (err) {
    console.error('Firestore delete failed', err);
    throw err;
  }
}
