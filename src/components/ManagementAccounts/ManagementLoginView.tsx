import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Building2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Logo } from '../Logo';
import { OFFICIAL_MANAGEMENT_ROLES, apiManagementLogin } from '../../lib/managementApi';
import { ManagementRoleCode, ManagementUserSession } from '../../types/management';

interface ManagementLoginViewProps {
  selectedRole: ManagementRoleCode;
  onLoginSuccess: (session: ManagementUserSession) => void;
  onBackToRoleSelection: () => void;
  onNavigateHome: () => void;
  theme: 'light' | 'dark';
}

export const ManagementLoginView: React.FC<ManagementLoginViewProps> = ({
  selectedRole,
  onLoginSuccess,
  onBackToRoleSelection,
  onNavigateHome,
  theme
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Retrieve selected role details
  const roleMeta = OFFICIAL_MANAGEMENT_ROLES.find(r => r.code === selectedRole) || OFFICIAL_MANAGEMENT_ROLES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your official management email address.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    // Client-side guard: do not allow selecting one role and authenticating with another role's known email
    // (The server also strictly enforces this with constant-time password hash comparison)
    const normalizedInputEmail = trimmedEmail.toLowerCase();
    const otherRoleWithThisEmail = OFFICIAL_MANAGEMENT_ROLES.find(
      r => r.email.toLowerCase() === normalizedInputEmail && r.code !== selectedRole
    );
    if (otherRoleWithThisEmail) {
      setErrorMsg(`Authorization mismatch: This email is assigned to ${otherRoleWithThisEmail.title}. You are currently signing in to ${roleMeta.title}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await apiManagementLogin(trimmedEmail, password, selectedRole);
      setSuccessMsg('Identity verified. Authorizing management workspace...');
      setTimeout(() => {
        onLoginSuccess(response.user);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Logo size="sm" showText={false} />
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>DS TECH COMPANY</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold border border-orange-200/60 dark:border-orange-800/60">
                  MANAGEMENT PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Corporate Governance & Leadership Accounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToRoleSelection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} className="text-orange-500" />
              <span>Change Role</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Back link */}
          <button
            type="button"
            onClick={onBackToRoleSelection}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to All Management Accounts</span>
          </button>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-950/5 dark:shadow-black/40">
            {/* Active Role Indicator */}
            <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60 text-xs font-bold mb-3">
                <ShieldCheck size={14} />
                <span>Selected Account</span>
              </div>

              {/* Exact Selected Role Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {roleMeta.title}
              </h2>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {roleMeta.department}
              </p>

              <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                Management Account Login
              </div>
            </div>

            {/* Error or Success Alert */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="leading-relaxed font-semibold">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder={roleMeta.email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Account Password
                  </label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter management password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={14} />
                      <span>Sign In to {roleMeta.title}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Account Role Notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Security Policy: Credentials are verified via backend cryptographic hashing. Selecting one role and attempting to authenticate another is rejected.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} DS Tech & Digital Marketing Agency Limited. All Rights Reserved.</span>
          <span className="font-mono text-[11px]">Area 1, Garki, Abuja, FCT, Nigeria</span>
        </div>
      </footer>
    </div>
  );
};
