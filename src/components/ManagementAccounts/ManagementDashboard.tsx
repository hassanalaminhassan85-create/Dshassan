import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  User,
  Building2,
  ShieldCheck,
  CheckSquare,
  FileText,
  FolderLock,
  Megaphone,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ExternalLink,
  Download,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Users,
  Sun,
  Moon,
  Save,
  Check,
  Crown,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { Logo } from '../Logo';
import {
  ManagementUserSession,
  ManagementDashboardPayload,
  ManagementTaskItem,
  ManagementReportItem,
  ManagementAnnouncementItem,
  ManagementRoleCode
} from '../../types/management';
import {
  apiGetManagementDashboardData,
  apiUpdateManagementTask,
  apiSubmitManagementReport,
  apiCreateManagementAnnouncement,
  apiUpdateManagementProfile,
  apiManagementLogout
} from '../../lib/managementApi';
import { generateRoleDashboardPayload } from '../../lib/managementDataDefaults';
import { apiGetCacMetadata, apiSubscribeToCacMetadata, apiSubscribeToRealtimeSync } from '../../lib/api';
import { OfficialRoleSvg } from './OfficialRoleSvgs';

interface ManagementDashboardProps {
  userSession: ManagementUserSession;
  onLogout: () => void;
  onNavigateHome: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  publishedCac?: any;
}

type SidebarTab =
  | 'dashboard'
  | 'profile'
  | 'department'
  | 'responsibilities'
  | 'tasks'
  | 'reports'
  | 'documents'
  | 'announcements'
  | 'notifications'
  | 'meetings'
  | 'performance'
  | 'settings';

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  userSession,
  onLogout,
  onNavigateHome,
  theme,
  setTheme,
  publishedCac: initialPublishedCac
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Instant synchronous payload initialization eliminates flash & error screen
  const [dashboardData, setDashboardData] = useState<ManagementDashboardPayload>(() => 
    generateRoleDashboardPayload(userSession.role, userSession)
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveCac, setLiveCac] = useState<any>(initialPublishedCac || null);

  // Sync real-time CAC metadata with database and home footer
  useEffect(() => {
    if (initialPublishedCac) {
      setLiveCac(initialPublishedCac);
    }
  }, [initialPublishedCac]);

  useEffect(() => {
    let isMounted = true;
    const loadCac = async () => {
      try {
        const data = await apiGetCacMetadata(false);
        if (data && data.length > 0 && isMounted) {
          const published = data.find((c: any) => c.is_published === 1) || data[0];
          if (published) {
            setLiveCac(published);
          }
        }
      } catch (e) {}
    };

    if (!initialPublishedCac) {
      loadCac();
    }

    const unsubCac = apiSubscribeToCacMetadata((cacData) => {
      if (cacData && cacData.length > 0 && isMounted) {
        const published = cacData.find((c: any) => c.is_published === 1) || cacData[0];
        if (published) {
          setLiveCac(published);
        }
      }
    });

    const unsubSSE = apiSubscribeToRealtimeSync((event) => {
      if (event?.type?.startsWith('CAC_')) {
        loadCac();
      }
    });

    return () => {
      isMounted = false;
      unsubCac();
      unsubSSE();
    };
  }, [initialPublishedCac]);

  const cleanRawRc = liveCac?.registration_number || initialPublishedCac?.registration_number || '1845921';
  const rcNumber = cleanRawRc.replace(/^RC[:\s-]*/i, '');

  // Modals & Action States
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isSubmitReportModalOpen, setIsSubmitReportModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportPeriod, setNewReportPeriod] = useState('Q4 2026');
  const [newReportSummary, setNewReportSummary] = useState('');

  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'High' | 'Normal' | 'Critical'>('Normal');
  const [newAnnAudience, setNewAnnAudience] = useState('All Staff');

  // Profile Form state
  const [profilePhone, setProfilePhone] = useState(userSession.phone || '+234 813 123 4567');
  const [profileOffice, setProfileOffice] = useState(userSession.officeLocation || 'DS Tech Headquarters, Garki, Abuja');
  const [profileBio, setProfileBio] = useState(userSession.bio || '');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const isCeo = userSession.role === 'CEO';

  // Fetch Dashboard Data asynchronously in the background
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await apiGetManagementDashboardData(userSession);
        if (isMounted && data) {
          setDashboardData(data);
          if (data.user) {
            setProfilePhone(data.user.phone || '+234 813 123 4567');
            setProfileOffice(data.user.officeLocation || 'DS Tech Headquarters, Garki, Abuja');
            setProfileBio(data.user.bio || '');
          }
        }
      } catch (err: any) {
        // Fallback gracefully without blocking the user
        if (isMounted) {
          const fallbackData = generateRoleDashboardPayload(userSession.role, userSession);
          setDashboardData(fallbackData);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userSession.role, userSession]);

  // Handle Task Status Toggle
  const handleToggleTaskStatus = async (task: ManagementTaskItem) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await apiUpdateManagementTask({
        id: task.id,
        title: task.title,
        priority: task.priority,
        status: nextStatus,
        dueDate: task.dueDate
      });
      if (res.success && dashboardData) {
        setDashboardData({
          ...dashboardData,
          tasks: dashboardData.tasks.map(t => (t.id === task.id ? { ...t, status: nextStatus } : t))
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  // Handle Add Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await apiUpdateManagementTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        dueDate: newTaskDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      });
      if (res.success && dashboardData) {
        setDashboardData({
          ...dashboardData,
          tasks: [res.task, ...dashboardData.tasks]
        });
        setNewTaskTitle('');
        setIsAddTaskModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add task.');
    }
  };

  // Handle Submit Report
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim() || !newReportSummary.trim()) return;
    try {
      const res = await apiSubmitManagementReport({
        title: newReportTitle.trim(),
        period: newReportPeriod,
        summary: newReportSummary.trim()
      });
      if (res.success && dashboardData) {
        setDashboardData({
          ...dashboardData,
          reports: [res.report, ...dashboardData.reports]
        });
        setNewReportTitle('');
        setNewReportSummary('');
        setIsSubmitReportModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit report.');
    }
  };

  // Handle Publish Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    try {
      const res = await apiCreateManagementAnnouncement({
        title: newAnnTitle.trim(),
        content: newAnnContent.trim(),
        priority: newAnnPriority,
        targetAudience: newAnnAudience
      });
      if (res.success && dashboardData) {
        setDashboardData({
          ...dashboardData,
          announcements: [res.announcement, ...dashboardData.announcements]
        });
        setNewAnnTitle('');
        setNewAnnContent('');
        setIsAnnouncementModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement.');
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileSaveSuccess(false);
    try {
      const res = await apiUpdateManagementProfile({
        phone: profilePhone,
        officeLocation: profileOffice,
        bio: profileBio
      });
      if (res.success) {
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile settings.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Handle Secure Logout
  const handleConfirmLogout = async () => {
    await apiManagementLogout();
    onLogout();
  };

  // Navigation Items
  const navItems: Array<{ id: SidebarTab; label: string; icon: React.ElementType; badge?: string | number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'department', label: 'Department', icon: Building2 },
    { id: 'responsibilities', label: 'Responsibilities', icon: ShieldCheck },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: dashboardData?.tasks.filter(t => t.status !== 'Completed').length },
    { id: 'reports', label: 'Reports', icon: FileText, badge: dashboardData?.reports.length },
    { id: 'documents', label: 'Documents', icon: FolderLock },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: dashboardData?.notifications.filter(n => n.unread).length },
    { id: 'meetings', label: 'Meetings / Calendar', icon: Calendar },
    { id: 'performance', label: 'Department Performance', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!dashboardData) return [];
    if (taskFilter === 'All') return dashboardData.tasks;
    return dashboardData.tasks.filter(t => t.status === taskFilter);
  }, [dashboardData, taskFilter]);

  if (!dashboardData) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin" />
          <Logo size="sm" showText={false} className="absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 animate-pulse mt-2">
          Initializing Management Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white transition-colors duration-200 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs h-16 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Left: Brand & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu size={20} />
            </button>

            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Logo size="sm" showText={false} />
              <div className="hidden sm:block">
                <div className="text-sm font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5">
                  <span>DS TECH COMPANY</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60">
                    MANAGEMENT
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Corporate Leadership Suite
                </div>
              </div>
            </div>
          </div>

          {/* Center: Contextual Breadcrumb & Role Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              {dashboardData.departmentInfo.name}
            </span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {navItems.find(n => n.id === activeTab)?.label}
            </span>
          </div>

          {/* Right: Controls & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Notifications Shortcut */}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} />
              {dashboardData.notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Role Profile Pill */}
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <OfficialRoleSvg role={userSession.role} size={30} />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                  <span>{userSession.roleTitle}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {userSession.email}
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Logout from Management Session"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area: Sidebar + Viewport */}
      <div className="flex-grow flex max-w-[1600px] w-full mx-auto">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col justify-between w-64 border-r border-slate-200/90 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-4 shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
              {isCeo ? 'Executive Suite' : 'Departmental Management'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && Number(item.badge) > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Action: Logout */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <ExternalLink size={15} />
              <span>Public Website</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between lg:hidden shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Logo size="sm" showText={false} />
                      <div className="text-xs font-bold text-slate-950 dark:text-white">
                        {userSession.roleTitle}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-orange-500 text-white font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && Number(item.badge) > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <button
                    onClick={onNavigateHome}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    <ExternalLink size={14} />
                    <span>Back to Main Site</span>
                  </button>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MAIN VIEWPORT CONTENT */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Welcome Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 relative overflow-hidden shadow-lg">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold border border-white/10 mb-3">
                    <ShieldCheck size={14} />
                    <span>{isCeo ? 'Executive Directorate' : `${dashboardData.departmentInfo.name}`}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[10px] text-white">CAC RC: {rcNumber}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                    Welcome back, {userSession.roleTitle}
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isCeo 
                      ? 'Executive Command Center for organization-wide oversight, cross-departmental operations, and capital governance.'
                      : `Operating Console for ${dashboardData.departmentInfo.name}. Track department activities, staff tasks, and milestone deliverables.`}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus size={14} />
                      <span>{isCeo ? 'Add Executive Directive' : 'Assign Department Task'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSubmitReportModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={14} />
                      <span>{isCeo ? 'Review Executive Reports' : 'Submit Official Report'}</span>
                    </button>

                    {isCeo && (
                      <button
                        type="button"
                        onClick={() => setIsAnnouncementModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Megaphone size={14} />
                        <span>Broadcast Announcement</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics Cards Grid */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {isCeo ? 'ORGANIZATION PERFORMANCE METRICS' : 'DEPARTMENT OPERATIONAL INDICATORS'}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">Live Q4 Tracking</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {dashboardData.stats.map((st) => (
                    <div
                      key={st.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <span>{st.label}</span>
                          {st.trend === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
                          {st.trend === 'down' && <TrendingDown size={14} className="text-rose-500" />}
                        </div>
                        <div className="text-2xl font-black text-slate-950 dark:text-white tabular-nums font-mono mt-1">
                          {st.value}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 truncate mr-2">{st.description}</span>
                        {st.change && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono text-[10px]">
                            {st.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CEO SPECIAL: Full Department Comparative Performance */}
              {isCeo && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-950 dark:text-white">
                        Executive Departmental Audit & Performance Overview
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Comparative governance benchmarks across all 8 DS Tech specialized directorates.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold border border-orange-200/50 dark:border-orange-800/50">
                        8 Operating Units Monitored
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                          <th className="pb-3 font-semibold">Department</th>
                          <th className="pb-3 font-semibold">Head of Department</th>
                          <th className="pb-3 font-semibold text-center">KPI Score</th>
                          <th className="pb-3 font-semibold text-center">Tasks Completed</th>
                          <th className="pb-3 font-semibold text-right">Budget Util.</th>
                          <th className="pb-3 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {dashboardData.departmentPerformance.map((dept) => (
                          <tr key={dept.code} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {dept.code}
                                </span>
                                <span>{dept.department}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-600 dark:text-slate-300">{dept.head}</td>
                            <td className="py-3.5 text-center font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                              {dept.kpiScore}%
                            </td>
                            <td className="py-3.5 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                              {dept.tasksCompleted} / {dept.totalTasks}
                            </td>
                            <td className="py-3.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                              {dept.budgetUtilization}
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                                {dept.operationalHealth}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tasks Overview & Recent Activities 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: Tasks Overview */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                          Priority Departmental Tasks
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Pending and active operational deliverables.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('tasks')}
                        className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                      >
                        <span>View All ({dashboardData.tasks.length})</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {dashboardData.tasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskStatus(task)}
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                task.status === 'Completed'
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-orange-500'
                              }`}
                            >
                              {task.status === 'Completed' && <Check size={12} />}
                            </button>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold leading-snug truncate ${
                                task.status === 'Completed'
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span>Due {task.dueDate}</span>
                                <span aria-hidden="true">·</span>
                                <span>{task.assignee}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50'
                              : task.priority === 'High'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create New Task</span>
                  </button>
                </div>

                {/* Column 2: Recent Activities */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                          Recent Management Activities
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Audit trail of leadership actions and events.
                        </p>
                      </div>

                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Sync</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {dashboardData.recentActivities.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock size={15} />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {act.action}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {act.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {act.details || `${act.user} (${act.role})`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                    <span className="text-[11px] text-slate-400">
                      All administrative activities are recorded in the DS Tech Security Ledger.
                    </span>
                  </div>
                </div>
              </div>

              {/* Announcements & Meetings 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Announcements */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                        Company Announcements
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Official corporate directives and notices.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('announcements')}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <span>All Notices</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dashboardData.announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {ann.title}
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold shrink-0">
                            {ann.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {ann.content}
                        </p>
                        <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
                          <span>By {ann.author} ({ann.authorRole})</span>
                          <span>{ann.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Meetings */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                        Upcoming Meetings & Assemblies
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Scheduled executive calendars & committee sessions.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('meetings')}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <span>Calendar</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dashboardData.meetings.map((meet) => (
                      <div
                        key={meet.id}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {meet.title}
                          </h4>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                            {meet.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {meet.agenda}
                        </p>
                        <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />
                            <span>{meet.date} • {meet.time}</span>
                          </span>
                          <span>{meet.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Executive Management Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official credentials, contact details, and system authorization parameters.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      {isCeo ? <Crown size={28} /> : userSession.roleTitle.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                        {userSession.name}
                      </h3>
                      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {userSession.roleTitle}
                      </p>
                      <p className="text-xs text-slate-500">
                        {dashboardData.departmentInfo.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      Security Clearance
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Level 4 / Department Executive
                    </span>
                    <span className="text-slate-400 text-[11px] mt-0.5">
                      Since {userSession.joinedDate || '2021'}
                    </span>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Official Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={userSession.email}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Official Phone Hotline
                      </label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Office Location
                    </label>
                    <input
                      type="text"
                      value={profileOffice}
                      onChange={(e) => setProfileOffice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Executive Bio & Scope
                    </label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 leading-relaxed"
                    />
                  </div>

                  {/* Permissions Chips */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Active Role Privileges
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {userSession.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {profileSaveSuccess && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>Profile details saved.</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isProfileSaving}
                      className="ml-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <Save size={14} />
                      <span>{isProfileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENT */}
          {activeTab === 'department' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  {dashboardData.departmentInfo.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Department structure, designated personnel, and core mandates.
                </p>
              </div>

              {/* Department Overview Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Head of Department</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{dashboardData.departmentInfo.head}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Department Code</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{dashboardData.departmentInfo.code}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Personnel Headcount</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{dashboardData.departmentInfo.staffCount} Staff</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Operational Health</div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{dashboardData.departmentInfo.operationalStatus}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Department Mandate & Strategic Scope
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {dashboardData.departmentInfo.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Core Departmental Mandates
                  </h3>
                  <ul className="space-y-2">
                    {dashboardData.departmentInfo.coreMandates.map((m, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Team Members */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Key Departmental Roster
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dashboardData.departmentInfo.teamMembers.map((member, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{member.name}</div>
                          <div className="text-[11px] text-slate-500">{member.role}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{member.email}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-800/50">
                          {member.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESPONSIBILITIES */}
          {activeTab === 'responsibilities' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Corporate Governance & Role Responsibilities
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official terms of reference and statutory accountability parameters.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
                <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs">
                  <div className="font-bold text-orange-900 dark:text-orange-200 mb-1">
                    Direct Corporate Reporting Line:
                  </div>
                  <p className="text-orange-800 dark:text-orange-300 leading-relaxed">
                    {isCeo 
                      ? 'Reports directly to the Board of Directors of DS Tech & Digital Marketing Agency Limited.'
                      : 'Reports directly to the Chief Executive Officer and Executive Board Committee.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Statutory & Executive Deliverables
                  </h3>

                  <div className="space-y-3">
                    {dashboardData.departmentInfo.coreMandates.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60">
                            MANDATE {String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TASKS */}
          {activeTab === 'tasks' && (
            <div className="max-w-5xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Department Tasks & Workflows
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track, assign, and review operational work items.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>New Task</span>
                </button>
              </div>

              {/* Task Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl max-w-sm">
                {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTaskFilter(st)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      taskFilter === st
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Tasks List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No tasks found matching filter "{taskFilter}".
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-start justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(task)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-orange-500'
                          }`}
                        >
                          {task.status === 'Completed' && <Check size={13} />}
                        </button>

                        <div>
                          <h4 className={`text-xs font-bold leading-snug ${
                            task.status === 'Completed'
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {task.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span>Due Date: <strong className="font-mono text-slate-700 dark:text-slate-300">{task.dueDate}</strong></span>
                            <span aria-hidden="true">·</span>
                            <span>Assignee: {task.assignee}</span>
                            <span aria-hidden="true">·</span>
                            <span>Dept: {task.departmentCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50'
                            : task.priority === 'High'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {task.priority}
                        </span>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="max-w-5xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Official Department Reports
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Formal submissions, audit reconciliations, and executive reviews.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSubmitReportModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Submit Report</span>
                </button>
              </div>

              <div className="space-y-4">
                {dashboardData.reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 mr-2">
                          {rep.period}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {rep.title}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                        rep.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rep.summary}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <span>Submitted by: {rep.submittedBy} ({rep.departmentCode})</span>
                      <span>Date: {rep.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Corporate Documents & Policies Vault
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Statutory corporate filings, legal contracts, SLAs, and technical specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {doc.referenceNo}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {doc.status}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <span>Category: {doc.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Size: {doc.size}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tier: {doc.accessTier}</span>
                      <button
                        type="button"
                        onClick={() => alert(`Verified Vault Reference: ${doc.referenceNo} - Encrypted access granted.`)}
                        className="inline-flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Access Document</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Company Announcements & Directives
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official corporate communications from CEO and Heads of Department.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Publish Notice</span>
                </button>
              </div>

              <div className="space-y-4">
                {dashboardData.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                        {ann.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold shrink-0">
                        {ann.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Author: {ann.author} ({ann.authorRole})</span>
                      <span>Target: {ann.targetAudience} • {ann.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Notifications & Alerts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time corporate notifications, scheduled reminders, and system alerts.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
                {dashboardData.notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-colors flex items-start gap-3.5 ${
                      n.unread
                        ? 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/60'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-orange-500">
                      <Bell size={16} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: MEETINGS / CALENDAR */}
          {activeTab === 'meetings' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Executive Meetings & Calendar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Leadership assemblies, board briefings, and inter-departmental sessions.
                </p>
              </div>

              <div className="space-y-4">
                {dashboardData.meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mr-2">
                          {m.status}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {m.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                        {m.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {m.agenda}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                      <span>Date: <strong className="text-slate-700 dark:text-slate-300">{m.date}</strong></span>
                      <span>Venue: {m.location}</span>
                      <span>Organizer: {m.organizer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: DEPARTMENT PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Department Performance & KPI Tracking
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed performance scorecards across operational disciplines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.departmentPerformance.map((dept) => (
                  <div
                    key={dept.code}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {dept.code}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Score: {dept.kpiScore}%
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {dept.department}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Head: {dept.head}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                        {dept.highlights}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Tasks: {dept.tasksCompleted}/{dept.totalTasks}</span>
                      <span>Budget: {dept.budgetUtilization}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Management Security Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure active session policies and notification preferences.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Session & Access Controls
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Session Cryptographic Expiry</div>
                        <div className="text-[11px] text-slate-500">Tokens automatically rotate every 24 hours.</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded">
                        Active
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Role-Based URL Guarding</div>
                        <div className="text-[11px] text-slate-500">Direct manual URL navigation without verified token is blocked.</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded">
                        Enforced
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                  >
                    Terminate Current Session & Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: ADD TASK */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isAddTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                  Add Department Task
                </h3>
                <button
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Task Title / Objective
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Audit Q4 instructor retainers"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-sm"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* MODAL: SUBMIT REPORT */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isSubmitReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                  Submit Department Report
                </h3>
                <button
                  onClick={() => setIsSubmitReportModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Report Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newReportTitle}
                    onChange={(e) => setNewReportTitle(e.target.value)}
                    placeholder="e.g. Monthly Operational Audit & SLA Reconciliation"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reporting Period
                  </label>
                  <input
                    type="text"
                    value={newReportPeriod}
                    onChange={(e) => setNewReportPeriod(e.target.value)}
                    placeholder="e.g. September 2026 / Q4"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Executive Summary & Deliverables
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newReportSummary}
                    onChange={(e) => setNewReportSummary(e.target.value)}
                    placeholder="Summarize key metrics, budget utilization, operational achievements, and pending bottlenecks..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitReportModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* MODAL: BROADCAST ANNOUNCEMENT */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                  Broadcast Company Announcement
                </h3>
                <button
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="e.g. Schedule for Annual Corporate Review"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newAnnPriority}
                      onChange={(e) => setNewAnnPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={newAnnAudience}
                      onChange={(e) => setNewAnnAudience(e.target.value)}
                      placeholder="e.g. All Management Staff"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    placeholder="Enter official directive..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAnnouncementModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-sm"
                  >
                    Broadcast Notice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* MODAL: LOGOUT CONFIRMATION */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                <LogOut size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Confirm Management Sign Out
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to exit your authenticated session as <strong>{userSession.roleTitle}</strong>?
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
                >
                  Confirm Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
