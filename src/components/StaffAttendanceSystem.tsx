import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Calendar, User, Briefcase, Building, CheckCircle2, 
  AlertCircle, Copy, Check, RefreshCw, Send, ShieldCheck, 
  FileText, ArrowLeft, Sun, Moon, Info, Sparkles, 
  Trash2, X, History, CheckSquare, ChevronRight
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
  // Live Lagos time display (updates every 10s)
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

  // Policy Modal state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);

  // Staff Profile State (shared across reports & retained in localStorage)
  const [fullName, setFullName] = useState<string>(() => {
    const saved = loadSavedStaffProfile();
    return saved?.fullName || '';
  });
  const [position, setPosition] = useState<string>(() => {
    const saved = loadSavedStaffProfile();
    return saved?.position || '';
  });
  const [department, setDepartment] = useState<string>(() => {
    const saved = loadSavedStaffProfile();
    return saved?.department || '';
  });

  // Automatically remember entered staff details for subsequent reports
  useEffect(() => {
    if (fullName.trim() || position.trim() || department.trim()) {
      saveStaffProfile({
        fullName: fullName.trim(),
        position: position.trim(),
        department: department.trim()
      });
    }
  }, [fullName, position, department]);

  const handleClearSavedProfile = () => {
    clearStaffProfile();
    setFullName('');
    setPosition('');
    setDepartment('');
    triggerToast('Staff profile cleared from this browser.', 'info');
  };

  // ==========================================
  // RESUMPTION REPORT STATE
  // ==========================================
  const initialResumptionTimestamp = useRef<number>(Date.now());
  const [resumptionRecordId, setResumptionRecordId] = useState<string>(() => {
    const draft = loadResumptionDraft();
    return draft?.id || `DST-RES-${Date.now().toString().slice(-6)}`;
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

  // Formatted resumption date and time strings
  const resumptionDateStr = useMemo(() => getLagosDateFormatted(resumptionCapturedTime), [resumptionCapturedTime]);
  const resumptionTimeStr = useMemo(() => getLagosTimeFormatted(resumptionCapturedTime), [resumptionCapturedTime]);
  const resumptionSchedule = useMemo(() => evaluateResumptionSchedule(resumptionCapturedTime), [resumptionCapturedTime]);

  // Auto-save resumption draft
  useEffect(() => {
    saveResumptionDraft({
      id: resumptionRecordId,
      fullName,
      position,
      department,
      recordedTimestamp: resumptionCapturedTime,
      confirmed: resumptionConfirmed
    });
  }, [resumptionRecordId, fullName, position, department, resumptionCapturedTime, resumptionConfirmed]);

  const handleResetResumptionSession = () => {
    const newTs = Date.now();
    const newId = `DST-RES-${newTs.toString().slice(-6)}`;
    setResumptionCapturedTime(newTs);
    setResumptionRecordId(newId);
    setResumptionConfirmed(false);
    clearResumptionDraft();
    triggerToast(`New resumption session started at ${getLagosTimeFormatted(newTs)} WAT.`, 'info');
  };

  // ==========================================
  // CLOSING REPORT STATE
  // ==========================================
  const initialClosingTimestamp = useRef<number>(Date.now());
  const [closingRecordId, setClosingRecordId] = useState<string>(() => {
    const draft = loadClosingDraft();
    return draft?.id || `DST-CLS-${Date.now().toString().slice(-6)}`;
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

  // Formatted closing date and time strings
  const closingDateStr = useMemo(() => getLagosDateFormatted(closingCapturedTime), [closingCapturedTime]);
  const closingTimeStr = useMemo(() => getLagosTimeFormatted(closingCapturedTime), [closingCapturedTime]);
  const closingSchedule = useMemo(() => evaluateClosingSchedule(closingCapturedTime), [closingCapturedTime]);

  // Auto-save closing draft
  useEffect(() => {
    saveClosingDraft({
      id: closingRecordId,
      fullName,
      position,
      department,
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
    closingRecordId, fullName, position, department, 
    closingCapturedTime, closingActivities, tasksCompleted, pendingTasks, 
    challengesEncountered, plansNextWorkingDay, closingConfirmed
  ]);

  const handleResetClosingSession = () => {
    const newTs = Date.now();
    const newId = `DST-CLS-${newTs.toString().slice(-6)}`;
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
    clearClosingDraft();
    triggerToast(`New closing report session started at ${getLagosTimeFormatted(newTs)} WAT.`, 'info');
  };

  // Toast System
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Copied indicator
  const [copiedState, setCopiedState] = useState<'resumption' | 'closing' | null>(null);

  // WhatsApp Handoff modal state
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
    if (!fullName.trim()) errors.push('Full Name is required.');
    if (!position.trim()) errors.push('Position / Role is required.');
    if (!department.trim()) errors.push('Department is required.');
    if (!resumptionConfirmed) errors.push('Please confirm the resumption declaration.');

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
      fullName: fullName.trim(),
      position: position.trim(),
      department: department.trim(),
      confirmed: resumptionConfirmed,
      submissionTarget: OFFICIAL_RECIPIENT_TITLE,
      submissionContact: OFFICIAL_MANAGEMENT_PHONE,
      status: 'submitted'
    };

    const message = formatResumptionWhatsAppMessage(report);
    const waUrl = generateWhatsAppUrl(message);

    try {
      await persistAttendanceRecord('resumption', report);
      refreshHistory();
    } catch (err) {
      console.warn('Persistence log warning:', err);
    }

    setIsResumptionSubmitting(false);
    setSubmittedReportType('resumption');
    setWhatsAppModalOpen(true);

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyResumption = () => {
    if (!fullName.trim()) {
      triggerToast('Please enter your full name first.', 'error');
      return;
    }
    const report: ResumptionReport = {
      id: resumptionRecordId,
      dateStr: resumptionDateStr,
      dateIso: new Date(resumptionCapturedTime).toISOString(),
      recordedTimeStr: resumptionTimeStr,
      recordedTimestamp: resumptionCapturedTime,
      expectedTimeStr: '8:00 AM',
      fullName: fullName.trim(),
      position: position.trim() || 'Staff Member',
      department: department.trim() || 'DS TECH',
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
    if (!fullName.trim()) errors.push('Full Name is required.');
    if (!position.trim()) errors.push('Position / Role is required.');
    if (!department.trim()) errors.push('Department is required.');
    
    if (!closingActivities.act1Desc.trim() || !closingActivities.act1Outcome.trim()) {
      errors.push('Task 1 description & outcome are required.');
    }
    if (!closingActivities.act2Desc.trim() || !closingActivities.act2Outcome.trim()) {
      errors.push('Task 2 description & outcome are required.');
    }
    if (!closingActivities.act3Desc.trim() || !closingActivities.act3Outcome.trim()) {
      errors.push('Task 3 description & outcome are required.');
    }

    if (!tasksCompleted.trim()) errors.push('Tasks Completed is required (type "None" if none).');
    if (!pendingTasks.trim()) errors.push('Pending Tasks is required (type "None" if none).');
    if (!challengesEncountered.trim()) errors.push('Challenges Encountered is required (type "None" if none).');
    if (!plansNextWorkingDay.trim()) errors.push('Plans for Next Working Day is required.');
    if (!closingConfirmed) errors.push('Please confirm the closing declaration.');

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
      fullName: fullName.trim(),
      position: position.trim(),
      department: department.trim(),
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

    const message = formatClosingWhatsAppMessage(report);
    const waUrl = generateWhatsAppUrl(message);

    try {
      await persistAttendanceRecord('closing', report);
      refreshHistory();
    } catch (err) {
      console.warn('Persistence log warning:', err);
    }

    setIsClosingSubmitting(false);
    setSubmittedReportType('closing');
    setWhatsAppModalOpen(true);

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyClosing = () => {
    if (!fullName.trim()) {
      triggerToast('Please enter your full name first.', 'error');
      return;
    }
    const report: ClosingReport = {
      id: closingRecordId,
      dateStr: closingDateStr,
      dateIso: new Date(closingCapturedTime).toISOString(),
      recordedTimeStr: closingTimeStr,
      recordedTimestamp: closingCapturedTime,
      expectedTimeStr: '5:00 PM',
      fullName: fullName.trim(),
      position: position.trim() || 'Staff Member',
      department: department.trim() || 'DS TECH',
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
      plansNextWorkingDay: plansNextWorkingDay.trim() || 'Resuming daily duties',
      confirmed: closingConfirmed,
      submissionTarget: OFFICIAL_RECIPIENT_TITLE,
      submissionContact: OFFICIAL_MANAGEMENT_PHONE,
      status: 'submitted'
    };
    const text = formatClosingWhatsAppMessage(report);
    navigator.clipboard.writeText(text);
    setCopiedState('closing');
    triggerToast('Closing report copied to clipboard!', 'success');
    setTimeout(() => setCopiedState(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-3 right-3 z-50 max-w-sm px-3.5 py-2 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/95 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                : toast.type === 'info'
                  ? 'bg-indigo-50/95 dark:bg-indigo-950/95 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
                  : 'bg-emerald-50/95 dark:bg-emerald-950/95 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={14} className="text-rose-500 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info size={14} className="text-indigo-500 shrink-0" />
            ) : (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. ULTRA-COMPACT HEADER (DS TECH branding, zero Academy references, tight height) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-colors">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 h-12 sm:h-13 flex items-center justify-between gap-2">
          
          {/* Logo & DS TECH Title */}
          <div className="flex items-center gap-2 min-w-0">
            <Logo size="sm" showText={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#000E32] dark:text-white uppercase font-serif truncate">
                  DS TECH
                </span>
                <span className="px-1.5 py-0.2 rounded bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[9px] font-black uppercase tracking-wider shrink-0">
                  DST
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Staff Attendance & Daily Reports
              </p>
            </div>
          </div>

          {/* Right Controls: Live Lagos Time, Theme Toggle, Main Link */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-[10px] sm:text-[11px] font-mono text-slate-700 dark:text-slate-200"
              title="Africa/Lagos Time (WAT UTC+1)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">{liveLagosTime}</span>
              <span className="text-[9px] text-slate-400 uppercase hidden sm:inline">WAT</span>
            </div>

            {setTheme && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                )}
              </button>
            )}

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-[10px] sm:text-[11px] font-semibold flex items-center gap-1"
                title="Return to Main Portal"
              >
                <ArrowLeft size={11} />
                <span className="hidden sm:inline">Main</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. ULTRA-SLENDER NOTICE BAR (Very small at top, polished UI/UX, no oversized cards) */}
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-t border-amber-300/40 dark:border-amber-500/20 px-3 sm:px-5 py-0.5 flex items-center justify-between text-[10px] text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 truncate">
            <Clock size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold truncate">
              Standard Hours: Resumption <strong>8:00 AM</strong> • Closing <strong>5:00 PM</strong> WAT
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsPolicyModalOpen(true)}
            className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline font-bold shrink-0 ml-2 cursor-pointer flex items-center gap-0.5"
          >
            <Info size={10} />
            <span>Policy</span>
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE (Tight layout so the form is immediately fully visible without excessive vertical scrolling) */}
      <main className="max-w-4xl w-full mx-auto px-3 sm:px-5 py-2.5 sm:py-3 space-y-2.5 text-left flex-1">

        {/* 3. COMPACT TABS */}
        <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('resumption')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'resumption'
                  ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <Clock size={12} />
              <span>Resumption (8:00 AM)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('closing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'closing'
                  ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <FileText size={12} />
              <span>Closing & Activity (5:00 PM)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              refreshHistory();
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              activeTab === 'history'
                ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History size={12} />
            <span className="hidden sm:inline">Records</span>
            {submissionHistory.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] flex items-center justify-center font-bold">
                {submissionHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: DAILY RESUMPTION REPORT (Fully visible without big gaps)   */}
        {/* ================================================================ */}
        {activeTab === 'resumption' && (
          <motion.div
            key="resumption-form"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs space-y-3">
              
              {/* Header Title & Captured Punctuality Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h2 className="text-xs sm:text-sm font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                    DS TECH DAILY STAFF RESUMPTION REPORT
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Day/Date: <strong className="text-slate-700 dark:text-slate-200">{resumptionDateStr}</strong>
                  </p>
                </div>

                {/* Compact Resumption Status Pill with Reset */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <div className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono flex items-center gap-1.5">
                    <Clock size={11} className="text-orange-500" />
                    <span className="font-bold text-[#000E32] dark:text-white">{resumptionTimeStr} WAT</span>
                    <span className="text-[9px] text-slate-400">| Target 8:00 AM</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    resumptionSchedule.isLate
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {resumptionSchedule.badgeLabel}
                  </span>

                  <button
                    type="button"
                    onClick={handleResetResumptionSession}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Generate fresh resumption timestamp"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>

              {/* Staff Details: Full Name, Position, Department (Smart Inputs, NO "manual" labels) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-8.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Position / Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="dst-approved-positions"
                    placeholder="e.g. Lead Frontend Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-8.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="dst-approved-departments"
                    placeholder="e.g. IT & Software Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-8.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Confirmation Statement */}
              <div className="p-2 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={resumptionConfirmed}
                    onChange={(e) => setResumptionConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-[#000E32] dark:text-white">
                      Declaration:
                    </span>{' '}
                    <span className="text-slate-700 dark:text-slate-300 italic">
                      "I hereby confirm my resumption for duty today."
                    </span>
                  </div>
                </label>
              </div>

              {/* Validation errors */}
              {resumptionValidationErrors.length > 0 && (
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-0.5">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertCircle size={12} /> Required:
                  </div>
                  <ul className="list-disc list-inside text-[11px]">
                    {resumptionValidationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: WhatsApp Submit + Copy + Start New */}
              <div className="pt-0.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmitResumption}
                  disabled={isResumptionSubmitting}
                  className="flex-1 h-9.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <OfficialWhatsAppIcon size={16} animate={false} />
                  <span>Submit Resumption via WhatsApp</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyResumption}
                    className="h-9.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80"
                    title="Copy report text"
                  >
                    {copiedState === 'resumption' ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetResumptionSession}
                    className="h-9.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-slate-200/80 dark:border-slate-700/80"
                    title="Reset timestamp"
                  >
                    <RefreshCw size={11} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              </div>

              {/* Destination Metadata Footer */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>Submitted to: <strong>{OFFICIAL_RECIPIENT_TITLE}</strong> ({OFFICIAL_MANAGEMENT_PHONE})</span>
                <span>Ref: #{resumptionRecordId}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: DAILY CLOSING & ACTIVITY REPORT (Compact, Fully Visible)  */}
        {/* ================================================================ */}
        {activeTab === 'closing' && (
          <motion.div
            key="closing-form"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs space-y-3">
              
              {/* Header Title & Captured Signing-Out Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h2 className="text-xs sm:text-sm font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                    DS TECH DAILY STAFF CLOSING AND ACTIVITY REPORT
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Day/Date: <strong className="text-slate-700 dark:text-slate-200">{closingDateStr}</strong>
                  </p>
                </div>

                {/* Compact Closing Status Pill with Reset */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <div className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono flex items-center gap-1.5">
                    <Clock size={11} className="text-orange-500" />
                    <span className="font-bold text-[#000E32] dark:text-white">{closingTimeStr} WAT</span>
                    <span className="text-[9px] text-slate-400">| Target 5:00 PM</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                    {closingSchedule.badgeLabel}
                  </span>

                  <button
                    type="button"
                    onClick={handleResetClosingSession}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Generate fresh closing timestamp"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>

              {/* Staff Details: Full Name, Position, Department (Smart inputs) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-8.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Position / Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="dst-approved-positions"
                    placeholder="e.g. Lead Frontend Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-8.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="dst-approved-departments"
                    placeholder="e.g. IT & Software Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-8.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Activities Performed for the Day */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Activities Performed for the Day
                </span>

                {/* Activity 1 */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      1. Task Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Developed responsive components for client dashboard"
                      value={closingActivities.act1Desc}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act1Desc: e.target.value }))}
                      className="w-full h-7.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Outcome / Result <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Code merged to main branch and verified on staging"
                      value={closingActivities.act1Outcome}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act1Outcome: e.target.value }))}
                      className="w-full h-7.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      2. Task Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Conducted client briefing and sprint backlog review"
                      value={closingActivities.act2Desc}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act2Desc: e.target.value }))}
                      className="w-full h-7.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Outcome / Result <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Project milestones confirmed and deliverables aligned"
                      value={closingActivities.act2Outcome}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act2Outcome: e.target.value }))}
                      className="w-full h-7.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      3. Task Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Performed routine cloud infrastructure health check"
                      value={closingActivities.act3Desc}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act3Desc: e.target.value }))}
                      className="w-full h-7.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Outcome / Result <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All API routes & databases 100% operational"
                      value={closingActivities.act3Outcome}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act3Outcome: e.target.value }))}
                      className="w-full h-7.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Tasks Completed, Pending, Challenges, Plans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Tasks Completed <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTasksCompleted('None')}
                      className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="List completed tasks or None"
                    value={tasksCompleted}
                    onChange={(e) => setTasksCompleted(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Pending Tasks <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPendingTasks('None')}
                      className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="List unfinished items or None"
                    value={pendingTasks}
                    onChange={(e) => setPendingTasks(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Challenges Encountered <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setChallengesEncountered('None')}
                      className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Obstacles encountered or None"
                    value={challengesEncountered}
                    onChange={(e) => setChallengesEncountered(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Plans for Next Working Day <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Key objectives planned for tomorrow"
                    value={plansNextWorkingDay}
                    onChange={(e) => setPlansNextWorkingDay(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Confirmation Statement */}
              <div className="p-2 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={closingConfirmed}
                    onChange={(e) => setClosingConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-[#000E32] dark:text-white">
                      Declaration:
                    </span>{' '}
                    <span className="text-slate-700 dark:text-slate-300 italic">
                      "I hereby submit my daily closing and activity report for management review."
                    </span>
                  </div>
                </label>
              </div>

              {/* Validation errors */}
              {closingValidationErrors.length > 0 && (
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-0.5">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertCircle size={12} /> Required:
                  </div>
                  <ul className="list-disc list-inside text-[11px]">
                    {closingValidationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: WhatsApp Submit + Copy + Start New */}
              <div className="pt-0.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmitClosing}
                  disabled={isClosingSubmitting}
                  className="flex-1 h-9.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <OfficialWhatsAppIcon size={16} animate={false} />
                  <span>Submit Closing Report via WhatsApp</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyClosing}
                    className="h-9.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80"
                    title="Copy closing report text"
                  >
                    {copiedState === 'closing' ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetClosingSession}
                    className="h-9.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-slate-200/80 dark:border-slate-700/80"
                    title="Reset timestamp"
                  >
                    <RefreshCw size={11} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              </div>

              {/* Destination Metadata Footer */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>Submitted to: <strong>{OFFICIAL_RECIPIENT_TITLE}</strong> ({OFFICIAL_MANAGEMENT_PHONE})</span>
                <span>Ref: #{closingRecordId}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: SUBMISSIONS HISTORY                                       */}
        {/* ================================================================ */}
        {activeTab === 'history' && (
          <motion.div
            key="history-panel"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs text-left space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  Local Attendance & Submission History
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Reports logged on this browser session.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSavedProfile}
                  className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-0.5 cursor-pointer"
                  title="Clear remembered profile"
                >
                  <Trash2 size={11} /> Clear Profile
                </button>
                <button
                  type="button"
                  onClick={refreshHistory}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
            </div>

            {submissionHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <History size={24} className="mx-auto opacity-40" />
                <p className="text-xs font-bold uppercase tracking-wider">No submissions logged yet</p>
                <p className="text-[11px] text-slate-500">Reports submitted via WhatsApp will appear here.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {submissionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                          item.type === 'resumption'
                            ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                            : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {item.type === 'resumption' ? 'Resumption' : 'Closing & Activity'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">#{item.id}</span>
                        {item.syncedToBackend && (
                          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded">
                            Synced
                          </span>
                        )}
                      </div>
                      
                      <div className="font-bold text-[#000E32] dark:text-white">
                        {item.fullName} • <span className="font-normal text-slate-500">{item.position}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.dateStr} • {item.recordedTimeStr} WAT
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
                      className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold flex items-center justify-center gap-1 self-start sm:self-center cursor-pointer"
                    >
                      <OfficialWhatsAppIcon size={12} animate={false} />
                      <span>Re-Open</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* Datalists for Smart Suggestions (Allows 100% free manual typing, no manual tags) */}
      <datalist id="dst-approved-positions">
        {APPROVED_POSITIONS.map((pos) => (
          <option key={pos} value={pos} />
        ))}
      </datalist>

      <datalist id="dst-approved-departments">
        {APPROVED_DEPARTMENTS.map((dept) => (
          <option key={dept} value={dept} />
        ))}
      </datalist>

      {/* COMPACT POLICY POPUP MODAL (Keeps the main page free of oversized notice cards) */}
      <AnimatePresence>
        {isPolicyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#000E32] dark:text-white">
                    Official Working Hours Policy
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-2">
                <p>
                  "All staff members are expected to submit their resumption reports at <strong>8:00 AM</strong> and their closing and daily activity reports at <strong>5:00 PM</strong>, in accordance with their approved work schedules. Any approved alternative schedule should be followed where applicable."
                </p>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium space-y-0.5">
                  <div>• <strong>Timezone:</strong> Africa/Lagos (West Africa Time - WAT)</div>
                  <div>• <strong>Management Recipient:</strong> Managing Director / CEO (+2349023489111)</div>
                  <div>• <strong>Company:</strong> DS TECH & DIGITAL MARKETING AGENCY LIMITED (RC: 9550925)</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="w-full py-2 rounded-xl bg-[#000E32] dark:bg-orange-600 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Close Policy
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WHATSAPP SUBMISSION CONFIRMATION MODAL */}
      <AnimatePresence>
        {whatsAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#25D366] flex items-center justify-center mx-auto">
                <OfficialWhatsAppIcon size={24} animate={false} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  WhatsApp Handoff Triggered
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your {submittedReportType === 'resumption' ? 'Daily Resumption' : 'Daily Closing'} report has been formatted and prefilled for <strong>{OFFICIAL_RECIPIENT_TITLE}</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={13} /> Message Ready in WhatsApp
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  <strong>Important:</strong> Please review the prefilled report in WhatsApp and tap <strong>Send</strong> to deliver it to <strong>{OFFICIAL_MANAGEMENT_PHONE}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#000E32] dark:bg-orange-600 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Understood & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
