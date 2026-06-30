import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { SignaturePad } from './SignaturePad';
import { JobApplication, PersonalInformation, GuarantorInformation, EducationalBackground, RelevantExperience, PositionAndSkills, SpecializationInterest, PreferredWorkMode } from '../types';
import { TRANSLATIONS } from '../lib/translations';
import { CAREER_ROLES, CATEGORIES } from '../lib/roles';
import {
  User, ShieldCheck, GraduationCap, Briefcase, Award, Palette,
  Cpu, Languages, MessageSquare, AlertCircle, Sparkles, Navigation, ArrowRight, ArrowLeft, Camera, Send,
  Building2, MapPin, Mail, Phone, FileText, Printer, CheckCircle2, UserCheck, Check, Search
} from 'lucide-react';

interface CareersFormProps {
  onSubmit: (data: Omit<JobApplication, 'id' | 'createdAt'>) => void;
  isSubmitting?: boolean;
  onLoadDemo?: () => void;
  onCancel?: () => void;
  initialRole?: string;
  language?: string;
}

export const CareersForm: React.FC<CareersFormProps> = ({ 
  onSubmit, 
  isSubmitting = false,
  onLoadDemo,
  onCancel,
  initialRole = '',
  language = 'en',
}) => {
  const t = TRANSLATIONS[language as any] || TRANSLATIONS.en;
  // Current active step index
  const [activeTab, setActiveTab] = useState<number>(1);
  const [formViewMode, setFormViewMode] = useState<'edit' | 'preview'>('edit');
  const [agreeDeclaration, setAgreeDeclaration] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');

  // Instant snap scroll to top when activeTab changes (improving wizard navigation UX)
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const element = document.getElementById('careers-portal-root');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // Form States matching the 12 points
  const [personalInfo, setPersonalInfo] = useState<PersonalInformation>({
    fullName: '',
    maritalStatus: '',
    gender: '',
    dateOfBirth: '',
    nationality: 'Nigerian',
    stateOfOrigin: '',
    lgaTownOfOrigin: '',
    stateOfResidence: '',
    residentialAddress: '',
    emailAddress: '',
    phoneNumbers: '',
    passportPhoto: '',
  });

  const [guarantorInfo, setGuarantorInfo] = useState<GuarantorInformation>({
    fullName: '',
    hometown: '',
    currentAddress: '',
    phoneNumber: '',
    relationship: '',
  });

  const [educationalBg, setEducationalBg] = useState<EducationalBackground>({
    highestQualification: '',
    schoolInstitution: '',
    fieldOfStudy: '',
    isStudentOrGraduate: '',
  });

  const [experiences, setExperiences] = useState<RelevantExperience>({
    exp1: '',
    exp2: '',
    exp3: '',
  });

  const [positionSkills, setPositionSkills] = useState<PositionAndSkills>({
    majorRole: initialRole || '',
    skillRole1: '',
    skillRole2: '',
    skillRole3: '',
  });

  useEffect(() => {
    if (initialRole) {
      setPositionSkills(prev => ({
        ...prev,
        majorRole: initialRole
      }));
    }
  }, [initialRole]);

  const [formRoleSearch, setFormRoleSearch] = useState<string>('');
  const [formRoleCategory, setFormRoleCategory] = useState<string>('all');

  const [specialization, setSpecialization] = useState<SpecializationInterest>({
    interests: [],
    otherDetails: '',
  });

  const [workMode, setWorkMode] = useState<PreferredWorkMode>({
    monthlySalaryJob: '',
    contractFreelanceJob: '',
    availableForAnyOpportunity: true,
  });

  const [languageProficiency, setLanguageProficiency] = useState<string>('');
  const [personalStatement, setPersonalStatement] = useState<string>('');
  const [declarationDate, setDeclarationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Specialization categories options from the form
  const specializationOptions = [
    'Website Design',
    'App Development',
    'Services',
    'Content Creation',
    'Content Presentation',
  ];

  // Forms tabs progress definition
  const steps = [
    { id: 1, name: 'Personal Details', icon: User },
    { id: 2, name: 'Guarantor Info', icon: ShieldCheck },
    { id: 3, name: 'Education Background', icon: GraduationCap },
    { id: 4, name: 'Experiences', icon: Briefcase },
    { id: 5, name: 'Position & Skills', icon: Award },
    { id: 6, name: 'Specialisms', icon: Palette },
    { id: 7, name: 'Preferred Work Mode', icon: Cpu },
    { id: 8, name: 'Languages', icon: Languages },
    { id: 9, name: 'Statement', icon: MessageSquare },
    { id: 10, name: 'ID Photograph', icon: Camera },
    { id: 11, name: 'Electronic Signing', icon: Sparkles },
  ];

  // Step indicators colors & states
  const totalSteps = steps.length;

  const handleNext = () => {
    if (activeTab < totalSteps) {
      setActiveTab(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeTab > 1) {
      setActiveTab(prev => prev - 1);
    }
  };

  const handlePassportPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo(prev => ({
          ...prev,
          passportPhoto: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSpecialization = (option: string) => {
    setSpecialization(prev => {
      const alreadySelected = prev.interests.includes(option);
      return {
        ...prev,
        interests: alreadySelected
          ? prev.interests.filter(item => item !== option)
          : [...prev.interests, option],
      };
    });
  };

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeDeclaration) {
      alert('⚠️ DECLARATION CHECKBOX REQUIRED:\n\nPlease check the "11. DECLARATION & CONFIRMATION" checkbox at the bottom of the page to confirm that all of your submitted details are accurate and true.');
      return;
    }

    if (!signatureData || signatureData.trim() === '') {
      alert('⚠️ DIGITAL SIGNATURE REQUIRED:\n\nPlease draw, type, or upload your digital signature in Section 11 first. Once your signature is recorded, you will be able to submit your job application successfully.');
      return;
    }

    // Prepare complete data payload
    const submissionData: Omit<JobApplication, 'id' | 'createdAt'> = {
      personalInfo,
      guarantorInfo,
      educationalBg,
      experiences,
      positionSkills,
      specialization,
      workMode,
      languageProficiency,
      personalStatement,
      applicantSignature: signatureData,
      applicantSignatureType: signatureType,
      declarationDate,
    };

    onSubmit(submissionData);
  };

  return (
    <div id="careers-portal-root" className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Sleek, Modern, Minimal Top Progress Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-6 md:mb-10">
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-[#000E32] h-1.5 w-full animate-gradient" />
        
        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all mr-1 flex items-center justify-center border border-slate-200 dark:border-slate-800"
                title="Back to Corporate Hub"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <Logo size="sm" variant="dark" />
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] font-black tracking-widest text-orange-600 uppercase">Careers Application</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Accreditation Profile Wizard</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Progress</span>
              <span className="text-xs font-extrabold text-[#000E32] dark:text-slate-200 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg mt-0.5 shadow-sm border border-slate-200/40 dark:border-slate-850">
                {Math.round((activeTab / totalSteps) * 100)}% Completed
              </span>
            </div>

            {onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:text-orange-800 rounded-xl text-xs font-bold transition-all duration-300 border border-orange-100 dark:border-orange-900/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0"
              >
                <Sparkles size={13} className="animate-pulse" />
                <span>Quick Autofill</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Progress Scrollbar (Sleek UI/UX improvement) */}
        <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-150/40 lg:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {steps.map(step => {
              const StepIcon = step.icon;
              const isActive = activeTab === step.id;
              const isCompleted = activeTab > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveTab(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#000E32] text-white shadow-sm scale-105'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-900'
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

      {/* Main Core Form Block: Responsive Left-Progress, Right-Input split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Trackbar progress rail */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hidden lg:block sticky top-8">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-6">
            Recruitment Process Modules
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
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 text-left ${
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
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
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
        </div>

        {/* Right Side Form Content Window */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <form onSubmit={handleFormSubmission} className="flex flex-col">
            <div className="p-6 md:p-8 min-h-[420px]">
              
              {/* Interactive Segmented Switch */}
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 max-w-md border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setFormViewMode('edit')}
                  className={`flex-1 py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    formViewMode === 'edit'
                      ? 'bg-[#000E32] text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User size={13} className={formViewMode === 'edit' ? 'text-orange-400' : 'text-slate-400'} />
                  Fill Form Fields
                </button>
                <button
                  type="button"
                  onClick={() => setFormViewMode('preview')}
                  className={`flex-1 py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    formViewMode === 'preview'
                      ? 'bg-[#000E32] text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText size={13} className={formViewMode === 'preview' ? 'text-orange-400' : 'text-slate-400'} />
                  Live Offer Letter Draft
                  <span className="bg-orange-500/10 text-orange-600 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide">Live Draft</span>
                </button>
              </div>

              {formViewMode === 'preview' ? (
                <div className="space-y-6">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3 text-left">
                    <Sparkles className="text-orange-600 shrink-0 mt-0.5 animate-spin-slow" size={18} />
                    <div>
                      <h4 className="text-xs font-extrabold text-orange-800 uppercase tracking-wide">Real-time Offer Letter Draft</h4>
                      <p className="text-[11px] text-orange-700 leading-relaxed font-medium mt-1">
                        Your official employment offer and accreditation contract is generated below. Complete the fields on the left (or click 'Quick Autofill' at the top) to see your personal details, role, and salary information updated instantly!
                      </p>
                    </div>
                  </div>

                  {/* Official Paper Document */}
                  <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl overflow-hidden shadow-md relative text-left">
                    {/* Dynamic Draft Watermark Accent */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <span className="text-slate-800 text-6xl md:text-8xl font-black uppercase tracking-[0.2em] transform -rotate-45">
                        Draft Preview
                      </span>
                    </div>

                    {/* Banner accent border */}
                    <div className="h-3 bg-gradient-to-r from-orange-500 to-[#000E32] w-full" />

                    <div className="p-4 xs:p-6 md:p-8 space-y-6">
                      {/* Letter Head Logo and Contact */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-4 w-full">
                        <Logo size="sm" />
                        <div className="text-left sm:text-right text-[9px] text-slate-500 space-y-0.5 sm:self-end w-full sm:w-auto">
                          <h3 className="font-extrabold text-[#000E32] text-[10px] uppercase">DS TECH AND DIGITAL MARKETING AGENCY</h3>
                          <p className="italic text-orange-600 font-semibold">Empowering Brands with Tech & Digital Excellence</p>
                          <p>Email: dstechanddigitalmarketingltd@gmail.com</p>
                          <p>Location: Garki Area 11, Abuja, Nigeria</p>
                        </div>
                      </div>

                      {/* Ref Date */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150/50 text-[10px] gap-2 w-full">
                        <span className="font-extrabold text-[#000E32] uppercase font-mono break-all">Ref: DST-DRAFT-{(personalInfo.fullName || 'CANDIDATE').substring(0, 3).toUpperCase()}</span>
                        <span className="font-semibold text-slate-600 shrink-0">Date: <span className="font-bold text-[#000E32]">{new Date().toLocaleDateString()}</span></span>
                      </div>

                      {/* Title */}
                      <div className="text-center">
                        <h2 className="text-sm min-[375px]:text-base sm:text-lg md:text-xl font-black uppercase text-[#000E32] tracking-wider min-[375px]:tracking-widest inline-block border-b-2 border-orange-500 pb-1 max-w-full break-words">
                          Appointment Offer Draft
                        </h2>
                      </div>

                      {/* Dear [Name] */}
                      <div className="text-xs">
                        Dear <span className="font-bold text-orange-600 underline font-serif text-sm">
                          {personalInfo.fullName || '[ Enter Your Full Name in Section 1 ]'}
                        </span>,
                      </div>

                      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                        {/* Blue Info Header box */}
                        <div className="bg-[#000E32] text-white p-3.5 rounded-xl flex flex-col xs:flex-row items-center xs:items-start text-center xs:text-left gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500 text-white shrink-0 flex items-center justify-center font-bold text-xs">
                            <UserCheck size={16} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-orange-400">Accreditation Notice</h4>
                            <p className="text-[10px] font-bold leading-tight break-words">
                              PROPOSED ENGAGEMENT AS PROFESSIONAL STAFF MEMBER
                            </p>
                          </div>
                        </div>

                        <p className="font-medium">
                          We are pleased to draft your proposed appointment as a <strong className="text-[#000E32]">{positionSkills.majorRole || '[ Select Your Applied Role in Section 5 ]'}</strong> at <strong className="text-[#000E32]">DS Tech and Digital Marketing Agency Limited</strong>, Abuja.
                        </p>

                        <p className="font-semibold">
                          Proposed Commencement Date: <span className="border-b border-dashed border-orange-500 px-2 py-0.5 text-orange-600 font-extrabold italic bg-orange-50/40 rounded">{declarationDate || 'Upon Submission'}</span>
                        </p>

                        {/* Eligibility List */}
                        <div className="space-y-2 pt-2">
                          <h5 className="text-[9px] font-extrabold uppercase text-[#000E32] tracking-wider">
                            Upon accreditation, you shall participate in and be considered for:
                          </h5>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                            {[
                              'Salary-based job placements',
                              'Freelance campaign roles',
                              'Contract jobs and projects',
                              'Brand Ambassador openings',
                              'Digital marketing projects',
                              'Remote, On-site & Hybrid positions'
                            ].map((item, idx) => (
                              <li key={idx} className="flex items-center gap-1.5 text-[10px] font-medium">
                                <CheckCircle2 className="text-orange-500 shrink-0" size={11} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Terms outline */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-[10px] space-y-1">
                          <span className="font-extrabold text-[#000E32] uppercase tracking-wider block mb-1">Proposed Terms Summary</span>
                          <p className="text-slate-600 font-medium">1. This appointment authorizes you to participate in active agency campaigns.</p>
                          <p className="text-slate-600 font-medium">2. Service structures and payout guidelines shall follow campaign terms.</p>
                        </div>

                        {/* Two Column details overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="border border-slate-150 bg-slate-50 p-3 rounded-xl space-y-2">
                            <span className="text-[9px] font-extrabold text-[#000E32] uppercase block pb-1 border-b">Candidate Details</span>
                            <div className="space-y-1 text-[10px] font-medium">
                              <div className="flex justify-between"><span className="text-slate-400">State:</span> <span className="font-bold text-slate-800">{personalInfo.stateOfOrigin || 'Pending'}</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Mobile:</span> <span className="font-mono text-slate-800">{personalInfo.phoneNumbers || 'Pending'}</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Degree:</span> <span className="font-bold text-slate-800">{educationalBg.highestQualification || 'Pending'}</span></div>
                            </div>
                          </div>

                          <div className="border border-slate-150 bg-slate-50 p-3 rounded-xl space-y-2">
                            <span className="text-[9px] font-extrabold text-[#000E32] uppercase block pb-1 border-b">E-Signing Seal</span>
                            <div className="flex flex-col items-center justify-center h-12">
                              {signatureData ? (
                                <div className="flex flex-col items-center">
                                  <img src={signatureData} className="max-h-[30px] object-contain" alt="Draft signature" />
                                  <span className="text-[8px] font-black text-emerald-600 uppercase mt-1">Verified Signature</span>
                                </div>
                              ) : (
                                <span className="text-[9px] text-slate-400 font-semibold italic">Pending Signature (Section 11)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
                    transition={{ duration: 0.28 }}
                    className="space-y-6"
                  >
                    {/* Step Title Ribbon */}
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block">
                        Form Block {activeTab} of {totalSteps}
                      </span>
                      <h2 className="text-xl md:text-2xl font-extrabold text-[#000E32] tracking-tight mt-1">
                        {steps[activeTab - 1].name}
                      </h2>
                    </div>

                  {/* SECTION 1: Personal Details */}
                  {activeTab === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5 matches-required">
                          Full Name (as in credentials) *
                        </label>
                        <input
                          type="text"
                          required
                          value={personalInfo.fullName}
                          onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          placeholder="Surname Firstname Middlename"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Gender
                        </label>
                        <select
                          value={personalInfo.gender}
                          onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-700 bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Marital Status
                        </label>
                        <select
                          value={personalInfo.maritalStatus}
                          onChange={e => setPersonalInfo({ ...personalInfo, maritalStatus: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-700 bg-white"
                        >
                          <option value="">Select Marital Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={personalInfo.dateOfBirth}
                          onChange={e => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Nationality
                        </label>
                        <input
                          type="text"
                          value={personalInfo.nationality}
                          onChange={e => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                          placeholder="e.g. Nigerian"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          State of Origin
                        </label>
                        <input
                          type="text"
                          value={personalInfo.stateOfOrigin}
                          onChange={e => setPersonalInfo({ ...personalInfo, stateOfOrigin: e.target.value })}
                          placeholder="State of Origin"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          LGA / Town of Origin
                        </label>
                        <input
                          type="text"
                          value={personalInfo.lgaTownOfOrigin}
                          onChange={e => setPersonalInfo({ ...personalInfo, lgaTownOfOrigin: e.target.value })}
                          placeholder="LGA/Town"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          State of Residence
                        </label>
                        <input
                          type="text"
                          value={personalInfo.stateOfResidence}
                          onChange={e => setPersonalInfo({ ...personalInfo, stateOfResidence: e.target.value })}
                          placeholder="e.g. FCT Abuja"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={personalInfo.emailAddress}
                          onChange={e => setPersonalInfo({ ...personalInfo, emailAddress: e.target.value })}
                          placeholder="candidate@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Phone Number(s) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={personalInfo.phoneNumbers}
                          onChange={e => setPersonalInfo({ ...personalInfo, phoneNumbers: e.target.value })}
                          placeholder="e.g. +234..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Residential Address
                        </label>
                        <textarea
                          rows={2}
                          value={personalInfo.residentialAddress}
                          onChange={e => setPersonalInfo({ ...personalInfo, residentialAddress: e.target.value })}
                          placeholder="Residential Address details"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: Guarantor Information */}
                  {activeTab === 2 && (
                    <div className="space-y-4">
                      <div className="bg-[#FAF7F2] border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
                        <ShieldCheck className="text-orange-600 shrink-0 mt-0.5" size={18} />
                        <span className="text-xs text-orange-850 leading-relaxed">
                          Note: Your designated guarantor must be fully aware of this application for validation and safety emergency protocols.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            Guarantor's Full Name *
                          </label>
                          <input
                            type="text"
                            required={activeTab === 2}
                            value={guarantorInfo.fullName}
                            onChange={e => setGuarantorInfo({ ...guarantorInfo, fullName: e.target.value })}
                            placeholder="Full name of emergency/work guarantor"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            Hometown
                          </label>
                          <input
                            type="text"
                            value={guarantorInfo.hometown}
                            onChange={e => setGuarantorInfo({ ...guarantorInfo, hometown: e.target.value })}
                            placeholder="Hometown"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required={activeTab === 2}
                            value={guarantorInfo.phoneNumber}
                            onChange={e => setGuarantorInfo({ ...guarantorInfo, phoneNumber: e.target.value })}
                            placeholder="Guarantor cellular line"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            Relationship to Applicant
                          </label>
                          <input
                            type="text"
                            value={guarantorInfo.relationship}
                            onChange={e => setGuarantorInfo({ ...guarantorInfo, relationship: e.target.value })}
                            placeholder="e.g. Uncle, Professional Mentor, Guardian"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            Guarantor's Permanent Address
                          </label>
                          <textarea
                            rows={2}
                            value={guarantorInfo.currentAddress}
                            onChange={e => setGuarantorInfo({ ...guarantorInfo, currentAddress: e.target.value })}
                            placeholder="Complete residential/office work street address of guarantor"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: Educational Background */}
                  {activeTab === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            Highest Educational Qualification
                          </label>
                          <input
                            type="text"
                            value={educationalBg.highestQualification}
                            onChange={e => setEducationalBg({ ...educationalBg, highestQualification: e.target.value })}
                            placeholder="e.g. Bachelor of Science, Master's Degree, OND, HND"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            School / Institution of Learning
                          </label>
                          <input
                            type="text"
                            value={educationalBg.schoolInstitution}
                            onChange={e => setEducationalBg({ ...educationalBg, schoolInstitution: e.target.value })}
                            placeholder="University, Polytechnic or College"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                            Field of Study / Course
                          </label>
                          <input
                            type="text"
                            value={educationalBg.fieldOfStudy}
                            onChange={e => setEducationalBg({ ...educationalBg, fieldOfStudy: e.target.value })}
                            placeholder="e.g. Computer Science, Mass Communication, Digital Arts"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">
                            Current Academic Status
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                              <input
                                type="radio"
                                name="isStudentOrGraduate"
                                value="student"
                                checked={educationalBg.isStudentOrGraduate === 'student'}
                                onChange={() => setEducationalBg({ ...educationalBg, isStudentOrGraduate: 'student' })}
                                className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500 focus:ring-2"
                              />
                              Active Student
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                              <input
                                type="radio"
                                name="isStudentOrGraduate"
                                value="graduate"
                                checked={educationalBg.isStudentOrGraduate === 'graduate'}
                                onChange={() => setEducationalBg({ ...educationalBg, isStudentOrGraduate: 'graduate' })}
                                className="w-4 h-4 text-[#000E32] border-slate-300 focus:ring-orange-500 focus:ring-2"
                              />
                              Graduate
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: Relevant Experience(s) */}
                  {activeTab === 4 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                        List three of your major relevant work roles, internships, or professional freelance services you have executed in the past.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Relevant Experience 1
                          </label>
                          <input
                            type="text"
                            value={experiences.exp1}
                            onChange={e => setExperiences({ ...experiences, exp1: e.target.value })}
                            placeholder="1st core past position with dates, and brief accomplishments"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Relevant Experience 2
                          </label>
                          <input
                            type="text"
                            value={experiences.exp2}
                            onChange={e => setExperiences({ ...experiences, exp2: e.target.value })}
                            placeholder="2nd core position, tasks handled details"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Relevant Experience 3
                          </label>
                          <input
                            type="text"
                            value={experiences.exp3}
                            onChange={e => setExperiences({ ...experiences, exp3: e.target.value })}
                            placeholder="3rd experience details, freelance gig or student project"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: Position & Skills */}
                  {activeTab === 5 && (() => {
                    const filteredFormRoles = CAREER_ROLES.filter(role => {
                      const matchesCategory = formRoleCategory === 'all' || role.category === formRoleCategory;
                      const matchesSearch = role.title.toLowerCase().includes(formRoleSearch.toLowerCase()) ||
                                            role.description.toLowerCase().includes(formRoleSearch.toLowerCase()) ||
                                            role.skills.some(s => s.toLowerCase().includes(formRoleSearch.toLowerCase())) ||
                                            role.tools.some(t => t.toLowerCase().includes(formRoleSearch.toLowerCase()));
                      return matchesCategory && matchesSearch;
                    });

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1.5 matches-required">
                              Major Role Applying For *
                            </label>
                            <input
                              type="text"
                              required={activeTab === 5}
                              value={positionSkills.majorRole}
                              onChange={e => setPositionSkills({ ...positionSkills, majorRole: e.target.value })}
                              placeholder="e.g. Lead Website Designer, Social Media Manager, Mobile App Engineer"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold"
                            />
                            
                            {/* Interactive Quick Selection Block */}
                            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                  <Sparkles size={11} className="text-orange-500 animate-pulse" />
                                  💡 Fast-Select from 32+ Accredited Positions
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                  Clicking autofills skills and tools!
                                </span>
                              </div>

                              {/* Search and category filter tabs inside form */}
                              <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-grow">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                  <input
                                    type="text"
                                    value={formRoleSearch}
                                    onChange={(e) => setFormRoleSearch(e.target.value)}
                                    placeholder="Type to filter roles catalog..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100"
                                  />
                                </div>
                                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                                  {['all', 'tech', 'marketing', 'creative', 'operations'].map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => setFormRoleCategory(cat)}
                                      className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                                        formRoleCategory === cat
                                          ? 'bg-[#000E32] text-white dark:bg-orange-600'
                                          : 'bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Roles Scroll Window */}
                              <div className="max-h-48 overflow-y-auto border border-slate-150 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 p-2 space-y-1.5 custom-scrollbar">
                                {filteredFormRoles.map(role => {
                                  const isSelected = positionSkills.majorRole === role.title;
                                  return (
                                    <button
                                      key={role.id}
                                      type="button"
                                      onClick={() => {
                                        setPositionSkills(prev => ({
                                          ...prev,
                                          majorRole: role.title,
                                          skillRole1: role.tools.slice(0, 2).join(', '),
                                          skillRole2: role.skills.slice(0, 2).join(', '),
                                          skillRole3: `${role.tools[2] || ''}${role.tools[2] && role.skills[2] ? ', ' : ''}${role.skills[2] || ''}`.trim()
                                        }));
                                      }}
                                      className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer border ${
                                        isSelected
                                          ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-900 text-orange-700 dark:text-orange-400'
                                          : 'hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      <div>
                                        <div className="font-extrabold flex items-center gap-1.5">
                                          {isSelected && <Check size={11} className="text-orange-600" />}
                                          <span>{role.title}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-light">
                                          Suggested stack: {role.tools.join(' • ')}
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 shrink-0">
                                        {role.estimatedSalary}
                                      </span>
                                    </button>
                                  );
                                })}
                                {filteredFormRoles.length === 0 && (
                                  <div className="p-4 text-center text-slate-400 text-[11px]">
                                    No vacancies matching your search keywords
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                        <div className="md:col-span-2 mt-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Relevant Skill-Based Roles / Tools you Master (1)
                          </label>
                          <input
                            type="text"
                            value={positionSkills.skillRole1}
                            onChange={e => setPositionSkills({ ...positionSkills, skillRole1: e.target.value })}
                            placeholder="e.g. React.js, Tailwind, WebFlow, Figma Mastery"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Relevant Skill-Based Roles / Tools you Master (2)
                          </label>
                          <input
                            type="text"
                            value={positionSkills.skillRole2}
                            onChange={e => setPositionSkills({ ...positionSkills, skillRole2: e.target.value })}
                            placeholder="e.g. Graphics Design, Video Editing, After Effects, Copywriting"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Relevant Skill-Based Roles / Tools you Master (3)
                          </label>
                          <input
                            type="text"
                            value={positionSkills.skillRole3}
                            onChange={e => setPositionSkills({ ...positionSkills, skillRole3: e.target.value })}
                            placeholder="e.g. Python backend, Firebase cloud databases, SEO ranking"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )})}

                  {/* SECTION 6: Specialization / Area of Interest */}
                  {activeTab === 6 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">
                        State the categories of Website Design, App Development, Services, Content Creation, or Content Presentation you specialize in or are most interested in pursuing with us:
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {specializationOptions.map(option => {
                          const isSelected = specialization.interests.includes(option);

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleSpecialization(option)}
                              className={`px-4 py-2.5 rounded-xl font-semibold text-xs border transition-all duration-300 flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#000E32] text-white border-[#000E32] shadow'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isSelected ? 'bg-orange-500' : 'bg-slate-350'
                                }`}
                              />
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                          Additional details on your interest/specialty
                        </label>
                        <textarea
                          rows={3}
                          value={specialization.otherDetails}
                          onChange={e => setSpecialization({ ...specialization, otherDetails: e.target.value })}
                          placeholder="Highlight any special achievements in these domains..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 7: Preferred Work Mode */}
                  {activeTab === 7 && (
                    <div className="space-y-6">
                      <div className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50">
                        <h4 className="text-xs font-extrabold text-[#000E32] uppercase tracking-wide mb-3">
                          1. Monthly Salary-Based Job preference:
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {['on-site', 'remote', 'hybrid'].map(mode => (
                            <button
                              key={`salary-${mode}`}
                              type="button"
                              onClick={() => setWorkMode({ ...workMode, monthlySalaryJob: mode as any })}
                              className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all duration-300 text-center uppercase tracking-wider ${
                                workMode.monthlySalaryJob === mode
                                  ? 'bg-orange-600 text-white border-orange-600 shadow'
                                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50">
                        <h4 className="text-xs font-extrabold text-[#000E32] uppercase tracking-wide mb-3">
                          2. Contract / Freelacing Jobs preference:
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {['on-site', 'remote', 'hybrid'].map(mode => (
                            <button
                              key={`contract-${mode}`}
                              type="button"
                              onClick={() => setWorkMode({ ...workMode, contractFreelanceJob: mode as any })}
                              className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all duration-300 text-center uppercase tracking-wider ${
                                workMode.contractFreelanceJob === mode
                                  ? 'bg-[#000E32] text-white border-[#000E32] shadow'
                                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-[#FAF7F2] bg-[#FAF7F2]/60 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800 leading-none">
                            3. Available for Any Suitable Alternative Opportunity
                          </h4>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            If your main role is filled, is our team permitted to propose related vacancies?
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={workMode.availableForAnyOpportunity}
                            onChange={e => setWorkMode({ ...workMode, availableForAnyOpportunity: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* SECTION 8: Language Proficiency */}
                  {activeTab === 8 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Apart from English, which other language(s) can you effectively use for communication, service delivery, content creation, or presentation?
                      </p>

                      <textarea
                        rows={4}
                        value={languageProficiency}
                        onChange={e => setLanguageProficiency(e.target.value)}
                        placeholder="e.g. French, Yoruba, Hausa, Igbo, Spanish - with proficiency details (Fluent, Conversational, Intermediate, etc.)"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      />
                    </div>
                  )}

                  {/* SECTION 9: Personal Statement */}
                  {activeTab === 9 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Why would you like to join DS Tech and Digital Marketing Agency Limited? Introduce your motivation, core passion, and what makes your expertise unique for the team.
                      </p>

                      <textarea
                        rows={6}
                        value={personalStatement}
                        onChange={e => setPersonalStatement(e.target.value)}
                        placeholder="Write dynamic personal statement..."
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      />
                    </div>
                  )}

                  {/* SECTION 10: Passport Photograph Uploader */}
                  {activeTab === 10 && (
                    <div className="space-y-4">
                      <div className="bg-[#FAF7F2] border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                        <span className="text-xs text-orange-850 leading-relaxed">
                          Important Note: A digital passport photograph is required to prepare official branding portals, candidate identity assessments, and eventual official staff ID cards.
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center py-6">
                        {personalInfo.passportPhoto && personalInfo.passportPhoto.trim() !== '' ? (
                          <div className="relative group max-w-[180px] w-full aspect-square bg-slate-100 border rounded-2xl overflow-hidden p-1.5 shadow">
                            <img
                              src={personalInfo.passportPhoto}
                              alt="Passport Preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => setPersonalInfo({ ...personalInfo, passportPhoto: '' })}
                              className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-700 hover:scale-105 text-white rounded-lg text-xs transition-all duration-200 shadow"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <label className="w-full max-w-sm border-2 border-dashed border-slate-300 hover:border-slate-400 cursor-pointer p-8 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-50/50 transition-all duration-300 hover:bg-slate-50 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePassportPhotoUpload}
                              className="hidden"
                            />
                            <div className="p-4 bg-slate-100 rounded-full text-slate-500">
                              <Camera size={26} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-700 block">
                                Choose Photo File
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                JPG, JPEG or PNG formats
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SECTION 11: Electronic Signing */}
                  {activeTab === 11 && (
                    <div className="space-y-6">
                      {/* Interactive Sign pad */}
                      <div className="space-y-4">
                        <label className="text-xs font-extrabold text-[#000E32] uppercase tracking-wide block">
                          Provide Electronic applicant Signature
                        </label>
                        <SignaturePad
                          initialValue={signatureData}
                          initialType={signatureType}
                          onSave={(data, type) => {
                            setSignatureData(data);
                            setSignatureType(type);
                          }}
                        />
                      </div>

                      {/* Declaration Check & Date */}
                      <div className="border border-slate-150 p-4 rounded-2xl bg-slate-50/40 space-y-4">
                        <div className="flex gap-3">
                          <input
                            type="checkbox"
                            id="agreeDeclaration"
                            checked={agreeDeclaration}
                            onChange={e => setAgreeDeclaration(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 mt-0.5"
                          />
                          <label htmlFor="agreeDeclaration" className="text-xs text-slate-650 leading-relaxed font-medium select-none cursor-pointer">
                            <span className="font-extrabold text-[#000E32] uppercase text-[10px] block mb-1">
                              11. DECLARATION & CONFIRMATION
                            </span>
                            I hereby confirm that the information provided above is accurate and true to the best of my knowledge. Any misinformation may result in prompt disqualification.
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                              Signing Date
                            </span>
                            <input
                              type="date"
                              required={activeTab === 11}
                              value={declarationDate}
                              onChange={e => setDeclarationDate(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold text-slate-700 bg-white"
                            />
                          </div>
                          <div className="flex items-end justify-end">
                            {signatureData && signatureData.trim() !== '' ? (
                              <div className="flex flex-col items-center max-h-[70px] bg-white border rounded-xl px-4 py-2">
                                <span className="text-[8px] text-slate-400 font-bold uppercase mb-1 leading-none">Registered Seal Signature</span>
                                <img src={signatureData} className="max-h-[38px] object-contain border border-slate-100" alt="signature" />
                              </div>
                            ) : (
                              <span className="text-[10px] italic text-red-500 font-semibold">Signature Required below</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
            </div>

            {/* Bottom Form Actions Control Bar */}
            {formViewMode === 'preview' ? (
              <div className="bg-[#FAF7F2] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block">Interactive Draft Active</span>
                  <p className="text-xs text-slate-500 font-medium">
                    This official Appointment Letter updates in real-time. Resume editing to complete your submission!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormViewMode('edit')}
                  className="px-5 py-2.5 bg-[#000E32] hover:bg-blue-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 shadow-md shrink-0"
                >
                  <ArrowLeft size={14} className="text-orange-400" />
                  Resume Editing Form
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 p-6 flex items-center justify-between gap-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={activeTab === 1}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#000E32] font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 flex items-center gap-2 shadow-sm"
                >
                  <ArrowLeft size={14} />
                  Previous Set
                </button>

                {activeTab < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-[#000E32] hover:bg-blue-950 hover:translate-x-1 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 shadow-md shadow-blue-900/10"
                  >
                    Save & Next
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 shadow-lg shadow-orange-500/20 animate-bounce-slow"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Submit Signed Job Application
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
