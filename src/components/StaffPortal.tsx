import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, User, Phone, Briefcase, Building, BookOpen, FileText, 
  Bell, Megaphone, CheckCircle2, AlertTriangle, XCircle, Plus, Search, 
  Settings, LogOut, Edit2, Save, ArrowRight, Clock, Eye, EyeOff, 
  ChevronRight, Calendar, Award, Shield, Key, Download, RefreshCw, 
  UserCheck, AlertCircle, FileSpreadsheet, Send, HelpCircle, Laptop,
  Menu, LayoutGrid, Sun, Moon, Sparkles, Cpu, Layers, Check, Trash2, 
  Sliders, Zap, ArrowLeft, Globe, CreditCard
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
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { Logo } from './Logo';

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
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);

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

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Creation Modals
  const [isNewAnnOpen, setIsNewAnnOpen] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newAnnAudience, setNewAnnAudience] = useState('All');

  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  // Toast Notifications Engine
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'success' | 'info' | 'error' }>>([]);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Recover staff session on mount
  useEffect(() => {
    // 1. Check local storage session
    const savedSession = localStorage.getItem('ds_staff_standalone_session');
    if (savedSession) {
      try {
        const staffObj = JSON.parse(savedSession);
        setCurrentStaff(staffObj);
        setIsLogged(true);
      } catch (e) {
        console.error("Staff session restore error:", e);
      }
    }

    // 2. Check Firebase auth status
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'staff', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as StaffMember;
            setCurrentStaff(data);
            setIsLogged(true);
            localStorage.setItem('ds_staff_standalone_session', JSON.stringify(data));
          }
        } catch (err) {
          console.warn("Firestore staff load warning:", err);
        }
      }
    });

    // 3. Load directory members from storage if available
    const savedRegList = localStorage.getItem('ds_staff_registered_list');
    if (savedRegList) {
      try {
        const parsed: StaffMember[] = JSON.parse(savedRegList);
        setDirectoryMembers([DEMO_STAFF_MEMBER, ...parsed]);
      } catch (e) {}
    }

    return () => unsubscribe();
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
        triggerToast(`Welcome back, ${staffData.fullName}! Session authenticated.`, "success");
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

    // Save to Firebase if uid exists
    try {
      const docRef = doc(db, 'staff', currentStaff.id);
      await updateDoc(docRef, {
        phone: profilePhone,
        biography: profileBio,
        skills: profileSkills,
        specialization: profileSpec,
        qualifications: profileQual,
        certifications: profileCert
      });
    } catch (e) {}

    setIsSavingProfile(false);
    triggerToast("Digital staff profile and credentials updated successfully!", "success");
  };

  // Create Announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    const ann: Announcement = {
      id: "ann_" + Math.random().toString(36).substring(2, 9),
      title: newAnnTitle,
      content: newAnnContent,
      targetAudience: newAnnAudience,
      priority: newAnnPriority,
      publishedAt: new Date().toISOString().split('T')[0],
      createdBy: currentStaff?.fullName || "Staff Member"
    };

    setAnnouncements(prev => [ann, ...prev]);
    setIsNewAnnOpen(false);
    setNewAnnTitle('');
    setNewAnnContent('');
    triggerToast("Internal bulletin published to team feed.", "success");
  };

  // Upload Document
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    const newDoc: StaffDoc = {
      id: "doc_" + Math.random().toString(36).substring(2, 9),
      title: newDocTitle,
      description: newDocDesc || "Official DS Tech staff document.",
      fileName: newDocFile ? newDocFile.name : "DS_Tech_Internal_Policy.pdf",
      fileSize: newDocFile ? newDocFile.size : 2100000,
      mimeType: "application/pdf",
      targetRole: "All",
      uploadedBy: currentStaff?.fullName || "Staff Management",
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsNewDocOpen(false);
    setNewDocTitle('');
    setNewDocDesc('');
    setNewDocFile(null);
    triggerToast("Document uploaded to corporate policy library.", "success");
  };

  // Directory Filter
  const filteredDirectory = directoryMembers.filter(m => {
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      m.fullName.toLowerCase().includes(queryLower) ||
      m.jobTitle.toLowerCase().includes(queryLower) ||
      (m.skills && m.skills.toLowerCase().includes(queryLower));

    const matchesDept = !deptFilter || m.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300 relative flex flex-col`}>
      
      {/* FLOATING TOAST ALERTS */}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md pointer-events-auto flex items-center gap-3 text-xs font-bold ${
                toast.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                  : 'bg-blue-950/90 border-blue-500/40 text-blue-200'
              }`}
            >
              <div className="p-1.5 rounded-xl bg-white/10">
                {toast.type === 'success' ? <CheckCircle2 size={16} /> : toast.type === 'error' ? <AlertCircle size={16} /> : <Sparkles size={16} />}
              </div>
              <span className="flex-1 leading-snug">{toast.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TOP HEADER NAVIGATION BAR */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} py-3 px-4 sm:px-8 transition-colors duration-300 shadow-sm`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Logo & Hamburger */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isLogged && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsHamburgerOpen(!isHamburgerOpen)}
                className={`p-2 rounded-xl transition-all md:hidden ${
                  isDarkMode ? 'bg-slate-800 text-orange-400 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Menu size={20} />
              </motion.button>
            )}

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onBackToPortal?.()}>
              <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} className="scale-95 origin-left" />
              <div className="h-6 w-[1px] bg-slate-700/40 hidden sm:block" />
              <span className="text-[10px] hidden sm:inline-block font-mono font-extrabold uppercase tracking-widest text-orange-500">
                Staff Cockpit v2.4
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <motion.button 
              whileHover={{ rotate: 15, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
              }`}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Logged in Staff Badge / Sign Out */}
            {isLogged && currentStaff ? (
              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-700/40">
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-xs font-black tracking-tight">{currentStaff.fullName}</span>
                  <span className="text-[9px] font-mono text-orange-400 font-bold uppercase">{currentStaff.jobTitle}</span>
                </div>

                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-orange-500/20">
                  {currentStaff.fullName.substring(0, 2).toUpperCase()}
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-bold text-xs flex items-center gap-1.5"
                  title="Sign Out Staff Member"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={onBackToPortal}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <ArrowLeft size={14} />
                <span>Exit Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE HAMBURGER DRAWER */}
      <AnimatePresence>
        {isHamburgerOpen && isLogged && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHamburgerOpen(false)}
              className="fixed inset-0 bg-slate-950/80 z-[60] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`fixed top-0 left-0 bottom-0 w-72 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } border-r z-[70] p-6 flex flex-col justify-between shadow-2xl md:hidden`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <Logo size="xs" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
                  <button onClick={() => setIsHamburgerOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                    <XCircle size={20} />
                  </button>
                </div>

                {/* Mobile Tabs List */}
                <div className="space-y-1.5">
                  {[
                    { id: 'dashboard', label: 'Dashboard Hub', icon: LayoutGrid },
                    { id: 'profile', label: 'Digital Staff Ledger', icon: User },
                    { id: 'documents', label: 'Policy Handbooks', icon: FileText },
                    { id: 'directory', label: 'Staff Directory', icon: BookOpen },
                    { id: 'announcements', label: 'Internal Bulletins', icon: Megaphone },
                    { id: 'assigned-projects', label: 'Assigned Builds', icon: Briefcase },
                    { id: 'settings', label: 'Account Settings', icon: Settings }
                  ].map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setIsHamburgerOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={handleSignOut}
                className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Sign Out Session</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        
        {/* ========================================================= */}
        {/* VIEW 1: AUTHENTICATION SCREEN (LOGIN / REGISTER TABS)    */}
        {/* ========================================================= */}
        {!isLogged ? (
          <div className="max-w-xl mx-auto py-6 sm:py-12">
            
            {/* Header Badge & Title */}
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest">
                <Sparkles size={14} className="animate-spin-slow" />
                <span>Authorized Staff Personnel Portal</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                DS Tech <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Corporate Staff</span> Portal
              </h1>

              <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Access the internal orchestration node for engineering teams, policy repositories, staff directories, and corporate bulletins.
              </p>
            </div>

            {/* Auth Card Box */}
            <div className={`rounded-3xl border p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              
              {/* Tab Selector (Sign In vs Staff Registration) */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-8 relative">
                <button
                  type="button"
                  onClick={() => setAuthState('signin')}
                  className={`py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer ${
                    authState === 'signin' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Key size={16} />
                  <span>Staff Login</span>
                  {authState === 'signin' && (
                    <motion.div 
                      layoutId="staff_auth_tab"
                      className="absolute inset-0 bg-orange-500 rounded-xl -z-10 shadow-lg shadow-orange-500/30"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAuthState('register')}
                  className={`py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer ${
                    authState === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck size={16} />
                  <span>Staff Registration</span>
                  {authState === 'register' && (
                    <motion.div 
                      layoutId="staff_auth_tab"
                      className="absolute inset-0 bg-orange-500 rounded-xl -z-10 shadow-lg shadow-orange-500/30"
                    />
                  )}
                </button>
              </div>

              {/* AUTH TAB 1: SIGN IN */}
              {authState === 'signin' && (
                <motion.form 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleSignIn} 
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Mail size={14} className="text-orange-400" />
                      <span>Corporate Email Address</span>
                    </label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. garba.aminu@dstech.com"
                      className={`w-full px-4 py-3.5 rounded-2xl border text-xs font-medium outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-slate-950/80 border-slate-700 text-white focus:border-orange-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Lock size={14} className="text-orange-400" />
                        <span>Access Password</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => triggerToast("Password recovery reset email sent to corporate domain.", "info")}
                        className="text-[10px] font-mono text-orange-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full px-4 py-3.5 pr-12 rounded-2xl border text-xs font-medium outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-slate-950/80 border-slate-700 text-white focus:border-orange-500' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500'
                        }`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Authenticate Staff Session</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Instant Demo Staff Portal Option */}
                  <div className="pt-4 border-t border-slate-800 text-center space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Fast Testing & Demonstration
                    </span>
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="w-full py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-orange-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Zap size={14} className="text-amber-400 animate-bounce" />
                      <span>Instant Demo Staff Portal Login</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {/* AUTH TAB 2: STAFF REGISTRATION */}
              {authState === 'register' && (
                <motion.form 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleRegister} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Legal Name</label>
                      <input 
                        type="text" 
                        required
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        placeholder="Dr. Aminu Garba"
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Corporate Email</label>
                      <input 
                        type="email" 
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="aminu@dstech.com"
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Phone</label>
                      <input 
                        type="tel" 
                        required
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+234 803 111 2222"
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Position / Job Title</label>
                      <input 
                        type="text" 
                        required
                        value={regJobTitle}
                        onChange={e => setRegJobTitle(e.target.value)}
                        placeholder="Cloud Architect"
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Department</label>
                    <select
                      value={regDepartmentId}
                      onChange={e => setRegDepartmentId(e.target.value)}
                      className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${
                        isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Password</label>
                      <input 
                        type="password" 
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                      <input 
                        type="password" 
                        required
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all cursor-pointer mt-2"
                  >
                    Submit Staff Registration
                  </button>
                </motion.form>
              )}

            </div>
          </div>
        ) : (

          /* ========================================================= */
          /* VIEW 2: LOGGED IN STAFF DASHBOARD COCKPIT                */
          /* ========================================================= */
          <div className="space-y-6">
            
            {/* Desktop Horizontal Tabs */}
            <div className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Dashboard Hub', icon: LayoutGrid },
                { id: 'profile', label: 'Digital Ledger', icon: User },
                { id: 'documents', label: 'Policy Library', icon: FileText },
                { id: 'directory', label: 'Staff Directory', icon: BookOpen },
                { id: 'announcements', label: 'Bulletins', icon: Megaphone },
                { id: 'assigned-projects', label: 'Assigned Builds', icon: Briefcase },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: DASHBOARD HUB */}
            {activeTab === 'dashboard' && currentStaff && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Welcome Hero Banner */}
                <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-800' 
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Corporate Node Active • {currentStaff.employeeId || 'DST-ENG-8492'}</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Welcome Back, <span className="text-orange-500">{currentStaff.fullName}</span>
                      </h2>

                      <p className={`text-xs font-medium max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {currentStaff.departmentName || 'IT & Software Engineering'} Directorate • Assigned to high-throughput client builds and national biometric integration nodes.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="px-4 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <User size={16} />
                        <span>View Ledger</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-3 rounded-2xl border font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Download size={16} />
                        <span>Handbooks</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Assigned Builds', val: assignedProjects.length, sub: 'Active Sprint Tasks', icon: Briefcase, color: 'text-orange-400 bg-orange-500/10' },
                    { label: 'Unread Bulletins', val: announcements.length, sub: 'Corporate Newsfeed', icon: Megaphone, color: 'text-amber-400 bg-amber-500/10' },
                    { label: 'Policy Documents', val: documents.length, sub: 'Available Downloads', icon: FileText, color: 'text-emerald-400 bg-emerald-500/10' },
                    { label: 'Directory Members', val: directoryMembers.length, sub: 'Verified Personnel', icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10' }
                  ].map((card, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -4 }}
                      className={`p-5 rounded-2xl border space-y-3 shadow-lg ${
                        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">{card.label}</span>
                        <div className={`p-2 rounded-xl ${card.color}`}>
                          <card.icon size={18} />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold font-mono tracking-tight">{card.val}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{card.sub}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Grid: Announcements & Assigned Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Internal Bulletins Feed */}
                  <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Megaphone size={18} className="text-orange-400" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Internal Announcements</h3>
                      </div>
                      <button 
                        onClick={() => setIsNewAnnOpen(true)}
                        className="text-[10px] font-mono text-orange-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus size={12} /> Post Notice
                      </button>
                    </div>

                    <div className="space-y-3">
                      {announcements.map(ann => (
                        <div 
                          key={ann.id}
                          className={`p-4 rounded-2xl border space-y-2 transition-all ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{ann.title}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold uppercase">
                              {ann.priority} Priority
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {ann.content}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                            <span>By: {ann.createdBy}</span>
                            <span>{ann.publishedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Builds Snippet */}
                  <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase size={18} className="text-orange-400" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Active Assigned Builds</h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab('assigned-projects')}
                        className="text-[10px] font-mono text-orange-400 hover:underline font-bold"
                      >
                        View All ({assignedProjects.length})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {assignedProjects.map(proj => (
                        <div 
                          key={proj.id}
                          className={`p-4 rounded-2xl border space-y-3 transition-all ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-extrabold">{proj.name}</h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">{proj.progress}%</span>
                          </div>
                          <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {proj.description}
                          </p>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${proj.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: DIGITAL STAFF LEDGER / PROFILE */}
            {activeTab === 'profile' && currentStaff && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-2xl ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-extrabold">Digital Staff Profile Ledger</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Verified Employee Records & Skill Accreditations
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-orange-400 font-bold block">Ledger Score</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-400">{calculateProfileScore()}%</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                        <input type="text" disabled value={currentStaff.fullName} className={`w-full px-3.5 py-3 rounded-xl border text-xs opacity-60 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Corporate Email</label>
                        <input type="text" disabled value={currentStaff.email} className={`w-full px-3.5 py-3 rounded-xl border text-xs opacity-60 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                        <input 
                          type="text" 
                          value={profilePhone} 
                          onChange={e => setProfilePhone(e.target.value)} 
                          className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`} 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialization</label>
                        <input 
                          type="text" 
                          value={profileSpec} 
                          onChange={e => setProfileSpec(e.target.value)} 
                          className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Summary / Bio</label>
                      <textarea 
                        rows={3}
                        value={profileBio} 
                        onChange={e => setProfileBio(e.target.value)} 
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Skills (Comma separated)</label>
                      <input 
                        type="text" 
                        value={profileSkills} 
                        onChange={e => setProfileSkills(e.target.value)} 
                        className={`w-full px-3.5 py-3 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'}`} 
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={isSavingProfile}
                        className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        <span>Save Ledger Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB 3: POLICY HANDBOOKS & DOCUMENTS */}
            {activeTab === 'documents' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wider">Corporate Documents & Handbooks</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Verified internal policy repository and operational standard operating procedures.
                      </p>
                    </div>

                    <button 
                      onClick={() => setIsNewDocOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Plus size={16} />
                      <span>Upload Document</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map(doc => (
                      <div 
                        key={doc.id}
                        className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
                          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">{doc.targetRole} Policy</span>
                            <span className="text-[10px] font-mono text-slate-400">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <h4 className="text-sm font-extrabold">{doc.title}</h4>
                          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {doc.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">Uploaded: {doc.createdAt}</span>
                          <button 
                            onClick={() => triggerToast(`Downloading ${doc.fileName}...`, "info")}
                            className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Download size={14} />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: STAFF DIRECTORY */}
            {activeTab === 'directory' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wider">Staff Directory & Team Finder</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Connect with engineers, legal officers, and department leads across national nodes.
                      </p>
                    </div>

                    {/* Search & Dept Filter */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative w-full sm:w-48">
                        <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search personnel..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border outline-none ${
                            isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>

                      <select 
                        value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}
                        className={`w-full sm:w-auto text-xs px-3 py-2 rounded-xl border outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
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
                        className={`p-5 rounded-2xl border space-y-3 transition-all ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                            {member.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold">{member.fullName}</h4>
                            <span className="text-[10px] font-mono text-orange-400 font-bold block">{member.jobTitle}</span>
                          </div>
                        </div>

                        <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {member.biography || member.specialization || 'Engineering team member.'}
                        </p>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{member.email}</span>
                          <span className="text-emerald-400 font-bold">Verified Node</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wider">Internal Corporate Bulletins</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Official news, operational updates, and executive directives.
                      </p>
                    </div>

                    <button 
                      onClick={() => setIsNewAnnOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>New Bulletin</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {announcements.map(ann => (
                      <div 
                        key={ann.id}
                        className={`p-5 rounded-2xl border space-y-3 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold">{ann.title}</h4>
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold uppercase">
                            {ann.priority} Priority
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {ann.content}
                        </p>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Issued by: {ann.createdBy}</span>
                          <span>{ann.publishedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 6: ASSIGNED PROJECTS */}
            {activeTab === 'assigned-projects' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-extrabold uppercase tracking-wider">Assigned Engineering Builds & Client Systems</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Active client projects and government technology integrations assigned to your unit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignedProjects.map(proj => (
                      <div 
                        key={proj.id}
                        className={`p-6 rounded-2xl border space-y-4 shadow-lg ${
                          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-bold uppercase">
                            {proj.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            Deadline: {proj.deadline}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-extrabold">{proj.name}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">Client: {proj.clientName}</p>
                        </div>

                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {proj.description}
                        </p>

                        {/* Deliverables checklist */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Deliverables</span>
                          <div className="space-y-1">
                            {proj.deliverables.map((del, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                                <Check size={12} />
                                <span>{del}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress controls */}
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>Development Progress</span>
                            <span className="text-orange-400 font-mono">{proj.progress}%</span>
                          </div>

                          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${proj.progress}%` }} />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button 
                              onClick={() => {
                                const newProg = Math.min(100, proj.progress + 5);
                                setAssignedProjects(prev => prev.map(p => p.id === proj.id ? { ...p, progress: newProg } : p));
                                triggerToast(`Updated project progress to ${newProg}%`, "success");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-xs hover:bg-orange-500/20 transition-all cursor-pointer"
                            >
                              + Increment Progress (+5%)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 7: SETTINGS */}
            {activeTab === 'settings' && currentStaff && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto space-y-6"
              >
                <div className={`p-6 rounded-3xl border space-y-6 shadow-xl ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-extrabold uppercase tracking-wider">Account & Node Settings</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Preferences, password security, and active session configuration.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-xs font-bold block">Theme Mode Canvas</span>
                        <span className="text-[10px] text-slate-400">Toggle dark / light appearance</span>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-orange-400 font-bold text-xs border border-slate-700 cursor-pointer"
                      >
                        {isDarkMode ? 'Dark Active' : 'Light Active'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-xs font-bold block">Security Credentials</span>
                        <span className="text-[10px] text-slate-400">Request password reset token</span>
                      </div>
                      <button 
                        onClick={() => triggerToast("Security token sent to corporate email.", "info")}
                        className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 font-bold text-xs border border-orange-500/30 cursor-pointer"
                      >
                        Reset Password
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <button 
                        onClick={handleSignOut}
                        className="w-full py-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-extrabold text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LogOut size={16} />
                        <span>Disconnect Staff Node</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </main>

      {/* CREATE ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {isNewAnnOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setIsNewAnnOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Publish Internal Bulletin</h3>
                <button onClick={() => setIsNewAnnOpen(false)} className="text-slate-400 hover:text-white"><XCircle size={18} /></button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bulletin Title</label>
                  <input type="text" required value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} placeholder="e.g. Q3 Security Protocol Audit" className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority Level</label>
                  <select value={newAnnPriority} onChange={e => setNewAnnPriority(e.target.value as any)} className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bulletin Content</label>
                  <textarea rows={4} required value={newAnnContent} onChange={e => setNewAnnContent(e.target.value)} placeholder="Enter details..." className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <button type="submit" className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer">
                  Publish Bulletin
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setIsNewDocOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Upload Policy Document</h3>
                <button onClick={() => setIsNewDocOpen(false)} className="text-slate-400 hover:text-white"><XCircle size={18} /></button>
              </div>

              <form onSubmit={handleUploadDocument} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document Title</label>
                  <input type="text" required value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} placeholder="e.g. Remote Work Policy 2026" className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea rows={2} value={newDocDesc} onChange={e => setNewDocDesc(e.target.value)} placeholder="Short summary..." className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select PDF File</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => e.target.files?.[0] && setNewDocFile(e.target.files[0])} className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-orange-500/10 file:text-orange-400 file:font-bold hover:file:bg-orange-500/20" />
                </div>

                <button type="submit" className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer">
                  Upload PDF Document
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
