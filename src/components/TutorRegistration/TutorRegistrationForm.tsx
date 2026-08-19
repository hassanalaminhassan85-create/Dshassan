import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, ShieldCheck, 
  AlertCircle, Loader2, GraduationCap, User, BookOpen, 
  Briefcase, HeartHandshake, FileCheck2, CheckCircle2, 
  FileText, Award, Compass, Layers, Phone, Mail, MapPin, 
  Printer, Copy, RotateCcw 
} from 'lucide-react';
import { Logo } from '../Logo';
import { 
  TutorApplication, 
  SelectedCoursePosition 
} from '../../types/tutorRegistration';
import { 
  generateTutorAppId, 
  apiSaveTutorApplication 
} from '../../lib/tutorStorage';
import { Step1TutorEntryModal } from './Step1TutorEntryModal';
import { Step2TutorPersonalInfo } from './Step2TutorPersonalInfo';
import { Step3TutorAcademicInfo } from './Step3TutorAcademicInfo';
import { Step4TutorPositions } from './Step4TutorPositions';
import { Step5TutorExperience } from './Step5TutorExperience';
import { Step6TutorMotivation } from './Step6TutorMotivation';
import { Step7TutorEmergencyContact } from './Step7TutorEmergencyContact';
import { Step8TutorDeclaration } from './Step8TutorDeclaration';
import { Step9TutorConfirmation } from './Step9TutorConfirmation';

interface TutorRegistrationFormProps {
  onNavigateHome?: () => void;
  onNavigateCourses?: () => void;
}

const STEPS = [
  { id: 1, name: 'Entry Portal', icon: Sparkles },
  { id: 2, name: 'Personal Profile', icon: User },
  { id: 3, name: 'Academic & CV', icon: BookOpen },
  { id: 4, name: 'Course Positions', icon: Briefcase },
  { id: 5, name: 'Experience & Skills', icon: Award },
  { id: 6, name: 'Motivation', icon: Compass },
  { id: 7, name: 'Emergency Contact', icon: HeartHandshake },
  { id: 8, name: 'Declaration & Sign', icon: ShieldCheck },
  { id: 9, name: 'Confirmation', icon: CheckCircle2 }
];

export const TutorRegistrationForm: React.FC<TutorRegistrationFormProps> = ({
  onNavigateHome,
  onNavigateCourses
}) => {
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [formViewMode, setFormViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const rootEl = document.getElementById('tutor-registration-root');
    if (rootEl) {
      rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep, formViewMode]);

  // Initialize tutor form data
  const [formData, setFormData] = useState<TutorApplication>({
    id: generateTutorAppId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'submitted',

    // Step 2: Personal
    fullName: '',
    nationality: 'Nigeria',
    stateOfOrigin: 'Kano',
    tribe: 'Hausa',
    phoneCountryCode: '+234',
    phoneNumber: '',
    whatsappCountryCode: '+234',
    whatsappNumber: '',
    maritalStatus: 'Single',
    dateOfBirth: '',
    idType: 'NIN',
    idNumber: '',
    emailAddress: '',
    residentialOfficeLocation: '',
    preferredTeachingMode: 'Hybrid',
    preferredTeachingDays: 'Monday-Friday',

    // Step 3: Academic
    highestQualification: 'B.Sc',
    institution: '',
    studyStatus: 'Graduate',
    relevantCertifications: [],
    currentOccupation: '',
    organizationCompany: '',

    // Step 4: Course Selection
    selectedCoursesWithPositions: [],
    teachingLanguages: ['English'],

    // Step 5: Experience
    yearsOfExperience: '3 - 5 Years',
    previousExperiences: [],
    practicalSkills: ['', '', '', '', ''],
    socialMediaHandle1: '',
    socialMediaHandle2: '',

    // Step 6: Motivation
    whySelectPosition: '',
    whyChooseDsTechAcademy: '',
    howDidYouHear: 'Social Media (LinkedIn/X/IG)',

    // Step 7: Emergency Contact
    emergencyContact: {
      fullName: '',
      relationship: 'Spouse',
      nationality: 'Nigeria',
      stateOfOrigin: 'Kano',
      residentialOfficeLocation: '',
      phoneWhatsappNumber: ''
    },

    // Step 8: Declaration
    agreedToTerms: false,
    declarationApplicantName: '',
    signatureData: '',
    declarationDate: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  });

  const handleUpdate = (updated: Partial<TutorApplication>) => {
    setFormData(prev => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString()
    }));
    setValidationError(null);
  };

  // Quick Autofill for testing and instant inspection
  const handleQuickAutofill = () => {
    setFormData(prev => ({
      ...prev,
      fullName: 'Engr. Dr. Ibrahim Musa Bello',
      dateOfBirth: '1988-03-24',
      nationality: 'Nigeria',
      stateOfOrigin: 'Kano',
      tribe: 'Hausa',
      phoneNumber: '+2348039876543',
      whatsappNumber: '+2348039876543',
      emailAddress: 'dr.ibrahim.bello@dstech.edu.ng',
      residentialOfficeLocation: 'Suite 204, Tech Park, Central Business District, Abuja FCT',
      idType: 'NIN',
      idNumber: '39485720194',
      highestQualification: 'PhD',
      institution: 'Federal University of Technology, Minna (Software Engineering)',
      studyStatus: 'Graduate',
      currentOccupation: 'Principal AI Systems Architect',
      organizationCompany: 'Apex Digital Systems Ltd',
      cvResumeFileName: 'Dr_Ibrahim_Bello_Academic_CV.pdf',
      yearsOfExperience: '5+ Years (Senior/Lead)',
      practicalSkills: [
        'Python & PyTorch AI/ML Pipelines',
        'Full-Stack React & Node.js Architecture',
        'Cloud Infrastructure & Kubernetes',
        'PostgreSQL & Vector Databases',
        'System Security & Microservices'
      ],
      socialMediaHandle1: 'https://linkedin.com/in/dr-ibrahim-bello-ai',
      socialMediaHandle2: 'https://github.com/ibrahimbello-dev',
      selectedCoursesWithPositions: [
        {
          courseId: 'ai-machine-learning',
          courseCode: 'DSTA-AI101',
          courseTitle: 'Artificial Intelligence & Machine Learning Masterclass',
          categoryName: 'Artificial Intelligence & Data Science',
          selectedPositions: ['Lead Course Lecturer / Lead Instructor', 'Project Mentor & Capstone Reviewer']
        },
        {
          courseId: 'fullstack-web-dev',
          courseCode: 'DSTA-FS101',
          courseTitle: 'Full-Stack Web Application Development',
          categoryName: 'Software Engineering',
          selectedPositions: ['Weekend Practical Lab Facilitator']
        }
      ],
      whySelectPosition: 'I have trained over 400 developers and built enterprise machine learning platforms. Teaching at DS Tech Academy allows me to bridge the gap between academic theory and high-impact industry deployment.',
      whyChooseDsTechAcademy: 'DS Tech Academy provides the gold standard in practical, project-driven technological training in West Africa with an elite standard of instruction.',
      emergencyContact: {
        fullName: 'Hajiya Amina Bello',
        relationship: 'Spouse',
        nationality: 'Nigeria',
        stateOfOrigin: 'Kano',
        residentialOfficeLocation: 'Suite 204, CBD, Abuja FCT',
        phoneWhatsappNumber: '+2348023456789'
      },
      agreedToTerms: true,
      declarationApplicantName: 'Engr. Dr. Ibrahim Musa Bello',
      signatureData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'><path d='M10,45 Q35,10 70,30 T130,20 T170,40' fill='none' stroke='%23d97706' stroke-width='3.5'/></svg>",
      declarationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }));
    setValidationError(null);
    setCurrentStep(8); // Jump to final declaration
  };

  // Validation before advancing
  const validateStep = (step: number): boolean => {
    setValidationError(null);

    if (step === 2) {
      if (!formData.fullName.trim()) {
        setValidationError('Please enter your full legal name (surname first).');
        return false;
      }
      if (!formData.dateOfBirth) {
        setValidationError('Please provide your date of birth.');
        return false;
      }
      if (!formData.idNumber.trim()) {
        setValidationError('Please provide your ID / NIN number.');
        return false;
      }
      if (!formData.phoneNumber.trim()) {
        setValidationError('Please provide your phone number.');
        return false;
      }
      if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
        setValidationError('Please enter a valid email address.');
        return false;
      }
      if (!formData.residentialOfficeLocation.trim()) {
        setValidationError('Please provide your residential or office physical location.');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.institution.trim()) {
        setValidationError('Please specify your academic institution.');
        return false;
      }
      if (!formData.currentOccupation.trim()) {
        setValidationError('Please enter your current occupation/position.');
        return false;
      }
      if (!formData.organizationCompany.trim()) {
        setValidationError('Please enter your company / organization name.');
        return false;
      }
      if (!formData.cvResumeUrl && !formData.cvResumeFileName) {
        setValidationError('Please upload your CV / Resume.');
        return false;
      }
    }

    if (step === 4) {
      if (!formData.selectedCoursesWithPositions || formData.selectedCoursesWithPositions.length === 0) {
        setValidationError('Please select at least one course and position you wish to instruct.');
        return false;
      }
      const missingPositions = formData.selectedCoursesWithPositions.some(c => c.selectedPositions.length === 0);
      if (missingPositions) {
        setValidationError('Please check at least one instructor position role for each of your selected courses.');
        return false;
      }
    }

    if (step === 5) {
      const skillsArray = Array.isArray(formData.practicalSkills) ? formData.practicalSkills : [];
      const filledSkills = skillsArray.filter((s: string) => typeof s === 'string' && s.trim().length > 0);
      if (filledSkills.length < 3) {
        setValidationError('Please provide at least 3 practical technical skills (5 recommended).');
        return false;
      }
      if (!formData.socialMediaHandle1.trim()) {
        setValidationError('Please provide your primary professional profile link (LinkedIn or GitHub).');
        return false;
      }
    }

    if (step === 6) {
      if (!formData.whySelectPosition.trim()) {
        setValidationError('Please answer why you selected this/these instructor position(s).');
        return false;
      }
      if (!formData.whyChooseDsTechAcademy.trim()) {
        setValidationError('Please answer why you choose DS Tech Academy.');
        return false;
      }
    }

    if (step === 7) {
      if (!formData.emergencyContact.fullName.trim()) {
        setValidationError('Please provide the full name of your emergency contact.');
        return false;
      }
      if (!formData.emergencyContact.phoneWhatsappNumber.trim()) {
        setValidationError('Please provide the phone number for your emergency contact.');
        return false;
      }
    }

    if (step === 8) {
      if (!formData.agreedToTerms) {
        setValidationError('You must check the box agreeing to the official instructor appointment declaration.');
        return false;
      }
      if (!formData.declarationApplicantName.trim()) {
        setValidationError('Please provide your full legal name as your declaration sign-off.');
        return false;
      }
      if (!formData.signatureData) {
        setValidationError('Please provide your electronic signature (draw or type).');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
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
    if (!validateStep(8)) return;

    setIsSubmitting(true);
    try {
      const submission: TutorApplication = {
        ...formData,
        updatedAt: new Date().toISOString(),
        status: 'submitted'
      };

      await apiSaveTutorApplication(submission);
      setFormData(submission);
      setCurrentStep(9);
    } catch (err) {
      setValidationError('Failed to submit application. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = STEPS.length;
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div id="tutor-registration-root" className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Step 1: Entry Modal */}
      {isEntryModalOpen && currentStep === 1 && (
        <Step1TutorEntryModal
          onStartNew={() => {
            setIsEntryModalOpen(false);
            setCurrentStep(2);
          }}
          onResumeApplication={(loaded) => {
            setFormData(loaded);
            setIsEntryModalOpen(false);
            setCurrentStep(9);
          }}
        />
      )}

      <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
        
        {/* Dedicated Standalone Academy Faculty Header */}
        <div className="bg-slate-900/95 rounded-2xl md:rounded-3xl border border-emerald-500/20 shadow-2xl shadow-emerald-950/50 overflow-hidden backdrop-blur-2xl">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-1.5 w-full animate-gradient" />
          
          <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onNavigateCourses || onNavigateHome}
                className="p-2.5 text-slate-300 hover:text-emerald-300 hover:bg-slate-800/80 rounded-2xl transition-all flex items-center justify-center border border-slate-800 cursor-pointer shadow-sm group"
                title="Back to Academy Overview"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <Logo size="sm" variant="light" />
              <div className="h-9 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black tracking-widest uppercase">
                    FACULTY & TUTOR PORTAL
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">9-Step Academic & Professional Instructor Appointment Docket</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto">
              <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Progress</span>
                <span className="text-xs font-black text-emerald-300 bg-slate-950 px-3 py-1 rounded-xl mt-0.5 shadow-inner border border-emerald-500/30">
                  {progressPercent}% Completed
                </span>
              </div>

              {currentStep < 9 && (
                <button
                  type="button"
                  onClick={handleQuickAutofill}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 rounded-2xl text-xs font-bold transition-all duration-300 border border-emerald-500/40 shadow-sm hover:shadow-emerald-500/10 hover:-translate-y-0.5 shrink-0 cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-400 animate-pulse" />
                  <span>Quick Autofill</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Horizontal Steps Carousel */}
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800/80 lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
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
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
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

        {/* Main Grid: Left Rail + Right Window */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side Trackbar Rail (Desktop) */}
          <div className="lg:col-span-4 bg-slate-900/90 p-6 rounded-3xl shadow-2xl border border-slate-800/80 hidden lg:block sticky top-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">
                Faculty Accreditation Sections
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">9 Modules</span>
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
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 translate-x-1.5'
                        : isCompleted
                        ? 'text-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive
                          ? 'bg-slate-950 text-emerald-300'
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

            {/* Academic Board Support card */}
            <div className="mt-6 pt-6 border-t border-slate-800 text-left">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Faculty Affairs Desk</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Have questions about instructor compensation or syllabus customization? Email: <strong className="text-white">faculty@dstech.edu.ng</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Form Content Window */}
          <div className="lg:col-span-8 bg-slate-900/90 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden backdrop-blur-xl">
            <div className="p-6 md:p-8 min-h-[440px]">
              
              {/* Dual-View Segmented Switch */}
              {currentStep < 9 && (
                <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 max-w-md border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormViewMode('edit')}
                    className={`flex-1 py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      formViewMode === 'edit'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
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
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText size={13} className={formViewMode === 'preview' ? 'text-white' : 'text-slate-400'} />
                    Live Faculty Draft
                    <span className="bg-emerald-500/20 text-emerald-300 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide">Live Draft</span>
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

              {/* View Mode: Live Faculty Appointment Draft Preview */}
              {formViewMode === 'preview' ? (
                <div className="space-y-6 text-left">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                    <Sparkles className="text-amber-400 shrink-0 mt-0.5 animate-pulse" size={18} />
                    <div>
                      <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wide">Real-time Faculty Appointment & Engagement Docket</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium mt-1">
                        Your official instructor appointment agreement is drafted below in real-time. As you update your profile, select target courses, and specify teaching modes, your docket updates automatically.
                      </p>
                    </div>
                  </div>

                  {/* High-Fidelity Faculty Letter Draft */}
                  <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 text-slate-100 shadow-2xl relative overflow-hidden space-y-6 font-serif">
                    {/* Watermark */}
                    <div className="absolute right-6 bottom-10 opacity-5 pointer-events-none">
                      <GraduationCap size={240} className="text-amber-400" />
                    </div>

                    {/* Official Letterhead */}
                    <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Logo size="md" variant="light" />
                        <div>
                          <h2 className="text-lg font-black tracking-tight text-white font-sans">DS TECH ACADEMY</h2>
                          <p className="text-[10px] text-amber-400 font-sans uppercase font-bold tracking-widest">CAC RC-7945781 • Faculty & Academic Directorate</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-sans text-slate-400">
                        <span className="block font-bold text-white">Academic Faculty Directorate</span>
                        <span>Plot 402, Garki II, Abuja FCT</span>
                        <span className="block text-emerald-400 font-mono text-[10px]">VERIFIED FACULTY DOCKET</span>
                      </div>
                    </div>

                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sans border-b border-slate-800/80 pb-4 text-slate-300">
                      <div><strong>Faculty Docket ID:</strong> <span className="font-mono text-amber-400 font-bold">{formData.id}</span></div>
                      <div><strong>Date:</strong> {formData.declarationDate || new Date().toLocaleDateString('en-GB')}</div>
                      <div><strong>Teaching Mode:</strong> <span className="text-amber-400 font-bold uppercase">{formData.preferredTeachingMode}</span></div>
                    </div>

                    {/* Body Text */}
                    <div className="space-y-4 text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                      <p>
                        Dear <strong className="text-white">{formData.fullName || '[Applicant Full Name]'}</strong>,
                      </p>
                      <p>
                        The Academic Governance Board of <strong>DS Tech Academy</strong> has reviewed your faculty credentials, academic background in <strong>{formData.highestQualification} ({formData.institution || 'Accredited University'})</strong>, and verified practical skill set.
                      </p>

                      {/* Appointed Course Tracks */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Assigned Faculty Tracks & Positions</h4>
                        
                        {formData.selectedCoursesWithPositions.length > 0 ? (
                          formData.selectedCoursesWithPositions.map((c, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{c.courseTitle}</span>
                                <span className="text-[10px] font-mono text-amber-400 font-bold">{c.courseCode}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {c.selectedPositions.map((pos, pIdx) => (
                                  <span key={pIdx} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-semibold">
                                    {pos}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">No courses selected yet (Complete Section 4).</p>
                        )}
                      </div>

                      <p>
                        Faculty engagements require upholding our rigorous 70% hands-on laboratory methodology, maintaining project milestones on GitHub/GitLab, and mentoring student capstone deliverables.
                      </p>
                    </div>

                    {/* Signature and Seal Section */}
                    <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Faculty Electronic Signature</span>
                        {formData.signatureData ? (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 inline-block">
                            <img src={formData.signatureData} alt="Faculty Signature" className="h-10 object-contain filter invert" />
                            <span className="text-[9px] text-slate-400 block mt-1">{formData.declarationApplicantName || formData.fullName}</span>
                          </div>
                        ) : (
                          <div className="h-12 border-b border-dashed border-slate-700 flex items-end text-[10px] text-slate-500">
                            Signature Pending (Complete Section 8)
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Dean of Academic Affairs</span>
                        <div className="inline-flex flex-col items-end">
                          <span className="text-xs font-bold text-white">Engr. D. S. Abubakar</span>
                          <span className="text-[10px] text-amber-400">Director of Academic Affairs</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono mt-1">CAC CERTIFIED • DS TECH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step Forms */
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentStep === 2 && (
                      <Step2TutorPersonalInfo
                        data={formData}
                        onChange={handleUpdate}
                      />
                    )}

                    {currentStep === 3 && (
                      <Step3TutorAcademicInfo
                        data={formData}
                        onChange={handleUpdate}
                      />
                    )}

                    {currentStep === 4 && (
                      <Step4TutorPositions
                        data={formData}
                        onChange={handleUpdate}
                      />
                    )}

                    {currentStep === 5 && (
                      <Step5TutorExperience
                        data={formData}
                        onChange={handleUpdate}
                      />
                    )}

                    {currentStep === 6 && (
                      <Step6TutorMotivation
                        data={formData}
                        onChange={handleUpdate}
                      />
                    )}

                    {currentStep === 7 && (
                      <Step7TutorEmergencyContact
                        data={formData}
                        onChange={handleUpdate}
                      />
                    )}

                    {currentStep === 8 && (
                      <Step8TutorDeclaration
                        data={formData}
                        onChange={handleUpdate}
                      />
                    )}

                    {currentStep === 9 && (
                      <Step9TutorConfirmation
                        application={formData}
                        onNavigateHome={onNavigateHome || (() => {})}
                        onTrackApplication={() => setCurrentStep(9)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Bottom Stepper Action Bar */}
            {currentStep > 1 && currentStep < 9 && (
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
                  Section {currentStep} of 9
                </div>

                {currentStep < 8 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
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
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <span>Submit Faculty Application</span>
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
