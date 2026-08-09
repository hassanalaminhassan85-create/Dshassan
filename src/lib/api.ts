// 2026 Advanced Client API Helpers for DS Tech Portal
// Connects UI to secure backend Cloudflare Functions / Express server

import { Department, StaffMember, StaffActivityLog } from '../types';
import { generateDynamicSvgUrl, generateAvatarSvgUrl } from './mediaUtils';
import { SERVICES, PORTFOLIO, BLOG_POSTS } from './data';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDoc,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface ScanHistoryRecord {
  id: string;
  user_id: string;
  applicant_id: string;
  applicant_name: string;
  scanned_at: string;
  secure_r2_url: string;
  safety_status: 'safe' | 'unsafe' | 'suspicious';
}

export interface UrlSafetyReport {
  safe: boolean;
  dangerScore: number; // 0 to 100
  threatType: string;
  reason: string;
}

// Generate or retrieve a persistent client User ID for secure scoping and privacy
export function getClientUserId(): string {
  let uid = localStorage.getItem('dstech_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString().substring(10);
    localStorage.setItem('dstech_user_id', uid);
  }
  return uid;
}

// Get the scan history log (scoped securely by User ID header)
export async function apiGetScanHistory(): Promise<ScanHistoryRecord[]> {
  const uid = getClientUserId();
  const res = await fetch('/api/scan-history', {
    headers: {
      'X-User-ID': uid
    }
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve scan history from Cloudflare/Express backend.');
  }
  return res.json();
}

// Log a scanning operation (and compress/upload QR image)
export async function apiLogScan(params: {
  applicantId: string;
  applicantName: string;
  qrImageBase64?: string;
  safetyStatus?: 'safe' | 'unsafe' | 'suspicious';
}): Promise<ScanHistoryRecord> {
  const uid = getClientUserId();
  const res = await fetch('/api/scan-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': uid
    },
    body: JSON.stringify(params)
  });
  
  if (!res.ok) {
    throw new Error('Failed to secure and log the scan record on Cloudflare.');
  }
  return res.json();
}

// Generate a server-side Gemini executive applicant summary (hiding keys in backend vault)
export async function apiSummarizeApplicant(applicationData: any): Promise<{ summary: string; simulated?: boolean }> {
  const res = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ applicationData })
  });
  if (!res.ok) {
    throw new Error('Failed to fetch AI applicant summary.');
  }
  return res.json();
}

// Pre-screen a target QR URL using the Gemini Fraud Shield backend
export async function apiPreScreenUrl(targetUrl: string): Promise<UrlSafetyReport> {
  const res = await fetch('/api/gemini/pre-screen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ targetUrl })
  });
  if (!res.ok) {
    throw new Error('Failed to run AI safety scan.');
  }
  return res.json();
}

// Analyze applicant using server-side Gemini AI for compatibility, strengths, risks, and questions
export async function apiAnalyzeCandidate(applicationData: any): Promise<{
  compatibilityScore: number;
  keyStrengths: string[];
  potentialRisks: string[];
  interviewQuestions: string[];
}> {
  const res = await fetch('/api/gemini/analyze-candidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ applicationData })
  });
  if (!res.ok) {
    throw new Error('Failed to run AI candidate analysis.');
  }
  return res.json();
}

// Start a real-time Server-Sent Events connection for instant multi-screen syncing
export function apiSubscribeToRealtimeSync(onEvent: (data: any) => void): () => void {
  const eventSource = new EventSource('/api/events');

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (e) {
      console.error('Failed to parse SSE event payload:', e);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('Real-time connection disrupted. Retrying automatically...', err);
  };

  // Return a cleanup/unsubscription method
  return () => {
    eventSource.close();
  };
}

// --- Firestore & Cloudflare Real-time Subscription Helpers ---
import { onSnapshot } from 'firebase/firestore';

export function apiSubscribeToServices(callback: (services: any[]) => void): () => void {
  // 1. Initial immediate multi-tier fetch
  apiGetServices().then(data => {
    if (data && data.length > 0) callback(data);
  }).catch(() => callback(SERVICES));

  // 2. Firestore listener
  const q = query(collection(db, 'services'));
  const unsubFirestore = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_services', JSON.stringify(services));
      callback(services);
    }
  }, (err) => console.warn("Services sub warning:", err));

  // 3. Custom Window Event listener for tab/cross-component synchronization
  const handleUpdate = () => {
    apiGetServices().then(data => callback(data));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dstech_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('dstech_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    }
  };
}

export function apiSubscribeToPortfolio(callback: (projects: any[]) => void): () => void {
  // 1. Initial immediate multi-tier fetch
  apiGetPortfolio().then(data => {
    if (data && data.length > 0) callback(data);
  }).catch(() => callback(PORTFOLIO));

  // 2. Firestore listener
  const q = query(collection(db, 'portfolio'));
  const unsubFirestore = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_portfolio_projects', JSON.stringify(projects));
      callback(projects);
    }
  }, (err) => console.warn("Portfolio sub warning:", err));

  // 3. Custom Window Event listener for sync
  const handleUpdate = () => {
    apiGetPortfolio().then(data => callback(data));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dstech_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('dstech_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    }
  };
}

export function apiSubscribeToBlogs(callback: (blogs: any[]) => void): () => void {
  // 1. Initial immediate multi-tier fetch
  apiGetBlogs().then(data => {
    if (data && data.length > 0) callback(data);
  }).catch(() => callback(BLOG_POSTS));

  // 2. Firestore listener
  const q = query(collection(db, 'blogs'));
  const unsubFirestore = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_blogs', JSON.stringify(blogs));
      callback(blogs);
    }
  }, (err) => console.warn("Blogs sub warning:", err));

  // 3. Custom Window Event listener for sync
  const handleUpdate = () => {
    apiGetBlogs().then(data => callback(data));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dstech_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('dstech_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    }
  };
}

export function apiSubscribeToCourses(callback: (courses: any[]) => void): () => void {
  const q = query(collection(db, 'courses'));
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(courses);
    }
  }).catch((err) => console.warn("One-time courses fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(courses);
    }
  }, (err) => console.error("Courses sub error:", err));
}

export function apiSubscribeToClientProjects(callback: (projects: any[]) => void): () => void {
  const q = query(collection(db, 'client_projects'));
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(projects);
    }
  }).catch((err) => console.warn("One-time client projects fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(projects);
    }
  }, (err) => console.error("Client Projects sub error:", err));
}

export function apiSubscribeToOngoingProjects(callback: (projects: any[]) => void): () => void {
  // 1. Initial immediate multi-tier fetch
  apiGetOngoingProjects(true).then(data => {
    if (data) callback(data);
  }).catch(() => {});

  // 2. Firestore listener
  const q = query(collection(db, 'ongoing_projects'));
  const unsubFirestore = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_ongoing_projects', JSON.stringify(projects));
      callback(projects);
    }
  }, (err) => console.warn("Ongoing Projects sub warning:", err));

  // 3. Custom Window Event listener for sync
  const handleUpdate = () => {
    apiGetOngoingProjects(true).then(data => callback(data));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dstech_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('dstech_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    }
  };
}

export function apiSubscribeToRecognitionCertificates(callback: (certs: any[]) => void): () => void {
  // 1. Initial immediate multi-tier fetch
  apiGetRecognitionCertificates(true).then(data => {
    if (data) callback(data);
  }).catch(() => {});

  // 2. Firestore listener
  const q = query(collection(db, 'recognition_certificates'));
  const unsubFirestore = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_recognition_certs', JSON.stringify(certs));
      callback(certs);
    }
  }, (err) => console.warn("Recognition sub warning:", err));

  // 3. Custom Window Event listener for sync
  const handleUpdate = () => {
    apiGetRecognitionCertificates(true).then(data => callback(data));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dstech_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('dstech_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    }
  };
}

export function apiSubscribeToCacMetadata(callback: (metadata: any[]) => void): () => void {
  const q = query(collection(db, 'cac_metadata'), orderBy('updated_at', 'desc'));
  // Robust one-time immediate fetch fallback
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const metadata = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      metadata.sort((a: any, b: any) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
      callback(metadata);
    }
  }).catch((err) => console.warn("One-time cac metadata fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    const metadata = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    metadata.sort((a: any, b: any) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
    callback(metadata);
  }, (err) => console.error("CAC Metadata sub error:", err));
}

export function apiSubscribeToStaff(callback: (staff: any[]) => void): () => void {
  const q = query(collection(db, 'staff'));
  // Robust one-time immediate fetch fallback
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(staff);
    }
  }).catch((err) => console.warn("One-time staff fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(staff);
  }, (err) => console.error("Staff sub error:", err));
}

export function apiSubscribeToDepartments(callback: (departments: any[]) => void): () => void {
  const q = query(collection(db, 'departments'));
  // Robust one-time immediate fetch fallback
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const depts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(depts);
    }
  }).catch((err) => console.warn("One-time departments fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    const depts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(depts);
  }, (err) => console.error("Departments sub error:", err));
}

export function apiSubscribeToPageContent(sectionKey: string, callback: (content: any) => void): () => void {
  const q = query(collection(db, 'page_content'), where('section_key', '==', sectionKey));
  // Robust one-time immediate fetch fallback
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      callback({ id: snapshot.docs[0].id, ...docData });
    }
  }).catch((err) => console.warn(`One-time page content fetch warning for ${sectionKey}:`, err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      callback({ id: snapshot.docs[0].id, ...docData });
    } else {
      callback(null);
    }
  }, (err) => console.error(`Page content sub error for ${sectionKey}:`, err));
}

// --- Dynamic Services Sync ---
export async function apiGetServices(): Promise<any[]> {
  // 1. Attempt Cloudflare REST API first
  try {
    const res = await fetch('/api/services');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('admin_services', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn("Cloudflare REST Services GET warning:", e);
  }

  // 2. Attempt Firestore
  try {
    const q = query(collection(db, 'services'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_services', JSON.stringify(services));
      return services;
    }
  } catch (e) {
    console.warn("Firestore Services GET warning:", e);
  }

  // 3. Attempt LocalStorage
  try {
    const saved = localStorage.getItem('admin_services');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // 4. Default Seed Fallback
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_services', JSON.stringify(SERVICES));
  }
  return SERVICES;
}

export async function apiSaveService(service: any): Promise<any> {
  const id = service.id || doc(collection(db, 'services')).id;
  const record = { ...service, id };
  
  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'services', id), record);
  } catch (e) {
    console.error("Firestore Services SAVE error:", e);
  }
  
  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Services SAVE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const existing = await apiGetServices();
    const idx = existing.findIndex((s: any) => s.id === id);
    let newList = [...existing];
    if (idx >= 0) newList[idx] = record;
    else newList.push(record);
    localStorage.setItem('admin_services', JSON.stringify(newList));
  } catch (e) {}

  // 4. Dispatch sync event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'services', action: 'save', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

export async function apiUpdateService(id: string, service: any): Promise<any> {
  const record = { ...service, id };

  // 1. Write to Firestore (real-time sync)
  try {
    await updateDoc(doc(db, 'services', id), service);
  } catch (e) {
    console.error("Firestore Services UPDATE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Services UPDATE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_services');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const idx = parsed.findIndex((s: any) => s.id === id);
        if (idx >= 0) parsed[idx] = { ...parsed[idx], ...record };
        else parsed.push(record);
        localStorage.setItem('admin_services', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'services', action: 'update', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

export async function apiDeleteService(id: string): Promise<any> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (e) {
    console.error("Firestore Services DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/services/${id}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn("Backend D1 Services DELETE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_services');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((s: any) => s.id !== id);
        localStorage.setItem('admin_services', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'services', action: 'delete', id } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true };
}

export async function apiInitializeServices(items: any[]): Promise<any> {
  for (const item of items) {
    await apiSaveService(item);
  }
  return { success: true };
}

// --- Dynamic Portfolio Sync ---
export async function apiGetPortfolio(): Promise<any[]> {
  // 1. Attempt Cloudflare REST API
  try {
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('admin_portfolio_projects', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn("Cloudflare REST Portfolio GET warning:", e);
  }

  // 2. Attempt Firestore
  try {
    const q = query(collection(db, 'portfolio'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_portfolio_projects', JSON.stringify(projects));
      return projects;
    }
  } catch (e) {
    console.warn("Firestore Portfolio GET warning:", e);
  }

  // 3. Attempt LocalStorage
  try {
    const saved = localStorage.getItem('admin_portfolio_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // 4. Default Seed Fallback
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_portfolio_projects', JSON.stringify(PORTFOLIO));
  }
  return PORTFOLIO;
}

export async function apiSavePortfolio(project: any): Promise<any> {
  const id = project.id || doc(collection(db, 'portfolio')).id;
  const record = { ...project, id };

  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'portfolio', id), record);
  } catch (e) {
    console.error("Firestore Portfolio SAVE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Portfolio SAVE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const existing = await apiGetPortfolio();
    const idx = existing.findIndex((p: any) => p.id === id);
    let newList = [...existing];
    if (idx >= 0) newList[idx] = record;
    else newList.push(record);
    localStorage.setItem('admin_portfolio_projects', JSON.stringify(newList));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'portfolio', action: 'save', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

export async function apiUpdatePortfolio(id: string, project: any): Promise<any> {
  const record = { ...project, id };

  // 1. Write to Firestore (real-time sync)
  try {
    await updateDoc(doc(db, 'portfolio', id), project);
  } catch (e) {
    console.error("Firestore Portfolio UPDATE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/portfolio/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Portfolio UPDATE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_portfolio_projects');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const idx = parsed.findIndex((p: any) => p.id === id);
        if (idx >= 0) parsed[idx] = { ...parsed[idx], ...record };
        else parsed.push(record);
        localStorage.setItem('admin_portfolio_projects', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'portfolio', action: 'update', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

export async function apiDeletePortfolio(id: string): Promise<any> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'portfolio', id));
  } catch (e) {
    console.error("Firestore Portfolio DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/portfolio/${id}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn("Backend D1 Portfolio DELETE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_portfolio_projects');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((p: any) => p.id !== id);
        localStorage.setItem('admin_portfolio_projects', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'portfolio', action: 'delete', id } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true };
}

export async function apiInitializePortfolio(items: any[]): Promise<any> {
  for (const item of items) {
    await apiSavePortfolio(item);
  }
  return { success: true };
}

// --- Dynamic Blogs Sync ---
export async function apiGetBlogs(): Promise<any[]> {
  // 1. Attempt Cloudflare REST API
  try {
    const res = await fetch('/api/blogs');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('admin_blogs', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn("Cloudflare REST Blogs GET warning:", e);
  }

  // 2. Attempt Firestore
  try {
    const q = query(collection(db, 'blogs'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localStorage.setItem('admin_blogs', JSON.stringify(blogs));
      return blogs;
    }
  } catch (e) {
    console.warn("Firestore Blogs GET warning:", e);
  }

  // 3. Attempt LocalStorage
  try {
    const saved = localStorage.getItem('admin_blogs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // 4. Default Seed Fallback
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_blogs', JSON.stringify(BLOG_POSTS));
  }
  return BLOG_POSTS;
}

export async function apiSaveBlog(blog: any): Promise<any> {
  const id = blog.id || doc(collection(db, 'blogs')).id;
  const record = { ...blog, id };

  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'blogs', id), record);
  } catch (e) {
    console.error("Firestore Blogs SAVE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Blogs SAVE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const existing = await apiGetBlogs();
    const idx = existing.findIndex((b: any) => b.id === id);
    let newList = [...existing];
    if (idx >= 0) newList[idx] = record;
    else newList.push(record);
    localStorage.setItem('admin_blogs', JSON.stringify(newList));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'blogs', action: 'save', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

export async function apiUpdateBlog(id: string, blog: any): Promise<any> {
  const record = { ...blog, id };

  // 1. Write to Firestore (real-time sync)
  try {
    await updateDoc(doc(db, 'blogs', id), blog);
  } catch (e) {
    console.error("Firestore Blogs UPDATE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Blogs UPDATE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_blogs');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const idx = parsed.findIndex((b: any) => b.id === id);
        if (idx >= 0) parsed[idx] = { ...parsed[idx], ...record };
        else parsed.push(record);
        localStorage.setItem('admin_blogs', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'blogs', action: 'update', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record;
}

export async function apiDeleteBlog(id: string): Promise<any> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'blogs', id));
  } catch (e) {
    console.error("Firestore Blogs DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/blogs/${id}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn("Backend D1 Blogs DELETE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_blogs');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((b: any) => b.id !== id);
        localStorage.setItem('admin_blogs', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'blogs', action: 'delete', id } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true };
}

export async function apiInitializeBlogs(items: any[]): Promise<any> {
  for (const item of items) {
    await apiSaveBlog(item);
  }
  return { success: true };
}

// --- Dynamic Courses Sync ---
export async function apiGetCourses(): Promise<any[]> {
  

  try {
    const q = query(collection(db, 'courses'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (e) {}

  return [];
}

export async function apiSaveCourse(course: any): Promise<any> {
  const id = course.id || doc(collection(db, 'courses')).id;
  const record = { ...course, id };

  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'courses', id), record);
  } catch (e) {
    console.error("Firestore Courses SAVE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Courses SAVE error:", apiErr);
  }

  return record;
}

export async function apiUpdateCourse(id: string, course: any): Promise<any> {
  const record = { ...course, id };

  // 1. Write to Firestore (real-time sync)
  try {
    await updateDoc(doc(db, 'courses', id), course);
  } catch (e) {
    console.error("Firestore Courses UPDATE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Courses UPDATE error:", apiErr);
  }

  return record;
}

export async function apiDeleteCourse(id: string): Promise<any> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'courses', id));
  } catch (e) {
    console.error("Firestore Courses DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/courses/${id}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn("Backend D1 Courses DELETE error:", apiErr);
  }

  return { success: true };
}

export async function apiInitializeCourses(items: any[]): Promise<any> {
  const current = await apiGetCourses();
  if (current.length === 0) {
    for (const item of items) {
      await apiSaveCourse(item);
    }
  }
  return { success: true };
}


// --- Notification API Client Helpers ---

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  userId: string;
  recipientRole: 'admin' | 'candidate' | 'recruiter';
  image: string;
  createdAt: string;
  read: number; // 0 or 1
  actionUrl: string;
  metadata: string; // JSON string
  expiresAt: string;
}

export interface GetNotificationsResponse {
  notifications: NotificationRecord[];
  total: number;
  page: number;
  limit: number;
}

export async function apiGetNotifications(params: {
  userId: string;
  role: 'admin' | 'candidate' | 'recruiter';
  type?: string;
  priority?: 'high' | 'medium' | 'low';
  search?: string;
  sort?: 'newest' | 'oldest' | 'unread' | 'read';
  page?: number;
  limit?: number;
}): Promise<GetNotificationsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('userId', params.userId);
  queryParams.append('role', params.role);
  if (params.type) queryParams.append('type', params.type);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.search) queryParams.append('search', params.search);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));

  const res = await fetch(`/api/notifications?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch notifications.');
  return res.json();
}

export async function apiCreateNotification(notification: {
  title: string;
  message: string;
  type: string;
  priority?: 'high' | 'medium' | 'low';
  userId: string;
  recipientRole: 'admin' | 'candidate' | 'recruiter';
  image?: string;
  actionUrl?: string;
  metadata?: any;
}): Promise<NotificationRecord> {
  const res = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification),
  });
  if (!res.ok) throw new Error('Failed to create notification.');
  return res.json();
}

export async function apiMarkNotificationRead(id: string, read: boolean = true): Promise<NotificationRecord> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read }),
  });
  if (!res.ok) throw new Error('Failed to update notification status.');
  return res.json();
}

export async function apiMarkAllNotificationsRead(userId: string, role: 'admin' | 'candidate' | 'recruiter'): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications/mark-all-read?userId=${userId}&role=${role}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read.');
  return res.json();
}

export async function apiDeleteNotification(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete notification.');
  return res.json();
}

export async function apiDeleteAllNotifications(userId: string, role: 'admin' | 'candidate' | 'recruiter'): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications?userId=${userId}&role=${role}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear notifications.');
  return res.json();
}

export async function apiGetUnreadNotificationsCount(userId: string, role: 'admin' | 'candidate' | 'recruiter'): Promise<{ count: number }> {
  const res = await fetch(`/api/notifications/count/unread?userId=${userId}&role=${role}`);
  if (!res.ok) throw new Error('Failed to fetch unread count.');
  return res.json();
}

export async function apiSaveFcmToken(tokenParams: {
  userId: string;
  fcmToken: string;
  deviceName?: string;
  deviceType?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch('/api/fcm-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokenParams),
  });
  if (!res.ok) throw new Error('Failed to register FCM token.');
  return res.json();
}

export async function apiGetSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export async function apiSaveSetting(key: string, value: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error('Failed to save setting.');
  return res.json();
}

export interface BiometricLogRecord {
  id: string;
  user_id: string;
  email: string;
  biometric_type: string;
  status: 'success' | 'failed' | 'warning' | 'pending';
  message: string;
  user_agent: string;
  created_at: string;
}

// In-memory fallback for biometric logs since no backend is connected
const MOCK_BIOMETRIC_LOGS: BiometricLogRecord[] = [];

export async function apiGetBiometricLogs(userId: string): Promise<BiometricLogRecord[]> {
  try {
    const res = await fetch(`/api/auth/biometric-logs?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    // Return mock data on failure to prevent "Failed to fetch" errors
    console.warn("Using mock biometric logs", e);
    return MOCK_BIOMETRIC_LOGS.filter(log => log.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function apiLogBiometricAttempt(params: {
  userId?: string;
  email?: string;
  biometricType?: string;
  status: 'success' | 'failed' | 'warning' | 'pending';
  message: string;
  userAgent?: string;
}): Promise<{ success: boolean }> {
  try {
    const res = await fetch('/api/auth/biometric-attempt-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        userAgent: params.userAgent || navigator.userAgent
      })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    console.warn("Using mock biometric log attempt", e);
    MOCK_BIOMETRIC_LOGS.push({
      id: Math.random().toString(36).substring(7),
      user_id: params.userId || 'unknown',
      email: params.email || 'unknown',
      biometric_type: params.biometricType || 'unknown',
      status: params.status,
      message: params.message,
      user_agent: params.userAgent || navigator.userAgent,
      created_at: new Date().toISOString()
    });
    return { success: true };
  }
}

export async function apiUpdateProfile(params: {
  userId: string;
  fullName?: string;
  email?: string;
  profilePhoto?: string;
}): Promise<{ success: boolean; user: any }> {
  const res = await fetch('/api/auth/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update user profile.');
  }
  return res.json();
}

// --- Page Content & CMS Sync ---
export interface PageContent {
  id: string;
  section_key: string;
  content: any; // Flexible JSON structure
  updated_at: string;
}

const CONTENT_COLLECTION = 'page_content';

export async function apiGetPageContent(sectionKey: string): Promise<PageContent | null> {
  try {
    const q = query(collection(db, CONTENT_COLLECTION), where('section_key', '==', sectionKey));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnapshot = querySnapshot.docs[0];
    return { id: docSnapshot.id, ...(docSnapshot.data() as any) } as PageContent;
  } catch (e) {
    console.error(`Error fetching page content for ${sectionKey}:`, e);
    return null;
  }
}

export async function apiSavePageContent(sectionKey: string, content: any): Promise<PageContent> {
  try {
    const existing = await apiGetPageContent(sectionKey);
    const id = existing?.id || doc(collection(db, CONTENT_COLLECTION)).id;
    const now = new Date().toISOString();
    
    const record: PageContent = {
      id,
      section_key: sectionKey,
      content,
      updated_at: now
    };
    
    await setDoc(doc(db, CONTENT_COLLECTION, id), record);
    return record;
  } catch (e) {
    console.error(`Error saving page content for ${sectionKey}:`, e);
    throw e;
  }
}

// --- CAC Certificate & Trust Center Sync ---
export interface CacMetadata {
  id: string;
  company_name: string;
  registration_number: string;
  business_type: string;
  registration_date: string;
  company_status: string;
  registered_address: string;
  description: string;
  verification_url: string;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  is_published: number; // 0 or 1
  display_order: number;
  created_at: string;
  updated_at: string;
}

const CAC_COLLECTION = 'cac_metadata';

export async function apiGetCacMetadata(admin: boolean = false): Promise<CacMetadata[]> {
  // First attempt backend API endpoint
  try {
    const res = await fetch(`/api/cac/metadata${admin ? '?admin=true' : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.sort((a: any, b: any) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
      }
    }
  } catch (apiErr) {
    console.warn("Backend CAC GET failed, attempting Firestore fallback:", apiErr);
  }

  try {
    const cacRef = collection(db, CAC_COLLECTION);
    let q;
    if (admin) {
      q = query(cacRef, orderBy('updated_at', 'desc'));
    } else {
      q = query(cacRef, where('is_published', '==', 1), orderBy('updated_at', 'desc'));
    }
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...(docSnapshot.data() as any) } as CacMetadata));
    return docs.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
  } catch (e) {
    console.error("Error fetching CAC metadata from Firestore:", e);
    return [];
  }
}

export async function apiSaveCacMetadata(metadata: Partial<CacMetadata>): Promise<CacMetadata> {
  const cacRef = collection(db, CAC_COLLECTION);
  const now = new Date().toISOString();
  const id = metadata.id || doc(cacRef).id;
  
  const record: CacMetadata = {
    ...metadata,
    id,
    updated_at: now,
    created_at: metadata.created_at || now
  } as CacMetadata;

  // 1. Write to Firestore (real-time sync)
  try {
    const fsRecord: any = { ...record };
    Object.keys(fsRecord).forEach(key => fsRecord[key] === undefined && delete fsRecord[key]);
    await setDoc(doc(db, CAC_COLLECTION, id), fsRecord);
  } catch (fsErr) {
    console.error("Firestore CAC SAVE error:", fsErr);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/cac/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 CAC SAVE error:", apiErr);
  }

  return record;
}

export async function apiDeleteCacMetadata(id: string): Promise<{ success: boolean }> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, CAC_COLLECTION, id));
  } catch (fsErr) {
    console.error("Firestore CAC DELETE error:", fsErr);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/cac/metadata?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (apiErr) {
    console.warn("Backend D1 CAC DELETE error:", apiErr);
  }

  return { success: true };
}

export async function apiToggleCacPublish(id: string, isPublished: boolean): Promise<{ success: boolean; id: string; is_published: number }> {
  const pubVal = isPublished ? 1 : 0;

  // 1. Update Firestore (real-time sync)
  try {
    await updateDoc(doc(db, CAC_COLLECTION, id), {
      is_published: pubVal,
      updated_at: new Date().toISOString()
    });
  } catch (fsErr) {
    console.error("Firestore CAC publish toggle error:", fsErr);
  }

  // 2. Update D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/cac/metadata/publish', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_published: pubVal })
    });
  } catch (apiErr) {
    console.warn("Backend D1 CAC publish toggle error:", apiErr);
  }

  return { success: true, id, is_published: pubVal };
}

export async function apiUploadCacFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}> {
  // Convert file to base64 Data URL so uploaded image/PDF is guaranteed to render reliably across all clients
  const readAsDataUrl = (f: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(f);
    });
  };

  const base64DataUrl = await readAsDataUrl(file);

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/cac/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.r2_object_key) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Server file upload failed, using high-fidelity Data URL fallback:", e);
  }

  return {
    success: true,
    r2_object_key: base64DataUrl || `cac_certs_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || 'image/png'
  };
}


// --- Recognition & Certifications System ---
export interface RecognitionCertificate {
  id: string;
  title: string;
  category: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  certificate_number?: string;
  description?: string;
  verification_url?: string;
  r2_object_key?: string;
  thumbnail_key?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_published: number; // 0 or 1
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function apiGetRecognitionCertificates(admin: boolean = false, category?: string): Promise<RecognitionCertificate[]> {
  // 1. Attempt Cloudflare REST API
  try {
    let url = admin ? '/api/recognition/certificates?admin=true' : '/api/recognition/certificates';
    if (category) {
      url += (admin ? '&' : '?') + `category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('admin_recognition_certs', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {}

  // 2. Attempt Firestore
  try {
    const ref = collection(db, 'recognition_certificates');
    const q = admin ? query(ref, orderBy('updated_at', 'desc')) : query(ref, where('is_published', '==', 1), orderBy('updated_at', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const certs = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as RecognitionCertificate[];
      localStorage.setItem('admin_recognition_certs', JSON.stringify(certs));
      return certs;
    }
  } catch (e) {}

  // 3. Attempt LocalStorage
  try {
    const saved = localStorage.getItem('admin_recognition_certs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  return [];
}

export async function apiSaveRecognitionCertificate(cert: Partial<RecognitionCertificate>): Promise<RecognitionCertificate> {
  const id = cert.id || doc(collection(db, 'recognition_certificates')).id;
  const now = new Date().toISOString();
  const record = {
    ...cert,
    id,
    created_at: cert.created_at || now,
    updated_at: now
  };

  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'recognition_certificates', id), record);
  } catch (e) {
    console.error("Firestore Recognition SAVE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/recognition/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Recognition SAVE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const existing = await apiGetRecognitionCertificates(true);
    const idx = existing.findIndex((c: any) => c.id === id);
    let newList = [...existing];
    if (idx >= 0) newList[idx] = record as RecognitionCertificate;
    else newList.push(record as RecognitionCertificate);
    localStorage.setItem('admin_recognition_certs', JSON.stringify(newList));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'recognition', action: 'save', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record as RecognitionCertificate;
}

export async function apiDeleteRecognitionCertificate(id: string): Promise<{ success: boolean }> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'recognition_certificates', id));
  } catch (e) {
    console.error("Firestore Recognition DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/recognition/certificates?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn("Backend D1 Recognition DELETE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_recognition_certs');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((c: any) => c.id !== id);
        localStorage.setItem('admin_recognition_certs', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'recognition', action: 'delete', id } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true };
}

export async function apiToggleRecognitionPublish(id: string, isPublished: boolean): Promise<{ success: boolean; id: string; is_published: number }> {
  const pubVal = isPublished ? 1 : 0;

  // 1. Update Firestore (real-time sync)
  try {
    await updateDoc(doc(db, 'recognition_certificates', id), {
      is_published: pubVal,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error("Firestore Recognition TOGGLE error:", e);
  }

  // 2. Update D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/recognition/certificates/publish', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_published: isPublished })
    });
  } catch (apiErr) {
    console.warn("Backend D1 Recognition TOGGLE error:", apiErr);
  }

  // 3. Update LocalStorage
  try {
    const saved = localStorage.getItem('admin_recognition_certs');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const idx = parsed.findIndex((c: any) => c.id === id);
        if (idx >= 0) parsed[idx].is_published = pubVal;
        localStorage.setItem('admin_recognition_certs', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'recognition', action: 'publish', id, is_published: pubVal } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true, id, is_published: pubVal };
}

export async function apiUploadRecognitionFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}> {
  const readAsDataUrl = (f: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(f);
    });
  };

  const base64DataUrl = await readAsDataUrl(file);

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/recognition/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.r2_object_key) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Server recognition upload failed, using Data URL fallback:", e);
  }

  return {
    success: true,
    r2_object_key: base64DataUrl || `recognition_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || 'image/png'
  };
}

// --- Ongoing Projects Management System ---
export interface OngoingProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  full_description: string;
  cover_image_key?: string;
  gallery?: string; // JSON array of image keys or url strings
  status: string;
  progress_percentage: number;
  technologies?: string; // comma-separated list or JSON array of tech
  estimated_completion?: string;
  last_updated: string;
  is_featured: number; // 0 or 1
  is_published: number; // 0 or 1
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function apiGetOngoingProjects(admin: boolean = false): Promise<OngoingProject[]> {
  // 1. Attempt Cloudflare REST API
  try {
    const url = admin ? '/api/ongoing-projects?admin=true' : '/api/ongoing-projects';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('admin_ongoing_projects', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {}

  // 2. Attempt Firestore
  try {
    const ongoingRef = collection(db, 'ongoing_projects');
    const q = admin ? query(ongoingRef, orderBy('updated_at', 'desc')) : query(ongoingRef, where('is_published', '==', 1), orderBy('updated_at', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const projects = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as OngoingProject[];
      localStorage.setItem('admin_ongoing_projects', JSON.stringify(projects));
      return projects;
    }
  } catch (e) {}

  // 3. Attempt LocalStorage
  try {
    const saved = localStorage.getItem('admin_ongoing_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  return [];
}

export async function apiSaveOngoingProject(project: Partial<OngoingProject>): Promise<OngoingProject> {
  const id = project.id || doc(collection(db, 'ongoing_projects')).id;
  const now = new Date().toISOString();
  const record = {
    ...project,
    id,
    created_at: project.created_at || now,
    updated_at: now
  };

  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'ongoing_projects', id), record);
  } catch (e) {
    console.error("Firestore Ongoing Project SAVE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/ongoing-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Ongoing Project SAVE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const existing = await apiGetOngoingProjects(true);
    const idx = existing.findIndex((p: any) => p.id === id);
    let newList = [...existing];
    if (idx >= 0) newList[idx] = record as OngoingProject;
    else newList.push(record as OngoingProject);
    localStorage.setItem('admin_ongoing_projects', JSON.stringify(newList));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'ongoing_projects', action: 'save', item: record } }));
    window.dispatchEvent(new Event('storage'));
  }

  return record as OngoingProject;
}

export async function apiDeleteOngoingProject(id: string): Promise<{ success: boolean; id: string }> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'ongoing_projects', id));
  } catch (e) {
    console.error("Firestore Ongoing Project DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/ongoing-projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn("Backend D1 Ongoing Project DELETE error:", apiErr);
  }

  // 3. Update localStorage directly
  try {
    const saved = localStorage.getItem('admin_ongoing_projects');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((p: any) => p.id !== id);
        localStorage.setItem('admin_ongoing_projects', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'ongoing_projects', action: 'delete', id } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true, id };
}

export async function apiToggleOngoingProjectPublish(id: string, isPublished: boolean): Promise<{ success: boolean; id: string; is_published: number }> {
  const pubVal = isPublished ? 1 : 0;

  // 1. Update Firestore (real-time sync)
  try {
    await updateDoc(doc(db, 'ongoing_projects', id), {
      is_published: pubVal,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error("Firestore Ongoing Project TOGGLE error:", e);
  }

  // 2. Update D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/ongoing-projects/publish', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_published: isPublished })
    });
  } catch (apiErr) {
    console.warn("Backend D1 Ongoing Project TOGGLE error:", apiErr);
  }

  // 3. Update LocalStorage
  try {
    const saved = localStorage.getItem('admin_ongoing_projects');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const idx = parsed.findIndex((p: any) => p.id === id);
        if (idx >= 0) parsed[idx].is_published = pubVal;
        localStorage.setItem('admin_ongoing_projects', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'ongoing_projects', action: 'publish', id, is_published: pubVal } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true, id, is_published: pubVal };
}

export async function apiUpdateOngoingProjectProgress(id: string, progress: number): Promise<{ success: boolean; id: string; progress_percentage: number }> {
  // 1. Update Firestore (real-time sync)
  try {
    await updateDoc(doc(db, 'ongoing_projects', id), {
      progress_percentage: progress,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error("Firestore Ongoing Project PROGRESS error:", e);
  }

  // 2. Update D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/ongoing-projects/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, progress_percentage: progress })
    });
  } catch (apiErr) {
    console.warn("Backend D1 Ongoing Project PROGRESS error:", apiErr);
  }

  // 3. Update LocalStorage
  try {
    const saved = localStorage.getItem('admin_ongoing_projects');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const idx = parsed.findIndex((p: any) => p.id === id);
        if (idx >= 0) parsed[idx].progress_percentage = progress;
        localStorage.setItem('admin_ongoing_projects', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dstech_content_updated', { detail: { module: 'ongoing_projects', action: 'progress', id, progress_percentage: progress } }));
    window.dispatchEvent(new Event('storage'));
  }

  return { success: true, id, progress_percentage: progress };
}

export async function apiUploadOngoingProjectFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  url?: string;
}> {
  const readAsDataUrl = (f: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(f);
    });
  };

  const base64DataUrl = await readAsDataUrl(file);
  let finalKey = base64DataUrl;
  let finalUrl = base64DataUrl;

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/ongoing-projects/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.r2_object_key) {
        finalKey = data.r2_object_key;
        finalUrl = data.url || base64DataUrl || `/api/ongoing-projects/file?key=${encodeURIComponent(data.r2_object_key)}`;
      }
    }
  } catch (err) {
    console.warn("Server ongoing projects upload failed, using Data URL fallback:", err);
  }

  await verifyImageUrlAccessible(finalUrl);

  return {
    success: true,
    r2_object_key: finalKey,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || 'image/png',
    url: finalUrl
  };
}

export async function apiUploadGeneralFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
  url: string;
}> {
  const readAsDataUrl = (f: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(f);
    });
  };

  const base64DataUrl = await readAsDataUrl(file);
  let finalUrl = base64DataUrl;
  let finalKey = base64DataUrl;

  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/general/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.r2_object_key || data.url) {
        finalKey = data.r2_object_key || base64DataUrl;
        finalUrl = data.url || base64DataUrl || `/api/general/file?key=${encodeURIComponent(finalKey)}`;
      }
    }
  } catch (e) {
    console.warn("Server general upload failed, using Data URL fallback:", e);
  }

  await verifyImageUrlAccessible(finalUrl);

  return {
    success: true,
    r2_object_key: finalKey,
    file_name: file.name,
    url: finalUrl
  };
}

// Universal image URL resolver helper
export function resolveImageUrl(urlOrKey: string | null | undefined, fallbackUrl?: string): string {
  if (!urlOrKey || !urlOrKey.trim()) {
    if (fallbackUrl && !fallbackUrl.includes('unsplash.com')) return fallbackUrl;
    return generateDynamicSvgUrl('DS Tech Enterprise', 'software', 'card');
  }
  const trimmed = urlOrKey.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/api/')) {
    return trimmed;
  }
  if (trimmed.startsWith('cac') || trimmed.includes('cac_certs_')) {
    return `/api/cac/file?key=${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.startsWith('recognition/')) {
    return `/api/recognition/file?key=${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.startsWith('staff/')) {
    return `/api/staff/file?key=${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.startsWith('general/')) {
    return `/api/general/file?key=${encodeURIComponent(trimmed)}`;
  }
  return `/api/ongoing-projects/file?key=${encodeURIComponent(trimmed)}`;
}

export { generateDynamicSvgUrl, generateAvatarSvgUrl } from './mediaUtils';
export function resolveStaffImageUrl(urlOrKey: string | null | undefined, fallbackUrl?: string): string {
  if (!urlOrKey || !urlOrKey.trim()) {
    if (fallbackUrl && !fallbackUrl.includes('unsplash.com')) return fallbackUrl;
    return generateAvatarSvgUrl('Staff Member', 'Enterprise Specialist');
  }
  const trimmed = urlOrKey.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/api/')) {
    return trimmed;
  }
  return `/api/staff/file?key=${encodeURIComponent(trimmed)}`;
}

// Enterprise Staff & Departments client-side helpers
export async function apiGetDepartments(admin: boolean = false): Promise<Department[]> {
  try {
    const url = `/api/departments${admin ? '?admin=true' : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}

  try {
    const deptRef = collection(db, 'departments');
    const querySnapshot = await getDocs(deptRef);
    return querySnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...(docSnapshot.data() as any) } as Department));
  } catch (e) {
    return [];
  }
}

export async function apiSaveDepartment(dept: Partial<Department>): Promise<{ success: boolean; department: Department }> {
  const id = dept.id || doc(collection(db, 'departments')).id;
  const now = new Date().toISOString();
  const record = {
    ...dept,
    id,
    updated_at: now,
    created_at: dept.created_at || now
  };

  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'departments', id), record);
  } catch (e) {
    console.error("Firestore Department SAVE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Department SAVE error:", apiErr);
  }

  return { success: true, department: record as Department };
}

export async function apiDeleteDepartment(id: string): Promise<{ success: boolean }> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'departments', id));
  } catch (e) {
    console.error("Firestore Department DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/departments?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (apiErr) {
    console.warn("Backend D1 Department DELETE error:", apiErr);
  }

  return { success: true };
}

export async function apiGetStaff(admin: boolean = false, departmentId?: string): Promise<StaffMember[]> {
  try {
    let url = `/api/staff?${admin ? 'admin=true' : ''}`;
    if (departmentId) {
      url += `&department_id=${encodeURIComponent(departmentId)}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}

  try {
    const staffRef = collection(db, 'staff');
    const querySnapshot = await getDocs(staffRef);
    let list = querySnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...(docSnapshot.data() as any) } as StaffMember));
    if (!admin) {
      list = list.filter(m => m.is_published !== 0 && m.status === 'Active');
    }
    if (departmentId) {
      list = list.filter(m => m.department_id === departmentId);
    }
    return list;
  } catch (e) {
    return [];
  }
}

export async function apiSaveStaff(member: Partial<StaffMember>): Promise<{ success: boolean; staff: StaffMember }> {
  const id = member.id || doc(collection(db, 'staff')).id;
  const now = new Date().toISOString();
  const record: any = {
    ...member,
    id,
    updated_at: now,
    created_at: member.created_at || now,
    is_published: member.is_published !== undefined ? member.is_published : 1,
    status: member.status || 'Active'
  };

  // Remove undefined for Firestore
  Object.keys(record).forEach(k => record[k] === undefined && delete record[k]);

  // 1. Write to Firestore (real-time sync)
  try {
    await setDoc(doc(db, 'staff', id), record);
  } catch (e) {
    console.error("Firestore Staff SAVE error:", e);
  }

  // 2. Write to D1 (Cloudflare persistent storage)
  try {
    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    console.warn("Backend D1 Staff SAVE error:", apiErr);
  }

  return { success: true, staff: record as StaffMember };
}

export async function apiDeleteStaff(id: string): Promise<{ success: boolean }> {
  // 1. Delete from Firestore (real-time sync)
  try {
    await deleteDoc(doc(db, 'staff', id));
  } catch (e) {
    console.error("Firestore Staff DELETE error:", e);
  }

  // 2. Delete from D1 (Cloudflare persistent storage)
  try {
    await fetch(`/api/staff?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (apiErr) {
    console.warn("Backend D1 Staff DELETE error:", apiErr);
  }

  return { success: true };
}

export async function apiUploadStaffFile(file: File): Promise<{
  success: boolean;
  r2_object_key: string;
  file_name: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/staff/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload staff file');
  }
  return res.json();
}

export async function apiGetStaffLogs(): Promise<StaffActivityLog[]> {
  const res = await fetch('/api/staff/logs');
  if (!res.ok) throw new Error('Failed to fetch staff activity logs');
  return res.json();
}

export async function apiAddStaffLog(log: { operator_email: string; action: string; details: string }): Promise<{ success: boolean }> {
  const res = await fetch('/api/staff/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
  if (!res.ok) throw new Error('Failed to append activity log');
  return res.json();
}

// ============================================================================
// REAL-TIME FIRESTORE & CLOUDFLARE DASHBOARD SYNCHRONIZATION HELPERS
// ============================================================================

export function apiSubscribeToInvoicesRealtime(callback: (invoices: any[]) => void): () => void {
  const q = query(collection(db, 'client_invoices'));
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(invoices);
    }
  }).catch((err) => console.warn("Initial invoices fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(invoices);
    }
  }, (err) => console.warn("Invoices realtime subscription error:", err));
}

export async function apiSaveInvoiceRealtime(invoice: any): Promise<void> {
  const id = invoice.id || 'inv_' + Math.random().toString(36).substring(2, 9);
  const cleanObj = { ...invoice, id };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);
  
  try {
    await setDoc(doc(db, 'client_invoices', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error saving invoice to Firestore:", err);
  }
}

export async function apiUpdateInvoiceRealtime(id: string, updates: any): Promise<void> {
  const cleanObj = { ...updates };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);
  
  try {
    await updateDoc(doc(db, 'client_invoices', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error updating invoice in Firestore:", err);
  }
}

export function apiSubscribeToTicketsRealtime(callback: (tickets: any[]) => void): () => void {
  const q = query(collection(db, 'support_tickets'));
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tickets);
    }
  }).catch((err) => console.warn("Initial tickets fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tickets);
    }
  }, (err) => console.warn("Tickets realtime subscription error:", err));
}

export async function apiSaveTicketRealtime(ticket: any): Promise<void> {
  const id = ticket.id || 'tkt_' + Math.random().toString(36).substring(2, 9);
  const cleanObj = { ...ticket, id };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);

  try {
    await setDoc(doc(db, 'support_tickets', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error saving support ticket to Firestore:", err);
  }
}

export async function apiUpdateTicketRealtime(id: string, updates: any): Promise<void> {
  const cleanObj = { ...updates };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);

  try {
    await updateDoc(doc(db, 'support_tickets', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error updating ticket in Firestore:", err);
  }
}

export async function apiSaveClientProjectRealtime(project: any): Promise<void> {
  const id = project.id || 'proj_' + Math.random().toString(36).substring(2, 9);
  const cleanObj = { ...project, id };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);

  try {
    await setDoc(doc(db, 'client_projects', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error saving client project to Firestore:", err);
  }
}

export async function apiUpdateClientProjectRealtime(id: string, updates: any): Promise<void> {
  const cleanObj = { ...updates };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);

  try {
    await updateDoc(doc(db, 'client_projects', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error updating client project in Firestore:", err);
  }
}

export function apiSubscribeToAnnouncementsRealtime(callback: (announcements: any[]) => void): () => void {
  const q = query(collection(db, 'announcements'));
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const anns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(anns);
    }
  }).catch((err) => console.warn("Initial announcements fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const anns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(anns);
    }
  }, (err) => console.warn("Announcements realtime subscription error:", err));
}

export async function apiSaveAnnouncementRealtime(ann: any): Promise<void> {
  const id = ann.id || 'ann_' + Math.random().toString(36).substring(2, 9);
  const cleanObj = { ...ann, id };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);

  try {
    await setDoc(doc(db, 'announcements', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error saving announcement to Firestore:", err);
  }
}

export function apiSubscribeToStaffDocsRealtime(callback: (docs: any[]) => void): () => void {
  const q = query(collection(db, 'staff_docs'));
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const docsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(docsList);
    }
  }).catch((err) => console.warn("Initial staff docs fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const docsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(docsList);
    }
  }, (err) => console.warn("Staff docs realtime subscription error:", err));
}

export async function apiSaveStaffDocRealtime(docItem: any): Promise<void> {
  const id = docItem.id || 'doc_' + Math.random().toString(36).substring(2, 9);
  const cleanObj = { ...docItem, id };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);

  try {
    await setDoc(doc(db, 'staff_docs', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error saving staff doc to Firestore:", err);
  }
}

export function apiSubscribeToStaffMembersRealtime(callback: (staffList: any[]) => void): () => void {
  const q = query(collection(db, 'staff'));
  getDocs(q).then((snapshot) => {
    if (!snapshot.empty) {
      const staffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(staffList);
    }
  }).catch((err) => console.warn("Initial staff fetch warning:", err));

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const staffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(staffList);
    }
  }, (err) => console.warn("Staff members subscription error:", err));
}

export async function apiSaveStaffMemberRealtime(staff: any): Promise<void> {
  const id = staff.id || staff.uid || 'staff_' + Math.random().toString(36).substring(2, 9);
  const cleanObj = { ...staff, id };
  Object.keys(cleanObj).forEach(k => cleanObj[k] === undefined && delete cleanObj[k]);

  try {
    await setDoc(doc(db, 'staff', id), cleanObj);
    window.dispatchEvent(new Event('dstech_content_updated'));
  } catch (err) {
    console.error("Error saving staff member to Firestore:", err);
  }
}

export async function verifyImageUrlAccessible(urlOrKey: string | null | undefined): Promise<boolean> {
  if (!urlOrKey) return false;
  const resolved = resolveImageUrl(urlOrKey);
  if (!resolved) return false;
  if (resolved.startsWith('data:')) return true;
  try {
    const res = await fetch(resolved, { method: 'HEAD' });
    if (res.ok || res.status === 200 || res.status === 206 || res.status === 304) {
      return true;
    }
    const getRes = await fetch(resolved, { method: 'GET', headers: { Range: 'bytes=0-100' } });
    return getRes.ok;
  } catch (err) {
    console.warn("HEAD/GET accessibility check warning for:", resolved, err);
    return resolved.startsWith('/api/') || resolved.startsWith('http');
  }
}




