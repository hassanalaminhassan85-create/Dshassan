import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, Copy, ArrowRight, Download, Home, BookOpen, Clock, ShieldCheck, Mail, Printer } from 'lucide-react';
import { StudentRegistrationApplication } from '../../types/studentRegistration';

interface Step10ConfirmationProps {
  application: StudentRegistrationApplication;
  onTrack: () => void;
  onReturnHome: () => void;
  onViewCourses: () => void;
}

export const Step10Confirmation: React.FC<Step10ConfirmationProps> = ({
  application,
  onTrack,
  onReturnHome,
  onViewCourses
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const allCourses = [
    application.primaryCourse,
    ...(application.additionalCourses || [])
  ].filter(Boolean);

  return (
    <div className="space-y-8 text-center max-w-2xl mx-auto">
      {/* Top Animated Success Check */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-500/30 flex items-center justify-center"
      >
        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </motion.div>
      </motion.div>

      {/* Main Title */}
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider inline-block mb-2">
          Application Received & Registered
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Congratulations, {application.fullName.split(' ')[0] || 'Student'}!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          Your official application to <strong className="text-white">DS Tech Academy</strong> has been registered in the registry ledger.
        </p>
      </div>

      {/* Application ID Badge Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
          Official Student Application Tracking ID
        </span>
        
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono tracking-wider">
            {application.id}
          </span>
          <button
            type="button"
            onClick={handleCopyId}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Copy Application ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        {copied && (
          <span className="text-xs text-emerald-400 font-bold block">
            Copied to clipboard!
          </span>
        )}

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span>A formal receipt and tracker link have been dispatched to <strong className="text-slate-200">{application.emailAddress}</strong>.</span>
        </div>
      </div>

      {/* Enrolled Courses Summary */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 text-left space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
          Registered Programmes ({allCourses.length})
        </span>
        <div className="space-y-2">
          {allCourses.map((c, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-orange-400">{c.courseCode}</span>
                <span className="font-bold text-white">{c.courseTitle}</span>
              </div>
              <span className="text-slate-400 font-mono font-semibold">₦{c.calculatedPrice.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps Roadmap (1-5) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700/80 text-left space-y-4 shadow-xl">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          <span>What Happens Next? (Admissions Roadmap)</span>
        </h4>

        <div className="space-y-3">
          {[
            { step: '1', title: 'Application Review', time: '2-3 Business Days', desc: 'Faculty admissions committee reviews your background, qualification, and cohort placement.' },
            { step: '2', title: 'Receive Admission Offer', time: 'Instant Notification', desc: 'Official Provisional Letter of Admission generated with verifiable QR code sent via email & SMS.' },
            { step: '3', title: 'Pay Tuition (70%)', time: 'Before Commencement', desc: 'Settle 70% commencement tuition deposit via Paystack or Bank Transfer to lock your lab seat.' },
            { step: '4', title: 'Student Registration & Orientation', time: 'Campus / Virtual', desc: 'Receive student ID badge, course syllabi, live lecture Zoom links, and GitHub / Figma lab access.' },
            { step: '5', title: 'Commence Classes', time: 'Cohort Kickoff', desc: '70% practical project builds, masterclasses, and faculty mentorship sprints begin.' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">{item.title}</h5>
                  <span className="text-[10px] text-orange-400 font-semibold">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrint}
          className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Application Slip</span>
        </button>

        <button
          type="button"
          onClick={onTrack}
          className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
        >
          <span>Track Application Status</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onViewCourses}
          className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <BookOpen className="w-4 h-4 text-orange-400" />
          <span>Explore More Courses</span>
        </button>

        <button
          type="button"
          onClick={onReturnHome}
          className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
};
