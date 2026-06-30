import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Bell, Trash2, CheckCheck, Search, Filter, SlidersHorizontal, 
  Sparkles, ShieldAlert, Award, Briefcase, Calendar, BookOpen, Clock,
  ArrowRight, Inbox, HelpCircle, Loader2
} from 'lucide-react';
import { useNotifications } from './NotificationProvider';
import { NotificationRecord } from '../lib/api';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'admin' | 'candidate' | 'recruiter';
}

export function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, role }) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    refreshNotificationsList
  } = useNotifications();

  // Search & Filter local states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [activePriority, setActivePriority] = useState<string>('all');
  const [activeRead, setActiveRead] = useState<string>('all'); // all, unread, read
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(15);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trigger list refresh on drawer opening
  useEffect(() => {
    if (isOpen) {
      refreshNotificationsList();
      setVisibleCount(15);
    }
  }, [isOpen, refreshNotificationsList]);

  // Handle scroll for lazy loading / infinite scroll effect
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 40) {
      // Near bottom, load more
      setVisibleCount((prev) => Math.min(prev + 10, filteredNotifications.length));
    }
  };

  // Advanced Filtering and Sorting
  const filteredNotifications = notifications
    .filter((notif) => {
      // Text search matching
      const matchesSearch = 
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type matching
      const matchesType = activeType === 'all' || notif.type === activeType;
      
      // Priority matching
      const matchesPriority = activePriority === 'all' || notif.priority === activePriority;
      
      // Read/Unread matching
      const matchesRead = 
        activeRead === 'all' || 
        (activeRead === 'unread' && notif.read === 0) || 
        (activeRead === 'read' && notif.read === 1);

      return matchesSearch && matchesType && matchesPriority && matchesRead;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const displayedNotifications = filteredNotifications.slice(0, visibleCount);

  // Type-to-Icon mapper
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: CheckCheck, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
      case 'error':
        return { icon: ShieldAlert, bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' };
      case 'warning':
        return { icon: ShieldAlert, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
      case 'application':
        return { icon: Briefcase, bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' };
      case 'interview':
        return { icon: Calendar, bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' };
      case 'course':
        return { icon: BookOpen, bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' };
      case 'achievement':
        return { icon: Award, bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' };
      default:
        return { icon: Bell, bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[9990]"
          />

          {/* Premium Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md md:max-w-lg bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-[9991] flex flex-col overflow-hidden"
          >
            {/* Header section with rich metrics */}
            <div className="p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <Bell className="text-neutral-600 dark:text-neutral-300" size={20} />
                  </div>
                  <div>
                    <h2 className="font-sans font-bold text-lg text-neutral-900 dark:text-neutral-100">
                      Notifications
                    </h2>
                    <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck size={18} />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all notification history?')) {
                          clearAll();
                        }
                      }}
                      className="p-2 rounded-lg text-neutral-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Clear all notification history"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Advanced Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-neutral-400 dark:text-neutral-500" size={16} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm font-sans bg-neutral-100 dark:bg-neutral-800/60 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700/60 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg outline-none transition-colors text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
                />
              </div>
            </div>

            {/* Advanced Filters Panel (Scannable bento structure) */}
            <div className="bg-neutral-50/50 dark:bg-neutral-900/50 p-4 border-b border-neutral-100 dark:border-neutral-800 space-y-3">
              {/* Type categories */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'application', 'interview', 'course', 'success', 'warning', 'info'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3 py-1 text-xs font-sans font-medium rounded-full border shrink-0 transition-all ${
                      activeType === type
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sub filters grid */}
              <div className="grid grid-cols-3 gap-2">
                {/* Priority filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Priority</span>
                  <select
                    value={activePriority}
                    onChange={(e) => setActivePriority(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 outline-none"
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Read filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Status</span>
                  <select
                    value={activeRead}
                    onChange={(e) => setActiveRead(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 outline-none"
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                {/* Sort order filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Sort</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full text-xs p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 outline-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification items container with infinite scroll */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 scrollbar-thin scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300"
            >
              {loading && notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-500 mb-3" size={24} />
                  <p className="font-sans text-sm text-neutral-500">Retrieving notification ledger...</p>
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
                    <Inbox className="text-neutral-400" size={32} />
                  </div>
                  <h3 className="font-sans font-semibold text-neutral-800 dark:text-neutral-200 text-base">
                    No notifications
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 max-w-[240px] mt-1.5 leading-relaxed">
                    We couldn't find any items matching your filters or search criteria.
                  </p>
                </div>
              ) : (
                displayedNotifications.map((notif) => {
                  const { icon: Icon, bg } = getIcon(notif.type);
                  const isUnread = notif.read === 0;

                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group relative p-3.5 rounded-xl border flex gap-3.5 items-start transition-all duration-300 hover:shadow-md ${
                        isUnread
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/5 border-indigo-100/60 dark:border-indigo-950/30 shadow-indigo-500/2'
                          : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800/80'
                      }`}
                    >
                      {/* Left side accent indicator for unread */}
                      {isUnread && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 dark:bg-indigo-400 rounded-r-md" />
                      )}

                      {/* Icon or Image Avatar */}
                      {notif.image ? (
                        <img
                          src={notif.image}
                          alt="Applicant Avatar"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md flex-shrink-0"
                        />
                      ) : (
                        <div className={`p-2.5 rounded-lg ${bg} shrink-0`}>
                          <Icon size={16} />
                        </div>
                      )}

                      {/* Content details */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-sans text-sm tracking-tight ${isUnread ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'text-neutral-700 dark:text-neutral-300'}`}>
                            {notif.title}
                          </h4>
                          {notif.priority === 'high' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-1">
                          {notif.message}
                        </p>
                        
                        {/* Timestamp & Quick actions block */}
                        <div className="flex items-center gap-3 mt-2.5">
                          <div className="flex items-center gap-1 font-sans text-[10px] text-neutral-400 dark:text-neutral-500">
                            <Clock size={10} />
                            <span>{formatRelativeTime(notif.createdAt)}</span>
                          </div>

                          {/* Render action button if actionUrl is present */}
                          {notif.actionUrl && (
                            <button
                              onClick={() => {
                                window.location.href = notif.actionUrl;
                              }}
                              className="flex items-center gap-1 font-sans text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded transition-colors"
                            >
                              <span>View details</span>
                              <ArrowRight size={10} />
                            </button>
                          )}

                          {isUnread && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="font-sans text-[10px] font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Individual delete button appearing on hover */}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="absolute right-2 top-2 p-1.5 rounded-md text-neutral-300 hover:text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })
              )}

              {/* Loader for lazy loading */}
              {filteredNotifications.length > visibleCount && (
                <div className="py-2 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 10, filteredNotifications.length))}
                    className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-sans font-medium text-neutral-600 dark:text-neutral-400 transition-colors"
                  >
                    Load More Notifications
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
