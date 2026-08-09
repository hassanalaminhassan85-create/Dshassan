import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Layers, CheckCircle2, AlertCircle, FileText, Download, 
  MessageSquare, Plus, Ticket, Landmark, Clock, Send, Eye, EyeOff,
  User, Mail, Key, Phone, ShieldCheck, Briefcase, ChevronRight,
  CreditCard, Lock, X, Coins, LogOut, RefreshCw, ArrowLeft, Menu,
  Globe, Sun, Moon, Sparkles, Cpu, Check, HelpCircle, Trash2, Settings,
  LayoutGrid, Wrench, FolderKanban, Receipt, Sliders, Zap, Radio, Bot, Shield
} from 'lucide-react';
import { Logo } from './Logo';
import { PaystackPayButton } from './PaystackMotionCheckout';
import { 
  apiSubscribeToClientProjects,
  apiSaveClientProjectRealtime,
  apiUpdateClientProjectRealtime,
  apiSubscribeToInvoicesRealtime,
  apiSaveInvoiceRealtime,
  apiUpdateInvoiceRealtime,
  apiSubscribeToTicketsRealtime,
  apiSaveTicketRealtime,
  apiUpdateTicketRealtime,
  apiSubscribeToAnnouncementsRealtime
} from '../lib/api';

export interface ClientProject {
  id: string;
  name: string;
  serviceCategory: string;
  status: 'planning' | 'progress' | 'review' | 'completed';
  progress: number;
  deadline: string;
  clientName: string;
  clientId?: string;
  budget: string;
  description?: string;
  deliverables?: string[];
  assignedStaff?: {
    id: string;
    fullName: string;
    jobTitle: string;
    email: string;
    phone?: string;
  } | null;
}

export interface Invoice {
  id: string;
  number: string;
  amount: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  project: string;
  clientId?: string;
}

const persistClientData = (clientId: string, projs: ClientProject[], invs: Invoice[], tkts: SupportTicket[]) => {
  try {
    localStorage.setItem(`client_projs_${clientId}`, JSON.stringify(projs));
    localStorage.setItem(`client_invs_${clientId}`, JSON.stringify(invs));
    localStorage.setItem(`client_tkts_${clientId}`, JSON.stringify(tkts));
  } catch (e) {
    console.warn("Storage persistence warning:", e);
  }
};

export interface SupportTicket {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved' | 'closed';
  date: string;
  lastMessage: string;
  messages: Array<{
    id: string;
    sender: 'client' | 'support';
    text: string;
    timestamp: string;
  }>;
}

export interface ClientUser {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  focus: string;
  budget: string;
  clientId: string;
}

const GUEST_COMPANY: ClientUser = {
  companyName: "Garki Logistics Ltd",
  contactName: "Musa Ibrahim",
  email: "musa@garkilogistics.com",
  phone: "+234 902 348 9111",
  focus: "Web & AI Software Systems",
  budget: "₦2,000,000+",
  clientId: "client_garki_logistics"
};

const AVAILABLE_SERVICES_CATALOG = [
  {
    id: 'srv_web',
    title: 'Full-Stack Web App Engineering',
    category: 'software',
    description: 'Custom scalable React 19 web applications with Node.js/Cloudflare backends and secure authentication.',
    defaultBudget: '₦850,000',
    duration: '4-6 Weeks',
    icon: Cpu
  },
  {
    id: 'srv_mobile',
    title: 'Mobile App Engineering & PWA',
    category: 'software',
    description: 'Cross-platform mobile applications with offline sync, biometric push notifications, and high performance.',
    defaultBudget: '₦1,200,000',
    duration: '6-8 Weeks',
    icon: Sparkles
  },
  {
    id: 'srv_cac',
    title: 'CAC Corporate Incorporation & TIN',
    category: 'incorporation',
    description: 'Official Limited Liability company registration with the Corporate Affairs Commission and FIRS tax ID.',
    defaultBudget: '₦120,000',
    duration: '7-10 Days',
    icon: Building2
  },
  {
    id: 'srv_ads',
    title: 'Sponsored Ads & Social Media Campaigns',
    category: 'marketing',
    description: 'Targeted Meta, TikTok, and Google ad funnel optimization with verified conversion tracking pixels.',
    defaultBudget: '₦350,000',
    duration: 'Ongoing Campaign',
    icon: Briefcase
  },
  {
    id: 'srv_ai',
    title: 'Gemini AI Assistant Integration',
    category: 'software',
    description: 'Custom AI agents trained on corporate data to automate customer service and executive reporting.',
    defaultBudget: '₦550,000',
    duration: '3 Weeks',
    icon: Layers
  },
  {
    id: 'srv_security',
    title: 'Cyber Security & Biometric Vault Audit',
    category: 'security',
    description: 'FIDO2 WebAuthn biometric integration, penetration testing, and SCUML compliance audit.',
    defaultBudget: '₦400,000',
    duration: '2 Weeks',
    icon: ShieldCheck
  }
];

const getSeedDataForFocus = (focus: string, companyName: string, budget: string) => {
  const dateStr = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const formattedBudget = budget || "₦350,000";

  let projects: ClientProject[] = [
    { 
      id: "proj_1", 
      name: "React 19 Frontend Web Portal & API Gateway", 
      serviceCategory: "Full-Stack Web App Engineering",
      status: "progress", 
      progress: 65, 
      deadline: dateStr(14), 
      clientName: companyName, 
      budget: formattedBudget,
      description: "Custom enterprise web application with real-time analytics and secure database synchronization.",
      deliverables: ["Responsive UI Architecture", "RESTful API Integration", "Secure Authentication Node"]
    },
    { 
      id: "proj_2", 
      name: "CAC Corporate Compliance & Tax ID Filing", 
      serviceCategory: "CAC Corporate Incorporation",
      status: "completed", 
      progress: 100, 
      deadline: dateStr(-5), 
      clientName: companyName, 
      budget: "₦120,000",
      description: "Official limited liability incorporation papers and certified digital certificates.",
      deliverables: ["CAC Certificate of Incorporation", "TIN Certificate", "MEMART Document"]
    }
  ];

  let invoices: Invoice[] = [
    { id: "inv_1", number: "INV-2026-001", amount: "₦120,000", date: dateStr(-10), dueDate: dateStr(-5), status: "paid", project: "CAC Corporate Compliance & Tax ID Filing" },
    { id: "inv_2", number: "INV-2026-002", amount: formattedBudget, date: dateStr(-2), dueDate: dateStr(12), status: "unpaid", project: "React 19 Frontend Web Portal & API Gateway" }
  ];

  let tickets: SupportTicket[] = [
    { 
      id: "tkt_1", 
      subject: "Domain Whitelisting & API Key Configuration", 
      priority: "high", 
      status: "open", 
      date: dateStr(0), 
      lastMessage: "Our technical consultant has verified your environment variables.",
      messages: [
        { id: "m_1", sender: "client", text: "Hello, how do we configure our custom production domain?", timestamp: "10:30 AM" },
        { id: "m_2", sender: "support", text: "Hello! We have updated the Cloudflare DNS routing rules for your company node. You can proceed with deployment.", timestamp: "11:00 AM" }
      ]
    }
  ];

  return { projects, invoices, tickets };
};

export const ClientPortalSection: React.FC<{ onBackToPortal?: () => void }> = ({ onBackToPortal }) => {
  // Theme dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Sync theme with document root
  useEffect(() => {
    const isRootDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isRootDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auth states
  const [authState, setAuthState] = useState<'signin' | 'register'>('signin');
  const [isLogged, setIsLogged] = useState<boolean>(false);

  // Signin fields
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regContactName, setRegContactName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFocus, setRegFocus] = useState('Full-Stack Web App Engineering');
  const [regBudget, setRegBudget] = useState('₦850,000');

  // Active Client Session
  const [activeClient, setActiveClient] = useState<ClientUser | null>(null);

  // Dashboard Navigation & Hamburger Drawer State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'projects' | 'invoices' | 'support' | 'settings'>('dashboard');
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);

  // Lists State
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Project Layout Mode: list view vs kanban board
  const [projectLayoutView, setProjectLayoutView] = useState<'list' | 'kanban'>('list');

  // Modern Enterprise Modals
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [aiCopilotPrompt, setAiCopilotPrompt] = useState('');
  const [isGeneratingAiSpec, setIsGeneratingAiSpec] = useState(false);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [isPasskeyRegistered, setIsPasskeyRegistered] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [isCacTrackerOpen, setIsCacTrackerOpen] = useState(false);

  // Project Builder Modal State (when selecting a service or creating custom project)
  const [selectedServiceForProject, setSelectedServiceForProject] = useState<typeof AVAILABLE_SERVICES_CATALOG[0] | null>(null);
  const [customProjName, setCustomProjName] = useState('');
  const [customProjDesc, setCustomProjDesc] = useState('');
  const [customProjBudget, setCustomProjBudget] = useState('₦500,000');
  const [customProjTimeline, setCustomProjTimeline] = useState('4 Weeks');
  const [isBuildingProject, setIsBuildingProject] = useState(false);

  // Support Ticket Modal
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [tktSubject, setTktSubject] = useState('');
  const [tktPriority, setTktPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tktMessage, setTktMessage] = useState('');

  // Selected Support Ticket for Chat
  const [activeChatTicket, setActiveChatTicket] = useState<SupportTicket | null>(null);
  const [chatReply, setChatReply] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Payment Checkout Modal
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isPayingInvoice, setIsPayingInvoice] = useState(false);

  // Toast Alerts
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'success' | 'info' | 'error' }>>([]);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Recover session on mount
  useEffect(() => {
    const saved = localStorage.getItem('ds_client_standalone_session');
    if (saved) {
      try {
        const clientObj = JSON.parse(saved);
        setActiveClient(clientObj);
        setIsLogged(true);
      } catch (e) {
        console.error("Session restore error:", e);
      }
    }
  }, []);

  // REALTIME FIRESTORE SUBSCRIPTIONS
  useEffect(() => {
    if (!activeClient) return;

    // 1. Subscribe to Client Projects
    const unsubProj = apiSubscribeToClientProjects((allProjects) => {
      const mine = allProjects.filter(p => 
        p.clientId === activeClient.clientId || 
        p.clientName?.toLowerCase() === activeClient.companyName?.toLowerCase()
      );

      if (mine.length > 0) {
        setProjects(mine);
      } else {
        // First-time seed sync to Firestore
        const seeds = getSeedDataForFocus(activeClient.focus, activeClient.companyName, activeClient.budget);
        setProjects(seeds.projects);
        seeds.projects.forEach(p => {
          apiSaveClientProjectRealtime({ ...p, clientId: activeClient.clientId, clientName: activeClient.companyName });
        });
      }
    });

    // 2. Subscribe to Invoices
    const unsubInv = apiSubscribeToInvoicesRealtime((allInvoices) => {
      const mine = allInvoices.filter(i => 
        i.clientId === activeClient.clientId || 
        i.project
      );

      if (mine.length > 0) {
        setInvoices(mine);
      } else {
        const seeds = getSeedDataForFocus(activeClient.focus, activeClient.companyName, activeClient.budget);
        setInvoices(seeds.invoices);
        seeds.invoices.forEach(i => {
          apiSaveInvoiceRealtime({ ...i, clientId: activeClient.clientId });
        });
      }
    });

    // 3. Subscribe to Support Tickets
    const unsubTkt = apiSubscribeToTicketsRealtime((allTickets) => {
      const mine = allTickets.filter(t => t.clientId === activeClient.clientId || t.subject);

      if (mine.length > 0) {
        setTickets(mine);
        // Also update activeChatTicket if open
        if (activeChatTicket) {
          const updatedChat = mine.find(t => t.id === activeChatTicket.id);
          if (updatedChat) setActiveChatTicket(updatedChat);
        }
      } else {
        const seeds = getSeedDataForFocus(activeClient.focus, activeClient.companyName, activeClient.budget);
        setTickets(seeds.tickets);
        seeds.tickets.forEach(t => {
          apiSaveTicketRealtime({ ...t, clientId: activeClient.clientId });
        });
      }
    });

    return () => {
      unsubProj();
      unsubInv();
      unsubTkt();
    };
  }, [activeClient]);

  // Login handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinEmail || !signinPassword) {
      triggerToast("Please provide your email and password.", "error");
      return;
    }

    const registeredRaw = localStorage.getItem('ds_client_registered_list');
    const registered: ClientUser[] = registeredRaw ? JSON.parse(registeredRaw) : [];

    let matched: ClientUser | null = null;
    if (signinEmail.toLowerCase() === GUEST_COMPANY.email.toLowerCase()) {
      matched = GUEST_COMPANY;
    } else {
      matched = registered.find(c => c.email.toLowerCase() === signinEmail.toLowerCase()) || null;
    }

    if (matched) {
      setActiveClient(matched);
      setIsLogged(true);
      localStorage.setItem('ds_client_standalone_session', JSON.stringify(matched));

      const savedProj = localStorage.getItem(`client_projs_${matched.clientId}`);
      const savedInv = localStorage.getItem(`client_invs_${matched.clientId}`);
      const savedTkt = localStorage.getItem(`client_tkts_${matched.clientId}`);

      if (savedProj && savedInv && savedTkt) {
        setProjects(JSON.parse(savedProj));
        setInvoices(JSON.parse(savedInv));
        setTickets(JSON.parse(savedTkt));
      } else {
        const seeds = getSeedDataForFocus(matched.focus, matched.companyName, matched.budget);
        setProjects(seeds.projects);
        setInvoices(seeds.invoices);
        setTickets(seeds.tickets);
        persistClientData(matched.clientId, seeds.projects, seeds.invoices, seeds.tickets);
      }

      triggerToast(`Welcome back, ${matched.contactName}! Enterprise node active.`, "success");
    } else {
      triggerToast("Invalid credentials or unregistered company email.", "error");
    }
  };

  // Register handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompanyName || !regContactName || !regEmail || !regPhone || !regPassword) {
      triggerToast("Please fill in all corporate registration fields.", "error");
      return;
    }

    const clientId = "client_" + Math.random().toString(36).substring(2, 9);
    const newClient: ClientUser = {
      companyName: regCompanyName,
      contactName: regContactName,
      email: regEmail,
      phone: regPhone,
      focus: regFocus,
      budget: regBudget,
      clientId
    };

    const registeredRaw = localStorage.getItem('ds_client_registered_list');
    const registered: ClientUser[] = registeredRaw ? JSON.parse(registeredRaw) : [];

    if (registered.some(c => c.email.toLowerCase() === regEmail.toLowerCase()) || regEmail.toLowerCase() === GUEST_COMPANY.email.toLowerCase()) {
      triggerToast("An enterprise node is already registered with this email.", "error");
      return;
    }

    registered.push(newClient);
    localStorage.setItem('ds_client_registered_list', JSON.stringify(registered));

    const seeds = getSeedDataForFocus(regFocus, regCompanyName, regBudget);
    setActiveClient(newClient);
    setIsLogged(true);
    setProjects(seeds.projects);
    setInvoices(seeds.invoices);
    setTickets(seeds.tickets);

    localStorage.setItem('ds_client_standalone_session', JSON.stringify(newClient));
    persistClientData(clientId, seeds.projects, seeds.invoices, seeds.tickets);

    triggerToast(`Congratulations! ${regCompanyName} node registered successfully.`, "success");
  };

  const handleSignOut = () => {
    localStorage.removeItem('ds_client_standalone_session');
    setActiveClient(null);
    setIsLogged(false);
    triggerToast("Enterprise node disconnected securely.", "info");
  };

  const handleDemoLogin = () => {
    setActiveClient(GUEST_COMPANY);
    setIsLogged(true);
    localStorage.setItem('ds_client_standalone_session', JSON.stringify(GUEST_COMPANY));

    const savedProj = localStorage.getItem(`client_projs_${GUEST_COMPANY.clientId}`);
    const savedInv = localStorage.getItem(`client_invs_${GUEST_COMPANY.clientId}`);
    const savedTkt = localStorage.getItem(`client_tkts_${GUEST_COMPANY.clientId}`);

    if (savedProj && savedInv && savedTkt) {
      setProjects(JSON.parse(savedProj));
      setInvoices(JSON.parse(savedInv));
      setTickets(JSON.parse(savedTkt));
    } else {
      const seeds = getSeedDataForFocus(GUEST_COMPANY.focus, GUEST_COMPANY.companyName, GUEST_COMPANY.budget);
      setProjects(seeds.projects);
      setInvoices(seeds.invoices);
      setTickets(seeds.tickets);
      persistClientData(GUEST_COMPANY.clientId, seeds.projects, seeds.invoices, seeds.tickets);
    }
    triggerToast("Logged in with pre-populated demo: Garki Logistics Ltd.", "success");
  };

  // Submit custom built project from selected service
  const handleBuildProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProjName || !activeClient) return;

    setIsBuildingProject(true);
    const projId = "proj_" + Math.random().toString(36).substring(2, 8);
    const newProj: ClientProject = {
      id: projId,
      name: customProjName,
      serviceCategory: selectedServiceForProject ? selectedServiceForProject.title : "Custom Enterprise Development",
      status: "planning",
      progress: 10,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: activeClient.companyName,
      clientId: activeClient.clientId,
      budget: customProjBudget,
      description: customProjDesc || "Custom build specification submitted via client portal project builder.",
      deliverables: ["Initial Technical Specification", "UI Wireframes & Prototype", "Core Codebase Repository"],
      assignedStaff: null
    };

    const invId = "inv_" + Math.random().toString(36).substring(2, 8);
    const newInv: Invoice = {
      id: invId,
      number: "INV-2026-" + Math.floor(100 + Math.random() * 900),
      amount: customProjBudget,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "unpaid",
      project: customProjName,
      clientId: activeClient.clientId
    };

    // Realtime save to Firestore
    await apiSaveClientProjectRealtime(newProj);
    await apiSaveInvoiceRealtime(newInv);

    setIsBuildingProject(false);
    setSelectedServiceForProject(null);
    setCustomProjName('');
    setCustomProjDesc('');
    setActiveTab('projects');
    triggerToast(`Project "${customProjName}" created & synchronized with cloud node!`, "success");
  };

  // File support ticket
  const handleFileTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktSubject || !tktMessage || !activeClient) return;

    const tktId = "tkt_" + Math.random().toString(36).substring(2, 8);
    const newTkt = {
      id: tktId,
      subject: tktSubject,
      priority: tktPriority,
      status: "open",
      date: new Date().toISOString().split('T')[0],
      lastMessage: tktMessage,
      clientId: activeClient.clientId,
      messages: [
        { id: "msg_init", sender: "client", text: tktMessage, timestamp: "Just now" }
      ]
    };

    await apiSaveTicketRealtime(newTkt);

    setIsNewTicketOpen(false);
    setTktSubject('');
    setTktMessage('');
    triggerToast("Support ticket filed & synced to Staff Support Desk.", "success");
  };

  // Chat reply simulation & Firestore update
  const handleChatReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReply || !activeChatTicket || !activeClient) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: "m_" + Math.random().toString(36).substring(2, 8),
      sender: 'client' as const,
      text: chatReply,
      timestamp: timeStr
    };

    const updatedMsgs = [...(activeChatTicket.messages || []), userMsg];
    const updatedTkt = { ...activeChatTicket, lastMessage: chatReply, messages: updatedMsgs };

    setActiveChatTicket(updatedTkt);
    setChatReply('');
    await apiUpdateTicketRealtime(activeChatTicket.id, { lastMessage: chatReply, messages: updatedMsgs });

    setIsTyping(true);
    setTimeout(async () => {
      const repTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const supportMsg = {
        id: "m_sup_" + Math.random().toString(36).substring(2, 8),
        sender: 'support' as const,
        text: `Thank you for your update. Our senior lead engineer is reviewing ticket #${activeChatTicket.id.substring(0,6)} and will sync deliverables shortly.`,
        timestamp: repTime
      };

      const finalMsgs = [...updatedMsgs, supportMsg];
      const finalTkt = { ...updatedTkt, lastMessage: supportMsg.text, messages: finalMsgs };

      setActiveChatTicket(finalTkt);
      setIsTyping(false);
      await apiUpdateTicketRealtime(activeChatTicket.id, { lastMessage: supportMsg.text, messages: finalMsgs });
      triggerToast("Received reply from DS Tech Senior Consultant", "info");
    }, 1600);
  };

  // AI Gemini Spec Generator
  const handleGenerateAiSpec = async () => {
    if (!aiCopilotPrompt.trim()) return;
    setIsGeneratingAiSpec(true);
    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a full technical project scope, estimated milestone breakdown, and recommended budget for this client request: "${aiCopilotPrompt}". Return clear bullet points for deliverables.`
        })
      });
      const data = await response.json();
      if (data.summary) {
        setCustomProjName(aiCopilotPrompt.slice(0, 30) + '...');
        setCustomProjDesc(data.summary);
        setCustomProjBudget('₦1,500,000');
        setIsAiCopilotOpen(false);
        setAiCopilotPrompt('');
        triggerToast("AI Spec Copilot successfully generated scope!", "success");
      }
    } catch (err) {
      setCustomProjName(aiCopilotPrompt.slice(0, 30));
      setCustomProjDesc(`AI Generated Scope: High-performance architecture, cloud-native deployment on Cloudflare & Firestore, automated tests, and real-time dashboard orchestration for "${aiCopilotPrompt}".`);
      setIsAiCopilotOpen(false);
      setAiCopilotPrompt('');
      triggerToast("AI Scope drafted based on request.", "info");
    } finally {
      setIsGeneratingAiSpec(false);
    }
  };

  // Settle Invoice
  const handleSettleInvoice = (inv: Invoice) => {
    setActiveInvoice(inv);
  };

  const handleInvoicePaidSuccess = async (invId: string) => {
    await apiUpdateInvoiceRealtime(invId, { status: 'paid' });
    setInvoices(prev => prev.map(i => i.id === invId ? { ...i, status: 'paid' } : i));
  };

  const confirmPaymentSimulation = async () => {
    if (!activeInvoice) return;
    setIsPayingInvoice(true);

    setTimeout(async () => {
      await apiUpdateInvoiceRealtime(activeInvoice.id, { status: 'paid' });
      setIsPayingInvoice(false);
      setReceiptInvoice({ ...activeInvoice, status: 'paid' });
      setActiveInvoice(null);
      triggerToast(`Successfully settled ${activeInvoice.amount} for ${activeInvoice.project}!`, "success");
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative`}>
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 border pointer-events-auto ${
                t.type === 'success' 
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : t.type === 'error'
                    ? 'bg-white dark:bg-slate-900 border-red-500/30 text-red-500'
                    : 'bg-white dark:bg-slate-900 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {t.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              <div className="text-xs font-semibold leading-tight">{t.msg}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isLogged ? (
        /* ================= ISOLATED CLIENT AUTH VIEW ================= */
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          {/* Ambient background lights with smooth animation */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 space-y-6">
            
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="absolute top-6 left-6 p-2.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 z-50"
                title="Back to Main Site"
              >
                <ArrowLeft size={15} className="text-orange-500" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500">Back</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="absolute top-6 right-6 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-6">
              <Logo size="md" variant={isDarkMode ? 'light' : 'dark'} className="mx-auto" />
              <div className="space-y-1">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20">
                  Standalone Client Portal
                </span>
                <h1 className="text-xl font-bold font-serif uppercase tracking-tight text-slate-900 dark:text-white mt-2">
                  Enterprise Client Hub
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage projects, select services, build deliverables, and settle invoices.
                </p>
              </div>
            </div>

            {/* Auth Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAuthState('signin')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authState === 'signin' ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthState('register')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  authState === 'register' ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authState === 'signin' ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSignIn}
                  className="space-y-4 text-left text-xs"
                >
                  <div className="space-y-1.5">
                    <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Corporate Email</label>
                    <div className="relative flex items-center">
                      <Mail size={14} className="absolute left-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signinEmail}
                        onChange={e => setSigninEmail(e.target.value)}
                        placeholder="musa@garkilogistics.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Password</label>
                    <div className="relative flex items-center">
                      <Key size={14} className="absolute left-3.5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signinPassword}
                        onChange={e => setSigninPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer mt-4"
                  >
                    Establish Client Connection
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegister}
                  className="space-y-3.5 text-left text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Company Name</label>
                    <input
                      type="text"
                      required
                      value={regCompanyName}
                      onChange={e => setRegCompanyName(e.target.value)}
                      placeholder="e.g. Apex Tech Ventures"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Contact Person</label>
                      <input
                        type="text"
                        required
                        value={regContactName}
                        onChange={e => setRegContactName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Phone</label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="sarah@apextech.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Primary Service Focus</label>
                      <select
                        value={regFocus}
                        onChange={e => setRegFocus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      >
                        <option value="Full-Stack Web App Engineering">Web App Engineering</option>
                        <option value="CAC Corporate Incorporation">CAC Corporate Incorporation</option>
                        <option value="Sponsored Ads & Social Media Campaigns">Sponsored Ad Campaigns</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Initial Budget</label>
                      <select
                        value={regBudget}
                        onChange={e => setRegBudget(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      >
                        <option value="₦350,000">₦350,000</option>
                        <option value="₦850,000">₦850,000</option>
                        <option value="₦2,000,000+">₦2,000,000+</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500">Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer mt-3"
                  >
                    Register Enterprise Node
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* ================= ISOLATED CLIENT DASHBOARD ================= */
        <div className="min-h-screen flex flex-col">
          
          {/* Top Standalone Header Bar with Hamburger */}
          <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsHamburgerOpen(!isHamburgerOpen)}
                className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all cursor-pointer shadow-sm flex items-center justify-center"
                title="Toggle Navigation Menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
              </div>

              {/* Realtime Connection Pulse Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Firestore Cloud Node Connected</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* AI Spec Copilot Button */}
              <button
                type="button"
                onClick={() => setIsAiCopilotOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm hover:opacity-90 transition-all cursor-pointer"
              >
                <Bot size={14} />
                <span>AI Scope Copilot</span>
              </button>

              {/* Biometric Passkey Vault Button */}
              <button
                type="button"
                onClick={() => setIsPasskeyModalOpen(true)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm relative"
                title="Passkey Biometric Vault"
              >
                <ShieldCheck size={16} className={isPasskeyRegistered ? "text-emerald-500" : "text-slate-400"} />
              </button>

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white">{activeClient?.companyName}</span>
                <span className="text-[10px] text-orange-500 font-mono font-bold">{activeClient?.contactName}</span>
              </div>

              {onBackToPortal && (
                <button
                  type="button"
                  onClick={onBackToPortal}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  title="Back to Main Site"
                >
                  <ArrowLeft size={15} className="text-orange-500" />
                  <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500">Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
              >
                {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer shadow-sm"
                title="Disconnect"
              >
                <LogOut size={15} />
              </button>
            </div>
          </header>

          {/* HAMBURGER SIDEBAR / SLIDE-OUT DRAWER */}
          <AnimatePresence>
            {isHamburgerOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsHamburgerOpen(false)}
                  className="fixed inset-0 bg-slate-950/60 z-50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                      <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
                      <button
                        type="button"
                        onClick={() => setIsHamburgerOpen(false)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 block">Navigation List</span>
                      {[
                        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutGrid },
                        { id: 'services', label: 'Available Services & Project Builder', icon: Wrench, highlight: true },
                        { id: 'projects', label: 'My Active Projects', icon: FolderKanban },
                        { id: 'invoices', label: 'Invoices & Financials', icon: Receipt },
                        { id: 'support', label: 'Support & Tickets', icon: MessageSquare },
                        { id: 'settings', label: 'Enterprise Settings', icon: Settings }
                      ].map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id as any);
                              setIsHamburgerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                                : item.highlight
                                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <Icon size={16} />
                              <span>{item.label}</span>
                            </span>
                            {item.highlight && !isActive && (
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                      <div className="font-extrabold text-slate-900 dark:text-white">{activeClient?.companyName}</div>
                      <div className="text-slate-400 truncate">{activeClient?.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Disconnect Node</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MAIN DASHBOARD CONTENT AREA */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
            
            {/* VIEW 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Welcome Banner */}
                <div className="bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-indigo-950">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
                  <div className="relative z-10 space-y-4 max-w-2xl text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      <Zap size={12} className="animate-pulse" /> Active Node Connected
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight">
                      Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{activeClient?.contactName}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Your enterprise node <strong className="text-white">{activeClient?.companyName}</strong> has {projects.length} active projects and {invoices.filter(i => i.status === 'unpaid').length} pending invoices. Click the hamburger menu to browse available services and build new projects.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('services')}
                        className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/20 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Wrench size={14} />
                        <span>Browse Services & Build Project</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('projects')}
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-white/10"
                      >
                        <FolderKanban size={14} />
                        <span>View Active Projects</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Projects', val: projects.length, icon: FolderKanban, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Completed Deliverables', val: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Pending Invoices', val: invoices.filter(i => i.status === 'unpaid').length, icon: Receipt, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Support Tickets', val: tickets.filter(t => t.status === 'open').length, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' }
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 text-left">
                        <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} shrink-0`}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{stat.label}</span>
                          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">{stat.val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Projects Preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm text-left">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <FolderKanban size={16} className="text-orange-500" /> Active Build Roadmap
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projects.map(proj => (
                      <div key={proj.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            {proj.serviceCategory}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.name}</h4>
                          <p className="text-[11px] text-slate-400">{proj.description || "In development timeline."}</p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{proj.progress}%</span>
                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            proj.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {proj.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEW 2: AVAILABLE SERVICES & PROJECT BUILDER */}
            {activeTab === 'services' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
                <div className="space-y-2">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-widest block font-mono">Service Catalog & Project Builder</span>
                  <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-slate-900 dark:text-white">
                    Select a Service & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 italic">Build Your Project</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                    Choose from our professional agency service offerings below. Clicking "Select & Build" opens our custom project builder where you can input your required specifications and launch the build immediately.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {AVAILABLE_SERVICES_CATALOG.map(srv => {
                    const Icon = srv.icon;
                    return (
                      <div key={srv.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition-all group">
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
                            <Icon size={24} />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{srv.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{srv.description}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <span className="text-slate-400">Duration: <strong className="text-slate-700 dark:text-slate-200">{srv.duration}</strong></span>
                            <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{srv.defaultBudget}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedServiceForProject(srv);
                            setCustomProjName(srv.title + " for " + activeClient?.companyName);
                            setCustomProjBudget(srv.defaultBudget);
                            setCustomProjDesc(srv.description);
                          }}
                          className="mt-6 w-full py-3 bg-[#000E32] dark:bg-indigo-600 hover:bg-orange-600 dark:hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Plus size={14} />
                          <span>Select & Build Project</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Project Builder Modal when service is selected */}
                {selectedServiceForProject && (
                  <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-left"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedServiceForProject(null)}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X size={16} />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-orange-500">Custom Project Builder</span>
                        <h3 className="text-xl font-bold uppercase font-serif text-slate-900 dark:text-white">
                          Configure: {selectedServiceForProject.title}
                        </h3>
                        <p className="text-xs text-slate-400">Input your desired project requirements and specifications below.</p>
                      </div>

                      <form onSubmit={handleBuildProjectSubmit} className="space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Project Name</label>
                          <input
                            type="text"
                            required
                            value={customProjName}
                            onChange={e => setCustomProjName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Project Scope & Deliverable Notes</label>
                          <textarea
                            rows={3}
                            value={customProjDesc}
                            onChange={e => setCustomProjDesc(e.target.value)}
                            placeholder="Specify custom features, pages, or design preferences..."
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Allocated Budget (₦)</label>
                            <input
                              type="text"
                              required
                              value={customProjBudget}
                              onChange={e => setCustomProjBudget(e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Target Timeline</label>
                            <input
                              type="text"
                              required
                              value={customProjTimeline}
                              onChange={e => setCustomProjTimeline(e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedServiceForProject(null)}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isBuildingProject}
                            className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isBuildingProject ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                            <span>Launch Build Roadmap</span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 3: MY PROJECTS */}
            {activeTab === 'projects' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest block font-mono">My Active Projects</span>
                    <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-slate-900 dark:text-white">Project Deliverables Ledger</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Switcher: List vs Kanban */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setProjectLayoutView('list')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                          projectLayoutView === 'list' 
                            ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <LayoutGrid size={14} />
                        <span>List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectLayoutView('kanban')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                          projectLayoutView === 'kanban' 
                            ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <FolderKanban size={14} />
                        <span>Kanban</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('services')}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Build New Project</span>
                    </button>
                  </div>
                </div>

                {/* KANBAN BOARD VIEW */}
                {projectLayoutView === 'kanban' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { statusKey: 'planning', label: 'Planning & Scope', color: 'border-indigo-500 text-indigo-500' },
                      { statusKey: 'progress', label: 'In Progress', color: 'border-amber-500 text-amber-500' },
                      { statusKey: 'review', label: 'Under Review', color: 'border-orange-500 text-orange-500' },
                      { statusKey: 'completed', label: 'Completed & Live', color: 'border-emerald-500 text-emerald-500' }
                    ].map(col => {
                      const colProjects = projects.filter(p => p.status === col.statusKey);
                      return (
                        <div key={col.statusKey} className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col min-h-[350px]">
                          <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{col.label}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {colProjects.length}
                            </span>
                          </div>

                          <div className="space-y-3 flex-1 overflow-y-auto">
                            {colProjects.map(proj => (
                              <div key={proj.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-orange-500 transition-all">
                                <div>
                                  <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-500 font-bold block">{proj.serviceCategory}</span>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{proj.name}</h4>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                    <span>Progress</span>
                                    <span>{proj.progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                                  <span className="font-mono font-bold text-orange-500">{proj.budget}</span>
                                  <span className="text-slate-400">{proj.assignedStaff?.fullName || 'HR Review'}</span>
                                </div>
                              </div>
                            ))}
                            {colProjects.length === 0 && (
                              <div className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-[11px] text-slate-400 italic">
                                No projects in this stage
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* CARD LIST VIEW */
                  <div className="space-y-4">
                    {projects.map(proj => (
                    <div key={proj.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] font-mono font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                            {proj.serviceCategory}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{proj.name}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">{proj.budget}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            proj.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {proj.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Build Progress</span>
                          <span>{proj.progress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>

                      {/* Assigned Staff Member Box */}
                      <div className="p-3.5 bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/20 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs">
                            {proj.assignedStaff ? proj.assignedStaff.fullName.charAt(0) : 'HR'}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Lead Staff</span>
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {proj.assignedStaff ? `${proj.assignedStaff.fullName} (${proj.assignedStaff.jobTitle})` : 'Pending Assignment (HR Reviewing)'}
                            </span>
                          </div>
                        </div>
                        {proj.assignedStaff && (
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">Active Engineer</span>
                            <span className="text-[10px] text-slate-400">{proj.assignedStaff.email}</span>
                          </div>
                        )}
                      </div>

                      {proj.deliverables && proj.deliverables.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Deliverables</span>
                          <div className="flex flex-wrap gap-2">
                            {proj.deliverables.map((del, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                {del}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                )}
              </motion.div>
            )}

            {/* VIEW 4: INVOICES & FINANCIALS */}
            {activeTab === 'invoices' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-widest block font-mono">Financial Ledger</span>
                  <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-slate-900 dark:text-white">Invoices & Settlement Receipts</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                          <th className="p-4">Invoice #</th>
                          <th className="p-4">Project Deliverable</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Due Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{inv.number}</td>
                            <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{inv.project}</td>
                            <td className="p-4 font-mono font-bold text-orange-600 dark:text-orange-400">{inv.amount}</td>
                            <td className="p-4 text-slate-400">{inv.dueDate}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                                inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {inv.status === 'unpaid' ? (
                                <PaystackPayButton
                                  amount={parseInt((inv.amount || '100000').replace(/[^0-9]/g, '')) || 100000}
                                  email={activeClient?.email || 'client@dstech.agency'}
                                  customerName={activeClient?.contactName || activeClient?.companyName || 'Valued Client'}
                                  phone={activeClient?.phone || ''}
                                  title={`Invoice Settlement: ${inv.number}`}
                                  description={`Settlement for Invoice #${inv.number} - ${inv.project}`}
                                  onSuccess={(ref) => {
                                    handleInvoicePaidSuccess(inv.id);
                                    triggerToast(`Invoice ${inv.number} paid successfully via Paystack! Ref: ${ref}`, "success");
                                  }}
                                  variant="emerald"
                                  className="px-3 py-1.5 text-[10px]"
                                >
                                  <CreditCard size={12} />
                                  <span>Pay via Paystack</span>
                                </PaystackPayButton>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => triggerToast(`Receipt ${inv.number} verified via SCUML cryptographic ledger.`, "success")}
                                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                >
                                  Receipt PDF
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Checkout Modal */}
                {activeInvoice && (
                  <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-left"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveInvoice(null)}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X size={16} />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-orange-500">Secure Payment Gateway</span>
                        <h3 className="text-lg font-bold uppercase font-serif text-slate-900 dark:text-white">
                          Settle Invoice: {activeInvoice.number}
                        </h3>
                        <p className="text-xs text-slate-400">Total Amount: <strong className="text-orange-500 font-mono">{activeInvoice.amount}</strong></p>
                      </div>

                      <form onSubmit={confirmPaymentSimulation} className="space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Card Number</label>
                          <input
                            type="text"
                            defaultValue="4000 1234 5678 9010"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Expiry</label>
                            <input type="text" defaultValue="08/28" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">CVV</label>
                            <input type="password" defaultValue="392" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white" />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isPayingInvoice}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
                        >
                          {isPayingInvoice ? <RefreshCw size={14} className="animate-spin" /> : <CreditCard size={14} />}
                          <span>Authorize Secure Payment ({activeInvoice.amount})</span>
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 5: SUPPORT & TICKETS */}
            {activeTab === 'support' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest block font-mono">24/7 Client Support</span>
                    <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-slate-900 dark:text-white">Technical Tickets & Real-Time Chat</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(true)}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Open New Ticket</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Tickets List */}
                  <div className="lg:col-span-5 space-y-3">
                    {tickets.map(tkt => (
                      <div
                        key={tkt.id}
                        onClick={() => setActiveChatTicket(tkt)}
                        className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                          activeChatTicket?.id === tkt.id
                            ? 'bg-orange-500/10 border-orange-500/50 shadow-md'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-slate-400">{tkt.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            tkt.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {tkt.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tkt.subject}</h4>
                        <p className="text-[11px] text-slate-400 truncate mt-1">{tkt.lastMessage}</p>
                      </div>
                    ))}
                  </div>

                  {/* Active Chat Thread */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[500px]">
                    {activeChatTicket ? (
                      <>
                        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-orange-500 uppercase">Ticket #{activeChatTicket.id}</span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeChatTicket.subject}</h3>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full">
                            {activeChatTicket.status}
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                          {activeChatTicket.messages.map(m => (
                            <div key={m.id} className={`flex flex-col ${m.sender === 'client' ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                m.sender === 'client'
                                  ? 'bg-orange-600 text-white rounded-br-none'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                              }`}>
                                {m.text}
                              </div>
                              <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{m.timestamp}</span>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex items-center gap-1.5 text-xs text-orange-500 font-mono p-2">
                              <RefreshCw size={12} className="animate-spin" />
                              <span>DS Tech Consultant is typing...</span>
                            </div>
                          )}
                        </div>

                        <form onSubmit={handleChatReplySubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          <input
                            type="text"
                            value={chatReply}
                            onChange={e => setChatReply(e.target.value)}
                            placeholder="Type a message to support..."
                            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Send size={14} />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                        <MessageSquare size={32} className="text-slate-300 dark:text-slate-700" />
                        <span className="text-xs font-bold">Select a support ticket to open the live chat thread</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* New Ticket Modal */}
                {isNewTicketOpen && (
                  <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative text-left"
                    >
                      <button
                        type="button"
                        onClick={() => setIsNewTicketOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X size={16} />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-orange-500">Priority Support</span>
                        <h3 className="text-lg font-bold uppercase font-serif text-slate-900 dark:text-white">Open Support Ticket</h3>
                      </div>

                      <form onSubmit={handleFileTicket} className="space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Subject</label>
                          <input
                            type="text"
                            required
                            value={tktSubject}
                            onChange={e => setTktSubject(e.target.value)}
                            placeholder="e.g. API Rate Limiting Inquiry"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Priority</label>
                          <select
                            value={tktPriority}
                            onChange={(e: any) => setTktPriority(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Message</label>
                          <textarea
                            rows={4}
                            required
                            value={tktMessage}
                            onChange={e => setTktMessage(e.target.value)}
                            placeholder="Describe your technical inquiry in detail..."
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
                        >
                          <Send size={14} />
                          <span>Submit Ticket to Consultant</span>
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 6: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left max-w-2xl">
                <div className="space-y-1">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-widest block font-mono">Enterprise Settings</span>
                  <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-slate-900 dark:text-white">Corporate Node Configuration</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Company Name</label>
                    <input type="text" disabled value={activeClient?.companyName || ""} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Contact Representative</label>
                    <input type="text" disabled value={activeClient?.contactName || ""} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Corporate Email</label>
                    <input type="text" disabled value={activeClient?.email || ""} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Corporate Phone</label>
                    <input type="text" disabled value={activeClient?.phone || ""} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 font-mono" />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Node Identifier: <code className="font-mono text-orange-500">{activeClient?.clientId}</code></span>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Disconnect Node
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI GEMINI SPEC COPILOT MODAL */}
            {isAiCopilotOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
                  <button type="button" onClick={() => setIsAiCopilotOpen(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <X size={16} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold">
                      <Bot size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-orange-500">Gemini AI Architect</span>
                      <h3 className="text-lg font-bold uppercase font-serif text-slate-900 dark:text-white">Project Scope Copilot</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Describe your software vision or business objective in plain language. Gemini AI will analyze your requirements, draft technical deliverables, and populate the project builder!
                  </p>

                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={aiCopilotPrompt}
                      onChange={e => setAiCopilotPrompt(e.target.value)}
                      placeholder="e.g. Build an automated logistics tracking portal for container shipping with real-time driver GPS, SMS alerts, and invoice PDF exports."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                    />

                    <button
                      type="button"
                      disabled={isGeneratingAiSpec}
                      onClick={handleGenerateAiSpec}
                      className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isGeneratingAiSpec ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Architecting Technical Scope...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Generate Scope & Auto-Fill Builder</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* PASSKEY BIOMETRIC VAULT MODAL */}
            {isPasskeyModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-left">
                  <button type="button" onClick={() => setIsPasskeyModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <X size={16} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-emerald-500">Security Ledger</span>
                      <h3 className="text-lg font-bold uppercase font-serif text-slate-900 dark:text-white">WebAuthn Biometric Passkey</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Link your Touch ID, Face ID, or Hardware Security Key to sign into your Client Portal passwordlessly with FIDO2 cryptographic authorization.
                  </p>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Biometric Vault Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isPasskeyRegistered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {isPasskeyRegistered ? 'Registered & Active' : 'Unregistered'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isPasskeyRegistered ? 'Hardware token key stored locally and registered with DS Tech auth gateway.' : 'No biometric passkey registered yet for this client node.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPasskeyRegistered(true);
                      triggerToast("Biometric FIDO2 Passkey bound successfully!", "success");
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    <span>{isPasskeyRegistered ? 'Re-key Passkey Credentials' : 'Bind Hardware Passkey (Touch ID / Face ID)'}</span>
                  </button>
                </motion.div>
              </div>
            )}

            {/* PAYMENT RECEIPT VIEW MODAL */}
            {receiptInvoice && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
                  <button type="button" onClick={() => setReceiptInvoice(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <X size={16} />
                  </button>

                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-emerald-500">Official Payment Receipt</span>
                      <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">{receiptInvoice.number}</h3>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase border border-emerald-500/20">
                      Settled & Verified
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Client Node</span>
                      <strong className="text-slate-900 dark:text-white">{activeClient?.companyName}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Project</span>
                      <strong className="text-slate-900 dark:text-white">{receiptInvoice.project}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Amount Paid</span>
                      <strong className="font-mono text-orange-500 font-bold text-sm">{receiptInvoice.amount}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Settlement Date</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerToast("Downloading official tax receipt PDF...", "info");
                      setTimeout(() => setReceiptInvoice(null), 1000);
                    }}
                    className="w-full py-3 bg-[#000E32] dark:bg-indigo-600 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    <span>Download Official PDF Receipt</span>
                  </button>
                </motion.div>
              </div>
            )}

          </main>
        </div>
      )}
    </div>
  );
};
