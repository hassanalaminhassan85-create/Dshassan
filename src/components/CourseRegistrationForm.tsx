import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, GraduationCap, BookOpen, CreditCard, ShieldCheck, 
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles, 
  Send, Printer, RotateCcw, CalendarClock, Info, Check, 
  Building2, Globe, Phone, Mail, Shield, User, Clock, Calendar,
  ExternalLink, FileText, CheckCircle, Download, Copy, X, Image as ImageIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Logo } from './Logo';
import { OfficialWhatsAppIcon } from './OfficialWhatsAppIcon';
import { CourseRegistrationPDFSlip } from './CourseRegistrationPDFSlip';
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
  ACADEMY_WHATSAPP_NUMBER 
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

export const CourseRegistrationForm: React.FC<CourseRegistrationFormProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<CourseRegistrationRecord | null>(null);
  const [formViewMode, setFormViewMode] = useState<'edit' | 'preview'>('edit');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isGeneratingSlipImage, setIsGeneratingSlipImage] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [generatedSlipImageUrl, setGeneratedSlipImageUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [imageCopiedSuccess, setImageCopiedSuccess] = useState<boolean>(false);

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

    // Section 2: Programme Information
    programmeType: '',
    programmeDuration: '',
    trainingMode: '',
    teachingLanguage: '',

    // Section 3: Course Applications
    course1: {
      courseName: '',
      lecturer: '',
      weeklyLectureDays: '',
      lectureTime: '',
    },
    course2: {
      courseName: '',
      lecturer: '',
      weeklyLectureDays: '',
      lectureTime: '',
    },
    course3: {
      courseName: '',
      lecturer: '',
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
      if (!formData.programmeType) errors.programmeType = 'Please select a Programme Type';
      if (!formData.programmeDuration) errors.programmeDuration = 'Please select a Programme Duration';
      if (!formData.trainingMode) errors.trainingMode = 'Please select a Training Mode';
      if (!formData.teachingLanguage) errors.teachingLanguage = 'Please select a Preferred Teaching Language';
    }

    if (stepId === 3) {
      if (!formData.course1.courseName.trim()) errors.course1Name = 'Course 1 title is required';
      if (!formData.course1.lecturer.trim()) errors.course1Lecturer = 'Course 1 Lecturer name is required';
      if (!formData.course1.weeklyLectureDays.trim()) errors.course1Days = 'Course 1 Lecture Days are required';
      if (!formData.course1.lectureTime.trim()) errors.course1Time = 'Course 1 Lecture Time is required';
    }

    if (stepId === 4) {
      if (!formData.paymentIsNA) {
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

  // Quick autofill for demonstration & testing (strictly neutral, manual-style course entry)
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
      programmeType: 'Paid Programme',
      programmeDuration: 'Three Months',
      trainingMode: 'Hybrid Classes',
      teachingLanguage: 'English',
      course1: {
        courseName: 'Full Stack Software Engineering & Cloud Computing',
        lecturer: 'Assigned Course Lecturer (Per Timetable)',
        weeklyLectureDays: 'Mon, Wed, Fri',
        lectureTime: '09:00 AM – 11:00 AM',
      },
      amountPaid: '200000',
      paymentIsNA: false,
      agreeConfirmation: true,
    }));
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

  // Dispatch Real High-Resolution Image via WhatsApp
  const handleSendWhatsAppWithImage = async () => {
    if (!submittedRecord) return;
    setIsGeneratingSlipImage(true);

    try {
      // Find the slip element
      const slipTarget = document.getElementById('dsta-render-slip-target') || document.getElementById('dsta-course-registration-slip');
      if (!slipTarget) {
        window.open(`https://wa.me/2349023489111?text=${encodeURIComponent(`*DS TECH ACADEMY — OFFICIAL REGISTRATION DOCKET*\nDocket ID: ${submittedRecord.registrationId}\nApplicant: ${submittedRecord.fullName}`)}`, '_blank');
        return;
      }

      const canvas = await html2canvas(slipTarget, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 850,
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById('dsta-render-slip-target') || clonedDoc.getElementById('dsta-course-registration-slip');
          if (target) {
            target.style.width = '800px';
            target.style.maxWidth = '800px';
            target.style.display = 'block';
            target.style.visibility = 'visible';
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedSlipImageUrl(dataUrl);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const cleanId = submittedRecord.registrationId.replace(/[\/\\]/g, '_');
        const fileName = `${cleanId}_Registration_Slip.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // 1. Copy image directly to user clipboard for instant paste (Ctrl+V) in WhatsApp
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setImageCopiedSuccess(true);
            setTimeout(() => setImageCopiedSuccess(false), 4000);
          }
        } catch (clipErr) {
          console.warn('Clipboard image write not permitted or supported:', clipErr);
        }

        // 2. Download the high-res PNG image file
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 6000);

        // 3. If Web Share with files is supported (mobile browsers):
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `DS TECH Academy Registration - ${submittedRecord.fullName}`,
              text: `Official Registration Slip (${submittedRecord.registrationId}) for ${submittedRecord.fullName}.`,
            });
            setIsImageModalOpen(true);
            return;
          } catch (shareErr: any) {
            if (shareErr?.name === 'AbortError') {
              setIsImageModalOpen(true);
              return;
            }
          }
        }

        // 4. Open WhatsApp to Admissions Desk with clean docket reference (NO raw form data dump)
        const cleanMsg = encodeURIComponent(
          `*DS TECH ACADEMY — OFFICIAL COURSE REGISTRATION SLIP*\nDocket ID: ${submittedRecord.registrationId}\nApplicant: ${submittedRecord.fullName}\nProgramme: ${submittedRecord.programmeType} (${submittedRecord.trainingMode})\n\n[Official Registration Slip Image Generated from Portal]`
        );
        window.open(`https://wa.me/2349023489111?text=${cleanMsg}`, '_blank');
        setIsImageModalOpen(true);
      } else {
        window.open(`https://wa.me/2349023489111?text=${encodeURIComponent(`*DS TECH ACADEMY — REGISTRATION DOCKET*\nDocket ID: ${submittedRecord.registrationId}\nApplicant: ${submittedRecord.fullName}`)}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to generate or share slip image:', err);
      window.open(`https://wa.me/2349023489111?text=${encodeURIComponent(`*DS TECH ACADEMY — REGISTRATION DOCKET*\nDocket ID: ${submittedRecord.registrationId}\nApplicant: ${submittedRecord.fullName}`)}`, '_blank');
    } finally {
      setIsGeneratingSlipImage(false);
    }
  };

  // Direct PNG image download
  const handleDownloadSlipImage = async () => {
    if (!submittedRecord) return;
    setIsGeneratingSlipImage(true);
    try {
      const slipTarget = document.getElementById('dsta-render-slip-target') || document.getElementById('dsta-course-registration-slip');
      if (!slipTarget) return;

      const canvas = await html2canvas(slipTarget, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 850,
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById('dsta-render-slip-target') || clonedDoc.getElementById('dsta-course-registration-slip');
          if (target) {
            target.style.width = '800px';
            target.style.maxWidth = '800px';
            target.style.display = 'block';
            target.style.visibility = 'visible';
          }
        }
      });

      const url = canvas.toDataURL('image/png');
      setGeneratedSlipImageUrl(url);
      const cleanId = submittedRecord.registrationId.replace(/[\/\\]/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanId}_Registration_Slip.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading slip image:', err);
    } finally {
      setIsGeneratingSlipImage(false);
    }
  };

  // Direct Copy Slip Image to Clipboard
  const handleCopySlipImage = async () => {
    if (!submittedRecord) return;
    setIsGeneratingSlipImage(true);
    try {
      const slipTarget = document.getElementById('dsta-render-slip-target') || document.getElementById('dsta-course-registration-slip');
      if (!slipTarget) return;

      const canvas = await html2canvas(slipTarget, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 850,
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById('dsta-render-slip-target') || clonedDoc.getElementById('dsta-course-registration-slip');
          if (target) {
            target.style.width = '800px';
            target.style.maxWidth = '800px';
            target.style.display = 'block';
            target.style.visibility = 'visible';
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedSlipImageUrl(dataUrl);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.clipboard && window.ClipboardItem) {
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
      const finalRecord: CourseRegistrationRecord = {
        ...formData,
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
      programmeType: '',
      programmeDuration: '',
      trainingMode: '',
      teachingLanguage: '',
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
                  RC: 9550925
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
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-150/40 dark:border-slate-800 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Please provide accurate and verifiable information for official Academy enrolment, lecture allocation, and academic records administration.
          </p>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <span className="text-[9.5px] font-mono font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              ACCREDITED RC: 9550925
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
              <button
                type="button"
                onClick={handleSendWhatsAppWithImage}
                disabled={isGeneratingSlipImage}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md shadow-[#25D366]/20 cursor-pointer disabled:opacity-60"
              >
                {isGeneratingSlipImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <OfficialWhatsAppIcon size={21} animate={true} />
                )}
                <span>
                  {isGeneratingSlipImage ? 'Generating High-Res Image...' : 'Send Image via WhatsApp'}
                </span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* Print / Save PDF Slip */}
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-[#000E32] hover:bg-blue-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer size={15} />
                  <span>Print / Save PDF</span>
                </button>

                {/* Download Image (PNG) */}
                <button
                  type="button"
                  onClick={handleDownloadSlipImage}
                  disabled={isGeneratingSlipImage}
                  className="flex-1 sm:flex-initial px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#000E32] dark:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download size={15} />
                  <span>Download PNG</span>
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

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              * <strong>Official WhatsApp Integration:</strong> Generates a high-resolution authentic registration slip image and dispatches it directly to the Academy admissions desk (+234 902 348 9111).
            </p>
          </div>

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
                        Slip Image Dispatched &amp; Ready
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        High-resolution registration docket generated via html2canvas
                      </p>
                    </div>
                  </div>

                  {/* Slip Preview Thumbnail */}
                  {generatedSlipImageUrl && (
                    <div className="mb-4 max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950 shadow-inner">
                      <img
                        src={generatedSlipImageUrl}
                        alt="Generated Official Course Registration Slip"
                        className="w-full rounded shadow-xs"
                      />
                    </div>
                  )}

                  {/* Practical WhatsApp Guide Banner */}
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl mb-4 text-xs text-emerald-950 dark:text-emerald-200">
                    <p className="font-bold flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={14} className="text-emerald-600" />
                      In WhatsApp chat:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11.5px] leading-relaxed">
                      <li>
                        <strong>Press Ctrl+V (or Paste):</strong> The slip image has been copied to your clipboard.
                      </li>
                      <li>
                        <strong>Or attach file:</strong> The slip image has also been saved to your downloads folder.
                      </li>
                    </ol>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <a
                      href="https://wa.me/2349023489111"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 cursor-pointer text-center"
                    >
                      <OfficialWhatsAppIcon size={18} />
                      <span>Open WhatsApp Chat</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopySlipImage}
                      className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {imageCopiedSuccess ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{imageCopiedSuccess ? 'Copied!' : 'Copy Image'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSlipImage}
                      className="w-full sm:w-auto py-3 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download PNG</span>
                    </button>
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
                        <div><span className="text-slate-400 font-medium">Programme Type:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.programmeType || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Duration:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.programmeDuration || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Training Mode:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.trainingMode || 'Pending'}</strong></div>
                        <div><span className="text-slate-400 font-medium">Language:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.teachingLanguage || 'Pending'}</strong></div>
                      </div>
                    </div>

                    {/* Section 3 Review */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <h4 className="text-xs font-black uppercase text-[#000E32] dark:text-white flex items-center gap-2">
                          <BookOpen size={14} className="text-orange-500" />
                          3. Course Selection
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
                          <span className="text-[10px] font-extrabold text-orange-600 block">Course 1 (Primary)</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{formData.course1.courseName || 'Pending'}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">Lecturer: {formData.course1.lecturer || 'Pending'} • {formData.course1.weeklyLectureDays || 'Days pending'} ({formData.course1.lectureTime || 'Time pending'})</p>
                        </div>
                        {formData.course2?.courseName && (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-extrabold text-orange-600 block">Course 2 (Additional)</span>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{formData.course2.courseName}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">Lecturer: {formData.course2.lecturer} • {formData.course2.weeklyLectureDays} ({formData.course2.lectureTime})</p>
                          </div>
                        )}
                        {formData.course3?.courseName && (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-extrabold text-orange-600 block">Course 3 (Additional)</span>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{formData.course3.courseName}</p>
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
                          {/* Programme Type */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-2">
                              Programme Type *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(['Scholarship', 'Paid Programme'] as ProgrammeType[]).map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, programmeType: type })}
                                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                    formData.programmeType === type
                                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs'
                                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                                >
                                  <div>
                                    <span className="text-xs font-extrabold text-[#000E32] dark:text-white uppercase tracking-wider block">
                                      {type}
                                    </span>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      {type === 'Scholarship' ? 'Merit/sponsored academic admissions' : 'Standard tuition self-sponsored enrollment'}
                                    </p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    formData.programmeType === type
                                      ? 'border-orange-500 bg-orange-500 text-white'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}>
                                    {formData.programmeType === type && <Check size={12} strokeWidth={3} />}
                                  </div>
                                </button>
                              ))}
                            </div>
                            {validationErrors.programmeType && (
                              <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
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
                                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold'
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

                          {/* Training Mode */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-2">
                              Training Mode *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {(['Virtual Classes', 'Physical Classes', 'Hybrid Classes'] as TrainingMode[]).map(mode => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, trainingMode: mode })}
                                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                    formData.trainingMode === mode
                                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs'
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

                          {/* Preferred Teaching Language */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-2">
                              Preferred Teaching Language *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {(['English', 'Hausa', 'Yoruba', 'Igbo'] as TeachingLanguage[]).map(lang => (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, teachingLanguage: lang })}
                                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                    formData.teachingLanguage === lang
                                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold'
                                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300'
                                  }`}
                                >
                                  <span className="text-xs uppercase tracking-wider block">{lang}</span>
                                </button>
                              ))}
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#000E32] dark:text-orange-400 block">
                              Payment Record Verification
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              This section logs your self-reported payment record for Academy bursary auditing. If you are registering under a sponsored scholarship, corporate invoice, or paying at the campus bursary desk, check <strong>Non-Applicable</strong>.
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                              * Notice: Submitting a payment record does not automatically constitute approved clearance until audited by admissions bursars.
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
                              <div><span className="text-slate-400 font-medium">Programme:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.programmeType} ({formData.programmeDuration})</strong></div>
                              <div><span className="text-slate-400 font-medium">Training Mode:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.trainingMode} - {formData.teachingLanguage}</strong></div>
                              <div><span className="text-slate-400 font-medium">Course 1:</span> <strong className="text-slate-800 dark:text-slate-200 ml-1">{formData.course1.courseName || 'Missing'}</strong></div>
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
