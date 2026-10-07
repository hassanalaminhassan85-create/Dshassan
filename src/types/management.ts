export type ManagementRoleCode =
  | 'CEO'
  | 'HOD_HR'
  | 'HOD_ADMIN'
  | 'HOD_BUSINESS'
  | 'HOD_FINANCE'
  | 'HOD_CREATIVE_DIGITAL'
  | 'HOD_IT'
  | 'HOD_AI_TECH'
  | 'HOD_LEGAL';

export interface ManagementAccountRoleMeta {
  code: ManagementRoleCode;
  title: string;
  department: string;
  departmentCode: string;
  scope: string;
  description: string;
  email: string;
  authorizedPerson: string;
  executiveRank: number; // 1 = CEO, 2 = HODs
}

export interface ManagementUserSession {
  token: string;
  role: ManagementRoleCode;
  roleTitle: string;
  department: string;
  departmentCode: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  officeLocation?: string;
  bio?: string;
  joinedDate?: string;
  permissions: string[];
}

export interface ManagementStatCard {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export interface ManagementActivityItem {
  id: string;
  action: string;
  user: string;
  role: string;
  department?: string;
  timestamp: string;
  status?: string;
  details?: string;
  category: 'executive' | 'task' | 'report' | 'compliance' | 'finance' | 'tech' | 'hr';
}

export interface ManagementTaskItem {
  id: string;
  title: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  assignee: string;
  department: string;
  departmentCode: string;
  description?: string;
}

export interface ManagementReportItem {
  id: string;
  title: string;
  period: string;
  submittedBy: string;
  department: string;
  departmentCode: string;
  status: 'Approved' | 'Pending Review' | 'Draft' | 'Submitted';
  date: string;
  summary: string;
  metricsSummary?: string;
  fileReference?: string;
}

export interface ManagementDocumentItem {
  id: string;
  title: string;
  category: string;
  department: string;
  departmentCode: string;
  lastUpdated: string;
  size: string;
  status: 'Active' | 'Archived' | 'Confidential';
  referenceNo: string;
  accessTier: 'Executive' | 'Departmental' | 'Public';
}

export interface ManagementAnnouncementItem {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  date: string;
  priority: 'High' | 'Normal' | 'Critical';
  content: string;
  targetAudience: string;
}

export interface ManagementNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: 'alert' | 'task' | 'meeting' | 'report' | 'system';
}

export interface ManagementMeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendeesCount: number;
  attendees: string[];
  agenda: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface DepartmentPerformanceMetric {
  department: string;
  code: string;
  head: string;
  email?: string;
  tasksCompleted: number;
  totalTasks: number;
  operationalHealth: 'Active' | 'Optimal' | 'Under Review' | 'Excellent' | 'Good';
  highlights: string;
}

export interface DepartmentOverviewInfo {
  name: string;
  head: string;
  code: string;
  staffCount: number;
  budgetYear: string;
  activeProjects: number;
  operationalStatus: string;
  description: string;
  coreMandates: string[];
  teamMembers: Array<{
    name: string;
    role: string;
    email: string;
    status: 'Active' | 'On Leave';
  }>;
}

export interface ManagementDashboardPayload {
  role: ManagementRoleCode;
  user: ManagementUserSession;
  stats: ManagementStatCard[];
  departmentInfo: DepartmentOverviewInfo;
  recentActivities: ManagementActivityItem[];
  tasks: ManagementTaskItem[];
  reports: ManagementReportItem[];
  documents: ManagementDocumentItem[];
  announcements: ManagementAnnouncementItem[];
  notifications: ManagementNotificationItem[];
  meetings: ManagementMeetingItem[];
  departmentPerformance: DepartmentPerformanceMetric[];
  executiveOverview?: {
    totalDepartments: number;
    totalStaff: number;
    pendingExecutiveReports: number;
    scheduledBoardMeetings: number;
  };
}
