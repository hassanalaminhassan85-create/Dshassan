import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { JobApplication } from '../types';
import { Share2, Copy, FileText, CheckCircle2, Award, ExternalLink, RefreshCw, Printer, FileDown, Building2, Send, MessageSquare, Cpu, ShieldCheck } from 'lucide-react';
import { AppointmentLetter } from './AppointmentLetter';
import { ApplicationQRCode } from './ApplicationQRCode';
import { CareersFormPDFView } from './CareersFormPDFView';
import { RealTimePresence } from './RealTimePresence';
import { BiometricVault } from './BiometricVault';
import { AIPersonalInterviewer } from './AIPersonalInterviewer';

interface ApplicationViewProps {
  application: JobApplication;
  onUpdateApplication?: (id: string, updatedFields: Partial<JobApplication>) => void;
  isUpdating?: boolean;
}

export const ApplicationView: React.FC<ApplicationViewProps> = ({
  application,
  onUpdateApplication,
  isUpdating = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFormTab, setActiveFormTab] = useState<'both' | 'form' | 'offer'>('both');
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Compute a secure, shareable URL dynamically
  const getShareableUrl = () => {
    const origin = window.location.origin;
    return `${origin}/application/${application.id}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareableUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptAppointment = (acceptance: {
    accountDetails: { accountName: string; bankName: string; accountNumber: string };
    signature: string;
    date: string;
  }) => {
    if (onUpdateApplication) {
      onUpdateApplication(application.id, {
        appointmentAccepted: true,
        appointmentSignature: acceptance.signature,
        appointmentAcceptanceDate: acceptance.date,
        approvedBy: {
          approved: true,
          role: 'CEO / Admin',
          signature: 'CEO_ENDORSMENT_STAMP_H523',
          date: acceptance.date,
          offerRole: application.positionSkills.majorRole || 'Staff Member',
        },
      });
    }
  };

  const handlePrintPDF = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print failed:', err);
      alert("Saving as PDF is blocked by your browser's security settings inside this preview window. Please click the 'Open in New Tab' icon at the top-right of your screen to download your official PDF successfully!");
    }
  };

  const handleRedirectEmail = () => {
    const companyEmail = 'dstechanddigitalmarketingltd@gmail.com';
    const candidateName = application.personalInfo?.fullName || 'Candidate';
    const role = application.positionSkills?.majorRole || 'Staff Member';
    const portalUrl = getShareableUrl();
    const mailSubject = encodeURIComponent(`Job Application Form - ${candidateName}`);
    const mailBody = encodeURIComponent(
      `Dear DS Tech and Digital Marketing Agency Limited,\n\n` +
      `I have successfully completed and signed my Careers Application Form for the role of ${role}.\n\n` +
      `You can inspect my complete application form and electronically signed documents online via my secure candidate portal here:\n` +
      `${portalUrl}\n\n` +
      `I have also printed and saved my signed form as a PDF document to submit for company records.\n\n` +
      `Thank you.\n\n` +
      `Best regards,\n` +
      `${candidateName}\n` +
      `Phone: ${application.personalInfo?.phoneNumbers || ''}`
    );

    window.open(`mailto:${companyEmail}?subject=${mailSubject}&body=${mailBody}`, '_blank');
  };

  const handleRedirectWhatsApp = () => {
    const companyPhone = '2349023489111';
    const candidateName = application.personalInfo?.fullName || 'Candidate';
    const role = application.positionSkills?.majorRole || 'Staff Member';
    const portalUrl = getShareableUrl();
    const text = `Hi DS Tech, I have successfully filled the Careers Application Form for the role of ${role}. You can access my official signed document here: ${portalUrl}`;
    
    window.open(`https://wa.me/${companyPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Navigation Helper Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-start items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-3">
        <button
          type="button"
          onClick={() => {
            try {
              window.history.pushState(null, '', '/');
            } catch (e) {
              console.warn('History pushState is disabled or restricted in this environment:', e);
            }
            window.dispatchEvent(new Event('popstate'));
          }}
          className="w-full sm:w-auto py-2 px-5 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200"
        >
          ← Careers Application Portal
        </button>
      </div>

      {/* Real-time multi-device Presence visualizer */}
      <div className="no-print">
        <RealTimePresence />
      </div>

      {/* SUCCESS OVERLAY PANEL WITH SHAREABLE LINKS AND QR CODE GENERATION UTILITY */}
      <div className="no-print bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full filter blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">
                <CheckCircle2 size={14} className="stroke-[2.5]" />
                Submission Registered Successfully
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none">
                Your Application Record is Secured!
              </h1>
              <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed max-w-xl">
                All documents have been electronically hashed, cataloged, and signed. You can share this portal link with HR, administrators, or download your finalized agreement contracts.
              </p>
            </div>

            {/* Share widgets */}
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40 w-full shadow-lg">
              <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block mb-1">
                Secure Shareable Portal Link
              </span>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={getShareableUrl()}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-mono text-indigo-300 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`py-2.5 px-5 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow shadow-emerald-600/20'
                      : 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-600/10'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-3 font-medium">
                <Share2 size={10} />
                Any reviewer with this link can inspect your validated credentials in real-time.
              </div>
            </div>
          </div>

          {/* Integrated Dynamic QR Code Utility Column */}
          <div className="lg:col-span-1">
            <ApplicationQRCode application={application} shareUrl={getShareableUrl()} />
          </div>
        </div>
      </div>

      {/* REDIRECT & SEND APPLICATION TO COMPANY PANEL */}
      <div className="no-print bg-[#FAF7F2] border border-orange-200/65 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full filter blur-xl pointer-events-none" />
        <div className="text-left space-y-1.5 flex-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide">Official Action</span>
            <span className="text-[10px] text-orange-800 font-extrabold uppercase tracking-wider">Transmission Portal</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#000E32]">
            Send Signed Careers Form to DS Tech Agency
          </h2>
          <p className="text-xs text-slate-650 max-w-2xl font-medium leading-relaxed">
            Your Careers Application Form has been styled exactly like the official PDF format. Please click <span className="font-bold text-[#000E32]">Save Form as PDF</span> to download a physical copy, then use either of the <span className="font-bold text-orange-600">Redirect & Send</span> buttons to instantly transmit your secure credentials to DS Tech.
          </p>
          {isInIframe && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold px-3 py-2 rounded-xl flex items-start gap-2 mt-2 shadow-sm">
              <span className="shrink-0 text-sm mt-0.5">⚠️</span>
              <span>
                <strong>Running in Preview Sandbox?</strong> Your browser's security blocks "Save PDF" inside this frame. Click the <strong>"Open in New Tab"</strong> button in the top-right corner of your screen to download your PDF perfectly!
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 relative z-10">
          <button
            type="button"
            onClick={handlePrintPDF}
            className="w-full sm:w-auto py-3 px-5 bg-[#000E32] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
          >
            <Printer size={14} className="text-orange-400" />
            <span>1. Save Form as PDF</span>
          </button>
          
          <button
            type="button"
            onClick={handleRedirectEmail}
            className="w-full sm:w-auto py-3 px-5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
          >
            <Send size={14} />
            <span>2. Redirect via Email</span>
          </button>

          <button
            type="button"
            onClick={handleRedirectWhatsApp}
            className="w-full sm:w-auto py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
          >
            <MessageSquare size={14} />
            <span>3. Send via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ADVANCED RECRUITMENT UTILITIES (2026 VISION) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biometric Vault Decryption */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="p-1.5 bg-orange-600 text-white rounded-lg text-xs font-black">2026</span>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">High-Security Document Core</h3>
          </div>
          <BiometricVault application={application} />
        </div>

        {/* AI automated agent & Interviewer */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black">AI</span>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Proactive Cognitive Screening</h3>
          </div>
          <AIPersonalInterviewer 
            candidateName={application.personalInfo?.fullName} 
            position={application.positionSkills?.majorRole} 
          />
        </div>
      </div>

      {/* Switcher Tab Buttons */}
      <div className="no-print flex gap-1 sm:gap-2 bg-white p-1 sm:p-1.5 rounded-2xl max-w-md mx-auto border border-slate-200 w-full">
        <button
          type="button"
          onClick={() => setActiveFormTab('both')}
          className={`flex-1 py-1.5 sm:py-2 text-[9px] min-[375px]:text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeFormTab === 'both' ? 'bg-white text-[#000E32] shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          View All Docs
        </button>
        <button
          type="button"
          onClick={() => setActiveFormTab('form')}
          className={`flex-1 py-1.5 sm:py-2 text-[9px] min-[375px]:text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeFormTab === 'form' ? 'bg-white text-[#000E32] shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Career Form Only
        </button>
        <button
          type="button"
          onClick={() => setActiveFormTab('offer')}
          className={`flex-1 py-1.5 sm:py-2 text-[9px] min-[375px]:text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeFormTab === 'offer' ? 'bg-white text-[#000E32] shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Offer Letter Only
        </button>
      </div>

      <div className="space-y-12">
        
        {/* VIEW 1: CAREERS APPLICATION FORM RECORD */}
        {(activeFormTab === 'both' || activeFormTab === 'form') && (
          <div className="print-page w-full">
            <CareersFormPDFView application={application} />
          </div>
        )}

        {/* VIEW 2: APPOINTMENT OFFER AGREEMENT RECORD */}
        {(activeFormTab === 'both' || activeFormTab === 'offer') && (
          <AppointmentLetter
            application={application}
            onAccept={handleAcceptAppointment}
            isSubmitting={isUpdating}
          />
        )}

      </div>
    </div>
  );
};
