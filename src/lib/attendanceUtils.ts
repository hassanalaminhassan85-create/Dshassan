import { COMPANY_NAME } from './companyConstants';

/**
 * DS TECH Staff Attendance & Daily Reporting Utilities
 * Timezone: Africa/Lagos (West Africa Time - UTC+1)
 * Official Recipient: Managing Director/CEO (+2349023489111)
 */

export const OFFICIAL_MANAGEMENT_PHONE = '+2349023489111';
export const OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER = '2349023489111';
export const OFFICIAL_RECIPIENT_TITLE = 'Managing Director / CEO';

export const APPROVED_DEPARTMENTS = [
  'IT & Software Engineering',
  'Artificial Intelligence & Emerging Tech',
  'Web & Mobile App Engineering',
  'Creative Design & Digital Media',
  'Digital Growth & Media Campaigns',
  'Administrative Services',
  'Human Resource Management',
  'Finance & Accounts',
  'Business Development',
  'Corporate Legal & Compliance',
  'Cyber Security & Vaults',
  'Executive Leadership',
  'Technical Training & Talent Development'
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
  'Lead Technical Instructor & Trainer',
  'Technical Training Coordinator',
  'Operations & Project Coordinator',
  'Human Resources & Talent Specialist',
  'Executive Administrative Officer',
  'Legal & Compliance Consultant',
  'Operations Director',
  'Chief Executive Officer (CEO)'
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
 * Formats Resumption Report for WhatsApp transmission
 */
export function formatResumptionWhatsAppMessage(report: ResumptionReport): string {
  return [
    `🏛️ *${COMPANY_NAME}*`,
    `📋 *DAILY STAFF RESUMPTION REPORT*`,
    `──────────────────────────────`,
    `📅 *Day/Date:* ${report.dateStr}`,
    `👤 *Full Name:* ${report.fullName.trim()}`,
    `💼 *Position:* ${report.position.trim()}`,
    `🏢 *Department:* ${report.department.trim()}`,
    `──────────────────────────────`,
    `⏰ *Actual Resumption Time:* ${report.recordedTimeStr} (WAT • Africa/Lagos)`,
    `📌 *Scheduled Resumption:* 8:00 AM WAT`,
    `──────────────────────────────`,
    `✍️ *Confirmation Declaration:*`,
    `"I hereby confirm my resumption for duty today."`
  ].join('\n');
}

/**
 * Formats Closing and Activity Report for WhatsApp transmission
 */
export function formatClosingWhatsAppMessage(report: ClosingReport): string {
  return [
    `🏛️ *${COMPANY_NAME}*`,
    `📊 *DAILY STAFF CLOSING AND ACTIVITY REPORT*`,
    `──────────────────────────────`,
    `📅 *Day/Date:* ${report.dateStr}`,
    `👤 *Full Name:* ${report.fullName.trim()}`,
    `💼 *Position:* ${report.position.trim()}`,
    `🏢 *Department:* ${report.department.trim()}`,
    `──────────────────────────────`,
    `⏰ *Actual Signing-Out Time:* ${report.recordedTimeStr} (WAT • Africa/Lagos)`,
    `📌 *Scheduled Closing Time:* 5:00 PM WAT`,
    `──────────────────────────────`,
    `📋 *ACTIVITIES PERFORMED TODAY:*`,
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
    `──────────────────────────────`,
    `✅ *Tasks Completed:*`,
    `${report.tasksCompleted.trim() || 'None'}`,
    ``,
    `⏳ *Pending Tasks:*`,
    `${report.pendingTasks.trim() || 'None'}`,
    ``,
    `⚠️ *Challenges Encountered:*`,
    `${report.challengesEncountered.trim() || 'None'}`,
    ``,
    `🎯 *Plans for Next Working Day:*`,
    `${report.plansNextWorkingDay.trim()}`,
    `──────────────────────────────`,
    `✍️ *Confirmation Declaration:*`,
    `"I hereby submit my daily closing and activity report for management review."`
  ].join('\n');
}

/**
 * Generates WhatsApp URL
 */
export function generateWhatsAppUrl(messageText: string): string {
  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER}?text=${encoded}`;
}
