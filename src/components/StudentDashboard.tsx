import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  StudentSession, 
  CourseProgressRecord, 
  AcademyPaymentRecord, 
  StudentSubmission, 
  AcademyNotificationItem,
  getActiveStudentSession,
  clearStudentSession,
  apiGetCourseProgress,
  apiGetPaymentsForUser,
  apiGetSubmissionsForUser,
  apiGetNotificationsForUser,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiRecordVerifiedPayment
} from '../lib/academyStorage';
import { AcademyCourse, ACADEMY_COURSES, getCourseByCode } from '../lib/academyCoursesData';
import { AcademyEnrollment } from '../types/enrollment';
import { apiGetEnrollmentsByStudentEmail } from '../lib/enrollmentStorage';

// Modular Subcomponents
import { StudentAuthGate } from './StudentDashboard/StudentAuthGate';
import { StudentSidebar, StudentTabType } from './StudentDashboard/StudentSidebar';
import { StudentHeader } from './StudentDashboard/StudentHeader';
import { StudentOverviewTab } from './StudentDashboard/StudentOverviewTab';
import { StudentCoursesTab } from './StudentDashboard/StudentCoursesTab';
import { StudentLearningTab } from './StudentDashboard/StudentLearningTab';
import { StudentEnrollmentsTab } from './StudentDashboard/StudentEnrollmentsTab';
import { StudentPaymentsTab } from './StudentDashboard/StudentPaymentsTab';
import { StudentPaymentHistoryTab } from './StudentDashboard/StudentPaymentHistoryTab';
import { StudentProfileTab } from './StudentDashboard/StudentProfileTab';
import { StudentNotificationsTab } from './StudentDashboard/StudentNotificationsTab';
import { StudentSupportSettingsTab } from './StudentDashboard/StudentSupportSettingsTab';

interface StudentDashboardProps {
  onBackToPortal?: () => void;
  onNavigateToApply?: () => void;
  onNavigatePathway?: (pathwayPath: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onBackToPortal,
  onNavigateToApply,
  onNavigatePathway
}) => {
  // Session State
  const [session, setSession] = useState<StudentSession | null>(() => getActiveStudentSession());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StudentTabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data States
  const [enrolledCourses, setEnrolledCourses] = useState<AcademyCourse[]>([]);
  const [activeLearningCourse, setActiveLearningCourse] = useState<AcademyCourse>(ACADEMY_COURSES[0]);
  const [progressRecord, setProgressRecord] = useState<CourseProgressRecord>({
    id: 'prog_init',
    studentEmail: '',
    courseCode: '',
    completedTopics: [],
    completedModules: [],
    progressPercentage: 0,
    currentModuleIndex: 0,
    currentTopicIndex: 0,
    quizScores: {},
    lastAccessedAt: new Date().toISOString(),
    lastActivityDate: new Date().toISOString()
  });
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<AcademyPaymentRecord[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [notifications, setNotifications] = useState<AcademyNotificationItem[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<AcademyPaymentRecord | null>(null);

  // Load and synchronize student data when session is active
  useEffect(() => {
    if (!session) return;

    const loadStudentData = async () => {
      // 1. Determine enrolled courses
      const primaryCourse = getCourseByCode(session.courseCode) || ACADEMY_COURSES[0];
      const additionalCourse = ACADEMY_COURSES.find(c => c.code === 'DSTA-AI101') || ACADEMY_COURSES[1];
      const list = [primaryCourse];
      if (session.id === 'stu_demo_aisha' && additionalCourse) {
        list.push(additionalCourse);
      }
      setEnrolledCourses(list);
      setActiveLearningCourse(primaryCourse);

      // 2. Load Course Progress
      const prog = await apiGetCourseProgress(
        session.email,
        primaryCourse.code,
        primaryCourse.modules.reduce((a, m) => a + m.topics.length, 0)
      );
      setProgressRecord(prog);

      // 3. Load Enrollments
      const userEnrollments = await apiGetEnrollmentsByStudentEmail(session.email);
      if (userEnrollments.length > 0) {
        setEnrollments(userEnrollments);
      } else {
        // Create initial default enrollment record for new session
        const defaultEnr: AcademyEnrollment = {
          id: `ENR-${Date.now().toString().slice(-6)}`,
          enrollmentNumber: `ENR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: session.studentId,
          studentEmail: session.email,
          studentName: session.fullName,
          studentPhone: session.phone,
          courseId: primaryCourse.id,
          courseCode: primaryCourse.code,
          courseTitle: primaryCourse.title,
          categoryName: primaryCourse.industry,
          duration: primaryCourse.duration,
          mode: session.mode,
          lectureDays: 'Mondays & Wednesdays',
          language: 'English',
          location: 'Abuja Campus Hub',
          amount: primaryCourse.price || 75000,
          paymentMethod: 'paystack',
          paymentStatus: 'verified',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setEnrollments([defaultEnr]);
      }

      // 4. Load Payments
      const userPayments = await apiGetPaymentsForUser(session.email);
      setPaymentRecords(userPayments);

      // 5. Load Submissions
      const userSubmissions = await apiGetSubmissionsForUser(session.email);
      setSubmissions(userSubmissions);

      // 6. Load Notifications
      const userNotifs = await apiGetNotificationsForUser(session.email);
      setNotifications(userNotifs);
    };

    loadStudentData();
  }, [session]);

  // Handle Logout
  const handleLogout = () => {
    clearStudentSession();
    setSession(null);
  };

  // Handle Notification Read
  const handleMarkNotifRead = async (id: string) => {
    if (!session) return;
    const updated = await apiMarkNotificationRead(session.email, id);
    setNotifications(updated);
  };

  const handleMarkAllNotifsRead = async () => {
    if (!session) return;
    const updated = await apiMarkAllNotificationsRead(session.email);
    setNotifications(updated);
  };

  // Switch to Learning Workspace for a specific course
  const handleLaunchCourse = (course: AcademyCourse) => {
    setActiveLearningCourse(course);
    setActiveTab('learning');
  };

  // Handle proceed to pay an enrollment
  const handleProceedToPay = (enrollment: AcademyEnrollment) => {
    setActiveTab('payments');
  };

  // If user is not authenticated as a student, render the StudentAuthGate
  if (!session || !session.isAuthenticated) {
    return (
      <StudentAuthGate
        onAuthenticated={(newSession) => setSession(newSession)}
        onBackToPortal={onBackToPortal}
        onRegisterNewStudent={onNavigateToApply}
      />
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased transition-colors">
      {/* 1. Dedicated Standalone Student Sidebar */}
      <StudentSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        session={session}
        unreadNotifsCount={unreadNotifsCount}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        overallProgress={progressRecord.progressPercentage}
      />

      {/* 2. Main Body Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Modern Responsive Header */}
        <StudentHeader
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
                <StudentOverviewTab
                  session={session}
                  primaryCourse={enrolledCourses[0] || ACADEMY_COURSES[0]}
                  enrolledCourses={enrolledCourses}
                  progressRecord={progressRecord}
                  paymentRecords={paymentRecords}
                  submissions={submissions}
                  onSelectTab={setActiveTab}
                  onLaunchCourse={handleLaunchCourse}
                />
              )}

              {activeTab === 'courses' && (
                <StudentCoursesTab
                  session={session}
                  enrolledCourses={enrolledCourses}
                  progressRecord={progressRecord}
                  onLaunchCourse={handleLaunchCourse}
                  onEnrollNewCourse={(course) => {
                    setActiveTab('enrollments');
                  }}
                />
              )}

              {activeTab === 'learning' && (
                <StudentLearningTab
                  session={session}
                  activeCourse={activeLearningCourse}
                  enrolledCourses={enrolledCourses}
                  onSelectCourse={setActiveLearningCourse}
                  progressRecord={progressRecord}
                  onProgressUpdated={setProgressRecord}
                  submissions={submissions}
                  onSubmissionAdded={(sub) => setSubmissions([sub, ...submissions])}
                />
              )}

              {activeTab === 'enrollments' && (
                <StudentEnrollmentsTab
                  session={session}
                  enrollments={enrollments}
                  onEnrollmentAdded={(enr) => setEnrollments([enr, ...enrollments])}
                  onProceedToPay={handleProceedToPay}
                />
              )}

              {activeTab === 'payments' && (
                <StudentPaymentsTab
                  session={session}
                  enrollments={enrollments}
                  enrolledCourses={enrolledCourses}
                  paymentRecords={paymentRecords}
                  onPaymentCompleted={(rec) => setPaymentRecords([rec, ...paymentRecords])}
                  onViewReceipt={(rec) => {
                    setSelectedReceipt(rec);
                    setActiveTab('payment-history');
                  }}
                />
              )}

              {activeTab === 'payment-history' && (
                <StudentPaymentHistoryTab
                  session={session}
                  paymentRecords={paymentRecords}
                  selectedReceipt={selectedReceipt}
                  onCloseReceipt={() => setSelectedReceipt(null)}
                  onViewReceipt={(rec) => setSelectedReceipt(rec)}
                />
              )}

              {activeTab === 'profile' && (
                <StudentProfileTab
                  session={session}
                  onSessionUpdated={setSession}
                />
              )}

              {activeTab === 'notifications' && (
                <StudentNotificationsTab
                  notifications={notifications}
                  onMarkRead={handleMarkNotifRead}
                  onMarkAllRead={handleMarkAllNotifsRead}
                  onClearAll={() => setNotifications([])}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'settings' && (
                <StudentSupportSettingsTab
                  session={session}
                />
              )}

              {activeTab === 'support' && (
                <StudentSupportSettingsTab
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
