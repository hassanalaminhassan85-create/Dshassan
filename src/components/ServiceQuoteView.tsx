import React, { useState, useEffect, useMemo } from 'react';
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
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Website &amp; Web Platform Requirements</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Project Type</label>
              <select
                value={serviceFields.websiteType || 'Corporate Business Website'}
                onChange={(e) => updateSpecificField('websiteType', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Corporate Business Website">Corporate Business Website</option>
                <option value="E-Commerce Store & Payment Portal">E-Commerce Store &amp; Payment Portal</option>
                <option value="Conversion Landing Page">Conversion Landing Page</option>
                <option value="Personal / Professional Portfolio">Personal / Professional Portfolio</option>
                <option value="Custom Web Application / SaaS">Custom Web Application / SaaS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Estimated Page Count</label>
              <select
                value={serviceFields.pageCount || '1–5 Pages'}
                onChange={(e) => updateSpecificField('pageCount', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Single Page (Landing Page)">Single Page (Landing Page)</option>
                <option value="1–5 Pages">1–5 Pages</option>
                <option value="5–15 Pages">5–15 Pages</option>
                <option value="15+ Custom Portal Pages">15+ Custom Portal Pages</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
              Required Core Features (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
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
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Software &amp; Mobile App Architecture</span>
          </h4>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Target Platforms</label>
            <div className="flex flex-wrap gap-1.5">
              {['iOS Mobile App', 'Android Mobile App', 'Cross-Platform Mobile (iOS + Android)', 'Web App / SaaS Portal', 'Desktop Application'].map((plat) => {
                const isChecked = (serviceFields.platforms || []).includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handleToggleArrayOption('platforms', plat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
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
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Marketing &amp; Campaign Objectives</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Primary Campaign Objective</label>
              <select
                value={serviceFields.campaignObjective || 'Lead Generation'}
                onChange={(e) => updateSpecificField('campaignObjective', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Lead Generation & WhatsApp Enquiries">Lead Generation &amp; WhatsApp Enquiries</option>
                <option value="Direct Sales & E-Commerce Conversions">Direct Sales &amp; E-Commerce Conversions</option>
                <option value="Brand Awareness & Organic Outreach">Brand Awareness &amp; Organic Outreach</option>
                <option value="Search Engine Indexing & Ranking (SEO)">Search Engine Indexing &amp; Ranking (SEO)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Target Audience Location</label>
              <input
                type="text"
                value={serviceFields.targetLocation || 'Nigeria (Abuja / Lagos / Nationwide)'}
                onChange={(e) => updateSpecificField('targetLocation', e.target.value)}
                placeholder="e.g. Abuja & Lagos, or International"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'ai' || name.includes('ai') || name.includes('automation')) {
      return (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>AI &amp; Automation Preferences</span>
          </h4>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Primary Automation Workflows</label>
            <div className="flex flex-wrap gap-1.5">
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
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

    if (cat === 'training' || name.includes('training') || name.includes('consultancy') || name.includes('course')) {
      return (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Training &amp; Corporate Consultancy Specifications</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Delivery Format</label>
              <select
                value={serviceFields.trainingFormat || 'On-Site Corporate Workshop'}
                onChange={(e) => updateSpecificField('trainingFormat', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="On-Site Corporate Workshop">On-Site Corporate Workshop</option>
                <option value="Virtual Interactive Masterclass">Virtual Interactive Masterclass</option>
                <option value="1-on-1 Executive Mentorship">1-on-1 Executive Mentorship</option>
                <option value="Hybrid Intensive Bootcamp">Hybrid Intensive Bootcamp</option>
                <option value="Institutional Staff Accreditation">Institutional Staff Accreditation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Expected Cohort Size</label>
              <select
                value={serviceFields.cohortSize || 'Small Team (2–10 Attendees)'}
                onChange={(e) => updateSpecificField('cohortSize', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Individual Executive (1 Participant)">Individual Executive (1 Participant)</option>
                <option value="Small Team (2–10 Attendees)">Small Team (2–10 Attendees)</option>
                <option value="Department (10–30 Attendees)">Department (10–30 Attendees)</option>
                <option value="Enterprise / Institutional (30+ Attendees)">Enterprise / Institutional (30+ Attendees)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
              Focus Curricula &amp; Training Modules
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Full-Stack Web & Mobile Engineering',
                'AI Model Prompting & Workflow Automation',
                'Performance Ads (Meta & Google Ads)',
                'Executive Leadership & Boardroom Protocol',
                'Cybersecurity Hygiene & Data Protection',
                'Digital Graphic Branding & Content Design',
                'Agile Sprint & Project Governance'
              ].map((mod) => {
                const isChecked = (serviceFields.modules || []).includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => handleToggleArrayOption('modules', mod)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{mod}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'branding' || name.includes('brand') || name.includes('graphic') || name.includes('logo')) {
      return (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Branding &amp; Creative Deliverables</span>
          </h4>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Required Brand Assets</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Vector Master Logo & Iconography',
                'Comprehensive Brand Style Guide (Pantone/Fonts)',
                'Business Cards & Corporate Stationery',
                'Investor Pitch Deck & Corporate Brochure',
                'Social Media Templates & Banner Kit',
                'Product Packaging & 3D Mockups'
              ].map((item) => {
                const isChecked = (serviceFields.brandItems || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('brandItems', item)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'compliance' || name.includes('cac') || name.includes('scuml') || name.includes('tax')) {
      return (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Statutory Corporate Compliance &amp; CAC Scope</span>
          </h4>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Required Statutory Filings</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'CAC Limited Liability Incorporation (LTD)',
                'Business Name Registration (Enterprise)',
                'SCUML Anti-Money Laundering Certificate',
                'FIRS Corporate TIN & Tax Clearance Certificate',
                'Annual Statutory Returns Filing',
                'Trademark & Intellectual Property Registration'
              ].map((item) => {
                const isChecked = (serviceFields.complianceItems || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('complianceItems', item)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'ict' || name.includes('cyber') || name.includes('security') || name.includes('ict')) {
      return (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Security &amp; ICT Infrastructure Requirements</span>
          </h4>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Security &amp; IT Services</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Penetration Testing & Vulnerability Assessment',
                'SSL / TLS, Cloudflare WAF & DDoS Shield',
                'Smart CCTV & Biometric Access Installation',
                'Local Office Network & Firewall Setup',
                'Cloud Backup & Disaster Recovery Architecture',
                'Staff Cybersecurity Hygiene Workshop'
              ].map((item) => {
                const isChecked = (serviceFields.ictItems || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('ictItems', item)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (cat === 'business' || name.includes('business') || name.includes('project') || name.includes('plan')) {
      return (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={13} className="text-orange-500" />
            <span>Business Advisory &amp; Project Governance</span>
          </h4>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Scope of Advisory</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Investor-Ready Business Plan Document',
                '3-5 Year Comprehensive Financial Model',
                'Market Feasibility & Competitor Analysis',
                'Agile Project Sprint Governance',
                'Executive Customer Support Desk Setup'
              ].map((item) => {
                const isChecked = (serviceFields.businessItems || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleArrayOption('businessItems', item)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/60'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{item}
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

  const distinctServices = useMemo(() => {
    const seen = new Set<string>();
    return allServices.filter((s) => {
      const slug = getServiceSlug(s);
      const key = slug || (s.name || '').toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allServices]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased py-4 sm:py-6 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
        
        {/* Minimal Compact Navigation & Service Switcher */}
        <div className="flex items-center justify-between gap-3 px-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-500/50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} className="text-orange-500 shrink-0" />
            <span>Back to Services</span>
          </button>

          {distinctServices.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="service-switcher" className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline whitespace-nowrap">
                Service:
              </label>
              <div className="relative">
                <select
                  id="service-switcher"
                  value={getServiceSlug(service)}
                  onChange={(e) => onNavigateToService && onNavigateToService(e.target.value)}
                  className="appearance-none bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 shadow-xs cursor-pointer max-w-[200px] sm:max-w-[260px] truncate"
                >
                  {distinctServices.map((s) => (
                    <option key={s.id || getServiceSlug(s)} value={getServiceSlug(s)}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* In-App Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                notification.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  : notification.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertCircle className="shrink-0 text-red-500 mt-0.5" size={16} />
              ) : (
                <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={16} />
              )}
              <div className="flex-1 font-medium leading-relaxed">
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Compact Form Card */}
        <div className="bg-white dark:bg-slate-900/95 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-5">
          {/* Service Title & Scope Header */}
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                {service.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>Official Quotation</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck size={12} />
                SLA Guaranteed
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-[#000E32] dark:text-white tracking-tight">
              Request Quotation: {service.name}
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {service.description}
            </p>
          </div>

          <form onSubmit={handleSubmitQuotation} className="space-y-4 sm:space-y-5">
            
            {/* 1. Client Contact Details */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User size={13} className="text-orange-500" />
                <span>1. Client Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    WhatsApp Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 812 345 6789"
                    className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Email Address <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Company / Organization <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. DS Tech Ventures Ltd"
                    className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Service-Specific Technical Scope */}
            {renderServiceSpecificFields()}

            {/* 3. Delivery Timeline & Budget */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-orange-500" />
                <span>2. Delivery Timeline &amp; Proposed Budget</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Preferred Delivery Timeline <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryTimeline}
                    onChange={(e) => setDeliveryTimeline(e.target.value)}
                    className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 cursor-pointer transition-colors"
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
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="pt-1.5">
                      <input 
                        type="text"
                        value={customTimelineText}
                        onChange={(e) => setCustomTimelineText(e.target.value)}
                        placeholder="Specify target completion date or timeframe..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-orange-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Your Proposed Budget (₦) <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 font-bold font-mono text-xs">
                      ₦
                    </span>
                    <input
                      type="text"
                      value={formatNairaDisplay(proposedBudget)}
                      onChange={handleBudgetChange}
                      placeholder="e.g. 500,000"
                      className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Project Scope Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                Project Scope &amp; Deliverables <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail your goals, required deliverables, features, target audience, or specific preferences..."
                className="w-full bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
              />
            </div>

            {/* 5. Collapsed Manual Payment Accordion */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/60 dark:bg-slate-950/60">
              <button
                type="button"
                onClick={() => setIsPaymentAccordionOpen(!isPaymentAccordionOpen)}
                aria-expanded={isPaymentAccordionOpen}
                aria-controls="manual-payment-accordion-content"
                className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <MoniepointIcon size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>Direct Corporate Bank Transfer</span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        (Optional · Moniepoint MFB)
                      </span>
                    </h4>
                  </div>
                </div>

                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${isPaymentAccordionOpen ? 'rotate-180 text-orange-500' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {isPaymentAccordionOpen && (
                  <motion.div
                    id="manual-payment-accordion-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
                  >
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Making an advance payment is completely optional. If you prefer to make a direct transfer, please use our official corporate receiving account:
                    </p>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Bank Name</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MoniepointIcon size={14} />
                          {COMPANY_BANK_NAME}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-b border-slate-200 dark:border-slate-800 py-1.5">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Account Number</span>
                          <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">
                            {COMPANY_BANK_ACCOUNT_NUMBER}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyBank}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBank ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          <span>{copiedBank ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Account Name</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{COMPANY_BANK_ACCOUNT_NAME}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                        Amount Paid (₦) <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="e.g. 200,000"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Direct dispatch to DS TECH senior engineering desk.
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <OfficialWhatsAppIcon size={18} animate={false} />
                <span>{isSubmitting ? 'Preparing Quote...' : 'Submit Quote Request via WhatsApp ➔'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
