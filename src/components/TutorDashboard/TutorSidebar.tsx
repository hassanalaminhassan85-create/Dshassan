import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CalendarCheck2, 
  FileCheck, 
  GraduationCap, 
  DollarSign, 
  Bell, 
  UserCheck, 
  Settings, 
  HelpCircle, 
  LogOut, 
  X, 
  Briefcase, 
  Sparkles, 
  Award,
  Video
} from 'lucide-react';
import { TutorSession } from '../../lib/academyStorage';

export type TutorTabType = 
  | 'overview' 
  | 'courses' 
  | 'students' 
  | 'attendance' 
  | 'grading' 
  | 'workspace' 
  | 'payouts' 
  | 'notifications' 
  | 'profile' 
  | 'settings' 
  | 'support';

interface TutorSidebarProps {
  activeTab: TutorTabType;
  onSelectTab: (tab: TutorTabType) => void;
  session: TutorSession;
  pendingGradingCount: number;
  unreadNotifsCount: number;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: TutorTabType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const TutorSidebar: React.FC<TutorSidebarProps> = ({
  activeTab,
  onSelectTab,
  session,
  pendingGradingCount,
  unreadNotifsCount,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const mainNavItems: NavItemConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'My Assigned Courses', icon: BookOpen },
    { id: 'students', label: 'Student Management', icon: Users, badge: `${session.totalStudents || 35} Stus`, badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
    { id: 'attendance', label: 'Attendance Tracker', icon: CalendarCheck2 },
    { 
      id: 'grading', 
      label: 'Submissions & Grading', 
      icon: FileCheck, 
      badge: pendingGradingCount > 0 ? pendingGradingCount : undefined, 
      badgeColor: 'bg-amber-500 text-slate-950' 
    },
    { id: 'workspace', label: 'Teaching Workspace', icon: Video, badge: 'Live Room', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    { id: 'payouts', label: 'Honorarium & Payouts', icon: DollarSign },
    { 
      id: 'notifications', 
      label: 'Faculty Alerts', 
      icon: Bell, 
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined, 
      badgeColor: 'bg-purple-500 text-white' 
    },
  ];

  const secondaryNavItems: NavItemConfig[] = [
    { id: 'profile', label: 'Profile & Specialization', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Faculty Support Desk', icon: HelpCircle },
  ];

  const renderContent = () => (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-slate-200">
      {/* Academy Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
            <Briefcase size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-display">
                DS TECH ACADEMY
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                TUTOR WORKSPACE
              </span>
            </div>
          </div>
        </div>

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

      {/* Tutor Identity Card */}
      <div className="px-4 py-3.5 mx-3 my-3 rounded-2xl bg-slate-950/80 dark:bg-slate-900/60 border border-slate-800 flex items-center gap-3">
        <div className="relative shrink-0">
          {session.photoUrl ? (
            <img
              src={session.photoUrl}
              alt={session.fullName}
              className="w-10 h-10 rounded-xl object-cover border border-purple-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
              {session.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate font-sans">
            {session.fullName}
          </p>
          <p className="text-[10px] font-mono text-purple-400 truncate">
            {session.tutorId}
          </p>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Teaching & Delivery
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
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={17}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400 transition-colors'}
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

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Faculty Administration
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
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={17}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400 transition-colors'}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tutor Rating & Standing Mini Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 text-slate-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Award size={14} className="text-amber-400" />
              Faculty Rating
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              ★ {session.rating || 4.9} / 5.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Lead Instructor Standing (Tier 1)
          </p>
        </div>
      </div>

      {/* Logout Area */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Exit Faculty Workspace</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-30">
        {renderContent()}
      </aside>

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
