import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  // Navigation & Icons
  LayoutGrid, Compass, Cpu, Video, ShieldCheck, UserCheck, BarChart3, LineChart,
  Mic, Search, Bookmark, History, Sparkles, LogOut, CheckCircle2, ChevronRight,
  ChevronDown, Settings, Bell, Share2, Download, MessageSquare, AlertCircle,
  TrendingUp, Wallet, Shield, Users, HelpCircle, Activity, Globe, Send, Play,
  Smartphone, Eye, Award, Lock, FileText, Ban, Trash2, Edit3, Fingerprint, RefreshCw,
  Heart, Zap, Star
} from 'lucide-react';
import { CandidateEnterpriseSettings } from './CandidateEnterpriseSettings';
import { useNotifications } from './NotificationProvider';
import { NotificationCenter } from './NotificationCenter';

// Recharts for stunning data visualizations
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Line
} from 'recharts';

interface CandidateEnterpriseDashboardProps {
  currentUser: { fullName: string; email: string; id: string } | null;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

// Full 25 Pages Definition
interface DashboardPage {
  id: number;
  title: string;
  category: 'core' | 'intelligence' | 'operations' | 'risk' | 'specialized';
  icon: React.ComponentType<any>;
  description: string;
  tags: string[];
}

const DASHBOARD_PAGES: DashboardPage[] = [
  { id: 1, title: "Dashboard Home", category: "core", icon: LayoutGrid, description: "Overview, real-time intelligence hub, and personalized prediction widgets.", tags: ["overview", "analytics", "home"] },
  { id: 2, title: "Career Transformation Engine", category: "core", icon: Compass, description: "12-month personalized roadmap, AI milestones, and risk assessment.", tags: ["roadmap", "career", "planning"] },
  { id: 3, title: "Advanced Skill Analysis", category: "core", icon: Cpu, description: "Quantum-level skill matching, semantic gap analysis, and benchmarking.", tags: ["skills", "matching", "gap"] },
  { id: 4, title: "Immersive Interview Prep", category: "core", icon: Video, description: "Simulated VR/AR interviewer, real-time facial emotion feedback, and stress monitoring.", tags: ["interview", "avatar", "training"] },
  { id: 5, title: "Blockchain Credential Vault", category: "core", icon: ShieldCheck, description: "Verifiable credentials, tamper-proof certificates, and ledger transaction log.", tags: ["blockchain", "credentials", "security"] },
  
  { id: 6, title: "Personality & Culture Fit", category: "intelligence", icon: Users, description: "Big Five assessment matching and company work-style compatibility scores.", tags: ["mbti", "culture", "compatibility"] },
  { id: 7, title: "Real-Time Market Intelligence", category: "intelligence", icon: TrendingUp, description: "Live job trends, geographical salary maps, and skill demand forecasts.", tags: ["trends", "salary", "market"] },
  { id: 8, title: "Predictive Analytics & Forecasting", category: "intelligence", icon: LineChart, description: "Job offer probability models, timing optimizations, and burnout risk index.", tags: ["predictions", "probability", "ai"] },
  { id: 9, title: "Voice-Activated AI Assistant", category: "intelligence", icon: Mic, description: "Voice command terminal, sentiment analyzer, and accent-neutral coaching.", tags: ["voice", "audio", "assistant"] },
  { id: 10, title: "AR Career Visualization", category: "intelligence", icon: Smartphone, description: "Augmented reality 3D salary trajectory and virtual office environment tours.", tags: ["ar", "augmented", "3d"] },
  
  { id: 11, title: "Autonomous AI Job Hunting Agent", category: "operations", icon: Zap, description: "Self-driven job applications tracking, scheduling bots, and automated emails.", tags: ["agent", "automation", "autonomy"] },
  { id: 12, title: "Metaverse Career Platform", category: "operations", icon: Globe, description: "3D virtual career fair lobbies, avatar inventory, and networking nodes.", tags: ["metaverse", "virtual", "avatar"] },
  { id: 13, title: "Advanced Network Analysis", category: "operations", icon: Award, description: "LinkedIn influence diagrams, referral path optimization, and connection gaps.", tags: ["network", "connections", "social"] },
  { id: 14, title: "Dynamic Salary Negotiation AI", category: "operations", icon: Wallet, description: "Total compensation calculator, live offer comparison, and prompt scripts.", tags: ["negotiate", "salary", "equity"] },
  { id: 15, title: "Advanced Portfolio & Project Showcase", category: "operations", icon: FileText, description: "GitHub impacts quantification, SEO keyword density checker, and video intro generators.", tags: ["portfolio", "github", "seo"] },
  
  { id: 16, title: "Predictive Company Health", category: "risk", icon: AlertCircle, description: "Startup failure hazard scoring, competitive advantage radar, and layoff risks.", tags: ["company", "health", "financial"] },
  { id: 17, title: "Diversity & Inclusion Engine", category: "risk", icon: Heart, description: "Inclusive language bias detection, representation metrics, and equity indices.", tags: ["dei", "bias", "equity"] },
  { id: 18, title: "Quantum Recommendation Engine", category: "risk", icon: Sparkles, description: "Serendipitous and hybrid content recommendation with explainable AI outputs.", tags: ["recommend", "matching", "ai"] },
  { id: 19, title: "Advanced Interview Intelligence", category: "risk", icon: UserCheck, description: "Interviewer sentiment metrics, response transcript ratings, and bias detectors.", tags: ["transcript", "score", "feedback"] },
  { id: 20, title: "Futuristic Career Simulation", category: "risk", icon: Activity, description: "5-year career progression simulator, economic variables, and work-life balances.", tags: ["simulation", "scenarios", "future"] },
  
  { id: 21, title: "Advanced Threat Detection", category: "specialized", icon: Shield, description: "Phishing alert list, scam posting scorecards, and salary theft sensors.", tags: ["threat", "scam", "phishing"] },
  { id: 22, title: "Emotional Intelligence Coach", category: "specialized", icon: HelpCircle, description: "Empathy level, social awareness coaching, and real-time stress exercises.", tags: ["emotional", "stress", "coaching"] },
  { id: 23, title: "Hyper-Personalized Learning System", category: "specialized", icon: Eye, description: "Adaptive curriculum generator, spaced repetition tracker, and flashcards.", tags: ["learning", "education", "spaced"] },
  { id: 24, title: "Advanced Biometric Security", category: "specialized", icon: Fingerprint, description: "Continuous behavioral biometric monitoring and WebAuthn device logs.", tags: ["biometric", "security", "webauthn"] },
  { id: 25, title: "Brain-Computer Interface (BCI)", category: "specialized", icon: Cpu, description: "Simulated EEG-based cognitive assessments, mental loads, and focal metrics.", tags: ["brain", "eeg", "cognitive"] },
  { id: 26, title: "Comprehensive Settings Console", category: "specialized", icon: Settings, description: "12 major settings categories, backup & restore, global search, and audit logging.", tags: ["settings", "admin", "config"] }
];

// Sample languages
const LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'fr', name: 'Français (France)' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文 (简体)' }
];

export const CandidateEnterpriseDashboard: React.FC<CandidateEnterpriseDashboardProps> = ({
  currentUser,
  onLogout,
  isDarkMode,
  setIsDarkMode
}) => {
  const { unreadCount, registerUser } = useNotifications();
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState<boolean>(false);
  const [activePageId, setActivePageId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<number[]>([1, 2, 3, 5]);
  const [pageHistory, setPageHistory] = useState<number[]>([1]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('core');

  useEffect(() => {
    const activePg = DASHBOARD_PAGES.find(p => p.id === activePageId);
    if (activePg && activePg.category) {
      setExpandedCategory(activePg.category);
    }
  }, [activePageId]);

  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: "AI Agent submitted application to TechCorp", type: 'success', time: "Just now" },
    { id: 2, text: "WebAuthn key D1 validation completed", type: 'info', time: "10m ago" },
    { id: 3, text: "New skill gap identified in AWS serverless", type: 'warning', time: "2h ago" }
  ]);
  
  // Simulated WebSockets Feed
  const [wsLogs, setWsLogs] = useState<string[]>([
    "SYS_INIT: Quantum Core On-line...",
    "WS_CONN: Tunnel bound on Cloudflare Node D1",
    "AGENT: Real-time candidate index 94.8% active"
  ]);

  // Voice activation states
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceCommand, setVoiceCommand] = useState<string>('');
  const [voiceResponse, setVoiceResponse] = useState<string>('');

  // Drag & drop customized widget order for Home Dashboard
  const [homeWidgets, setHomeWidgets] = useState<string[]>(['stats', 'roadmap', 'probability', 'activity']);

  // Page Specific Comments/Annotations
  const [pageComments, setPageComments] = useState<Record<number, { author: string; text: string; time: string }[]>>({
    1: [
      { author: "Hassan Alamin (HR Admin)", text: "This layout is highly impressive. The predictive probabilities are incredibly detailed.", time: "1h ago" },
      { author: "DS AI Recruiter", text: "Verified credentials look perfect. Ready for executive matching.", time: "45m ago" }
    ],
    2: [
      { author: "System Coach", text: "Focus heavily on completing the Node.js architecture milestone.", time: "Yesterday" }
    ]
  });
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Page Settings overrides
  const [pageSettings, setPageSettings] = useState<Record<string, boolean>>({
    autoRefresh: true,
    hapticFeedback: true,
    predictiveAssist: true
  });

  // Keep track of page history for Back navigation
  const navigateToPage = (id: number) => {
    setActivePageId(id);
    setPageHistory(prev => {
      if (prev[prev.length - 1] === id) return prev;
      return [...prev, id];
    });
    setIsMobileNavOpen(false);
  };

  const handleBackNavigation = () => {
    if (pageHistory.length > 1) {
      const updatedHistory = [...pageHistory];
      updatedHistory.pop(); // Remove current
      const prevPage = updatedHistory[updatedHistory.length - 1];
      setActivePageId(prevPage);
      setPageHistory(updatedHistory);
    }
  };

  // Live simulation tickers
  useEffect(() => {
    const userEmail = currentUser?.email || "anonymous";
    registerUser(userEmail, "candidate");

    const wsInterval = setInterval(() => {
      const logs = [
        `TICKER: Ledger sealed block #${Math.floor(Math.random() * 100000)}`,
        "COACH: Re-calculating skill transferability parameters...",
        "REALTIME: Interview sentiment index shifting positive +2.4%",
        "AGENT: Scanning 42 digital roles for match...",
        `SEC_SYS: Continuous biometric pulse checked. Accuracy: 99.8%`
      ];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setWsLogs(prev => [randomLog, ...prev.slice(0, 15)]);
    }, 4500);

    return () => clearInterval(wsInterval);
  }, []);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Voice search presets simulation
  const triggerVoiceCommand = (command: string) => {
    setIsListeningVoice(true);
    setVoiceCommand(command);
    
    setTimeout(() => {
      setIsListeningVoice(false);
      let match = DASHBOARD_PAGES.find(p => p.title.toLowerCase().includes(command.toLowerCase()) || p.tags.some(t => t.includes(command.toLowerCase())));
      if (match) {
        navigateToPage(match.id);
        setVoiceResponse(`Directing to: ${match.title}`);
      } else {
        setVoiceResponse(`Command "${command}" recognized, but no matching module could be routed.`);
      }
    }, 1500);
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      author: currentUser?.fullName || "Candidate User",
      text: newCommentText,
      time: "Just now"
    };
    setPageComments(prev => ({
      ...prev,
      [activePageId]: [...(prev[activePageId] || []), newComment]
    }));
    setNewCommentText('');
  };

  // Reorder home widgets simulation
  const moveWidgetUp = (index: number) => {
    if (index === 0) return;
    const nextWidgets = [...homeWidgets];
    const temp = nextWidgets[index];
    nextWidgets[index] = nextWidgets[index - 1];
    nextWidgets[index - 1] = temp;
    setHomeWidgets(nextWidgets);
  };

  // Page filter based on query
  const filteredPages = DASHBOARD_PAGES.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activePage = DASHBOARD_PAGES.find(p => p.id === activePageId) || DASHBOARD_PAGES[0];
  const ActiveIcon = activePage.icon;

  // Chart Mocks
  const skillMatchData = [
    { subject: 'React & Frontend', A: 95, B: 80, fullMark: 100 },
    { subject: 'TypeScript & ESM', A: 90, B: 85, fullMark: 100 },
    { subject: 'Cloudflare D1 SQL', A: 85, B: 70, fullMark: 100 },
    { subject: 'WebAuthn Security', A: 88, B: 60, fullMark: 100 },
    { subject: 'System Architecture', A: 82, B: 75, fullMark: 100 },
    { subject: 'Generative NLP API', A: 92, B: 90, fullMark: 100 },
  ];

  const marketSalaryData = [
    { name: 'Jan', Remote: 120, Hybrid: 110, Onsite: 95 },
    { name: 'Feb', Remote: 125, Hybrid: 115, Onsite: 97 },
    { name: 'Mar', Remote: 135, Hybrid: 120, Onsite: 100 },
    { name: 'Apr', Remote: 145, Hybrid: 130, Onsite: 105 },
    { name: 'May', Remote: 150, Hybrid: 132, Onsite: 108 },
    { name: 'Jun', Remote: 155, Hybrid: 135, Onsite: 112 }
  ];

  const predictiveProbabilityData = [
    { name: 'Week 1', probability: 45 },
    { name: 'Week 2', probability: 58 },
    { name: 'Week 3', probability: 68 },
    { name: 'Week 4', probability: 74 },
    { name: 'Week 5', probability: 89 },
    { name: 'Week 6', probability: 94.8 }
  ];

  const personalityData = [
    { trait: 'Openness', score: 92 },
    { trait: 'Conscientiousness', score: 88 },
    { trait: 'Extraversion', score: 74 },
    { trait: 'Agreeableness', score: 85 },
    { trait: 'Neuroticism', score: 22 }
  ];

  // Helper simulated actions
  const exportPDF = () => {
    alert(`Exporting ${activePage.title} data in High-Fidelity PDF standard format... Done!`);
  };

  const exportCSV = () => {
    alert(`Generating encrypted CSV spreadsheet of metrics for ${activePage.title}... Loaded inside browser download queue.`);
  };

  return (
    <div id="candidate-enterprise-dashboard-root" className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 text-xs ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`}>
      
      {/* SIDEBAR NAVIGATION - PERSISTENT ON DESKTOP */}
      <aside id="dashboard-sidebar" className={`w-full md:w-80 shrink-0 border-r ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} flex flex-col justify-between md:sticky md:top-0 md:h-screen z-40 transition-all`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b flex flex-col gap-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-xl shadow-md">
                <Sparkles size={16} className="text-white animate-pulse" />
              </div>
              <div>
                <h2 className="font-black text-xs tracking-wider uppercase bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">DS Enterprise Core</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Quantum Candidate Suite</p>
              </div>
            </div>
            
            {/* Mobile Nav Close / Open Indicator */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-1.5 rounded-lg md:hidden border border-white/10 text-slate-400"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Global Search across all pages */}
          <div className="relative mt-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 25 specialized pages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/20 border border-slate-700/50 rounded-xl text-[11px] focus:outline-none focus:border-indigo-500 text-indigo-200 transition-all"
            />
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className={`flex-1 overflow-y-auto px-2.5 py-3 space-y-4 md:block ${isMobileNavOpen ? 'block' : 'hidden md:block'}`}>
          
          {/* Favorites/Bookmarks Widget */}
          {favorites.length > 0 && (
            <div className="space-y-1">
              <span className="px-2.5 text-[8px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1">
                <Star size={10} className="fill-orange-400 text-orange-400" /> Bookmarks
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                {favorites.map(fId => {
                  const pg = DASHBOARD_PAGES.find(p => p.id === fId);
                  if (!pg) return null;
                  const PgIcon = pg.icon;
                  return (
                    <button
                      key={fId}
                      onClick={() => navigateToPage(fId)}
                      className={`p-2 rounded-xl text-left flex items-center gap-1.5 transition-all text-[10px] truncate ${activePageId === fId ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      <PgIcon size={11} className="shrink-0" />
                      <span className="truncate">{pg.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category-wise Layout with Accordion Restructure */}
          {(['core', 'intelligence', 'operations', 'risk', 'specialized'] as const).map(cat => {
            const catPages = filteredPages.filter(p => p.category === cat);
            if (catPages.length === 0) return null;
            
            const isExpanded = expandedCategory === cat;
            
            // Map category data to human readable labels and icons
            const catInfo = {
              core: { label: '1. Core Systems', icon: Compass, color: 'text-indigo-400' },
              intelligence: { label: '2. Insights & AI', icon: Cpu, color: 'text-amber-400' },
              operations: { label: '3. Autonomous Ops', icon: Zap, color: 'text-emerald-400' },
              risk: { label: '4. Predictive Risks', icon: AlertCircle, color: 'text-rose-400' },
              specialized: { label: '5. Future & Security', icon: Shield, color: 'text-orange-400' }
            }[cat];

            const CatIcon = catInfo.icon;

            return (
              <div key={cat} className="space-y-1 bg-slate-150 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden transition-all duration-300 shadow-sm">
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all select-none ${
                    isExpanded 
                      ? 'bg-indigo-600/15 border-b border-slate-200 dark:border-slate-800/60 text-indigo-900 dark:text-indigo-200 font-extrabold' 
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-400 hover:text-indigo-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CatIcon size={13} className={`${catInfo.color} shrink-0`} />
                    <span className="truncate text-[10px] font-black uppercase tracking-wider">{catInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[8px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded">
                      {catPages.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown size={11} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={11} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-1 py-1 space-y-0.5">
                        {catPages.map(page => {
                          const PageIcon = page.icon;
                          const isPageActive = activePageId === page.id;
                          return (
                            <div
                              key={page.id}
                              onClick={() => navigateToPage(page.id)}
                              className={`group flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                                isPageActive 
                                  ? 'bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/15' 
                                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <PageIcon size={12} className={`shrink-0 ${isPageActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'} transition-colors`} />
                                <span className="truncate text-[10px] font-medium">{page.title}</span>
                              </div>
                              
                              {/* Bookmark Toggle inside Row */}
                              <button
                                type="button"
                                onClick={(e) => toggleFavorite(page.id, e)}
                                className="opacity-20 group-hover:opacity-100 hover:scale-110 p-0.5 rounded transition-all"
                              >
                                <Star size={10} className={`${favorites.includes(page.id) ? 'fill-orange-400 text-orange-400' : 'text-slate-400'}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Real-time WebSockets Monitor Log Footer */}
        <div className={`p-3 border-t md:block ${isMobileNavOpen ? 'block' : 'hidden md:block'} ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-100'}`}>
          <div className="flex items-center justify-between mb-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live D1 Tunnel Feed
            </span>
            <Activity size={10} />
          </div>
          <div className="bg-black/40 rounded-xl p-2 font-mono text-[9px] text-emerald-500/90 h-20 overflow-y-auto space-y-1 select-none border border-emerald-500/10">
            {wsLogs.map((log, index) => (
              <div key={index} className="truncate select-none">{log}</div>
            ))}
          </div>
        </div>
      </aside>

      {/* DYNAMIC CENTRAL STAGE / CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* GLOBAL CONTEXT / META BAR */}
        <header className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} sticky top-0 z-30 backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            {/* Back button */}
            {pageHistory.length > 1 && (
              <button
                onClick={handleBackNavigation}
                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer"
                title="Go back"
              >
                Back
              </button>
            )}
            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                <span>Enterprise Suite</span> <ChevronRight size={10} /> <span className="text-indigo-400">{activePage.category.toUpperCase()}</span>
              </div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <ActiveIcon className="text-orange-400" size={18} />
                {activePage.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Presets for Voice activation */}
            <div className="hidden lg:flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                <Mic size={10} className="text-orange-400" /> Preset AI Voice Commands:
              </span>
              <button onClick={() => triggerVoiceCommand("Skill Analysis")} className="px-2 py-0.5 bg-slate-800 rounded-md hover:bg-slate-700 text-[9px] font-bold text-slate-300">"Skills"</button>
              <button onClick={() => triggerVoiceCommand("Interview Prep")} className="px-2 py-0.5 bg-slate-800 rounded-md hover:bg-slate-700 text-[9px] font-bold text-slate-300">"Interview"</button>
              <button onClick={() => triggerVoiceCommand("Credential Vault")} className="px-2 py-0.5 bg-slate-800 rounded-md hover:bg-slate-700 text-[9px] font-bold text-slate-300">"Certificates"</button>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={e => setCurrentLanguage(e.target.value)}
                className="bg-black/30 border border-slate-700/50 text-[10px] font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-indigo-300"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

             {/* Real-Time Notification Bell button */}
             <button
               onClick={() => setIsNotifCenterOpen(true)}
               className="relative p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
               title="Open Notification Center"
             >
               <Bell size={14} />
               {unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-[#0a1128] animate-pulse">
                   {unreadCount}
                 </span>
               )}
             </button>

            {/* Quick Settings Gear button */}
            <button
              onClick={() => navigateToPage(26)}
              className={`p-1.5 rounded-lg border ${activePageId === 26 ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-slate-700 hover:bg-slate-800 text-slate-300'} cursor-pointer`}
              title="Open Comprehensive Settings"
            >
              <Settings size={14} className={activePageId === 26 ? 'animate-spin-slow' : ''} />
            </button>

            {/* Main Log Out button */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* VOICE ASSISTANT INTERACTIVE TOP BAR IF LISTENING */}
        {isListeningVoice && (
          <div className="bg-gradient-to-r from-orange-600 to-indigo-600 text-white py-2.5 px-4 font-mono text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>AI Assistant Listening for Command: "{voiceCommand}"...</span>
          </div>
        )}
        {voiceResponse && (
          <div className="bg-indigo-950/80 border-b border-indigo-500/30 text-indigo-300 py-2.5 px-4 font-bold text-center flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-orange-400" />
            <span>{voiceResponse}</span>
            <button onClick={() => setVoiceResponse('')} className="ml-4 font-black uppercase text-[9px] tracking-wide text-white underline">Dismiss</button>
          </div>
        )}

        {/* MAIN MODULE GRID PANEL CONTENT */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          
          {/* PAGE 1: DASHBOARD HOME (OVERVIEW) */}
          {activePageId === 1 && (
            <div id="dashboard-home-view" className="space-y-6">
              
              {/* Top Summary Banner */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#02102e] via-[#02163b] to-slate-950 text-white p-6 border border-indigo-950 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-orange-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/20 mb-1.5">
                      <Sparkles size={10} /> 2026 Executive Intel
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Welcome, {currentUser?.fullName || 'Ngozi Balogun'}</h2>
                    <p className="text-slate-400 text-[11px] max-w-xl">
                      Your autonomous security key is validated on local D1 Node hashes. This premium cockpit manages 25 specialized engines to coordinate your DS Tech career pathway.
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between shrink-0 min-w-[200px]">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall Profile Rank</span>
                    <span className="text-2xl font-black text-indigo-400">94.8%</span>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '94.8%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customizable Widget Layout Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {homeWidgets.map((widget, idx) => {
                  if (widget === 'stats') {
                    return (
                      <div key="stats" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Quick Stats</span>
                          <button onClick={() => moveWidgetUp(idx)} className="text-[9px] font-bold text-indigo-400 hover:underline">Rearrange ↑</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">Demand Ratio</span>
                            <span className="text-base font-black text-white">High</span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">Ready Score</span>
                            <span className="text-base font-black text-emerald-400">91%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (widget === 'roadmap') {
                    return (
                      <div key="roadmap" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3 col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Transformation Roadmap Summary</span>
                          <button onClick={() => navigateToPage(2)} className="text-[9px] text-indigo-400 hover:underline flex items-center gap-0.5">Full Engine <ChevronRight size={10} /></button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold text-[11px] text-white">Phase 1: Profile Initialization</p>
                              <p className="text-[9px] text-slate-400">D1 cryptographic nodes linked & validated.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-indigo-400">2</div>
                            <div>
                              <p className="font-extrabold text-[11px] text-white">Phase 2: Semantic Skills Level Up</p>
                              <p className="text-[9px] text-slate-400">Close AWS Infrastructure and WebAuthn specialization gaps.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (widget === 'probability') {
                    return (
                      <div key="probability" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2 col-span-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Offer Probability Model</span>
                          <button onClick={() => navigateToPage(8)} className="text-[9px] text-indigo-400 hover:underline">Forecaster</button>
                        </div>
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={predictiveProbabilityData}>
                              <defs>
                                <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }} />
                              <Area type="monotone" dataKey="probability" stroke="#f97316" fillOpacity={1} fill="url(#colorProb)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider">Estimated Offer Target: Week 6 (94.8%)</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Related pages quick links */}
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quick Cockpit Navigation Shortcut</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {DASHBOARD_PAGES.slice(1, 13).map(p => {
                    const PgIcon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => navigateToPage(p.id)}
                        className="p-2.5 rounded-xl text-left bg-white/5 hover:bg-slate-800 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-2 truncate"
                      >
                        <PgIcon size={12} className="text-orange-400 shrink-0" />
                        <span className="truncate text-[10px]">{p.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: CAREER TRANSFORMATION ENGINE */}
          {activePageId === 2 && (
            <div id="career-transformation-view" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 12-Month Plan Timeline */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 md:col-span-2 space-y-5">
                  <h3 className="font-black text-sm uppercase text-indigo-400">12-Month AI Onboarding Milestones</h3>
                  <div className="space-y-4">
                    {[
                      { m: "Month 1-2", t: "Security Handshake Core Integration", d: "Seal cryptographic signatures via hardware authentication and cloud database sync on Cloudflare D1 nodes." },
                      { m: "Month 3-5", t: "Distributed API Scaling Specialist", d: "Optimize background routines and secure endpoints using custom token handshakes." },
                      { m: "Month 6-8", t: "AI Co-pilot Custom Tuning", d: "Develop customized prompts and training modules using enterprise-grade natural language decoders." },
                      { m: "Month 9-12", t: "Autonomous Engineering Lead", d: "Manage virtual environments, automated testing workflows, and smart contracts." }
                    ].map((item, idx) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-indigo-500/30">
                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-bold text-orange-400 block">{item.m}</span>
                        <p className="font-extrabold text-white text-[12px]">{item.t}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{item.d}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Coaching Sidebar */}
                <div className="space-y-4 col-span-1">
                  <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 space-y-4">
                    <h4 className="font-black text-xs uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-orange-400 animate-pulse" /> AI Coaching Assistant
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      "I have audited your background and recommend shifting your emphasis slightly toward <strong>Security & Biometrics Cryptography</strong>. Market demand has increased by <strong>34.2%</strong> this week."
                    </p>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-slate-400">Risk Assessment</span>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Career Risk Matrix</span>
                        <span className="text-emerald-400 font-bold">Low (12%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '12%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 3: ADVANCED SKILL ANALYSIS */}
          {activePageId === 3 && (
            <div id="advanced-skill-analysis-view" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Skill Radar Chart */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="font-black text-sm uppercase text-indigo-400">Quantum Skill Proficiency Benchmarking</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillMatchData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                        <Radar name="Your Score" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                        <Radar name="Market Target" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 text-[10px] font-bold uppercase">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-500 rounded" /> Your Strength (94%)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded" /> Required Target (78%)</div>
                  </div>
                </div>

                {/* Skill Gap Analysis */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="font-black text-sm uppercase text-indigo-400">Semantic Gap Analysis</h3>
                  <div className="space-y-3">
                    {[
                      { skill: "Cloudflare D1 Node SQL Integration", gap: "-15%", action: "Earn 'Professional Cloud Dev' micro-credential", val: 85 },
                      { skill: "WebAuthn Multi-Factor Security", gap: "-12%", action: "Review Dilithium-5 post-quantum signing keys", val: 88 },
                      { skill: "D3 Data Visualizations", gap: "Target Met", action: "Proficient. Ready to build bespoke chart matrices", val: 100 }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex justify-between items-center text-white">
                          <span className="font-extrabold">{item.skill}</span>
                          <span className={item.gap.includes('-') ? "text-orange-400 font-bold" : "text-emerald-400 font-bold"}>{item.gap}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.gap.includes('-') ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${item.val}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Recommended Action: {item.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 4: IMMERSIVE INTERVIEW PREP */}
          {activePageId === 4 && (
            <div id="interview-prep-view" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Simulated Interview Stage */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 md:col-span-2 space-y-4 text-center">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Immersive Video Environment</span>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider rounded">Camera Live Simulation</span>
                  </div>
                  
                  {/* Mock Video Feed Placeholder */}
                  <div className="relative w-full aspect-video bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)]" />
                    
                    {/* Simulated scanning grids */}
                    <div className="absolute top-4 left-4 p-2 bg-indigo-600/20 border border-indigo-500/30 rounded text-[9px] text-indigo-300 font-mono text-left space-y-0.5">
                      <div>EMOTION: STABLE</div>
                      <div>PACING: 125 WPM</div>
                      <div>STRESS LEVEL: 18% (LOW)</div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3 z-10">
                      <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
                        <Video size={36} className="text-indigo-400 animate-pulse" />
                      </div>
                      <p className="font-extrabold text-sm text-white">"Introduce yourself and explain how you handle database locks."</p>
                      <p className="text-[10px] text-slate-500">Press Space or speak into microphone to simulate answer recording</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer">Start AR Session</button>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer">Select Avatar: Executive Recruiter</button>
                  </div>
                </div>

                {/* Scenario Library Sidebar */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="font-black text-xs uppercase tracking-wider text-indigo-400">100+ Interview Scenarios</h3>
                  <div className="space-y-2">
                    {[
                      { title: "Behavioral: Underrepresented leadership match", duration: "10 min", rating: "Expert" },
                      { title: "Technical: WebAuthn key storage & serialization", duration: "15 min", rating: "Hard" },
                      { title: "Stress: High-load database lock resolution", duration: "8 min", rating: "Moderate" }
                    ].map((sc, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                        <div className="flex justify-between text-white font-extrabold mb-1">
                          <span className="truncate">{sc.title}</span>
                          <span className="text-[9px] px-1.5 bg-indigo-500/10 text-indigo-400 rounded shrink-0">{sc.rating}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold block">Duration: {sc.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 5: BLOCKCHAIN CREDENTIAL VAULT */}
          {activePageId === 5 && (
            <div id="blockchain-vault-view" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* W3C Verifiable Credentials list */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 md:col-span-2 space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm uppercase text-indigo-400">Verifiable Credentials</h3>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">W3C Compliant</span>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { title: "B.Sc. Computer Science Verified Diploma", issuer: "Amadu Bello University, Zaria", hash: "SHA256: 0x8a9c2d7f8a9c2d7f...", status: "Ledger Signed" },
                      { title: "Security Specialist Biometric Cryptographer", issuer: "Cloudflare Core Platform Nodes", hash: "SHA256: 0xf3d2c1b0a9e8d7c6...", status: "Valid Secure Match" }
                    ].map((cred, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-[12px] text-white">{cred.title}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block">Issuer: {cred.issuer}</span>
                          <span className="text-[9px] font-mono text-indigo-300 block">{cred.hash}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[9px] font-black uppercase rounded-lg">
                            {cred.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ledger Transaction History */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="font-black text-xs uppercase tracking-wider text-indigo-400">Immutable Ledger Operations</h3>
                  <div className="space-y-2">
                    {[
                      { event: "Seal block generated", block: "#102938", time: "2m ago" },
                      { event: "ABU Degree verifiable credential bound", block: "#102911", time: "1h ago" },
                      { event: "Smart contract deployment complete", block: "#102804", time: "Yesterday" }
                    ].map((tx, idx) => (
                      <div key={idx} className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center font-mono text-[10px]">
                        <div>
                          <p className="text-white font-extrabold">{tx.event}</p>
                          <p className="text-slate-500">Block: {tx.block}</p>
                        </div>
                        <span className="text-indigo-400 font-bold shrink-0">{tx.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 26: COMPREHENSIVE SETTINGS CONSOLE */}
          {activePageId === 26 && (
            <CandidateEnterpriseSettings
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          )}

          {/* FALLBACK PANEL RENDER FOR ALL OTHER 20 DYNAMIC PAGES */}
          {activePageId > 5 && activePageId !== 26 && (
            <div id={`dynamic-page-${activePageId}`} className="space-y-6">
              
              {/* Alert / Notification regarding specialized prototype status */}
              <div className="p-4 bg-indigo-500/15 border border-indigo-500/25 text-indigo-200 rounded-2xl flex items-start gap-3">
                <AlertCircle size={18} className="text-orange-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <span className="font-extrabold text-[12px] block">Specialized Enterprise Cockpit Page</span>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    This advanced cockpit console represents the active preview for <strong>{activePage.title}</strong>, calibrated for real-time analytics sync and multi-modal candidate scoring.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Central Statistics Visual Module */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 lg:col-span-2 space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-black text-sm uppercase text-indigo-400">Core Metrics Dashboard</h3>
                    <div className="flex gap-2">
                      <button onClick={exportPDF} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer">
                        <Download size={11} /> PDF
                      </button>
                      <button onClick={exportCSV} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer">
                        <Share2 size={11} /> Share
                      </button>
                    </div>
                  </div>

                  {/* Render Page-Specific customized previews */}
                  {activePageId === 6 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px]">Big Five Assessment Metrics pairing for cultural fit. Optimal match target: Remote Work Team Dynamics.</p>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={personalityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="trait" stroke="#94a3b8" fontSize={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                            <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]}>
                              {personalityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 || index === 1 ? '#f97316' : '#6366f1'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {activePageId === 7 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px]">Salary Predictor ranges based on global candidate indices ($K / yr).</p>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={marketSalaryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                            <Area type="monotone" dataKey="Remote" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
                            <Area type="monotone" dataKey="Hybrid" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Standard Catch-All visually detailed panel */}
                  {activePageId !== 6 && activePageId !== 7 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Operational Response</span>
                          <span className="text-lg font-black text-emerald-400">0.02ms</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Decision Confidence</span>
                          <span className="text-lg font-black text-indigo-400">98.4%</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Verification Tunnel</span>
                          <span className="text-lg font-black text-orange-400">Active</span>
                        </div>
                      </div>

                      <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-2">
                        <h4 className="font-extrabold text-white text-[11px] uppercase tracking-wider">Simulated Machine Operations Logs</h4>
                        <p className="text-slate-400 text-[11px]">
                          Automated analytical diagnostics successfully completed. The data indices sync continuously using ledger block seals.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Page Specific Settings & Real-Time Discussion */}
                <div className="space-y-4">
                  
                  {/* Page Settings Widget */}
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3.5">
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Settings size={14} className="text-indigo-400" /> Module Controls
                    </h4>
                    <div className="space-y-2.5">
                      {Object.keys(pageSettings).map(settKey => (
                        <label key={settKey} className="flex items-center justify-between text-slate-300 font-bold uppercase text-[9px] tracking-wider cursor-pointer">
                          <span>{settKey.replace(/([A-Z])/g, ' $1')}</span>
                          <input
                            type="checkbox"
                            checked={pageSettings[settKey]}
                            onChange={() => setPageSettings(p => ({ ...p, [settKey]: !p[settKey] }))}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Collaborative Discussion Column */}
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3.5">
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-indigo-400" /> Shared Annotations
                    </h4>
                    
                    {/* Comments list */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(pageComments[activePageId] || [
                        { author: "Hassan Alamin (HR Admin)", text: "Verified. Core telemetry parameters appear secure.", time: "2h ago" }
                      ]).map((comment, cIdx) => (
                        <div key={cIdx} className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-0.5">
                          <div className="flex justify-between text-[9px] font-black text-orange-400">
                            <span>{comment.author}</span>
                            <span className="text-slate-500 font-medium">{comment.time}</span>
                          </div>
                          <p className="text-slate-300 text-[10px] leading-snug">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={addComment} className="flex gap-1.5 mt-2">
                      <input
                        type="text"
                        placeholder="Add annotation..."
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-[10px] focus:outline-none focus:border-indigo-500 text-indigo-200"
                      />
                      <button type="submit" className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500">
                        <Send size={11} />
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <NotificationCenter 
        isOpen={isNotifCenterOpen} 
        onClose={() => setIsNotifCenterOpen(false)} 
        role="candidate" 
      />

    </div>
  );
};
