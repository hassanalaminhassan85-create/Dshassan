import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Play, Award, Download, CheckCircle, GraduationCap, 
  ArrowRight, Users, Eye, HelpCircle, Trophy, UserCheck, ShieldAlert,
  Plus, Send, ClipboardList, TrendingUp, Sparkles, Check, CheckCircle2,
  Bookmark, User, FileText, AlertCircle, RefreshCw, Trash2, Edit, 
  Search, MessageSquare, Mail, Calendar, Sparkle, Globe, LayoutDashboard,
  ShieldCheck, Building, Video, Clock, MapPin, Upload, BookCheck,
  BarChart3, Settings, DollarSign, ExternalLink, QrCode, FileCheck, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { COURSES, Course, Lesson } from '../lib/data';

// Component interfaces aligning with existing database schema
interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: string;
  completed_lessons: string; // JSON array of string IDs
  assigned_tutor_id?: string;
  created_at: string;
}

interface Tutor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  bio: string;
  expertise: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Submission {
  id: string;
  enrollment_id: string;
  course_id: string;
  lesson_id: string;
  user_id: string;
  submission_text: string;
  submission_file_key?: string;
  grade?: string;
  feedback?: string;
  status: 'submitted' | 'graded';
  submitted_at: string;
  graded_at?: string;
}

interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  full_name: string;
  hash: string;
  issued_at: string;
}

// TUTOR HANDBOOK TOPICS (From PDF 1)
export const TUTOR_HANDBOOK_TOPICS = [
  {
    id: 'roles',
    title: '1. Instructor Roles & Responsibilities',
    desc: 'Lead interactive practical lectures, mentor students, guide capstone deliverables, uphold academy pedagogical standards, and ensure high learner retention.'
  },
  {
    id: 'prep',
    title: '2. Course Preparation & Delivery',
    desc: 'Prepare modular weekly lesson plans, configure live sandbox code repositories, verify lab hardware, and distribute slide decks 24 hours prior to session.'
  },
  {
    id: 'practical',
    title: '3. 70% Practical & 30% Theory Methodology',
    desc: 'Mandatory instructional model: maximum 30% conceptual foundations paired with 70% live hands-on coding, design prototyping, or vulnerability simulation.'
  },
  {
    id: 'materials',
    title: '4. Course Materials & Timetable Preparation',
    desc: 'Upload updated PDF workbooks, GitHub repositories, and recorded lecture backups to the Academy central LMS repository.'
  },
  {
    id: 'assessment',
    title: '5. Student Assessment & Rubric Grading',
    desc: 'Grade weekly milestone homework and capstones within 72 hours using standardized rubrics (Distinction A+, Credit B, Pass C).'
  },
  {
    id: 'records',
    title: '6. Attendance & Academic Records',
    desc: 'Enforce the 80% mandatory attendance threshold using biometric check-in or live virtual participation logs.'
  },
  {
    id: 'capstone',
    title: '7. Practical Projects & Capstone Supervision',
    desc: 'Supervise end-of-program portfolio deliverables ensuring production-grade deployment on Vercel, AWS, or GitHub.'
  },
  {
    id: 'mentorship',
    title: '8. Mentorship & Corporate Internship Pipeline',
    desc: 'Identify top 10% high-performing graduates and recommend them for DS Tech Agency enterprise placements and corporate client briefs.'
  },
  {
    id: 'conduct',
    title: '9. Professional Faculty Conduct & Ethics',
    desc: 'Uphold academic honesty, zero tolerance for harassment or favoritism, respect student intellectual property, and safeguard proprietary Academy curricula.'
  },
  {
    id: 'reporting',
    title: '10. Reporting & Communication Procedures',
    desc: 'Submit bi-weekly cohort progress reports to the Director of Academics and participate in monthly faculty curriculum review meetings.'
  },
  {
    id: 'standards',
    title: '11. Virtual, Physical & Hybrid Teaching Standards',
    desc: 'Maintain high-definition video feeds, clear audio acoustics, prompt chat moderation, and interactive whiteboard engagement.'
  }
];

// TUTOR BENEFITS (11 from PDF 1)
export const TUTOR_BENEFITS = [
  { id: 1, title: 'Flexible Teaching Streams', desc: 'Choice of weekday physical sessions, evening virtual cohorts, or weekend executive bootcamps.' },
  { id: 2, title: 'Industry-Relevant Curricula', desc: 'Deliver contemporary, demand-driven programs across 115+ specialized tech pathways.' },
  { id: 3, title: 'Professional Exposure & Network', desc: 'Connect with senior industry directors, government partners, and tech executives.' },
  { id: 4, title: 'Mentorship & Career Growth', desc: 'Access executive leadership training, pedagogy certifications, and global speaking slots.' },
  { id: 5, title: 'Direct Professional Opportunities', desc: 'Priority access to high-value DS Tech Agency client consulting contracts.' },
  { id: 6, title: 'Participation in Enterprise Labs', desc: 'Work on cutting-edge research, AI hackathons, and corporate incubator challenges.' },
  { id: 7, title: 'Professional Recognition & Awards', desc: 'Annual Faculty Excellence Awards, verified trainer badges, and publication credits.' },
  { id: 8, title: 'Cross-Faculty Collaboration', desc: 'Collaborate with multidisciplinary experts across Engineering, AI, Design, and Marketing.' },
  { id: 9, title: 'Course Development & Royalties', desc: 'Author proprietary specialized masterclasses and earn course creation royalties.' },
  { id: 10, title: 'Access to Global Community', desc: 'Join international developer guilds, developer circles, and partner events.' },
  { id: 11, title: 'Competitive Remuneration', desc: 'Top-tier milestone remuneration, hourly physical lab allowances, and capstone bonuses.' }
];

export const TutorDashboard: React.FC<{ onBackToPortal?: () => void }> = ({ onBackToPortal }) => {
  // Current Active Tutor User Context
  const [currentUser, setCurrentUser] = useState({
    id: 'usr_david',
    name: 'David Alao',
    email: 'david@dstech.agency',
    role: 'tutor'
  });

  // Database States
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [currentTutorProfile, setCurrentTutorProfile] = useState<Tutor | null>(null);

  // Functional & UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  
  // Navigation Tabs (Expanded to match PDF 1 Requirements)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'students' | 'submissions' | 'timetable' | 'materials' | 'reports' | 'handbook' | 'settings'
  >('overview');

  // Coursework Grading State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState('A');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Course Creator Form State
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    duration: '6 Months',
    level: 'All Levels' as 'Beginner' | 'Advanced' | 'All Levels',
    price: '₦200,000',
    category: 'web' as 'marketing' | 'web' | 'ai' | 'business' | 'compliance',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    lessons: [
      { title: 'Core Architectural Concepts (30% Theory)', duration: '1.5 Hours', content: 'Syntax, mental models, and theoretical benchmarks.' },
      { title: 'Practical Codebase Implementation (70% Hands-On)', duration: '3.5 Hours', content: 'Live building, database schema migration, and testing.' }
    ]
  });

  // Selected Student Details View Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');

  // Timetable items for Tutor
  const tutorSchedule = [
    {
      id: 'ts1',
      code: 'DSTA-SWE01',
      course: 'Full-Stack Web Development (Next.js 15 & PostgreSQL)',
      time: 'Monday • 4:00 PM - 6:00 PM (WAT)',
      venue: 'Physical Hub (Lab 3, Abuja) + Zoom Link',
      topic: 'Live Demo: Distributed Transactions & Drizzle Migrations',
      type: 'Physical / Hybrid',
      status: 'Upcoming Today'
    },
    {
      id: 'ts2',
      code: 'DSTA-AI01',
      course: 'Artificial Intelligence & Gemini Agent Engineering',
      time: 'Tuesday • 10:00 AM - 12:30 PM (WAT)',
      venue: 'Main AI & HPC Innovation Lab',
      topic: 'Hands-On: Autonomous Multi-Agent Routing Loops',
      type: 'Physical',
      status: 'Tomorrow'
    },
    {
      id: 'ts3',
      code: 'DSTA-CYB01',
      course: 'Cybersecurity Fundamentals & Threat Modeling',
      time: 'Thursday • 2:00 PM - 4:30 PM (WAT)',
      venue: 'Virtual Classroom (Google Meet)',
      topic: 'Live PenTesting: OWASP Injection Exploits & Remediation',
      type: 'Virtual',
      status: 'In 3 Days'
    },
    {
      id: 'ts4',
      code: 'DSTA-MAS01',
      course: 'Executive Masterclass: Enterprise System Architecture',
      time: 'Saturday • 11:00 AM - 2:00 PM (WAT)',
      venue: 'Main Auditorium + YouTube Live',
      topic: 'System Design for 1,000,000+ Concurrent Transactions',
      type: 'Executive',
      status: 'This Weekend'
    }
  ];

  // Faculty Uploaded Materials
  const [facultyMaterials, setFacultyMaterials] = useState([
    { id: 'm1', title: 'Full-Stack React & Node.js 70/30 Practical Curriculum', code: 'DSTA-SWE01', type: 'PDF Syallbus', size: '2.4 MB', downloads: 142 },
    { id: 'm2', title: 'Gemini 2.5 Agent Orchestration Starter Repo', code: 'DSTA-AI01', type: 'GitHub Repo', size: '8.1 MB', downloads: 98 },
    { id: 'm3', title: 'Ethical Hacking & Network Traffic Analysis Workbook', code: 'DSTA-CYB01', type: 'Lab Guide', size: '4.7 MB', downloads: 115 },
    { id: 'm4', title: 'Capstone Project Rubric & Industry Evaluation Scorecard', code: 'ALL COHORTS', type: 'PDF Rubric', size: '1.2 MB', downloads: 260 }
  ]);

  // Load Academy Data
  const fetchTutorWorkspaceData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch Courses
      const courseRes = await fetch('/api/courses');
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        if (courseData && courseData.length > 0) {
          setCourses(courseData);
        } else {
          setCourses(COURSES);
        }
      } else {
        setCourses(COURSES);
      }

      // 2. Fetch Enrollments
      const enrollRes = await fetch('/api/academy/enrollments');
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        setEnrollments(enrollData);
      } else {
        setEnrollments([
          { id: 'enr_1', user_id: 'usr_aisha', course_id: 'course_1', progress: 78, status: 'active', completed_lessons: '["les_1","les_2"]', created_at: new Date().toISOString() },
          { id: 'enr_2', user_id: 'usr_emeka', course_id: 'course_1', progress: 100, status: 'completed', completed_lessons: '["les_1","les_2","les_3"]', created_at: new Date().toISOString() },
          { id: 'enr_3', user_id: 'usr_fatima', course_id: 'course_2', progress: 65, status: 'active', completed_lessons: '["les_1"]', created_at: new Date().toISOString() },
          { id: 'enr_4', user_id: 'usr_tunde', course_id: 'course_3', progress: 85, status: 'active', completed_lessons: '["les_1","les_2"]', created_at: new Date().toISOString() },
        ]);
      }

      // 3. Submissions
      const subRes = await fetch('/api/academy/submissions');
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubmissions(subData);
      } else {
        setSubmissions([
          {
            id: 'sub_1',
            enrollment_id: 'enr_1',
            course_id: 'course_1',
            lesson_id: 'les_2',
            user_id: 'Aisha Bello Mohammed (DSTA-STU/89421)',
            submission_text: 'Completed PostgreSQL relational migration with Drizzle ORM schema validation. GitHub URL: https://github.com/aisha-mohammed/dsta-fullstack-capstone',
            status: 'submitted',
            submitted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          },
          {
            id: 'sub_2',
            enrollment_id: 'enr_3',
            course_id: 'course_2',
            lesson_id: 'aim3',
            user_id: 'Fatima Ibrahim (DSTA-STU/90114)',
            submission_text: 'Implemented Gemini 2.5 function calling agent that executes real-time database queries safely.',
            status: 'submitted',
            submitted_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
          }
        ]);
      }

      setCurrentTutorProfile({
        id: 'tut_david',
        user_id: currentUser.id,
        full_name: currentUser.name,
        email: currentUser.email,
        bio: 'Lead Trainer & Academic Coordinator at DS Tech Academy with over 10 years experience in full-stack architecture, distributed systems, and modern AI engineering.',
        expertise: 'Full-Stack Software Engineering, React/Next.js & AI Agent Systems',
        status: 'approved',
        created_at: new Date().toISOString()
      });
    } catch (err: any) {
      setCourses(COURSES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorWorkspaceData();
  }, []);

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === gradingSubmission.id
          ? {
              ...sub,
              status: 'graded',
              grade: gradeValue,
              feedback: gradeFeedback,
              graded_at: new Date().toISOString()
            }
          : sub
      )
    );

    setSuccessMessage(`Assessment graded with score "${gradeValue}" and feedback dispatched to student.`);
    setGradingSubmission(null);
    setGradeFeedback('');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(`Official compliance email dispatched to "${emailRecipient}".`);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Course = {
      id: `course_${Date.now()}`,
      title: newCourse.title,
      description: newCourse.description || 'Comprehensive 70/30 practical vocational curriculum.',
      duration: newCourse.duration,
      level: newCourse.level,
      price: newCourse.price,
      category: newCourse.category,
      image: newCourse.image,
      lessons: newCourse.lessons.map((l, idx) => ({
        id: `les_${idx + 1}`,
        title: l.title,
        duration: l.duration,
        content: l.content,
        completed: false
      }))
    };

    setCourses(prev => [created, ...prev]);
    setShowCourseCreator(false);
    setSuccessMessage(`Accredited curriculum "${created.title}" successfully published.`);
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  const chartSubmissionsRatio = [
    { name: 'Pending Review', value: pendingSubmissions.length, color: '#f59e0b' },
    { name: 'Graded & Cleared', value: Math.max(gradedSubmissions.length, 6), color: '#10b981' }
  ];

  const chartCourseEnrollments = [
    { name: 'Full-Stack Web', Students: 42 },
    { name: 'AI & Agents', Students: 38 },
    { name: 'Cybersecurity', Students: 29 },
    { name: 'UI/UX Design', Students: 25 },
    { name: 'Cloud & DevOps', Students: 21 }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-orange-500 selection:text-white">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-600/30">
                DS
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-white tracking-wide">DS TECH ACADEMY</h1>
                <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Faculty Portal</p>
              </div>
            </div>
          </div>

          {/* Lead Trainer Badge */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md">
              DA
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-white truncate">{currentUser.name}</h2>
              <p className="text-[10px] font-mono text-amber-400 truncate">Lead Trainer & Coordinator</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[9px] text-emerald-400 font-medium">Faculty Approved (WAT)</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'courses'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookOpen size={16} />
              <span>My Courses</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono">
                {courses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'students'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Users size={16} />
              <span>Students Registry</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'timetable'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Calendar size={16} />
              <span>Faculty Timetable</span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ClipboardList size={16} />
              <span>Assessments & Grading</span>
              {pendingSubmissions.length > 0 && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {pendingSubmissions.length} New
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'materials'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FileText size={16} />
              <span>Course Materials & Labs</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <TrendingUp size={16} />
              <span>Reports & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('handbook')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'handbook'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookCheck size={16} />
              <span>Tutor Handbook (PDF 1)</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
              activeTab === 'settings' ? 'text-amber-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings size={15} />
            <span>Faculty Settings</span>
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
        {/* HEADER BAR */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Faculty Workspace — {currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30">
                Lead Trainer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Curriculum delivery, 70/30 practical lab supervision, homework reviews, and graduation clearance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCourseCreator(prev => !prev)}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>{showCourseCreator ? 'Close Designer' : 'Design New Course'}</span>
            </button>
            <button
              onClick={fetchTutorWorkspaceData}
              className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* ALERTS */}
        <div className="px-6 pt-4">
          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-400 text-xs mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="font-bold">✕</button>
            </div>
          )}
        </div>

        {/* VIEW 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
            {/* STATS ROW (4 CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Supervised Courses</p>
                    <h3 className="text-2xl font-black text-white mt-1.5">{courses.length} Active</h3>
                    <p className="text-[11px] text-amber-400 mt-1 font-medium">115+ Academy Catalog</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <BookOpen size={22} />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Assigned Students</p>
                    <h3 className="text-2xl font-black text-white mt-1.5">148 Active</h3>
                    <p className="text-[11px] text-emerald-400 mt-1 font-medium">92.5% Avg Attendance</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Users size={22} />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Pending Submissions</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-1.5">{pendingSubmissions.length} Tasks</h3>
                    <p className="text-[11px] text-amber-500 mt-1 font-medium">72h SLA Target</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <ClipboardList size={22} />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Graduated Diplomas</p>
                    <h3 className="text-2xl font-black text-purple-400 mt-1.5">94 Verified</h3>
                    <p className="text-[11px] text-purple-400 mt-1 font-medium">100% Industry Placed</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Award size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* PENDING SUBMISSIONS REVIEW QUEUE */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ClipboardList className="text-amber-400 w-5 h-5" />
                  <span>Student Homework Review Queue ({pendingSubmissions.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Open Full Gradebook →
                </button>
              </div>

              {/* Inline Grading Box */}
              {gradingSubmission && (
                <form onSubmit={handleSaveGrade} className="p-5 rounded-2xl bg-slate-800 border border-amber-500/40 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400">Grading Evaluation Interface</span>
                    <button type="button" onClick={() => setGradingSubmission(null)} className="text-xs text-slate-400">Cancel</button>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1">
                    <span className="text-slate-500">Student Deliverable:</span>
                    <p className="text-slate-200">{gradingSubmission.submission_text}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Award Grade</label>
                      <select
                        value={gradeValue}
                        onChange={(e) => setGradeValue(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      >
                        <option value="A+">A+ (Distinction Merit - 95%)</option>
                        <option value="A">A (Excellent Pass - 88%)</option>
                        <option value="B">B (Very Good - 78%)</option>
                        <option value="C">C (Credit - 65%)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-bold mb-1">Instructor Feedback</label>
                      <input
                        type="text"
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        placeholder="Comprehensive code review and architectural feedback..."
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                  >
                    Submit Grade & Update Student Record
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{sub.user_id}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{sub.submission_text}</p>
                    </div>

                    <button
                      onClick={() => {
                        setGradingSubmission(sub);
                        setGradeValue('A');
                      }}
                      className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Review & Grade
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* VISUAL ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="text-amber-400 w-5 h-5" />
                  <span>Student Enrollment by Course Category</span>
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartCourseEnrollments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Bar dataKey="Students" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChart className="text-emerald-400 w-5 h-5" />
                  <span>Submissions Status Ratio</span>
                </h3>
                <div className="h-56 flex flex-col items-center justify-center">
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartSubmissionsRatio}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartSubmissionsRatio.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 text-xs font-bold">
                    {chartSubmissionsRatio.map(item => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: COURSES */}
        {activeTab === 'courses' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Curriculum Management</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage programs, 70/30 practical syllabus modules, and course duration milestones.
                </p>
              </div>
              <button
                onClick={() => setShowCourseCreator(true)}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Create New Program</span>
              </button>
            </div>

            {/* Course Creator Modal / Drawer */}
            {showCourseCreator && (
              <form onSubmit={handleCreateCourse} className="p-6 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-white">Design Accredited Vocational Course (70/30 Framework)</h3>
                  <button type="button" onClick={() => setShowCourseCreator(false)} className="text-slate-400 text-xs">✕ Close</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Course Title</label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="e.g. Next.js 15 & PostgreSQL Enterprise Architecture"
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Course Duration</label>
                    <select
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="1 Month">1 Month (Executive Short Course)</option>
                      <option value="3 Months">3 Months (Skill Specialization)</option>
                      <option value="6 Months">6 Months (Professional Diploma)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold text-xs shadow-md"
                >
                  Publish Course to Academy LMS
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                      {course.duration}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{course.level}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">{course.lessons?.length || 4} Practical Modules</span>
                    <button
                      onClick={() => alert(`Opening curriculum editor for ${course.title}`)}
                      className="text-amber-400 hover:text-amber-300 font-bold"
                    >
                      Edit Syllabus →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: STUDENTS REGISTRY */}
        {activeTab === 'students' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Enrolled Students Registry</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Track 80% attendance compliance, submission milestones, and direct communication.
                </p>
              </div>
              <input
                type="text"
                placeholder="Search student by name or ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full sm:w-64 p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student Name & ID</th>
                    <th className="p-4">Enrolled Program</th>
                    <th className="p-4">Attendance Rate</th>
                    <th className="p-4">Curriculum Progress</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white">Aisha Bello Mohammed</div>
                      <div className="text-[10px] font-mono text-slate-400">DSTA-STU/2026/89421</div>
                    </td>
                    <td className="p-4">Full-Stack Web Development</td>
                    <td className="p-4 text-emerald-400 font-bold">92.5% (OK)</td>
                    <td className="p-4">
                      <div className="w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">78% completed</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setEmailRecipient('aisha.mohammed@student.dstech.agency');
                          setShowEmailModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:text-white"
                        title="Send Message"
                      >
                        <Mail size={14} />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white">Emeka Okafor</div>
                      <div className="text-[10px] font-mono text-slate-400">DSTA-STU/2026/78124</div>
                    </td>
                    <td className="p-4">Artificial Intelligence & Agents</td>
                    <td className="p-4 text-emerald-400 font-bold">96.0% (OK)</td>
                    <td className="p-4">
                      <div className="w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-[10px] text-emerald-400 mt-0.5 block">100% (Diploma Ready)</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setEmailRecipient('emeka.okafor@student.dstech.agency');
                          setShowEmailModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:text-white"
                        title="Send Message"
                      >
                        <Mail size={14} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: TIMETABLE */}
        {activeTab === 'timetable' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Faculty Lecture Schedule & Live Labs</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your assigned lecture timetable across physical innovation hubs (Abuja/Yola) and virtual streams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorSchedule.map((item) => (
                <div key={item.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                      {item.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{item.status}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{item.course}</h3>
                  
                  <div className="space-y-1 text-xs text-slate-300">
                    <div><strong>Topic:</strong> {item.topic}</div>
                    <div><strong>Time:</strong> {item.time}</div>
                    <div><strong>Venue:</strong> {item.venue}</div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <a
                      href="https://zoom.us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Video size={14} />
                      <span>Launch Class Stream</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: MATERIALS */}
        {activeTab === 'materials' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Faculty Materials Repository</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload and manage slide decks, code repos, Jupyter notebooks, and capstone rubrics.
                </p>
              </div>
              <button
                onClick={() => alert('Material Upload: Select file or input GitHub repository link.')}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <Upload size={14} />
                <span>Upload New Material</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultyMaterials.map((mat) => (
                <div key={mat.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px] font-bold">
                      {mat.code}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{mat.title}</h4>
                    <p className="text-xs text-slate-400">{mat.type} • {mat.size} • {mat.downloads} Student Downloads</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${mat.title}`)}
                    className="p-2 rounded-xl bg-slate-800 text-amber-400 hover:text-white"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Cohort Performance & Academic Analytics</h2>
              <p className="text-xs text-slate-400 mt-1">
                Faculty grading velocity, 80% attendance compliance records, and graduation clearance rates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Average Grading Turnaround</p>
                <h3 className="text-2xl font-black text-white mt-1">18.4 Hours</h3>
                <p className="text-[11px] text-emerald-400 mt-1">Faster than 72h SLA Target</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Graduation Pass Rate</p>
                <h3 className="text-2xl font-black text-white mt-1">94.2%</h3>
                <p className="text-[11px] text-emerald-400 mt-1">Distinction Equivalent</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold">Internship Placement Rate</p>
                <h3 className="text-2xl font-black text-white mt-1">91.0%</h3>
                <p className="text-[11px] text-amber-400 mt-1">Enterprise Partners</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: TUTOR HANDBOOK (PDF 1) */}
        {activeTab === 'handbook' && (
          <div className="p-6 space-y-8 max-w-6xl mx-auto w-full">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-2">
                <BookCheck size={14} />
                <span>Official PDF 1 Compliance Standards</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Tutor & Faculty Handbook (PDF 1)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Every accredited trainer is expected to read, understand, and comply with all instructional methodologies and ethics.
              </p>
            </div>

            {/* 70/30 Rule Highlight Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/40 border border-amber-500/40 space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="text-amber-400 w-5 h-5" />
                <span>The Core 70% Practical & 30% Theory Methodology</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                DS Tech Academy enforces a strict hands-on pedagogy across all 115+ courses. Theoretical explanations are strictly capped at 30% of lecture hours. 70% of time must be dedicated to live terminal coding, UI/UX prototyping, architecture debugging, and end-to-end deployment.
              </p>
            </div>

            {/* 11 Tutor Handbook Topics */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-amber-400 w-5 h-5" />
                <span>11 Core Faculty Responsibilities & Guidelines (PDF 1)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TUTOR_HANDBOOK_TOPICS.map((topic) => (
                  <div key={topic.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-amber-300">{topic.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{topic.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 11 Tutor Benefits */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-amber-400 w-5 h-5" />
                <span>11 Faculty Benefits & Compensation (PDF 1)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TUTOR_BENEFITS.map((benefit) => (
                  <div key={benefit.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {benefit.id}
                    </div>
                    <h5 className="text-xs font-bold text-white">{benefit.title}</h5>
                    <p className="text-[11px] text-slate-400">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Faculty Account & Remuneration Settings</h2>
              <p className="text-xs text-slate-400 mt-1">Manage instructor credentials, bio, and bank account for remuneration payouts.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Instructor Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Faculty Email</label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Faculty profile updated successfully.')}
                className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}
      </main>

      {/* EMAIL MODAL */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-md w-full text-left space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Mail size={16} className="text-amber-400" />
                  <span>Send Academy Alert / Compliance Update</span>
                </h3>
                <button onClick={() => setShowEmailModal(false)} className="text-slate-400 text-xs">✕</button>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Recipient</label>
                  <input
                    type="text"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Milestone Assessment Feedback"
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Message</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Please review the code annotations..."
                    className="w-full h-28 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-bold"
                  >
                    Dispatch Notification
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
