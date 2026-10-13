import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Calendar, User, Briefcase, Building, CheckCircle2, 
  AlertCircle, Copy, Check, RefreshCw, Send, ShieldCheck, 
  FileText, ArrowLeft, Sun, Moon, Info, Trash2, X, History,
  ChevronDown, ListOrdered, Save
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

  const handleSaveProfileManual = () => {
    if (!fullName.trim() && !position.trim() && !department.trim()) {
      triggerToast('Please enter profile details first.', 'error');
      return;
    }
    saveStaffProfile({
      fullName: fullName.trim(),
      position: position.trim(),
      department: department.trim()
    });
    triggerToast('Profile successfully saved on this device.', 'success');
  };

  const handleClearSavedProfile = () => {
    clearStaffProfile();
    setFullName('');
    setPosition('');
    setDepartment('');
    triggerToast('Staff identity profile cleared.', 'info');
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
    if (!resumptionConfirmed) errors.push('Please check the confirmation statement declaration.');

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
    if (!closingConfirmed) errors.push('Please check the confirmation statement declaration.');

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
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 max-w-sm px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
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

      {/* TOP HEADER (Exact design from user screenshot: circular logo, DS TECH, DST PORTAL pill, live time, theme toggle, back button) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-colors">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          
          {/* Logo & DS TECH Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size="sm" showText={false} />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black tracking-tight text-[#000E32] dark:text-white uppercase font-serif truncate">
                DS TECH
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[9px] font-black uppercase tracking-wider">
                DST PORTAL
              </span>
            </div>
          </div>

          {/* Right Controls: Live Lagos Time, Theme Toggle, Main Link */}
          <div className="flex items-center gap-2 shrink-0">
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs font-mono text-slate-800 dark:text-slate-200"
              title="Africa/Lagos Time (WAT UTC+1)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">{liveLagosTime}</span>
            </div>

            {setTheme && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
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

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Return to Main Portal"
                aria-label="Return to Main Portal"
              >
                <ArrowLeft size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER (Centered max-w-xl matching exact mobile/desktop frame in user screenshots) */}
      <main className="max-w-xl w-full mx-auto px-3.5 sm:px-4 py-4 space-y-4 text-left flex-1">

        {/* 1. COMPACT NOTICE BOARD (Small, polished, elegant - as requested!) */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <Clock size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Official Schedule:</strong> Resumption 8:00 AM • Closing 5:00 PM WAT
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPolicyModalOpen(true)}
            className="text-[11px] text-amber-700 dark:text-amber-300 hover:underline font-bold shrink-0 ml-2 cursor-pointer flex items-center gap-0.5"
          >
            <Info size={12} />
            <span>Policy</span>
          </button>
        </div>

        {/* 2. CARD: STAFF IDENTITY & STATION (Exact component from Screenshot 5) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
          
          {/* Header with Orange User Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                STAFF IDENTITY & STATION
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enter details once to autofill both reports
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ibrahim Al-Amin"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Position / Role (Manual input with suggestions and exact dropdown styling) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Position / Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="dst-approved-positions"
                placeholder="Lead Frontend Engineer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Department (Manual input with suggestions and exact dropdown styling) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="dst-approved-departments"
                placeholder="IT & Software Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Action Row: Clear Profile & Save Profile On Device */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleClearSavedProfile}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear Profile</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfileManual}
              className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={13} />
              <span>Save Profile On Device</span>
            </button>
          </div>
        </div>

        {/* 3. TABS: RESUMPTION REPORT & CLOSING REPORT (Exact underline styling from Screenshot 5) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-1 pt-1">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('resumption')}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'resumption'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock size={15} />
              <span>1. RESUMPTION REPORT</span>
              {activeTab === 'resumption' && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('closing')}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'closing'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText size={15} />
              <span>2. CLOSING & ACTIVITY REPORT</span>
              {activeTab === 'closing' && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              refreshHistory();
            }}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Local Attendance History"
          >
            <History size={16} />
          </button>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: DAILY RESUMPTION REPORT (Exact layout from Screenshot 1 & 3) */}
        {/* ================================================================ */}
        {activeTab === 'resumption' && (
          <motion.div
            key="resumption-section"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
              
              {/* Overline & Heading */}
              <div>
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 font-mono uppercase tracking-wider block mb-1">
                  OFFICIAL SUBMISSION DOCKET
                </span>
                <h2 className="text-base sm:text-lg font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  DS TECH DAILY STAFF RESUMPTION REPORT
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Resumption timestamp is captured automatically in Africa/Lagos standard time upon arrival.
                </p>
              </div>

              {/* CARD: ACTUAL CAPTURED RESUMPTION TIME */}
              <div className="bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ACTUAL CAPTURED RESUMPTION TIME
                  </span>
                  <button
                    type="button"
                    onClick={handleResetResumptionSession}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-orange-500 shrink-0" />
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {resumptionTimeStr}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase">WAT</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Captured on visit: {resumptionDateStr}
                </p>

                <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    TARGET RESUMPTION SCHEDULE
                  </span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    8:00 AM WAT (Official Work Schedule)
                  </div>
                </div>
              </div>

              {/* Day / Date (Africa/Lagos WAT) Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Day / Date (Africa/Lagos WAT)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={resumptionDateStr}
                    className="w-full h-11 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 cursor-not-allowed select-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Calendar size={16} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Automatically localized to West Africa Standard Time.
                </p>
              </div>

              {/* Resumption Time (Recorded) Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resumption Time (Recorded)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`${resumptionTimeStr} WAT`}
                    className="w-full h-11 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-mono cursor-not-allowed select-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                    <Clock size={16} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Preserved throughout your active session.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter official full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Position / Role (Manual input with suggestions) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Position / Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="dst-approved-positions"
                    placeholder="Lead Frontend Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Department (Manual input with suggestions) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="dst-approved-departments"
                    placeholder="IT & Software Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* CARD: Confirmation Statement (Exact card styling from Screenshot 1) */}
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={resumptionConfirmed}
                    onChange={(e) => setResumptionConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded-md text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5 cursor-pointer shrink-0"
                  />
                  <div className="text-xs sm:text-sm">
                    <div className="font-extrabold text-slate-900 dark:text-white mb-0.5">
                      Confirmation Statement
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 italic">
                      "I hereby confirm my resumption for duty today."
                    </div>
                  </div>
                </label>
              </div>

              {/* CARD: Submitted To & Contact (Exact card from Screenshot 1) */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-4 text-xs space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-500 font-semibold">Submitted to:</span>{' '}
                    <strong>{OFFICIAL_RECIPIENT_TITLE}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Contact:</span>{' '}
                    <strong>{OFFICIAL_MANAGEMENT_PHONE}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Destination URL: https://wa.me/{OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER}
                </div>
              </div>

              {/* Validation errors */}
              {resumptionValidationErrors.length > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} /> Please fill the following required items:
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-2">
                    {resumptionValidationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ACTION BUTTONS (Exact stack from Screenshot 1: Green WhatsApp, Copy, Start New Report) */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSubmitResumption}
                  disabled={isResumptionSubmitting}
                  className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <OfficialWhatsAppIcon size={20} animate={false} />
                  <span>SUBMIT RESUMPTION VIA WHATSAPP</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyResumption}
                  className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedState === 'resumption' ? (
                    <>
                      <Check size={16} className="text-emerald-500" />
                      <span>Report Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetResumptionSession}
                  className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={15} />
                  <span>Start New Report</span>
                </button>
              </div>

              {/* Footnote note (Exact text from Screenshot 1) */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center pt-2 leading-relaxed">
                Note: Clicking the WhatsApp button opens WhatsApp with your prefilled report. Please review the message and tap Send in WhatsApp to complete submission to management.
              </p>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: DAILY CLOSING & ACTIVITY REPORT (Exact layout from 2 & 4) */}
        {/* ================================================================ */}
        {activeTab === 'closing' && (
          <motion.div
            key="closing-section"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
              
              {/* Overline & Heading */}
              <div>
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 font-mono uppercase tracking-wider block mb-1">
                  OFFICIAL SUBMISSION DOCKET
                </span>
                <h2 className="text-base sm:text-lg font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  DS TECH DAILY STAFF CLOSING AND ACTIVITY REPORT
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Comprehensive daily task accounting, challenges log, and signing-out timestamp.
                </p>
              </div>

              {/* CARD: ACTUAL CAPTURED SIGNING-OUT TIME */}
              <div className="bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ACTUAL CAPTURED SIGNING-OUT TIME
                  </span>
                  <button
                    type="button"
                    onClick={handleResetClosingSession}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-orange-500 shrink-0" />
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {closingTimeStr}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase">WAT</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Captured on visit: {closingDateStr}
                </p>

                <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    TARGET CLOSING SCHEDULE
                  </span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    5:00 PM WAT (Official Closing Time)
                  </div>
                </div>
              </div>

              {/* Day / Date (Africa/Lagos WAT) Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Day / Date (Africa/Lagos WAT)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={closingDateStr}
                    className="w-full h-11 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 cursor-not-allowed select-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Calendar size={16} />
                  </div>
                </div>
              </div>

              {/* Signing-Out Time (Recorded) Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Signing-Out Time (Recorded)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`${closingTimeStr} WAT`}
                    className="w-full h-11 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-mono cursor-not-allowed select-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                    <Clock size={16} />
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter official full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Position / Role (Manual input with suggestions) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Position / Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="dst-approved-positions"
                    placeholder="Lead Frontend Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Department (Manual input with suggestions) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="dst-approved-departments"
                    placeholder="IT & Software Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* ACTIVITIES PERFORMED FOR THE DAY (Exact header from Screenshot 2) */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <ListOrdered size={18} className="text-orange-500" />
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                    ACTIVITIES PERFORMED FOR THE DAY
                  </h3>
                </div>

                {/* Activity 1 */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Task / Activity 1</span>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      1. Task Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Conducted technical sprint review and feature development"
                      value={closingActivities.act1Desc}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act1Desc: e.target.value }))}
                      className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Outcome / Result <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3 modules completed and deployed to staging environment"
                      value={closingActivities.act1Outcome}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act1Outcome: e.target.value }))}
                      className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Task / Activity 2</span>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      2. Task Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Reviewed user tickets and resolved high-priority escalations"
                      value={closingActivities.act2Desc}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act2Desc: e.target.value }))}
                      className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Outcome / Result <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All 8 customer issues resolved with positive feedback"
                      value={closingActivities.act2Outcome}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act2Outcome: e.target.value }))}
                      className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Task / Activity 3</span>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      3. Task Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maintained cloud infrastructure and database backups"
                      value={closingActivities.act3Desc}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act3Desc: e.target.value }))}
                      className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Outcome / Result <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zero downtime, system verified healthy and secured"
                      value={closingActivities.act3Outcome}
                      onChange={(e) => setClosingActivities(prev => ({ ...prev, act3Outcome: e.target.value }))}
                      className="w-full h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Follow-up Fields (Exact fields from Screenshot 4: Pending Tasks, Challenges, Plans) */}
              <div className="space-y-4 pt-1">
                {/* Tasks Completed */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tasks Completed <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTasksCompleted('None')}
                      className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter tasks completed or enter None"
                    value={tasksCompleted}
                    onChange={(e) => setTasksCompleted(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
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
                      className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="List unfinished items or enter None"
                    value={pendingTasks}
                    onChange={(e) => setPendingTasks(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
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
                      className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
                    >
                      Fill "None"
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Obstacles, network, or logistics encountered (or None)"
                    value={challengesEncountered}
                    onChange={(e) => setChallengesEncountered(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Plans for Next Working Day */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plans for Next Working Day <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Key objectives scheduled for tomorrow..."
                    value={plansNextWorkingDay}
                    onChange={(e) => setPlansNextWorkingDay(e.target.value)}
                    className="w-full h-11 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* CARD: Confirmation Statement (Exact card styling from Screenshot 4) */}
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={closingConfirmed}
                    onChange={(e) => setClosingConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded-md text-orange-600 focus:ring-orange-500 border-slate-300 mt-0.5 cursor-pointer shrink-0"
                  />
                  <div className="text-xs sm:text-sm">
                    <div className="font-extrabold text-slate-900 dark:text-white mb-0.5">
                      Confirmation Statement
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 italic">
                      "I hereby submit my daily closing and activity report for management review."
                    </div>
                  </div>
                </label>
              </div>

              {/* CARD: Submitted To & Contact (Exact card from Screenshot 4) */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-4 text-xs space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-500 font-semibold">Submitted to:</span>{' '}
                    <strong>{OFFICIAL_RECIPIENT_TITLE}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Contact:</span>{' '}
                    <strong>{OFFICIAL_MANAGEMENT_PHONE}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Destination URL: https://wa.me/{OFFICIAL_MANAGEMENT_WHATSAPP_NUMBER}
                </div>
              </div>

              {/* Validation errors */}
              {closingValidationErrors.length > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} /> Please fill the following required items:
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-2">
                    {closingValidationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ACTION BUTTONS (Exact stack from Screenshot 4) */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSubmitClosing}
                  disabled={isClosingSubmitting}
                  className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <OfficialWhatsAppIcon size={20} animate={false} />
                  <span>SUBMIT CLOSING REPORT VIA WHATSAPP</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyClosing}
                  className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedState === 'closing' ? (
                    <>
                      <Check size={16} className="text-emerald-500" />
                      <span>Report Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetClosingSession}
                  className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={15} />
                  <span>Start New Report</span>
                </button>
              </div>

              {/* Footnote note (Exact text from Screenshot 4) */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center pt-2 leading-relaxed">
                Note: Clicking the WhatsApp button opens WhatsApp with your prefilled report. Please review the message and tap Send in WhatsApp to complete submission to management.
              </p>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: SUBMISSIONS HISTORY                                       */}
        {/* ================================================================ */}
        {activeTab === 'history' && (
          <motion.div
            key="history-panel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  Local Attendance & Submission History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reports recorded on this browser session.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSavedProfile}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                  title="Clear remembered profile"
                >
                  <Trash2 size={12} /> Clear Profile
                </button>
                <button
                  type="button"
                  onClick={refreshHistory}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            </div>

            {submissionHistory.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-1.5">
                <History size={28} className="mx-auto opacity-40" />
                <p className="text-xs font-bold uppercase tracking-wider">No submissions logged yet</p>
                <p className="text-[11px] text-slate-500">Reports submitted via WhatsApp will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {submissionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          item.type === 'resumption'
                            ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                            : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {item.type === 'resumption' ? 'Resumption' : 'Closing & Activity'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">#{item.id}</span>
                        {item.syncedToBackend && (
                          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            Synced
                          </span>
                        )}
                      </div>
                      
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {item.fullName} • <span className="font-normal text-slate-500">{item.position}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
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
                      className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer shadow-2xs"
                    >
                      <OfficialWhatsAppIcon size={14} animate={false} />
                      <span>Re-Open</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* Datalists for manual input suggestions (auto-completes while allowing 100% free manual typing) */}
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

      {/* COMPACT POLICY POPUP MODAL */}
      <AnimatePresence>
        {isPolicyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3.5 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#000E32] dark:text-white">
                    Official Working Hours Policy
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-2.5">
                <p>
                  "All staff members are expected to submit their resumption reports at <strong>8:00 AM</strong> and their closing and daily activity reports at <strong>5:00 PM</strong>, in accordance with their approved work schedules. Any approved alternative schedule should be followed where applicable."
                </p>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium space-y-0.5 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div>• <strong>Timezone:</strong> Africa/Lagos (West Africa Time - WAT)</div>
                  <div>• <strong>Management Recipient:</strong> {OFFICIAL_RECIPIENT_TITLE} ({OFFICIAL_MANAGEMENT_PHONE})</div>
                  <div>• <strong>Company:</strong> DS TECH & DIGITAL MARKETING AGENCY LIMITED (RC: 9550925)</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#000E32] dark:bg-orange-600 text-white font-bold text-xs uppercase cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3.5 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#25D366] flex items-center justify-center mx-auto">
                <OfficialWhatsAppIcon size={26} animate={false} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
                  WhatsApp Handoff Triggered
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your {submittedReportType === 'resumption' ? 'Daily Resumption' : 'Daily Closing'} report has been formatted and prefilled for <strong>{OFFICIAL_RECIPIENT_TITLE}</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={14} /> Message Ready in WhatsApp
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
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
