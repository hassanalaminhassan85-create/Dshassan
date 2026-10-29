import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, MessageSquare, CheckCircle2, ShieldCheck, 
  Sparkles, Calendar, Award, Phone, Mail, Clock, DollarSign, FileText,
  Building2, Globe, Link as LinkIcon, Check, Copy, Send, ChevronDown,
  Layers, User, MapPin
} from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { apiSaveServiceRequest, ServiceRequestRecord } from '../lib/api';
import { LanguageCode } from '../lib/translations';
import { 
  COMPANY_BANK_NAME, 
  COMPANY_BANK_ACCOUNT_NUMBER, 
  COMPANY_BANK_ACCOUNT_NAME 
} from '../lib/companyConstants';
import { MoniepointIcon } from './MoniepointIcon';

interface ServiceDetailViewProps {
  service: ServiceItem;
  language: LanguageCode;
  onBack: () => void;
  getServiceImage?: (svc: ServiceItem) => string;
  getCategoryIcon?: (category: string) => React.ReactNode;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({ 
  service, 
  language, 
  onBack 
}) => {
  const agencyPhone = '2349023489111';

  // Bank transfer details
  const bankDetails = {
    bankName: COMPANY_BANK_NAME,
    accountName: COMPANY_BANK_ACCOUNT_NAME,
    accountNumber: COMPANY_BANK_ACCOUNT_NUMBER
  };

  // Form State
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [expectedDeliverables, setExpectedDeliverables] = useState('');
  
  // Proposed Budget (Client defined, no predefined bands)
  const [proposedBudget, setProposedBudget] = useState('');
  
  // Preferred Delivery Time Dropdown State
  const [deliveryTimeline, setDeliveryTimeline] = useState('Within 1–2 weeks');
  const [customTimelineText, setCustomTimelineText] = useState('');

  const [referenceLink, setReferenceLink] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Manual Payment Accordion State (Collapsed by default)
  const [isPaymentAccordionOpen, setIsPaymentAccordionOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Engagement Preference
  const [paymentPlan, setPaymentPlan] = useState<'quote_only' | '70_percent_upfront' | 'full'>('quote_only');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ServiceRequestRecord | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const mainContainer = document.querySelector('main') || document.getElementById('root');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [service.id]);

  const handleCopyAccount = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    }
  };

  const formatNairaDisplay = (val: string) => {
    const rawDigits = val.replace(/[^\d]/g, '');
    if (!rawDigits) return '';
    return Number(rawDigits).toLocaleString('en-NG');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d]/g, '');
    setProposedBudget(rawVal);
  };

  const getDeliverableHighlights = (svc: ServiceItem) => {
    if (svc.deliverables && svc.deliverables.length > 0) {
      return svc.deliverables;
    }
    switch (svc.category) {
      case 'marketing':
        return [
          'Full-funnel ad targeting & conversion pixel tracking',
          'High-CTR video creatives & persuasive copywriting',
          'Weekly multi-dimensional reports & continuous ROI optimization',
          'Direct Meta & Google agency ad-account onboarding'
        ];
      case 'web':
      case 'software':
        return [
          'Blazing-fast mobile-first responsive architecture',
          'Enterprise dual digital encryption signatures',
          'Sub-second database query rendering & robust server API',
          '12-month security patch guarantees & tech maintenance'
        ];
      case 'ai':
        return [
          'Intelligent LLM direct local knowledge fine-tuning',
          'Automated WhatsApp & Web chatbot CRM deployment',
          'Semantic intent mapping & immediate customer help desks',
          'Complete data privacy isolation & secure local keys encryption'
        ];
      default:
        return [
          'Dedicated Enterprise Architecture & Strategy',
          'Milestone-Based Execution & Quality Assurance Audits',
          'Official SLA Guarantee & Direct Engineering Handover'
        ];
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !projectTitle || !projectBrief) {
      alert('Please fill in all required fields marked with (*).');
      return;
    }

    setIsSubmitting(true);

    const formattedBudget = proposedBudget 
      ? `₦${Number(proposedBudget).toLocaleString('en-NG')}` 
      : 'Open to Discussion';

    const finalDeliveryTime = deliveryTimeline === 'Custom timeline'
      ? (customTimelineText ? `Custom (${customTimelineText})` : 'Custom Timeline')
      : deliveryTimeline;

    const manualPaymentInfo = amountPaid.trim() 
      ? `₦${Number(amountPaid.replace(/[^\d]/g, '') || amountPaid).toLocaleString('en-NG')}` 
      : 'Optional / Not paid yet';

    try {
      const record = await apiSaveServiceRequest({
        serviceId: service.id,
        serviceName: service.name,
        fullName,
        company,
        email,
        phone,
        country,
        projectTitle,
        projectBrief,
        expectedDeliverables,
        budgetRange: formattedBudget,
        completionDate: finalDeliveryTime,
        referenceLink,
        additionalNotes,
        paymentPlan,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending'
      });

      setSubmittedRecord(record);

      // Format WhatsApp brief docket
      const waMsg = `*DS TECH AGENCY - OFFICIAL SERVICE QUOTATION REQUEST*
*Ref Code:* ${record.referenceCode}

*SERVICE SPECIFICATION:*
• Service: ${service.name}
• Category: ${(service.category || 'General').toUpperCase()}

*CLIENT CONTACT DETAILS:*
• Name: ${fullName}
• Company: ${company || 'N/A'}
• Email: ${email}
• Phone: ${phone}
• Country: ${country}

*PROJECT SCOPE & REQUIREMENTS:*
• Project Title: ${projectTitle}
• Brief Overview: ${projectBrief}
• Deliverables: ${expectedDeliverables || 'Standard Deliverables Package'}

*PROPOSED TERMS:*
• Client Proposed Budget: ${formattedBudget}
• Preferred Delivery Time: ${finalDeliveryTime}
• Manual Payment Status: ${manualPaymentInfo}
• Engagement Mode: ${paymentPlan === 'quote_only' ? 'Request Official Itemized Quote' : paymentPlan === '70_percent_upfront' ? '70% Upfront Retainer' : 'Full Payment Clearance'}
${referenceLink ? `• Reference Link: ${referenceLink}\n` : ''}${additionalNotes ? `• Additional Notes: ${additionalNotes}\n` : ''}
----------------------------------------
*Generated via DS Tech Marketplace (RC 9550925)*`;

      const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(waMsg)}`;
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);

    } catch (err) {
      console.error('Failed to submit quotation request:', err);
      alert('Something went wrong submitting your request. Please try again or message us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const highlights = getDeliverableHighlights(service);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 text-left text-slate-900 dark:text-slate-100"
    >
      {/* Top Navigation Back Action */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg px-2 py-1 -ml-2"
        type="button"
      >
        <ArrowLeft size={16} />
        <span>{language === 'zh' ? '返回服务目录' : 'Back to Service Catalogue'}</span>
      </button>

      {/* DEDICATED QUOTATION FORM CARD */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        
        <div className="space-y-2 border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-2 text-orange-400 text-xs uppercase tracking-widest font-black font-mono">
            <Sparkles size={15} className="text-amber-400 animate-pulse" />
            <span>EXECUTIVE PROJECT QUOTATION BRIEF</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white font-serif">
            Request Quotation for {service.name}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal max-w-3xl">
            Propose your investment budget and project timeline. Our engineering and marketing leads will evaluate your requirements and contact you with a customized solution.
          </p>
        </div>

        {submittedRecord ? (
          <motion.div 
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-white font-serif uppercase">Quotation Request Received!</h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Your reference code is <span className="text-emerald-400 font-mono font-bold">{submittedRecord.referenceCode}</span>. Our senior technical consultant has received your brief and will review your proposed budget and specifications immediately.
            </p>

            <div className="pt-3 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmittedRecord(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Submit Another Request
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Return to Catalogue
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* SECTION 1: Client Contact Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <span>1. Client Identity &amp; Contact Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    Full Name <span className="text-orange-400">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Samuel Adebayo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Company / Organization (Optional)
                  </label>
                  <input 
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Apex Global Ventures Ltd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    Email Address <span className="text-orange-400">*</span>
                  </label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. samuel@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    Phone / WhatsApp <span className="text-orange-400">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 802 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono transition-colors"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Other International">Other International</option>
                  </select>
                </div>

                {/* Selected Service (Read-Only Display) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Target Service
                  </label>
                  <input 
                    type="text"
                    readOnly
                    value={service.name}
                    className="w-full bg-slate-950/80 border border-slate-800 text-orange-400 font-extrabold rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Scope, Proposed Budget, & Delivery Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <span>2. Project Specifications &amp; Client Terms</span>
              </h3>

              <div className="space-y-4">
                {/* Project Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Project Title / Working Name <span className="text-orange-400">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Corporate Website Development & Multi-Channel Marketing"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Project Brief */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Project Brief &amp; Requirements <span className="text-orange-400">*</span>
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={projectBrief}
                    onChange={(e) => setProjectBrief(e.target.value)}
                    placeholder="Describe what you need built or executed, key objectives, target audience, and functional expectations..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
                  />
                </div>

                {/* Expected Deliverables */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Specific Expected Deliverables (Optional)
                  </label>
                  <input 
                    type="text"
                    value={expectedDeliverables}
                    onChange={(e) => setExpectedDeliverables(e.target.value)}
                    placeholder="e.g. Mobile web app, 10 social video ad creatives, SEO audit report..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Proposed Budget & Preferred Delivery Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* REQUIREMENT 4: YOUR PROPOSED BUDGET (₦) - Pure Client Proposed Numeric Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>YOUR PROPOSED BUDGET (₦)</span>
                      <span className="text-[10px] text-slate-500 font-normal font-sans">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 font-extrabold font-mono text-sm">
                        ₦
                      </span>
                      <input 
                        type="text"
                        value={formatNairaDisplay(proposedBudget)}
                        onChange={handleBudgetChange}
                        placeholder="e.g. 500,000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-white font-mono focus:outline-none transition-colors"
                      />
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-snug">
                      Enter the amount you are comfortable investing. We will review your requirements and discuss a suitable solution.
                    </p>
                  </div>

                  {/* REQUIREMENT 3: PREFERRED DELIVERY TIME - Select Control */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      PREFERRED DELIVERY TIME <span className="text-orange-400">*</span>
                    </label>
                    <select
                      value={deliveryTimeline}
                      onChange={(e) => setDeliveryTimeline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
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
                          placeholder="Specify custom timeline (e.g. Target launch Dec 15th)"
                          className="w-full bg-slate-950 border border-orange-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                        />
                      </motion.div>
                    )}

                    <p className="text-[10.5px] text-slate-400 leading-snug">
                      These options represent your preferred timeline, subject to project review and confirmation by DS Tech.
                    </p>
                  </div>

                </div>

                {/* Reference Link & Additional Notes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Reference Link / Inspiration URL
                    </label>
                    <input 
                      type="url"
                      value={referenceLink}
                      onChange={(e) => setReferenceLink(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Additional Notes or Special Instructions
                    </label>
                    <input 
                      type="text"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Tech stack preferences, existing domain info, etc."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* REQUIREMENT 5: MANUAL PAYMENT ACCORDION (Collapsed by Default with Moniepoint Official Icon) */}
            <div className="space-y-2 pt-2">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
                <button
                  type="button"
                  onClick={() => setIsPaymentAccordionOpen(!isPaymentAccordionOpen)}
                  aria-expanded={isPaymentAccordionOpen}
                  aria-controls="manual-payment-accordion-content"
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <div className="flex items-center gap-3">
                    <MoniepointIcon size={24} />
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <span>Manual Payment Instructions</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                          MONIEPOINT MFB
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal">
                        Direct company bank transfer guidance &amp; account details (Optional)
                      </p>
                    </div>
                  </div>

                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transition-transform duration-300 ${isPaymentAccordionOpen ? 'rotate-180 text-orange-400' : ''}`} 
                  />
                </button>

                <AnimatePresence>
                  {isPaymentAccordionOpen && (
                    <motion.div
                      id="manual-payment-accordion-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-4"
                    >
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        Payment is <strong>completely optional at the brief stage</strong>. If you wish to make a deposit or upfront retainer via direct bank transfer, please use our official corporate Moniepoint account below:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono block">Bank Name</span>
                          <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                            <MoniepointIcon size={16} />
                            {bankDetails.bankName}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono block">Account Name</span>
                          <span className="text-xs font-bold text-white block mt-0.5">{bankDetails.accountName}</span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-start gap-2">
                          <div>
                            <span className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono block">Account Number</span>
                            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono tracking-wider">{bankDetails.accountNumber}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={handleCopyAccount}
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-colors border border-emerald-500/30 cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedAcc ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Optional Amount Paid Input Box */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-300">
                          Amount Paid / Evidence Reference (Optional - leave blank if not paid yet)
                        </label>
                        <input 
                          type="text"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          placeholder="e.g. ₦100,000 or Transaction Ref"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* SECTION 3: Engagement Options & Submission */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono flex items-center gap-2 border-b border-slate-800 pb-2">
                <span>3. Engagement Preference &amp; Submission</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentPlan('quote_only')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentPlan === 'quote_only'
                      ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase tracking-wide">Request Itemized Quote</div>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                    Receive an official breakdown before any financial commitment.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentPlan('70_percent_upfront')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentPlan === '70_percent_upfront'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase tracking-wide">70% Upfront Retainer</div>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                    Commit deposit to fast-track immediate technical sprint.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentPlan('full')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentPlan === 'full'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase tracking-wide">Full Payment Clearance</div>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                    High-priority VIP execution with dedicated project lead.
                  </p>
                </button>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>Brief saved securely to database &amp; WhatsApp channel</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Saving Brief...' : 'Submit Quotation Request'}</span>
              </button>
            </div>

          </form>
        )}

      </div>

    </motion.div>
  );
};
