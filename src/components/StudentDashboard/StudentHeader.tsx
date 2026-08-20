import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  CreditCard,
  GraduationCap
} from 'lucide-react';
import { Logo } from '../Logo';
import { StudentSession, AcademyNotificationItem } from '../../lib/academyStorage';
import { StudentTabType } from './StudentSidebar';

interface StudentHeaderProps {
  session: StudentSession;
  activeTab: StudentTabType;
  onSelectTab: (tab: StudentTabType) => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  notifications: AcademyNotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  session,
  activeTab,
  onSelectTab,
  onOpenMobileMenu,
  onLogout,
  notifications,
  onMarkNotificationRead,
  searchQuery,
  onSearchChange
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Logo on mobile/tablet */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <GraduationCap size={18} />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white font-display">
                DS TECH ACADEMY
              </span>
            </div>
          </div>

          {/* Global Search Box (Desktop) */}
          <div className="hidden md:flex items-center relative w-64 lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search courses, modules, topics..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Side: Quick Tools, Theme, Notifications & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Learning Shortcut Button */}
          <button
            type="button"
            onClick={() => onSelectTab('learning')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-bold cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Workspace</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-indigo-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifsRef}>
            <button
              type="button"
              onClick={() => setIsNotifsOpen(!isNotifsOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer relative shadow-sm"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu Popup */}
            {isNotifsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50">
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('notifications');
                      setIsNotifsOpen(false);
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          if (notif.actionUrl) {
                            const tab = notif.actionUrl.replace('#', '') as StudentTabType;
                            onSelectTab(tab);
                          }
                          setIsNotifsOpen(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
            >
              {session.photoUrl ? (
                <img
                  src={session.photoUrl}
                  alt={session.fullName}
                  className="w-7 h-7 rounded-lg object-cover border border-blue-500/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {session.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">
                  {session.fullName.split(' ')[0]}
                </p>
                <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                  {session.studentId.split('/').pop()}
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {session.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {session.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ACTIVE ENROLLED
                    </span>
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => { onSelectTab('profile'); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <User size={15} className="text-blue-500" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onSelectTab('courses'); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <BookOpen size={15} className="text-indigo-500" />
                    <span>Enrolled Courses</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onSelectTab('payments'); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <CreditCard size={15} className="text-emerald-500" />
                    <span>Tuition & Invoices</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onSelectTab('settings'); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Settings size={15} className="text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => { setIsProfileMenuOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
