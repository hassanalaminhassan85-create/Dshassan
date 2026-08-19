import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  TrendingUp,
  Briefcase,
  CreditCard,
  Award,
  Scroll,
  Settings,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Download,
  Upload,
  User,
  ShieldCheck,
  Building,
  Video,
  MapPin,
  Sparkles,
  ArrowRight,
  BookCheck,
  GraduationCap,
  Users,
  Check,
  X,
  FileCheck,
  DollarSign,
  QrCode,
  Share2,
  Printer,
  Copy,
  Info,
  HelpCircle,
  Flame,
  Globe,
  Lock,
  Layers,
  BarChart3,
  CalendarDays,
  PlayCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ACADEMY_COURSES, AcademyCourse } from '../lib/academyCoursesData';

interface StudentDashboardProps {
  onBackToPortal?: () => void;
  onNavigatePathway?: (route: string) => void;
}

// Student Handbook Data from PDF 1
export const STUDENT_HANDBOOK_TOPICS = [
  {
    id: 'admission',
    title: '1. Admission & Registration Procedures',
    desc: 'Formal acceptance, ID number issuance (DSTA-STU), enrollment docket verification, and cohort registration across physical hubs (Abuja/Adamawa) or virtual classrooms.'
  },
  {
    id: 'calendar',
    title: '2. Academic Calendar & Class Schedules',
    desc: 'Semester milestones, physical cohort weekdays, weekend executive streams, and virtual evening sessions strictly adhering to Greenwich Mean Time + 1 (WAT).'
  },
  {
    id: 'attendance',
    title: '3. Attendance & Participation Requirements (80% Minimum)',
    desc: 'Mandatory 80% attendance is strictly enforced for graduation eligibility. Every lecture incorporates biometric/live check-in and practical classroom exercises.'
  },
  {
    id: 'tuition',
    title: '4. Tuition & Payment Obligations',
    desc: 'Tuition fees must be settled prior to course commencement or in approved tranches (70% initial deposit and 30% mid-program balance) before examination clearance.'
  },
  {
    id: 'assignments',
    title: '5. Practical Assignments & Assessments (70/30 Model)',
    desc: 'The Academy implements a 70% practical project and 30% theoretical knowledge framework. Every module culminates in real-world codebase or design asset deliverables.'
  },
  {
    id: 'facilities',
    title: '6. Use of Academy Facilities & Resources',
    desc: 'Access to high-speed fiber internet, dedicated computer labs, cloud sandbox servers, hardware development kits, and digital repository libraries.'
  },
  {
    id: 'conduct',
    title: '7. Code of Conduct & Disciplinary Procedures',
    desc: 'Zero tolerance for plagiarism, examination malpractice, harassment, cyber offenses, or unauthorized distribution of proprietary Academy curriculum materials.'
  },
  {
    id: 'internship',
    title: '8. Internship & Mentorship Opportunities',
    desc: 'Eligible students in 6-month diploma cohorts gain direct access to 3-6 month corporate internship placements at DS Tech Agency and enterprise partners.'
  },
  {
    id: 'certification',
    title: '9. Certification Requirements',
    desc: 'Conferment of Diploma or Certificate requires passing all module assessments, 80% attendance, completing compulsory capstone/internship, and fee clearance.'
  },
  {
    id: 'welfare',
    title: '10. Student Welfare, Complaints & Communication',
    desc: 'Structured grievance escalation, academic counseling, peer study circles, and dedicated WhatsApp Admissions/Dean help desks.'
  }
];

// Student Benefits (12 from PDF 1)
export const STUDENT_BENEFITS = [
  { id: 1, title: 'Practical 70/30 Training', desc: 'Hands-on focus with 70% real-world projects and 30% foundational theory.' },
  { id: 2, title: 'Flexible Delivery Modes', desc: 'Seamless choice between Physical Hubs (Abuja/Yola), Virtual, and Hybrid streams.' },
  { id: 3, title: 'Cross-Industry Program Catalog', desc: 'Access to 115+ specialized courses spanning Software, AI, Cyber, Media & Design.' },
  { id: 4, title: 'Verifiable Professional Certification', desc: 'QR-coded, tamper-proof credentials recognized by global tech recruiters.' },
  { id: 5, title: 'Production Portfolio Building', desc: 'Graduate with deployed applications, live client projects, and verified GitHub repos.' },
  { id: 6, title: 'Direct Internship & Mentorship', desc: 'Guaranteed 3-6 month corporate placement pipeline for top-tier graduates.' },
  { id: 7, title: 'Job & Freelance Pipeline', desc: 'Exclusive access to DS Tech Agency freelance contracts and international job boards.' },
  { id: 8, title: 'Career & Business Incubation', desc: 'Resume audits, mock technical interviews, and tech startup incubation grants.' },
  { id: 9, title: 'Scholarship Grants for 6-Month Diplomas', desc: 'Tuition assistance awards for high-potential youth and underrepresented talents.' },
  { id: 10, title: 'Pan-African Tech Alumni Network', desc: 'Join over 4,500+ active developers, designers, and tech entrepreneurs.' },
  { id: 11, title: 'Exposure to AI & Emerging Tech', desc: 'Hands-on training in Generative AI, Cloud Infrastructure, and Agentic Workflows.' },
  { id: 12, title: 'Multilingual Inclusivity', desc: 'Supplementary course materials in English, Hausa, Yoruba, and Igbo.' }
];

// Certification Requirements (7 from PDF 1)
export const CERTIFICATION_REQUIREMENTS = [
  { id: 1, title: 'Complete Curriculum', desc: 'Successfully complete all approved program curriculum modules and capstones.' },
  { id: 2, title: '80% Attendance Threshold', desc: 'Maintain a minimum cumulative attendance record of 80% across all lectures.' },
  { id: 3, title: 'Pass All Practical Assignments', desc: 'Submit and achieve passing scores in all practical assessments and code reviews.' },
  { id: 4, title: 'Compulsory Capstone / Internship', desc: 'Successfully complete the practical capstone project or corporate internship.' },
  { id: 5, title: 'Professional Conduct', desc: 'Demonstrate satisfactory ethical, professional, and disciplinary standing.' },
  { id: 6, title: 'Property Clearance', desc: 'Return any Academy laboratory equipment, books, or devices issued during the term.' },
  { id: 7, title: 'Tuition Settlement', desc: 'Settle all outstanding tuition balance and laboratory fees in full.' }
];

// Academy Responsibilities (10 from PDF 1)
export const ACADEMY_RESPONSIBILITIES = [
  { id: 1, title: 'High-Quality Practical Instruction', desc: 'Deliver industry-aligned curriculum using contemporary engineering standards.' },
  { id: 2, title: 'Qualified Faculty & Mentors', desc: 'Provide certified subject matter experts and dedicated tutorial assistants.' },
  { id: 3, title: 'Continuous Content Modernization', desc: 'Regularly update course syllabi to incorporate emerging tools and frameworks.' },
  { id: 4, title: 'Secure Academic Records', desc: 'Maintain digital transcript records and tamper-proof verification registries.' },
  { id: 5, title: 'World-Class Learning Infrastructure', desc: 'Equip physical innovation hubs and reliable virtual interactive portals.' },
  { id: 6, title: 'Fair Assessments & Certification', desc: 'Conduct standardized assessments and issue globally verifiable credentials.' },
  { id: 7, title: 'Internship & Career Facilitation', desc: 'Connect eligible graduates to verified industry placement partners.' },
  { id: 8, title: 'Strategic Industry Alliances', desc: 'Partner with international tech firms, government ministries, and universities.' },
  { id: 9, title: 'Transparent Policy Communication', desc: 'Clearly publish academic schedules, fee structures, and code of conduct rules.' },
  { id: 10, title: 'Uphold Integrity & Innovation', desc: 'Foster an inclusive ecosystem built on ethical engineering and high standards.' }
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBackToPortal, onNavigatePathway }) => {
  // Navigation State
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'courses' | 'timetable' | 'assignments' | 'materials' | 'progress' | 'payments' | 'certificate' | 'handbook' | 'settings'
  >('dashboard');

  // Student Profile Context
  const [studentProfile, setStudentProfile] = useState({
    name: 'Aisha Bello Mohammed',
    studentId: 'DSTA-STU/2026/89421',
    email: 'aisha.mohammed@student.dstech.agency',
    phone: '+234 803 456 7890',
    program: 'Diploma in Full-Stack Web Development',
    courseCode: 'DSTA-SWE01',
    mode: 'Physical (Abuja Central Innovation Hub)',
    cohort: 'Cohort 2026-A (Q1-Q2)',
    attendanceRate: 92.5,
    overallGrade: 'A (88.4%)',
    completedCredits: 18,
    totalCredits: 24,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Assignment Due Soon', desc: 'Full-Stack React E-Commerce Capstone is due Friday at 11:59 PM.', time: '2 hours ago', unread: true },
    { id: '2', title: 'Tuition Payment Confirmed', desc: 'Your 70% enrollment deposit (₦140,000) was verified by Bursary.', time: '1 day ago', unread: false },
    { id: '3', title: 'New Masterclass Announced', desc: 'AI Agents in Next.js 15 Masterclass with Lead Trainer David Alao.', time: '3 days ago', unread: false }
  ]);

  // Selected Course Detail Modal
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<any | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    amount: '60000',
    paymentType: 'balance', // 'balance' or 'full'
    method: 'bank_transfer',
    proofFile: null as File | null,
    referenceCode: 'DSTA-PAY-2026-88912',
    isSubmitting: false,
    submittedSuccess: false
  });

  // Current DateTime string
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Enrolled Courses Data
  const enrolledCourses = [
    {
      id: 'dsta-swe01',
      code: 'DSTA-SWE01',
      title: 'Full-Stack Web Development (MERN / Next.js)',
      instructor: 'Engr. David Alao',
      progress: 78,
      totalModules: 12,
      completedModules: 9,
      nextClass: 'Today, 4:00 PM (WAT)',
      room: 'Lab 3 / Virtual Zoom A',
      mode: 'Hybrid',
      grade: '88% (A)',
      status: 'Active',
      modules: [
        { id: 'm1', title: 'Module 1: Advanced Modern JavaScript & TypeScript Engine', status: 'Completed', score: '95%' },
        { id: 'm2', title: 'Module 2: React 18, State Architecture & Motion UI', status: 'Completed', score: '92%' },
        { id: 'm3', title: 'Module 3: Full-Stack Next.js 15, SSR & Server Actions', status: 'Completed', score: '88%' },
        { id: 'm4', title: 'Module 4: Node.js, Express & Microservices REST APIs', status: 'Completed', score: '84%' },
        { id: 'm5', title: 'Module 5: PostgreSQL, Drizzle ORM & Cloud Database', status: 'In Progress', score: 'Ongoing' },
        { id: 'm6', title: 'Module 6: Capstone Project: Enterprise SaaS Deployment', status: 'Locked', score: '-' }
      ],
      materials: [
        { title: 'Lecture 12 Slide Deck: Database Migration Patterns', type: 'PDF', size: '3.4 MB' },
        { title: 'Sample Starter Repository (GitHub)', type: 'Code', size: '12.1 MB' },
        { title: 'Recording: Real-Time WebSockets & Event Streaming', type: 'Video', size: '142 MB' }
      ]
    },
    {
      id: 'dsta-ai01',
      code: 'DSTA-AI01',
      title: 'Artificial Intelligence & Gemini Agent Engineering',
      instructor: 'Dr. Amina Yusuf',
      progress: 65,
      totalModules: 8,
      completedModules: 5,
      nextClass: 'Tomorrow, 10:00 AM (WAT)',
      room: 'AI & High Performance Computing Lab',
      mode: 'Physical',
      grade: '91% (A+)',
      status: 'Active',
      modules: [
        { id: 'aim1', title: 'Module 1: Foundations of LLMs & Prompt Engineering', status: 'Completed', score: '96%' },
        { id: 'aim2', title: 'Module 2: Embeddings, Vector Databases & RAG Pipelines', status: 'Completed', score: '90%' },
        { id: 'aim3', title: 'Module 3: Google GenAI SDK & Function Calling Orchestration', status: 'In Progress', score: 'Ongoing' },
        { id: 'aim4', title: 'Module 4: Autonomous Agent Loops & Memory State', status: 'Locked', score: '-' }
      ],
      materials: [
        { title: 'Gemini 2.5 Flash Architecture Whitepaper', type: 'PDF', size: '1.8 MB' },
        { title: 'Vector Search Indexing Code Snippets', type: 'Jupyter Notebook', size: '4.2 MB' }
      ]
    },
    {
      id: 'dsta-cyb01',
      code: 'DSTA-CYB01',
      title: 'Cybersecurity Fundamentals & Threat Modeling',
      instructor: 'Kazeem Oladipo (CISSP)',
      progress: 85,
      totalModules: 6,
      completedModules: 5,
      nextClass: 'Thursday, 2:00 PM (WAT)',
      room: 'Virtual Room B',
      mode: 'Virtual',
      grade: '86% (B+)',
      status: 'Active',
      modules: [
        { id: 'cyb1', title: 'Module 1: Network Protocols, Wireshark & TCP Analysis', status: 'Completed', score: '88%' },
        { id: 'cyb2', title: 'Module 2: Web Vulnerabilities (OWASP Top 10)', status: 'Completed', score: '90%' },
        { id: 'cyb3', title: 'Module 3: Identity & Biometric Security Systems', status: 'Completed', score: '82%' },
        { id: 'cyb4', title: 'Module 4: Incident Response & PenTesting Labs', status: 'In Progress', score: 'Ongoing' }
      ],
      materials: [
        { title: 'OWASP Security Checklist & Audit Guide', type: 'PDF', size: '2.1 MB' }
      ]
    }
  ];

  // Upcoming Classes Carousel Data
  const upcomingClasses = [
    {
      id: 'uc1',
      code: 'DSTA-SWE01',
      title: 'Database Normalization & Drizzle Transactions',
      time: 'Today • 4:00 PM - 6:00 PM',
      mode: 'Physical (Lab 3) + Zoom Link',
      instructor: 'Engr. David Alao',
      joinUrl: 'https://zoom.us',
      isLiveSoon: true
    },
    {
      id: 'uc2',
      code: 'DSTA-AI01',
      title: 'Grounding Gemini with Custom Knowledge Bases',
      time: 'Tomorrow • 10:00 AM - 12:30 PM',
      mode: 'Physical (Main AI Lab)',
      instructor: 'Dr. Amina Yusuf',
      joinUrl: '#',
      isLiveSoon: false
    },
    {
      id: 'uc3',
      code: 'DSTA-CYB01',
      title: 'Penetration Testing Lab: Ethical Exploit Simulation',
      time: 'Thursday • 2:00 PM - 4:30 PM',
      mode: 'Virtual Evening Stream',
      instructor: 'Kazeem Oladipo',
      joinUrl: 'https://meet.google.com',
      isLiveSoon: false
    }
  ];

  // Assignments Data
  const assignments = [
    {
      id: 'asg-1',
      courseCode: 'DSTA-SWE01',
      title: 'E-Commerce Microservice with Stripe & Paystack Webhooks',
      dueDate: 'Aug 22, 2026 (In 3 Days)',
      weight: '15% of Final Grade',
      status: 'Pending',
      submittedDate: null,
      grade: null
    },
    {
      id: 'asg-2',
      courseCode: 'DSTA-AI01',
      title: 'RAG Retrieval System using LangChain & Pinecone',
      dueDate: 'Aug 15, 2026',
      weight: '10% of Final Grade',
      status: 'Submitted',
      submittedDate: 'Aug 14, 2026',
      grade: '94/100 (A)'
    },
    {
      id: 'asg-3',
      courseCode: 'DSTA-CYB01',
      title: 'OWASP Vulnerability Audit Report for Banking App',
      dueDate: 'Aug 08, 2026',
      weight: '15% of Final Grade',
      status: 'Graded',
      submittedDate: 'Aug 07, 2026',
      grade: '88/100 (A)'
    }
  ];

  // Chart Data for Progress
  const progressAnalyticsData = [
    { week: 'Week 1', score: 65, attendance: 100 },
    { week: 'Week 2', score: 72, attendance: 90 },
    { week: 'Week 3', score: 78, attendance: 95 },
    { week: 'Week 4', score: 82, attendance: 85 },
    { week: 'Week 5', score: 88, attendance: 92 },
    { week: 'Week 6', score: 91, attendance: 95 }
  ];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to clipboard.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-orange-500 selection:text-white">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Academy Brand Header in Sidebar */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/30">
                DS
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-white tracking-wide">DS TECH ACADEMY</h1>
                <p className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider">Student Portal</p>
              </div>
            </div>
          </div>

          {/* Student Profile Quick Snippet */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <img
              src={studentProfile.photoUrl}
              alt={studentProfile.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-orange-500/80 shadow-md"
            />
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-white truncate">{studentProfile.name}</h2>
              <p className="text-[10px] font-mono text-slate-400 truncate">{studentProfile.studentId}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[9px] text-emerald-400 font-medium">80% Att. OK (92.5%)</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveNav('courses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'courses'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookOpen size={16} />
              <span>My Courses</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-orange-400 font-mono">
                {enrolledCourses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveNav('timetable')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'timetable'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Calendar size={16} />
              <span>Timetable</span>
            </button>

            <button
              onClick={() => setActiveNav('assignments')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'assignments'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ClipboardList size={16} />
              <span>Assignments</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                1 Due
              </span>
            </button>

            <button
              onClick={() => setActiveNav('materials')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'materials'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FileText size={16} />
              <span>Materials</span>
            </button>

            <button
              onClick={() => setActiveNav('progress')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'progress'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <TrendingUp size={16} />
              <span>Progress & Grades</span>
            </button>

            <button
              onClick={() => {
                if (onNavigatePathway) {
                  onNavigatePathway('/internship-application');
                } else {
                  window.location.href = '/internship-application';
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 border border-blue-900/40 transition-all group"
            >
              <Briefcase size={16} className="group-hover:scale-110 transition-transform" />
              <span>Apply for Internship</span>
              <ExternalLink size={12} className="ml-auto opacity-70" />
            </button>

            <button
              onClick={() => setActiveNav('payments')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'payments'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <CreditCard size={16} />
              <span>Payments & Bursary</span>
            </button>

            <button
              onClick={() => {
                if (onNavigatePathway) {
                  onNavigatePathway('/scholarship-application');
                } else {
                  window.location.href = '/scholarship-application';
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/40 transition-all group"
            >
              <Award size={16} className="group-hover:scale-110 transition-transform" />
              <span>Scholarship Form</span>
              <ExternalLink size={12} className="ml-auto opacity-70" />
            </button>

            <button
              onClick={() => setActiveNav('certificate')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'certificate'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Scroll size={16} />
              <span>Certificate</span>
            </button>

            <button
              onClick={() => setActiveNav('handbook')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === 'handbook'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookCheck size={16} />
              <span>Student Handbook (PDF 1)</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
              activeNav === 'settings' ? 'text-orange-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              <span>Back to Academy Hub</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0 pb-16">
        {/* DASHBOARD HEADER */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">Welcome back, {studentProfile.name.split(' ')[0]}!</h1>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold border border-orange-500/30">
                  {studentProfile.studentId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{currentTime}</span>
                <span>•</span>
                <span className="text-orange-300 font-semibold">{studentProfile.program}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses, lessons, files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                title="Notifications"
              >
                <Bell size={16} />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-slate-900 animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                      <button
                        onClick={() =>
                          setNotifications(notifications.map((n) => ({ ...n, unread: false })))
                        }
                        className="text-[10px] text-orange-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            notif.unread ? 'bg-slate-800/80 border border-orange-500/30' : 'bg-slate-800/30'
                          }`}
                        >
                          <div className="font-bold text-slate-200">{notif.title}</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{notif.desc}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeNav === 'dashboard' && (
          <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
            {/* STATS ROW (4 CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Enrolled Courses */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-orange-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Courses</p>
                    <h3 className="text-2xl font-black text-white mt-1.5">{enrolledCourses.length} Active</h3>
                    <p className="text-[11px] text-orange-400 mt-1 font-medium">115+ Catalog Access</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen size={22} />
                  </div>
                </div>
              </div>

              {/* Card 2: Overall Progress */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</p>
                    <h3 className="text-2xl font-black text-white mt-1.5">76.3%</h3>
                    <p className="text-[11px] text-emerald-400 mt-1 font-medium">Graduation on Track</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp size={22} />
                  </div>
                </div>
              </div>

              {/* Card 3: Upcoming Classes */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Classes</p>
                    <h3 className="text-2xl font-black text-white mt-1.5">2 Today</h3>
                    <p className="text-[11px] text-blue-400 mt-1 font-medium">Next at 4:00 PM</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar size={22} />
                  </div>
                </div>
              </div>

              {/* Card 4: Pending Assignments */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Assignments</p>
                    <h3 className="text-2xl font-black text-white mt-1.5">1 Task</h3>
                    <p className="text-[11px] text-purple-400 mt-1 font-medium">Due in 3 Days</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ClipboardList size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* UPCOMING CLASSES CAROUSEL & SCHEDULE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarDays className="text-orange-400 w-5 h-5" />
                    <span>Upcoming Classes & Live Labs</span>
                  </h2>
                  <p className="text-xs text-slate-400">Join your live interactive physical hubs or virtual evening sessions.</p>
                </div>
                <button
                  onClick={() => setActiveNav('timetable')}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <span>Full Timetable</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold">
                          {cls.code}
                        </span>
                        {cls.isLiveSoon && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Starting Soon
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">{cls.title}</h4>
                      <div className="space-y-1 text-xs text-slate-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-500" />
                          <span>{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-500" />
                          <span>{cls.mode}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-slate-500" />
                          <span>{cls.instructor}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={cls.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-colors"
                    >
                      <PlayCircle size={14} />
                      <span>Join Class / Lab</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* MY COURSES SUMMARY GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-orange-400 w-5 h-5" />
                    <span>My Enrolled Courses</span>
                  </h2>
                  <p className="text-xs text-slate-400">Review your syllabus progress and capstone deliverables.</p>
                </div>
                <button
                  onClick={() => setActiveNav('courses')}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <span>View All ({enrolledCourses.length})</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 hover:border-orange-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-orange-400 font-mono text-[10px] font-bold border border-slate-700">
                          {course.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">{course.mode}</span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-400 mb-4">Instructor: {course.instructor}</p>

                      {/* Progress bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Progress</span>
                          <span className="font-bold text-white">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{course.completedModules} of {course.totalModules} modules completed</span>
                          <span className="text-emerald-400 font-bold">Grade: {course.grade}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCourseDetail(course)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <span>View Course Modules</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* BURSARY & TUITION SUMMARY CARD (70/30 RULE) */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <CheckCircle2 size={13} />
                  <span>Tuition Payment Status: 70% Initial Deposit Settled</span>
                </div>
                <h3 className="text-xl font-bold text-white">Tuition & Bursary Clearance (70% Paid / 30% Balance)</h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Per the Academy handbook, 70% tuition clears initial cohort admission, with the 30% final balance required prior to certification examination clearance.
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
                  <span className="text-slate-300">Total Tuition: <strong className="text-white">₦200,000</strong></span>
                  <span className="text-emerald-400">Paid: <strong>₦140,000 (70%)</strong></span>
                  <span className="text-amber-400">Outstanding: <strong>₦60,000 (30%)</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActiveNav('payments')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                >
                  <CreditCard size={15} />
                  <span>Settle Balance (₦60,000)</span>
                </button>
              </div>
            </div>

            {/* HANDBOOK HIGHLIGHTS & CODE OF CONDUCT SNIPPET */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Code of Conduct */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-orange-400">
                  <ShieldCheck size={20} />
                  <h3 className="text-base font-bold text-white">Academy Code of Conduct (PDF 1)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "DS Tech Academy is committed to maintaining a professional, respectful, disciplined, ethical, and safe learning environment. Students, instructors, staff, partners, and representatives are expected to uphold integrity, respect others, attend scheduled activities, protect Academy resources, maintain academic honesty, and comply with all approved policies and lawful instructions. Misconduct, including fraud, harassment, examination malpractice, cybercrime, violence, plagiarism, or misuse of Academy property and branding, may result in appropriate disciplinary action."
                </p>
                <button
                  onClick={() => setActiveNav('handbook')}
                  className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Read Full Student Handbook & 10 Responsibilities</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Box 2: 7 Certification Requirements */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Award size={20} />
                  <h3 className="text-base font-bold text-white">7 Certification Requirements</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>1. Successfully complete approved programme curriculum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>2. Maintain 80% minimum attendance record</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>3. Complete & pass all practical assignments (70/30 model)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>4. Complete compulsory corporate internship / capstone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>5. Satisfactory professional conduct & clearance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MY COURSES */}
        {activeNav === 'courses' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white">My Enrolled Courses</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active courses, module milestones, and laboratory resources under your student docket.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-mono text-xs font-bold border border-orange-500/30">
                        {course.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{course.mode}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-xs text-slate-400 mb-4">Faculty Lead: {course.instructor}</p>

                    <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Curriculum Progress</span>
                        <span className="font-bold text-orange-400">{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Modules: {course.completedModules}/{course.totalModules}</span>
                        <span className="text-emerald-400 font-bold">Grade: {course.grade}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 mb-4">
                      <div><strong>Next Class:</strong> {course.nextClass}</div>
                      <div><strong>Location:</strong> {course.room}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCourseDetail(course)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer"
                  >
                    <BookOpen size={15} />
                    <span>Open Course Syllabus</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: TIMETABLE */}
        {activeNav === 'timetable' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Academic Timetable & Lecture Schedule</h2>
              <p className="text-xs text-slate-400 mt-1">
                Synchronized class calendar across Physical Innovation Hubs (Abuja/Yola) and Virtual Streams.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Day / Time (WAT)</th>
                    <th className="p-4">Course Code</th>
                    <th className="p-4">Topic / Practical Lab</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Mode / Venue</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-orange-400">Monday • 4:00 PM - 6:00 PM</td>
                    <td className="p-4 font-mono font-bold text-white">DSTA-SWE01</td>
                    <td className="p-4 font-semibold text-white">PostgreSQL & Drizzle ORM Transactions</td>
                    <td className="p-4">Engr. David Alao</td>
                    <td className="p-4 text-slate-400">Physical (Lab 3, Abuja) + Zoom</td>
                    <td className="p-4">
                      <a
                        href="https://zoom.us"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <PlayCircle size={12} />
                        <span>Join</span>
                      </a>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-orange-400">Tuesday • 10:00 AM - 12:30 PM</td>
                    <td className="p-4 font-mono font-bold text-white">DSTA-AI01</td>
                    <td className="p-4 font-semibold text-white">Gemini GenAI SDK & Function Calling</td>
                    <td className="p-4">Dr. Amina Yusuf</td>
                    <td className="p-4 text-slate-400">Physical (AI Lab, Abuja)</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px] font-semibold">
                        In-Person
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-orange-400">Thursday • 2:00 PM - 4:30 PM</td>
                    <td className="p-4 font-mono font-bold text-white">DSTA-CYB01</td>
                    <td className="p-4 font-semibold text-white">Penetration Testing & Identity Defense</td>
                    <td className="p-4">Kazeem Oladipo</td>
                    <td className="p-4 text-slate-400">Virtual (Google Meet Room B)</td>
                    <td className="p-4">
                      <a
                        href="https://meet.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Video size={12} />
                        <span>Meet</span>
                      </a>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-orange-400">Saturday • 11:00 AM - 2:00 PM</td>
                    <td className="p-4 font-mono font-bold text-white">ALL COHORTS</td>
                    <td className="p-4 font-semibold text-white">Executive Masterclass & Capstone Mentorship</td>
                    <td className="p-4">Guest Industry Directors</td>
                    <td className="p-4 text-slate-400">Hybrid Auditorium + Live Stream</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-[11px] font-bold">
                        Masterclass
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: ASSIGNMENTS */}
        {activeNav === 'assignments' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Assignments & Practical Submissions</h2>
              <p className="text-xs text-slate-400 mt-1">
                Practical 70/30 project submissions, rubric grading, and instructor code reviews.
              </p>
            </div>

            <div className="space-y-4">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-orange-400 font-mono text-[10px] font-bold">
                        {asg.courseCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          asg.status === 'Graded'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : asg.status === 'Submitted'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {asg.status}
                      </span>
                      <span className="text-[11px] text-slate-500">{asg.weight}</span>
                    </div>

                    <h3 className="text-base font-bold text-white">{asg.title}</h3>
                    <p className="text-xs text-slate-400">
                      Due: <span className="font-semibold text-slate-200">{asg.dueDate}</span>
                      {asg.grade && (
                        <span className="ml-3 text-emerald-400 font-bold">Score: {asg.grade}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {asg.status === 'Pending' ? (
                      <button
                        onClick={() => alert('Assignment Upload Modal: Select GitHub URL or ZIP project file.')}
                        className="w-full md:w-auto py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20"
                      >
                        <Upload size={14} />
                        <span>Submit Deliverable</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('Viewing Submission Feedback & Code Annotations.')}
                        className="w-full md:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <FileCheck size={14} />
                        <span>View Review & Feedback</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: MATERIALS */}
        {activeNav === 'materials' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Course Materials & Resource Repository</h2>
              <p className="text-xs text-slate-400 mt-1">
                Official lecture notes, video recordings, whitepapers, starter code, and laboratory workbooks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.flatMap((c) =>
                c.materials.map((m, idx) => (
                  <div
                    key={`${c.id}-${idx}`}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-mono text-[10px] font-bold">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.size}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{m.title}</h4>
                      <p className="text-[11px] text-slate-400 mb-4">Format: {m.type}</p>
                    </div>

                    <button
                      onClick={() => alert(`Downloading ${m.title} (${m.size})`)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Download size={13} />
                      <span>Download Resource</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 6: PROGRESS & ANALYTICS */}
        {activeNav === 'progress' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Academic Progress & Gradebook Analytics</h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing attendance records, weekly assessment velocity, and certification readiness.
              </p>
            </div>

            {/* Visual Chart */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-orange-400 w-5 h-5" />
                <span>Weekly Assessment Performance (Average Score vs Attendance %)</span>
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressAnalyticsData}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="attColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="score" stroke="#f97316" fillOpacity={1} fill="url(#scoreColor)" name="Assessment Score %" />
                    <Area type="monotone" dataKey="attendance" stroke="#10b981" fillOpacity={1} fill="url(#attColor)" name="Attendance %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance & Certification Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-emerald-400 w-5 h-5" />
                  <span>80% Minimum Attendance Tracker</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Current Cumulative Attendance</span>
                      <span className="font-bold text-emerald-400">92.5% (Threshold: 80%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92.5%' }}></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You have attended 37 out of 40 scheduled lecture hours. Your attendance is in full compliance with the Academy graduation requirements.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="text-orange-400 w-5 h-5" />
                  <span>Cumulative Grade Point Average (GPA)</span>
                </h3>
                <div className="space-y-2">
                  <div className="text-3xl font-black text-white">4.62 / 5.00</div>
                  <p className="text-xs text-slate-400">Classification: <strong className="text-orange-400">Distinction (First Class Equivalent)</strong></p>
                  <p className="text-xs text-slate-400">
                    Eligible for top-tier corporate internship placement with DS Tech Agency Enterprise partners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: PAYMENTS & BURSARY */}
        {activeNav === 'payments' && (
          <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Payments & Bursary Ledger</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tuition fee summary, receipt generator, official bank accounts, and balance settlement (70/30 Rule).
              </p>
            </div>

            {/* Payment Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Total Approved Tuition</p>
                <h3 className="text-2xl font-black text-white mt-1">₦200,000</h3>
                <p className="text-[11px] text-slate-500 mt-1">6-Month Professional Diploma</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/50 bg-emerald-950/20">
                <p className="text-xs text-emerald-400 uppercase font-bold">Paid to Date (70%)</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">₦140,000</h3>
                <p className="text-[11px] text-emerald-300/80 mt-1">Verified Receipt #DSTA-REC-8902</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-900/50 bg-amber-950/20">
                <p className="text-xs text-amber-400 uppercase font-bold">Outstanding Balance (30%)</p>
                <h3 className="text-2xl font-black text-amber-400 mt-1">₦60,000</h3>
                <p className="text-[11px] text-amber-300/80 mt-1">Due before Final Capstone</p>
              </div>
            </div>

            {/* OFFICIAL BANK DETAILS BOX */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-orange-400" />
                  <h3 className="text-base font-bold text-white">Academy Official Bank Accounts</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Bursary Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-white">Zenith Bank Plc</span>
                    <button
                      onClick={() => handleCopyText('1019283746')}
                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">Account Name: <strong>DS Tech & Digital Marketing Ltd</strong></p>
                  <p className="text-xs font-mono text-orange-300">Account Number: <strong>1019283746</strong></p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-white">Access Bank Plc</span>
                    <button
                      onClick={() => handleCopyText('0812948172')}
                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">Account Name: <strong>DS Tech Academy Admissions</strong></p>
                  <p className="text-xs font-mono text-orange-300">Account Number: <strong>0812948172</strong></p>
                </div>
              </div>
            </div>

            {/* PAYMENT SUBMISSION FORM */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Submit Proof of Tuition Payment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Amount Paid (₦)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="card_paystack">Debit Card (Paystack Instant)</option>
                    <option value="ussd">USSD Banking</option>
                    <option value="pos_cash">In-Person POS at Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 text-xs">Upload Bank Teller / Transfer Receipt</label>
                <input
                  type="file"
                  onChange={(e) => setPaymentForm({ ...paymentForm, proofFile: e.target.files?.[0] || null })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setPaymentForm({ ...paymentForm, submittedSuccess: true });
                  alert('Payment receipt uploaded successfully! The Bursary desk will verify your payment within 4 business hours.');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Submit for Bursary Clearance</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 8: CERTIFICATE */}
        {activeNav === 'certificate' && (
          <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Digital Professional Certificate</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tamper-proof digital credentials verified on the DS Tech Academy Registry with QR verification.
              </p>
            </div>

            {/* Certificate Canvas Preview */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-4 border-amber-500/40 shadow-2xl relative overflow-hidden text-center space-y-6">
              <div className="absolute top-4 right-4 text-slate-600">
                <QrCode size={64} className="text-slate-500/40" />
              </div>

              <div className="space-y-1">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-600/30">
                  DS
                </div>
                <h3 className="text-xs font-mono tracking-widest text-amber-400 font-bold uppercase pt-2">
                  DS TECH & DIGITAL MARKETING LTD ACADEMY
                </h3>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">Certificate of Professional Completion</h1>
              </div>

              <p className="text-xs text-slate-400 uppercase tracking-widest">This is to officially certify that</p>
              
              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 underline decoration-amber-500/50 underline-offset-8">
                {studentProfile.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                has successfully fulfilled all curriculum, 80% minimum attendance, practical project capstones, and examination requirements for the 6-Month Professional Diploma in
              </p>

              <h3 className="text-xl font-bold text-white font-mono">{studentProfile.program} ({studentProfile.courseCode})</h3>

              <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
                <div>
                  <p className="font-mono text-slate-300 font-bold">Certificate ID: DSTA-CERT-2026-89421</p>
                  <p className="text-[10px] text-slate-500">Issued at Abuja Innovation Hub, Nigeria</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="font-serif italic text-white text-base">David Alao</div>
                    <p className="text-[10px] text-slate-400 border-t border-slate-700 pt-0.5">Director of Academics</p>
                  </div>
                  <div className="text-center">
                    <div className="font-serif italic text-white text-base">Hassan Al-Amin</div>
                    <p className="text-[10px] text-slate-400 border-t border-slate-700 pt-0.5">Managing Director & CEO</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Official PDF</span>
              </button>
              <button
                onClick={() => alert('Certificate Verification Link copied to clipboard!')}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2"
              >
                <Share2 size={15} />
                <span>Share Verification Link</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 9: STUDENT HANDBOOK (PDF 1) */}
        {activeNav === 'handbook' && (
          <div className="p-6 space-y-8 max-w-6xl mx-auto w-full">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold mb-2">
                <BookCheck size={14} />
                <span>Official PDF 1 Compliance Document</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Student Handbook & Academy Regulations</h2>
              <p className="text-xs text-slate-400 mt-1">
                Every enrolled student is expected to read, understand, and comply with all academic guidelines, rights, and policies.
              </p>
            </div>

            {/* Code of Conduct Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-orange-500/40 space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-orange-400 w-5 h-5" />
                <span>Official Code of Conduct (PDF 1)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                "DS Tech Academy is committed to maintaining a professional, respectful, disciplined, ethical, and safe learning environment. Students, instructors, staff, partners, and representatives are expected to uphold integrity, respect others, attend scheduled activities, protect Academy resources, maintain academic honesty, and comply with all approved policies and lawful instructions. Misconduct, including fraud, harassment, examination malpractice, cybercrime, violence, plagiarism, or misuse of Academy property and branding, may result in appropriate disciplinary action."
              </p>
            </div>

            {/* 10 Core Topics from PDF 1 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-orange-400 w-5 h-5" />
                <span>10 Student Handbook Policy Modules</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STUDENT_HANDBOOK_TOPICS.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <h4 className="text-sm font-bold text-white text-orange-300">{topic.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{topic.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 12 Student Benefits */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-amber-400 w-5 h-5" />
                <span>12 Key Student Benefits (PDF 1)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {STUDENT_BENEFITS.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                      {benefit.id}
                    </div>
                    <h5 className="text-xs font-bold text-white">{benefit.title}</h5>
                    <p className="text-[11px] text-slate-400">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 10 Academy Responsibilities */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building className="text-blue-400 w-5 h-5" />
                <span>10 Academy Responsibilities to Students (PDF 1)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACADEMY_RESPONSIBILITIES.map((resp) => (
                  <div
                    key={resp.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                  >
                    <h5 className="text-xs font-bold text-blue-300">{resp.id}. {resp.title}</h5>
                    <p className="text-[11px] text-slate-400">{resp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 10: SETTINGS */}
        {activeNav === 'settings' && (
          <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Student Account Settings</h2>
              <p className="text-xs text-slate-400 mt-1">Manage profile, biometric login credentials, and notification alerts.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Personal Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={studentProfile.name}
                    onChange={(e) => setStudentProfile({ ...studentProfile, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Student ID Code</label>
                  <input
                    type="text"
                    disabled
                    value={studentProfile.studentId}
                    className="w-full p-2.5 bg-slate-800/50 border border-slate-800 rounded-xl text-slate-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Student Email Address</label>
                  <input
                    type="email"
                    value={studentProfile.email}
                    onChange={(e) => setStudentProfile({ ...studentProfile, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={studentProfile.phone}
                    onChange={(e) => setStudentProfile({ ...studentProfile, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Profile settings updated successfully.')}
                className="py-2.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* COURSE DETAIL MODAL */}
      <AnimatePresence>
        {selectedCourseDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedCourseDetail(null)}
                className="absolute right-5 top-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>

              <div>
                <span className="px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 font-mono text-xs font-bold">
                  {selectedCourseDetail.code}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">{selectedCourseDetail.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Faculty Lead: {selectedCourseDetail.instructor}</p>
              </div>

              {/* Module List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Module Breakdown & Status</h4>
                <div className="space-y-2">
                  {selectedCourseDetail.modules.map((mod: any, idx: number) => (
                    <div
                      key={mod.id || idx}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {mod.status === 'Completed' ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : mod.status === 'In Progress' ? (
                          <Clock size={16} className="text-amber-400 shrink-0" />
                        ) : (
                          <Lock size={16} className="text-slate-500 shrink-0" />
                        )}
                        <span className="font-semibold text-white">{mod.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mod.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : mod.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {mod.status} ({mod.score})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Materials in Modal */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Course Downloads</h4>
                <div className="space-y-1.5">
                  {selectedCourseDetail.materials.map((mat: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300">{mat.title}</span>
                      <button
                        onClick={() => alert(`Downloading ${mat.title}`)}
                        className="text-orange-400 hover:text-orange-300 font-bold text-xs flex items-center gap-1"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
