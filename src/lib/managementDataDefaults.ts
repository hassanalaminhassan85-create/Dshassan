import { 
  ManagementRoleCode, 
  ManagementDashboardPayload, 
  ManagementUserSession,
  DepartmentPerformanceMetric,
  ManagementAnnouncementItem,
  ManagementMeetingItem,
  ManagementNotificationItem,
  ManagementTaskItem,
  ManagementReportItem,
  ManagementDocumentItem,
  ManagementActivityItem
} from '../types/management';
import { OFFICIAL_MANAGEMENT_ROLES } from './managementApi';

// Master canonical tasks for directorates - realistic, live actionable management items
export const MASTER_MANAGEMENT_TASKS: ManagementTaskItem[] = [
  // HRM Tasks
  { id: 't-hr-1', title: 'Process Appointment Letters for 4 Newly Accredited Instructors', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'HOD HR', department: 'Human Resource Management', departmentCode: 'HRM' },
  { id: 't-hr-2', title: 'Review Q4 Faculty Teaching Retainers across 24 Tech Tracks', priority: 'Urgent', status: 'Pending', dueDate: '2026-10-10', assignee: 'HR Directorate', department: 'Human Resource Management', departmentCode: 'HRM' },
  { id: 't-hr-3', title: 'Conduct Biometric Identity Card Issuance at Regional Hub', priority: 'Medium', status: 'Pending', dueDate: '2026-10-15', assignee: 'HR Lead', department: 'Human Resource Management', departmentCode: 'HRM' },

  // ADM Tasks
  { id: 't-adm-1', title: 'Audit Physical Server Room Power Redundancy in Abuja HQ', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'HOD Administration', department: 'Administrative Services', departmentCode: 'ADM' },
  { id: 't-adm-2', title: 'Renew Annual Facility Tenancy & Utility Licenses', priority: 'Urgent', status: 'Pending', dueDate: '2026-10-12', assignee: 'Admin Lead', department: 'Administrative Services', departmentCode: 'ADM' },

  // BIZ Tasks
  { id: 't-biz-1', title: 'Submit Corporate Upskilling RFP for Commercial Banking Cohort', priority: 'Urgent', status: 'In Progress', dueDate: '2026-10-10', assignee: 'HOD Business Development', department: 'Business Development', departmentCode: 'BIZ' },
  { id: 't-biz-2', title: 'Structure Enterprise Retainer Agreement for FinTech Client', priority: 'High', status: 'Pending', dueDate: '2026-10-14', assignee: 'Commercial Lead', department: 'Business Development', departmentCode: 'BIZ' },

  // FIN Tasks
  { id: 't-fin-2', title: 'Audit Student Academy Tuition Installment Verification Pipeline', priority: 'Medium', status: 'In Progress', dueDate: '2026-10-11', assignee: 'Finance Lead', department: 'Accounting and Finance', departmentCode: 'FIN' },
  { id: 't-fin-3', title: 'Prepare FIRS Statutory Withholding & Value Added Tax (VAT) Remittance', priority: 'High', status: 'Pending', dueDate: '2026-10-15', assignee: 'HOD Accounting & Finance', department: 'Accounting and Finance', departmentCode: 'FIN' },

  // CMD Tasks
  { id: 't-cmd-1', title: 'Launch Targeted Meta Video Ad for AI for Kids Q4 Cohort', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'HOD Creative Media', department: 'Creative Media and Digital Marketing', departmentCode: 'CMD' },
  { id: 't-cmd-2', title: 'Produce Video Showcase for Student Capstone Projects', priority: 'Medium', status: 'Pending', dueDate: '2026-10-13', assignee: 'Media Producer', department: 'Creative Media and Digital Marketing', departmentCode: 'CMD' },

  // ITD Tasks
  { id: 't-it-2', title: 'Deploy High-Availability Reverse Proxy Load Balancer', priority: 'Urgent', status: 'In Progress', dueDate: '2026-10-10', assignee: 'DevOps Lead', department: 'Information Technology', departmentCode: 'ITD' },

  // AIC Tasks
  { id: 't-aic-2', title: 'Integrate Gemini Multimodal Live Streaming for Code Review Assistant', priority: 'Urgent', status: 'In Progress', dueDate: '2026-10-11', assignee: 'AI Systems Architect', department: 'AI and Creative Technology', departmentCode: 'AIC' },
  { id: 't-aic-3', title: 'Benchmark Response Latency for Student AI Tutor Co-pilot', priority: 'Medium', status: 'Pending', dueDate: '2026-10-14', assignee: 'HOD AI & Creative Tech', department: 'AI and Creative Technology', departmentCode: 'AIC' },

  // LGC Tasks
  { id: 't-lgc-2', title: 'Draft Master Services Retainer for Federal Agency Tech Proposal', priority: 'Urgent', status: 'In Progress', dueDate: '2026-10-10', assignee: 'HOD Legal & Compliance', department: 'Legal and Compliance', departmentCode: 'LGC' }
];

// Helper to compute live department metrics from task list
export function calculateDepartmentPerformance(tasksList: ManagementTaskItem[] = MASTER_MANAGEMENT_TASKS): DepartmentPerformanceMetric[] {
  const DEPT_DEFINITIONS = [
    { department: 'Human Resource Management', code: 'HRM', head: 'Head of Department (HR)', email: 'dstechanddigitalmarketingltd@gmail.com', operationalHealth: 'Active' as const, highlights: 'Faculty accredited across 24 disciplines; Q4 recruitment on track' },
    { department: 'Administrative Services', code: 'ADM', head: 'Head of Department (ADM)', email: 'dstechadminoffice@gmail.com', operationalHealth: 'Active' as const, highlights: 'Garki HQ facility optimization; physical desk allocation completed' },
    { department: 'Business Development', code: 'BIZ', head: 'Head of Department (BIZ)', email: 'dstechbusinessoffice@gmail.com', operationalHealth: 'Active' as const, highlights: 'Enterprise institutional training client proposals and corporate partnerships' },
    { department: 'Accounting and Finance', code: 'FIN', head: 'Head of Department (FIN)', email: 'dstechfinanceoffice@gmail.com', operationalHealth: 'Active' as const, highlights: 'Paystack ledger reconciliation 100%; SCUML & FIRS statutory filings current' },
    { department: 'Creative Media and Digital Marketing', code: 'CMD', head: 'Head of Department (CMD)', email: 'dstechanddigitalltd@gmail.com', operationalHealth: 'Active' as const, highlights: 'Digital brand awareness campaigns and multi-channel creative storytelling' },
    { department: 'Information Technology', code: 'ITD', head: 'Head of Department (ITD)', email: 'dstechitoffice@gmail.com', operationalHealth: 'Active' as const, highlights: '99.98% platform uptime; zero security incidents logged' },
    { department: 'AI and Creative Technology', code: 'AIC', head: 'Head of Department (AIC)', email: 'dstechaitechoffice@gmail.com', operationalHealth: 'Active' as const, highlights: 'Proprietary student tutor co-pilot deployed with Gemini models' },
    { department: 'Legal and Compliance', code: 'LGC', head: 'Head of Department (LGC)', email: 'dstechlegaloffice@gmail.com', operationalHealth: 'Active' as const, highlights: 'CAC corporate compliance affirmed; commercial agreements verified' }
  ];

  return DEPT_DEFINITIONS.map(dept => {
    const deptTasks = tasksList.filter(t => t.departmentCode === dept.code);
    const completed = deptTasks.filter(t => t.status === 'Completed').length;
    return {
      department: dept.department,
      code: dept.code,
      head: dept.head,
      email: dept.email,
      tasksCompleted: completed,
      totalTasks: deptTasks.length,
      operationalHealth: dept.operationalHealth,
      highlights: dept.highlights
    };
  });
}

export const DEFAULT_DEPARTMENT_PERFORMANCE: DepartmentPerformanceMetric[] = calculateDepartmentPerformance(MASTER_MANAGEMENT_TASKS);

export const DEFAULT_ANNOUNCEMENTS: ManagementAnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Q4 2026 Executive Strategy Assembly & Expansion Review',
    author: 'Chief Executive Officer',
    authorRole: 'CEO',
    date: '2026-10-06',
    priority: 'High',
    content: 'All Heads of Department are scheduled for the Q4 Strategic Review assembly on Thursday at 10:00 AM in the Executive Conference Suite. Please finalize departmental KPI audit sheets.',
    targetAudience: 'All Management Staff'
  },
  {
    id: 'ann-2',
    title: 'Corporate Affairs Commission (CAC) Annual Filing Clearance',
    author: 'HOD, Legal & Compliance',
    authorRole: 'HOD, Legal & Compliance',
    date: '2026-10-04',
    priority: 'Normal',
    content: 'Corporate Affairs Commission (CAC RC-1849204) statutory returns have been validated and reconciled with SCUML compliance certification.',
    targetAudience: 'Executive & Department Leadership'
  },
  {
    id: 'ann-3',
    title: 'DS Tech Academy Q4 Cohort Enrollment Crosses 1,200 Students',
    author: 'HOD, Human Resource Management',
    authorRole: 'HOD, Human Resource Management',
    date: '2026-10-02',
    priority: 'Normal',
    content: 'Academic faculty has successfully onboarded 24 new instructors to support our expanded 115-course curriculum across physical and hybrid lecture streams.',
    targetAudience: 'All Staff'
  }
];

export const DEFAULT_MEETINGS: ManagementMeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Executive Management Weekly Briefing',
    date: '2026-10-08',
    time: '10:00 AM - 11:30 AM',
    location: 'Executive Boardroom / Hybrid Live Room',
    organizer: 'CEO Office',
    attendeesCount: 10,
    attendees: ['CEO', 'All HODs', 'Executive Secretary'],
    agenda: 'Review departmental milestones, capital budget allocations, and Academy Q4 expansion priorities.',
    status: 'Scheduled'
  },
  {
    id: 'meet-2',
    title: 'Inter-Departmental Operational Alignment',
    date: '2026-10-10',
    time: '02:00 PM - 03:30 PM',
    location: 'Conference Room B, 2nd Floor',
    organizer: 'HOD Administrative Services',
    attendeesCount: 6,
    attendees: ['HOD Administration', 'HOD IT', 'HOD HR', 'HOD Finance'],
    agenda: 'Facility logistics, server room UPS upgrades, and faculty workstation allocation.',
    status: 'Scheduled'
  },
  {
    id: 'meet-3',
    title: 'Statutory Compliance & Risk Review Committee',
    date: '2026-10-14',
    time: '11:00 AM - 12:30 PM',
    location: 'Legal Directorate Suite',
    organizer: 'HOD Legal and Compliance',
    attendeesCount: 5,
    attendees: ['HOD Legal', 'HOD Finance', 'CEO', 'External Auditor'],
    agenda: 'Audit report review, SCUML anti-fraud measures, and client NDA standardizations.',
    status: 'Scheduled'
  }
];

export const DEFAULT_NOTIFICATIONS: ManagementNotificationItem[] = [
  { id: 'notif-1', title: 'Q4 Budget Submission Deadline', message: 'All directorates must submit finalized Q4 expenditure forecasts before Friday 5:00 PM.', timestamp: '10 mins ago', unread: true, type: 'alert' },
  { id: 'notif-2', title: 'Executive Assembly Agenda Confirmed', message: 'The agenda for the upcoming management assembly is available in the Documents vault.', timestamp: '2 hours ago', unread: true, type: 'meeting' },
  { id: 'notif-3', title: 'CAC Statutory Clearance Updated', message: 'Annual certification verified on corporate registry record.', timestamp: '1 day ago', unread: false, type: 'report' },
  { id: 'notif-4', title: 'Cloud Systems Security Patch Complete', message: 'IT Directorate deployed version 2.4 infrastructure release without downtime.', timestamp: '2 days ago', unread: false, type: 'system' }
];

export function generateRoleDashboardPayload(
  roleCode: ManagementRoleCode,
  userSessionOverride?: Partial<ManagementUserSession> | null
): ManagementDashboardPayload {
  const meta = OFFICIAL_MANAGEMENT_ROLES.find(r => r.code === roleCode) || OFFICIAL_MANAGEMENT_ROLES[0];
  const isCeo = roleCode === 'CEO';

  const user: ManagementUserSession = {
    token: userSessionOverride?.token || 'dst_mgmt_' + Math.random().toString(36).substring(2),
    role: meta.code,
    roleTitle: meta.title,
    department: meta.department,
    departmentCode: meta.departmentCode,
    email: userSessionOverride?.email || meta.email,
    name: userSessionOverride?.name || meta.authorizedPerson,
    avatar: userSessionOverride?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    phone: userSessionOverride?.phone || '+234 813 123 4567',
    officeLocation: userSessionOverride?.officeLocation || 'DS Tech Headquarters, Garki, Abuja',
    bio: userSessionOverride?.bio || meta.description,
    joinedDate: userSessionOverride?.joinedDate || '2021-03-15',
    permissions: userSessionOverride?.permissions || ['ALL']
  };

  let stats: any[] = [];
  let tasks: ManagementTaskItem[] = [];
  let reports: ManagementReportItem[] = [];
  let documents: ManagementDocumentItem[] = [];
  let recentActivities: ManagementActivityItem[] = [];
  let departmentInfo: any = null;

  if (isCeo) {
    // CEO Executive Tasks & Records (CEO sees all active organization tasks)
    tasks = [
      { id: 't-ceo-1', title: 'Review Q4 Institutional Expansion Budget with Finance Directorate', priority: 'High', status: 'In Progress', dueDate: '2026-10-09', assignee: 'CEO Office', department: 'Executive Leadership', departmentCode: 'EXEC' },
      { id: 't-ceo-2', title: 'Sign Off on Master Partnership Agreement with Federal Communications Partner', priority: 'Urgent', status: 'Pending', dueDate: '2026-10-10', assignee: 'Chief Executive Officer', department: 'Executive Leadership', departmentCode: 'EXEC' },
      { id: 't-ceo-3', title: 'Preside over Q4 Executive Management Board Session', priority: 'High', status: 'Pending', dueDate: '2026-10-12', assignee: 'Chief Executive Officer', department: 'Executive Leadership', departmentCode: 'EXEC' },
      ...MASTER_MANAGEMENT_TASKS
    ];

    reports = [
      { id: 'rep-ceo-1', title: 'Consolidated DS Tech Corporate Audit & Performance Q3', period: 'Q3 2026', submittedBy: 'Executive Secretariat', department: 'Executive Leadership', departmentCode: 'EXEC', status: 'Approved', date: '2026-10-01', summary: 'Comprehensive operational, fiscal, and instructional audit across all 8 operating directorates.' },
      { id: 'rep-ceo-2', title: 'Statutory Corporate Compliance & CAC RC-1849204 Validation', period: 'Annual 2026', submittedBy: 'HOD Legal & Compliance', department: 'Legal & Compliance', departmentCode: 'LGC', status: 'Approved', date: '2026-09-28', summary: 'Full regulatory certification including FIRS tax compliance and SCUML accreditation.' },
      { id: 'rep-ceo-3', title: 'Commercial Business Development & Client Pipeline Forecast', period: 'Q4 2026', submittedBy: 'HOD Business Development', department: 'Business Development', departmentCode: 'BIZ', status: 'Pending Review', date: '2026-10-05', summary: 'Quarterly review of enterprise training and bespoke cloud software client engagements.' },
      { id: 'rep-ceo-4', title: 'Academic Faculty Quality & Student Graduation Metric Summary', period: 'Semester 2', submittedBy: 'HOD Human Resource Management', department: 'Human Resource Management', departmentCode: 'HRM', status: 'Pending Review', date: '2026-10-04', summary: 'Evaluation of 26 faculty leads across 115 vocational tech disciplines.' }
    ];

    documents = [
      { id: 'doc-ceo-1', title: 'CAC Certificate of Incorporation (RC-1849204)', category: 'Statutory', department: 'Executive', departmentCode: 'EXEC', lastUpdated: '2026-08-15', size: '2.4 MB', status: 'Active', referenceNo: 'CAC/RC-1849204', accessTier: 'Executive' },
      { id: 'doc-ceo-2', title: 'DS Tech Strategic Master Plan 2026-2028', category: 'Strategy', department: 'Executive', departmentCode: 'EXEC', lastUpdated: '2026-09-01', size: '4.8 MB', status: 'Active', referenceNo: 'DST/STRAT/2026/01', accessTier: 'Executive' },
      { id: 'doc-ceo-3', title: 'Board Resolutions & Executive Governance Charter', category: 'Governance', department: 'Executive', departmentCode: 'EXEC', lastUpdated: '2026-07-20', size: '1.9 MB', status: 'Active', referenceNo: 'DST/GOV/BR-09', accessTier: 'Executive' },
      { id: 'doc-ceo-4', title: 'Consolidated Financial Statements & Tax Returns', category: 'Finance', department: 'Finance', departmentCode: 'FIN', lastUpdated: '2026-09-30', size: '3.6 MB', status: 'Active', referenceNo: 'DST/FIN/FS-2026-Q3', accessTier: 'Executive' }
    ];

    recentActivities = [
      { id: 'act-ceo-1', action: 'Approved Q4 Corporate Budget Allocations', user: 'Chief Executive Officer', role: 'CEO', department: 'Executive Leadership', timestamp: '2 hours ago', status: 'Authorized', category: 'executive', details: 'Transferred capital funds for Academy server upgrades and regional campus setup.' },
      { id: 'act-ceo-2', action: 'Reviewed Legal Compliance Report', user: 'HOD Legal', role: 'HOD Legal', department: 'Legal & Compliance', timestamp: '5 hours ago', status: 'Under Review', category: 'compliance', details: 'Statutory returns verified with Corporate Affairs Commission.' },
      { id: 'act-ceo-3', action: 'Paystack Tuition Ledger Reconciled', user: 'HOD Finance', role: 'HOD Finance', department: 'Accounting & Finance', timestamp: 'Yesterday', status: 'Verified', category: 'finance', details: 'Monthly student course tuition fees verified without discrepancies.' },
      { id: 'act-ceo-4', action: 'AI Co-pilot Assistant V2 Successfully Deployed', user: 'HOD AI Tech', role: 'HOD AI Tech', department: 'AI & Creative Tech', timestamp: '2 days ago', status: 'Live', category: 'tech', details: 'Integrated Gemini 3.7 streaming responses with page-context grounding.' }
    ];

    departmentInfo = {
      name: 'Executive Leadership & Board of Directors',
      head: 'Chief Executive Officer',
      code: 'EXEC',
      staffCount: 68,
      budgetYear: 'FY 2026 / 2027',
      activeProjects: 14,
      operationalStatus: 'Optimal (All Divisions Active)',
      description: 'The supreme governing body of DS Tech & Digital Marketing Agency Limited, orchestrating corporate policy, capital strategy, institutional alignment, and multi-sector digital transformation.',
      coreMandates: [
        'Setting strategic corporate vision, expansion horizons, and technology roadmaps',
        'Supervising departmental leadership across all 8 specialized functional directorates',
        'Ensuring strict adherence to Nigerian statutory requirements (CAC RC-1849204, SCUML, FIRS)',
        'Safeguarding corporate liquidity, capital allocation, and shareholder value',
        'Approving high-value institutional partnerships, government tenders, and client master retainers'
      ],
      teamMembers: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer & Founder', email: 'dstechceooffice@gmail.com', status: 'Active' },
        { name: 'Executive Secretary', role: 'Executive Secretariat / Board Liaison', email: 'boardsecretary@dstechagency.com', status: 'Active' },
        { name: 'Head of Department (HR)', role: 'Head of Department, HR', email: 'dstechanddigitalmarketingltd@gmail.com', status: 'Active' },
        { name: 'Head of Department (Finance)', role: 'Head of Department, Accounting & Finance', email: 'dstechfinanceoffice@gmail.com', status: 'Active' },
        { name: 'Head of Department (Legal)', role: 'Head of Department, Legal & Compliance', email: 'dstechlegaloffice@gmail.com', status: 'Active' }
      ]
    };
  } else {
    // Role-specific definitions for HODs
    const deptCode = meta.departmentCode;
    tasks = MASTER_MANAGEMENT_TASKS.filter(t => t.departmentCode === deptCode);

    if (deptCode === 'HRM') {
      reports = [
        { id: 'rep-hr-1', title: 'Monthly Workforce Attendance & Payroll Audit Ledger', period: 'September 2026', submittedBy: 'HOD Human Resources', department: 'Human Resource Management', departmentCode: 'HRM', status: 'Approved', date: '2026-10-01', summary: 'Attendance records, overtime tracking, and teaching hour verifications.' },
        { id: 'rep-hr-2', title: 'Faculty Accreditation & Teaching Quality Assessment', period: 'Q3 2026', submittedBy: 'HOD Human Resources', department: 'Human Resource Management', departmentCode: 'HRM', status: 'Pending Review', date: '2026-10-04', summary: 'Student satisfaction metrics across all 24 technical faculty disciplines.' }
      ];

      documents = [
        { id: 'doc-hr-1', title: 'DS Tech Employee Handbook & Code of Conduct 2026', category: 'Policy', department: 'Human Resources', departmentCode: 'HRM', lastUpdated: '2026-07-10', size: '2.1 MB', status: 'Active', referenceNo: 'DST/HR/HB-2026', accessTier: 'Departmental' },
        { id: 'doc-hr-2', title: 'Standard Faculty Teaching Agreement Template', category: 'Contract', department: 'Human Resources', departmentCode: 'HRM', lastUpdated: '2026-08-01', size: '820 KB', status: 'Active', referenceNo: 'DST/HR/STA-V2', accessTier: 'Departmental' }
      ];

      recentActivities = [
        { id: 'act-hr-1', action: 'Verified 4 New Instructor Credentials', user: 'HOD HR', role: 'HOD HR', department: 'Human Resource Management', timestamp: '3 hours ago', status: 'Completed', category: 'hr', details: 'Full-stack development and Data Science faculty accreditations.' },
        { id: 'act-hr-2', action: 'Submitted Monthly Attendance Ledger', user: 'HOD HR', role: 'HOD HR', department: 'Human Resource Management', timestamp: '1 day ago', status: 'Submitted', category: 'report', details: 'Transmitted to Finance Directorate for payroll authorization.' }
      ];

      departmentInfo = {
        name: 'Human Resource Management',
        head: 'Head of Department (HR)',
        code: 'HRM',
        staffCount: 12,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 6,
        operationalStatus: 'Fully Operational',
        description: 'Oversees talent acquisition, personnel administration, faculty accreditation, employee welfare, performance metrics, and regulatory workforce standards across DS Tech Headquarters and Regional Hubs.',
        coreMandates: [
          'Attracting, screening, and onboarding top-tier software engineers, AI developers, and instructors',
          'Conducting rigorous accreditation of 24 instructional faculty disciplines for DS Tech Academy',
          'Administering staff biometric verification, digital attendance, and disciplinary protocols',
          'Structuring competitive compensation, welfare benefits, and professional development programs'
        ],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, HR', email: 'dstechanddigitalmarketingltd@gmail.com', status: 'Active' },
          { name: 'Senior Talent Lead', role: 'Senior Talent Acquisition Specialist', email: 'talent.hr@dstechagency.com', status: 'Active' },
          { name: 'Employee Welfare Officer', role: 'Employee Relations & Welfare Officer', email: 'welfare.hr@dstechagency.com', status: 'Active' },
          { name: 'Faculty Coordinator', role: 'Academic Faculty Coordinator', email: 'faculty.hr@dstechagency.com', status: 'Active' }
        ]
      };
    } else if (deptCode === 'ADM') {
      reports = [
        { id: 'rep-adm-1', title: 'Q3 Office Operations, Fixed Assets & Facilities Audit', period: 'Q3 2026', submittedBy: 'HOD Administration', department: 'Administrative Services', departmentCode: 'ADM', status: 'Approved', date: '2026-10-02', summary: 'Physical inspection report of computer labs, air purification, and power generators.' }
      ];
      documents = [
        { id: 'doc-adm-1', title: 'Facility Standard Operating Procedures & Asset Register', category: 'Operations', department: 'Administration', departmentCode: 'ADM', lastUpdated: '2026-08-20', size: '3.1 MB', status: 'Active', referenceNo: 'DST/ADM/SOP-01', accessTier: 'Departmental' }
      ];
      recentActivities = [
        { id: 'act-adm-1', action: 'Completed Bi-Annual Lab Hardware Inspection', user: 'HOD Administration', role: 'HOD Administration', department: 'Administrative Services', timestamp: '4 hours ago', status: 'Completed', category: 'task', details: 'All 60 student desktop workstations certified.' }
      ];
      departmentInfo = {
        name: 'Administrative Services',
        head: 'Head of Department (ADM)',
        code: 'ADM',
        staffCount: 8,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 4,
        operationalStatus: 'Fully Operational',
        description: 'Manages physical and digital workplace infrastructure, real estate leases, asset registries, procurement workflows, and vendor logistics.',
        coreMandates: ['Maintaining facility uptime', 'Managing corporate logistics', 'Overseeing IT equipment procurement'],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, Administration', email: 'dstechadminoffice@gmail.com', status: 'Active' },
          { name: 'Facilities Supervisor', role: 'Workplace & Logistics Officer', email: 'logistics.adm@dstechagency.com', status: 'Active' }
        ]
      };
    } else if (deptCode === 'BIZ') {
      reports = [
        { id: 'rep-biz-1', title: 'Q3 Enterprise Client Engagements & Pipeline Report', period: 'Q3 2026', submittedBy: 'HOD Business Development', department: 'Business Development', departmentCode: 'BIZ', status: 'Approved', date: '2026-10-03', summary: 'Detailed performance breakdown of custom software development and academy enterprise training.' }
      ];
      documents = [
        { id: 'doc-biz-1', title: 'DS Tech Enterprise Rate Card & Service Level Matrix 2026', category: 'Commercial', department: 'Business Development', departmentCode: 'BIZ', lastUpdated: '2026-09-12', size: '1.8 MB', status: 'Active', referenceNo: 'DST/BIZ/RATE-26', accessTier: 'Departmental' }
      ];
      recentActivities = [
        { id: 'act-biz-1', action: 'Delivered Custom Software Demo to FinTech Client', user: 'HOD BizDev', role: 'HOD BizDev', department: 'Business Development', timestamp: '2 hours ago', status: 'Negotiating', category: 'task', details: 'Presented automated payroll and biometric verification architecture.' }
      ];
      departmentInfo = {
        name: 'Business Development',
        head: 'Head of Department (BIZ)',
        code: 'BIZ',
        staffCount: 7,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 8,
        operationalStatus: 'High Growth',
        description: 'Drives commercial client acquisitions, enterprise B2B software sales, corporate workforce upskilling partnerships, and strategic alliances.',
        coreMandates: ['Expanding client base', 'Authoring technical bids and RFPs', 'Client relationship management'],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, Business Development', email: 'dstechbusinessoffice@gmail.com', status: 'Active' },
          { name: 'Enterprise Sales Lead', role: 'Senior Commercial Accounts Manager', email: 'sales.biz@dstechagency.com', status: 'Active' }
        ]
      };
    } else if (deptCode === 'FIN') {
      reports = [
        { id: 'rep-fin-1', title: 'Monthly Expenditure & Cashflow Operating Statement (Sept 2026)', period: 'September 2026', submittedBy: 'HOD Accounting & Finance', department: 'Accounting and Finance', departmentCode: 'FIN', status: 'Approved', date: '2026-10-03', summary: 'Reconciliation of student course fees, enterprise retainers, and operating expenses.' }
      ];
      documents = [
        { id: 'doc-fin-1', title: 'FIRS Tax Clearance Certificate & SCUML Filing 2026', category: 'Taxation', department: 'Finance', departmentCode: 'FIN', lastUpdated: '2026-09-01', size: '1.4 MB', status: 'Active', referenceNo: 'TIN-24892019-0001', accessTier: 'Departmental' }
      ];
      recentActivities = [
        { id: 'act-fin-1', action: 'Approved Faculty Honoraria Payout Schedule', user: 'HOD Finance', role: 'HOD Finance', department: 'Accounting and Finance', timestamp: '1 hour ago', status: 'Disbursed', category: 'finance', details: 'Transferred instructor fees for completed 1-Month and 3-Month cohorts.' }
      ];
      departmentInfo = {
        name: 'Accounting and Finance',
        head: 'Head of Department (FIN)',
        code: 'FIN',
        staffCount: 6,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 3,
        operationalStatus: 'Audit Verified',
        description: 'Manages corporate financial accounting, revenue reconciliation, Paystack payment webhooks, tuition fee invoicing, budgeting controls, and statutory tax compliance.',
        coreMandates: ['Maintaining double-entry ledgers', 'Supervising Paystack payment integrations', 'Ensuring prompt filing of FIRS VAT & CIT'],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, Accounting & Finance', email: 'dstechfinanceoffice@gmail.com', status: 'Active' },
          { name: 'Senior Treasury Accountant', role: 'Payroll & Ledger Officer', email: 'accounts.fin@dstechagency.com', status: 'Active' }
        ]
      };
    } else if (deptCode === 'CMD') {
      reports = [
        { id: 'rep-cmd-1', title: 'Monthly Digital Advertising ROAS & Conversion Performance', period: 'September 2026', submittedBy: 'HOD Creative Media', department: 'Creative Media and Digital Marketing', departmentCode: 'CMD', status: 'Approved', date: '2026-10-02', summary: 'Analysis of course inquiries and paid student conversion funnels.' }
      ];
      documents = [
        { id: 'doc-cmd-1', title: 'DS Tech Brand Identity Guide & Creative Assets Kit 2026', category: 'Branding', department: 'Creative Media', departmentCode: 'CMD', lastUpdated: '2026-08-10', size: '6.2 MB', status: 'Active', referenceNo: 'DST/CMD/BRAND-26', accessTier: 'Departmental' }
      ];
      recentActivities = [
        { id: 'act-cmd-1', action: 'Published Q4 Video Campaign on Official Channels', user: 'HOD Creative Media', role: 'HOD Creative Media', department: 'Creative Media and Digital Marketing', timestamp: '5 hours ago', status: 'Published', category: 'task', details: 'Spotlight on student software project showcases and instructor feedback.' }
      ];
      departmentInfo = {
        name: 'Creative Media and Digital Marketing',
        head: 'Head of Department (CMD)',
        code: 'CMD',
        staffCount: 10,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 7,
        operationalStatus: 'Campaigns Active',
        description: 'Directs digital performance advertising, brand visual design, multimedia production, content marketing funnels, and public relations communications.',
        coreMandates: ['Executing high-ROI paid ad campaigns', 'Producing photographic and video assets', 'Scaling organic social audience engagement'],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, Creative Media', email: 'dstechanddigitalltd@gmail.com', status: 'Active' },
          { name: 'Creative Lead', role: 'Senior Motion Designer & Brand Strategist', email: 'creative.cmd@dstechagency.com', status: 'Active' }
        ]
      };
    } else if (deptCode === 'ITD') {
      reports = [
        { id: 'rep-it-1', title: 'Monthly Enterprise Platform Reliability & Security Audit', period: 'September 2026', submittedBy: 'HOD Information Technology', department: 'Information Technology', departmentCode: 'ITD', status: 'Approved', date: '2026-10-01', summary: 'System availability, DDoS mitigation events, and container performance benchmarks.' }
      ];
      documents = [
        { id: 'doc-it-1', title: 'Information Security & Cloud Infrastructure Architecture', category: 'Technical', department: 'IT', departmentCode: 'ITD', lastUpdated: '2026-08-30', size: '4.5 MB', status: 'Active', referenceNo: 'DST/IT/ARCH-01', accessTier: 'Departmental' }
      ];
      recentActivities = [
        { id: 'act-it-1', action: 'Applied Security Patch to Production Server', user: 'HOD IT', role: 'HOD IT', department: 'Information Technology', timestamp: '1 hour ago', status: 'Deployed', category: 'tech', details: 'Hardened cryptographic session validation and token revocation.' }
      ];
      departmentInfo = {
        name: 'Information Technology',
        head: 'Head of Department (ITD)',
        code: 'ITD',
        staffCount: 9,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 6,
        operationalStatus: 'Systems Resilient',
        description: 'Maintains enterprise servers, cloud databases, cybersecurity perimeters, web portal availability, CI/CD pipelines, and internal IT workstation connectivity.',
        coreMandates: ['Ensuring 99.9%+ availability for public web and internal portal systems', 'Enforcing zero-trust firewalls', 'Automating code deployments'],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, Information Technology', email: 'dstechitoffice@gmail.com', status: 'Active' },
          { name: 'Senior Cloud Engineer', role: 'DevOps & Security Specialist', email: 'devops.it@dstechagency.com', status: 'Active' }
        ]
      };
    } else if (deptCode === 'AIC') {
      reports = [
        { id: 'rep-aic-1', title: 'AI Assistant Performance & Automated Tutoring Analytics', period: 'Q3 2026', submittedBy: 'HOD AI & Creative Tech', department: 'AI and Creative Technology', departmentCode: 'AIC', status: 'Approved', date: '2026-10-02', summary: 'Student learning trajectory enhancement using Gemini-powered conversational agents.' }
      ];
      documents = [
        { id: 'doc-aic-1', title: 'Responsible AI Deployment & Data Privacy Framework', category: 'Research', department: 'AI & Creative Tech', departmentCode: 'AIC', lastUpdated: '2026-09-05', size: '2.8 MB', status: 'Active', referenceNo: 'DST/AIC/ETHICS-01', accessTier: 'Departmental' }
      ];
      recentActivities = [
        { id: 'act-aic-1', action: 'Enhanced Multilingual System Prompts', user: 'HOD AI Tech', role: 'HOD AI Tech', department: 'AI and Creative Technology', timestamp: '2 hours ago', status: 'Verified', category: 'tech', details: 'Added localized technical guidance across English, Hausa, Yoruba, and French.' }
      ];
      departmentInfo = {
        name: 'AI and Creative Technology',
        head: 'Head of Department (AIC)',
        code: 'AIC',
        staffCount: 7,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 5,
        operationalStatus: 'Active Innovation',
        description: 'Pioneers proprietary artificial intelligence solutions, agentic workflows, conversational academic tutors, multimodal systems, and advanced generative technology.',
        coreMandates: ['Building enterprise AI assistants powered by Gemini', 'Integrating intelligent tutoring tools into the Academy', 'Ensuring ethical AI compliance'],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, AI & Creative Tech', email: 'dstechaitechoffice@gmail.com', status: 'Active' },
          { name: 'AI Research Engineer', role: 'Creative Technologist & Prompt Architect', email: 'prompt.aic@dstechagency.com', status: 'Active' }
        ]
      };
    } else {
      // Default to Legal (LGC)
      reports = [
        { id: 'rep-lgc-1', title: 'Annual Corporate Governance & Statutory Compliance Audit', period: '2026 Statutory', submittedBy: 'HOD Legal & Compliance', department: 'Legal and Compliance', departmentCode: 'LGC', status: 'Approved', date: '2026-09-25', summary: 'Validation of CAC RC registration, TIN standing, and SCUML compliance.' }
      ];
      documents = [
        { id: 'doc-lgc-1', title: 'CAC Official Certificate of Incorporation', category: 'Statutory', department: 'Legal', departmentCode: 'LGC', lastUpdated: '2026-06-15', size: '2.4 MB', status: 'Active', referenceNo: 'CAC/STATUTORY', accessTier: 'Departmental' }
      ];
      recentActivities = [
        { id: 'act-lgc-1', action: 'Executed Client Service Agreement', user: 'HOD Legal', role: 'HOD Legal', department: 'Legal and Compliance', timestamp: '4 hours ago', status: 'Executed', category: 'compliance', details: 'Finalized enterprise software development retainer agreement.' }
      ];
      departmentInfo = {
        name: 'Legal and Compliance',
        head: 'Head of Department (LGC)',
        code: 'LGC',
        staffCount: 5,
        budgetYear: 'FY 2026 / 2027',
        activeProjects: 4,
        operationalStatus: 'Compliant & Certified',
        description: 'Safeguards corporate legal standing, enforces regulatory compliance with Corporate Affairs Commission, drafts client agreements, and governs intellectual property protection.',
        coreMandates: ['Maintaining full regulatory compliance with CAC and SCUML', 'Drafting enterprise MSAs and SLAs', 'Governing NDPR data privacy compliance'],
        teamMembers: [
          { name: 'Head of Department', role: 'Head of Department, Legal & Compliance', email: 'dstechlegaloffice@gmail.com', status: 'Active' },
          { name: 'Legal Associate', role: 'Corporate Regulatory Counsel', email: 'legal.counsel@dstechagency.com', status: 'Active' }
        ]
      };
    }
  }

  // Dynamic department performance calculated from current active task set
  const departmentPerformance = calculateDepartmentPerformance(isCeo ? tasks : MASTER_MANAGEMENT_TASKS);

  // Live operational metrics strictly derived from active management state
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100;

  stats = [
    {
      id: 'stat-active-tasks',
      label: 'Pending Deliverables',
      value: `${pendingTasksCount} Active`,
      change: `${tasks.length} Total Assigned`,
      trend: pendingTasksCount > 0 ? 'up' : 'neutral',
      description: isCeo ? 'Organization-wide tasks' : 'Departmental deliverables'
    },
    {
      id: 'stat-completed-tasks',
      label: 'Completed Tasks',
      value: `${completedTasksCount} Done`,
      change: `${completionRate}% Completion Rate`,
      trend: 'up',
      description: 'Closed assignments'
    },
    {
      id: 'stat-reports',
      label: 'Official Reports',
      value: `${reports.length} Filed`,
      change: `${reports.filter(r => r.status === 'Approved').length} Approved`,
      trend: 'up',
      description: 'Submitted audit & operational records'
    },
    {
      id: 'stat-documents',
      label: 'Corporate Documents',
      value: `${documents.length} Records`,
      change: 'Active Vault',
      trend: 'neutral',
      description: 'Statutory and operational files'
    }
  ];

  return {
    role: meta.code,
    user,
    stats,
    departmentInfo,
    recentActivities,
    tasks,
    reports,
    documents,
    announcements: DEFAULT_ANNOUNCEMENTS,
    notifications: DEFAULT_NOTIFICATIONS,
    meetings: DEFAULT_MEETINGS,
    departmentPerformance,
    executiveOverview: isCeo ? {
      totalDepartments: 9,
      totalStaff: 68,
      pendingExecutiveReports: 2,
      scheduledBoardMeetings: 3
    } : undefined
  };
}
