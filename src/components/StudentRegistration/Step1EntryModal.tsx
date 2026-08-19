import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, UserPlus, LogIn, Search, CheckCircle2, Award, Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiGetStudentRegistration } from '../../lib/studentStorage';
import { StudentRegistrationApplication } from '../../types/studentRegistration';

interface Step1EntryModalProps {
  onStartNew: () => void;
  onLoadExisting: (reg: StudentRegistrationApplication) => void;
  isOpen: boolean;
}

export const Step1EntryModal: React.FC<Step1EntryModalProps> = ({
  onStartNew,
  onLoadExisting,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'returning'>('welcome');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchError('Please enter your Application ID or Email address');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const reg = await apiGetStudentRegistration(searchQuery.trim());
      if (reg) {
        onLoadExisting(reg);
      } else {
        setSearchError(`No application found matching "${searchQuery}". Please verify your DSTA Application ID (e.g., DSTA/2026/XXXXXX) or registered email.`);
      }
    } catch (err) {
      setSearchError('Unable to retrieve application at this time. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden text-slate-100"
      >
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Student Admission Portal</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">CAC: RC-7945781</span>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">DS Tech Academy</span>
        </h2>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
          Accelerate your career with 70% practical industry-aligned tech & digital marketing masterclasses. Choose an option below to begin your journey.
        </p>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 my-6">
          <button
            type="button"
            onClick={() => setActiveTab('welcome')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'welcome'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Student</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returning')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'returning'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Returning Student</span>
          </button>
        </div>

        {/* Content based on Tab */}
        {activeTab === 'welcome' ? (
          <div className="space-y-6">
            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Award, title: '70% Practical Mastery', desc: 'Real campaigns, client briefs & live code labs.' },
                { icon: ShieldCheck, title: 'Accredited Certification', desc: 'Verifiable credentials with QR verification.' },
                { icon: Clock, title: 'Flexible 70/30 Tuition', desc: 'Pay 70% deposit before classes, 30% on completion.' },
                { icon: Users, title: 'Internship Placement', desc: 'Direct pipeline to top tech employers upon graduation.' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartNew}
                type="button"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-sm font-extrabold shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Start New Student Application</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/60 text-xs text-slate-300">
              Enter your <strong className="text-white">DSTA Application ID</strong> (e.g. <span className="text-orange-400 font-mono">DSTA/2026/894102</span>) or your <strong className="text-white">Registered Email</strong> to review, track or continue your admission profile.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Application ID or Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  placeholder="e.g. DSTA/2026/123456 or student@example.com"
                  className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {searchError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
              >
                {searchError}
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('welcome')}
                className="w-1/3 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="w-2/3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <>
                    <span>Track / Load Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
