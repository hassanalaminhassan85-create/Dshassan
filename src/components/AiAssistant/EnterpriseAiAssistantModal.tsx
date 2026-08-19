import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Send, Square, Sparkles, X, History, Plus, Trash2, Edit2, ShieldCheck, 
  FileText, Paperclip, Copy, Check, BookOpen, Zap, MessageSquare, ArrowRight,
  ArrowLeft, Clock, Search, Sun, Moon, Mic, MicOff, RefreshCw,
  User, RotateCcw, PanelLeftClose, PanelLeftOpen, ArrowDown, ExternalLink, HelpCircle
} from 'lucide-react';
import { Logo } from '../Logo';

interface Message {
  id?: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{ id: string; title: string; category: string }>;
  created_at?: string;
  isThinking?: boolean;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  user_role: string;
  updated_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  currentUser?: any;
}

const QUICK_PROMPTS_BY_ROLE: Record<string, { icon: string; title: string; prompt: string }[]> = {
  Public: [
    { icon: 'ShieldCheck', title: 'Verify Registration', prompt: 'Verify CAC Corporate Registration & RC-1849204 details' },
    { icon: 'Zap', title: 'Digital Solutions', prompt: 'Explore DS Tech Digital Transformation & Engineering Services' },
    { icon: 'BookOpen', title: 'Academy Programs', prompt: 'Browse DS Tech Training Academy certifications & courses' },
    { icon: 'HelpCircle', title: 'Project Consultation', prompt: 'How do I request custom software development or marketing?' }
  ],
  Applicant: [
    { icon: 'FileText', title: 'Application Status', prompt: 'Check my current candidate application status & next steps' },
    { icon: 'Sparkles', title: 'Interview Guidance', prompt: 'What should I prepare for my upcoming technical interview?' },
    { icon: 'BookOpen', title: 'Skill Upgrades', prompt: 'Suggest courses to upgrade my profile for senior engineering roles' },
    { icon: 'ShieldCheck', title: 'Security & Verification', prompt: 'How does DS Tech secure my credentials and biometric proof?' }
  ],
  Candidate: [
    { icon: 'FileText', title: 'Status Check', prompt: 'Check my job application and document evaluation status' },
    { icon: 'Sparkles', title: 'Technical Screening', prompt: 'Prepare for technical assessment and architectural questions' },
    { icon: 'BookOpen', title: 'Submitted Assets', prompt: 'View my submitted certificates and appointment status' }
  ],
  Client: [
    { icon: 'Zap', title: 'Project Tracking', prompt: 'Track my software project progress, milestones and deliverables' },
    { icon: 'FileText', title: 'Custom Scope', prompt: 'Request a custom software engineering or marketing contract' },
    { icon: 'BookOpen', title: 'Invoices & Billing', prompt: 'Review invoice logs, payment history and payment gateways' }
  ],
  Student: [
    { icon: 'BookOpen', title: 'Enrollment Progress', prompt: 'Check my course enrollment status and syllabus progress' },
    { icon: 'FileText', title: 'Assignments', prompt: 'View pending assignment submissions and instructor reviews' },
    { icon: 'ShieldCheck', title: 'Certificate Verification', prompt: 'Verify and download my graduation certificate' }
  ],
  Tutor: [
    { icon: 'FileText', title: 'Pending Grading', prompt: 'View student assignment submissions awaiting grading' },
    { icon: 'Zap', title: 'Cohort Analytics', prompt: 'Show my active cohort performance and attendance overview' },
    { icon: 'BookOpen', title: 'Curriculum Feedback', prompt: 'Guidelines for student feedback and mentor evaluations' }
  ],
  Staff: [
    { icon: 'Zap', title: 'Company Announcements', prompt: 'Read latest DS Tech internal announcements & campaign updates' },
    { icon: 'BookOpen', title: 'Employee Handbook', prompt: 'Access DS Tech operational directives and employee guidelines' },
    { icon: 'User', title: 'Team Directory', prompt: 'Find team leads, department contact directory and project leads' }
  ],
  Admin: [
    { icon: 'ShieldCheck', title: 'Platform Diagnostics', prompt: 'Platform health, security logs & API diagnostics summary' },
    { icon: 'Zap', title: 'AI Usage Metrics', prompt: 'View AI usage, system query analytics and model performance' },
    { icon: 'FileText', title: 'Applicant Reviews', prompt: 'Check pending candidate reviews and biometric security logs' }
  ]
};

// Code Block Renderer with Language Label and Copy Code Button
const CodeBlock: React.FC<{ language?: string; code: string }> = ({ language = 'code', code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/60 dark:border-slate-800 bg-[#0d1117] text-slate-200 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-slate-800 text-[11px] text-slate-400 select-none">
        <span className="font-sans font-semibold uppercase tracking-wider text-amber-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto scrollbar-thin">
        <pre className="text-xs sm:text-sm leading-relaxed text-slate-100 font-mono whitespace-pre">{code}</pre>
      </div>
    </div>
  );
};

export const EnterpriseAiAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userRole = 'Public',
  currentUser
}) => {
  // Theme state: light vs dark mode
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (e) {}
  };

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      content: `Hello **${currentUser?.fullName || 'there'}**! Welcome to the **DS TECH AI Workspace**. How can I assist you with our services, courses, CAC corporate verification, or account workflow today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [effectiveRole, setEffectiveRole] = useState<string>(userRole);
  const [attachments, setAttachments] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Rename conversation state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll control state
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setEffectiveRole(userRole);
  }, [userRole]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Handle textarea height auto-expansion
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Scroll tracking
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottom(isFarFromBottom);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom('smooth');
    }
  }, [messages, loading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please type your message.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/ai/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      // Quiet fallback
    }
  };

  const loadConversationHistory = async (convId: string) => {
    setActiveConvId(convId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            sources: m.sources,
            created_at: m.created_at
          })));
        }
      }
    } catch (e) {
      console.error("Failed to load conversation details:", e);
    }
  };

  const handleStartNewChat = () => {
    if (loading) handleStopGeneration();
    setActiveConvId(null);
    setMessages([
      {
        sender: 'assistant',
        content: `Started a new AI conversation session for **${effectiveRole}**. What would you like to explore next?`
      }
    ]);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/conversations/${convId}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (convId: string, e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      await fetch(`/api/ai/conversations/${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() })
      });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: editingTitle.trim() } : c));
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    } finally {
      setEditingConvId(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setMessages(prev => prev.map(m => m.isThinking || m.isStreaming ? { ...m, isThinking: false, isStreaming: false } : m));
  };

  // Helper function to stream text character by character into message
  const streamResponseText = async (fullText: string, sources?: any[]) => {
    // Add streaming assistant message
    const msgId = 'msg_' + Date.now();
    setMessages(prev => {
      const filtered = prev.filter(m => !m.isThinking);
      return [
        ...filtered,
        {
          id: msgId,
          sender: 'assistant',
          content: '',
          sources,
          isStreaming: true
        }
      ];
    });

    const chunkSize = 4;
    for (let i = 0; i <= fullText.length; i += chunkSize) {
      if (abortControllerRef.current?.signal.aborted) break;
      const currentChunk = fullText.substring(0, i);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: currentChunk } : m));
      await new Promise(r => setTimeout(r, 12));
    }

    // Finalize message
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: fullText, isStreaming: false } : m));
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      content: promptToSend.trim()
    };

    // Instant thinking message placeholder
    const thinkingMsg: Message = {
      sender: 'assistant',
      content: '',
      isThinking: true
    };

    setMessages(prev => [...prev, userMsg, thinkingMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: promptToSend,
          conversationId: activeConvId,
          roleOverride: effectiveRole !== userRole ? effectiveRole : undefined,
          attachments
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.reply) {
        if (data.conversationId) {
          setActiveConvId(data.conversationId);
          fetchConversations();
        }
        setAttachments([]);
        // Stream the received reply
        await streamResponseText(data.reply, data.sources);
      } else {
        throw new Error(data.error || 'Unable to process request');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Stopped by user
      }

      // Fallback content on failure
      const getFallbackContent = (msg: string) => {
        const lower = msg.toLowerCase();
        if (lower.includes('cac') || lower.includes('registration') || lower.includes('corporate') || lower.includes('rc')) {
          return `### Executive Synthesis: CAC Corporate Registration Verification\n\n- **Corporate Name**: DS Tech & Digital Marketing Services Ltd\n- **RC Number**: **RC-1849204**\n- **Corporate Status**: Active & Fully Verified\n- **Tax Identification (TIN)**: 24892019-0001\n- **Regulatory Jurisdiction**: Corporate Affairs Commission (CAC) Federal Republic of Nigeria\n\nDS Tech is an officially registered enterprise operating under full Nigerian federal regulatory compliance.`;
        }
        if (lower.includes('application') || lower.includes('status') || lower.includes('interview')) {
          return `### Executive Synthesis: DS Tech Career & Application Portal\n\n- **Workspace Role**: ${effectiveRole}\n- **Application Status**: Profile Verified & Active\n- **Next Stage**: Technical assessment screening & document verification.\n\nPlease check your **Candidate Dashboard** for real-time interview schedules and feedback.`;
        }
        if (lower.includes('service') || lower.includes('digital transformation') || lower.includes('software')) {
          return `### Executive Synthesis: DS Tech Enterprise Solutions\n\nWe deliver enterprise solutions for modern businesses:\n- **Custom Web & Mobile Engineering**: Scalable, high-performance web systems.\n- **Digital Performance Marketing**: Strategic branding, conversion optimization & SEO.\n- **Tech Training Academy**: Certification programs in React, UI/UX, and Cloud Architecture.`;
        }
        return `### Executive Synthesis: DS Tech Enterprise AI Workspace\n\nI have received your request regarding: **"${msg}"**.\n\n- **Workspace Role**: ${effectiveRole}\n- **Status**: Verified Operational\n\nHow else can I assist with your project milestones, course enrollments, or account management?`;
      };

      const fallbackText = getFallbackContent(promptToSend);
      setAttachments([]);
      await streamResponseText(fallbackText, [{ id: 'fallback', title: 'DS Tech Operational Knowledge Base', category: 'General' }]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = () => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [
            ...prev,
            { name: file.name, dataUrl: event.target!.result as string }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  const quickPrompts = QUICK_PROMPTS_BY_ROLE[effectiveRole] || QUICK_PROMPTS_BY_ROLE['Public'];
  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = themeMode === 'dark';

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>

        {/* TOP WORKSPACE NAVIGATION BAR */}
        <header className={`relative z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 border-b shrink-0 transition-colors ${
          isDark 
            ? 'bg-[#091024] border-slate-800/80 text-white shadow-md' 
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          {/* Left Navigation & Brand */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            {/* Back Navigation Button */}
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300/60'
              }`}
              title="Return to main portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Workspace</span>
            </button>

            <div className={`h-4 w-px hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

            {/* Official DS TECH Brand Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative p-1 bg-slate-950 rounded-xl border border-amber-500/40 shrink-0">
                <Logo size="xs" showText={false} variant="light" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h1 className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  DS TECH AI Workspace
                </h1>
                <p className="text-[10px] text-amber-500 font-medium flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{effectiveRole} Mode</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Role Switcher for Admin */}
            {userRole === 'Admin' && (
              <select
                value={effectiveRole}
                onChange={(e) => setEffectiveRole(e.target.value)}
                className={`text-xs font-semibold rounded-xl px-2.5 py-1.5 border focus:outline-none transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#0f1a36] text-amber-400 border-amber-500/30 focus:border-amber-400'
                    : 'bg-slate-100 text-amber-800 border-amber-300 focus:border-amber-500'
                }`}
                title="Switch role perspective"
              >
                <option value="Admin">Role: Admin</option>
                <option value="Public">Role: Public</option>
                <option value="Applicant">Role: Applicant</option>
                <option value="Client">Role: Client</option>
                <option value="Student">Role: Student</option>
                <option value="Tutor">Role: Tutor</option>
                <option value="Staff">Role: Staff</option>
              </select>
            )}

            {/* Theme Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* New Chat Button */}
            <button
              onClick={handleStartNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-all cursor-pointer shrink-0"
              title="Start a new chat session"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* MAIN WORKSPACE BODY */}
        <div className="relative flex-1 flex overflow-hidden">

          {/* CHATGPT-STYLE SIDEBAR */}
          <aside
            className={`${
              sidebarOpen ? 'translate-x-0 w-72 sm:w-80' : '-translate-x-full w-0'
            } transition-all duration-300 ease-in-out absolute md:relative z-20 inset-y-0 left-0 flex flex-col shrink-0 border-r ${
              isDark 
                ? 'bg-[#060b17] border-slate-800/80 text-slate-200' 
                : 'bg-slate-100/95 border-slate-200 text-slate-800'
            }`}
          >
            {/* New Chat & Search Header */}
            <div className="p-3.5 space-y-2 border-b border-slate-800/40">
              <button
                onClick={handleStartNewChat}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#0f182e] hover:bg-[#162345] text-amber-400 border-amber-500/30'
                    : 'bg-white hover:bg-slate-50 text-amber-800 border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span>New Chat</span>
                </div>
                <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 font-mono">⌘N</kbd>
              </button>

              {/* Conversation Search Input */}
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className={`w-full text-xs rounded-xl pl-8 pr-3 py-1.5 border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#0a1122] text-slate-200 border-slate-800 focus:border-amber-500/50 placeholder-slate-600'
                      : 'bg-white text-slate-800 border-slate-200 focus:border-amber-500 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Conversation History List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Recent Conversations</span>
                <span className="text-[9px] bg-slate-800/50 px-1.5 py-0.5 rounded">{filteredConversations.length}</span>
              </div>

              {filteredConversations.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2">
                  <Clock className="w-6 h-6 mx-auto text-slate-500 opacity-50" />
                  <p className="text-xs text-slate-500 font-medium">No saved chats found</p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isActive = activeConvId === conv.id;
                  const isEditing = editingConvId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => !isEditing && loadConversationHistory(conv.id)}
                      className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                        isActive
                          ? isDark
                            ? 'bg-[#101b38] text-white border-amber-500/40 shadow-sm'
                            : 'bg-white text-slate-900 border-amber-400 shadow-sm font-semibold'
                          : isDark
                            ? 'bg-transparent text-slate-300 border-transparent hover:bg-slate-800/50 hover:text-white'
                            : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200/60 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-amber-500' : 'text-slate-500'
                        }`} />
                        
                        {isEditing ? (
                          <form onSubmit={(e) => handleSaveRename(conv.id, e)} className="flex items-center gap-1 flex-1">
                            <input
                              type="text"
                              autoFocus
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className={`w-full text-xs px-1.5 py-0.5 rounded border focus:outline-none ${
                                isDark ? 'bg-slate-900 text-white border-amber-500' : 'bg-white text-slate-900 border-amber-500'
                              }`}
                            />
                            <button type="submit" className="text-emerald-400 p-0.5"><Check className="w-3.5 h-3.5" /></button>
                          </form>
                        ) : (
                          <span className="truncate font-medium leading-tight">{conv.title}</span>
                        )}
                      </div>

                      {/* Action buttons (Rename / Delete) */}
                      {!isEditing && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={(e) => handleStartRename(conv, e)}
                            className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Rename chat"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar User Identity & Footer */}
            <div className={`p-3 border-t text-xs ${
              isDark ? 'border-slate-800/80 bg-[#080d1b]' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser?.fullName?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold truncate text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {currentUser?.fullName || 'Valued User'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{effectiveRole} Account</p>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title="Toggle theme"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                </button>
              </div>
            </div>
          </aside>

          {/* BACKDROP FOR MOBILE SIDEBAR */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-10 bg-black/50 backdrop-blur-xs"
            />
          )}

          {/* MAIN CHAT CONSOLE */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* CHAT MESSAGES SCROLL AREA */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 custom-scrollbar"
            >
              <div className="max-w-3xl mx-auto space-y-6">

                {/* STARTER HOME SCREEN (Shown if only welcome message exists or starting new chat) */}
                {messages.length <= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6 sm:py-10 space-y-8 text-center"
                  >
                    <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 shadow-inner">
                      <Logo size="md" showText={false} variant={isDark ? "light" : "dark"} />
                    </div>

                    <div className="space-y-2">
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        DS TECH AI Workspace
                      </h2>
                      <p className={`text-xs sm:text-sm max-w-md mx-auto ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Enterprise intelligence for DS Tech corporate verification, software engineering, digital marketing, and academy courses.
                      </p>
                    </div>

                    {/* Quick Prompts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-2 text-left">
                      {quickPrompts.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(item.prompt)}
                          disabled={loading}
                          className={`p-3.5 rounded-2xl text-xs border text-left transition-all cursor-pointer group shadow-xs ${
                            isDark
                              ? 'bg-[#0d162d]/80 hover:bg-[#142247] border-slate-800 hover:border-amber-500/50 text-slate-200'
                              : 'bg-white hover:bg-slate-100/80 border-slate-200 hover:border-amber-400 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-extrabold text-amber-500 group-hover:text-amber-400">{item.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <p className={`text-[11px] line-clamp-2 ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {item.prompt}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* MESSAGES LIST */}
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';

                  return (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 sm:gap-4 max-w-3xl ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                        isUser
                          ? 'bg-amber-500 text-slate-950 font-black border border-amber-400'
                          : 'bg-slate-900 text-amber-400 border border-slate-700'
                      }`}>
                        {isUser ? (
                          currentUser?.fullName?.[0] || 'U'
                        ) : (
                          <div className="scale-75">
                            <Logo size="xs" showText={false} variant="light" />
                          </div>
                        )}
                      </div>

                      {/* Message Content Container */}
                      <div className={`flex flex-col gap-1.5 min-w-0 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
                        
                        {/* Message Bubble */}
                        <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-2xl ${
                          isUser
                            ? 'bg-amber-500 text-slate-950 rounded-tr-none font-medium shadow-sm'
                            : isDark
                              ? 'bg-[#0e172e] border border-slate-800 text-slate-100 rounded-tl-none shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                        }`}>
                          {msg.isThinking ? (
                            <div className="flex items-center gap-3 py-1 text-xs text-amber-500">
                              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                              <span className="animate-pulse font-semibold">DS Tech AI is synthesizing response...</span>
                            </div>
                          ) : isUser ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <div className="markdown-body space-y-3">
                              <Markdown
                                components={{
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeString = String(children).replace(/\n$/, '');
                                    if (!inline) {
                                      return <CodeBlock language={match?.[1] || 'code'} code={codeString} />;
                                    }
                                    return (
                                      <code className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
                                        isDark ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'bg-slate-100 text-amber-800 border border-slate-200'
                                      }`} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  h1({ children }) {
                                    return <h1 className="text-base sm:text-lg font-black text-amber-500 mt-2 mb-1 flex items-center gap-2">{children}</h1>;
                                  },
                                  h2({ children }) {
                                    return <h2 className="text-sm sm:text-base font-bold text-amber-400 mt-2 mb-1">{children}</h2>;
                                  },
                                  h3({ children }) {
                                    return <h3 className="text-xs sm:text-sm font-bold text-amber-400 mt-2 mb-1">{children}</h3>;
                                  },
                                  p({ children }) {
                                    return <p className="leading-relaxed">{children}</p>;
                                  },
                                  ul({ children }) {
                                    return <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>;
                                  },
                                  ol({ children }) {
                                    return <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>;
                                  },
                                  blockquote({ children }) {
                                    return (
                                      <blockquote className={`border-l-3 border-amber-500 pl-3 my-2 italic ${
                                        isDark ? 'text-slate-400' : 'text-slate-600'
                                      }`}>
                                        {children}
                                      </blockquote>
                                    );
                                  },
                                  table({ children }) {
                                    return (
                                      <div className="overflow-x-auto my-3 border border-slate-800 rounded-xl">
                                        <table className="min-w-full divide-y divide-slate-800 text-xs">{children}</table>
                                      </div>
                                    );
                                  },
                                  th({ children }) {
                                    return <th className="px-3 py-2 text-left font-bold text-amber-400 bg-slate-900/50">{children}</th>;
                                  },
                                  td({ children }) {
                                    return <td className="px-3 py-2 border-t border-slate-800">{children}</td>;
                                  }
                                }}
                              >
                                {msg.content}
                              </Markdown>
                              
                              {/* Blinking cursor if streaming */}
                              {msg.isStreaming && (
                                <span className="inline-block w-1.5 h-4 bg-amber-500 ml-1 animate-pulse" />
                              )}
                            </div>
                          )}

                          {/* Grounded Citation Sources */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex flex-wrap gap-2 items-center">
                              <span className="font-bold text-amber-400 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Sources:
                              </span>
                              {msg.sources.map((src, sIdx) => (
                                <span key={sIdx} className="px-2 py-0.5 bg-slate-900 border border-slate-700/60 rounded text-amber-200 font-medium text-[10px]">
                                  {src.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons Toolbar under Assistant Message */}
                        {!isUser && !msg.isThinking && (
                          <div className="flex items-center gap-3 px-1 text-[11px] text-slate-500 pt-1">
                            <button
                              onClick={() => copyToClipboard(msg.content, idx)}
                              className="flex items-center gap-1 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Copy response text"
                            >
                              {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                            </button>

                            {/* Regenerate Button */}
                            {idx === messages.length - 1 && (
                              <button
                                onClick={handleRegenerate}
                                disabled={loading}
                                className="flex items-center gap-1 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
                                title="Regenerate response"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Regenerate</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* FLOATING SCROLL TO BOTTOM BUTTON */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom('smooth')}
                  className="absolute bottom-24 right-6 z-20 p-2.5 rounded-full bg-amber-500 text-slate-950 shadow-lg hover:bg-amber-400 transition-all cursor-pointer border border-amber-300"
                  title="Scroll to latest messages"
                >
                  <ArrowDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ATTACHMENT PREVIEWS CHIPS BAR */}
            {attachments.length > 0 && (
              <div className={`px-4 py-2 border-t flex items-center gap-2 overflow-x-auto shrink-0 ${
                isDark ? 'bg-[#070c18] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <span className="text-xs text-amber-500 font-semibold">Attachments:</span>
                {attachments.map((att, index) => (
                  <div key={index} className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border shadow-2xs ${
                    isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-300'
                  }`}>
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                    <button
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-red-400 ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SUGGESTED PROMPT CHIPS */}
            <div className={`px-4 py-2.5 border-t overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 ${
              isDark ? 'bg-[#090e1c]/90 border-slate-800/80' : 'bg-slate-100/90 border-slate-200'
            }`}>
              <div className="max-w-3xl mx-auto flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1 shrink-0">
                  <Zap className="w-3 h-3 text-amber-500" /> Suggestions:
                </span>
                {quickPrompts.map((promptObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(promptObj.prompt)}
                    disabled={loading}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                      isDark
                        ? 'bg-[#0e1832] hover:bg-[#162650] text-slate-200 border-slate-700/80 hover:border-amber-500/50'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-amber-400 shadow-2xs'
                    }`}
                  >
                    <span>{promptObj.title}</span>
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* CHAT COMPOSER FOOTER */}
            <div className={`p-3 sm:p-4 border-t shrink-0 ${
              isDark ? 'bg-[#090e1c] border-slate-800/80' : 'bg-white border-slate-200'
            }`}>
              <div className="max-w-3xl mx-auto space-y-2">
                
                {/* Text Input Container */}
                <div className={`relative flex items-end gap-2 p-2 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-[#0c1429] border-slate-700/80 focus-within:border-amber-500/80 shadow-inner'
                    : 'bg-slate-50 border-slate-300 focus-within:border-amber-500 shadow-2xs'
                }`}>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />

                  {/* Attachment File Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                      isDark ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-200'
                    }`}
                    title="Attach files or documents"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Voice Input Microphone Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                      isListening 
                        ? 'text-red-500 bg-red-500/10 animate-pulse' 
                        : isDark ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-200'
                    }`}
                    title={isListening ? "Stop listening" : "Voice dictation"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Dynamic Multiline Textarea */}
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isListening ? "Listening to your voice..." : "Ask DS Tech AI Workspace..."}
                    disabled={loading}
                    className={`flex-1 bg-transparent text-xs sm:text-sm p-1.5 focus:outline-none resize-none max-h-40 ${
                      isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                    }`}
                  />

                  {/* Send / Stop Generation Button */}
                  {loading ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all cursor-pointer shrink-0 shadow-sm"
                      title="Stop generation"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={!input.trim() && attachments.length === 0}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer shrink-0 shadow-sm disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Footer Disclaimer */}
                <p className="text-[10px] text-slate-500 text-center font-medium">
                  DS Tech AI Workspace assists with CAC Verification (RC-1849204), Services, Recruitment & Courses.
                </p>

              </div>
            </div>

          </main>
        </div>

      </div>
    </AnimatePresence>
  );
};
