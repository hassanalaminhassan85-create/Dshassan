import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, MessageSquare, CheckCircle2, ShieldCheck, 
  Sparkles, Calendar, Award, Phone, Mail, Clock, DollarSign, FileText, CreditCard,
  Building2, Globe, Link as LinkIcon, Check, Copy, Send, HelpCircle
} from 'lucide-react';
import { ServiceItem, parsePriceToNumeric } from '../lib/data';
import { resolveImageUrl, apiSaveServiceRequest, ServiceRequestRecord } from '../lib/api';
import { generateDynamicSvgUrl, getPolishedServiceImage, getEmergencyFallbackImage } from '../lib/mediaUtils';
import { LanguageCode } from '../lib/translations';
import { HOME_TRANSLATIONS } from '../lib/homeTranslations';
import { PaystackPayButton } from './PaystackMotionCheckout';

interface ServiceDetailViewProps {
  service: ServiceItem;
  language: LanguageCode;
  onBack: () => void;
  getServiceImage?: (svc: ServiceItem) => string;
  getCategoryIcon?: (category: string) => React.ReactNode;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({ service, language, onBack }) => {
  const agencyPhone = '2349023489111';

  // Bank transfer details
  const bankDetails = {
    bankName: 'Wema Bank',
    accountName: 'DS Tech & Digital Marketing Agency Limited',
    accountNumber: '9023489111'
  };

  // Form State (13 Comprehensive Fields)
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [expectedDeliverables, setExpectedDeliverables] = useState('');
  const [budgetRange, setBudgetRange] = useState('₦300,000 – ₦1,000,000');
  const [customBudget, setCustomBudget] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Payment Option State
  const [paymentPlan, setPaymentPlan] = useState<'quote_only' | '70_percent_upfront' | 'full'>('quote_only');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paystack' | 'consultation'>('bank_transfer');
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ServiceRequestRecord | null>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const mainContainer = document.querySelector('main') || document.getElementById('root');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [service.id]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const getHighlights = (category: string) => {
    switch (category) {
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
      case 'compliance':
        return [
          'CAC incorporation fast e-filing node submission',
          'SCUML anti-money laundering certifications guidance',
          'FIRS corporate tax registration (TIN) processing',
          '100% legal agent representation with 5-day delivery'
        ];
      default:
        return [
          'Custom high-performance workflow diagnostics',
          'West-African regional operational clearance audits',
          '1-on-1 strategic advisor oversight & progress updates',
          'Official registration clearance & digital licensing keys'
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

    const finalBudget = budgetRange === 'Custom Amount' ? (customBudget ? `Custom (₦${customBudget})` : 'Custom Budget') : budgetRange;

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
        budgetRange: finalBudget,
        completionDate,
        referenceLink,
        additionalNotes,
        paymentPlan,
        paymentMethod,
        paymentStatus: paymentPlan === 'quote_only' ? 'pending' : 'pending'
      });

      setSubmittedRecord(record);

      // WhatsApp format
      const waMsg = `*DS TECH AGENCY - OFFICIAL SERVICE BRIEF REQUEST*
*Ref Code:* ${record.referenceCode}

*Service:* ${service.name}
*Project Title:* ${projectTitle}

*Client Details:*
• Name: ${fullName}
• Company: ${company || 'N/A'}
• Email: ${email}
• Phone: ${phone}
• Country: ${country}

*Project Brief:*
${projectBrief}

*Deliverables:* ${expectedDeliverables || 'Standard Service Package'}
*Budget Range:* ${finalBudget}
*Target Date:* ${completionDate || 'Flexible'}
*Ref Link:* ${referenceLink || 'None'}

*Payment Option Selected:* ${paymentPlan === 'quote_only' ? 'Request Official Quote First' : paymentPlan === '70_percent_upfront' ? '70% Upfront Commitment Deposit' : 'Full Payment'}
${additionalNotes ? `\n*Additional Notes:*\n${additionalNotes}` : ''}

----------------------------------------
*Submitted via DS Tech Service Marketplace*`;

      const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(waMsg)}`;
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1200);

    } catch (err) {
      console.error('Failed to submit service brief:', err);
      alert('Something went wrong saving your brief. Please try again or message us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const highlights = getHighlights(service.category);
  const titleWords = (service.name || '').split(' ');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -15 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8 text-left text-slate-900 dark:text-slate-100"
    >
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors"
        type="button"
      >
        <ArrowLeft size={16} />
        <span>{language === 'zh' ? '返回服务目录' : 'Back to Service Catalogue'}</span>
      </button>

      {/* Hero Service Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-md">
        {/* Service Image */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[260px] lg:min-h-[340px] shadow-md bg-slate-950">
          <img 
            src={getPolishedServiceImage(service)} 
            alt={service.name} 
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const fallback = getEmergencyFallbackImage(service.category);
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-slate-950/95 backdrop-blur-md px-4 py-2 rounded-xl text-sm sm:text-base font-black text-white tracking-tight border border-orange-500/80 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-orange-400">{service.price}</span>
          </div>
        </div>

        {/* Core Content */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full inline-block border border-indigo-200/60 dark:border-indigo-800/60">
              {service.category} Service
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-slate-900 dark:text-white leading-tight tracking-tight">
              {service.name}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Service Highlights */}
          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <Award size={15} className="text-orange-500" />
              <span>Core Service Features & Deliverables</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2 items-start bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200 text-xs leading-snug font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('brief-form-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Send size={15} />
              <span>Fill Project Brief Form</span>
            </button>

            <button
              onClick={() => setShowBankInfo(!showBankInfo)}
              className="px-5 py-3 bg-slate-900 dark:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CreditCard size={15} className="text-emerald-400" />
              <span>{showBankInfo ? 'Hide Bank Details' : 'View Bank Transfer Info'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Bank Details Collapsible Card */}
      {showBankInfo && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-900 text-white rounded-3xl p-6 border border-emerald-500/40 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <Building2 size={18} />
              <span>Official Agency Bank Account Details</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Manual Transfer Option
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Payment is <strong>optional at the brief stage</strong>. If you wish to pay your deposit or project fee upfront via direct bank transfer, please use our verified company account below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block">Bank Name</span>
              <span className="text-sm font-bold text-white">{bankDetails.bankName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block">Account Name</span>
              <span className="text-sm font-bold text-white">{bankDetails.accountName}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block">Account Number</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono tracking-wider">{bankDetails.accountNumber}</span>
              </div>
              <button 
                type="button"
                onClick={handleCopyAccount}
                className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-xl transition-all border border-emerald-500/30"
                title="Copy Account Number"
              >
                {copiedAcc ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comprehensive 13-Field Service Request Form */}
      <div id="brief-form-section" className="bg-gradient-to-br from-[#020b1e] via-[#04122d] to-slate-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 border border-indigo-900/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          
          <div className="space-y-2 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-orange-400 text-xs uppercase tracking-widest font-black font-mono">
              <Sparkles size={16} className="animate-pulse text-amber-400" />
              <span>Dedicated Service Brief & Project Request Form</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white font-serif">
              Submit Your Requirements for {service.name}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal max-w-3xl">
              Complete the brief below with your specific business goals, scope, and timeline. Payment is <strong>optional</strong> at this stage — you may request an official proposal first or select an upfront deposit option.
            </p>
          </div>

          {submittedRecord ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-white">Service Brief Submitted Successfully!</h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
                Your request reference code is <span className="text-emerald-400 font-mono font-bold">{submittedRecord.referenceCode}</span>. Our engineering team and project manager have received your brief and will review it immediately.
              </p>

              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setSubmittedRecord(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Submit Another Request
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Return to Catalogue
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* SECTION 1: Client Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                  <span>1. Contact & Identity Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Field 1: Full Name */}
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
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Field 2: Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      Company / Organization (Optional)
                    </label>
                    <input 
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Global Ventures Ltd"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Field 3: Email */}
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
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Field 4: Phone Number */}
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
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono transition-colors"
                    />
                  </div>

                  {/* Field 5: Country */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      Country <span className="text-orange-400">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
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

                  {/* Field 6: Selected Service (Pre-filled Read-Only Display) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      Selected Service
                    </label>
                    <input 
                      type="text"
                      readOnly
                      value={service.name}
                      className="w-full bg-slate-950 border border-slate-800 text-orange-400 font-bold rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Project Specifications */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                  <span>2. Scope & Requirement Details</span>
                </h3>

                <div className="space-y-4">
                  {/* Field 7: Project Title */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Project Title / Working Name <span className="text-orange-400">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Corporate Rebranding & Multi-channel Performance Ads"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Field 8: Project Brief */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Project Brief & Overview <span className="text-orange-400">*</span>
                    </label>
                    <textarea 
                      required
                      rows={4}
                      value={projectBrief}
                      onChange={(e) => setProjectBrief(e.target.value)}
                      placeholder="Provide a concise overview of what you want us to build, market, or execute for your business..."
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  {/* Field 9: Expected Deliverables */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Expected Deliverables (Optional)
                    </label>
                    <input 
                      type="text"
                      value={expectedDeliverables}
                      onChange={(e) => setExpectedDeliverables(e.target.value)}
                      placeholder="e.g. Website source code, 5 short video ads, logo vector files..."
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Field 10: Budget Range */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Target Budget Range <span className="text-orange-400">*</span>
                      </label>
                      <select
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="₦100,000 – ₦300,000">₦100,000 – ₦300,000</option>
                        <option value="₦300,000 – ₦1,000,000">₦300,000 – ₦1,000,000</option>
                        <option value="₦1,000,000 – ₦5,000,000">₦1,000,000 – ₦5,000,000</option>
                        <option value="₦5,000,000+">₦5,000,000+ (Enterprise)</option>
                        <option value="Custom Amount">Custom Amount</option>
                      </select>
                      {budgetRange === 'Custom Amount' && (
                        <input 
                          type="text"
                          value={customBudget}
                          onChange={(e) => setCustomBudget(e.target.value)}
                          placeholder="Enter custom budget in ₦"
                          className="w-full mt-2 bg-slate-900 border border-orange-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Field 11: Completion Date */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Expected Completion Date
                      </label>
                      <input 
                        type="date"
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    {/* Field 12: Reference Link */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Reference Link / Inspiration URL
                      </label>
                      <input 
                        type="url"
                        value={referenceLink}
                        onChange={(e) => setReferenceLink(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Field 13: Additional Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Additional Notes or Special Instructions (Optional)
                    </label>
                    <textarea 
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any specific tech stack preferences, branding guidelines, or existing domain details..."
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Payment & Engagement Preferences */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                  <span>3. Payment & Engagement Preference</span>
                  <span className="text-[10px] text-slate-400 font-normal normal-case">(Payment is optional at initial brief submission)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentPlan('quote_only')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      paymentPlan === 'quote_only'
                        ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-xs uppercase tracking-wide">Request Official Quote First</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      We review your brief and send a detailed itemized quote before any payment.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPlan('70_percent_upfront')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      paymentPlan === '70_percent_upfront'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-xs uppercase tracking-wide">70% Upfront Retainer</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Commit with 70% upfront payment to fast-track immediate project start.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPlan('full')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      paymentPlan === 'full'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-xs uppercase tracking-wide">Full Payment</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Full upfront clearance with high-priority sprint execution and dedicated lead.
                    </p>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Brief recorded securely to agency database & WhatsApp channel</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Saving Brief...' : 'Submit Service Brief & Connect'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>

    </motion.div>
  );
};
