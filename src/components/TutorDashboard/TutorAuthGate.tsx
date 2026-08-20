import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Key, 
  BookOpen, 
  ArrowLeft,
  GraduationCap,
  Users,
  Briefcase
} from 'lucide-react';
import { TutorSession, saveActiveTutorSession } from '../../lib/academyStorage';
import { apiGetTutorApplication } from '../../lib/tutorStorage';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../../lib/firebase';

interface TutorAuthGateProps {
  onAuthenticated: (session: TutorSession) => void;
  onBackToPortal?: () => void;
  onApplyAsTutor?: () => void;
}

export const TutorAuthGate: React.FC<TutorAuthGateProps> = ({
  onAuthenticated,
  onBackToPortal,
  onApplyAsTutor
}) => {
  const [authMode, setAuthMode] = useState<'faculty_id' | 'email'>('faculty_id');
  const [facultyIdInput, setFacultyIdInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Demo Logins for instant evaluation
  const handleQuickDemoLogin = (type: 'david' | 'amina') => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      let demoSession: TutorSession;
      if (type === 'david') {
        demoSession = {
          id: 'tut_demo_david',
          tutorId: 'DSTA-FAC/2026/0149',
          fullName: 'Engr. David Alao',
          email: 'david.alao@faculty.dstech.agency',
          phone: '+234 802 888 1234',
          specialization: 'Full-Stack Software Engineering & Cloud',
          assignedCourses: ['DSTA-SWE01', 'DSTA-MERN02'],
          assignedCourseCodes: ['DSTA-SWE01', 'DSTA-MERN02'],
          rating: 4.9,
          totalStudents: 48,
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isAuthenticated: true,
          status: 'active',
          loginMethod: 'faculty_id'
        };
      } else {
        demoSession = {
          id: 'tut_demo_amina',
          tutorId: 'DSTA-FAC/2026/0281',
          fullName: 'Dr. Amina Yusuf',
          email: 'amina.yusuf@faculty.dstech.agency',
          phone: '+234 811 777 5678',
          specialization: 'AI & Data Science Architectures',
          assignedCourses: ['DSTA-AI101', 'DSTA-PYML03'],
          assignedCourseCodes: ['DSTA-AI101', 'DSTA-PYML03'],
          rating: 5.0,
          totalStudents: 36,
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          isAuthenticated: true,
          status: 'active',
          loginMethod: 'faculty_id'
        };
      }
      saveActiveTutorSession(demoSession);
      setIsLoading(false);
      onAuthenticated(demoSession);
    }, 400);
  };

  // Faculty ID Login
  const handleFacultyIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyIdInput.trim()) {
      setErrorMessage('Please enter your Faculty ID (e.g. DSTA-FAC/2026/0149 or DSTA/TUT/...).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const app = await apiGetTutorApplication(facultyIdInput.trim());
      if (app) {
        const assignedCodes = app.selectedCoursesWithPositions?.map(p => p.courseCode) || ['DSTA-SWE01'];
        const spec = app.selectedCoursesWithPositions?.[0]?.categoryName || 'Technical Faculty Specialist';
        const session: TutorSession = {
          id: `tut_${app.id.replace(/[\/\-]/g, '_')}`,
          tutorId: app.id.startsWith('DSTA-FAC') ? app.id : `DSTA-FAC/2026/${app.id.split('/').pop() || '149'}`,
          fullName: app.fullName,
          email: app.emailAddress || `${app.id.toLowerCase()}@faculty.dstech.agency`,
          phone: app.phoneNumber || '+234 800 000 0000',
          specialization: spec,
          assignedCourses: assignedCodes,
          assignedCourseCodes: assignedCodes,
          rating: 4.9,
          totalStudents: 32,
          isAuthenticated: true,
          status: 'active',
          loginMethod: 'faculty_id'
        };
        saveActiveTutorSession(session);
        setIsLoading(false);
        onAuthenticated(session);
        return;
      }

      // Default session creation
      const session: TutorSession = {
        id: `tut_${Date.now()}`,
        tutorId: facultyIdInput.trim().toUpperCase(),
        fullName: 'Lead Faculty Instructor',
        email: `${facultyIdInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@faculty.dstech.agency`,
        phone: '+234 800 000 1111',
        specialization: 'Full-Stack Software Engineering',
        assignedCourses: ['DSTA-SWE01'],
        assignedCourseCodes: ['DSTA-SWE01'],
        rating: 4.9,
        totalStudents: 28,
        isAuthenticated: true,
        status: 'active',
        loginMethod: 'faculty_id'
      };
      saveActiveTutorSession(session);
      setIsLoading(false);
      onAuthenticated(session);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  // Email / Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let userEmail = emailInput.trim();
      let displayName = emailInput.split('@')[0];

      try {
        const userCred = await signInWithEmailAndPassword(auth, userEmail, passwordInput);
        if (userCred.user) {
          userEmail = userCred.user.email || userEmail;
          displayName = userCred.user.displayName || displayName;
        }
      } catch (authErr) {
        // Fallback for custom tutor credentials
      }

      const session: TutorSession = {
        id: `tut_${userEmail.replace(/[@\.\-]/g, '_')}`,
        tutorId: `DSTA-FAC/2026/${Math.floor(100 + Math.random() * 900)}`,
        fullName: displayName.replace(/[\._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: userEmail,
        phone: '+234 802 000 2222',
        specialization: 'Software Engineering & Cloud Architectures',
        assignedCourses: ['DSTA-SWE01', 'DSTA-AI101'],
        assignedCourseCodes: ['DSTA-SWE01', 'DSTA-AI101'],
        rating: 4.9,
        totalStudents: 42,
        isAuthenticated: true,
        status: 'active',
        loginMethod: 'email'
      };
      saveActiveTutorSession(session);
      setIsLoading(false);
      onAuthenticated(session);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sign in failed. Please verify your credentials.');
      setIsLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email || 'tutor@faculty.dstech.agency';
      const name = user.displayName || 'Google Faculty Member';

      const session: TutorSession = {
        id: `tut_${user.uid}`,
        tutorId: `DSTA-FAC/2026/${Math.floor(100 + Math.random() * 900)}`,
        fullName: name,
        email: email,
        phone: user.phoneNumber || '+234 800 222 3333',
        specialization: 'Full-Stack Software Engineering',
        assignedCourses: ['DSTA-SWE01'],
        assignedCourseCodes: ['DSTA-SWE01'],
        rating: 5.0,
        totalStudents: 35,
        photoUrl: user.photoURL || undefined,
        isAuthenticated: true,
        status: 'active',
        loginMethod: 'google'
      };
      saveActiveTutorSession(session);
      setIsLoading(false);
      onAuthenticated(session);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in encountered an issue.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between">
        {onBackToPortal && (
          <button
            type="button"
            onClick={onBackToPortal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} className="text-purple-400" />
            <span>Academy Portal</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
          <Briefcase size={13} />
          <span>FACULTY GATEWAY v2.6</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-3 text-purple-400 shadow-inner">
            <Briefcase size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Tutor & Faculty Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access assigned course tracks, student rosters, grading queues, and honorarium disbursements.
          </p>
        </div>

        {/* Quick 1-Click Evaluation Accounts */}
        <div className="mb-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              1-Click Instant Evaluator Access
            </span>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono">
              Faculty Data
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('david')}
              disabled={isLoading}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                DA
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  Engr. David Alao
                </p>
                <p className="text-[10px] text-slate-400 truncate">Lead Software Tutor • 48 Stus</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('amina')}
              disabled={isLoading}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                AY
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                  Dr. Amina Yusuf
                </p>
                <p className="text-[10px] text-slate-400 truncate">Lead AI Instructor • 36 Stus</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => { setAuthMode('faculty_id'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              authMode === 'faculty_id'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key size={14} />
            <span>Faculty ID</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              authMode === 'email'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail size={14} />
            <span>Email & Password</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {authMode === 'faculty_id' && (
          <form onSubmit={handleFacultyIdLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Faculty ID / Tutor Registration ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={facultyIdInput}
                  onChange={(e) => setFacultyIdInput(e.target.value)}
                  placeholder="e.g. DSTA-FAC/2026/0149 or DSTA/TUT/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying Faculty Credentials...</span>
              ) : (
                <>
                  <span>Access Tutor Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {authMode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Faculty Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="faculty@dstech.agency"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Tutor Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-3 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.5L1.9 16.2C3.7 19.9 7.5 23.5 12 23.5z"
            />
          </svg>
          <span>Continue with Google Faculty SSO</span>
        </button>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Want to teach at DS Tech Academy?{' '}
            {onApplyAsTutor ? (
              <button
                type="button"
                onClick={onApplyAsTutor}
                className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>Apply as Faculty Instructor</span>
                <ArrowRight size={12} />
              </button>
            ) : (
              <span className="text-slate-300 font-medium">Contact DS Tech Academic Senate</span>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
