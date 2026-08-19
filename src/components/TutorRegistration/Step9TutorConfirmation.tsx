import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  Home, 
  Search, 
  Mail, 
  Calendar, 
  UserCheck, 
  GraduationCap, 
  Award, 
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { TutorApplication } from '../../types/tutorRegistration';

interface Step9TutorConfirmationProps {
  application: TutorApplication;
  onNavigateHome: () => void;
  onTrackApplication: () => void;
}

export const Step9TutorConfirmation: React.FC<Step9TutorConfirmationProps> = ({
  application,
  onNavigateHome,
  onTrackApplication
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 print:p-0">
      {/* Animated Success Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="text-center space-y-3"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Faculty Application Received Successfully</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">DSTA Faculty Pool</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Your tutor application and credentials have been securely stored in our academic faculty database. An official confirmation email has been dispatched.
        </p>
      </motion.div>

      {/* Official Application Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Official Tutor Application Tracking ID
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-orange-400 tracking-wider mt-0.5">
              {application.id}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyId}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-orange-400" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Applicant Summary Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instructor Name</span>
            <div className="text-sm font-bold text-white">{application.fullName}</div>
            <div className="text-slate-400">{application.emailAddress}</div>
            <div className="text-slate-400">{application.phoneNumber}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teaching Preferences</span>
            <div className="text-slate-200"><strong>Mode:</strong> {application.preferredTeachingMode}</div>
            <div className="text-slate-200"><strong>Schedule:</strong> {application.preferredTeachingDays}</div>
            <div className="text-slate-200"><strong>Languages:</strong> {(application.teachingLanguages || []).join(', ')}</div>
          </div>
        </div>

        {/* Selected Positions Summary */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Selected Programmes & Positions ({application.selectedCoursesWithPositions.length})
            </span>
            <span className="text-[10px] font-mono text-orange-400 font-bold">115+ Catalog</span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {application.selectedCoursesWithPositions.map((item, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-orange-400">{item.courseCode}</span>
                  <span className="font-bold text-white">{item.courseTitle}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 pl-2 border-l border-slate-700">
                  {item.selectedPositions.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Dispatched Note */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 flex items-center gap-3 text-xs text-blue-300">
          <Mail className="w-5 h-5 text-blue-400 shrink-0" />
          <span>
            Confirmation email dispatched to <strong>{application.emailAddress}</strong>. Keep your application ID safe for interview tracking.
          </span>
        </div>

        {/* 5-Step Next Stages Roadmap (PDF 1 & 2) */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            <span>Next Steps in the Faculty Onboarding Process</span>
          </h4>

          <div className="space-y-2.5">
            {[
              {
                step: '1',
                title: 'Application Screening & Verification',
                desc: 'Our academic board verifies your academic degrees, CV, and professional certifications within 48–72 hours.'
              },
              {
                step: '2',
                title: 'Interview & Teaching Demonstration',
                desc: 'Shortlisted candidates deliver a 15-minute mock lecture/presentation to evaluate pedagogical and hands-on skill delivery.'
              },
              {
                step: '3',
                title: 'Selection & Board Approval',
                desc: 'Formal selection and determination of remuneration tier, course allocation, and cohort schedule.'
              },
              {
                step: '4',
                title: 'Instructor Onboarding & Faculty Induction',
                desc: 'Orientation on DSTA LMS platform, studio equipment usage, grading standards, and faculty codes of conduct.'
              },
              {
                step: '5',
                title: 'Commencement of Teaching & Cohort Allocation',
                desc: 'Official appointment letter issued and first physical or virtual cohort allocated with dedicated TA support.'
              }
            ].map((st) => (
              <div
                key={st.step}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80"
              >
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {st.step}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{st.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800 no-print">
          <button
            type="button"
            onClick={handlePrintSlip}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>Print / Save Application Slip</span>
          </button>

          <button
            type="button"
            onClick={onTrackApplication}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Track Application Status</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
