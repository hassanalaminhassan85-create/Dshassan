import {
  ManagementRoleCode,
  ManagementAccountRoleMeta,
  ManagementUserSession,
  ManagementDashboardPayload,
  ManagementTaskItem,
  ManagementReportItem,
  ManagementAnnouncementItem
} from '../types/management';

// Official DS TECH Management Accounts Directory (Public Meta for Selection)
export const OFFICIAL_MANAGEMENT_ROLES: ManagementAccountRoleMeta[] = [
  {
    code: 'CEO',
    title: 'CEO',
    department: 'Executive Leadership & Board of Directors',
    departmentCode: 'EXEC',
    scope: 'Organization-wide Strategy, Corporate Governance & Capital Allocation',
    description: 'Executive oversight of all company departments, corporate strategy, board relations, major capital investments, and institutional partnerships.',
    email: 'dstechceooffice@gmail.com',
    authorizedPerson: 'Chief Executive Officer',
    executiveRank: 1
  },
  {
    code: 'HOD_HR',
    title: 'HOD, Human Resource Management',
    department: 'Human Resource Management',
    departmentCode: 'HRM',
    scope: 'Personnel Recruitment, Talent Retention, Performance & Welfare',
    description: 'Manages staff recruitment pipelines, instructor accreditation, employee welfare, performance appraisals, and institutional HR compliance.',
    email: 'dstechanddigitalmarketingltd@gmail.com',
    authorizedPerson: 'Head of Department, HR',
    executiveRank: 2
  },
  {
    code: 'HOD_ADMIN',
    title: 'HOD, Administrative Services',
    department: 'Administrative Services',
    departmentCode: 'ADM',
    scope: 'Facilities, Procurement, Operational Logistics & Corporate Registry',
    description: 'Directs physical and digital office facilities, asset registers, procurement cycles, administrative workflows, and organizational logistics.',
    email: 'dstechadminoffice@gmail.com',
    authorizedPerson: 'Head of Department, Administration',
    executiveRank: 2
  },
  {
    code: 'HOD_BUSINESS',
    title: 'HOD, Business Development',
    department: 'Business Development',
    departmentCode: 'BIZ',
    scope: 'Client Acquisitions, Strategic Partnerships, RFPs & Commercial Growth',
    description: 'Drives commercial revenue expansion, enterprise B2B sales pipelines, institutional training contracts, and market entry strategies.',
    email: 'dstechbusinessoffice@gmail.com',
    authorizedPerson: 'Head of Department, Business Development',
    executiveRank: 2
  },
  {
    code: 'HOD_FINANCE',
    title: 'HOD, Accounting and Finance',
    department: 'Accounting and Finance',
    departmentCode: 'FIN',
    scope: 'Fiscal Planning, Academy Tuition Ledgers, Audits & Taxation Compliance',
    description: 'Supervises corporate accounting, revenue reconciliation, Paystack & bank settlements, fiscal budgeting, and FIRS/TIN statutory filings.',
    email: 'dstechfinanceoffice@gmail.com',
    authorizedPerson: 'Head of Department, Accounting & Finance',
    executiveRank: 2
  },
  {
    code: 'HOD_CREATIVE_DIGITAL',
    title: 'HOD, Creative Media and Digital Marketing',
    department: 'Creative Media and Digital Marketing',
    departmentCode: 'CMD',
    scope: 'Brand Identity, Ad Campaigns, Content Production & Multi-channel Reach',
    description: 'Leads digital advertising campaigns, creative asset production, social channels growth, PR communications, and brand storytelling.',
    email: 'dstechanddigitalltd@gmail.com',
    authorizedPerson: 'Head of Department, Creative Media',
    executiveRank: 2
  },
  {
    code: 'HOD_IT',
    title: 'HOD, Information Technology',
    department: 'Information Technology',
    departmentCode: 'ITD',
    scope: 'Infrastructure, Cloud DevOps, Cybersecurity & Platform Reliability',
    description: 'Oversees enterprise cloud architectures, web portal uptime, network security, IT helpdesk operations, and software engineering stacks.',
    email: 'dstechitoffice@gmail.com',
    authorizedPerson: 'Head of Department, Information Technology',
    executiveRank: 2
  },
  {
    code: 'HOD_AI_TECH',
    title: 'HOD, AI and Creative Technology',
    department: 'AI and Creative Technology',
    departmentCode: 'AIC',
    scope: 'GenAI Engineering, Intelligent Agents, R&D & Applied Automation',
    description: 'Spearheads proprietary AI models, multimodal agent integration, creative technological innovations, and advanced digital automation research.',
    email: 'dstechaitechoffice@gmail.com',
    authorizedPerson: 'Head of Department, AI & Creative Tech',
    executiveRank: 2
  },
  {
    code: 'HOD_LEGAL',
    title: 'HOD, Legal and Compliance',
    department: 'Legal and Compliance',
    departmentCode: 'LGC',
    scope: 'CAC Regulatory Standing, SCUML, IP Protection & Contractual Governance',
    description: 'Safeguards corporate legal standing, CAC RC-1849204 statutory covenants, NDAs, client service agreements, and regulatory risk governance.',
    email: 'dstechlegaloffice@gmail.com',
    authorizedPerson: 'Head of Department, Legal & Compliance',
    executiveRank: 2
  }
];

const SESSION_TOKEN_KEY = 'dst_mgmt_session_token';

export function getStoredSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {}
}

export function clearStoredSessionToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {}
}

// 1. Authenticate Role Account (Backend PBKDF2/Crypto Hash Verification)
export async function apiManagementLogin(
  email: string,
  password: string,
  role: ManagementRoleCode
): Promise<{ success: boolean; token: string; user: ManagementUserSession; error?: string }> {
  const response = await fetch('/api/management/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password, role })
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Authentication network failure' }));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Authentication rejected by security server.');
  }

  setStoredSessionToken(data.token);
  return data;
}

// 2. Verify Active Session
export async function apiManagementVerifySession(
  tokenOverride?: string
): Promise<{ success: boolean; user: ManagementUserSession }> {
  const token = tokenOverride || getStoredSessionToken();
  if (!token) {
    throw new Error('No active management session found.');
  }

  const response = await fetch('/api/management/session/verify', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Session verification failed' }));
  if (!response.ok || !data.success) {
    clearStoredSessionToken();
    throw new Error(data.error || 'Management session has expired or is invalid.');
  }

  return data;
}

// 3. Terminate Management Session (Logout)
export async function apiManagementLogout(): Promise<{ success: boolean }> {
  const token = getStoredSessionToken();
  if (token) {
    try {
      await fetch('/api/management/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch {}
  }
  clearStoredSessionToken();
  return { success: true };
}

// 4. Retrieve Role-Restricted Management Dashboard Data
export async function apiGetManagementDashboardData(): Promise<ManagementDashboardPayload> {
  const token = getStoredSessionToken();
  if (!token) {
    throw new Error('Unauthorized: Please authenticate to access management data.');
  }

  const response = await fetch('/api/management/dashboard-data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Failed to fetch dashboard data' }));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Access denied to departmental management dashboard.');
  }

  return data.data;
}

// 5. Update/Add Departmental Task
export async function apiUpdateManagementTask(
  task: Partial<ManagementTaskItem> & { title: string; priority: string; dueDate: string }
): Promise<{ success: boolean; task: ManagementTaskItem }> {
  const token = getStoredSessionToken();
  if (!token) throw new Error('Unauthorized');

  const response = await fetch('/api/management/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(task)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update task');
  }
  return data;
}

// 6. Submit or Update Departmental Report
export async function apiSubmitManagementReport(
  report: Partial<ManagementReportItem> & { title: string; period: string; summary: string }
): Promise<{ success: boolean; report: ManagementReportItem }> {
  const token = getStoredSessionToken();
  if (!token) throw new Error('Unauthorized');

  const response = await fetch('/api/management/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(report)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to submit report');
  }
  return data;
}

// 7. Publish Announcement
export async function apiCreateManagementAnnouncement(
  announcement: { title: string; content: string; priority: 'High' | 'Normal' | 'Critical'; targetAudience: string }
): Promise<{ success: boolean; announcement: ManagementAnnouncementItem }> {
  const token = getStoredSessionToken();
  if (!token) throw new Error('Unauthorized');

  const response = await fetch('/api/management/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(announcement)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to publish announcement');
  }
  return data;
}

// 8. Update Profile Settings
export async function apiUpdateManagementProfile(
  profileData: { phone?: string; officeLocation?: string; bio?: string }
): Promise<{ success: boolean; user: ManagementUserSession }> {
  const token = getStoredSessionToken();
  if (!token) throw new Error('Unauthorized');

  const response = await fetch('/api/management/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update profile settings');
  }
  return data;
}
