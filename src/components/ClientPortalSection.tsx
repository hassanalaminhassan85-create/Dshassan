import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Layers, CheckCircle2, AlertCircle, FileText, Download, 
  MessageSquare, Plus, Ticket, Landmark, Clock, Send, Eye, EyeOff,
  User, Mail, Key, Phone, ShieldCheck, Briefcase, ChevronRight,
  CreditCard, Lock, X, Coins, LogOut, RefreshCw, ArrowLeft
} from 'lucide-react';
import { Logo } from './Logo';

// Define Client types
export interface ClientProject {
  id: string;
  name: string;
  status: 'planning' | 'progress' | 'review' | 'completed';
  progress: number;
  deadline: string;
  clientName: string;
  budget: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  project: string;
}

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

// default guest credentials
const GUEST_COMPANY = {
  companyName: "Garki Logistics Ltd",
  contactName: "Musa Ibrahim",
  email: "musa@garkilogistics.com",
  phone: "+234 902 348 9111",
  focus: "Incorporation & Campaigns",
  budget: "₦2,000,000+",
  clientId: "client_garki_logistics"
};

// Seed datasets matching the registered focus areas
const getSeedDataForFocus = (focus: string, companyName: string, budget: string) => {
  const dateStr = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const formattedBudget = budget || "₦350,000";

  let projects: ClientProject[] = [];
  let invoices: Invoice[] = [];
  let tickets: SupportTicket[] = [];

  if (focus === 'incorporation') {
    projects = [
      { id: "proj_inc_1", name: "CAC Limited Liability Incorporation Filing", status: "completed", progress: 100, deadline: dateStr(-3), clientName: companyName, budget: "₦85,000" },
      { id: "proj_inc_2", name: "FIRS Tax Identification Number (TIN) Generation", status: "progress", progress: 65, deadline: dateStr(5), clientName: companyName, budget: "₦25,000" },
      { id: "proj_inc_3", name: "SCUML Anti-Money Laundering Certification", status: "planning", progress: 15, deadline: dateStr(15), clientName: companyName, budget: "₦40,000" }
    ];
    invoices = [
      { id: "inv_inc_1", number: "INV-2026-CAC01", amount: "₦85,000", date: dateStr(-10), dueDate: dateStr(-5), status: "paid", project: "CAC Limited Liability Incorporation Filing" },
      { id: "inv_inc_2", number: "INV-2026-CAC02", amount: "₦25,000", date: dateStr(-2), dueDate: dateStr(5), status: "unpaid", project: "FIRS Tax Identification Number (TIN) Generation" },
      { id: "inv_inc_3", number: "INV-2026-CAC03", amount: "₦40,000", date: dateStr(0), dueDate: dateStr(10), status: "unpaid", project: "SCUML Anti-Money Laundering Certification" }
    ];
    tickets = [
      { 
        id: "tkt_inc_1", 
        subject: "CAC Incorporation Soft-Copy Certificate Request", 
        priority: "medium", 
        status: "resolved", 
        date: dateStr(-2), 
        lastMessage: "The signed certificate has been generated and appended.",
        messages: [
          { id: "msg_1", sender: "client", text: "Hello, when can we expect the digital copy of our certified true copy?", timestamp: "10:30 AM" },
          { id: "msg_2", sender: "support", text: "Hello! Our compliance consultant has uploaded the stamped CAC certificate to your secure ledger portal folder. You can download the PDF statement anytime.", timestamp: "11:15 AM" }
        ]
      }
    ];
  } else if (focus === 'marketing') {
    projects = [
      { id: "proj_mkt_1", name: "Sponsored Ad Funnel Strategy Audit", status: "completed", progress: 100, deadline: dateStr(-5), clientName: companyName, budget: "₦100,000" },
      { id: "proj_mkt_2", name: "Meta Lead Campaign Optimization & Bidding", status: "progress", progress: 75, deadline: dateStr(7), clientName: companyName, budget: formattedBudget },
      { id: "proj_mkt_3", name: "TikTok Conversions Retargeting Setup", status: "planning", progress: 5, deadline: dateStr(25), clientName: companyName, budget: "₦150,000" }
    ];
    invoices = [
      { id: "inv_mkt_1", number: "INV-2026-MKT01", amount: "₦100,000", date: dateStr(-12), dueDate: dateStr(-8), status: "paid", project: "Sponsored Ad Funnel Strategy Audit" },
      { id: "inv_mkt_2", number: "INV-2026-MKT02", amount: formattedBudget, date: dateStr(-4), dueDate: dateStr(2), status: "unpaid", project: "Meta Lead Campaign Optimization & Bidding" }
    ];
    tickets = [
      {
        id: "tkt_mkt_1",
        subject: "Ads Pixel Integration and Domain Verification",
        priority: "high",
        status: "open",
        date: dateStr(-1),
        lastMessage: "Let's align on Meta conversion API setup.",
        messages: [
          { id: "msg_1", sender: "client", text: "Our server-side pixel isn't reporting conversions on the contact thank you page correctly.", timestamp: "Yesterday" },
          { id: "msg_2", sender: "support", text: "Welcome! Our team is checking the custom Node payload response of your webhook. Please keep the server online.", timestamp: "Yesterday" }
        ]
      }
    ];
  } else {
    // default Web & AI software seed
    projects = [
      { id: "proj_dev_1", name: "Technical Requirements Spec & Figma Mockups", status: "completed", progress: 100, deadline: dateStr(-7), clientName: companyName, budget: "₦250,000" },
      { id: "proj_dev_2", name: "React 19 Frontend Web Engineering Portal", status: "progress", progress: 45, deadline: dateStr(18), clientName: companyName, budget: formattedBudget },
      { id: "proj_dev_3", name: "Gemini Custom Assistant AI Agent Integration", status: "planning", progress: 0, deadline: dateStr(45), clientName: companyName, budget: "₦600,000" }
    ];
    invoices = [
      { id: "inv_dev_1", number: "INV-2026-DEV01", amount: "₦250,000", date: dateStr(-15), dueDate: dateStr(-10), status: "paid", project: "Technical Requirements Spec & Figma Mockups" },
      { id: "inv_dev_2", number: "INV-2026-DEV02", amount: formattedBudget, date: dateStr(-1), dueDate: dateStr(10), status: "unpaid", project: "React 19 Frontend Web Engineering Portal" }
    ];
    tickets = [
      {
        id: "tkt_dev_1",
        subject: "API Keys and Secure Domain Whitelisting",
        priority: "high",
        status: "open",
        date: dateStr(0),
        lastMessage: "How do we coordinate our secret env configuration?",
        messages: [
          { id: "msg_1", sender: "client", text: "We need to whitelist our dev domains. Can you assist?", timestamp: "Today" }
        ]
      }
    ];
  }

  return { projects, invoices, tickets };
};

export const ClientPortalSection: React.FC = () => {
  // Theme dark sync state
  const [isDark, setIsDark] = useState(true);

  // Auth screen state
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [isLogged, setIsLogged] = useState(false);

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
  const [regFocus, setRegFocus] = useState('marketing');
  const [regBudget, setRegBudget] = useState('₦350,000');

  // Active client session details
  const [activeClient, setActiveClient] = useState<ClientUser | null>(null);

  // Active dashboard lists
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Sub-actions
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newMsg, setNewMsg] = useState('');

  // Selected chat ticket
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Checkout modal
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCardNum, setPaymentCardNum] = useState('4000 1234 5678 9010');
  const [paymentPin, setPaymentPin] = useState('****');

  // Custom visual feedback notifications (built-in elegant alert toasts)
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'success' | 'info' | 'error' }>>([]);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Sync state with HTML dark-mode state
  useEffect(() => {
    const isRootDark = document.documentElement.classList.contains('dark');
    setIsDark(isRootDark);

    // load existing corporate session
    const savedSession = localStorage.getItem('ds_tech_client_session');
    if (savedSession) {
      try {
        const clientObj = JSON.parse(savedSession);
        setActiveClient(clientObj);
        setIsLogged(true);

        // load their local lists
        const localProjects = localStorage.getItem(`ds_projects_${clientObj.clientId}`);
        const localInvoices = localStorage.getItem(`ds_invoices_${clientObj.clientId}`);
        const localTickets = localStorage.getItem(`ds_tickets_${clientObj.clientId}`);

        if (localProjects && localInvoices && localTickets) {
          setProjects(JSON.parse(localProjects));
          setInvoices(JSON.parse(localInvoices));
          setTickets(JSON.parse(localTickets));
        } else {
          // fetch seed
          const seeds = getSeedDataForFocus(clientObj.focus, clientObj.companyName, clientObj.budget);
          setProjects(seeds.projects);
          setInvoices(seeds.invoices);
          setTickets(seeds.tickets);
          // persist
          localStorage.setItem(`ds_projects_${clientObj.clientId}`, JSON.stringify(seeds.projects));
          localStorage.setItem(`ds_invoices_${clientObj.clientId}`, JSON.stringify(seeds.invoices));
          localStorage.setItem(`ds_tickets_${clientObj.clientId}`, JSON.stringify(seeds.tickets));
        }
      } catch (e) {
        console.error("Failed to recover client session", e);
      }
    }
  }, []);

  // Sync client list state to localStorage
  const saveClientDataToLocal = (clientId: string, projs: ClientProject[], invs: Invoice[], tkts: SupportTicket[]) => {
    localStorage.setItem(`ds_projects_${clientId}`, JSON.stringify(projs));
    localStorage.setItem(`ds_invoices_${clientId}`, JSON.stringify(invs));
    localStorage.setItem(`ds_tickets_${clientId}`, JSON.stringify(tkts));
  };

  // Corporate login action
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinEmail || !signinPassword) {
      triggerToast("Please enter both email and password.", "error");
      return;
    }

    // Check registered clients
    const savedClientsRaw = localStorage.getItem('ds_tech_registered_clients');
    const registeredClients: ClientUser[] = savedClientsRaw ? JSON.parse(savedClientsRaw) : [];
    
    // Check if matching guest/seed or registered
    let foundClient: ClientUser | null = null;

    if (signinEmail.toLowerCase() === GUEST_COMPANY.email.toLowerCase()) {
      foundClient = GUEST_COMPANY;
    } else {
      const match = registeredClients.find(c => c.email.toLowerCase() === signinEmail.toLowerCase());
      if (match) {
        foundClient = match;
      }
    }

    if (foundClient) {
      setActiveClient(foundClient);
      setIsLogged(true);
      localStorage.setItem('ds_tech_client_session', JSON.stringify(foundClient));

      // load client lists
      const localProjects = localStorage.getItem(`ds_projects_${foundClient.clientId}`);
      const localInvoices = localStorage.getItem(`ds_invoices_${foundClient.clientId}`);
      const localTickets = localStorage.getItem(`ds_tickets_${foundClient.clientId}`);

      if (localProjects && localInvoices && localTickets) {
        setProjects(JSON.parse(localProjects));
        setInvoices(JSON.parse(localInvoices));
        setTickets(JSON.parse(localTickets));
      } else {
        const seeds = getSeedDataForFocus(foundClient.focus, foundClient.companyName, foundClient.budget);
        setProjects(seeds.projects);
        setInvoices(seeds.invoices);
        setTickets(seeds.tickets);
        saveClientDataToLocal(foundClient.clientId, seeds.projects, seeds.invoices, seeds.tickets);
      }

      triggerToast(`Welcome back, ${foundClient.contactName}! ${foundClient.companyName} portal node active.`, "success");
    } else {
      triggerToast("No matching enterprise node or password found.", "error");
    }
  };

  // Corporate Registration action
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompanyName || !regContactName || !regEmail || !regPassword || !regPhone) {
      triggerToast("Please fill all corporate verification parameters.", "error");
      return;
    }

    const clientId = "client_" + Math.random().toString(36).substring(2, 8);
    const newClient: ClientUser = {
      companyName: regCompanyName,
      contactName: regContactName,
      email: regEmail,
      phone: regPhone,
      focus: regFocus,
      budget: regBudget,
      clientId
    };

    // save to registered clients
    const savedClientsRaw = localStorage.getItem('ds_tech_registered_clients');
    const registeredClients: ClientUser[] = savedClientsRaw ? JSON.parse(savedClientsRaw) : [];
    
    // check if email already registered
    if (registeredClients.some(c => c.email.toLowerCase() === regEmail.toLowerCase()) || regEmail.toLowerCase() === GUEST_COMPANY.email.toLowerCase()) {
      triggerToast("An enterprise ledger already exists for this email address.", "error");
      return;
    }

    registeredClients.push(newClient);
    localStorage.setItem('ds_tech_registered_clients', JSON.stringify(registeredClients));

    // generate custom seed lists matching their budget & needs
    const seeds = getSeedDataForFocus(regFocus, regCompanyName, regBudget);
    
    // instantly login
    setActiveClient(newClient);
    setIsLogged(true);
    setProjects(seeds.projects);
    setInvoices(seeds.invoices);
    setTickets(seeds.tickets);

    localStorage.setItem('ds_tech_client_session', JSON.stringify(newClient));
    saveClientDataToLocal(clientId, seeds.projects, seeds.invoices, seeds.tickets);

    triggerToast(`Congratulations! Enterprise node ${regCompanyName} is registered and synchronized.`, "success");
  };

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('ds_tech_client_session');
    setActiveClient(null);
    setIsLogged(false);
    setSelectedTicket(null);
    triggerToast("Ledger connection closed successfully.", "info");
  };

  // Demo Garki sign in shortcut
  const handleDemoLogin = () => {
    setActiveClient(GUEST_COMPANY);
    setIsLogged(true);
    localStorage.setItem('ds_tech_client_session', JSON.stringify(GUEST_COMPANY));

    const localProjects = localStorage.getItem(`ds_projects_${GUEST_COMPANY.clientId}`);
    const localInvoices = localStorage.getItem(`ds_invoices_${GUEST_COMPANY.clientId}`);
    const localTickets = localStorage.getItem(`ds_tickets_${GUEST_COMPANY.clientId}`);

    if (localProjects && localInvoices && localTickets) {
      setProjects(JSON.parse(localProjects));
      setInvoices(JSON.parse(localInvoices));
      setTickets(JSON.parse(localTickets));
    } else {
      const seeds = getSeedDataForFocus(GUEST_COMPANY.focus, GUEST_COMPANY.companyName, GUEST_COMPANY.budget);
      setProjects(seeds.projects);
      setInvoices(seeds.invoices);
      setTickets(seeds.tickets);
      saveClientDataToLocal(GUEST_COMPANY.clientId, seeds.projects, seeds.invoices, seeds.tickets);
    }
    triggerToast("Logged in with pre-populated demo node: Garki Logistics Ltd.", "success");
  };

  // Interactive Ticket Filing state
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMsg || !activeClient) return;

    const newTkt: SupportTicket = {
      id: "tkt_" + Math.random().toString(36).substring(2, 7),
      subject: newSubject,
      priority: newPriority,
      status: "open",
      date: new Date().toISOString().split('T')[0],
      lastMessage: newMsg,
      messages: [
        { id: "m_init", sender: "client", text: newMsg, timestamp: "Just now" }
      ]
    };

    const updated = [newTkt, ...tickets];
    setTickets(updated);
    setIsNewTicketOpen(false);
    setNewSubject('');
    setNewMsg('');
    saveClientDataToLocal(activeClient.clientId, projects, invoices, updated);
    triggerToast("Support ticket opened. Technical ledger consultant notified.", "success");
  };

  // Support thread real-time reply simulation
  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket || !activeClient) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgObj = {
      id: "msg_" + Math.random().toString(36).substring(2, 7),
      sender: 'client' as const,
      text: replyText,
      timestamp
    };

    const updatedMessages = [...(selectedTicket.messages || []), newMsgObj];
    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      lastMessage: replyText,
      messages: updatedMessages
    };

    // update state lists
    const updatedList = tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t);
    setTickets(updatedList);
    setSelectedTicket(updatedTicket);
    setReplyText('');
    saveClientDataToLocal(activeClient.clientId, projects, invoices, updatedList);

    // Simulate Agent response with natural typing delay
    setIsTyping(true);
    setTimeout(() => {
      const repTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let replyResponse = "Understood. Our systems engineer is reviewing your corporate credentials and database logs. We will notify you here shortly.";
      
      const lower = replyText.toLowerCase();
      if (lower.includes("invoice") || lower.includes("pay") || lower.includes("billing")) {
        replyResponse = "Corporate financial desk has acknowledged your query. For instant settlements, click the 'Pay Now' button next to the outstanding invoice in your roadmap financial log.";
      } else if (lower.includes("cac") || lower.includes("certificate") || lower.includes("incorporation")) {
        replyResponse = "Regarding your Corporate Affairs Commission registry: We are validating the name reservation logs against Abuja corporate registries. All files will sync within 24 hours.";
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        replyResponse = `Hello ${activeClient.contactName}! Thank you for keeping your client node online. Let us know how we can accelerate your deliverables roadmap today.`;
      }

      const agentMsg = {
        id: "msg_agent_" + Math.random().toString(36).substring(2, 7),
        sender: 'support' as const,
        text: replyResponse,
        timestamp: repTimestamp
      };

      const finalMessages = [...updatedMessages, agentMsg];
      const finalizedTicket: SupportTicket = {
        ...updatedTicket,
        lastMessage: replyResponse,
        messages: finalMessages
      };

      const finalTicketsList = updatedList.map(t => t.id === selectedTicket.id ? finalizedTicket : t);
      setTickets(finalTicketsList);
      setSelectedTicket(finalizedTicket);
      setIsTyping(false);
      saveClientDataToLocal(activeClient.clientId, projects, invoices, finalTicketsList);
      triggerToast("Received secure update from DS Tech Representative", "info");
    }, 1800);
  };

  // Pay Invoice
  const handlePayInvoice = (invoice: Invoice) => {
    setPaymentInvoice(invoice);
  };

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || !activeClient) return;

    setPaymentProcessing(true);
    setTimeout(() => {
      // update invoice status to 'paid'
      const updatedInvoices = invoices.map(inv => inv.id === paymentInvoice.id ? { ...inv, status: 'paid' as const } : inv);
      setInvoices(updatedInvoices);

      // also check if we can bump up corresponding project progress as a fun feature!
      const relatedProj = projects.map(p => {
        if (p.name === paymentInvoice.project) {
          return { ...p, progress: Math.min(p.progress + 25, 100), status: p.progress + 25 >= 100 ? 'completed' as const : 'progress' as const };
        }
        return p;
      });
      setProjects(relatedProj);

      saveClientDataToLocal(activeClient.clientId, relatedProj, updatedInvoices, tickets);
      setPaymentProcessing(false);
      setPaymentInvoice(null);
      triggerToast(`Successfully paid ${paymentInvoice.amount}! Cryptographic transaction receipt logged to SCUML ledger.`, "success");
    }, 2200);
  };

  const downloadInvoiceReceipt = (inv: Invoice) => {
    triggerToast(`Generating secure PDF statement for ${inv.number}...`, "info");
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([
        `DS TECH ENTERPRISE TRANSACTION INVOICE\n` +
        `----------------------------------------\n` +
        `Receipt Number: ${inv.number}\n` +
        `Associated Corporate Node: ${activeClient?.companyName || "Client"}\n` +
        `Deliverable: ${inv.project}\n` +
        `Amount Settled: ${inv.amount}\n` +
        `Date Issued: ${inv.date}\n` +
        `Settlement Status: ${inv.status.toUpperCase()}\n` +
        `----------------------------------------\n` +
        `Validated via Secure Garki Digital Hub. SCUML Code: DSC-2026-FIRS\n`
      ], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `DS-Tech-Receipt-${inv.number}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      triggerToast("Invoice receipt file downloaded.", "success");
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12 animate-fade-in text-left text-slate-800 dark:text-slate-100 relative min-h-[700px]">
      
      {/* Visual elegant notifications floating panel */}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border pointer-events-auto ${
                t.type === 'success' 
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : t.type === 'error'
                    ? 'bg-white dark:bg-slate-900 border-red-500/30 text-red-500'
                    : 'bg-white dark:bg-slate-900 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : t.type === 'error' ? (
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              ) : (
                <InfoIcon size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-semibold leading-tight">{t.msg}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isLogged ? (
        /* ================= AUTHENTICATION GATE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto rounded-[2rem] overflow-hidden border border-gray-200/60 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950">
          
          {/* Brand Presentation Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full filter blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 rounded-full filter blur-[80px] pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <Logo size="lg" showText={true} variant="light" />
              <div className="h-0.5 w-12 bg-orange-500 mt-6" />
            </div>

            <div className="space-y-6 my-10 relative z-10">
              <span className="text-orange-400 font-bold uppercase text-[10px] tracking-widest font-mono block">Enterprise Node Access</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif uppercase tracking-tight leading-tight">
                Secure Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 italic">Ledger Hub</span>
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed font-light">
                Sign in to manage limited liability filings, corporate ad campaigns, check active engineering milestones, or open priority support tickets directly.
              </p>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-orange-400 font-bold text-[10px]">1</div>
                  <span>Real-time milestone progress tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-orange-400 font-bold text-[10px]">2</div>
                  <span>Escrow-linked transparent invoice settling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-orange-400 font-bold text-[10px]">3</div>
                  <span>24/7 priority support with active typist delay</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 relative z-10 mt-auto">
              <ShieldCheck size={12} className="text-emerald-400 animate-pulse" />
              <span>Cryptographic Access Secured</span>
            </div>
          </div>

          {/* Forms Interactive Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            
            {/* Quick Demo Login Box at top */}
            <div className="mb-6 p-4 bg-[#000E32]/5 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
                  <Building2 size={16} />
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-slate-900 dark:text-white block">Reviewer Convenience portal</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Bypass login and inspect live dashboard instantly</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full sm:w-auto px-4 py-2 bg-[#000E32] hover:bg-orange-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Demo One-Click Login</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Form tab selectors */}
            <div className="flex border-b border-gray-100 dark:border-slate-800 mb-6">
              <button
                onClick={() => { setActiveTab('signin'); triggerHaptic(5); }}
                className={`flex-1 pb-3 text-xs uppercase font-black tracking-widest border-b-2 transition-all ${
                  activeTab === 'signin'
                    ? 'border-orange-500 text-[#000E32] dark:text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Corporate Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); triggerHaptic(5); }}
                className={`flex-1 pb-3 text-xs uppercase font-black tracking-widest border-b-2 transition-all ${
                  activeTab === 'register'
                    ? 'border-orange-500 text-[#000E32] dark:text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Register Company
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'signin' ? (
                /* Corporate Sign In Form */
                <motion.form
                  key="signin-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSignIn}
                  className="space-y-4 text-left text-xs"
                >
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Corporate Email Address</label>
                    <div className="relative flex items-center">
                      <Mail size={14} className="absolute left-3.5 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-slate-800 dark:text-white"
                        placeholder="e.g. musa@garkilogistics.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Security Password</label>
                    <div className="relative flex items-center">
                      <Key size={14} className="absolute left-3.5 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-slate-800 dark:text-white"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                  >
                    <Lock size={12} />
                    <span>Establish Client Node Connection</span>
                  </button>
                </motion.form>
              ) : (
                /* Corporate Registration Form */
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegister}
                  className="space-y-4 text-left text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Company Name</label>
                      <div className="relative flex items-center">
                        <Building2 size={14} className="absolute left-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={regCompanyName}
                          onChange={(e) => setRegCompanyName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white"
                          placeholder="e.g. Acme Industries Ltd"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Contact Representative</label>
                      <div className="relative flex items-center">
                        <User size={14} className="absolute left-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={regContactName}
                          onChange={(e) => setRegContactName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Corporate Email</label>
                      <div className="relative flex items-center">
                        <Mail size={14} className="absolute left-3.5 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white"
                          placeholder="e.g. contact@acme.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Corporate Phone</label>
                      <div className="relative flex items-center">
                        <Phone size={14} className="absolute left-3.5 text-slate-400" />
                        <input 
                          type="tel" 
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white"
                          placeholder="e.g. +234 803 123 4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Primary Project Need</label>
                      <div className="relative flex items-center">
                        <Briefcase size={14} className="absolute left-3.5 text-slate-400" />
                        <select
                          value={regFocus}
                          onChange={(e) => setRegFocus(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white appearance-none"
                        >
                          <option value="incorporation">CAC Corporate Incorporation</option>
                          <option value="marketing">Sponsored Ads Campaigns</option>
                          <option value="software">Web & AI Software Systems</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Estimated Budget Tier</label>
                      <div className="relative flex items-center">
                        <Coins size={14} className="absolute left-3.5 text-slate-400" />
                        <select
                          value={regBudget}
                          onChange={(e) => setRegBudget(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white appearance-none"
                        >
                          <option value="₦85,000">₦85,000 – ₦250,000</option>
                          <option value="₦350,000">₦250,000 – ₦1,000,000</option>
                          <option value="₦1,500,000">₦1,000,000 – ₦5,000,000+</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">Security Password</label>
                    <div className="relative flex items-center">
                      <Key size={14} className="absolute left-3.5 text-slate-400" />
                      <input 
                        type="password" 
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-white"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#000E32] to-[#011442] dark:from-orange-600 dark:to-orange-500 hover:from-[#000E32]/90 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                  >
                    <ShieldCheck size={12} className="text-orange-400" />
                    <span>Register Corporate Node Ledger</span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* ================= PERSONALIZED CORPORATE DASHBOARD ================= */
        <div className="space-y-8 animate-fade-in">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200/60 dark:border-slate-800 shadow-sm">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-widest block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ledger Node Connected: {activeClient?.clientId.toUpperCase()}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase font-serif text-[#000E32] dark:text-white">
                {activeClient?.companyName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 italic">Console</span>
              </h1>
              <p className="text-slate-400 text-[11px] font-medium">
                Active Client Node Representative: <span className="text-slate-600 dark:text-slate-200 font-bold">{activeClient?.contactName}</span> ({activeClient?.phone})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-white hover:bg-red-50 dark:bg-slate-950 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-slate-850 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <LogOut size={12} />
                <span>Disconnect Node</span>
              </button>
            </div>
          </div>

          {/* OVERVIEW STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div className="text-left">
                <span className="text-slate-400 text-[9px] font-extrabold uppercase tracking-widest block">Active Projects</span>
                <span className="text-lg font-serif font-black text-slate-900 dark:text-white">
                  {projects.filter(p => p.status !== 'completed').length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-left">
                <span className="text-slate-400 text-[9px] font-extrabold uppercase tracking-widest block">Completed Milestones</span>
                <span className="text-lg font-serif font-black text-slate-900 dark:text-white">
                  {projects.filter(p => p.status === 'completed').length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <Landmark size={18} />
              </div>
              <div className="text-left">
                <span className="text-slate-400 text-[9px] font-extrabold uppercase tracking-widest block">Unpaid Invoices</span>
                <span className="text-lg font-serif font-black text-slate-900 dark:text-white">
                  {invoices.filter(i => i.status === 'unpaid').length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                <Ticket size={18} />
              </div>
              <div className="text-left">
                <span className="text-slate-400 text-[9px] font-extrabold uppercase tracking-widest block">Support Desk</span>
                <span className="text-lg font-serif font-black text-slate-900 dark:text-white">
                  {tickets.filter(t => t.status === 'open').length} Open
                </span>
              </div>
            </div>
          </div>

          {/* PROJECT ROADMAPS & BILLING MODULE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Project progress milestones column */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight">
                  Milestones & Roadmap Deliverables
                </h3>
                <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-slate-850">
                  Target Field: {activeClient?.focus.toUpperCase()}
                </span>
              </div>

              <div className="space-y-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="space-y-3.5 p-5 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800/60">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="text-left">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-serif">{proj.name}</h4>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase mt-0.5">Deadline Target: {proj.deadline} • Budget Node: {proj.budget}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        proj.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        proj.status === 'progress' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <span>Task Progression</span>
                        <span>{proj.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>

                    {/* Step milestones */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/30 text-center text-[9px] font-black uppercase tracking-wider">
                      <div className={proj.progress >= 10 ? "text-orange-500 font-bold" : "text-slate-400 font-normal"}>Planning</div>
                      <div className={proj.progress >= 40 ? "text-orange-500 font-bold" : "text-slate-400 font-normal"}>Execution</div>
                      <div className={proj.progress >= 75 ? "text-orange-500 font-bold" : "text-slate-400 font-normal"}>Review</div>
                      <div className={proj.progress === 100 ? "text-emerald-500 font-bold" : "text-slate-400 font-normal"}>Signed Off</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial ledger & documents column */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-sm">
              <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight border-b border-gray-100 dark:border-slate-800 pb-3">
                Financial Ledger & Invoices
              </h3>

              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800/40 text-xs flex flex-col justify-between gap-3 shadow-inner">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 text-left">
                        <span className="font-black text-slate-900 dark:text-white block font-serif uppercase text-xs">{inv.number}</span>
                        <span className="text-[10px] text-slate-400 block font-bold">{inv.project}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Due Target: {inv.dueDate}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-slate-800 dark:text-orange-400 block">{inv.amount}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase inline-block mt-1 ${
                          inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
                      <button 
                        onClick={() => downloadInvoiceReceipt(inv)}
                        className="p-1.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer border border-transparent hover:border-orange-500/10"
                        title="Download Statement"
                      >
                        <Download size={11} />
                        <span>Receipt</span>
                      </button>
                      
                      {inv.status !== 'paid' && (
                        <button 
                          onClick={() => handlePayInvoice(inv)}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                        >
                          <CreditCard size={11} />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SUPPORT TICKETS SECTION */}
          <section className="bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-left shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight">
                  Support Desk & Secure Messaging
                </h3>
                <p className="text-[10px] text-slate-400">Direct encrypted pipeline with Abuja senior consultants</p>
              </div>
              <button
                onClick={() => { setIsNewTicketOpen(!isNewTicketOpen); triggerHaptic(5); }}
                className="px-3.5 py-2 bg-[#000E32] dark:bg-orange-600 text-white text-[10px] font-bold uppercase rounded-xl tracking-wider flex items-center gap-1 cursor-pointer hover:bg-orange-600 dark:hover:bg-orange-500 transition-all shadow-sm"
              >
                <Plus size={12} />
                <span>File New Ticket</span>
              </button>
            </div>

            {/* Conditional New Ticket Form */}
            <AnimatePresence>
              {isNewTicketOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleCreateTicket}
                  className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 text-xs space-y-4 overflow-hidden text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Subject Description</label>
                      <input 
                        type="text" 
                        required
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                        placeholder="e.g. Host server webhook response lag"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Priority Level</label>
                      <select 
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none appearance-none"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High (Immediate Response)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Message Description</label>
                    <textarea 
                      required
                      rows={3}
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
                      placeholder="Explain your technical query or milestone barrier in detail..."
                    />
                  </div>
                  <div className="flex justify-end gap-2.5">
                    <button 
                      type="button" 
                      onClick={() => setIsNewTicketOpen(false)}
                      className="px-4 py-1.5 bg-gray-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Tickets Grid / Active Chat Port */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Ticket List Panel */}
              <div className="lg:col-span-5 space-y-3.5">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-widest text-left">Filed Support Tickets</span>
                {tickets.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-slate-400">
                    No filed tickets found. Open a new ticket for support.
                  </div>
                ) : (
                  tickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTicket(t); triggerHaptic(3); }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs space-y-2.5 block cursor-pointer ${
                        selectedTicket?.id === t.id
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400'
                          : 'bg-white dark:bg-slate-950 border-gray-200/50 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold font-serif uppercase line-clamp-1">{t.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          t.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-slate-400/10 text-slate-400'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-300 text-[11px] font-light line-clamp-1 leading-relaxed">{t.lastMessage}</p>
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold border-t border-slate-200/10 pt-1.5">
                        <span className="font-mono">{t.date}</span>
                        <span className="uppercase text-orange-500 font-black">{t.status}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Chat Thread Panel */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-slate-800 p-5 rounded-2xl h-[340px] flex flex-col justify-between relative overflow-hidden shadow-inner">
                {selectedTicket ? (
                  <div className="flex flex-col justify-between h-full space-y-4">
                    
                    {/* Header */}
                    <div className="text-[10px] font-mono font-bold text-slate-400 border-b border-gray-200/20 dark:border-slate-800/40 pb-2 flex justify-between items-center">
                      <span>SECURE TICKET LINK: {selectedTicket.id.toUpperCase()}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-black uppercase">{selectedTicket.status}</span>
                    </div>
                    
                    {/* Message Log */}
                    <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                      {selectedTicket.messages?.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[85%] ${msg.sender === 'client' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          <div className={`p-3 rounded-2xl text-xs text-left ${
                            msg.sender === 'client' 
                              ? 'bg-orange-500 text-white rounded-tr-none shadow-sm' 
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-gray-200/50 dark:border-slate-800 rounded-tl-none shadow-sm'
                          }`}>
                            <span className="text-[8px] text-slate-400 font-black block mb-1 tracking-wider uppercase">
                              {msg.sender === 'client' ? 'You (Corporate Admin)' : 'DS Tech Representative'}
                            </span>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-[8px] text-slate-400 mt-0.5 font-bold">{msg.timestamp}</span>
                        </div>
                      ))}

                      {/* Typist delay feedback simulation */}
                      {isTyping && (
                        <div className="flex flex-col max-w-[85%] mr-auto items-start">
                          <div className="p-3 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1 font-mono">Assigned Partner Consultant Typing...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Inputs */}
                    <form onSubmit={handleTicketReply} className="relative bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-850 p-1.5 rounded-xl flex items-center shadow-md">
                      <input 
                        type="text" 
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type reply to consultant desk..." 
                        className="w-full bg-transparent text-xs px-3 focus:outline-none text-slate-800 dark:text-slate-200"
                      />
                      <button 
                        type="submit"
                        className="p-2 rounded-lg bg-[#000E32] dark:bg-orange-600 text-white cursor-pointer hover:bg-orange-500 transition-colors"
                      >
                        <Send size={12} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <MessageSquare size={36} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">No Active Support Connection</span>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">Click any filed ticket on the left to verify cryptographic messaging trails and chat directly with your assigned coordinator.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= INVOICE PAYMENT MODAL DIALOG ================= */}
      <AnimatePresence>
        {paymentInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaymentInvoice(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left text-xs space-y-6"
            >
              <button 
                onClick={() => setPaymentInvoice(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white dark:bg-slate-950 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="space-y-1.5">
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest block font-mono">Secure Escrow Checkout</span>
                <h3 className="text-lg font-bold font-serif uppercase tracking-tight text-[#000E32] dark:text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  Settle Invoice Node
                </h3>
                <p className="text-slate-400 text-[10px]">Your transaction will be cataloged on the SCUML and FIRS audit track.</p>
              </div>

              {/* Summary card */}
              <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800/40 space-y-2">
                <div className="flex justify-between font-bold text-slate-400 uppercase text-[9px] tracking-wider">
                  <span>Deliverable project</span>
                  <span>Invoice Slip</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-left max-w-[70%]">
                    <span className="font-serif font-black text-slate-800 dark:text-white block truncate uppercase text-xs">{paymentInvoice.project}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Reference: {paymentInvoice.number}</span>
                  </div>
                  <span className="text-sm font-mono font-black text-orange-500 shrink-0">{paymentInvoice.amount}</span>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Payment Routing Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-orange-500 bg-orange-500/5 text-orange-500'
                        : 'border-gray-200 dark:border-slate-800 bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'transfer'
                        ? 'border-orange-500 bg-orange-500/5 text-orange-500'
                        : 'border-gray-200 dark:border-slate-800 bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Landmark size={14} />
                    <span>Wire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ussd')}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'ussd'
                        ? 'border-orange-500 bg-orange-500/5 text-orange-500'
                        : 'border-gray-200 dark:border-slate-800 bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Coins size={14} />
                    <span>USSD</span>
                  </button>
                </div>
              </div>

              {/* Conditional Payment forms */}
              <form onSubmit={handleSettlePayment} className="space-y-4">
                {paymentMethod === 'card' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Card Details</label>
                      <input
                        type="text"
                        required
                        value={paymentCardNum}
                        onChange={(e) => setPaymentCardNum(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Expiry</label>
                        <input
                          type="text"
                          required
                          defaultValue="11 / 28"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">CVV Code</label>
                        <input
                          type="password"
                          required
                          defaultValue="***"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-2.5 animate-fade-in text-left">
                    <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider block">Corporate bank transfer info</span>
                    <div className="space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                      <div>Bank: <span className="text-slate-900 dark:text-white font-bold">Wema Bank PLC</span></div>
                      <div>Account: <span className="text-slate-900 dark:text-white font-bold">1012398457</span></div>
                      <div>Name: <span className="text-slate-900 dark:text-white font-bold">DS Tech Corporate Trust Node</span></div>
                    </div>
                    <p className="text-[9px] text-slate-400">Transfer exactly the invoice sum, then click verify settlement below.</p>
                  </div>
                )}

                {paymentMethod === 'ussd' && (
                  <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-2 text-left animate-fade-in">
                    <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider block">Dial USSD Node code</span>
                    <p className="font-mono text-center font-black text-xs text-slate-900 dark:text-white py-2 tracking-widest">
                      *945*101*2398457*85000#
                    </p>
                    <p className="text-[9px] text-slate-400 leading-normal">Confirm on your device, then secure payment node.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Processing settlement...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={12} />
                      <span>Confirm Secure Settlement</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Simple utility function helper
const triggerHaptic = (intensity: number) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(intensity);
  }
};

// Information icon helper fallback
const InfoIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);
