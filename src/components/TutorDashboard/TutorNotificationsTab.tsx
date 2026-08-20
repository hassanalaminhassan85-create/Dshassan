import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  DollarSign, 
  FileCheck, 
  Users, 
  Sparkles, 
  CheckCheck, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AcademyNotificationItem } from '../../lib/academyStorage';
import { TutorTabType } from './TutorSidebar';

interface TutorNotificationsTabProps {
  notifications: AcademyNotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: TutorTabType) => void;
}

export const TutorNotificationsTab: React.FC<TutorNotificationsTabProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateTab
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return (n.category === filterType || n.type === filterType);
  });

  const getIcon = (catOrType?: string) => {
    switch (catOrType) {
      case 'payment':
        return <DollarSign size={18} className="text-emerald-500" />;
      case 'academic':
        return <FileCheck size={18} className="text-purple-500" />;
      case 'announcement':
        return <Sparkles size={18} className="text-amber-500" />;
      default:
        return <Bell size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Faculty Alerts & Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time dispatches from students, bursary payouts, and academic board updates.
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CheckCheck size={14} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['all', 'unread', 'academic', 'payment', 'announcement'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer shrink-0 ${
              filterType === tab
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No faculty alerts found in this category.
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkRead(notif.id);
                if (notif.actionUrl) {
                  const tab = notif.actionUrl.replace('#', '') as TutorTabType;
                  onNavigateTab(tab);
                }
              }}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !notif.read
                  ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {notif.actionUrl && (
                <div className="shrink-0 text-purple-600 dark:text-purple-400 flex items-center gap-1 text-xs font-bold">
                  <span className="hidden sm:inline">Open</span>
                  <ChevronRight size={14} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
