import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, User, Phone, Briefcase, Building, BookOpen, FileText, 
  Bell, Megaphone, CheckCircle2, AlertTriangle, XCircle, Plus, Search, 
  Settings, LogOut, Edit2, Save, ArrowRight, Clock, Eye, EyeOff, 
  ChevronRight, Calendar, Award, Shield, Key, Download, RefreshCw, 
  UserCheck, AlertCircle, FileSpreadsheet, Send, HelpCircle, Laptop
} from 'lucide-react';

interface StaffPortalProps {
  onBackToPortal?: () => void;
}

interface StaffMember {
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  priority: string;
  published_at: string;
  created_by: string;
  created_at: string;
}

interface StaffDoc {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  r2_object_key: string;
  target_role: string;
  uploaded_by: string;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({ onBackToPortal }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // States
  const [activeView, setActiveView] = useState<'welcome' | 'login' | 'register' | 'forgot_password' | 'dashboard' | 'suspended' | 'pending_approval'>('welcome');
  
  // Auth Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [biography, setBiography] = useState('');
  const [skills, setSkills] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [certifications, setCertifications] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  // Loading & Messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Session User
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);

  // Dashboard active sub-tab
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'documents' | 'directory' | 'announcements'>('home');

  // Application Data States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<StaffDoc[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [directoryMembers, setDirectoryMembers] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Document upload state (Admin/HR only)
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  // Announcement create state (Admin/HR only)
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState('Medium');
  const [newAnnAudience, setNewAnnAudience] = useState('All');

  // Load theme and check session on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    checkSession();
    fetchDepartments();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/staff/me');
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn && data.user && data.user.isStaff) {
          setCurrentStaff(data.user);
          setActiveView('dashboard');
          fetchDashboardData(data.user.departmentId);
        } else {
          setActiveView('welcome');
        }
      }
    } catch (e) {
      console.error("Error verifying staff session:", e);
      setActiveView('welcome');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (e) {
      console.error("Error fetching departments:", e);
    }
  };

  const fetchDashboardData = async (staffDeptId?: string) => {
    try {
      // Initialize announcements & docs on backend if empty
      await fetch('/api/staff/announcements/init', { method: 'POST' });
      await fetch('/api/staff/documents/init', { method: 'POST' });

      // Load Announcements
      const urlAnn = staffDeptId ? `/api/staff/announcements?department_id=${staffDeptId}` : '/api/staff/announcements';
      const annRes = await fetch(urlAnn);
      if (annRes.ok) {
        const data = await annRes.json();
        setAnnouncements(data);
      }

      // Load Documents
      const docRes = await fetch('/api/staff/documents');
      if (docRes.ok) {
        const data = await docRes.json();
        setDocuments(data);
      }

      // Load Directory members
      const dirRes = await fetch('/api/staff');
      if (dirRes.ok) {
        const data = await dirRes.json();
        setDirectoryMembers(data);
      }

      // Load Notifications
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const data = await notifRes.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        setNotifications(results.filter((n: any) => n.recipientRole === 'staff' || n.recipientRole === 'all'));
      }
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          if (data.error.includes("pending")) {
            setActiveView('pending_approval');
          } else if (data.error.includes("suspended")) {
            setActiveView('suspended');
          } else {
            throw new Error(data.error);
          }
        } else {
          throw new Error(data.error || "Login handshake rejected.");
        }
        setIsSubmitting(false);
        return;
      }

      if (data.success && data.user) {
        setSuccessMsg("Ecosystem Access Granted. Syncing terminal keys...");
        setTimeout(() => {
          checkSession();
        }, 1200);
      }
    } catch (err: any) {
      setAuthError(err.message || "Ecosystem sync failed. Connection refused.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email,
        password,
        fullName,
        phone,
        jobTitle,
        departmentId,
        gender,
        dob,
        nationality,
        specialization,
        biography,
        skills,
        qualifications,
        certifications,
        dateJoined: new Date().toISOString()
      };

      const res = await fetch('/api/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ecosystem registration refused.");
      }

      if (data.success) {
        setSuccessMsg("Registration successfully recorded on the decentralized database nodes! Awaiting administrative HR approval.");
        setActiveView('pending_approval');
      }
    } catch (err: any) {
      setAuthError(err.message || "Registration handshake failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/staff/logout', { method: 'POST' });
      setCurrentStaff(null);
      setActiveView('welcome');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/staff/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          biography,
          skills,
          specialization,
          qualifications,
          certifications
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg("Your professional ledger keys have been re-anchored on the D1 database successfully.");
      checkSession();
    } catch (err: any) {
      setAuthError(err.message || "Failed to update profile ledger.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Announcement (HR / Admin only)
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnnTitle,
          content: newAnnContent,
          priority: newAnnPriority,
          targetAudience: newAnnAudience,
          createdBy: currentStaff?.fullName || 'Ecosystem Admin'
        })
      });

      if (res.ok) {
        setNewAnnTitle('');
        setNewAnnContent('');
        setNewAnnPriority('Medium');
        setNewAnnAudience('All');
        fetchDashboardData(currentStaff?.departmentId);
      }
    } catch (e) {
      console.error("Error creating announcement:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload Document (HR / Admin only)
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    setIsSubmitting(true);
    try {
      // Simulation of uploading file keys to R2
      const res = await fetch('/api/staff/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle,
          description: newDocDesc,
          fileName: newDocFile ? newDocFile.name : 'policy_handbook_amendment.pdf',
          fileSize: newDocFile ? newDocFile.size : 2048500,
          mimeType: newDocFile ? newDocFile.type : 'application/pdf',
          r2ObjectKey: `staff_docs/${Date.now()}_policy.pdf`,
          targetRole: 'All',
          uploadedBy: currentStaff?.fullName || 'HR Executive'
        })
      });

      if (res.ok) {
        setNewDocTitle('');
        setNewDocDesc('');
        setNewDocFile(null);
        fetchDashboardData(currentStaff?.departmentId);
      }
    } catch (e) {
      console.error("Error uploading document:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync profile fields on tab transition
  useEffect(() => {
    if (activeTab === 'profile' && currentStaff) {
      setPhone(currentStaff.phone || '');
      setBiography(currentStaff.biography || '');
      setSkills(currentStaff.skills || '');
      setSpecialization(currentStaff.specialization || '');
      setQualifications(currentStaff.qualifications || '');
      setCertifications(currentStaff.certifications || '');
    }
  }, [activeTab, currentStaff]);

  // Filters and Search for Directory
  const filteredDirectory = directoryMembers.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (member.skills && member.skills.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = !deptFilter || member.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const getDepartmentName = (id?: string) => {
    if (!id) return 'Unassigned';
    return departments.find(d => d.id === id)?.name || 'Ecosystem Node';
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!currentStaff) return 0;
    let score = 0;
    if (currentStaff.fullName) score += 20;
    if (currentStaff.phone) score += 15;
    if (currentStaff.biography) score += 15;
    if (currentStaff.skills) score += 15;
    if (currentStaff.qualifications) score += 15;
    if (currentStaff.certifications) score += 20;
    return score;
  };

  const passwordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score === 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Medium', color: 'bg-yellow-500' };
    if (score === 3) return { score, label: 'Strong', color: 'bg-emerald-500' };
    return { score, label: 'Enterprise Grade', color: 'bg-blue-600' };
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0a0c10] text-[#f1f3f7]' : 'bg-[#fafbfe] text-[#1e2330]'} font-sans transition-colors duration-300`}>
      
      {/* HEADER SECTION */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'bg-[#0f131a]/85 border-[#1f293d]' : 'bg-white/85 border-[#e2e8f0]'} py-3 px-6 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Laptop size={24} id="staff-logo" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                DS TECH
              </span>
              <span className={`text-xs block font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Employee Cockpit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              aria-label="Toggle Theme"
            >
              <RefreshCw size={18} className={isSubmitting ? 'animate-spin' : ''} />
            </button>

            {/* Back to main portal button if on welcome or guest screen */}
            {activeView !== 'dashboard' && (
              <button 
                onClick={onBackToPortal}
                className="flex items-center gap-1 text-sm font-semibold hover:text-blue-500 transition-colors"
              >
                Public Site <ArrowRight size={16} />
              </button>
            )}

            {currentStaff && activeView === 'dashboard' && (
              <div className="flex items-center gap-3">
                {/* Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <Bell size={18} />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border p-4 ${isDarkMode ? 'bg-[#151a24] border-[#253248]' : 'bg-white border-[#e2e8f0]'} z-50`}
                      >
                        <div className="flex items-center justify-between border-b pb-2 mb-2">
                          <h4 className="font-bold text-sm">Ecosystem Notifications</h4>
                          <span className="text-xs text-blue-500 cursor-pointer" onClick={() => setNotifications([])}>Clear</span>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4">All quiet. No new notifications.</p>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className="text-xs border-b pb-2 border-dashed border-gray-700">
                                <span className="font-semibold block">{n.title}</span>
                                <p className="text-gray-400 mt-1">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold">{currentStaff.fullName}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {currentStaff.role}
                  </span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  title="Logout Session"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* VIEW: WELCOME ROUTE */}
          {activeView === 'welcome' && (
            <motion.div 
              key="welcome-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto text-center space-y-8 py-16"
            >
              <div className="space-y-4">
                <div className="inline-flex p-4 rounded-full bg-blue-500/10 text-blue-500 mb-2">
                  <Shield size={48} />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Ecosystem Gateway</h1>
                <p className={`text-base max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Access your secure decentralized workspace dashboard, policy archives, departmental directories, and digital identity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveView('login')}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all group hover:scale-[1.02]"
                >
                  <Key className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
                  <span className="font-bold text-lg">Staff Login</span>
                  <p className="text-xs text-gray-500 text-center mt-1">Authenticate using security credentials.</p>
                </button>

                <button 
                  onClick={() => setActiveView('register')}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group hover:scale-[1.02]"
                >
                  <UserCheck className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
                  <span className="font-bold text-lg">Staff Registration</span>
                  <p className="text-xs text-gray-500 text-center mt-1">Onboard yourself to the digital directory.</p>
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-8">
                By entering, you confirm compliance with DS Tech cybersecurity standards and network protocol agreements.
              </div>
            </motion.div>
          )}

          {/* VIEW: STAFF LOGIN */}
          {activeView === 'login' && (
            <motion.div 
              key="login-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md mx-auto rounded-2xl border p-8 shadow-xl ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'}`}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Staff Login</h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enter registered credentials to lease session tokens.
                </p>
              </div>

              {authError && (
                <div className="p-3 mb-4 rounded-lg bg-red-500/10 text-red-500 text-xs flex items-center gap-2 border border-red-500/20">
                  <AlertCircle size={16} />
                  {authError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-500" size={16} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. employee@dstech.com"
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold">Security Password</label>
                    <button 
                      type="button"
                      onClick={() => setActiveView('forgot_password')}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full text-sm pl-10 pr-10 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-300'}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-900/20"
                >
                  {isSubmitting ? "Authenticating security keys..." : "Unlock Cockpit Workspace"}
                </button>
              </form>

              <div className="mt-6 text-center text-xs space-y-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Are you a new staff member?</span>{' '}
                <button 
                  onClick={() => setActiveView('register')}
                  className="text-blue-500 font-bold hover:underline"
                >
                  Onboard Registration
                </button>
                <div className="pt-4 border-t border-dashed border-gray-800">
                  <button 
                    onClick={() => setActiveView('welcome')}
                    className="text-gray-500 hover:text-blue-500"
                  >
                    ← Back to Gateway
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: STAFF REGISTRATION */}
          {activeView === 'register' && (
            <motion.div 
              key="register-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`max-w-2xl mx-auto rounded-2xl border p-8 shadow-xl ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'}`}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Staff Registration Wizard</h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Submit your onboarding details below. Your account must be approved by human resources before gaining workspace access.
                </p>
              </div>

              {authError && (
                <div className="p-3 mb-4 rounded-lg bg-red-500/10 text-red-500 text-xs border border-red-500/20">
                  {authError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-500" size={16} />
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. John Carter"
                        className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Corporate Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-500" size={16} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. carter@dstech.com"
                        className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-500" size={16} />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +234 803 111 2222"
                        className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Gender Identification</label>
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Decline</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Nationality</label>
                    <input 
                      type="text" 
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Nigerian"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>

                  {/* Official Title / Job Role */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Position / Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 text-gray-500" size={16} />
                      <input 
                        type="text" 
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Lead Robotics Engineer"
                        className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                      />
                    </div>
                  </div>

                  {/* Department select */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Assigned Department</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 text-gray-500" size={16} />
                      <select 
                        required
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                      >
                        <option value="">Select Department Node</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Area of Specialization</label>
                    <input 
                      type="text" 
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Micro-electronics, Edge Computes"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>

                  {/* Skills tags list */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Professional Skills (comma separated)</label>
                    <input 
                      type="text" 
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Rust, CAD modeling, IoT, ROS"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1f293d]">
                  {/* Password & Verify */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Security Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>Strength Check:</span>
                          <span className="font-bold">{passwordStrength(password).label}</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${passwordStrength(password).color}`} style={{ width: `${(passwordStrength(password).score / 4) * 100}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Confirm Security Password</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>
                </div>

                {/* Biography Textarea */}
                <div>
                  <label className="text-xs font-semibold block mb-1">Professional Biography</label>
                  <textarea 
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    rows={3}
                    placeholder="Briefly tell us about your expertise and background..."
                    className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Qualifications */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Academic Qualifications</label>
                    <input 
                      type="text" 
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="e.g. M.Sc. in Robotic Systems, UniILorin"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Professional Certifications</label>
                    <input 
                      type="text" 
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="e.g. PMP, AWS Certified Solutions Architect"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white py-3 rounded-lg font-bold text-sm transition-all"
                >
                  {isSubmitting ? "Onboarding credentials to database..." : "Submit Staff Registration Request"}
                </button>
              </form>

              <div className="mt-6 text-center text-xs space-y-2 pt-4 border-t border-dashed border-gray-800">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Already onboarded?</span>{' '}
                <button 
                  onClick={() => setActiveView('login')}
                  className="text-blue-500 font-bold hover:underline"
                >
                  Login here
                </button>
                <div className="pt-2">
                  <button 
                    onClick={() => setActiveView('welcome')}
                    className="text-gray-500 hover:text-blue-500"
                  >
                    ← Back to Gateway
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: STAFF ACCOUNT PENDING APPROVAL */}
          {activeView === 'pending_approval' && (
            <motion.div 
              key="pending-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md mx-auto text-center border p-8 rounded-2xl shadow-xl ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'}`}
            >
              <div className="inline-flex p-4 rounded-full bg-yellow-500/10 text-yellow-500 mb-4">
                <Clock size={40} />
              </div>
              <h2 className="text-xl font-bold">Awaiting HR Activation</h2>
              <p className={`text-sm mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Thank you for registering. Your staff profile has been securely recorded on the DS Tech corporate database nodes.
              </p>
              <div className={`mt-6 p-4 rounded-xl text-left text-xs border ${isDarkMode ? 'bg-gray-800/40 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                <span className="font-bold block mb-1">What happens next?</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>HR Operations will review your qualifications, department assignment, and credentials.</li>
                  <li>Upon authorization, your account status shifts from <span className="text-yellow-500 font-bold">Pending Review</span> to <span className="text-emerald-500 font-bold">Active</span>.</li>
                  <li>Once active, you will receive workspace access and automatic publishing on the public Team page (if enabled).</li>
                </ul>
              </div>

              <div className="mt-8 space-y-2">
                <button 
                  onClick={() => { setActiveView('login'); setAuthError(null); }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold text-xs"
                >
                  Return to login
                </button>
                <button 
                  onClick={() => setActiveView('welcome')}
                  className="w-full border hover:bg-gray-800 py-2 rounded-lg text-xs"
                >
                  Return to Gateway
                </button>
              </div>
            </motion.div>
          )}

          {/* VIEW: STAFF ACCOUNT SUSPENDED */}
          {activeView === 'suspended' && (
            <motion.div 
              key="suspended-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto text-center border border-red-500/20 bg-red-950/10 p-8 rounded-2xl shadow-xl"
            >
              <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-4">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-xl font-bold text-red-500">Security Clearance Suspended</h2>
              <p className="text-sm text-gray-400 mt-3">
                Your DS Tech corporate employee cockpit access has been temporarily suspended by security compliance algorithms.
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Please contact the Chief Security Officer (CSO) or HR department immediately to resolve compliance reviews.
              </p>

              <button 
                onClick={() => setActiveView('welcome')}
                className="mt-8 w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-xs"
              >
                Return to Gateway
              </button>
            </motion.div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {activeView === 'forgot_password' && (
            <motion.div 
              key="forgot-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md mx-auto rounded-2xl border p-8 shadow-xl ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'}`}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Password Recovery</h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enter corporate email to verify biometric password reset keys.
                </p>
              </div>

              {successMsg ? (
                <div className="p-4 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center space-y-4">
                  <CheckCircle2 size={32} className="mx-auto" />
                  <p>{successMsg}</p>
                  <button 
                    onClick={() => { setActiveView('login'); setSuccessMsg(null); }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold"
                  >
                    Go back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSuccessMsg("Security verification email sent. Please check inbox and spam folders."); }} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Corporate Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. employee@dstech.com"
                      className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-semibold text-sm"
                  >
                    Send Recovery Link
                  </button>
                </form>
              )}

              {!successMsg && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setActiveView('login')}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: STAFF COCKPIT DASHBOARD */}
          {activeView === 'dashboard' && currentStaff && (
            <motion.div 
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Personalized Welcome Banner */}
              <div className={`p-8 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-[#111622] to-[#151c2c] border-[#1f293d]' : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-[#e2e8f0]'}`}>
                <div className="space-y-2 z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Ecosystem Synced
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {currentStaff.employeeId || 'STF-XXXX'}</span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    Welcome Back, {currentStaff.fullName.split(' ')[0]}!
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active Node: <span className="font-semibold text-blue-500">{getDepartmentName(currentStaff.departmentId)}</span> • Role: <span className="font-semibold">{currentStaff.role}</span>
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-2 z-10">
                  <div className="text-xs font-semibold">Profile Integrity Completion:</div>
                  <div className="flex items-center gap-3 w-48">
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" style={{ width: `${calculateCompletion()}%` }}></div>
                    </div>
                    <span className="font-bold text-sm">{calculateCompletion()}%</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Complete your details to unlock full credentials.</span>
                </div>
              </div>

              {/* Nav Tabs */}
              <div className="flex border-b border-gray-800 overflow-x-auto gap-4">
                {[
                  { id: 'home', label: 'Ecosystem Hub', icon: Laptop },
                  { id: 'profile', label: 'My Profile Ledger', icon: User },
                  { id: 'documents', label: 'Secure Docs Center', icon: FileText },
                  { id: 'directory', label: 'Org Directory', icon: BookOpen },
                  { id: 'announcements', label: 'Announcements', icon: Megaphone }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-white'}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab view container */}
              <div className="pt-4">
                <AnimatePresence mode="wait">

                  {/* TAB: ECOSYSTEM HUB / HOME */}
                  {activeTab === 'home' && (
                    <motion.div 
                      key="home-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                      {/* Left: Quick announcements & corporate status */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between border-b pb-2 border-gray-800">
                          <h3 className="font-extrabold text-lg flex items-center gap-2">
                            <Megaphone size={18} className="text-blue-500" /> Recent Announcements
                          </h3>
                          <button onClick={() => setActiveTab('announcements')} className="text-xs text-blue-500 hover:underline">View all</button>
                        </div>

                        {announcements.length === 0 ? (
                          <div className={`p-8 rounded-2xl text-center border border-dashed ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                            No recent company announcements.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {announcements.slice(0, 3).map(ann => (
                              <div key={ann.id} className={`p-6 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-[#0f131a] hover:bg-gray-850 border-[#1f293d]' : 'bg-white hover:bg-gray-50 border-[#e2e8f0]'}`}>
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ann.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                      {ann.priority} Priority
                                    </span>
                                    <h4 className="font-extrabold text-base mt-2">{ann.title}</h4>
                                  </div>
                                  <span className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className={`text-xs mt-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ann.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-b pb-2 border-gray-800 pt-4">
                          <h3 className="font-extrabold text-lg flex items-center gap-2">
                            <FileText size={18} className="text-emerald-500" /> Shared Documents Archive
                          </h3>
                          <button onClick={() => setActiveTab('documents')} className="text-xs text-blue-500 hover:underline">Open Documents</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {documents.slice(0, 2).map(doc => (
                            <div key={doc.id} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'} flex items-center justify-between`}>
                              <div className="space-y-1">
                                <span className="font-bold text-sm block line-clamp-1">{doc.title}</span>
                                <span className="text-xs text-gray-500 block">{(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.file_name.split('.').pop()?.toUpperCase()}</span>
                              </div>
                              <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-blue-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'}`}>
                                <Download size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Quick actions, Employee Info card, Security Badge */}
                      <div className="space-y-6">
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'} space-y-4 text-center`}>
                          <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-400">Security Clearance Badge</h4>
                          <div className="relative w-32 h-32 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center border-4 border-blue-500/30">
                            <Award size={48} className="text-blue-500" />
                          </div>
                          <div>
                            <span className="font-black text-base block">{currentStaff.fullName}</span>
                            <span className="text-xs text-gray-400">{currentStaff.jobTitle}</span>
                          </div>
                          <div className="pt-4 border-t border-dashed border-gray-800 text-xs flex justify-between">
                            <span className="text-gray-500">Node Status:</span>
                            <span className="text-emerald-500 font-bold">ACTIVE SECURE</span>
                          </div>
                        </div>

                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'} space-y-4`}>
                          <h4 className="font-extrabold text-sm">Cockpit Quick Actions</h4>
                          <div className="space-y-2">
                            <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg text-xs font-bold transition-colors flex justify-between items-center ${isDarkMode ? 'bg-gray-800 hover:bg-gray-755' : 'bg-gray-50 hover:bg-gray-100'}`}>
                              <span>Update Personal Profile Info</span>
                              <ChevronRight size={14} />
                            </button>
                            <button onClick={() => setActiveTab('directory')} className={`w-full text-left p-3 rounded-lg text-xs font-bold transition-colors flex justify-between items-center ${isDarkMode ? 'bg-gray-800 hover:bg-gray-755' : 'bg-gray-50 hover:bg-gray-100'}`}>
                              <span>Browse Org Team Directory</span>
                              <ChevronRight size={14} />
                            </button>
                            <button onClick={() => setActiveTab('documents')} className={`w-full text-left p-3 rounded-lg text-xs font-bold transition-colors flex justify-between items-center ${isDarkMode ? 'bg-gray-800 hover:bg-gray-755' : 'bg-gray-50 hover:bg-gray-100'}`}>
                              <span>Read Workspace Security Protocol</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: MY PROFILE LEDGER */}
                  {activeTab === 'profile' && (
                    <motion.div 
                      key="profile-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                      {/* Left: Private details & updates */}
                      <div className="lg:col-span-2">
                        <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'}`}>
                          <h3 className="text-xl font-extrabold mb-6">Staff Profile Ledger Details</h3>

                          {successMsg && (
                            <div className="p-3 mb-4 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                              {successMsg}
                            </div>
                          )}

                          <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-semibold block mb-1">Corporate Email (Read Only)</label>
                                <input 
                                  type="email" 
                                  readOnly
                                  value={currentStaff.email}
                                  className="w-full text-sm px-3 py-2.5 rounded-lg bg-gray-800/20 border border-gray-700/40 text-gray-500 cursor-not-allowed outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold block mb-1">Employee ID (Read Only)</label>
                                <input 
                                  type="text" 
                                  readOnly
                                  value={currentStaff.employeeId || 'STF-XXXX'}
                                  className="w-full text-sm px-3 py-2.5 rounded-lg bg-gray-800/20 border border-gray-700/40 text-gray-500 cursor-not-allowed outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold block mb-1">Assigned Department (Read Only)</label>
                                <input 
                                  type="text" 
                                  readOnly
                                  value={getDepartmentName(currentStaff.departmentId)}
                                  className="w-full text-sm px-3 py-2.5 rounded-lg bg-gray-800/20 border border-gray-700/40 text-gray-500 cursor-not-allowed outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold block mb-1">Job Position (Read Only)</label>
                                <input 
                                  type="text" 
                                  readOnly
                                  value={currentStaff.jobTitle}
                                  className="w-full text-sm px-3 py-2.5 rounded-lg bg-gray-800/20 border border-gray-700/40 text-gray-500 cursor-not-allowed outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold block mb-1">Contact Phone</label>
                                <input 
                                  type="tel" 
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold block mb-1">Area of Specialization</label>
                                <input 
                                  type="text" 
                                  value={specialization}
                                  onChange={(e) => setSpecialization(e.target.value)}
                                  className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-semibold block mb-1">Professional Skills (comma separated)</label>
                              <input 
                                type="text" 
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold block mb-1">Professional Biography</label>
                              <textarea 
                                value={biography}
                                onChange={(e) => setBiography(e.target.value)}
                                rows={3}
                                className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-semibold block mb-1">Academic Qualifications</label>
                                <input 
                                  type="text" 
                                  value={qualifications}
                                  onChange={(e) => setQualifications(e.target.value)}
                                  className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold block mb-1">Professional Certifications</label>
                                <input 
                                  type="text" 
                                  value={certifications}
                                  onChange={(e) => setCertifications(e.target.value)}
                                  className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#1e2330]'}`}
                                />
                              </div>
                            </div>

                            <button 
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                            >
                              {isSubmitting ? "Syncing..." : "Update Ledger Profile Info"}
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Right: Security metadata */}
                      <div className="space-y-6">
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'} space-y-4`}>
                          <h4 className="font-extrabold text-sm">Security Ledger Properties</h4>
                          <div className="text-xs space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Security Clearance:</span>
                              <span className="font-bold text-blue-400">{currentStaff.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Account status:</span>
                              <span className="font-bold text-emerald-400">{currentStaff.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Date onboarded:</span>
                              <span className="font-bold text-gray-300">
                                {currentStaff.dateJoined ? new Date(currentStaff.dateJoined).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: SECURE DOCUMENTS CENTER */}
                  {activeTab === 'documents' && (
                    <motion.div 
                      key="docs-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4 border-gray-800">
                        <div>
                          <h3 className="text-xl font-extrabold flex items-center gap-2">
                            <FileText size={20} className="text-emerald-500" /> Secure Documents Archive
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">Read and download official workspace manuals, policies, and code books safely.</p>
                        </div>

                        {/* Admin / HR Only upload area toggle */}
                        {(currentStaff.role === 'Admin' || currentStaff.role === 'HR Officer' || currentStaff.role === 'Super Admin') && (
                          <div className={`p-4 rounded-xl border border-dashed ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                            <span className="text-xs font-bold block mb-2">Upload New Policy Document</span>
                            <form onSubmit={handleUploadDocument} className="flex gap-2 text-xs">
                              <input 
                                type="text" 
                                required
                                placeholder="Manual/Doc Title"
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                className={`px-3 py-1.5 rounded border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                              />
                              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded font-bold text-white">
                                Add Metadata
                              </button>
                            </form>
                          </div>
                        )}
                      </div>

                      {documents.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          No secure documents available inside workspace.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {documents.map(doc => (
                            <div key={doc.id} className={`p-6 rounded-2xl border relative flex flex-col justify-between h-48 transition-all ${isDarkMode ? 'bg-[#0f131a] hover:bg-gray-850 border-[#1f293d]' : 'bg-white hover:bg-gray-50 border-[#e2e8f0]'}`}>
                              <div className="space-y-2">
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">
                                  {doc.target_role === 'All' ? 'GENERAL POLICY' : doc.target_role}
                                </span>
                                <h4 className="font-extrabold text-base line-clamp-1">{doc.title}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2">{doc.description || 'No description provided.'}</p>
                              </div>

                              <div className="pt-4 border-t border-dashed border-gray-800 flex justify-between items-center text-xs">
                                <span className="text-gray-500">{(doc.file_size / 1024 / 1024).toFixed(2)} MB • PDF</span>
                                <button className="flex items-center gap-1 font-bold text-blue-500 hover:underline">
                                  <Download size={14} /> Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: ORGANIZATION DIRECTORY */}
                  {activeTab === 'directory' && (
                    <motion.div 
                      key="dir-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4 border-gray-800">
                        <div>
                          <h3 className="text-xl font-extrabold">Decentralized Organization Directory</h3>
                          <p className="text-xs text-gray-500 mt-1">Check verified corporate positions, skills, and department roles safely.</p>
                        </div>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Search names, titles, skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`px-3 py-1.5 text-xs rounded border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                          />
                          <select 
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className={`px-3 py-1.5 text-xs rounded border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                          >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {filteredDirectory.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          No matching team members found in the workspace node directory.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredDirectory.map(member => (
                            <div key={member.id} className={`p-6 rounded-2xl border flex flex-col justify-between gap-4 ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'}`}>
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-lg text-blue-500 uppercase border border-blue-500/30">
                                  {member.fullName.substring(0, 2)}
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-extrabold text-base">{member.fullName}</h4>
                                  <span className={`text-xs font-semibold block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{member.jobTitle}</span>
                                  <span className="text-xs text-gray-400 block">{getDepartmentName(member.departmentId)}</span>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-dashed border-gray-800 text-xs space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Email:</span>
                                  <span className="font-bold">{member.email}</span>
                                </div>
                                {member.phone && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Phone:</span>
                                    <span className="font-bold">{member.phone}</span>
                                  </div>
                                )}
                                {member.skills && (
                                  <div className="pt-2">
                                    <span className="text-gray-500 block mb-1">Key Expertise:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {member.skills.split(',').map((skill, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-300 text-[10px] rounded-full">
                                          {skill.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: ANNOUNCEMENTS FULL VIEW */}
                  {activeTab === 'announcements' && (
                    <motion.div 
                      key="ann-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4 border-gray-800">
                        <div>
                          <h3 className="text-xl font-extrabold">Ecosystem Announcements Log</h3>
                          <p className="text-xs text-gray-500 mt-1">Official bulletins, security alerts, and HR compliance messages.</p>
                        </div>

                        {/* Admin / HR Only announcement creator */}
                        {(currentStaff.role === 'Admin' || currentStaff.role === 'HR Officer' || currentStaff.role === 'Super Admin') && (
                          <div className={`p-6 rounded-xl border border-dashed ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                            <span className="text-xs font-bold block mb-3">Publish New Announcement</span>
                            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs w-72">
                              <input 
                                type="text" 
                                required
                                placeholder="Announcement Title"
                                value={newAnnTitle}
                                onChange={(e) => setNewAnnTitle(e.target.value)}
                                className={`w-full px-3 py-1.5 rounded border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                              />
                              <textarea 
                                required
                                placeholder="Details..."
                                rows={2}
                                value={newAnnContent}
                                onChange={(e) => setNewAnnContent(e.target.value)}
                                className={`w-full px-3 py-1.5 rounded border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                              />
                              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold text-white">
                                Publish Bulletin
                              </button>
                            </form>
                          </div>
                        )}
                      </div>

                      {announcements.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          No company announcements logged.
                        </div>
                      ) : (
                        <div className="space-y-6 max-w-4xl">
                          {announcements.map(ann => (
                            <div key={ann.id} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f131a] border-[#1f293d]' : 'bg-white border-[#e2e8f0]'} space-y-4`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ann.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {ann.priority} Priority
                                  </span>
                                  <span className="text-xs text-gray-500">by {ann.created_by}</span>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-extrabold text-lg">{ann.title}</h4>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ann.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};
