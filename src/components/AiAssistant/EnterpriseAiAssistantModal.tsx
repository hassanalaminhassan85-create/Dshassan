import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Send, Square, X, Plus, Trash2, Edit2, ShieldCheck, 
  FileText, Paperclip, Copy, Check, BookOpen, Zap, MessageSquare,
  ArrowLeft, Clock, Search, Sun, Moon, Mic, MicOff,
  RotateCcw, PanelLeftClose, PanelLeftOpen, ArrowDown,
  GraduationCap, Building2, Code, PenTool, BarChart3, Bot, Image as ImageIcon,
  Bell, Settings, Home, ChevronDown, Sparkles, Globe, Database, Terminal,
  Layout, MoreHorizontal, HelpCircle, CheckCircle2, ArrowRight, Shield, RefreshCw
} from 'lucide-react';
import { Logo } from '../Logo';
import { PageContext } from '../FloatingAiLauncher';

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
  pageContext?: PageContext;
}

const QUICK_PROMPTS_BY_ROLE: Record<string, { title: string; prompt: string }[]> = {
  Public: [
    { title: 'CAC Verification', prompt: 'Verify DS TECH Corporate Registration & RC-1849204 details' },
    { title: 'Academy Courses', prompt: 'What Academy programmes and courses are currently offered?' },
    { title: 'Academy Pricing', prompt: 'What is the current price matrix for 1, 3, and 6-month programmes?' },
    { title: 'Digital Services', prompt: 'Tell me about DS TECH software development and marketing services' }
  ],
  Applicant: [
    { title: 'Application Status', prompt: 'What is my current candidate application status?' },
    { title: 'Interview Preparation', prompt: 'What should I prepare for my upcoming technical interview?' },
    { title: 'Skill Recommendations', prompt: 'Which courses do you recommend for full-stack engineering?' },
    { title: 'Security Proof', prompt: 'How does DS TECH secure my application credentials?' }
  ],
  Client: [
    { title: 'Project Status', prompt: 'What is the progress on my software project milestones?' },
    { title: 'Request Proposal', prompt: 'How do I request a custom software development contract?' },
    { title: 'Billing & Payments', prompt: 'Review my invoice history and payment options' },
    { title: 'Consultation', prompt: 'Schedule an executive architecture consultation' }
  ],
  Student: [
    { title: 'Enrollment Status', prompt: 'What courses am I currently enrolled in?' },
    { title: 'Syllabus Progress', prompt: 'Show my course schedule and module milestones' },
    { title: 'Graduation Certificate', prompt: 'How do I verify and download my certificate?' },
    { title: 'Ask Instructor', prompt: 'Help me understand recursion and async programming' }
  ],
  Admin: [
    { title: 'Platform Health', prompt: 'Give me an overview of platform metrics and diagnostics' },
    { title: 'AI Usage Stats', prompt: 'What is the current AI system query throughput?' },
    { title: 'Pending Candidates', prompt: 'Show pending recruitment reviews and applicant logs' },
    { title: 'System Audits', prompt: 'Review recent security events and data sync logs' }
  ]
};

const CAPABILITY_PILLARS = [
  { label: 'General Knowledge', icon: Globe },
  { label: 'Live DS TECH Data', icon: Database },
  { label: 'Code & Analysis', icon: Code },
  { label: 'Writing & Planning', icon: PenTool }
];

const SUGGESTION_CARDS = [
  {
    id: 'academy',
    icon: GraduationCap,
    iconBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    title: 'Academy Courses',
    prompt: 'What programmes are currently available in the DS TECH Academy?',
    sub: 'What programmes are currently available?'
  },
  {
    id: 'cac',
    icon: Building2,
    iconBg: 'bg-[#002f6c]/10 text-[#002f6c] dark:bg-blue-400/20 dark:text-blue-300',
    title: 'CAC Verification',
    prompt: 'Show DS TECH RC-1849204 corporate registration & verification details.',
    sub: 'Show DS TECH RC-1849204 details.'
  },
  {
    id: 'concept',
    icon: Code,
    iconBg: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
    title: 'Explain a concept',
    prompt: 'Explain JavaScript promises and asynchronous execution clearly.',
    sub: 'Explain JavaScript promises.'
  },
  {
    id: 'write',
    icon: PenTool,
    iconBg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400',
    title: 'Write for me',
    prompt: 'Create a professional business proposal for a modern tech project.',
    sub: 'Create a professional business proposal.'
  },
  {
    id: 'business',
    icon: BarChart3,
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    title: 'Business ideas',
    prompt: 'Suggest profitable online business ideas with high growth potential.',
    sub: 'Suggest profitable online business ideas.'
  },
  {
    id: 'plan',
    icon: Bot,
    iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    title: 'Help me plan',
    prompt: 'Help me plan a modern website architecture and development roadmap.',
    sub: 'Help me plan a modern website.'
  }
];

// Helper: Date grouping for sidebar conversation list
function groupConversationsByDate(conversations: Conversation[]) {
  const today: Conversation[] = [];
  const past7Days: Conversation[] = [];
  const earlier: Conversation[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  conversations.forEach(conv => {
    const date = new Date(conv.updated_at || Date.now());
    if (date >= startOfToday) {
      today.push(conv);
    } else if (date >= sevenDaysAgo) {
      past7Days.push(conv);
    } else {
      earlier.push(conv);
    }
  });

  return { today, past7Days, earlier };
}

function formatConvTimestamp(updatedAt: string): string {
  if (!updatedAt) return '';
  const date = new Date(updatedAt);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  if (date >= startOfToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (date >= startOfYesterday) {
    return 'Yesterday';
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// Code Block Renderer with Language Header & Copy Button
const CodeBlock: React.FC<{ language?: string; code: string; isDark: boolean }> = ({ language = 'code', code, isDark }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`my-3.5 rounded-xl overflow-hidden border font-mono text-xs shadow-xs ${
      isDark ? 'border-slate-800 bg-[#0b101d] text-slate-200' : 'border-slate-200 bg-[#0d1117] text-slate-100'
    }`}>
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 select-none">
        <span className="font-sans font-semibold uppercase tracking-wider text-blue-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto scrollbar-thin">
        <pre className="text-xs leading-relaxed font-mono whitespace-pre">{code}</pre>
      </div>
    </div>
  );
};

export const EnterpriseAiAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userRole = 'Public',
  currentUser,
  pageContext
}) => {
  // Theme state
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (e) {}
  };

  const isDark = themeMode === 'dark';

  // Chat & Conversation States
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [effectiveRole, setEffectiveRole] = useState<string>(userRole);
  const [attachments, setAttachments] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // UI Dropdowns & Controls
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'Gemini 3.7' | 'Gemini 3.5 Flash'>('Gemini 3.7');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Edit title state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Scroll tracking
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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

  // Keyboard shortcut Ctrl+K / Cmd+K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (isOpen) {
          e.preventDefault();
          handleStartNewChat();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle textarea height auto-expansion
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 100;
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

  // Speech Recognition setup
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
      alert("Voice speech recognition is not supported in this browser.");
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
        if (data.messages && Array.isArray(data.messages)) {
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
    setMessages([]);
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

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      content: promptToSend.trim()
    };

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
      // Try real streaming endpoint first
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: promptToSend,
          conversationId: activeConvId,
          roleOverride: effectiveRole !== userRole ? effectiveRole : undefined,
          history: messages.filter(m => !m.isThinking),
          userData: currentUser,
          pageContext,
          model: selectedModel
        })
      });

      if (!res.ok || !res.body) {
        throw new Error(`Streaming failed with status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      const msgId = 'msg_' + Date.now();

      // Replace thinking message with streaming message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [
          ...filtered,
          { id: msgId, sender: 'assistant', content: '', isStreaming: true }
        ];
      });

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.chunk) {
                accumulatedText += json.chunk;
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: accumulatedText } : m));
              }
              if (json.conversationId) {
                setActiveConvId(json.conversationId);
                fetchConversations();
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: accumulatedText || 'No response produced.', isStreaming: false } : m));
      setAttachments([]);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      // Non-streaming fallback attempt
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: promptToSend,
            conversationId: activeConvId,
            roleOverride: effectiveRole !== userRole ? effectiveRole : undefined,
            history: messages.filter(m => !m.isThinking),
            userData: currentUser,
            pageContext,
            model: selectedModel
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            setMessages(prev => {
              const filtered = prev.filter(m => !m.isThinking);
              return [
                ...filtered,
                { sender: 'assistant', content: data.reply, sources: data.sources }
              ];
            });
            if (data.conversationId) {
              setActiveConvId(data.conversationId);
              fetchConversations();
            }
            setAttachments([]);
            return;
          }
        }
      } catch (fallbackErr) {
        console.warn("Fallback chat error:", fallbackErr);
      }

      // Final fallback
      const lower = promptToSend.toLowerCase();
      let fallbackText = '';
      if (lower.includes('cac') || lower.includes('registration') || lower.includes('rc-1849204')) {
        fallbackText = `**DS Tech & Digital Marketing Agency Limited** is officially registered with the Corporate Affairs Commission (CAC), Federal Republic of Nigeria, under RC Registration **RC-1849204** (TIN: 24892019-0001). Operational status is active and verified.`;
      } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('tuition')) {
        fallbackText = `Here is the official **DS TECH Academy Pricing Matrix**:

| Duration | Virtual | Physical | Hybrid |
| :--- | :--- | :--- | :--- |
| **1 Month** | ₦50,000 | ₦100,000 | ₦150,000 |
| **3 Months** | ₦100,000 | ₦200,000 | ₦300,000 |
| **6 Months** | ₦200,000 | ₦300,000 | ₦400,000 |`;
      } else {
        fallbackText = `I am **DS TECH AI**, your intelligent assistant for DS TECH services, Academy programmes, and general queries. How can I help you today?`;
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [
          ...filtered,
          { sender: 'assistant', content: fallbackText }
        ];
      });
      setAttachments([]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = () => {
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

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { today, past7Days, earlier } = groupConversationsByDate(filteredConversations);

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden transition-colors duration-150 ${
        isDark ? 'bg-[#090d1a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}>

        {/* WORKSPACE HEADER */}
        <header className={`relative z-30 flex items-center justify-between px-3.5 sm:px-5 py-2.5 border-b shrink-0 transition-colors ${
          isDark 
            ? 'bg-[#070b16] border-slate-800/80 text-white' 
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          {/* Left Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            {/* Brand Title Dropdown & Online Badge */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold tracking-tight cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/60 text-white' : 'hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span>DS TECH AI</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Online</span>
              </div>

              {/* Role Dropdown Menu */}
              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`absolute left-0 top-full mt-1.5 w-48 rounded-xl border shadow-lg py-1.5 z-50 text-xs ${
                      isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Switch Workspace Mode</div>
                    {['Public', 'Applicant', 'Client', 'Student', 'Admin'].map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          setEffectiveRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-500/10 cursor-pointer ${
                          effectiveRole === r ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                        }`}
                      >
                        <span>{r} Mode</span>
                        {effectiveRole === r && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Role Pill Button */}
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{effectiveRole} Mode</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-lg transition-all cursor-pointer border relative ${
                  isDark 
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-xl p-3 z-50 text-xs ${
                      isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/40 mb-2">
                      <span className="font-bold text-xs">Workspace Alerts</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded-full font-bold">2 Live</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <p className="font-semibold">CAC Verification Active</p>
                        <p className="text-[10px] opacity-80">RC-1849204 synchronized with live backend.</p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <p className="font-semibold">Gemini 3.7 Online</p>
                        <p className="text-[10px] opacity-80">Streaming agent context ready for queries.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Exit Workspace Button */}
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="Return to main portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Exit Workspace</span>
            </button>

            {/* User Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {currentUser?.fullName?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <div className="relative flex-1 flex overflow-hidden">

          {/* COLLAPSIBLE SIDEBAR */}
          <aside
            className={`
              transition-all duration-300 ease-in-out
              fixed md:relative inset-y-0 left-0 z-40 flex flex-col shrink-0 h-full
              ${sidebarOpen 
                ? 'translate-x-0 w-[280px] md:w-64 lg:w-72 border-r opacity-100 visible' 
                : '-translate-x-full w-0 md:w-0 overflow-hidden border-r-0 opacity-0 invisible pointer-events-none'
              }
              ${isDark 
                ? 'bg-[#070b16] border-slate-800/80 text-slate-200' 
                : 'bg-[#f4f6fb] border-slate-200/80 text-slate-800'
              }
            `}
          >
            {/* Sidebar Branding & Collapse Header */}
            <div className="p-3 pb-2 flex items-center justify-between border-b border-slate-800/20">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center p-1 border border-blue-500/40 shrink-0">
                  <Logo size="xs" showText={false} variant="light" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white truncate">DS TECH AI</h2>
                  <p className="text-[10px] text-slate-500 truncate">Smarter · Faster · Together</p>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer md:hidden"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button & Search Box */}
            <div className="p-3 space-y-2 border-b border-slate-800/20">
              <button
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#0a1128] hover:bg-[#152248] text-white shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform" />
                  <span>New Chat</span>
                </div>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/15 text-white/90 rounded-md font-medium">
                  Ctrl K
                </kbd>
              </button>

              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className={`w-full text-xs rounded-xl pl-8 pr-3 py-2 border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-[#0f172a] text-slate-200 border-slate-800 placeholder-slate-500 focus:border-blue-500/50'
                      : 'bg-white text-slate-800 border-slate-200/90 placeholder-slate-400 focus:border-blue-400'
                  }`}
                />
              </div>
            </div>

            {/* Conversation History Grouped List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3 scrollbar-thin">
              
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4 space-y-2">
                  <Clock className="w-5 h-5 mx-auto text-slate-400 opacity-60" />
                  <p className="text-xs text-slate-500 font-medium">No recent chats</p>
                </div>
              ) : (
                <>
                  {/* Today Group */}
                  {today.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Today</div>
                      {today.map(conv => (
                        <ConversationItem
                          key={conv.id}
                          conv={conv}
                          activeConvId={activeConvId}
                          editingConvId={editingConvId}
                          editingTitle={editingTitle}
                          isDark={isDark}
                          onLoad={loadConversationHistory}
                          onStartRename={handleStartRename}
                          onSaveRename={handleSaveRename}
                          onDelete={handleDeleteConversation}
                          setEditingTitle={setEditingTitle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Previous 7 Days Group */}
                  {past7Days.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Previous 7 days</div>
                      {past7Days.map(conv => (
                        <ConversationItem
                          key={conv.id}
                          conv={conv}
                          activeConvId={activeConvId}
                          editingConvId={editingConvId}
                          editingTitle={editingTitle}
                          isDark={isDark}
                          onLoad={loadConversationHistory}
                          onStartRename={handleStartRename}
                          onSaveRename={handleSaveRename}
                          onDelete={handleDeleteConversation}
                          setEditingTitle={setEditingTitle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Earlier Group */}
                  {earlier.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Earlier</div>
                      {earlier.map(conv => (
                        <ConversationItem
                          key={conv.id}
                          conv={conv}
                          activeConvId={activeConvId}
                          editingConvId={editingConvId}
                          editingTitle={editingTitle}
                          isDark={isDark}
                          onLoad={loadConversationHistory}
                          onStartRename={handleStartRename}
                          onSaveRename={handleSaveRename}
                          onDelete={handleDeleteConversation}
                          setEditingTitle={setEditingTitle}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Nav Links */}
            <div className="px-2 py-1.5 border-t border-slate-800/20 text-xs space-y-0.5">
              <button
                onClick={onClose}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-200/60 text-slate-700'
                }`}
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>DS TECH Home</span>
              </button>

              <button
                onClick={() => handleSend("Tell me about DS TECH Academy programmes and learning tracks")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-200/60 text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <span>Academy</span>
              </button>

              <button
                onClick={() => handleSend("How can DS TECH AI support me with technical or corporate inquiries?")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-200/60 text-slate-700'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Help & Support</span>
              </button>
            </div>

            {/* Powered By Gemini Badge Card */}
            <div className="p-2.5">
              <div className={`p-3 rounded-2xl border ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-950/40 to-slate-900 border-blue-500/20 text-slate-200' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50/60 border-blue-200/80 text-slate-800'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powered by Gemini 3.7</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  General AI + Live DS TECH Data
                </p>
              </div>
            </div>

            {/* Sidebar User Identity */}
            <div className={`p-3 border-t text-xs ${
              isDark ? 'border-slate-800/80 bg-[#050811]' : 'border-slate-200/80 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {currentUser?.fullName?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold truncate text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {currentUser?.fullName || 'Valued User'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{effectiveRole}</p>
                  </div>
                </div>

                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title="Switch Role"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </aside>

          {/* MOBILE BACKDROP */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            />
          )}

          {/* MAIN CHAT AREA */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* MESSAGES / WELCOME CONTAINER */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-28 custom-scrollbar"
            >
              <div className="max-w-3xl mx-auto space-y-6">

                {/* EMPTY / WELCOME HERO SCREEN */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="py-6 sm:py-12 space-y-6 text-center"
                  >
                    {/* Centered Glowing Logo Halo Badge */}
                    <div className="relative inline-flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full blur-xl ${isDark ? 'bg-blue-600/30' : 'bg-blue-400/20'}`} />
                      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                        isDark ? 'bg-[#0b1021] border-blue-500/40' : 'bg-white border-blue-200'
                      }`}>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950 flex items-center justify-center p-2.5 border border-blue-500/60 shadow-inner">
                          <Logo size="sm" showText={false} variant="light" />
                        </div>
                      </div>
                    </div>

                    {/* Headline & Description */}
                    <div className="space-y-2 max-w-xl mx-auto">
                      <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        Welcome to DS TECH AI
                      </h1>
                      <p className={`text-sm sm:text-base font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Your intelligent assistant for DS TECH — and much more.
                      </p>
                      <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Ask about DS TECH services, Academy programmes, technology, business, education or anything you want. I can also get live information from the DS TECH backend when needed.
                      </p>
                    </div>

                    {/* 4 Capability Badges Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2">
                      {CAPABILITY_PILLARS.map((pillar, pIdx) => {
                        const IconComponent = pillar.icon;
                        return (
                          <div
                            key={pIdx}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                              isDark 
                                ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
                                : 'bg-white border-slate-200/90 text-slate-700 shadow-2xs'
                            }`}
                          >
                            <div className="relative flex items-center">
                              <IconComponent className="w-3.5 h-3.5 text-blue-500" />
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 -ml-1 -mt-1 bg-white dark:bg-slate-900 rounded-full" />
                            </div>
                            <span>{pillar.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Suggestion Section Divider */}
                    <div className="pt-4 text-center">
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Try asking...
                      </h2>
                    </div>

                    {/* 6 Interactive Suggestion Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
                      {SUGGESTION_CARDS.map((card) => {
                        const IconComp = card.icon;
                        return (
                          <button
                            key={card.id}
                            onClick={() => handleSend(card.prompt)}
                            disabled={loading}
                            className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isDark
                                ? 'bg-[#10172a] hover:bg-[#16203a] border-slate-800 hover:border-blue-500/50 text-slate-200'
                                : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-blue-300 text-slate-800 shadow-2xs hover:shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                              </div>
                              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">
                                {card.title}
                              </h3>
                              <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                {card.sub}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                  </motion.div>
                )}

                {/* MESSAGES STREAM */}
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';

                  return (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`flex gap-3.5 max-w-3xl ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-white border border-blue-500/40 p-1'
                      }`}>
                        {isUser ? (
                          currentUser?.fullName?.[0] || 'U'
                        ) : (
                          <Logo size="xs" showText={false} variant="light" />
                        )}
                      </div>

                      {/* Content Box */}
                      <div className={`flex flex-col gap-1 min-w-0 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`text-sm leading-relaxed ${
                          isUser
                            ? isDark
                              ? 'bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-xs font-medium'
                              : 'bg-[#0a1128] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-xs font-medium'
                            : 'w-full text-slate-800 dark:text-slate-200 text-[15px]'
                        }`}>
                          {msg.isThinking ? (
                            <div className="flex items-center gap-2 py-1 text-xs text-blue-500">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                              <span className="font-medium">DS TECH AI is processing...</span>
                            </div>
                          ) : isUser ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <div className="markdown-body space-y-2.5">
                              <Markdown
                                components={{
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeString = String(children).replace(/\n$/, '');
                                    if (!inline) {
                                      return <CodeBlock language={match?.[1] || 'code'} code={codeString} isDark={isDark} />;
                                    }
                                    return (
                                      <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                        isDark ? 'bg-slate-800 text-blue-300' : 'bg-slate-200/80 text-blue-800'
                                      }`} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  h1({ children }) {
                                    return <h1 className="text-base font-bold mt-4 mb-1.5 text-slate-900 dark:text-slate-100">{children}</h1>;
                                  },
                                  h2({ children }) {
                                    return <h2 className="text-sm font-bold mt-3 mb-1 text-slate-900 dark:text-slate-100">{children}</h2>;
                                  },
                                  h3({ children }) {
                                    return <h3 className="text-xs font-bold mt-2.5 mb-1 text-slate-900 dark:text-slate-100">{children}</h3>;
                                  },
                                  p({ children }) {
                                    return <p className="leading-relaxed mb-2 text-[15px]">{children}</p>;
                                  },
                                  ul({ children }) {
                                    return <ul className="list-disc pl-5 space-y-1 mb-2.5">{children}</ul>;
                                  },
                                  ol({ children }) {
                                    return <ol className="list-decimal pl-5 space-y-1 mb-2.5">{children}</ol>;
                                  },
                                  blockquote({ children }) {
                                    return (
                                      <blockquote className={`border-l-2 border-blue-500 pl-3 my-2 italic ${
                                        isDark ? 'text-slate-400' : 'text-slate-600'
                                      }`}>
                                        {children}
                                      </blockquote>
                                    );
                                  },
                                  table({ children }) {
                                    return (
                                      <div className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
                                        <table className="min-w-full text-xs text-left border-collapse">{children}</table>
                                      </div>
                                    );
                                  },
                                  th({ children }) {
                                    return <th className="px-3.5 py-2.5 font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">{children}</th>;
                                  },
                                  td({ children }) {
                                    return <td className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/60">{children}</td>;
                                  }
                                }}
                              >
                                {msg.content}
                              </Markdown>
                              
                              {msg.isStreaming && (
                                <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse rounded-xs" />
                              )}
                            </div>
                          )}

                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 flex flex-wrap gap-1.5 items-center">
                              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Grounded Context:
                              </span>
                              {msg.sources.map((src, sIdx) => (
                                <span key={sIdx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                                  {src.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Unobtrusive Actions under Assistant Message */}
                        {!isUser && !msg.isThinking && (
                          <div className="flex items-center gap-3 px-0.5 text-xs text-slate-400 pt-1">
                            <button
                              onClick={() => copyToClipboard(msg.content, idx)}
                              className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title="Copy message"
                            >
                              {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="text-[11px]">{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                            </button>

                            {idx === messages.length - 1 && (
                              <button
                                onClick={handleRegenerate}
                                disabled={loading}
                                className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                                title="Regenerate response"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Retry</span>
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

            {/* SCROLL TO BOTTOM BUTTON */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => scrollToBottom('smooth')}
                  className="absolute bottom-24 right-6 z-20 p-2 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ATTACHMENT PREVIEW CHIPS */}
            {attachments.length > 0 && (
              <div className={`px-4 py-2 border-t flex items-center gap-2 overflow-x-auto shrink-0 ${
                isDark ? 'bg-[#080d1b] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Attachments:</span>
                {attachments.map((att, index) => (
                  <div key={index} className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border ${
                    isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-300'
                  }`}>
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
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

            {/* FLOATING COMPOSER INPUT BOX */}
            <div className={`p-3 sm:p-5 shrink-0 ${
              isDark ? 'bg-[#090d1a]' : 'bg-[#f8fafc]'
            }`}>
              <div className="max-w-3xl mx-auto">
                <div className={`relative flex flex-col p-3 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-[#10172a] border-slate-800 focus-within:border-blue-500/60 shadow-md'
                    : 'bg-white border-slate-200/90 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/60 shadow-2xs'
                }`}>
                  
                  {/* File Upload Hidden Inputs */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />

                  {/* Textarea Input */}
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
                    placeholder={isListening ? "Listening..." : "Message DS TECH AI..."}
                    disabled={loading}
                    className={`w-full bg-transparent text-sm px-1 py-1 focus:outline-none resize-none max-h-40 font-normal leading-relaxed ${
                      isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                    }`}
                  />

                  {/* Bottom Controls Bar inside Composer */}
                  <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                    
                    {/* Left Actions: Attach, Image, Voice */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                          isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title="Attach document"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                          isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title="Upload image"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                          isListening 
                            ? 'text-red-500 bg-red-500/10 animate-pulse' 
                            : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title="Voice input"
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Right Group: Model Selector Badge & Send Button */}
                    <div className="flex items-center gap-2">
                      
                      {/* Model Selector Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isDark
                              ? 'bg-slate-800/80 text-blue-400 border-slate-700 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          <span>{selectedModel}</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        <AnimatePresence>
                          {modelDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className={`absolute right-0 bottom-full mb-1.5 w-40 rounded-xl border shadow-lg py-1 z-50 text-xs ${
                                isDark ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedModel('Gemini 3.7');
                                  setModelDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-500/10 cursor-pointer ${
                                  selectedModel === 'Gemini 3.7' ? 'font-bold text-blue-500' : ''
                                }`}
                              >
                                <span>Gemini 3.7</span>
                                {selectedModel === 'Gemini 3.7' && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedModel('Gemini 3.5 Flash');
                                  setModelDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-500/10 cursor-pointer ${
                                  selectedModel === 'Gemini 3.5 Flash' ? 'font-bold text-blue-500' : ''
                                }`}
                              >
                                <span>Gemini 3.5 Flash</span>
                                {selectedModel === 'Gemini 3.5 Flash' && <Check className="w-3.5 h-3.5" />}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Send / Stop Button */}
                      {loading ? (
                        <button
                          type="button"
                          onClick={handleStopGeneration}
                          className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                          title="Stop generating"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSend()}
                          disabled={!input.trim() && attachments.length === 0}
                          className="w-9 h-9 rounded-full bg-[#0a1128] hover:bg-[#152248] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-30 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:cursor-not-allowed shadow-xs"
                          title="Send message"
                        >
                          <ArrowDown className="w-4 h-4 rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                <p className="text-[10px] text-slate-500 text-center font-medium mt-2">
                  DS TECH AI can assist with general queries, CAC verification (RC-1849204), services, and academy programmes.
                </p>
              </div>
            </div>

          </main>
        </div>

      </div>
    </AnimatePresence>
  );
};

// Subcomponent: Individual Conversation Item in Sidebar
interface ConversationItemProps {
  conv: Conversation;
  activeConvId: string | null;
  editingConvId: string | null;
  editingTitle: string;
  isDark: boolean;
  onLoad: (id: string) => void;
  onStartRename: (conv: Conversation, e: React.MouseEvent) => void;
  onSaveRename: (id: string, e: React.FormEvent | React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  setEditingTitle: (title: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  activeConvId,
  editingConvId,
  editingTitle,
  isDark,
  onLoad,
  onStartRename,
  onSaveRename,
  onDelete,
  setEditingTitle
}) => {
  const isActive = activeConvId === conv.id;
  const isEditing = editingConvId === conv.id;
  const timestampText = formatConvTimestamp(conv.updated_at);

  return (
    <div
      onClick={() => !isEditing && onLoad(conv.id)}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
        isActive
          ? isDark
            ? 'bg-[#152042] text-white border-blue-500/40 font-medium'
            : 'bg-white text-slate-900 border-slate-300 font-semibold shadow-2xs'
          : isDark
            ? 'bg-transparent text-slate-300 border-transparent hover:bg-slate-800/40 hover:text-white'
            : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200/50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <FileText className={`w-3.5 h-3.5 shrink-0 ${
          isActive ? 'text-blue-500' : 'text-slate-400'
        }`} />
        
        {isEditing ? (
          <form onSubmit={(e) => onSaveRename(conv.id, e)} className="flex items-center gap-1 flex-1">
            <input
              type="text"
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className={`w-full text-xs px-1.5 py-0.5 rounded border focus:outline-none ${
                isDark ? 'bg-slate-900 text-white border-blue-500' : 'bg-white text-slate-900 border-blue-500'
              }`}
            />
            <button type="submit" className="text-emerald-400 p-0.5"><Check className="w-3.5 h-3.5" /></button>
          </form>
        ) : (
          <span className="truncate font-medium leading-snug flex-1">{conv.title}</span>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {/* Timestamp text (hidden when hovering to show action buttons) */}
          <span className="text-[10px] text-slate-400 group-hover:hidden transition-all">
            {timestampText}
          </span>

          <div className="hidden group-hover:flex items-center gap-0.5 transition-all">
            <button
              onClick={(e) => onStartRename(conv, e)}
              className="p-1 text-slate-400 hover:text-blue-500"
              title="Rename chat"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => onDelete(conv.id, e)}
              className="p-1 text-slate-400 hover:text-red-500"
              title="Delete chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
