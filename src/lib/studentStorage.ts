import { collection, getDocs, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { StudentRegistrationApplication } from '../types/studentRegistration';

const STORAGE_KEY = 'dstech_student_registrations';
const COLLECTION_NAME = 'student_registrations';

// Helper to generate DSTA Application ID
export function generateStudentAppId(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `DSTA/2026/${randomSixDigits}`;
}

// Local Storage Handlers
function getLocalRegistrations(): Record<string, StudentRegistrationApplication> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalRegistrations(data: Record<string, StudentRegistrationApplication>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write student registration to localStorage', e);
  }
}

// Save or Update Registration
export async function apiSaveStudentRegistration(
  reg: StudentRegistrationApplication
): Promise<StudentRegistrationApplication> {
  // Update local cache immediately
  const localMap = getLocalRegistrations();
  localMap[reg.id] = reg;
  saveLocalRegistrations(localMap);

  try {
    const docRef = doc(db, COLLECTION_NAME, reg.id.replace(/\//g, '_'));
    await setDoc(docRef, {
      ...reg,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore write failed for student registration, cached locally:', error);
  }

  return reg;
}

// Retrieve Registration by ID or Email
export async function apiGetStudentRegistration(
  idOrEmail: string
): Promise<StudentRegistrationApplication | null> {
  const cleaned = idOrEmail.trim();
  const localMap = getLocalRegistrations();

  // Check local by exact ID or email
  if (localMap[cleaned]) return localMap[cleaned];
  const localFound = Object.values(localMap).find(
    r => r.emailAddress.toLowerCase() === cleaned.toLowerCase() || r.id.toLowerCase() === cleaned.toLowerCase()
  );
  if (localFound) return localFound;

  // Query Firestore
  try {
    // Try direct ID lookup
    const docId = cleaned.replace(/\//g, '_');
    const docRef = doc(db, COLLECTION_NAME, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StudentRegistrationApplication;
      localMap[data.id] = data;
      saveLocalRegistrations(localMap);
      return data;
    }

    // Try email lookup
    const q = query(collection(db, COLLECTION_NAME), where('emailAddress', '==', cleaned));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const data = querySnap.docs[0].data() as StudentRegistrationApplication;
      localMap[data.id] = data;
      saveLocalRegistrations(localMap);
      return data;
    }
  } catch (error) {
    console.warn('Firestore lookup failed:', error);
  }

  return null;
}
