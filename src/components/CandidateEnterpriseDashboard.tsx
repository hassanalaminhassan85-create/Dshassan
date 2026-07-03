import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  // Navigation & Icons
  LayoutGrid, Compass, Cpu, Video, ShieldCheck, UserCheck, BarChart3, LineChart,
  Mic, Search, Bookmark, History, Sparkles, LogOut, CheckCircle2, ChevronRight,
  ChevronDown, Settings, Bell, Share2, Download, MessageSquare, AlertCircle,
  TrendingUp, Wallet, Shield, Users, HelpCircle, Activity, Globe, Send, Play,
  Smartphone, Eye, Award, Lock, FileText, Ban, Trash2, Edit3, Fingerprint, RefreshCw,
  Heart, Zap, Star, Menu, X, Sun, Moon, Clock, Key, Copy
} from 'lucide-react';
import { useFCM } from '../hooks/useFCM';
import { CandidateEnterpriseSettings } from './CandidateEnterpriseSettings';
import { useNotifications } from './NotificationProvider';
import { NotificationCenter } from './NotificationCenter';
import { startRegistration } from '@simplewebauthn/browser';
import { apiSaveFcmToken } from '../lib/api';

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
  { id: 26, title: "Comprehensive Settings Console", category: "specialized", icon: Settings, description: "12 major settings categories, backup & restore, global search, and audit logging.", tags: ["settings", "admin", "config"] },
  { id: 27, title: "Push Notifications & PWA Diagnostics", category: "specialized", icon: Bell, description: "Verify real-time system notifications, register device token, and test active foreground/background push overlays.", tags: ["fcm", "notifications", "pwa", "diagnostics"] }
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
  const { token: fcmToken, permission: fcmPermission, loading: fcmLoading, error: fcmError, requestPermissionAndGetToken } = useFCM();
  const [customVapidKey, setCustomVapidKey] = useState<string>('');
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [isTestingNotification, setIsTestingNotification] = useState<boolean>(false);
  const [testNotificationCountdown, setTestNotificationCountdown] = useState<number>(0);

  const { unreadCount, registerUser } = useNotifications();

  // Automatically register device FCM token with backend
  useEffect(() => {
    if (fcmToken) {
      apiSaveFcmToken({
        userId: currentUser?.email || 'anonymous',
        fcmToken: fcmToken,
        deviceName: navigator.userAgent.split(' ')[0] || 'Web Browser',
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
      }).then(() => {
        console.log('Device FCM token successfully registered on backend:', fcmToken);
      }).catch((err) => {
        console.error('Failed to auto-register device FCM token on backend:', err);
      });
    }
  }, [fcmToken, currentUser]);

  // Fetch and auto-set saved FCM VAPID key
  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (res.ok) return res.json();
        return {};
      })
      .then((settings: any) => {
        if (settings.fcm_vapid_key) {
          setCustomVapidKey(settings.fcm_vapid_key);
          console.log('[CandidateEnterpriseDashboard] Loaded saved FCM VAPID key from backend settings:', settings.fcm_vapid_key);
        }
      })
      .catch(err => {
        console.warn('Failed to load settings in CandidateEnterpriseDashboard:', err);
      });
  }, []);
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

  // Interactive page states
  // Page 6: Personality & Culture Fit states
  const [cultureAnswers, setCultureAnswers] = useState<Record<string, number>>({
    openness: 8,
    conscientiousness: 7,
    extraversion: 6,
    agreeableness: 8,
    stability: 7
  });
  const [cultureMatchScore, setCultureMatchScore] = useState<number | null>(null);
  const [mbtiType, setMbtiType] = useState<string>('INTJ');

  // Page 7: Market Intelligence states
  const [marketExpYears, setMarketExpYears] = useState<number>(3);
  const [remoteRatio, setRemoteRatio] = useState<number>(80);
  const [marketRoleSel, setMarketRoleSel] = useState<string>('AI Integrations Engineer');

  // Page 9: Voice Assistant states
  const [simulatedVoiceText, setSimulatedVoiceText] = useState<string>('');
  const [voiceAuditResult, setVoiceAuditResult] = useState<any | null>(null);
  const [isVoiceAuditing, setIsVoiceAuditing] = useState<boolean>(false);

  // Page 11: Job Hunting Agent states
  const [jobAgentTargetSalary, setJobAgentTargetSalary] = useState<number>(145000);
  const [jobAgentStack, setJobAgentStack] = useState<string>('React, Node, Cloudflare D1');
  const [jobAgentActive, setJobAgentActive] = useState<boolean>(false);
  const [jobAgentLogs, setJobAgentLogs] = useState<string[]>([
    "AGENT_SYS: Idle. Configure parameters and click 'Start Agent'"
  ]);

  // Page 14: Salary Negotiation states
  const [negoBaseOffer, setNegoBaseOffer] = useState<number>(120000);
  const [negoEquityOffer, setNegoEquityOffer] = useState<number>(15000);
  const [negoBonusOffer, setNegoBonusOffer] = useState<number>(10000);
  const [negoTone, setNegoTone] = useState<string>('Collaborative');
  const [negoScript, setNegoScript] = useState<string>('');

  // Page 15: Portfolio SEO states
  const [portfolioBioText, setPortfolioBioText] = useState<string>('I am a passionate software engineer specializing in backend systems, database performance, and building modern web applications with React.');
  const [seoScore, setSeoScore] = useState<any | null>(null);

  // Page 21: Advanced Threat Detection states
  const [suspiciousJobOffer, setSuspiciousJobOffer] = useState<string>('We require you to send $250 for training materials and download Telegram for immediate onboarding. Earn $80 per hour with no experience necessary.');
  const [threatAnalysis, setThreatAnalysis] = useState<any | null>(null);

  // Page 6 action: MBTI & Big Five calculation
  const runCultureMatch = () => {
    const avg = (cultureAnswers.openness + cultureAnswers.conscientiousness + cultureAnswers.extraversion + cultureAnswers.agreeableness + cultureAnswers.stability) / 5;
    // Calculate a score based on answers & MBTI compatibility
    let mbtiBonus = mbtiType === 'INTJ' || mbtiType === 'ENTJ' || mbtiType === 'ENFP' ? 12 : 5;
    const finalScore = Math.min(100, Math.round((avg * 10) + mbtiBonus));
    setCultureMatchScore(finalScore);
  };

  // Page 9 action: Simulate Accent & Sentiment Audit
  const runVoiceAudit = () => {
    setIsVoiceAuditing(true);
    setTimeout(() => {
      setIsVoiceAuditing(false);
      setVoiceAuditResult({
        pacing: "135 words per minute (Optimal)",
        stress: "12% (Exceptionally Low)",
        empathy: "94% (Highly Collaborative)",
        accentMatching: "98.2% DS Tech Corporate Benchmark matched"
      });
    }, 1200);
  };

  // Page 11 action: Toggle job agent
  useEffect(() => {
    let agentTimer: any;
    if (jobAgentActive) {
      agentTimer = setInterval(() => {
        const mockLogLines = [
          `[Agent] Querying tech roles matching '${jobAgentStack}'...`,
          `[Agent] Found vacancy matching target salary >$${(jobAgentTargetSalary/1000).toFixed(0)}K/yr!`,
          `[Agent] Customizing SEO keywords on applicant resume profile...`,
          `[Agent] Submitted application package to DS Tech & Digital Agency partner database.`,
          `[Agent] Scheduled screening chat simulation with recruiter bot.`
        ];
        const randomLine = mockLogLines[Math.floor(Math.random() * mockLogLines.length)];
        setJobAgentLogs(prev => [`[${new Date().toLocaleTimeString()}] ${randomLine}`, ...prev.slice(0, 10)]);
      }, 3000);
    }
    return () => clearInterval(agentTimer);
  }, [jobAgentActive, jobAgentStack, jobAgentTargetSalary]);

  // Page 14 action: Generate scripts
  const runNegotiationAI = () => {
    const counterBase = Math.round(negoBaseOffer * 1.15);
    const counterEquity = Math.round(negoEquityOffer * 1.25);
    const scriptTemplates: Record<string, string> = {
      Collaborative: `Dear Recruitment Team,\n\nI am thrilled about the opportunity to join as a ${marketRoleSel}! I am very excited about your mission. Based on my advanced skillset and current market data showing heavy demand (+34.2%), I was hoping we could explore a starting base salary of $${counterBase.toLocaleString()} alongside $${counterEquity.toLocaleString()} in equity. I believe this better aligns with the value I will deliver from day one at the agency. Looking forward to your thoughts!\n\nBest regards,\n[Your Name]`,
      Bold: `Hi Team,\n\nThank you for the competitive offer! I am highly motivated to join and immediately scale the Cloudflare D1 nodes. Given my unique specialized expertise, I would like to lock this in. If we can adjust the base compensation to $${counterBase.toLocaleString()} and bonus structure to $${(negoBonusOffer * 1.2).toLocaleString()}, I am ready to sign the contract immediately and begin onboarding next week!\n\nSincerely,\n[Your Name]`,
      Direct: `Hello,\n\nI appreciate this package of starting compensation. To move forward with the appointment, my target base salary is $${counterBase.toLocaleString()}. If this adjustment fits within your departmental budget, please update the written agreement and I will return it signed.\n\nBest,\n[Your Name]`
    };
    setNegoScript(scriptTemplates[negoTone] || scriptTemplates.Collaborative);
  };

  // Page 15 action: SEO analysis
  const runSeoAnalysis = () => {
    const wordCount = portfolioBioText.split(/\s+/).filter(Boolean).length;
    const suggestions = [];
    let scoreVal = 65;

    if (portfolioBioText.toLowerCase().includes('cloudflare') || portfolioBioText.toLowerCase().includes('d1') || portfolioBioText.toLowerCase().includes('database')) {
      scoreVal += 15;
    } else {
      suggestions.push("Add Cloudflare D1 Node SQL references to boost agency score.");
    }

    if (portfolioBioText.toLowerCase().includes('react') || portfolioBioText.toLowerCase().includes('typescript')) {
      scoreVal += 15;
    } else {
      suggestions.push("Integrate React / TypeScript keywords.");
    }

    if (wordCount < 20) {
      scoreVal -= 15;
      suggestions.push("Increase bio length to at least 30 words.");
    }

    setSeoScore({
      score: Math.min(100, scoreVal),
      keywordsCount: wordCount,
      suggestions: suggestions.length > 0 ? suggestions : ["Your portfolio bio SEO is perfectly optimized for DS Tech!"]
    });
  };

  // Page 21 action: Threat check
  const runThreatCheck = () => {
    let score = 5;
    const flags = [];

    if (suspiciousJobOffer.toLowerCase().includes('telegram') || suspiciousJobOffer.toLowerCase().includes('whatsapp')) {
      score += 35;
      flags.push("Requires communication on non-standard chat channels (Telegram/WhatsApp).");
    }

    if (suspiciousJobOffer.includes('$') && (suspiciousJobOffer.toLowerCase().includes('send') || suspiciousJobOffer.toLowerCase().includes('fee') || suspiciousJobOffer.toLowerCase().includes('materials'))) {
      score += 45;
      flags.push("Upfront payment required for training materials or hardware.");
    }

    if (suspiciousJobOffer.toLowerCase().includes('no experience') && (suspiciousJobOffer.toLowerCase().includes('$80') || suspiciousJobOffer.toLowerCase().includes('$100'))) {
      score += 15;
      flags.push("Unrealistic compensation relative to the experience required.");
    }

    setThreatAnalysis({
      score: Math.min(100, score),
      flags: flags.length > 0 ? flags : ["No critical threat signatures identified in this posting."]
    });
  };

  // Device WebAuthn states
  const [isRegisteringDevice, setIsRegisteringDevice] = useState<boolean>(false);
  const [deviceRegStatus, setDeviceRegStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [registeredKeys, setRegisteredKeys] = useState<any[]>([]);
  const [isKeysLoading, setIsKeysLoading] = useState<boolean>(false);
  const [biometricLogs, setBiometricLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);

  const fetchRegisteredKeys = async () => {
    if (!currentUser?.id) return;
    setIsKeysLoading(true);
    try {
      const res = await fetch(`/api/auth/passkeys?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setRegisteredKeys(data);
      }
    } catch (e) {
      console.error("Failed to load registered keys from D1:", e);
    } finally {
      setIsKeysLoading(false);
    }
  };

  const fetchBiometricLogs = async () => {
    if (!currentUser?.id) return;
    setIsLogsLoading(true);
    try {
      const res = await fetch(`/api/auth/biometric-logs?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setBiometricLogs(data);
      }
    } catch (e) {
      console.error("Failed to load biometric logs from D1:", e);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchRegisteredKeys();
      fetchBiometricLogs();
    }
  }, [currentUser]);

  const handleRegisterDeviceWebAuthn = async () => {
    if (!currentUser?.id || !currentUser?.email) return;
    setIsRegisteringDevice(true);
    setDeviceRegStatus(null);
    try {
      // 1. Get options from server
      const optionsRes = await fetch(`/api/auth/register-options?userId=${currentUser.id}&username=${encodeURIComponent(currentUser.email)}`);
      if (!optionsRes.ok) {
        throw new Error("Could not retrieve registration options from security server.");
      }
      const options = await optionsRes.json();

      // Enforce rp.id to be alihsan.online as requested
      options.rp.id = 'alihsan.online';

      // 2. Trigger native navigator.credentials.create
      const isSecuredContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isDomainMatching = window.location.hostname === 'alihsan.online' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (!isSecuredContext || !isDomainMatching) {
        throw {
          name: 'SecurityError',
          message: `RP ID Domain Mismatch: WebAuthn requires origin matching rpId 'alihsan.online' and secure HTTPS protocol. Current domain is '${window.location.hostname}'`
        };
      }

      const regResp = await startRegistration(options);

      // 3. Send response to backend for verification and D1 persistence
      const verifyRes = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, response: regResp })
      });

      if (!verifyRes.ok) {
        throw new Error("WebAuthn security server validation failed.");
      }

      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        setDeviceRegStatus({
          type: 'success',
          message: `Device successfully registered on the alihsan.online ledger! Public Key credential successfully stored in the D1 database.`
        });
        fetchRegisteredKeys();
      } else {
        throw new Error(verifyData.error || "WebAuthn signature validation failed.");
      }

    } catch (err: any) {
      console.warn("Device WebAuthn registration issue:", err);
      
      let errMsg = err.message || "WebAuthn cryptographic verification failed.";
      if (err.name === 'SecurityError' || (err.message && err.message.includes('RP ID Domain Mismatch'))) {
        errMsg = `WebAuthn Security Restriction: Relying Party ID 'alihsan.online' is strictly locked to domain 'alihsan.online' with HTTPS. Current host is '${window.location.hostname}'.`;
      }

      setDeviceRegStatus({
        type: 'error',
        message: `${errMsg} To complete credential storage in D1 for preview/development testing, click "Sandbox Bypass Registration" below.`
      });
    } finally {
      setIsRegisteringDevice(false);
    }
  };

  const handleSimulatedRegisterDevice = async () => {
    if (!currentUser?.id || !currentUser?.email) return;
    setIsRegisteringDevice(true);
    setDeviceRegStatus(null);
    try {
      const verifyRes = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          isSimulation: true
        })
      });

      if (!verifyRes.ok) {
        throw new Error("Simulated verification failed.");
      }

      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        setDeviceRegStatus({
          type: 'success',
          message: `Simulated FIDO2 Passkey successfully registered! Device hardware public key credential successfully generated and stored in the D1 database.`
        });
        fetchRegisteredKeys();
      } else {
        throw new Error("Signature verification failed.");
      }
    } catch (e: any) {
      setDeviceRegStatus({
        type: 'error',
        message: e.message || "Simulated registration failed."
      });
    } finally {
      setIsRegisteringDevice(false);
    }
  };
  
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
  const [homeWidgets, setHomeWidgets] = useState<string[]>(['stats', 'roadmap', 'probability', 'biometrics', 'activity']);

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
      
      {/* MOBILE STICKY TOP BAR */}
      <header className={`md:hidden sticky top-0 z-40 w-full flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-lg shadow-md shrink-0">
              <Sparkles size={12} className="text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-[11px] tracking-tight block uppercase bg-gradient-to-r from-orange-500 to-indigo-500 bg-clip-text text-transparent">DS TECH HUB</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-orange-400' : 'border-slate-200 hover:bg-slate-100 text-indigo-500'}`}
          >
            {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
          </button>
          <button
            onClick={() => setIsNotifCenterOpen(true)}
            className={`p-2 rounded-xl border relative transition-all ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
          >
            <Bell size={12} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* MOBILE NAV DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`md:hidden fixed inset-y-0 left-0 w-72 z-50 border-r flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl`}
            >
              {/* Drawer Header */}
              <div className="p-4 border-b flex flex-col gap-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-xl shadow-md">
                      <Sparkles size={14} className="text-white animate-pulse" />
                    </div>
                    <div>
                      <h2 className="font-black text-xs tracking-wider uppercase bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">DS TECH HUB</h2>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">DS Tech & Digital Agency</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`p-1.5 rounded-lg border transition-all ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'}`}
                  >
                    <X size={14} />
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
                    className={`w-full pl-9 pr-3 py-2 border rounded-xl text-[11px] focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950/40 border-slate-800 text-indigo-200 focus:border-indigo-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>

              {/* Drawer Navigation items */}
              <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
                {/* Favorites/Bookmarks Widget */}
                {favorites.length > 0 && (
                  <div className="space-y-1">
                    <span className="px-2.5 text-[8px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1">
                      <Star size={10} className="fill-orange-400 text-orange-400" /> Bookmarks
                    </span>
                    <div className={`grid grid-cols-2 gap-1.5 p-1.5 border rounded-2xl ${isDarkMode ? 'bg-slate-950/20 border-slate-800/80' : 'bg-slate-100/50 border-slate-200'}`}>
                      {favorites.map(fId => {
                        const pg = DASHBOARD_PAGES.find(p => p.id === fId);
                        if (!pg) return null;
                        const PgIcon = pg.icon;
                        return (
                          <button
                            key={fId}
                            onClick={() => navigateToPage(fId)}
                            className={`p-2 rounded-xl text-left flex items-center gap-1.5 transition-all text-[10px] truncate ${activePageId === fId ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
                          >
                            <PgIcon size={11} className="shrink-0" />
                            <span className="truncate">{pg.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Category Lists */}
                {(['core', 'intelligence', 'operations', 'risk', 'specialized'] as const).map(cat => {
                  const catPages = filteredPages.filter(p => p.category === cat);
                  if (catPages.length === 0) return null;
                  
                  const isExpanded = expandedCategory === cat;
                  const catInfo = {
                    core: { label: '1. Core Systems', icon: Compass, color: 'text-indigo-500' },
                    intelligence: { label: '2. Insights & AI', icon: Cpu, color: 'text-amber-500' },
                    operations: { label: '3. Autonomous Ops', icon: Zap, color: 'text-emerald-500' },
                    risk: { label: '4. Predictive Risks', icon: AlertCircle, color: 'text-rose-500' },
                    specialized: { label: '5. Future & Security', icon: Shield, color: 'text-orange-500' }
                  }[cat];

                  const CatIcon = catInfo.icon;

                  return (
                    <div key={cat} className={`space-y-1 rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/35 border-slate-200'}`}>
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all select-none ${
                          isExpanded 
                            ? 'bg-indigo-600/10 text-indigo-900 dark:text-indigo-200 font-extrabold border-b border-slate-200 dark:border-slate-800/60' 
                            : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-400 hover:text-indigo-950 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CatIcon size={13} className={`${catInfo.color} shrink-0`} />
                          <span className="truncate text-[10px] font-black uppercase tracking-wider">{catInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${isDarkMode ? 'bg-slate-850 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                            {catPages.length}
                          </span>
                          {isExpanded ? <ChevronDown size={11} className="text-slate-400" /> : <ChevronRight size={11} className="text-slate-400" />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
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
                                        ? 'bg-indigo-600 text-white font-extrabold shadow-md' 
                                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <PageIcon size={12} className={`shrink-0 ${isPageActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                                      <span className="truncate text-[10px] font-medium">{page.title}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => toggleFavorite(page.id, e)}
                                      className="opacity-40 group-hover:opacity-100 hover:scale-110 p-0.5 rounded transition-all"
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

              {/* Drawer Logs Footer */}
              <div className={`p-3 border-t ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-100'}`}>
                <div className="flex items-center justify-between mb-1 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live D1 Tunnel
                  </span>
                  <Activity size={10} />
                </div>
                <div className="bg-black/40 rounded-xl p-2 font-mono text-[8px] text-emerald-400 h-16 overflow-y-auto space-y-1">
                  {wsLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="truncate select-none">{log}</div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR NAVIGATION - PERSISTENT ON DESKTOP */}
      <aside id="dashboard-sidebar" className={`hidden md:flex md:w-80 shrink-0 border-r ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex-col justify-between md:sticky md:top-0 md:h-screen z-40 transition-colors duration-300`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b flex flex-col gap-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-xl shadow-md">
                <Sparkles size={16} className="text-white animate-pulse" />
              </div>
              <div>
                <h2 className="font-black text-xs tracking-wider uppercase bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">DS TECH HUB</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">DS Tech & Digital Agency</p>
              </div>
            </div>
          </div>

          {/* Global Search across all pages */}
          <div className="relative mt-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 25 specialized pages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 border rounded-xl text-[11px] focus:outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-950/40 border-slate-800 text-indigo-200 focus:border-indigo-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600'
              }`}
            />
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          
          {/* Favorites/Bookmarks Widget */}
          {favorites.length > 0 && (
            <div className="space-y-1">
              <span className="px-2.5 text-[8px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1">
                <Star size={10} className="fill-orange-400 text-orange-400" /> Bookmarks
              </span>
              <div className={`grid grid-cols-2 gap-1.5 p-1.5 border rounded-2xl ${isDarkMode ? 'bg-slate-950/20 border-slate-800/80' : 'bg-slate-100/50 border-slate-200'}`}>
                {favorites.map(fId => {
                  const pg = DASHBOARD_PAGES.find(p => p.id === fId);
                  if (!pg) return null;
                  const PgIcon = pg.icon;
                  return (
                    <button
                      key={fId}
                      onClick={() => navigateToPage(fId)}
                      className={`p-2 rounded-xl text-left flex items-center gap-1.5 transition-all text-[10px] truncate ${activePageId === fId ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
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
            const catInfo = {
              core: { label: '1. Core Systems', icon: Compass, color: 'text-indigo-500' },
              intelligence: { label: '2. Insights & AI', icon: Cpu, color: 'text-amber-500' },
              operations: { label: '3. Autonomous Ops', icon: Zap, color: 'text-emerald-500' },
              risk: { label: '4. Predictive Risks', icon: AlertCircle, color: 'text-rose-500' },
              specialized: { label: '5. Future & Security', icon: Shield, color: 'text-orange-500' }
            }[cat];

            const CatIcon = catInfo.icon;

            return (
              <div key={cat} className={`space-y-1 border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/35 border-slate-200'}`}>
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition-all select-none ${
                    isExpanded 
                      ? 'bg-indigo-600/10 text-indigo-900 dark:text-indigo-200 font-extrabold border-b border-slate-200 dark:border-slate-800/60' 
                      : 'hover:bg-slate-250 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-400 hover:text-indigo-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CatIcon size={13} className={`${catInfo.color} shrink-0`} />
                    <span className="truncate text-[10px] font-black uppercase tracking-wider">{catInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${isDarkMode ? 'bg-slate-850 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
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
                                  ? 'bg-indigo-600 text-white font-extrabold shadow-md' 
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
        <div className={`p-3 border-t ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-100'}`}>
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
                  if (widget === 'biometrics') {
                    const isLinked = registeredKeys.length > 0;
                    return (
                      <div key="biometrics" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3 col-span-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Security Hardware Lock</span>
                          <button onClick={() => navigateToPage(24)} className="text-[9px] text-indigo-400 hover:underline">Manage</button>
                        </div>
                        <div className="flex items-center gap-2.5 py-1">
                          <div className={`p-2 rounded-xl ${isLinked ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
                            <Fingerprint size={18} className={isLinked ? 'text-emerald-400 animate-pulse' : 'text-orange-400'} />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-white block">
                              {isLinked ? 'DEVICE REGISTERED' : 'UNLINKED FALLBACK'}
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              {isLinked ? `${registeredKeys.length} active public keys` : 'Visual bypass enabled'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigateToPage(24)}
                          className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-extrabold uppercase tracking-wider text-slate-300 rounded-lg border border-white/5 transition-all text-center cursor-pointer"
                        >
                          Configure WebAuthn Key
                        </button>
                      </div>
                    );
                  }
                  if (widget === 'activity') {
                    return (
                      <div key="activity" className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3 col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Real-Time Security Audit</span>
                          <button onClick={() => navigateToPage(24)} className="text-[9px] text-indigo-400 hover:underline">Full Log</button>
                        </div>
                        {isLogsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw size={12} className="text-slate-500 animate-spin" />
                          </div>
                        ) : biometricLogs.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic py-2">No security transactions found on D1 ledger node.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-[85px] overflow-y-auto">
                            {biometricLogs.slice(0, 2).map((log, lIdx) => (
                              <div key={lIdx} className="p-2 bg-black/30 rounded-lg border border-white/5 flex justify-between items-center text-[9px]">
                                <div className="space-y-0.5">
                                  <span className={`font-bold ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {log.status.toUpperCase()}
                                  </span>
                                  <p className="text-slate-400 text-[8px] truncate max-w-[160px]">{log.message}</p>
                                </div>
                                <span className="text-[8px] text-slate-500">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            ))}
                          </div>
                        )}
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

          {/* PAGE 27: PUSH NOTIFICATIONS & PWA DIAGNOSTICS */}
          {activePageId === 27 && (
            <div className="space-y-6 animate-fade-in text-left text-xs">
              {/* Header Status Bar */}
              <div className="bg-gradient-to-r from-[#000E32] to-indigo-950 p-6 rounded-3xl border border-blue-900/30 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full filter blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                        Firebase Cloud Messaging (FCM) Integration Node
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold uppercase tracking-wide flex items-center gap-2">
                      <Bell size={20} className="text-orange-500 animate-bounce" />
                      <span>Push Notifications & PWA Diagnostics</span>
                    </h3>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      This diagnostic hub verifies native pop-up/push banner compliance on your mobile smartphone or desktop browser. Ensure you never miss live recruitment offers, interview schedules, or credential updates from Al Ihsan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Action Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* FCM Token Generation Card */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Zap size={16} className="text-amber-400" />
                    <h4 className="font-extrabold text-xs uppercase text-slate-200">Device Token Registration</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-slate-400">Notification Permission:</span>
                      <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                        fcmPermission === 'granted' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' 
                          : fcmPermission === 'denied' 
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' 
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}>
                        {fcmPermission}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 block font-bold">Your Device's Secure FCM Token:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={fcmLoading ? 'Resolving token...' : fcmToken || 'No token generated yet. Tap Register below.'}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-[10px] text-slate-300 focus:outline-none"
                        />
                        {fcmToken && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(fcmToken);
                              setCopiedTextId('fcm_token');
                              setTimeout(() => setCopiedTextId(null), 2000);
                            }}
                            className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl border border-white/5 transition"
                            title="Copy FCM Token"
                          >
                            {copiedTextId === 'fcm_token' ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        )}
                      </div>
                      {fcmError && (
                        <p className="text-[10px] text-rose-400 mt-1 font-mono">⚠️ Error: {fcmError}</p>
                      )}
                    </div>

                    <button
                      onClick={requestPermissionAndGetToken}
                      disabled={fcmLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold uppercase rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15 cursor-pointer"
                    >
                      {fcmLoading ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Generating Secure Token...</span>
                        </>
                      ) : (
                        <>
                          <Key size={13} />
                          <span>Generate Device FCM Token</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Local Push Test Card */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                    <h4 className="font-extrabold text-xs uppercase text-slate-200">Local System Pop-up Banner Test</h4>
                  </div>

                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Validate whether native system banners can pop up over your lock screen or home screen. Tap the button below, then <strong className="text-orange-400">immediately lock your phone or go to your home screen</strong>. A test notification will fire in exactly 3 seconds!
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (fcmPermission !== 'granted') {
                          Notification.requestPermission().then((perm) => {
                            if (perm !== 'granted') {
                              alert("Please grant notification permission when prompted to test native pop-ups.");
                            } else {
                              alert("Permission granted! Now tap the button again to trigger the test notification.");
                              window.location.reload();
                            }
                          });
                          return;
                        }

                        setIsTestingNotification(true);
                        setTestNotificationCountdown(3);

                        let currentCount = 3;
                        const intervalId = setInterval(() => {
                          currentCount -= 1;
                          setTestNotificationCountdown(currentCount);
                          if (currentCount <= 0) {
                            clearInterval(intervalId);
                          }
                        }, 1000);

                        setTimeout(async () => {
                          try {
                            const title = "Al Ihsan Online • Push Active! 🌟";
                            const options = {
                              body: "Test Successful! Your mobile device is fully configured to receive push notification banners from Al Ihsan.",
                              icon: "https://alihsan.online/logo.png",
                              badge: "https://alihsan.online/logo.png",
                              vibrate: [200, 100, 200],
                              tag: "fcm-test-pop-direct",
                              renotify: true,
                              requireInteraction: true
                            };

                            if ('serviceWorker' in navigator) {
                              const registration = await navigator.serviceWorker.ready;
                              await registration.showNotification(title, options);
                            } else {
                              new Notification(title, options);
                            }
                          } catch (err) {
                            console.error("Local notification error:", err);
                          } finally {
                            setIsTestingNotification(false);
                            setTestNotificationCountdown(0);
                          }
                        }, 3000);
                      }}
                      disabled={isTestingNotification}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer"
                    >
                      {isTestingNotification ? (
                        <>
                          <Clock size={13} className="animate-spin" />
                          <span>Triggering in {testNotificationCountdown}s... LOCK NOW!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Trigger 3s Delayed System Pop-up</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Requirements & Installation Section */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Smartphone size={16} className="text-indigo-400" />
                  <h4 className="font-extrabold text-xs uppercase text-slate-200">📱 Mobile Operating System PWA Requirements</h4>
                </div>

                <p className="text-slate-400 leading-relaxed text-[11px]">
                  iOS and Android operating systems enforce strict sandboxing. To receive system-level push notification banners (even when the app or Safari is closed), you <strong className="text-orange-400">must install Al Ihsan on your device's Home Screen</strong>. Follow these instructions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="font-black text-[10px] text-amber-500 uppercase block">🍏 Apple iOS (iPhone & iPad)</span>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[10.5px] leading-relaxed">
                      <li>Open the direct app link in the native <strong className="text-white">Safari</strong> browser.</li>
                      <li>Tap the <strong className="text-white">Share</strong> icon on Safari's bottom toolbar.</li>
                      <li>Scroll down and select <strong className="text-white">"Add to Home Screen"</strong>.</li>
                      <li>Launch the newly installed <strong className="text-white">Al Ihsan</strong> icon from your iPhone home screen.</li>
                      <li>Open this diagnostics tab inside the app and tap <strong className="text-white">"Generate Device FCM Token"</strong> to grant notification authority.</li>
                    </ol>
                  </div>

                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="font-black text-[10px] text-emerald-400 uppercase block">🤖 Google Android</span>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[10.5px] leading-relaxed">
                      <li>Open the direct app link in <strong className="text-white">Google Chrome</strong> browser.</li>
                      <li>Tap the <strong className="text-white">Menu (3-dots)</strong> button in the top-right corner.</li>
                      <li>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
                      <li>Launch the installed application from your phone's launcher.</li>
                      <li>Open this diagnostics tab inside the app and tap <strong className="text-white">"Generate Device FCM Token"</strong> to grant notification authority.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK PANEL RENDER FOR ALL OTHER 20 DYNAMIC PAGES */}
          {activePageId > 5 && activePageId !== 26 && activePageId !== 27 && (
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
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Big Five personality metrics and compatible MBTI pairing tool for DS Tech company culture integration.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Interactive Sliders */}
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Big Five Traits (Self-Rating)</h4>
                          {Object.keys(cultureAnswers).map(trait => (
                            <div key={trait} className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400">
                                <span className="capitalize">{trait}</span>
                                <span className="text-indigo-400 font-bold">{cultureAnswers[trait]}/10</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={cultureAnswers[trait]}
                                onChange={(e) => setCultureAnswers({ ...cultureAnswers, [trait]: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>
                          ))}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase">MBTI Typology Match</span>
                            <select
                              value={mbtiType}
                              onChange={(e) => setMbtiType(e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-855 rounded text-xs text-white"
                            >
                              {['INTJ', 'ENTJ', 'INFJ', 'ENFP', 'INFP', 'INTP', 'ISTJ', 'ESTP'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={runCultureMatch}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Evaluate Culture Compatibility
                          </button>
                        </div>

                        {/* Outcomes & radar chart */}
                        <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                          <div className="text-center py-6 space-y-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DS Tech Agency Cultural Fit</span>
                            <div className="text-4xl font-black text-orange-400 animate-pulse">
                              {cultureMatchScore !== null ? `${cultureMatchScore}%` : '--'}
                            </div>
                            <p className="text-[10px] text-slate-300 italic px-2 leading-relaxed">
                              {cultureMatchScore !== null 
                                ? (cultureMatchScore >= 80 
                                  ? "Excellent. You align closely with our collaborative, engineering-first culture!" 
                                  : "Good alignment. Recommended areas of focus: remote teamwork synchronization.")
                                : "Click 'Evaluate' to run real-time agency cultural fit analysis."}
                            </p>
                          </div>

                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={personalityData}>
                                <XAxis dataKey="trait" stroke="#94a3b8" fontSize={8} />
                                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePageId === 7 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Projected salary ranges based on global candidate indices, remote adjustments, and live DS Tech engineering requirements.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Interactive Sliders */}
                        <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Candidate Experience (Years)</span>
                              <span className="text-indigo-400 font-bold">{marketExpYears} yrs</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="15"
                              value={marketExpYears}
                              onChange={(e) => setMarketExpYears(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Remote Working Ratio Target</span>
                              <span className="text-indigo-400 font-bold">{remoteRatio}% Remote</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="10"
                              value={remoteRatio}
                              onChange={(e) => setRemoteRatio(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase">Target Digital Role</span>
                            <select
                              value={marketRoleSel}
                              onChange={(e) => setMarketRoleSel(e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-855 rounded text-xs text-white"
                            >
                              {['AI Integrations Engineer', 'React Frontend Specialist', 'Full Stack Node Engineer', 'Cloud Architect'].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>

                          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-extrabold uppercase text-indigo-300">Live DS Tech Vacancy</span>
                              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black uppercase rounded">Hot</span>
                            </div>
                            <p className="text-[10px] text-white font-extrabold mt-1">Senior {marketRoleSel} Role</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Budget: $135K - $160K base compensation.</span>
                          </div>
                        </div>

                        {/* Chart range outcome */}
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                          <div className="text-center py-4">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Projected Total Target Compensation</span>
                            <div className="text-3xl font-black text-emerald-400 mt-1">
                              ${Math.round(95000 + (marketExpYears * 6500) + (remoteRatio * 200)).toLocaleString()} / yr
                            </div>
                            <span className="text-[9px] text-slate-500 block">Based on live index benchmarks inside Cloudflare D1 nodes.</span>
                          </div>

                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={marketSalaryData}>
                                <Area type="monotone" dataKey="Remote" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                                <Area type="monotone" dataKey="Hybrid" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePageId === 9 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Interactive simulated accent coaching and audio feedback module for DS Tech client-facing operations.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Simulate Voice/Speech Audit</h4>
                          <textarea
                            placeholder="Enter speech script or click 'Run simulated speech audit' to parse default transcript..."
                            value={simulatedVoiceText}
                            onChange={(e) => setSimulatedVoiceText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 bg-slate-900 border border-slate-855 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={runVoiceAudit}
                            disabled={isVoiceAuditing}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isVoiceAuditing ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" /> Analyzing voice frequencies...
                              </>
                            ) : (
                              <>
                                <Mic size={12} /> Run Speech & Accent Audit
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Auditory Diagnosis Output</h4>
                          {voiceAuditResult ? (
                            <div className="space-y-2 font-mono text-[10px] text-indigo-300">
                              <div className="flex justify-between border-b border-white/5 pb-1">
                                <span>Pacing Rating:</span>
                                <span className="text-white font-bold">{voiceAuditResult.pacing}</span>
                              </div>
                              <div className="flex justify-between border-b border-white/5 pb-1">
                                <span>Laryngeal Stress:</span>
                                <span className="text-emerald-400 font-bold">{voiceAuditResult.stress}</span>
                              </div>
                              <div className="flex justify-between border-b border-white/5 pb-1">
                                <span>Empathy Rating:</span>
                                <span className="text-emerald-400 font-bold">{voiceAuditResult.empathy}</span>
                              </div>
                              <div className="flex justify-between pb-1">
                                <span>Accent Match Score:</span>
                                <span className="text-orange-400 font-bold">{voiceAuditResult.accentMatching}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-center py-8 text-[10px] italic">
                              No voice diagnosis loaded. Run speech audit to see real-time laryngeal/stress telemetry.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activePageId === 11 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Configure target thresholds and watch the autonomous job agent query boards, construct custom cover letters, and log updates.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Agent Autonomous Settings</h4>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400">Target Base Salary limit ($/yr)</span>
                            <input
                              type="number"
                              value={jobAgentTargetSalary}
                              onChange={(e) => setJobAgentTargetSalary(parseInt(e.target.value) || 120000)}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-855 rounded text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400">Target Skill Stack Keywords</span>
                            <input
                              type="text"
                              value={jobAgentStack}
                              onChange={(e) => setJobAgentStack(e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-855 rounded text-xs text-white"
                            />
                          </div>

                          <button
                            onClick={() => setJobAgentActive(!jobAgentActive)}
                            className={`w-full py-2 font-black uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer ${
                              jobAgentActive 
                                ? 'bg-red-600 hover:bg-red-500 text-white' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {jobAgentActive ? 'Dormant Agent (Stop Job Hunting)' : 'Initialize Autonomous Agent'}
                          </button>
                        </div>

                        <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                            <h4 className="font-extrabold text-white text-[10px] uppercase">Agent Operational Log</h4>
                            <span className={`w-2 h-2 rounded-full ${jobAgentActive ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                          </div>
                          
                          <div className="bg-slate-955/40 p-2 border border-slate-855 rounded-xl h-28 overflow-y-auto font-mono text-[9px] text-emerald-400/90 space-y-1">
                            {jobAgentLogs.map((log, lIdx) => (
                              <div key={lIdx} className="leading-relaxed">{log}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePageId === 14 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Input compensation offer packages to generate strategic counter-offers and highly persuasive negotiation scripts.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Current Written Offer Parameters</h4>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 block">Base ($)</span>
                              <input
                                type="number"
                                value={negoBaseOffer}
                                onChange={(e) => setNegoBaseOffer(parseInt(e.target.value) || 100000)}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-855 rounded text-[10px] text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 block">Equity ($)</span>
                              <input
                                type="number"
                                value={negoEquityOffer}
                                onChange={(e) => setNegoEquityOffer(parseInt(e.target.value) || 10000)}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-855 rounded text-[10px] text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 block">Bonus ($)</span>
                              <input
                                type="number"
                                value={negoBonusOffer}
                                onChange={(e) => setNegoBonusOffer(parseInt(e.target.value) || 5000)}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-855 rounded text-[10px] text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400">Negotiation Language Tone</span>
                            <select
                              value={negoTone}
                              onChange={(e) => setNegoTone(e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-855 rounded text-xs text-white"
                            >
                              <option value="Collaborative">Collaborative & Soft-Powered</option>
                              <option value="Bold">Bold & Highly Competent</option>
                              <option value="Direct">Direct & Executive Standard</option>
                            </select>
                          </div>

                          <button
                            onClick={runNegotiationAI}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Generate Negotiation Script
                          </button>
                        </div>

                        <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Custom Negotiation Script Draft</h4>
                          {negoScript ? (
                            <div className="relative">
                              <pre className="p-2.5 bg-slate-950/60 border border-slate-855 rounded-xl h-28 overflow-y-auto font-sans text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                                {negoScript}
                              </pre>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(negoScript);
                                  alert("Script copied to clipboard!");
                                }}
                                className="absolute bottom-2 right-2 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[8px] tracking-wider rounded cursor-pointer"
                              >
                                Copy Script
                              </button>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-center py-8 text-[10px] italic">
                              Click 'Generate' to output custom negotiation emails mapped to target DS Tech ratios.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activePageId === 15 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Analyze your portfolio descriptions, bios, and LinkedIn taglines to maximize matching probability scores in local D1 repositories.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Applicant Bio/SEO Tagline Input</h4>
                          <textarea
                            value={portfolioBioText}
                            onChange={(e) => setPortfolioBioText(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 bg-slate-900 border border-slate-855 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={runSeoAnalysis}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Quantify SEO & Github Density
                          </button>
                        </div>

                        <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">SEO Audit Report</h4>
                          {seoScore ? (
                            <div className="space-y-2 text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold uppercase">Candidate Index Match:</span>
                                <span className="text-orange-400 font-black text-xs">{seoScore.score}% Optimal</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-slate-400 font-bold">Optimization Actions:</span>
                                <ul className="list-disc pl-4 space-y-1 text-[9px] text-indigo-300">
                                  {seoScore.suggestions.map((s: string, idx: number) => (
                                    <li key={idx}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-center py-8 text-[10px] italic">
                              Click 'Quantify' to run semantic SEO keyword extraction.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activePageId === 21 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Paste suspicious recruiters messages, salary posting descriptions, or onboarding terms to detect fraudulent and phishing hazards.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">suspicious message text</h4>
                          <textarea
                            value={suspiciousJobOffer}
                            onChange={(e) => setSuspiciousJobOffer(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 bg-slate-900 border border-slate-855 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={runThreatCheck}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Analyze Scam Probability
                          </button>
                        </div>

                        <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                          <h4 className="font-extrabold text-white text-[10px] uppercase">Threat signature scorecard</h4>
                          {threatAnalysis ? (
                            <div className="space-y-2 text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold uppercase">Scam Scorecard Rating:</span>
                                <span className={`font-black text-xs ${threatAnalysis.score > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {threatAnalysis.score}% Threat Potential
                                </span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-slate-400 font-bold">Identified Risk Markers:</span>
                                <ul className="list-disc pl-4 space-y-1 text-[9px] text-rose-300">
                                  {threatAnalysis.flags.map((f: string, idx: number) => (
                                    <li key={idx}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-center py-8 text-[10px] italic">
                              Click 'Analyze' to scan text against risk indices.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activePageId === 24 && (
                    <div className="space-y-6 text-left">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-3.5 items-start">
                        <Shield className="text-indigo-400 shrink-0 mt-1 animate-pulse" size={24} />
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Secure Relying Party ID Registration</h4>
                          <p className="text-[11px] leading-relaxed text-slate-300">
                            The security of <strong>alihsan.online</strong> uses asymmetric cryptographic keys stored inside your hardware TPM/Secure Enclave. This console validates and binds your physical device signatures directly into Cloudflare D1 nodes.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Action and controls */}
                        <div className="bg-black/20 rounded-2xl p-5 border border-white/5 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-black text-white text-[11px] uppercase tracking-wider">Device Registration Panel</h4>
                            <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">FIDO2 WebAuthn</span>
                          </div>

                          <p className="text-slate-400 text-[10.5px] leading-relaxed">
                            Click <strong>Register Device</strong> to generate a local cryptographic credential using the relying party ID <strong>alihsan.online</strong>.
                          </p>

                          <div className="flex flex-wrap gap-3 pt-2">
                            <button
                              onClick={handleRegisterDeviceWebAuthn}
                              disabled={isRegisteringDevice}
                              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-orange-600 hover:from-indigo-500 hover:to-orange-500 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-indigo-950"
                            >
                              {isRegisteringDevice ? (
                                <RefreshCw size={13} className="animate-spin" />
                              ) : (
                                <Fingerprint size={13} />
                              )}
                              Register Device (alihsan.online)
                            </button>

                            <button
                              onClick={handleSimulatedRegisterDevice}
                              disabled={isRegisteringDevice}
                              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 border border-white/10"
                            >
                              Sandbox Bypass Registration
                            </button>
                          </div>

                          {deviceRegStatus && (
                            <div className={`p-4 rounded-xl text-[10px] font-semibold leading-relaxed ${
                              deviceRegStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              <span className="font-black block uppercase mb-1">{deviceRegStatus.type === 'success' ? 'Success' : 'Security Advisory'}</span>
                              {deviceRegStatus.message}
                            </div>
                          )}
                        </div>

                        {/* Registered credentials listing in D1 */}
                        <div className="bg-black/20 rounded-2xl p-5 border border-white/5 space-y-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-black text-white text-[11px] uppercase tracking-wider">Active Credentials (D1 Ledger)</h4>
                              <button
                                onClick={fetchRegisteredKeys}
                                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw size={10} /> Reload
                              </button>
                            </div>

                            {isKeysLoading ? (
                              <div className="flex items-center justify-center py-10">
                                <RefreshCw size={20} className="text-indigo-400 animate-spin" />
                              </div>
                            ) : registeredKeys.length === 0 ? (
                              <div className="text-slate-500 text-center py-8 text-[10px] italic">
                                No hardware public keys registered for this candidate user ID yet. Use the registration panel to link your device.
                              </div>
                            ) : (
                              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                                {registeredKeys.map((key, idx) => (
                                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                                    <div className="flex justify-between items-center text-[9px]">
                                      <span className="font-bold text-indigo-300 truncate max-w-[120px]">ID: {key.id.substring(0, 16)}...</span>
                                      <span className="text-slate-500">{new Date(key.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-1.5 bg-black/40 rounded font-mono text-[8px] text-slate-400 truncate select-all">
                                      PUBKEY: {key.public_key}
                                    </div>
                                    <div className="flex justify-between text-[8px] text-slate-500">
                                      <span>Counter: {key.counter}</span>
                                      <span className="text-emerald-400 font-bold uppercase">BOUND SECURELY</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Catch-All visually detailed panel */}
                  {activePageId !== 6 && activePageId !== 7 && activePageId !== 9 && activePageId !== 11 && activePageId !== 14 && activePageId !== 15 && activePageId !== 21 && activePageId !== 24 && (
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
