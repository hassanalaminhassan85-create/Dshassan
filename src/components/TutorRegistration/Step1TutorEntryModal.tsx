import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Award, 
  ShieldCheck, 
  Zap, 
  Users, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { TUTOR_BENEFITS, TutorApplication } from '../../types/tutorRegistration';
import { apiGetTutorApplication } from '../../lib/tutorStorage';

interface Step1TutorEntryModalProps {
  onStartNew: () => void;
  onResumeApplication: (app: TutorApplication) => void;
}

export const Step1TutorEntryModal: React.FC<Step1TutorEntryModalProps> = ({
  onStartNew,
  onResumeApplication
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'returning'>('new');
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [foundApp, setFoundApp] = useState<TutorApplication | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsSearching(true);
    setLookupError(null);
    setFoundApp(null);

    try {
      const app = await apiGetTutorApplication(lookupQuery.trim());
      if (app) {
        setFoundApp(app);
      } else {
        setLookupError('No tutor application found with that ID or Email address. Please check your details or start a new application.');
      }
    } catch (err) {
      setLookupError('Failed to lookup application. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DSTA Faculty Network • Instructor Onboarding</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Join the Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">DSTA Faculty</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2 leading-relaxed">
          Shape the next generation of African digital leaders. Deliver world-class physical, virtual, or hybrid masterclasses across 24 industry categories.
        </p>
      </div>

      {/* Main Choice Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Tab Buttons */}
        <div className="flex items-center justify-center p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 max-w-md mx-auto mb-8 relative z-10">
          <button
            type="button"
            onClick={() => { setActiveTab('new'); setLookupError(null); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Applicant
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('returning'); setLookupError(null); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'returning'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Returning Applicant (Login)
          </button>
        </div>

        {/* NEW APPLICANT VIEW */}
        {activeTab === 'new' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 space-y-6"
          >
            {/* Top Action Prompt */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-400" />
                  Ready to submit your Tutor Application?
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Complete the 9-step application form with personal, academic, position preferences, and teaching experience.
                </p>
              </div>
              <button
                type="button"
                onClick={onStartNew}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
              >
                <span>Start New Tutor Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 11 Tutor Benefits Grid (PDF 1) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-400" />
                  11 Key Faculty Benefits & Privileges
                </h4>
                <span className="text-[11px] font-mono text-orange-400 font-semibold">DSTA Faculty Standard</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TUTOR_BENEFITS.map((benefit) => (
                  <div
                    key={benefit.number}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-all">
                      {benefit.number}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {benefit.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onStartNew}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-base shadow-2xl shadow-orange-600/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Step 2: Personal Information</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* RETURNING APPLICANT VIEW */}
        {activeTab === 'returning' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 space-y-6 max-w-xl mx-auto"
          >
            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold text-white">Track or Resume Your Application</h4>
              <p className="text-xs text-slate-400">
                Enter your official Application ID (e.g. <span className="font-mono text-orange-400">DSTA-TUTOR/2026/XXXXXX</span>) or registered Email address.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Application ID or Registered Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="e.g. DSTA-TUTOR/2026/782910 or name@example.com"
                    required
                    className="w-full px-4 py-3.5 pl-11 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {lookupError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{lookupError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching || !lookupQuery.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Application Registry...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Lookup Application</span>
                  </>
                )}
              </button>
            </form>

            {/* Found Application Details */}
            {foundApp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                    {foundApp.id}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold capitalize">
                    Status: {foundApp.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-white">{foundApp.fullName}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{foundApp.emailAddress} • {foundApp.phoneNumber}</p>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div><strong>Teaching Mode:</strong> {foundApp.preferredTeachingMode}</div>
                  <div><strong>Teaching Days:</strong> {foundApp.preferredTeachingDays}</div>
                  <div><strong>Selected Courses:</strong> {foundApp.selectedCoursesWithPositions.length} programme(s)</div>
                </div>

                <button
                  type="button"
                  onClick={() => onResumeApplication(foundApp)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resume / View Application Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
