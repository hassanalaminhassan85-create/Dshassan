import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Play, Award, Download, CheckCircle, GraduationCap, 
  ArrowRight, Users, Eye, HelpCircle, Trophy, UserCheck, ShieldAlert 
} from 'lucide-react';
import { COURSES, Course, Lesson } from '../lib/data';
import { apiGetCourses, apiInitializeCourses } from '../lib/api';

export const TrainingAcademySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [enrolledCourse, setEnrolledCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [studentName, setStudentName] = useState('David Alao');
  
  // Interactive Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Admin course manage state
  const [adminCourses, setAdminCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('admin_courses');
      return saved ? JSON.parse(saved) : COURSES;
    } catch (e) {
      console.error('Failed to parse admin_courses from localStorage:', e);
      return COURSES;
    }
  });

  React.useEffect(() => {
    const fetchD1Courses = async () => {
      try {
        const data = await apiGetCourses();
        if (data && data.length > 0) {
          setAdminCourses(data);
          localStorage.setItem('admin_courses', JSON.stringify(data));
        } else {
          // Empty D1 - seed with static COURSES
          await apiInitializeCourses(COURSES);
          setAdminCourses(COURSES);
          localStorage.setItem('admin_courses', JSON.stringify(COURSES));
        }
      } catch (err) {
        console.warn('D1 courses database unreachable. Falling back to LocalStorage.', err);
      }
    };

    fetchD1Courses();

    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('admin_courses');
        if (saved) {
          setAdminCourses(JSON.parse(saved));
        } else {
          setAdminCourses(COURSES);
        }
      } catch (e) {
        console.error('Failed to parse admin_courses in storage event:', e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sync to local state storage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('admin_courses', JSON.stringify(adminCourses));
  }, [adminCourses]);
  const [certifiedStudents, setCertifiedStudents] = useState([
    { id: "cert_1", name: "David Alao", course: "React & TypeScript Frontend Web Engineering", date: "June 24, 2026", status: "issued" },
    { id: "cert_2", name: "Grace Ibrahim", course: "Digital Marketing & Social Ads Mastery", date: "June 22, 2026", status: "issued" }
  ]);

  const quizQuestions = [
    {
      q: "Which ad targeting strategy delivers higher conversion ratios for regional real estate in Nigeria?",
      options: ["Broad nationwide targeting", "Specific high-income regional hubs (Maitama, Ikoyi) with WhatsApp CTAs", "Only banner-placement ads"],
      correct: 1
    },
    {
      q: "In React 19, which hook is preferred for stabilizing static values or functions outside dependency arrays?",
      options: ["useMemo / useCallback", "useState", "useContext"],
      correct: 0
    },
    {
      q: "Which local regulatory body coordinates standard anti-money laundering registration compliance?",
      options: ["CAC", "FIRS", "SCUML"],
      correct: 2
    }
  ];

  const handleEnroll = (course: Course) => {
    setEnrolledCourse(course);
    setActiveLesson(course.lessons[0]);
    // reset quiz
    setQuizStarted(false);
    setQuizFinished(false);
    setQuizPassed(false);
    setSelectedAnswers([]);
    setCurrentQuestion(0);
  };

  const handleAnswerSelect = (optIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentQuestion] = optIndex;
    setSelectedAnswers(updated);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // score quiz
      const correctAnswers = selectedAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length;
      const passed = correctAnswers === quizQuestions.length; // must get 3/3
      setQuizPassed(passed);
      setQuizFinished(true);

      if (passed) {
        // Auto issue certificate
        const newCert = {
          id: "cert_" + Math.random().toString(36).substring(2, 6),
          name: studentName || 'David Alao',
          course: enrolledCourse?.title || 'Advanced Technology Seminar',
          date: new Date().toISOString().split('T')[0],
          status: "issued"
        };
        setCertifiedStudents(prev => [newCert, ...prev]);
      }
    }
  };

  const printCertificate = (cert: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>DS Tech Training Academy Certificate</title>
          <style>
            body { font-family: 'Georgia', serif; text-align: center; padding: 100px; border: 20px double #000E32; background: #faf9f6; }
            h1 { font-size: 40px; color: #000E32; text-transform: uppercase; margin-bottom: 0; }
            .subtitle { font-style: italic; font-size: 18px; color: #666; margin-top: 5px; }
            .name { font-size: 32px; font-weight: bold; color: #ea580c; border-bottom: 2px solid #ccc; display: inline-block; padding: 10px 40px; margin: 30px 0; }
            .details { font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 50px; }
            .stamp { border: 2px solid #ea580c; color: #ea580c; font-size: 14px; font-weight: bold; display: inline-block; padding: 10px; text-transform: uppercase; transform: rotate(-5deg); }
          </style>
        </head>
        <body>
          <h1>Certificate of Achievement</h1>
          <div class="subtitle">DS Tech & Digital Marketing Academy</div>
          <p>This is to officially certify that</p>
          <div class="name">${cert.name}</div>
          <p>has successfully completed the curriculum and interactive assessment for</p>
          <div class="details"><strong>${cert.course}</strong><br/>Issued on ${cert.date} • Verification ID: ${cert.id.toUpperCase()}</div>
          <div class="stamp">DS TECH VERIFIED STAMP</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-12 animate-fade-in text-left text-slate-800 dark:text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <span className="text-orange-500 text-xs uppercase tracking-widest font-black">ACADEMY & LMS</span>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
            Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Academy</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl font-light">
            Enroll in certified digital vocational courses. Learn Facebook/Google ad pixel tracking, React component animation, and CAC registration business compliance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex shadow-sm">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === 'student'
                ? 'bg-[#000E32] dark:bg-orange-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Student Panel
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-[#000E32] dark:bg-orange-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <ShieldAlert size={12} />
            Admin Panel
          </button>
        </div>
      </div>

      {activeTab === 'student' ? (
        /* ==================== STUDENT DASHBOARD ==================== */
        enrolledCourse ? (
          /* ACTIVE CLASSROOM MODE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Lessons List */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-5 rounded-3xl space-y-4 text-left">
              <div>
                <button 
                  onClick={() => setEnrolledCourse(null)}
                  className="text-[10px] uppercase font-black tracking-wider text-slate-400 hover:text-orange-500 flex items-center gap-1 mb-2"
                >
                  ← Exit Classroom
                </button>
                <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif line-clamp-2 leading-tight">
                  {enrolledCourse.title}
                </h3>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Lesson Roadmap</span>
                {enrolledCourse.lessons.map((les, i) => (
                  <button
                    key={les.id}
                    onClick={() => {
                      setActiveLesson(les);
                      setQuizStarted(false);
                      setQuizFinished(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                      activeLesson?.id === les.id
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'bg-white dark:bg-slate-950 border-slate-200/50 dark:border-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-slate-400">0{i+1}</span>
                    <div className="space-y-0.5">
                      <span className="block line-clamp-1">{les.title}</span>
                      <span className="text-[10px] text-slate-400 font-light block">{les.duration}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setQuizStarted(true);
                    setQuizFinished(false);
                    setCurrentQuestion(0);
                    setSelectedAnswers([]);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Trophy size={13} />
                  <span>Take Assessment Quiz</span>
                </button>
              </div>
            </div>

            {/* Main Lesson Viewport */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
              {quizStarted ? (
                /* QUIZ PORT */
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs uppercase font-black text-orange-500 flex items-center gap-1">
                      <Trophy size={14} />
                      Course Assessment
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Question {currentQuestion + 1} of {quizQuestions.length}
                    </span>
                  </div>

                  {quizFinished ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6 space-y-4"
                    >
                      {quizPassed ? (
                        <>
                          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 mx-auto">
                            <CheckCircle size={36} />
                          </div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base uppercase font-serif">Assessment Passed! (100%)</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                            Congratulations! You answered all questions correctly. Your verified digital certificate of completion has been issued instantly.
                          </p>
                          <div className="pt-4 flex justify-center gap-3">
                            <button
                              onClick={() => {
                                const cert = certifiedStudents.find(c => c.name === studentName);
                                if (cert) printCertificate(cert);
                                else printCertificate({ name: studentName, course: enrolledCourse.title, date: "2026-06-25", id: "demo_c" });
                              }}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase rounded-xl tracking-wider flex items-center gap-1.5"
                            >
                              <Award size={13} />
                              Print Official Certificate
                            </button>
                            <button
                              onClick={() => setQuizStarted(false)}
                              className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase rounded-xl"
                            >
                              Back to Lesson
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-500 mx-auto">
                            <HelpCircle size={36} />
                          </div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base uppercase font-serif">Assessment Incomplete</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                            You must answer all 3 industry-standard compliance and code questions correctly to qualify for legal certification.
                          </p>
                          <div className="pt-4">
                            <button
                              onClick={() => {
                                setCurrentQuestion(0);
                                setSelectedAnswers([]);
                                setQuizFinished(false);
                                setQuizPassed(false);
                              }}
                              className="px-5 py-2.5 bg-[#000E32] dark:bg-orange-600 text-white text-xs font-extrabold uppercase rounded-xl tracking-wider"
                            >
                              Retry Assessment
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-extrabold text-[#000E32] dark:text-white text-sm uppercase font-serif leading-snug">
                        {quizQuestions[currentQuestion].q}
                      </p>
                      <div className="space-y-2.5">
                        {quizQuestions[currentQuestion].options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleAnswerSelect(oIdx)}
                            className={`w-full p-4 rounded-2xl border text-xs text-left transition-all font-semibold ${
                              selectedAnswers[currentQuestion] === oIdx
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-950 border-slate-200/50 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-between">
                        <input 
                          type="text" 
                          placeholder="Your Certificate Full Name" 
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-48 text-slate-800 dark:text-slate-100"
                        />
                        <button
                          onClick={handleNextQuestion}
                          disabled={selectedAnswers[currentQuestion] === undefined}
                          className="px-5 py-2 bg-[#000E32] dark:bg-orange-600 text-white text-xs font-extrabold uppercase rounded-xl disabled:opacity-40"
                        >
                          {currentQuestion === quizQuestions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeLesson ? (
                /* MAIN LESSON VIDEO & NOTES PORT */
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs uppercase font-black text-indigo-500 tracking-wider">Active Lecture Module</span>
                    <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold">LECTURE RUNNING</span>
                  </div>

                  <div className="space-y-3 text-left">
                    <h2 className="font-extrabold text-[#000E32] dark:text-white text-base md:text-lg uppercase font-serif tracking-tight">{activeLesson.title}</h2>
                    <div className="h-44 bg-[#000E32]/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/5 relative overflow-hidden">
                      {/* Background grid */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#021a52_1px,transparent_1px),linear-gradient(to_bottom,#021a52_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 mb-2 relative z-10 animate-pulse">
                        <Play className="fill-current text-orange-500" size={18} />
                      </div>
                      <span className="text-white text-xs font-bold font-serif uppercase relative z-10">Lecture Audio Streaming Node</span>
                      <span className="text-slate-400 text-[10px] relative z-10 font-mono">DSTECH_ACADEMY_STREAM_{activeLesson.id.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-left">
                    <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Lesson Materials & Synopsis</span>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-light bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                      {activeLesson.content || "Learn the technical framework, target segmentation metrics, and algorithmic bidding routines. Download the hand-out worksheets below to track optimization sprint blocks."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => alert("Lecture Handout Worksheets have been downloaded successfully (mock-PDF).")}
                      className="px-4 py-2 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-extrabold uppercase rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={13} />
                      Download Worksheets
                    </button>
                    
                    <button
                      onClick={() => {
                        setQuizStarted(true);
                        setQuizFinished(false);
                        setCurrentQuestion(0);
                        setSelectedAnswers([]);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-[11px] font-extrabold uppercase rounded-xl tracking-wider flex items-center gap-1.5"
                    >
                      <Trophy size={13} />
                      Unlock Certificate
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* COURSE CATALOG DIRECTORY */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {adminCourses.map((course, idx) => (
              <motion.div 
                key={course.id} 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, type: "spring", stiffness: 280, damping: 20 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.025,
                  borderColor: 'rgba(249, 115, 22, 0.45)',
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row text-left group cursor-pointer relative"
              >
                {/* Floating AI Match Tag */}
                <div className="absolute top-3 left-3 bg-[#000E32]/95 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1 z-10 backdrop-blur-sm shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>AI Adaptive Path: 98.7% Fit Score</span>
                </div>

                <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden relative shrink-0">
                  <img src={course.image} alt={course.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                      <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 rounded uppercase">
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

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono font-black text-slate-800 dark:text-orange-400">{course.price}</span>
                    <button
                      onClick={() => handleEnroll(course)}
                      className="px-4 py-1.5 bg-[#000E32] dark:bg-orange-600 hover:bg-[#031d60] dark:hover:bg-orange-500 text-white text-[11px] font-bold uppercase rounded-xl tracking-wider flex items-center gap-1 transition-all"
                    >
                      <span>Enroll Now</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* ==================== ADMIN PANEL ==================== */
        <div className="space-y-8 text-left animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Catalog Courses</span>
              <span className="text-2xl font-serif font-black text-[#000E32] dark:text-white">{adminCourses.length}</span>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Active Enrollments</span>
              <span className="text-2xl font-serif font-black text-indigo-600 dark:text-indigo-400">18 Students</span>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Certificates Issued</span>
              <span className="text-2xl font-serif font-black text-emerald-500">{certifiedStudents.length}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 rounded-3xl space-y-6">
            <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
              Certificates Issuance Registry
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-2.5">Student Name</th>
                    <th className="py-2.5">Course Name</th>
                    <th className="py-2.5">Date Completed</th>
                    <th className="py-2.5">Registry ID</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {certifiedStudents.map((cert) => (
                    <tr key={cert.id} className="hover:bg-white dark:hover:bg-slate-900/30">
                      <td className="py-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {cert.name[0]}
                        </div>
                        {cert.name}
                      </td>
                      <td className="py-3 max-w-xs truncate">{cert.course}</td>
                      <td className="py-3 font-mono text-slate-400">{cert.date}</td>
                      <td className="py-3 font-mono uppercase text-slate-400">{cert.id}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => printCertificate(cert)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg text-[10px] font-black uppercase text-indigo-500 tracking-wider inline-flex items-center gap-1"
                        >
                          <Eye size={10} />
                          View Cert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
