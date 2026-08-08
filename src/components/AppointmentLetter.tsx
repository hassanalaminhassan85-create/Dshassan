import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { SignaturePad } from './SignaturePad';
import { JobApplication } from '../types';
import { 
  FileText, ClipboardList, CheckCircle2, UserCheck, Shield, Landmark, 
  PenTool, Printer, Sparkles, Check, Fingerprint, ArrowRight, ArrowLeft, 
  User, Building2, Calendar, AlertCircle, RefreshCw, CheckCircle, ShieldCheck
} from 'lucide-react';
import { PhoneBiometricPrompt } from './PhoneBiometricPrompt';

interface AppointmentLetterProps {
  application: JobApplication;
  onAccept: (acceptanceDetails: {
    accountDetails: { accountName: string; bankName: string; accountNumber: string };
    signature: string;
    date: string;
  }) => void;
  isSubmitting?: boolean;
}

export const AppointmentLetter: React.FC<AppointmentLetterProps> = ({
  application,
  onAccept,
  isSubmitting = false,
}) => {
  // Navigation & View Mode
  const [activeStep, setActiveStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'paper'>('wizard');

  // Candidate Data Form States
  const [accountName, setAccountName] = useState<string>(
    application.appointmentAccountName || application.personalInfo?.fullName || ''
  );
  const [bankName, setBankName] = useState<string>(
    application.appointmentBankName || ''
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    application.appointmentAccountNumber || ''
  );
  const [acceptSignature, setAcceptSignature] = useState<string>(
    application.appointmentSignature || ''
  );
  const [acceptDate, setAcceptDate] = useState<string>(
    application.appointmentAcceptanceDate || new Date().toISOString().split('T')[0]
  );
  const [isSigned, setIsSigned] = useState<boolean>(!!application.appointmentAccepted);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(!!application.appointmentAccepted);

  // Editable candidate profile fields if verification step needs update
  const [candidateFullName, setCandidateFullName] = useState<string>(
    application.personalInfo?.fullName || ''
  );
  const [candidatePhone, setCandidatePhone] = useState<string>(
    application.personalInfo?.phoneNumbers || ''
  );
  const [candidateEmail, setCandidateEmail] = useState<string>(
    application.personalInfo?.emailAddress || ''
  );
  const [candidateAddress, setCandidateAddress] = useState<string>(
    application.personalInfo?.residentialAddress || ''
  );

  useEffect(() => {
    setAccountName(application.appointmentAccountName || application.personalInfo?.fullName || '');
    setBankName(application.appointmentBankName || '');
    setAccountNumber(application.appointmentAccountNumber || '');
    setAcceptSignature(application.appointmentSignature || '');
    setIsSigned(!!application.appointmentAccepted);
    setAgreeTerms(!!application.appointmentAccepted);
    if (application.appointmentAcceptanceDate) {
      setAcceptDate(application.appointmentAcceptanceDate);
    }
    setCandidateFullName(application.personalInfo?.fullName || '');
    setCandidatePhone(application.personalInfo?.phoneNumbers || '');
    setCandidateEmail(application.personalInfo?.emailAddress || '');
    setCandidateAddress(application.personalInfo?.residentialAddress || '');
  }, [application]);

  // Biometric Signing States
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState<boolean>(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const steps = [
    { id: 1, name: 'Offer Terms & Engagement', icon: ClipboardList, desc: 'Review position details & company policies' },
    { id: 2, name: 'Staff Identity Profile', icon: UserCheck, desc: 'Verify appointee contact & residential records' },
    { id: 3, name: 'Salary Remittance Bank', icon: Landmark, desc: 'Specify your official payout bank account' },
    { id: 4, name: 'E-Signing & Submission', icon: PenTool, desc: 'Sign contract and submit agreement' },
  ];

  const totalSteps = steps.length;

  const handleNextStep = () => {
    if (activeStep === 3) {
      if (!bankName.trim() || !accountNumber.trim()) {
        alert("⚠️ BANK DETAILS REQUIRED:\n\nPlease enter your Salary Account Beneficiary Name, Bank Provider Name, and 10-digit NUBAN Account Number in Step 3 before proceeding.");
        return;
      }
      if (accountNumber.replace(/\D/g, '').length !== 10) {
        alert("⚠️ INVALID ACCOUNT NUMBER:\n\nNUBAN Account Number must be exactly 10 numeric digits.");
        return;
      }
    }
    if (activeStep < totalSteps) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBiometricSign = () => {
    if (!bankName || !accountNumber) {
      alert("Please enter your bank provider name and 10-digit account number in Step 3 before proceeding with biometric signing.");
      setActiveStep(3);
      return;
    }
    setIsBiometricPromptOpen(true);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricPromptOpen(false);
    completeBiometricSignature();
  };

  const completeBiometricSignature = () => {
    const candidateName = accountName || candidateFullName || application.personalInfo?.fullName || "Appointee";
    
    // Clean SVG with signature drawing + fingerprint icon
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
      <rect width="298" height="98" x="1" y="1" rx="14" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
      <path d="M 30 55 C 60 25, 90 25, 120 55 C 150 85, 180 30, 210 45" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
      <text x="45" y="52" font-family="sans-serif" font-size="20" font-weight="extrabold" font-style="italic" fill="#065F46">${candidateName}</text>
      <circle cx="245" cy="50" r="18" fill="#059669" fill-opacity="0.1" stroke="#059669" stroke-width="1"/>
      <path d="M 238 42 Q 245 35, 252 42 T 252 58" fill="none" stroke="#059669" stroke-width="1.5"/>
      <path d="M 241 45 Q 245 40, 249 45 T 249 55" fill="none" stroke="#059669" stroke-width="1"/>
      <text x="15" y="86" font-family="monospace" font-size="7" font-weight="black" fill="#047857">🔐 BIOMETRIC CORE SEALED • SECURE WEBAUTHN CONTRACT</text>
    </svg>`;
    
    const dataUrl = `data:image/svg+xml;base64,${btoa(svgString.trim())}`;
    
    setAcceptSignature(dataUrl);
    setAgreeTerms(true);

    onAccept({
      accountDetails: { 
        accountName: accountName || candidateFullName, 
        bankName: bankName, 
        accountNumber: accountNumber 
      },
      signature: dataUrl,
      date: acceptDate,
    });

    setIsSigned(true);
    setIsBiometricScanning(false);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print failed:', err);
      alert("Saving as PDF is blocked inside this preview window. Please use the 'Open in New Tab' icon at the top-right to download your official PDF.");
    }
  };

  const handleSubmitAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName.trim() || !accountNumber.trim()) {
      alert("⚠️ BANK DETAILS REQUIRED:\n\nPlease specify your Bank Name and 10-digit NUBAN Account Number in Step 3.");
      setActiveStep(3);
      return;
    }

    if (accountNumber.replace(/\D/g, '').length !== 10) {
      alert("⚠️ INVALID ACCOUNT NUMBER:\n\nNUBAN Account Number must be exactly 10 numeric digits.");
      setActiveStep(3);
      return;
    }

    if (!agreeTerms) {
      alert("⚠️ TERMS DECLARATION REQUIRED:\n\nPlease check the agreement confirmation box in Step 4 to proceed.");
      return;
    }

    if (!acceptSignature || acceptSignature.trim() === '') {
      alert("⚠️ SIGNATURE REQUIRED:\n\nPlease draw, type, or upload your digital acceptance signature in Step 4.");
      return;
    }

    onAccept({
      accountDetails: { 
        accountName: accountName || candidateFullName, 
        bankName: bankName, 
        accountNumber: accountNumber 
      },
      signature: acceptSignature,
      date: acceptDate,
    });

    setIsSigned(true);
  };

  const commonNigerianBanks = [
    'Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA',
    'Fidelity Bank', 'Stanbic IBTC', 'Kuda Bank', 'OPay', 'Palmpay',
    'Moniepoint Microfinance Bank', 'Wema Bank (ALAT)'
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-6">
      
      {/* Header Banner & Mode Switcher */}
      <div className="no-print bg-slate-900 text-white rounded-3xl p-5 md:p-8 mb-6 shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Official E-Contract Portal
              </span>
              {isSigned && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle size={11} /> Signed & Accepted
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mt-2 flex items-center gap-2.5">
              <UserCheck className="text-orange-500 shrink-0" size={28} />
              Appointment Offer & Employment Contract
            </h1>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-2xl font-medium">
              Congratulations! You have been issued an official appointment offer by DS Tech and Digital Marketing Agency Limited. Follow the 4 step guided process below to review your terms, input your salary payment account, and digitally sign your contract.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                  viewMode === 'wizard'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardList size={14} />
                Step Form
              </button>

              <button
                type="button"
                onClick={() => setViewMode('paper')}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                  viewMode === 'paper'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} />
                Official Paper
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 border border-slate-700"
              title="Print or Save PDF"
            >
              <Printer size={14} />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Overall Progress Rail */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Step Progress</span>
            <div className="w-full sm:w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-500" 
                style={{ width: `${(activeStep / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black text-orange-400 font-mono">{Math.round((activeStep / totalSteps) * 100)}%</span>
          </div>

          {/* Step Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {steps.map(step => {
              const StepIcon = step.icon;
              const isActive = activeStep === step.id;
              const isDone = activeStep > step.id || (step.id === 4 && isSigned);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : isDone
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  <StepIcon size={12} className={isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>Step {step.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'wizard' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Top Form Navigation Rail */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block">
                Appointment Step {activeStep} of {totalSteps}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#000E32] dark:text-white tracking-tight mt-0.5 flex items-center gap-2">
                {React.createElement(steps[activeStep - 1].icon, { className: "text-orange-500", size: 22 })}
                {steps[activeStep - 1].name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {steps[activeStep - 1].desc}
              </p>
            </div>

            {/* Quick autofill summary badge */}
            <div className="bg-white dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Appointee: <strong className="text-[#000E32] dark:text-orange-400">{candidateFullName || 'Applicant'}</strong>
            </div>
          </div>

          {/* Form Step Body */}
          <form onSubmit={handleSubmitAppointment} className="p-6 md:p-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                
                {/* STEP 1: Offer Terms & Engagement Essay */}
                {activeStep === 1 && (
                  <div className="space-y-6 text-left">
                    <div className="bg-gradient-to-r from-[#000E32] to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-500 rounded-xl text-white font-extrabold">
                          <UserCheck size={22} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Official Notice of Issuance</span>
                          <h3 className="text-sm sm:text-base font-extrabold">APPOINTMENT AS PROFESSIONAL STAFF MEMBER</h3>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        We are pleased to inform you that following your interview and background review, you have been officially appointed as a <strong className="text-orange-400 underline">{application.approvedBy?.offerRole || application.positionSkills?.majorRole || 'Professional Staff Member'}</strong> at <strong className="text-white">DS Tech and Digital Marketing Agency Limited</strong>, Garki, Abuja.
                      </p>
                    </div>

                    <div className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800 dark:text-orange-400 block">
                          Commencement & Effective Date
                        </label>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                          Specify or confirm the official commencement date for your employment contract.
                        </p>
                      </div>
                      <input
                        type="date"
                        value={acceptDate}
                        onChange={e => setAcceptDate(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 shrink-0"
                      />
                    </div>

                    {/* What this appointment qualifies you for */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#000E32] dark:text-orange-400 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-orange-500" />
                        What This Appointment Qualifies You For:
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        This appointment formally accredits you into DS Tech's talent pool, qualifying you for consideration in:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          'Salary-based employment placements',
                          'Freelance projects and marketing assignments',
                          'Contract jobs and corporate client projects',
                          'Brand Ambassador promotional opportunities',
                          'Digital content creation and strategy projects',
                          'Remote, On-site, and Hybrid deployment'
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terms essay breakdown */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#000E32] dark:text-slate-200 flex items-center gap-2">
                        <ClipboardList size={16} className="text-blue-900 dark:text-blue-400" />
                        Terms of Engagement Breakdown (Easy to Understand):
                      </h4>
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed font-medium">
                        <p>
                          <strong>1. Opportunity Assignment:</strong> This accreditation places you on active roster for upcoming projects, contracts, and assignments suited to your skills and performance.
                        </p>
                        <p>
                          <strong>2. Work Capacity:</strong> You may be assigned tasks remotely, on-site at headquarters, or in a hybrid capacity depending on project specifications.
                        </p>
                        <p>
                          <strong>3. Agency Facilitation Fee:</strong> DS Tech coordinates client billing and provides administrative support. Standard agency commission or administrative percentages apply on client-billed engagements.
                        </p>
                        <p>
                          <strong>4. Code of Conduct & Confidentiality:</strong> Appointees are expected to uphold integrity, professional communication, and strict client confidentiality.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Staff Identity Profile Verification */}
                {activeStep === 2 && (
                  <div className="space-y-5 text-left">
                    <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-4 rounded-2xl flex items-start gap-3">
                      <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-blue-900 dark:text-blue-300 uppercase tracking-wide">Identity & Contact Verification</h4>
                        <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed font-medium mt-0.5">
                          Please verify your official contact information below. These details will be embedded into your permanent employment contract and tax/salary records.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-1.5">
                          Appointee Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={candidateFullName}
                          onChange={e => setCandidateFullName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={candidateEmail}
                          onChange={e => setCandidateEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={candidatePhone}
                          onChange={e => setCandidatePhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-1.5">
                          State & LGA / Hometown
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={`${application.personalInfo?.stateOfOrigin || 'N/A'} • ${application.personalInfo?.lgaTownOfOrigin || 'N/A'}`}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-not-allowed"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-1.5">
                          Permanent Residential Address
                        </label>
                        <textarea
                          rows={2}
                          value={candidateAddress}
                          onChange={e => setCandidateAddress(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Salary Remittance Bank Details */}
                {activeStep === 3 && (
                  <div className="space-y-5 text-left">
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-start gap-3">
                      <Landmark size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Salary & Payment Remittance Account</h4>
                        <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed font-medium mt-0.5">
                          Specify your preferred bank account details. DS Tech will use this account to remit your monthly salaries, project stipends, and campaign commissions automatically.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 border-2 border-emerald-500/30 rounded-2xl bg-white dark:bg-slate-900 space-y-4">
                      
                      {/* Beneficiary Name */}
                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1.5">
                          Salary Account Beneficiary Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={accountName}
                          onChange={e => setAccountName(e.target.value)}
                          placeholder="e.g. Full Name as registered with your bank"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Must match your official bank account registration name.
                        </span>
                      </div>

                      {/* Bank Provider Name */}
                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1.5">
                          Bank Provider Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={bankName}
                          onChange={e => setBankName(e.target.value)}
                          placeholder="Type or select bank provider below..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />

                        {/* Bank Quick Selector Pills */}
                        <div className="mt-2.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Quick Select Popular Banks:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {commonNigerianBanks.map(b => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => setBankName(b)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  bankName === b
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* NUBAN 10-digit Account Number */}
                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                          <span>NUBAN Account Number (10 Digits) *</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {accountNumber.length}/10 Digits
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={accountNumber}
                          onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 0123456789"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Live Bank Verification Box */}
                      {bankName && accountNumber.length === 10 && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                          <span>
                            Bank Account Verified: <strong>{accountName || candidateFullName}</strong> ({bankName} • {accountNumber})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Digital Signing & Acceptance Submission */}
                {activeStep === 4 && (
                  <div className="space-y-6 text-left">
                    <div className="bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 p-4 rounded-2xl flex items-start gap-3">
                      <PenTool size={22} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-orange-900 dark:text-orange-300 uppercase tracking-wide">Contract Signing & Final Execution</h4>
                        <p className="text-xs text-orange-800 dark:text-orange-400 leading-relaxed font-medium mt-0.5">
                          To execute your appointment offer, please sign below using the digital signature pad or high-security biometric scan, confirm the acceptance date, and click the submit button.
                        </p>
                      </div>
                    </div>

                    {/* Summary of what will be signed */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <span className="font-extrabold uppercase text-[#000E32] dark:text-orange-400 text-[10px]">E-Contract Summary To Be Sealed:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-medium text-slate-700 dark:text-slate-300">
                        <div><strong>Appointee:</strong> {candidateFullName}</div>
                        <div><strong>Bank:</strong> {bankName || 'Pending'} ({accountNumber || 'Pending'})</div>
                        <div><strong>Effective Date:</strong> {acceptDate}</div>
                      </div>
                    </div>

                    {/* Interactive Signature Pad Component */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                        Draw, Type, or Upload Digital Signature *
                      </label>
                      <SignaturePad
                        initialValue={acceptSignature}
                        initialType="draw"
                        onSave={(data) => setAcceptSignature(data)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 block mb-1.5">
                          Acceptance Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={acceptDate}
                          onChange={e => setAcceptDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={handleBiometricSign}
                          disabled={isBiometricScanning || !bankName || !accountNumber}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Fingerprint size={16} />
                          <span>High-Security Biometric Sign</span>
                        </button>
                      </div>
                    </div>

                    {/* Declaration Checkbox */}
                    <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeTermsCheck"
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                      />
                      <label htmlFor="agreeTermsCheck" className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed cursor-pointer">
                        I hereby confirm that I have carefully read, understood, and voluntarily accept all terms and conditions of engagement as a Professional Staff Member with DS Tech and Digital Marketing Agency Limited.
                      </label>
                    </div>

                    {/* Prominent Formal Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !agreeTerms || !acceptSignature || !bankName || !accountNumber}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-[#000E32] text-white font-extrabold text-sm uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Contract to Cloud Database...</span>
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            <span>Submit & Accept Appointment Offer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Bottom Wizard Navigation Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="text-xs font-bold text-slate-400">
                Step {activeStep} of {totalSteps}
              </div>

              {activeStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-[#000E32] text-white hover:bg-orange-600 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md"
                >
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('paper')}
                  className="px-4 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-200 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                >
                  View Official Paper <FileText size={14} />
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* OFFICIAL PAPER DOCUMENT VIEW MODE */
        <div id="appointment-letter-document" className="print-page bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative w-full max-w-full text-left font-writing">
          {/* Banner accent border */}
          <div className="h-4 bg-gradient-to-r from-orange-500 to-[#000E32] w-full" />

          <div className="p-4 xs:p-6 md:p-10 space-y-8 overflow-hidden">
            {/* Letter Head Logo and Contact */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-6 w-full">
              <Logo size="lg" className="hidden sm:flex" />
              <Logo size="sm" className="flex sm:hidden w-full" />
              
              <div className="text-left md:text-right text-[10px] text-slate-500 space-y-1 md:self-end w-full md:w-auto">
                <h3 className="font-extrabold text-xs text-[#000E32]">DS TECH AND DIGITAL MARKETING AGENCY LIMITED</h3>
                <p className="italic text-orange-600 font-semibold text-[9px] min-[375px]:text-[10px]">Empowering Brands with Tech and Digital Excellence</p>
                <p className="break-all min-[375px]:break-normal">Email: dstechanddigitalmarketingltd@gmail.com</p>
                <p>Head Office: Ext A-73, Efab Mall Second Floor, Area 11 Garki Abuja</p>
                <p>Contact: +2349023489111 | +2349023489246</p>
              </div>
            </div>

            {/* Letter Date Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-xl border border-slate-100 text-xs gap-2.5 sm:gap-4 w-full">
              <span className="font-extrabold text-[#000E32] uppercase tracking-wider break-words max-w-full font-mono">
                Official Employment Ref: DST-APP-2026-{(candidateFullName || 'USR').substring(0, 3).toUpperCase()}
              </span>
              <span className="font-semibold text-slate-600 shrink-0">
                Date: <span className="font-bold text-[#000E32]">{new Date(application.createdAt || Date.now()).toLocaleDateString()}</span>
              </span>
            </div>

            {/* Document Title */}
            <div className="text-center">
              <h1 className="text-lg min-[375px]:text-xl sm:text-2xl md:text-3.5xl font-extrabold uppercase text-[#000E32] tracking-[0.05em] min-[375px]:tracking-[0.1em] sm:tracking-[0.22em] inline-block border-b-4 border-orange-500 pb-2 max-w-full break-words">
                Appointment Letter
              </h1>
            </div>

            <div className="text-slate-800 text-sm">
              Dear <span className="font-bold text-[#000E32] underline">{candidateFullName || 'Applicant'}</span>,
            </div>

            {/* Main Appointment Section Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left side text columns */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Blue Header box */}
                <div className="bg-[#000E32] text-white p-4 rounded-2xl flex flex-col xs:flex-row items-center xs:items-start text-center xs:text-left gap-3.5 shadow-md shadow-blue-950/10">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white shrink-0 flex items-center justify-center font-extrabold">
                    <UserCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400">Official Notice</h4>
                    <p className="text-xs font-bold leading-snug break-words">
                      APPOINTMENT AS PROFESSIONAL STAFF MEMBER AT DS TECH AND DIGITAL MARKETING AGENCY LIMITED
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  We are pleased to inform you that, following the successful completion of our evaluation process, you have been officially appointed as a <strong className="text-[#000E32]">Professional Staff Member</strong> of <strong className="text-[#000E32]">DS Tech and Digital Marketing Agency Limited</strong>, Garki, Abuja.
                </p>

                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  Your employment shall become effective on <span className="border-b-2 border-dashed border-orange-500 px-3 py-0.5 text-orange-600 font-extrabold italic bg-orange-50/50 rounded">{acceptDate}</span>.
                </p>

                {/* Qualify areas list */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] font-extrabold uppercase text-[#000E32] tracking-wider mb-2">
                      This appointment qualifies you to participate in and be considered for:
                    </h5>
                    <ul className="text-xs text-slate-700 space-y-1.5 font-medium pl-1">
                      {[
                        'Salary-based employment opportunities',
                        'Freelance assignments',
                        'Contract jobs and projects',
                        'Brand Ambassador opportunities',
                        'Content creation and promotional engagements',
                        'Business, technology, marketing, and digital projects',
                        'Remote, On-site, and Hybrid work opportunities',
                      ].map((item, idx) => (
                        <li key={`qual-${idx}`} className="flex items-start gap-2">
                          <CheckCircle2 className="text-orange-500 shrink-0 mt-0.5" size={12} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div>
                    <h5 className="text-[10px] font-extrabold uppercase text-[#000E32] tracking-wider mb-2">
                      As a Professional Staff Member, you shall also be eligible to receive:
                    </h5>
                    <ul className="text-xs text-slate-700 space-y-1.5 font-medium pl-1">
                      {[
                        'Professional mentorship and guidance',
                        'Career development support',
                        'Learning and growth opportunities',
                        'Professional recommendations',
                        'Performance-based recognition and awards',
                        'Access to networking and partnership opportunities',
                        'Participation in team and individual projects',
                      ].map((item, idx) => (
                        <li key={`elig-${idx}`} className="flex items-start gap-2">
                          <CheckCircle2 className="text-blue-900 shrink-0 mt-0.5" size={12} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Terms of engagement */}
                <div className="border border-slate-150 p-4 rounded-2xl bg-white">
                  <span className="text-[10px] font-extrabold text-[#000E32] uppercase tracking-wider flex items-center gap-2 mb-3">
                    <ClipboardList size={14} /> TERMS OF ENGAGEMENT
                  </span>
                  <ol className="text-[10.5px] text-slate-600 space-y-2.5 list-none font-medium">
                    <li>
                      <strong className="text-slate-800">1.</strong> This appointment qualifies you to be considered and assigned to available opportunities, projects, contracts, and engagements based on your skills and client requirements.
                    </li>
                    <li>
                      <strong className="text-slate-800">2.</strong> Professional Staff Members may work remotely, on-site, or in a hybrid capacity depending on assignment specs.
                    </li>
                    <li>
                      <strong className="text-slate-800">3.</strong> DS Tech and Digital Marketing Agency Limited shall coordinate assignments, projects, contracts, and opportunities.
                    </li>
                    <li>
                      <strong className="text-slate-800">4.</strong> Standard agency commission or administrative fee applies to client projects facilitated through the Company.
                    </li>
                    <li>
                      <strong className="text-slate-800">5.</strong> Professional Staff Members shall maintain professionalism, integrity, and confidentiality.
                    </li>
                  </ol>
                </div>

              </div>

              {/* Right side form elements (Candidate Info card + Bank details preview) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Staff Details Card */}
                <div className="border-2 border-blue-900 rounded-3xl p-5 bg-blue-50/10 space-y-3.5 relative">
                  <div className="bg-blue-900 text-white rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <FileText size={14} /> Staff Information
                  </div>

                  <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">FullName:</span>
                      <span className="min-[375px]:col-span-2 text-[#000E32] font-bold break-words">{candidateFullName}</span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">Nationality:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800">{application.personalInfo?.nationality || 'Nigerian'}</span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">State:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800">{application.personalInfo?.stateOfOrigin || ''}</span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">LGA/Town:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800">{application.personalInfo?.lgaTownOfOrigin || ''}</span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">Address:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800 font-medium break-all" title={candidateAddress}>
                        {candidateAddress || 'Garki, Abuja'}
                      </span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">Mobile:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800 font-mono">{candidatePhone}</span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 gap-1">
                      <span className="text-slate-400">Email:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800 break-all">{candidateEmail}</span>
                    </div>
                  </div>

                  {application.personalInfo?.passportPhoto && application.personalInfo?.passportPhoto.trim() !== '' ? (
                    <div className="absolute top-12 right-4 w-12 h-14 border border-slate-200 rounded overflow-hidden bg-white shadow-sm">
                      <img src={application.personalInfo?.passportPhoto} className="w-full h-full object-cover" alt="passport" />
                    </div>
                  ) : null}
                </div>

                {/* Salary Remittance Account Details */}
                <div className="border-2 border-blue-900 rounded-3xl p-5 bg-white space-y-4">
                  <div className="bg-blue-900 text-white rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <Landmark size={14} /> Account Details
                    </span>
                    <button 
                      type="button" 
                      onClick={() => { setViewMode('wizard'); setActiveStep(3); }} 
                      className="text-[9px] text-orange-300 underline font-extrabold hover:text-white"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">Beneficiary:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800 break-words font-bold">
                        {accountName || candidateFullName || 'Not provided yet'}
                      </span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 border-b border-slate-100 gap-1">
                      <span className="text-slate-400">Bank Name:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800 font-bold">
                        {bankName || 'Not provided yet'}
                      </span>
                    </div>
                    <div className="flex flex-col min-[375px]:grid min-[375px]:grid-cols-3 py-1.5 gap-1">
                      <span className="text-slate-400">NUBAN Number:</span>
                      <span className="min-[375px]:col-span-2 text-slate-800 font-mono font-bold tracking-wider">
                        {accountNumber || 'Not provided yet'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidate Signature Card */}
                <div className="border border-orange-200 rounded-3xl p-5 bg-[#FAF7F2]/45 space-y-4">
                  <div className="bg-orange-600 text-white rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider shadow">
                    <span className="flex items-center gap-2">
                      <PenTool size={14} /> Candidate Acceptance
                    </span>
                    <button 
                      type="button" 
                      onClick={() => { setViewMode('wizard'); setActiveStep(4); }} 
                      className="text-[9px] text-amber-200 underline font-extrabold hover:text-white"
                    >
                      Sign / Edit
                    </button>
                  </div>

                  {isSigned || acceptSignature ? (
                    <div className="space-y-3 bg-white p-4 border border-emerald-100 rounded-2xl">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-extrabold uppercase tracking-wide">Agreement Signed & Locked</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Staff Signature</span>
                          {acceptSignature ? (
                            <img src={acceptSignature} className="max-h-[34px] object-contain mt-1" alt="candidate-signature" />
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Unsigned</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Acceptance Date</span>
                          <span className="text-xs font-bold text-slate-800 leading-none">{acceptDate}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center space-y-2">
                      <p className="text-xs text-orange-900 font-bold">Offer Pending Signature</p>
                      <button
                        type="button"
                        onClick={() => { setViewMode('wizard'); setActiveStep(4); }}
                        className="px-4 py-2 bg-orange-600 text-white text-xs font-extrabold rounded-xl shadow hover:bg-orange-700"
                      >
                        Click Here to Sign Contract
                      </button>
                    </div>
                  )}
                </div>

                {/* Company Approval Seal */}
                <div className="border border-slate-150 rounded-3xl p-5 bg-white space-y-4 relative">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    For Company Approval / Seal
                  </div>

                  <div className="space-y-2 text-xs font-medium text-slate-700">
                    <p className="text-[11px] leading-snug">
                      Yours faithfully,<br />
                      <strong>CEO</strong><br />
                      DS Tech and Digital Marketing Agency Limited, Abuja.
                    </p>

                    <div className="pt-3 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">CEO Signature</span>
                        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" className="filter opacity-90 select-none">
                          <path d="M10 25 C15 5, 25 10, 35 30 C45 35, 60 5, 75 15 C90 25, 100 20, 110 32" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M30 18 L 85 18" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Seal Checked Date</span>
                        <span className="text-xs font-bold text-slate-800">{new Date().toISOString().split('T')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stamp */}
                  <div className="absolute bottom-8 right-6 pointer-events-none transform rotate-12 select-none">
                    <svg width="90" height="90" viewBox="0 0 100 100" className="filter drop-shadow-sm opacity-80">
                      <circle cx="50" cy="50" r="44" stroke="#DC2626" strokeWidth="2" strokeDasharray="96 4" fill="none" />
                      <circle cx="50" cy="50" r="39" stroke="#DC2626" strokeWidth="1" fill="none" />
                      <circle cx="50" cy="50" r="28" stroke="#DC2626" strokeWidth="1.5" fill="none" />
                      
                      <path id="stampPath" d="M 18 50 C 18 20, 82 20, 82 50 C 82 80, 18 80, 18 50" fill="none" />
                      <path id="stampPathLower" d="M 80 50 C 80 80, 20 80, 20 50" fill="none" />
                      
                      <text fontFamily="sans-serif" fontSize="6.5" fontWeight="extrabold" fill="#DC2626">
                        <textPath href="#stampPath" startOffset="50%" textAnchor="middle">
                          * DS TECH & DIGITAL MARKETING *
                        </textPath>
                      </text>
                      <text fontFamily="sans-serif" fontSize="6" fontWeight="extrabold" fill="#DC2626">
                        <textPath href="#stampPathLower" startOffset="50%" textAnchor="middle">
                          AGENCY LIMITED
                        </textPath>
                      </text>

                      <text x="50" y="47" fontFamily="sans-serif" fontSize="6.5" fontWeight="bold" fill="#DC2626" textAnchor="middle">OFFICIAL</text>
                      <text x="50" y="55" fontFamily="sans-serif" fontSize="7" fontWeight="black" fill="#DC2626" textAnchor="middle">SEAL</text>
                    </svg>
                  </div>
                </div>

              </div>

            </div>

            {/* Social Handles Bar */}
            <div className="border-t border-slate-100 pt-6 mt-8">
              <span className="text-[10px] font-extrabold text-[#000E32] uppercase tracking-widest block text-center mb-4">
                OUR ACTIVE CHANNELS
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
                {[
                  { name: 'Facebook', handle: 'dstechanddigitaltd', color: 'text-blue-600 bg-blue-50/50' },
                  { name: 'Instagram', handle: 'dstechltd3', color: 'text-pink-600 bg-pink-50/50' },
                  { name: 'TikTok', handle: 'dstechanddigitalltd', color: 'text-slate-900 bg-white' },
                  { name: 'X (Twitter)', handle: '@DigitalDs18246', color: 'text-slate-900 bg-white' },
                  { name: 'YouTube', handle: '@DSTECHANDDIGITALMARKETINGLTD', color: 'text-red-600 bg-red-50/50' },
                  { name: 'LinkedIn', handle: 'dstechanddigitaltd', color: 'text-blue-700 bg-blue-50/50' },
                ].map((channel, i) => (
                  <div key={`social-${i}`} className={`p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center ${channel.color}`}>
                    <span className="text-[9px] font-bold text-slate-800">{channel.name}</span>
                    <span className="text-[8px] text-slate-500 font-medium truncate max-w-full block mt-0.5">{channel.handle}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Biometric Prompt Modal */}
      <PhoneBiometricPrompt
        isOpen={isBiometricPromptOpen}
        onSuccess={handleBiometricSuccess}
        onCancel={() => setIsBiometricPromptOpen(false)}
        title="Biometric Contract Signature"
        subtitle="Verify registered biometric profile to bind secure digital signature to employment contract"
        mode="verify"
        userId={application?.id || 'usr-appointee'}
        email={candidateEmail || 'candidate@dstech.com'}
      />
    </div>
  );
};
