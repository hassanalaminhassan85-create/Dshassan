import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, XCircle, Bell, Info, Award, Briefcase, Calendar, Sparkles, BookOpen } from 'lucide-react';
import { playNotificationSound } from './soundManager';
import { 
  apiGetNotifications, 
  apiMarkNotificationRead, 
  apiMarkAllNotificationsRead, 
  apiDeleteNotification, 
  apiDeleteAllNotifications, 
  apiGetUnreadNotificationsCount,
  apiSaveFcmToken,
  NotificationRecord
} from '../lib/api';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  image?: string;
  actionUrl?: string;
  duration?: number; // custom duration, defaults to 8000ms
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationRecord[];
  activeToasts: ToastItem[];
  unreadCount: number;
  loading: boolean;
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => void;
  removeToast: (id: string) => void;
  registerUser: (userId: string, role: 'admin' | 'candidate' | 'recruiter') => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  requestPushPermissions: () => Promise<void>;
  refreshNotificationsList: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [userId, setUserId] = useState<string>('anonymous');
  const [userRole, setUserRole] = useState<'admin' | 'candidate' | 'recruiter'>('candidate');
  
  // Keep refs to avoid stale closures in SSE subscriptions
  const userIdRef = useRef(userId);
  const userRoleRef = useRef(userRole);

  useEffect(() => {
    userIdRef.current = userId;
    userRoleRef.current = userRole;
  }, [userId, userRole]);

  // Fetch notifications list and unread count
  const refreshNotificationsList = useCallback(async () => {
    if (!userIdRef.current) return;
    setLoading(true);
    try {
      const data = await apiGetNotifications({
        userId: userIdRef.current,
        role: userRoleRef.current,
        limit: 50,
      });
      setNotifications(data.notifications || []);
      
      const countData = await apiGetUnreadNotificationsCount(userIdRef.current, userRoleRef.current);
      setUnreadCount(countData.count || 0);
    } catch (err) {
      console.warn('Failed to load notifications history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set user context and load their notification history
  const registerUser = useCallback((id: string, role: 'admin' | 'candidate' | 'recruiter') => {
    setUserId(id);
    setUserRole(role);
    // Execute a direct refresh
    setTimeout(() => {
      refreshNotificationsList();
    }, 100);
  }, [refreshNotificationsList]);

  // Remove toast manually
  const removeToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add toast function
  const addToast = useCallback((toast: Omit<ToastItem, 'id' | 'createdAt'>) => {
    const id = "toast_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    const newToast: ToastItem = {
      ...toast,
      id,
      createdAt: new Date().toISOString()
    };

    setActiveToasts((prev) => {
      // Limit visible toasts on screen to 5 to avoid clutter
      if (prev.length >= 5) {
        return [...prev.slice(1), newToast];
      }
      return [...prev, newToast];
    });

    // Play elegant synthesized alert chime
    playNotificationSound(toast.type);
  }, []);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await apiMarkNotificationRead(id, true);
      // Optimistic state update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: 1 } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await apiMarkAllNotificationsRead(userId, userRole);
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Delete specific notification
  const deleteNotification = async (id: string) => {
    try {
      await apiDeleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Refresh count just in case
      const countData = await apiGetUnreadNotificationsCount(userId, userRole);
      setUnreadCount(countData.count || 0);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      await apiDeleteAllNotifications(userId, userRole);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // Request native web push permissions and register token with backend (FCM Simulation / Integration fallback)
  const requestPushPermissions = async () => {
    try {
      if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Save token to backend
        const simulatedFcmToken = "fcm_sim_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
        await apiSaveFcmToken({
          userId: userId,
          fcmToken: simulatedFcmToken,
          deviceName: navigator.userAgent.split(' ')[0] || 'Web Browser',
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
        });
        
        addToast({
          title: "Push Notifications Active",
          message: "You will now receive recruitment alerts directly on your device.",
          type: "success",
          priority: "medium"
        });
      }
    } catch (err) {
      console.error('Error requesting push permission:', err);
    }
  };

  // Subscribe to backend Real-time SSE channel
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Trigger a global state update for any data synchronization events
        if (data.type === 'NOTIFICATIONS_UPDATED' || data.type?.includes('SYNC') || data.type?.includes('CREATED') || data.type?.includes('UPDATED') || data.type?.includes('DELETED')) {
          refreshNotificationsList();
          
          // Dispatch a custom event globally so other dashboard components/listeners can refresh their state
          window.dispatchEvent(new CustomEvent('realtime-sync', { detail: data }));
        }

        // Handle dynamically created notifications for the toast queue
        if (data.type === 'NOTIFICATION_CREATED' && data.notification) {
          const notif = data.notification as NotificationRecord;
          
          const isTargetAdmin = notif.recipientRole === 'admin' && userRoleRef.current === 'admin';
          const isTargetUser = notif.recipientRole === 'candidate' && notif.userId === userIdRef.current;
          
          if (isTargetAdmin || isTargetUser) {
            // Add to dynamic onscreen toast queue
            addToast({
              title: notif.title,
              message: notif.message,
              type: notif.type,
              priority: notif.priority,
              image: notif.image,
              actionUrl: notif.actionUrl
            });
            
            // Add to history list in-app
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        }
      } catch (e) {
        console.error('Failed to parse SSE event payload:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('Real-time connection to /api/events disrupted. Retrying automatically...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [addToast, refreshNotificationsList]);

  // Listen for Firebase Cloud Messaging (FCM) Foreground Messages
  useEffect(() => {
    const handleFCMForeground = (event: Event) => {
      const customEvent = event as CustomEvent;
      const payload = customEvent.detail;
      console.log('NotificationProvider received foreground FCM:', payload);
      
      const title = payload.notification?.title || payload.data?.title || 'New Push Notification';
      const body = payload.notification?.body || payload.data?.body || 'You have received a new update';
      const type = payload.data?.type || 'info';
      const image = payload.notification?.image || payload.data?.image || payload.data?.icon;
      
      addToast({
        title,
        message: body,
        type: type,
        priority: 'high',
        image: image
      });
      
      // Refresh the application-level notifications history
      refreshNotificationsList();
    };

    window.addEventListener('fcm-foreground-message', handleFCMForeground);
    return () => {
      window.removeEventListener('fcm-foreground-message', handleFCMForeground);
    };
  }, [addToast, refreshNotificationsList]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      activeToasts,
      unreadCount,
      loading,
      addToast,
      removeToast,
      registerUser,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      requestPushPermissions,
      refreshNotificationsList
    }}>
      {children}
      
      {/* Dynamic Animated Toasts Layer */}
      <div 
        id="toast-layer"
        className="fixed top-4 right-4 md:top-6 md:right-6 z-[9999] flex flex-col gap-3 w-full max-w-[400px] pointer-events-none px-4 md:px-0"
      >
        <AnimatePresence mode="popLayout">
          {activeToasts.map((toast) => (
            <ToastCard 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

// Isolated ToastCard Component to prevent high frequency parent re-renders and host progress counters
const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 8000;
  const startTime = useRef(Date.now());
  const remainingTime = useRef(duration);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (isHovered) {
        // Lock start time offset so we pause countdown on hover
        startTime.current = Date.now() - (duration - remainingTime.current);
        animationFrame.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, duration - elapsed);
      remainingTime.current = remaining;
      
      const percent = (remaining / duration) * 100;
      setProgress(percent);

      if (remaining <= 0) {
        onClose();
      } else {
        animationFrame.current = requestAnimationFrame(tick);
      }
    };

    animationFrame.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isHovered, duration, onClose]);

  // Color mappings for modern styling with delicate glass glows
  const styleConfig: Record<string, {
    bgColor: string;
    borderColor: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    progressBarBg: string;
  }> = {
    success: {
      bgColor: 'bg-emerald-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-emerald-200 dark:border-emerald-950/50 shadow-emerald-500/5',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-500',
      progressBarBg: 'bg-emerald-500'
    },
    error: {
      bgColor: 'bg-rose-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-rose-200 dark:border-rose-950/50 shadow-rose-500/5',
      icon: XCircle,
      iconBg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      iconColor: 'text-rose-500',
      progressBarBg: 'bg-rose-500'
    },
    warning: {
      bgColor: 'bg-amber-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-amber-200 dark:border-amber-950/50 shadow-amber-500/5',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500',
      progressBarBg: 'bg-amber-500'
    },
    application: {
      bgColor: 'bg-indigo-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-indigo-200 dark:border-indigo-950/50 shadow-indigo-500/5',
      icon: Briefcase,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      iconColor: 'text-indigo-500',
      progressBarBg: 'bg-indigo-500'
    },
    interview: {
      bgColor: 'bg-purple-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-purple-200 dark:border-purple-950/50 shadow-purple-500/5',
      icon: Calendar,
      iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      iconColor: 'text-purple-500',
      progressBarBg: 'bg-purple-500'
    },
    achievement: {
      bgColor: 'bg-amber-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-amber-200 dark:border-amber-950/50 shadow-amber-500/5',
      icon: Award,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500',
      progressBarBg: 'bg-amber-500'
    },
    course: {
      bgColor: 'bg-cyan-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-cyan-200 dark:border-cyan-950/50 shadow-cyan-500/5',
      icon: BookOpen,
      iconBg: 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
      iconColor: 'text-cyan-500',
      progressBarBg: 'bg-cyan-500'
    },
    info: {
      bgColor: 'bg-sky-50/90 dark:bg-neutral-900/90',
      borderColor: 'border-sky-200 dark:border-sky-950/50 shadow-sky-500/5',
      icon: Info,
      iconBg: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
      iconColor: 'text-sky-500',
      progressBarBg: 'bg-sky-500'
    }
  };

  const config = styleConfig[toast.type] || styleConfig.info;
  const Icon = config.icon;

  const handleClick = () => {
    if (toast.actionUrl) {
      window.location.href = toast.actionUrl;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95, x: 50 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 80, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative pointer-events-auto overflow-hidden flex flex-col rounded-xl border ${config.bgColor} ${config.borderColor} backdrop-blur-md shadow-lg transition-shadow duration-300 ${toast.actionUrl ? 'cursor-pointer hover:shadow-xl' : ''}`}
      onClick={handleClick}
    >
      <div className="p-4 flex gap-3 items-start">
        {/* Render Passport image or standard Icon */}
        {toast.image ? (
          <img 
            src={toast.image} 
            alt="Candidate Avatar" 
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md flex-shrink-0"
          />
        ) : (
          <div className={`p-2 rounded-lg ${config.iconBg} flex-shrink-0`}>
            <Icon size={18} />
          </div>
        )}

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              {toast.title}
            </span>
            {toast.priority === 'high' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
                Urgent
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">
            {toast.message}
          </p>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors pointer-events-auto"
        >
          <X size={14} />
        </button>
      </div>

      {/* Elegant Progress Countdown bar */}
      <div className="h-1 w-full bg-neutral-200/40 dark:bg-neutral-800/40 mt-auto">
        <div 
          className={`h-full ${config.progressBarBg} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
