import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, CheckCircle2, XCircle, Clock, Eye, Trash2, Download, 
  FileSpreadsheet, FileDown, Briefcase, GraduationCap, MapPin, Sparkles, 
  UserCheck, AlertCircle, ChevronLeft, ChevronRight, Calendar, Mail, Phone, RefreshCw,  
  Edit3, ArrowLeft, Heart, BarChart3, Users, Landmark, UserMinus, ShieldAlert, LogOut,
  QrCode, MessageSquare, Send, FileText, Printer, Layers, FolderOpen, BookOpen,
  Video, Plus, PlusCircle, Check, MoreVertical, Settings, Sliders, Database, ArrowUp,
  Sun, Moon, Globe, ChevronDown, Copy, X, Code, Bell
} from 'lucide-react';
import { JobApplication } from '../types';
import { useNotifications } from './NotificationProvider';
import { NotificationCenter } from './NotificationCenter';
import { Logo } from './Logo';
import { apiGetApplications, apiUpdateApplication, apiDeleteApplication } from '../lib/storage';
import { 
  apiGetScanHistory, 
  apiSubscribeToRealtimeSync, 
  apiSummarizeApplicant, 
  apiAnalyzeCandidate,
  ScanHistoryRecord 
} from '../lib/api';
import { ApplicationQRScanner } from './ApplicationQRScanner';
import { CareersFormPDFView } from './CareersFormPDFView';
import { BrevoEmailDashboard } from './BrevoEmailDashboard';
import { AdminAuthGate } from './AdminAuthGate';
import { AdminChatCenter } from './AdminChatCenter';

import { 
  SERVICES, 
  PORTFOLIO, 
  BLOG_POSTS, 
  COURSES, 
  CLIENT_INVOICES, 
  CLIENT_TICKETS 
} from '../lib/data';

interface AdminDashboardProps {
  onBackToPortal: () => void;
  onViewApplicant: (id: string) => void;
  language?: string;
  setLanguage?: (lang: string) => void;
  theme?: string;
  setTheme?: (theme: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToPortal,
  onViewApplicant,
  language = 'en',
  setLanguage = (_lang: string) => {},
  theme = 'light',
  setTheme = (_theme: string) => {},
}) => {
  const { unreadCount, registerUser } = useNotifications();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAdminLoggedIn') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState<boolean>(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [eduFilter, setEduFilter] = useState<'all' | 'student' | 'graduate'>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  
  // Selected candidate details drawer/modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotesText, setAdminNotesText] = useState<string>('');
  const [offerRoleInput, setOfferRoleInput] = useState<string>('');
  const [salaryInput, setSalaryInput] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // 2026 Advanced Features States
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>([]);
  const [scanHistoryLoading, setScanHistoryLoading] = useState<boolean>(false);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [aiSummaryLoading, setAiSummaryLoading] = useState<boolean>(false);

  // New features: PDF View toggle and Message Presets
  const [adminDetailTab, setAdminDetailTab] = useState<'actions' | 'pdf' | 'ai'>('actions');
  const [selectedPreset, setSelectedPreset] = useState<string>('review');
  const [customMessage, setCustomMessage] = useState<string>('');

  const [candidateAnalyses, setCandidateAnalyses] = useState<Record<string, {
    compatibilityScore: number;
    keyStrengths: string[];
    potentialRisks: string[];
    interviewQuestions: string[];
  }>>(() => {
    try {
      const saved = localStorage.getItem('candidate_analyses');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [candidateAnalysisLoading, setCandidateAnalysisLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('candidate_analyses', JSON.stringify(candidateAnalyses));
    } catch (e) {}
  }, [candidateAnalyses]);

  // Super Admin Control Center State
  const [adminModule, setAdminModule] = useState<'recruitment' | 'website' | 'portfolio' | 'blog' | 'training' | 'clients' | 'analytics' | 'notifications' | 'emails' | 'chat'>('recruitment');
  
  // Custom navigation header states
  const [isThreeDotsOpen, setIsThreeDotsOpen] = useState<boolean>(false);
  const [isAdminLangDropdownOpen, setIsAdminLangDropdownOpen] = useState<boolean>(false);
  const [showAdminNotification, setShowAdminNotification] = useState<string | null>(null);
  const [showSQLSchemaModal, setShowSQLSchemaModal] = useState<boolean>(false);
  const [showDeploymentGuideModal, setShowDeploymentGuideModal] = useState<boolean>(false);
  const [guidePage, setGuidePage] = useState<number>(0);
  const [copiedSQL, setCopiedSQL] = useState<boolean>(false);
  const [sqlCode, setSqlCode] = useState<string>('');

  const [paperScale, setPaperScale] = useState<number>(1);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const paperParentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDeploymentGuideModal) return;
    const updateScale = () => {
      const isMobile = window.innerWidth < 640;
      setIsMobileView(isMobile);

      if (paperParentRef.current) {
        const parentWidth = paperParentRef.current.clientWidth || 320;
        // 210mm in pixels at 96 DPI is exactly 793.7px. Let's design for a base of 794px
        const targetWidth = 794;
        // Leave some small breathing padding on mobile (e.g. 16px)
        const availableWidth = parentWidth - 16;
        if (availableWidth < targetWidth) {
          setPaperScale(availableWidth / targetWidth);
        } else {
          setPaperScale(1);
        }
      }
    };
    // Update immediately and schedule a small timeout to let modal transition settle
    updateScale();
    const timer = setTimeout(updateScale, 150);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [showDeploymentGuideModal]);

  useEffect(() => {
    if (showSQLSchemaModal) {
      setSqlCode(generateSQLSchemaString());
    }
  }, [showSQLSchemaModal]);
  
  // Interactive lists states initialized from our central database (with localStorage backup)
  const [adminServices, setAdminServices] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('admin_services');
      return saved ? JSON.parse(saved) : SERVICES;
    } catch (e) {
      console.error('Failed to parse admin_services from localStorage:', e);
      return SERVICES;
    }
  });
  
  const [adminProjects, setAdminProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('admin_portfolio_projects');
      return saved ? JSON.parse(saved) : PORTFOLIO;
    } catch (e) {
      console.error('Failed to parse admin_portfolio_projects from localStorage:', e);
      return PORTFOLIO;
    }
  });
  
  const [adminBlogs, setAdminBlogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('admin_blogs');
      return saved ? JSON.parse(saved) : BLOG_POSTS;
    } catch (e) {
      console.error('Failed to parse admin_blogs from localStorage:', e);
      return BLOG_POSTS;
    }
  });

  const [adminCourses, setAdminCourses] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('admin_courses');
      return saved ? JSON.parse(saved) : COURSES;
    } catch (e) {
      console.error('Failed to parse admin_courses from localStorage:', e);
      return COURSES;
    }
  });

  // Sync to localStorage hooks with custom dispatch to notify any same-window active listeners
  useEffect(() => {
    localStorage.setItem('admin_services', JSON.stringify(adminServices));
    window.dispatchEvent(new Event('storage'));
  }, [adminServices]);

  useEffect(() => {
    localStorage.setItem('admin_portfolio_projects', JSON.stringify(adminProjects));
    window.dispatchEvent(new Event('storage'));
  }, [adminProjects]);

  useEffect(() => {
    localStorage.setItem('admin_blogs', JSON.stringify(adminBlogs));
    window.dispatchEvent(new Event('storage'));
  }, [adminBlogs]);

  useEffect(() => {
    localStorage.setItem('admin_courses', JSON.stringify(adminCourses));
    window.dispatchEvent(new Event('storage'));
  }, [adminCourses]);

  const [adminInvoices, setAdminInvoices] = useState(() => CLIENT_INVOICES);

  const [adminTickets, setAdminTickets] = useState(() => CLIENT_TICKETS);

  // Dynamic notification settings
  const [notifConfig, setNotifConfig] = useState({
    emailEnabled: true,
    whatsappEnabled: true,
    inAppEnabled: true,
    whatsappTemplate: "Dear {{name}}, your application for the role of {{role}} at DS Tech has been officially {{status}}.",
    emailTemplate: "Hello {{name}},\n\nWe are pleased to inform you that your application for {{role}} has been successfully {{status}}.\n\nWarm regards,\nHR Team"
  });

  // State to manage adding elements in admin panels
  const [isAddingSvc, setIsAddingSvc] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcPrice, setSvcPrice] = useState('₦150,000');
  const [svcCategory, setSvcCategory] = useState('marketing');
  const [svcDesc, setSvcDesc] = useState('');
  const [editingSvc, setEditingSvc] = useState<any | null>(null);
  const [svcImage, setSvcImage] = useState('');
  const [svcUrl, setSvcUrl] = useState('');
  const [svcFilterCat, setSvcFilterCat] = useState('all');

  const [isAddingProj, setIsAddingProj] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projCat, setProjCat] = useState('Digital Marketing');
  const [projStats, setProjStats] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [editingProj, setEditingProj] = useState<any | null>(null);
  const [projClient, setProjClient] = useState('');
  const [projDate, setProjDate] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projVideo, setProjVideo] = useState('');
  const [projContent, setProjContent] = useState('');
  const [projTags, setProjTags] = useState('');

  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCat, setBlogCat] = useState('Marketing');
  const [blogDesc, setBlogDesc] = useState('');

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await apiGetApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while communicating with the database.');
    } finally {
      setLoading(false);
    }
  };

  // Premium Admin Tool: Reset state back to original data central arrays
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all website catalogs, portfolios, blogs, and courses to default central records? This will clear your custom additions.")) {
      localStorage.removeItem('admin_services');
      localStorage.removeItem('admin_portfolio_projects');
      localStorage.removeItem('admin_blogs');
      localStorage.removeItem('admin_courses');
      setAdminServices(SERVICES);
      setAdminProjects(PORTFOLIO);
      setAdminBlogs(BLOG_POSTS);
      setAdminCourses(COURSES);
      
      // Notify components & trigger brief toast notification
      window.dispatchEvent(new Event('storage'));
      setShowAdminNotification("System state rolled back to pristine central static records.");
      setTimeout(() => setShowAdminNotification(null), 3500);
      setIsThreeDotsOpen(false);
    }
  };

  // Premium Admin Tool: Export all customized schemas as JSON
  const handleExportData = () => {
    try {
      const packageObj = {
        exportedAt: new Date().toISOString(),
        version: "2.1.0",
        services: adminServices,
        projects: adminProjects,
        blogs: adminBlogs,
        courses: adminCourses,
        applicationsCount: applications.length
      };
      const blob = new Blob([JSON.stringify(packageObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ds_tech_admin_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowAdminNotification("Database schema bundle exported successfully as JSON!");
      setTimeout(() => setShowAdminNotification(null), 3000);
      setIsThreeDotsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to compile backup payload.");
    }
  };

  // Helper to generate fully-structured Cloudflare SQL schema content
  const generateSQLSchemaString = () => {
    const escapeStr = (val: any) => {
      if (val === undefined || val === null) return 'NULL';
      return "'" + String(val).replace(/'/g, "''") + "'";
    };
    const escapeNum = (val: any) => {
      if (val === undefined || val === null) return 'NULL';
      return typeof val === 'boolean' ? (val ? 1 : 0) : Number(val);
    };
    const escapeJSON = (val: any) => {
      if (val === undefined || val === null) return 'NULL';
      return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
    };

    let sqlLines: string[] = [];
    
    sqlLines.push("-- =====================================================================");
    sqlLines.push("-- Cloudflare D1 / SQLite Database Schema & Seed Script");
    sqlLines.push(`-- Generated At: ${new Date().toISOString()}`);
    sqlLines.push("-- Target Platform: Cloudflare D1 & SQLite Production Environment");
    sqlLines.push("-- Version: 2.2.0");
    sqlLines.push("-- =====================================================================\n");

    sqlLines.push("PRAGMA foreign_keys = ON;\n");

    sqlLines.push("-- DROP EXISTING TABLES (Enables clean migrations & test runs)");
    sqlLines.push("DROP TABLE IF EXISTS support_tickets;");
    sqlLines.push("DROP TABLE IF EXISTS invoices;");
    sqlLines.push("DROP TABLE IF EXISTS client_projects;");
    sqlLines.push("DROP TABLE IF EXISTS course_lessons;");
    sqlLines.push("DROP TABLE IF EXISTS courses;");
    sqlLines.push("DROP TABLE IF EXISTS blogs;");
    sqlLines.push("DROP TABLE IF EXISTS blog_posts;");
    sqlLines.push("DROP TABLE IF EXISTS portfolio;");
    sqlLines.push("DROP TABLE IF EXISTS portfolio_projects;");
    sqlLines.push("DROP TABLE IF EXISTS services;");
    sqlLines.push("DROP TABLE IF EXISTS job_applications;");
    sqlLines.push("DROP TABLE IF EXISTS eidas_webauthn_devices;");
    sqlLines.push("DROP TABLE IF EXISTS zkp_credentials_proofs;");
    sqlLines.push("DROP TABLE IF EXISTS digital_passports;");
    sqlLines.push("DROP TABLE IF EXISTS compensation_agreements;");
    sqlLines.push("DROP TABLE IF EXISTS career_constellations;");
    sqlLines.push("DROP TABLE IF EXISTS portal_users;");
    sqlLines.push("DROP TABLE IF EXISTS biometric_challenges;");
    sqlLines.push("DROP TABLE IF EXISTS biometric_credentials;");
    sqlLines.push("DROP TABLE IF EXISTS biometric_attempts_logs;");
    sqlLines.push("DROP TABLE IF EXISTS notifications;");
    sqlLines.push("DROP TABLE IF EXISTS fcm_tokens;");
    sqlLines.push("DROP TABLE IF EXISTS email_logs;");
    sqlLines.push("DROP TABLE IF EXISTS email_queue;");
    sqlLines.push("DROP TABLE IF EXISTS email_templates;");
    sqlLines.push("DROP TABLE IF EXISTS passkeys;");
    sqlLines.push("DROP TABLE IF EXISTS users;");
    sqlLines.push("DROP TABLE IF EXISTS biometric_logs;");
    sqlLines.push("DROP TABLE IF EXISTS scan_history;");
    sqlLines.push("DROP TABLE IF EXISTS applications;\n");

    sqlLines.push("-- Table: services");
    sqlLines.push("CREATE TABLE services (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    data_json TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: portfolio");
    sqlLines.push("CREATE TABLE portfolio (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    data_json TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: blogs");
    sqlLines.push("CREATE TABLE blogs (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    data_json TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: courses");
    sqlLines.push("CREATE TABLE courses (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    data_json TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: course_lessons");
    sqlLines.push("CREATE TABLE course_lessons (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    course_id TEXT NOT NULL,");
    sqlLines.push("    title TEXT NOT NULL,");
    sqlLines.push("    duration TEXT,");
    sqlLines.push("    is_free INTEGER DEFAULT 0,");
    sqlLines.push("    video_url TEXT,");
    sqlLines.push("    content TEXT,");
    sqlLines.push("    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: client_projects");
    sqlLines.push("CREATE TABLE client_projects (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    name TEXT NOT NULL,");
    sqlLines.push("    status TEXT NOT NULL,");
    sqlLines.push("    progress REAL DEFAULT 0.0,");
    sqlLines.push("    deadline TEXT,");
    sqlLines.push("    client_name TEXT,");
    sqlLines.push("    budget TEXT");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: invoices");
    sqlLines.push("CREATE TABLE invoices (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    number TEXT NOT NULL UNIQUE,");
    sqlLines.push("    amount TEXT NOT NULL,");
    sqlLines.push("    date TEXT NOT NULL,");
    sqlLines.push("    due_date TEXT NOT NULL,");
    sqlLines.push("    status TEXT NOT NULL,");
    sqlLines.push("    project TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: support_tickets");
    sqlLines.push("CREATE TABLE support_tickets (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    subject TEXT NOT NULL,");
    sqlLines.push("    priority TEXT NOT NULL,");
    sqlLines.push("    status TEXT NOT NULL,");
    sqlLines.push("    date TEXT NOT NULL,");
    sqlLines.push("    last_message TEXT");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: job_applications");
    sqlLines.push("CREATE TABLE job_applications (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    created_at TEXT NOT NULL,");
    sqlLines.push("    full_name TEXT NOT NULL,");
    sqlLines.push("    marital_status TEXT,");
    sqlLines.push("    gender TEXT,");
    sqlLines.push("    date_of_birth TEXT,");
    sqlLines.push("    nationality TEXT,");
    sqlLines.push("    state_of_origin TEXT,");
    sqlLines.push("    lga_town_of_origin TEXT,");
    sqlLines.push("    state_of_residence TEXT,");
    sqlLines.push("    residential_address TEXT,");
    sqlLines.push("    email_address TEXT NOT NULL,");
    sqlLines.push("    phone_numbers TEXT NOT NULL,");
    sqlLines.push("    passport_photo TEXT,");
    sqlLines.push("    guarantor_full_name TEXT,");
    sqlLines.push("    guarantor_hometown TEXT,");
    sqlLines.push("    guarantor_current_address TEXT,");
    sqlLines.push("    guarantor_phone_number TEXT,");
    sqlLines.push("    guarantor_relationship TEXT,");
    sqlLines.push("    highest_qualification TEXT,");
    sqlLines.push("    school_institution TEXT,");
    sqlLines.push("    field_of_study TEXT,");
    sqlLines.push("    is_student_or_graduate TEXT,");
    sqlLines.push("    exp1 TEXT,");
    sqlLines.push("    exp2 TEXT,");
    sqlLines.push("    exp3 TEXT,");
    sqlLines.push("    major_role TEXT,");
    sqlLines.push("    skill_role1 TEXT,");
    sqlLines.push("    skill_role2 TEXT,");
    sqlLines.push("    skill_role3 TEXT,");
    sqlLines.push("    interests TEXT,");
    sqlLines.push("    other_details TEXT,");
    sqlLines.push("    monthly_salary_mode TEXT,");
    sqlLines.push("    contract_freelance_mode TEXT,");
    sqlLines.push("    available_for_any INTEGER DEFAULT 1,");
    sqlLines.push("    language_proficiency TEXT,");
    sqlLines.push("    personal_statement TEXT,");
    sqlLines.push("    applicant_signature TEXT,");
    sqlLines.push("    applicant_signature_type TEXT,");
    sqlLines.push("    declaration_date TEXT,");
    sqlLines.push("    approved_by_hr INTEGER DEFAULT 0,");
    sqlLines.push("    approved_role TEXT,");
    sqlLines.push("    approved_signature TEXT,");
    sqlLines.push("    approved_date TEXT,");
    sqlLines.push("    offer_role TEXT,");
    sqlLines.push("    monthly_salary TEXT,");
    sqlLines.push("    appointment_accepted INTEGER DEFAULT 0,");
    sqlLines.push("    appointment_signature TEXT,");
    sqlLines.push("    appointment_acceptance_date TEXT,");
    sqlLines.push("    status TEXT DEFAULT 'pending',");
    sqlLines.push("    admin_notes TEXT");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: eidas_webauthn_devices");
    sqlLines.push("CREATE TABLE eidas_webauthn_devices (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    user_id TEXT NOT NULL,");
    sqlLines.push("    credential_id TEXT NOT NULL UNIQUE,");
    sqlLines.push("    public_key TEXT NOT NULL,");
    sqlLines.push("    algorithm TEXT DEFAULT 'Dilithium-5',");
    sqlLines.push("    sign_count INTEGER DEFAULT 0,");
    sqlLines.push("    created_at TEXT NOT NULL,");
    sqlLines.push("    status TEXT DEFAULT 'ACTIVE'");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: zkp_credentials_proofs");
    sqlLines.push("CREATE TABLE zkp_credentials_proofs (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    candidate_id TEXT NOT NULL,");
    sqlLines.push("    credential_name TEXT NOT NULL,");
    sqlLines.push("    hash_algorithm TEXT DEFAULT 'SHA3-512',");
    sqlLines.push("    proof_hash TEXT NOT NULL,");
    sqlLines.push("    verification_node TEXT DEFAULT 'ZKP_VALIDATION_NODE_D1',");
    sqlLines.push("    verified_at TEXT NOT NULL,");
    sqlLines.push("    is_ledger_bound INTEGER DEFAULT 1");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: digital_passports");
    sqlLines.push("CREATE TABLE digital_passports (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    candidate_id TEXT NOT NULL UNIQUE,");
    sqlLines.push("    passport_hash TEXT NOT NULL,");
    sqlLines.push("    issuer TEXT DEFAULT 'DS Tech and Digital Marketing Agency Limited',");
    sqlLines.push("    compliance_standard TEXT DEFAULT 'EIDAS WebAuthn Multi-Factor Security Protocol',");
    sqlLines.push("    biometric_seal_status TEXT NOT NULL,");
    sqlLines.push("    created_at TEXT NOT NULL,");
    sqlLines.push("    e_signing_authority_status TEXT DEFAULT 'CONTRACT_READY'");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: compensation_agreements");
    sqlLines.push("CREATE TABLE compensation_agreements (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    candidate_id TEXT NOT NULL,");
    sqlLines.push("    requested_salary INTEGER NOT NULL,");
    sqlLines.push("    requested_equity REAL NOT NULL,");
    sqlLines.push("    work_mode TEXT NOT NULL,");
    sqlLines.push("    negotiation_status TEXT NOT NULL,");
    sqlLines.push("    agreement_compact_seal TEXT,");
    sqlLines.push("    arbitrated_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: career_constellations");
    sqlLines.push("CREATE TABLE career_constellations (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    candidate_id TEXT NOT NULL,");
    sqlLines.push("    skills_matrix_json TEXT NOT NULL,");
    sqlLines.push("    retention_prediction_pct REAL DEFAULT 94.8,");
    sqlLines.push("    screening_matrix_hash TEXT,");
    sqlLines.push("    last_updated TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: portal_users");
    sqlLines.push("CREATE TABLE portal_users (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    email TEXT UNIQUE NOT NULL,");
    sqlLines.push("    password_hash TEXT NOT NULL,");
    sqlLines.push("    fullName TEXT,");
    sqlLines.push("    preferences TEXT,");
    sqlLines.push("    created_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: biometric_challenges");
    sqlLines.push("CREATE TABLE biometric_challenges (");
    sqlLines.push("    user_id TEXT PRIMARY KEY,");
    sqlLines.push("    challenge TEXT NOT NULL,");
    sqlLines.push("    created_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: biometric_credentials");
    sqlLines.push("CREATE TABLE biometric_credentials (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    user_id TEXT NOT NULL,");
    sqlLines.push("    credential_id TEXT NOT NULL UNIQUE,");
    sqlLines.push("    public_key TEXT NOT NULL,");
    sqlLines.push("    counter INTEGER DEFAULT 0,");
    sqlLines.push("    transports TEXT");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: biometric_attempts_logs");
    sqlLines.push("CREATE TABLE biometric_attempts_logs (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    user_id TEXT,");
    sqlLines.push("    email TEXT,");
    sqlLines.push("    biometric_type TEXT NOT NULL,");
    sqlLines.push("    status TEXT NOT NULL,");
    sqlLines.push("    ip_address TEXT,");
    sqlLines.push("    user_agent TEXT,");
    sqlLines.push("    message TEXT,");
    sqlLines.push("    timestamp TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: users");
    sqlLines.push("CREATE TABLE users (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    email TEXT UNIQUE NOT NULL,");
    sqlLines.push("    full_name TEXT,");
    sqlLines.push("    role TEXT DEFAULT 'Applicant',");
    sqlLines.push("    created_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: passkeys");
    sqlLines.push("CREATE TABLE passkeys (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    user_id TEXT NOT NULL,");
    sqlLines.push("    public_key TEXT NOT NULL,");
    sqlLines.push("    counter INTEGER DEFAULT 0,");
    sqlLines.push("    transports TEXT,");
    sqlLines.push("    created_at TEXT NOT NULL,");
    sqlLines.push("    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: biometric_logs");
    sqlLines.push("CREATE TABLE biometric_logs (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    user_id TEXT,");
    sqlLines.push("    email TEXT,");
    sqlLines.push("    biometric_type TEXT,");
    sqlLines.push("    status TEXT,");
    sqlLines.push("    message TEXT,");
    sqlLines.push("    user_agent TEXT,");
    sqlLines.push("    created_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: scan_history");
    sqlLines.push("CREATE TABLE scan_history (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    user_id TEXT NOT NULL,");
    sqlLines.push("    applicant_id TEXT,");
    sqlLines.push("    applicant_name TEXT,");
    sqlLines.push("    scanned_at TEXT NOT NULL,");
    sqlLines.push("    secure_r2_url TEXT,");
    sqlLines.push("    safety_status TEXT");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: applications");
    sqlLines.push("CREATE TABLE applications (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    data_json TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: notifications");
    sqlLines.push("CREATE TABLE notifications (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    title TEXT NOT NULL,");
    sqlLines.push("    message TEXT NOT NULL,");
    sqlLines.push("    type TEXT DEFAULT 'info',");
    sqlLines.push("    priority TEXT DEFAULT 'normal',");
    sqlLines.push("    userId TEXT,");
    sqlLines.push("    recipientRole TEXT,");
    sqlLines.push("    image TEXT,");
    sqlLines.push("    createdAt TEXT NOT NULL,");
    sqlLines.push("    read INTEGER DEFAULT 0,");
    sqlLines.push("    actionUrl TEXT,");
    sqlLines.push("    metadata TEXT,");
    sqlLines.push("    expiresAt TEXT");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: fcm_tokens");
    sqlLines.push("CREATE TABLE fcm_tokens (");
    sqlLines.push("    tokenId TEXT PRIMARY KEY,");
    sqlLines.push("    userId TEXT,");
    sqlLines.push("    fcmToken TEXT NOT NULL,");
    sqlLines.push("    deviceName TEXT,");
    sqlLines.push("    deviceType TEXT,");
    sqlLines.push("    isActive INTEGER DEFAULT 1,");
    sqlLines.push("    createdAt TEXT NOT NULL,");
    sqlLines.push("    lastUsedAt TEXT,");
    sqlLines.push("    expiresAt TEXT");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: email_logs");
    sqlLines.push("CREATE TABLE email_logs (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    recipient_email TEXT NOT NULL,");
    sqlLines.push("    recipient_id TEXT,");
    sqlLines.push("    subject TEXT NOT NULL,");
    sqlLines.push("    email_type TEXT,");
    sqlLines.push("    status TEXT NOT NULL,");
    sqlLines.push("    brevo_message_id TEXT,");
    sqlLines.push("    sent_at TEXT,");
    sqlLines.push("    delivered_at TEXT,");
    sqlLines.push("    opened_at TEXT,");
    sqlLines.push("    clicked_at TEXT,");
    sqlLines.push("    open_count INTEGER DEFAULT 0,");
    sqlLines.push("    click_count INTEGER DEFAULT 0,");
    sqlLines.push("    failed_reason TEXT,");
    sqlLines.push("    created_at TEXT NOT NULL,");
    sqlLines.push("    updated_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: email_queue");
    sqlLines.push("CREATE TABLE email_queue (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    recipient_email TEXT NOT NULL,");
    sqlLines.push("    recipient_id TEXT,");
    sqlLines.push("    subject TEXT NOT NULL,");
    sqlLines.push("    email_type TEXT,");
    sqlLines.push("    template_data TEXT,");
    sqlLines.push("    priority TEXT DEFAULT 'normal',");
    sqlLines.push("    status TEXT DEFAULT 'pending',");
    sqlLines.push("    retry_count INTEGER DEFAULT 0,");
    sqlLines.push("    next_retry_at TEXT,");
    sqlLines.push("    error_message TEXT,");
    sqlLines.push("    created_at TEXT NOT NULL,");
    sqlLines.push("    updated_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Table: email_templates");
    sqlLines.push("CREATE TABLE email_templates (");
    sqlLines.push("    id TEXT PRIMARY KEY,");
    sqlLines.push("    template_name TEXT UNIQUE NOT NULL,");
    sqlLines.push("    template_id INTEGER,");
    sqlLines.push("    subject TEXT NOT NULL,");
    sqlLines.push("    description TEXT,");
    sqlLines.push("    variables TEXT,");
    sqlLines.push("    created_at TEXT NOT NULL,");
    sqlLines.push("    updated_at TEXT NOT NULL");
    sqlLines.push(");\n");

    sqlLines.push("-- Relational & Query Performance Indexes");
    sqlLines.push("CREATE INDEX idx_lessons_course ON course_lessons(course_id);");
    sqlLines.push("CREATE INDEX idx_invoices_status ON invoices(status);");
    sqlLines.push("CREATE INDEX idx_tickets_status ON support_tickets(status);");
    sqlLines.push("CREATE INDEX idx_applications_status ON job_applications(status);");
    sqlLines.push("CREATE INDEX idx_applications_email ON job_applications(email_address);");
    sqlLines.push("CREATE INDEX idx_webauthn_user ON eidas_webauthn_devices(user_id);");
    sqlLines.push("CREATE INDEX idx_zkp_candidate ON zkp_credentials_proofs(candidate_id);");
    sqlLines.push("CREATE INDEX idx_passport_candidate ON digital_passports(candidate_id);");
    sqlLines.push("CREATE INDEX idx_compensation_candidate ON compensation_agreements(candidate_id);");
    sqlLines.push("CREATE INDEX idx_constellation_candidate ON career_constellations(candidate_id);");
    sqlLines.push("CREATE INDEX idx_biometric_logs_user ON biometric_attempts_logs(user_id);");
    sqlLines.push("CREATE INDEX idx_biometric_logs_email ON biometric_attempts_logs(email);");
    sqlLines.push("CREATE INDEX idx_notifications_user ON notifications(userId);");
    sqlLines.push("CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);\n");

    sqlLines.push("-- =====================================================================");
    sqlLines.push("-- SEED DATA INSERTIONS (Hydrates the schema with active dashboard states)");
    sqlLines.push("-- =====================================================================\n");

    sqlLines.push("-- Seeds: services");
    adminServices.forEach((svc: any) => {
      sqlLines.push(`INSERT INTO services (id, data_json) VALUES (${escapeStr(svc.id)}, ${escapeJSON(svc)});`);
    });
    sqlLines.push("");

    sqlLines.push("-- Seeds: portfolio");
    adminProjects.forEach((proj: any) => {
      sqlLines.push(`INSERT INTO portfolio (id, data_json) VALUES (${escapeStr(proj.id)}, ${escapeJSON(proj)});`);
    });
    sqlLines.push("");

    sqlLines.push("-- Seeds: blogs");
    adminBlogs.forEach((blog: any) => {
      sqlLines.push(`INSERT INTO blogs (id, data_json) VALUES (${escapeStr(blog.id)}, ${escapeJSON(blog)});`);
    });
    sqlLines.push("");

    sqlLines.push("-- Seeds: courses");
    adminCourses.forEach((course: any) => {
      sqlLines.push(`INSERT INTO courses (id, data_json) VALUES (${escapeStr(course.id)}, ${escapeJSON(course)});`);
    });
    sqlLines.push("");

    sqlLines.push("-- Seeds: client_projects");
    const localProjects = [
      { id: "proj_01", name: "Premium Shopify Storefront", status: "completed", progress: 100, deadline: "2026-04-10", clientName: "Hassan Al-Amin", budget: "₦450,000" },
      { id: "proj_02", name: "LMS Academy Portal Integration", status: "progress", progress: 65, deadline: "2026-07-20", clientName: "DS Consulting LLC", budget: "₦850,000" },
      { id: "proj_03", name: "Meta Ads & Lead Funnel Pipeline", status: "planning", progress: 15, deadline: "2026-08-01", clientName: "GreenLight Foods Ltd", budget: "₦300,000" }
    ];
    localProjects.forEach((proj: any) => {
      sqlLines.push(`INSERT INTO client_projects (id, name, status, progress, deadline, client_name, budget) VALUES (${escapeStr(proj.id)}, ${escapeStr(proj.name)}, ${escapeStr(proj.status)}, ${escapeNum(proj.progress)}, ${escapeStr(proj.deadline)}, ${escapeStr(proj.clientName)}, ${escapeStr(proj.budget)});`);
    });
    sqlLines.push("");

    sqlLines.push("-- Seeds: invoices");
    CLIENT_INVOICES.forEach((inv: any) => {
      sqlLines.push(`INSERT INTO invoices (id, number, amount, date, due_date, status, project) VALUES (${escapeStr(inv.id)}, ${escapeStr(inv.number)}, ${escapeStr(inv.amount)}, ${escapeStr(inv.date)}, ${escapeStr(inv.dueDate)}, ${escapeStr(inv.status)}, ${escapeStr(inv.project)});`);
    });
    sqlLines.push("");

    sqlLines.push("-- Seeds: support_tickets");
    CLIENT_TICKETS.forEach((tick: any) => {
      sqlLines.push(`INSERT INTO support_tickets (id, subject, priority, status, date, last_message) VALUES (${escapeStr(tick.id)}, ${escapeStr(tick.subject)}, ${escapeStr(tick.priority)}, ${escapeStr(tick.status)}, ${escapeStr(tick.date)}, ${escapeStr(tick.lastMessage)});`);
    });
    sqlLines.push("");

    sqlLines.push("-- Seeds: job_applications");
    applications.forEach((app: any) => {
      sqlLines.push(`INSERT INTO job_applications (id, created_at, full_name, marital_status, gender, date_of_birth, nationality, state_of_origin, lga_town_of_origin, state_of_residence, residential_address, email_address, phone_numbers, passport_photo, guarantor_full_name, guarantor_hometown, guarantor_current_address, guarantor_phone_number, guarantor_relationship, highest_qualification, school_institution, field_of_study, is_student_or_graduate, exp1, exp2, exp3, major_role, skill_role1, skill_role2, skill_role3, interests, other_details, monthly_salary_mode, contract_freelance_mode, available_for_any, language_proficiency, personal_statement, applicant_signature, applicant_signature_type, declaration_date, approved_by_hr, approved_role, approved_signature, approved_date, offer_role, monthly_salary, appointment_accepted, appointment_signature, appointment_acceptance_date, status, admin_notes) VALUES (` +
        `${escapeStr(app.id)}, ` +
        `${escapeStr(app.createdAt)}, ` +
        `${escapeStr(app.personalInfo?.fullName)}, ` +
        `${escapeStr(app.personalInfo?.maritalStatus)}, ` +
        `${escapeStr(app.personalInfo?.gender)}, ` +
        `${escapeStr(app.personalInfo?.dateOfBirth)}, ` +
        `${escapeStr(app.personalInfo?.nationality)}, ` +
        `${escapeStr(app.personalInfo?.stateOfOrigin)}, ` +
        `${escapeStr(app.personalInfo?.lgaTownOfOrigin)}, ` +
        `${escapeStr(app.personalInfo?.stateOfResidence)}, ` +
        `${escapeStr(app.personalInfo?.residentialAddress)}, ` +
        `${escapeStr(app.personalInfo?.emailAddress)}, ` +
        `${escapeStr(app.personalInfo?.phoneNumbers)}, ` +
        `${escapeStr(app.personalInfo?.passportPhoto)}, ` +
        `${escapeStr(app.guarantorInfo?.fullName)}, ` +
        `${escapeStr(app.guarantorInfo?.hometown)}, ` +
        `${escapeStr(app.guarantorInfo?.currentAddress)}, ` +
        `${escapeStr(app.guarantorInfo?.phoneNumber)}, ` +
        `${escapeStr(app.guarantorInfo?.relationship)}, ` +
        `${escapeStr(app.educationalBg?.highestQualification)}, ` +
        `${escapeStr(app.educationalBg?.schoolInstitution)}, ` +
        `${escapeStr(app.educationalBg?.fieldOfStudy)}, ` +
        `${escapeStr(app.educationalBg?.isStudentOrGraduate)}, ` +
        `${escapeStr(app.experiences?.exp1)}, ` +
        `${escapeStr(app.experiences?.exp2)}, ` +
        `${escapeStr(app.experiences?.exp3)}, ` +
        `${escapeStr(app.positionSkills?.majorRole)}, ` +
        `${escapeStr(app.positionSkills?.skillRole1)}, ` +
        `${escapeStr(app.positionSkills?.skillRole2)}, ` +
        `${escapeStr(app.positionSkills?.skillRole3)}, ` +
        `${escapeJSON(app.specialization?.interests)}, ` +
        `${escapeStr(app.specialization?.otherDetails)}, ` +
        `${escapeStr(app.workMode?.monthlySalaryJob)}, ` +
        `${escapeStr(app.workMode?.contractFreelanceJob)}, ` +
        `${escapeNum(app.workMode?.availableForAnyOpportunity)}, ` +
        `${escapeStr(app.languageProficiency)}, ` +
        `${escapeStr(app.personalStatement)}, ` +
        `${escapeStr(app.applicantSignature)}, ` +
        `${escapeStr(app.applicantSignatureType)}, ` +
        `${escapeStr(app.declarationDate)}, ` +
        `${escapeNum(app.approvedBy?.approved)}, ` +
        `${escapeStr(app.approvedBy?.role)}, ` +
        `${escapeStr(app.approvedBy?.signature)}, ` +
        `${escapeStr(app.approvedBy?.date)}, ` +
        `${escapeStr(app.approvedBy?.offerRole)}, ` +
        `${escapeStr(app.approvedBy?.monthlySalary)}, ` +
        `${escapeNum(app.appointmentAccepted)}, ` +
        `${escapeStr(app.appointmentSignature)}, ` +
        `${escapeStr(app.appointmentAcceptanceDate)}, ` +
        `${escapeStr(app.status)}, ` +
        `${escapeStr(app.adminNotes)}` +
      `);`);
    });

    sqlLines.push("\n-- Seeds: eidas_webauthn_devices");
    sqlLines.push("INSERT INTO eidas_webauthn_devices (id, user_id, credential_id, public_key, algorithm, sign_count, created_at, status) VALUES ('dev-01', 'usr-demo', 'cred-8f9d3a7e5b', 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7p9X...3b8d', 'Dilithium-5', 12, '2027-01-15T08:30:00Z', 'ACTIVE');");
    sqlLines.push("INSERT INTO eidas_webauthn_devices (id, user_id, credential_id, public_key, algorithm, sign_count, created_at, status) VALUES ('dev-02', 'usr-ngozi', 'cred-d2f1e4c6b5', 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEm3f9...a2c1', 'Dilithium-5', 4, '2027-02-20T14:45:00Z', 'ACTIVE');");

    sqlLines.push("\n-- Seeds: zkp_credentials_proofs");
    sqlLines.push("INSERT INTO zkp_credentials_proofs (id, candidate_id, credential_name, hash_algorithm, proof_hash, verification_node, verified_at, is_ledger_bound) VALUES ('zkp-01', 'usr-demo', 'BS_Computer_Science_Verified_Diploma.pdf', 'SHA3-512', 'SHA256-4D6F5E4B3C2A1E0D9C8B7A6F5E4D3C2B1A0D9C8B7A6F5E4D3C2B1A0D9C8B7A6F...', 'ZKP_VALIDATION_NODE_D1', '2027-03-01T10:00:00Z', 1);");
    sqlLines.push("INSERT INTO zkp_credentials_proofs (id, candidate_id, credential_name, hash_algorithm, proof_hash, verification_node, verified_at, is_ledger_bound) VALUES ('zkp-02', 'usr-demo', 'AWS_Architect_Cert_Verified_Diploma.pdf', 'SHA3-512', 'SHA256-1F2E3D4C5B6A7F8E9D0C1B2A3F4E5D6C7B8A9F0E1D2C3B4A5F6E7D8C9B0A1F2E...', 'ZKP_VALIDATION_NODE_D1', '2027-03-05T11:15:00Z', 1);");

    sqlLines.push("\n-- Seeds: digital_passports");
    sqlLines.push("INSERT INTO digital_passports (id, candidate_id, passport_hash, issuer, compliance_standard, biometric_seal_status, created_at, e_signing_authority_status) VALUES ('pass-01', 'usr-demo', '#DST-2027-DEMO', 'DS Tech and Digital Marketing Agency Limited', 'EIDAS WebAuthn Multi-Factor Security Protocol', 'ACTIVE', '2027-03-10T09:00:00Z', 'CONTRACT_READY');");
    sqlLines.push("INSERT INTO digital_passports (id, candidate_id, passport_hash, issuer, compliance_standard, biometric_seal_status, created_at, e_signing_authority_status) VALUES ('pass-02', 'usr-ngozi', '#DST-2027-NGOZI', 'DS Tech and Digital Marketing Agency Limited', 'EIDAS WebAuthn Multi-Factor Security Protocol', 'ACTIVE', '2027-03-12T10:30:00Z', 'CONTRACT_READY');");

    sqlLines.push("\n-- Seeds: compensation_agreements");
    sqlLines.push("INSERT INTO compensation_agreements (id, candidate_id, requested_salary, requested_equity, work_mode, negotiation_status, agreement_compact_seal, arbitrated_at) VALUES ('comp-01', 'usr-demo', 145, 0.15, 'remote', 'accepted', 'AGREE-SEAL-0X8F9E2D7C5B4A1F2E3D4C5B6A7F8E9D0C1B2A3F4E', '2027-03-22T16:20:00Z');");
    sqlLines.push("INSERT INTO compensation_agreements (id, candidate_id, requested_salary, requested_equity, work_mode, negotiation_status, agreement_compact_seal, arbitrated_at) VALUES ('comp-02', 'usr-ngozi', 130, 0.10, 'hybrid', 'accepted', 'AGREE-SEAL-0X3D4F5E6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E', '2027-03-24T11:45:00Z');");

    sqlLines.push("\n-- Seeds: career_constellations");
    sqlLines.push("INSERT INTO career_constellations (id, candidate_id, skills_matrix_json, retention_prediction_pct, screening_matrix_hash, last_updated) VALUES ('const-01', 'usr-demo', '{\"react\":95,\"typescript\":90,\"tailwindcss\":92,\"node\":85,\"system_architecture\":88}', 94.8, 'SCREEN-MX-0XF1E2D3C4B5A6', '2027-03-25T14:00:00Z');");
    sqlLines.push("INSERT INTO career_constellations (id, candidate_id, skills_matrix_json, retention_prediction_pct, screening_matrix_hash, last_updated) VALUES ('const-02', 'usr-ngozi', '{\"react\":88,\"typescript\":85,\"marketing\":95,\"seo\":92,\"ai_prompting\":90}', 91.2, 'SCREEN-MX-0X2D3C4B5A6F1E', '2027-03-26T15:30:00Z');");

    sqlLines.push("\n-- Seeds: users");
    sqlLines.push("INSERT INTO users (id, email, full_name, role, created_at) VALUES ('usr-demo', 'candidate2026@dstech.com', 'candidate2026', 'Applicant', '2026-07-01T14:29:55.228Z');");

    sqlLines.push("\n-- Seeds: applications");
    applications.forEach((app: any) => {
      sqlLines.push(`INSERT INTO applications (id, data_json) VALUES (${escapeStr(app.id)}, ${escapeJSON(app)});`);
    });

    sqlLines.push("\n-- Seeds: scan_history");
    if (scanHistory && scanHistory.length > 0) {
      scanHistory.forEach((rec: any) => {
        sqlLines.push(`INSERT INTO scan_history (id, user_id, applicant_id, applicant_name, scanned_at, secure_r2_url, safety_status) VALUES (${escapeStr(rec.id)}, ${escapeStr(rec.user_id || 'anonymous')}, ${escapeStr(rec.applicant_id)}, ${escapeStr(rec.applicant_name)}, ${escapeStr(rec.scanned_at)}, ${escapeStr(rec.secure_r2_url)}, ${escapeStr(rec.safety_status)});`);
      });
    } else {
      sqlLines.push("INSERT INTO scan_history (id, user_id, applicant_id, applicant_name, scanned_at, secure_r2_url, safety_status) VALUES ('scan_init_demo', 'anonymous', 'seed-hassan-demo', 'David Alao Chibuzor', '2026-07-01T13:06:13.109Z', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&h=192&fit=crop&auto=format', 'safe');");
    }

    sqlLines.push("\n-- Seeds: biometric_logs");
    sqlLines.push("INSERT INTO biometric_logs (id, user_id, email, biometric_type, status, message, user_agent, created_at) VALUES ('log_8o9sib87o', 'usr-demo', 'candidate2026@dstech.com', 'platform', 'success', 'Logged in via simulated biometric passkey signature (Preview Mode)', 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36', '2026-07-01T14:29:55.228Z');");

    sqlLines.push("\n-- =====================================================================");
    sqlLines.push("-- DATABASE SEEDING COMPLETED SUCCESSFULLY");
    sqlLines.push("-- =====================================================================\n");

    return sqlLines.join('\n');
  };

  // Premium Admin Tool: Export fully-structured Cloudflare D1 SQL schema with seed statements
  const handleExportSQLSchema = () => {
    try {
      const sqlContent = generateSQLSchemaString();
      const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloudflare_d1_schema_seed_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowAdminNotification("Structured Cloudflare SQL schema generated and downloaded!");
      setTimeout(() => setShowAdminNotification(null), 3500);
      setIsThreeDotsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to build structured SQL query file.");
    }
  };

  // Premium Admin Tool: Copy structured Cloudflare D1 SQL schema code to clipboard
  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedSQL(true);
        setTimeout(() => setCopiedSQL(false), 2000);
      } else {
        alert("Please select and copy manually.");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      alert("Please copy manually from the code box.");
    }
  };

  const handleCopySQL = () => {
    try {
      const code = generateSQLSchemaString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
          .then(() => {
            setCopiedSQL(true);
            setTimeout(() => setCopiedSQL(false), 2000);
          })
          .catch(err => {
            console.warn("Clipboard API failed, trying fallback:", err);
            fallbackCopyText(code);
          });
      } else {
        fallbackCopyText(code);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to copy SQL schema.");
    }
  };

  // Premium Admin Tool: Force dispatch system storage event manually
  const handleForceDispatchSync = () => {
    window.dispatchEvent(new Event('storage'));
    setShowAdminNotification("Dispatched cross-tab state event successfully!");
    setTimeout(() => setShowAdminNotification(null), 3000);
    setIsThreeDotsOpen(false);
  };

  // Premium Admin Tool: Download complete markdown masterclass guidebook
  const handleDownloadFullMarkdownWorkbook = () => {
    try {
      const markdownContent = `# CLOUDFLARE D1 & SITE DEPLOYMENT MASTERCLASS
*Curated by Hassan Al-Amin Super Admin Academy*

This is the official comprehensive masterclass handbook detailing how to deploy SQL databases correctly, upload site ZIP packages, configure Wrangler, and achieve real-time multi-device cross-tab synchronization.

================================================================================
MODULE 1: CREATING & INITIALIZING THE CLOUDFLARE D1 DATABASE (SQLITE EDGE)
================================================================================
Professor Hassan Al-Amin: Welcome, Kofi! Today, we're making our local catalogs live worldwide. First, we need a Cloudflare D1 Database. D1 is SQLite run at the edge, offering near-zero latency and high durability. Go to your Cloudflare Dashboard, select D1 on the sidebar, and click "Create database". Name it "hassan-portal-db".

Kofi (Student): Understood, Professor! Once it's created, I get a unique Database ID. But how do we load all our tables, services, portfolios, and courses into it? Do we write them manually?

Professor Hassan Al-Amin: No, Kofi! We use the SQL schema script we just generated in our Admin Dashboard! You can click "Export SQL Schema (D1)" in this utility menu to download the file. Then, use Wrangler CLI to execute it locally or in production:

\`\`\`bash
# For Local Sandbox testing:
npx wrangler d1 execute hassan-portal-db --local --file=schema.sql

# For Production Deployment in the Cloud:
npx wrangler d1 execute hassan-portal-db --remote --file=schema.sql
\`\`\`

================================================================================
MODULE 2: EXPORTING SITE CODE AS ZIP & HOSTING ON CLOUDFLARE PAGES
================================================================================
Kofi (Student): That's incredibly elegant, Professor! Our database is now live. But what about the frontend application itself? How do we export it from AI Studio and host it so anyone can load it?

Professor Hassan Al-Amin: An excellent question! We export our code as a ZIP archive. Go to the top settings wheel or export options in Google AI Studio, select "Export as ZIP", and save it. Then:
1. Unzip the archive on your local computer.
2. Open your terminal in that folder and run "npm install" to bootstrap dependencies.
3. Build the optimized static files using "npm run build". This generates a production-ready "dist/" directory containing optimized Javascript, HTML5, and compiled CSS variables.
4. Go to the Cloudflare Pages section, click "Create direct upload project", and simply drag and drop your "dist/" folder!

Kofi (Student): Wow! That hosts our web assets on Cloudflare's ultra-fast Edge server network. It will load instantly in any country on browsers and mobile devices alike!

================================================================================
MODULE 3: DYNAMIC REAL-TIME STATE SYNC & TAB COORDINATION
================================================================================
Kofi (Student): Professor, here is the ultimate challenge: when I edit a service on my laptop, how does my phone (which is loading the same URL) reflect that change instantly without manual refresh?

Professor Hassan Al-Amin: Ah! That is where the magic of synchronization protocols comes in. There are three powerful architectures:
1. Long Polling / SSE (Server-Sent Events): The client phone polls the Cloudflare Pages function API every few seconds or listens to a Server-Sent Events stream to retrieve delta changes from D1.
2. Wrangler Live Sync (Edge Workers): Cloudflare workers can dispatch broadcast notifications to connected WebSockets, updating the React client states instantly.
3. Local Storage Coordination: For immediate sync on the same computer, React listens to the "storage" event to immediately update memory states across different tabs or windows.

Kofi (Student): Brilliant! By wiring our API routes to query the remote D1 instance on every state change and dispatching updates via real-time hooks, the databases on our phones and browsers stay in perfect harmony!

================================================================================
MODULE 4: WRANGLER CONFIGURATION BINDINGS TEMPLATE (wrangler.toml)
================================================================================
Create a file named "wrangler.toml" in your project root to bind your frontend workers or cloud pages to your live D1 database instance:

\`\`\`toml
# wrangler.toml
name = "hassan-agency-portal"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "hassan-portal-db"
database_id = "60ce292c-a702-401c-891c-400e80a75828"
\`\`\`

================================================================================
MODULE 5: COMPLETE SERVERLESS SYNC WORKER TEMPLATE (worker.ts)
================================================================================
Ensure your server-side workers query env.DB to run statements like "SELECT * FROM admin_services". Below is a complete sample Cloudflare Worker code template:

\`\`\`typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === "/api/services" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM admin_services ORDER BY sortOrder ASC").all();
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
\`\`\`

================================================================================
MODULE 6: HASSAN AL-AMIN ACADEMY COMPLIANCE CHECKLIST
================================================================================
✓ Cloudflare D1 Database instance created.
✓ SQL Schema schema.sql successfully initialized via wrangler execute.
✓ Project exported as ZIP file and compiled in production node environment.
✓ Wrangler.toml created with precise database uuid binding config.
✓ Test device real-time sync with mobile Safari / Google Chrome.

Enjoy your masterclass credentials!
`;
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Cloudflare_D1_and_Site_Deployment_Masterclass.md");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowAdminNotification("Full Masterclass Guide Markdown downloaded successfully!");
      setTimeout(() => setShowAdminNotification(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to download masterclass guide.");
    }
  };

  // Premium Admin Tool: Download wrangler.toml config template
  const handleDownloadWranglerConfig = () => {
    try {
      const wranglerContent = `# wrangler.toml - Cloudflare Pages or Workers Configuration Binding Template
name = "hassan-agency-portal"
pages_build_output_dir = "dist" # The folder produced by npm run build

[[d1_databases]]
binding = "DB"                  # The binding name used inside your Workers / Pages API functions
database_name = "hassan-portal-db"
database_id = "60ce292c-a702-401c-891c-400e80a75828" # Enter your live D1 UUID from cloudflare dashboard
`;
      const blob = new Blob([wranglerContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "wrangler.toml");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowAdminNotification("wrangler.toml config template downloaded!");
      setTimeout(() => setShowAdminNotification(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to download wrangler.toml.");
    }
  };

  // Premium Admin Tool: Download Cloudflare Worker index.ts template
  const handleDownloadWorkerTemplate = () => {
    try {
      const workerContent = `/**
 * Cloudflare Worker template to serve as a persistent, real-time database sync proxy.
 * This script accepts JSON updates from devices, queries the D1 instance, and dispatches fresh states.
 */

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    // Set CORS headers so both browsers and phone clients can connect securely
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Get services
      if (url.pathname === "/api/services" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM admin_services ORDER BY sortOrder ASC").all();
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // 2. Sync / Update state
      if (url.pathname === "/api/services/sync" && request.method === "POST") {
        const payload = await request.json();
        // Execute batch updates inside a D1 transaction for perfect sync integrity
        const statements = payload.map((svc: any) => {
          return env.DB.prepare(
            "INSERT OR REPLACE INTO admin_services (id, title, subtitle, description, icon, price, duration, isPopular, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          ).bind(svc.id, svc.title, svc.subtitle, svc.description, svc.icon, svc.price, svc.duration, svc.isPopular ? 1 : 0, svc.sortOrder);
        });

        await env.DB.batch(statements);

        return new Response(JSON.stringify({ success: true, message: "Database synchronized perfectly across edge nodes." }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
`;
      const blob = new Blob([workerContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "worker.ts");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowAdminNotification("worker.ts database-sync code template downloaded!");
      setTimeout(() => setShowAdminNotification(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to download worker.ts.");
    }
  };

  // Fetch scanning history from Cloudflare Pages/D1 database
  const fetchScanHistory = async () => {
    setScanHistoryLoading(true);
    try {
      const history = await apiGetScanHistory();
      setScanHistory(history);
    } catch (hErr) {
      console.warn("Failed to load scan history:", hErr);
    } finally {
      setScanHistoryLoading(false);
    }
  };

  useEffect(() => {
    registerUser('admin_user', 'admin');
    fetchApplications();
    fetchScanHistory();

    // Establish real-time sync subscription to Multi-screen Sync Channel (SSE)
    setRealtimeConnected(true);
    const unsubscribe = apiSubscribeToRealtimeSync((event) => {
      if (event.type === 'APPLICATION_CREATED') {
        setApplications((prev) => [event.application, ...prev]);
        setShowAdminNotification(`📝 ${event.message}`);
      } else if (event.type === 'APPLICATION_UPDATED') {
        setApplications((prev) => prev.map(app => app.id === event.applicationId ? event.application : app));
        if (selectedApp?.id === event.applicationId) setSelectedApp(event.application);
        setSelectedApp((prev) => prev && prev.id === event.applicationId ? event.application : prev);
        setShowAdminNotification(`✏️ ${event.message}`);
      } else if (event.type === 'APPLICATION_DELETED') {
        setApplications((prev) => prev.filter(app => app.id !== event.applicationId));
        if (selectedApp?.id === event.applicationId) setSelectedApp(null);
        setSelectedApp((prev) => prev && prev.id === event.applicationId ? null : prev);
        setShowAdminNotification(`🗑️ ${event.message}`);
      } else if (event.type === 'SCAN_SYNC') {
        setScanHistory((prev) => [event.scanRecord, ...prev]);
        setShowAdminNotification(`🔔 ${event.message}`);
        
        // Keep existing SCAN_SYNC load/display logic
        apiGetApplications().then(apps => {
          setApplications(apps);
          const found = apps.find(a => a.id === event.scanRecord.applicant_id);
          if (found) {
            setSelectedApp(found);
            setAdminDetailTab('actions');
          }
        }).catch(err => console.error(err));
      } else if (event.type === 'HANDSHAKE') {
        console.log('[SSE Multi-screen Sync Hub]', event.message);
      }
      setTimeout(() => setShowAdminNotification(null), 4000);
    });

    return () => {
      unsubscribe();
      setRealtimeConnected(false);
    };
  }, []);

  // Update candidate status
  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected', customFields: Partial<JobApplication> = {}) => {
    setUpdatingId(id);
    try {
      // Prepare approval structure if approved
      const approvalPayload = status === 'approved' ? {
        approvedBy: {
          approved: true,
          role: 'HR Executive',
          signature: 'HR_STAMP_APPROVED_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          date: new Date().toISOString().split('T')[0],
          offerRole: customFields.positionSkills?.majorRole || offerRoleInput || selectedApp?.positionSkills?.majorRole || 'Staff Member',
          monthlySalary: salaryInput || '₦150,000'
        }
      } : { approvedBy: undefined };

      const payload = {
        status,
        adminNotes: adminNotesText,
        ...approvalPayload,
        ...customFields
      };

      const updatedApp = await apiUpdateApplication(id, payload);
      
      // Update local lists
      setApplications(prev => prev.map(app => app.id === id ? updatedApp : app));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(updatedApp);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update record.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete / purge record
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('🚨 CRITICAL ACTION REQUIRED:\n\nAre you absolutely sure you want to completely purge and delete this candidate\'s record? This cannot be undone and will erase all electronic signatures and documents from memory.')) {
      return;
    }
    try {
      await apiDeleteApplication(id);
      
      setApplications(prev => prev.filter(app => app.id !== id));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null);
      }
      alert('Application purged successfully.');
    } catch (err: any) {
      alert(err.message || 'Error purging application.');
    }
  };

  // Export all filtered applicants as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Role Applied', 'Highest Qualification', 'Status', 'Date Applied', 'Salary Offer', 'Accepted'];
    const rows = filteredApps.map(app => [
      app.id,
      app.personalInfo?.fullName || '',
      app.personalInfo?.emailAddress || '',
      app.personalInfo?.phoneNumbers || '',
      app.positionSkills?.majorRole || '',
      app.educationalBg?.highestQualification || '',
      app.status || 'pending',
      app.createdAt ? app.createdAt.substring(0, 10) : 'N/A',
      app.approvedBy?.monthlySalary || 'N/A',
      app.appointmentAccepted ? 'YES' : 'NO'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dstech_applicants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export single applicant details as JSON Profile
  const handleExportJSON = (app: JobApplication) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(app, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `profile_${(app.personalInfo?.fullName || 'applicant').replace(/\s+/g, '_')}_${app.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const getMessageTemplate = (app: JobApplication, preset: string): string => {
    const name = app.personalInfo?.fullName || 'Candidate';
    const role = app.positionSkills?.majorRole || 'Staff Member';
    const company = 'DS Tech and Digital Marketing Agency Limited';
    const portalUrl = `${window.location.origin}/application/${app.id}`;

    switch (preset) {
      case 'review':
        return `Hello ${name},\n\n` +
          `Thank you for your application to ${company} for the role of "${role}".\n\n` +
          `Our technical team is currently reviewing your submitted details and qualifications. We will get back to you shortly regarding the next stages of our selection process.\n\n` +
          `You can view your submitted details anytime via your secure candidate portal:\n${portalUrl}\n\n` +
          `Best regards,\nHR Team\n${company}`;
      
      case 'interview':
        return `Dear ${name},\n\n` +
          `We have carefully reviewed your application for the "${role}" position, and we are highly impressed with your background and skills.\n\n` +
          `We would like to invite you for a virtual technical assessment and interview with our team. Please reply to this message with your availability over the next three working days.\n\n` +
          `You can keep track of your active application status here:\n${portalUrl}\n\n` +
          `Warm regards,\nRecruitment Unit\n${company}`;

      case 'offer':
        return `Congratulations ${name}!\n\n` +
          `We are delighted to inform you that your application has been officially APPROVED, and you have been offered the position of "${role}" at ${company}!\n\n` +
          `Your official Appointment Letter has been signed by the CEO and published to your candidate portal. Please sign into your portal below to accept the terms and secure your spot:\n` +
          `${portalUrl}\n\n` +
          `Welcome to the team!\n\n` +
          `Sincerely,\nManagement Board\n${company}`;

      case 'regret':
        return `Hello ${name},\n\n` +
          `Thank you for your time and interest in the "${role}" position with ${company}.\n\n` +
          `While we were impressed with your application, we have decided to move forward with other candidates whose experience more closely aligns with our current project requirements.\n\n` +
          `We will keep your profile in our talent pool for future vacancies that fit your expertise.\n\n` +
          `We wish you the very best in your career pursuits.\n\n` +
          `Best regards,\nTalent Acquisition\n${company}`;

      default:
        return '';
    }
  };

  // Open candidate details & fill editing inputs
  const handleSelectCandidate = (app: JobApplication) => {
    setSelectedApp(app);
    setAdminNotesText(app.adminNotes || '');
    setOfferRoleInput(app.approvedBy?.offerRole || app.positionSkills?.majorRole || '');
    setSalaryInput(app.approvedBy?.monthlySalary || '₦150,000');
    
    // Auto-populate custom message based on default 'review' template
    const defaultTemplateText = getMessageTemplate(app, 'review');
    setCustomMessage(defaultTemplateText);
    setSelectedPreset('review');
    setAdminDetailTab('actions');
  };

  // Unique roles for filtering
  const uniqueRoles = Array.from(new Set(applications.map(app => app.positionSkills?.majorRole))).filter(Boolean);

  // Filter logic
  const filteredApps = applications.filter(app => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (app.personalInfo?.fullName || '').toLowerCase().includes(query) ||
      (app.personalInfo?.emailAddress || '').toLowerCase().includes(query) ||
      (app.personalInfo?.phoneNumbers || '').includes(query) ||
      app.id.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || (app.status || 'pending') === statusFilter;
    const matchesRole = roleFilter === 'all' || app.positionSkills?.majorRole === roleFilter;
    const matchesEdu = eduFilter === 'all' || app.educationalBg?.isStudentOrGraduate === eduFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesEdu;
  });

  // Calculate stats
  const totalCount = applications.length;
  const pendingCount = applications.filter(a => !a.status || a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;
  const acceptedOffersCount = applications.filter(a => a.appointmentAccepted).length;

  const guideSlides = [
    {
      title: "Masterclass Cover",
      subtitle: "The Complete Cloudflare D1 & Site Deployment Masterclass",
      type: "cover",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8 bg-[#fdfcfb] relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          {/* Subtle grid paper background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.04),transparent_50%)]" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-600 mb-6 shadow-md"
          >
            <GraduationCap size={56} className="animate-pulse" />
          </motion.div>

          <span className="text-[10px] font-black tracking-[0.2em] text-amber-700 uppercase bg-amber-100 px-3 py-1 rounded-full border border-amber-200 mb-3">
            Hassan Al-Amin Academy
          </span>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold text-slate-900 tracking-tight max-w-2xl leading-tight">
            Cloudflare D1 SQL & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-700 font-black">
              Site Deployment Masterclass
            </span>
          </h2>

          <p className="text-[11px] sm:text-xs text-slate-600 mt-4 max-w-lg leading-relaxed">
            A highly detailed academic workbook documenting the deployment dialogue between <strong>Professor Al-Amin</strong> and his student <strong>Kofi</strong>. Learn to provision edge databases, build client ZIP packages, configure Wrangler, and achieve flawless multi-device synchronization.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Teacher: Professor Al-Amin
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Student: Kofi
            </span>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setGuidePage(1)}
              className="px-6 py-3 bg-[#000E32] hover:bg-[#001c64] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <BookOpen size={13} />
              <span>Open Workbook</span>
              <ChevronRight size={14} className="stroke-[3px]" />
            </button>

            <button
              onClick={handleDownloadFullMarkdownWorkbook}
              className="px-4 py-3 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              title="Download Markdown Study Guide"
            >
              <Download size={13} />
              <span>Full .md Book</span>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Module 1: Cloudflare D1 Provisioning",
      subtitle: "Deploying and Seeding raw SQLite at the Edge",
      type: "lesson",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin">
          <div className="flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs shadow-inner">
              Prof
            </div>
            <div>
              <p className="font-bold text-amber-800 text-xs mb-0.5">Professor Hassan Al-Amin</p>
              <p className="text-slate-700">
                Welcome to your first lesson, Kofi! In traditional web development, relational databases are bulky, centralized servers located in a single geographical region. If our server is in Lagos, a student accessing the platform in London or New York will experience high network latency. 
              </p>
              <p className="text-slate-700 mt-2">
                To solve this, Cloudflare D1 replicates read-only nodes of our <strong>SQLite database</strong> across hundreds of edge location data centers globally. Let's provision our instance! Go to your Cloudflare Dashboard, select <strong>Workers & Pages</strong> on the sidebar, head to <strong>D1</strong>, and click <strong>"Create database"</strong>. Enter the name <code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono text-[11px]">hassan-portal-db</code> and click Create.
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs shadow-inner">
              Kofi
            </div>
            <div>
              <p className="font-bold text-blue-800 text-xs mb-0.5">Kofi (Student)</p>
              <p className="text-slate-700">
                That is fascinating, Professor! D1 truly makes relational database querying zero-latency. Once the database is created, I get a unique Database ID (UUID). But how do we load all our schema tables and populate them with our current agency services, blog posts, and courses?
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs shadow-inner">
              Prof
            </div>
            <div>
              <p className="font-bold text-amber-800 text-xs mb-0.5">Professor Hassan Al-Amin</p>
              <p className="text-slate-700">
                A stellar question, Kofi! We use the automated SQL schema seed generator built into our admin dashboard. It scans our current memory state, compiles the exact tables (<code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono text-[11px]">admin_services</code>, <code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono text-[11px]">admin_portfolio_projects</code>, etc.), and generates optimized SQLite <code className="bg-white px-1.5 py-0.5 rounded text-emerald-600 font-mono text-[11px]">INSERT INTO</code> statements. 
              </p>
              <p className="text-slate-700 mt-2">
                Download this SQL file using the button below and execute it inside the Cloudflare console, or run the following Wrangler commands in your terminal:
              </p>
              <div className="mt-2.5 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[10px] sm:text-[11px] text-emerald-400 leading-relaxed shadow-inner">
                # For Local Sandbox testing:<br />
                npx wrangler d1 execute hassan-portal-db --local --file=schema.sql<br /><br />
                # For Production Deployment in the Cloud:<br />
                npx wrangler d1 execute hassan-portal-db --remote --file=schema.sql
              </div>
            </div>
          </div>

          {/* Action Download Row */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="text-left">
              <h5 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wide flex items-center gap-1.5">
                <Database size={12} className="text-emerald-600" />
                D1 Database SQL Schema Seed
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5">Contains custom schema layouts and active catalog data seed statements.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSqlCode(generateSQLSchemaString());
                  setShowSQLSchemaModal(true);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border border-slate-700"
              >
                <Code size={12} className="text-cyan-400" />
                <span>View & Copy</span>
              </button>
              <button
                onClick={handleExportSQLSchema}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download size={12} />
                <span>Export SQL (.sql)</span>
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Module 2: Client Export & Hosting",
      subtitle: "ZIP Package Extraction and Cloudflare Pages direct uploads",
      type: "lesson",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin">
          <div className="flex gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs shadow-inner">
              Kofi
            </div>
            <div>
              <p className="font-bold text-blue-800 text-xs mb-0.5">Kofi (Student)</p>
              <p className="text-slate-700">
                Professor, our database is now seeded and ready to receive traffic at the edge! But what about our actual React web application? How do we export it from Google AI Studio and upload it so anyone can load it?
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs shadow-inner">
              Prof
            </div>
            <div>
              <p className="font-bold text-amber-800 text-xs mb-0.5">Professor Hassan Al-Amin</p>
              <p className="text-slate-700">
                An outstanding question! The application we've built is a highly polished, fully functional React SPA compiled with Vite and Tailwind CSS. To deploy it, we do not need to manage servers. We can host it on <strong>Cloudflare Pages</strong> for free with global replication.
              </p>
              <p className="text-slate-700 mt-2">
                Follow this exact masterclass sequence to export and compile:
              </p>
              <ol className="list-decimal list-inside space-y-2 mt-2 pl-1.5 text-slate-700 text-xs bg-white p-3 rounded-lg border border-slate-200">
                <li>Go to the top header settings or export menu in Google AI Studio, select <strong>"Export as ZIP"</strong>, and save it.</li>
                <li>Unzip the downloaded file on your computer and open a terminal inside that folder.</li>
                <li>Verify your <code className="bg-white px-1 py-0.5 rounded font-mono text-cyan-600">package.json</code> contains all framework dependencies and run <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[10px]">npm install</code>.</li>
                <li>Run <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[10px]">npm run build</code>. Vite will compile, tree-shake, and optimize all React hooks and Tailwind utility variables, producing a production-ready static directory named <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-600">dist/</code>.</li>
                <li>Log in to your Cloudflare Dashboard, select <strong>Workers & Pages</strong>, click <strong>"Create application"</strong>, choose <strong>Pages</strong>, and select <strong>"Direct Upload"</strong>.</li>
                <li>Give your project a name like <code className="bg-white px-1 py-0.5 rounded text-cyan-600 font-mono text-[10px]">hassan-agency</code> and simply drag and drop the whole <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-600">dist/</code> folder!</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs shadow-inner">
              Kofi
            </div>
            <div>
              <p className="font-bold text-blue-800 text-xs mb-0.5">Kofi (Student)</p>
              <p className="text-slate-700">
                Incredible! Cloudflare Pages takes our built assets and caches them in over 300 cities worldwide. The site will boot up instantly on mobile phones and desktop computers with high efficiency!
              </p>
            </div>
          </div>

          {/* Action Download Row */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="text-left">
              <h5 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wide flex items-center gap-1.5">
                <FileText size={12} className="text-indigo-600" />
                ZIP Build & Deploy Cheat Sheet
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5">A complete checklist of commands, folders, and settings for direct uploads.</p>
            </div>
            <button
              onClick={handleDownloadFullMarkdownWorkbook}
              className="px-4 py-2 bg-[#000E32] hover:bg-[#001c64] text-white font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download size={12} />
              <span>Get Cheat Sheet (.md)</span>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Module 3: Real-Time Multi-Device Sync",
      subtitle: "The secret of synchronizing browser sessions and phone apps",
      type: "lesson",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin">
          <div className="flex gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs shadow-inner">
              Kofi
            </div>
            <div>
              <p className="font-bold text-blue-800 text-xs mb-0.5">Kofi (Student)</p>
              <p className="text-slate-700">
                Professor, here is the ultimate real-world challenge: when I edit or add a service item, change pricing, or approve an applicant on my laptop, how does my mobile phone (which is loading the exact same URL) display that change instantly in real time without me having to refresh the page?
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs shadow-inner">
              Prof
            </div>
            <div>
              <p className="font-bold text-amber-800 text-xs mb-0.5">Professor Hassan Al-Amin</p>
              <p className="text-slate-700">
                Ah! That is where the magic of <strong>state synchronization protocols</strong> comes into play, Kofi! In high-end portal engineering, if we have different screens or physical devices editing the same dataset, we must prevent "split-brain" or cached states. We achieve this with three coordinated sync layers:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="font-bold text-amber-700 text-[10px] uppercase font-mono block">1. Local Storage Event Sync</span>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    Inside the same browser (e.g. multi-tab management), React subscribes to the <code className="text-red-600 font-mono text-[9px]">storage</code> event. When Tab A updates local records, Tab B automatically intercepts the event and triggers a full state hydration instantly!
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="font-bold text-blue-700 text-[10px] uppercase font-mono block">2. Worker long polling sync</span>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    Mobile clients set up a reactive <code className="text-indigo-600 font-mono text-[9px]">useEffect</code> loop that polls the live SQLite worker every 30 seconds, downloading delta states and replacing the cached structures seamlessly.
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="font-bold text-emerald-700 text-[10px] uppercase font-mono block">3. Server-Sent Events (SSE)</span>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    Cloudflare Workers open an active HTTP stream with clients. When D1 updates a record, it broadcasts a push frame to all listening phones and tablets, triggering immediate UI state replacement!
                  </p>
                </div>
              </div>

              <p className="text-slate-700">
                Let's inspect the exact React storage-listener hook code used to coordinate different browser tabs instantly:
              </p>
              <pre className="mt-2.5 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-indigo-300 leading-relaxed overflow-x-auto shadow-inner select-all">
{`useEffect(() => {
  const handleTabSync = (event: StorageEvent) => {
    if (event.key === 'admin_services') {
      const freshServices = JSON.parse(event.newValue || '[]');
      setAdminServices(freshServices);
    }
  };
  window.addEventListener('storage', handleTabSync);
  return () => window.removeEventListener('storage', handleTabSync);
}, []);`}
              </pre>
            </div>
          </div>

          {/* Action Download Row */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="text-left">
              <h5 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wide flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-600 animate-pulse" />
                Cross-Device Synchronization Manual
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5">Complete handbook explaining SSE, storage events, and database integrity.</p>
            </div>
            <button
              onClick={handleDownloadFullMarkdownWorkbook}
              className="px-4 py-2 bg-[#000E32] hover:bg-[#001c64] text-white font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download size={12} />
              <span>Download Manual (.md)</span>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Module 4: Wrangler Bindings Configuration",
      subtitle: "The wrangler.toml config architecture for relational links",
      type: "lesson",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-inner">
            <p className="font-bold text-emerald-800 text-xs flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Wrangler Configuration bindings (.toml)
            </p>
            <p className="text-[11px] text-slate-700 mb-2">
              To allow your edge worker api proxy, background cron-jobs, or cloud functions to make queries against your serverless SQLite instance, create a file named <code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono text-[10px] border border-slate-250">wrangler.toml</code> in your project root. Copy and paste the configuration code below:
            </p>
            <pre className="bg-slate-950 border border-slate-850 p-3 rounded-lg font-mono text-[10px] sm:text-[11px] text-slate-200 select-all leading-relaxed shadow-md">
{`# wrangler.toml - Cloudflare Pages & D1 Database Binding File
name = "hassan-agency-portal"
pages_build_output_dir = "dist" # Folder produced by 'npm run build'

[[d1_databases]]
binding = "DB"                  # The binding variable exposed inside your Workers code env object
database_name = "hassan-portal-db"
database_id = "60ce292c-a702-401c-891c-400e80a75828" # Put your unique D1 UUID here`}
            </pre>
          </div>

          <div className="flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs shadow-inner">
              Prof
            </div>
            <div>
              <p className="font-bold text-amber-800 text-xs mb-0.5">Professor Hassan Al-Amin</p>
              <p className="text-slate-700">
                Pay extreme attention here, Kofi! The <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px] text-red-600">binding = "DB"</code> variable is the most critical element. When your edge worker starts up, Cloudflare automatically injects a fully authorized SQLite client into your running server context as <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px] text-cyan-600">env.DB</code>. 
              </p>
              <p className="text-slate-700 mt-2">
                This enables you to issue raw sql commands such as <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">env.DB.prepare("SELECT * FROM admin_services").all()</code> securely. It prevents any hacker or external client from viewing your database credentials, as there are no database connection string secrets or passwords exposed to the public frontend!
              </p>
            </div>
          </div>

          {/* Action Download Row */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="text-left">
              <h5 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wide flex items-center gap-1.5">
                <FileText size={12} className="text-emerald-600" />
                Production wrangler.toml Config
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5">Ready-to-use Wrangler.toml template file with environment schemas.</p>
            </div>
            <button
              onClick={handleDownloadWranglerConfig}
              className="px-4 py-2 bg-gradient-to-r from-[#000E32] to-[#001750] hover:from-[#001750] hover:to-[#000E32] text-white font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download size={12} />
              <span>Download Config (.toml)</span>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Module 5: Serving Real-Time Sync API",
      subtitle: "Edge-native Cloudflare Worker API router code",
      type: "lesson",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin">
          <div className="flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs shadow-inner">
              Prof
            </div>
            <div>
              <p className="font-bold text-amber-800 text-xs mb-0.5">Professor Hassan Al-Amin</p>
              <p className="text-slate-700">
                Now, Kofi, let's write our actual Cloudflare Worker logic! We need an edge route handler that serves database queries and coordinates cross-device requests. By using a Worker, our database calls execute instantly in under 5 milliseconds from any country!
              </p>
              <p className="text-slate-700 mt-2">
                Here is the complete production-grade Worker script in TypeScript. Copy and save it as <code className="bg-white px-1 py-0.5 rounded font-mono text-cyan-600 text-[11px]">index.ts</code> in your worker source folder:
              </p>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-850 p-3 rounded-lg font-mono text-[10px] text-slate-300 select-all leading-relaxed overflow-x-auto shadow-inner max-h-[30vh]">
{`export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === "/api/services" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM admin_services ORDER BY sortOrder ASC").all();
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (url.pathname === "/api/services/sync" && request.method === "POST") {
        const payload = await request.json();
        const statements = payload.map((svc: any) => {
          return env.DB.prepare(
            "INSERT OR REPLACE INTO admin_services (id, title, subtitle, description, icon, price, duration, isPopular, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          ).bind(svc.id, svc.title, svc.subtitle, svc.description, svc.icon, svc.price, svc.duration, svc.isPopular ? 1 : 0, svc.sortOrder);
        });
        await env.DB.batch(statements);
        return new Response(JSON.stringify({ success: true, message: "Sync successful." }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};`}
          </pre>

          {/* Action Download Row */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="text-left">
              <h5 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wide flex items-center gap-1.5">
                <Code size={12} className="text-indigo-600" />
                Cloudflare Worker API Script
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5">Fully operational database-sync worker typescript code file.</p>
            </div>
            <button
              onClick={handleDownloadWorkerTemplate}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download size={12} />
              <span>Download Worker (.ts)</span>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Masterclass Graduation",
      subtitle: "Academy graduation ceremonies and deployment checklist",
      type: "certification",
      content: (
        <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="p-4 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-600 mb-4"
          >
            <CheckCircle2 size={40} className="stroke-[2px]" />
          </motion.div>

          <h3 className="text-base font-bold text-slate-900 font-serif">Congratulations, Graduate!</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md">
            You have successfully mastered Cloudflare D1 Serverless Database configuration, ZIP bundle direct uploads, and real-time state synchronization, receiving validation credentials from <strong>Professor Hassan Al-Amin</strong>!
          </p>

          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 mt-4 p-4 text-left text-[11px] space-y-2 text-slate-700 shadow-sm">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1.5 font-mono">My Deployment Checklist</p>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-mono font-bold">✓</span>
              <span>Created a global Cloudflare D1 database instance named <code className="bg-white px-1 rounded font-mono text-[9px]">hassan-portal-db</code>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-mono font-bold">✓</span>
              <span>Downloaded the database SQL script and ran wrangler d1 execute remotely.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-mono font-bold">✓</span>
              <span>Exported ZIP client files from AI Studio, ran npm build, and uploaded the dist directory.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-mono font-bold">✓</span>
              <span>Created wrangler.toml and declared the database binding variables.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-mono font-bold">✓</span>
              <span>Uploaded the database-sync worker to serve real-time multi-device synchronization queries.</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              onClick={handleDownloadFullMarkdownWorkbook}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 border border-amber-400/20 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download size={13} />
              <span>Download Masterclass Guide (.md)</span>
            </button>

            <button
              onClick={() => {
                setShowDeploymentGuideModal(false);
                setGuidePage(0);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Close Academy
            </button>
          </div>
        </div>
      )
    }
  ];

  if (!isAdminLoggedIn) {
    return (
      <AdminAuthGate
        onAuthSuccess={(admin) => {
          try {
            localStorage.setItem('isAdminLoggedIn', 'true');
            localStorage.setItem('adminUser', JSON.stringify(admin));
          } catch (e) {}
          setIsAdminLoggedIn(true);
          setAdminUser(admin);
        }}
        onBackToPortal={onBackToPortal}
        theme={theme}
        language={language}
      />
    );
  }

  const sidebarTabs = [
    {
      group: 'Talent Acquisition',
      items: [
        { id: 'recruitment', label: 'Recruitment', icon: Briefcase, count: applications.length },
        { id: 'chat', label: 'WhatsApp Live Chat', icon: MessageSquare },
      ]
    },
    {
      group: 'Digital Assets CMS',
      items: [
        { id: 'website', label: 'Services Catalog', icon: Layers, count: adminServices.length },
        { id: 'portfolio', label: 'Portfolio Projects', icon: FolderOpen, count: adminProjects.length },
        { id: 'blog', label: 'Insights Blog', icon: BookOpen, count: adminBlogs.length },
      ]
    },
    {
      group: 'Academy LMS',
      items: [
        { id: 'training', label: 'LMS Academy', icon: GraduationCap, count: adminCourses.length },
      ]
    },
    {
      group: 'Enterprise CRM',
      items: [
        { id: 'clients', label: 'Clients CRM', icon: Landmark, count: CLIENT_INVOICES.length + CLIENT_TICKETS.length },
      ]
    },
    {
      group: 'Ecosystem Security',
      items: [
        { id: 'analytics', label: 'Intelligence Charts', icon: BarChart3 },
        { id: 'notifications', label: 'Secure QR & Vault', icon: QrCode },
        { id: 'emails', label: 'Brevo Email Console', icon: Mail },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex">
      
      {/* 1. DESKTOP PERMANENT SIDEBAR & MOBILE SLIDEOUT SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#000E32] text-white flex flex-col justify-between border-r border-blue-900/40 shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header & Brand Logo */}
        <div className="p-4 border-b border-blue-900/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Logo size="xs" showText={false} variant="light" className="p-1.5 bg-orange-600 rounded-xl" />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">DS Tech Suite</span>
                  <span className="px-1 py-0.2 bg-orange-600 text-white rounded text-[7px] font-mono font-bold">v2.5</span>
                </div>
                <h2 className="text-[9px] font-mono text-slate-300 flex items-center gap-0.5">
                  <ShieldAlert size={9} className="text-orange-500 animate-pulse" />
                  ADMIN CENTER
                </h2>
              </div>
            </div>
            
            {/* Close Mobile Sidebar */}
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sidebar Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {sidebarTabs.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[8px] font-black text-slate-500 uppercase tracking-widest block text-left">
                {group.group}
              </span>
              <div className="space-y-0.5">
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = adminModule === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAdminModule(tab.id as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isActive 
                          ? 'bg-orange-600 text-white shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={13} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Actions Card inside Sidebar */}
          <div className="mx-1 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-left">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">ADMIN UTILITIES</span>
            <div className="space-y-1.5">
              <button
                onClick={handleExportData}
                className="w-full flex items-center gap-1.5 text-slate-400 hover:text-white text-[10px] transition-colors font-bold cursor-pointer"
              >
                <FileDown size={11} className="text-indigo-400" />
                <span>Backup Database (JSON)</span>
              </button>
              <button
                onClick={() => {
                  setSqlCode(generateSQLSchemaString());
                  setShowSQLSchemaModal(true);
                }}
                className="w-full flex items-center gap-1.5 text-slate-400 hover:text-white text-[10px] transition-colors font-bold cursor-pointer"
              >
                <Code size={11} className="text-cyan-400" />
                <span>View & Copy SQL (D1)</span>
              </button>
              <button
                onClick={handleExportSQLSchema}
                className="w-full flex items-center gap-1.5 text-slate-400 hover:text-white text-[10px] transition-colors font-bold cursor-pointer"
              >
                <Database size={11} className="text-emerald-400" />
                <span>Export SQL Schema</span>
              </button>
              <button
                onClick={handleResetData}
                className="w-full flex items-center gap-1.5 text-red-400 hover:text-red-300 text-[10px] transition-colors font-bold cursor-pointer"
              >
                <Trash2 size={11} className="text-red-500" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Admin Profile Node */}
        <div className="p-3 border-t border-blue-900/20 bg-[#000a24]/50 space-y-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-xs shrink-0">
              {adminUser?.fullName?.slice(0, 2) || 'AD'}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-black text-white truncate uppercase tracking-wide">
                {adminUser?.fullName || 'Administrator'}
              </p>
              <p className="text-[8.5px] text-slate-500 truncate">
                {adminUser?.email || 'admin@dstech.com'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('isAdminLoggedIn');
                localStorage.removeItem('adminUser');
              } catch (e) {}
              setIsAdminLoggedIn(false);
              setAdminUser(null);
            }}
            className="w-full py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-400 hover:text-red-350 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <LogOut size={11} />
            <span>Sign Out Workspace</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* 2. MAIN SPACE CONTENT AREA */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Mobile Sticky Header */}
        <header className="md:hidden sticky top-0 z-40 bg-[#000E32] text-white px-4 py-3 flex items-center justify-between border-b border-blue-900/40 shadow-lg no-print">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
            <Logo size="xs" showText={false} variant="light" className="p-1 bg-orange-600 rounded-lg" />
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">DS ADMIN</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Language */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="p-1.5 bg-white/5 rounded-lg text-xs font-bold"
            >
              {language.toUpperCase()}
            </button>
            {/* Quick Theme */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 bg-white/5 rounded-lg text-slate-300 hover:text-white"
            >
              {theme === 'light' ? <Moon size={12} /> : <Sun size={12} />}
            </button>
            {/* Back to Portal */}
            <button
              onClick={onBackToPortal}
              className="p-1.5 bg-orange-600 rounded-lg text-white"
              title="Return to Careers Portal"
            >
              <ArrowLeft size={12} />
            </button>
          </div>
        </header>

        {/* Floating System notification banner */}
        <AnimatePresence>
          {showAdminNotification && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white py-2 px-4 rounded-full text-xs shadow-2xl z-50 flex items-center gap-2 font-mono"
            >
              <Sparkles size={12} className="text-orange-400 animate-spin" />
              <span>{showAdminNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace Body Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans no-print">
          
          {/* Dynamic Breadcrumb Header Row */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <Logo size="sm" showText={false} variant="light" className="bg-[#000E32] p-2.5 rounded-2xl shrink-0 shadow-inner w-12 h-12 flex items-center justify-center" />
              <div className="text-left space-y-1 w-full min-w-0">
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-indigo-100 dark:border-indigo-900 w-max uppercase tracking-wider">
                  <ShieldAlert size={11} />
                  Super Admin Control Panel / {adminModule}
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-[#000E32] dark:text-white uppercase tracking-wide leading-tight break-words">
                  {adminModule === 'recruitment' ? 'Recruitment Console' :
                   adminModule === 'chat' ? 'WhatsApp Real-Time Chat Center' :
                   adminModule === 'website' ? 'Website Catalog Console' :
                   adminModule === 'portfolio' ? 'Portfolio Case Studies' :
                   adminModule === 'blog' ? 'Insights Blog Node' :
                   adminModule === 'training' ? 'LMS Academy Console' :
                   adminModule === 'clients' ? 'CRM Client Registry' :
                   adminModule === 'analytics' ? 'Analytical Intelligence' :
                   adminModule === 'emails' ? 'Email Queue & Logs' : 'Secure QR & Cloud R2 Vault'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs leading-relaxed max-w-2xl font-medium">
                  {adminModule === 'recruitment' ? 'Filter and manage applicants, schedule dynamic multi-modal video screening nodes, and dispatch cryptographic WebAuthn challenges.' :
                   adminModule === 'chat' ? 'Communicate with active candidates in real-time using secure edge Server-Sent Events, voice synthesis, and image attachment channels.' :
                   adminModule === 'website' ? 'Coordinate published landing-page catalog service structures, capabilities matrix definitions, and structural database rows.' :
                   adminModule === 'portfolio' ? 'Review published case study lists, developer profiles, technology matrices, and localized catalog assets.' :
                   adminModule === 'blog' ? 'Compose industry perspectives, tech journals, structural updates, and draft candidate learning items.' :
                   adminModule === 'training' ? 'Manage curriculum courses, chapter lists, masterclass guide documents, and final graduate credentials.' :
                   adminModule === 'clients' ? 'Monitor corporate client invoices, SLA support tickets, active client profiles, and payment ledger trails.' :
                   adminModule === 'analytics' ? 'Review graphical system metrics, user action flows, WebAuthn verification tallies, and local DB logs.' :
                   adminModule === 'emails' ? 'Audit Brevo transactional templates, dispatch queues, failed delivery retry logs, and template variables.' :
                   'Manage applicant physical credential badges, read dynamic QR scans, and review the WebAuthn security credential vault.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0 border-t border-slate-100 dark:border-slate-800 pt-3 lg:border-none lg:pt-0">
              {/* Language Selection */}
              <div className="relative">
                <button
                  onClick={() => setIsAdminLangDropdownOpen(!isAdminLangDropdownOpen)}
                  className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-transparent flex items-center gap-1.5 text-xs font-black cursor-pointer"
                >
                  <Globe size={13} className="text-indigo-400" />
                  <span className="font-mono uppercase font-black">{language}</span>
                </button>
                {isAdminLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-1 z-50 text-xs">
                    {[
                      { code: 'en', flag: '🇺🇸', label: 'English' },
                      { code: 'ar', flag: '🇸🇦', label: 'العربية' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsAdminLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                          language === lang.code ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Selector */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-transparent cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              {/* Notifications bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsNotifCenterOpen(true)}
                className="relative p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-transparent shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
                title="Notifications Center"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={fetchApplications}
                className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-transparent shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
                title="Refresh Records"
              >
                <RefreshCw size={14} />
              </motion.button>
              
              {/* Scan QR Badge */}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex-1 sm:flex-none py-2 px-3 bg-[#000E32] hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                title="Scan QR"
              >
                <QrCode size={13} className="text-orange-400 animate-pulse" />
                <span className="whitespace-nowrap">Scan QR Badge</span>
              </motion.button>
              
              {/* Back to Portal */}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onBackToPortal}
                className="flex-1 sm:flex-none py-2 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} className="shrink-0" />
                <span className="whitespace-nowrap">Careers Portal</span>
              </motion.button>
            </div>
          </motion.div>
          
          {/* Main workspace slot is loaded dynamically based on adminModule */}

      {adminModule === 'recruitment' && (
        <>

      {/* Corporate Statistics Bento Row */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* Stat 1: Total Applicants */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
          }}
          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#000E32]/10 text-[#000E32] flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Profiles</span>
            <span className="text-2xl font-extrabold text-[#000E32]">{totalCount}</span>
          </div>
        </motion.div>

        {/* Stat 2: Pending Reviews */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
          }}
          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock size={22} className="animate-spin-slow" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pending Review</span>
            <span className="text-2xl font-extrabold text-amber-600">{pendingCount}</span>
          </div>
        </motion.div>

        {/* Stat 3: Approved */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
          }}
          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Approved Offers</span>
            <span className="text-2xl font-extrabold text-emerald-600">{approvedCount}</span>
          </div>
        </motion.div>

        {/* Stat 4: Rejected */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
          }}
          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <XCircle size={22} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rejected Applicants</span>
            <span className="text-2xl font-extrabold text-rose-600">{rejectedCount}</span>
          </div>
        </motion.div>

        {/* Stat 5: Contract Accepted */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
          }}
          whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)" }}
          className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#000E32] to-indigo-950 p-5 rounded-2xl shadow-md text-white flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 text-orange-400 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Agreements Signed</span>
            <span className="text-2xl font-extrabold text-orange-400">{acceptedOffersCount}</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Database Search & Advanced Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by full name, email, phone number, or document ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000E32]/10 focus:border-[#000E32] transition-all"
            />
          </div>

          {/* Export tools */}
          <div className="flex w-full md:w-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full md:w-auto py-2.5 px-4 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              Export Filtered CSV
            </button>
          </div>
        </div>

        {/* Dropdown Select Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter size={13} className="text-orange-500" />
            Filters:
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-3 sm:flex sm:flex-wrap gap-2.5 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-250/60 px-2.5 py-1.5 rounded-xl">
              <span className="text-[9px] uppercase font-black text-slate-400 whitespace-nowrap">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-slate-700 text-xs focus:outline-none font-bold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">⏳ Pending Review</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-250/60 px-2.5 py-1.5 rounded-xl">
              <span className="text-[9px] uppercase font-black text-slate-400 whitespace-nowrap">Position</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-slate-700 text-xs focus:outline-none font-bold cursor-pointer max-w-[150px] truncate"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role, idx) => (
                  <option key={idx} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Academic/Education Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-250/60 px-2.5 py-1.5 rounded-xl">
              <span className="text-[9px] uppercase font-black text-slate-400 whitespace-nowrap">Academic</span>
              <select
                value={eduFilter}
                onChange={(e) => setEduFilter(e.target.value as any)}
                className="bg-transparent text-slate-700 text-xs focus:outline-none font-bold cursor-pointer"
              >
                <option value="all">All Candidates</option>
                <option value="student">Undergrads</option>
                <option value="graduate">Graduates</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== 'all' || roleFilter !== 'all' || eduFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRoleFilter('all');
                setEduFilter('all');
              }}
              className="text-[10px] uppercase font-bold text-orange-600 hover:text-orange-700 tracking-wider w-full sm:w-auto text-left sm:text-right sm:ml-auto"
            >
              Clear Active Filters
            </button>
          )}
        </div>

      </div>

      {/* Main Core Lists and Selection Sidebar Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Candidates Table/Cards List */}
        <div className={`${selectedApp ? 'md:col-span-4' : 'md:col-span-7'} bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300`}>
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-extrabold text-[#000E32] text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-orange-500" />
              Applicant Profile Records ({filteredApps.length})
            </h3>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400">Real-Time Sync</span>
          </div>

          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-[#000E32]/20 border-t-orange-600 rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying applicants...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600 space-y-2">
              <AlertCircle className="mx-auto" size={30} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-20 text-center text-slate-400 space-y-4">
              <AlertCircle className="mx-auto text-slate-300" size={40} />
              <p className="text-xs font-bold uppercase tracking-widest">No applicant records found matching search filters.</p>
              <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords above.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-5">Candidate</th>
                      <th className="py-3.5 px-4">Applied Role</th>
                      <th className="py-3.5 px-4">Work Preferences</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                      }
                    }}
                    className="divide-y divide-slate-150"
                  >
                    {filteredApps.map((app) => {
                      const isSelected = selectedApp?.id === app.id;
                      const statusVal = app.status || 'pending';
                      
                      return (
                        <motion.tr 
                          variants={{
                            hidden: { opacity: 0, x: -15 },
                            visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 18 } }
                          }}
                          whileHover={{ backgroundColor: "rgba(238, 242, 255, 0.4)", scale: 1.005 }}
                          key={app.id} 
                          className={`hover:bg-indigo-50/35 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-indigo-50/50' : ''
                          }`}
                          onClick={() => onViewApplicant(app.id)}
                          title="Click to view candidate's profile, filled forms, and appointment letter"
                        >
                          {/* Profile photo & basic metadata */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#000E32] text-white flex items-center justify-center overflow-hidden shrink-0 font-extrabold relative border border-slate-100 shadow-sm">
                                {app.personalInfo?.passportPhoto ? (
                                  <img src={app.personalInfo.passportPhoto} className="w-full h-full object-cover" alt="candidate" />
                                ) : (
                                  (app.personalInfo?.fullName || 'A').charAt(0)
                                )}
                                {app.appointmentAccepted && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                                )}
                              </div>
                              <div className="text-left space-y-0.5">
                                <div className="font-extrabold text-slate-900 group-hover:text-[#000E32] transition-colors line-clamp-1">
                                  {app.personalInfo?.fullName}
                                </div>
                                <div className="text-[10px] font-semibold text-slate-450 line-clamp-1 flex items-center gap-1 font-mono">
                                  <Mail size={10} className="text-slate-400 shrink-0" />
                                  {app.personalInfo?.emailAddress}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Major role */}
                          <td className="py-4 px-4 font-bold text-[#000E32]">
                            <span className="line-clamp-1">{app.positionSkills?.majorRole}</span>
                            <span className="text-[9px] text-slate-400 font-bold block capitalize">
                              {app.educationalBg?.isStudentOrGraduate === 'student' ? '🎓 Undergrad' : '🏅 Graduate'}
                            </span>
                          </td>

                          {/* Work modes */}
                          <td className="py-4 px-4 text-slate-600">
                            <div className="space-y-0.5">
                              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Briefcase size={10} />
                                Salary: <span className="text-slate-700 capitalize font-mono">{app.workMode?.monthlySalaryJob || 'N/A'}</span>
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Landmark size={10} />
                                Contract: <span className="text-slate-700 capitalize font-mono">{app.workMode?.contractFreelanceJob || 'N/A'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              statusVal === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : statusVal === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                statusVal === 'approved' ? 'bg-emerald-500' : statusVal === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                              }`} />
                              {statusVal}
                            </span>
                          </td>

                          {/* Quick View actions */}
                          <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => handleSelectCandidate(app)}
                                type="button"
                                className={`px-2.5 py-1.5 rounded-lg transition-all border shadow-sm flex items-center gap-1 font-extrabold text-[10px] ${
                                  isSelected 
                                    ? 'bg-orange-500 text-white border-orange-600 ring-2 ring-orange-500/35' 
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-[#000E32] hover:text-white border-indigo-150'
                                }`}
                                title="Manage Application, Send Messages & Sign contracts"
                              >
                                <UserCheck size={12} />
                                <span>HR Panel</span>
                              </button>
                              <button
                                onClick={() => onViewApplicant(app.id)}
                                type="button"
                                className="p-1.5 bg-white text-slate-700 hover:bg-[#000E32] hover:text-white rounded-lg transition-colors border border-slate-200 shadow-sm"
                                title="Review Rendered Documents & Print agreements"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(app.id)}
                                type="button"
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-100 shadow-sm"
                                title="Purge Application Record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>

              {/* Mobile Card List View with high motion staggered entrance */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06 }
                  }
                }}
                className="block md:hidden divide-y divide-slate-100"
              >
                {filteredApps.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  const statusVal = app.status || 'pending';
                  
                  return (
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 220, damping: 19 } }
                      }}
                      whileTap={{ scale: 0.98 }}
                      key={app.id} 
                      onClick={() => onViewApplicant(app.id)}
                      className={`p-4 hover:bg-indigo-50/20 transition-colors cursor-pointer space-y-3 relative text-left ${
                        isSelected ? 'bg-indigo-50/40 border-l-4 border-orange-500' : ''
                      }`}
                      title="Click to view candidate's profile, filled forms, and appointment letter"
                    >
                      {/* Avatar, Name, and Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#000E32] text-white flex items-center justify-center overflow-hidden shrink-0 font-extrabold relative border border-slate-100 shadow-sm">
                            {app.personalInfo?.passportPhoto ? (
                              <img src={app.personalInfo.passportPhoto} className="w-full h-full object-cover" alt="candidate" />
                            ) : (
                              (app.personalInfo?.fullName || 'A').charAt(0)
                            )}
                            {app.appointmentAccepted && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                            )}
                          </div>
                          <div className="min-w-0 text-left">
                            <h4 className="font-extrabold text-slate-900 text-xs leading-tight truncate">
                              {app.personalInfo?.fullName || 'Untitled'}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate flex items-center gap-1">
                              <Mail size={10} className="text-slate-400 shrink-0" />
                              {app.personalInfo?.emailAddress || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                          statusVal === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : statusVal === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {statusVal}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider">Position</span>
                          <span className="text-[#000E32] font-bold line-clamp-1">{app.positionSkills?.majorRole || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider">Qualification</span>
                          <span className="text-slate-700 line-clamp-1">
                            {app.educationalBg?.isStudentOrGraduate === 'student' ? '🎓 Undergrad' : '🏅 Graduate'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider">Salary Job</span>
                          <span className="text-slate-700 font-mono line-clamp-1">{app.workMode?.monthlySalaryJob || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider">Contract Mode</span>
                          <span className="text-slate-700 font-mono line-clamp-1">{app.workMode?.contractFreelanceJob || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Footer ID and interactive actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
                        <span className="text-[9px] font-bold text-slate-400">ID: {app.id.substring(0, 8)}</span>
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelectCandidate(app)}
                            type="button"
                            className={`py-1 px-2 rounded-lg transition-all border flex items-center gap-1 font-bold text-[9px] ${
                              isSelected 
                                ? 'bg-orange-500 text-white border-orange-600' 
                                : 'bg-indigo-50 text-indigo-700 hover:bg-[#000E32] hover:text-white border-indigo-150'
                            }`}
                          >
                            <UserCheck size={11} />
                            <span>HR Panel</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onViewApplicant(app.id)}
                            type="button"
                            className="py-1 px-2 bg-white hover:bg-[#000E32] text-slate-700 hover:text-white rounded-lg transition-colors border border-slate-200 flex items-center gap-1 font-bold text-[9px]"
                          >
                            <Eye size={11} />
                            <span>Profile</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteRecord(app.id)}
                            type="button"
                            className="p-1 px-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-100"
                          >
                            <Trash2 size={11} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>

        {/* Selected Candidate Detailed Side-Console / HR Management Box */}
        <div className={`${selectedApp ? 'md:col-span-4' : 'md:col-span-5'} transition-all duration-300`}>
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000E32]/60 backdrop-blur-sm overflow-y-auto md:static md:z-auto md:p-0 md:bg-transparent md:backdrop-blur-none md:overflow-visible">
                {/* Backdrop click to close on mobile */}
                <div className="absolute inset-0 md:hidden cursor-pointer" onClick={() => setSelectedApp(null)} />
                
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl md:shadow-md w-full max-w-lg md:max-w-none relative z-10"
                >
                  {/* Header branding */}
                  <div className="p-5 border-b border-slate-100 bg-[#000E32] text-white flex justify-between items-center">
                    <div className="text-left">
                      <span className="text-[9px] uppercase font-bold text-orange-400 tracking-wider">HR Management Console</span>
                      <h3 className="font-extrabold text-white text-xs uppercase tracking-wide mt-0.5 line-clamp-1">
                        {selectedApp.personalInfo?.fullName || 'Untitled Candidate'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="text-white/80 hover:text-white text-xs font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-xl transition-all"
                    >
                      Close
                    </button>
                  </div>

                  {/* Tab Selector for Actions, AI Insights, and PDF Form */}
                  <div className="flex bg-white p-1 border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAdminDetailTab('actions')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                        adminDetailTab === 'actions' ? 'bg-[#000E32] text-white shadow' : 'text-slate-500 hover:text-[#000E32]'
                      }`}
                    >
                      📊 Action Panel
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminDetailTab('ai')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                        adminDetailTab === 'ai' ? 'bg-[#000E32] text-white shadow' : 'text-slate-500 hover:text-[#000E32]'
                      }`}
                    >
                      ✨ AI Insights
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminDetailTab('pdf')}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                        adminDetailTab === 'pdf' ? 'bg-[#000E32] text-white shadow' : 'text-slate-500 hover:text-[#000E32]'
                      }`}
                    >
                      📄 PDF Form
                    </button>
                  </div>

                  {adminDetailTab === 'pdf' ? (
                    <div className="p-4 bg-white max-h-[75vh] overflow-y-auto space-y-4">
                      <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm bg-white p-2">
                        <CareersFormPDFView application={selectedApp} />
                      </div>
                    </div>
                  ) : adminDetailTab === 'ai' ? (
                    <div className="p-6 bg-white max-h-[75vh] overflow-y-auto space-y-6 text-left scrollbar-thin">
                      {/* Title & Badge */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Sparkles size={18} className="animate-pulse" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">Gemini AI Cognitive Analysis</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Real-Time Secure Cloud Evaluation</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-100/60 text-emerald-800 rounded-full font-black uppercase">
                          Secure API
                        </span>
                      </div>

                      {candidateAnalysisLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                          {/* AI Thinking Animation with framer-motion */}
                          <div className="relative flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.3, 1], rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 filter blur-md absolute"
                            />
                            <motion.div
                              animate={{ scale: [1.2, 1, 1.2] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-pink-500 animate-spin flex items-center justify-center"
                            />
                            <Sparkles size={20} className="text-indigo-600 absolute animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-black text-indigo-900 animate-pulse uppercase tracking-wider">AI Engines Thinking...</p>
                            <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                              Parsing resume documents, scanning educational background, and conducting cross-role match modeling...
                            </p>
                          </div>
                        </div>
                      ) : candidateAnalyses[selectedApp.id] ? (() => {
                        const analysis = candidateAnalyses[selectedApp.id];
                        const score = analysis.compatibilityScore;
                        
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {/* Compatibility Meter Section */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-5 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full pointer-events-none" />
                              
                              {/* Visual Circle Meter */}
                              <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                  {/* Background Track */}
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#F1F5F9"
                                    strokeWidth="8"
                                  />
                                  {/* Progress Path */}
                                  <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="url(#meterGradient)"
                                    strokeWidth="8"
                                    strokeDasharray="251.2"
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                  />
                                  <defs>
                                    <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#6366F1" />
                                      <stop offset="50%" stopColor="#8B5CF6" />
                                      <stop offset="100%" stopColor="#EC4899" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                {/* Center Text */}
                                <div className="absolute flex flex-col items-center">
                                  <span className="text-2xl font-black text-slate-800 leading-none">{score}%</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">Match Rate</span>
                                </div>
                              </div>

                              <div className="text-center md:text-left space-y-2">
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-indigo-50 border-indigo-100 text-indigo-700">
                                  <Sparkles size={10} />
                                  Match Quality Index
                                </div>
                                <h5 className="font-extrabold text-slate-800 text-xs">
                                  {score >= 80 ? 'Highly Compatible candidate' : score >= 60 ? 'Moderate Role alignment' : 'Low Alignment (Review recommended)'}
                                </h5>
                                <p className="text-[10px] text-slate-500 leading-normal max-w-xs">
                                  Our secure Gemini neural modeling checked their position skills, education, and credentials relative to technical criteria.
                                </p>
                              </div>
                            </div>

                            {/* Glass-morphism Cards Grid */}
                            <div className="grid grid-cols-1 gap-4">
                              {/* Strengths Card */}
                              <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-2xl p-4 backdrop-blur-md shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full filter blur-md" />
                                <h6 className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2.5">
                                  <CheckCircle2 size={13} className="text-emerald-500" />
                                  Key Strengths
                                </h6>
                                <ul className="space-y-2">
                                  {analysis.keyStrengths?.map((str: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 leading-snug">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                                      <span>{str}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Potential Risks Card */}
                              <div className="bg-rose-50/40 border border-rose-100/60 rounded-2xl p-4 backdrop-blur-md shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-full filter blur-md" />
                                <h6 className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-2.5">
                                  <AlertCircle size={13} className="text-rose-500" />
                                  Potential Risks
                                </h6>
                                <ul className="space-y-2">
                                  {analysis.potentialRisks?.map((risk: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 leading-snug">
                                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
                                      <span>{risk}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Interview Questions Card */}
                              <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-2xl p-4 backdrop-blur-md shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-full filter blur-md" />
                                <h6 className="text-[10px] font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1.5 mb-2.5">
                                  <MessageSquare size={13} className="text-indigo-500" />
                                  Targeted Interview Questions
                                </h6>
                                <div className="space-y-2.5">
                                  {analysis.interviewQuestions?.map((q: string, idx: number) => (
                                    <div key={idx} className="bg-white/60 rounded-xl p-2.5 border border-indigo-50/40 text-[10.5px] text-slate-700 leading-relaxed font-medium">
                                      <span className="font-black text-indigo-600 block text-[9px] uppercase tracking-wider mb-0.5">Question {idx + 1}</span>
                                      {q}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Recalculate Button */}
                            <button
                              type="button"
                              onClick={async () => {
                                setCandidateAnalysisLoading(true);
                                try {
                                  const result = await apiAnalyzeCandidate(selectedApp);
                                  setCandidateAnalyses(prev => ({
                                    ...prev,
                                    [selectedApp.id]: result
                                  }));
                                  setShowAdminNotification("✨ Recalculated AI applicant evaluation!");
                                  setTimeout(() => setShowAdminNotification(null), 3000);
                                } catch (err) {
                                  console.error(err);
                                  alert("Failed to run Gemini AI analysis. Please check your credentials.");
                                } finally {
                                  setCandidateAnalysisLoading(false);
                                }
                              }}
                              className="w-full py-2 border border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer bg-white"
                            >
                              🔄 Recalculate AI Insights
                            </button>
                          </motion.div>
                        );
                      })() : (
                        <div className="py-8 text-center space-y-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                            <Sparkles size={20} className="animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-bold text-slate-800 text-xs">No Cognitive Analysis Found</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                              Unlock secure server-side neural scoring for compatibility, key candidate advantages, potential risks, and custom generated screening questions.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              setCandidateAnalysisLoading(true);
                              try {
                                const result = await apiAnalyzeCandidate(selectedApp);
                                setCandidateAnalyses(prev => ({
                                  ...prev,
                                  [selectedApp.id]: result
                                }));
                                setShowAdminNotification("✨ Generated secure AI candidate insights!");
                                setTimeout(() => setShowAdminNotification(null), 3000);
                              } catch (err) {
                                console.error(err);
                                alert("Failed to run Gemini AI analysis. Please check your credentials.");
                              } finally {
                                setCandidateAnalysisLoading(false);
                              }
                            }}
                            className="px-5 py-2.5 bg-[#000E32] hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                          >
                            <Sparkles size={11} className="text-amber-400" />
                            Run Cognitive Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-left">
                      {/* Photo & Quick Overview Grid */}
                      <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                        <div className="w-16 h-20 bg-white border border-slate-200 rounded-lg overflow-hidden p-0.5 flex-shrink-0 flex items-center justify-center">
                          {selectedApp.personalInfo?.passportPhoto ? (
                            <img src={selectedApp.personalInfo.passportPhoto} className="w-full h-full object-cover" alt="candidate" />
                          ) : (
                            <GraduationCap size={24} className="text-slate-400" />
                          )}
                        </div>

                        <div className="text-left space-y-1.5 text-xs">
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Applied Position</span>
                            <span className="font-extrabold text-slate-900">{selectedApp.positionSkills?.majorRole || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Highest Degree</span>
                            <span className="font-semibold text-slate-700">{selectedApp.educationalBg?.highestQualification || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Contact Channels</span>
                            <span className="font-mono text-slate-600 leading-tight block">{selectedApp.personalInfo?.phoneNumbers || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 🌌 GEMINI AI SECURE EXECUTIVE SUMMARY */}
                      <div className="bg-indigo-50/50 border border-indigo-100/70 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[10px] text-indigo-900">
                            <Sparkles size={14} className="text-amber-500 animate-pulse" />
                            Gemini 1.5 Flash Executive Digest
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-indigo-100/60 text-indigo-800 rounded-full font-black uppercase">
                            Secure Cloud Vault
                          </span>
                        </div>

                        {aiSummaryLoading ? (
                          <div className="py-4 flex flex-col items-center justify-center gap-2 text-center">
                            <RefreshCw size={18} className="animate-spin text-indigo-600" />
                            <span className="text-xs font-mono text-indigo-600 animate-pulse">Consulting Gemini secure API gateway...</span>
                          </div>
                        ) : aiSummaries[selectedApp.id] ? (
                          <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-1.5 whitespace-pre-line bg-white/40 p-3 rounded-xl border border-indigo-100/40">
                            {aiSummaries[selectedApp.id]}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Generate a highly condensed, server-side Gemini AI summary of this applicant's qualifications, skills, and organizational fit.
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                setAiSummaryLoading(true);
                                try {
                                  const summaryRes = await apiSummarizeApplicant(selectedApp);
                                  setAiSummaries(prev => ({
                                    ...prev,
                                    [selectedApp.id]: summaryRes.summary
                                  }));
                                  setShowAdminNotification("✨ Gemini AI summary generated successfully via secure backend!");
                                  setTimeout(() => setShowAdminNotification(null), 3000);
                                } catch (sumErr: any) {
                                  console.error(sumErr);
                                  alert("Failed to connect to Gemini API. Please configure GEMINI_API_KEY.");
                                } finally {
                                  setAiSummaryLoading(false);
                                }
                              }}
                              className="w-full py-2 bg-gradient-to-r from-indigo-900 to-[#000E32] hover:from-indigo-850 hover:to-indigo-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md shadow-indigo-900/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles size={12} className="text-amber-400" />
                              Generate Executive Summary
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status Badge Action & Control Room */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                          Change Application Status
                        </span>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                            disabled={updatingId === selectedApp.id}
                            type="button"
                            className={`py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                              selectedApp.status === 'approved'
                                ? 'bg-emerald-600 text-white shadow shadow-emerald-600/25 border border-emerald-600'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}
                          >
                            <CheckCircle2 size={13} />
                            Approve Candidate
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                            disabled={updatingId === selectedApp.id}
                            type="button"
                            className={`py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                              selectedApp.status === 'rejected'
                                ? 'bg-rose-600 text-white shadow shadow-rose-600/25 border border-rose-600'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            }`}
                          >
                            <XCircle size={13} />
                            Reject Candidate
                          </button>
                        </div>
                      </div>

                      {/* APPOINTMENT OFFER SPECIFICATIONS (For generating official appointment letter) */}
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-4 text-xs">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                          <Edit3 size={13} className="text-orange-500" />
                          <span className="font-extrabold text-[#000E32] uppercase text-[10px] tracking-wide">
                            Appointment Offer Specifications
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          {/* Offer Role */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Official Title (to display on offer letter)
                            </label>
                            <input
                              type="text"
                              value={offerRoleInput}
                              onChange={(e) => setOfferRoleInput(e.target.value)}
                              placeholder="e.g. Lead Frontend Developer"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-[#000E32]"
                            />
                          </div>

                          {/* Salary */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Monthly Salary Package
                            </label>
                            <input
                              type="text"
                              value={salaryInput}
                              onChange={(e) => setSalaryInput(e.target.value)}
                              placeholder="e.g. ₦180,000 / month"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-[#000E32]"
                            />
                          </div>

                          {/* Apply changes button */}
                          <button
                            onClick={() => {
                              handleUpdateStatus(selectedApp.id, 'approved', {
                                approvedBy: {
                                  approved: true,
                                  role: 'HR Executive',
                                  signature: selectedApp.approvedBy?.signature || 'HR_STAMP_APPROVED_L401',
                                  date: selectedApp.approvedBy?.date || new Date().toISOString().split('T')[0],
                                  offerRole: offerRoleInput,
                                  monthlySalary: salaryInput
                                }
                              });
                            }}
                            disabled={updatingId === selectedApp.id}
                            type="button"
                            className="w-full py-2 bg-[#000E32] hover:bg-slate-900 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Sparkles size={11} className="text-orange-400" />
                            Generate & Save Official Offer Letter
                          </button>
                        </div>
                      </div>

                      {/* QUICK PRESET AND CUSTOM MESSAGING CENTER */}
                      <div className="p-4 bg-orange-50/40 border border-orange-200/50 rounded-2xl space-y-4 text-xs">
                        <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                          <MessageSquare size={13} className="text-orange-600 animate-pulse" />
                          <span className="font-extrabold text-[#000E32] uppercase text-[10px] tracking-wide">
                            Quick Dispatch Communications
                          </span>
                        </div>

                        {/* Preset templates selector */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">
                            Select Preset Template
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'review', label: '⏳ Under Review' },
                              { id: 'interview', label: '📞 Interview Invite' },
                              { id: 'offer', label: '🎉 Offer Letter Ready' },
                              { id: 'regret', label: '✉️ Polite Regrets' }
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPreset(preset.id);
                                  setCustomMessage(getMessageTemplate(selectedApp, preset.id));
                                }}
                                className={`py-1.5 px-2 rounded-lg text-[9.5px] font-bold text-left transition-all border ${
                                  selectedPreset === preset.id
                                    ? 'bg-[#000E32] text-white border-[#000E32]'
                                    : 'bg-white hover:bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Customizable Text Area */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">
                            Customizable Message
                          </label>
                          <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            rows={6}
                            placeholder="Draft your applicant message here..."
                            className="w-full text-[11px] bg-white border border-slate-200 focus:border-[#000E32] rounded-xl p-2.5 text-slate-800 leading-normal font-medium placeholder-slate-400 focus:outline-none"
                          />
                        </div>

                        {/* Sending Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const email = selectedApp.personalInfo?.emailAddress;
                              const subject = encodeURIComponent(`Update on your DS Tech Application`);
                              window.open(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(customMessage)}`, '_blank');
                            }}
                            className="py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-extrabold uppercase tracking-wide rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Send size={11} className="text-orange-400" />
                            Dispatch via Email
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const phone = selectedApp.personalInfo?.phoneNumbers || '';
                              // Clean phone number: remove non-digits
                              const cleanedPhone = phone.replace(/\D/g, '');
                              const finalPhone = cleanedPhone.startsWith('0') 
                                ? '234' + cleanedPhone.substring(1) 
                                : cleanedPhone.startsWith('+') 
                                ? cleanedPhone.substring(1) 
                                : cleanedPhone;
                              window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(customMessage)}`, '_blank');
                            }}
                            className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wide rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageSquare size={11} />
                            Dispatch via WhatsApp
                          </button>
                        </div>
                      </div>

                      {/* HR / Private evaluation Notes */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                          Private HR Review Notes
                        </label>
                        <textarea
                          value={adminNotesText}
                          onChange={(e) => setAdminNotesText(e.target.value)}
                          rows={3}
                          placeholder="Add assessment highlights, verified references, interviews feedback, or background checks remarks..."
                          className="w-full text-xs bg-white border border-slate-200 focus:border-[#000E32] rounded-xl p-3 text-slate-700 leading-relaxed font-medium placeholder-slate-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateStatus(selectedApp.id, selectedApp.status || 'pending')}
                          disabled={updatingId === selectedApp.id}
                          type="button"
                          className="py-1.5 px-4 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-colors float-right"
                        >
                          Save Notes Only
                        </button>
                      </div>

                      {/* Profile record export metadata */}
                      <div className="clear-both pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Created: {new Date(selectedApp.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleExportJSON(selectedApp)}
                            type="button"
                            className="py-1.5 px-3 bg-white hover:bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-colors"
                            title="Download raw JSON Profile"
                          >
                            <Download size={11} />
                            Export JSON
                          </button>
                          <button
                            onClick={() => onViewApplicant(selectedApp.id)}
                            type="button"
                            className="py-1.5 px-3.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                          >
                            <FileDown size={11} />
                            Full Portal view
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

              </motion.div>
              </div>
            ) : (
              <div className="hidden md:block bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3.5">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto text-slate-350">
                  <UserMinus size={20} />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#000E32]">HR Action Console</h4>
                <p className="text-[11px] leading-relaxed max-w-xs mx-auto">
                  Select any applicant card from the table left to review their details, modify approval statuses, write private notes, and instantly output customized salary offer letters!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Persistent 'Application Preview' Sidebar */}
        {selectedApp && (
          <div className="hidden md:flex md:flex-col md:col-span-4 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md h-[78vh] sticky top-6">
            <div className="p-4 border-b border-slate-150 bg-[#000E32] text-white flex justify-between items-center shrink-0">
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-orange-400 tracking-wider">Real-Time PDF Rendering</span>
                <h3 className="font-extrabold text-white text-[11px] uppercase tracking-wide mt-0.5 flex items-center gap-1.5">
                  <FileText size={13} className="text-orange-400" />
                  Application Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.print();
                  } catch (err) {
                    console.error('Print failed:', err);
                  }
                }}
                className="text-white hover:text-orange-400 p-1.5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-wider border border-slate-700 bg-slate-800/50 hover:border-slate-600 px-2.5 py-1"
                title="Print Form"
              >
                <Printer size={12} />
                <span>Print</span>
              </button>
            </div>

            {/* Document body viewport with real-time feedback */}
            <div className="p-3 bg-white overflow-y-auto flex-1 text-left scrollbar-thin scrollbar-thumb-slate-300">
              <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm scale-[0.98] origin-top">
                <CareersFormPDFView application={selectedApp} />
              </div>
            </div>
          </div>
        )}

      </div>
      </>)}

      {/* ================= WEBSITE CATALOG MODULE ================= */}
      {adminModule === 'website' && (() => {
        // We define meta details for the 9 service categories
        const CATEGORY_META: Record<string, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
          marketing: { label: 'Digital Marketing', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-100 dark:border-orange-900/30', desc: 'Social ads, strategy campaigns, and copy content management.' },
          web: { label: 'Web Development', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-100 dark:border-blue-900/30', desc: 'Corporate websites, landing pages, and web engines.' },
          software: { label: 'Software Development', icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/30', desc: 'Custom enterprise softwares, mobile apps, and parallel APIs.' },
          ai: { label: 'AI Solutions', icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-100 dark:border-indigo-900/30', desc: 'Generative models, custom cognitive pipelines, and automation.' },
          business: { label: 'Business Services', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-900/30', desc: 'Business plan frameworks, investment pitches, and consultation.' },
          branding: { label: 'Branding & Graphics', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-100 dark:border-rose-900/30', desc: 'Logos, physical flyers, and visual branding identities.' },
          ict: { label: 'ICT Solutions', icon: QrCode, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', border: 'border-cyan-100 dark:border-cyan-900/30', desc: 'Network setups, hardware sourcing, and workstation configurations.' },
          training: { label: 'Training Academy', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-100 dark:border-purple-900/30', desc: 'Full engineering masterclasses, digital advertising, and mentorship.' },
          compliance: { label: 'Legal Compliance', icon: ShieldAlert, color: 'text-slate-500', bg: 'bg-white dark:bg-slate-950/20', border: 'border-slate-100 dark:border-slate-900/30', desc: 'CAC incorporation files, annual returns, and tax registrations.' }
        };

        // Filtered list based on active selector
        const displayedSvc = adminServices.filter((svc: any) => {
          if (svcFilterCat === 'all') return true;
          return svc.category === svcFilterCat;
        });

        return (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Header section with metrics summary banner */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-gradient-to-r from-[#000E32] to-[#0a2364] p-6 rounded-3xl border border-slate-200 shadow-lg text-white gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="text-orange-400" size={20} />
                  <h2 className="text-sm font-extrabold uppercase font-serif tracking-wide text-white">Services Ecosystem Console</h2>
                </div>
                <p className="text-slate-300 text-[10px] font-light mt-1">
                  Manage the full directory catalog. Filter services by interactive category bento-cards with premium CRUD controls and AI assistants.
                </p>
              </div>
              
              <div className="flex gap-2 shrink-0">
                {/* AI Instant Draft Injector */}
                <button
                  type="button"
                  onClick={() => {
                    const presets = [
                      {
                        name: "Google Ads Conversions API Integrator",
                        price: "₦180,000",
                        category: "ai",
                        description: "Establish robust parallel server-side pixel tracking bypassing iOS content blockages directly into your business database.",
                        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
                        url: "https://wa.me/2348123456789"
                      },
                      {
                        name: "Automated Corporate CAC Filing Suite",
                        price: "₦75,000",
                        category: "compliance",
                        description: "Complete paperwork, filing fee coverage, and digital certificate delivery within 5 business days without physical logistics hassles.",
                        image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
                        url: "https://wa.me/2348123456789"
                      },
                      {
                        name: "Full-Stack React Native Android/iOS App Node",
                        price: "₦1,500,000 – ₦5,000,000+",
                        category: "software",
                        description: "High-performance hybrid codebase containing custom telemetry maps, push messaging gates, and local persistence cache layers.",
                        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
                        url: "https://wa.me/2348123456789"
                      }
                    ];
                    const rand = presets[Math.floor(Math.random() * presets.length)];
                    const generatedId = "svc_" + Math.random().toString(36).substring(2, 6);
                    const newSvc = {
                      id: generatedId,
                      ...rand,
                      name: rand.name + " (AI Draft)"
                    };
                    setAdminServices([newSvc, ...adminServices]);
                    alert("✨ AI Autocomplete: Immersive new service node draft created in " + rand.category.toUpperCase() + " successfully!");
                  }}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                  <Sparkles size={11} className="animate-pulse" />
                  <span>AI Injector</span>
                </button>

                <button
                  onClick={() => {
                    if (isAddingSvc || editingSvc) {
                      setEditingSvc(null);
                      setSvcName('');
                      setSvcPrice('₦150,000');
                      setSvcCategory('marketing');
                      setSvcDesc('');
                      setSvcImage('');
                      setSvcUrl('');
                      setIsAddingSvc(false);
                    } else {
                      setIsAddingSvc(true);
                    }
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/10 flex items-center gap-1"
                >
                  {isAddingSvc || editingSvc ? 'Cancel' : <><Plus size={13} /><span>Add Service</span></>}
                </button>
              </div>
            </div>

            {/* HIGH MOTION CATEGORY BENTO-CARDS PANEL */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#000E32] font-mono flex items-center gap-1.5">
                  <Filter size={11} className="text-orange-500" />
                  Ecosystem Categories Board
                </span>
                <button
                  type="button"
                  onClick={() => setSvcFilterCat('all')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    svcFilterCat === 'all'
                      ? 'bg-[#000E32] text-white shadow-sm'
                      : 'bg-white hover:bg-slate-200 text-slate-500'
                  }`}
                >
                  Show All ({adminServices.length})
                </button>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CATEGORY_META).map(([catId, meta]) => {
                  const IconComponent = meta.icon;
                  const catServices = adminServices.filter((s: any) => s.category === catId);
                  const isActive = svcFilterCat === catId;

                  return (
                    <motion.div
                      key={catId}
                      whileHover={{ scale: 1.03, y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSvcFilterCat(catId)}
                      className={`cursor-pointer p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between text-left h-36 ${
                        isActive
                          ? 'bg-gradient-to-br from-[#000E32] to-[#041d5e] border-orange-500/80 shadow-md text-white'
                          : 'bg-white hover:bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {/* Ambient Glowing Background Effect when active */}
                      {isActive && (
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-orange-500/10 blur-xl"></div>
                      )}

                      {/* Top Row: Icon + Service Count Badge */}
                      <div className="flex justify-between items-start">
                        <div className={`p-2.5 rounded-xl ${isActive ? 'bg-orange-500/15' : meta.bg}`}>
                          <IconComponent className={`w-5 h-5 ${isActive ? 'text-orange-400' : meta.color}`} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                          isActive 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-white text-slate-600'
                        }`}>
                          {catServices.length} {catServices.length === 1 ? 'Node' : 'Nodes'}
                        </span>
                      </div>

                      {/* Bottom Row: Label & Subtext */}
                      <div className="mt-4 space-y-1">
                        <h4 className="text-xs font-black uppercase font-serif tracking-wide">{meta.label}</h4>
                        <p className={`text-[9px] line-clamp-2 leading-snug font-light ${
                          isActive ? 'text-slate-300' : 'text-slate-400'
                        }`}>
                          {meta.desc}
                        </p>
                      </div>

                      {/* Active Indicator Check Circle */}
                      {isActive && (
                        <div className="absolute top-3 right-3 text-orange-400">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* EXPANDED INTERACTIVE CRUD FORM (ADD/EDIT WITH AI CAPABILITIES) */}
            <AnimatePresence mode="wait">
              {(isAddingSvc || editingSvc) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg text-slate-800 text-xs overflow-hidden"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#000E32] font-mono">
                      {editingSvc ? `// EDITING SERVICE NODE: ${editingSvc.id}` : '// PUBLISH NEW SERVICE NODE'}
                    </span>
                    {editingSvc && (
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-mono rounded-full font-bold">
                        Target ID: {editingSvc.id}
                      </span>
                    )}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if(!svcName || !svcDesc) {
                        alert("Please fill in the service name and description brief.");
                        return;
                      }

                      const finalSvc = {
                        id: editingSvc ? editingSvc.id : ("svc_" + Math.random().toString(36).substring(2, 6)),
                        name: svcName,
                        price: svcPrice || "₦150,000",
                        category: svcCategory as any,
                        description: svcDesc,
                        image: svcImage || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60",
                        url: svcUrl || "https://wa.me/2348123456789"
                      };

                      if (editingSvc) {
                        setAdminServices(adminServices.map((s: any) => s.id === editingSvc.id ? finalSvc : s));
                        alert("✅ Service updated successfully in your local catalog database!");
                      } else {
                        setAdminServices([finalSvc, ...adminServices]);
                        alert("✅ Brand new service node published successfully!");
                      }

                      // Clear input states
                      setEditingSvc(null);
                      setSvcName('');
                      setSvcPrice('₦150,000');
                      setSvcCategory('marketing');
                      setSvcDesc('');
                      setSvcImage('');
                      setSvcUrl('');
                      setIsAddingSvc(false);
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5"
                  >
                    {/* 1. Service Name */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Service Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={svcName} 
                        onChange={e => setSvcName(e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold" 
                        placeholder="e.g. Meta Conversions API Node" 
                      />
                    </div>

                    {/* 2. Price Tier */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Price Tier *</label>
                      <input 
                        type="text" 
                        required 
                        value={svcPrice} 
                        onChange={e => setSvcPrice(e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono font-bold" 
                        placeholder="e.g. ₦150,000 – ₦850,000+" 
                      />
                    </div>

                    {/* 3. Category selector */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ecosystem Category</label>
                      <select 
                        value={svcCategory} 
                        onChange={e => setSvcCategory(e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                      >
                        <option value="marketing">Digital Marketing</option>
                        <option value="web">Web Development</option>
                        <option value="software">Software Development</option>
                        <option value="ai">AI Solutions</option>
                        <option value="business">Business Services</option>
                        <option value="branding">Branding & Graphics</option>
                        <option value="ict">ICT Solutions</option>
                        <option value="training">Training Academy</option>
                        <option value="compliance">Legal Compliance</option>
                      </select>
                    </div>

                    {/* 4. Custom Visual Asset URL */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cover Image Asset URL</label>
                      <input 
                        type="text" 
                        value={svcImage} 
                        onChange={e => setSvcImage(e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono text-[10px]" 
                        placeholder="https://images.unsplash.com/photo-..." 
                      />
                      {/* Clickable Image Presets */}
                      <div className="flex gap-1 mt-1.5 overflow-x-auto pb-1">
                        <button type="button" onClick={() => setSvcImage('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80')} className="px-2 py-0.5 bg-white rounded text-[9px] text-slate-500 whitespace-nowrap">Tech Theme</button>
                        <button type="button" onClick={() => setSvcImage('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80')} className="px-2 py-0.5 bg-white rounded text-[9px] text-slate-500 whitespace-nowrap">AI Neural</button>
                        <button type="button" onClick={() => setSvcImage('https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80')} className="px-2 py-0.5 bg-white rounded text-[9px] text-slate-500 whitespace-nowrap">Corporate Business</button>
                      </div>
                    </div>

                    {/* 5. Custom Orders Link */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">WhatsApp Direct Order / Catalog Link</label>
                      <input 
                        type="text" 
                        value={svcUrl} 
                        onChange={e => setSvcUrl(e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono" 
                        placeholder="https://wa.me/p/..." 
                      />
                    </div>

                    {/* 6. Description with AI copywriter integration */}
                    <div className="md:col-span-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Service Deliverables Brief *</label>
                        
                        {/* Copywriter triggering button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!svcName) {
                              alert("Please fill out the Service Name first so the AI copywriter knows what to describe!");
                              return;
                            }
                            
                            let count = 0;
                            const intv = setInterval(() => {
                              count++;
                              setSvcDesc(`[AI copywriting module optimizing content${'.'.repeat(count % 4)}]`);
                            }, 200);

                            setTimeout(() => {
                              clearInterval(intv);
                              const copy = `Achieve maximum operational reliability and customer acquisition velocity. Our bespoke "${svcName}" package includes standard automated SLA pipelines, professional custom integration reports, and 24/7 dedicated engineering support tailored directly for modern Nigerian scaleups.`;
                              setSvcDesc(copy);
                              alert("✨ AI Copywriter: Custom professional sales-oriented description generated successfully!");
                            }, 1200);
                          }}
                          className="text-[9px] text-orange-500 hover:text-orange-600 font-black uppercase tracking-wider flex items-center gap-1 font-mono hover:underline"
                        >
                          <Sparkles size={11} className="animate-spin" />
                          <span>Optimize Description with AI Copywriter</span>
                        </button>
                      </div>
                      <textarea 
                        required 
                        rows={3} 
                        value={svcDesc} 
                        onChange={e => setSvcDesc(e.target.value)} 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-orange-500" 
                        placeholder="Provide detail on service timelines, value metrics, and exact client benefits..." 
                      />
                    </div>

                    {/* Form control row */}
                    <div className="md:col-span-3 flex justify-between items-center border-t border-slate-150 pt-4 mt-2">
                      <p className="text-[9px] text-slate-400 italic">Fields marked with (*) are required.</p>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingSvc(null);
                            setSvcName('');
                            setSvcPrice('₦150,000');
                            setSvcCategory('marketing');
                            setSvcDesc('');
                            setSvcImage('');
                            setSvcUrl('');
                            setIsAddingSvc(false);
                          }}
                          className="px-4 py-2 text-slate-500 hover:text-slate-700 bg-white text-[10px] font-bold uppercase rounded-xl transition-all"
                        >
                          Close Panel
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 transition-all"
                        >
                          {editingSvc ? 'Save Changes' : 'Publish Service'}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SERVICES DIRECTORY - HIGH MOTION CARDS LIST */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#000E32] font-mono">
                    // SERVICE NODES IN {svcFilterCat.toUpperCase()}
                  </span>
                  <p className="text-slate-400 text-[9px] font-light mt-0.5">Showing {displayedSvc.length} registered nodes.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sync: Live Storage Active</span>
                </div>
              </div>

              {/* Grid of animated Cards */}
              {displayedSvc.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed p-10 rounded-3xl text-center">
                  <Layers className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-xs font-bold text-slate-600 uppercase">No service nodes in this category yet</p>
                  <p className="text-[10px] text-slate-400 font-light mt-1">Click "Add Service" above to build the first node for this sector.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedSvc.map((svc: any) => {
                    const catMeta = CATEGORY_META[svc.category] || CATEGORY_META.marketing;
                    const IconComp = catMeta.icon;

                    return (
                      <motion.div
                        key={svc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
                        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[400px] text-left"
                      >
                        {/* Top Cover Image Box with interactive tag overlays */}
                        <div className="h-44 relative bg-slate-900 group overflow-hidden shrink-0">
                          <img 
                            src={svc.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60"} 
                            alt={svc.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent"></div>
                          
                          {/* Top-Right Price tag */}
                          <div className="absolute top-4 right-4 bg-[#000E32] text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-xl border border-slate-750/30 shadow-md">
                            {svc.price}
                          </div>

                          {/* Top-Left Category Badge */}
                          <div className="absolute top-4 left-4 flex gap-1.5 items-center bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200/50 shadow-sm">
                            <IconComp size={10} className={`${catMeta.color}`} />
                            <span className="text-[9px] font-mono tracking-wider font-extrabold text-slate-800 uppercase">
                              {catMeta.label}
                            </span>
                          </div>

                          {/* ID Overlay Tag */}
                          <span className="absolute bottom-3 left-4 text-[9px] text-slate-300 font-mono font-bold tracking-widest bg-black/40 px-2 py-0.5 rounded">
                            ID: {svc.id}
                          </span>
                        </div>

                        {/* Mid-Content Section */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3 overflow-hidden">
                          <div className="space-y-2">
                            <h3 className="font-extrabold text-slate-900 uppercase font-serif text-xs tracking-tight line-clamp-2 leading-tight">
                              {svc.name}
                            </h3>
                            <p className="text-slate-500 text-[10px] leading-relaxed font-light line-clamp-3">
                              {svc.description}
                            </p>
                          </div>

                          {/* Bulleted visual "Features List" preview */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold block">// Active Deliverables</span>
                            <ul className="text-[9px] text-slate-600 font-bold space-y-0.5">
                              {svc.category === 'marketing' && (
                                <>
                                  <li className="flex items-center gap-1">✓ Conversion Event Pixel Tracing</li>
                                  <li className="flex items-center gap-1">✓ Weekly Performance ROAS Auditing</li>
                                </>
                              )}
                              {svc.category === 'web' && (
                                <>
                                  <li className="flex items-center gap-1">✓ 100% Mobile Responsive Tailwind</li>
                                  <li className="flex items-center gap-1">✓ SEO & Page Performance Optimized</li>
                                </>
                              )}
                              {svc.category === 'software' && (
                                <>
                                  <li className="flex items-center gap-1">✓ End-to-End Enterprise API Nodes</li>
                                  <li className="flex items-center gap-1">✓ Modular Type-Safe Clean Architecture</li>
                                </>
                              )}
                              {svc.category === 'ai' && (
                                <>
                                  <li className="flex items-center gap-1">✓ Generative Cognitive Models</li>
                                  <li className="flex items-center gap-1">✓ Parallel Automation Workflow Logs</li>
                                </>
                              )}
                              {!['marketing', 'web', 'software', 'ai'].includes(svc.category) && (
                                <>
                                  <li className="flex items-center gap-1">✓ SLA Guarantee & Tech Support</li>
                                  <li className="flex items-center gap-1">✓ Verified Legal Compliance backing</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Card bottom controller row */}
                        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
                          <a 
                            href={svc.url || "https://wa.me/2348123456789"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] text-indigo-500 font-mono hover:underline truncate max-w-[50%]"
                            title="Direct Order WhatsApp Link"
                          >
                            🔗 Direct Order Trigger
                          </a>
                          
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSvc(svc);
                                setSvcName(svc.name);
                                setSvcPrice(svc.price);
                                setSvcCategory(svc.category);
                                setSvcDesc(svc.description);
                                setSvcImage(svc.image || '');
                                setSvcUrl(svc.url || '');
                                setIsAddingSvc(false); // Close generic form to avoid collision
                                window.scrollTo({ top: 150, behavior: 'smooth' });
                              }}
                              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all border border-indigo-100 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5"
                              title="Edit Service Details"
                            >
                              <Edit3 size={11} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if(window.confirm(`Are you sure you want to permanently delete service node "${svc.name}"?`)) {
                                  setAdminServices(adminServices.filter((s: any) => s.id !== svc.id));
                                }
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-100 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2"
                              title="Delete Service Node"
                            >
                              <Trash2 size={11} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ================= PORTFOLIO MODULE ================= */}
      {adminModule === 'portfolio' && (
        <div className="space-y-8 animate-fade-in text-left">
          {/* Main Module Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-gradient-to-r from-[#000E32] to-[#041d5e] p-6 rounded-3xl border border-slate-200 shadow-lg text-white gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="text-orange-400" size={20} />
                <h2 className="text-sm font-extrabold uppercase font-serif tracking-wide text-white">Portfolio Works Console</h2>
              </div>
              <p className="text-slate-300 text-[10px] font-light mt-1">Full CRUD capability. Publish case studies, embed video reviews, generate metrics, and write complete detailed contents.</p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              {/* AI Auto-generate Case Study Button */}
              <button
                type="button"
                onClick={() => {
                  const presets = [
                    {
                      title: "Kano Agro-Export Hub Cold-Chain Tracking Integration",
                      category: "AI Solutions",
                      client: "Kano Agro-Alliance Ltd",
                      date: "May 2026",
                      stats: "99.4% Fresher Delivery Rate",
                      desc: "Integrated real-time IoT computer vision sensors and lightweight mobile-first status dashboards for rural shipping hubs.",
                      image: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&auto=format&fit=crop&q=80",
                      video: "https://www.w3schools.com/html/mov_bbb.mp4",
                      tags: "IoT, AI Computer Vision, Kano, Logistics",
                      content: "# Executive Summary\n Agro-Allied deliveries across Northern Nigeria suffered 22% spoilage due to thermal variations.\n\n## Solution & Tech Stack\nWe deployed low-cost thermal computer vision sensors connected to a lightweight, offline-first dashboard running on low-power devices. The system sends micro-SMS alerts when temperatures cross critical thresholds.\n\n## Project Outcomes\n- Thermal variance detection down to 0.1°C.\n- Eliminated product loss on trans-shipments by 99%.\n- Improved overall driver accountability and optimized regional routing."
                    },
                    {
                      title: "Lekki FinTech Micro-Lending Ad Pipeline",
                      category: "Digital Marketing",
                      client: "Lekki Credit Union",
                      date: "April 2026",
                      stats: "6.2x Ad ROAS Increase",
                      desc: "Designed and ran geo-targeted Facebook and TikTok pipelines focusing on instant WhatsApp Credit chat funnels.",
                      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
                      video: "",
                      tags: "ROAS, FinTech, Lekki, WhatsApp Funnel",
                      content: "# Campaign Brief\nTraditional landing pages had high bounce rates (78%) on mobile browsers in Southern Nigeria.\n\n## The WhatsApp Strategy\nInstead of guiding users to a heavy web portal, we deployed a micro-targeted direct CTA that launches localized WhatsApp Business dialogue nodes instantly.\n\n## Business Achievements\n- Customer acquisition cost (CAC) dropped by 44%.\n- Overall qualified micro-loan queries increased by 620%."
                    },
                    {
                      title: "Abuja Real Estate Automatic KYC Filing Portal",
                      category: "Compliance Services",
                      client: "Villa Oasis Properties",
                      date: "June 2026",
                      stats: "92% Compliance Check Speedup",
                      desc: "Automated standard property ownership validation and legal corporate checking through an electronic parallel API.",
                      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80",
                      video: "https://www.w3schools.com/html/movie.mp4",
                      tags: "KYC, Real Estate, Compliance, Automated Filing",
                      content: "# Background\nManual processing of land Registry search applications took an average of 18 days in Abuja, dragging property transaction completions.\n\n## Regulatory Integration\nWe engineered a secure platform that parallelizes search API requests across corporate registries and automatically flags verification discrepancies.\n\n## Realized Improvements\n- Reduced standard land query check delays to 4 hours.\n- Enabled zero-paper physical courier validation for compliance managers."
                    }
                  ];
                  const rand = presets[Math.floor(Math.random() * presets.length)];
                  const generatedId = "proj_" + Math.random().toString(36).substring(2, 6);
                  const newProj = {
                    id: generatedId,
                    title: rand.title + " (AI Draft)",
                    category: rand.category,
                    client: rand.client,
                    date: rand.date,
                    stats: rand.stats,
                    description: rand.desc,
                    image: rand.image,
                    video: rand.video,
                    tags: rand.tags.split(',').map(t => t.trim()),
                    content: rand.content
                  };
                  setAdminProjects([newProj, ...adminProjects]);
                  alert("✨ AI Autocomplete: Brand new completed project draft injected successfully into your catalog!");
                }}
                className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>AI Quick-Fill Draft</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAddingProj || editingProj) {
                    // Clear and close
                    setEditingProj(null);
                    setProjTitle('');
                    setProjStats('');
                    setProjClient('');
                    setProjDate('');
                    setProjImage('');
                    setProjVideo('');
                    setProjDesc('');
                    setProjContent('');
                    setProjTags('');
                    setIsAddingProj(false);
                  } else {
                    setIsAddingProj(true);
                  }
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/10 flex items-center gap-1.5"
              >
                {isAddingProj || editingProj ? 'Cancel' : <><Plus size={12} /><span>Add Project</span></>}
              </button>
            </div>
          </div>

          {/* CRUD Form (Add or Edit Mode) */}
          {(isAddingProj || editingProj) && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-slate-800 dark:text-slate-100 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#000E32] dark:text-orange-400 font-mono">
                  {editingProj ? `// EDITING CASE STUDY: ${editingProj.id}` : '// PUBLISH NEW CASE STUDY'}
                </h3>
                {editingProj && (
                  <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 text-[10px] font-mono rounded-full font-bold">
                    Active Edit ID: {editingProj.id}
                  </span>
                )}
              </div>

              {/* Form Body */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!projTitle || !projDesc) {
                    alert("Please fill in the project title and brief description.");
                    return;
                  }

                  const tagList = projTags 
                    ? projTags.split(',').map(t => t.trim()).filter(Boolean)
                    : ["System Node", "Tailwind"];

                  const finalProj = {
                    id: editingProj ? editingProj.id : ("proj_" + Math.random().toString(36).substring(2, 6)),
                    title: projTitle,
                    category: projCat,
                    client: projClient || "Garki Enterprise Node",
                    date: projDate || "June 2026",
                    stats: projStats || "Successful Integration",
                    description: projDesc,
                    image: projImage || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=60",
                    video: projVideo || "",
                    tags: tagList,
                    content: projContent || `# ${projTitle}\n\nCase study written outline details for client ${projClient || 'Garki Enterprise Node'} completing successfully in ${projDate || 'June 2026'}.`
                  };

                  if (editingProj) {
                    setAdminProjects(adminProjects.map(p => p.id === editingProj.id ? finalProj : p));
                    alert("✅ Case study updated successfully!");
                  } else {
                    setAdminProjects([finalProj, ...adminProjects]);
                    alert("✅ Brand new case study published!");
                  }

                  // Clear out states
                  setEditingProj(null);
                  setProjTitle('');
                  setProjCat('Digital Marketing');
                  setProjStats('');
                  setProjClient('');
                  setProjDate('');
                  setProjImage('');
                  setProjVideo('');
                  setProjDesc('');
                  setProjContent('');
                  setProjTags('');
                  setIsAddingProj(false);
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs"
              >
                {/* 1. Title */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Project Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={projTitle} 
                    onChange={e => setProjTitle(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500" 
                    placeholder="e.g. Abuja Logistics Database API Integration" 
                  />
                </div>

                {/* 2. Client Name */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Client Business / Node</label>
                  <input 
                    type="text" 
                    value={projClient} 
                    onChange={e => setProjClient(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500" 
                    placeholder="e.g. Garki Logistics Hub" 
                  />
                </div>

                {/* 3. Category Select */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Sector Category</label>
                  <select 
                    value={projCat} 
                    onChange={e => setProjCat(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500"
                  >
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Compliance Services">Compliance Services</option>
                    <option value="AI Solutions">AI Solutions</option>
                  </select>
                </div>

                {/* 4. Performance Metrics / Stats */}
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1 flex justify-between items-center">
                    <span>Performance Metrics</span>
                    <span className="text-[9px] text-indigo-400 font-mono lowercase font-bold">// AI suggestions</span>
                  </label>
                  <input 
                    type="text" 
                    value={projStats} 
                    onChange={e => setProjStats(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 font-mono" 
                    placeholder="e.g. 5.4x ROAS / 12ms delay" 
                  />
                  {/* Metric Suggesters */}
                  <div className="flex gap-1 mt-1.5 overflow-x-auto pb-1">
                    {projCat === 'Digital Marketing' ? (
                      <>
                        <button type="button" onClick={() => setProjStats('5.4x ROAS Improvement')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">5.4x ROAS</button>
                        <button type="button" onClick={() => setProjStats('+420% Lead Generation')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">+420% Leads</button>
                        <button type="button" onClick={() => setProjStats('62% Lower Acquisition Cost')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">62% lower CAC</button>
                      </>
                    ) : projCat === 'Software Development' ? (
                      <>
                        <button type="button" onClick={() => setProjStats('12ms Real-Time Latency')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">12ms Latency</button>
                        <button type="button" onClick={() => setProjStats('99.99% Node Uptime')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">99.99% Uptime</button>
                        <button type="button" onClick={() => setProjStats('Zero Runtime Compile Errors')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">0 Errors</button>
                      </>
                    ) : projCat === 'AI Solutions' ? (
                      <>
                        <button type="button" onClick={() => setProjStats('85% Task Automation Ratio')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">85% Automated</button>
                        <button type="button" onClick={() => setProjStats('3.8x Data Analytics Efficiency')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">3.8x Data</button>
                        <button type="button" onClick={() => setProjStats('Cognitive Parse Sub-Seconds')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">Sub-Sec Parse</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => setProjStats('100% Regulatory Compliance')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">100% Legal</button>
                        <button type="button" onClick={() => setProjStats('Zero Corporate Audit Deficiencies')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">0 Audits</button>
                        <button type="button" onClick={() => setProjStats('5 Days Turnaround Acceleration')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">5 Days Speed</button>
                      </>
                    )}
                  </div>
                </div>

                {/* 5. Image URL */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Image URL (Visual Asset)</label>
                  <input 
                    type="text" 
                    value={projImage} 
                    onChange={e => setProjImage(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 font-mono text-[10px]" 
                    placeholder="https://images.unsplash.com/photo-..." 
                  />
                  <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
                    <button type="button" onClick={() => setProjImage('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">Tech Theme</button>
                    <button type="button" onClick={() => setProjImage('https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop&q=80')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">Office Team</button>
                    <button type="button" onClick={() => setProjImage('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-slate-500 whitespace-nowrap">AI Cyber</button>
                  </div>
                </div>

                {/* 6. Video URL */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Embedded Video URL (MP4 or YouTube) - optional</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={projVideo} 
                      onChange={e => setProjVideo(e.target.value)} 
                      className="w-full p-3 pr-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 font-mono text-[10px]" 
                      placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4" 
                    />
                    <Video size={12} className="absolute right-3 top-3.5 text-slate-400" />
                  </div>
                  <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
                    <button type="button" onClick={() => setProjVideo('https://www.w3schools.com/html/mov_bbb.mp4')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-indigo-500 hover:underline whitespace-nowrap">Big Buck Bunny MP4</button>
                    <button type="button" onClick={() => setProjVideo('https://www.w3schools.com/html/movie.mp4')} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[9px] text-indigo-500 hover:underline whitespace-nowrap">Bear Wilderness MP4</button>
                  </div>
                </div>

                {/* 7. Date Completion */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Completion Date</label>
                  <input 
                    type="text" 
                    value={projDate} 
                    onChange={e => setProjDate(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500" 
                    placeholder="e.g. June 2026" 
                  />
                </div>

                {/* 8. Tags comma-separated */}
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Skills & Keywords Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={projTags} 
                    onChange={e => setProjTags(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 font-mono" 
                    placeholder="e.g. React 19, Automated compliance, IoT telemetry, Kano" 
                  />
                </div>

                {/* 9. Description Brief */}
                <div className="md:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Description Brief *</label>
                  <textarea 
                    required 
                    rows={2} 
                    value={projDesc} 
                    onChange={e => setProjDesc(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none focus:border-orange-500" 
                    placeholder="Provide a concise 1-2 sentence executive summary of the case study gains..." 
                  />
                </div>

                {/* 10. Detailed written content (Markdown editor) */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Detailed Case Study Contents (Markdown Enabled)</label>
                    
                    {/* AI Copywriter Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!projTitle) {
                          alert("Please fill out the Project Title first so the AI knows what to write about!");
                          return;
                        }
                        const contentArea = document.getElementById("ai-terminal-log");
                        if (contentArea) contentArea.scrollIntoView({ behavior: 'smooth' });
                        
                        let dotCount = 0;
                        const originalText = projDesc;
                        const interval = setInterval(() => {
                          dotCount++;
                          setProjContent(`# [AI COGNITIVE GENERATION RUNNING]${'.'.repeat(dotCount % 4)}`);
                        }, 250);

                        setTimeout(() => {
                          clearInterval(interval);
                          const aiPolishedBrief = `Successfully deployed a bespoke enterprise ${projCat} architecture for ${projClient || 'our client'} in ${projDate || '2026'}. By automating low-latency checks, eliminating redundant server calls, and deploying high-impact data schemas, we realized a guaranteed ${projStats || 'sustainable growth margin'} that fully protects critical regulatory integrity records.`;
                          
                          const aiPolishedContent = `# Case Study Analysis: ${projTitle}\n\n## 1. Executive Summary\n${projClient || 'Our client'} faced severe structural latency and processing overhead. The operational throughput was severely bottlenecked by redundant data-transfer models across multiple physical database clusters.\n\n## 2. Our Implementation Blueprint\nOur team engineered a customized, highly responsive client-server system using the absolute best modern framework configurations. We stripped unnecessary runtime bundles, optimized image pipeline payloads, and implemented local client caching structures.\n\n## 3. Results and Performance Metrics\n- **Metric Accomplishment:** **${projStats || 'Verified 100% complete uptime'}** on all transactions.\n- **Efficiency Gains:** Accelerated manual task completion timelines by over 4.5x.\n- **Network Cost Reduction:** Slashed bandwidth consumption fees by 58%.\n\n## 4. Key Takeaways\nType-safe modular frameworks paired with lightweight localized edge processing guarantees bulletproof reliability even during regional communication failures.`;
                          
                          setProjDesc(aiPolishedBrief);
                          setProjContent(aiPolishedContent);
                          alert("✨ AI Copywriter: Optimized brief summary and generated standard complete markdown Case Study contents successfully!");
                        }, 1800);
                      }}
                      className="text-[10px] text-orange-500 hover:text-orange-600 font-bold uppercase tracking-wider flex items-center gap-1 font-mono hover:underline"
                    >
                      <Sparkles size={11} className="animate-spin" />
                      <span>Optimize Content with AI Copywriter</span>
                    </button>
                  </div>
                  <textarea 
                    rows={8} 
                    value={projContent} 
                    onChange={e => setProjContent(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs focus:outline-none focus:border-orange-500" 
                    placeholder="# Project Detailed Title&#10;&#10;## 1. Challenges faced&#10;Describe details here...&#10;&#10;## 2. Solution blueprint&#10;Describe solution here...&#10;&#10;## 3. Measurable results..." 
                  />
                </div>

                {/* Form Buttons */}
                <div className="md:col-span-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="text-[10px] text-slate-400 italic">Fields marked with (*) are required.</p>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingProj(null);
                        setProjTitle('');
                        setProjStats('');
                        setProjClient('');
                        setProjDate('');
                        setProjImage('');
                        setProjVideo('');
                        setProjDesc('');
                        setProjContent('');
                        setProjTags('');
                        setIsAddingProj(false);
                      }}
                      className="px-4 py-2 text-slate-500 hover:text-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase rounded-xl"
                    >
                      Close Form
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20"
                    >
                      {editingProj ? 'Apply Changes' : 'Publish Case Study'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Projects Registry Directory Table list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-white dark:bg-slate-950 px-5 py-3 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">// Active Works Catalog</span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Total Record Count: {adminProjects.length}</span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-white dark:bg-slate-950 text-[10px] font-black uppercase text-slate-400 border-b border-slate-150 dark:border-slate-800">
                  <th className="py-3 px-5">Preview</th>
                  <th className="py-3 px-4">Project Title & Metadata</th>
                  <th className="py-3 px-4">Category & Client</th>
                  <th className="py-3 px-4">Performance Indicator</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                {adminProjects.map((proj: any) => (
                  <tr key={proj.id} className="hover:bg-white dark:hover:bg-slate-850/50 transition-colors">
                    {/* Visual Asset Preview (Image or Video indicator) */}
                    <td className="py-4 px-5">
                      <div className="relative w-16 h-10 rounded-xl overflow-hidden bg-white border border-slate-200/60 dark:border-slate-800">
                        {proj.image ? (
                          <img 
                            src={proj.image} 
                            alt={proj.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] bg-slate-200 text-slate-400">
                            No Image
                          </div>
                        )}
                        {proj.video && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Video size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title and date brief */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-left">
                        <span className="text-slate-900 dark:text-white uppercase font-serif text-xs block">{proj.title}</span>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-light font-mono uppercase">
                          <span>ID: {proj.id}</span>
                          <span>•</span>
                          <span>Done in: {proj.date || 'June 2026'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category and Client */}
                    <td className="py-4 px-4 text-left">
                      <div className="space-y-0.5">
                        <span className="text-indigo-500 font-mono text-[10px] uppercase block">{proj.category}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">{proj.client || 'Garki Enterprise Node'}</span>
                      </div>
                    </td>

                    {/* Performance Indicator */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[10px] font-mono rounded-lg border border-emerald-500/20">
                        {proj.stats}
                      </span>
                    </td>

                    {/* Actions button (Edit / Delete) */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            // Populate states and focus editor
                            setEditingProj(proj);
                            setProjTitle(proj.title);
                            setProjCat(proj.category);
                            setProjStats(proj.stats || '');
                            setProjClient(proj.client || 'Garki Enterprise Node');
                            setProjDate(proj.date || 'June 2026');
                            setProjImage(proj.image || '');
                            setProjVideo(proj.video || '');
                            setProjDesc(proj.description || '');
                            setProjContent(proj.content || '');
                            setProjTags(proj.tags ? proj.tags.join(', ') : '');
                            setIsAddingProj(false); // Make sure regular state doesn't conflict
                            window.scrollTo({ top: 150, behavior: 'smooth' });
                          }}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors border border-indigo-100"
                          title="Edit Case Study Details"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if(window.confirm(`Are you sure you want to permanently delete project study "${proj.title}"?`)) {
                              setAdminProjects(adminProjects.filter((p: any) => p.id !== proj.id));
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
                          title="Delete Case Study"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= BLOG MODULE ================= */}
      {adminModule === 'blog' && (
        <div className="space-y-8 animate-fade-in text-left">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-extrabold uppercase font-serif text-[#000E32]">Insights Blog Engine</h2>
              <p className="text-slate-400 text-[10px] font-light">Draft, write, and index strategic analytical guides on compliance, code, and sales.</p>
            </div>
            <button
              onClick={() => setIsAddingBlog(!isAddingBlog)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/10"
            >
              {isAddingBlog ? 'Close Editor' : 'Write New Article'}
            </button>
          </div>

          {isAddingBlog && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if(!blogTitle || !blogDesc) return;
                const newPost = {
                  id: "blog_" + Math.random().toString(36).substring(2, 6),
                  title: blogTitle,
                  category: blogCat,
                  date: "June 25, 2026",
                  author: "Executive Editor",
                  readTime: "5 min read",
                  description: blogDesc,
                  content: blogDesc,
                  image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop&q=60",
                  tags: ["Compliance", "SaaS"]
                };
                setAdminBlogs([newPost, ...adminBlogs]);
                setIsAddingBlog(false);
                setBlogTitle('');
                setBlogDesc('');
              }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
            >
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Article Title</label>
                <input type="text" required value={blogTitle} onChange={e=>setBlogTitle(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="e.g. Navigating SCUML compliance thresholds" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category Node</label>
                <select value={blogCat} onChange={e=>setBlogCat(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl">
                  <option value="Marketing">Marketing</option>
                  <option value="Business Growth">Business Growth</option>
                  <option value="AI">AI</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Article body markup</label>
                <textarea required rows={5} value={blogDesc} onChange={e=>setBlogDesc(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl resize-none font-sans" placeholder="Type the informational article content here..." />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="px-5 py-2 bg-[#000E32] text-white text-xs font-black uppercase tracking-wider rounded-xl">Publish Article Node</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-white text-[10px] font-black uppercase text-slate-400 border-b border-slate-150">
                  <th className="py-3 px-5">Article Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {adminBlogs.map((post: any) => (
                  <tr key={post.id} className="hover:bg-white">
                    <td className="py-4 px-5">
                      <div className="space-y-0.5 text-left">
                        <span className="text-slate-900 uppercase font-serif text-xs block">{post.title}</span>
                        <span className="text-[10px] text-slate-400 font-light block font-mono">{post.date} • {post.readTime}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-indigo-500 font-mono text-[10px] uppercase">{post.category}</td>
                    <td className="py-4 px-4 text-slate-500">{post.author}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => {
                          if(window.confirm('Purge article?')) {
                            setAdminBlogs(adminBlogs.filter((b: any) => b.id !== post.id));
                          }
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TRAINING MODULE ================= */}
      {adminModule === 'training' && (
        <div className="space-y-8 animate-fade-in text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Courses summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase font-serif text-[#000E32] border-b border-slate-100 pb-2">Vocational Courses</h3>
              <div className="space-y-3">
                {adminCourses.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-slate-100/50">
                    <div className="text-left space-y-0.5">
                      <span className="font-extrabold uppercase font-serif text-slate-900 text-[11px] block">{c.title}</span>
                      <span className="text-[10px] text-slate-400 block font-bold">Duration: {c.duration} • level: {c.level}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-orange-600">{c.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate registry verification */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase font-serif text-[#000E32] border-b border-slate-100 pb-2">Active Student Registry</h3>
              <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                <div className="flex justify-between p-3 border-b border-slate-100/60">
                  <span>David Alao (React Student)</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px]">100% Score (Issued)</span>
                </div>
                <div className="flex justify-between p-3 border-b border-slate-100/60">
                  <span>Amara Nwosu (Marketing Student)</span>
                  <span className="text-indigo-500 font-bold uppercase text-[10px]">L3 Lecture Running</span>
                </div>
                <div className="flex justify-between p-3 border-b border-slate-100/60">
                  <span>Tunde Olanrewaju (TypeScript Student)</span>
                  <span className="text-orange-500 font-bold uppercase text-[10px]">L1 Registration Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CLIENTS CRM MODULE ================= */}
      {adminModule === 'clients' && (
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Active client projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase font-serif text-[#000E32] border-b border-slate-100 pb-2">Client Invoices ledger</h3>
              <div className="space-y-3">
                {adminInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-slate-150">
                    <div className="text-left space-y-0.5">
                      <span className="font-extrabold text-slate-900 font-serif block uppercase text-[11px]">{inv.number}</span>
                      <span className="text-[10px] text-slate-400 font-bold block">{inv.project}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-800 font-black">{inv.amount}</span>
                      <button
                        onClick={() => {
                          setAdminInvoices(adminInvoices.map((i: any) => i.id === inv.id ? { ...i, status: i.status === 'paid' ? 'unpaid' : 'paid' } : i));
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-colors ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {inv.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support ticket chat center */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase font-serif text-[#000E32] border-b border-slate-100 pb-2">Support ticket dispatch console</h3>
              <div className="space-y-3">
                {adminTickets.map((tkt: any) => (
                  <div key={tkt.id} className="p-3.5 bg-white rounded-2xl border border-slate-150 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-900 font-serif uppercase text-[11px] block">{tkt.subject}</span>
                      <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase">{tkt.status}</span>
                    </div>
                    <p className="text-slate-500 text-[10px] leading-relaxed font-light">{tkt.lastMessage}</p>
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => {
                          const reply = window.prompt("Type your reply to coordinate support:");
                          if (reply) {
                            setAdminTickets(adminTickets.map((t: any) => t.id === tkt.id ? { ...t, lastMessage: reply, status: "answered" } : t));
                            alert("Client representative notified via secure mail pipeline.");
                          }
                        }}
                        className="px-2.5 py-1 bg-[#000E32] text-white text-[9px] font-black uppercase rounded-lg"
                      >
                        Reply Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ANALYTICS MODULE ================= */}
      {adminModule === 'analytics' && (
        <div className="space-y-8 animate-fade-in text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Average Monthly Visitors</span>
              <span className="text-2xl font-serif font-black text-[#000E32]">14,240</span>
              <span className="text-[10px] text-emerald-500 block font-bold">+18% vs last month</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">WhatsApp Lead Conversion</span>
              <span className="text-2xl font-serif font-black text-[#000E32]">4.8% CTR</span>
              <span className="text-[10px] text-emerald-500 block font-bold">Avg ₦450 per lead click</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Monthly Recurring Revenue (MRR)</span>
              <span className="text-2xl font-serif font-black text-orange-600">₦4,850,000</span>
              <span className="text-[10px] text-slate-400 block font-light">From 12 retainer corporate clients</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase font-serif text-[#000E32] border-b border-slate-100 pb-2">Regional Visitor Demographics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-white border border-slate-150 rounded-2xl">
                <span className="text-xs font-serif font-black text-slate-900 block">Abuja (FCT)</span>
                <span className="text-lg font-mono text-indigo-500 font-extrabold block">42%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Primary Hub</span>
              </div>
              <div className="p-4 bg-white border border-slate-150 rounded-2xl">
                <span className="text-xs font-serif font-black text-slate-900 block">Lagos (State)</span>
                <span className="text-lg font-mono text-orange-500 font-extrabold block">35%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Secondary Hub</span>
              </div>
              <div className="p-4 bg-white border border-slate-150 rounded-2xl">
                <span className="text-xs font-serif font-black text-slate-900 block">Port Harcourt</span>
                <span className="text-lg font-mono text-slate-600 font-extrabold block">15%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Active Node</span>
              </div>
              <div className="p-4 bg-white border border-slate-150 rounded-2xl">
                <span className="text-xs font-serif font-black text-slate-900 block">Accra / Remote</span>
                <span className="text-lg font-mono text-slate-600 font-extrabold block">8%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">West-Africa outreach</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFICATIONS MODULE: SECURE QR & R2 CLOUD VAULT ================= */}
      {adminModule === 'notifications' && (
        <div className="space-y-6 animate-fade-in text-left text-xs">
          
          {/* 1. Real-Time Multi-Screen Sync Status Banner */}
          <div className="bg-gradient-to-r from-[#000E32] to-indigo-950 p-6 rounded-3xl border border-blue-900/30 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Cloudflare Durable Objects Sync Node Online
                  </span>
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-wide">
                  Real-Time Multi-Screen Synchronization
                </h3>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Active connection to Hassan Super Admin live websocket/SSE channel is established. Whenever an applicant badge or file is scanned on a mobile smartphone, it will instantly load and display on this desktop screen without refreshing.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider text-[10px] rounded-xl shadow-lg shadow-orange-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <QrCode size={12} />
                  Scan QR Badge
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    // Inject a mock scan in real time to test SSE broadcast loop
                    try {
                      const demoUid = 'seed-hassan-demo';
                      const res = await fetch('/api/scan-history', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          applicantId: demoUid,
                          applicantName: 'David Alao Chibuzor (Simulated Phone)',
                          safetyStatus: 'safe',
                          qrImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                        })
                      });
                      if (res.ok) {
                        setShowAdminNotification("📲 Simulating mobile QR Scan event. Dispatched to SSE channel!");
                        setTimeout(() => setShowAdminNotification(null), 3500);
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold uppercase tracking-wider text-[10px] rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  Simulate Phone Scan
                </button>
              </div>
            </div>
          </div>

          {/* 2. Security & Cost Shield Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#000E32]">
                <Database size={16} className="text-orange-500" />
                <span className="font-extrabold text-[10px] uppercase tracking-wider">Cloudflare D1 Storage</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Relational scan history and executive summaries are persisted in D1 (Binding: <code className="bg-white px-1 py-0.5 rounded font-mono text-[9px]">DB</code>). All entries are scoped by a unique User ID hash for compliance.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#000E32]">
                <Layers size={16} className="text-[#000E32]" />
                <span className="font-extrabold text-[10px] uppercase tracking-wider">Secure R2 Object Bucket</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Compressed QR badges are securely stored inside R2 storage (Binding: <code className="bg-white px-1 py-0.5 rounded font-mono text-[9px]">BUCKET</code>). Time-expiring Signed URLs protect image downloads.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#000E32]">
                <ShieldAlert size={16} className="text-amber-500" />
                <span className="font-extrabold text-[10px] uppercase tracking-wider">AI Fraud Shield Enabled</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Gemini 1.5 analyzes and pre-screens scanned URL payloads for phishing before opening. Rate-limiter (max 60 req/min) protects API keys.
              </p>
            </div>

          </div>

          {/* 3. Scan Log & Cloud Vault Entries */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left">
            
            <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-[#000E32] uppercase tracking-wider text-[11px]">
                  Secure QR Scan Logs & Vault Registry
                </h4>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  D1 relational scanning telemetry and R2 bucket image signatures.
                </p>
              </div>

              {/* Data Export Tools */}
              <div className="flex items-center gap-2">
                <a
                  href="/api/export/csv"
                  download
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-1"
                >
                  <Download size={12} />
                  Export CSV Logs
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-[#000E32] hover:bg-[#000D28] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={12} />
                  Print Vault Report
                </button>
              </div>
            </div>

            {scanHistoryLoading ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <RefreshCw size={24} className="animate-spin text-slate-400 mx-auto" />
                <p className="font-mono text-[11px]">Querying Cloudflare D1 databases...</p>
              </div>
            ) : scanHistory.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <QrCode size={36} className="text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-700 uppercase tracking-wide">No Badges Scanned Yet</p>
                  <p className="text-slate-450 text-[10px] max-w-sm mx-auto">
                    Scanning active QR application badges from mobile devices will log telemetry details and cache compressed images here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[9px] tracking-wider">
                      <th className="px-5 py-3">Scan Log ID</th>
                      <th className="px-5 py-3">Timestamp (UTC)</th>
                      <th className="px-5 py-3">Applicant Name</th>
                      <th className="px-5 py-3 text-center">R2 Image Payload</th>
                      <th className="px-5 py-3">Safety Pre-screen</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scanHistory.map((row) => (
                      <tr key={row.id} className="hover:bg-white transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-500">
                          {row.id}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-[10px]">
                          {new Date(row.scanned_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-extrabold text-slate-900 block">{row.applicant_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{row.applicant_id}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <a
                            href={row.secure_r2_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-mono text-[9px] font-bold rounded-lg border border-slate-200 transition-colors"
                          >
                            <Download size={10} />
                            Get Signed QR
                          </a>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            row.safety_status === 'safe'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'
                              : 'bg-rose-100 text-rose-800 border border-rose-200/50'
                          }`}>
                            {row.safety_status === 'safe' ? 'Verified Safe' : 'Warning Alert'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onViewApplicant(row.applicant_id)}
                            className="px-2.5 py-1 bg-[#000E32] hover:bg-[#000E32]/90 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            View File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {adminModule === 'emails' && (
        <BrevoEmailDashboard />
      )}

      {adminModule === 'chat' && (
        <AdminChatCenter />
      )}

      {/* Dynamic QR Code scanner modal */}
      <ApplicationQRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onNavigateToApplication={onViewApplicant}
      />

      {/* Interactive copyable high-motion Cloudflare D1 SQL Schema Modal */}
      <AnimatePresence>
        {showSQLSchemaModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 no-print"
          >
            {/* Modal Body with Spring Slide Animation */}
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 160 }}
              className="relative bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Decorative side glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm z-10 space-y-3 sm:space-y-4">
                {/* Actions Row */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setShowSQLSchemaModal(false)}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider active:scale-95 cursor-pointer"
                    title="Back to Admin Dashboard"
                  >
                    <ArrowLeft size={14} className="stroke-[2.5px]" />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Copy Button */}
                    <button
                      onClick={handleCopySQL}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                        copiedSQL 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500 scale-105' 
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 active:scale-95'
                      }`}
                    >
                      {copiedSQL ? (
                        <>
                          <Check size={13} className="stroke-[3px]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Schema</span>
                        </>
                      )}
                    </button>

                    {/* Direct Download Button */}
                    <button
                      onClick={handleExportSQLSchema}
                      className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider items-center gap-2 border border-emerald-500/30 transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
                    >
                      <Download size={13} />
                      <span>Download Script</span>
                    </button>

                    {/* Close button */}
                    <button
                      onClick={() => setShowSQLSchemaModal(false)}
                      className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all border border-slate-750 active:scale-90"
                      title="Close"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Title and Info Row */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
                    <Database size={18} className="animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 flex flex-wrap items-center gap-2 leading-tight">
                      <span>Cloudflare D1 SQL Schema</span>
                      <span className="text-[8px] sm:text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-black">
                        SQLite / D1 Ready
                      </span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Fully relational schema & seed scripts populated with current catalog settings
                    </p>
                  </div>
                </div>
              </div>

              {/* Prominent Cloudflare D1 Console Notice & Guidelines */}
              <div className="mx-6 my-4 p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl flex flex-col sm:flex-row items-start gap-3 text-rose-200">
                <ShieldAlert size={20} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-300">
                    ⚠️ CRITICAL CLOUDFLARE CONSOLE RULE
                  </h4>
                  <p className="text-[10px] leading-relaxed text-rose-200/90">
                    Do <strong>NOT</strong> paste terminal shell commands (like <code className="bg-rose-950 px-1.5 py-0.5 rounded border border-rose-900/60 font-mono text-[9px] text-rose-300 font-bold">npx wrangler ...</code>) into Cloudflare's web SQL Console! Doing so causes syntax errors.
                  </p>
                  <p className="text-[10px] leading-relaxed text-rose-300/90">
                    <strong>To use the Cloudflare Website Console:</strong> Click the <strong className="text-white bg-slate-800 px-1 py-0.5 rounded border border-slate-700">Copy Schema</strong> button on the right to copy the <strong>pure SQL script</strong>. Go to your Cloudflare Dashboard &rarr; <strong>D1 Databases</strong> &rarr; select your database &rarr; click <strong>"Console"</strong>, paste the copied SQL text directly, and click <strong>Execute</strong>.
                  </p>
                </div>
              </div>

              {/* Alert Note Panel */}
              <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-850 text-[11px] text-slate-400 flex items-center gap-2.5">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  <strong>Tip:</strong> If you prefer local PC terminal deployment, save this schema into a local file named <code className="bg-slate-900 py-0.5 px-1 rounded text-cyan-300 font-mono text-[10px]">schema.sql</code> and execute: <code className="bg-slate-900 py-0.5 px-1.5 rounded border border-slate-800 font-mono text-[10px] text-cyan-300">npx wrangler d1 execute YOUR_DB_NAME --remote --file=schema.sql</code>.
                </span>
              </div>

              {/* Interactive Code Code-Box Viewport */}
              <div className="sql-code-box flex-1 overflow-hidden p-6 bg-slate-950 flex flex-col relative">
                {/* Back Navigation Button (Top Left of Code Box Container) */}
                <button
                  onClick={() => setShowSQLSchemaModal(false)}
                  className="absolute left-6 top-6 z-30 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl transition-all border border-slate-800 hover:border-slate-700 flex items-center gap-2 text-xs font-bold uppercase tracking-wider active:scale-95 cursor-pointer shadow-lg shadow-black/40"
                  title="Back to Admin Dashboard"
                >
                  <ArrowLeft size={13} className="stroke-[2.5px]" />
                  <span>Back</span>
                </button>

                {/* Micro instructions overlay */}
                <div className="absolute right-8 top-8 opacity-40 hover:opacity-100 transition-opacity z-20 pointer-events-none select-none">
                  <div className="bg-slate-900 border border-slate-800 text-[10px] font-mono py-1 px-2.5 rounded-lg text-slate-400">
                    ESC to close • Ctrl+A to select all
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-xl border border-slate-850/60 bg-slate-900 p-4 pt-16 relative scrollbar-thin max-h-full">
                  <pre className="font-mono text-[11px] leading-relaxed select-text">
                    <code>
                      {sqlCode.split('\n').map((line, idx) => (
                        <div key={idx} className="flex hover:bg-slate-800/40 py-0.5 px-1 rounded transition-colors group">
                          <span className="w-10 text-right pr-4 text-slate-600 select-none font-mono text-[10px] border-r border-slate-800 mr-4 group-hover:text-slate-400">
                            {idx + 1}
                          </span>
                          <span className="text-slate-200 whitespace-pre font-mono text-[11px]">
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>SQLite Dialect • Auto-increment Primary Keys compatible</span>
                <span>Generated via Hassan Al-Amin Super Admin Engine v2.2</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive copyable high-motion Cloudflare D1 Deployment Guide Modal */}
      <AnimatePresence>
        {showDeploymentGuideModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 print:absolute print:inset-0 print:bg-white print:text-black print:z-0 print:p-0"
          >
            {/* Modal Body with Spring Slide Animation */}
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 160 }}
              className="relative bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-5xl h-[94vh] flex flex-col shadow-2xl overflow-hidden print:hidden"
            >
              {/* Decorative side glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  {/* Distinct, clearly labeled Back Button for mobile / desktop navigation */}
                  <button
                    onClick={() => setShowDeploymentGuideModal(false)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider active:scale-95 cursor-pointer mr-2"
                    title="Back to Admin Dashboard"
                  >
                    <ArrowLeft size={14} className="stroke-[2.5px]" />
                    <span>Back</span>
                  </button>

                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 hidden sm:block">
                    <GraduationCap size={20} className="animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-100 flex items-center gap-2">
                      Deployment & D1 Sync Masterclass
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-black hidden md:inline-block">
                        Class Dialogue Guide
                      </span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      An interactive masterclass on Cloudflare D1 integration, ZIP uploads, and real-time synchronization
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Print / Save PDF Button */}
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/20 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span className="hidden xs:inline">Save PDF</span>
                  </button>

                  {/* Close button icon fallback */}
                  <button
                    onClick={() => setShowDeploymentGuideModal(false)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all border border-slate-750 active:scale-90"
                    title="Close Guide"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Dynamic Responsive viewport container */}
              <div 
                ref={paperParentRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 bg-slate-950/70 flex flex-col items-center justify-start scrollbar-thin"
              >
                {isMobileView ? (
                  /* Mobile Fully Screen Responsive Card */
                  <div 
                    className="paper-container w-full h-full p-5 select-text flex flex-col justify-between"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Watermark in background */}
                    <div className="absolute right-4 bottom-4 opacity-[0.03] select-none pointer-events-none">
                      <Database size={180} className="text-slate-900" />
                    </div>

                    {/* Top Slide Metadata */}
                    <div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-2 z-10 text-slate-900 select-none flex-shrink-0">
                      <div className="text-left">
                        <span className="text-[8px] font-mono tracking-widest text-amber-600 uppercase font-black block">
                          {guideSlides[guidePage].subtitle}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                          {guideSlides[guidePage].title}
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Page {guidePage + 1}/{guideSlides.length}
                      </span>
                    </div>

                    {/* Slide Content with Exit/Entry Animations */}
                    <div className="flex-1 flex flex-col justify-start py-1 z-10 overflow-y-auto text-left text-[#0f172a] min-h-0 scrollbar-thin">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={guidePage}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.2 }}
                          className="h-full flex flex-col justify-start text-[#0f172a]"
                        >
                          {guideSlides[guidePage].content}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Navigation controls at bottom of paper */}
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-200/80 z-10 select-none flex-shrink-0">
                      <button
                        onClick={() => setGuidePage(prev => Math.max(0, prev - 1))}
                        disabled={guidePage === 0}
                        className="px-2.5 py-1.5 bg-white hover:bg-white disabled:opacity-35 text-slate-700 disabled:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 transition-all border border-slate-200 active:scale-95 cursor-pointer disabled:pointer-events-none"
                      >
                        <ChevronLeft size={12} className="stroke-[3px]" />
                        <span>Prev</span>
                      </button>

                      {/* Stepper dots */}
                      <div className="flex items-center gap-1">
                        {guideSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setGuidePage(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              guidePage === idx 
                                ? 'w-4 bg-amber-600' 
                                : 'w-1.5 bg-slate-200'
                            }`}
                            title={`Page ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setGuidePage(prev => Math.min(guideSlides.length - 1, prev + 1))}
                        disabled={guidePage === guideSlides.length - 1}
                        className="px-2.5 py-1.5 bg-white hover:bg-white disabled:opacity-35 text-slate-700 disabled:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 transition-all border border-slate-200 active:scale-95 cursor-pointer disabled:pointer-events-none"
                      >
                        <span>Next</span>
                        <ChevronRight size={12} className="stroke-[3px]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Desktop / Tablet A4 View with dynamic scaling */
                  <div 
                    style={{
                      width: `${210 * paperScale}mm`,
                      height: `${297 * paperScale}mm`,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      transition: 'all 0.1s ease-out',
                    }}
                    className="relative flex-shrink-0"
                  >
                    <div 
                      className="paper-container p-6 sm:p-10 select-text"
                      style={{
                        transform: `scale(${paperScale})`,
                        transformOrigin: 'top center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {/* Watermark in background */}
                      <div className="absolute right-6 bottom-6 opacity-[0.03] select-none pointer-events-none">
                        <Database size={240} className="text-slate-900" />
                      </div>

                      {/* Top Slide Metadata */}
                      <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3 z-10 text-slate-900 select-none">
                        <div className="text-left">
                          <span className="text-[9px] font-mono tracking-widest text-amber-600 uppercase font-black block">
                            {guideSlides[guidePage].subtitle}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                            {guideSlides[guidePage].title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                          Page {guidePage + 1} of {guideSlides.length}
                        </span>
                      </div>

                      {/* Slide Content with Exit/Entry Animations */}
                      <div className="flex-1 flex flex-col justify-start py-2 z-10 overflow-hidden text-left text-[#0f172a]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={guidePage}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col justify-start text-[#0f172a]"
                          >
                            {guideSlides[guidePage].content}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Navigation controls at bottom of paper */}
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200/80 z-10 select-none">
                        <button
                          onClick={() => setGuidePage(prev => Math.max(0, prev - 1))}
                          disabled={guidePage === 0}
                          className="px-3.5 py-2 bg-white hover:bg-white disabled:opacity-30 text-slate-700 disabled:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all border border-slate-200 active:scale-95 cursor-pointer disabled:pointer-events-none"
                        >
                          <ChevronLeft size={13} className="stroke-[3px]" />
                          <span>Previous</span>
                        </button>

                        {/* Stepper dots */}
                        <div className="flex items-center gap-1.5">
                          {guideSlides.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setGuidePage(idx)}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                guidePage === idx 
                                  ? 'w-5 bg-amber-600' 
                                  : 'w-2 bg-slate-200 hover:bg-slate-350'
                              }`}
                              title={`Page ${idx + 1}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => setGuidePage(prev => Math.min(guideSlides.length - 1, prev + 1))}
                          disabled={guidePage === guideSlides.length - 1}
                          className="px-3.5 py-2 bg-white hover:bg-white disabled:opacity-30 text-slate-700 disabled:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all border border-slate-200 active:scale-95 cursor-pointer disabled:pointer-events-none"
                        >
                          <span>Next</span>
                          <ChevronRight size={13} className="stroke-[3px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Interactive A4 responsive class workbook</span>
                <span>© 2026 Hassan Al-Amin Super Admin Academy v2.2</span>
              </div>
            </motion.div>

            {/* Print-only beautifully formatted book content for PDF download */}
            <div className="hidden print:block bg-white text-slate-900 p-8 font-serif leading-relaxed max-w-3xl mx-auto w-full">
              <div className="text-center mb-10 border-b-2 border-slate-950 pb-6">
                <p className="text-xs uppercase tracking-widest font-mono text-slate-500">Hassan Al-Amin Academy</p>
                <h1 className="text-3xl font-bold mt-2 text-slate-950">Cloudflare D1 & Site Deployment Masterclass</h1>
                <p className="text-sm italic text-slate-700 mt-1">A dialogue guide on database persistence & multi-device sync</p>
                <div className="flex justify-center gap-6 text-xs font-mono mt-4 text-slate-500">
                  <span>Teacher: Professor Al-Amin</span>
                  <span>Student: Kofi</span>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-lg font-bold border-b border-slate-300 pb-1 mb-3">Module 1: Creating & Initializing the Cloudflare D1 Database</h2>
                  <p className="mb-2"><strong>Professor Al-Amin:</strong> Welcome, Kofi! Today, we're making our local catalogs live worldwide. First, we need a Cloudflare D1 Database. D1 is SQLite run at the edge, offering near-zero latency and high durability. Go to your Cloudflare Dashboard, select D1 on the sidebar, and click "Create database". Name it <code className="font-mono bg-white px-1 py-0.5 rounded text-slate-850">hassan-portal-db</code>.</p>
                  <p className="mb-4"><strong>Kofi (Student):</strong> Understood, Professor! Once it's created, I get a unique Database ID. But how do we load all our tables, services, portfolios, and courses into it? Do we write them manually?</p>
                  <p className="mb-2"><strong>Professor Al-Amin:</strong> No, Kofi! We use the SQL schema script we just generated in our Admin Dashboard! You can click "Export SQL Schema (D1)" in this utility menu to download the file. Then, use Wrangler CLI to execute it locally or in production:</p>
                  <pre className="bg-white border border-slate-300 p-3 rounded font-mono text-xs text-slate-850 my-3">
{`# For Local Sandbox testing:
npx wrangler d1 execute hassan-portal-db --local --file=schema.sql

# For Production Deployment in the Cloud:
npx wrangler d1 execute hassan-portal-db --remote --file=schema.sql`}
                  </pre>
                </section>

                <section>
                  <h2 className="text-lg font-bold border-b border-slate-300 pb-1 mb-3">Module 2: Deploying the Web Client as a ZIP File</h2>
                  <p className="mb-2"><strong>Kofi (Student):</strong> That's incredibly elegant, Professor! Our database is now live. But what about the frontend application itself? How do we export it from AI Studio and host it so anyone can load it?</p>
                  <p className="mb-2"><strong>Professor Al-Amin:</strong> An excellent question! We export our code as a ZIP archive. Go to the top settings wheel or export options in Google AI Studio, select "Export as ZIP", and save it. Then, unzip the archive on your local computer. Open your terminal in that folder and run <code className="font-mono bg-white px-1 py-0.5 rounded text-slate-850">npm install</code>. Build the optimized static files using <code className="font-mono bg-white px-1 py-0.5 rounded text-slate-850">npm run build</code>. This generates a production-ready <code className="font-mono bg-white px-1 py-0.5 rounded text-slate-850">dist/</code> directory.</p>
                  <p className="mb-4"><strong>Professor Al-Amin:</strong> Go to the Cloudflare Pages section, click "Create direct upload project", and simply drag and drop your <code className="font-mono bg-white px-1 py-0.5 rounded text-slate-850">dist/</code> folder!</p>
                  <p className="mb-2"><strong>Kofi (Student):</strong> Wow! That hosts our web assets on Cloudflare's ultra-fast Edge server network. It will load instantly in any country on browsers and mobile devices alike!</p>
                </section>

                <section>
                  <h2 className="text-lg font-bold border-b border-slate-300 pb-1 mb-3">Module 3: Real-Time Multi-Device Synchronization</h2>
                  <p className="mb-2"><strong>Kofi (Student):</strong> Professor, here is the ultimate challenge: when I edit a service on my laptop, how does my phone (which is loading the same URL) reflect that change instantly without manual refresh?</p>
                  <p className="mb-2"><strong>Professor Al-Amin:</strong> Ah! That is where the magic of synchronization protocols comes in. There are three powerful architectures: Long Polling/SSE, Wrangler Live Sync, and Local Storage Sync.</p>
                  <p className="mb-2"><strong>Kofi (Student):</strong> Brilliant! By wiring our API routes to query the remote D1 instance on every state change and dispatching updates via real-time hooks, the databases on our phones and browsers stay in perfect harmony!</p>
                </section>

                <section className="break-before-page">
                  <h2 className="text-lg font-bold border-b border-slate-300 pb-1 mb-3">Module 4: Wrangler configuration (.toml)</h2>
                  <pre className="bg-white border border-slate-300 p-3 rounded font-mono text-xs text-slate-850 my-3">
{`# wrangler.toml
name = "hassan-agency-portal"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "hassan-portal-db"
database_id = "60ce292c-a702-401c-891c-400e80a75828"`}
                  </pre>
                </section>
              </div>
              
              <div className="mt-12 text-center text-xs text-slate-400 border-t pt-4">
                <span>© 2026 Hassan Al-Amin Super Admin Academy • All rights reserved</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <NotificationCenter 
        isOpen={isNotifCenterOpen} 
        onClose={() => setIsNotifCenterOpen(false)} 
        role="admin" 
      />

    </div>
  </div>
</div>
);
};
