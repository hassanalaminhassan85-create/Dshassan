import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Play, Award, Download, CheckCircle, GraduationCap, 
  ArrowRight, Users, Eye, HelpCircle, Trophy, UserCheck, ShieldAlert,
  Plus, Send, ClipboardList, TrendingUp, Sparkles, Check, CheckCircle2,
  Bookmark, User, FileText, AlertCircle, RefreshCw, Menu, X, LogOut,
  Settings, Lock, Mail, ChevronRight, Briefcase, Sun, Moon, Laptop,
  Key, EyeOff, Search, Filter, Building2, Layers, Cpu, Globe
} from 'lucide-react';
import { Logo } from './Logo';
import { PaystackPayButton } from './PaystackMotionCheckout';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { apiSubscribeToCourses } from '../lib/api';
import { Course, Lesson, COURSES, parsePriceToNumeric } from '../lib/data';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: string;
  completed_lessons: string;
  assigned_tutor_id?: string;
  created_at: string;
}

export interface Tutor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  bio: string;
  expertise: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Submission {
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

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  full_name: string;
  hash: string;
  issued_at: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
}

const DEMO_STUDENT: UserSession = {
  id: 'usr_demo_student',
  name: 'David Alao',
  email: 'david@dstech.agency',
  role: 'student'
};

const DEMO_TUTOR: UserSession = {
  id: 'usr_demo_tutor',
  name: 'Prof. Grace Ibrahim',
  email: 'grace@dstech.agency',
  role: 'tutor'
};

const DEMO_ADMIN: UserSession = {
  id: 'usr_demo_admin',
  name: 'System Administrator',
  email: 'admin@dstech.agency',
  role: 'admin'
};

export const TrainingAcademySection: React.FC<{ onBackToPortal?: () => void }> = ({ onBackToPortal }) => {
  // Theme dark mode state (synchronized with document root)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const isRootDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isRootDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toast Notification System
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'success' | 'info' | 'error' }>>([]);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Auth States
  const [authState, setAuthState] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor' | 'admin'>('student');
  const [isLogged, setIsLogged] = useState<boolean>(false);

  // Form Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active User Session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Dashboard Drawer & Tabs
  const [activeDashboardTab, setActiveDashboardTab] = useState<'catalog' | 'my-courses' | 'submissions' | 'certificates' | 'tutor-creator' | 'admin-mgmt'>('catalog');
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);

  // Base Data States
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const unsubscribe = apiSubscribeToCourses((data) => {
      if (data.length > 0) {
        setCourses(data as Course[]);
      } else {
        // Fallback to imported COURSES if database returned empty
        setCourses(COURSES);
      }
    });
    return () => unsubscribe();
  }, []);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([
    {
      id: 'tut_1',
      user_id: 'usr_demo_tutor',
      full_name: 'Prof. Grace Ibrahim',
      email: 'grace@dstech.agency',
      bio: 'Senior Software Architect & Certified AI Curriculum Mentor',
      expertise: 'Full-Stack Web & AI Engineering',
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'tut_2',
      user_id: 'usr_tutor_2',
      full_name: 'Musa Abubakar',
      email: 'musa@dstech.agency',
      bio: 'Digital Marketing Strategist & Meta Ads Performance Consultant',
      expertise: 'Performance Marketing & SEO',
      status: 'pending',
      created_at: new Date().toISOString()
    }
  ]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Catalog Filters
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Classroom Active Learning States
  const [enrolledCourse, setEnrolledCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Submission & Assessment Quiz
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileKey, setSubmissionFileKey] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Tutor Course Creator State
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('₦50,000');
  const [newCourseDuration, setNewCourseDuration] = useState('4 Weeks');
  const [newCourseLevel, setNewCourseLevel] = useState<'Beginner' | 'Advanced' | 'All Levels'>('Beginner');
  const [newCourseCategory, setNewCourseCategory] = useState<'marketing' | 'web' | 'ai' | 'business' | 'compliance'>('web');
  const [newCourseImage, setNewCourseImage] = useState('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80');

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState('A');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Assessment Questions
  const quizQuestions = [
    {
      q: "Which ad targeting strategy delivers higher conversion ratios for regional real estate in Nigeria?",
      options: [
        "Broad nationwide targeting with high daily budget spreads",
        "Specific high-income regional hubs (Maitama, Ikoyi) with WhatsApp CTA channels",
        "Passive banner-placement networks on generic global portals"
      ],
      correct: 1
    },
    {
      q: "In high-performance React frontend structures, which optimization pattern minimizes parent re-renders?",
      options: [
        "Stabilizing handlers outside the React render context or utilizing React.memo",
        "Declaring multi-tiered component functions inside hook dependencies",
        "Replacing all clean state updates with standard browser event listeners"
      ],
      correct: 0
    },
    {
      q: "Which local regulatory agency coordinates legal anti-money laundering and corporate compliance registrations?",
      options: [
        "FIRS (Federal Inland Revenue Service)",
        "CAC (Corporate Affairs Commission)",
        "SCUML (Special Control Unit Against Money Laundering)"
      ],
      correct: 2
    }
  ];

  // Restore Session
  useEffect(() => {
    const saved = localStorage.getItem('dstech_academy_standalone_session');
    if (saved) {
      try {
        const sessionObj: UserSession = JSON.parse(saved);
        setCurrentUser(sessionObj);
        setIsLogged(true);
        setSelectedRole(sessionObj.role);

        // Load cached enrollments & submissions if available
        const savedEnroll = localStorage.getItem(`academy_enroll_${sessionObj.id}`);
        const savedSub = localStorage.getItem(`academy_sub_${sessionObj.id}`);
        const savedCert = localStorage.getItem(`academy_cert_${sessionObj.id}`);

        if (savedEnroll) setEnrollments(JSON.parse(savedEnroll));
        if (savedSub) setSubmissions(JSON.parse(savedSub));
        if (savedCert) setCertificates(JSON.parse(savedCert));
      } catch (e) {
        console.error("Session restore error:", e);
      }
    }
  }, []);

  const persistUserData = (userId: string, enrollList: Enrollment[], subList: Submission[], certList: Certificate[]) => {
    localStorage.setItem(`academy_enroll_${userId}`, JSON.stringify(enrollList));
    localStorage.setItem(`academy_sub_${userId}`, JSON.stringify(subList));
    localStorage.setItem(`academy_cert_${userId}`, JSON.stringify(certList));
  };

  // Handle Login
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      triggerToast("Please enter your registered email and password.", "error");
      return;
    }

    const registeredRaw = localStorage.getItem('dstech_academy_registered_users');
    const registeredUsers: UserSession[] = registeredRaw ? JSON.parse(registeredRaw) : [];

    let matched: UserSession | null = null;
    if (authEmail.toLowerCase() === DEMO_STUDENT.email.toLowerCase()) matched = DEMO_STUDENT;
    else if (authEmail.toLowerCase() === DEMO_TUTOR.email.toLowerCase()) matched = DEMO_TUTOR;
    else if (authEmail.toLowerCase() === DEMO_ADMIN.email.toLowerCase()) matched = DEMO_ADMIN;
    else {
      matched = registeredUsers.find(u => u.email.toLowerCase() === authEmail.toLowerCase()) || null;
    }

    if (matched) {
      setCurrentUser(matched);
      setIsLogged(true);
      setSelectedRole(matched.role);
      localStorage.setItem('dstech_academy_standalone_session', JSON.stringify(matched));
      triggerToast(`Welcome back, ${matched.name}! ${matched.role.toUpperCase()} session active.`, "success");
    } else {
      triggerToast("Invalid credentials or unregistered academic user.", "error");
    }
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authFullName) {
      triggerToast("Please fill in all registration fields.", "error");
      return;
    }

    const userId = "usr_" + Math.random().toString(36).substring(2, 9);
    const newUser: UserSession = {
      id: userId,
      name: authFullName,
      email: authEmail,
      role: selectedRole
    };

    const registeredRaw = localStorage.getItem('dstech_academy_registered_users');
    const registeredUsers: UserSession[] = registeredRaw ? JSON.parse(registeredRaw) : [];

    if (registeredUsers.some(u => u.email.toLowerCase() === authEmail.toLowerCase())) {
      triggerToast("An account with this email is already registered.", "error");
      return;
    }

    registeredUsers.push(newUser);
    localStorage.setItem('dstech_academy_registered_users', JSON.stringify(registeredUsers));

    setCurrentUser(newUser);
    setIsLogged(true);
    localStorage.setItem('dstech_academy_standalone_session', JSON.stringify(newUser));

    triggerToast(`Congratulations ${authFullName}! Your ${selectedRole.toUpperCase()} account has been created.`, "success");
  };

  // Instant Demo Login
  const handleDemoLogin = (demoUser: UserSession) => {
    setCurrentUser(demoUser);
    setIsLogged(true);
    setSelectedRole(demoUser.role);
    localStorage.setItem('dstech_academy_standalone_session', JSON.stringify(demoUser));
    
    // Seed sample enrollment for student demo if empty
    if (demoUser.role === 'student' && enrollments.length === 0 && courses.length > 0) {
      const sampleEnroll: Enrollment = {
        id: 'enroll_demo_1',
        user_id: demoUser.id,
        course_id: courses[0].id,
        progress: 40,
        status: 'enrolled',
        completed_lessons: JSON.stringify([courses[0].lessons[0]?.id || 'les_1']),
        assigned_tutor_id: 'tut_1',
        created_at: new Date().toISOString()
      };
      setEnrollments([sampleEnroll]);
      persistUserData(demoUser.id, [sampleEnroll], submissions, certificates);
    }

    triggerToast(`Logged in as Demo ${demoUser.role.toUpperCase()}: ${demoUser.name}`, "success");
  };

  const handleSignOut = () => {
    localStorage.removeItem('dstech_academy_standalone_session');
    setCurrentUser(null);
    setIsLogged(false);
    triggerToast("Academic session terminated securely.", "info");
  };

  // Student Enroll Handler
  const handleEnroll = (course: Course) => {
    if (!currentUser) return;
    const exists = enrollments.some(e => e.course_id === course.id && e.user_id === currentUser.id);
    if (exists) {
      const existing = enrollments.find(e => e.course_id === course.id && e.user_id === currentUser.id)!;
      setEnrolledCourse(course);
      setActiveLesson(course.lessons[0]);
      try {
        setCompletedLessonIds(JSON.parse(existing.completed_lessons || '[]'));
      } catch {
        setCompletedLessonIds([]);
      }
      setActiveDashboardTab('my-courses');
      triggerToast(`Continuing track for ${course.title}`, "info");
      return;
    }

    const newEnroll: Enrollment = {
      id: 'enroll_' + Math.random().toString(36).substring(2, 9),
      user_id: currentUser.id,
      course_id: course.id,
      progress: 0,
      status: 'enrolled',
      completed_lessons: JSON.stringify([]),
      assigned_tutor_id: 'tut_1',
      created_at: new Date().toISOString()
    };

    const updated = [newEnroll, ...enrollments];
    setEnrollments(updated);
    persistUserData(currentUser.id, updated, submissions, certificates);

    setEnrolledCourse(course);
    setActiveLesson(course.lessons[0]);
    setCompletedLessonIds([]);
    setActiveDashboardTab('my-courses');

    triggerToast(`Enrolled successfully in ${course.title}!`, "success");
  };

  // Toggle Lesson Completion
  const handleToggleLessonComplete = (lessonId: string) => {
    if (!enrolledCourse || !currentUser) return;
    const currentEnroll = enrollments.find(e => e.course_id === enrolledCourse.id && e.user_id === currentUser.id);
    if (!currentEnroll) return;

    let updatedCompleted: string[];
    if (completedLessonIds.includes(lessonId)) {
      updatedCompleted = completedLessonIds.filter(id => id !== lessonId);
    } else {
      updatedCompleted = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updatedCompleted);

    const progressPercent = Math.round((updatedCompleted.length / enrolledCourse.lessons.length) * 100);
    const updatedEnrollObj: Enrollment = {
      ...currentEnroll,
      progress: progressPercent,
      completed_lessons: JSON.stringify(updatedCompleted)
    };

    const updatedList = enrollments.map(e => e.id === currentEnroll.id ? updatedEnrollObj : e);
    setEnrollments(updatedList);
    persistUserData(currentUser.id, updatedList, submissions, certificates);
    triggerToast(`Lesson progress updated (${progressPercent}% completed)`, "success");
  };

  // Submit Coursework
  const handleSubmitCoursework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolledCourse || !activeLesson || !currentUser || !submissionText.trim()) {
      triggerToast("Please enter your coursework answer.", "error");
      return;
    }

    const currentEnroll = enrollments.find(e => e.course_id === enrolledCourse.id && e.user_id === currentUser.id);
    const newSub: Submission = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      enrollment_id: currentEnroll ? currentEnroll.id : 'enroll_general',
      course_id: enrolledCourse.id,
      lesson_id: activeLesson.id,
      user_id: currentUser.id,
      submission_text: submissionText,
      submission_file_key: submissionFileKey || 'https://drive.google.com/file/d/sample',
      status: 'submitted',
      submitted_at: new Date().toISOString()
    };

    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    setSubmissionText('');
    setSubmissionFileKey('');
    persistUserData(currentUser.id, enrollments, updated, certificates);

    triggerToast("Coursework submitted to tutor for grading!", "success");
  };

  // Quiz Handling
  const handleNextQuizQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const correctCount = selectedAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length;
      const pass = correctCount >= 2;
      setQuizScore(correctCount);
      setQuizFinished(true);

      if (pass && enrolledCourse && currentUser) {
        const certHash = 'dstech_acad_' + Math.random().toString(36).substring(2, 12);
        const certObj: Certificate = {
          id: 'cert_' + Math.random().toString(36).substring(2, 8),
          user_id: currentUser.id,
          course_id: enrolledCourse.id,
          course_title: enrolledCourse.title,
          full_name: currentUser.name,
          hash: certHash,
          issued_at: new Date().toISOString()
        };

        const updatedCerts = [certObj, ...certificates];
        setCertificates(updatedCerts);
        persistUserData(currentUser.id, enrollments, submissions, updatedCerts);
        triggerToast("Congratulations! Accreditation Diploma minted successfully.", "success");
      }
    }
  };

  // Create Course (Tutor / Admin)
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      triggerToast("Please enter a course title.", "error");
      return;
    }

    const generatedId = 'course_' + Math.random().toString(36).substring(2, 8);
    const newCourseObj: Course = {
      id: generatedId,
      title: newCourseTitle,
      description: newCourseDesc || "Vocational syllabus designed for corporate workforce accreditation.",
      price: newCoursePrice,
      duration: newCourseDuration,
      level: newCourseLevel,
      category: newCourseCategory,
      image: newCourseImage,
      lessons: [
        { id: `les_1_${generatedId}`, title: 'Module 1: Core Fundamentals & Industry Framework', duration: '20 mins', content: 'In-depth overview of modern methodologies and best practices.' },
        { id: `les_2_${generatedId}`, title: 'Module 2: Practical Implementation & Workflow Integration', duration: '35 mins', content: 'Step-by-step hands-on tutorial and configuration.' }
      ]
    };

    setCourses([newCourseObj, ...courses]);
    setNewCourseTitle('');
    setNewCourseDesc('');
    triggerToast(`Course "${newCourseTitle}" published successfully!`, "success");
  };

  // Grade Submission (Tutor / Admin)
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const updatedSub: Submission = {
      ...gradingSubmission,
      grade: gradeValue,
      feedback: gradeFeedback || "Excellent mastery of the coursework objectives.",
      status: 'graded',
      graded_at: new Date().toISOString()
    };

    setSubmissions(submissions.map(s => s.id === gradingSubmission.id ? updatedSub : s));
    setGradingSubmission(null);
    setGradeFeedback('');
    triggerToast(`Coursework graded (${gradeValue}) successfully!`, "success");
  };

  // Printable Certificate Helper
  const printCertificate = (cert: Certificate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>DS Tech Academy - Official Certificate</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@300;500;700&display=swap');
            body { 
              font-family: 'Montserrat', sans-serif; 
              text-align: center; 
              padding: 50px; 
              border: 12px solid #000E32; 
              background: #fbfbfa; 
              height: 90vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
            .border-inner { border: 2px solid #ea580c; padding: 40px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
            h1 { font-family: 'Cinzel', serif; font-size: 36px; color: #000E32; text-transform: uppercase; margin: 0; }
            .name { font-family: 'Cinzel', serif; font-size: 28px; font-weight: 800; color: #ea580c; border-bottom: 2px solid #ea580c; display: inline-block; padding: 5px 25px; margin: 15px 0; }
            .hash { font-family: monospace; font-size: 10px; color: #64748b; margin-top: 5px; }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding: 0 30px; }
            .sig { border-top: 1px solid #777; margin-top: 10px; padding-top: 5px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #000E32; }
          </style>
        </head>
        <body>
          <div class="border-inner">
            <div>
              <h1>Accreditation Diploma</h1>
              <p style="font-style: italic; color: #666; font-size: 13px; margin-top: 5px;">DS TECH PROFESSIONAL VOCATIONAL ACADEMY</p>
            </div>
            <div style="font-size: 14px; color: #333; line-height: 1.8;">
              This is to officially certify that
              <br/>
              <div class="name">${cert.full_name}</div>
              <br/>
              has successfully completed all coursework and passed accreditation testing for
              <br/>
              <strong style="color: #000E32; font-size: 16px;">${cert.course_title}</strong>
              <div class="hash">Verification Hash: ${cert.hash}</div>
            </div>
            <div class="footer">
              <div>
                <span style="font-family:'Cinzel'; font-size:12px;">Prof. Grace Ibrahim</span>
                <div class="sig">Academy Registrar</div>
              </div>
              <div style="border: 2px solid #ea580c; color: #ea580c; padding: 6px 12px; font-size: 11px; font-weight: bold; transform: rotate(-3deg);">
                DS Tech Verified Seal
              </div>
              <div>
                <span style="font-family:'Cinzel'; font-size:12px;">David Alao</span>
                <div class="sig">Principal Director</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filtered Catalog
  const filteredCourses = courses.filter(c => {
    const matchesCat = catalogCategory === 'all' || c.category === catalogCategory;
    const matchesSearch = c.title.toLowerCase().includes(catalogSearch.toLowerCase()) || c.description.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative`}>
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 border pointer-events-auto ${
                t.type === 'success' 
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : t.type === 'error'
                    ? 'bg-white dark:bg-slate-900 border-red-500/30 text-red-500'
                    : 'bg-white dark:bg-slate-900 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {t.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              <div className="text-xs font-semibold leading-tight">{t.msg}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isLogged ? (
        /* ================= ISOLATED ACADEMIC AUTH VIEW ================= */
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          {/* Ambient background lights */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 space-y-6">
            
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="absolute top-6 left-6 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                title="Back to Main Site"
              >
                <Globe size={15} className="text-orange-500" />
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="absolute top-6 right-6 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-6">
              <Logo size="md" variant={isDarkMode ? 'light' : 'dark'} className="mx-auto" />
              <div className="space-y-1">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20">
                  DS Tech Academy Portal
                </span>
                <h1 className="text-xl font-bold font-serif uppercase tracking-tight text-slate-900 dark:text-white mt-2">
                  Academic Learning Portal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Access vocational tracks, submit coursework, earn diplomas, and mentor learners.
                </p>
              </div>
            </div>

            {/* Access Role Selector */}
            <div className="space-y-1.5">
              <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500 block text-left">Select Portal Role</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    selectedRole === 'student' ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <GraduationCap size={12} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('tutor')}
                  className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    selectedRole === 'tutor' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Users size={12} />
                  <span>Tutor</span>
                </button>
              </div>
            </div>

            {/* Auth Mode Tabs (Sign In / Register) */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAuthState('signin')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authState === 'signin' ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthState('register')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authState === 'register' ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authState === 'signin' ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSignIn}
                  className="space-y-4 text-left text-xs"
                >
                  <div className="space-y-1.5">
                    <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Academic Email</label>
                    <div className="relative flex items-center">
                      <Mail size={14} className="absolute left-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="david@dstech.agency"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Password</label>
                    <div className="relative flex items-center">
                      <Key size={14} className="absolute left-3.5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer mt-4"
                  >
                    Enter {selectedRole.toUpperCase()} Workspace
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegister}
                  className="space-y-3.5 text-left text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Full Name</label>
                    <div className="relative flex items-center">
                      <User size={14} className="absolute left-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={authFullName}
                        onChange={e => setAuthFullName(e.target.value)}
                        placeholder="e.g. David Alao"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Academic Email</label>
                    <div className="relative flex items-center">
                      <Mail size={14} className="absolute left-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="david@dstech.agency"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Password</label>
                    <div className="relative flex items-center">
                      <Key size={14} className="absolute left-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer mt-2"
                  >
                    Register {selectedRole.toUpperCase()} Profile
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>
      ) : (
        /* ================= ISOLATED ACADEMIC DASHBOARD VIEW ================= */
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
          
          {/* HEADER */}
          <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsHamburgerOpen(true)}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Menu size={18} />
              </button>
              
              <div className="flex items-center gap-2">
                <Logo size="sm" variant={isDarkMode ? 'light' : 'dark'} showText={true} />
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-orange-500/20">
                  {currentUser?.role === 'student' ? 'Learner Portal' : currentUser?.role === 'tutor' ? 'Educator Workspace' : 'Academy Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onBackToPortal && (
                <button
                  type="button"
                  onClick={onBackToPortal}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Globe size={14} className="text-orange-500" />
                  <span className="hidden sm:inline">Back to Main Site</span>
                </button>
              )}

              {/* User Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
                <User size={13} className="text-orange-500" />
                <span className="text-slate-900 dark:text-white">{currentUser?.name}</span>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer"
              >
                {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
              </button>

              {/* Sign Out */}
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 sm:px-3 sm:py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold transition-all hover:bg-red-100 cursor-pointer flex items-center gap-1"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          {/* HAMBURGER SLIDE-OUT DRAWER */}
          <AnimatePresence>
            {isHamburgerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsHamburgerOpen(false)}
                  className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
                />

                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 p-6 flex flex-col justify-between shadow-2xl"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase font-black text-orange-500">Navigation Hub</span>
                        <h3 className="font-serif font-extrabold text-[#000E32] dark:text-white uppercase text-base">Academy Tools</h3>
                      </div>
                      <button
                        onClick={() => setIsHamburgerOpen(false)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Drawer List Nav */}
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { setActiveDashboardTab('catalog'); setIsHamburgerOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                          activeDashboardTab === 'catalog' ? 'bg-orange-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <BookOpen size={16} />
                        <span>Courses Catalog</span>
                      </button>

                      <button
                        onClick={() => { setActiveDashboardTab('my-courses'); setIsHamburgerOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                          activeDashboardTab === 'my-courses' ? 'bg-orange-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <GraduationCap size={16} />
                        <span>My Enrolled Tracks</span>
                      </button>

                      <button
                        onClick={() => { setActiveDashboardTab('submissions'); setIsHamburgerOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                          activeDashboardTab === 'submissions' ? 'bg-orange-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <ClipboardList size={16} />
                        <span>Coursework Deliverables</span>
                      </button>

                      <button
                        onClick={() => { setActiveDashboardTab('certificates'); setIsHamburgerOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                          activeDashboardTab === 'certificates' ? 'bg-orange-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Trophy size={16} />
                        <span>Verified Diplomas</span>
                      </button>

                      {(currentUser?.role === 'tutor' || currentUser?.role === 'admin') && (
                        <button
                          onClick={() => { setActiveDashboardTab('tutor-creator'); setIsHamburgerOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                            activeDashboardTab === 'tutor-creator' ? 'bg-orange-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Plus size={16} />
                          <span>Course Creator Studio</span>
                        </button>
                      )}

                      {(currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
                        <button
                          onClick={() => { setActiveDashboardTab('admin-mgmt'); setIsHamburgerOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                            activeDashboardTab === 'admin-mgmt' ? 'bg-orange-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <ShieldAlert size={16} />
                          <span>Student & Tutor Mgmt</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 text-xs font-extrabold uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
            
            {/* HERO STATS OVERVIEW */}
            <div className="bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-indigo-950">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Academic Cockpit Active</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold uppercase font-serif tracking-tight">
                    Welcome, {currentUser?.name}
                  </h1>
                  <p className="text-xs text-slate-300 max-w-xl font-light">
                    Track your vocational course progress, complete coursework assignments, pass accreditation tests, and access verified cryptographic diplomas.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Enrolled Tracks</span>
                    <span className="text-xl font-black text-orange-400">{enrollments.length}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Submissions</span>
                    <span className="text-xl font-black text-emerald-400">{submissions.length}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Diplomas</span>
                    <span className="text-xl font-black text-amber-400">{certificates.length}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Role</span>
                    <span className="text-xs font-black uppercase text-indigo-300">{currentUser?.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 1: COURSES CATALOG */}
            {activeDashboardTab === 'catalog' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-orange-500 text-[10px] uppercase font-black tracking-widest">Vocational Training Catalog</span>
                    <h2 className="text-xl md:text-2xl font-extrabold uppercase font-serif text-slate-900 dark:text-white">Accredited Programs</h2>
                  </div>

                  {/* Filters & Search */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-60">
                      <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={catalogSearch}
                        onChange={e => setCatalogSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>

                    <select
                      value={catalogCategory}
                      onChange={e => setCatalogCategory(e.target.value)}
                      className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="all">All Categories</option>
                      <option value="web">Web & Software</option>
                      <option value="marketing">Digital Marketing</option>
                      <option value="ai">AI Integration</option>
                      <option value="business">Business Strategy</option>
                      <option value="compliance">CAC Compliance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredCourses.map(course => {
                    const isEnrolled = enrollments.some(e => e.course_id === course.id && e.user_id === currentUser?.id);
                    return (
                      <motion.div
                        key={course.id}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-44 overflow-hidden relative">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                              {course.level}
                            </div>
                            <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm">
                              {course.category}
                            </div>
                          </div>
                          <div className="p-5 space-y-3 text-left">
                            <div className="flex justify-between items-center text-[11px] font-mono font-bold text-orange-500">
                              <span>{course.duration}</span>
                              <span>{course.price}</span>
                            </div>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white uppercase text-base line-clamp-1">{course.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-light leading-relaxed">{course.description}</p>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          {isEnrolled ? (
                            <button
                              onClick={() => handleEnroll(course)}
                              className="w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                            >
                              <span>Continue Track</span>
                              <ArrowRight size={14} />
                            </button>
                          ) : (
                            <PaystackPayButton
                              amount={parsePriceToNumeric(course.price, 150000)}
                              email={currentUser?.email || 'student@dstech.agency'}
                              customerName={currentUser?.name || 'Valued Student'}
                              title={`Course Enrollment: ${course.title}`}
                              description={`Accredited Vocational Course Fee: ${course.title}`}
                              onSuccess={() => {
                                handleEnroll(course);
                                triggerToast(`Successfully enrolled in ${course.title} via Paystack!`, "success");
                              }}
                              variant="emerald"
                              className="w-full py-2.5"
                            >
                              <span>Enroll & Pay via Paystack</span>
                              <ArrowRight size={14} />
                            </PaystackPayButton>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: MY ENROLLED TRACKS */}
            {activeDashboardTab === 'my-courses' && (
              <div className="space-y-6 text-left">
                {enrollments.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <GraduationCap size={40} className="mx-auto text-slate-400" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold uppercase font-serif">No Enrolled Tracks Yet</h3>
                      <p className="text-xs text-slate-500">Browse the Courses Catalog to enroll in your first vocational program.</p>
                    </div>
                    <button
                      onClick={() => setActiveDashboardTab('catalog')}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Course Selection List */}
                    <div className="lg:col-span-4 space-y-3">
                      <span className="text-[10px] uppercase font-black text-orange-500 tracking-wider block">Your Enrolled Tracks</span>
                      {enrollments.map(enr => {
                        const crs = courses.find(c => c.id === enr.course_id);
                        if (!crs) return null;
                        const isSelected = enrolledCourse?.id === crs.id;
                        return (
                          <div
                            key={enr.id}
                            onClick={() => {
                              setEnrolledCourse(crs);
                              setActiveLesson(crs.lessons[0]);
                              try {
                                setCompletedLessonIds(JSON.parse(enr.completed_lessons || '[]'));
                              } catch { setCompletedLessonIds([]); }
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'bg-orange-500/10 border-orange-500/40 text-slate-900 dark:text-white'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-500/20'
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="font-serif uppercase truncate">{crs.title}</span>
                              <span className="text-orange-500 font-mono text-[10px]">{enr.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${enr.progress}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Learning Classroom */}
                    <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                      {enrolledCourse && activeLesson ? (
                        <>
                          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                            <span className="text-[10px] uppercase font-black text-orange-500 tracking-wider">Active Lesson</span>
                            <h2 className="text-xl font-bold font-serif uppercase">{activeLesson.title}</h2>
                            <p className="text-xs text-slate-500 font-light">{enrolledCourse.title} • {activeLesson.duration}</p>
                          </div>

                          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-3 leading-relaxed">
                            <h4 className="font-bold text-orange-500 uppercase">Lesson Syllabus Content</h4>
                            <p className="text-slate-700 dark:text-slate-300">
                              {activeLesson.content || 'Welcome to this lesson module. Review the syllabus guidelines below, complete your coursework assignments, and test your comprehension via the accreditation assessment quiz.'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              onClick={() => handleToggleLessonComplete(activeLesson.id)}
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                                completedLessonIds.includes(activeLesson.id)
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <CheckCircle size={14} />
                              <span>{completedLessonIds.includes(activeLesson.id) ? 'Marked Completed' : 'Mark Lesson Complete'}</span>
                            </button>

                            <span className="text-xs text-slate-400 font-mono font-bold">
                              {completedLessonIds.length} / {enrolledCourse.lessons.length} Completed
                            </span>
                          </div>

                          {/* Coursework Assignment Form */}
                          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <h3 className="text-xs font-bold uppercase font-serif">Submit Coursework Deliverable</h3>
                            <form onSubmit={handleSubmitCoursework} className="space-y-3">
                              <textarea
                                required
                                rows={3}
                                value={submissionText}
                                onChange={e => setSubmissionText(e.target.value)}
                                placeholder="Type your coursework answer or project execution notes here..."
                                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="url"
                                  value={submissionFileKey}
                                  onChange={e => setSubmissionFileKey(e.target.value)}
                                  placeholder="Document / Google Drive link (optional)"
                                  className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                                >
                                  Submit
                                </button>
                              </div>
                            </form>
                          </div>

                          {/* Accreditation Quiz Modal / Section */}
                          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold uppercase font-serif">Accreditation Assessment Quiz</h3>
                              {!quizStarted && !quizFinished && (
                                <button
                                  onClick={() => { setQuizStarted(true); setCurrentQuestion(0); setSelectedAnswers([]); }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                                >
                                  Start Quiz Test
                                </button>
                              )}
                            </div>

                            {quizStarted && !quizFinished && (
                              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                                <div className="text-xs font-extrabold text-orange-500 uppercase">
                                  Question {currentQuestion + 1} of {quizQuestions.length}
                                </div>
                                <p className="text-xs font-medium text-slate-900 dark:text-white">
                                  {quizQuestions[currentQuestion].q}
                                </p>
                                <div className="space-y-2">
                                  {quizQuestions[currentQuestion].options.map((opt, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        const updated = [...selectedAnswers];
                                        updated[currentQuestion] = i;
                                        setSelectedAnswers(updated);
                                      }}
                                      className={`w-full text-left p-3 rounded-xl text-xs transition-all border cursor-pointer ${
                                        selectedAnswers[currentQuestion] === i
                                          ? 'bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={handleNextQuizQuestion}
                                  disabled={selectedAnswers[currentQuestion] === undefined}
                                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish & Mint Diploma'}
                                </button>
                              </div>
                            )}

                            {quizFinished && (
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                                <Trophy size={28} className="mx-auto text-amber-500 animate-bounce" />
                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">Quiz Completed!</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                  Score: {quizScore} / {quizQuestions.length} correct answers. Accreditation Diploma minted!
                                </p>
                                <button
                                  onClick={() => setActiveDashboardTab('certificates')}
                                  className="px-4 py-2 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                                >
                                  View Diplomas
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-xs font-medium">Select an enrolled course from the left panel to begin.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COURSEWORK DELIVERABLES */}
            {activeDashboardTab === 'submissions' && (
              <div className="space-y-6 text-left">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-orange-500 text-[10px] uppercase font-black tracking-widest">Student Deliverables</span>
                  <h2 className="text-xl md:text-2xl font-extrabold uppercase font-serif text-slate-900 dark:text-white">Coursework Submissions</h2>
                </div>

                {submissions.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <ClipboardList size={36} className="mx-auto text-slate-400" />
                    <h3 className="text-base font-bold uppercase font-serif">No Submissions Found</h3>
                    <p className="text-xs text-slate-500">Submit coursework deliverables inside active lessons in your Enrolled Tracks.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map(sub => {
                      const crs = courses.find(c => c.id === sub.course_id);
                      return (
                        <div key={sub.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="font-serif uppercase">{crs?.title || "Vocational Course"}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              sub.status === 'graded' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                            }`}>
                              {sub.status === 'graded' ? `Grade: ${sub.grade}` : 'Submitted'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-light">{sub.submission_text}</p>
                          {sub.feedback && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-emerald-600 dark:text-emerald-400">
                              <strong>Tutor Feedback:</strong> {sub.feedback}
                            </div>
                          )}

                          {/* Tutor / Admin Grade Action */}
                          {(currentUser?.role === 'tutor' || currentUser?.role === 'admin') && sub.status !== 'graded' && (
                            <button
                              onClick={() => setGradingSubmission(sub)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                            >
                              Assign Grade & Feedback
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VERIFIED DIPLOMAS */}
            {activeDashboardTab === 'certificates' && (
              <div className="space-y-6 text-left">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-orange-500 text-[10px] uppercase font-black tracking-widest">Verified Accreditation</span>
                  <h2 className="text-xl md:text-2xl font-extrabold uppercase font-serif text-slate-900 dark:text-white">Accreditation Diplomas</h2>
                </div>

                {certificates.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <Trophy size={36} className="mx-auto text-amber-500" />
                    <h3 className="text-base font-bold uppercase font-serif">No Diplomas Earned Yet</h3>
                    <p className="text-xs text-slate-500">Pass the accreditation assessment quiz in any track to earn your official diploma.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map(cert => (
                      <div key={cert.id} className="p-6 bg-gradient-to-br from-amber-500/10 via-white dark:via-slate-900 to-orange-500/10 border border-amber-500/30 rounded-3xl space-y-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <Trophy size={28} className="text-amber-500" />
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{cert.hash}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-serif font-extrabold text-base uppercase">{cert.course_title}</h3>
                          <p className="text-xs text-slate-500">Issued to: <strong className="text-slate-900 dark:text-white">{cert.full_name}</strong></p>
                        </div>
                        <button
                          onClick={() => printCertificate(cert)}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Download size={14} />
                          <span>Print / Download Official Diploma</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: COURSE CREATOR STUDIO (Tutor / Admin) */}
            {activeDashboardTab === 'tutor-creator' && (currentUser?.role === 'tutor' || currentUser?.role === 'admin') && (
              <div className="space-y-6 text-left">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-orange-500 text-[10px] uppercase font-black tracking-widest">Educator Studio</span>
                  <h2 className="text-xl md:text-2xl font-extrabold uppercase font-serif text-slate-900 dark:text-white">Publish New Course</h2>
                </div>

                <form onSubmit={handleCreateCourse} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[10px] text-slate-500">Course Title</label>
                    <input
                      type="text"
                      required
                      value={newCourseTitle}
                      onChange={e => setNewCourseTitle(e.target.value)}
                      placeholder="e.g. Next.js 15 & AI Microservices Masterclass"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[10px] text-slate-500">Category</label>
                      <select
                        value={newCourseCategory}
                        onChange={e => setNewCourseCategory(e.target.value as any)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      >
                        <option value="web">Web & Software</option>
                        <option value="marketing">Digital Marketing</option>
                        <option value="ai">AI Integration</option>
                        <option value="business">Business Strategy</option>
                        <option value="compliance">CAC Compliance</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[10px] text-slate-500">Level</label>
                      <select
                        value={newCourseLevel}
                        onChange={e => setNewCourseLevel(e.target.value as any)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[10px] text-slate-500">Duration</label>
                      <input
                        type="text"
                        value={newCourseDuration}
                        onChange={e => setNewCourseDuration(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[10px] text-slate-500">Price</label>
                      <input
                        type="text"
                        value={newCoursePrice}
                        onChange={e => setNewCoursePrice(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[10px] text-slate-500">Cover Image URL</label>
                    <input
                      type="url"
                      value={newCourseImage}
                      onChange={e => setNewCourseImage(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[10px] text-slate-500">Description</label>
                    <textarea
                      rows={3}
                      value={newCourseDesc}
                      onChange={e => setNewCourseDesc(e.target.value)}
                      placeholder="Enter full course curriculum objectives..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Publish Course Curriculum
                  </button>
                </form>
              </div>
            )}

            {/* TAB 6: STUDENT & TUTOR MANAGEMENT (Admin / Tutor) */}
            {activeDashboardTab === 'admin-mgmt' && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
              <div className="space-y-6 text-left">
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-orange-500 text-[10px] uppercase font-black tracking-widest">Academic Administration</span>
                  <h2 className="text-xl md:text-2xl font-extrabold uppercase font-serif text-slate-900 dark:text-white">Platform Governance</h2>
                </div>

                {/* Recharts Analytics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                    <h4 className="text-xs font-bold uppercase font-serif text-slate-900 dark:text-white">Enrollment Metrics</h4>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Web', count: 42 },
                          { name: 'Marketing', count: 68 },
                          { name: 'AI', count: 35 },
                          { name: 'Business', count: 28 },
                          { name: 'CAC', count: 19 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#ea580c" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                    <h4 className="text-xs font-bold uppercase font-serif text-slate-900 dark:text-white">Registered Tutors Directory</h4>
                    <div className="space-y-3 text-xs">
                      {tutors.map(tut => (
                        <div key={tut.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{tut.full_name}</span>
                            <span className="text-[10px] text-slate-400">{tut.expertise}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            tut.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                          }`}>
                            {tut.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 text-xs text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold font-serif uppercase text-slate-900 dark:text-white">Grade Coursework Submission</h3>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[9px] text-slate-500">Grade Letter</label>
                <select
                  value={gradeValue}
                  onChange={e => setGradeValue(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                >
                  <option value="A+">A+ (Distinction)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="B">B (Credit)</option>
                  <option value="C">C (Pass)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[9px] text-slate-500">Tutor Feedback Remarks</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  placeholder="Enter mentor remarks and guidance for the student..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs rounded-xl transition-all cursor-pointer"
              >
                Save Grade & Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
