import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, 
  GraduationCap, BookOpen, Layers, User, Award, HeartHandshake, 
  FileCheck, FileText, Check, Camera, Compass, Phone, Mail, 
  MapPin, Printer, Copy, RotateCcw, AlertCircle
} from 'lucide-react';
import { Logo } from '../Logo';
import { 
  StudentRegistrationApplication, 
  SelectedCourseConfig, 
  DurationOption, 
  LearningMode, 
  LectureDays, 
  LanguagePreference 
} from '../../types/studentRegistration';
import { ACADEMY_COURSES } from '../../lib/academyCoursesData';
import { 
  generateStudentAppId, 
  apiSaveStudentRegistration, 
  apiGetStudentRegistration 
} from '../../lib/studentStorage';
import { 
  getPendingEnrollmentIntent, 
  clearPendingEnrollmentIntent, 
  apiSaveEnrollment, 
  generateEnrollmentId 
} from '../../lib/enrollmentStorage';
import { AcademyEnrollment } from '../../types/enrollment';

// Subcomponents
import { Step1EntryModal } from './Step1EntryModal';
import { Step2ApplicationInfo } from './Step2ApplicationInfo';
import { Step3MultiCourseSelection } from './Step3MultiCourseSelection';
import { Step4PersonalInfo } from './Step4PersonalInfo';
import { Step5EduProfessional } from './Step5EduProfessional';
import { Step6CourseMotivation } from './Step6CourseMotivation';
import { Step7EmergencyContact } from './Step7EmergencyContact';
import { Step8Declaration } from './Step8Declaration';
import { Step9ReviewSubmit } from './Step9ReviewSubmit';
import { Step10Confirmation } from './Step10Confirmation';

interface StudentRegistrationFormProps {
  initialCourseId?: string;
  onNavigateHome?: () => void;
  onNavigateCourses?: () => void;
}

const STEPS = [
  { id: 1, name: 'Entry Portal', icon: Sparkles, short: 'Entry' },
  { id: 2, name: 'Primary Programme', icon: GraduationCap, short: 'Programme' },
  { id: 3, name: 'Multi-Course (Max 3)', icon: Layers, short: 'Courses' },
  { id: 4, name: 'Personal Profile', icon: User, short: 'Profile' },
  { id: 5, name: 'Education & Work', icon: BookOpen, short: 'Education' },
  { id: 6, name: 'Motivation & Goals', icon: Compass, short: 'Motivation' },
  { id: 7, name: 'Next of Kin', icon: HeartHandshake, short: 'Emergency' },
  { id: 8, name: 'Declaration & Sign', icon: ShieldCheck, short: 'Declaration' },
  { id: 9, name: 'Review & Submit', icon: FileCheck, short: 'Review' },
  { id: 10, name: 'Confirmation', icon: CheckCircle2, short: 'Confirmed' }
];

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  initialCourseId,
  onNavigateHome,
  onNavigateCourses
}) => {
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formViewMode, setFormViewMode] = useState<'edit' | 'preview'>('edit');

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const rootEl = document.getElementById('student-registration-root');
    if (rootEl) {
      rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep, formViewMode]);

  // Default or preserved course selection
  const pendingIntent = getPendingEnrollmentIntent();
  const defaultCourse = pendingIntent 
    ? (ACADEMY_COURSES.find(c => c.id === pendingIntent.courseId) || ACADEMY_COURSES.find(c => c.id === initialCourseId) || ACADEMY_COURSES[0])
    : (ACADEMY_COURSES.find(c => c.id === initialCourseId) || ACADEMY_COURSES[0]);

  const initialTuition = pendingIntent?.price || defaultCourse.price;

  const [formData, setFormData] = useState<StudentRegistrationApplication>({
    id: generateStudentAppId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'submitted',

    // Step 2: Primary Course
    primaryCourse: {
      courseId: defaultCourse.id,
      courseCode: defaultCourse.code,
      courseTitle: defaultCourse.title,
      categoryName: defaultCourse.categoryName,
      duration: (pendingIntent?.duration as DurationOption) || '1 Month',
      mode: (pendingIntent?.mode as LearningMode) || 'Physical',
      lectureDays: (pendingIntent?.lectureDays as LectureDays) || 'Mondays-Wednesdays',
      language: (pendingIntent?.language as LanguagePreference) || 'English',
      basePrice: defaultCourse.price,
      calculatedPrice: initialTuition
    },

    // Step 3: Additional Courses
    additionalCourses: [],
    totalTuitionFee: initialTuition,
    depositDue70Percent: Math.round(initialTuition * 0.7),
    balanceDue30Percent: Math.round(initialTuition * 0.3),

    // Step 4: Personal
    passportPhoto: '',
    fullName: pendingIntent?.fullName || '',
    dateOfBirth: '',
    gender: 'Female',
    countryCode: '+234',
    phoneNumber: pendingIntent?.phone || '',
    whatsappNumber: pendingIntent?.phone || '',
    emailAddress: pendingIntent?.email || '',
    residentialAddress: '',
    idType: 'NIN',
    idNumber: '',

    // Step 5: Educational
    highestQualification: 'B.Sc',
    institution: '',
    certificateUploadUrl: '',
    certificateFileName: '',
    currentOccupation: '',
    organisationBusiness: '',
    yearsOfExperience: '0-1 Year (Beginner)',
    computerLiteracy: 'Intermediate',
    ownsLaptop: true,
    ownsSmartphoneWithInternet: true,

    // Step 6: Motivation
    reasonForStudy: '',
    futureGoals: '',
    howDidYouHear: 'Social Media',
    howDidYouHearOther: '',

    // Step 7: Emergency
    primaryEmergencyContact: {
      fullName: '',
      relationship: 'Parent',
      phoneNumber: '',
      emailAddress: '',
      address: ''
    },
    secondaryEmergencyContact: undefined,

    // Step 8: Declaration
    agreedToTerms: false,
    declarationApplicantName: '',
    signatureData: '',
    declarationDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

    // Step 9: Meta
    reviewConfirmed: false
  });

  // Dynamic fee calculation
  useEffect(() => {
    const all = [formData.primaryCourse, ...(formData.additionalCourses || [])].filter(Boolean);
    const total = all.reduce((sum, c) => sum + (c.calculatedPrice || 0), 0);
    setFormData(prev => ({
      ...prev,
      totalTuitionFee: total,
      depositDue70Percent: Math.round(total * 0.7),
      balanceDue30Percent: Math.round(total * 0.3)
    }));
  }, [formData.primaryCourse, formData.additionalCourses]);

  // Quick Autofill for testing and rapid UX evaluation
  const handleQuickAutofill = () => {
    const primary = defaultCourse;
    setFormData(prev => ({
      ...prev,
      primaryCourse: {
        courseId: primary.id,
        courseCode: primary.code,
        courseTitle: primary.title,
        categoryName: primary.categoryName,
        duration: '3 Months',
        mode: 'Physical',
        lectureDays: 'Mondays-Wednesdays',
        language: 'English',
        basePrice: primary.price,
        calculatedPrice: primary.price * 1.5
      },
      fullName: 'Fatima Zainab Abubakar',
      dateOfBirth: '2001-06-18',
      gender: 'Female',
      countryCode: '+234',
      phoneNumber: '+2348034567890',
      whatsappNumber: '+2348034567890',
      emailAddress: 'fatima.abubakar2026@gmail.com',
      residentialAddress: 'Plot 402, Garki II, Area 11, Abuja FCT',
      idType: 'NIN',
      idNumber: '28491038471',
      highestQualification: 'B.Sc',
      institution: 'Ahmadu Bello University (Computer Science)',
      currentOccupation: 'Aspiring AI Specialist & Software Developer',
      organisationBusiness: 'Freelance Tech Innovator',
      yearsOfExperience: '1-3 Years',
      computerLiteracy: 'Advanced',
      ownsLaptop: true,
      ownsSmartphoneWithInternet: true,
      reasonForStudy: 'To master advanced practical AI model development, full-stack frameworks, and secure enterprise software architectures at DS Tech Academy.',
      futureGoals: 'To lead digital transformation in West Africa, build AI-driven agricultural solutions, and mentor future female developers.',
      howDidYouHear: 'Social Media',
      primaryEmergencyContact: {
        fullName: 'Alhaji Abubakar Sadiq',
        relationship: 'Parent',
        phoneNumber: '+2348021234567',
        emailAddress: 'abubakar.sadiq@gmail.com',
        address: 'Plot 402, Garki II, Area 11, Abuja FCT'
      },
      agreedToTerms: true,
      declarationApplicantName: 'Fatima Zainab Abubakar',
      signatureData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'><path d='M15,40 Q40,15 75,35 T135,25 T165,45' fill='none' stroke='%23ea580c' stroke-width='3.5'/></svg>",
      declarationDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    }));
    setValidationError(null);
    setCurrentStep(9); // Navigate to Review & Submit
  };

  const handleStartNew = () => {
    setIsEntryModalOpen(false);
    setCurrentStep(2);
  };

  const handleLoadExisting = (reg: StudentRegistrationApplication) => {
    setFormData(reg);
    setIsEntryModalOpen(false);
    setCurrentStep(10);
  };

  // Step Validation logic
  const validateCurrentStep = (step: number): boolean => {
    setValidationError(null);

    if (step === 2) {
      if (!formData.primaryCourse?.courseCode) {
        setValidationError('Please select a valid primary programme to proceed.');
        return false;
      }
    }

    if (step === 4) {
      if (!formData.fullName.trim()) {
        setValidationError('Please enter your full legal name (surname first).');
        return false;
      }
      if (!formData.dateOfBirth) {
        setValidationError('Please select your date of birth.');
        return false;
      }
      if (!formData.phoneNumber.trim()) {
        setValidationError('Please enter your active phone number.');
        return false;
      }
      if (!formData.whatsappNumber.trim()) {
        setValidationError('Please enter your active WhatsApp number.');
        return false;
      }
      if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
        setValidationError('Please enter a valid email address.');
        return false;
      }
      if (!formData.residentialAddress.trim()) {
        setValidationError('Please enter your residential address.');
        return false;
      }
      if (!formData.idNumber.trim()) {
        setValidationError(`Please enter your ${formData.idType} number.`);
        return false;
      }
    }

    if (step === 5) {
      if (!formData.institution.trim()) {
        setValidationError('Please specify the institution or school attended.');
        return false;
      }
      if (!formData.currentOccupation.trim()) {
        setValidationError('Please specify your current occupation.');
        return false;
      }
    }

    if (step === 6) {
      if (!formData.reasonForStudy.trim()) {
        setValidationError('Please describe why you wish to study this programme.');
        return false;
      }
      if (!formData.futureGoals.trim()) {
        setValidationError('Please describe your post-programme career or startup objectives.');
        return false;
      }
    }

    if (step === 7) {
      if (!formData.primaryEmergencyContact.fullName.trim()) {
        setValidationError('Please enter the full name of your primary emergency contact.');
        return false;
      }
      if (!formData.primaryEmergencyContact.phoneNumber.trim()) {
        setValidationError('Please enter the phone number of your primary emergency contact.');
        return false;
      }
      if (!formData.primaryEmergencyContact.address.trim()) {
        setValidationError('Please enter the residential address of your emergency contact.');
        return false;
      }
    }

    if (step === 8) {
      if (!formData.agreedToTerms) {
        setValidationError('You must agree and check the declaration terms to proceed.');
        return false;
      }
      if (!formData.declarationApplicantName.trim()) {
        setValidationError('Please type your legal applicant name in the declaration box.');
        return false;
      }
      if (!formData.signatureData) {
        setValidationError('Please provide your electronic signature (typed or drawn).');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 10));
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 2) {
      setCurrentStep(prev => prev - 1);
    } else if (currentStep === 2) {
      setIsEntryModalOpen(true);
      setCurrentStep(1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionData: StudentRegistrationApplication = {
        ...formData,
        updatedAt: new Date().toISOString(),
        reviewConfirmed: true,
        status: 'submitted'
      };

      await apiSaveStudentRegistration(submissionData);

      // Also automatically record initial course enrollment for the new student
      try {
        const enrollmentRecord: AcademyEnrollment = {
          id: generateEnrollmentId(),
          enrollmentNumber: generateEnrollmentId(),
          studentId: submissionData.id,
          studentEmail: submissionData.emailAddress,
          studentName: submissionData.fullName,
          studentPhone: submissionData.phoneNumber,
          courseId: submissionData.primaryCourse.courseId,
          courseCode: submissionData.primaryCourse.courseCode,
          courseTitle: submissionData.primaryCourse.courseTitle,
          categoryName: submissionData.primaryCourse.categoryName,
          duration: submissionData.primaryCourse.duration,
          mode: submissionData.primaryCourse.mode,
          lectureDays: submissionData.primaryCourse.lectureDays,
          language: submissionData.primaryCourse.language,
          location: submissionData.primaryCourse.mode === 'Physical' ? 'Abuja Hub (Main Campus)' : 'Virtual Online Hub',
          amount: submissionData.primaryCourse.calculatedPrice,
          paymentMethod: 'paystack',
          paymentStatus: 'pending',
          status: 'enrolled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verifiedAt: new Date().toISOString()
        };
        await apiSaveEnrollment(enrollmentRecord);
      } catch (enrErr) {
        console.warn('Auto-enrollment creation on student reg notice:', enrErr);
      }

      clearPendingEnrollmentIntent();
      setFormData(submissionData);
      setCurrentStep(10);
    } catch (err) {
      setValidationError('Submission failed due to network issue. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = STEPS.length;
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div id="student-registration-root" className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Step 1 Entry Modal */}
      <Step1EntryModal
        isOpen={isEntryModalOpen && currentStep === 1}
        onStartNew={handleStartNew}
        onLoadExisting={handleLoadExisting}
      />

      <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
        
        {/* Dedicated Standalone Academy Student Header */}
        <div className="bg-slate-900/95 rounded-2xl md:rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-950/50 overflow-hidden backdrop-blur-2xl">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 h-1.5 w-full animate-gradient" />
          
          <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onNavigateCourses || onNavigateHome}
                className="p-2.5 text-slate-300 hover:text-indigo-300 hover:bg-slate-800/80 rounded-2xl transition-all flex items-center justify-center border border-slate-800 cursor-pointer shadow-sm group"
                title="Back to Academy Overview"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <Logo size="sm" variant="light" />
              <div className="h-9 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black tracking-widest uppercase">
                    ACADEMY STUDENT ENROLLMENT
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">10-Step Official Student Accreditation & Course Registration Portal</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto">
              <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accreditation Progress</span>
                <span className="text-xs font-black text-indigo-300 bg-slate-950 px-3 py-1 rounded-xl mt-0.5 shadow-inner border border-indigo-500/30">
                  {progressPercent}% Completed
                </span>
              </div>

              {currentStep < 10 && (
                <button
                  type="button"
                  onClick={handleQuickAutofill}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200 rounded-2xl text-xs font-bold transition-all duration-300 border border-indigo-500/40 shadow-sm hover:shadow-indigo-500/10 hover:-translate-y-0.5 shrink-0 cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-400 animate-pulse" />
                  <span>Quick Autofill</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Horizontal Steps Scrollbar */}
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800/80 lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent">
              {STEPS.map(step => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id <= currentStep || isCompleted) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                        : isCompleted
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <StepIcon size={12} className={isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>{step.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Form Split: Left Steps Trackbar + Right Content Window */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side Trackbar Rail (Desktop) */}
          <div className="lg:col-span-4 bg-slate-900/90 p-6 rounded-3xl shadow-2xl border border-slate-800/80 hidden lg:block sticky top-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">
                Student Admission Sections
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">10 Modules</span>
            </div>

            <div className="space-y-2">
              {STEPS.map(step => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id <= currentStep || isCompleted) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 text-left cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 translate-x-1.5'
                        : isCompleted
                        ? 'text-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive
                          ? 'bg-slate-950 text-indigo-300'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <StepIcon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] opacity-70 font-semibold tracking-wider uppercase leading-none">
                        Module {step.id}
                      </span>
                      <span className="text-xs font-bold truncate mt-1">
                        {step.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Registry Support card */}
            <div className="mt-6 pt-6 border-t border-slate-800 text-left">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block mb-1">Admissions Desk</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Need help selecting your courses? Our academic counselors are available on WhatsApp: <strong className="text-white">+234 902 348 9111</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Form Content Window */}
          <div className="lg:col-span-8 bg-slate-900/90 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden backdrop-blur-xl">
            <div className="p-6 md:p-8 min-h-[440px]">
              
              {/* Dual-View Segmented Switch */}
              {currentStep < 10 && (
                <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 max-w-md border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormViewMode('edit')}
                    className={`flex-1 py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      formViewMode === 'edit'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <User size={13} className={formViewMode === 'edit' ? 'text-white' : 'text-slate-400'} />
                    Fill Form Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormViewMode('preview')}
                    className={`flex-1 py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      formViewMode === 'preview'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText size={13} className={formViewMode === 'preview' ? 'text-white' : 'text-slate-400'} />
                    Live Admission Draft
                    <span className="bg-indigo-500/20 text-indigo-300 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide">Live Draft</span>
                  </button>
                </div>
              )}

              {/* Validation Alert */}
              {validationError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-3 animate-shake">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* View Mode: Live Admission Letter Draft Preview */}
              {formViewMode === 'preview' ? (
                <div className="space-y-6 text-left">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3">
                    <Sparkles className="text-orange-400 shrink-0 mt-0.5 animate-pulse" size={18} />
                    <div>
                      <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wide">Real-time Admission Offer Letter Draft</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium mt-1">
                        Your official provisional admission letter is generated below in real-time. As you update your profile and select courses, your details, tuition schedule, and legal credentials are automatically synchronized.
                      </p>
                    </div>
                  </div>

                  {/* High-Fidelity Provisional Admission Letter */}
                  <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 text-slate-100 shadow-2xl relative overflow-hidden space-y-6 font-serif">
                    {/* Watermark Crest */}
                    <div className="absolute right-6 bottom-10 opacity-5 pointer-events-none">
                      <GraduationCap size={240} className="text-orange-400" />
                    </div>

                    {/* Official Letterhead */}
                    <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Logo size="md" variant="light" />
                        <div>
                          <h2 className="text-lg font-black tracking-tight text-white font-sans">DS TECH ACADEMY</h2>
                          <p className="text-[10px] text-orange-400 font-sans uppercase font-bold tracking-widest">CAC RC-7945781 • Federal Republic of Nigeria</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-sans text-slate-400">
                        <span className="block font-bold text-white">Admissions & Registry Board</span>
                        <span>Plot 402, Garki II, Abuja FCT</span>
                        <span className="block text-emerald-400 font-mono text-[10px]">VERIFIED REGISTRY DOCKET</span>
                      </div>
                    </div>

                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sans border-b border-slate-800/80 pb-4 text-slate-300">
                      <div><strong>Application ID:</strong> <span className="font-mono text-orange-400 font-bold">{formData.id}</span></div>
                      <div><strong>Date Issued:</strong> {formData.declarationDate || new Date().toLocaleDateString('en-GB')}</div>
                      <div><strong>Status:</strong> <span className="text-emerald-400 font-bold uppercase">Provisional Matriculation Offer</span></div>
                    </div>

                    {/* Body Text */}
                    <div className="space-y-4 text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                      <p>
                        Dear <strong className="text-white">{formData.fullName || '[Applicant Full Name]'}</strong>,
                      </p>
                      <p>
                        On behalf of the Academic Governing Board of <strong>DS Tech Academy</strong>, we are pleased to offer you provisional admission to the accredited professional tech masterclass program for the 2026 academic cohort.
                      </p>

                      {/* Enrolled Courses Box */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Enrolled Academic Curriculum</h4>
                        
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-orange-400 font-bold">{formData.primaryCourse.courseCode}</span>
                            <h5 className="text-xs font-bold text-white">{formData.primaryCourse.courseTitle}</h5>
                            <p className="text-[10px] text-slate-400">{formData.primaryCourse.duration} • {formData.primaryCourse.mode} Mode • 70% Practical</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-white">₦{formData.primaryCourse.calculatedPrice?.toLocaleString()}</span>
                            <span className="block text-[10px] text-emerald-400">Primary Track</span>
                          </div>
                        </div>

                        {formData.additionalCourses?.map((addCourse, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] font-mono text-amber-400 font-bold">{addCourse.courseCode}</span>
                              <h5 className="text-xs font-bold text-white">{addCourse.courseTitle}</h5>
                              <p className="text-[10px] text-slate-400">{addCourse.duration} • Elective Specialization</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-white">₦{addCourse.calculatedPrice?.toLocaleString()}</span>
                              <span className="block text-[10px] text-amber-400">Elective #{idx + 1}</span>
                            </div>
                          </div>
                        ))}

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-300">Total Program Tuition:</span>
                          <span className="text-base text-orange-400 font-mono font-black">₦{formData.totalTuitionFee.toLocaleString()}</span>
                        </div>
                      </div>

                      <p>
                        This admission is governed by the 70% practical laboratory attendance requirement, adherence to software craftsmanship standards, and compliance with the DS Tech Academy honor code.
                      </p>
                    </div>

                    {/* Signature and Seal Section */}
                    <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Student Digital Signature</span>
                        {formData.signatureData ? (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 inline-block">
                            <img src={formData.signatureData} alt="Applicant Signature" className="h-10 object-contain filter invert" />
                            <span className="text-[9px] text-slate-400 block mt-1">{formData.declarationApplicantName || formData.fullName}</span>
                          </div>
                        ) : (
                          <div className="h-12 border-b border-dashed border-slate-700 flex items-end text-[10px] text-slate-500">
                            Signature Pending (Complete Section 8)
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Academic Registrar Approval</span>
                        <div className="inline-flex flex-col items-end">
                          <span className="text-xs font-bold text-white">Engr. D. S. Abubakar</span>
                          <span className="text-[10px] text-orange-400">Director of Academic Affairs</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono mt-1">CAC CERTIFIED • DS TECH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode: Step Forms */
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentStep === 2 && (
                      <Step2ApplicationInfo
                        primaryCourse={formData.primaryCourse}
                        onChange={(course) => setFormData(prev => ({ ...prev, primaryCourse: course }))}
                        applicationDate={formData.createdAt}
                      />
                    )}

                    {currentStep === 3 && (
                      <Step3MultiCourseSelection
                        primaryCourse={formData.primaryCourse}
                        additionalCourses={formData.additionalCourses || []}
                        onUpdatePrimary={(course) => setFormData(prev => ({ ...prev, primaryCourse: course }))}
                        onUpdateAdditional={(courses) => setFormData(prev => ({ ...prev, additionalCourses: courses }))}
                      />
                    )}

                    {currentStep === 4 && (
                      <Step4PersonalInfo
                        passportPhoto={formData.passportPhoto}
                        fullName={formData.fullName}
                        dateOfBirth={formData.dateOfBirth}
                        gender={formData.gender}
                        countryCode={formData.countryCode}
                        phoneNumber={formData.phoneNumber}
                        whatsappNumber={formData.whatsappNumber}
                        emailAddress={formData.emailAddress}
                        residentialAddress={formData.residentialAddress}
                        idType={formData.idType}
                        idNumber={formData.idNumber}
                        onChange={(fields) => setFormData(prev => ({ ...prev, ...fields }))}
                      />
                    )}

                    {currentStep === 5 && (
                      <Step5EduProfessional
                        highestQualification={formData.highestQualification}
                        institution={formData.institution}
                        certificateUploadUrl={formData.certificateUploadUrl}
                        certificateFileName={formData.certificateFileName}
                        currentOccupation={formData.currentOccupation}
                        organisationBusiness={formData.organisationBusiness}
                        yearsOfExperience={formData.yearsOfExperience}
                        computerLiteracy={formData.computerLiteracy}
                        ownsLaptop={formData.ownsLaptop}
                        ownsSmartphoneWithInternet={formData.ownsSmartphoneWithInternet}
                        onChange={(fields) => setFormData(prev => ({ ...prev, ...fields }))}
                      />
                    )}

                    {currentStep === 6 && (
                      <Step6CourseMotivation
                        reasonForStudy={formData.reasonForStudy}
                        futureGoals={formData.futureGoals}
                        howDidYouHear={formData.howDidYouHear}
                        howDidYouHearOther={formData.howDidYouHearOther}
                        onChange={(fields) => setFormData(prev => ({ ...prev, ...fields }))}
                      />
                    )}

                    {currentStep === 7 && (
                      <Step7EmergencyContact
                        primaryEmergencyContact={formData.primaryEmergencyContact}
                        secondaryEmergencyContact={formData.secondaryEmergencyContact}
                        onChangePrimary={(contact) => setFormData(prev => ({ ...prev, primaryEmergencyContact: contact }))}
                        onChangeSecondary={(contact) => setFormData(prev => ({ ...prev, secondaryEmergencyContact: contact }))}
                      />
                    )}

                    {currentStep === 8 && (
                      <Step8Declaration
                        agreedToTerms={formData.agreedToTerms}
                        declarationApplicantName={formData.declarationApplicantName}
                        signatureData={formData.signatureData}
                        declarationDate={formData.declarationDate}
                        onChange={(fields) => setFormData(prev => ({ ...prev, ...fields }))}
                      />
                    )}

                    {currentStep === 9 && (
                      <Step9ReviewSubmit
                        formData={formData}
                        onJumpToStep={(stepNum) => setCurrentStep(stepNum)}
                        onSubmit={handleFinalSubmit}
                        isSubmitting={isSubmitting}
                      />
                    )}

                    {currentStep === 10 && (
                      <Step10Confirmation
                        application={formData}
                        onTrack={() => setCurrentStep(10)}
                        onReturnHome={onNavigateHome || (() => {})}
                        onViewCourses={onNavigateCourses || (() => {})}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Bottom Stepper Action Bar */}
            {currentStep > 1 && currentStep < 10 && (
              <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
                >
                  <ArrowLeft size={14} />
                  <span>Previous Step</span>
                </button>

                <div className="text-xs text-slate-400 font-mono hidden sm:block">
                  Section {currentStep} of 10
                </div>

                {currentStep < 9 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Continue to Next Step</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Registering Application...</span>
                    ) : (
                      <>
                        <span>Submit Official Admission</span>
                        <Check size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
