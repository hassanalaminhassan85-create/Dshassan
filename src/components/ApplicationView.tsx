import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { JobApplication } from '../types';
import {
  Share2, Copy, FileText, CheckCircle2, Award, ExternalLink, RefreshCw, Printer,
  FileDown, Building2, Send, MessageSquare, Cpu, ShieldCheck, Lock, Clock,
  ShieldAlert, AlertTriangle, ArrowRight, Check, Sparkles, XCircle, UserCheck,
  Menu, X, LayoutDashboard, Bot, QrCode, ChevronRight, Fingerprint, Landmark
} from 'lucide-react';
import { AppointmentLetter } from './AppointmentLetter';
import { ApplicationQRCode } from './ApplicationQRCode';
import { CareersFormPDFView } from './CareersFormPDFView';
import { RealTimePresence } from './RealTimePresence';
import { BiometricVault } from './BiometricVault';
import { AIPersonalInterviewer } from './AIPersonalInterviewer';
import { apiGetApplication } from '../lib/storage';

interface ApplicationViewProps {
  application: JobApplication;
  onUpdateApplication?: (id: string, updatedFields: Partial<JobApplication>) => void;
  isUpdating?: boolean;
}

export type DashboardTab = 'overview' | 'offer_letter' | 'application_record' | 'ai_screening' | 'biometric_vault' | 'qr_portal';

export const ApplicationView: React.FC<ApplicationViewProps> = ({
  application,
  onUpdateApplication,
  isUpdating = false,
}) => {
  const [appData, setAppData] = useState<JobApplication>(application);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Sync external props changes
  useEffect(() => {
    setAppData(application);
    // If application gets approved, automatically switch to offer letter tab
    if (application.status === 'approved' && !application.appointmentAccepted) {
      setActiveTab('offer_letter');
    }
  }, [application]);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const latest = await apiGetApplication(appData.id);
      if (latest) {
        setAppData(latest);
        if (latest.status === 'approved' && !latest.appointmentAccepted) {
          setActiveTab('offer_letter');
        }
      }
    } catch (e) {
      console.error('Error refreshing application:', e);
    } finally {
      setRefreshing(false);
    }
  };

  // Compute a secure, shareable URL dynamically
  const getShareableUrl = () => {
    const origin = window.location.origin;
    return `${origin}/application/${appData.id}`;
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
      onUpdateApplication(appData.id, {
        appointmentAccepted: true,
        appointmentSignature: acceptance.signature,
        appointmentAcceptanceDate: acceptance.date,
        approvedBy: {
          approved: true,
          role: 'CEO / Admin',
          signature: 'CEO_ENDORSMENT_STAMP_H523',
          date: acceptance.date,
          offerRole: appData.positionSkills?.majorRole || 'Staff Member',
        },
      });
      // Refresh local state
      setAppData(prev => ({
        ...prev,
        appointmentAccepted: true,
        appointmentSignature: acceptance.signature,
        appointmentAcceptanceDate: acceptance.date,
      }));
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
    const candidateName = appData.personalInfo?.fullName || 'Candidate';
    const role = appData.positionSkills?.majorRole || 'Staff Member';
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
      `Phone: ${appData.personalInfo?.phoneNumbers || ''}`
    );

    window.open(`mailto:${companyEmail}?subject=${mailSubject}&body=${mailBody}`, '_blank');
  };

  const handleRedirectWhatsApp = () => {
    const companyPhone = '2349023489111';
    const candidateName = appData.personalInfo?.fullName || 'Candidate';
    const role = appData.positionSkills?.majorRole || 'Staff Member';
    const portalUrl = getShareableUrl();
    const text = `Hi DS Tech, I have successfully filled the Careers Application Form for the role of ${role}. You can access my official signed document here: ${portalUrl}`;
    
    window.open(`https://wa.me/${companyPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const navigationItems = [
    {
      id: 'overview' as DashboardTab,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'offer_letter' as DashboardTab,
      label: 'Appointment Offer & Contract',
      icon: Award,
      badge: appData.status === 'approved' 
        ? (appData.appointmentAccepted ? 'SIGNED' : 'ACTION REQUIRED')
        : (appData.status === 'rejected' ? 'REJECTED' : 'PENDING APPROVAL'),
      badgeColor: appData.status === 'approved'
        ? (appData.appointmentAccepted ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white animate-pulse')
        : (appData.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'),
    },
    {
      id: 'application_record' as DashboardTab,
      label: 'Application Record (PDF)',
      icon: FileText,
      badge: '11 Steps',
      badgeColor: 'bg-indigo-900/60 text-indigo-200',
    },
    {
      id: 'ai_screening' as DashboardTab,
      label: 'AI Cognitive Screening',
      icon: Bot,
      badge: 'Interactive',
      badgeColor: 'bg-blue-900/60 text-blue-200',
    },
    {
      id: 'biometric_vault' as DashboardTab,
      label: 'Biometric Vault',
      icon: ShieldCheck,
      badge: '2026 Core',
      badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
    },
    {
      id: 'qr_portal' as DashboardTab,
      label: 'QR Verification & Share',
      icon: QrCode,
      badge: null,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* RECRUITER / CANDIDATE TOP NAVIGATION BAR WITH HAMBURGER & REFRESH */}
      <header className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-lg sticky top-3 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: App Logo & Return to Careers Hub */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  window.history.pushState(null, '', '/');
                } catch (e) {
                  console.warn('History pushState is disabled or restricted:', e);
                }
                window.dispatchEvent(new Event('popstate'));
              }}
              className="py-2 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0"
              title="Return to Careers Portal"
            >
              ← <span className="hidden sm:inline">Return to Careers Hub</span><span className="sm:hidden">Careers</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            <div className="hidden md:flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                Recruiter Portal
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                ID: {appData.id}
              </span>
            </div>
          </div>

          {/* Right: Hamburger Menu Toggle (Mobile) + Refresh Live Approval Status */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="py-2 px-3.5 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-orange-200 dark:border-orange-800 shadow-sm"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-orange-600' : 'text-orange-500'} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing Status...' : 'Check Approval Status'}</span>
              <span className="sm:hidden">{refreshing ? 'Syncing...' : 'Status'}</span>
            </button>

            {/* Hamburger Button for Mobile Drawer */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 md:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* DESKTOP HORIZONTAL NAVIGATION TABS */}
        <nav className="hidden md:flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all duration-300 flex items-center gap-2 whitespace-nowrap relative shrink-0 ${
                  isActive
                    ? 'bg-[#000E32] text-white shadow-md shadow-blue-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-orange-400' : ''} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* MOBILE HAMBURGER MENU DRAWER OVERLAY */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 overflow-hidden"
            >
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">Candidate Profile</div>
                  <div className="text-xs font-extrabold text-[#000E32] dark:text-white">{appData.personalInfo?.fullName || 'Applicant'}</div>
                  <div className="text-[10px] font-bold text-orange-600">{appData.positionSkills?.majorRole || 'Role'}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  appData.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  appData.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {appData.status || 'pending'}
                </span>
              </div>

              <div className="space-y-1">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={`mob-${item.id}`}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-[#000E32] text-white'
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-orange-400' : 'text-slate-500'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight size={14} className="opacity-40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* RECRUITER / CANDIDATE DASHBOARD CANDIDATE BANNER HEADER */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-[#000E32] h-1.5 w-full absolute top-0 left-0" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-1">
          {/* Candidate Profile Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-orange-500/30 overflow-hidden shrink-0 shadow-md flex items-center justify-center">
              {appData.personalInfo?.passportPhoto ? (
                <img src={appData.personalInfo.passportPhoto} alt="Candidate Passport" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-orange-600">{appData.personalInfo?.fullName?.[0] || 'C'}</span>
              )}
            </div>

            <div className="space-y-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Candidate Dashboard Record
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {appData.id}
                </span>
              </div>
              
              <h1 className="text-xl md:text-2xl font-black text-[#000E32] dark:text-white tracking-tight">
                {appData.personalInfo?.fullName || 'Candidate Profile'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-bold text-orange-600 dark:text-orange-400">{appData.positionSkills?.majorRole || 'Applicant'}</span>
                <span>•</span>
                <span>{appData.personalInfo?.emailAddress}</span>
                <span>•</span>
                <span>{appData.personalInfo?.phoneNumbers}</span>
              </div>
            </div>
          </div>

          {/* Status Badge & Action Trigger */}
          <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Approval Status</span>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                (appData.status || 'pending') === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                (appData.status || 'pending') === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  (appData.status || 'pending') === 'approved' ? 'bg-emerald-500' :
                  (appData.status || 'pending') === 'rejected' ? 'bg-rose-500' :
                  'bg-amber-500 animate-pulse'
                }`} />
                {(appData.status || 'pending') === 'approved' ? 'Approved — Offer Unlocked' :
                 (appData.status || 'pending') === 'rejected' ? 'Application Rejected' :
                 'Pending Admin Approval'}
              </span>
            </div>

            {appData.status === 'approved' && !appData.appointmentAccepted && (
              <button
                type="button"
                onClick={() => setActiveTab('offer_letter')}
                className="mt-1 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-orange-500/20 flex items-center gap-1.5 animate-bounce cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Fill Appointment Offer Letter →</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PROMINENT BANNER WHEN ADMIN APPROVES APPLICATION */}
      {appData.status === 'approved' && (
        <div className="no-print bg-emerald-500 text-slate-950 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-emerald-400">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950 text-emerald-400 rounded-2xl shrink-0 shadow-md">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-slate-950 text-emerald-400 font-black text-[10px] uppercase rounded-full tracking-wider">
                  ADMIN APPROVED
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {appData.appointmentAccepted ? 'Offer Signed & Accepted' : 'Action Needed: Fill Appointment Letter'}
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-950 mt-1">
                {appData.appointmentAccepted 
                  ? 'Congratulations! Your Appointment Offer Agreement is Fully Executed & Sealed.'
                  : 'Great News! Admin Has Approved Your Application. Complete Your Appointment Letter Now.'}
              </h2>
              <p className="text-xs text-slate-900 font-medium mt-0.5 leading-relaxed">
                {appData.appointmentAccepted
                  ? 'Your bank account details and electronic signature have been registered in our database. You can download or print your official contract below.'
                  : 'Please click the button to enter your salary bank account details and digitally sign your official appointment letter.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('offer_letter')}
            className="w-full md:w-auto py-3 px-6 bg-slate-950 hover:bg-slate-900 text-emerald-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <UserCheck size={16} />
            <span>{appData.appointmentAccepted ? 'View Signed Contract' : 'Sign Appointment Letter Now'}</span>
          </button>
        </div>
      )}

      {/* DYNAMIC TAB CONTENT VIEW SWITCHER */}
      <main className="space-y-6">

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Real-time multi-device Presence visualizer */}
            <div className="no-print">
              <RealTimePresence />
            </div>

            {/* SUCCESS OVERLAY PANEL WITH SHAREABLE LINKS AND QR CODE GENERATION UTILITY */}
            <div className="no-print bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
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

                {/* Dynamic QR Code Utility Column */}
                <div className="lg:col-span-1">
                  <ApplicationQRCode application={appData} shareUrl={getShareableUrl()} />
                </div>
              </div>
            </div>

            {/* QUICK FEATURE NAVIGATION TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('offer_letter')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left hover:border-orange-500 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Award size={20} />
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                    appData.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {appData.status === 'approved' ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#000E32] dark:text-white">Appointment Offer</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Review, sign, & fill salary bank details once approved by admin.</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('application_record')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left hover:border-blue-500 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-blue-50 text-blue-700">
                    PDF Record
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#000E32] dark:text-white">Careers Application PDF</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Full 11-step form record styled for print & submission.</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai_screening')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left hover:border-indigo-500 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Bot size={20} />
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-indigo-50 text-indigo-700">
                    AI Screening
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#000E32] dark:text-white">AI Personal Interviewer</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Simulated interview practice & cognitive assessment.</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('biometric_vault')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl text-left hover:border-emerald-500 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-emerald-50 text-emerald-700">
                    Secure Vault
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#000E32] dark:text-white">Biometric Vault</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Encrypted document verification & SHA-256 validation.</p>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: APPOINTMENT OFFER & CONTRACT (UNLOCKED UPON ADMIN APPROVAL) */}
        {activeTab === 'offer_letter' && (
          <div className="space-y-6">
            {appData.status === 'approved' ? (
              <div className="space-y-6">
                <div className="no-print bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-900 dark:text-emerald-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shrink-0 shadow-md">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full">
                          ADMIN APPROVED
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          Status: Offer Ready for Filling & Signing
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base tracking-tight mt-0.5">
                        Congratulations! Your Appointment Offer Has Been Unlocked
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Executive management has reviewed and approved your application. Please review the terms, provide your bank details below, and digitally sign your appointment letter.
                      </p>
                    </div>
                  </div>
                </div>

                <AppointmentLetter
                  application={appData}
                  onAccept={handleAcceptAppointment}
                  isSubmitting={isUpdating}
                />
              </div>
            ) : appData.status === 'rejected' ? (
              <div className="no-print bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-6 md:p-8 rounded-3xl text-left space-y-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                      APPLICATION REJECTED
                    </span>
                    <h3 className="text-lg font-black text-rose-900 dark:text-rose-100 mt-1">
                      Application Not Approved at This Time
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  Thank you for applying for the <strong>{appData.positionSkills?.majorRole || 'Position'}</strong> role. After administrative evaluation, your application has not been approved for appointment offer issuance at this time.
                </p>
                {appData.adminNotes && (
                  <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs text-slate-800 dark:text-slate-200 font-mono">
                    <strong>Admin Feedback:</strong> {appData.adminNotes}
                  </div>
                )}
              </div>
            ) : (
              /* PENDING ADMIN APPROVAL LOCKED STATE */
              <div className="no-print bg-slate-900 text-white rounded-3xl p-6 md:p-10 border border-slate-800 shadow-2xl text-left space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 border-b border-slate-800 pb-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
                      <Clock size={13} className="animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Pending Admin Approval</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 font-serif">
                      <Lock className="text-amber-400" size={24} />
                      Appointment Letter Section Locked
                    </h2>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl font-light">
                      Your career application form has been submitted and is currently undergoing administrative review. Once an administrator approves your application, this section will automatically unlock for you to fill in your salary account details and digitally sign your official appointment letter.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl text-center space-y-1 w-full md:w-auto shrink-0 shadow-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Application Status</span>
                    <span className="text-sm font-black font-mono text-amber-400 block uppercase">Under Admin Review</span>
                    <span className="text-[9px] text-slate-400 font-mono block">ID: {appData.id}</span>
                  </div>
                </div>

                {/* 3-STEP PROGRESS TRACKER */}
                <div className="space-y-4 relative z-10">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Approval & Onboarding Protocol</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Step 1 */}
                    <div className="bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase rounded-full">Completed</span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">Application Submitted</h5>
                        <p className="text-[10px] text-slate-400 mt-1">11-step form filled & electronically signed by candidate.</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <Check size={12} /> Registered & Hashed
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase rounded-full animate-pulse">In Progress</span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-amber-300">Admin Approval</h5>
                        <p className="text-[10px] text-slate-300 mt-1">Administrator reviews credentials, position match & salary details.</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                        <Clock size={12} /> Awaiting Executive Sign-off
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 opacity-60">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 font-black text-xs flex items-center justify-center">3</span>
                        <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-[9px] font-bold uppercase rounded-full">Locked</span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-300">Appointment Letter & Bank Details</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Input salary account details & sign official offer contract.</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <Lock size={12} /> Unlocks After Step 2
                      </div>
                    </div>
                  </div>
                </div>

                {/* Helpful Guidance Footer */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>Are you a candidate/recruiter?</strong> You can register or log into your <strong>Career Portal Account</strong> to monitor real-time approval status across all your applications.
                    </p>
                  </div>
                  <a
                    href="/account"
                    onClick={(e) => {
                      e.preventDefault();
                      try {
                        window.history.pushState(null, '', '/account');
                      } catch (err) {}
                      window.dispatchEvent(new Event('popstate'));
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 text-center"
                  >
                    Open Career Account Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CAREERS APPLICATION RECORD (OFFICIAL 11-STEP PDF VIEW) */}
        {activeTab === 'application_record' && (
          <div className="space-y-6">
            
            {/* REDIRECT & SEND APPLICATION TO COMPANY PANEL */}
            <div className="no-print bg-[#FAF7F2] dark:bg-slate-900 border border-orange-200/65 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full filter blur-xl pointer-events-none" />
              <div className="text-left space-y-1.5 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide">Official Action</span>
                  <span className="text-[10px] text-orange-800 dark:text-orange-400 font-extrabold uppercase tracking-wider">Transmission Portal</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#000E32] dark:text-white">
                  Send Signed Careers Form to DS Tech Agency
                </h2>
                <p className="text-xs text-slate-650 dark:text-slate-300 max-w-2xl font-medium leading-relaxed">
                  Your Careers Application Form has been styled exactly like the official PDF format. Please click <span className="font-bold text-[#000E32] dark:text-white">Save Form as PDF</span> to download a physical copy, then use either of the <span className="font-bold text-orange-600">Redirect & Send</span> buttons to transmit your secure credentials to DS Tech.
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

            <div className="print-page w-full">
              <CareersFormPDFView application={appData} />
            </div>
          </div>
        )}

        {/* TAB 4: AI COGNITIVE SCREENING */}
        {activeTab === 'ai_screening' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black">AI</span>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Proactive Cognitive Screening</h3>
            </div>
            <AIPersonalInterviewer 
              candidateName={appData.personalInfo?.fullName} 
              position={appData.positionSkills?.majorRole} 
            />
          </div>
        )}

        {/* TAB 5: BIOMETRIC VAULT */}
        {activeTab === 'biometric_vault' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="p-1.5 bg-orange-600 text-white rounded-lg text-xs font-black">2026</span>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">High-Security Document Core</h3>
            </div>
            <BiometricVault application={appData} />
          </div>
        )}

        {/* TAB 6: QR VERIFICATION & SHARE PORTAL */}
        {activeTab === 'qr_portal' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-full text-xs font-black uppercase tracking-wider">
                    QR Verification Badge
                  </span>
                  <h2 className="text-xl font-extrabold text-[#000E32] dark:text-white">
                    Scan or Share Candidate Portal Link
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This QR code embeds your hashed application ID for instant mobile inspection.
                  </p>
                </div>

                <ApplicationQRCode application={appData} shareUrl={getShareableUrl()} />

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Direct Share Link</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getShareableUrl()}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-indigo-600 dark:text-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
                    >
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
