import { 
  CourseRegistrationRecord, 
  ProgrammeType, 
  TeachingLanguage, 
  CourseSelectionItem 
} from '../types/courseRegistration';
import { CONTACT_DETAILS } from './academyCoursesData';

const STORAGE_KEY = 'dstech_course_registrations_cache';

// Official WhatsApp number
export const ACADEMY_WHATSAPP_NUMBER = '2349023489111'; // derived from CONTACT_DETAILS.whatsapp: +234 902 348 9111

// Official Admissions & Registrations Email
export const OFFICIAL_ADMISSIONS_EMAIL = 'dstechanddigitalmarketingltd@gmail.com';

export function generateCourseRegId(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `DSTA-CR/2026/${randomSixDigits}`;
}

// Extract and normalize Programme Types with 100% backward compatibility
export function getProgrammeTypes(reg: Partial<CourseRegistrationRecord>): ProgrammeType[] {
  if (Array.isArray(reg.programmeTypes) && reg.programmeTypes.length > 0) {
    return reg.programmeTypes;
  }
  if (reg.programmeType) {
    const pt = reg.programmeType.toString();
    const result: ProgrammeType[] = [];
    if (pt.includes('Scholarship')) result.push('Scholarship');
    if (pt.includes('Paid')) result.push('Paid Programme');
    if (result.length > 0) return result;
  }
  return ['Scholarship'];
}

export function formatProgrammeTypes(reg: Partial<CourseRegistrationRecord>): string {
  const types = getProgrammeTypes(reg);
  if (types.length === 2) {
    return 'Scholarship & Paid Programme';
  }
  return types.join(', ') || reg.programmeType || 'Scholarship';
}

// Extract and normalize Teaching Languages with 100% backward compatibility
export function getTeachingLanguages(reg: Partial<CourseRegistrationRecord>): TeachingLanguage[] {
  if (Array.isArray(reg.teachingLanguages) && reg.teachingLanguages.length > 0) {
    return reg.teachingLanguages;
  }
  if (reg.teachingLanguage) {
    const raw = reg.teachingLanguage.toString();
    const allKnown: TeachingLanguage[] = ['English', 'Hausa', 'Yoruba', 'Igbo'];
    const matched = allKnown.filter(lang => raw.includes(lang));
    if (matched.length > 0) return matched;
  }
  return ['English'];
}

export function formatTeachingLanguages(reg: Partial<CourseRegistrationRecord>): string {
  const langs = getTeachingLanguages(reg);
  return langs.join(', ') || reg.teachingLanguage || 'English';
}

// Get course-level learning mode with fallback to global mode
export function getCourseLearningMode(course?: CourseSelectionItem, defaultMode?: string): string {
  if (!course) return defaultMode || 'Virtual Classes';
  return course.learningMode || course.trainingMode || defaultMode || 'Virtual Classes';
}

// Local Storage Cache
function getLocalCache(): Record<string, CourseRegistrationRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setLocalCache(data: Record<string, CourseRegistrationRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to cache course registration:', e);
  }
}

// Save Course Registration to Edge API, Firestore Database, and Local Cache
export async function apiSaveCourseRegistration(
  reg: CourseRegistrationRecord
): Promise<CourseRegistrationRecord> {
  const pTypes = Array.isArray(reg.programmeTypes) && reg.programmeTypes.length > 0
    ? reg.programmeTypes
    : getProgrammeTypes(reg);
  const tLangs = Array.isArray(reg.teachingLanguages) && reg.teachingLanguages.length > 0
    ? reg.teachingLanguages
    : getTeachingLanguages(reg);

  const normalizedRecord: CourseRegistrationRecord = {
    ...reg,
    programmeTypes: pTypes,
    teachingLanguages: tLangs,
    programmeType: formatProgrammeTypes(reg),
    teachingLanguage: formatTeachingLanguages(reg),
  };

  // Always update local cache first
  const cache = getLocalCache();
  cache[normalizedRecord.registrationId] = normalizedRecord;
  setLocalCache(cache);

  // Sync to Firestore database directly for resilient cloud storage
  try {
    const { db } = await import('./firebase');
    const { doc, setDoc } = await import('firebase/firestore');
    if (db) {
      await setDoc(doc(db, 'course_registrations', normalizedRecord.registrationId), {
        ...normalizedRecord,
        programmeTypes: pTypes,
        teachingLanguages: tLangs,
      }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Direct Firestore synchronization fallback note:', fsErr);
  }

  try {
    const res = await fetch('/api/academy/course-registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedRecord),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.record) {
        cache[data.record.registrationId] = data.record;
        setLocalCache(cache);
        return data.record;
      }
    }
  } catch (err) {
    console.warn('Network sync for course registration deferred, cached locally:', err);
  }

  return normalizedRecord;
}

// Generate the WhatsApp formatted message containing ALL details filled by the applicant
export function formatCourseRegistrationWhatsAppMessage(reg: CourseRegistrationRecord): string {
  const c1 = reg.course1;
  const c2 = reg.course2;
  const c3 = reg.course3;

  const hasC2 = c2 && Boolean(c2.courseName?.trim() || c2.lecturer?.trim() || c2.weeklyLectureDays?.trim() || c2.lectureTime?.trim());
  const hasC3 = c3 && Boolean(c3.courseName?.trim() || c3.lecturer?.trim() || c3.weeklyLectureDays?.trim() || c3.lectureTime?.trim());

  const progTypesStr = formatProgrammeTypes(reg);
  const teachLangsStr = formatTeachingLanguages(reg);

  const c1Mode = getCourseLearningMode(c1, reg.trainingMode);
  const c2Mode = getCourseLearningMode(c2, reg.trainingMode);
  const c3Mode = getCourseLearningMode(c3, reg.trainingMode);

  let amountDisplay = 'Non-Applicable (Scholarship/Waiver)';
  if (!reg.paymentIsNA && reg.amountPaid !== undefined && reg.amountPaid !== '') {
    const num = Number(reg.amountPaid);
    amountDisplay = isNaN(num) ? `₦${reg.amountPaid}` : `₦${num.toLocaleString()}`;
  }

  const paymentStatusDisplay = reg.paymentIsNA 
    ? 'Non-Applicable (Waiver/Scholarship)' 
    : `Self-Reported (${amountDisplay} - Awaiting Audit Verification)`;

  const formattedDate = reg.createdAt 
    ? new Date(reg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return `*DS TECH ACADEMY — OFFICIAL COURSE REGISTRATION DOCKET*
*DS TECH & DIGITAL MARKETING AGENCY LTD*
CAC RC 9550925

--------------------------------------------
*REGISTRATION DOCKET SUMMARY*
• *Docket ID:* ${reg.registrationId}
• *Date Registered:* ${formattedDate}
• *Verification Status:* Authenticated & Registered

*1. APPLICANT PERSONAL DETAILS*
• *Full Name:* ${reg.fullName || 'N/A'}
• *Email Address:* ${reg.emailAddress || 'N/A'}
• *WhatsApp Number:* ${reg.whatsappNumber || 'N/A'}
• *Alternative Phone:* ${reg.alternativePhone && reg.alternativePhone.trim() ? reg.alternativePhone.trim() : 'None Provided'}
• *Sex / Gender:* ${reg.sex || 'N/A'}
• *Nationality:* ${reg.nationality || 'Nigerian'}
• *State of Origin:* ${reg.stateOfOrigin || 'N/A'}
• *LGA of Origin:* ${reg.lga || 'N/A'}
• *Tribe / Ethnic Group:* ${reg.ethnicGroup || 'N/A'}

*2. PROGRAMME & ACADEMIC ENROLMENT*
• *Programme Type:* ${progTypesStr}
• *Programme Duration:* ${reg.programmeDuration || 'Standard'}
• *Preferred Teaching Language(s):* ${teachLangsStr}
• *Global Delivery Preference:* ${reg.trainingMode || 'Configured Per-Course'}

*3. ENROLLED COURSES & PER-COURSE SCHEDULES*
• *Primary Course (Course 1):* ${c1?.courseName || 'Pending'}
  ▫ *Learning Mode:* ${c1Mode}
  ▫ *Lecturer:* ${c1?.lecturer || 'Academy Directorate Faculty'}
  ▫ *Lecture Days:* ${c1?.weeklyLectureDays || 'As Scheduled'}
  ▫ *Lecture Time:* ${c1?.lectureTime || 'TBA'}
${hasC2 ? `
• *Elective Course (Course 2):* ${c2?.courseName || 'N/A'}
  ▫ *Learning Mode:* ${c2Mode}
  ▫ *Lecturer:* ${c2?.lecturer || 'Faculty'}
  ▫ *Lecture Days:* ${c2?.weeklyLectureDays || 'N/A'}
  ▫ *Lecture Time:* ${c2?.lectureTime || 'N/A'}` : ''}${hasC3 ? `
• *Elective Course (Course 3):* ${c3?.courseName || 'N/A'}
  ▫ *Learning Mode:* ${c3Mode}
  ▫ *Lecturer:* ${c3?.lecturer || 'Faculty'}
  ▫ *Lecture Days:* ${c3?.weeklyLectureDays || 'N/A'}
  ▫ *Lecture Time:* ${c3?.lectureTime || 'N/A'}` : ''}

*4. FINANCIAL & PAYMENT AUDIT RECORD*
• *Amount Paid:* ${amountDisplay}
• *Payment Audit:* ${paymentStatusDisplay}

*5. APPLICANT DECLARATION*
• *Status:* Confirmed true and accurate by applicant.

--------------------------------------------
*DS TECH ACADEMY ADMISSIONS DESK*
🌐 https://dstech.ng | 📞 +234 902 348 9111
📧 ${OFFICIAL_ADMISSIONS_EMAIL}
[Official Course Registration Slip Image Included]`;
}

// Generate the WhatsApp web link
export function buildCourseRegistrationWhatsAppLink(reg: CourseRegistrationRecord): string {
  const fullMsg = formatCourseRegistrationWhatsAppMessage(reg);
  return `https://wa.me/${ACADEMY_WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMsg)}`;
}
