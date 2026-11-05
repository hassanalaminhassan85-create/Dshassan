import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle2, 
  Clock, User, Phone, Mail, Building, FileText, 
  Copy, Check, ChevronDown, ShieldCheck, Layers,
  Megaphone, Search, Share2, TrendingUp, Bot, Layout,
  Video, Palette, Calendar, Users, Target, MessageSquare, BarChart3
} from 'lucide-react';
import { ServiceItem, sanitizeServiceName } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { 
  COMPANY_BANK_NAME, 
  COMPANY_BANK_ACCOUNT_NUMBER, 
  COMPANY_BANK_ACCOUNT_NAME 
} from '../lib/companyConstants';
import { MoniepointIcon } from './MoniepointIcon';
import { OfficialWhatsAppIcon } from './OfficialWhatsAppIcon';

interface CustomQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceItem | null;
  allServices?: ServiceItem[];
  language?: LanguageCode;
}

export const CustomQuoteModal: React.FC<CustomQuoteModalProps> = ({
  isOpen,
  onClose,
  initialService,
  allServices = [],
  language = 'en'
}) => {
  const agencyPhone = '2349023489111';

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService?.id || (allServices.length > 0 ? allServices[0].id : 'custom')
  );
  const [contentCreationPackage, setContentCreationPackage] = useState<string>('AI VIDEO CONTENT CREATION PACKAGE');
  const [contentGoal, setContentGoal] = useState('');
  const [aspectRatio, setAspectRatio] = useState('');
  const [isContentAccordionOpen, setIsContentAccordionOpen] = useState(false);
  const [isAdsAccordionOpen, setIsAdsAccordionOpen] = useState(false);
  const [isDigitalAccordionOpen, setIsDigitalAccordionOpen] = useState(false);

  // Digital Marketing & Ads Management Accordion State
  const [digitalMarketingObjectives, setDigitalMarketingObjectives] = useState<string[]>([]);
  const [digitalMarketingSubOptions, setDigitalMarketingSubOptions] = useState<Record<string, string[]>>({});
  const [adsManagementObjectives, setAdsManagementObjectives] = useState<string[]>([]);
  const [adsManagementSubOptions, setAdsManagementSubOptions] = useState<Record<string, string[]>>({});

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  
  // Client proposed budget
  const [proposedBudget, setProposedBudget] = useState('');

  // Preferred Delivery Time Dropdown
  const [deliveryTimeline, setDeliveryTimeline] = useState('Within 1–2 weeks');
  const [customTimelineText, setCustomTimelineText] = useState('');

  const [description, setDescription] = useState('');

  // Manual payment accordion
  const [isPaymentAccordionOpen, setIsPaymentAccordionOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync initial service when modal opens or initialService changes
  useEffect(() => {
    if (initialService?.id) {
      setSelectedServiceId(initialService.id);
    }
  }, [initialService]);

  // Reset accordions to collapsed when modal opens or selected service changes
  useEffect(() => {
    if (isOpen) {
      setIsContentAccordionOpen(false);
      setIsAdsAccordionOpen(false);
      setIsDigitalAccordionOpen(false);
    }
  }, [isOpen, selectedServiceId]);

  if (!isOpen) return null;

  const currentService = allServices.find(s => s.id === selectedServiceId) || initialService;
  const sanitizedCurrentName = currentService ? sanitizeServiceName(currentService.name).toLowerCase() : '';
  const currentId = (currentService?.id || '').toLowerCase();

  const isContentCreation = currentService ? (
    sanitizedCurrentName === 'content creation' ||
    currentId === 'svc_04' ||
    currentId === 'svc_content_presentation'
  ) : false;

  const isDigitalMarketing = currentService ? (
    sanitizedCurrentName === 'digital marketing' ||
    currentId === 'svc_02' ||
    currentId === 'svc_digital_marketing'
  ) : false;

  const isAdsManagement = currentService ? (
    sanitizedCurrentName === 'ads management' ||
    currentId === 'svc_01' ||
    currentId === 'svc_ads_management'
  ) : false;

  const toggleModalObjective = (group: 'digital' | 'ads', title: string) => {
    if (group === 'digital') {
      setDigitalMarketingObjectives(prev => 
        prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
      );
    } else {
      setAdsManagementObjectives(prev => 
        prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
      );
    }
  };

  const serviceTitle = currentService ? sanitizeServiceName(currentService.name) : 'Custom Enterprise Project';
  const serviceCategory = currentService?.category || 'General';
  const serviceDeliverables = currentService?.deliverables && currentService.deliverables.length > 0
    ? currentService.deliverables
    : [
        'Dedicated Enterprise Architecture & Strategy',
        'Milestone-Based Execution & Quality Assurance Audits',
        'Official SLA Guarantee & Direct Engineering Handover'
      ];

  const formatNairaDisplay = (val: string) => {
    const rawDigits = val.replace(/[^\d]/g, '');
    if (!rawDigits) return '';
    return Number(rawDigits).toLocaleString('en-NG');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d]/g, '');
    setProposedBudget(rawVal);
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d]/g, '');
    setAmountPaid(rawVal);
  };

  const handleCopyAccountNumber = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(COMPANY_BANK_ACCOUNT_NUMBER);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !description.trim()) {
      alert('Please fill in your name, WhatsApp phone number, and project description.');
      return;
    }

    const formattedBudget = proposedBudget 
      ? `₦${Number(proposedBudget).toLocaleString('en-NG')}` 
      : 'Open to Discussion';

    const finalDeliveryTime = deliveryTimeline === 'Custom timeline'
      ? (customTimelineText ? `Custom (${customTimelineText})` : 'Custom Timeline')
      : deliveryTimeline;

    const manualPaymentText = amountPaid.trim() 
      ? `₦${Number(amountPaid.replace(/[^\d]/g, '') || amountPaid).toLocaleString('en-NG')}` 
      : 'Optional / Not paid yet';

    const message = `*DS TECH AGENCY - OFFICIAL SERVICE QUOTE & BRIEF*

*CLIENT INFORMATION:*
• Full Name: ${fullName.trim()}
• WhatsApp Contact: ${phone.trim()}
${email.trim() ? `• Email: ${email.trim()}\n` : ''}${company.trim() ? `• Company / Brand: ${company.trim()}\n` : ''}
*SERVICE SPECIFICATION:*
• Target Service: ${serviceTitle}
• Category: ${serviceCategory.toUpperCase()}
${isContentCreation ? `• Selected Package: ${contentCreationPackage}\n` : ''}${isContentCreation && contentGoal.trim() ? `• Primary Content Goal: ${contentGoal.trim()}\n` : ''}${isContentCreation && aspectRatio.trim() ? `• Target Aspect Ratio / Format: ${aspectRatio.trim()}\n` : ''}${isDigitalMarketing && digitalMarketingObjectives.length > 0 ? `• Digital Marketing Objectives: ${digitalMarketingObjectives.join(', ')}\n` : ''}${isAdsManagement && adsManagementObjectives.length > 0 ? `• Ads Management Objectives: ${adsManagementObjectives.join(', ')}\n` : ''}
*CLIENT PROPOSED TERMS:*
• Proposed Budget: ${formattedBudget}
• Preferred Delivery Time: ${finalDeliveryTime}
• Manual Payment Status: ${manualPaymentText}

*RECEIVING BANK REFERENCE:*
• Bank: ${COMPANY_BANK_NAME}
• Account Number: ${COMPANY_BANK_ACCOUNT_NUMBER}
• Account Name: ${COMPANY_BANK_ACCOUNT_NAME}

*CORE DELIVERABLES:*
${serviceDeliverables.map(d => `• ${d}`).join('\n')}

*CUSTOM PROJECT DESCRIPTION & SCOPE:*
${description.trim()}

----------------------------------------
*Generated via DS Tech Digital Marketplace (RC 9550925)*`;

    const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(message)}`;
    
    setSubmitted(true);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setSubmitted(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17243A]/60 backdrop-blur-xs overflow-y-auto font-['Inter',sans-serif]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="bg-white border border-[#E5E9EF] text-[#17243A] rounded-[20px] max-w-2xl w-full shadow-[0_20px_25px_-5px_rgba(16,24,40,0.1),0_8px_10px_-6px_rgba(16,24,40,0.06)] overflow-hidden relative my-auto text-left"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-[#E5E9EF] bg-white flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[12px] text-[#667085]">
                <span className="font-semibold text-[#E87932] uppercase tracking-wider">
                  DS TECH QUOTATION
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-[#079B68]">
                  <ShieldCheck size={13} />
                  SLA Guaranteed
                </span>
              </div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#17243A] tracking-tight leading-snug">
                {serviceTitle}
              </h2>
              {isContentCreation && (
                <div className="pt-0.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#E87932]/10 text-[#E87932] rounded border border-[#E87932]/20">
                    {contentCreationPackage}
                  </span>
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-[#F8FAFC] text-[#667085] hover:text-[#17243A] hover:bg-[#E5E9EF] transition-colors shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20"
              title="Close Quote Dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-[#ECFDF3] text-[#079B68] flex items-center justify-center mx-auto border border-[#A6F4C5]">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-[18px] font-bold text-[#17243A]">Connecting to WhatsApp...</h3>
                <p className="text-[14px] text-[#667085] max-w-md mx-auto font-normal leading-relaxed">
                  Your project brief and quotation requirements have been compiled. Redirecting to chat directly with our senior engineering desk.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSendToWhatsApp} className="space-y-5">
                
                {/* 1. Target Service Selector */}
                {allServices.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                      Target Service Catalog Selection
                    </label>
                    <div className="relative">
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-9 text-[14px] sm:text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 appearance-none cursor-pointer transition-colors"
                      >
                        {allServices.map((s) => (
                          <option key={s.id} value={s.id} className="text-[#17243A]">
                            {sanitizeServiceName(s.name)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Content Creation Quotation Packages (Strictly for Content Creation only) */}
                {isContentCreation && (
                  <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E5E9EF] overflow-hidden transition-all shadow-xs" id="modal-content-creation-packages-section">
                    {/* Compact Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setIsContentAccordionOpen(!isContentAccordionOpen)}
                      aria-expanded={isContentAccordionOpen}
                      className="w-full py-2 px-2.5 sm:py-2.5 sm:px-3 flex items-center justify-between text-left hover:bg-[#F1F5F9] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-[#E87932]/10 flex items-center justify-center shrink-0 text-[#E87932]">
                          <Layers size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#17243A] leading-snug">
                              Content Creation Packages
                            </h3>
                            <span className="text-[9.5px] font-semibold text-[#E87932] bg-[#E87932]/10 px-1.5 py-0.5 rounded-full border border-[#E87932]/20 whitespace-nowrap">
                              {contentCreationPackage === 'AI VIDEO CONTENT CREATION PACKAGE' ? 'AI Video' : 'Human Presenter'}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#667085] font-normal mt-0.5 leading-snug break-words">
                            Active: <span className="font-semibold text-[#17243A]">{contentCreationPackage}</span>
                          </p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full bg-white border border-[#E5E9EF] flex items-center justify-center shrink-0 ml-1.5 transition-transform duration-200 text-[#667085] ${isContentAccordionOpen ? 'rotate-180 text-[#E87932]' : ''}`}>
                        <ChevronDown size={13} />
                      </div>
                    </button>

                    {/* Accordion Body */}
                    <AnimatePresence initial={false}>
                      {isContentAccordionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-[#E5E9EF]"
                        >
                          <div className="p-2.5 sm:p-3 space-y-2.5 bg-white">
                            <p className="text-[11.5px] text-[#667085] leading-normal font-normal">
                              Select preferred video content package:
                            </p>

                            {/* 2 Compact Package Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                {
                                  name: 'AI VIDEO CONTENT CREATION PACKAGE',
                                  tag: 'AI-Generated & Rapid',
                                  description: 'Generative AI scriptwriting, synthetic voice narration & viral social formats.'
                                },
                                {
                                  name: 'HUMAN VIDEO CREATION PACKAGE',
                                  tag: 'Studio Cast & Presenter',
                                  description: 'Live-action cinematography, professional host & bespoke studio edit.'
                                }
                              ].map((pkg) => {
                                const isSelected = contentCreationPackage === pkg.name;
                                return (
                                  <button
                                    key={pkg.name}
                                    type="button"
                                    onClick={() => setContentCreationPackage(pkg.name)}
                                    className={`p-2 sm:p-2.5 rounded-[9px] border text-left flex items-start justify-between gap-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 relative ${
                                      isSelected
                                        ? 'bg-[#FFF9F5] border-[#E87932] ring-1 ring-[#E87932]/30 text-[#17243A]'
                                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                        isSelected ? 'bg-[#E87932]/10 text-[#E87932]' : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {pkg.tag}
                                      </span>
                                      <h4 className="text-[12px] font-bold text-[#17243A] leading-snug break-words">
                                        {pkg.name}
                                      </h4>
                                      <p className="text-[10.5px] text-[#667085] leading-snug break-words">
                                        {pkg.description}
                                      </p>
                                    </div>
                                    <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                      isSelected ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                                    }`}>
                                      {isSelected ? <Check size={11} strokeWidth={3} /> : null}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Client-Editable Content Requirements */}
                            <div className="pt-2 space-y-2 border-t border-[#F1F5F9]">
                              {/* Primary Content Goal */}
                              <div className="space-y-1">
                                <label className="text-[11.5px] sm:text-[12px] font-medium text-[#17243A] block">
                                  Primary Content Goal
                                </label>
                                <textarea
                                  rows={2}
                                  value={contentGoal}
                                  onChange={(e) => setContentGoal(e.target.value)}
                                  placeholder="Describe what you want to achieve with your content..."
                                  className="w-full min-h-[65px] bg-white border border-[#E5E9EF] rounded-[8px] p-2.5 text-[12.5px] sm:text-[13px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors leading-relaxed resize-y"
                                />
                              </div>

                              {/* Target Aspect Ratio / Format */}
                              <div className="space-y-1">
                                <label className="text-[11.5px] sm:text-[12px] font-medium text-[#17243A] block">
                                  Target Aspect Ratio / Format
                                </label>
                                <input
                                  type="text"
                                  value={aspectRatio}
                                  onChange={(e) => setAspectRatio(e.target.value)}
                                  placeholder="e.g. 9:16, 16:9, 1:1, portrait or landscape."
                                  className="w-full h-[40px] bg-white border border-[#E5E9EF] rounded-[8px] px-2.5 text-[12.5px] sm:text-[13px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Digital Marketing Accordion Objective Cards */}
                {/* Digital Marketing Primary Objectives */}
                {isDigitalMarketing && (
                  <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E5E9EF] overflow-hidden transition-all shadow-xs" id="custom-quote-digital-objectives">
                    {/* Compact Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setIsDigitalAccordionOpen(!isDigitalAccordionOpen)}
                      aria-expanded={isDigitalAccordionOpen}
                      className="w-full py-2 px-2.5 sm:py-2.5 sm:px-3 flex items-center justify-between text-left hover:bg-[#F1F5F9] transition-colors cursor-pointer focus:outline-none select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-[#E87932]/10 flex items-center justify-center shrink-0 text-[#E87932]">
                          <Layers size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#17243A] leading-snug">
                              Digital Marketing Objectives
                            </h3>
                            <span className="text-[9.5px] font-semibold text-[#E87932] bg-[#E87932]/10 px-1.5 py-0.5 rounded-full border border-[#E87932]/20 whitespace-nowrap">
                              {digitalMarketingObjectives.length} Selected
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#667085] font-normal mt-0.5 leading-snug break-words">
                            Select primary marketing goals and growth channels
                          </p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full bg-white border border-[#E5E9EF] flex items-center justify-center shrink-0 ml-1.5 transition-transform duration-200 text-[#667085] ${isDigitalAccordionOpen ? 'rotate-180 text-[#E87932]' : ''}`}>
                        <ChevronDown size={13} />
                      </div>
                    </button>

                    {/* Accordion Body with Compact Cards (No sub-objectives) */}
                    <AnimatePresence initial={false}>
                      {isDigitalAccordionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="border-t border-[#E5E9EF] bg-[#FAFCFF] p-2.5 sm:p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-[#667085] font-medium">
                              Available Objectives (9):
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const allTitles = [
                                    'Ads Management',
                                    'Search Engine Optimization (SEO)',
                                    'Social Media Management',
                                    'Digital Marketing & Growth Strategies',
                                    'AI Business Automation',
                                    'Landing Page & Sales Funnels',
                                    'Content Creation & Video Editing',
                                    'Graphic Design & Corporate Branding',
                                    'Event & Brand Promotion'
                                  ];
                                  setDigitalMarketingObjectives(allTitles);
                                }}
                                className="text-[#E87932] hover:underline font-semibold cursor-pointer"
                              >
                                Select All
                              </button>
                              {digitalMarketingObjectives.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDigitalMarketingObjectives([]);
                                    setDigitalMarketingSubOptions({});
                                  }}
                                  className="text-[#667085] hover:text-[#17243A] font-medium cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {[
                              { title: 'Ads Management', icon: Megaphone, summary: 'Paid sponsored ad campaigns across Meta, Google, TikTok, and YouTube' },
                              { title: 'Search Engine Optimization (SEO)', icon: Search, summary: 'Keyword research, on-page SEO, speed audit & top Google indexing' },
                              { title: 'Social Media Management', icon: Share2, summary: 'Consistent content publishing, reels production & community growth' },
                              { title: 'Digital Marketing & Growth Strategies', icon: TrendingUp, summary: 'Full-funnel growth strategy, CRO, retention & market positioning' },
                              { title: 'AI Business Automation', icon: Bot, summary: 'AI support chatbots, CRM sync, auto-invoicing & smart workflows' },
                              { title: 'Landing Page & Sales Funnels', icon: Layout, summary: 'High-converting landing pages, WhatsApp capture & checkout flows' },
                              { title: 'Content Creation & Video Editing', icon: Video, summary: 'Studio cast, AI video, executive pitch decks & technical copy' },
                              { title: 'Graphic Design & Corporate Branding', icon: Palette, summary: 'Vector logo, brand identity guides, stationery & social kits' },
                              { title: 'Event & Brand Promotion', icon: Calendar, summary: 'Launch campaigns, on-site event videography & PR distribution' }
                            ].map(obj => {
                              const Icon = obj.icon;
                              const isObjSel = digitalMarketingObjectives.includes(obj.title);

                              return (
                                <button
                                  key={obj.title}
                                  type="button"
                                  onClick={() => toggleModalObjective('digital', obj.title)}
                                  className={`py-2 px-2.5 rounded-[9px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                                    isObjSel
                                      ? 'bg-[#FFF9F5] border-[#E87932] shadow-2xs'
                                      : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-slate-50/70'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[6px] flex items-center justify-center shrink-0 transition-colors ${
                                      isObjSel ? 'bg-[#E87932] text-white' : 'bg-[#E87932]/10 text-[#E87932]'
                                    }`}>
                                      <Icon size={13} />
                                    </div>
                                    <div className="min-w-0 flex-1 pr-1">
                                      <h4 className="text-[12px] sm:text-[12.5px] font-semibold text-[#17243A] leading-snug break-words">
                                        {obj.title}
                                      </h4>
                                      <p className="text-[10.5px] text-[#667085] leading-snug mt-0.5 break-words">
                                        {obj.summary}
                                      </p>
                                    </div>
                                  </div>

                                  <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                                    isObjSel ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD] group-hover:border-[#E87932]'
                                  }`}>
                                    {isObjSel ? <Check size={11} strokeWidth={3} /> : null}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Ads Management Accordion Objective Cards */}
                {isAdsManagement && (
                  <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E5E9EF] overflow-hidden transition-all shadow-xs" id="custom-quote-ads-objectives">
                    {/* Compact Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setIsAdsAccordionOpen(!isAdsAccordionOpen)}
                      aria-expanded={isAdsAccordionOpen}
                      className="w-full py-2 px-2.5 sm:py-2.5 sm:px-3 flex items-center justify-between text-left hover:bg-[#F1F5F9] transition-colors cursor-pointer focus:outline-none select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-[#E87932]/10 flex items-center justify-center shrink-0 text-[#E87932]">
                          <Layers size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#17243A] leading-snug">
                              Ads Management Objectives
                            </h3>
                            <span className="text-[9.5px] font-semibold text-[#E87932] bg-[#E87932]/10 px-1.5 py-0.5 rounded-full border border-[#E87932]/20 whitespace-nowrap">
                              {adsManagementObjectives.length} Selected
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#667085] font-normal mt-0.5 leading-snug break-words">
                            Select target advertising channels and campaign goals
                          </p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full bg-white border border-[#E5E9EF] flex items-center justify-center shrink-0 ml-1.5 transition-transform duration-200 text-[#667085] ${isAdsAccordionOpen ? 'rotate-180 text-[#E87932]' : ''}`}>
                        <ChevronDown size={13} />
                      </div>
                    </button>

                    {/* Accordion Body with Compact Cards */}
                    <AnimatePresence initial={false}>
                      {isAdsAccordionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="border-t border-[#E5E9EF] bg-[#FAFCFF] p-2.5 sm:p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-[#667085] font-medium">
                              Available Objectives ({7}):
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const allTitles = [
                                    'Meta Ads Management (Facebook & Instagram)',
                                    'Google Ads Management (Search, Display & YouTube)',
                                    'TikTok & Emerging Platform Ads',
                                    'Boosting Followers & Engagement',
                                    'Leads & Sales Generation',
                                    'Landing Page & WhatsApp Enquiries',
                                    'Ad Analytics, Tracking & ROAS Optimization'
                                  ];
                                  setAdsManagementObjectives(allTitles);
                                }}
                                className="text-[#E87932] hover:underline font-semibold cursor-pointer"
                              >
                                Select All
                              </button>
                              {adsManagementObjectives.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setAdsManagementObjectives([])}
                                  className="text-[#667085] hover:text-[#17243A] font-medium cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {[
                              { title: 'Meta Ads Management (Facebook & Instagram)', icon: Share2, summary: 'Feed, Stories, Reels & conversion ads' },
                              { title: 'Google Ads Management (Search, Display & YouTube)', icon: Search, summary: 'Search PPC, Display & YouTube video' },
                              { title: 'TikTok & Emerging Platform Ads', icon: Video, summary: 'Spark ads, viral video & instant lead forms' },
                              { title: 'Boosting Followers & Engagement', icon: Users, summary: 'Profile growth, post likes & community' },
                              { title: 'Leads & Sales Generation', icon: Target, summary: 'High-ROAS direct conversions & sales' },
                              { title: 'Landing Page & WhatsApp Enquiries', icon: MessageSquare, summary: 'Click-to-WhatsApp & high-converting pages' },
                              { title: 'Ad Analytics, Tracking & ROAS Optimization', icon: BarChart3, summary: 'Pixel, GA4, CAPI & weekly performance' }
                            ].map(obj => {
                              const Icon = obj.icon;
                              const isObjSel = adsManagementObjectives.includes(obj.title);

                              return (
                                <button
                                  key={obj.title}
                                  type="button"
                                  onClick={() => toggleModalObjective('ads', obj.title)}
                                  className={`py-2 px-2.5 rounded-[9px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                                    isObjSel
                                      ? 'bg-[#FFF9F5] border-[#E87932] shadow-2xs'
                                      : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-slate-50/70'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[6px] flex items-center justify-center shrink-0 transition-colors ${
                                      isObjSel ? 'bg-[#E87932] text-white' : 'bg-[#E87932]/10 text-[#E87932]'
                                    }`}>
                                      <Icon size={13} />
                                    </div>
                                    <div className="min-w-0 flex-1 pr-1">
                                      <h4 className="text-[12px] sm:text-[12.5px] font-semibold text-[#17243A] leading-snug break-words">
                                        {obj.title}
                                      </h4>
                                      <p className="text-[10.5px] text-[#667085] leading-snug mt-0.5 break-words">
                                        {obj.summary}
                                      </p>
                                    </div>
                                  </div>

                                  <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                                    isObjSel ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD] group-hover:border-[#E87932]'
                                  }`}>
                                    {isObjSel ? <Check size={11} strokeWidth={3} /> : null}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 2. Client Identity Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                      Full Name <span className="text-[#E87932]">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. David Solomon"
                      className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                      WhatsApp Phone Number <span className="text-[#E87932]">*</span>
                    </label>
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +234 812 345 6789"
                      className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                      Email Address <span className="text-[#667085] text-[12px] font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                      Company / Organization <span className="text-[#667085] text-[12px] font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. DS Tech Ventures Ltd"
                      className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Budget & Preferred Delivery Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                      Preferred Delivery Timeline <span className="text-[#E87932]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={deliveryTimeline}
                        onChange={(e) => setDeliveryTimeline(e.target.value)}
                        className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-9 text-[14px] sm:text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 appearance-none cursor-pointer transition-colors"
                      >
                        <option value="As soon as possible">As soon as possible</option>
                        <option value="Within 3–7 days">Within 3–7 days</option>
                        <option value="Within 1–2 weeks">Within 1–2 weeks</option>
                        <option value="Within 2–4 weeks">Within 2–4 weeks</option>
                        <option value="Within 1–2 months">Within 1–2 months</option>
                        <option value="Flexible — let's discuss">Flexible — let's discuss</option>
                        <option value="Custom timeline">Custom timeline</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
                    </div>

                    {deliveryTimeline === 'Custom timeline' && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                        <input 
                          type="text"
                          value={customTimelineText}
                          onChange={(e) => setCustomTimelineText(e.target.value)}
                          placeholder="Specify timeline requirements..."
                          className="w-full h-[46px] bg-white border border-[#E87932] rounded-[10px] px-3.5 text-[14px] text-[#17243A] focus:outline-none"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                      Your Proposed Budget (₦) <span className="text-[#667085] text-[12px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E87932] font-semibold text-[15px] select-none pointer-events-none">
                        ₦
                      </span>
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={formatNairaDisplay(proposedBudget)}
                        onChange={handleBudgetChange}
                        placeholder="e.g. 500,000"
                        className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-8 pr-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Custom Requirements Description */}
                <div>
                  <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                    Custom Requirements &amp; Project Scope <span className="text-[#E87932]">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specify project objectives, expected milestones, target audience, technical preferences, or custom requests..."
                    className="w-full min-h-[110px] bg-white border border-[#E5E9EF] rounded-[10px] p-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors leading-relaxed resize-y"
                  />
                </div>

                {/* 5. Moniepoint Manual Payment Accordion */}
                <div className="border border-[#E5E9EF] rounded-[12px] overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setIsPaymentAccordionOpen(!isPaymentAccordionOpen)}
                    aria-expanded={isPaymentAccordionOpen}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <MoniepointIcon size={22} />
                      <div>
                        <h4 className="text-[14px] font-semibold text-[#17243A] flex flex-wrap items-center gap-2">
                          <span>Direct Corporate Bank Transfer</span>
                          <span className="text-[12px] font-normal text-[#667085]">
                            (Optional · Moniepoint MFB)
                          </span>
                        </h4>
                      </div>
                    </div>

                    <ChevronDown 
                      size={18} 
                      className={`text-[#667085] transition-transform duration-200 ${isPaymentAccordionOpen ? 'rotate-180 text-[#E87932]' : ''}`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isPaymentAccordionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden border-t border-[#E5E9EF] bg-[#F8FAFC] p-4 space-y-3.5"
                      >
                        <p className="text-[13px] text-[#667085] leading-relaxed">
                          Making an advance payment is optional. If you wish to make a direct transfer, please use our verified Moniepoint corporate receiving account:
                        </p>

                        <div className="p-3.5 rounded-[10px] bg-white border border-[#E5E9EF] space-y-2.5">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-[#667085]">Bank Name</span>
                            <span className="font-semibold text-[#17243A] flex items-center gap-1.5">
                              <MoniepointIcon size={14} />
                              {COMPANY_BANK_NAME}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-b border-[#E5E9EF] py-2">
                            <div>
                              <span className="text-[11px] font-medium text-[#667085] block uppercase tracking-wider">Account Number</span>
                              <span className="text-[18px] font-bold font-mono text-[#079B68] tracking-wider">{COMPANY_BANK_ACCOUNT_NUMBER}</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyAccountNumber}
                              className="h-[34px] px-3 rounded-[8px] text-[12px] font-semibold bg-[#F8FAFC] text-[#17243A] border border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              {copiedBank ? <Check size={13} className="text-[#079B68]" /> : <Copy size={13} />}
                              <span>{copiedBank ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-[#667085]">Account Name</span>
                            <span className="font-semibold text-[#17243A] text-right">{COMPANY_BANK_ACCOUNT_NAME}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-[#17243A] block">
                            Amount Paid (₦) <span className="text-[#667085] text-[12px] font-normal">(Optional)</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E87932] font-semibold text-[15px] select-none pointer-events-none">
                              ₦
                            </span>
                            <input 
                              type="text"
                              inputMode="numeric"
                              value={formatNairaDisplay(amountPaid)}
                              onChange={handleAmountPaidChange}
                              placeholder="e.g. 100,000"
                              className="w-full h-[46px] bg-white border border-[#E5E9EF] rounded-[10px] pl-8 pr-3.5 text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 6. Action Footer */}
                <div className="pt-3 border-t border-[#E5E9EF] flex items-center justify-end">
                  <button
                    type="submit"
                    className="h-[52px] w-full sm:w-auto px-7 rounded-[12px] bg-[#079B68] hover:bg-[#06885B] active:bg-[#057A52] text-white text-[14px] font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
                  >
                    <OfficialWhatsAppIcon size={20} animate={false} />
                    <span>Send Quotation Request to WhatsApp ➔</span>
                  </button>
                </div>

              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
