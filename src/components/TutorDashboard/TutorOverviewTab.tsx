import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  BookOpen, 
  Users, 
  FileCheck, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Video, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TutorSession, StudentSubmission, TutorPayoutRequest } from '../../lib/academyStorage';
import { AcademyCourse } from '../../lib/academyCoursesData';
import { TutorTabType } from './TutorSidebar';

interface TutorOverviewTabProps {
  session: TutorSession;
  assignedCourses: AcademyCourse[];
  submissions: StudentSubmission[];
  payouts: TutorPayoutRequest[];
  onSelectTab: (tab: TutorTabType) => void;
  onLaunchTeachingWorkspace: (course: AcademyCourse) => void;
}

export const TutorOverviewTab: React.FC<TutorOverviewTabProps> = ({
  session,
  assignedCourses,
  submissions,
  payouts,
  onSelectTab,
  onLaunchTeachingWorkspace
}) => {
  const pendingSubmissions = submissions.filter(s => s.status === 'submitted' || !s.grade);
  const totalEarnedHonorarium = 650000;
  const totalPaidOut = payouts.filter(p => p.status === 'approved' || p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingHonorarium = Math.max(0, totalEarnedHonorarium - totalPaidOut);

  const primaryCourse = assignedCourses[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Tutor Faculty Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/40 p-6 sm:p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-mono font-bold border border-purple-400/30 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                FACULTY SENATE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold border border-blue-500/30 flex items-center gap-1">
                <ShieldCheck size={12} />
                ID: {session.tutorId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
              Good day, {session.fullName}!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
              Specialization: <strong className="text-white">{session.specialization || session.expertise || 'Full-Stack Software Engineering'}</strong>. Manage cohort rosters, grade student code repositories, and review teaching honoraria.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onLaunchTeachingWorkspace(primaryCourse)}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Video size={18} className="group-hover:scale-110 transition-transform" />
              <span>Launch Virtual Live Class</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('grading')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck size={14} className="text-amber-400" />
              <span>{pendingSubmissions.length} Submissions Needing Review</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Courses</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {assignedCourses.length} <span className="text-xs font-normal text-slate-400">Tracks</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {assignedCourses.map(c => c.code).join(', ')}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Students</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {session.totalStudents || 42} <span className="text-xs font-normal text-slate-400">Scholars</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Across 2026 Cohort Alpha
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Grading Queue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {pendingSubmissions.length} <span className="text-xs font-normal text-slate-400">Pending</span>
            </div>
            <p className="text-[11px] text-amber-500 mt-0.5 font-medium">
              Requires 70/30 practical review
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Accrued Honorarium</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              ₦{totalEarnedHonorarium.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              ₦{pendingHonorarium.toLocaleString()} Ready for Payout
            </p>
          </div>
        </div>
      </div>

      {/* 3. Next Live Lecture Hero Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Next Live Lecture Schedule & Interactive Terminal
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('workspace')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Open Teaching Workspace</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
              LIVE
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {primaryCourse.code}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Today at 4:00 PM (WAT) • Hybrid Delivery
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {primaryCourse.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Topic: <strong>Advanced Enterprise Full-Stack Patterns & Microservices</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onLaunchTeachingWorkspace(primaryCourse)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video size={16} />
              <span>Start Classroom Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Submissions Needing Grading & Activity Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grading Queue Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck size={16} className="text-purple-500" />
                <span>Student Submissions Needing Review</span>
              </h3>
              <button
                type="button"
                onClick={() => onSelectTab('grading')}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                View All ({submissions.length})
              </button>
            </div>

            <div className="space-y-3">
              {pendingSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {sub.studentName}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sub.studentId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                      {sub.assignmentTitle}
                    </p>
                    <p className="text-[9px] font-mono text-purple-600 dark:text-purple-400 mt-1">
                      Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTab('grading')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-sm shrink-0"
                  >
                    Grade
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onSelectTab('grading')}
              className="w-full text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Go to Full Grading Desk</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Honorarium & Class Performance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500" />
                <span>Honorarium & Payout Summary</span>
              </h3>
              <button
                type="button"
                onClick={() => onSelectTab('payouts')}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                Ledger
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Total Accrued Honorarium:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">₦{totalEarnedHonorarium.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Paid Out to Bank:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₦{totalPaidOut.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-900 dark:text-emerald-200">Available for Payout:</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-display">₦{pendingHonorarium.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Average Student Pass Rate:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">92.4%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Average Class Attendance:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">91.8%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onSelectTab('payouts')}
              className="w-full text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Request Honorarium Payout</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
