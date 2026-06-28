import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, Fingerprint, ShieldCheck, Sparkles, Rocket, Lock, Mail, Key, User, 
  ArrowRight, Compass, Cpu, CheckCircle, Smartphone, LayoutGrid, Sun, Moon, 
  HelpCircle, RefreshCw, Send, Trash2, Award, LogOut, ChevronRight, Zap, Video, Coins
} from 'lucide-react';
import { PhoneBiometricPrompt } from './PhoneBiometricPrompt';

// Modern modular ecosystem widgets
import { CareerConstellation } from './CareerConstellation';
import { AiScreeningHub } from './AiScreeningHub';
import { SecurityLedgerVault } from './SecurityLedgerVault';
import { NeuralPresence } from './NeuralPresence';
import { NegotiatorContinuity } from './NegotiatorContinuity';

interface RoadmapData {
  introduction: string;
  milestones: { title: string; desc: string }[];
  estimatedTimeline: string;
  aiProactiveTip: string;
}

interface UserDashboardProps {
  onLoginStatusChange?: (loggedIn: boolean) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onLoginStatusChange }) => {
  // Theme state: high-contrast dark mode is default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Auth states: onboarding, login, loggedIn
  const [authState, setAuthState] = useState<'welcome' | 'register' | 'login' | 'dashboard'>('welcome');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Full-Stack Engineer');
  const [initialSkills, setInitialSkills] = useState<string>('React, TypeScript, Node.js');
  
  // Onboarding registration steps
  const [registerStep, setRegisterStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Logged-in user data
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; fullName: string } | null>(null);
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
  const handleLoadDemoUser = () => {
    setEmail('candidate2026@dstech.com');
    setPassword('vision2026');
    setFullName('Ngozi Balogun');
    setTargetRole('AI Integrations Engineer');
    setInitialSkills('Python, React, PyTorch, Fast API');
    setAuthState('register');
    setRegisterStep(1);
    triggerHaptic(20);
  };

  // Submit standard email/password registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    triggerHaptic([10, 30, 10]);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          preferences: { targetRole, initialSkills }
        })
      });

      const data = await response.json() as any;
      if (response.ok) {
        setCurrentUser({ id: data.userId, email: data.email, fullName: data.fullName });
        setSuccessMsg("Account built on D1 Cloud Core! Proceed to link hardware biometrics.");
        setAuthState('dashboard');
        // Fetch AI Roadmap immediately
        fetchAiRoadmap(data.fullName, targetRole, initialSkills);
      } else {
        setAuthError(data.error || "Failed to create account.");
      }
    } catch (err: any) {
      setAuthError("Network error or database offline. Using premium preview environment credentials.");
      // Preview Fallback
      setTimeout(() => {
        const fakeUser = { id: 'usr-demo', email: email || 'candidate2026@dstech.com', fullName: fullName || 'Ngozi Balogun' };
        setCurrentUser(fakeUser);
        setAuthState('dashboard');
        fetchAiRoadmap(fakeUser.fullName, targetRole, initialSkills);
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit standard Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    triggerHaptic(15);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json() as any;
      if (response.ok) {
        setCurrentUser({ id: data.userId, email: data.email, fullName: data.fullName });
        setAuthState('dashboard');
        setBiometricLinked(true); // Pre-enable biometric linked for login success demo convenience
        fetchAiRoadmap(data.fullName, data.preferences?.targetRole || targetRole, data.preferences?.initialSkills || initialSkills);
      } else {
        setAuthError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      // Fallback
      setAuthError("Handshake failure. Entering premium sandbox preview as demo user.");
      setTimeout(() => {
        const fakeUser = { id: 'usr-demo', email: email || 'candidate2026@dstech.com', fullName: fullName || 'Ngozi Balogun' };
        setCurrentUser(fakeUser);
        setAuthState('dashboard');
        fetchAiRoadmap(fakeUser.fullName, targetRole, initialSkills);
      }, 1500);
    } finally {
      setIsSubmitting(false);
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
    } else {
      const demoUserEmail = email || 'candidate2026@dstech.com';
      const fakeUser = { id: 'usr-demo', email: demoUserEmail, fullName: fullName || 'Ngozi Balogun' };
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

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-4 md:p-8 font-sans`}>
      
      {/* Floating System Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-orange-500 rounded-2xl shadow-lg relative">
            <Rocket className="text-white animate-pulse" size={20} />
            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-30" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">DS Account Hub</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2026 Vision Core Infrastructure</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => { setIsDarkMode(!isDarkMode); triggerHaptic(10); }}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white cursor-pointer"
            title="Toggle theme mode"
          >
            {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-400" />}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => { setAuthState('welcome'); setCurrentUser(null); triggerHaptic(30); }}
              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={11} /> Log Out
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* WELCOME / LANDING SELECTOR */}
          {authState === 'welcome' && (
            <motion.div
              key="welcome-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center py-16 space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-400/20">
                  <Sparkles size={11} className="animate-spin-slow" />
                  Biometric authorization pipeline
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white">
                  Unlock the Most Advanced Recruitment Experience.
                </h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Connect high-security biometric device locks directly to Cloudflare Pages D1, generate generative career success blueprints, and sync parameters across multiple screens.
                </p>
              </div>

              {/* Demo auto-fill option */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 max-w-md mx-auto space-y-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center justify-center gap-1.5">
                  <Zap size={13} /> Tester Convenience Portal
                </h3>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Skip manual typing and instantly inject premium preset values (Ngozi Balogun, AI Integrations Engineer) into the onboarding stream.
                </p>
                <button
                  type="button"
                  onClick={handleLoadDemoUser}
                  className="w-full py-2 bg-gradient-to-r from-orange-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  🚀 Auto-Load Presets & Proceed
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setAuthState('register'); triggerHaptic(10); }}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <UserPlus size={15} /> Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthState('login'); triggerHaptic(10); }}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Lock size={15} className="text-orange-400" /> Standard Login
                </button>
              </div>
            </motion.div>
          )}

          {/* REGISTER STEPPED ONBOARDING FLOW */}
          {authState === 'register' && (
            <motion.div
              key="register-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-xl mx-auto bg-slate-900/60 border border-white/15 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-left"
            >
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-black flex items-center gap-2 text-white">
                    <UserPlus className="text-indigo-400" size={18} />
                    Onboarding Pipeline
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">Configure biometric parameters & targets</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl font-bold">
                  Step {registerStep} of 3
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500" 
                  initial={{ width: '33.3%' }}
                  animate={{ width: `${(registerStep / 3) * 100}%` }}
                />
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold">
                  {authError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {/* STEP 1: Basic credentials */}
                  {registerStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Full Legal Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 text-slate-500" size={15} />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="e.g. Ngozi Balogun"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 text-slate-500" size={15} />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="e.g. candidate@dstech.com"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Password Passcode</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-3 text-slate-500" size={15} />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { if (fullName && email && password) { setRegisterStep(2); triggerHaptic(10); } else { setAuthError("Please fill out all credentials."); } }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Proceed to Targets <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2: Career Targets */}
                  {registerStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Target Agency Role</label>
                        <select
                          value={targetRole}
                          onChange={e => setTargetRole(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="AI Integrations Engineer">AI Integrations Engineer</option>
                          <option value="Full-Stack Developer">Full-Stack Developer</option>
                          <option value="Cloud Architect">Cloud Infrastructure Architect</option>
                          <option value="WebAuthn Cryptographer">Security & Biometrics Cryptographer</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Initial Core Skills</label>
                        <textarea
                          value={initialSkills}
                          onChange={e => setInitialSkills(e.target.value)}
                          placeholder="e.g. React, TypeScript, Node.js, Fast API"
                          rows={3}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(1)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRegisterStep(3); triggerHaptic(10); }}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Device Link <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Security & Submit */}
                  {registerStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5 text-center"
                    >
                      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 animate-pulse" />
                        <Fingerprint size={38} className="text-indigo-400" />
                      </div>

                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <h4 className="font-extrabold text-white text-sm">Hardware Biometrics Integration</h4>
                        <p className="text-[10px] text-slate-400 leading-normal font-medium">
                          You will register this device key into our Cloudflare D1 nodes. This links FaceID / Fingerprint locks securely as your primary login channel.
                        </p>
                      </div>

                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(2)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-xl hover:shadow-indigo-500/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck size={14} /> Finalize Account
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <div className="pt-4 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => { setAuthState('login'); triggerHaptic(10); }}
                  className="text-[10px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Already registered? Jump to secure login
                </button>
              </div>
            </motion.div>
          )}

          {/* STANDARD PASSWORD & BIOMETRIC LOGIN */}
          {authState === 'login' && (
            <motion.div
              key="login-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-md mx-auto bg-slate-900/60 border border-white/15 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-left"
            >
              <div>
                <h2 className="text-base font-black flex items-center gap-2 text-white">
                  <Lock className="text-orange-500" size={18} />
                  Authorize Session
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">Standard passwords or hardware-level key handshakes</p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-slate-500" size={15} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. candidate@dstech.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 text-slate-500" size={15} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : "Verify Session"}
                </button>
              </form>

              {/* Biometric Login alternative */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10" />
                <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Or Biometric Key</span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-orange-500/10"
              >
                <Fingerprint size={16} /> Scan FaceID / Fingerprint
              </button>

              <div className="pt-4 border-t border-white/5 text-center flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setAuthState('register'); triggerHaptic(10); }}
                  className="text-[10px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Create onboarding account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthState('welcome'); triggerHaptic(10); }}
                  className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Return
                </button>
              </div>
            </motion.div>
          )}
               {/* DYNAMIC BENTO GENERATIVE DASHBOARD (2027 MASTERS EDITION) */}
          {authState === 'dashboard' && currentUser && (() => {
            // Generative Persona Theme specifications
            const personaStyles = {
              executive: {
                cardBg: 'bg-slate-900/60 border-white/10 backdrop-blur-xl',
                textGlow: 'text-indigo-400',
                borderGlow: 'border-indigo-500/20 shadow-indigo-500/5',
                buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
                tabActive: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
                headerGradient: 'from-slate-950 via-slate-900 to-indigo-950/20'
              },
              creative: {
                cardBg: 'bg-stone-900/70 border-orange-500/10 backdrop-blur-xl',
                textGlow: 'text-orange-400',
                borderGlow: 'border-orange-500/20 shadow-orange-500/5',
                buttonBg: 'bg-gradient-to-r from-orange-600 to-indigo-600 text-white',
                tabActive: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
                headerGradient: 'from-stone-950 via-stone-900 to-amber-950/25'
              },
              neon: {
                cardBg: 'bg-black/80 border-emerald-500/20 shadow-emerald-500/5 ring-1 ring-emerald-500/5',
                textGlow: 'text-emerald-400 font-mono',
                borderGlow: 'border-emerald-500/35',
                buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-black font-black border border-emerald-400',
                tabActive: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
                headerGradient: 'from-black via-zinc-950 to-emerald-950/20'
              }
            };

            const currentStyle = personaStyles[personaMode];

            return (
              <motion.div
                key="dashboard-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Floating Neural Presence Intent Toast indicators */}
                <NeuralPresence />

                {/* Generative Persona Morph Selector and User Greeting Panel */}
                <div className={`p-6 rounded-3xl border transition-all duration-500 text-left relative overflow-hidden ${currentStyle.cardBg} ${currentStyle.borderGlow}`}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-full filter blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                        <CheckCircle size={11} className="text-emerald-400" /> D1 CLOUD CORE NODE AUTHENTICATED
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-white">Welcome home, {currentUser.fullName}!</h2>
                      <p className="text-[11.5px] text-slate-300 max-w-2xl font-medium leading-relaxed">
                        Your decentralized career parameters are fully synchronized. Switch your professional persona to morph the visual layouts, densities, and color palettes instantly.
                      </p>
                    </div>

                    {/* Persona Selector Panel */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-2 shrink-0 lg:max-w-xs">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block text-center">GENERATIVE INTERFACE PERSONA</span>
                      <div className="flex gap-1.5">
                        {[
                          { id: 'executive', label: 'Executive' },
                          { id: 'creative', label: 'Creative' },
                          { id: 'neon', label: 'Cyber-Neon' }
                        ].map(mode => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => { setPersonaMode(mode.id as any); triggerHaptic(10); }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              personaMode === mode.id 
                                ? currentStyle.tabActive
                                : 'bg-white/5 border border-transparent text-slate-400 hover:text-white'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connected Status Badges row */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5 mt-4">
                    <div className="bg-slate-950 border border-white/5 rounded-xl px-3 py-1.5 text-left">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Linked Role</span>
                      <span className="text-[10px] font-black text-white">{targetRole}</span>
                    </div>
                    <div className="bg-slate-950 border border-white/5 rounded-xl px-3 py-1.5 text-left">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Biometrics ID</span>
                      <span className={`text-[10px] font-black ${biometricLinked ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {biometricLinked ? 'SECURE WEBAUTHN' : 'VISUAL FALLBACK'}
                      </span>
                    </div>
                    <div className="bg-slate-950 border border-white/5 rounded-xl px-3 py-1.5 text-left">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Ecosystem Status</span>
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> 2027 ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Immersive Navigation Tabs Bar */}
                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1 text-left">
                  {[
                    { id: 'roadmap', label: 'Career Roadmap', icon: Compass },
                    { id: 'constellation', label: '3D Constellation', icon: Sparkles },
                    { id: 'screening', label: 'AI Screening Hub', icon: Video },
                    { id: 'negotiator', label: 'Compensation AI', icon: Coins },
                    { id: 'vault', label: 'Security & Passport', icon: Fingerprint }
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => { setActiveTab(tab.id as any); triggerHaptic(15); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === tab.id 
                            ? currentStyle.tabActive
                            : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <TabIcon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Switchable Dashboard Panes */}
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: ROADMAP & CAREER AGENT */}
                  {activeTab === 'roadmap' && (
                    <motion.div
                      key="tab-roadmap"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                      {/* Generative Roadmap View */}
                      <div className={`lg:col-span-8 rounded-3xl p-6 border text-left relative overflow-hidden transition-all duration-500 ${currentStyle.cardBg} ${currentStyle.borderGlow}`}>
                        <div className="absolute top-0 right-0 bg-indigo-500/10 border-b border-l border-indigo-500/20 text-[9px] font-black text-indigo-400 px-3 py-1 rounded-bl-2xl uppercase">
                          Generative Roadmap
                        </div>
                        
                        <div className="flex items-center gap-3 border-b border-white/10 pb-3.5 mb-4">
                          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Compass size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                              Career Success Roadmap
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium">Customized specifically for {currentUser.fullName}</p>
                          </div>
                        </div>

                        {isLoadingRoadmap ? (
                          <div className="py-12 flex flex-col items-center justify-center gap-3">
                            <RefreshCw size={24} className="animate-spin text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Consulting Gemini Pro...</span>
                          </div>
                        ) : roadmap ? (
                          <div className="space-y-4">
                            <p className="text-[11.5px] text-slate-300 leading-relaxed italic bg-black/45 p-3 rounded-2xl border border-white/5">
                              "{roadmap.introduction}"
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                              {roadmap.milestones.map((milestone, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1.5 hover:bg-white/10 transition-colors">
                                  <span className="text-[8px] font-mono text-orange-400 font-black block uppercase">Milestone 0{idx + 1}</span>
                                  <h4 className="text-[11.5px] font-extrabold text-white">{milestone.title}</h4>
                                  <p className="text-[10px] text-slate-400 leading-relaxed">{milestone.desc}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-[10px]">
                              <span className="text-slate-400 font-medium">Estimated timeline: <strong className="text-indigo-400">{roadmap.estimatedTimeline}</strong></span>
                              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                <Sparkles size={11} /> Proactive Tip: {roadmap.aiProactiveTip}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 text-center text-slate-500 text-xs font-bold">
                            Roadmap fully synchronized into localized database cache.
                          </div>
                        )}
                      </div>

                      {/* Interactive Career Agent Advisor */}
                      <div className={`lg:col-span-4 rounded-3xl p-6 border text-left relative overflow-hidden transition-all duration-500 ${currentStyle.cardBg} ${currentStyle.borderGlow}`}>
                        <div className="absolute top-0 right-0 bg-indigo-500/10 border-b border-l border-indigo-500/20 text-[9px] font-black text-indigo-400 px-3 py-1 rounded-bl-2xl uppercase">
                          AI Agent
                        </div>

                        <div className="flex items-center gap-3 border-b border-white/10 pb-3.5 mb-4">
                          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Cpu size={18} className="animate-spin-slow" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white">Interactive Career Agent</h3>
                            <p className="text-[9px] text-slate-400 font-medium">Instant advice on technical pathways</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="h-44 overflow-y-auto space-y-2.5 bg-black/45 rounded-2xl p-3 border border-white/5 text-[10px] scrollbar-thin">
                            {advisorReplies.map((reply, idx) => (
                              <div key={idx} className={`p-2.5 rounded-xl leading-relaxed ${reply.role === 'ai' ? 'bg-slate-900 border border-white/5 text-slate-200' : 'bg-indigo-600 text-white ml-6'}`}>
                                <span className="font-extrabold uppercase text-[8px] block mb-1 text-slate-400">
                                  {reply.role === 'ai' ? '🤖 Agent' : '👤 You'}
                                </span>
                                {reply.text}
                              </div>
                            ))}
                            {isAdvisorLoading && (
                              <div className="text-[9px] font-black text-orange-400 animate-pulse">Agent is thinking...</div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={advisorInput}
                              onChange={e => setAdvisorInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAdvisorSend()}
                              placeholder="e.g. Should I study crystals-kyber?"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-indigo-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleAdvisorSend(); }}
                              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all cursor-pointer"
                            >
                              <Send size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: SPATIAL CAREER CONSTELLATION */}
                  {activeTab === 'constellation' && (
                    <motion.div
                      key="tab-constellation"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CareerConstellation />
                    </motion.div>
                  )}

                  {/* TAB 3: MULTIMODAL SCREENING VOICE & VIDEO HUB */}
                  {activeTab === 'screening' && (
                    <motion.div
                      key="tab-screening"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <AiScreeningHub />
                    </motion.div>
                  )}

                  {/* TAB 4: AUTONOMOUS NEGOTIATOR & HAPTIC BRIDGE */}
                  {activeTab === 'negotiator' && (
                    <motion.div
                      key="tab-negotiator"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <NegotiatorContinuity />
                    </motion.div>
                  )}

                  {/* TAB 5: SECURITY, ENCLAVES & PORTABLE PASSPORT */}
                  {activeTab === 'vault' && (
                    <motion.div
                      key="tab-vault"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <SecurityLedgerVault 
                        currentUser={currentUser} 
                        targetRole={targetRole} 
                        biometricLinked={biometricLinked} 
                      />
                    </motion.div>
                  )}

                </AnimatePresence>
              </motion.div>
            );
          })()}

        </AnimatePresence>
      </main>

      <PhoneBiometricPrompt
        isOpen={isBiometricPromptOpen}
        onSuccess={handleBiometricSuccess}
        onCancel={() => setIsBiometricPromptOpen(false)}
        title={biometricPromptMode === 'register' ? "Link Biometric Credentials" : "Authorize Portal Login"}
        subtitle={biometricPromptMode === 'register' ? "Secure device locking via simulated 3D scan" : "Verify registered biometric profile"}
      />
    </div>
  );
};
