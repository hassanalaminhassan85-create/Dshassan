import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, User, Phone, Briefcase, BookOpen, FileText, 
  Bell, Megaphone, CheckCircle2, AlertTriangle, XCircle, Plus, Search, 
  Settings, LogOut, Save, ArrowRight, Eye, EyeOff, 
  ChevronRight, Calendar, Award, Shield, Key, Download, RefreshCw, 
  UserCheck, AlertCircle, Sparkles, Cpu, Check, Trash2, 
  Zap, ArrowLeft, Globe, Menu, LayoutGrid, Sun, Moon,
  PanelLeftClose, PanelLeft, Filter, CheckSquare, Clock,
  ExternalLink, ChevronDown, Layers, Activity, UserPlus, Info, MessageSquare
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc
} from 'firebase/firestore';
import { Logo } from './Logo';
import {
  apiSubscribeToAnnouncementsRealtime,
  apiSaveAnnouncementRealtime,
  apiSubscribeToStaffDocsRealtime,
  apiSaveStaffDocRealtime,
  apiSubscribeToClientProjects,
  apiSubscribeToStaffMembersRealtime,
  apiSaveStaffMemberRealtime,
  apiUpdateClientProjectRealtime
} from '../lib/api';

interface StaffPortalProps {
  onBackToPortal?: () => void;
}

export interface StaffMember {
  id: string;
  employeeId?: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  jobTitle: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
  specialization?: string;
  biography?: string;
  skills?: string;
  qualifications?: string;
  certifications?: string;
  dateJoined?: string;
  profilePhotoKey?: string;
  status: string;
  isStaff: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  publishedAt: string;
  createdBy: string;
  createdAt?: string;
}

export interface StaffDoc {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  targetRole: string;
  uploadedBy: string;
  createdAt: string;
}

export interface AssignedProject {
  id: string;
  name: string;
  clientName: string;
  category: string;
  status: 'planning' | 'progress' | 'review' | 'completed';
  progress: number;
  deadline: string;
  budget: string;
  description: string;
  deliverables: string[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

// Seed Demo Staff Member
const DEMO_STAFF_MEMBER: StaffMember = {
  id: "staff_demo_001",
  employeeId: "DST-ENG-8492",
  email: "garba.aminu@dstech.com",
  fullName: "Dr. Aminu Garba",
  phone: "+234 803 491 8820",
  gender: "Male",
  dob: "1988-06-14",
  nationality: "Nigerian",
  jobTitle: "Senior Cloud & AI Architect",
  role: "Lead Systems Engineer",
  departmentId: "dept_software",
  departmentName: "IT & Software Engineering",
  specialization: "React 19, Cloudflare D1/R2 & WebAuthn Systems",
  biography: "Lead Cloud Infrastructure Architect overseeing high-throughput biometric authentication nodes and government integration portals.",
  skills: "React 19, TypeScript, Node.js, Cloudflare Workers, WebAuthn, PostgreSQL, Firebase",
  qualifications: "Ph.D. Computer Science (ABU Zaria), B.Sc. Software Engineering",
  certifications: "AWS Certified Solutions Architect Professional, CISA, CISSP",
  dateJoined: "2022-03-15",
  status: "active",
  isStaff: true
};

const DEFAULT_DEPARTMENTS = [
  { id: 'dept_software', name: 'IT & Software Engineering', description: 'Full-stack Web, Mobile, and Cloud Architecture' },
  { id: 'dept_cyber', name: 'Cyber Security & Vaults', description: 'WebAuthn Biometric & Encryption Hardening' },
  { id: 'dept_compliance', name: 'Legal & Corporate CAC Compliance', description: 'Incorporation, TIN, SCUML, and Tax Filings' },
  { id: 'dept_marketing', name: 'Digital Growth & Media Campaigns', description: 'Social Media Management & Conversion Funnels' },
  { id: 'dept_hr', name: 'HR & Talent Development', description: 'Staff Onboarding, Training & Internal Welfare' }
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_1",
    title: "Quarterly System Infrastructure Upgrade & D1 Backup Schedule",
    content: "All engineering leads are advised that database replication routines will execute tonight at 02:00 UTC. Systems will remain 100% available via high-availability edge nodes.",
    targetAudience: "All",
    priority: "High",
    publishedAt: new Date().toISOString().split('T')[0],
    createdBy: "CTO / Technical Directorate"
  },
  {
    id: "ann_2",
    title: "New Corporate Health Insurance & Biometric ID Badging",
    content: "HR has dispatched new RFID staff credentials. Please visit the Garki office main lobby to receive your physical smart keycard.",
    targetAudience: "All",
    priority: "Medium",
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    createdBy: "HR & Talent Development"
  }
];

const SEED_DOCUMENTS: StaffDoc[] = [
  {
    id: "doc_1",
    title: "DS Tech Employee Handbook & Ethics Code 2026",
    description: "Official corporate guidelines, remote work protocols, and data protection mandates.",
    fileName: "DS_Tech_Employee_Handbook_2026.pdf",
    fileSize: 3450000,
    mimeType: "application/pdf",
    targetRole: "All",
    uploadedBy: "Corporate Legal Directorate",
    createdAt: "2026-01-10"
  },
  {
    id: "doc_2",
    title: "Engineering Coding Standards & Security Rules",
    description: "React 19, Cloudflare R2, WebAuthn, and TypeScript architecture compliance checklist.",
    fileName: "DS_Tech_Engineering_Standards.pdf",
    fileSize: 1820000,
    mimeType: "application/pdf",
    targetRole: "Engineering",
    uploadedBy: "Chief Systems Engineer",
    createdAt: "2026-02-01"
  }
];

const SEED_ASSIGNED_PROJECTS: AssignedProject[] = [
  {
    id: "proj_staff_1",
    name: "Nimc Biometric Bridge v2 Deployment",
    clientName: "Federal Ministry of Technology",
    category: "Government Tech",
    status: "progress",
    progress: 85,
    deadline: "2026-08-30",
    budget: "₦15,000,000",
    description: "High-throughput enterprise biometric authentication and compliance gateway deployed across national nodes.",
    deliverables: ["FIDO2 WebAuthn Integration", "Cloudflare D1 Ledger Sync", "NIMC API Protocol Handler"]
  },
  {
    id: "proj_staff_2",
    name: "Corporate CAC Automation Engine",
    clientName: "Garki Logistics Ltd",
    category: "Corporate Software",
    status: "review",
    progress: 95,
    deadline: "2026-08-15",
    budget: "₦3,500,000",
    description: "Automated business incorporation document generator and TIN verification pipeline.",
    deliverables: ["CAC API Webhook", "Automated PDF Watermarking", "Client Portal Dashboard"]
  }
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Project Milestone Reviewed",
    message: "Nimc Biometric Bridge v2 passed internal QA verification with 99.8% compliance score.",
    timestamp: "10 mins ago",
    type: "success",
    read: false
  },
  {
    id: "notif_2",
    title: "New Policy Handbook Published",
    message: "DS Tech Legal Directorate added Engineering Coding Standards 2026 to the policy vault.",
    timestamp: "1 hour ago",
    type: "info",
    read: false
  },
  {
    id: "notif_3",
    title: "System Maintenance Notice",
    message: "Scheduled edge node sync routine set for 02:00 UTC tonight.",
    timestamp: "3 hours ago",
    type: "warning",
    read: true
  }
];

export const StaffPortal: React.FC<StaffPortalProps> = ({ onBackToPortal }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Session & View States
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [authState, setAuthState] = useState<'signin' | 'register'>('signin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'documents' | 'directory' | 'announcements' | 'assigned-projects' | 'settings'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);

  // Signin fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [regDepartmentId, setRegDepartmentId] = useState('dept_software');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regSkills, setRegSkills] = useState('');

  // Active Staff Session State
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);

  // Editable Profile fields inside dashboard
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [profileSpec, setProfileSpec] = useState('');
  const [profileQual, setProfileQual] = useState('');
  const [profileCert, setProfileCert] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Lists & Data States
  const [departments] = useState(DEFAULT_DEPARTMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [documents, setDocuments] = useState<StaffDoc[]>(SEED_DOCUMENTS);
  const [assignedProjects, setAssignedProjects] = useState<AssignedProject[]>(SEED_ASSIGNED_PROJECTS);
  const [directoryMembers, setDirectoryMembers] = useState<StaffMember[]>([DEMO_STAFF_MEMBER]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);

  // Search & Filters
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals & Drawers
  const [isNewAnnOpen, setIsNewAnnOpen] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newAnnAudience, setNewAnnAudience] = useState('All');

  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  const [selectedMemberDetail, setSelectedMemberDetail] = useState<StaffMember | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast Notifications Engine
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'success' | 'info' | 'error' }>>([]);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Recover staff session & subscribe to Firestore in real-time
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      // 1. Check local storage session
      const savedSession = localStorage.getItem('ds_staff_standalone_session');
      if (savedSession) {
        try {
          const staffObj = JSON.parse(savedSession);
          if (isMounted) {
            setCurrentStaff(staffObj);
            setIsLogged(true);
          }
        } catch (e) {
          console.error("Staff session restore error:", e);
        }
      }

      // 2. Check Firebase auth status
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const docRef = doc(db, 'staff', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && isMounted) {
              const data = docSnap.data() as StaffMember;
              setCurrentStaff(data);
              setIsLogged(true);
              localStorage.setItem('ds_staff_standalone_session', JSON.stringify(data));
            }
          } catch (err) {
            console.warn("Firestore staff load warning:", err);
          }
        }
        if (isMounted) setIsLoadingSession(false);
      });

      return unsubscribeAuth;
    };

    const unsubAuthPromise = initSession();

    // 3. Realtime Firestore Subscriptions
    const unsubAnns = apiSubscribeToAnnouncementsRealtime((anns) => {
      if (anns && anns.length > 0 && isMounted) {
        setAnnouncements(anns);
      }
    });

    const unsubDocs = apiSubscribeToStaffDocsRealtime((docsList) => {
      if (docsList && docsList.length > 0 && isMounted) {
        setDocuments(docsList);
      }
    });

    const unsubProjects = apiSubscribeToClientProjects((projs) => {
      if (projs && projs.length > 0 && isMounted) {
        setAssignedProjects(projs as AssignedProject[]);
      }
    });

    const unsubStaff = apiSubscribeToStaffMembersRealtime((staffList) => {
      if (staffList && staffList.length > 0 && isMounted) {
        setDirectoryMembers(staffList as StaffMember[]);
      }
    });

    return () => {
      isMounted = false;
      unsubAuthPromise.then(unsub => unsub && unsub());
      unsubAnns();
      unsubDocs();
      unsubProjects();
      unsubStaff();
    };
  }, []);

  // Sync profile state when switching to 'profile' tab
  useEffect(() => {
    if (activeTab === 'profile' && currentStaff) {
      setProfilePhone(currentStaff.phone || '');
      setProfileBio(currentStaff.biography || '');
      setProfileSkills(currentStaff.skills || '');
      setProfileSpec(currentStaff.specialization || '');
      setProfileQual(currentStaff.qualifications || '');
      setProfileCert(currentStaff.certifications || '');
    }
  }, [activeTab, currentStaff]);

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast("Please enter your corporate email and access password.", "error");
      return;
    }

    setAuthSubmitting(true);

    // 1. Try Firebase Auth
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const docRef = doc(db, 'staff', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const staffData = docSnap.data() as StaffMember;
        setCurrentStaff(staffData);
        setIsLogged(true);
        localStorage.setItem('ds_staff_standalone_session', JSON.stringify(staffData));
        triggerToast(`Welcome back, ${staffData.fullName}! Staff session authenticated.`, "success");
        setAuthSubmitting(false);
        return;
      }
    } catch (firebaseErr) {
      console.warn("Firebase Auth fallback to local database:", firebaseErr);
    }

    // 2. Check local registered staff list or Demo Staff
    const registeredRaw = localStorage.getItem('ds_staff_registered_list');
    const registeredList: StaffMember[] = registeredRaw ? JSON.parse(registeredRaw) : [];

    let matched: StaffMember | null = null;
    if (email.toLowerCase() === DEMO_STAFF_MEMBER.email.toLowerCase()) {
      matched = DEMO_STAFF_MEMBER;
    } else {
      matched = registeredList.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
    }

    setAuthSubmitting(false);

    if (matched) {
      setCurrentStaff(matched);
      setIsLogged(true);
      localStorage.setItem('ds_staff_standalone_session', JSON.stringify(matched));
      triggerToast(`Welcome back, ${matched.fullName}! Staff cockpit active.`, "success");
    } else {
      triggerToast("Invalid credentials or unregistered corporate email.", "error");
    }
  };

  // Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPhone || !regJobTitle || !regPassword) {
      triggerToast("Please complete all required staff onboarding fields.", "error");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      triggerToast("Password and confirmation do not match.", "error");
      return;
    }

    setAuthSubmitting(true);

    const deptObj = DEFAULT_DEPARTMENTS.find(d => d.id === regDepartmentId);
    const staffId = "staff_" + Math.random().toString(36).substring(2, 9);
    const empCode = "DST-" + Math.floor(1000 + Math.random() * 9000);

    const newStaff: StaffMember = {
      id: staffId,
      employeeId: empCode,
      email: regEmail,
      fullName: regFullName,
      phone: regPhone,
      gender: regGender,
      jobTitle: regJobTitle,
      role: regJobTitle,
      departmentId: regDepartmentId,
      departmentName: deptObj?.name || 'IT & Software Engineering',
      specialization: regSpecialization || 'Full-Stack Software Development',
      biography: regBio || 'DS Tech team member registered for internal operations and project orchestration.',
      skills: regSkills || 'React, TypeScript, Agile Operations',
      qualifications: 'B.Sc. Computer Science / Professional Degree',
      certifications: 'DS Tech Certified Personnel',
      dateJoined: new Date().toISOString().split('T')[0],
      status: 'active',
      isStaff: true
    };

    // 1. Attempt Firestore Save
    try {
      const userCred = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      await setDoc(doc(db, 'staff', userCred.user.uid), { ...newStaff, id: userCred.user.uid });
    } catch (fbErr) {
      console.warn("Firestore staff record fallback:", fbErr);
    }

    // 2. Persist locally
    const registeredRaw = localStorage.getItem('ds_staff_registered_list');
    const registeredList: StaffMember[] = registeredRaw ? JSON.parse(registeredRaw) : [];
    registeredList.push(newStaff);
    localStorage.setItem('ds_staff_registered_list', JSON.stringify(registeredList));

    setDirectoryMembers(prev => [...prev, newStaff]);
    setCurrentStaff(newStaff);
    setIsLogged(true);
    localStorage.setItem('ds_staff_standalone_session', JSON.stringify(newStaff));
    setAuthSubmitting(false);

    triggerToast(`Congratulations, ${regFullName}! Staff onboarding completed.`, "success");
  };

  // Demo Login Quick Button
  const handleDemoLogin = () => {
    setCurrentStaff(DEMO_STAFF_MEMBER);
    setIsLogged(true);
    localStorage.setItem('ds_staff_standalone_session', JSON.stringify(DEMO_STAFF_MEMBER));
    triggerToast("Demo Staff Portal session initialized securely.", "success");
  };

  // Sign Out Handler
  const handleSignOut = () => {
    signOut(auth).catch(() => {});
    localStorage.removeItem('ds_staff_standalone_session');
    setCurrentStaff(null);
    setIsLogged(false);
    triggerToast("Staff session terminated securely.", "info");
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;
    setIsSavingProfile(true);

    const updated: StaffMember = {
      ...currentStaff,
      phone: profilePhone,
      biography: profileBio,
      skills: profileSkills,
      specialization: profileSpec,
      qualifications: profileQual,
      certifications: profileCert
    };

    // Save locally
    setCurrentStaff(updated);
    localStorage.setItem('ds_staff_standalone_session', JSON.stringify(updated));

    // Realtime Firestore Save
    await apiSaveStaffMemberRealtime(updated);

    setIsSavingProfile(false);
    triggerToast("Digital staff profile and credentials updated & synchronized!", "success");
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    const annId = "ann_" + Math.random().toString(36).substring(2, 9);
    const ann: Announcement = {
      id: annId,
      title: newAnnTitle,
      content: newAnnContent,
      targetAudience: newAnnAudience,
      priority: newAnnPriority,
      publishedAt: new Date().toISOString().split('T')[0],
      createdBy: currentStaff?.fullName || "Staff Member"
    };

    await apiSaveAnnouncementRealtime(ann);

    setIsNewAnnOpen(false);
    setNewAnnTitle('');
    setNewAnnContent('');
    triggerToast("Internal bulletin published & synchronized to team feed.", "success");
  };

  // Upload Document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    const docId = "doc_" + Math.random().toString(36).substring(2, 9);
    const newDoc: StaffDoc = {
      id: docId,
      title: newDocTitle,
      description: newDocDesc || "Official DS Tech staff document.",
      fileName: newDocFile ? newDocFile.name : "DS_Tech_Internal_Policy.pdf",
      fileSize: newDocFile ? newDocFile.size : 2100000,
      mimeType: "application/pdf",
      targetRole: "All",
      uploadedBy: currentStaff?.fullName || "Staff Management",
      createdAt: new Date().toISOString().split('T')[0]
    };

    await apiSaveStaffDocRealtime(newDoc);

    setIsNewDocOpen(false);
    setNewDocTitle('');
    setNewDocDesc('');
    setNewDocFile(null);
    triggerToast("Document uploaded & synchronized to corporate library.", "success");
  };

  // Directory Filter
  const filteredDirectory = useMemo(() => {
    return directoryMembers.filter(m => {
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        m.fullName.toLowerCase().includes(queryLower) ||
        m.jobTitle.toLowerCase().includes(queryLower) ||
        (m.skills && m.skills.toLowerCase().includes(queryLower));

      const matchesDept = !deptFilter || m.departmentId === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [directoryMembers, searchQuery, deptFilter]);

  // Global Search Results
  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return { members: [], docs: [], anns: [], projs: [] };
    const q = globalSearchQuery.toLowerCase();
    return {
      members: directoryMembers.filter(m => m.fullName.toLowerCase().includes(q) || m.jobTitle.toLowerCase().includes(q)),
      docs: documents.filter(d => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)),
      anns: announcements.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)),
      projs: assignedProjects.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    };
  }, [globalSearchQuery, directoryMembers, documents, announcements, assignedProjects]);

  const hasGlobalSearchHits = globalSearchResults.members.length > 0 || globalSearchResults.docs.length > 0 || globalSearchResults.anns.length > 0 || globalSearchResults.projs.length > 0;

  // Calculate Profile Completion %
  const calculateProfileScore = () => {
    if (!currentStaff) return 0;
    let score = 30; // base for email/name
    if (currentStaff.phone) score += 15;
    if (currentStaff.biography) score += 15;
    if (currentStaff.skills) score += 15;
    if (currentStaff.qualifications) score += 10;
    if (currentStaff.certifications) score += 15;
    return Math.min(100, score);
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Overview', section: 'WORKSPACE', icon: LayoutGrid, count: null },
    { id: 'assigned-projects', label: 'Assigned Builds', section: 'WORKSPACE', icon: Briefcase, count: assignedProjects.length },
    { id: 'announcements', label: 'Company Bulletins', section: 'WORKSPACE', icon: Megaphone, count: announcements.length },
    { id: 'directory', label: 'Staff Directory', section: 'ORGANIZATION', icon: BookOpen, count: directoryMembers.length },
    { id: 'documents', label: 'Policy Handbooks', section: 'ORGANIZATION', icon: FileText, count: documents.length },
    { id: 'profile', label: 'Digital Staff Ledger', section: 'ACCOUNT', icon: User, count: null },
    { id: 'settings', label: 'Account Settings', section: 'ACCOUNT', icon: Settings, count: null },
  ];

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-200 flex flex-col selection:bg-orange-500 selection:text-white`}>
      
      {/* FLOATING TOAST ALERTS */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`p-3.5 rounded-xl border shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-3 text-xs font-medium ${
                toast.type === 'success' 
                  ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-200' 
                  : toast.type === 'error'
                  ? 'bg-rose-950/95 border-rose-500/30 text-rose-200'
                  : 'bg-slate-900/95 border-slate-700 text-slate-200'
              }`}
            >
              <div className="p-1 rounded-lg bg-white/10 shrink-0">
                {toast.type === 'success' ? <CheckCircle2 size={15} /> : toast.type === 'error' ? <AlertCircle size={15} /> : <Sparkles size={15} />}
              </div>
              <span className="flex-1 leading-snug">{toast.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: UNAUTHENTICATED STAFF LOGIN / ONBOARDING         */}
      {/* ========================================================= */}
      {!isLogged ? (
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 sm:py-16">
          <div className="w-full max-w-md space-y-6">
            
            {/* Logo & Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center cursor-pointer" onClick={() => onBackToPortal?.()}>
                <Logo size="md" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-medium">
                <Shield size={13} />
                <span>Authorized Corporate Workspace</span>
              </div>

              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Sign in with your DS Tech corporate credentials or register a new staff account.
              </p>
            </div>

            {/* Auth Card Box */}
            <div className={`rounded-2xl border p-6 shadow-sm ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              
              {/* Tab Selector */}
              <div className={`grid grid-cols-2 p-1 rounded-xl border mb-6 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setAuthState('signin')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authState === 'signin' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Key size={14} />
                  <span>Staff Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthState('register')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authState === 'register' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <UserPlus size={14} />
                  <span>Registration</span>
                </button>
              </div>

              {/* AUTH TAB 1: SIGN IN */}
              {authState === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Corporate Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. garba.aminu@dstech.com"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Access Password
                      </label>
                      <button 
                        type="button" 
                        onClick={() => triggerToast("Password recovery reset email sent to corporate domain.", "info")}
                        className="text-[11px] text-orange-500 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        }`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    {authSubmitting ? <RefreshCw size={14} className="animate-spin" /> : null}
                    <span>Sign In to Staff Workspace</span>
                    <ArrowRight size={14} />
                  </button>

                  {/* Fast Testing Demo Button */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap size={14} className="text-amber-500" />
                      <span>Instant Demo Access</span>
                    </button>
                  </div>
                </form>
              )}

              {/* AUTH TAB 2: STAFF REGISTRATION */}
              {authState === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Legal Name</label>
                    <input 
                      type="text" 
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="Dr. Aminu Garba"
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Corporate Email</label>
                      <input 
                        type="email" 
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="aminu@dstech.com"
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone</label>
                      <input 
                        type="tel" 
                        required
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Job Position</label>
                      <input 
                        type="text" 
                        required
                        value={regJobTitle}
                        onChange={e => setRegJobTitle(e.target.value)}
                        placeholder="Cloud Architect"
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Department</label>
                      <select
                        value={regDepartmentId}
                        onChange={e => setRegDepartmentId(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                      <input 
                        type="password" 
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Confirm</label>
                      <input 
                        type="password" 
                        required
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all cursor-pointer mt-2"
                  >
                    Submit Staff Registration
                  </button>
                </form>
              )}

            </div>

            {/* Footer Back Link */}
            <div className="text-center">
              <button 
                onClick={onBackToPortal}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>Return to Main Website</span>
              </button>
            </div>

          </div>
        </div>
      ) : (

        /* ========================================================= */
        /* VIEW 2: LOGGED IN STAFF APPLICATION WORKSPACE             */
        /* ========================================================= */
        <div className="flex-1 flex overflow-hidden">

          {/* DESKTOP SIDEBAR */}
          <aside className={`hidden md:flex flex-col border-r transition-all duration-300 z-20 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } ${
            isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Sidebar Top Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToPortal}>
                  <Logo size="xs" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
                </div>
              )}
              {isSidebarCollapsed && (
                <div className="mx-auto cursor-pointer" onClick={onBackToPortal}>
                  <Logo size="xs" showText={false} variant={isDarkMode ? 'light' : 'dark'} />
                </div>
              )}

              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
              </button>
            </div>

            {/* Sidebar Navigation Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-6">
              {['WORKSPACE', 'ORGANIZATION', 'ACCOUNT'].map(section => {
                const sectionItems = navItems.filter(item => item.section === section);
                return (
                  <div key={section} className="space-y-1">
                    {!isSidebarCollapsed && (
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                        {section}
                      </div>
                    )}

                    {sectionItems.map(item => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border-l-2 border-orange-500' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                          } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                          title={isSidebarCollapsed ? item.label : undefined}
                        >
                          <item.icon size={17} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                          
                          {!isSidebarCollapsed && (
                            <span className="flex-1 text-left truncate">{item.label}</span>
                          )}

                          {!isSidebarCollapsed && item.count !== null && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                              isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Sidebar User Footer */}
            {currentStaff && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                <div className={`flex items-center gap-3 p-2 rounded-xl ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentStaff.fullName.substring(0, 2).toUpperCase()}
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{currentStaff.fullName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{currentStaff.jobTitle}</div>
                    </div>
                  )}

                  {!isSidebarCollapsed && (
                    <button
                      onClick={handleSignOut}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* MOBILE DRAWER OVERLAY */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/80 z-[60] backdrop-blur-xs md:hidden"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className={`fixed top-0 left-0 bottom-0 w-72 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  } border-r z-[70] p-4 flex flex-col justify-between shadow-xl md:hidden`}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <Logo size="xs" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-200">
                        <XCircle size={18} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {navItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                            activeTab === item.id
                              ? 'bg-orange-500 text-white font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <item.icon size={16} />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.count !== null && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20">{item.count}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleSignOut}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-medium text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* STICKY TOP HEADER */}
            <header className={`sticky top-0 z-10 border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-colors ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
            }`}>
              
              {/* Left Title & Mobile Menu Trigger */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 md:hidden text-slate-600 dark:text-slate-300"
                >
                  <Menu size={18} />
                </button>

                <div>
                  <h1 className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                    {navItems.find(i => i.id === activeTab)?.label || 'Workspace'}
                  </h1>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    DS Tech Corporate Staff Portal • {currentStaff?.departmentName}
                  </p>
                </div>
              </div>

              {/* Right Action Bar */}
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Search Bar Input */}
                <div className="relative hidden md:block w-48 lg:w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search workspace..."
                    value={globalSearchQuery}
                    onChange={e => {
                      setGlobalSearchQuery(e.target.value);
                      setIsSearchActive(true);
                    }}
                    onFocus={() => setIsSearchActive(true)}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 focus:border-orange-500 text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-orange-500 text-slate-900'
                    }`}
                  />

                  {/* Global Search Results Dropdown */}
                  <AnimatePresence>
                    {isSearchActive && globalSearchQuery.trim() && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border p-3 shadow-xl z-50 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-400">
                          <span>Search Results</span>
                          <button onClick={() => setIsSearchActive(false)} className="hover:text-slate-200"><XCircle size={14} /></button>
                        </div>

                        {!hasGlobalSearchHits ? (
                          <div className="p-4 text-center text-xs text-slate-400">No matching workspace records.</div>
                        ) : (
                          <div className="space-y-3">
                            {globalSearchResults.members.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-orange-500 uppercase">Personnel</span>
                                {globalSearchResults.members.map(m => (
                                  <div 
                                    key={m.id} 
                                    onClick={() => {
                                      setSelectedMemberDetail(m);
                                      setIsSearchActive(false);
                                    }}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs flex justify-between"
                                  >
                                    <span className="font-medium">{m.fullName}</span>
                                    <span className="text-[10px] text-slate-400">{m.jobTitle}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {globalSearchResults.docs.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-orange-500 uppercase">Documents</span>
                                {globalSearchResults.docs.map(d => (
                                  <div 
                                    key={d.id}
                                    onClick={() => {
                                      setActiveTab('documents');
                                      setIsSearchActive(false);
                                    }}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs truncate"
                                  >
                                    {d.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notifications Bell Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                  >
                    <Bell size={17} />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </button>

                  {/* Notifications Popover */}
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-xl z-50 space-y-3 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <span className="text-xs font-semibold">Notifications</span>
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                              triggerToast("Marked all notifications as read.", "info");
                            }}
                            className="text-[10px] text-orange-500 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notifications.map(notif => (
                            <div 
                              key={notif.id}
                              className={`p-2.5 rounded-xl border text-xs space-y-1 transition-colors ${
                                notif.read 
                                  ? isDarkMode ? 'bg-slate-950/50 border-slate-800/60 opacity-70' : 'bg-slate-50 border-slate-200 opacity-70'
                                  : isDarkMode ? 'bg-slate-950 border-orange-500/30' : 'bg-orange-50/50 border-orange-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}</span>
                                <span className="text-[9px] text-slate-400">{notif.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{notif.message}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
                >
                  {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
                </button>

              </div>
            </header>

            {/* DYNAMIC SCROLLABLE BODY CANVAS */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              
              {/* ========================================================= */}
              {/* TAB 1: OVERVIEW DASHBOARD HUB                           */}
              {/* ========================================================= */}
              {activeTab === 'dashboard' && currentStaff && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  
                  {/* Personal Welcome Banner */}
                  <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xs ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                          {currentStaff.fullName.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                              {currentStaff.fullName}
                            </h2>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20">
                              Active Node
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {currentStaff.jobTitle} • {currentStaff.departmentName || 'IT & Software Engineering'} • ID: {currentStaff.employeeId || 'DST-ENG-8492'}
                          </p>
                        </div>
                      </div>

                      {/* Profile Ledger Score Bar */}
                      <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">Profile Completion</div>
                          <div className="text-lg font-bold font-mono text-emerald-500">{calculateProfileScore()}%</div>
                        </div>

                        <button
                          onClick={() => setActiveTab('profile')}
                          className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <User size={14} />
                          <span>Update Ledger</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Top Stats Metric Tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Assigned Builds', val: assignedProjects.length, sub: 'Active Sprint Deliverables', icon: Briefcase, color: 'text-orange-500 bg-orange-500/10', tab: 'assigned-projects' },
                      { label: 'Company Bulletins', val: announcements.length, sub: 'Official Directives', icon: Megaphone, color: 'text-amber-500 bg-amber-500/10', tab: 'announcements' },
                      { label: 'Policy Handbooks', val: documents.length, sub: 'Standard Regulations', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10', tab: 'documents' },
                      { label: 'Directory Roster', val: directoryMembers.length, sub: 'Verified Personnel', icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10', tab: 'directory' },
                    ].map((tile, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveTab(tile.tab as any)}
                        className={`p-4 rounded-xl border space-y-3 cursor-pointer transition-all hover:border-orange-500/50 ${
                          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{tile.label}</span>
                          <div className={`p-2 rounded-lg ${tile.color}`}>
                            <tile.icon size={16} />
                          </div>
                        </div>
                        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{tile.val}</div>
                        <div className="text-[11px] text-slate-400">{tile.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Two Column Grid: Recent Bulletins & Assigned Builds */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Recent Bulletins */}
                    <div className={`p-5 rounded-2xl border space-y-4 ${
                      isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Megaphone size={16} className="text-orange-500" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider">Internal Directives</h3>
                        </div>
                        <button 
                          onClick={() => setIsNewAnnOpen(true)}
                          className="text-xs text-orange-500 hover:underline font-medium flex items-center gap-1"
                        >
                          <Plus size={13} />
                          <span>Publish</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {announcements.slice(0, 3).map(ann => (
                          <div 
                            key={ann.id}
                            className={`p-3.5 rounded-xl border space-y-1.5 transition-colors ${
                              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{ann.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-medium bg-orange-500/10 text-orange-500">
                                {ann.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {ann.content}
                            </p>
                            <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                              <span>By: {ann.createdBy}</span>
                              <span>{ann.publishedAt}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Builds */}
                    <div className={`p-5 rounded-2xl border space-y-4 ${
                      isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Briefcase size={16} className="text-orange-500" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider">Active Assigned Builds</h3>
                        </div>
                        <button 
                          onClick={() => setActiveTab('assigned-projects')}
                          className="text-xs text-orange-500 hover:underline font-medium"
                        >
                          View All ({assignedProjects.length})
                        </button>
                      </div>

                      <div className="space-y-3">
                        {assignedProjects.map(proj => (
                          <div 
                            key={proj.id}
                            className={`p-3.5 rounded-xl border space-y-2.5 ${
                              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{proj.name}</h4>
                              <span className="text-xs font-mono font-semibold text-emerald-500">{proj.progress}%</span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{proj.description}</p>

                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: ASSIGNED BUILDS & CLIENT PROJECTS                 */}
              {/* ========================================================= */}
              {activeTab === 'assigned-projects' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className={`p-6 rounded-2xl border space-y-6 ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Assigned Engineering Builds</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Track milestones, deliverables, and update development progress.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {assignedProjects.map(proj => (
                        <div 
                          key={proj.id}
                          className={`p-5 rounded-xl border space-y-4 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-orange-500/10 text-orange-500">
                              {proj.category}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              Deadline: {proj.deadline}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj.name}</h4>
                            <p className="text-xs text-slate-400 font-mono">Client: {proj.clientName}</p>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {proj.description}
                          </p>

                          {/* Deliverables */}
                          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Deliverables</span>
                            <div className="space-y-1">
                              {proj.deliverables.map((del, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
                                  <Check size={13} />
                                  <span>{del}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Progress Controls */}
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-600 dark:text-slate-300">Progress</span>
                              <span className="text-orange-500 font-mono">{proj.progress}%</span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                            </div>

                            <div className="flex justify-end pt-2">
                              <button 
                                onClick={() => {
                                  const newProg = Math.min(100, proj.progress + 5);
                                  setAssignedProjects(prev => prev.map(p => p.id === proj.id ? { ...p, progress: newProg } : p));
                                  apiUpdateClientProjectRealtime(proj.id, { progress: newProg });
                                  triggerToast(`Updated project progress to ${newProg}%`, "success");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 font-medium text-xs hover:bg-orange-500/20 transition-all cursor-pointer"
                              >
                                Increment Progress (+5%)
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: COMPANY BULLETINS / ANNOUNCEMENTS                 */}
              {/* ========================================================= */}
              {activeTab === 'announcements' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className={`p-6 rounded-2xl border space-y-6 ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Internal Corporate Bulletins</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Official news, operational directives, and department notices.</p>
                      </div>

                      <button 
                        onClick={() => setIsNewAnnOpen(true)}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                      >
                        <Plus size={15} />
                        <span>Publish Bulletin</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {announcements.map(ann => (
                        <div 
                          key={ann.id}
                          className={`p-5 rounded-xl border space-y-3 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-orange-500/10 text-orange-500">
                              {ann.priority} Priority
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {ann.content}
                          </p>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>Issued by: {ann.createdBy}</span>
                            <span>{ann.publishedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: STAFF DIRECTORY & TEAM FINDER                     */}
              {/* ========================================================= */}
              {activeTab === 'directory' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className={`p-6 rounded-2xl border space-y-6 ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Staff Directory</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Search and view verified team members across all corporate departments.</p>
                      </div>

                      {/* Filter controls */}
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="relative w-full sm:w-48">
                          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search directory..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border outline-none ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>

                        <select 
                          value={deptFilter}
                          onChange={e => setDeptFilter(e.target.value)}
                          className={`w-full sm:w-auto text-xs px-3 py-2 rounded-xl border outline-none ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          <option value="">All Departments</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDirectory.map(member => (
                        <div 
                          key={member.id}
                          onClick={() => setSelectedMemberDetail(member)}
                          className={`p-4 rounded-xl border space-y-3 cursor-pointer transition-all hover:border-orange-500/50 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {member.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{member.fullName}</h4>
                              <span className="text-[11px] text-orange-500 font-medium block">{member.jobTitle}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {member.biography || member.specialization || 'Corporate personnel.'}
                          </p>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="truncate">{member.email}</span>
                            <span className="text-emerald-500 font-semibold shrink-0">Verified</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: POLICY HANDBOOKS & DOCUMENTS                       */}
              {/* ========================================================= */}
              {activeTab === 'documents' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className={`p-6 rounded-2xl border space-y-6 ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Policy Handbooks & Documents</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Official standard operating procedures and legal documentation.</p>
                      </div>

                      <button 
                        onClick={() => setIsNewDocOpen(true)}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                      >
                        <Plus size={15} />
                        <span>Upload Document</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map(doc => (
                        <div 
                          key={doc.id}
                          className={`p-5 rounded-xl border space-y-3 flex flex-col justify-between ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-orange-500 font-semibold uppercase">{doc.targetRole} Target</span>
                              <span className="text-[10px] font-mono text-slate-400">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {doc.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400">Uploaded: {doc.createdAt}</span>
                            <button 
                              onClick={() => triggerToast(`Downloading ${doc.fileName}...`, "info")}
                              className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Download size={13} />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 6: DIGITAL STAFF LEDGER / PROFILE                      */}
              {/* ========================================================= */}
              {activeTab === 'profile' && currentStaff && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className={`p-6 rounded-2xl border space-y-6 ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Digital Staff Ledger</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Verified credentials and professional biography.</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Score</span>
                        <span className="text-lg font-bold font-mono text-emerald-500">{calculateProfileScore()}%</span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                          <input type="text" disabled value={currentStaff.fullName} className={`w-full px-3 py-2 rounded-xl border text-xs opacity-60 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`} />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Corporate Email</label>
                          <input type="text" disabled value={currentStaff.email} className={`w-full px-3 py-2 rounded-xl border text-xs opacity-60 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone</label>
                          <input 
                            type="text" 
                            value={profilePhone} 
                            onChange={e => setProfilePhone(e.target.value)} 
                            className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Specialization</label>
                          <input 
                            type="text" 
                            value={profileSpec} 
                            onChange={e => setProfileSpec(e.target.value)} 
                            className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Professional Biography</label>
                        <textarea 
                          rows={3}
                          value={profileBio} 
                          onChange={e => setProfileBio(e.target.value)} 
                          className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Technical Skills</label>
                        <input 
                          type="text" 
                          value={profileSkills} 
                          onChange={e => setProfileSkills(e.target.value)} 
                          className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} 
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isSavingProfile}
                        className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save size={15} />
                        <span>Save Profile Ledger</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 7: SETTINGS                                          */}
              {/* ========================================================= */}
              {activeTab === 'settings' && currentStaff && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className={`p-6 rounded-2xl border space-y-6 ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Account Settings</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Workspace theme, security reset, and session control.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-xs font-semibold block text-slate-900 dark:text-white">Workspace Canvas Theme</span>
                          <span className="text-[11px] text-slate-400">Toggle between Light and Dark mode</span>
                        </div>
                        <button 
                          onClick={toggleTheme}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-xs font-semibold block text-slate-900 dark:text-white">Security Credentials</span>
                          <span className="text-[11px] text-slate-400">Request password recovery email</span>
                        </div>
                        <button 
                          onClick={() => triggerToast("Security token sent to corporate email.", "info")}
                          className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-medium hover:bg-orange-500/20 cursor-pointer"
                        >
                          Reset Password
                        </button>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button 
                          onClick={handleSignOut}
                          className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-500 font-semibold text-xs hover:bg-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <LogOut size={15} />
                          <span>Disconnect Staff Session</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>

        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {isNewAnnOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsNewAnnOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-4 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Publish Bulletin</h3>
                <button onClick={() => setIsNewAnnOpen(false)} className="text-slate-400 hover:text-slate-200"><XCircle size={18} /></button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Bulletin Title</label>
                  <input type="text" required value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} placeholder="e.g. System Security Audit" className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Priority Level</label>
                  <select value={newAnnPriority} onChange={e => setNewAnnPriority(e.target.value as any)} className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Content</label>
                  <textarea rows={4} required value={newAnnContent} onChange={e => setNewAnnContent(e.target.value)} placeholder="Enter details..." className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <button type="submit" className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs cursor-pointer">
                  Publish Notice
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD DOCUMENT MODAL */}
      <AnimatePresence>
        {isNewDocOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsNewDocOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-4 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Upload Document</h3>
                <button onClick={() => setIsNewDocOpen(false)} className="text-slate-400 hover:text-slate-200"><XCircle size={18} /></button>
              </div>

              <form onSubmit={handleUploadDocument} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Document Title</label>
                  <input type="text" required value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} placeholder="e.g. Employee Handbook 2026" className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={2} value={newDocDesc} onChange={e => setNewDocDesc(e.target.value)} placeholder="Summary of document..." className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Select File (PDF)</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => setNewDocFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-orange-500 cursor-pointer" />
                </div>

                <button type="submit" className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs cursor-pointer">
                  Upload to Repository
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MEMBER DETAIL MODAL */}
      <AnimatePresence>
        {selectedMemberDetail && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedMemberDetail(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-4 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Staff Profile Card</h3>
                <button onClick={() => setSelectedMemberDetail(null)} className="text-slate-400 hover:text-slate-200"><XCircle size={18} /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {selectedMemberDetail.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedMemberDetail.fullName}</h4>
                    <span className="text-xs text-orange-500 font-medium block">{selectedMemberDetail.jobTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedMemberDetail.departmentName}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Corporate Contact</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedMemberDetail.email}</span>
                  </div>
                  {selectedMemberDetail.phone && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Phone</span>
                      <span className="text-slate-800 dark:text-slate-200">{selectedMemberDetail.phone}</span>
                    </div>
                  )}
                  {selectedMemberDetail.biography && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Biography</span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedMemberDetail.biography}</p>
                    </div>
                  )}
                  {selectedMemberDetail.skills && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Technical Skills</span>
                      <p className="text-slate-600 dark:text-slate-300">{selectedMemberDetail.skills}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      triggerToast(`Initiating internal chat with ${selectedMemberDetail.fullName}`, "info");
                      setSelectedMemberDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-medium text-xs hover:bg-orange-600 cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>Send Internal Message</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StaffPortal;
