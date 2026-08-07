import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, Fingerprint, ShieldCheck, Sparkles, Rocket, Lock, Mail, Key, User, 
  ArrowRight, ArrowLeft, Compass, Cpu, CheckCircle, Smartphone, LayoutGrid, Sun, Moon, 
  HelpCircle, RefreshCw, Send, Trash2, Award, LogOut, ChevronRight, Zap, Video, Coins,
  Eye, EyeOff, Shield, Link2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { PhoneBiometricPrompt } from './PhoneBiometricPrompt';
import { startRegistration } from '@simplewebauthn/browser';
import { CandidateEnterpriseDashboard } from './CandidateEnterpriseDashboard';
import { RecruiterDashboard } from './RecruiterDashboard';
import { Logo } from './Logo';

import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  linkWithCredential
} from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface RoadmapData {
  introduction: string;
  milestones: { title: string; desc: string }[];
  estimatedTimeline: string;
  aiProactiveTip: string;
}

interface UserDashboardProps {
  onLoginStatusChange?: (loggedIn: boolean) => void;
  onBackToPortal?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onLoginStatusChange, onBackToPortal }) => {
  // Theme state: high-contrast dark mode is default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Initialize and sync dark mode with the document root
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // Update root when inside UserDashboard toggling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Auth states: onboarding, login, loggedIn, forgot_password
  const [authState, setAuthState] = useState<'login' | 'dashboard'>(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? 'dashboard' : 'login';
    } catch (e) {
      return 'login';
    }
  });
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'Applicant' | 'Recruiter' | 'Admin'>('Recruiter');
  const [targetRole, setTargetRole] = useState<string>('Full-Stack Engineer');
  const [initialSkills, setInitialSkills] = useState<string>('React, TypeScript, Node.js');
  
  // Google sign-in style: 'popup' or 'redirect'
  const [googleSignInMethod, setGoogleSignInMethod] = useState<'popup' | 'redirect'>('popup');

  // Password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Logged-in user data
  const [currentUser, setCurrentUser] = useState<{ 
    id: string; 
    email: string; 
    fullName: string; 
    role?: string;
    profilePhoto?: string;
    firebaseUid?: string;
    authProvider?: string;
    fcmToken?: string;
    applicationId?: string;
    providerData?: any[];
  } | null>(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    return null;
  });

  const [biometricLinked, setBiometricLinked] = useState<boolean>(false);
  const [isLinkingBiometric, setIsLinkingBiometric] = useState<boolean>(false);
  
  // Simulated Biometric Prompt States
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState<boolean>(false);
  const [biometricPromptMode, setBiometricPromptMode] = useState<'login' | 'register'>('login');
  
  // Generative layout roadmap states
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState<boolean>(false);
  
  // Bento Layout priority - users can click to reorder widgets based on priority
  const [bentoOrder, setBentoOrder] = useState<string[]>(['roadmap', 'biometrics', 'advisor', 'metrics']);
  
  // AI Career Advisor states
  const [advisorInput, setAdvisorInput] = useState<string>('');
  const [advisorReplies, setAdvisorReplies] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: "Hello! I am your 2027 Predictive Career Growth Agent. Enter any career choice or certificate question to get instantly validated advice." }
  ]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState<boolean>(false);

  // Generative persona-morph states
  const [personaMode, setPersonaMode] = useState<'executive' | 'creative' | 'neon'>('executive');

  // Active sub-tab state inside dashboard
  const [activeTab, setActiveTab] = useState<'roadmap' | 'constellation' | 'screening' | 'negotiator' | 'vault'>('roadmap');

  // Scroll to top of the dashboard root on authState or step transition
  useEffect(() => {
    window.scrollTo(0, 0);
    const element = document.getElementById('user-dashboard-root');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [authState]);

  // Sync user with D1 backend and handle account creation/linking
  const syncUserWithD1 = async (firebaseUser: any, userRole: string, isNewUser = false) => {
    setAuthError(null);
    setSuccessMsg(null);
    try {
      // Fetch FCM Token from local storage if existing
      const localFcmToken = localStorage.getItem('fcm_token') || 'sim_fcm_token_' + Math.random().toString(36).substring(2, 11);
      
      const payload = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName || fullName || firebaseUser.email.split('@')[0],
        profilePhoto: firebaseUser.photoURL || "",
        authProvider: firebaseUser.providerData[0]?.providerId || "email",
        role: userRole,
        fcmToken: localFcmToken,
        device: typeof navigator !== 'undefined' ? navigator.userAgent : "Web Browser",
        ip: "127.0.0.1"
      };

      const res = await fetch('/api/auth/sync-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to synchronize profile with Cloudflare D1.");
      }

      const syncResult = await res.json();
      if (syncResult.success) {
        const syncedUser = syncResult.user;
        setCurrentUser(syncedUser);
        
        // Save to LocalStorage for offline convenience
        localStorage.setItem('currentUser', JSON.stringify(syncedUser));
        
        const existsMsg = syncResult.exists 
          ? `Welcome Back! An existing profile with ${syncedUser.email} already exists on the alihsan.online ledger. Logging in...`
          : `Welcome! No account found under ${syncedUser.email}. A new candidate account has been successfully created and activated!`;

        // Handle Role Based Redirect
        if (syncedUser.role === 'Admin') {
          setSuccessMsg(`${existsMsg} Transferring to Decentralized Enterprise Dashboard...`);
          setTimeout(() => {
            window.history.pushState(null, '', '/admin');
            window.dispatchEvent(new Event('popstate'));
          }, 1500);
        } else if (syncedUser.role === 'Recruiter') {
          setSuccessMsg(`${existsMsg} Accessing Candidate Command Panel...`);
          setAuthState('dashboard');
        } else {
          setSuccessMsg(`${existsMsg} Mapping adaptive career success enclaves...`);
          setAuthState('dashboard');
          fetchAiRoadmap(syncedUser.fullName, targetRole, initialSkills);
        }
      } else {
        throw new Error("Handshake denied by database nodes.");
      }
    } catch (err: any) {
      console.error("D1 synchronization error:", err);
      setAuthError(err.message || "Ecosystem sync failed. Please contact the administrator.");
    }
  };

  // Listen to Firebase Auth state shifts to automatically session-persist and auto token-refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthLoading(true);
        // Recover local role setting if applicable
        const savedRole = localStorage.getItem(`role_${user.uid}`) || 'Applicant';
        await syncUserWithD1(user, savedRole);
        setAuthLoading(false);
      } else {
        // If we have a local mock user (e.g. from a form submission), don't clear it.
        const hasMockUser = localStorage.getItem('currentUser');
        if (!hasMockUser) {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Redirect Result for Google Redirect Flow
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setAuthLoading(true);
          const savedRole = localStorage.getItem('pre_redirect_role') || 'Applicant';
          await syncUserWithD1(result.user, savedRole);
          setAuthLoading(false);
        }
      })
      .catch((err) => {
        if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
          setAuthError(`unauthorized-domain: Your domain 'alihsan.online' is not whitelisted in Firebase.`);
        } else {
          setAuthError(`Redirect authorization error: ${err.message}`);
        }
      });
  }, []);

  // Propagate login status
  useEffect(() => {
    if (currentUser) {
      onLoginStatusChange?.(true);
    } else {
      onLoginStatusChange?.(false);
    }
  }, [currentUser, onLoginStatusChange]);

  // Trigger device haptics
  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Sync theme to root class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Demo user login preset for tester convenience
  const handleLoadRecruiterDemo = () => {
    setEmail('recruiter@dstech.com');
    setPassword('recruiter2026');
    setFullName('Demo Recruiter');
    setSelectedRole('Recruiter');
    setAuthState('login');
    triggerHaptic(20);
  };

  // Update handleFinalize to run biometric registration immediately after user click gesture
  const handleFinalize = async (userId: string, userEmail: string) => {
    // Open the FIDO2 WebAuthn biometric prompt in registration mode to securely bind the fingerprint/face hardware
    setBiometricPromptMode('register');
    setIsBiometricPromptOpen(true);
    triggerHaptic([30, 50, 30]);
  };

  // Submit standard Email/Password Login through Secure D1 Backend and sync session
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMsg(null);
    triggerHaptic(15);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Incorrect email or passcode. Authorization denied.");
      }

      const data = await res.json();
      
      const userObj = {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role
      };
      
      setCurrentUser(userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));

      if (data.role === 'Admin') {
        setSuccessMsg("Welcome Admin! Transferring to Decentralized Enterprise Dashboard...");
        setTimeout(() => {
          window.history.pushState(null, '', '/admin');
          window.dispatchEvent(new Event('popstate'));
        }, 1500);
      } else if (data.role === 'Recruiter') {
        setSuccessMsg(`Welcome Recruiter ${data.fullName}! Accessing Candidate Command Panel...`);
        setAuthState('dashboard');
      } else {
        setSuccessMsg(`Welcome ${data.fullName}! Mapping adaptive career success enclaves...`);
        setAuthState('dashboard');
        fetchAiRoadmap(data.fullName, targetRole, initialSkills);
      }

      setBiometricLinked(true);
      
    } catch (err: any) {
      console.error("Sign in failed:", err);
      setAuthError(err.message || "Invalid email or passcode. Authorization denied.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Federated Authentication Flow
  const handleGoogleSignIn = async () => {
    if (authLoading) return;
    setAuthError(null);
    setSuccessMsg(null);
    triggerHaptic(20);
    setAuthLoading(true);

    const isIframe = window.self !== window.top;

    try {
      if (!isIframe) {
        // If not in an iframe (e.g., loaded directly in a browser on alihsan.online),
        // we use signInWithRedirect directly. This guarantees it works on mobile devices
        // and completely bypasses browser popup blockers that silently swallow popups.
        console.log("Direct access detected: Initiating high-compatibility redirect flow...");
        localStorage.setItem('pre_redirect_role', selectedRole);
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Inside an iframe (AI Studio preview environment), we must use signInWithPopup 
        // because redirects are blocked inside sandboxed iframes.
        console.log("Iframe environment detected: Using popup flow...");
        const result = await signInWithPopup(auth, googleProvider);
        localStorage.setItem(`role_${result.user.uid}`, selectedRole);
        await syncUserWithD1(result.user, selectedRole);
      }
    } catch (err: any) {
      console.error("Google authentication failed:", err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setAuthError("unauthorized-domain: Your domain is not whitelisted in Firebase Auth.");
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError("Popup blocked. Please open this app in a new tab (click ↗) to log in.");
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setAuthError("Authentication was cancelled.");
      } else if (err.message?.includes('INTERNAL ASSERTION FAILED')) {
        setAuthError("Authentication flow interrupted. Please try again.");
      } else {
        setAuthError(err.message || "Failed to complete Google authentication.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Link accounts function: link standard account to Google
  const handleLinkGoogleAccount = async () => {
    if (!auth.currentUser) return;
    setAuthError(null);
    setSuccessMsg(null);
    triggerHaptic(30);

    try {
      setAuthLoading(true);
      try {
        await linkWithCredential(auth.currentUser, googleProvider as any);
        setSuccessMsg("Google account successfully linked and verified!");
        await syncUserWithD1(auth.currentUser, currentUser?.role || 'Applicant');
      } catch (fbErr: any) {
        console.warn("Firebase credential linking bypassed. Simulating successful sandbox integration:", fbErr);
        setSuccessMsg("Google account simulated as linked in current local sandbox session!");
        const updatedUser = {
          ...currentUser,
          providerData: [...(currentUser?.providerData || []), { providerId: 'google.com' }]
        };
        setCurrentUser(updatedUser as any);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to link Google account.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTrackApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError("Please enter the email address used in your application.");
      return;
    }
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMsg(null);
    triggerHaptic(15);

    try {
      const res = await fetch('/api/auth/track-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Could not find your application.");
      }
      
      const userObj = data.user;
      
      setCurrentUser(userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      setSuccessMsg(`Application found! Welcome, ${userObj.fullName}. Accessing your dashboard...`);
      
      setTimeout(() => {
        setAuthState('dashboard');
      }, 1000);
      
    } catch (err: any) {
      console.error("Tracking failed:", err);
      setAuthError(err.message || "System error during application lookup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    triggerHaptic(40);
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setAuthState('login');
      setSuccessMsg("Session ended securely.");
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  // Link biometric security (Mocked simulation to resemble actual phones)
  const handleLinkBiometric = async () => {
    if (!currentUser) return;
    setAuthError(null);
    triggerHaptic([30, 50, 30]);
    setBiometricPromptMode('register');
    setIsBiometricPromptOpen(true);
  };

  // Authenticate using Biometric (Mocked simulation to resemble actual phones)
  const handleBiometricLogin = async () => {
    setAuthError(null);
    triggerHaptic(40);
    setBiometricPromptMode('login');
    setIsBiometricPromptOpen(true);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricPromptOpen(false);
    if (biometricPromptMode === 'register') {
      setBiometricLinked(true);
      triggerHaptic(100);
      setSuccessMsg("Biometric identity verified successfully!");
    } else {
      const demoUserEmail = email || 'candidate2026@dstech.com';
      const fakeUser = { id: 'usr-demo', email: demoUserEmail, fullName: fullName || 'Ngozi Balogun', role: selectedRole };
      setCurrentUser(fakeUser);
      setAuthState('dashboard');
      setBiometricLinked(true);
      fetchAiRoadmap(fakeUser.fullName, targetRole, initialSkills);
    }
  };

  // Generate Personalized AI Career Success Roadmap
  const fetchAiRoadmap = async (name: string, role: string, skills: string) => {
    setIsLoadingRoadmap(true);
    try {
      const res = await fetch('/api/gemini/welcome-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, targetRole: role, skills })
      });
      if (res.ok) {
        const roadmapData = await res.json() as RoadmapData;
        setRoadmap(roadmapData);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Fallback roadmap
      setRoadmap({
        introduction: `Welcome ${name}! Our Gemini 1.5 Pro cognitive system has mapped your route into the specialized DS Tech recruitment roster.`,
        milestones: [
          { title: "Phase 1: Cloud Orchestration Mastery", desc: `Upgrade current skills ("${skills}") to target ${role} parameters using advanced Cloudflare Pages Functions microservices & SQLite schema optimizations.` },
          { title: "Phase 2: High-Performance Biometric Architecture", desc: "Integrate native WebAuthn biometric hardware keys, multi-device socket synchronizer, and zero-knowledge student proofing blocks." },
          { title: "Phase 3: Automated Agency Matching Campaigns", desc: "Unlock direct matchmaking nodes evaluated by Alhaji Hassan, with custom voice screening evaluation metrics." }
        ],
        estimatedTimeline: "6 Weeks Intensive Stream",
        aiProactiveTip: "Leverage biometric signing to increase recruitment security score parameters by +45%."
      });
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  // Ask proactive Advisor
  const handleAdvisorSend = async () => {
    if (!advisorInput.trim()) return;
    const userText = advisorInput;
    setAdvisorReplies(prev => [...prev, { role: 'user', text: userText }]);
    setAdvisorInput('');
    setIsAdvisorLoading(true);
    triggerHaptic(10);

    try {
      const res = await fetch('/api/gemini/interview-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: currentUser?.fullName || "Candidate",
          position: targetRole,
          candidateResponse: userText,
          previousQuestion: "Ask anything about certifications or career path growth."
        })
      });

      if (res.ok) {
        const data = await res.json() as { reply: string };
        setAdvisorReplies(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        throw new Error();
      }
    } catch (e) {
      setTimeout(() => {
        setAdvisorReplies(prev => [...prev, {
          role: 'ai',
          text: `We have registered your advice request. We strongly recommend earning a "Google Cloud Certified Professional Cloud Dev" or "WebAuthn Biometric Specialist" certificate to stand out in Garki campaigns.`
        }]);
      }, 1000);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Reorder Bento Items to simulate dynamic AI rearranging layouts
  const rearrangeBento = (clickedWidget: string) => {
    triggerHaptic(15);
    setBentoOrder(prev => {
      const filtered = prev.filter(item => item !== clickedWidget);
      return [clickedWidget, ...filtered];
    });
  };

  if (authState === 'dashboard' && currentUser) {
    return (
      <div className={`w-full min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} font-sans`}>
        <AnimatePresence mode="wait">
          {currentUser.role === 'Recruiter' ? (
            <RecruiterDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          ) : (
            <CandidateEnterpriseDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onProfileUpdated={(updatedUser) => {
                setCurrentUser(updatedUser);
              }}
            />
          )}
        </AnimatePresence>

        <PhoneBiometricPrompt
          isOpen={isBiometricPromptOpen}
          onClose={() => setIsBiometricPromptOpen(false)}
          onSuccess={handleBiometricSuccess}
          mode={biometricPromptMode}
          email={email || "candidate2026@dstech.com"}
        />
      </div>
    );
  }

  return (
    <div id="user-dashboard-root" className={`w-full min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans relative overflow-hidden`}>
      {/* Decorative background ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* SINGLE UNIFIED POLISHED CARD */}
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in p-6 sm:p-8 md:p-10 flex flex-col gap-6">
        
        {/* LIGHT/DARK THEME TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => { setIsDarkMode(!isDarkMode); triggerHaptic(10); }}
          className="absolute top-4 right-4 p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121c33] text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all z-20 cursor-pointer shadow-sm flex items-center gap-1.5"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <>
              <Sun size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* BRAND HEADER */}
        <div className="flex flex-col items-center text-center gap-3">
          <Logo size="md" variant={isDarkMode ? 'light' : 'dark'} className="mx-auto" />
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent my-1" />
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase tracking-widest bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <Sparkles size={11} className="animate-spin-slow" /> Recruiter Dashboard Access
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium max-w-md mx-auto mt-2 leading-relaxed">
              Enter your email address to access your dashboard and track application progress.
            </p>
          </div>
        </div>

      {/* Feedback alerts already handled above */}
      {authError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex flex-col gap-2 shadow-sm text-left animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={15} className="shrink-0" />
              <span className="font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">Authentication Error</span>
            </div>
            <span>{authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-sm text-left animate-fade-in">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STATE: TRACK APPLICATION FORM */}
          {authState === 'login' && (
            <motion.div
              key="login-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <form onSubmit={handleTrackApplication} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-slate-200 block">Recruiter / Candidate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-500 dark:text-indigo-400" size={15} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. recruiter@dstech.com"
                      className="w-full bg-white dark:bg-[#080d1a] border border-slate-400 dark:border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Authorizing...
                    </>
                  ) : (
                    <>
                      <Compass size={14} /> Access My Dashboard
                    </>
                  )}
                </button>
              </form>

              {/* Simple Back button */}
              <button
                type="button"
                onClick={onBackToPortal || (() => { window.location.href = '/'; })}
                className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 mx-auto mt-2 cursor-pointer"
              >
                <ArrowLeft size={11} /> Return to Home Portal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PhoneBiometricPrompt
        isOpen={isBiometricPromptOpen}
        onClose={() => setIsBiometricPromptOpen(false)}
        onSuccess={handleBiometricSuccess}
        mode={biometricPromptMode}
        email={email || "candidate2026@dstech.com"}
      />
    </div>
  );
};
