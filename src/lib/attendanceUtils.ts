/**
 * DS TECH ACADEMY (DSTA) Staff Attendance & Daily Reporting Utilities
 * Timezone: Africa/Lagos (West Africa Time - UTC+1)
 * Official Recipient: Academy Director/CEO (+2349023489111)
 */

export const OFFICIAL_MANAGEMENT_PHONE = '+2349023489111';
export const OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER = '2349023489111';
export const OFFICIAL_RECIPIENT_TITLE = 'Academy Director/CEO';

export const APPROVED_DEPARTMENTS = [
  'IT & Software Engineering',
  'Artificial Intelligence & Emerging Tech',
  'DS Tech Academy & Faculty',
  'Creative Design & Digital Media',
  'Digital Growth & Media Campaigns',
  'Administrative Services',
  'Human Resource Management',
  'Finance & Accounts',
  'Business Development',
  'Corporate Legal & Compliance',
  'Cyber Security & Vaults',
  'Executive Leadership'
];

export const APPROVED_POSITIONS = [
  'Lead Frontend Engineer',
  'Backend Systems Developer',
  'Full-Stack Web Architect',
  'Mobile App Engineer',
  'Cloud Infrastructure Specialist',
  'DevOps & Automation Engineer',
  'QA Automation Specialist',
  'Senior Digital Marketing Strategist',
  'SEO & Growth Content Lead',
  'Social Media & Community Manager',
  'Performance Ads Specialist',
  'Brand Identity & Visual Designer',
  'UI/UX Product Designer',
  'Motion Graphics & Video Producer',
  'Creative Director',
  'Lead IT Instructor / Academy Tutor',
  'Academy Academic Coordinator',
  'Operations & Project Coordinator',
  'Human Resources & Talent Specialist',
  'Executive Administrative Officer',
  'Legal & Compliance Consultant',
  'Academy Director',
  'Chief Executive Officer (CEO)',
  'Other (Custom Role)'
];

export interface StaffProfile {
  fullName: string;
  position: string;
  customPosition?: string;
  department: string;
}

export interface ResumptionReport {
  id: string;
  dateStr: string; // e.g. "Tuesday, 13 October 2026"
  dateIso: string;
  recordedTimeStr: string; // e.g. "8:14 AM"
  recordedTimestamp: number;
  expectedTimeStr: string; // "8:00 AM"
  fullName: string;
  position: string;
  department: string;
  confirmed: boolean;
  submissionTarget: string;
  submissionContact: string;
  submittedAtIso?: string;
  status: 'draft' | 'submitted';
}

export interface ActivityTask {
  description: string;
  outcome: string;
}

export interface ClosingReport {
  id: string;
  dateStr: string;
  dateIso: string;
  recordedTimeStr: string; // e.g. "5:12 PM"
  recordedTimestamp: number;
  expectedTimeStr: string; // "5:00 PM"
  fullName: string;
  position: string;
  department: string;
  activity1: ActivityTask;
  activity2: ActivityTask;
  activity3: ActivityTask;
  tasksCompleted: string;
  pendingTasks: string;
  challengesEncountered: string;
  plansNextWorkingDay: string;
  confirmed: boolean;
  submissionTarget: string;
  submissionContact: string;
  submittedAtIso?: string;
  status: 'draft' | 'submitted';
}

/**
 * Returns formatted date in Africa/Lagos timezone (e.g. "Tuesday, 13 October 2026")
 */
export function getLagosDateFormatted(dateInput?: Date | number | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

/**
 * Returns formatted 12-hour time in Africa/Lagos timezone (e.g. "8:14 AM")
 */
export function getLagosTimeFormatted(dateInput?: Date | number | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

/**
 * Returns current Lagos hour and minute as integers
 */
export function getLagosTimeParts(dateInput?: Date | number | string): { hour: number; minute: number } {
  const d = dateInput ? new Date(dateInput) : new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).formatToParts(d);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '8', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    return { hour, minute };
  } catch {
    return { hour: d.getHours(), minute: d.getMinutes() };
  }
}

/**
 * Evaluates resumption punctuality against expected 8:00 AM schedule
 */
export function evaluateResumptionSchedule(recordedTimestamp: number): {
  isLate: boolean;
  minutesDiff: number;
  badgeLabel: string;
  statusText: string;
} {
  const { hour, minute } = getLagosTimeParts(recordedTimestamp);
  const totalMinutes = hour * 60 + minute;
  const expectedMinutes = 8 * 60; // 8:00 AM = 480 minutes

  const diff = totalMinutes - expectedMinutes;
  if (diff <= 0) {
    return {
      isLate: false,
      minutesDiff: Math.abs(diff),
      badgeLabel: 'On Schedule (8:00 AM Target)',
      statusText: 'Punctual Resumption'
    };
  } else {
    return {
      isLate: true,
      minutesDiff: diff,
      badgeLabel: `Late Resumption (+${diff} min${diff === 1 ? '' : 's'})`,
      statusText: `Late Resumption (+${diff} minutes after 8:00 AM)`
    };
  }
}

/**
 * Evaluates closing schedule against expected 5:00 PM schedule
 */
export function evaluateClosingSchedule(recordedTimestamp: number): {
  isEarly: boolean;
  isAfterSchedule: boolean;
  minutesDiff: number;
  badgeLabel: string;
  statusText: string;
} {
  const { hour, minute } = getLagosTimeParts(recordedTimestamp);
  const totalMinutes = hour * 60 + minute;
  const expectedMinutes = 17 * 60; // 5:00 PM = 1020 minutes

  const diff = totalMinutes - expectedMinutes;
  if (Math.abs(diff) <= 5) {
    return {
      isEarly: false,
      isAfterSchedule: false,
      minutesDiff: 0,
      badgeLabel: 'On Schedule (5:00 PM Target)',
      statusText: 'Scheduled Closing Time (5:00 PM)'
    };
  } else if (diff < -5) {
    const earlyMin = Math.abs(diff);
    return {
      isEarly: true,
      isAfterSchedule: false,
      minutesDiff: earlyMin,
      badgeLabel: `Early Sign-Out (-${earlyMin} min${earlyMin === 1 ? '' : 's'})`,
      statusText: `Early Sign-Out (${earlyMin} minutes before 5:00 PM)`
    };
  } else {
    return {
      isEarly: false,
      isAfterSchedule: true,
      minutesDiff: diff,
      badgeLabel: `Extended Shift (+${diff} min${diff === 1 ? '' : 's'})`,
      statusText: `Extended Shift (+${diff} minutes after 5:00 PM)`
    };
  }
}

/**
 * Formats Resumption Report for WhatsApp transmission
 */
export function formatResumptionWhatsAppMessage(report: ResumptionReport): string {
  const schedule = evaluateResumptionSchedule(report.recordedTimestamp);
  
  return [
    `*DS TECH ACADEMY (DSTA) DAILY STAFF RESUMPTION REPORT*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📅 *Day/Date:* ${report.dateStr}`,
    `👤 *Full Name:* ${report.fullName.trim()}`,
    `💼 *Position:* ${report.position.trim()}`,
    `🏢 *Department:* ${report.department.trim()}`,
    `⏰ *Actual Resumption Time:* ${report.recordedTimeStr} (WAT - Africa/Lagos)`,
    `📌 *Expected Resumption:* 8:00 AM (Approved Work Schedule)`,
    `⏱️ *Attendance Status:* ${schedule.statusText}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ *Confirmation Statement:*`,
    `"I hereby confirm my resumption for duty today."`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Submission Details:*`,
    `• Submitted to: ${report.submissionTarget}`,
    `• Official Contact: ${report.submissionContact}`,
    `• Organization: DS TECH & DIGITAL MARKETING AGENCY LIMITED (CAC RC: 9550925)`,
    `• Record Ref: #${report.id}`
  ].join('\n');
}

/**
 * Formats Closing and Activity Report for WhatsApp transmission
 */
export function formatClosingWhatsAppMessage(report: ClosingReport): string {
  const schedule = evaluateClosingSchedule(report.recordedTimestamp);

  return [
    `*DS TECH ACADEMY (DSTA) DAILY STAFF CLOSING AND ACTIVITY REPORT*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📅 *Day/Date:* ${report.dateStr}`,
    `👤 *Full Name:* ${report.fullName.trim()}`,
    `💼 *Position:* ${report.position.trim()}`,
    `🏢 *Department:* ${report.department.trim()}`,
    `⏰ *Actual Signing-Out Time:* ${report.recordedTimeStr} (WAT - Africa/Lagos)`,
    `📌 *Expected Closing Time:* 5:00 PM (Approved Work Schedule)`,
    `⏱️ *Closing Status:* ${schedule.statusText}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📝 *ACTIVITIES PERFORMED FOR THE DAY:*`,
    `1️⃣ *Task/Activity 1:*`,
    `   • Description: ${report.activity1.description.trim()}`,
    `   • Outcome: ${report.activity1.outcome.trim()}`,
    ``,
    `2️⃣ *Task/Activity 2:*`,
    `   • Description: ${report.activity2.description.trim()}`,
    `   • Outcome: ${report.activity2.outcome.trim()}`,
    ``,
    `3️⃣ *Task/Activity 3:*`,
    `   • Description: ${report.activity3.description.trim()}`,
    `   • Outcome: ${report.activity3.outcome.trim()}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ *Tasks Completed:*`,
    `${report.tasksCompleted.trim() || 'None'}`,
    ``,
    `⏳ *Pending Tasks:*`,
    `${report.pendingTasks.trim() || 'None'}`,
    ``,
    `⚠️ *Challenges Encountered:*`,
    `${report.challengesEncountered.trim() || 'None'}`,
    ``,
    `🎯 *Plans for the Next Working Day:*`,
    `${report.plansNextWorkingDay.trim()}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ *Confirmation Statement:*`,
    `"I hereby submit my daily closing and activity report for management review."`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Submission Details:*`,
    `• Submitted to: ${report.submissionTarget}`,
    `• Official Contact: ${report.submissionContact}`,
    `• Organization: DS TECH & DIGITAL MARKETING AGENCY LIMITED (CAC RC: 9550925)`,
    `• Record Ref: #${report.id}`
  ].join('\n');
}

/**
 * Generates WhatsApp URL
 */
export function generateWhatsAppUrl(messageText: string): string {
  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER}?text=${encoded}`;
}
