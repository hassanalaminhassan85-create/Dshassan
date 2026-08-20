import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { ACADEMY_COURSES, AcademyCourse } from './academyCoursesData';
import { AcademyEnrollment } from '../types/enrollment';
import { StudentRegistrationApplication } from '../types/studentRegistration';
import { TutorApplication } from '../types/tutorRegistration';
import { apiGetStudentRegistration } from './studentStorage';
import { apiGetTutorApplication } from './tutorStorage';

export interface StudentSession {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  program: string;
  courseCode: string;
  mode: string;
  cohort: string;
  attendanceRate: number;
  photoUrl?: string;
  isAuthenticated: boolean;
  loginMethod: 'google' | 'email' | 'student_id';
}

export interface TutorSession {
  id: string;
  tutorId: string;
  fullName: string;
  email: string;
  phone: string;
  expertise?: string;
  specialization?: string;
  qualification?: string;
  bio?: string;
  preferredMode?: string;
  status: 'active' | 'screening' | 'approved';
  assignedCourses: string[]; // course codes
  assignedCourseCodes?: string[];
  totalStudents?: number;
  rating?: number;
  photoUrl?: string;
  isAuthenticated: boolean;
  loginMethod: 'google' | 'email' | 'tutor_id' | 'faculty_id';
}

export interface CourseProgressRecord {
  id: string;
  studentEmail: string;
  courseCode: string;
  completedTopics: string[];
  completedModules: string[];
  currentModuleIndex: number;
  currentTopicIndex: number;
  quizScores: Record<string, { score: number; total: number; passed: boolean; completedAt: string }>;
  progressPercentage: number;
  lastAccessedAt: string;
  lastActivityDate?: string;
}

export interface StudentSubmission {
  id: string;
  studentEmail: string;
  studentName: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  moduleTitle: string;
  assignmentTitle: string;
  submissionText: string;
  gitHubUrl?: string;
  githubRepoUrl?: string;
  fileUrl?: string;
  deploymentUrl?: string;
  studentNotes?: string;
  grade?: 'A+' | 'A' | 'B' | 'C' | 'Resubmit' | string;
  score?: number;
  feedback?: string;
  tutorFeedback?: string;
  status: 'submitted' | 'graded';
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface AcademyPaymentRecord {
  id: string;
  reference: string;
  studentEmail: string;
  studentName: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  amount: number;
  paymentMethod: 'paystack' | 'bank_transfer' | 'scholarship';
  status: 'verified' | 'paid' | 'pending' | 'failed';
  paidAt: string;
  invoiceNumber: string;
  notes?: string;
}

export interface TutorPayoutRecord {
  id: string;
  reference: string;
  tutorEmail: string;
  tutorName: string;
  tutorId: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'processing' | 'approved';
  requestedAt: string;
  processedAt?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export type TutorPayoutRequest = TutorPayoutRecord;

export interface AcademyNotificationItem {
  id: string;
  recipientEmail: string;
  recipientRole: 'student' | 'tutor';
  title: string;
  message: string;
  category: 'enrollment' | 'payment' | 'academic' | 'announcement';
  type?: 'enrollment' | 'payment' | 'academic' | 'announcement' | 'all' | 'unread';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Local Storage Keys
const KEY_STUDENT_SESSION = 'dsta_active_student_session';
const KEY_TUTOR_SESSION = 'dsta_active_tutor_session';
const KEY_PROGRESS = 'dsta_course_progress_records';
const KEY_SUBMISSIONS = 'dsta_student_submissions';
const KEY_PAYMENTS = 'dsta_academy_payment_records';
const KEY_TUTOR_PAYOUTS = 'dsta_tutor_payout_records';
const KEY_NOTIFICATIONS = 'dsta_academy_notifications';
const KEY_FIRESTORE_COURSES_CACHE = 'dsta_firestore_courses_cache';

// -------------------------------------------------------------
// FIRESTORE COURSES MANAGEMENT & DATABASE FETCHING
// -------------------------------------------------------------

export async function apiFetchAcademyCoursesFromFirestore(): Promise<AcademyCourse[]> {
  try {
    const colRef = collection(db, 'academy_courses');
    const snapshot = await getDocs(colRef);
    
    if (!snapshot.empty) {
      const dbCourses: AcademyCourse[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as AcademyCourse;
        dbCourses.push({
          ...data,
          id: docSnap.id || data.id
        });
      });
      // Cache locally for instant offline rendering
      try {
        localStorage.setItem(KEY_FIRESTORE_COURSES_CACHE, JSON.stringify(dbCourses));
      } catch (e) {}
      return dbCourses;
    }
  } catch (err) {
    console.warn('Firestore courses fetch notice (using cache/fallback):', err);
  }

  // Check local cache
  try {
    const cached = localStorage.getItem(KEY_FIRESTORE_COURSES_CACHE);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  // Fallback to initial static ACADEMY_COURSES dataset (115 programs)
  return ACADEMY_COURSES;
}

export async function apiSeedAcademyCoursesToFirestore(): Promise<number> {
  try {
    let seededCount = 0;
    // Batch seed or individual document set
    for (const course of ACADEMY_COURSES.slice(0, 30)) { // Seed representative subset to Firestore
      const docRef = doc(db, 'academy_courses', course.id);
      await setDoc(docRef, course, { merge: true });
      seededCount++;
    }
    return seededCount;
  } catch (err) {
    console.error('Error seeding courses to Firestore:', err);
    return 0;
  }
}

// -------------------------------------------------------------
// STUDENT SESSION MANAGEMENT
// -------------------------------------------------------------

export function getActiveStudentSession(): StudentSession | null {
  try {
    const raw = localStorage.getItem(KEY_STUDENT_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveActiveStudentSession(session: StudentSession): void {
  try {
    localStorage.setItem(KEY_STUDENT_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save student session:', e);
  }
}

export function clearActiveStudentSession(): void {
  try {
    localStorage.removeItem(KEY_STUDENT_SESSION);
  } catch (e) {}
}

// -------------------------------------------------------------
// TUTOR SESSION MANAGEMENT
// -------------------------------------------------------------

export function getActiveTutorSession(): TutorSession | null {
  try {
    const raw = localStorage.getItem(KEY_TUTOR_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveActiveTutorSession(session: TutorSession): void {
  try {
    localStorage.setItem(KEY_TUTOR_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save tutor session:', e);
  }
}

export function clearActiveTutorSession(): void {
  try {
    localStorage.removeItem(KEY_TUTOR_SESSION);
  } catch (e) {}
}

// -------------------------------------------------------------
// COURSE PROGRESS MANAGEMENT
// -------------------------------------------------------------

function getLocalProgressMap(): Record<string, CourseProgressRecord> {
  try {
    const raw = localStorage.getItem(KEY_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalProgressMap(map: Record<string, CourseProgressRecord>): void {
  try {
    localStorage.setItem(KEY_PROGRESS, JSON.stringify(map));
  } catch (e) {}
}

export async function apiGetCourseProgress(
  studentEmail: string, 
  courseCode: string, 
  totalTopics?: number
): Promise<CourseProgressRecord> {
  const recordKey = `${studentEmail.toLowerCase().trim()}__${courseCode.trim().toUpperCase()}`;
  const localMap = getLocalProgressMap();

  if (localMap[recordKey]) {
    return localMap[recordKey];
  }

  // Create default initial progress
  const initial: CourseProgressRecord = {
    id: `prog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    studentEmail: studentEmail.toLowerCase().trim(),
    courseCode: courseCode.trim().toUpperCase(),
    completedTopics: [],
    completedModules: [],
    currentModuleIndex: 0,
    currentTopicIndex: 0,
    quizScores: {},
    progressPercentage: 0,
    lastAccessedAt: new Date().toISOString(),
    lastActivityDate: new Date().toISOString()
  };

  localMap[recordKey] = initial;
  saveLocalProgressMap(localMap);

  try {
    const docId = recordKey.replace(/[@\.\/]/g, '_');
    const docRef = doc(db, 'academy_progress', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const serverData = snap.data() as CourseProgressRecord;
      localMap[recordKey] = serverData;
      saveLocalProgressMap(localMap);
      return serverData;
    }
  } catch (e) {
    console.warn('Firestore progress fetch warning:', e);
  }

  return initial;
}

export async function apiSaveCourseProgress(progress: CourseProgressRecord): Promise<CourseProgressRecord> {
  const recordKey = `${progress.studentEmail.toLowerCase().trim()}__${progress.courseCode.trim().toUpperCase()}`;
  const localMap = getLocalProgressMap();
  progress.lastAccessedAt = new Date().toISOString();
  localMap[recordKey] = progress;
  saveLocalProgressMap(localMap);

  try {
    const docId = recordKey.replace(/[@\.\/]/g, '_');
    const docRef = doc(db, 'academy_progress', docId);
    await setDoc(docRef, progress, { merge: true });
  } catch (e) {
    console.warn('Firestore progress write warning:', e);
  }

  return progress;
}

export async function apiToggleTopicCompletion(
  studentEmail: string,
  courseCode: string,
  topicKey: string,
  totalTopicsInCourse: number
): Promise<CourseProgressRecord> {
  const current = await apiGetCourseProgress(studentEmail, courseCode);
  const exists = current.completedTopics.includes(topicKey);

  let newCompleted: string[];
  if (exists) {
    newCompleted = current.completedTopics.filter(t => t !== topicKey);
  } else {
    newCompleted = [...current.completedTopics, topicKey];
  }

  const calcPercentage = totalTopicsInCourse > 0 
    ? Math.min(100, Math.round((newCompleted.length / totalTopicsInCourse) * 100))
    : 0;

  const updated: CourseProgressRecord = {
    ...current,
    completedTopics: newCompleted,
    progressPercentage: calcPercentage,
    lastAccessedAt: new Date().toISOString()
  };

  return await apiSaveCourseProgress(updated);
}

// -------------------------------------------------------------
// SUBMISSIONS & GRADING MANAGEMENT
// -------------------------------------------------------------

function getLocalSubmissions(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(KEY_SUBMISSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Seed default initial submissions if empty
  const defaultSubmissions: StudentSubmission[] = [
    {
      id: 'sub_1',
      studentEmail: 'aisha.mohammed@student.dstech.agency',
      studentName: 'Aisha Bello Mohammed',
      studentId: 'DSTA-STU/2026/89421',
      courseCode: 'DSTA-SWE01',
      courseTitle: 'Full-Stack Software Engineering',
      moduleTitle: 'Module 2: React State Architecture & Modern Hooks',
      assignmentTitle: 'E-Commerce State Cart with Reducer Hook & Context',
      submissionText: 'Implemented full e-commerce shopping cart with persistent checkout and dynamic coupon voucher application. All TypeScript types strictly enforced.',
      gitHubUrl: 'https://github.com/aisha-mohammed/react-cart-capstone',
      grade: 'A+',
      score: 95,
      feedback: 'Excellent modular structure and clean state separation. Ready for enterprise production!',
      status: 'graded',
      submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      gradedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      gradedBy: 'David Alao (Lead Trainer)'
    },
    {
      id: 'sub_2',
      studentEmail: 'ibrahim.k@student.dstech.agency',
      studentName: 'Ibrahim Khalil',
      studentId: 'DSTA-STU/2026/78291',
      courseCode: 'DSTA-AI101',
      courseTitle: 'Artificial Intelligence (AI) for Business & Productivity',
      moduleTitle: 'Module 1: Prompt Engineering & Gemini Reasoning Models',
      assignmentTitle: 'Automated Customer Escalation Pipeline with Gemini API',
      submissionText: 'Constructed an automated triage agent using structured JSON output and sentiment scoring for enterprise inquiries.',
      gitHubUrl: 'https://github.com/ibrahimk/gemini-triage-agent',
      status: 'submitted',
      submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    }
  ];

  try {
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(defaultSubmissions));
  } catch (e) {}
  return defaultSubmissions;
}

function saveLocalSubmissions(subs: StudentSubmission[]): void {
  try {
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(subs));
  } catch (e) {}
}

export async function apiGetSubmissions(filter?: { studentEmail?: string; courseCode?: string }): Promise<StudentSubmission[]> {
  const localList = getLocalSubmissions();

  try {
    let q = collection(db, 'academy_submissions');
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const serverList = querySnap.docs.map(d => d.data() as StudentSubmission);
      // Merge with local
      const map = new Map<string, StudentSubmission>();
      localList.forEach(s => map.set(s.id, s));
      serverList.forEach(s => map.set(s.id, s));
      const combined = Array.from(map.values());
      saveLocalSubmissions(combined);
      
      let filtered = combined;
      if (filter?.studentEmail) {
        filtered = filtered.filter(s => s.studentEmail.toLowerCase() === filter.studentEmail!.toLowerCase());
      }
      if (filter?.courseCode) {
        filtered = filtered.filter(s => s.courseCode.toUpperCase() === filter.courseCode!.toUpperCase());
      }
      return filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
  } catch (e) {
    console.warn('Firestore submissions fetch warning:', e);
  }

  let filtered = localList;
  if (filter?.studentEmail) {
    filtered = filtered.filter(s => s.studentEmail.toLowerCase() === filter.studentEmail!.toLowerCase());
  }
  if (filter?.courseCode) {
    filtered = filtered.filter(s => s.courseCode.toUpperCase() === filter.courseCode!.toUpperCase());
  }
  return filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function apiSaveSubmission(sub: StudentSubmission): Promise<StudentSubmission> {
  const localList = getLocalSubmissions();
  const index = localList.findIndex(s => s.id === sub.id);
  if (index >= 0) {
    localList[index] = sub;
  } else {
    localList.unshift(sub);
  }
  saveLocalSubmissions(localList);

  try {
    const docRef = doc(db, 'academy_submissions', sub.id);
    await setDoc(docRef, sub, { merge: true });
  } catch (e) {
    console.warn('Firestore submission write warning:', e);
  }

  return sub;
}

export async function apiGradeSubmission(
  submissionId: string,
  grade: 'A+' | 'A' | 'B' | 'C' | 'Resubmit',
  score: number,
  feedback: string,
  tutorName: string
): Promise<StudentSubmission | null> {
  const localList = getLocalSubmissions();
  const sub = localList.find(s => s.id === submissionId);
  if (!sub) return null;

  sub.grade = grade;
  sub.score = score;
  sub.feedback = feedback;
  sub.status = 'graded';
  sub.gradedAt = new Date().toISOString();
  sub.gradedBy = tutorName;

  saveLocalSubmissions(localList);

  try {
    const docRef = doc(db, 'academy_submissions', sub.id);
    await setDoc(docRef, sub, { merge: true });
  } catch (e) {
    console.warn('Firestore grade write warning:', e);
  }

  // Create student notification
  await apiAddNotification({
    id: `notif_${Date.now()}`,
    recipientEmail: sub.studentEmail,
    recipientRole: 'student',
    title: `Assignment Graded: ${grade} (${score}%)`,
    message: `${tutorName} graded your submission for "${sub.assignmentTitle}". Feedback: "${feedback}"`,
    category: 'academic',
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: '#learning'
  });

  return sub;
}

// -------------------------------------------------------------
// PAYMENT RECORDS & PAYSTACK INTEGRATION
// -------------------------------------------------------------

function getLocalPaymentRecords(): AcademyPaymentRecord[] {
  try {
    const raw = localStorage.getItem(KEY_PAYMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Default seed payment records
  const defaultPayments: AcademyPaymentRecord[] = [
    {
      id: 'pay_rec_1',
      reference: 'DST_PAY_2026_984210',
      studentEmail: 'aisha.mohammed@student.dstech.agency',
      studentName: 'Aisha Bello Mohammed',
      studentId: 'DSTA-STU/2026/89421',
      courseCode: 'DSTA-SWE01',
      courseTitle: 'Full-Stack Software Engineering',
      amount: 75000,
      paymentMethod: 'paystack',
      status: 'verified',
      paidAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      invoiceNumber: 'INV/DSTA/2026/0491',
      notes: '70% Initial Tuition Deposit verified via Paystack Central Clearing.'
    }
  ];

  try {
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(defaultPayments));
  } catch (e) {}
  return defaultPayments;
}

function saveLocalPaymentRecords(records: AcademyPaymentRecord[]): void {
  try {
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(records));
  } catch (e) {}
}

export async function apiGetPaymentRecords(studentEmail?: string): Promise<AcademyPaymentRecord[]> {
  const localList = getLocalPaymentRecords();

  try {
    const q = collection(db, 'academy_payments');
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const serverList = querySnap.docs.map(d => d.data() as AcademyPaymentRecord);
      const map = new Map<string, AcademyPaymentRecord>();
      localList.forEach(p => map.set(p.id, p));
      serverList.forEach(p => map.set(p.id, p));
      const combined = Array.from(map.values());
      saveLocalPaymentRecords(combined);

      let filtered = combined;
      if (studentEmail) {
        filtered = filtered.filter(p => p.studentEmail.toLowerCase() === studentEmail.toLowerCase());
      }
      return filtered.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    }
  } catch (e) {
    console.warn('Firestore payment records fetch warning:', e);
  }

  let filtered = localList;
  if (studentEmail) {
    filtered = filtered.filter(p => p.studentEmail.toLowerCase() === studentEmail.toLowerCase());
  }
  return filtered.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
}

export async function apiRecordVerifiedPayment(payment: AcademyPaymentRecord): Promise<AcademyPaymentRecord> {
  const localList = getLocalPaymentRecords();
  localList.unshift(payment);
  saveLocalPaymentRecords(localList);

  try {
    const docRef = doc(db, 'academy_payments', payment.id);
    await setDoc(docRef, payment, { merge: true });
  } catch (e) {
    console.warn('Firestore payment record write warning:', e);
  }

  // Create notification for student
  await apiAddNotification({
    id: `notif_${Date.now()}`,
    recipientEmail: payment.studentEmail,
    recipientRole: 'student',
    title: 'Payment Confirmed & Verified',
    message: `Your payment of ₦${payment.amount.toLocaleString()} for ${payment.courseTitle} (Ref: ${payment.reference}) has been securely verified.`,
    category: 'payment',
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: '#payments'
  });

  return payment;
}

// -------------------------------------------------------------
// TUTOR PAYOUT & HONORARIUM MANAGEMENT
// -------------------------------------------------------------

function getLocalTutorPayouts(): TutorPayoutRecord[] {
  try {
    const raw = localStorage.getItem(KEY_TUTOR_PAYOUTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaultPayouts: TutorPayoutRecord[] = [
    {
      id: 'payout_1',
      reference: 'DST_PAYOUT_2026_09182',
      tutorEmail: 'david@dstech.agency',
      tutorName: 'David Alao',
      tutorId: 'DSTA-TUTOR/2026/109281',
      amount: 180000,
      description: 'Cohort 2026-A Milestone 1 Teaching Honorarium (Full-Stack & AI Tracks)',
      status: 'paid',
      requestedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0129384756'
    }
  ];

  try {
    localStorage.setItem(KEY_TUTOR_PAYOUTS, JSON.stringify(defaultPayouts));
  } catch (e) {}
  return defaultPayouts;
}

function saveLocalTutorPayouts(payouts: TutorPayoutRecord[]): void {
  try {
    localStorage.setItem(KEY_TUTOR_PAYOUTS, JSON.stringify(payouts));
  } catch (e) {}
}

export async function apiGetTutorPayouts(tutorEmail?: string): Promise<TutorPayoutRecord[]> {
  const localList = getLocalTutorPayouts();
  if (tutorEmail) {
    return localList.filter(p => p.tutorEmail.toLowerCase() === tutorEmail.toLowerCase());
  }
  return localList;
}

export async function apiRequestTutorPayout(payout: TutorPayoutRecord): Promise<TutorPayoutRecord> {
  const localList = getLocalTutorPayouts();
  localList.unshift(payout);
  saveLocalTutorPayouts(localList);

  await apiAddNotification({
    id: `notif_${Date.now()}`,
    recipientEmail: payout.tutorEmail,
    recipientRole: 'tutor',
    title: 'Payout Request Submitted',
    message: `Your honorarium disbursement request for ₦${payout.amount.toLocaleString()} is currently being processed by Academy Bursary.`,
    category: 'payment',
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: '#payments'
  });

  return payout;
}

// -------------------------------------------------------------
// NOTIFICATIONS MANAGEMENT
// -------------------------------------------------------------

function getLocalNotifications(): AcademyNotificationItem[] {
  try {
    const raw = localStorage.getItem(KEY_NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaultNotifs: AcademyNotificationItem[] = [
    {
      id: 'notif_init_1',
      recipientEmail: 'aisha.mohammed@student.dstech.agency',
      recipientRole: 'student',
      title: 'Tuition Deposit Verified',
      message: 'Your 70% tuition payment of ₦75,000 for Full-Stack Software Engineering is confirmed by the Academy Bursary.',
      category: 'payment',
      read: false,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      actionUrl: '#payments'
    },
    {
      id: 'notif_init_2',
      recipientEmail: 'aisha.mohammed@student.dstech.agency',
      recipientRole: 'student',
      title: 'Module 3 Materials Released',
      message: 'New practical lab guide on React Query & Server Actions is now accessible in the Learning Workspace.',
      category: 'academic',
      read: false,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      actionUrl: '#learning'
    },
    {
      id: 'notif_init_3',
      recipientEmail: 'david@dstech.agency',
      recipientRole: 'tutor',
      title: 'New Student Submission to Grade',
      message: 'Ibrahim Khalil submitted an assignment for "Module 1: Prompt Engineering" in AI for Business.',
      category: 'academic',
      read: false,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      actionUrl: '#assignments'
    },
    {
      id: 'notif_init_4',
      recipientEmail: 'david@dstech.agency',
      recipientRole: 'tutor',
      title: 'Faculty Curriculum Meeting',
      message: 'Monthly Q2 Academic Faculty review scheduled for this Friday at 4:00 PM WAT.',
      category: 'announcement',
      read: true,
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      actionUrl: '#overview'
    }
  ];

  try {
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(defaultNotifs));
  } catch (e) {}
  return defaultNotifs;
}

function saveLocalNotifications(notifs: AcademyNotificationItem[]): void {
  try {
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {}
}

export async function apiGetNotifications(recipientEmail: string, recipientRole: 'student' | 'tutor'): Promise<AcademyNotificationItem[]> {
  const localList = getLocalNotifications();
  const cleaned = recipientEmail.toLowerCase().trim();

  // Return notifications for this specific recipient or general broadcast
  return localList
    .filter(n => n.recipientRole === recipientRole && (n.recipientEmail.toLowerCase() === cleaned || n.recipientEmail === 'all'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function apiAddNotification(notif: AcademyNotificationItem): Promise<AcademyNotificationItem> {
  const localList = getLocalNotifications();
  localList.unshift(notif);
  saveLocalNotifications(localList);
  return notif;
}

export async function apiMarkNotificationRead(emailOrId: string, maybeId?: string): Promise<AcademyNotificationItem[]> {
  const localList = getLocalNotifications();
  const idToMark = maybeId || emailOrId;
  const targetEmail = maybeId ? emailOrId : undefined;

  const found = localList.find(n => n.id === idToMark);
  if (found) {
    found.read = true;
    saveLocalNotifications(localList);
  }

  if (targetEmail) {
    return await apiGetNotificationsForUser(targetEmail);
  }
  return localList;
}

export async function apiMarkAllNotificationsRead(recipientEmail: string, role?: 'student' | 'tutor'): Promise<AcademyNotificationItem[]> {
  const localList = getLocalNotifications();
  const cleaned = recipientEmail.toLowerCase().trim();
  localList.forEach(n => {
    if ((!role || n.recipientRole === role) && (n.recipientEmail.toLowerCase() === cleaned || n.recipientEmail === 'all')) {
      n.read = true;
    }
  });
  saveLocalNotifications(localList);
  return await apiGetNotificationsForUser(recipientEmail);
}

export const clearTutorSession = clearActiveTutorSession;
export const clearStudentSession = clearActiveStudentSession;
export const apiGetPaymentsForUser = apiGetPaymentRecords;

export async function apiGetSubmissionsForCourse(courseCode: string): Promise<StudentSubmission[]> {
  return await apiGetSubmissions({ courseCode });
}

export async function apiGetSubmissionsForUser(studentEmail: string): Promise<StudentSubmission[]> {
  return await apiGetSubmissions({ studentEmail });
}

export async function apiCreateTutorPayout(
  tutorId: string,
  tutorEmail: string,
  tutorName: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountName: string
): Promise<TutorPayoutRecord> {
  const newPayout: TutorPayoutRecord = {
    id: `PAYOUT-${Math.floor(100000 + Math.random() * 900000)}`,
    reference: `DST-FAC-${Date.now().toString(36).toUpperCase()}`,
    tutorId,
    tutorEmail,
    tutorName,
    amount,
    description: `Faculty honorarium disbursement for teaching contact hours and capstone review`,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    bankName,
    accountNumber,
    accountName
  };
  return await apiRequestTutorPayout(newPayout);
}

export async function apiGetNotificationsForUser(recipientEmail: string): Promise<AcademyNotificationItem[]> {
  const localList = getLocalNotifications();
  const cleaned = recipientEmail.toLowerCase().trim();
  return localList
    .filter(n => n.recipientEmail.toLowerCase() === cleaned || n.recipientEmail === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


