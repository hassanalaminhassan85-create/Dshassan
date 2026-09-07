import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, GraduationCap, BookOpen, CreditCard, ShieldCheck, 
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles, 
  Send, Printer, RotateCcw, CalendarClock, Info, Check, 
  Building2, Globe, Phone, Mail, Shield, User, Clock, Calendar,
  ExternalLink, FileText, CheckCircle, Download, Copy, X, Image as ImageIcon,
  Eye, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Logo } from './Logo';
import { OfficialWhatsAppIcon } from './OfficialWhatsAppIcon';
import { CourseRegistrationPDFSlip } from './CourseRegistrationPDFSlip';
import { useProfessionalPDF } from '../hooks/useProfessionalPDF';
import { ACADEMY_COURSES } from '../lib/academyCoursesData';
import { 
  CourseRegistrationRecord, 
  ProgrammeType, 
  ProgrammeDuration, 
  TrainingMode, 
  TeachingLanguage,
  CourseSelectionItem
} from '../types/courseRegistration';
import { 
  generateCourseRegId, 
  apiSaveCourseRegistration, 
  buildCourseRegistrationWhatsAppLink, 
  formatCourseRegistrationWhatsAppMessage,
  formatProgrammeTypes,
  formatTeachingLanguages,
  getProgrammeTypes,
  getTeachingLanguages,
  getCourseLearningMode,
  ACADEMY_WHATSAPP_NUMBER,
  OFFICIAL_ADMISSIONS_EMAIL 
} from '../lib/courseRegistrationStorage';

interface CourseRegistrationFormProps {
  onNavigateHome?: () => void;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara', 'Non-Nigerian / International'
];

const LECTURE_DAYS_OPTIONS = [
  'Mon, Wed, Fri',
  'Tue, Thu, Sat',
  'Weekends (Sat & Sun)',
  'Mondays & Wednesdays',
  'Tuesdays & Thursdays',
  'Mondays to Fridays (Intensive)'
];

const LECTURE_TIME_OPTIONS = [
  '09:00 AM – 11:00 AM (Morning)',
  '11:30 AM – 01:30 PM (Mid-Day)',
  '02:00 PM – 04:00 PM (Afternoon)',
  '05:00 PM – 07:00 PM (Evening)',
  '07:00 PM – 09:00 PM (Night / Executive)'
];

const WhatsAppDetailsMotionWriter: React.FC<{ record: CourseRegistrationRecord }> = ({ record }) => {
  const fullText = formatCourseRegistrationWhatsAppMessage(record);
  const [copiedText, setCopiedText] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 180 }}
      className="my-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 p-4 text-left shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden"
    >
      {/* Animated Motion Shimmer */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
        className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent pointer-events-none transform -skew-x-12"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/50 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <OfficialWhatsAppIcon size={16} animate={true} />
            Exact Details Formatted for WhatsApp Dispatch
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyText}
          className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-emerald-700/50"
        >
          {copiedText ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copiedText ? 'Copied Full Details!' : 'Copy Text'}</span>
        </button>
      </div>

      {/* Live High Motion Animated Text Container */}
      <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800/80 max-h-64 overflow-y-auto font-mono text-[11.5px] leading-relaxed text-slate-200 space-y-1 selection:bg-emerald-500 selection:text-black shadow-inner">
        {fullText.split('\n').map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02, duration: 0.15 }}
            className={
              line.startsWith('*')
                ? 'font-bold text-emerald-300 pt-1'
                : line.startsWith('•')
                ? 'pl-2 text-slate-100'
                : line.startsWith('  ▫')
                ? 'pl-5 text-slate-400 text-[11px]'
                : line.startsWith('---')
                ? 'text-slate-700 py-1'
                : 'text-slate-300'
            }
          >
            {line}
          </motion.div>
        ))}
      </div>

      <div className="pt-2 text-[10px] text-emerald-400/90 font-medium flex items-center justify-between">
        <span>✨ Includes 100% of applicant's filled registration fields</span>
        <span className="font-mono text-slate-400">CAC RC 9550925</span>
      </div>
    </motion.div>
  );
};

export const CourseRegistrationForm: React.FC<CourseRegistrationFormProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<CourseRegistrationRecord | null>(null);
  const [formViewMode, setFormViewMode] = useState<'edit' | 'preview'>('edit');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isGeneratingSlipImage, setIsGeneratingSlipImage] = useState<boolean>(false);
  const [generationStatusText, setGenerationStatusText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [generatedSlipImageUrl, setGeneratedSlipImageUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [imageCopiedSuccess, setImageCopiedSuccess] = useState<boolean>(false);

  // Temporary Visual Capture Diagnostic Helper States
  const [showDiagnosticInspector, setShowDiagnosticInspector] = useState<boolean>(true);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [diagnosticData, setDiagnosticData] = useState<{
    dataUrl: string;
    width: number;
    height: number;
    blobSizeKb: number;
    timestamp: string;
    fontStatus: string;
    svgStatus: string;
    taintStatus: string;
  } | null>(null);
  const [diagnosticZoom, setDiagnosticZoom] = useState<'fit' | '100' | '150'>('fit');

  // Professional PDF Generation Hook
  const { generatePDF, isGenerating: isGeneratingPDF, statusText: pdfStatusText } = useProfessionalPDF();

  // Form State
  const [formData, setFormData] = useState<CourseRegistrationRecord>({
    id: `cr_${Date.now()}`,
    registrationId: generateCourseRegId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // Section 1: Applicant Information
    fullName: '',
    nationality: 'Nigerian',
    stateOfOrigin: '',
    lga: '',
    ethnicGroup: '',
    sex: '',
    emailAddress: '',
    whatsappNumber: '',
    alternativePhone: '',

    // Section 2: Programme Information (multi-select defaults with 100% backward compatibility)
    programmeTypes: ['Scholarship'],
    programmeType: 'Scholarship',
    programmeDuration: '',
    trainingMode: 'Virtual Classes',
    teachingLanguages: ['English'],
    teachingLanguage: 'English',

    // Section 3: Course Applications (each with independent learningMode)
    course1: {
      courseName: '',
      lecturer: '',
      learningMode: 'Virtual Classes',
      trainingMode: 'Virtual Classes',
      weeklyLectureDays: '',
      lectureTime: '',
    },
    course2: {
      courseName: '',
      lecturer: '',
      learningMode: 'Physical Classes',
      trainingMode: 'Physical Classes',
      weeklyLectureDays: '',
      lectureTime: '',
    },
    course3: {
      courseName: '',
      lecturer: '',
      learningMode: 'Hybrid Classes',
      trainingMode: 'Hybrid Classes',
      weeklyLectureDays: '',
      lectureTime: '',
    },

    // Section 4: Payment Record
    amountPaid: '',
    paymentIsNA: false,
    paymentStatus: 'Unverified Record',

    // Section 5: Confirmation
    agreeConfirmation: false,
  });

  // Enable optional course 2 and course 3 slots
  const [showCourse2, setShowCourse2] = useState<boolean>(false);
  const [showCourse3, setShowCourse3] = useState<boolean>(false);

  // Multi-select Checkbox Handler for Programme Type (stored as array in formData.programmeTypes)
  const handleProgrammeTypeCheckboxChange = (type: ProgrammeType, checked: boolean) => {
    setFormData(prev => {
      const current = Array.isArray(prev.programmeTypes) ? prev.programmeTypes : [];
      const updated = checked
        ? (current.includes(type) ? current : [...current, type])
        : current.filter(t => t !== type);
      return {
        ...prev,
        programmeTypes: updated,
        programmeType: updated.length === 2 ? 'Scholarship & Paid Programme' : (updated[0] || ''),
      };
    });
    if (validationErrors.programmeType) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.programmeType;
        return next;
      });
    }
  };

  const toggleProgrammeType = (type: ProgrammeType) => {
    const isCurrentlySelected = Array.isArray(formData.programmeTypes) && formData.programmeTypes.includes(type);
    handleProgrammeTypeCheckboxChange(type, !isCurrentlySelected);
  };

  // Multi-select Checkbox Handler for Teaching Language (stored as array in formData.teachingLanguages)
  const handleTeachingLanguageCheckboxChange = (lang: TeachingLanguage, checked: boolean) => {
    setFormData(prev => {
      const current = Array.isArray(prev.teachingLanguages) ? prev.teachingLanguages : [];
      const updated = checked
        ? (current.includes(lang) ? current : [...current, lang])
        : current.filter(l => l !== lang);
      return {
        ...prev,
        teachingLanguages: updated,
        teachingLanguage: updated.join(', '),
      };
    });
    if (validationErrors.teachingLanguage) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.teachingLanguage;
        return next;
      });
    }
  };

  const toggleTeachingLanguage = (lang: TeachingLanguage) => {
    const isCurrentlySelected = Array.isArray(formData.teachingLanguages) && formData.teachingLanguages.includes(lang);
    handleTeachingLanguageCheckboxChange(lang, !isCurrentlySelected);
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, formViewMode, submissionSuccess]);

  const steps = [
    { id: 1, name: 'Applicant Profile', icon: UserCheck, desc: 'Personal biodata and contact details' },
    { id: 2, name: 'Programme Structure', icon: GraduationCap, desc: 'Type, duration & mode preferences' },
    { id: 3, name: 'Course Selection', icon: BookOpen, desc: 'Selected courses, faculty & timetable' },
    { id: 4, name: 'Payment Record', icon: CreditCard, desc: 'Self-reported tuition payment record' },
    { id: 5, name: 'Review & Confirm', icon: ShieldCheck, desc: 'Academic declaration & submission' },
  ];

  const totalSteps = steps.length;

  // Validation Logic per Section
  const validateSection = (stepId: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepId === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
      if (!formData.nationality.trim()) errors.nationality = 'Nationality is required';
      if (!formData.stateOfOrigin.trim()) errors.stateOfOrigin = 'State of Origin is required';
      if (!formData.lga.trim()) errors.lga = 'Local Government Area (LGA) is required';
      if (!formData.ethnicGroup.trim()) errors.ethnicGroup = 'Tribe/Ethnic group is required';
      if (!formData.sex) errors.sex = 'Please select your sex';

      if (!formData.emailAddress.trim()) {
        errors.emailAddress = 'Active Email Address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress.trim())) {
        errors.emailAddress = 'Please enter a valid email address';
      }

      if (!formData.whatsappNumber.trim()) {
        errors.whatsappNumber = 'WhatsApp Number is required';
      } else if (formData.whatsappNumber.trim().replace(/[^\d]/g, '').length < 8) {
        errors.whatsappNumber = 'Please enter a valid WhatsApp phone number';
      }
    }

    if (stepId === 2) {
      const pTypes = formData.programmeTypes && formData.programmeTypes.length > 0
        ? formData.programmeTypes
        : formData.programmeType ? [formData.programmeType as ProgrammeType] : [];
      if (pTypes.length === 0) errors.programmeType = 'Please select at least one Programme Type (Scholarship or Paid Programme)';
      if (!formData.programmeDuration) errors.programmeDuration = 'Please select a Programme Duration';
      if (!formData.trainingMode) errors.trainingMode = 'Please select a Delivery Preference';
      const tLangs = formData.teachingLanguages && formData.teachingLanguages.length > 0
        ? formData.teachingLanguages
        : formData.teachingLanguage ? [formData.teachingLanguage as TeachingLanguage] : [];
      if (tLangs.length === 0) errors.teachingLanguage = 'Please select at least one Preferred Teaching Language';
    }

    if (stepId === 3) {
      if (!formData.course1.courseName.trim()) errors.course1Name = 'Course 1 title is required';
      if (!formData.course1.lecturer.trim()) errors.course1Lecturer = 'Course 1 Lecturer name is required';
      if (!formData.course1.weeklyLectureDays.trim()) errors.course1Days = 'Course 1 Lecture Days are required';
      if (!formData.course1.lectureTime.trim()) errors.course1Time = 'Course 1 Lecture Time is required';
      if (!formData.course1.learningMode) errors.course1Mode = 'Course 1 Learning Mode is required';

      if (showCourse2 && formData.course2?.courseName?.trim()) {
        if (!formData.course2.lecturer?.trim()) errors.course2Lecturer = 'Course 2 Lecturer is required';
        if (!formData.course2.weeklyLectureDays?.trim()) errors.course2Days = 'Course 2 Lecture Days are required';
        if (!formData.course2.lectureTime?.trim()) errors.course2Time = 'Course 2 Lecture Time is required';
      }

      if (showCourse3 && formData.course3?.courseName?.trim()) {
        if (!formData.course3.lecturer?.trim()) errors.course3Lecturer = 'Course 3 Lecturer is required';
        if (!formData.course3.weeklyLectureDays?.trim()) errors.course3Days = 'Course 3 Lecture Days are required';
        if (!formData.course3.lectureTime?.trim()) errors.course3Time = 'Course 3 Lecture Time is required';
      }
    }

    if (stepId === 4) {
      const pTypes = getProgrammeTypes(formData);
      const isOnlyScholarship = pTypes.length === 1 && pTypes[0] === 'Scholarship';

      if (!formData.paymentIsNA && !isOnlyScholarship) {
        if (formData.amountPaid === '' || formData.amountPaid === null || formData.amountPaid === undefined) {
          errors.amountPaid = 'Please enter amount paid or select Non-Applicable';
        } else {
          const num = Number(formData.amountPaid);
          if (isNaN(num) || num < 0) {
            errors.amountPaid = 'Please enter a valid positive Naira amount';
          }
        }
      }
    }

    if (stepId === 5) {
      if (!formData.agreeConfirmation) {
        errors.agreeConfirmation = 'You must confirm and verify your registration before submission';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(activeTab)) {
      if (activeTab < totalSteps) {
        setActiveTab(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (activeTab > 1) {
      setActiveTab(prev => prev - 1);
    }
  };

  const handleJumpToStep = (stepNumber: number) => {
    setFormViewMode('edit');
    setActiveTab(stepNumber);
  };

  // Quick autofill for demonstration & testing (featuring multi-select & per-course configurations)
  const handleQuickAutofill = () => {
    setFormData(prev => ({
      ...prev,
      fullName: 'Muhammad Al-Mansur',
      nationality: 'Nigerian',
      stateOfOrigin: 'Kano',
      lga: 'Nassarawa',
      ethnicGroup: 'Hausa',
      sex: 'Male',
      emailAddress: 'm.almansur@dstech.example.com',
      whatsappNumber: '+234 813 900 1234',
      alternativePhone: '+234 802 334 5566',
      // Multi-select demonstration: Both Scholarship AND Paid Programme selected!
      programmeTypes: ['Scholarship', 'Paid Programme'],
      programmeType: 'Scholarship & Paid Programme',
      programmeDuration: 'Three Months',
      trainingMode: 'Hybrid Classes',
      // Multi-select demonstration: English + Hausa selected!
      teachingLanguages: ['English', 'Hausa'],
      teachingLanguage: 'English, Hausa',
      // Per-course demonstration:
      // Course 1 -> Virtual Classes
      course1: {
        courseName: 'Full Stack Software Engineering & Cloud Computing',
        lecturer: 'Engr. Aliyu Sanusi (Director of Software)',
        learningMode: 'Virtual Classes',
        trainingMode: 'Virtual Classes',
        weeklyLectureDays: 'Mon, Wed, Fri',
        lectureTime: '09:00 AM – 11:00 AM',
      },
      // Course 2 -> Physical Classes
      course2: {
        courseName: 'Cybersecurity & Ethical Hacking Mastery',
        lecturer: 'Dr. Kabir Danfulani (Lead Security Fellow)',
        learningMode: 'Physical Classes',
        trainingMode: 'Physical Classes',
        weeklyLectureDays: 'Tue, Thu, Sat',
        lectureTime: '02:00 PM – 04:00 PM',
      },
      // Course 3 -> Hybrid Classes
      course3: {
        courseName: 'Advanced Data Science & AI Systems',
        lecturer: 'Prof. Fatima Bello (Faculty Chair)',
        learningMode: 'Hybrid Classes',
        trainingMode: 'Hybrid Classes',
        weeklyLectureDays: 'Weekends (Sat & Sun)',
        lectureTime: '05:00 PM – 07:00 PM',
      },
      amountPaid: '200000',
      paymentIsNA: false,
      agreeConfirmation: true,
    }));
    setShowCourse2(true);
    setShowCourse3(true);
    setValidationErrors({});
  };

  const handleCopyRegId = async () => {
    if (!submittedRecord) return;
    try {
      await navigator.clipboard.writeText(submittedRecord.registrationId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {
      console.error('Failed to copy ID', e);
    }
  };

  // Shared helper to render canonical slip canvas with 100% pixel-perfect CORS safety
  const renderRegistrationSlipCanvas = async (slipTarget: HTMLElement): Promise<HTMLCanvasElement> => {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading check skipped:', e);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200));

    return await html2canvas(slipTarget, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: 800,
      windowWidth: 850,
      ignoreElements: (element) => {
        const tag = element.tagName ? element.tagName.toUpperCase() : '';
        return tag === 'SCRIPT' || tag === 'IFRAME' || element.classList?.contains('cf-analytics');
      },
      onclone: (clonedDoc) => {
        // Strip dark mode classes on html/body in cloned DOM so Tailwind dark mode doesn't render white-on-white text
        clonedDoc.documentElement.classList.remove('dark');
        clonedDoc.body.classList.remove('dark');
        clonedDoc.documentElement.style.backgroundColor = '#FFFFFF';
        clonedDoc.body.style.backgroundColor = '#FFFFFF';
        clonedDoc.documentElement.style.color = '#0F172A';
        clonedDoc.body.style.color = '#0F172A';

        // Enforce crossOrigin="anonymous" on ALL images in cloned document to prevent tainted canvas errors
        const allImages = clonedDoc.querySelectorAll('img');
        allImages.forEach((img) => {
          img.setAttribute('crossorigin', 'anonymous');
          img.crossOrigin = 'anonymous';
        });

        const target = clonedDoc.getElementById('dsta-render-slip-target') || clonedDoc.getElementById('dsta-course-registration-slip');
        if (target) {
          target.style.width = '800px';
          target.style.maxWidth = '800px';
          target.style.minWidth = '800px';
          target.style.height = 'auto';
          target.style.display = 'block';
          target.style.visibility = 'visible';
          target.style.backgroundColor = '#FFFFFF';
          target.style.color = '#0F172A';
          target.style.margin = '0 auto';
          target.style.padding = '0';
          target.style.transform = 'none';

          // Remove any dark mode classes from all descendant elements in cloned target
          const allElements = target.querySelectorAll('*');
          allElements.forEach((el) => {
            el.classList?.remove('dark');
          });

          // Unwrap all parent container constraints in clonedDoc up to body so mobile viewport width doesn't crop capture
          let parent = target.parentElement;
          while (parent && parent !== clonedDoc.body) {
            parent.style.width = 'auto';
            parent.style.maxWidth = 'none';
            parent.style.minWidth = '0';
            parent.style.overflow = 'visible';
            parent.style.margin = '0';
            parent.style.padding = '0';
            parent.style.backgroundColor = '#FFFFFF';
            parent = parent.parentElement;
          }
          clonedDoc.body.style.width = '850px';
          clonedDoc.body.style.overflow = 'visible';
        }
      }
    });
  };

  // Dispatch Real High-Resolution Image via WhatsApp
  const handleSendWhatsAppWithImage = async () => {
    if (!submittedRecord || isGeneratingSlipImage) return;
    setIsGeneratingSlipImage(true);
    setGenerationStatusText('Preparing & auditing registration slip image...');

    try {
      const slipTarget = document.getElementById('dsta-render-slip-target') || document.getElementById('dsta-course-registration-slip');
      if (!slipTarget) {
        window.open(buildCourseRegistrationWhatsAppLink(submittedRecord), '_blank');
        return;
      }

      setGenerationStatusText('Rendering high-resolution canvas...');
      const canvas = await renderRegistrationSlipCanvas(slipTarget);

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedSlipImageUrl(dataUrl);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob || blob.size === 0) {
        console.warn('Canvas blob generation failed, launching WhatsApp text link.');
        window.open(buildCourseRegistrationWhatsAppLink(submittedRecord), '_blank');
        return;
      }

      const blobSizeKb = Math.round(blob.size / 1024);
      const fontStatusStr = typeof document !== 'undefined' && document.fonts ? document.fonts.status : 'loaded';

      const diagInfo = {
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        blobSizeKb,
        timestamp: new Date().toLocaleTimeString(),
        fontStatus: `Engine: ${fontStatusStr}`,
        svgStatus: 'SVG Crest Rendered (Solid Fills)',
        taintStatus: 'Clean / CORS Safe (allowTaint: false)',
      };
      setDiagnosticData(diagInfo);

      // If visual diagnostic inspector mode is active, display the visual diagnostic overlay FIRST
      if (showDiagnosticInspector) {
        setIsDiagnosticModalOpen(true);
        return;
      }

      const cleanId = submittedRecord.registrationId.replace(/[\/\\]/g, '-');
      const fileName = `${cleanId}-Course-Registration-Slip.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // 1. Try Native Web Share API on mobile devices if supported for files
      const canShareFiles = typeof navigator !== 'undefined' &&
                            navigator.share &&
                            navigator.canShare &&
                            navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            title: 'DS TECH Academy Course Registration Slip',
            text: `DS TECH Academy Official Course Registration Slip (Docket ID: ${submittedRecord.registrationId})`,
            files: [file]
          });
          return;
        } catch (shareErr: any) {
          if (
            shareErr?.name === 'AbortError' ||
            shareErr?.message?.toLowerCase().includes('cancel') ||
            shareErr?.message?.toLowerCase().includes('abort')
          ) {
            return;
          }
          console.warn('Native Web Share file dispatch failed, activating download & fallback modal:', shareErr);
        }
      }

      // 2. Fallback for desktop & browsers that do not support navigator.canShare with files:
      // A. Automatic Browser PNG Download
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);

      // B. Attempt Clipboard Image Copy
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setImageCopiedSuccess(true);
          setTimeout(() => setImageCopiedSuccess(false), 4000);
        }
      } catch (clipErr) {
        console.warn('Clipboard image copy not available in this context:', clipErr);
      }

      // C. Open Clear Instructions Modal with WhatsApp Launch Button
      setIsImageModalOpen(true);
    } catch (err) {
      console.error('Failed to generate registration slip image:', err);
      window.open(buildCourseRegistrationWhatsAppLink(submittedRecord), '_blank');
    } finally {
      setIsGeneratingSlipImage(false);
      setGenerationStatusText('');
    }
  };

  // Proceed with sharing from the visual diagnostic helper
  const handleProceedDiagnosticShare = async () => {
    if (!submittedRecord || !diagnosticData) return;
    setIsDiagnosticModalOpen(false);

    try {
      const res = await fetch(diagnosticData.dataUrl);
      const blob = await res.blob();
      const cleanId = submittedRecord.registrationId.replace(/[\/\\]/g, '-');
      const fileName = `${cleanId}-Course-Registration-Slip.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const canShareFiles = typeof navigator !== 'undefined' &&
                            navigator.share &&
                            navigator.canShare &&
                            navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            title: 'DS TECH Academy Course Registration Slip',
            text: `DS TECH Academy Official Course Registration Slip (Docket ID: ${submittedRecord.registrationId})`,
            files: [file]
          });
          return;
        } catch (shareErr: any) {
          if (
            shareErr?.name === 'AbortError' ||
            shareErr?.message?.toLowerCase().includes('cancel') ||
            shareErr?.message?.toLowerCase().includes('abort')
          ) {
            return;
          }
        }
      }

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setImageCopiedSuccess(true);
          setTimeout(() => setImageCopiedSuccess(false), 4000);
        }
      } catch (clipErr) {
        console.warn('Clipboard image copy not available in this context:', clipErr);
      }

      setIsImageModalOpen(true);
    } catch (err) {
      console.error('Error during proceed diagnostic share:', err);
    }
  };

  // Direct PNG image download
  const handleDownloadSlipImage = async () => {
    if (!submittedRecord || isGeneratingSlipImage) return;
    setIsGeneratingSlipImage(true);
    setGenerationStatusText('Preparing image download...');
    try {
      const slipTarget = document.getElementById('dsta-render-slip-target') || document.getElementById('dsta-course-registration-slip');
      if (!slipTarget) return;

      const canvas = await renderRegistrationSlipCanvas(slipTarget);
      const url = canvas.toDataURL('image/png');
      setGeneratedSlipImageUrl(url);
      const cleanId = submittedRecord.registrationId.replace(/[\/\\]/g, '-');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanId}-Course-Registration-Slip.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading slip image:', err);
    } finally {
      setIsGeneratingSlipImage(false);
      setGenerationStatusText('');
    }
  };

  // Direct Copy Slip Image to Clipboard
  const handleCopySlipImage = async () => {
    if (!submittedRecord || isGeneratingSlipImage) return;
    setIsGeneratingSlipImage(true);
    setGenerationStatusText('Preparing image copy...');
    try {
      const slipTarget = document.getElementById('dsta-render-slip-target') || document.getElementById('dsta-course-registration-slip');
      if (!slipTarget) return;

      const canvas = await renderRegistrationSlipCanvas(slipTarget);
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedSlipImageUrl(dataUrl);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      if (blob && blob.size > 0 && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setImageCopiedSuccess(true);
        setTimeout(() => setImageCopiedSuccess(false), 4000);
      }
    } catch (e) {
      console.error('Failed to copy image to clipboard:', e);
    } finally {
      setIsGeneratingSlipImage(false);
      setGenerationStatusText('');
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all sections
    let isValid = true;
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateSection(i)) {
        setActiveTab(i);
        setFormViewMode('edit');
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const finalProgTypes = getProgrammeTypes(formData);
      const finalTeachLangs = getTeachingLanguages(formData);
      const c1Mode = getCourseLearningMode(formData.course1, formData.trainingMode);
      const c2Mode = getCourseLearningMode(formData.course2, formData.trainingMode);
      const c3Mode = getCourseLearningMode(formData.course3, formData.trainingMode);

      const finalRecord: CourseRegistrationRecord = {
        ...formData,
        programmeTypes: finalProgTypes,
        programmeType: formatProgrammeTypes(formData),
        teachingLanguages: finalTeachLangs,
        teachingLanguage: formatTeachingLanguages(formData),
        course1: {
          ...formData.course1,
          learningMode: c1Mode,
          trainingMode: c1Mode,
        },
        course2: showCourse2 && formData.course2?.courseName?.trim() ? {
          ...formData.course2,
          learningMode: c2Mode,
          trainingMode: c2Mode,
        } : undefined,
        course3: showCourse3 && formData.course3?.courseName?.trim() ? {
          ...formData.course3,
          learningMode: c3Mode,
          trainingMode: c3Mode,
        } : undefined,
        updatedAt: new Date().toISOString(),
        paymentStatus: formData.paymentIsNA 
          ? 'Non-Applicable' 
          : `Self-Reported ₦${Number(formData.amountPaid || 0).toLocaleString()} (Pending Admin Verification)`,
      };

      const saved = await apiSaveCourseRegistration(finalRecord);
      setSubmittedRecord(saved);
      setSubmissionSuccess(true);
    } catch (err) {
      console.error('Failed to submit course registration:', err);
      alert('An unexpected error occurred during submission. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate Official A4 PDF Document (210mm x 297mm) using useProfessionalPDF
  const handleDownloadA4PDF = async () => {
    const recordToUse = submittedRecord || formData;
    if (!recordToUse || isGeneratingSlipImage || isGeneratingPDF) return;

    await generatePDF({
      elementId: 'dsta-render-slip-target',
      applicantName: recordToUse.fullName || 'Student',
      documentTitle: 'DS-TECH-Academy-Course-Registration',
      marginMm: 10,
      targetWidthPx: 800,
      onError: (err) => {
        console.error('Failed to generate official A4 PDF document:', err);
        alert('Notice: Automated PDF export experienced a browser issue. Falling back to native print window.');
        window.print();
      },
    });
  };

  // Printable slip trigger
  const handlePrintSlip = () => {
    window.print();
  };

  // Reset to fill another registration
  const handleResetForm = () => {
    setFormData({
      id: `cr_${Date.now()}`,
      registrationId: generateCourseRegId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fullName: '',
      nationality: 'Nigerian',
      stateOfOrigin: '',
      lga: '',
      ethnicGroup: '',
      sex: '',
      emailAddress: '',
      whatsappNumber: '',
      alternativePhone: '',
      programmeTypes: ['Scholarship'],
      programmeType: 'Scholarship',
      programmeDuration: '',
      trainingMode: 'Virtual Classes',
      teachingLanguages: ['English'],
      teachingLanguage: 'English',
      course1: { courseName: '', lecturer: '', weeklyLectureDays: '', lectureTime: '' },
      course2: { courseName: '', lecturer: '', weeklyLectureDays: '', lectureTime: '' },
      course3: { courseName: '', lecturer: '', weeklyLectureDays: '', lectureTime: '' },
      amountPaid: '',
      paymentIsNA: false,
      paymentStatus: 'Unverified Record',
      agreeConfirmation: false,
    });
    setShowCourse2(false);
    setShowCourse3(false);
    setActiveTab(1);
    setSubmissionSuccess(false);
    setSubmittedRecord(null);
    setFormViewMode('edit');
    setValidationErrors({});
  };

  return (
    <div id="course-registration-root" className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10 selection:bg-orange-500 selection:text-white">
      <div className="cr-web-ui">
        {/* Top Banner / Progress Header matching CareersForm.tsx */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-6 md:mb-10 transition-colors duration-200">
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-[#000E32] h-1.5 w-full animate-gradient" />

        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all mr-1 flex items-center justify-center border border-slate-200 dark:border-slate-800 cursor-pointer"
                title="Return Home"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <Logo size="sm" variant="dark" />
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-orange-600 dark:text-orange-400 uppercase block">
                  DS TECH ACADEMY
                </span>
                <span className="text-[9px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded">
                  CAC RC 9550925
                </span>
              </div>
              <p className="text-xs font-extrabold text-[#000E32] dark:text-white uppercase tracking-tight">
                COURSE REGISTRATION FORM
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Registration Progress
              </span>
              <span className="text-xs font-extrabold text-[#000E32] dark:text-slate-200 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg mt-0.5 shadow-xs border border-slate-200/50 dark:border-slate-800">
                {Math.round((activeTab / totalSteps) * 100)}% Completed
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickAutofill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 hover:text-orange-800 rounded-xl text-xs font-bold transition-all duration-200 border border-orange-200/60 dark:border-orange-900/30 shadow-xs hover:shadow-sm cursor-pointer shrink-0"
              title="Quick sample profile for testing"
            >
              <Sparkles size={13} className="text-orange-500 animate-pulse" />
              <span className="hidden xs:inline">Quick Autofill</span>
            </button>
          </div>
        </div>

        {/* Informative Sub-header Notice */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-150/40 dark:border-slate-800 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Please provide accurate and verifiable information for official Academy enrolment, lecture allocation, and academic records administration.
          </p>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href={`mailto:${OFFICIAL_ADMISSIONS_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-orange-700 dark:text-orange-400 hover:text-orange-800 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 px-2.5 py-1 rounded-md border border-orange-200 dark:border-orange-900/40 transition-colors shadow-2xs"
              title="Official Academy Admissions Email"
            >
              <Mail size={12} className="text-orange-500" />
              <span className="font-mono">{OFFICIAL_ADMISSIONS_EMAIL}</span>
            </a>
            <span className="text-[9.5px] font-mono font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              CAC RC 9550925
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {formData.registrationId}
            </span>
          </div>
        </div>

        {/* Mobile Horizontal Progress Scrollbar */}
        <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-150/40 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300">
            {steps.map(step => {
              const StepIcon = step.icon;
              const isActive = activeTab === step.id;
              const isCompleted = activeTab > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveTab(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#000E32] text-white shadow-xs scale-102'
                      : isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <StepIcon size={12} className={isActive ? 'text-orange-500' : isCompleted ? 'text-emerald-500' : 'text-slate-400'} />
                  <span>{step.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUCCESS STATE MODAL / VIEW */}
      {submissionSuccess && submittedRecord ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 text-left"
        >
          {/* Executive Control & Dispatch Hub Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Enrolment Docket Ready
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#000E32] dark:text-white uppercase tracking-tight">
                    Official Registration Slip Prepared
                  </h2>
                </div>
              </div>

              {/* Reg ID Badge with Copy button */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Docket ID:</span>
                <strong className="font-mono text-xs font-black text-[#000E32] dark:text-white">
                  {submittedRecord.registrationId}
                </strong>
                <button
                  type="button"
                  onClick={handleCopyRegId}
                  className="p-1 text-slate-400 hover:text-orange-600 rounded transition-colors ml-1 cursor-pointer"
                  title="Copy Registration ID"
                >
                  {copiedId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Dispatch Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* WhatsApp Dispatch Button with Animated Official SVG Icon */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="dsta-send-image-whatsapp-btn"
                  onClick={handleSendWhatsAppWithImage}
                  disabled={isGeneratingSlipImage}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md shadow-[#25D366]/20 cursor-pointer disabled:opacity-60"
                  aria-label="Send Image to WhatsApp"
                >
                  {isGeneratingSlipImage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <OfficialWhatsAppIcon size={21} animate={true} />
                  )}
                  <span>
                    {isGeneratingSlipImage
                      ? (generationStatusText || 'Preparing image...')
                      : 'Send Image to WhatsApp'}
                  </span>
                </button>

                {/* Temporary Visual Capture Inspector Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setShowDiagnosticInspector(!showDiagnosticInspector)}
                  className={`px-3 py-3 rounded-xl border text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    showDiagnosticInspector
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Toggle Canvas PNG Visual Capture Inspection Overlay"
                >
                  <Eye size={14} className={showDiagnosticInspector ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'} />
                  <span>Inspector: {showDiagnosticInspector ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* Download Official A4 PDF Document */}
                <button
                  type="button"
                  onClick={handleDownloadA4PDF}
                  disabled={isGeneratingSlipImage || isGeneratingPDF}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-[#000E32] hover:bg-blue-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                  title="Download Official A4 PDF Document"
                >
                  {isGeneratingPDF ? (
                    <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText size={15} className="text-orange-400" />
                  )}
                  <span>{isGeneratingPDF ? (pdfStatusText || 'Generating A4 PDF...') : 'Download A4 PDF'}</span>
                </button>

                {/* Print Slip (Native Print Window) */}
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  title="Print Slip via Browser Window"
                >
                  <Printer size={15} />
                  <span>Print Slip</span>
                </button>

                {/* Download Image (PNG) */}
                <button
                  type="button"
                  onClick={handleDownloadSlipImage}
                  disabled={isGeneratingSlipImage}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#000E32] dark:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download size={15} />
                  <span>Download Image</span>
                </button>

                {/* Copy Slip Image to Clipboard */}
                <button
                  type="button"
                  onClick={handleCopySlipImage}
                  disabled={isGeneratingSlipImage}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  title="Copy slip image to clipboard (paste into WhatsApp)"
                >
                  {imageCopiedSuccess ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{imageCopiedSuccess ? 'Image Copied!' : 'Copy Image'}</span>
                </button>

                {/* Reset / Register Another */}
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3.5 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Fill another registration"
                >
                  <RotateCcw size={14} />
                  <span className="hidden md:inline">New Registration</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed font-medium">
                * <strong>Official Admissions Desk:</strong> Inquiries, bursary receipts, and docket verification are handled via WhatsApp (+234 902 348 9111) and official email.
              </p>
              <a
                href={`mailto:${OFFICIAL_ADMISSIONS_EMAIL}`}
                className="inline-flex items-center gap-1.5 font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline shrink-0"
              >
                <Mail size={12} />
                <span>{OFFICIAL_ADMISSIONS_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* High Motion Live WhatsApp Details Writer & Preview */}
          <WhatsAppDetailsMotionWriter record={submittedRecord} />

          {/* Live Official Registration Slip Preview (World-Class Rendering) */}
          <div className="bg-slate-100 dark:bg-slate-950/80 p-3 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 px-1 text-slate-600 dark:text-slate-300">
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-orange-500" />
                Official Course Registration Slip Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Scale: 100% • Standard Institutional A4 Slip
              </span>
            </div>

            {/* The Printable / Image Render Target */}
            <div className="overflow-x-auto rounded-xl shadow-md border border-slate-300 bg-white">
              <CourseRegistrationPDFSlip
                record={submittedRecord}
                id="dsta-render-slip-target"
                isPrintOnly={false}
              />
            </div>
          </div>

          {/* Real High-Resolution Slip Image Dispatch Confirmation Modal */}
          <AnimatePresence>
            {isImageModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl overflow-hidden relative text-left"
                >
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Registration Slip Image & Details Ready
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Exact filled details and PNG registration slip generated for WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Slip Preview Thumbnail */}
                  {generatedSlipImageUrl && (
                    <div className="mb-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950 shadow-inner">
                      <img
                        src={generatedSlipImageUrl}
                        alt="Generated Official Course Registration Slip"
                        className="w-full rounded shadow-xs"
                      />
                    </div>
                  )}

                  {/* WhatsApp Message Live Motion Writer inside Modal */}
                  <WhatsAppDetailsMotionWriter record={submittedRecord} />

                  {/* Practical WhatsApp Guide Banner */}
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl mb-4 text-xs text-emerald-950 dark:text-emerald-200">
                    <p className="font-bold flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={14} className="text-emerald-600" />
                      Next Steps for WhatsApp:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11.5px] leading-relaxed">
                      <li>
                        <strong>Download or copy image:</strong> The official PNG registration slip has been saved to your downloads (and copied to clipboard).
                      </li>
                      <li>
                        <strong>Open WhatsApp:</strong> Click below to open WhatsApp pre-filled with all exact registration details.
                      </li>
                      <li>
                        <strong>Attach &amp; Send:</strong> In WhatsApp, attach the downloaded image (or press Ctrl+V) and send.
                      </li>
                    </ol>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <a
                      href={buildCourseRegistrationWhatsAppLink(submittedRecord)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 cursor-pointer text-center"
                    >
                      <OfficialWhatsAppIcon size={18} animate={true} />
                      <span>Open WhatsApp with Details</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleDownloadSlipImage}
                      className="w-full sm:w-auto py-3 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySlipImage}
                      className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {imageCopiedSuccess ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{imageCopiedSuccess ? 'Copied Image!' : 'Copy Image'}</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visual Canvas Capture Diagnostic Overlay Modal */}
          <AnimatePresence>
            {isDiagnosticModalOpen && diagnosticData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative text-left text-slate-100 space-y-4 my-auto"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Eye size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider">
                            Visual Diagnostic Helper
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Captured at {diagnosticData.timestamp}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-0.5">
                          PNG Canvas Render Integrity Inspector
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDiagnosticModalOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Close Inspection Modal"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Technical Specs Diagnostic Audit Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[9.5px] text-slate-500 uppercase block font-sans font-bold">Canvas Resolution</span>
                      <strong className="text-emerald-400 text-xs font-black block mt-0.5">
                        {diagnosticData.width} × {diagnosticData.height} px
                      </strong>
                      <span className="text-[9px] text-slate-400">Retina 2x Scale</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[9.5px] text-slate-500 uppercase block font-sans font-bold">Blob PNG File Size</span>
                      <strong className="text-amber-400 text-xs font-black block mt-0.5">
                        {diagnosticData.blobSizeKb} KB
                      </strong>
                      <span className="text-[9px] text-slate-400">image/png Format</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[9.5px] text-slate-500 uppercase block font-sans font-bold">Font Readiness</span>
                      <strong className="text-blue-400 text-xs font-black block mt-0.5 truncate">
                        {diagnosticData.fontStatus}
                      </strong>
                      <span className="text-[9px] text-slate-400">document.fonts.ready</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[9.5px] text-slate-500 uppercase block font-sans font-bold">Context Security</span>
                      <strong className="text-purple-400 text-xs font-black block mt-0.5 truncate">
                        {diagnosticData.taintStatus}
                      </strong>
                      <span className="text-[9px] text-slate-400">Solid SVG Vectors</span>
                    </div>
                  </div>

                  {/* PNG Canvas Interactive Zoom Inspection Pane */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-orange-400" />
                        Manual PNG Visual Inspection Pane:
                      </span>

                      {/* Zoom controls */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setDiagnosticZoom('fit')}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded font-bold transition-all cursor-pointer ${
                            diagnosticZoom === 'fit' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Fit Width
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiagnosticZoom('100')}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded font-bold transition-all cursor-pointer ${
                            diagnosticZoom === '100' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          100% Native
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiagnosticZoom('150')}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded font-bold transition-all cursor-pointer ${
                            diagnosticZoom === '150' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          150% Zoom
                        </button>
                      </div>
                    </div>

                    {/* Visual Container */}
                    <div className="max-h-96 overflow-auto rounded-xl border border-slate-800 p-3 bg-slate-950/90 shadow-inner flex items-center justify-center">
                      <img
                        src={diagnosticData.dataUrl}
                        alt="Visual Diagnostic Canvas PNG Output"
                        style={{
                          width: diagnosticZoom === 'fit' ? '100%' : diagnosticZoom === '100' ? '800px' : '1200px',
                          maxWidth: 'none',
                        }}
                        className="rounded shadow-md transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                      <span>Manually inspect fonts, logos, QR code, and alignment before Web Share API dispatch.</span>
                    </p>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setIsDiagnosticModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        onClick={handleProceedDiagnosticShare}
                        className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 cursor-pointer"
                      >
                        <OfficialWhatsAppIcon size={18} animate={false} />
                        <span>Proceed to WhatsApp Share</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* MAIN FORM: Responsive Left Rail & Right Form Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side Trackbar progress rail (matches CareersForm.tsx) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hidden lg:block sticky top-8 text-left transition-colors duration-200">
            <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
              Registration Sections
            </h3>
            <div className="space-y-2">
              {steps.map(step => {
                const StepIcon = step.icon;
                const isActive = activeTab === step.id;
                const isCompleted = activeTab > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveTab(step.id)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-md shadow-blue-950/20 dark:shadow-orange-950/20 translate-x-2'
                        : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 border border-transparent'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <StepIcon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] opacity-60 font-semibold tracking-wider uppercase leading-none">
                        Section {step.id}
                      </span>
                      <span className="text-xs font-bold truncate mt-1">
                        {step.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Preview Toggle */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setFormViewMode(formViewMode === 'edit' ? 'preview' : 'edit')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileText size={14} className="text-orange-500" />
                <span>{formViewMode === 'edit' ? 'Review Summary View' : 'Back to Edit Mode'}</span>
              </button>
            </div>
          </div>

          {/* Right Side Form Content Window */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left transition-colors duration-200">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 md:p-8 min-h-[440px]">
                {formViewMode === 'preview' ? (
                  /* REVIEW SUMMARY MODE */
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                      <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest block">
                        Registration Summary & Verification
                      </span>
                      <h2 className="text-xl md:text-2xl font-extrabold text-[#000E32] dark:text-white tracking-tight mt-1">
                        Review Registration Details
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Inspect your completed sections before final submission. Click any edit link to modify data.
                      </p>
                    </div>

                    {/* Section 1 Review */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <h4 className="text-xs font-black uppercase text-[#000E32] dark:text-white flex items-center gap-2">
                          <UserCheck size={14} className="text-orange-500" />
                          1. Applicant Profile
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleJumpToStep(1)}
                          className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-400 font-medium">Full Name:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.fullName || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Nationality:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.nationality || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Origin:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.stateOfOrigin || 'Pending'} ({formData.lga || 'N/A'})</strong></div>
                        <div><span className="text-slate-400 font-medium">Tribe / Ethnic:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.ethnicGroup || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Sex:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.sex || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Email:</span> <strong className="font-mono text-slate-800 dark:text-slate-200 ml-1">{formData.emailAddress || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">WhatsApp:</span> <strong className="font-mono text-slate-800 dark:text-slate-200 ml-1">{formData.whatsappNumber || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Alt Phone:</span> <strong className="font-mono text-slate-800 dark:text-slate-200 ml-1">{formData.alternativePhone || 'None'}</strong></div>
                      </div>
                    </div>

                    {/* Section 2 Review */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <h4 className="text-xs font-black uppercase text-[#000E32] dark:text-white flex items-center gap-2">
                          <GraduationCap size={14} className="text-orange-500" />
                          2. Programme Information
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleJumpToStep(2)}
                          className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 font-medium">Programme Type:</span>{' '}
                          <span className="inline-flex flex-wrap gap-1 ml-1 align-middle">
                            {getProgrammeTypes(formData).map(pt => (
                              <span key={pt} className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                                {pt}
                              </span>
                            ))}
                          </span>
                        </div>
                        <div><span className="text-slate-400 font-medium">Duration:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.programmeDuration || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Default Mode:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.trainingMode || 'Pending'}</strong></div>
                        <div>
                          <span className="text-slate-400 font-medium">Languages:</span>{' '}
                          <span className="inline-flex flex-wrap gap-1 ml-1 align-middle">
                            {getTeachingLanguages(formData).map(tl => (
                              <span key={tl} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                {tl}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 Review */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <h4 className="text-xs font-black uppercase text-[#000E32] dark:text-white flex items-center gap-2">
                          <BookOpen size={14} className="text-orange-500" />
                          3. Course Selection & Delivery
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleJumpToStep(3)}
                          className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-orange-600 block">Course 1 (Primary)</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                              {getCourseLearningMode(formData.course1, formData.trainingMode)}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{formData.course1.courseName || 'Pending'}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">Lecturer: {formData.course1.lecturer || 'Pending'} • {formData.course1.weeklyLectureDays || 'Days pending'} ({formData.course1.lectureTime || 'Time pending'})</p>
                        </div>
                        {formData.course2?.courseName && (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-orange-600 block">Course 2 (Additional)</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {getCourseLearningMode(formData.course2, formData.trainingMode)}
                              </span>
                            </div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{formData.course2.courseName}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">Lecturer: {formData.course2.lecturer} • {formData.course2.weeklyLectureDays} ({formData.course2.lectureTime})</p>
                          </div>
                        )}
                        {formData.course3?.courseName && (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-orange-600 block">Course 3 (Additional)</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {getCourseLearningMode(formData.course3, formData.trainingMode)}
                              </span>
                            </div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{formData.course3.courseName}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">Lecturer: {formData.course3.lecturer} • {formData.course3.weeklyLectureDays} ({formData.course3.lectureTime})</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 4 Review */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <h4 className="text-xs font-black uppercase text-[#000E32] dark:text-white flex items-center gap-2">
                          <CreditCard size={14} className="text-orange-500" />
                          4. Payment Record
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleJumpToStep(4)}
                          className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formData.paymentIsNA ? (
                          <span className="text-slate-500">Non-Applicable (Scholarship / Pending Desk Clearance)</span>
                        ) : (
                          <span>Amount Recorded: ₦{Number(formData.amountPaid || 0).toLocaleString()} (Unverified Record)</span>
                        )}
                      </p>
                    </div>

                    {/* Section 5 Confirmation Box */}
                    <div className="p-4 rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20 space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="previewConfirmation"
                          checked={formData.agreeConfirmation}
                          onChange={e => setFormData({ ...formData, agreeConfirmation: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="previewConfirmation" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium select-none cursor-pointer">
                          <strong className="text-[#000E32] dark:text-white uppercase block text-[10px] mb-1">
                            Applicant Confirmation & Declaration
                          </strong>
                          I confirm that the information provided in this registration form is accurate and complete. I understand that the information submitted will be used for course registration, enrolment, academic administration, and related Academy records.
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      {/* Step Title Ribbon */}
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                        <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest block">
                          Form Section {activeTab} of {totalSteps}
                        </span>
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#000E32] dark:text-white tracking-tight mt-1">
                          {steps[activeTab - 1].name}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {steps[activeTab - 1].desc}
                        </p>
                      </div>

                      {/* ========================================================================= */}
                      {/* SECTION 1: APPLICANT INFORMATION */}
                      {/* ========================================================================= */}
                      {activeTab === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              Full Name (as in credentials) *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.fullName}
                              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                              placeholder="Surname Firstname Middlename"
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                validationErrors.fullName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                            />
                            {validationErrors.fullName && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.fullName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              Nationality *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.nationality}
                              onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                              placeholder="e.g. Nigerian"
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                validationErrors.nationality ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                            />
                            {validationErrors.nationality && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.nationality}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              State of Origin *
                            </label>
                            <select
                              value={formData.stateOfOrigin}
                              onChange={e => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                validationErrors.stateOfOrigin ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                            >
                              <option value="">Select State of Origin</option>
                              {NIGERIAN_STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {validationErrors.stateOfOrigin && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.stateOfOrigin}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              Local Government Area (LGA) *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.lga}
                              onChange={e => setFormData({ ...formData, lga: e.target.value })}
                              placeholder="e.g. Garki, Numan, Ikeja"
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                validationErrors.lga ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                            />
                            {validationErrors.lga && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.lga}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              Tribe / Ethnic Group *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.ethnicGroup}
                              onChange={e => setFormData({ ...formData, ethnicGroup: e.target.value })}
                              placeholder="e.g. Hausa, Yoruba, Igbo, Fulani, etc."
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                validationErrors.ethnicGroup ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                            />
                            {validationErrors.ethnicGroup && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.ethnicGroup}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              Sex *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {(['Male', 'Female'] as const).map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, sex: option })}
                                  className={`p-3 rounded-xl border text-center font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                    formData.sex === option
                                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-xs'
                                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                            {validationErrors.sex && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.sex}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              Active Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.emailAddress}
                              onChange={e => setFormData({ ...formData, emailAddress: e.target.value })}
                              placeholder="applicant@example.com"
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                validationErrors.emailAddress ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                            />
                            {validationErrors.emailAddress && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.emailAddress}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              WhatsApp Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={formData.whatsappNumber}
                              onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                              placeholder="e.g. +234 813 123 4567"
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                validationErrors.whatsappNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-mono`}
                            />
                            {validationErrors.whatsappNumber && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.whatsappNumber}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                              Alternative Phone Number (Optional)
                            </label>
                            <input
                              type="tel"
                              value={formData.alternativePhone || ''}
                              onChange={e => setFormData({ ...formData, alternativePhone: e.target.value })}
                              placeholder="e.g. +234 802 000 0000"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================================= */}
                      {/* SECTION 2: PROGRAMME INFORMATION */}
                      {/* ========================================================================= */}
                      {activeTab === 2 && (
                        <div className="space-y-6">
                          {/* Programme Type (Multi-Select Checkbox Implementation: Scholarship, Paid Programme, or BOTH) */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">
                                Programme Track Type * (Multi-Select Checkbox)
                              </label>
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {getProgrammeTypes(formData).map(pt => (
                                  <span
                                    key={pt}
                                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                      pt === 'Scholarship'
                                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                        : 'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                                    }`}
                                  >
                                    {pt}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                              Select <strong>Scholarship</strong>, <strong>Paid Programme</strong>, or <strong>BOTH</strong> using the checkboxes below. Applicants may combine scholarship courses with specialized paid tracks.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(['Scholarship', 'Paid Programme'] as ProgrammeType[]).map(type => {
                                const isSelected = getProgrammeTypes(formData).includes(type);
                                const inputId = `checkbox-prog-type-${type.replace(/\s+/g, '-').toLowerCase()}`;
                                return (
                                  <label
                                    key={type}
                                    htmlFor={inputId}
                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between select-none ${
                                      isSelected
                                        ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 ring-2 ring-orange-500/40 shadow-xs'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="pt-0.5">
                                        <input
                                          type="checkbox"
                                          id={inputId}
                                          name="programmeTypes"
                                          value={type}
                                          checked={isSelected}
                                          onChange={(e) => handleProgrammeTypeCheckboxChange(type, e.target.checked)}
                                          className="sr-only"
                                        />
                                        <div
                                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                            isSelected
                                              ? 'border-orange-500 bg-orange-500 text-white shadow-xs'
                                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                          }`}
                                          aria-hidden="true"
                                        >
                                          {isSelected && <Check size={13} strokeWidth={3} />}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-xs font-extrabold text-[#000E32] dark:text-white uppercase tracking-wider block">
                                          {type}
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                          {type === 'Scholarship' ? 'Merit/sponsored academic admissions' : 'Standard tuition self-sponsored enrollment'}
                                        </p>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100/70 dark:bg-orange-950/60 px-1.5 py-0.5 rounded shrink-0 ml-2">
                                        Active
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>

                            {/* Dual Track Banner */}
                            {getProgrammeTypes(formData).length === 2 && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-800 dark:text-orange-200 text-xs flex items-center gap-2.5"
                              >
                                <Sparkles size={16} className="text-orange-500 shrink-0" />
                                <span>
                                  <strong>Dual-Track Enrolment Active:</strong> You have selected both <strong>Scholarship</strong> and <strong>Paid Programme</strong>. Your admission record will register both tracks.
                                </span>
                              </motion.div>
                            )}

                            {validationErrors.programmeType && (
                              <p className="text-[11px] text-red-500 mt-1.5 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.programmeType}
                              </p>
                            )}
                          </div>

                          {/* Programme Duration */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-2">
                              Programme Duration *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {(['Two Weeks', 'One Month', 'Three Months', 'Six Months'] as ProgrammeDuration[]).map(dur => (
                                <button
                                  key={dur}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, programmeDuration: dur })}
                                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                    formData.programmeDuration === dur
                                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold ring-1 ring-orange-500/50'
                                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                                  }`}
                                >
                                  <span className="text-xs uppercase tracking-wider block">{dur}</span>
                                </button>
                              ))}
                            </div>
                            {validationErrors.programmeDuration && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.programmeDuration}
                              </p>
                            )}
                          </div>

                          {/* Training Mode (Default/Global) */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">
                                Primary Delivery Preference *
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Per-course modes configurable in Step 3
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                              Select your global attendance baseline. You can customize the specific learning mode for each course individually in the next step.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {(['Virtual Classes', 'Physical Classes', 'Hybrid Classes'] as TrainingMode[]).map(mode => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, trainingMode: mode })}
                                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                    formData.trainingMode === mode
                                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs ring-1 ring-orange-500/50'
                                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <div>
                                    <span className="text-xs font-extrabold text-[#000E32] dark:text-white uppercase tracking-wider block">
                                      {mode}
                                    </span>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      {mode === 'Virtual Classes' ? 'Live online sessions' : mode === 'Physical Classes' ? 'Campus laboratory' : 'Blended digital + on-site'}
                                    </p>
                                  </div>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                                    formData.trainingMode === mode
                                      ? 'border-orange-500 bg-orange-500 text-white'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}>
                                    {formData.trainingMode === mode && <Check size={10} strokeWidth={3} />}
                                  </div>
                                </button>
                              ))}
                            </div>
                            {validationErrors.trainingMode && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.trainingMode}
                              </p>
                            )}
                          </div>

                          {/* Preferred Teaching Language (Multi-Select Checkbox: English, Hausa, Yoruba, Igbo) */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">
                                Preferred Teaching Language * (Multi-Select Checkboxes)
                              </label>
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {getTeachingLanguages(formData).map(lang => (
                                  <span
                                    key={lang}
                                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                              Choose all languages you prefer for instruction and lecturer communication using the checkboxes below.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {(['English', 'Hausa', 'Yoruba', 'Igbo'] as TeachingLanguage[]).map(lang => {
                                const isSelected = getTeachingLanguages(formData).includes(lang);
                                const inputId = `checkbox-teach-lang-${lang.toLowerCase()}`;
                                return (
                                  <label
                                    key={lang}
                                    htmlFor={inputId}
                                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                                      isSelected
                                        ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-extrabold ring-2 ring-orange-500/40 shadow-xs'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        id={inputId}
                                        name="teachingLanguages"
                                        value={lang}
                                        checked={isSelected}
                                        onChange={(e) => handleTeachingLanguageCheckboxChange(lang, e.target.checked)}
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                          isSelected
                                            ? 'border-orange-500 bg-orange-500 text-white shadow-xs'
                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                        }`}
                                        aria-hidden="true"
                                      >
                                        {isSelected && <Check size={11} strokeWidth={3} />}
                                      </div>
                                      <span className="text-xs uppercase tracking-wider">{lang}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            {validationErrors.teachingLanguage && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> {validationErrors.teachingLanguage}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ========================================================================= */}
                      {/* SECTION 3: COURSE SELECTION & OFFICIAL TIMETABLE NOTICE */}
                      {/* ========================================================================= */}
                      {activeTab === 3 && (
                        <div className="space-y-6">
                          {/* 7. OFFICIAL TIMETABLE NOTICE (Mandatory exact wording) */}
                          <div className="bg-orange-50/90 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-xs">
                            <div className="p-2 bg-orange-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                              <CalendarClock size={20} />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black tracking-widest uppercase text-orange-700 dark:text-orange-400 block">
                                OFFICIAL TIMETABLE NOTICE
                              </span>
                              <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                                Applicants should use the official timetable forwarded to students to complete their preferred course lecture days and times.
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                Selected days and times are cross-referenced with faculty schedules before final academic lecture room allocations.
                              </p>
                            </div>
                          </div>

                          {/* COURSE 1 (Required) */}
                          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">1</span>
                                <h3 className="text-sm font-extrabold text-[#000E32] dark:text-white uppercase tracking-wider">
                                  COURSE 1 (Primary Course) *
                                </h3>
                              </div>
                              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                                Required
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                  Course 1 Title *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.course1.courseName}
                                  onChange={e => setFormData({
                                    ...formData,
                                    course1: { ...formData.course1, courseName: e.target.value }
                                  })}
                                  placeholder="Enter course title (from your official timetable)"
                                  className={`w-full px-4 py-2.5 rounded-xl border ${
                                    validationErrors.course1Name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                                />
                                {validationErrors.course1Name && (
                                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.course1Name}
                                  </p>
                                )}
                              </div>

                              <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                  Course Lecturer *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.course1.lecturer}
                                  onChange={e => setFormData({
                                    ...formData,
                                    course1: { ...formData.course1, lecturer: e.target.value }
                                  })}
                                  placeholder="Enter lecturer name (from your official timetable)"
                                  className={`w-full px-4 py-2.5 rounded-xl border ${
                                    validationErrors.course1Lecturer ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                                />
                                {validationErrors.course1Lecturer && (
                                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.course1Lecturer}
                                  </p>
                                )}
                              </div>

                              {/* Course 1 Learning Mode (Per-Course Selection) */}
                              <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">
                                    Course 1 Learning Mode *
                                  </label>
                                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                    {getCourseLearningMode(formData.course1, formData.trainingMode)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {(['Virtual Classes', 'Physical Classes', 'Hybrid Classes'] as TrainingMode[]).map(mode => {
                                    const currentMode = getCourseLearningMode(formData.course1, formData.trainingMode);
                                    const isSelected = currentMode === mode;
                                    return (
                                      <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setFormData({
                                          ...formData,
                                          course1: {
                                            ...formData.course1,
                                            learningMode: mode,
                                            trainingMode: mode,
                                          }
                                        })}
                                        className={`py-2 px-2 sm:px-3 rounded-xl border text-center transition-all cursor-pointer ${
                                          isSelected
                                            ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold ring-1 ring-orange-500/50 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:border-slate-300'
                                        }`}
                                      >
                                        <span className="text-xs block truncate">{mode}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                  Weekly Lecture Days *
                                </label>
                                <input
                                  type="text"
                                  required
                                  list="lectureDaysList"
                                  value={formData.course1.weeklyLectureDays}
                                  onChange={e => setFormData({
                                    ...formData,
                                    course1: { ...formData.course1, weeklyLectureDays: e.target.value }
                                  })}
                                  placeholder="e.g. Mon, Wed, Fri"
                                  className={`w-full px-4 py-2.5 rounded-xl border ${
                                    validationErrors.course1Days ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                                />
                                {/* Quick Pill options */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {LECTURE_DAYS_OPTIONS.slice(0, 3).map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setFormData({
                                        ...formData,
                                        course1: { ...formData.course1, weeklyLectureDays: opt }
                                      })}
                                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                                {validationErrors.course1Days && (
                                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.course1Days}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                  Lecture Time *
                                </label>
                                <input
                                  type="text"
                                  required
                                  list="lectureTimesList"
                                  value={formData.course1.lectureTime}
                                  onChange={e => setFormData({
                                    ...formData,
                                    course1: { ...formData.course1, lectureTime: e.target.value }
                                  })}
                                  placeholder="e.g. 10:00 AM – 12:00 PM"
                                  className={`w-full px-4 py-2.5 rounded-xl border ${
                                    validationErrors.course1Time ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm`}
                                />
                                {/* Quick Pill options */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {LECTURE_TIME_OPTIONS.slice(0, 3).map(opt => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setFormData({
                                        ...formData,
                                        course1: { ...formData.course1, lectureTime: opt }
                                      })}
                                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
                                    >
                                      {opt.split(' ')[0]} {opt.split(' ')[1]} {opt.split(' ')[2]}
                                    </button>
                                  ))}
                                </div>
                                {validationErrors.course1Time && (
                                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.course1Time}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* COURSE 2 (Optional) */}
                          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center">2</span>
                                <h3 className="text-sm font-extrabold text-[#000E32] dark:text-white uppercase tracking-wider">
                                  COURSE 2 (Optional Additional Course)
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowCourse2(!showCourse2)}
                                className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                              >
                                {showCourse2 ? 'Hide Course 2' : '+ Add Course 2'}
                              </button>
                            </div>

                            {showCourse2 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Course 2 Title
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.course2?.courseName || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course2: { ...(formData.course2 || { lecturer: '', weeklyLectureDays: '', lectureTime: '' }), courseName: e.target.value }
                                    })}
                                    placeholder="Enter course 2 title (from your official timetable)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Course Lecturer
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.course2?.lecturer || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course2: { ...(formData.course2 || { courseName: '', weeklyLectureDays: '', lectureTime: '' }), lecturer: e.target.value }
                                    })}
                                    placeholder="Enter course 2 lecturer (from your official timetable)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>

                                {/* Course 2 Learning Mode (Per-Course Selection) */}
                                <div className="md:col-span-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">
                                      Course 2 Learning Mode
                                    </label>
                                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                      {getCourseLearningMode(formData.course2, formData.trainingMode)}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {(['Virtual Classes', 'Physical Classes', 'Hybrid Classes'] as TrainingMode[]).map(mode => {
                                      const currentMode = getCourseLearningMode(formData.course2, formData.trainingMode);
                                      const isSelected = currentMode === mode;
                                      return (
                                        <button
                                          key={mode}
                                          type="button"
                                          onClick={() => setFormData({
                                            ...formData,
                                            course2: {
                                              ...(formData.course2 || { courseName: '', lecturer: '', weeklyLectureDays: '', lectureTime: '' }),
                                              learningMode: mode,
                                              trainingMode: mode,
                                            }
                                          })}
                                          className={`py-2 px-2 sm:px-3 rounded-xl border text-center transition-all cursor-pointer ${
                                            isSelected
                                              ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold ring-1 ring-orange-500/50 shadow-xs'
                                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:border-slate-300'
                                          }`}
                                        >
                                          <span className="text-xs block truncate">{mode}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Weekly Lecture Days
                                  </label>
                                  <input
                                    type="text"
                                    list="lectureDaysList"
                                    value={formData.course2?.weeklyLectureDays || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course2: { ...(formData.course2 || { courseName: '', lecturer: '', lectureTime: '' }), weeklyLectureDays: e.target.value }
                                    })}
                                    placeholder="e.g. Tue, Thu, Sat"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Lecture Time
                                  </label>
                                  <input
                                    type="text"
                                    list="lectureTimesList"
                                    value={formData.course2?.lectureTime || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course2: { ...(formData.course2 || { courseName: '', lecturer: '', weeklyLectureDays: '' }), lectureTime: e.target.value }
                                    })}
                                    placeholder="e.g. 02:00 PM – 04:00 PM"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No second course selected. Click "+ Add Course 2" if applying for multiple subjects.</p>
                            )}
                          </div>

                          {/* COURSE 3 (Optional) */}
                          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center">3</span>
                                <h3 className="text-sm font-extrabold text-[#000E32] dark:text-white uppercase tracking-wider">
                                  COURSE 3 (Optional Additional Course)
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowCourse3(!showCourse3)}
                                className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                              >
                                {showCourse3 ? 'Hide Course 3' : '+ Add Course 3'}
                              </button>
                            </div>

                            {showCourse3 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Course 3 Title
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.course3?.courseName || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course3: { ...(formData.course3 || { lecturer: '', weeklyLectureDays: '', lectureTime: '' }), courseName: e.target.value }
                                    })}
                                    placeholder="Enter course 3 title (from your official timetable)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Course Lecturer
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.course3?.lecturer || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course3: { ...(formData.course3 || { courseName: '', weeklyLectureDays: '', lectureTime: '' }), lecturer: e.target.value }
                                    })}
                                    placeholder="Enter course 3 lecturer (from your official timetable)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>

                                {/* Course 3 Learning Mode (Per-Course Selection) */}
                                <div className="md:col-span-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block">
                                      Course 3 Learning Mode
                                    </label>
                                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                      {getCourseLearningMode(formData.course3, formData.trainingMode)}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {(['Virtual Classes', 'Physical Classes', 'Hybrid Classes'] as TrainingMode[]).map(mode => {
                                      const currentMode = getCourseLearningMode(formData.course3, formData.trainingMode);
                                      const isSelected = currentMode === mode;
                                      return (
                                        <button
                                          key={mode}
                                          type="button"
                                          onClick={() => setFormData({
                                            ...formData,
                                            course3: {
                                              ...(formData.course3 || { courseName: '', lecturer: '', weeklyLectureDays: '', lectureTime: '' }),
                                              learningMode: mode,
                                              trainingMode: mode,
                                            }
                                          })}
                                          className={`py-2 px-2 sm:px-3 rounded-xl border text-center transition-all cursor-pointer ${
                                            isSelected
                                              ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold ring-1 ring-orange-500/50 shadow-xs'
                                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:border-slate-300'
                                          }`}
                                        >
                                          <span className="text-xs block truncate">{mode}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Weekly Lecture Days
                                  </label>
                                  <input
                                    type="text"
                                    list="lectureDaysList"
                                    value={formData.course3?.weeklyLectureDays || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course3: { ...(formData.course3 || { courseName: '', lecturer: '', lectureTime: '' }), weeklyLectureDays: e.target.value }
                                    })}
                                    placeholder="e.g. Weekends (Sat & Sun)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                    Lecture Time
                                  </label>
                                  <input
                                    type="text"
                                    list="lectureTimesList"
                                    value={formData.course3?.lectureTime || ''}
                                    onChange={e => setFormData({
                                      ...formData,
                                      course3: { ...(formData.course3 || { courseName: '', lecturer: '', weeklyLectureDays: '' }), lectureTime: e.target.value }
                                    })}
                                    placeholder="e.g. 05:00 PM – 07:00 PM"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No third course selected. Click "+ Add Course 3" if desired.</p>
                            )}
                          </div>

                          {/* Data Lists for days and times */}
                          <datalist id="lectureDaysList">
                            {LECTURE_DAYS_OPTIONS.map(d => (
                              <option key={d} value={d} />
                            ))}
                          </datalist>
                          <datalist id="lectureTimesList">
                            {LECTURE_TIME_OPTIONS.map(t => (
                              <option key={t} value={t} />
                            ))}
                          </datalist>
                        </div>
                      )}

                      {/* ========================================================================= */}
                      {/* SECTION 4: PAYMENT RECORD */}
                      {/* ========================================================================= */}
                      {activeTab === 4 && (
                        <div className="space-y-6">
                          <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#000E32] dark:text-orange-400 block">
                                Payment Record Verification
                              </span>
                              <a
                                href={`mailto:${OFFICIAL_ADMISSIONS_EMAIL}`}
                                className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline"
                                title="Bursary desk email"
                              >
                                <Mail size={11} />
                                <span>{OFFICIAL_ADMISSIONS_EMAIL}</span>
                              </a>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              This section logs your self-reported payment record for Academy bursary auditing. If you are registering under a sponsored scholarship, corporate invoice, or paying at the campus bursary desk, check <strong>Non-Applicable</strong>.
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                              * Notice: Submitting a payment record does not automatically constitute approved clearance until audited by admissions bursars. Proof of payment or sponsorship documents may also be sent to <strong>{OFFICIAL_ADMISSIONS_EMAIL}</strong>.
                            </p>
                          </div>

                          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 space-y-5">
                            {/* Non-Applicable Checkbox */}
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                              <input
                                type="checkbox"
                                id="paymentIsNA"
                                checked={formData.paymentIsNA}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  setFormData(prev => ({
                                    ...prev,
                                    paymentIsNA: checked,
                                    amountPaid: checked ? '' : prev.amountPaid,
                                  }));
                                  if (checked && validationErrors.amountPaid) {
                                    setValidationErrors(prev => {
                                      const next = { ...prev };
                                      delete next.amountPaid;
                                      return next;
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 mt-0.5 cursor-pointer"
                              />
                              <label htmlFor="paymentIsNA" className="text-xs font-bold text-slate-700 dark:text-slate-200 select-none cursor-pointer">
                                Non-Applicable (Scholarship recipient / Special waiver / Awaiting Bursary Invoicing)
                              </label>
                            </div>

                            {/* Amount Paid Field */}
                            <div>
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                                Amount Paid (₦) {formData.paymentIsNA ? '(Disabled - Marked Non-Applicable)' : '*'}
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                                  ₦
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="500"
                                  disabled={formData.paymentIsNA}
                                  value={formData.paymentIsNA ? '' : formData.amountPaid}
                                  onChange={e => setFormData({ ...formData, amountPaid: e.target.value })}
                                  placeholder={formData.paymentIsNA ? 'Non-Applicable' : 'e.g. 100000'}
                                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${
                                    validationErrors.amountPaid ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'
                                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold`}
                                />
                              </div>
                              {validationErrors.amountPaid && (
                                <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                                  <AlertCircle size={12} /> {validationErrors.amountPaid}
                                </p>
                              )}

                              {/* Amount Display preview */}
                              {!formData.paymentIsNA && formData.amountPaid !== '' && !isNaN(Number(formData.amountPaid)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
                                  Recorded Naira Value: ₦{Number(formData.amountPaid).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ========================================================================= */}
                      {/* SECTION 5: REVIEW & APPLICANT CONFIRMATION */}
                      {/* ========================================================================= */}
                      {activeTab === 5 && (
                        <div className="space-y-6">
                          {/* Comprehensive Summary Card */}
                          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4 text-xs">
                            <h3 className="text-xs font-black uppercase tracking-wider text-[#000E32] dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                              <ShieldCheck size={16} className="text-orange-500" />
                              Registration Record Overview
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div><span className="text-slate-400 font-medium">Applicant Name:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.fullName || 'Missing'}</strong></div>
                              <div><span className="text-slate-400 font-medium">Nationality & Origin:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.nationality} ({formData.stateOfOrigin})</strong></div>
                              <div><span className="text-slate-400 font-medium">WhatsApp Contact:</span> <strong className="font-mono text-slate-800 dark:text-slate-200 ml-1">{formData.whatsappNumber || 'Missing'}</strong></div>
                              <div><span className="text-slate-400 font-medium">Email:</span> <strong className="font-mono text-slate-800 dark:text-slate-200 ml-1">{formData.emailAddress || 'Missing'}</strong></div>
                              <div>
                                <span className="text-slate-400 font-medium block mb-1">Programme Track:</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {getProgrammeTypes(formData).map(pt => (
                                    <span
                                      key={pt}
                                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                        pt === 'Scholarship'
                                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                          : 'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                                      }`}
                                    >
                                      {pt}
                                    </span>
                                  ))}
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold ml-1">
                                    ({formData.programmeDuration || 'Two Weeks'})
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block mb-1">Teaching Language(s):</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {getTeachingLanguages(formData).map(lang => (
                                    <span
                                      key={lang}
                                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                                    >
                                      {lang}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="sm:col-span-2 space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                                <span className="text-slate-400 font-medium block">Selected Courses & Learning Modes:</span>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">1. {formData.course1.courseName || 'Pending'}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                      {getCourseLearningMode(formData.course1, formData.trainingMode)}
                                    </span>
                                  </div>
                                  {formData.course2?.courseName && (
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                                      <span className="text-slate-800 dark:text-slate-200 font-bold">2. {formData.course2.courseName}</span>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                        {getCourseLearningMode(formData.course2, formData.trainingMode)}
                                      </span>
                                    </div>
                                  )}
                                  {formData.course3?.courseName && (
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                                      <span className="text-slate-800 dark:text-slate-200 font-bold">3. {formData.course3.courseName}</span>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                        {getCourseLearningMode(formData.course3, formData.trainingMode)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div><span className="text-slate-400 font-medium">Payment Record:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.paymentIsNA ? 'Non-Applicable' : `₦${Number(formData.amountPaid || 0).toLocaleString()}`}</strong></div>
                            </div>
                          </div>

                          {/* Mandatory Applicant Confirmation (Exact wording requested) */}
                          <div className={`p-5 rounded-2xl border ${
                            validationErrors.agreeConfirmation
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                              : 'border-orange-200 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/20'
                          } space-y-3`}>
                            <div className="flex items-start gap-3.5">
                              <input
                                type="checkbox"
                                id="finalAgreeConfirmation"
                                checked={formData.agreeConfirmation}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  setFormData({ ...formData, agreeConfirmation: checked });
                                  if (checked && validationErrors.agreeConfirmation) {
                                    setValidationErrors(prev => {
                                      const next = { ...prev };
                                      delete next.agreeConfirmation;
                                      return next;
                                    });
                                  }
                                }}
                                className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 mt-0.5 cursor-pointer shrink-0"
                              />
                              <label htmlFor="finalAgreeConfirmation" className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium select-none cursor-pointer">
                                <span className="font-black text-[#000E32] dark:text-orange-400 uppercase text-[10px] block mb-1">
                                  5. APPLICANT CONFIRMATION *
                                </span>
                                "I confirm that the information provided in this registration form is accurate and complete. I understand that the information submitted will be used for course registration, enrolment, academic administration, and related Academy records."
                              </label>
                            </div>
                            {validationErrors.agreeConfirmation && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1 pl-8">
                                <AlertCircle size={12} /> {validationErrors.agreeConfirmation}
                              </p>
                            )}
                          </div>

                          {/* Official Admissions Contact Desk Bar */}
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Official Admissions &amp; Inquiries:</span>
                            <div className="flex items-center gap-3 flex-wrap">
                              <a
                                href={`mailto:${OFFICIAL_ADMISSIONS_EMAIL}`}
                                className="inline-flex items-center gap-1.5 font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline"
                              >
                                <Mail size={12} className="text-orange-500" />
                                <span>{OFFICIAL_ADMISSIONS_EMAIL}</span>
                              </a>
                              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">+234 902 348 9111</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Bottom Form Actions Control Bar (matches CareersForm.tsx) */}
              {formViewMode === 'preview' ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest block">
                      Summary Review Active
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      All sections compiled for validation. Confirm and submit to prepare your registration.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setFormViewMode('edit')}
                      className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#000E32] dark:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <ArrowLeft size={14} className="text-orange-400" />
                      Resume Editing
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.agreeConfirmation}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Submit Registration Form
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-6 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={activeTab === 1}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#000E32] dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </button>

                  {activeTab < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-[#000E32] hover:bg-blue-950 dark:bg-orange-600 dark:hover:bg-orange-700 hover:translate-x-0.5 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-900/10 cursor-pointer"
                    >
                      Save & Next
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.agreeConfirmation}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Submit Course Registration
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Single-Page Clean Institutional Print Docket (Isolated for window.print()) */}
      <CourseRegistrationPDFSlip
        record={submittedRecord || formData}
        id="dsta-course-registration-slip"
        isPrintOnly={true}
      />
    </div>
  );
};
