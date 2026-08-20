import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Code, 
  FileText, 
  Download, 
  ExternalLink, 
  Award, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  Terminal, 
  GraduationCap, 
  Video,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { AcademyCourse } from '../../lib/academyCoursesData';
import { 
  CourseProgressRecord, 
  StudentSession, 
  StudentSubmission, 
  apiToggleTopicCompletion,
  apiSaveSubmission,
  apiRecordVerifiedPayment 
} from '../../lib/academyStorage';

interface StudentLearningTabProps {
  session: StudentSession;
  activeCourse: AcademyCourse;
  enrolledCourses: AcademyCourse[];
  onSelectCourse: (course: AcademyCourse) => void;
  progressRecord: CourseProgressRecord;
  onProgressUpdated: (record: CourseProgressRecord) => void;
  submissions: StudentSubmission[];
  onSubmissionAdded: (sub: StudentSubmission) => void;
}

export const StudentLearningTab: React.FC<StudentLearningTabProps> = ({
  session,
  activeCourse,
  enrolledCourses,
  onSelectCourse,
  progressRecord,
  onProgressUpdated,
  submissions,
  onSubmissionAdded
}) => {
  // State for active module & topic
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(0);

  // Sub-tabs in workspace: 'lesson' | 'quiz' | 'assignment' | 'resources'
  const [workspaceTab, setWorkspaceTab] = useState<'lesson' | 'quiz' | 'assignment' | 'resources'>('lesson');

  // Assignment submission form state
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Interactive Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Code Copy feedback
  const [copiedCode, setCopiedCode] = useState(false);

  const currentModule = activeCourse.modules[selectedModuleIndex] || activeCourse.modules[0];
  const currentTopic = currentModule?.topics[selectedTopicIndex] || currentModule?.topics[0] || 'Core Architecture';
  const totalTopics = activeCourse.modules.reduce((acc, m) => acc + m.topics.length, 0);

  const currentTopicKey = `${activeCourse.code}_M${selectedModuleIndex + 1}_T${selectedTopicIndex + 1}`;
  const isCurrentTopicCompleted = progressRecord.completedTopics.includes(currentTopicKey);

  // Sample Quiz Questions for Module
  const sampleQuizQuestions = [
    {
      id: 1,
      question: `In modern ${activeCourse.title} architecture, what is the primary purpose of state centralization and immutability?`,
      options: [
        'To ensure predictable state transitions, seamless time-travel debugging, and prevent race conditions.',
        'To reduce RAM usage by converting objects to raw text strings.',
        'To bypass browser CORS policies in client-side applications.',
        'To automatically compile TypeScript code to WebAssembly binaries.'
      ],
      correctIndex: 0,
      explanation: 'State immutability prevents unintended side effects and guarantees reliable synchronization across UI components.'
    },
    {
      id: 2,
      question: 'According to the DS Tech 70/30 Practical Training framework, what percentage of cohort hours is allocated to hands-on project implementations?',
      options: [
        '30% practical / 70% theory',
        '50% practical / 50% theory',
        '70% hands-on practical project labs and 30% foundational theory',
        '100% video lectures without code reviews'
      ],
      correctIndex: 2,
      explanation: 'The 70/30 framework prioritizes production code, live debugging, and tangible asset delivery.'
    },
    {
      id: 3,
      question: 'What is the mandatory attendance threshold required for graduation and diploma conferment?',
      options: [
        '50% attendance',
        '65% attendance',
        '80% minimum attendance across physical and virtual lectures',
        'Attendance is completely optional'
      ],
      correctIndex: 2,
      explanation: 'A minimum cumulative 80% attendance rate is strictly enforced across all 115+ academy programs.'
    }
  ];

  // Handle Mark Topic Completion
  const handleToggleTopic = async () => {
    const updated = await apiToggleTopicCompletion(
      session.email,
      activeCourse.code,
      currentTopicKey,
      totalTopics
    );
    onProgressUpdated(updated);
  };

  // Handle Assignment Submission
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentNotes.trim() && !githubUrl.trim()) return;

    setIsSubmitting(true);
    const newSubmission: StudentSubmission = {
      id: `sub_${Date.now()}`,
      studentEmail: session.email,
      studentName: session.fullName,
      studentId: session.studentId,
      courseCode: activeCourse.code,
      courseTitle: activeCourse.title,
      moduleTitle: `${currentModule.weekOrModule}: ${currentModule.title}`,
      assignmentTitle: `${currentTopic} - Practical Lab Submission`,
      submissionText: assignmentNotes,
      gitHubUrl: githubUrl || undefined,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    await apiSaveSubmission(newSubmission);
    onSubmissionAdded(newSubmission);
    setIsSubmitting(false);
    setSubmissionSuccess(true);
    setAssignmentNotes('');
    setGithubUrl('');
    setTimeout(() => setSubmissionSuccess(false), 4000);
  };

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    let correctCount = 0;
    sampleQuizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });
    const percentage = Math.round((correctCount / sampleQuizQuestions.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);
  };

  // Sample Practical Code Snippet for Topic
  const sampleCodeSnippet = `// ${activeCourse.title} - Practical Code Lab
// Topic: ${currentTopic}
// Framework: DS Tech Academy 70/30 Practical Training Engine

export interface LabResult<T> {
  success: boolean;
  data?: T;
  timestamp: string;
  status: 'nominal' | 'degraded';
}

export async function executeModuleWorkflow(): Promise<LabResult<any>> {
  console.log("Initializing ${activeCourse.code} runtime sandbox...");
  
  // Real-time state execution
  const payload = {
    course: "${activeCourse.title}",
    studentId: "${session.studentId}",
    topic: "${currentTopic}",
    verified: true
  };

  return {
    success: true,
    data: payload,
    timestamp: new Date().toISOString(),
    status: 'nominal'
  };
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter existing submissions for this topic
  const matchingSubmissions = submissions.filter(
    s => s.courseCode === activeCourse.code && s.studentEmail.toLowerCase() === session.email.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* 1. Top Bar: Course Selector & Quick Metadata */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-base shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {activeCourse.code}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {activeCourse.duration} • {session.mode} Mode
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {activeCourse.title}
            </h2>
          </div>
        </div>

        {/* Switch Course Dropdown */}
        {enrolledCourses.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Switch Course:</span>
            <select
              value={activeCourse.code}
              onChange={(e) => {
                const found = enrolledCourses.find(c => c.code === e.target.value);
                if (found) {
                  onSelectCourse(found);
                  setSelectedModuleIndex(0);
                  setSelectedTopicIndex(0);
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {enrolledCourses.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Main Workspace: Two-Column Layout (Module Tree vs Active Lesson/Lab) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Modules & Topics Navigation (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers size={15} className="text-blue-500" />
              <span>Syllabus Modules</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
              {progressRecord.progressPercentage}% Done
            </span>
          </div>

          <div className="p-3 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
            {activeCourse.modules.map((module, mIdx) => {
              const isModuleActive = selectedModuleIndex === mIdx;

              return (
                <div
                  key={module.weekOrModule || mIdx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModuleIndex(mIdx);
                      setSelectedTopicIndex(0);
                    }}
                    className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isModuleActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 block">
                        {module.weekOrModule}
                      </span>
                      <p className="text-xs font-bold truncate mt-0.5">
                        {module.title}
                      </p>
                    </div>
                    {isModuleActive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {/* Expand Topics */}
                  {isModuleActive && (
                    <div className="p-2 bg-slate-50/50 dark:bg-slate-950/40 divide-y divide-slate-100 dark:divide-slate-800/60">
                      {module.topics.map((topic, tIdx) => {
                        const topicKey = `${activeCourse.code}_M${mIdx + 1}_T${tIdx + 1}`;
                        const isCompleted = progressRecord.completedTopics.includes(topicKey);
                        const isTopicSelected = selectedTopicIndex === tIdx;

                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setSelectedTopicIndex(tIdx)}
                            className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all text-xs cursor-pointer ${
                              isTopicSelected
                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2
                                size={15}
                                className={isTopicSelected ? 'text-white shrink-0' : 'text-emerald-500 shrink-0'}
                              />
                            ) : (
                              <Circle
                                size={14}
                                className={isTopicSelected ? 'text-white/60 shrink-0' : 'text-slate-400 shrink-0'}
                              />
                            )}
                            <span className="truncate">{topic}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Stage: Active Lesson & Interactive Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Topic Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                {currentModule.weekOrModule} • Topic {selectedTopicIndex + 1}
              </span>

              {/* Mark Completed Toggle */}
              <button
                type="button"
                onClick={handleToggleTopic}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  isCurrentTopicCompleted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                {isCurrentTopicCompleted ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle size={15} />
                    <span>Mark as Completed</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {currentTopic}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Practical Module: {currentModule.title}
            </p>

            {/* Workspace Subtabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mt-5 gap-4 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setWorkspaceTab('lesson')}
                className={`pb-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  workspaceTab === 'lesson'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={14} />
                <span>Lecture & Code Lab</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('quiz')}
                className={`pb-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  workspaceTab === 'quiz'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award size={14} />
                <span>Knowledge Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('assignment')}
                className={`pb-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  workspaceTab === 'assignment'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send size={14} />
                <span>Submit Assignment</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceTab('resources')}
                className={`pb-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  workspaceTab === 'resources'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download size={14} />
                <span>Materials & Syllabi</span>
              </button>
            </div>
          </div>

          {/* Subtab Content Area */}
          <AnimatePresence mode="wait">
            {workspaceTab === 'lesson' && (
              <motion.div
                key="lesson"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 70/30 Practical Objectives Box */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Practical Learning Objectives (70% Practical / 30% Theory)
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    In this session, students dive directly into live implementation patterns for <strong className="text-slate-900 dark:text-white">{currentTopic}</strong>. Every code snippet must be verified with type boundaries, error handling, and unit test validations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 text-xs">
                      <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-blue-500" />
                        Target Milestone
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">
                        Build and test modular TypeScript components following DS Tech industry standards.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 text-xs">
                      <p className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <Terminal size={14} className="text-indigo-500" />
                        Interactive Sandbox
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">
                        Run simulated tests directly in the terminal preview box below.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Practical Code Sandbox & Terminal */}
                <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl text-slate-200 font-mono text-xs">
                  <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-[11px] text-slate-400 ml-2 font-sans font-semibold">
                        sandbox/{activeCourse.code.toLowerCase()}_lab.ts
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-[11px]"
                    >
                      {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="p-5 overflow-x-auto">
                    <pre className="text-slate-300 leading-relaxed">{sampleCodeSnippet}</pre>
                  </div>
                </div>
              </motion.div>
            )}

            {workspaceTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Module Knowledge Assessment (30% Theory Standard)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Answer all 3 validation questions to test theoretical comprehension of this module.
                  </p>
                </div>

                {/* Score Alert */}
                {quizSubmitted && quizScore !== null && (
                  <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                    quizScore >= 70
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Award size={18} />
                      <span className="font-bold">
                        Quiz Completed! Your Score: {quizScore}% ({quizScore >= 70 ? 'Passed' : 'Needs Review'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); setQuizScore(null); }}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      Retake Quiz
                    </button>
                  </div>
                )}

                {/* Question List */}
                <div className="space-y-6">
                  {sampleQuizQuestions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={quizSubmitted}
                              onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                              className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white font-semibold'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-500'
                              } ${quizSubmitted && isCorrect ? 'border-2 border-emerald-500 font-bold' : ''}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                          💡 Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted && (
                  <button
                    type="button"
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < sampleQuizQuestions.length}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    Submit Answers & Record Score
                  </button>
                )}
              </motion.div>
            )}

            {workspaceTab === 'assignment' && (
              <motion.div
                key="assignment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Submission Form */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Practical Milestone Submission Portal
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Upload your GitHub repository URL or paste your project execution notes for lead tutor grading.
                    </p>
                  </div>

                  {submissionSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span className="font-bold">
                        Assignment successfully submitted! Assigned lead tutor will grade your deliverables.
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        GitHub / Git Repository URL
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/yourname/dsta-capstone"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Project Execution Notes & Documentation
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        placeholder="Detail the technical decisions made, libraries used, and instructions to run your project..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send size={15} />
                      <span>{isSubmitting ? 'Uploading Submission...' : 'Submit to Faculty for Grading'}</span>
                    </button>
                  </form>
                </div>

                {/* Prior Submissions List */}
                {matchingSubmissions.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Your Prior Submissions ({matchingSubmissions.length})
                    </h4>

                    <div className="space-y-3">
                      {matchingSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {sub.assignmentTitle}
                            </span>
                            {sub.grade ? (
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                Grade: {sub.grade} ({sub.score}%)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                                Under Evaluation
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {sub.submissionText}
                          </p>

                          {sub.feedback && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 text-xs text-blue-900 dark:text-blue-200 mt-2">
                              <strong>Tutor Feedback:</strong> {sub.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {workspaceTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Program Syllabi & Downloadable Resources
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Official PDFs, lecture slides, and starter code repositories approved by DS Tech Academy.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Complete Program Curriculum Guide (PDF)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {activeCourse.title} • Comprehensive 12-Week Syllabus
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading official syllabus for ${activeCourse.code}`)}
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <Download size={16} />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <FileCode size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Starter Starter Code Repository (GitHub)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Preconfigured TypeScript template with automated test harnesses
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
