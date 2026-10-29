import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MessageSquare, Sparkles, CheckCircle2, 
  DollarSign, Clock, User, Phone, Mail, Building, FileText, 
  Layers, Copy, Check, ChevronDown
} from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { 
  COMPANY_BANK_NAME, 
  COMPANY_BANK_ACCOUNT_NUMBER, 
  COMPANY_BANK_ACCOUNT_NAME 
} from '../lib/companyConstants';
import { MoniepointIcon } from './MoniepointIcon';

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

  if (!isOpen) return null;

  const currentService = allServices.find(s => s.id === selectedServiceId) || initialService;
  const serviceTitle = currentService ? currentService.name : 'Custom Enterprise Project';
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
• Full Name: ${fullName}
• WhatsApp Contact: ${phone}
${email ? `• Email: ${email}\n` : ''}${company ? `• Company / Brand: ${company}\n` : ''}
*SERVICE SPECIFICATION:*
• Target Service: ${serviceTitle}
• Category: ${serviceCategory.toUpperCase()}

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 dark:bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative my-auto text-left"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-1.5 font-mono">
                  <Sparkles size={12} className="text-amber-500 animate-pulse" />
                  DS Tech Official Quotation Request
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
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
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-colors shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              title="Close Quote Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
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
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto font-medium leading-relaxed">
                  Your customized project brief and quote docket have been compiled. Redirecting you to chat directly with our senior consultant on WhatsApp.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSendToWhatsApp} className="space-y-5">
                
                {/* 1. Target Service Selector (if selecting different service) */}
                {allServices.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
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
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2. Client Identity Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User size={12} className="text-orange-500" />
                      Full Name *
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

                {/* 3. YOUR PROPOSED BUDGET (₦) & PREFERRED DELIVERY TIME Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Proposed Budget Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <DollarSign size={12} className="text-emerald-500" />
                      YOUR PROPOSED BUDGET (₦)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 font-extrabold font-mono text-sm">
                        ₦
                      </span>
                      <input 
                        type="text"
                        value={formatNairaDisplay(proposedBudget)}
                        onChange={handleBudgetChange}
                        placeholder="e.g. 500,000"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      Enter the amount you are comfortable investing. We will review your requirements and discuss a suitable solution.
                    </p>
                  </div>

                  {/* Preferred Delivery Time Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock size={12} className="text-orange-500" />
                      PREFERRED DELIVERY TIME *
                    </label>
                    <select
                      value={deliveryTimeline}
                      onChange={(e) => setDeliveryTimeline(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
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
                          placeholder="Specify timeline requirements..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-orange-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </motion.div>
                    )}

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      These options represent your preferred timeline, subject to project review and confirmation by DS Tech.
                    </p>
                  </div>

                </div>

                {/* 4. Custom Requirements Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText size={12} className="text-orange-500" />
                    Custom Requirements &amp; Project Scope *
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

                {/* 5. Manual Payment Accordion (Collapsed by default) */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/70 dark:bg-slate-950/70">
                  <button
                    type="button"
                    onClick={() => setIsPaymentAccordionOpen(!isPaymentAccordionOpen)}
                    aria-expanded={isPaymentAccordionOpen}
                    aria-controls="modal-manual-payment-content"
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <div className="flex items-center gap-2.5">
                      <MoniepointIcon size={22} />
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>Manual Payment Instructions</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                            Moniepoint MFB
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          Direct bank transfer details (Optional)
                        </p>
                      </div>
                    </div>

                    <ChevronDown 
                      size={16} 
                      className={`text-slate-400 transition-transform duration-300 ${isPaymentAccordionOpen ? 'rotate-180 text-orange-500' : ''}`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isPaymentAccordionOpen && (
                      <motion.div
                        id="modal-manual-payment-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
                      >
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                          Payment is optional at the initial brief submission. If you wish to make a deposit or transfer upfront, please use our official corporate Moniepoint receiving account:
                        </p>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 font-mono">BANK NAME</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <MoniepointIcon size={14} />
                              {COMPANY_BANK_NAME}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-b border-slate-200/60 dark:border-slate-800/80 py-2">
                            <div>
                              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 font-mono block">ACCOUNT NUMBER</span>
                              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">{COMPANY_BANK_ACCOUNT_NUMBER}</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyAccountNumber}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              {copiedBank ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              <span>{copiedBank ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">ACCOUNT NAME:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{COMPANY_BANK_ACCOUNT_NAME}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Amount Paid (Optional - leave blank if not paid yet)
                          </label>
                          <input 
                            type="text"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            placeholder="e.g. 100,000"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 6. Action Footer */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare size={16} />
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
