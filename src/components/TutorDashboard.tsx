import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TutorSession, 
  StudentSubmission, 
  TutorPayoutRequest, 
  AcademyNotificationItem,
  getActiveTutorSession,
  clearTutorSession,
  apiGetSubmissionsForCourse,
  apiGetTutorPayouts,
  apiGetNotificationsForUser,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead
} from '../lib/academyStorage';
import { AcademyCourse, ACADEMY_COURSES } from '../lib/academyCoursesData';

// Modular Tutor Subcomponents
import { TutorAuthGate } from './TutorDashboard/TutorAuthGate';
import { TutorSidebar, TutorTabType } from './TutorDashboard/TutorSidebar';
import { TutorHeader } from './TutorDashboard/TutorHeader';
import { TutorOverviewTab } from './TutorDashboard/TutorOverviewTab';
import { TutorCoursesTab } from './TutorDashboard/TutorCoursesTab';
import { TutorStudentsTab } from './TutorDashboard/TutorStudentsTab';
import { TutorAttendanceTab } from './TutorDashboard/TutorAttendanceTab';
import { TutorGradingTab } from './TutorDashboard/TutorGradingTab';
import { TutorTeachingWorkspaceTab } from './TutorDashboard/TutorTeachingWorkspaceTab';
import { TutorPayoutsTab } from './TutorDashboard/TutorPayoutsTab';
import { TutorProfileTab } from './TutorDashboard/TutorProfileTab';
import { TutorNotificationsTab } from './TutorDashboard/TutorNotificationsTab';
import { TutorSupportSettingsTab } from './TutorDashboard/TutorSupportSettingsTab';

interface TutorDashboardProps {
  onBackToPortal?: () => void;
  onApplyAsTutor?: () => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  onBackToPortal,
  onApplyAsTutor
}) => {
  const [session, setSession] = useState<TutorSession | null>(() => getActiveTutorSession());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TutorTabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data States
  const [assignedCourses, setAssignedCourses] = useState<AcademyCourse[]>([]);
  const [activeTeachingCourse, setActiveTeachingCourse] = useState<AcademyCourse>(ACADEMY_COURSES[0]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [payouts, setPayouts] = useState<TutorPayoutRequest[]>([]);
  const [notifications, setNotifications] = useState<AcademyNotificationItem[]>([]);

  // Load and synchronize tutor data
  useEffect(() => {
    if (!session) return;

    const loadTutorData = async () => {
      // 1. Determine assigned courses based on tutor codes
      const assigned = session.assignedCourses || session.assignedCourseCodes || [];
      const matched = ACADEMY_COURSES.filter(c => assigned.includes(c.code));
      const coursesList = matched.length > 0 ? matched : [ACADEMY_COURSES[0], ACADEMY_COURSES[1]];
      setAssignedCourses(coursesList);
      setActiveTeachingCourse(coursesList[0]);

      // 2. Load Submissions for all assigned courses
      const allSubs: StudentSubmission[] = [];
      for (const c of coursesList) {
        const subs = await apiGetSubmissionsForCourse(c.code);
        allSubs.push(...subs);
      }
      setSubmissions(allSubs);

      // 3. Load Payouts
      const userPayouts = await apiGetTutorPayouts(session.email);
      setPayouts(userPayouts);

      // 4. Load Notifications
      const userNotifs = await apiGetNotificationsForUser(session.email);
      setNotifications(userNotifs);
    };

    loadTutorData();
  }, [session]);

  const handleLogout = () => {
    clearTutorSession();
    setSession(null);
  };

  const handleMarkNotifRead = async (id: string) => {
    if (!session) return;
    await apiMarkNotificationRead(id);
    const updated = await apiGetNotificationsForUser(session.email);
    setNotifications(updated);
  };

  const handleMarkAllNotifsRead = async () => {
    if (!session) return;
    await apiMarkAllNotificationsRead(session.email, 'tutor');
    const updated = await apiGetNotificationsForUser(session.email);
    setNotifications(updated);
  };

  const handleLaunchTeachingWorkspace = (course: AcademyCourse) => {
    setActiveTeachingCourse(course);
    setActiveTab('workspace');
  };

  const handleSubmissionGraded = (updatedSub: StudentSubmission) => {
    setSubmissions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  const handlePayoutCreated = (newPayout: TutorPayoutRequest) => {
    setPayouts(prev => [newPayout, ...prev]);
  };

  // If not authenticated as tutor, display TutorAuthGate
  if (!session || !session.isAuthenticated) {
    return (
      <TutorAuthGate
        onAuthenticated={(newSession) => setSession(newSession)}
        onBackToPortal={onBackToPortal}
        onApplyAsTutor={onApplyAsTutor}
      />
    );
  }

  const pendingGradingCount = submissions.filter(s => s.status === 'submitted' || !s.grade).length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased transition-colors">
      {/* 1. Dedicated Standalone Tutor Sidebar */}
      <TutorSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        session={session}
        pendingGradingCount={pendingGradingCount}
        unreadNotifsCount={unreadNotifsCount}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Body Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Modern Responsive Header */}
        <TutorHeader
          session={session}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotifRead}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <TutorOverviewTab
                  session={session}
                  assignedCourses={assignedCourses}
                  submissions={submissions}
                  payouts={payouts}
                  onSelectTab={setActiveTab}
                  onLaunchTeachingWorkspace={handleLaunchTeachingWorkspace}
                />
              )}

              {activeTab === 'courses' && (
                <TutorCoursesTab
                  session={session}
                  assignedCourses={assignedCourses}
                  onSelectTab={setActiveTab}
                  onLaunchTeachingWorkspace={handleLaunchTeachingWorkspace}
                />
              )}

              {activeTab === 'students' && (
                <TutorStudentsTab
                  session={session}
                  assignedCourses={assignedCourses}
                />
              )}

              {activeTab === 'attendance' && (
                <TutorAttendanceTab
                  session={session}
                  assignedCourses={assignedCourses}
                />
              )}

              {activeTab === 'grading' && (
                <TutorGradingTab
                  session={session}
                  assignedCourses={assignedCourses}
                  submissions={submissions}
                  onSubmissionGraded={handleSubmissionGraded}
                />
              )}

              {activeTab === 'workspace' && (
                <TutorTeachingWorkspaceTab
                  session={session}
                  activeCourse={activeTeachingCourse}
                  assignedCourses={assignedCourses}
                  onSelectCourse={setActiveTeachingCourse}
                />
              )}

              {activeTab === 'payouts' && (
                <TutorPayoutsTab
                  session={session}
                  payouts={payouts}
                  onPayoutCreated={handlePayoutCreated}
                />
              )}

              {activeTab === 'profile' && (
                <TutorProfileTab
                  session={session}
                  onSessionUpdated={setSession}
                />
              )}

              {activeTab === 'notifications' && (
                <TutorNotificationsTab
                  notifications={notifications}
                  onMarkRead={handleMarkNotifRead}
                  onMarkAllRead={handleMarkAllNotifsRead}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'settings' && (
                <TutorSupportSettingsTab
                  session={session}
                />
              )}

              {activeTab === 'support' && (
                <TutorSupportSettingsTab
                  session={session}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
