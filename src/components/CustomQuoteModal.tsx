import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MessageSquare, Sparkles, CheckCircle2, 
  DollarSign, Clock, User, Phone, Mail, Building, FileText, 
  Layers, Copy, Check, Landmark
} from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { 
  COMPANY_BANK_NAME, 
  COMPANY_BANK_ACCOUNT_NUMBER, 
  COMPANY_BANK_ACCOUNT_NAME 
} from '../lib/companyConstants';

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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [budget, setBudget] = useState('₦300,000 - ₦1,000,000');
  const [customBudget, setCustomBudget] = useState('');
  const [timeline, setTimeline] = useState('Immediate (1-2 Weeks)');
  const [description, setDescription] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync initial service when modal opens or initialService changes
  useEffect(() => {
    if (initialService?.id) {
      setSelectedServiceId(initialService.id);
    }
  }, [initialService]);

  if (!isOpen) return null;

  const currentService = allServices.find(s => s.id === selectedServiceId) || initialService;
  const serviceTitle = currentService ? currentService.name : 'Custom Enterprise Project';
  const serviceCategory = currentService?.category || 'General';
  const servicePrice = currentService?.price || '₦100,000 – ₦1,000,000+';
  const serviceDeliverables = currentService?.deliverables && currentService.deliverables.length > 0
    ? currentService.deliverables
    : [
        'Dedicated Enterprise Architecture & Strategy',
        'Milestone-Based Execution & Quality Assurance Audits',
        'Official SLA Guarantee & Direct Engineering Handover'
      ];

  const budgetOptions = [
    '₦100,000 - ₦300,000',
    '₦300,000 - ₦1,000,000',
    '₦1,000,000 - ₦5,000,000',
    '₦5,000,000+',
    'Custom Amount'
  ];

  const timelineOptions = [
    'Immediate (1-2 Weeks)',
    'Within 1 Month',
    '2 - 3 Months',
    'Flexible Schedule'
  ];

  const handleCopyAccountNumber = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(COMPANY_BANK_ACCOUNT_NUMBER);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !description) {
      alert('Please fill in your name, WhatsApp phone number, and project description.');
      return;
    }

    const finalBudget = budget === 'Custom Amount' ? (customBudget ? `Custom (₦${customBudget})` : 'Custom Budget') : budget;
    const manualPaymentText = amountPaid.trim() ? `₦${amountPaid.trim()}` : 'Optional / Not paid yet (pay upon quotation review)';

    const message = `*DS TECH AGENCY - OFFICIAL SERVICE QUOTE & PROJECT BRIEF*

*CLIENT INFORMATION:*
• Full Name: ${fullName}
• WhatsApp Contact: ${phone}
${email ? `• Email: ${email}\n` : ''}${company ? `• Company / Brand: ${company}\n` : ''}
*SERVICE SPECIFICATION:*
• Target Service: ${serviceTitle}
• Category: ${serviceCategory.toUpperCase()}
• Official Price Guide: ${servicePrice}
• Target Budget: ${finalBudget}
• Project Timeline: ${timeline}
• Amount Paid (Optional): ${manualPaymentText}

*PAYMENT ACCOUNT REFERENCE:*
• Bank: ${COMPANY_BANK_NAME}
• Account Number: ${COMPANY_BANK_ACCOUNT_NUMBER}
• Account Name: ${COMPANY_BANK_ACCOUNT_NAME}

*CORE DELIVERABLES:*
${serviceDeliverables.map(d => `• ${d}`).join('\n')}

*CUSTOM PROJECT DESCRIPTION & SCOPE:*
${description}

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative my-auto text-left"
        >
          {/* Header with dual-mode palette */}
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-1.5 font-mono">
                  <Sparkles size={12} className="text-amber-500 animate-pulse" />
                  DS Tech Official Quote Request
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  SLA Guaranteed
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase font-serif text-slate-900 dark:text-white tracking-tight leading-tight">
                {serviceTitle}
              </h2>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-colors shrink-0 cursor-pointer"
              title="Close Quote Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-extrabold uppercase font-serif text-slate-900 dark:text-white">Connecting to WhatsApp...</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto font-medium">
                  Your customized project brief and quote docket have been compiled. Redirecting you to chat directly with our senior consultant on WhatsApp.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSendToWhatsApp} className="space-y-5">
                
                {/* 1. Official Quote Structure Overview Banner */}
                <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-200/60 dark:border-orange-900/40 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-orange-700 dark:text-orange-400">
                      <Layers size={14} />
                      <span>Quote Form Structure &amp; Pricing Matrix</span>
                    </div>
                    <span className="text-xs sm:text-sm font-black font-sans text-orange-600 dark:text-orange-400">
                      {servicePrice}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
                    <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Included Standard Deliverables:
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {serviceDeliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 2. Target Service Selector (if changing service) */}
                {allServices.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText size={12} className="text-orange-500" />
                      Target Service Catalog Selection
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                    >
                      {allServices.map((s) => (
                        <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {s.name} ({s.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Client Identity Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User size={12} className="text-orange-500" />
                      Client Full Name *
                    </label>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. David Solomon"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone size={12} className="text-emerald-500" />
                      WhatsApp Phone Number *
                    </label>
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +234 812 345 6789"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail size={12} className="text-indigo-500" />
                      Email Address (Optional)
                    </label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building size={12} className="text-amber-500" />
                      Company / Organization (Optional)
                    </label>
                    <input 
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. DS Tech Ventures Ltd"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 4. Target Project Budget Range */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-emerald-500" />
                    Target Project Budget Range *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {budgetOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBudget(opt)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all text-center cursor-pointer ${
                          budget === opt 
                            ? 'bg-orange-600 text-white border-orange-500 shadow-md scale-[1.02]' 
                            : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {budget === 'Custom Amount' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                      <input 
                        type="text"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value)}
                        placeholder="Enter specific budget in ₦ (e.g., 750,000)"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-orange-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none font-mono"
                      />
                    </motion.div>
                  )}
                </div>

                {/* 5. Execution Timeline */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock size={12} className="text-orange-500" />
                    Preferred Delivery Timeline
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timelineOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTimeline(opt)}
                        className={`px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          timeline === opt 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Custom Scope & Requirements Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText size={12} className="text-orange-500" />
                    Custom Requirements &amp; Project Description *
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specify project objectives, expected milestones, target audience, technical preferences, or custom requests..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
                  />
                </div>

                {/* 7. Manual Payment: Amount Paid Box (Optional) & Official Moniepoint Bank Details Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-4 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Manual Payment / Direct Bank Transfer (Optional)
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Optional to pay now or upon quote review
                    </span>
                  </div>

                  {/* Optional Amount Paid Input Box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <DollarSign size={12} className="text-emerald-500" />
                      Amount Paid (Optional - leave blank if not yet paid)
                    </label>
                    <input 
                      type="text"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="e.g. 50,000 (optional)"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors font-mono"
                    />
                  </div>

                  {/* Official Corporate Bank Account Card (Matching Exact Moniepoint Structure) */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Landmark size={14} className="text-blue-500 shrink-0" />
                        <span>Corporate Receiving Bank</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {COMPANY_BANK_NAME}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          ACCOUNT NUMBER
                        </div>
                        <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white tracking-wider">
                          {COMPANY_BANK_ACCOUNT_NUMBER}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAccountNumber}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                      >
                        {copiedBank ? (
                          <>
                            <Check size={13} className="text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Account Name:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{COMPANY_BANK_ACCOUNT_NAME}</span>
                    </div>
                  </div>
                </div>

                {/* 8. Action Footer: Send Quote to WhatsApp Button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>Send Quote to WhatsApp ➔</span>
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
