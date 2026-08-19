import { collection, getDocs, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { TutorApplication } from '../types/tutorRegistration';

const STORAGE_KEY = 'dstech_tutor_applications';
const COLLECTION_NAME = 'tutor_applications';

// Helper to generate DSTA Tutor Application ID
export function generateTutorAppId(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `DSTA-TUTOR/2026/${randomSixDigits}`;
}

// Local Storage Handlers
function getLocalTutorApplications(): Record<string, TutorApplication> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalTutorApplications(data: Record<string, TutorApplication>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write tutor application to localStorage', e);
  }
}

// Save or Update Tutor Application
export async function apiSaveTutorApplication(
  app: TutorApplication
): Promise<TutorApplication> {
  // Update local cache immediately
  const localMap = getLocalTutorApplications();
  localMap[app.id] = app;
  saveLocalTutorApplications(localMap);

  try {
    const docRef = doc(db, COLLECTION_NAME, app.id.replace(/[\/\-]/g, '_'));
    await setDoc(docRef, {
      ...app,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore write failed for tutor application, cached locally:', error);
  }

  return app;
}

// Retrieve Tutor Application by ID or Email
export async function apiGetTutorApplication(
  idOrEmail: string
): Promise<TutorApplication | null> {
  const cleaned = idOrEmail.trim();
  const localMap = getLocalTutorApplications();

  // Search local map first
  if (localMap[cleaned]) {
    return localMap[cleaned];
  }
  for (const item of Object.values(localMap)) {
    if (item.emailAddress.toLowerCase() === cleaned.toLowerCase() || item.id.toLowerCase() === cleaned.toLowerCase()) {
      return item;
    }
  }

  // Attempt Firestore fetch
  try {
    const docRef = doc(db, COLLECTION_NAME, cleaned.replace(/[\/\-]/g, '_'));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as TutorApplication;
    }

    // Query by email
    const q = query(collection(db, COLLECTION_NAME), where('emailAddress', '==', cleaned));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as TutorApplication;
    }
  } catch (error) {
    console.warn('Firestore query failed for tutor application:', error);
  }

  return null;
}
