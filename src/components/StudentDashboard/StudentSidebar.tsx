import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlayCircle, 
  FileCheck2, 
  CreditCard, 
  Receipt, 
  Bell, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  X, 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Logo } from '../Logo';
import { StudentSession } from '../../lib/academyStorage';

export type StudentTabType = 
  | 'overview' 
  | 'courses' 
  | 'learning' 
  | 'enrollments' 
  | 'payments' 
  | 'payment-history' 
  | 'notifications' 
  | 'profile' 
  | 'settings' 
  | 'support';

interface StudentSidebarProps {
  activeTab: StudentTabType;
  onSelectTab: (tab: StudentTabType) => void;
  session: StudentSession;
  unreadNotifsCount: number;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  overallProgress?: number;
}

interface NavItemConfig {
  id: StudentTabType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activeTab,
  onSelectTab,
  session,
  unreadNotifsCount,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  overallProgress = 78
}) => {
  const mainNavItems: NavItemConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'learning', label: 'Learning Workspace', icon: PlayCircle, badge: 'Live Lab', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    { id: 'enrollments', label: 'Enrollments', icon: FileCheck2 },
    { id: 'payments', label: 'Payments & Tuition', icon: CreditCard },
    { id: 'payment-history', label: 'Payment History', icon: Receipt },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined, 
      badgeColor: 'bg-blue-500 text-white' 
    },
  ];

  const secondaryNavItems: NavItemConfig[] = [
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support & Handbook', icon: HelpCircle },
  ];

  const renderContent = () => (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-slate-200">
      {/* Academy Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-display">
                DS TECH ACADEMY
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                STUDENT PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isOpenMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Student Identity Pill */}
      <div className="px-4 py-3.5 mx-3 my-3 rounded-2xl bg-slate-950/80 dark:bg-slate-900/60 border border-slate-800 flex items-center gap-3">
        <div className="relative shrink-0">
          {session.photoUrl ? (
            <img
              src={session.photoUrl}
              alt={session.fullName}
              className="w-10 h-10 rounded-xl object-cover border border-blue-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              {session.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate font-sans">
            {session.fullName}
          </p>
          <p className="text-[10px] font-mono text-slate-400 truncate">
            {session.studentId}
          </p>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        {/* Main Learning Hub Items */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Learning & Academics
          </div>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={17}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account & Administration Items */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account & Support
          </div>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={17}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Mini Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 text-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-400" />
              Syllabus Completion
            </span>
            <span className="text-[11px] font-mono font-extrabold text-blue-400">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {session.program}
          </p>
        </div>
      </div>

      {/* Bottom Logout Area */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Exit Student Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-30">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 lg:hidden shadow-2xl"
            >
              {renderContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
