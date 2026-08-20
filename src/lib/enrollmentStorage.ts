import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { AcademyEnrollment, PendingEnrollmentIntent } from '../types/enrollment';

const ENROLLMENTS_STORAGE_KEY = 'dstech_academy_enrollments';
const PENDING_INTENT_KEY = 'dstech_pending_enrollment_intent';
const COLLECTION_NAME = 'enrollments';

// Helper to generate Enrollment Reference ID
export function generateEnrollmentId(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `DSTA-ENR/2026/${randomSixDigits}`;
}

// Intent preservation helpers
export function savePendingEnrollmentIntent(intent: PendingEnrollmentIntent): void {
  try {
    localStorage.setItem(PENDING_INTENT_KEY, JSON.stringify(intent));
  } catch (e) {
    console.error('Failed to save pending enrollment intent', e);
  }
}

export function getPendingEnrollmentIntent(): PendingEnrollmentIntent | null {
  try {
    const raw = localStorage.getItem(PENDING_INTENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearPendingEnrollmentIntent(): void {
  try {
    localStorage.removeItem(PENDING_INTENT_KEY);
  } catch (e) {}
}

// Local Storage Handlers
function getLocalEnrollments(): Record<string, AcademyEnrollment> {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalEnrollments(data: Record<string, AcademyEnrollment>): void {
  try {
    localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write enrollments to localStorage', e);
  }
}

// Save or Update Enrollment
export async function apiSaveEnrollment(
  enrollment: AcademyEnrollment
): Promise<AcademyEnrollment> {
  // Update local cache
  const localMap = getLocalEnrollments();
  localMap[enrollment.id] = enrollment;
  saveLocalEnrollments(localMap);

  try {
    const docId = enrollment.id.replace(/\//g, '_');
    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, {
      ...enrollment,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore write failed for enrollment, cached locally:', error);
  }

  return enrollment;
}

// Get student enrollments by Student ID or Email
export async function apiGetStudentEnrollments(
  studentIdOrEmail: string
): Promise<AcademyEnrollment[]> {
  const cleaned = studentIdOrEmail.trim().toLowerCase();
  const localMap = getLocalEnrollments();
  const localList = Object.values(localMap).filter(
    e => e.studentEmail.toLowerCase() === cleaned || e.studentId.toLowerCase() === cleaned
  );

  try {
    // Try Firestore query by email
    const qEmail = query(collection(db, COLLECTION_NAME), where('studentEmail', '==', studentIdOrEmail.trim()));
    const querySnap = await getDocs(qEmail);
    if (!querySnap.empty) {
      const serverList = querySnap.docs.map(d => d.data() as AcademyEnrollment);
      // Merge into local cache
      serverList.forEach(e => { localMap[e.id] = e; });
      saveLocalEnrollments(localMap);
      return serverList;
    }
  } catch (err) {
    console.warn('Firestore enrollments query error:', err);
  }

  return localList;
}

export const apiGetEnrollmentsByStudentEmail = apiGetStudentEnrollments;

