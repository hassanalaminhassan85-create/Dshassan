import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck
} from 'lucide-react';
import { OFFICIAL_MANAGEMENT_ROLES, apiManagementLogin } from '../../lib/managementApi';
import { ManagementRoleCode, ManagementUserSession } from '../../types/management';
import { OfficialRoleSvg } from './OfficialRoleSvgs';
import { apiGetCacMetadata, apiSubscribeToCacMetadata, apiSubscribeToRealtimeSync } from '../../lib/api';
import { COMPANY_RC_NUMBER, COMPANY_CAC_RC_LABEL, formatCompanyRc } from '../../lib/companyConstants';

interface ManagementLoginViewProps {
  selectedRole: ManagementRoleCode;
  onLoginSuccess: (session: ManagementUserSession) => void;
  onBackToRoleSelection: () => void;
  onNavigateHome: () => void;
  theme: 'light' | 'dark';
  publishedCac?: any;
}

export const ManagementLoginView: React.FC<ManagementLoginViewProps> = ({
  selectedRole,
  onLoginSuccess,
  onBackToRoleSelection,
  onNavigateHome,
  theme,
  publishedCac: initialPublishedCac
}) => {
  // Retrieve selected role details
  const roleMeta = OFFICIAL_MANAGEMENT_ROLES.find(r => r.code === selectedRole) || OFFICIAL_MANAGEMENT_ROLES[0];

  // Pre-fill email with designated role email so users don't encounter typing mistakes
  const [email, setEmail] = useState(roleMeta.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [liveCac, setLiveCac] = useState<any>(initialPublishedCac || null);

  // Sync real-time CAC metadata with database and main home footer
  useEffect(() => {
    if (initialPublishedCac) {
      setLiveCac(initialPublishedCac);
    }
  }, [initialPublishedCac]);

  useEffect(() => {
    let isMounted = true;
    const loadCac = async () => {
      try {
        const data = await apiGetCacMetadata(false);
        if (data && data.length > 0 && isMounted) {
          const published = data.find((c: any) => c.is_published === 1) || data[0];
          if (published) {
            setLiveCac(published);
          }
        }
      } catch (e) {}
    };

    if (!initialPublishedCac) {
      loadCac();
    }

    const unsubCac = apiSubscribeToCacMetadata((cacData) => {
      if (cacData && cacData.length > 0 && isMounted) {
        const published = cacData.find((c: any) => c.is_published === 1) || cacData[0];
        if (published) {
          setLiveCac(published);
        }
      }
    });

    const unsubSSE = apiSubscribeToRealtimeSync((event) => {
      if (event?.type?.startsWith('CAC_')) {
        loadCac();
      }
    });

    return () => {
      isMounted = false;
      unsubCac();
      unsubSSE();
    };
  }, [initialPublishedCac]);

  const cleanRawRc = liveCac?.registration_number || initialPublishedCac?.registration_number || COMPANY_RC_NUMBER;
  const rcNumber = formatCompanyRc(cleanRawRc);

  // Keep email in sync if selectedRole changes
  useEffect(() => {
    setEmail(roleMeta.email);
    setPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [selectedRole, roleMeta.email]);

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

    // Clean password: strip whitespace and any quotation marks if user copied "dstech%)"
    let cleanPass = password.trim();
    if ((cleanPass.startsWith('"') && cleanPass.endsWith('"')) || (cleanPass.startsWith("'") && cleanPass.endsWith("'"))) {
      cleanPass = cleanPass.slice(1, -1).trim();
    }

    // Client-side guard: do not allow selecting one role and authenticating with another role's known email
    const normalizedInputEmail = trimmedEmail.toLowerCase();
    const otherRoleWithThisEmail = OFFICIAL_MANAGEMENT_ROLES.find(
      r => r.email.toLowerCase() === normalizedInputEmail && r.code !== selectedRole
    );
    if (otherRoleWithThisEmail) {
      setErrorMsg(`Authorization mismatch: This email belongs to ${otherRoleWithThisEmail.title}. You are currently authenticating as ${roleMeta.title}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await apiManagementLogin(trimmedEmail, cleanPass, selectedRole);
      setSuccessMsg('Authentication successful. Loading management workspace...');
      const userSession = {
        ...response.user,
        token: response.token || response.user.token || 'dst_mgmt_session'
      };
      setTimeout(() => {
        onLoginSuccess(userSession);
      }, 350);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* Content Container - Matching career page styling */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8 animate-fade-in text-left">
        
        {/* Only Back Navigation Remains + Real-Time CAC RC matching Main Home Footer */}
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            type="button"
            onClick={onBackToRoleSelection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer group shrink-0"
          >
            <ArrowLeft size={14} className="text-orange-500 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <span>Back</span>
            <span className="hidden sm:inline">to All Accounts</span>
          </button>

          {/* Real-time CAC RC Badge (synchronized with Main Footer, fully mobile responsive) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-2xs shrink-0">
            <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
            <span className="whitespace-nowrap">CAC RC No. <strong className="text-slate-950 dark:text-white font-bold">{rcNumber}</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          </div>
        </div>

        {/* Header - Career page aesthetic */}
        <div className="space-y-3">
          <span className="text-orange-500 text-xs uppercase tracking-widest font-black">
            MANAGEMENT ACCOUNT LOGIN
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
            {roleMeta.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-light">
            {roleMeta.department} · {roleMeta.scope}
          </p>
        </div>

        {/* Polished Login Card with Official Coloured SVG Emblem */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Active Account Identity Pill with Official SVG */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 flex items-center justify-center shadow-xs">
              <OfficialRoleSvg role={roleMeta.code} size={50} />
            </div>

            <div className="space-y-1 flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Designated Management Account
                </span>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-[10px] font-mono font-bold uppercase border border-orange-200/60 dark:border-orange-800/60">
                  {roleMeta.departmentCode}
                </span>
              </div>
              <div className="text-sm font-black text-[#000E32] dark:text-white uppercase font-serif truncate">
                {roleMeta.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {roleMeta.department}
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-relaxed font-bold">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={roleMeta.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>

              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter account password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 bg-[#000E32] hover:bg-[#00174F] dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.01]"
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

          {/* Security notice */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-light">
              Official corporate access is strictly restricted to designated management leaders. All sessions are validated via secure authentication tokens.
            </p>
          </div>
        </div>

        {/* Footer - Mobile Responsive and Stackable so RC number is never truncated */}
        <div className="pt-4 pb-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5 px-2">
          <p className="font-medium text-slate-600 dark:text-slate-300">
            DS Tech & Digital Marketing Agency Limited
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
              CAC RC No. {rcNumber}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>Area 1, Garki, Abuja, Nigeria</span>
          </div>
        </div>
      </div>
    </div>
  );
};
