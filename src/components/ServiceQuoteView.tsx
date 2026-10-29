import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Sparkles, CheckCircle2, AlertCircle, 
  Clock, DollarSign, User, Phone, Mail, Building2, 
  FileText, Copy, Check, ChevronDown, ShieldCheck, Layers, Send
} from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { 
  COMPANY_BANK_NAME, 
  COMPANY_BANK_ACCOUNT_NUMBER, 
  COMPANY_BANK_ACCOUNT_NAME 
} from '../lib/companyConstants';
import { MoniepointIcon } from './MoniepointIcon';
import { OfficialWhatsAppIcon } from './OfficialWhatsAppIcon';
import { getServiceSlug, saveQuotationRecord } from '../lib/quoteUtils';
import { Logo } from './Logo';

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

  // Client Details State
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

  // Scroll to top on mount or service change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [service.id]);

  // Reset service specific fields when service changes
  useEffect(() => {
    setServiceFields({});
    setNotification(null);
    setIsSubmittedSuccess(false);
  }, [service.id]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d]/g, '');
    setProposedBudget(rawVal);
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

  // Render Tailored Service-Specific Questions
  const renderServiceSpecificFields = () => {
    const cat = service.category;
    const name = service.name.toLowerCase();

    if (cat === 'web' || name.includes('website') || name.includes('landing') || name.includes('portfolio')) {
      return (
        <div className="space-y-4 p-4 md:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers size={14} className="text-orange-500" />
            Website &amp; Web Platform Requirements
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Project Type</label>
              <select
                value={serviceFields.websiteType || 'Corporate Business Website'}
                onChange={(e) => updateSpecificField('websiteType', e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Corporate Business Website">Corporate Business Website</option>
                <option value="E-Commerce Store & Payment Portal">E-Commerce Store &amp; Payment Portal</option>
                <option value="Conversion Landing Page">Conversion Landing Page</option>
                <option value="Personal / Professional Portfolio">Personal / Professional Portfolio</option>
                <option value="Custom Web Application / SaaS">Custom Web Application / SaaS</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Estimated Page Count</label>
              <select
                value={serviceFields.pageCount || '1–5 Pages'}
                onChange={(e) => updateSpecificField('pageCount', e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Single Page (Landing Page)">Single Page (Landing Page)</option>
                <option value="1–5 Pages">1–5 Pages</option>
                <option value="5–15 Pages">5–15 Pages</option>
                <option value="15+ Custom Portal Pages">15+ Custom Portal Pages</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
              Required Core Features (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Online Payments (Paystack/Flutterwave)',
                'WhatsApp Live Chat Integration',
                'User Login / Client Dashboard',
                'CMS / Admin Management System',
                'Multilingual Support',
                'Booking / Appointment System',
                'SEO & Speed Optimization'
              ].map((feat) => {
                const isChecked = (serviceFields.features || []).includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => handleToggleArrayOption('features', feat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{feat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'software' || name.includes('software') || name.includes('app')) {
      return (
        <div className="space-y-4 p-4 md:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers size={14} className="text-orange-500" />
            Software &amp; Mobile App Architecture
          </h4>
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">Target Platforms</label>
            <div className="flex flex-wrap gap-2">
              {['iOS Mobile App', 'Android Mobile App', 'Cross-Platform Mobile (iOS + Android)', 'Web App / SaaS Portal', 'Desktop Application'].map((plat) => {
                const isChecked = (serviceFields.platforms || []).includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handleToggleArrayOption('platforms', plat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{plat}
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
        <div className="space-y-4 p-4 md:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers size={14} className="text-orange-500" />
            Marketing &amp; Campaign Objectives
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Primary Campaign Objective</label>
              <select
                value={serviceFields.campaignObjective || 'Lead Generation'}
                onChange={(e) => updateSpecificField('campaignObjective', e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Lead Generation & WhatsApp Enquiries">Lead Generation &amp; WhatsApp Enquiries</option>
                <option value="Direct Sales & E-Commerce Conversions">Direct Sales &amp; E-Commerce Conversions</option>
                <option value="Brand Awareness & Organic Outreach">Brand Awareness &amp; Organic Outreach</option>
                <option value="Search Engine Indexing & Ranking (SEO)">Search Engine Indexing &amp; Ranking (SEO)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Target Audience Location</label>
              <input
                type="text"
                value={serviceFields.targetLocation || 'Nigeria (Abuja / Lagos / Nationwide)'}
                onChange={(e) => updateSpecificField('targetLocation', e.target.value)}
                placeholder="e.g. Abuja & Lagos, or International"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'ai' || name.includes('ai') || name.includes('automation')) {
      return (
        <div className="space-y-4 p-4 md:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers size={14} className="text-orange-500" />
            AI &amp; Automation Preferences
          </h4>
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">Primary Automation Workflows</label>
            <div className="flex flex-wrap gap-2">
              {[
                'Automated Customer Care Chatbot (WhatsApp / Web)',
                'Lead Qualification & CRM Sync',
                'AI Content & Copywriting Pipeline',
                'Document & Invoice Extraction',
                'Custom AI Agent API Integration'
              ].map((flow) => {
                const isChecked = (serviceFields.workflows || []).includes(flow);
                return (
                  <button
                    key={flow}
                    type="button"
                    onClick={() => handleToggleArrayOption('workflows', flow)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{flow}
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

    // Save quotation record to persistent store for admin review
    const quotationPayload = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.category,
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
      `• Full Name: ${fullName}`,
      `• WhatsApp Contact: ${phone}`,
      email ? `• Email: ${email}` : null,
      company ? `• Company / Brand: ${company}` : null,
      ``,
      `*SELECTED SERVICE SPECIFICATION:*`,
      `• Service: ${service.name}`,
      `• Service ID: ${service.id}`,
      `• Category: ${service.category.toUpperCase()}`,
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
      `${description}`,
      ``,
      `----------------------------------------`,
      `*Submitted via DS Tech Dedicated Quotation Portal (RC 9550925)*`
    ].filter(Boolean);

    const fullMessage = messageLines.join('\n');
    const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(fullMessage)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
      setNotification({
        type: 'success',
        message: 'Your quotation request has been generated! Opening WhatsApp chat with our engineering desk...'
      });

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    }, 600);
  };

  const currentSlug = getServiceSlug(service);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Bar / Top Bar */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-orange-500" />
            <span>Back to Services</span>
          </button>

          <div className="flex items-center gap-2">
            <Logo size="xs" showText={true} />
          </div>
        </div>

        {/* Header Hero Title Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20">
              {service.category}
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase rounded-full border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck size={12} />
              SLA Guaranteed
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase font-serif text-[#000E32] dark:text-white tracking-tight leading-snug">
            {service.name}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
            {service.description}
          </p>

          {/* Quick Service Switching Tabs if user wants to switch service directly */}
          {allServices.length > 1 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Switch Service Quotation Route:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allServices.map((s) => {
                  const sSlug = getServiceSlug(s);
                  const isCurrent = s.id === service.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onNavigateToService && onNavigateToService(sSlug)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* In-App Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                notification.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  : notification.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
              ) : (
                <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={18} />
              )}
              <div className="flex-1 font-medium leading-relaxed">
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Quotation Form Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleSubmitQuotation} className="space-y-6">
            
            {/* 1. Client Contact Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <User size={14} className="text-orange-500" />
                1. Client Contact Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 812 345 6789"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. DS Tech Ventures Ltd"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Service-Specific Technical Scope */}
            {renderServiceSpecificFields()}

            {/* 3. Preferred Delivery Time Dropdown */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Clock size={14} className="text-orange-500" />
                2. Preferred Delivery Timeline
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  PREFERRED DELIVERY TIME *
                </label>
                <select
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="As soon as possible">As soon as possible</option>
                  <option value="Within 3–7 days">Within 3–7 days</option>
                  <option value="Within 1–2 weeks">Within 1–2 weeks</option>
                  <option value="Within 2–4 weeks">Within 2–4 weeks</option>
                  <option value="Within 1–2 months">Within 1–2 months</option>
                  <option value="Flexible — let's discuss">Flexible — let's discuss</option>
                  <option value="Custom timeline">Custom timeline</option>
                </select>

                {deliveryTimeline === 'Custom timeline' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
                    <input 
                      type="text"
                      value={customTimelineText}
                      onChange={(e) => setCustomTimelineText(e.target.value)}
                      placeholder="Specify custom timeline details or date requirements..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-orange-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </motion.div>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  These options represent your preferred timeline, subject to project review and confirmation by DS Tech.
                </p>
              </div>
            </div>

            {/* 4. Proposed Budget Field */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-500" />
                3. Proposed Investment
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  YOUR PROPOSED BUDGET (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-black font-mono text-sm">
                    ₦
                  </span>
                  <input
                    type="text"
                    value={formatNairaDisplay(proposedBudget)}
                    onChange={handleBudgetChange}
                    placeholder="Enter amount (e.g. 500,000)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Enter the amount you are comfortable investing. We will review your requirements and discuss a suitable solution.
                </p>
              </div>
            </div>

            {/* 5. Custom Scope & Requirements Description */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                Project Scope &amp; Specific Requirements *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail your goals, required deliverables, features, target audience, or specific preferences..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
              />
            </div>

            {/* 6. Collapsed Manual Payment Accordion */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/80 dark:bg-slate-950/80">
              <button
                type="button"
                onClick={() => setIsPaymentAccordionOpen(!isPaymentAccordionOpen)}
                aria-expanded={isPaymentAccordionOpen}
                aria-controls="manual-payment-accordion-content"
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <div className="flex items-center gap-3">
                  <MoniepointIcon size={24} />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      Manual Payment Instructions
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                        Moniepoint MFB
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Expand for direct corporate bank transfer details (Optional)
                    </p>
                  </div>
                </div>

                <ChevronDown 
                  size={18} 
                  className={`text-slate-400 transition-transform duration-300 ${isPaymentAccordionOpen ? 'rotate-180 text-orange-500' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {isPaymentAccordionOpen && (
                  <motion.div
                    id="manual-payment-accordion-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
                  >
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Making an advance payment is completely optional. If you prefer to make a direct transfer for your project, please use our official corporate receiving account below:
                    </p>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 font-mono">BANK NAME</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MoniepointIcon size={16} />
                          {COMPANY_BANK_NAME}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-b border-slate-200 dark:border-slate-800 py-2.5">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 font-mono block">ACCOUNT NUMBER</span>
                          <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">{COMPANY_BANK_ACCOUNT_NUMBER}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyBank}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {copiedBank ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          <span>{copiedBank ? 'Copied' : 'Copy Account'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">ACCOUNT NAME:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{COMPANY_BANK_ACCOUNT_NAME}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                        Amount Paid (Optional)
                      </label>
                      <input
                        type="text"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="e.g. 200,000"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 7. Action Button */}
            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <OfficialWhatsAppIcon size={20} animate={false} />
                <span>{isSubmitting ? 'Generating Quotation...' : 'Send Quotation Request via WhatsApp ➔'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
