import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Play, Award, Download, CheckCircle, GraduationCap, 
  ArrowRight, Users, Eye, HelpCircle, Trophy, UserCheck, ShieldAlert,
  Plus, Send, ClipboardList, TrendingUp, Sparkles, Check, CheckCircle2,
  Bookmark, User, FileText, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { COURSES, Course, Lesson } from '../lib/data';

// Types for Academy Integration
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

interface QuizSubmission {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  completed_at: string;
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

export const TrainingAcademySection: React.FC = () => {
  // Navigation & Role Tabs
  const [activeTab, setActiveTab] = useState<'student' | 'tutor' | 'admin'>('student');
  
  // Base Data States
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // Current Active User Context (Default to David Alao for seamless demo)
  const [currentUser, setCurrentUser] = useState({
    id: 'usr_david',
    name: 'David Alao',
    email: 'david@dstech.agency',
    role: 'student' // 'student' or 'tutor' or 'admin'
  });

  // Loading & Action States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Classroom Mode States
  const [enrolledCourse, setEnrolledCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  
  // Coursework Submission Forms
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileKey, setSubmissionFileKey] = useState('');

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  // Tutor Workspace States
  const [tutorApplication, setTutorApplication] = useState({
    full_name: currentUser.name,
    email: currentUser.email,
    bio: 'Senior Marketing Technologist with 8+ years scaling regional ad accounts.',
    expertise: 'Digital Marketing & Social Ads'
  });
  const [currentTutorProfile, setCurrentTutorProfile] = useState<Tutor | null>(null);
  
  // Course Creator State (Tutor)
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    duration: '4 Weeks',
    level: 'Beginner' as 'Beginner' | 'Advanced' | 'All Levels',
    price: '₦45,000',
    category: 'marketing' as 'marketing' | 'web' | 'ai' | 'business' | 'compliance',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    lessons: [
      { id: 'les_1', title: 'Introduction & Foundations', duration: '15 mins', content: 'Core terminologies and industry trends.' },
      { id: 'les_2', title: 'Practical Application Workflow', duration: '25 mins', content: 'Hands-on configuration and optimization metrics.' }
    ]
  });

  // Grading State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState('A');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Assessment Quiz Questions bank
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

  // Fetch Database Sync Helper
  const fetchAcademyData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Courses
      const courseRes = await fetch('/api/courses');
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        if (courseData && courseData.length > 0) {
          setCourses(courseData);
        } else {
          // Initialize empty backend
          await fetch('/api/courses/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(COURSES)
          });
          setCourses(COURSES);
        }
      }

      // 2. Fetch Enrollments
      const enrollRes = await fetch(`/api/academy/enrollments?userId=${currentUser.id}`);
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        setEnrollments(enrollData);
      }

      // 3. Fetch Tutors
      const tutorRes = await fetch('/api/academy/tutors');
      if (tutorRes.ok) {
        const tutorData = await tutorRes.json();
        setTutors(tutorData);
        // Find if current user is registered as a tutor
        const matched = tutorData.find((t: Tutor) => t.user_id === currentUser.id);
        if (matched) {
          setCurrentTutorProfile(matched);
        }
      }

      // 4. Fetch Submissions
      const subRes = await fetch(`/api/academy/submissions`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubmissions(subData);
      }

      // 5. Fetch Certificates
      const certRes = await fetch(`/api/academy/certificates?userId=${currentUser.id}`);
      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(certData);
      }
    } catch (e) {
      console.error("Database connection failed. Serving elegant mock fallback dataset.", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademyData();
  }, [currentUser.id]);

  // STUDENT - Enroll Course Handler
  const handleEnroll = async (course: Course) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const isAlreadyEnrolled = enrollments.some(e => e.course_id === course.id);
      let targetEnrollment: Enrollment;

      if (!isAlreadyEnrolled) {
        // Create new enrollment row in Cloudflare D1
        const newEnrollObj = {
          id: 'enroll_' + Math.random().toString(36).substring(2, 11),
          user_id: currentUser.id,
          course_id: course.id,
          progress: 0,
          status: 'enrolled',
          completed_lessons: JSON.stringify([]),
          assigned_tutor_id: tutors.find(t => t.status === 'approved')?.id || 'tutor_default',
          created_at: new Date().toISOString()
        };

        const res = await fetch('/api/academy/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEnrollObj)
        });

        if (res.ok) {
          const savedEnroll = await res.json();
          setEnrollments(prev => [...prev, savedEnroll]);
          targetEnrollment = savedEnroll;
          setSuccessMessage(`Successfully enrolled in "${course.title}"!`);
        } else {
          // Local fallback
          setEnrollments(prev => [...prev, newEnrollObj]);
          targetEnrollment = newEnrollObj;
        }
      } else {
        targetEnrollment = enrollments.find(e => e.course_id === course.id)!;
      }

      // Load Classroom Mode
      setEnrolledCourse(course);
      setActiveLesson(course.lessons[0]);
      try {
        setCompletedLessonIds(JSON.parse(targetEnrollment.completed_lessons || '[]'));
      } catch {
        setCompletedLessonIds([]);
      }

      // Reset dynamic modules
      setQuizStarted(false);
      setQuizFinished(false);
      setSelectedAnswers([]);
      setCurrentQuestion(0);
    } catch (err) {
      setErrorMessage("Enrollment could not be synchronized.");
    }
  };

  // STUDENT - Complete Lesson & Update Progress Handler
  const handleToggleLessonComplete = async (lessonId: string) => {
    if (!enrolledCourse) return;
    const currentEnroll = enrollments.find(e => e.course_id === enrolledCourse.id);
    if (!currentEnroll) return;

    let updatedCompleted: string[];
    if (completedLessonIds.includes(lessonId)) {
      updatedCompleted = completedLessonIds.filter(id => id !== lessonId);
    } else {
      updatedCompleted = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updatedCompleted);

    // Calculate dynamic progress bar
    const progressPercent = Math.round((updatedCompleted.length / enrolledCourse.lessons.length) * 100);

    const updatedEnrollObj = {
      ...currentEnroll,
      progress: progressPercent,
      completed_lessons: JSON.stringify(updatedCompleted),
      updated_at: new Date().toISOString()
    };

    // Update in database
    setEnrollments(prev => prev.map(e => e.id === currentEnroll.id ? updatedEnrollObj : e));
    try {
      await fetch('/api/academy/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEnrollObj)
      });
    } catch (e) {
      console.warn("D1 update failed, saved to state.", e);
    }
  };

  // STUDENT - Submit Assignment
  const handleAddSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolledCourse || !activeLesson) return;
    const currentEnroll = enrollments.find(e => e.course_id === enrolledCourse.id);
    if (!currentEnroll) return;

    if (!submissionText.trim()) {
      setErrorMessage("Please input your coursework answers or milestone text.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const newSub: Submission = {
      id: 'sub_' + Math.random().toString(36).substring(2, 11),
      enrollment_id: currentEnroll.id,
      course_id: enrolledCourse.id,
      lesson_id: activeLesson.id,
      user_id: currentUser.id,
      submission_text: submissionText,
      submission_file_key: submissionFileKey || 'drive_shared_link',
      status: 'submitted',
      submitted_at: new Date().toISOString()
    };

    setSubmissions(prev => [newSub, ...prev]);
    setSubmissionText('');
    setSubmissionFileKey('');

    try {
      const res = await fetch('/api/academy/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      });
      if (res.ok) {
        setSuccessMessage("Your coursework has been submitted to your assigned tutor successfully!");
      }
    } catch (err) {
      console.warn("Offline submission tracked in memory.");
    } finally {
      setIsLoading(false);
    }
  };

  // STUDENT - Interactive Quiz Answer Selection
  const handleAnswerSelect = (optIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentQuestion] = optIndex;
    setSelectedAnswers(updated);
  };

  // STUDENT - Next Question / Submit Quiz Handler
  const handleNextQuizQuestion = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Score calculation
      const correctAnswersCount = selectedAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length;
      const pass = correctAnswersCount === quizQuestions.length; // 100% correct required for instant legal certification
      
      setQuizScore(correctAnswersCount);
      setQuizPassed(pass);
      setQuizFinished(true);

      // Store quiz attempt persistently in database
      const quizObj = {
        id: 'quiz_' + Math.random().toString(36).substring(2, 11),
        user_id: currentUser.id,
        course_id: enrolledCourse?.id || 'course_default',
        lesson_id: activeLesson?.id || 'lesson_final',
        score: correctAnswersCount,
        total_questions: quizQuestions.length,
        passed: pass ? 1 : 0
      };

      try {
        await fetch('/api/academy/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quizObj)
        });
      } catch (e) {
        console.warn("Quiz submission stored locally.");
      }

      if (pass && enrolledCourse) {
        // Automatically mint certificate
        const certHash = 'dstech_' + Math.random().toString(36).substring(2, 15);
        const certObj: Certificate = {
          id: 'cert_' + Math.random().toString(36).substring(2, 8),
          user_id: currentUser.id,
          course_id: enrolledCourse.id,
          course_title: enrolledCourse.title,
          full_name: currentUser.name,
          hash: certHash,
          issued_at: new Date().toISOString()
        };

        setCertificates(prev => [certObj, ...prev]);

        try {
          await fetch('/api/academy/certificates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(certObj)
          });
        } catch (e) {
          console.warn("Certificate issued locally.");
        }
      }
    }
  };

  // TUTOR - Register as Tutor Form Submission
  const handleTutorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const tutorObj: Tutor = {
      id: 'tutor_' + Math.random().toString(36).substring(2, 11),
      user_id: currentUser.id,
      full_name: tutorApplication.full_name,
      email: tutorApplication.email,
      bio: tutorApplication.bio,
      expertise: tutorApplication.expertise,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/academy/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tutorObj)
      });
      if (res.ok) {
        const saved = await res.json();
        setCurrentTutorProfile(saved);
        setTutors(prev => [...prev, saved]);
        setSuccessMessage("Your application to become a certified tutor has been registered!");
      } else {
        setCurrentTutorProfile(tutorObj);
        setTutors(prev => [...prev, tutorObj]);
      }
    } catch (err) {
      setCurrentTutorProfile(tutorObj);
      setTutors(prev => [...prev, tutorObj]);
    } finally {
      setIsLoading(false);
    }
  };

  // TUTOR - Fast-Track Auto-Approve Tutor (For seamless demo testing!)
  const handleFastTrackTutorApproval = async () => {
    if (!currentTutorProfile) return;
    setIsLoading(true);

    const approvedObj: Tutor = {
      ...currentTutorProfile,
      status: 'approved',
      updated_at: new Date().toISOString()
    } as any;

    try {
      const res = await fetch('/api/academy/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvedObj)
      });
      if (res.ok) {
        const saved = await res.json();
        setCurrentTutorProfile(saved);
        setTutors(prev => prev.map(t => t.id === saved.id ? saved : t));
        setSuccessMessage("Developer Mode: Your workspace is now Approved!");
      } else {
        setCurrentTutorProfile(approvedObj);
        setTutors(prev => prev.map(t => t.id === approvedObj.id ? approvedObj : t));
      }
    } catch (e) {
      setCurrentTutorProfile(approvedObj);
      setTutors(prev => prev.map(t => t.id === approvedObj.id ? approvedObj : t));
    } finally {
      setIsLoading(false);
    }
  };

  // TUTOR - Save New Course to Catalog
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      setErrorMessage("Please input course title and detailed description.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const generatedId = 'course_' + Math.random().toString(36).substring(2, 11);
    const finalCourseObj: Course = {
      id: generatedId,
      title: newCourse.title,
      description: newCourse.description,
      image: newCourse.image,
      duration: newCourse.duration,
      level: newCourse.level,
      price: newCourse.price,
      category: newCourse.category,
      lessons: newCourse.lessons.map((l, i) => ({
        id: `les_${i+1}_${generatedId}`,
        title: l.title,
        duration: l.duration,
        content: l.content
      }))
    };

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalCourseObj)
      });
      if (res.ok) {
        const saved = await res.json();
        setCourses(prev => [saved, ...prev]);
        setSuccessMessage(`New course "${saved.title}" successfully designed and added to database!`);
        setShowCourseCreator(false);
        // Reset Creator Form
        setNewCourse({
          title: '',
          description: '',
          duration: '4 Weeks',
          level: 'Beginner',
          price: '₦45,000',
          category: 'marketing',
          image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
          lessons: [
            { id: 'les_1', title: 'Introduction & Foundations', duration: '15 mins', content: 'Core terminologies and industry trends.' },
            { id: 'les_2', title: 'Practical Application Workflow', duration: '25 mins', content: 'Hands-on configuration and optimization metrics.' }
          ]
        });
      }
    } catch (err) {
      setCourses(prev => [finalCourseObj, ...prev]);
      setShowCourseCreator(false);
    } finally {
      setIsLoading(false);
    }
  };

  // TUTOR - Update Grade & Feedback on Coursework Submission
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setIsLoading(true);

    const gradedObj: Submission = {
      ...gradingSubmission,
      grade: gradeValue,
      feedback: gradeFeedback || 'Excellent comprehension and milestone progress.',
      status: 'graded',
      graded_at: new Date().toISOString()
    };

    setSubmissions(prev => prev.map(s => s.id === gradingSubmission.id ? gradedObj : s));
    setGradingSubmission(null);
    setGradeFeedback('');

    try {
      await fetch('/api/academy/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradedObj)
      });
      setSuccessMessage("Coursework graded successfully!");
    } catch (err) {
      console.warn("Offline grade cached.");
    } finally {
      setIsLoading(false);
    }
  };

  // ADMIN - Approve/Reject Tutor Applications
  const handleToggleTutorStatus = async (tutorId: string, newStatus: 'approved' | 'rejected') => {
    const matched = tutors.find(t => t.id === tutorId);
    if (!matched) return;

    setIsLoading(true);
    const updatedTutor = {
      ...matched,
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    setTutors(prev => prev.map(t => t.id === tutorId ? updatedTutor : t));
    if (currentTutorProfile?.id === tutorId) {
      setCurrentTutorProfile(updatedTutor);
    }

    try {
      await fetch('/api/academy/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTutor)
      });
      setSuccessMessage(`Tutor application status updated to: ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.warn("Offline status changed.");
    } finally {
      setIsLoading(false);
    }
  };

  // PRINT CERTIFICATE HELPER
  const printCertificate = (cert: Certificate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>DS Tech Academy - Verified Certificate of Completion</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@300;500;700&display=swap');
            body { 
              font-family: 'Montserrat', sans-serif; 
              text-align: center; 
              padding: 60px; 
              border: 15px solid #000E32; 
              background: #fbfbfa; 
              box-sizing: border-box;
              height: 90vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: relative;
            }
            .border-inner {
              border: 2px solid #e2af43;
              height: 100%;
              padding: 40px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            h1 { 
              font-family: 'Cinzel', serif; 
              font-size: 42px; 
              color: #000E32; 
              text-transform: uppercase; 
              margin: 0;
              letter-spacing: 2px;
            }
            .subtitle { 
              font-style: italic; 
              font-size: 16px; 
              color: #777; 
              margin-top: 10px;
              letter-spacing: 1px;
            }
            .cert-body {
              font-size: 15px;
              color: #333;
              line-height: 1.8;
              margin: 30px 0;
              font-weight: 300;
            }
            .name { 
              font-family: 'Cinzel', serif;
              font-size: 34px; 
              font-weight: 800; 
              color: #d97706; 
              border-bottom: 2px solid #e2af43; 
              display: inline-block; 
              padding: 5px 30px; 
              margin: 15px 0; 
            }
            .footer-info { 
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
              padding: 0 40px;
            }
            .sig-block {
              text-align: center;
              width: 150px;
            }
            .sig-line {
              border-top: 1px solid #777;
              margin-top: 15px;
              padding-top: 5px;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
              color: #000E32;
            }
            .stamp-box { 
              border: 3px double #d97706; 
              color: #d97706; 
              font-size: 12px; 
              font-weight: bold; 
              display: inline-block; 
              padding: 8px 12px; 
              text-transform: uppercase; 
              transform: rotate(-3deg); 
              font-family: 'Cinzel', serif;
            }
            .verification-code {
              font-family: monospace;
              font-size: 10px;
              color: #888;
              text-align: center;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="border-inner">
            <div>
              <h1>Certificate of Achievement</h1>
              <div class="subtitle">DS TECH PROFESSIONAL VOCATIONAL ACADEMY</div>
            </div>
            
            <div class="cert-body">
              This is to officially recognize and certify that
              <br/>
              <div class="name">${cert.full_name}</div>
              <br/>
              has successfully completed all lectures, submitted certified coursework,
              <br/>
              and passed the final verification testing panel for
              <br/>
              <strong style="color:#000E32; font-size: 18px; font-weight: 700; display: inline-block; margin-top: 8px;">${cert.course_title}</strong>
            </div>
            
            <div>
              <div class="footer-info">
                <div class="sig-block">
                  <span style="font-family:'Cinzel'; font-size:12px; font-style:italic; color:#777;">Grace Ibrahim</span>
                  <div class="sig-line">Academy Registrar</div>
                </div>
                
                <div class="stamp-box">
                  DS Tech Verified<br/>Cryptographic Seal
                </div>
                
                <div class="sig-block">
                  <span style="font-family:'Cinzel'; font-size:12px; font-style:italic; color:#777;">David Alao</span>
                  <div class="sig-line">Principal Director</div>
                </div>
              </div>
              <div class="verification-code">
                Issued: ${new Date(cert.issued_at).toLocaleDateString()} • Verification Hash: ${cert.hash.toUpperCase()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Recharts Helper Data Formatter for Tutor Academic Performance Analytics
  const getSubmissionsOverviewData = () => {
    // Group submissions by status
    const submittedCount = submissions.filter(s => s.status === 'submitted').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;
    return [
      { name: 'Pending Review', value: submittedCount },
      { name: 'Graded Coursework', value: gradedCount }
    ];
  };

  const getCourseEnrollmentSummary = () => {
    return courses.map(c => {
      const enCount = enrollments.filter(e => e.course_id === c.id).length;
      return {
        name: c.title.substring(0, 15) + '...',
        'Students Enrolled': enCount || Math.floor(Math.random() * 8) + 2 // Safe default
      };
    });
  };

  const COLORS = ['#ea580c', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10 animate-fade-in text-left text-slate-800 dark:text-slate-100">
      
      {/* Upper Status Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
          <div className="flex-1">{successMessage}</div>
          <button onClick={() => setSuccessMessage(null)} className="hover:opacity-75 uppercase text-[10px]">Dismiss</button>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-75 uppercase text-[10px]">Dismiss</button>
        </div>
      )}

      {/* Main Page Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200/50 dark:border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xs uppercase tracking-widest font-black">Vocational Hub</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-slate-400 text-xs font-bold font-mono">D1 CLOUD DATA SECURED</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white flex items-center gap-2">
            DS Tech <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Academy</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl font-light">
            Ecosystem for premium certified vocational programs. Enroll in coursework, complete assessment modules, submit assignments to verified trainers, and generate accredited completion credentials.
          </p>
        </div>

        {/* High-Fidelity Dual-Portal Navigation Tab */}
        <div className="bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex shadow-sm shrink-0">
          <button
            onClick={() => { setActiveTab('student'); setEnrolledCourse(null); setQuizStarted(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#000E32]'
            }`}
          >
            <GraduationCap size={14} />
            Student Panel
          </button>
          <button
            onClick={() => { setActiveTab('tutor'); setEnrolledCourse(null); setQuizStarted(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'tutor'
                ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#000E32]'
            }`}
          >
            <Users size={14} />
            Tutor Workspace
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setEnrolledCourse(null); setQuizStarted(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#000E32]'
            }`}
          >
            <ShieldAlert size={14} />
            Admin Panel
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'student' && (
          <motion.div 
            key="student-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {enrolledCourse ? (
              /* ================== CLASSROOM ACTIVE LEARNING ENVIRONMENT ================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Lessons list & progress tracker */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-5 rounded-3xl space-y-5 shadow-sm">
                  <div>
                    <button 
                      onClick={() => setEnrolledCourse(null)}
                      className="text-[10px] uppercase font-black tracking-wider text-slate-400 hover:text-orange-500 flex items-center gap-1 mb-2 transition-colors"
                    >
                      ← Back to Course Directory
                    </button>
                    <h3 className="font-extrabold text-[#000E32] dark:text-white text-sm uppercase font-serif line-clamp-2 leading-tight">
                      {enrolledCourse.title}
                    </h3>
                  </div>

                  {/* Progressive Roadmap Tracker with clean stats */}
                  <div className="space-y-2 pt-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <span>Curriculum Progress</span>
                      <span className="font-mono text-orange-500">
                        {Math.round((completedLessonIds.length / enrolledCourse.lessons.length) * 100)}%
                      </span>
                    </div>
                    
                    {/* Progress Bar with elegant animation */}
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedLessonIds.length / enrolledCourse.lessons.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {completedLessonIds.length} of {enrolledCourse.lessons.length} lessons finalized
                    </div>
                  </div>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Lesson Roadmap</span>
                    {enrolledCourse.lessons.map((les, i) => {
                      const isDone = completedLessonIds.includes(les.id);
                      return (
                        <div
                          key={les.id}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 ${
                            activeLesson?.id === les.id
                              ? 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 text-[#000E32] dark:text-orange-400 font-bold'
                              : 'bg-white dark:bg-slate-950 border-slate-200/50 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setActiveLesson(les);
                              setQuizStarted(false);
                              setQuizFinished(false);
                            }}
                            className="flex items-start gap-3 flex-1 text-left"
                          >
                            <span className="font-mono text-slate-400">0{i+1}</span>
                            <div className="space-y-0.5">
                              <span className="block line-clamp-1 text-xs">{les.title}</span>
                              <span className="text-[10px] text-slate-400 font-light block">{les.duration}</span>
                            </div>
                          </button>

                          {/* Quick completion toggle */}
                          <button
                            onClick={() => handleToggleLessonComplete(les.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isDone 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                            title={isDone ? "Mark as incomplete" : "Mark as completed"}
                          >
                            <Check size={11} strokeWidth={3} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trigger Quiz Assessment block */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setQuizStarted(true);
                        setQuizFinished(false);
                        setCurrentQuestion(0);
                        setSelectedAnswers([]);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-[#000E32] to-[#1d2d54] dark:from-orange-600 dark:to-orange-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 transition-opacity"
                    >
                      <Trophy size={13} className="text-amber-400" />
                      <span>Take Accreditation Quiz</span>
                    </button>
                  </div>
                </div>

                {/* Right Interactive Viewport Area */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
                    {quizStarted ? (
                      /* ACTIVE ASSESSMENT MODULE */
                      <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs uppercase font-black text-orange-500 flex items-center gap-1.5">
                            <Trophy size={14} className="animate-bounce" />
                            Accreditation Assessment
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Question {currentQuestion + 1} of {quizQuestions.length}
                          </span>
                        </div>

                        {quizFinished ? (
                          <div className="text-center py-6 space-y-4">
                            {quizScore === quizQuestions.length ? (
                              <div className="space-y-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 mx-auto">
                                  <CheckCircle size={36} />
                                </div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg uppercase font-serif">Assessment Perfect Score! (100%)</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                                  Superb performance! You answered all vocational questions correctly. Your digital certificate has been permanently issued to the registry.
                                </p>
                                
                                {certificates.length > 0 && (
                                  <div className="pt-4 flex justify-center gap-3">
                                    <button
                                      onClick={() => printCertificate(certificates[0])}
                                      className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-extrabold uppercase rounded-xl tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                                    >
                                      <Award size={13} />
                                      Print Official Certificate
                                    </button>
                                    <button
                                      onClick={() => setQuizStarted(false)}
                                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold uppercase rounded-xl"
                                    >
                                      Back to Classroom
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-500 mx-auto">
                                  <HelpCircle size={36} />
                                </div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg uppercase font-serif">Accreditation Unfinished ({quizScore}/{quizQuestions.length})</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                                  You must score 100% (3/3) correct answers to unlock an accredited DS Tech Academy vocational diploma.
                                </p>
                                <div className="pt-4">
                                  <button
                                    onClick={() => {
                                      setCurrentQuestion(0);
                                      setSelectedAnswers([]);
                                      setQuizFinished(false);
                                    }}
                                    className="px-5 py-2.5 bg-[#000E32] dark:bg-orange-600 text-white text-xs font-extrabold uppercase rounded-xl tracking-wider"
                                  >
                                    Retry Assessment
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <h4 className="font-extrabold text-[#000E32] dark:text-white text-sm uppercase font-serif leading-snug">
                              {quizQuestions[currentQuestion].q}
                            </h4>
                            <div className="space-y-2.5">
                              {quizQuestions[currentQuestion].options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => handleAnswerSelect(oIdx)}
                                  className={`w-full p-4 rounded-2xl border text-xs text-left transition-all font-semibold ${
                                    selectedAnswers[currentQuestion] === oIdx
                                      ? 'bg-orange-50/40 dark:bg-orange-950/30 border-orange-400 text-orange-600 dark:text-orange-400'
                                      : 'bg-white dark:bg-slate-950 border-slate-200/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                                  }`}
                                >
                                  <span className="inline-block mr-2 text-slate-400 font-mono font-bold">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </span>
                                  {opt}
                                </button>
                              ))}
                            </div>

                            <div className="pt-4 flex justify-end">
                              <button
                                onClick={handleNextQuizQuestion}
                                disabled={selectedAnswers[currentQuestion] === undefined}
                                className="px-5 py-2.5 bg-[#000E32] dark:bg-orange-600 text-white text-xs font-black uppercase rounded-xl disabled:opacity-40 hover:opacity-90"
                              >
                                {currentQuestion === quizQuestions.length - 1 ? 'Submit Assessment' : 'Next Question'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : activeLesson ? (
                      /* ACTIVE LECTURE MODULE VIEWPORT */
                      <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs uppercase font-black text-orange-500 tracking-wider">Active Lecture Module</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-500 px-2.5 py-1 rounded-full font-bold">AUDIO INTERACTIVE CONSOLE</span>
                        </div>

                        <div className="space-y-3 text-left">
                          <h2 className="font-extrabold text-[#000E32] dark:text-white text-lg md:text-xl uppercase font-serif tracking-tight">
                            {activeLesson.title}
                          </h2>
                          
                          {/* Rich Lecture Visual Player */}
                          <div className="h-48 bg-[#000E32]/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/5 relative overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#021a52_1px,transparent_1px),linear-gradient(to_bottom,#021a52_1px,transparent_1px)] bg-[size:24px_24px] opacity-15" />
                            <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 mb-2 relative z-10 animate-pulse">
                              <Play className="fill-current text-orange-500" size={18} />
                            </div>
                            <span className="text-white text-xs font-bold font-serif uppercase relative z-10">Academy Lecture Audio Node</span>
                            <span className="text-slate-400 text-[10px] relative z-10 font-mono">DSTECH_STREAM_DELETION_{activeLesson.id.toUpperCase()}</span>
                            
                            {/* Wave bar simulator */}
                            <div className="flex items-end gap-1 mt-4 relative z-10">
                              <span className="w-1 h-3 bg-orange-500 rounded animate-pulse" />
                              <span className="w-1 h-6 bg-orange-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <span className="w-1 h-8 bg-orange-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                              <span className="w-1 h-4 bg-orange-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                              <span className="w-1 h-2 bg-orange-500 rounded animate-pulse" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-left">
                          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Lesson Materials & Core Directives</span>
                          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-light bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            {activeLesson.content || "Learn the technical framework, target segmentation metrics, and algorithmic bidding routines. Download hand-out worksheets below to track optimizations."}
                          </p>
                        </div>

                        {/* Interactive Lecture Handout */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <button 
                            onClick={() => alert("Lecture Handout Worksheets have been downloaded successfully (mock-PDF).")}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Download size={13} />
                            Download Materials
                          </button>
                          
                          <button
                            onClick={() => {
                              setQuizStarted(true);
                              setQuizFinished(false);
                              setCurrentQuestion(0);
                              setSelectedAnswers([]);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-[11px] font-black uppercase rounded-xl tracking-wider flex items-center gap-1.5 shadow-md"
                          >
                            <Trophy size={13} />
                            Accreditation Quiz
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* ================== COURSEWORK SUBMISSION BOARD ================== */}
                  {activeLesson && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 text-left">
                        <span className="text-xs uppercase font-black text-orange-500 tracking-wider block mb-1">Pillar 2: Deliverables</span>
                        <h4 className="font-extrabold text-[#000E32] dark:text-white text-base uppercase font-serif">
                          Milestone & Assignment Submission
                        </h4>
                      </div>

                      <form onSubmit={handleAddSubmission} className="space-y-4">
                        <div className="text-left space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400">Assignment Response Text</label>
                          <textarea
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Provide your complete code snippet, campaign URL parameters, or written response matching this milestone guidelines..."
                            className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-left space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-400">Google Drive / Figma Key Link (Optional)</label>
                            <input
                              type="text"
                              value={submissionFileKey}
                              onChange={(e) => setSubmissionFileKey(e.target.value)}
                              placeholder="https://drive.google.com/shared/link..."
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div className="text-left space-y-1.5 flex flex-col justify-end">
                            <button
                              type="submit"
                              className="w-full py-2.5 bg-[#000E32] dark:bg-orange-600 text-white font-black text-[11px] uppercase tracking-wider rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5"
                            >
                              <Send size={12} />
                              Submit Coursework
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* Coursework Status & History Registry */}
                      <div className="pt-4">
                        <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider mb-3 text-left">Your Submission Log for this Course</span>
                        <div className="space-y-3">
                          {submissions.filter(s => s.course_id === enrolledCourse.id).length === 0 ? (
                            <p className="text-xs text-slate-400 italic font-light text-left">No submissions recorded for this course curriculum yet.</p>
                          ) : (
                            submissions.filter(s => s.course_id === enrolledCourse.id).map((sub) => {
                              const matchingLesson = enrolledCourse.lessons.find(l => l.id === sub.lesson_id);
                              return (
                                <div key={sub.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-4 text-left">
                                  <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold uppercase text-[#000E32] dark:text-orange-400">
                                        {matchingLesson?.title || 'Lecture Module'}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                        sub.status === 'graded' 
                                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' 
                                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                                      }`}>
                                        {sub.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic font-light">
                                      "{sub.submission_text}"
                                    </p>
                                    {sub.feedback && (
                                      <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/25 border-l-2 border-indigo-500 text-[11px] text-indigo-700 dark:text-indigo-300">
                                        <strong>Instructor Feedback:</strong> {sub.feedback}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-row md:flex-col justify-between items-end shrink-0 gap-2">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(sub.submitted_at).toLocaleDateString()}
                                    </span>
                                    {sub.status === 'graded' && (
                                      <div className="flex items-center gap-1 bg-emerald-500 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                                        <span>Grade:</span>
                                        <span>{sub.grade}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ================== COURSE CATALOG DIRECTORY ================== */
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Accredited Career Tracks</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-orange-500 font-bold">{courses.length} courses</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400">Cloud Sync Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {courses.map((course, idx) => {
                    const isEnrolled = enrollments.some(e => e.course_id === course.id);
                    const matchedEnroll = enrollments.find(e => e.course_id === course.id);

                    return (
                      <motion.div 
                        key={course.id} 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 280, damping: 20 }}
                        whileHover={{ 
                          y: -6, 
                          scale: 1.015,
                          borderColor: 'rgba(249, 115, 22, 0.4)',
                          boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.05)"
                        }}
                        className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row group relative"
                      >
                        {/* Floating fit score for academy vibe */}
                        <div className="absolute top-3 left-3 bg-[#000E32]/95 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 z-10 backdrop-blur-sm shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>98.4% Match Score</span>
                        </div>

                        <div className="sm:w-2/5 h-44 sm:h-auto overflow-hidden relative shrink-0">
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-orange-500 rounded font-black uppercase">
                                {course.level}
                              </span>
                              <span>{course.duration}</span>
                            </div>
                            <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs md:text-sm line-clamp-2 leading-tight font-serif uppercase group-hover:text-orange-500 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-light line-clamp-2">
                              {course.description}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-mono font-black text-orange-500">{course.price}</span>
                            <button
                              onClick={() => handleEnroll(course)}
                              className="px-4 py-1.5 bg-[#000E32] dark:bg-orange-600 hover:opacity-90 text-white text-[10px] font-black uppercase rounded-xl tracking-wider flex items-center gap-1 transition-all"
                            >
                              <span>{isEnrolled ? `Resume Class (${matchedEnroll?.progress || 0}%)` : 'Enroll Now'}</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'tutor' && (
          <motion.div 
            key="tutor-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {!currentTutorProfile ? (
              /* ================== REGISTER / APPLY AS TUTOR FORM ================== */
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-8 rounded-3xl space-y-6 shadow-sm text-left">
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-xs uppercase font-black text-orange-500 tracking-wider">Become a Trainer</span>
                  <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                    Apply as DS Tech Academy Tutor
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed">
                    Join our database of verified academic tutors. Approved tutors have workspaces to design custom curricula, structure milestone homework tasks, score submissions, and access student compliance performance stats.
                  </p>
                </div>

                <form onSubmit={handleTutorRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={tutorApplication.full_name}
                        onChange={(e) => setTutorApplication(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-400">Contact Email Address</label>
                      <input
                        type="email"
                        value={tutorApplication.email}
                        onChange={(e) => setTutorApplication(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Core Industry Expertise</label>
                    <input
                      type="text"
                      value={tutorApplication.expertise}
                      onChange={(e) => setTutorApplication(prev => ({ ...prev, expertise: e.target.value }))}
                      placeholder="e.g. React Web Architecture, Facebook Conversions API"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Professional Professional bio & Qualifications</label>
                    <textarea
                      value={tutorApplication.bio}
                      onChange={(e) => setTutorApplication(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full h-28 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#000E32] dark:bg-orange-600 text-white font-black text-[11px] uppercase tracking-wider rounded-xl hover:opacity-90"
                  >
                    Submit Tutor Application
                  </button>
                </form>
              </div>
            ) : currentTutorProfile.status === 'pending' ? (
              /* ================== PENDING TUTOR SCREEN WITH DEV TOGGLE FAST-TRACK ================== */
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-8 rounded-3xl space-y-6 shadow-sm text-center">
                <div className="w-12 h-12 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                  <AlertCircle size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base uppercase font-serif">Tutor Profile Under Review</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
                    Your application for expertise in <strong>"{currentTutorProfile.expertise}"</strong> is currently in our review pipeline. 
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                  <span className="text-[9px] uppercase font-black text-amber-500 block">Fast-Track Workspace Integration</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Are you a reviewer? Click below to instantly bypass the admin review loop and approve this tutor profile.
                  </p>
                  <button
                    onClick={handleFastTrackTutorApproval}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-[10px] font-black uppercase rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                  >
                    Auto-Approve Tutor Workspace
                  </button>
                </div>
              </div>
            ) : (
              /* ================== APPROVED TUTOR EXPERT WORKSPACE ================== */
              <div className="space-y-8">
                {/* Welcome Ribbon */}
                <div className="p-6 bg-gradient-to-r from-[#000E32] to-[#122248] dark:from-slate-900 dark:to-slate-850 border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400 text-[10px] font-black uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Approved Trainer</span>
                      <span className="text-slate-400 text-xs">Cloud ID: {currentTutorProfile.id}</span>
                    </div>
                    <h3 className="text-lg font-serif font-black uppercase">Welcome Back, Trainer {currentTutorProfile.full_name}</h3>
                    <p className="text-xs text-slate-300 font-light">Track performance benchmarks, build dynamic curriculums, and review submitted deliverables.</p>
                  </div>

                  <button
                    onClick={() => setShowCourseCreator(prev => !prev)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Plus size={14} />
                    <span>{showCourseCreator ? 'Close Planner' : 'Design New Course'}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showCourseCreator && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCreateCourse}
                      className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm overflow-hidden text-left"
                    >
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-xs uppercase font-black text-orange-500">Design Studio</span>
                        <h4 className="text-base font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">Create New Vocational Course</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400">Course Title</label>
                          <input
                            type="text"
                            value={newCourse.title}
                            onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. CAC Business Setup Mastery"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400">Cover Image URL</label>
                          <input
                            type="text"
                            value={newCourse.image}
                            onChange={(e) => setNewCourse(prev => ({ ...prev, image: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400">Course Level</label>
                          <select
                            value={newCourse.level}
                            onChange={(e: any) => setNewCourse(prev => ({ ...prev, level: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Advanced">Advanced</option>
                            <option value="All Levels">All Levels</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400">Course Category</label>
                          <select
                            value={newCourse.category}
                            onChange={(e: any) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                          >
                            <option value="marketing">Digital Marketing</option>
                            <option value="web">Web & Software</option>
                            <option value="ai">AI Integrations</option>
                            <option value="business">Business Development</option>
                            <option value="compliance">CAC Compliance</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400">Tuition Price (₦)</label>
                          <input
                            type="text"
                            value={newCourse.price}
                            onChange={(e) => setNewCourse(prev => ({ ...prev, price: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400">Duration Period</label>
                          <input
                            type="text"
                            value={newCourse.duration}
                            onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400">Detailed Description & Agenda</label>
                        <textarea
                          value={newCourse.description}
                          onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="What will students learn in this accredited program?"
                          className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                          required
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl tracking-wider"
                        >
                          Save & Publish Course
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-left space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Assigned Active Students</span>
                    <span className="text-2xl font-serif font-black text-[#000E32] dark:text-white">
                      {enrollments.length + 3} Students
                    </span>
                  </div>
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-left space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Submissions</span>
                    <span className="text-2xl font-serif font-black text-amber-500">
                      {submissions.filter(s => s.status === 'submitted').length} Coursework
                    </span>
                  </div>
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-left space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Completed Reviews</span>
                    <span className="text-2xl font-serif font-black text-emerald-500">
                      {submissions.filter(s => s.status === 'graded').length} Reviewed
                    </span>
                  </div>
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-left space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Accredited Diplomas Minted</span>
                    <span className="text-2xl font-serif font-black text-indigo-500 dark:text-indigo-400">
                      {certificates.length + 2} Diplomas
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Student Coursework Submission Review Board */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 rounded-3xl space-y-6 text-left shadow-sm">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h4 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight">
                        Active Submissions Review Pipeline
                      </h4>
                    </div>

                    {/* Active Grading Modal Form */}
                    {gradingSubmission && (
                      <form onSubmit={handleSaveGrade} className="p-5 bg-slate-50 dark:bg-slate-950 border border-orange-200 dark:border-orange-900/55 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-black text-orange-500">Active Review Panel</span>
                          <button onClick={() => setGradingSubmission(null)} className="text-slate-400 text-xs">Cancel</button>
                        </div>
                        <p className="text-xs text-slate-500 font-light">
                          Grading student <strong>"{gradingSubmission.user_id}"</strong> for lesson homework response.
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-400 block">Grade Mark</label>
                            <select
                              value={gradeValue}
                              onChange={(e) => setGradeValue(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                            >
                              <option value="A+">A+</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="Passed">Passed</option>
                            </select>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-400 block">Feedback Remarks</label>
                            <input
                              type="text"
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              placeholder="Great attention to detail in your compliance checklists..."
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase rounded-xl"
                        >
                          Submit Grade
                        </button>
                      </form>
                    )}

                    <div className="space-y-4">
                      {submissions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic font-light py-4 text-center">No coursework deliverables waiting in queue.</p>
                      ) : (
                        submissions.map((sub) => {
                          const courseObj = courses.find(c => c.id === sub.course_id);
                          const isGraded = sub.status === 'graded';

                          return (
                            <div key={sub.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black uppercase text-[#000E32] dark:text-orange-400">
                                    {courseObj?.title || 'Vocational Curriculum'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    isGraded ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                  }`}>
                                    {sub.status}
                                  </span>
                                </div>
                                
                                <p className="text-xs text-slate-500 font-mono block">Student ID: {sub.user_id}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                                  "{sub.submission_text}"
                                </p>
                              </div>

                              <div className="shrink-0 flex flex-col justify-between items-end gap-2">
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </span>
                                
                                {!isGraded ? (
                                  <button
                                    onClick={() => {
                                      setGradingSubmission(sub);
                                      setGradeValue('A');
                                    }}
                                    className="px-3 py-1.5 bg-[#000E32] dark:bg-orange-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm"
                                  >
                                    Review Deliverable
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                    <span>Grade:</span>
                                    <span>{sub.grade}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: High Impact Recharts Analytics Panels */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm text-left">
                      <span className="text-[10px] uppercase font-black text-slate-400 block">Classroom Deliverables Ratio</span>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getSubmissionsOverviewData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getSubmissionsOverviewData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-around text-[10px] font-extrabold uppercase tracking-wide">
                        <span className="text-orange-500">● Pending Reviews</span>
                        <span className="text-emerald-500">● Graded</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm text-left">
                      <span className="text-[10px] uppercase font-black text-slate-400 block">Enrollment Spread by Course</span>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getCourseEnrollmentSummary()}>
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="Students Enrolled" fill="#ea580c" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'admin' && (
          <motion.div 
            key="admin-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 text-left"
          >
            {/* Quick Summary row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-left space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Catalog Courses</span>
                <span className="text-2xl font-serif font-black text-[#000E32] dark:text-white">{courses.length}</span>
              </div>
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-left space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Trainer Registry</span>
                <span className="text-2xl font-serif font-black text-indigo-500 dark:text-indigo-400">
                  {tutors.length} Applied
                </span>
              </div>
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl text-left space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Active Enrolled Tracks</span>
                <span className="text-2xl font-serif font-black text-emerald-500">
                  {enrollments.length + 4} Active
                </span>
              </div>
            </div>

            {/* Tutor Registrations Approvals panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight border-b border-slate-150 dark:border-slate-850 pb-3">
                Trainer Admissions & Approvals Hub
              </h3>

              <div className="space-y-4">
                {tutors.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-light py-4 text-center">No trainer applications stored in Cloudflare D1.</p>
                ) : (
                  tutors.map((tut) => (
                    <div key={tut.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#000E32] dark:text-white">{tut.full_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            tut.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : tut.status === 'rejected' 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-amber-100 text-amber-600'
                          }`}>
                            {tut.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-orange-500 font-mono">Expertise: {tut.expertise} • Email: {tut.email}</p>
                        <p className="text-xs text-slate-500 font-light italic">
                          "{tut.bio}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {tut.status !== 'approved' && (
                          <button
                            onClick={() => handleToggleTutorStatus(tut.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {tut.status !== 'rejected' && (
                          <button
                            onClick={() => handleToggleTutorStatus(tut.id, 'rejected')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certificates Registry */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight border-b border-slate-150 dark:border-slate-850 pb-3">
                Acreeditation & Diploma Minting Registry
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-2.5">Accredited Student</th>
                      <th className="py-2.5">Certified Curriculum</th>
                      <th className="py-2.5">Minted Date</th>
                      <th className="py-2.5">Verification Hash</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    {certificates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400 italic font-light">No certificates issued yet. Complete an accreditation quiz to mint one instantly!</td>
                      </tr>
                    ) : (
                      certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                          <td className="py-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center text-[10px] font-black">
                              {cert.full_name[0]}
                            </div>
                            {cert.full_name}
                          </td>
                          <td className="py-3 max-w-xs truncate">{cert.course_title}</td>
                          <td className="py-3 font-mono text-slate-400">{new Date(cert.issued_at).toLocaleDateString()}</td>
                          <td className="py-3 font-mono uppercase text-slate-400 truncate max-w-[120px]">{cert.hash}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => printCertificate(cert)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1"
                            >
                              <Eye size={10} />
                              Print Cert
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
