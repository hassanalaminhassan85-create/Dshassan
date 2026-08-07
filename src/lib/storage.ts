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

export async function apiGetApplications(): Promise<JobApplication[]> {
  try {
    const res = await fetch('/api/applications');
    if (!res.ok) throw new Error('API Error');
    const data: JobApplication[] = await res.json();
    
    // Filter out old demo seed if present
    const cleanData = data.filter(a => a.id !== 'seed-hassan-demo');

    // Merge server data into local storage to keep them in sync/backed up
    const locals = getLocalApps();
    cleanData.forEach((app: JobApplication) => {
      locals[app.id] = app;
    });
    saveLocalApps(locals);
    
    return cleanData;
  } catch (err) {
    console.warn('API is unavailable. Falling back to LocalStorage.', err);
    const locals = getLocalApps();
    delete locals['seed-hassan-demo'];
    return Object.values(locals).filter(a => a.id !== 'seed-hassan-demo');
  }
}

export async function apiGetApplication(id: string): Promise<JobApplication> {
  try {
    const res = await fetch(`/api/applications/${id}`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    // Save/sync locally
    const locals = getLocalApps();
    locals[id] = data;
    saveLocalApps(locals);
    
    return data;
  } catch (err) {
    console.warn(`API get for ${id} failed. Falling back to LocalStorage.`, err);
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
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('API Error');
    const savedApp = await res.json();
    
    // Sync locally
    const locals = getLocalApps();
    locals[savedApp.id] = savedApp;
    saveLocalApps(locals);
    
    return savedApp;
  } catch (err) {
    console.warn('API save failed. Storing in LocalStorage only.', err);
    // Create custom local object
    const id = 'app_local_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString().substring(8);
    const newApp: JobApplication = {
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...formData,
    } as JobApplication;
    
    const locals = getLocalApps();
    locals[id] = newApp;
    saveLocalApps(locals);
    
    return newApp;
  }
}

export async function apiUpdateApplication(id: string, updatedFields: Partial<JobApplication>): Promise<JobApplication> {
  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('API Error');
    const updatedApp = await res.json();
    
    const locals = getLocalApps();
    locals[id] = updatedApp;
    saveLocalApps(locals);
    
    return updatedApp;
  } catch (err) {
    console.warn(`API update for ${id} failed. Saving to LocalStorage.`, err);
    const locals = getLocalApps();
    const app = locals[id];
    if (!app) {
      throw new Error('Application record not found in localStorage.');
    }
    
    const updatedApp = {
      ...app,
      ...updatedFields,
    };
    locals[id] = updatedApp;
    saveLocalApps(locals);
    
    return updatedApp;
  }
}

export async function apiDeleteApplication(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API Error');
    
    const locals = getLocalApps();
    delete locals[id];
    saveLocalApps(locals);
    
    return true;
  } catch (err) {
    console.warn(`API delete for ${id} failed. Removing from LocalStorage.`, err);
    const locals = getLocalApps();
    if (locals[id]) {
      delete locals[id];
      saveLocalApps(locals);
      return true;
    }
    throw new Error('Application record not found.');
  }
}
