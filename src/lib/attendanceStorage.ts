/**
 * DS TECH - Staff Attendance Persistence & Storage Layer
 * Handles local profile retention, draft recovery, and persistent recording to backend / Firestore
 */

import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  StaffProfile, 
  ResumptionReport, 
  ClosingReport,
  OFFICIAL_MANAGEMENT_PHONE,
  OFFICIAL_RECIPIENT_TITLE,
  getLagosDateFormatted,
  getLagosTimeFormatted
} from './attendanceUtils';

const STORAGE_KEYS = {
  PROFILE: 'dst_staff_profile',
  RESUMPTION_DRAFT: 'dst_resumption_draft',
  CLOSING_DRAFT: 'dst_closing_draft',
  SUBMISSIONS_HISTORY: 'dst_attendance_history'
};

export interface AttendanceSubmissionRecord {
  id: string;
  type: 'resumption' | 'closing';
  fullName: string;
  position: string;
  department: string;
  dateStr: string;
  recordedTimeStr: string;
  submittedAtIso: string;
  syncedToBackend: boolean;
  syncedToFirestore: boolean;
  data: ResumptionReport | ClosingReport;
}

// 1. Profile Storage
export function loadSavedStaffProfile(): StaffProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.fullName === 'string') {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load saved staff profile:', err);
  }
  return null;
}

export function saveStaffProfile(profile: StaffProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to persist staff profile:', err);
  }
}

export function clearStaffProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  } catch (err) {}
}

// 2. Draft Storage
export function loadResumptionDraft(): Partial<ResumptionReport> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUMPTION_DRAFT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveResumptionDraft(draft: Partial<ResumptionReport>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESUMPTION_DRAFT, JSON.stringify(draft));
  } catch {}
}

export function clearResumptionDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RESUMPTION_DRAFT);
  } catch {}
}

export function loadClosingDraft(): Partial<ClosingReport> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLOSING_DRAFT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveClosingDraft(draft: Partial<ClosingReport>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLOSING_DRAFT, JSON.stringify(draft));
  } catch {}
}

export function clearClosingDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CLOSING_DRAFT);
  } catch {}
}

// 3. History of submissions
export function loadAttendanceSubmissionsHistory(): AttendanceSubmissionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function appendSubmissionHistory(record: AttendanceSubmissionRecord): void {
  try {
    const existing = loadAttendanceSubmissionsHistory();
    const updated = [record, ...existing.filter(r => r.id !== record.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS_HISTORY, JSON.stringify(updated));
  } catch {}
}

// 4. Record to Persistent Backend & Firestore
export async function persistAttendanceRecord(
  type: 'resumption' | 'closing',
  report: ResumptionReport | ClosingReport
): Promise<{ success: boolean; backendSynced: boolean; firestoreSynced: boolean; recordId: string }> {
  let backendSynced = false;
  let firestoreSynced = false;
  const recordId = report.id || `DST-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const payload = {
    ...report,
    id: recordId,
    reportType: type,
    submittedAtIso: nowIso,
    serverReceivedAtIso: nowIso
  };

  // 1. Try sending to backend API (/api/attendance)
  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      backendSynced = true;
    }
  } catch (e) {
    // Non-blocking for offline / edge mode
    console.info('Backend attendance API call staging notice:', e);
  }

  // 2. Try persisting to Firestore (collection: staff_attendance_reports)
  try {
    if (db) {
      const colRef = collection(db, 'staff_attendance_reports');
      await addDoc(colRef, {
        ...payload,
        createdAt: nowIso
      });
      firestoreSynced = true;
    }
  } catch (firestoreErr) {
    console.info('Firestore attendance synchronization note:', firestoreErr);
  }

  // 3. Always log to local device submission history
  appendSubmissionHistory({
    id: recordId,
    type,
    fullName: report.fullName,
    position: report.position,
    department: report.department,
    dateStr: report.dateStr,
    recordedTimeStr: report.recordedTimeStr,
    submittedAtIso: nowIso,
    syncedToBackend: backendSynced,
    syncedToFirestore: firestoreSynced,
    data: report
  });

  return {
    success: true,
    backendSynced,
    firestoreSynced,
    recordId
  };
}
