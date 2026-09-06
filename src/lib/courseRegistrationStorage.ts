import { CourseRegistrationRecord } from '../types/courseRegistration';
import { CONTACT_DETAILS } from './academyCoursesData';

const STORAGE_KEY = 'dstech_course_registrations_cache';

// Official WhatsApp number
export const ACADEMY_WHATSAPP_NUMBER = '2349023489111'; // derived from CONTACT_DETAILS.whatsapp: +234 902 348 9111

export function generateCourseRegId(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `DSTA-CR/2026/${randomSixDigits}`;
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

// Save Course Registration to Edge API + Local Cache
export async function apiSaveCourseRegistration(
  reg: CourseRegistrationRecord
): Promise<CourseRegistrationRecord> {
  // Always update local cache first
  const cache = getLocalCache();
  cache[reg.registrationId] = reg;
  setLocalCache(cache);

  try {
    const res = await fetch('/api/academy/course-registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reg),
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

  return reg;
}

// Generate the WhatsApp formatted message
export function formatCourseRegistrationWhatsAppMessage(reg: CourseRegistrationRecord): string {
  const c1 = reg.course1;
  const c2 = reg.course2;
  const c3 = reg.course3;

  const hasC2 = c2 && (c2.courseName.trim() || c2.lecturer.trim() || c2.weeklyLectureDays.trim() || c2.lectureTime.trim());
  const hasC3 = c3 && (c3.courseName.trim() || c3.lecturer.trim() || c3.weeklyLectureDays.trim() || c3.lectureTime.trim());

  let amountDisplay = 'Non-Applicable';
  if (!reg.paymentIsNA && reg.amountPaid !== undefined && reg.amountPaid !== '') {
    const num = Number(reg.amountPaid);
    amountDisplay = isNaN(num) ? `₦${reg.amountPaid}` : `₦${num.toLocaleString()}`;
  }

  const paymentStatus = reg.paymentIsNA 
    ? 'Non-Applicable' 
    : `Self-Reported Record (${amountDisplay} - Awaiting Administrative Verification)`;

  return `DS TECH ACADEMY
COURSE REGISTRATION
Ref: ${reg.registrationId}

APPLICANT INFORMATION

Full Name: ${reg.fullName}
Nationality: ${reg.nationality || 'Nigerian'}
State of Origin: ${reg.stateOfOrigin}
LGA: ${reg.lga}
Tribe/Ethnic Group: ${reg.ethnicGroup}
Sex: ${reg.sex}
Email: ${reg.emailAddress}
WhatsApp Number: ${reg.whatsappNumber}
Alternative Phone: ${reg.alternativePhone && reg.alternativePhone.trim() ? reg.alternativePhone.trim() : 'None'}

PROGRAMME INFORMATION

Programme Type: ${reg.programmeType}
Programme Duration: ${reg.programmeDuration}
Training Mode: ${reg.trainingMode}
Teaching Language: ${reg.teachingLanguage}

COURSE 1
Course: ${c1.courseName || 'Pending'}
Lecturer: ${c1.lecturer || 'Pending'}
Weekly Lecture Days: ${c1.weeklyLectureDays || 'Pending'}
Lecture Time: ${c1.lectureTime || 'Pending'}

COURSE 2
Course: ${hasC2 && c2?.courseName ? c2.courseName : 'N/A'}
Lecturer: ${hasC2 && c2?.lecturer ? c2.lecturer : 'N/A'}
Weekly Lecture Days: ${hasC2 && c2?.weeklyLectureDays ? c2.weeklyLectureDays : 'N/A'}
Lecture Time: ${hasC2 && c2?.lectureTime ? c2.lectureTime : 'N/A'}

COURSE 3
Course: ${hasC3 && c3?.courseName ? c3.courseName : 'N/A'}
Lecturer: ${hasC3 && c3?.lecturer ? c3.lecturer : 'N/A'}
Weekly Lecture Days: ${hasC3 && c3?.weeklyLectureDays ? c3.weeklyLectureDays : 'N/A'}
Lecture Time: ${hasC3 && c3?.lectureTime ? c3.lectureTime : 'N/A'}

PAYMENT RECORD

Amount Paid: ${amountDisplay}
Payment Status: ${paymentStatus}

Applicant Confirmation:
Confirmed`;
}

// Generate the WhatsApp web link
export function buildCourseRegistrationWhatsAppLink(reg: CourseRegistrationRecord): string {
  const message = formatCourseRegistrationWhatsAppMessage(reg);
  return `https://wa.me/${ACADEMY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
