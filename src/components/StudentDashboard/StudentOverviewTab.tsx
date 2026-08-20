import React from 'react';
import { motion } from 'motion/react';
import { 
  PlayCircle, 
  BookOpen, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Receipt, 
  Users, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { StudentSession, CourseProgressRecord, AcademyPaymentRecord, StudentSubmission } from '../../lib/academyStorage';
import { AcademyCourse } from '../../lib/academyCoursesData';
import { StudentTabType } from './StudentSidebar';

interface StudentOverviewTabProps {
  session: StudentSession;
  primaryCourse: AcademyCourse;
  enrolledCourses: AcademyCourse[];
  progressRecord: CourseProgressRecord;
  paymentRecords: AcademyPaymentRecord[];
  submissions: StudentSubmission[];
  onSelectTab: (tab: StudentTabType) => void;
  onLaunchCourse: (course: AcademyCourse) => void;
}

export const StudentOverviewTab: React.FC<StudentOverviewTabProps> = ({
  session,
  primaryCourse,
  enrolledCourses,
  progressRecord,
  paymentRecords,
  submissions,
  onSelectTab,
  onLaunchCourse
}) => {
  // Financial calculations
  const totalEnrolledFee = enrolledCourses.reduce((sum, c) => sum + (c.price || 75000), 0);
  const totalPaid = paymentRecords.reduce((sum, p) => sum + (p.status === 'verified' || p.status === 'paid' ? p.amount : 0), 0);
  const balanceDue = Math.max(0, totalEnrolledFee - totalPaid);
  const isTuitionFullyPaid = balanceDue === 0 && totalPaid > 0;

  // Next topic / module to study
  const currentModule = primaryCourse.modules[progressRecord.currentModuleIndex] || primaryCourse.modules[0];
  const nextTopic = currentModule?.topics[progressRecord.currentTopicIndex] || currentModule?.topics[0] || 'Modern Architecture & Coding Lab';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Welcome / Personalized Student Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border border-blue-800/40 p-6 sm:p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold border border-blue-400/30 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                {session.cohort}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={12} />
                ID: {session.studentId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
              Welcome back, {session.fullName}!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
              Track your syllabus progression, attend live virtual coding streams, submit practical assignments, and manage tuition settlements.
            </p>
          </div>

          {/* Primary Quick CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onLaunchCourse(primaryCourse)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <PlayCircle size={18} className="group-hover:scale-110 transition-transform" />
              <span>Resume Active Lecture</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('payments')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard size={14} className="text-amber-400" />
              <span>{isTuitionFullyPaid ? 'View Payment Receipts' : `Pay Balance: ₦${balanceDue.toLocaleString()}`}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Key Metric Stat Cards (4-Column Bento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Enrolled Courses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Programs</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {enrolledCourses.length} <span className="text-xs font-normal text-slate-400">Course{enrolledCourses.length > 1 ? 's' : ''}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Primary: {primaryCourse.code}
            </p>
          </div>
        </div>

        {/* Metric 2: Learning Progress */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Syllabus Completed</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {progressRecord.progressPercentage}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressRecord.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Tuition Settlement */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tuition Clearance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              ₦{totalPaid.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isTuitionFullyPaid ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 100% Cleared
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  ₦{balanceDue.toLocaleString()} Due (Examination Clearance)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 4: Attendance & Standing */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance Standing</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {session.attendanceRate}%
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Above 80% threshold (Eligible for Grad)
            </p>
          </div>
        </div>
      </div>

      {/* 3. Primary Action Card: "Continue Learning" Hero Feature */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Current Active Course & Next Lecture
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('courses')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All Enrolled Courses</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
              {primaryCourse.code.split('-')[1]?.substring(0, 3) || 'ENG'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {primaryCourse.code}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {primaryCourse.duration} • {session.mode} Mode
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {primaryCourse.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Next Topic:</span>
                <span className="truncate max-w-md">{nextTopic}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onLaunchCourse(primaryCourse)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlayCircle size={16} />
              <span>Enter Learning Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Layout: Schedule/Deadlines & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Learning Activities & Deadlines */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <span>Upcoming Activities & Deadlines</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                WAT Timezone
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <Clock size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Live Code Review: React Hooks & Reducers
                    </p>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      Tomorrow, 4:00 PM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Interactive live terminal demonstration with Lead Tutor David Alao.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Module 2 Milestone Capstone Due
                    </p>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      In 3 Days
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Submit your verified GitHub repository and live preview link for evaluation.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                  <Award size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Mid-Semester Knowledge Quiz (30% Theory)
                    </p>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      Friday, 2:00 PM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    25 Multiple-choice architecture and security validation questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onLaunchCourse(primaryCourse)}
              className="w-full text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Go to Learning Tasks in Workspace</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Recent Submissions & Payment Receipts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Recent Academic & Financial Records</span>
              </h3>
              <button
                type="button"
                onClick={() => onSelectTab('payment-history')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Invoices
              </button>
            </div>

            <div className="space-y-3">
              {paymentRecords.slice(0, 2).map((payment) => (
                <div
                  key={payment.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Receipt size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        ₦{payment.amount.toLocaleString()} Tuition Settled
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Ref: {payment.reference} • {payment.courseTitle}
                    </p>
                  </div>
                </div>
              ))}

              {submissions.slice(0, 2).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {sub.assignmentTitle}
                      </p>
                      {sub.grade ? (
                        <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                          Grade: {sub.grade} ({sub.score}%)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          Under Review
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {sub.courseCode} • {sub.moduleTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onSelectTab('payments')}
              className="w-full text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Detailed Billing Ledger</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onSelectTab('enrollments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer shadow-sm group"
        >
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <BookOpen size={16} />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Explore 115+ Catalog</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Add second program</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('payments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer shadow-sm group"
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <CreditCard size={16} />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Tuition & Invoices</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Pay via Paystack</p>
        </button>

        <button
          type="button"
          onClick={() => onLaunchCourse(primaryCourse)}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer shadow-sm group"
        >
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <PlayCircle size={16} />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Submit Assignment</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Upload capstone code</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('support')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer shadow-sm group"
        >
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <HelpCircle size={16} />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Academic Handbook</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Guidelines & policies</p>
        </button>
      </div>
    </div>
  );
};
