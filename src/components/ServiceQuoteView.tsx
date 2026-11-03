import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, 
  Clock, User, Phone, Mail, Building2, 
  Layers, Copy, Check, ChevronDown, ShieldCheck,
  CheckSquare, Square
} from 'lucide-react';
import { SERVICES, ServiceItem, sortServicesDeterministically, sanitizeServiceName } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { 
  COMPANY_BANK_NAME, 
  COMPANY_BANK_ACCOUNT_NUMBER, 
  COMPANY_BANK_ACCOUNT_NAME 
} from '../lib/companyConstants';
import { MoniepointIcon } from './MoniepointIcon';
import { OfficialWhatsAppIcon } from './OfficialWhatsAppIcon';
import { getServiceSlug, saveQuotationRecord } from '../lib/quoteUtils';

interface ServiceQuoteViewProps {
  service: ServiceItem;
  allServices: ServiceItem[];
  language?: LanguageCode;
  onBack: () => void;
  onNavigateToService?: (slug: string) => void;
}

export const ServiceQuoteView: React.FC<ServiceQuoteViewProps> = ({
  service,
  allServices,
  language = 'en',
  onBack,
  onNavigateToService
}) => {
  const agencyPhone = '2349023489111';

  // Client Contact Details State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  // Proposed Budget (₦)
  const [proposedBudget, setProposedBudget] = useState('');

  // Preferred Delivery Time Dropdown State
  const [deliveryTimeline, setDeliveryTimeline] = useState('Within 1–2 weeks');
  const [customTimelineText, setCustomTimelineText] = useState('');

  // Custom Description / Scope
  const [description, setDescription] = useState('');

  // Service-Specific Dynamic Options
  const [serviceFields, setServiceFields] = useState<Record<string, any>>({});

  // Accordion State for Content Creation Packages
  const [isContentAccordionOpen, setIsContentAccordionOpen] = useState(true);

  // Accordion State for Manual Payment Instructions (Collapsed by default)
  const [isPaymentAccordionOpen, setIsPaymentAccordionOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);

  // In-App Banner Notification States
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState('');

  // Scroll to top on mount or service change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [service.id]);

  // Reset or preserve service specific fields when service changes
  useEffect(() => {
    setNotification(null);
    setIsSubmittedSuccess(false);

    const isContentCreation = 
      sanitizeServiceName(service.name).toLowerCase() === 'content creation' || 
      service.id === 'svc_04' || 
      service.id === 'svc_content_presentation';

    if (isContentCreation) {
      setIsContentAccordionOpen(true);
      setServiceFields(prev => ({
        contentCreationPackage: prev.contentCreationPackage || 'AI VIDEO CONTENT CREATION PACKAGE',
        contentGoal: prev.contentGoal !== undefined ? prev.contentGoal : '',
        aspectRatio: prev.aspectRatio !== undefined ? prev.aspectRatio : '',
        ...prev
      }));
    }
  }, [service.id, service.name]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d]/g, '');
    setProposedBudget(rawVal);
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d]/g, '');
    setAmountPaid(rawVal);
  };

  const formatNairaDisplay = (val: string) => {
    if (!val) return '';
    const num = Number(val);
    return isNaN(num) ? '' : num.toLocaleString('en-NG');
  };

  const handleCopyBank = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(COMPANY_BANK_ACCOUNT_NUMBER);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  const updateSpecificField = (key: string, value: any) => {
    setServiceFields(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleArrayOption = (key: string, option: string) => {
    setServiceFields(prev => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [key]: updated };
    });
  };

  // Render Tailored Service-Specific Questions with compact, multi-select rows
  const renderServiceSpecificFields = () => {
    const cat = service.category;
    const name = (service.name || '').toLowerCase();
    const sanitizedTitle = sanitizeServiceName(service.name);

    // 0. Dedicated Content Creation Quotation Packages (Exact 2 Selectable Packages)
    const isContentCreation = 
      sanitizedTitle.toLowerCase() === 'content creation' || 
      service.id === 'svc_04' || 
      service.id === 'svc_content_presentation';

    if (isContentCreation) {
      const selectedPackage = serviceFields.contentCreationPackage || 'AI VIDEO CONTENT CREATION PACKAGE';
      const packageOptions = [
        {
          name: 'AI VIDEO CONTENT CREATION PACKAGE',
          tag: 'AI-Generated & Rapid Production',
          description: 'Generative AI scriptwriting, synthetic voiceover narration, prompt-engineered visual assets, dynamic text motion, and viral social formatting.'
        },
        {
          name: 'HUMAN VIDEO CREATION PACKAGE',
          tag: 'Studio Cast & Human Presenter',
          description: 'Live-action studio cinematography, professional human on-camera host, physical shoot direction, high-definition audio recording, and bespoke color grading.'
        }
      ];

      return (
        <div className="rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF] overflow-hidden transition-all shadow-xs" id="content-creation-packages-section">
          {/* Polished Accordion Header */}
          <button
            type="button"
            onClick={() => setIsContentAccordionOpen(!isContentAccordionOpen)}
            aria-expanded={isContentAccordionOpen}
            aria-controls="content-creation-accordion-body"
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F1F5F9] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#E87932]/10 flex items-center justify-center shrink-0 text-[#E87932]">
                <Layers size={17} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A] leading-snug truncate">
                  Content Creation Package Options
                </h3>
                <p className="text-[12px] text-[#667085] truncate font-normal">
                  Active Package: <span className="font-semibold text-[#E87932]">{selectedPackage}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white border border-[#E5E9EF] text-[#667085]">
                {isContentAccordionOpen ? 'Hide Options' : 'Expand Options'}
              </span>
              <div className={`w-7 h-7 rounded-full bg-white border border-[#E5E9EF] flex items-center justify-center transition-transform duration-200 ${isContentAccordionOpen ? 'rotate-180 text-[#E87932]' : 'text-[#667085]'}`}>
                <ChevronDown size={16} />
              </div>
            </div>
          </button>

          {/* Accordion Body */}
          <AnimatePresence initial={false}>
            {isContentAccordionOpen && (
              <motion.div
                id="content-creation-accordion-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-[#E5E9EF]"
              >
                <div className="p-4 sm:p-5 space-y-4 bg-white">
                  <p className="text-[13px] text-[#667085] leading-relaxed font-normal">
                    Select your preferred video content creation package for this quotation:
                  </p>

                  {/* 2 Refined Package Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packageOptions.map((pkg) => {
                      const isSelected = selectedPackage === pkg.name;
                      return (
                        <button
                          key={pkg.name}
                          type="button"
                          onClick={() => updateSpecificField('contentCreationPackage', pkg.name)}
                          className={`w-full p-3.5 sm:p-4 rounded-[12px] border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 relative ${
                            isSelected
                              ? 'bg-[#FFF9F5] border-[#E87932] ring-1 ring-[#E87932]/30 shadow-xs text-[#17243A]'
                              : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isSelected ? 'bg-[#E87932]/10 text-[#E87932]' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {pkg.tag}
                              </span>
                              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#17243A] leading-snug">
                                {pkg.name}
                              </h4>
                            </div>
                            <div className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isSelected ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                            }`}>
                              {isSelected ? <Check size={12} strokeWidth={3} /> : null}
                            </div>
                          </div>
                          <p className="text-[12px] text-[#667085] leading-relaxed font-normal">
                            {pkg.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Client-Editable Content Requirements */}
                  <div className="pt-3 space-y-4 border-t border-[#F1F5F9]">
                    {/* Primary Content Goal */}
                    <div className="space-y-1.5">
                      <label htmlFor="content-goal-input" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                        Primary Content Goal
                      </label>
                      <textarea
                        id="content-goal-input"
                        rows={3}
                        value={serviceFields.contentGoal || ''}
                        onChange={(e) => updateSpecificField('contentGoal', e.target.value)}
                        placeholder="Describe what you want to achieve with your content..."
                        className="w-full min-h-[85px] bg-white border border-[#E5E9EF] rounded-[10px] p-3.5 text-[14px] sm:text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors leading-relaxed resize-y"
                      />
                    </div>

                    {/* Target Aspect Ratio / Format */}
                    <div className="space-y-1.5">
                      <label htmlFor="aspect-ratio-input" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                        Target Aspect Ratio / Format
                      </label>
                      <input
                        id="aspect-ratio-input"
                        type="text"
                        value={serviceFields.aspectRatio || ''}
                        onChange={(e) => updateSpecificField('aspectRatio', e.target.value)}
                        placeholder="e.g. 9:16, 16:9, 1:1, portrait or landscape."
                        className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 text-[14px] sm:text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (cat === 'web' || name.includes('website') || name.includes('landing') || name.includes('portfolio')) {
      const selectedFeatures: string[] = serviceFields.features || [];
      const featureOptions = [
        'Online Payments (Paystack/Flutterwave)',
        'WhatsApp Live Chat Integration',
        'User Login / Client Dashboard',
        'CMS / Admin Management System',
        'Multilingual Support',
        'Booking / Appointment System',
        'SEO & Speed Optimization'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Website &amp; Web Platform Requirements
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                Project Type
              </label>
              <div className="relative">
                <select
                  value={serviceFields.websiteType || 'Corporate Business Website'}
                  onChange={(e) => updateSpecificField('websiteType', e.target.value)}
                  className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-9 text-[14px] sm:text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 appearance-none cursor-pointer transition-colors"
                >
                  <option value="Corporate Business Website">Corporate Business Website</option>
                  <option value="E-Commerce Store & Payment Portal">E-Commerce Store &amp; Payment Portal</option>
                  <option value="Conversion Landing Page">Conversion Landing Page</option>
                  <option value="Personal / Professional Portfolio">Personal / Professional Portfolio</option>
                  <option value="Custom Web Application / SaaS">Custom Web Application / SaaS</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                Estimated Page Count
              </label>
              <div className="relative">
                <select
                  value={serviceFields.pageCount || '1–5 Pages'}
                  onChange={(e) => updateSpecificField('pageCount', e.target.value)}
                  className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-9 text-[14px] sm:text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 appearance-none cursor-pointer transition-colors"
                >
                  <option value="Single Page (Landing Page)">Single Page (Landing Page)</option>
                  <option value="1–5 Pages">1–5 Pages</option>
                  <option value="5–15 Pages">5–15 Pages</option>
                  <option value="15+ Custom Portal Pages">15+ Custom Portal Pages</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Required Core Features <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {featureOptions.map((feat) => {
                const isChecked = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => handleToggleArrayOption('features', feat)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {feat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'software' || name.includes('software') || name.includes('app')) {
      const selectedPlatforms: string[] = serviceFields.platforms || [];
      const platformOptions = [
        'iOS Mobile App',
        'Android Mobile App',
        'Cross-Platform Mobile (iOS + Android)',
        'Web App / SaaS Portal',
        'Desktop Application'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Software &amp; Mobile App Architecture
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Target Platforms <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {platformOptions.map((plat) => {
                const isChecked = selectedPlatforms.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handleToggleArrayOption('platforms', plat)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {plat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'marketing' || name.includes('ads') || name.includes('marketing') || name.includes('social') || name.includes('seo')) {
      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Marketing &amp; Campaign Objectives
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                Primary Campaign Objective
              </label>
              <div className="relative">
                <select
                  value={serviceFields.campaignObjective || 'Lead Generation & WhatsApp Enquiries'}
                  onChange={(e) => updateSpecificField('campaignObjective', e.target.value)}
                  className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-9 text-[14px] sm:text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 appearance-none cursor-pointer transition-colors"
                >
                  <option value="Lead Generation & WhatsApp Enquiries">Lead Generation &amp; WhatsApp Enquiries</option>
                  <option value="Direct Sales & E-Commerce Conversions">Direct Sales &amp; E-Commerce Conversions</option>
                  <option value="Brand Awareness & Organic Outreach">Brand Awareness &amp; Organic Outreach</option>
                  <option value="Search Engine Indexing & Ranking (SEO)">Search Engine Indexing &amp; Ranking (SEO)</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                Target Audience Location
              </label>
              <input
                type="text"
                value={serviceFields.targetLocation || 'Nigeria (Abuja / Lagos / Nationwide)'}
                onChange={(e) => updateSpecificField('targetLocation', e.target.value)}
                placeholder="e.g. Abuja & Lagos, or International"
                className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'ai' || name.includes('ai') || name.includes('automation')) {
      const selectedWorkflows: string[] = serviceFields.workflows || [];
      const workflowOptions = [
        'Automated Customer Care Chatbot (WhatsApp / Web)',
        'Lead Qualification & CRM Sync',
        'AI Content & Copywriting Pipeline',
        'Document & Invoice Extraction',
        'Custom AI Agent API Integration'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              AI &amp; Automation Preferences
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Primary Automation Workflows <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {workflowOptions.map((flow) => {
                const isChecked = selectedWorkflows.includes(flow);
                return (
                  <button
                    key={flow}
                    type="button"
                    onClick={() => handleToggleArrayOption('workflows', flow)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {flow}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'training' || name.includes('training') || name.includes('bootcamp') || name.includes('consultancy') || name.includes('course')) {
      const selectedModules: string[] = serviceFields.modules || [];
      const moduleOptions = [
        'Full-Stack Web & Mobile Engineering',
        'AI Model Prompting & Workflow Automation',
        'Performance Ads (Meta & Google Ads)',
        'Executive Leadership & Boardroom Protocol',
        'Cybersecurity Hygiene & Data Protection',
        'Digital Graphic Branding & Content Design',
        'Agile Sprint & Project Governance'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Corporate Training &amp; Staff Bootcamp Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                Delivery Format
              </label>
              <div className="relative">
                <select
                  value={serviceFields.trainingFormat || 'On-Site Corporate Workshop'}
                  onChange={(e) => updateSpecificField('trainingFormat', e.target.value)}
                  className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-9 text-[14px] sm:text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 appearance-none cursor-pointer transition-colors"
                >
                  <option value="On-Site Corporate Workshop">On-Site Corporate Workshop</option>
                  <option value="Virtual Interactive Masterclass">Virtual Interactive Masterclass</option>
                  <option value="1-on-1 Executive Mentorship">1-on-1 Executive Mentorship</option>
                  <option value="Hybrid Intensive Bootcamp">Hybrid Intensive Bootcamp</option>
                  <option value="Institutional Staff Accreditation">Institutional Staff Accreditation</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                Expected Cohort Size
              </label>
              <div className="relative">
                <select
                  value={serviceFields.cohortSize || 'Small Team (2–10 Attendees)'}
                  onChange={(e) => updateSpecificField('cohortSize', e.target.value)}
                  className="w-full h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-9 text-[14px] sm:text-[15px] font-normal text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 appearance-none cursor-pointer transition-colors"
                >
                  <option value="Individual Executive (1 Participant)">Individual Executive (1 Participant)</option>
                  <option value="Small Team (2–10 Attendees)">Small Team (2–10 Attendees)</option>
                  <option value="Department (10–30 Attendees)">Department (10–30 Attendees)</option>
                  <option value="Enterprise / Institutional (30+ Attendees)">Enterprise / Institutional (30+ Attendees)</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Focus Curricula &amp; Training Modules <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {moduleOptions.map((mod) => {
                const isChecked = selectedModules.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => handleToggleArrayOption('modules', mod)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {mod}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'branding' || name.includes('brand') || name.includes('graphic') || name.includes('logo')) {
      const selectedBrandItems: string[] = serviceFields.brandItems || [];
      const brandOptions = [
        'Vector Master Logo & Iconography',
        'Comprehensive Brand Style Guide (Pantone/Fonts)',
        'Business Cards & Corporate Stationery',
        'Investor Pitch Deck & Corporate Brochure',
        'Social Media Templates & Banner Kit',
        'Product Packaging & 3D Mockups'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Branding &amp; Creative Deliverables
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Required Brand Assets <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {brandOptions.map((item) => {
                const isChecked = selectedBrandItems.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('brandItems', item)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'compliance' || name.includes('cac') || name.includes('scuml') || name.includes('tax')) {
      const selectedCompliance: string[] = serviceFields.complianceItems || [];
      const complianceOptions = [
        'CAC Limited Liability Incorporation (LTD)',
        'Business Name Registration (Enterprise)',
        'SCUML Anti-Money Laundering Certificate',
        'FIRS Corporate TIN & Tax Clearance Certificate',
        'Annual Statutory Returns Filing',
        'Trademark & Intellectual Property Registration'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Statutory Corporate Compliance &amp; CAC Scope
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Required Statutory Filings <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {complianceOptions.map((item) => {
                const isChecked = selectedCompliance.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('complianceItems', item)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'ict' || name.includes('cyber') || name.includes('security') || name.includes('ict')) {
      const selectedIct: string[] = serviceFields.ictItems || [];
      const ictOptions = [
        'Penetration Testing & Vulnerability Assessment',
        'SSL / TLS, Cloudflare WAF & DDoS Shield',
        'Smart CCTV & Biometric Access Installation',
        'Local Office Network & Firewall Setup',
        'Cloud Backup & Disaster Recovery Architecture',
        'Staff Cybersecurity Hygiene Workshop'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Security &amp; ICT Infrastructure Requirements
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Security &amp; IT Services <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ictOptions.map((item) => {
                const isChecked = selectedIct.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('ictItems', item)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'business' || name.includes('business') || name.includes('project') || name.includes('plan')) {
      const selectedBusiness: string[] = serviceFields.businessItems || [];
      const businessOptions = [
        'Investor-Ready Business Plan Document',
        '3-5 Year Comprehensive Financial Model',
        'Market Feasibility & Competitor Analysis',
        'Agile Project Sprint Governance',
        'Executive Customer Support Desk Setup'
      ];

      return (
        <div className="space-y-4 p-4 sm:p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E5E9EF]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#E87932] shrink-0" />
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A]">
              Business Advisory &amp; Project Governance
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
              Scope of Advisory <span className="text-[12px] font-normal text-[#667085]">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {businessOptions.map((item) => {
                const isChecked = selectedBusiness.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('businessItems', item)}
                    className={`w-full min-h-[46px] p-3 rounded-[10px] border text-left flex items-center gap-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20 ${
                      isChecked
                        ? 'bg-[#FFF9F5] border-[#E87932] text-[#17243A]'
                        : 'bg-white border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] text-[#17243A]'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-[#E87932] border-[#E87932] text-white' : 'bg-white border-[#D0D5DD]'
                    }`}>
                      {isChecked ? <Check size={12} strokeWidth={3} /> : null}
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-normal text-[#17243A] leading-snug">
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const handleSubmitQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setNotification(null);

    // Form Validation
    if (!fullName.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide your Full Name to proceed.'
      });
      return;
    }

    if (!phone.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide your WhatsApp Phone Number so our engineering team can contact you.'
      });
      return;
    }

    if (!description.trim()) {
      setNotification({
        type: 'error',
        message: 'Please describe your project scope or custom requirements.'
      });
      return;
    }

    setIsSubmitting(true);

    const formattedBudget = proposedBudget 
      ? `₦${Number(proposedBudget).toLocaleString('en-NG')}` 
      : 'Open to Discussion';

    const finalDeliveryTime = deliveryTimeline === 'Custom timeline'
      ? (customTimelineText ? `Custom (${customTimelineText})` : 'Custom Timeline')
      : deliveryTimeline;

    const manualPaymentText = amountPaid.trim() 
      ? `₦${Number(amountPaid.replace(/[^\d]/g, '') || amountPaid).toLocaleString('en-NG')}` 
      : 'Optional / Not paid yet';

    const isContentCreation = 
      sanitizeServiceName(service.name).toLowerCase() === 'content creation' || 
      service.id === 'svc_04' || 
      service.id === 'svc_content_presentation';
    const selectedPackage = isContentCreation 
      ? (serviceFields.contentCreationPackage || 'AI VIDEO CONTENT CREATION PACKAGE')
      : null;

    // Compile service-specific detail lines for WhatsApp
    const serviceSpecificDetails: string[] = [];
    if (Object.keys(serviceFields).length > 0) {
      serviceSpecificDetails.push(`*TECHNICAL SPECIFICATIONS:*`);
      for (const [key, val] of Object.entries(serviceFields)) {
        if (key === 'contentCreationPackage') continue; // Handled directly in selected package
        if (key === 'contentGoal' && typeof val === 'string' && val.trim()) {
          serviceSpecificDetails.push(`• Primary Content Goal: ${val.trim()}`);
        } else if (key === 'aspectRatio' && typeof val === 'string' && val.trim()) {
          serviceSpecificDetails.push(`• Target Aspect Ratio / Format: ${val.trim()}`);
        } else if (Array.isArray(val) && val.length > 0) {
          serviceSpecificDetails.push(`• ${key}: ${val.join(', ')}`);
        } else if (typeof val === 'string' && val.trim()) {
          serviceSpecificDetails.push(`• ${key}: ${val}`);
        }
      }
    }

    // Save quotation record to persistent store for admin review
    const quotationPayload = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.category,
      ...(selectedPackage ? { contentCreationPackage: selectedPackage, selectedPackage } : {}),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: company.trim(),
      preferredDeliveryTime: finalDeliveryTime,
      customTimelineText,
      proposedBudget: formattedBudget,
      description: description.trim(),
      serviceSpecificFields: serviceFields,
      amountPaid: manualPaymentText,
      submittedAt: new Date().toISOString(),
      status: 'pending' as const
    };

    saveQuotationRecord(quotationPayload);

    // Format WhatsApp Message
    const messageLines = [
      `*DS TECH AGENCY - OFFICIAL SERVICE QUOTATION REQUEST*`,
      ``,
      `*CLIENT INFORMATION:*`,
      `• Full Name: ${fullName.trim()}`,
      `• WhatsApp Contact: ${phone.trim()}`,
      email.trim() ? `• Email: ${email.trim()}` : null,
      company.trim() ? `• Company / Brand: ${company.trim()}` : null,
      ``,
      `*SELECTED SERVICE SPECIFICATION:*`,
      `• Service: ${service.name}`,
      `• Service ID: ${service.id}`,
      `• Category: ${service.category.toUpperCase()}`,
      ...(selectedPackage ? [`• Selected Package: ${selectedPackage}`] : []),
      ...(serviceSpecificDetails.length > 0 ? [``, ...serviceSpecificDetails] : []),
      ``,
      `*PROPOSED CLIENT TERMS:*`,
      `• Proposed Budget: ${formattedBudget}`,
      `• Preferred Delivery Time: ${finalDeliveryTime}`,
      `• Manual Payment Status: ${manualPaymentText}`,
      ``,
      `*OFFICIAL RECEIVING BANK REFERENCE:*`,
      `• Bank: ${COMPANY_BANK_NAME}`,
      `• Account Number: ${COMPANY_BANK_ACCOUNT_NUMBER}`,
      `• Account Name: ${COMPANY_BANK_ACCOUNT_NAME}`,
      ``,
      `*CUSTOM PROJECT DESCRIPTION & SCOPE:*`,
      `${description.trim()}`,
      ``,
      `----------------------------------------`,
      `*Submitted via DS Tech Dedicated Quotation Portal (RC 9550925)*`
    ].filter(Boolean);

    const fullMessage = messageLines.join('\n');
    const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(fullMessage)}`;
    setSubmittedWhatsappUrl(whatsappUrl);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
      setNotification({
        type: 'success',
        message: 'Your quotation request has been compiled! Launching WhatsApp conversation with our engineering desk...'
      });

      try {
        window.open(whatsappUrl, '_blank');
      } catch (e) {
        // Fallback handled by direct link in success notification
      }
    }, 600);
  };

  const distinctServices = useMemo(() => {
    const list = Array.isArray(allServices) && allServices.length > 0 ? allServices : SERVICES;
    const sorted = sortServicesDeterministically(list);
    const seen = new Set<string>();
    return sorted.filter((s) => {
      const slug = getServiceSlug(s);
      const key = slug || (s.name || '').toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allServices]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] text-[#17243A] font-['Inter',sans-serif] antialiased py-6 sm:py-10 px-4 sm:px-8 lg:px-[40px]">
      <div className="max-w-[1120px] mx-auto space-y-5 sm:space-y-6">
        
        {/* Compact, Responsive Header & Service Navigation */}
        <nav aria-label="Service quotation navigation" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 h-[40px] px-3.5 rounded-[10px] text-[13px] font-medium text-[#17243A] bg-white border border-[#E5E9EF] hover:bg-[#F8FAFC] hover:border-[#D0D5DD] transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)] cursor-pointer self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20"
          >
            <ArrowLeft size={15} className="text-[#E87932] shrink-0" />
            <span>Back to Services</span>
          </button>

          {distinctServices.length > 1 && (
            <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
              <label htmlFor="service-switcher" className="text-[12px] font-medium text-[#667085] whitespace-nowrap hidden sm:inline">
                Service:
              </label>
              <div className="relative flex-1 sm:flex-initial">
                <select
                  id="service-switcher"
                  value={getServiceSlug(service)}
                  onChange={(e) => onNavigateToService && onNavigateToService(e.target.value)}
                  className="w-full sm:w-[280px] h-[40px] bg-white border border-[#E5E9EF] rounded-[10px] pl-3.5 pr-8 text-[13px] font-medium text-[#17243A] focus:outline-none focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 shadow-[0_1px_2px_rgba(16,24,40,0.04)] appearance-none cursor-pointer truncate transition-colors"
                >
                  {distinctServices.map((s) => (
                    <option key={s.id || getServiceSlug(s)} value={getServiceSlug(s)}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
              </div>
            </div>
          )}
        </nav>

        {/* In-App Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-4 rounded-[12px] border flex items-start gap-3 text-[14px] leading-relaxed ${
                notification.type === 'error'
                  ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                  : notification.type === 'success'
                  ? 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48]'
                  : 'bg-[#F8FAFC] border-[#E5E9EF] text-[#17243A]'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertCircle className="shrink-0 text-[#D92D20] mt-0.5" size={18} />
              ) : (
                <CheckCircle2 className="shrink-0 text-[#079B68] mt-0.5" size={18} />
              )}
              <div className="flex-1 font-medium space-y-2">
                <p>{notification.message}</p>
                {notification.type === 'success' && submittedWhatsappUrl && (
                  <div className="pt-1">
                    <a
                      href={submittedWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[13px] font-bold rounded-[8px] transition-colors shadow-sm"
                    >
                      <OfficialWhatsAppIcon className="w-4 h-4 fill-white" />
                      <span>Open WhatsApp Chat Directly</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Enterprise Quotation Card */}
        <main className="bg-white rounded-[18px] sm:rounded-[20px] border border-[#E5E9EF] shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] p-5 sm:p-8 lg:p-[36px] space-y-6 sm:space-y-8">
          
          {/* Service Title & Scope Header */}
          <header className="border-b border-[#E5E9EF] pb-5 sm:pb-6 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#667085] font-normal">
              <span className="font-semibold text-[#E87932] uppercase tracking-wider">
                {service.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>Official Quotation</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-[#079B68]">
                <ShieldCheck size={14} />
                SLA Guaranteed
              </span>
              {(sanitizeServiceName(service.name).toLowerCase() === 'content creation' || service.id === 'svc_04' || service.id === 'svc_content_presentation') && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#E87932] bg-[#E87932]/10 px-2 py-0.5 rounded-[6px] border border-[#E87932]/20">
                    {serviceFields.contentCreationPackage || 'AI VIDEO CONTENT CREATION PACKAGE'}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-[25px] sm:text-[30px] font-bold text-[#17243A] tracking-tight leading-tight">
              Request Quotation: {service.name}
            </h1>

            <p className="text-[14px] sm:text-[15px] text-[#667085] font-normal leading-relaxed max-w-3xl">
              {service.description}
            </p>

            {service.deliverables && service.deliverables.length > 0 && (
              <div className="pt-2">
                <div className="p-3.5 sm:p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E5E9EF] space-y-2">
                  <h2 className="text-[13px] font-semibold text-[#17243A]">
                    Key Deliverables Included in this Specification:
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#667085]">
                    {service.deliverables.map((deliv, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check size={14} className="text-[#079B68] shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </header>

          <form onSubmit={handleSubmitQuotation} className="space-y-6">
            
            {/* 1. Client Information */}
            <section aria-labelledby="client-info-heading" className="space-y-3.5 sm:space-y-[18px]">
              <div className="flex items-center gap-2 border-b border-[#E5E9EF] pb-2">
                <User size={16} className="text-[#E87932] shrink-0" />
                <h2 id="client-info-heading" className="text-[16px] sm:text-[17px] font-semibold text-[#17243A]">
                  1. Client Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-[18px]">
                <div>
                  <label htmlFor="quote-fullname" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                    Full Name <span className="text-[#E87932]">*</span>
                  </label>
                  <input
                    id="quote-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 sm:px-4 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="quote-phone" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                    WhatsApp Phone Number <span className="text-[#E87932]">*</span>
                  </label>
                  <input
                    id="quote-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 812 345 6789"
                    className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 sm:px-4 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="quote-email" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                    Email Address <span className="text-[#667085] text-[12px] font-normal">(Optional)</span>
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 sm:px-4 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="quote-company" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                    Company / Organization <span className="text-[#667085] text-[12px] font-normal">(Optional)</span>
                  </label>
                  <input
                    id="quote-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. DS Tech Ventures Ltd"
                    className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] px-3.5 sm:px-4 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* 2. Service-Specific Technical Scope */}
            {renderServiceSpecificFields()}

            {/* 3. Delivery Timeline & Proposed Budget */}
            <section aria-labelledby="timeline-budget-heading" className="space-y-3.5 sm:space-y-[18px]">
              <div className="flex items-center gap-2 border-b border-[#E5E9EF] pb-2">
                <Clock size={16} className="text-[#E87932] shrink-0" />
                <h2 id="timeline-budget-heading" className="text-[16px] sm:text-[17px] font-semibold text-[#17243A]">
                  2. Delivery Timeline &amp; Proposed Budget
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-[18px]">
                <div>
                  <label htmlFor="quote-delivery-timeline" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                    Preferred Delivery Timeline <span className="text-[#E87932]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="quote-delivery-timeline"
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
                        placeholder="Specify target completion date or timeframe..."
                        className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E87932] rounded-[10px] px-3.5 text-[14px] text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#E87932]/15"
                      />
                    </motion.div>
                  )}
                  <p className="text-[12px] text-[#667085] mt-1.5">
                    Subject to technical review and sprint scheduling with our lead architect.
                  </p>
                </div>

                <div>
                  <label htmlFor="quote-budget" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                    Your Proposed Budget (₦) <span className="text-[#667085] text-[12px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E87932] font-semibold text-[15px] select-none pointer-events-none">
                      ₦
                    </span>
                    <input
                      id="quote-budget"
                      type="text"
                      inputMode="numeric"
                      value={formatNairaDisplay(proposedBudget)}
                      onChange={handleBudgetChange}
                      placeholder="e.g. 500,000"
                      className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-8 pr-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[12px] text-[#667085] mt-1.5">
                    Specify the budget range you are comfortable with; we tailor scope to match.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Project Scope Description */}
            <section aria-labelledby="scope-heading" className="space-y-2">
              <div className="flex items-center gap-2 border-b border-[#E5E9EF] pb-2">
                <Building2 size={16} className="text-[#E87932] shrink-0" />
                <h2 id="scope-heading" className="text-[16px] sm:text-[17px] font-semibold text-[#17243A]">
                  3. Project Scope &amp; Deliverables
                </h2>
              </div>

              <div>
                <label htmlFor="quote-description" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block mb-1.5">
                  Detailed Project Scope &amp; Technical Requirements <span className="text-[#E87932]">*</span>
                </label>
                <textarea
                  id="quote-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail your goals, required deliverables, key features, target audience, brand preferences, or any reference designs..."
                  className="w-full min-h-[112px] sm:min-h-[120px] bg-white border border-[#E5E9EF] rounded-[10px] p-3.5 sm:p-4 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors leading-relaxed resize-y"
                />
                <p className="text-[12px] text-[#667085] mt-1.5">
                  Provide as much context as possible to help our senior consultants prepare an accurate estimation.
                </p>
              </div>
            </section>

            {/* 5. Polished Moniepoint Corporate Payment Collapsible Panel */}
            <div className="border border-[#E5E9EF] rounded-[12px] overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setIsPaymentAccordionOpen(!isPaymentAccordionOpen)}
                aria-expanded={isPaymentAccordionOpen}
                aria-controls="manual-payment-panel"
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87932]/20"
              >
                <div className="flex items-center gap-3">
                  <MoniepointIcon size={22} />
                  <div>
                    <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#17243A] flex flex-wrap items-center gap-2">
                      <span>Direct Corporate Bank Transfer</span>
                      <span className="text-[12px] font-normal text-[#667085]">
                        (Optional · Moniepoint MFB)
                      </span>
                    </h3>
                    <p className="text-[12px] text-[#667085] mt-0.5">
                      Advance deposit instructions for institutional accounts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#E87932] hidden sm:inline">
                    {isPaymentAccordionOpen ? 'Hide Details' : 'View Bank Details'}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-[#667085] transition-transform duration-200 ${isPaymentAccordionOpen ? 'rotate-180 text-[#E87932]' : ''}`} 
                  />
                </div>
              </button>

              <AnimatePresence>
                {isPaymentAccordionOpen && (
                  <motion.div
                    id="manual-payment-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden border-t border-[#E5E9EF] bg-[#F8FAFC] p-4 sm:p-5 space-y-4"
                  >
                    <p className="text-[13px] sm:text-[14px] text-[#667085] leading-relaxed">
                      Making an advance payment is completely optional. If you prefer to make a direct corporate transfer, please use our verified Moniepoint corporate receiving account:
                    </p>

                    <div className="p-4 rounded-[10px] bg-white border border-[#E5E9EF] space-y-3">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#667085]">Bank Name</span>
                        <span className="font-semibold text-[#17243A] flex items-center gap-1.5">
                          <MoniepointIcon size={16} />
                          {COMPANY_BANK_NAME}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-b border-[#E5E9EF] py-2.5">
                        <div>
                          <span className="text-[11px] font-medium text-[#667085] block uppercase tracking-wider">
                            Account Number
                          </span>
                          <span className="text-[18px] sm:text-[20px] font-bold font-mono text-[#079B68] tracking-wider">
                            {COMPANY_BANK_ACCOUNT_NUMBER}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyBank}
                          className="h-[36px] px-3 rounded-[8px] text-[13px] font-semibold bg-[#F8FAFC] text-[#17243A] border border-[#E5E9EF] hover:border-[#D0D5DD] hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                        >
                          {copiedBank ? <Check size={14} className="text-[#079B68]" /> : <Copy size={14} />}
                          <span>{copiedBank ? 'Copied' : 'Copy Number'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#667085]">Account Name</span>
                        <span className="font-semibold text-[#17243A] text-right">{COMPANY_BANK_ACCOUNT_NAME}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="quote-amount-paid" className="text-[13px] sm:text-[14px] font-medium text-[#17243A] block">
                        Amount Paid (₦) <span className="text-[#667085] text-[12px] font-normal">(Optional — leave blank if not paid yet)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E87932] font-semibold text-[15px] select-none pointer-events-none">
                          ₦
                        </span>
                        <input
                          id="quote-amount-paid"
                          type="text"
                          inputMode="numeric"
                          value={formatNairaDisplay(amountPaid)}
                          onChange={handleAmountPaidChange}
                          placeholder="e.g. 200,000"
                          className="w-full h-[46px] sm:h-[48px] bg-white border border-[#E5E9EF] rounded-[10px] pl-8 pr-3.5 text-[15px] font-normal text-[#17243A] placeholder-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#E87932] focus:ring-2 focus:ring-[#E87932]/15 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Primary Submission Button & Action Footer */}
            <div className="pt-4 sm:pt-6 border-t border-[#E5E9EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[12px] text-[#667085] text-center sm:text-left">
                Direct dispatch to DS TECH senior engineering desk via official WhatsApp channel.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[52px] w-full sm:w-auto px-7 rounded-[12px] bg-[#079B68] hover:bg-[#06885B] active:bg-[#057A52] text-white text-[14px] font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#079B68]/30 cursor-pointer disabled:opacity-50"
              >
                <OfficialWhatsAppIcon size={20} animate={false} />
                <span>{isSubmitting ? 'Preparing Quotation...' : 'Submit Quote Request via WhatsApp ➔'}</span>
              </button>
            </div>

          </form>
        </main>

      </div>
    </div>
  );
};
