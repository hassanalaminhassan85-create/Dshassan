import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Calendar, User, Briefcase, Building, CheckCircle2, 
  AlertCircle, Copy, Check, RefreshCw, Send, ShieldCheck, 
  FileText, ArrowRight, ArrowLeft, Sun, Moon, Info, Sparkles, 
  Trash2, ExternalLink, ChevronDown, HelpCircle, CheckSquare,
  FileCheck2, ListOrdered, History
} from 'lucide-react';
import { Logo } from './Logo';
import { OfficialWhatsAppIcon } from './OfficialWhatsAppIcon';
import { 
  APPROVED_DEPARTMENTS, 
  APPROVED_POSITIONS, 
  OFFICIAL_MANAGEMENT_PHONE,
  OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER,
  OFFICIAL_RECIPIENT_TITLE,
  StaffProfile,
  ResumptionReport,
  ClosingReport,
  getLagosDateFormatted,
  getLagosTimeFormatted,
  evaluateResumptionSchedule,
  evaluateClosingSchedule,
  formatResumptionWhatsAppMessage,
  formatClosingWhatsAppMessage,
  generateWhatsAppUrl
} from '../lib/attendanceUtils';
import { 
  loadSavedStaffProfile, 
  saveStaffProfile, 
  clearStaffProfile,
  loadResumptionDraft,
  saveResumptionDraft,
  clearResumptionDraft,
  loadClosingDraft,
  saveClosingDraft,
  clearClosingDraft,
  persistAttendanceRecord,
  loadAttendanceSubmissionsHistory,
  AttendanceSubmissionRecord
} from '../lib/attendanceStorage';

interface StaffAttendanceSystemProps {
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  onNavigateHome?: () => void;
}

export const StaffAttendanceSystem: React.FC<StaffAttendanceSystemProps> = ({
  theme = 'light',
  setTheme,
  onNavigateHome
}) => {
  // Live Lagos time display for header (ticks every 10s)
  const [liveLagosTime, setLiveLagosTime] = useState<string>(() => getLagosTimeFormatted());
  const [liveLagosDate, setLiveLagosDate] = useState<string>(() => getLagosDateFormatted());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveLagosTime(getLagosTimeFormatted());
      setLiveLagosDate(getLagosDateFormatted());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Active Tab: 'resumption' | 'closing' | 'history'
  const [activeTab, setActiveTab] = useState<'resumption' | 'closing' | 'history'>('resumption');

  // Working hours notice collapsed/expanded state
  const [isNoticeExpanded, setIsNoticeExpanded] = useState<boolean>(true);

  // Staff Profile State (shared across both reports)
  const [profile, setProfile] = useState<StaffProfile>(() => {
    const saved = loadSavedStaffProfile();
    if (saved) return saved;
    return {
      fullName: '',
      position: APPROVED_POSITIONS[0],
      customPosition: '',
      department: APPROVED_DEPARTMENTS[0]
    };
  });
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(() => {
    const saved = loadSavedStaffProfile();
    return !saved || !saved.fullName.trim();
  });

  // Effective position string
  const resolvedPosition = useMemo(() => {
    if (profile.position === 'Other (Custom Role)') {
      return profile.customPosition?.trim() || 'Staff Officer';
    }
    return profile.position;
  }, [profile.position, profile.customPosition]);

  // Save profile to local storage whenever profile changes
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile.fullName.trim()) return;
    saveStaffProfile(profile);
    setIsEditingProfile(false);
    triggerToast('Staff details saved locally on this device.', 'success');
  };

  const handleClearProfile = () => {
    clearStaffProfile();
    setProfile({
      fullName: '',
      position: APPROVED_POSITIONS[0],
      customPosition: '',
      department: APPROVED_DEPARTMENTS[0]
    });
    setIsEditingProfile(true);
    triggerToast('Staff profile cleared.', 'info');
  };

  // ==========================================
  // RESUMPTION REPORT STATE
  // ==========================================
  // Initial visit timestamp captured immediately on load and preserved!
  const initialResumptionTimestamp = useRef<number>(Date.now());
  const [resumptionRecordId, setResumptionRecordId] = useState<string>(() => {
    const draft = loadResumptionDraft();
    return draft?.id || `DSTA-RES-${Date.now().toString().slice(-6)}`;
  });
  const [resumptionCapturedTime, setResumptionCapturedTime] = useState<number>(() => {
    const draft = loadResumptionDraft();
    return draft?.recordedTimestamp || initialResumptionTimestamp.current;
  });
  const [resumptionConfirmed, setResumptionConfirmed] = useState<boolean>(() => {
    const draft = loadResumptionDraft();
    return draft?.confirmed ?? false;
  });
  const [resumptionValidationErrors, setResumptionValidationErrors] = useState<string[]>([]);
  const [isResumptionSubmitting, setIsResumptionSubmitting] = useState<boolean>(false);
  const [resumptionSuccessMsg, setResumptionSuccessMsg] = useState<string | null>(null);

  // Formatted resumption date and time strings
  const resumptionDateStr = useMemo(() => getLagosDateFormatted(resumptionCapturedTime), [resumptionCapturedTime]);
  const resumptionTimeStr = useMemo(() => getLagosTimeFormatted(resumptionCapturedTime), [resumptionCapturedTime]);
  const resumptionSchedule = useMemo(() => evaluateResumptionSchedule(resumptionCapturedTime), [resumptionCapturedTime]);

  // Auto-save resumption draft
  useEffect(() => {
    saveResumptionDraft({
      id: resumptionRecordId,
      fullName: profile.fullName,
      position: resolvedPosition,
      department: profile.department,
      recordedTimestamp: resumptionCapturedTime,
      confirmed: resumptionConfirmed
    });
  }, [resumptionRecordId, profile.fullName, resolvedPosition, profile.department, resumptionCapturedTime, resumptionConfirmed]);

  const handleResetResumptionSession = () => {
    const newTs = Date.now();
    const newId = `DSTA-RES-${newTs.toString().slice(-6)}`;
    setResumptionCapturedTime(newTs);
    setResumptionRecordId(newId);
    setResumptionConfirmed(false);
    setResumptionSuccessMsg(null);
    clearResumptionDraft();
    triggerToast(`New resumption session initialized at ${getLagosTimeFormatted(newTs)} WAT.`, 'info');
  };

  // ==========================================
  // CLOSING REPORT STATE
  // ==========================================
  // Captured when closing report opened or explicitly initialized
  const initialClosingTimestamp = useRef<number>(Date.now());
  const [closingRecordId, setClosingRecordId] = useState<string>(() => {
    const draft = loadClosingDraft();
    return draft?.id || `DSTA-CLS-${Date.now().toString().slice(-6)}`;
  });
  const [closingCapturedTime, setClosingCapturedTime] = useState<number>(() => {
    const draft = loadClosingDraft();
    return draft?.recordedTimestamp || initialClosingTimestamp.current;
  });

  const [closingActivities, setClosingActivities] = useState<{
    act1Desc: string;
    act1Outcome: string;
    act2Desc: string;
    act2Outcome: string;
    act3Desc: string;
    act3Outcome: string;
  }>(() => {
    const draft = loadClosingDraft();
    return {
      act1Desc: draft?.activity1?.description || '',
      act1Outcome: draft?.activity1?.outcome || '',
      act2Desc: draft?.activity2?.description || '',
      act2Outcome: draft?.activity2?.outcome || '',
      act3Desc: draft?.activity3?.description || '',
      act3Outcome: draft?.activity3?.outcome || ''
    };
  });

  const [tasksCompleted, setTasksCompleted] = useState<string>(() => {
    const draft = loadClosingDraft();
    return draft?.tasksCompleted || '';
  });
  const [pendingTasks, setPendingTasks] = useState<string>(() => {
    const draft = loadClosingDraft();
    return draft?.pendingTasks || '';
  });
  const [challengesEncountered, setChallengesEncountered] = useState<string>(() => {
    const draft = loadClosingDraft();
    return draft?.challengesEncountered || '';
  });
  const [plansNextWorkingDay, setPlansNextWorkingDay] = useState<string>(() => {
    const draft = loadClosingDraft();
    return draft?.plansNextWorkingDay || '';
  });
  const [closingConfirmed, setClosingConfirmed] = useState<boolean>(() => {
    const draft = loadClosingDraft();
    return draft?.confirmed ?? false;
  });
  const [closingValidationErrors, setClosingValidationErrors] = useState<string[]>([]);
  const [isClosingSubmitting, setIsClosingSubmitting] = useState<boolean>(false);
  const [closingSuccessMsg, setClosingSuccessMsg] = useState<string | null>(null);

  // Formatted closing date and time strings
  const closingDateStr = useMemo(() => getLagosDateFormatted(closingCapturedTime), [closingCapturedTime]);
  const closingTimeStr = useMemo(() => getLagosTimeFormatted(closingCapturedTime), [closingCapturedTime]);
  const closingSchedule = useMemo(() => evaluateClosingSchedule(closingCapturedTime), [closingCapturedTime]);

  // Auto-save closing draft
  useEffect(() => {
    saveClosingDraft({
      id: closingRecordId,
      fullName: profile.fullName,
      position: resolvedPosition,
      department: profile.department,
      recordedTimestamp: closingCapturedTime,
      activity1: { description: closingActivities.act1Desc, outcome: closingActivities.act1Outcome },
      activity2: { description: closingActivities.act2Desc, outcome: closingActivities.act2Outcome },
      activity3: { description: closingActivities.act3Desc, outcome: closingActivities.act3Outcome },
      tasksCompleted,
      pendingTasks,
      challengesEncountered,
      plansNextWorkingDay,
      confirmed: closingConfirmed
    });
  }, [
    closingRecordId, profile.fullName, resolvedPosition, profile.department, 
    closingCapturedTime, closingActivities, tasksCompleted, pendingTasks, 
    challengesEncountered, plansNextWorkingDay, closingConfirmed
  ]);

  const handleResetClosingSession = () => {
    const newTs = Date.now();
    const newId = `DSTA-CLS-${newTs.toString().slice(-6)}`;
    setClosingCapturedTime(newTs);
    setClosingRecordId(newId);
    setClosingActivities({
      act1Desc: '',
      act1Outcome: '',
      act2Desc: '',
      act2Outcome: '',
      act3Desc: '',
      act3Outcome: ''
    });
    setTasksCompleted('');
    setPendingTasks('');
    setChallengesEncountered('');
    setPlansNextWorkingDay('');
    setClosingConfirmed(false);
    setClosingSuccessMsg(null);
    clearClosingDraft();
    triggerToast(`New closing report session initialized at ${getLagosTimeFormatted(newTs)} WAT.`, 'info');
  };

  // Toast System
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Copied indicator
  const [copiedState, setCopiedState] = useState<'resumption' | 'closing' | null>(null);

  // WhatsApp Handoff modal instruction state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState<boolean>(false);
  const [submittedReportType, setSubmittedReportType] = useState<'resumption' | 'closing'>('resumption');

  // Submissions history list
  const [submissionHistory, setSubmissionHistory] = useState<AttendanceSubmissionRecord[]>(() => {
    return loadAttendanceSubmissionsHistory();
  });

  const refreshHistory = () => {
    setSubmissionHistory(loadAttendanceSubmissionsHistory());
  };

  // ==========================================
  // RESUMPTION SUBMISSION HANDLER
  // ==========================================
  const handleSubmitResumption = async () => {
    const errors: string[] = [];
    if (!profile.fullName.trim()) errors.push('Staff Full Name is required.');
    if (!resolvedPosition.trim()) errors.push('Staff Position is required.');
    if (!profile.department.trim()) errors.push('Staff Department is required.');
    if (!resumptionConfirmed) errors.push('You must confirm your resumption statement.');

    if (errors.length > 0) {
      setResumptionValidationErrors(errors);
      triggerToast('Please complete all required fields.', 'error');
      return;
    }
    setResumptionValidationErrors([]);
    setIsResumptionSubmitting(true);

    const report: ResumptionReport = {
      id: resumptionRecordId,
      dateStr: resumptionDateStr,
      dateIso: new Date(resumptionCapturedTime).toISOString(),
      recordedTimeStr: resumptionTimeStr,
      recordedTimestamp: resumptionCapturedTime,
      expectedTimeStr: '8:00 AM',
      fullName: profile.fullName.trim(),
      position: resolvedPosition.trim(),
      department: profile.department.trim(),
      confirmed: resumptionConfirmed,
      submissionTarget: OFFICIAL_RECIPIENT_TITLE,
      submissionContact: OFFICIAL_MANAGEMENT_PHONE,
      status: 'submitted'
    };

    // Format WhatsApp message
    const message = formatResumptionWhatsAppMessage(report);
    const waUrl = generateWhatsAppUrl(message);

    // Persist to backend and Firestore asynchronously
    try {
      await persistAttendanceRecord('resumption', report);
      refreshHistory();
    } catch (err) {
      console.warn('Persistence log warning:', err);
    }

    setIsResumptionSubmitting(false);
    setResumptionSuccessMsg(`Resumption report prepared successfully for ${report.fullName}!`);
    setSubmittedReportType('resumption');
    setWhatsAppModalOpen(true);

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Resumption message
  const handleCopyResumption = () => {
    if (!profile.fullName.trim()) {
      triggerToast('Please provide your full name first.', 'error');
      return;
    }
    const report: ResumptionReport = {
      id: resumptionRecordId,
      dateStr: resumptionDateStr,
      dateIso: new Date(resumptionCapturedTime).toISOString(),
      recordedTimeStr: resumptionTimeStr,
      recordedTimestamp: resumptionCapturedTime,
      expectedTimeStr: '8:00 AM',
      fullName: profile.fullName.trim(),
      position: resolvedPosition.trim(),
      department: profile.department.trim(),
      confirmed: resumptionConfirmed,
      submissionTarget: OFFICIAL_RECIPIENT_TITLE,
      submissionContact: OFFICIAL_MANAGEMENT_PHONE,
      status: 'submitted'
    };
    const text = formatResumptionWhatsAppMessage(report);
    navigator.clipboard.writeText(text);
    setCopiedState('resumption');
    triggerToast('Resumption report copied to clipboard!', 'success');
    setTimeout(() => setCopiedState(null), 3000);
  };

  // ==========================================
  // CLOSING REPORT SUBMISSION HANDLER
  // ==========================================
  const handleSubmitClosing = async () => {
    const errors: string[] = [];
    if (!profile.fullName.trim()) errors.push('Staff Full Name is required.');
    if (!resolvedPosition.trim()) errors.push('Staff Position is required.');
    if (!profile.department.trim()) errors.push('Staff Department is required.');
    
    if (!closingActivities.act1Desc.trim() || !closingActivities.act1Outcome.trim()) {
      errors.push('Task/Activity 1 description and outcome are required.');
    }
    if (!closingActivities.act2Desc.trim() || !closingActivities.act2Outcome.trim()) {
      errors.push('Task/Activity 2 description and outcome are required.');
    }
    if (!closingActivities.act3Desc.trim() || !closingActivities.act3Outcome.trim()) {
      errors.push('Task/Activity 3 description and outcome are required.');
    }

    if (!tasksCompleted.trim()) errors.push('Tasks Completed is required (enter "None" if none).');
    if (!pendingTasks.trim()) errors.push('Pending Tasks is required (enter "None" if none).');
    if (!challengesEncountered.trim()) errors.push('Challenges Encountered is required (enter "None" if none).');
    if (!plansNextWorkingDay.trim()) errors.push('Plans for Next Working Day is required.');
    if (!closingConfirmed) errors.push('You must confirm your daily closing statement.');

    if (errors.length > 0) {
      setClosingValidationErrors(errors);
      triggerToast('Please complete all required fields.', 'error');
      return;
    }
    setClosingValidationErrors([]);
    setIsClosingSubmitting(true);

    const report: ClosingReport = {
      id: closingRecordId,
      dateStr: closingDateStr,
      dateIso: new Date(closingCapturedTime).toISOString(),
      recordedTimeStr: closingTimeStr,
      recordedTimestamp: closingCapturedTime,
      expectedTimeStr: '5:00 PM',
      fullName: profile.fullName.trim(),
      position: resolvedPosition.trim(),
      department: profile.department.trim(),
      activity1: {
        description: closingActivities.act1Desc.trim(),
        outcome: closingActivities.act1Outcome.trim()
      },
      activity2: {
        description: closingActivities.act2Desc.trim(),
        outcome: closingActivities.act2Outcome.trim()
      },
      activity3: {
        description: closingActivities.act3Desc.trim(),
        outcome: closingActivities.act3Outcome.trim()
      },
      tasksCompleted: tasksCompleted.trim(),
      pendingTasks: pendingTasks.trim(),
      challengesEncountered: challengesEncountered.trim(),
      plansNextWorkingDay: plansNextWorkingDay.trim(),
      confirmed: closingConfirmed,
      submissionTarget: OFFICIAL_RECIPIENT_TITLE,
      submissionContact: OFFICIAL_MANAGEMENT_PHONE,
      status: 'submitted'
    };

    // Format WhatsApp message
    const message = formatClosingWhatsAppMessage(report);
    const waUrl = generateWhatsAppUrl(message);

    // Persist to backend and Firestore
    try {
      await persistAttendanceRecord('closing', report);
      refreshHistory();
    } catch (err) {
      console.warn('Persistence log warning:', err);
    }

    setIsClosingSubmitting(false);
    setClosingSuccessMsg(`Daily closing report prepared successfully for ${report.fullName}!`);
    setSubmittedReportType('closing');
    setWhatsAppModalOpen(true);

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Closing message
  const handleCopyClosing = () => {
    if (!profile.fullName.trim()) {
      triggerToast('Please provide your full name first.', 'error');
      return;
    }
    const report: ClosingReport = {
      id: closingRecordId,
      dateStr: closingDateStr,
      dateIso: new Date(closingCapturedTime).toISOString(),
      recordedTimeStr: closingTimeStr,
      recordedTimestamp: closingCapturedTime,
      expectedTimeStr: '5:00 PM',
      fullName: profile.fullName.trim(),
      position: resolvedPosition.trim(),
      department: profile.department.trim(),
      activity1: {
        description: closingActivities.act1Desc.trim() || 'None',
        outcome: closingActivities.act1Outcome.trim() || 'None'
      },
      activity2: {
        description: closingActivities.act2Desc.trim() || 'None',
        outcome: closingActivities.act2Outcome.trim() || 'None'
      },
      activity3: {
        description: closingActivities.act3Desc.trim() || 'None',
        outcome: closingActivities.act3Outcome.trim() || 'None'
      },
      tasksCompleted: tasksCompleted.trim() || 'None',
      pendingTasks: pendingTasks.trim() || 'None',
      challengesEncountered: challengesEncountered.trim() || 'None',
      plansNextWorkingDay: plansNextWorkingDay.trim() || 'Standard duties',
      confirmed: closingConfirmed,
      submissionTarget: OFFICIAL_RECIPIENT_TITLE,
      submissionContact: OFFICIAL_MANAGEMENT_PHONE,
      status: 'submitted'
    };
    const text = formatClosingWhatsAppMessage(report);
    navigator.clipboard.writeText(text);
    setCopiedState('closing');
    triggerToast('Daily closing report copied to clipboard!', 'success');
    setTimeout(() => setCopiedState(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/95 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                : toast.type === 'info'
                  ? 'bg-indigo-50/95 dark:bg-indigo-950/95 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
                  : 'bg-emerald-50/95 dark:bg-emerald-950/95 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info size={16} className="text-indigo-500 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED ATTENDANCE HEADER BAR (Reusing exact Career visual identity) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Portal Identifier */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size="sm" showText={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#000E32] dark:text-white uppercase font-serif">
                  DS TECH ACADEMY
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[9px] font-black uppercase tracking-wider">
                  DSTA PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                Staff Attendance & Daily Reporting Gateway
              </p>
            </div>
          </div>

          {/* Right Tools: Live Lagos Clock + Theme Toggle + Return Link */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Africa/Lagos Time Clock Pill */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono text-slate-700 dark:text-slate-200"
              title="Official Africa/Lagos Time (WAT UTC+1)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">{liveLagosTime}</span>
              <span className="text-[9px] text-slate-400 uppercase hidden md:inline">WAT</span>
            </div>

            {/* Dark/Light Theme Toggle */}
            {setTheme && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="h-8.5 w-8.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 hover:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
                )}
              </button>
            )}

            {/* Return to Main Site Button */}
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                title="Return to Main Portal"
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">Main Site</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6">

        {/* SECTION 1: HERO TITLE & INSTRUCTIONS (Requirement 3) */}
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} />
            <span>DS TECH ACADEMY (DSTA)</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
            Staff Attendance & Daily Reports
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed">
            Record your daily resumption, submit your closing report, and share your attendance record with management.
          </p>
        </div>

        {/* SECTION 2: WORKING HOURS NOTICE (Requirement 8) */}
        <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/70 dark:border-amber-500/30 p-3 sm:p-4 text-left transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide block">
                  Official Working Hours & Schedule Policy
                </span>
                {isNoticeExpanded && (
                  <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-normal">
                    All staff members are expected to submit their resumption reports at 8:00 AM and their closing and daily activity reports at 5:00 PM, in accordance with their approved work schedules. Any approved alternative schedule should be followed where applicable.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
              className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline font-bold shrink-0 self-start"
            >
              {isNoticeExpanded ? 'Collapse' : 'View Notice'}
            </button>
          </div>
        </div>

        {/* SECTION 3: SHARED STAFF IDENTITY PROFILE BOX (Requirement 6) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-left space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <User size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#000E32] dark:text-white uppercase tracking-wide">
                  Staff Identity & Station
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isEditingProfile ? 'Enter details once to autofill both reports' : 'Saved on this device for rapid daily submission'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditingProfile ? (
                <>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Check size={11} /> Saved
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                </>
              ) : (
                profile.fullName && (
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-2.5 py-1 rounded-lg bg-[#000E32] dark:bg-orange-600 text-white text-[10px] font-bold uppercase transition-colors"
                  >
                    Done
                  </button>
                )
              )}
            </div>
          </div>

          {/* Form fields for Staff Profile */}
          {isEditingProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ibrahim Al-Amin"
                  value={profile.fullName}
                  onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Position / Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={profile.position}
                  onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  {APPROVED_POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                {profile.position === 'Other (Custom Role)' && (
                  <input
                    type="text"
                    placeholder="Enter custom job title..."
                    value={profile.customPosition || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, customPosition: e.target.value }))}
                    className="w-full mt-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={profile.department}
                  onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  {APPROVED_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center justify-between pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleClearProfile}
                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} /> Clear Profile
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={!profile.fullName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#000E32] dark:bg-orange-600 hover:bg-blue-950 dark:hover:bg-orange-500 text-white font-bold text-xs disabled:opacity-40 transition-colors"
                >
                  Save Profile On Device
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="font-extrabold text-[#000E32] dark:text-white truncate block">{profile.fullName}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Position</span>
                <span className="font-extrabold text-orange-600 dark:text-orange-400 truncate block">{resolvedPosition}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Department</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-200 truncate block">{profile.department}</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: NAVIGATION TABS (Resumption vs Closing vs History) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('resumption')}
            className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'resumption'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock size={14} />
            <span>1. Resumption Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('closing')}
            className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'closing'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>2. Closing & Activity Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              refreshHistory();
            }}
            className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ml-auto ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History size={14} />
            <span className="hidden sm:inline">Records</span>
          </button>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: DAILY RESUMPTION REPORT (Requirement 4)                  */}
        {/* ================================================================ */}
        {activeTab === 'resumption' && (
          <motion.div
            key="resumption-form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs text-left space-y-5">
              
              {/* Report Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-1">
                <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 uppercase tracking-widest font-black">
                  OFFICIAL DSTA SUBMISSION DOCKET
                </span>
                <h2 className="text-base sm:text-lg font-black uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  DS TECH ACADEMY (DSTA) DAILY STAFF RESUMPTION REPORT
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Resumption timestamp is captured automatically in Africa/Lagos standard time upon arrival.
                </p>
              </div>

              {/* Timestamp & Schedule Diagnostics Banner (Requirement 4 & 10) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Actual Captured Resumption Time
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-500 shrink-0" />
                    <span className="text-base sm:text-lg font-black font-mono text-[#000E32] dark:text-white">
                      {resumptionTimeStr} <span className="text-[10px] font-normal text-slate-400 font-sans">WAT</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Captured on visit: {resumptionDateStr}
                  </span>
                </div>

                <div className="space-y-1 sm:text-right flex flex-col sm:items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Resumption Schedule
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      8:00 AM WAT (Official Work Schedule)
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      resumptionSchedule.isLate
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}>
                      {resumptionSchedule.badgeLabel}
                    </span>

                    <button
                      type="button"
                      onClick={handleResetResumptionSession}
                      className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-0.5 underline"
                      title="Generate new timestamp if restarting attendance session"
                    >
                      <RefreshCw size={10} /> Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields: Day/Date, Full Name, Position, Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Day/Date Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day / Date (Africa/Lagos WAT)
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{resumptionDateStr}</span>
                    <Calendar size={14} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Automatically localized to West Africa Standard Time.
                  </span>
                </div>

                {/* Resumption Time Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resumption Time (Recorded)
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{resumptionTimeStr} WAT</span>
                    <Clock size={14} className="text-orange-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Preserved throughout your active session.
                  </span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter official full name"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Position / Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.position}
                    onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  >
                    {APPROVED_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.department}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  >
                    {APPROVED_DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Confirmation Statement (Requirement 4) */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={resumptionConfirmed}
                    onChange={(e) => setResumptionConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5 cursor-pointer shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-[#000E32] dark:text-white block">
                      Confirmation Statement
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 italic">
                      "I hereby confirm my resumption for duty today."
                    </span>
                  </div>
                </label>
              </div>

              {/* Submission Destination Metadata Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span><strong>Submitted to:</strong> {OFFICIAL_RECIPIENT_TITLE}</span>
                  <span><strong>Contact:</strong> {OFFICIAL_MANAGEMENT_PHONE}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Destination URL: <code>https://wa.me/{OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER}</code>
                </div>
              </div>

              {/* Validation errors */}
              {resumptionValidationErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} /> Please resolve the following:
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    {resumptionValidationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Notification */}
              {resumptionSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{resumptionSuccessMsg}</span>
                </div>
              )}

              {/* ACTION BUTTONS (Requirement 7) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* Official WhatsApp Submission Button */}
                <button
                  type="button"
                  onClick={handleSubmitResumption}
                  disabled={isResumptionSubmitting}
                  className="flex-1 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  aria-label="Submit Resumption via WhatsApp"
                >
                  <OfficialWhatsAppIcon size={18} animate={false} />
                  <span>Submit Resumption via WhatsApp</span>
                </button>

                {/* Copy Text Button */}
                <button
                  type="button"
                  onClick={handleCopyResumption}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80"
                  title="Copy formatted resumption text to clipboard"
                >
                  {copiedState === 'resumption' ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>

                {/* Explicit Start New Report Action */}
                <button
                  type="button"
                  onClick={handleResetResumptionSession}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80"
                  title="Create fresh resumption record and timestamp"
                >
                  <RefreshCw size={13} />
                  <span>Start New Report</span>
                </button>
              </div>

              {/* Helpful instruction notice */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
                Note: Clicking the WhatsApp button opens WhatsApp with your prefilled report. Please review the message and tap Send in WhatsApp to complete submission to management.
              </p>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: DAILY CLOSING & ACTIVITY REPORT (Requirement 5)          */}
        {/* ================================================================ */}
        {activeTab === 'closing' && (
          <motion.div
            key="closing-form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs text-left space-y-5">
              
              {/* Report Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-1">
                <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 uppercase tracking-widest font-black">
                  OFFICIAL DSTA SUBMISSION DOCKET
                </span>
                <h2 className="text-base sm:text-lg font-black uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  DS TECH ACADEMY (DSTA) DAILY STAFF CLOSING AND ACTIVITY REPORT
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Comprehensive daily task accounting, challenges log, and signing-out timestamp.
                </p>
              </div>

              {/* Timestamp & Schedule Diagnostics Banner (Requirement 5 & 10) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Actual Captured Signing-Out Time
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-500 shrink-0" />
                    <span className="text-base sm:text-lg font-black font-mono text-[#000E32] dark:text-white">
                      {closingTimeStr} <span className="text-[10px] font-normal text-slate-400 font-sans">WAT</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Captured on visit: {closingDateStr}
                  </span>
                </div>

                <div className="space-y-1 sm:text-right flex flex-col sm:items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Closing Schedule
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      5:00 PM WAT (Official Closing Time)
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                      {closingSchedule.badgeLabel}
                    </span>

                    <button
                      type="button"
                      onClick={handleResetClosingSession}
                      className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-0.5 underline"
                      title="Generate new timestamp if restarting closing report"
                    >
                      <RefreshCw size={10} /> Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Fields: Day/Date, Full Name, Position, Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day / Date (Africa/Lagos WAT)
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{closingDateStr}</span>
                    <Calendar size={14} className="text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Signing-Out Time (Recorded)
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{closingTimeStr} WAT</span>
                    <Clock size={14} className="text-orange-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter official full name"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Position / Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.position}
                    onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  >
                    {APPROVED_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profile.department}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  >
                    {APPROVED_DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ACTIVITIES PERFORMED FOR THE DAY (Requirement 5) */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ListOrdered size={16} className="text-orange-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#000E32] dark:text-white">
                    Activities Performed for the Day
                  </h3>
                </div>

                {/* Task 1 */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#000E32] dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                      Task / Activity 1 <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="What task or duty was undertaken..."
                        value={closingActivities.act1Desc}
                        onChange={(e) => setClosingActivities(prev => ({ ...prev, act1Desc: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Outcome / Result
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Specific deliverable or tangible result..."
                        value={closingActivities.act1Outcome}
                        onChange={(e) => setClosingActivities(prev => ({ ...prev, act1Outcome: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#000E32] dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                      Task / Activity 2 <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="What task or duty was undertaken..."
                        value={closingActivities.act2Desc}
                        onChange={(e) => setClosingActivities(prev => ({ ...prev, act2Desc: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Outcome / Result
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Specific deliverable or tangible result..."
                        value={closingActivities.act2Outcome}
                        onChange={(e) => setClosingActivities(prev => ({ ...prev, act2Outcome: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Task 3 */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#000E32] dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                      Task / Activity 3 <span className="text-rose-500">*</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="What task or duty was undertaken..."
                        value={closingActivities.act3Desc}
                        onChange={(e) => setClosingActivities(prev => ({ ...prev, act3Desc: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Outcome / Result
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Specific deliverable or tangible result..."
                        value={closingActivities.act3Outcome}
                        onChange={(e) => setClosingActivities(prev => ({ ...prev, act3Outcome: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDITIONAL REQUIRED FIELDS: Tasks Completed, Pending, Challenges, Plans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                
                {/* Tasks Completed */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tasks Completed <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTasksCompleted('None')}
                      className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="List completed items or enter None"
                    value={tasksCompleted}
                    onChange={(e) => setTasksCompleted(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>

                {/* Pending Tasks */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pending Tasks <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPendingTasks('None')}
                      className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="List unfinished items or enter None"
                    value={pendingTasks}
                    onChange={(e) => setPendingTasks(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>

                {/* Challenges Encountered */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Challenges Encountered <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setChallengesEncountered('None')}
                      className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Obstacles, network, or logistics encountered (or None)"
                    value={challengesEncountered}
                    onChange={(e) => setChallengesEncountered(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>

                {/* Plans for Next Working Day */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plans for Next Working Day <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key objectives scheduled for tomorrow..."
                    value={plansNextWorkingDay}
                    onChange={(e) => setPlansNextWorkingDay(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
              </div>

              {/* Confirmation statement (Requirement 5) */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={closingConfirmed}
                    onChange={(e) => setClosingConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5 cursor-pointer shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-[#000E32] dark:text-white block">
                      Confirmation Statement
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 italic">
                      "I hereby submit my daily closing and activity report for management review."
                    </span>
                  </div>
                </label>
              </div>

              {/* Submission Destination Metadata Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span><strong>Submitted to:</strong> {OFFICIAL_RECIPIENT_TITLE}</span>
                  <span><strong>Contact:</strong> {OFFICIAL_MANAGEMENT_PHONE}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Destination URL: <code>https://wa.me/{OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER}</code>
                </div>
              </div>

              {/* Validation errors */}
              {closingValidationErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} /> Please resolve the following:
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    {closingValidationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Notification */}
              {closingSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{closingSuccessMsg}</span>
                </div>
              )}

              {/* ACTION BUTTONS (Requirement 7) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* Official WhatsApp Submission Button */}
                <button
                  type="button"
                  onClick={handleSubmitClosing}
                  disabled={isClosingSubmitting}
                  className="flex-1 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  aria-label="Submit Closing Report via WhatsApp"
                >
                  <OfficialWhatsAppIcon size={18} animate={false} />
                  <span>Submit Closing Report via WhatsApp</span>
                </button>

                {/* Copy Text Button */}
                <button
                  type="button"
                  onClick={handleCopyClosing}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80"
                  title="Copy formatted closing text to clipboard"
                >
                  {copiedState === 'closing' ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>

                {/* Explicit Start New Report Action */}
                <button
                  type="button"
                  onClick={handleResetClosingSession}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80"
                  title="Create fresh closing report record and timestamp"
                >
                  <RefreshCw size={13} />
                  <span>Start New Report</span>
                </button>
              </div>

              {/* Helpful instruction notice */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
                Note: Clicking the WhatsApp button opens WhatsApp with your prefilled report. Please review the message and tap Send in WhatsApp to complete submission to management.
              </p>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: LOCAL SUBMISSIONS HISTORY DRAWER / AUDIT LOG              */}
        {/* ================================================================ */}
        {activeTab === 'history' && (
          <motion.div
            key="history-panel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  Local Attendance & Submission History
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Records staged and transmitted from this workstation.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshHistory}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {submissionHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <History size={32} className="mx-auto opacity-40" />
                <p className="text-xs font-bold uppercase tracking-wider">No local submissions logged yet</p>
                <p className="text-[11px] text-slate-500">Submissions from Tab 1 and Tab 2 will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          item.type === 'resumption'
                            ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                            : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {item.type === 'resumption' ? 'Resumption Report' : 'Closing & Activity'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">#{item.id}</span>
                        {item.syncedToBackend && (
                          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                            Backend Synced
                          </span>
                        )}
                      </div>
                      
                      <div className="font-extrabold text-[#000E32] dark:text-white">
                        {item.fullName} • <span className="font-normal text-slate-500">{item.position}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.dateStr} • Recorded at {item.recordedTimeStr} WAT
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = item.type === 'resumption'
                          ? formatResumptionWhatsAppMessage(item.data as ResumptionReport)
                          : formatClosingWhatsAppMessage(item.data as ClosingReport);
                        const url = generateWhatsAppUrl(msg);
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 self-start sm:self-center"
                    >
                      <OfficialWhatsAppIcon size={14} animate={false} />
                      <span>Re-Open WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* WHATSAPP SUBMISSION INSTRUCTION MODAL (Requirement 7) */}
      <AnimatePresence>
        {whatsAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#25D366] flex items-center justify-center mx-auto">
                <OfficialWhatsAppIcon size={28} animate={false} />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  WhatsApp Handoff Triggered
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your {submittedReportType === 'resumption' ? 'Daily Resumption' : 'Daily Closing'} report has been formatted and prefilled for <strong>{OFFICIAL_RECIPIENT_TITLE}</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={16} /> Report Staged on Official Channel
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Important Step:</strong> Opening WhatsApp does not automatically send your report. Please review the prefilled message in WhatsApp and tap the <strong>Send</strong> button to deliver it to <strong>{OFFICIAL_MANAGEMENT_PHONE}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setWhatsAppModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#000E32] dark:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Understood & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
