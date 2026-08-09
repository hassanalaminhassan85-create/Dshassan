import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MessageSquare, Sparkles, CheckCircle2, 
  DollarSign, Clock, User, Phone, Mail, Building, FileText, ArrowRight, CreditCard
} from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { PaystackPayButton } from './PaystackMotionCheckout';

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
  const [submitted, setSubmitted] = useState(false);

  // Sync initial service when modal opens
  React.useEffect(() => {
    if (initialService) {
      setSelectedServiceId(initialService.id);
    }
  }, [initialService]);

  if (!isOpen) return null;

  const currentService = allServices.find(s => s.id === selectedServiceId) || initialService;
  const serviceTitle = currentService ? currentService.name : 'Custom Enterprise Project';

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

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !description) {
      alert('Please fill in your name, phone number, and custom description.');
      return;
    }

    const finalBudget = budget === 'Custom Amount' ? (customBudget ? `Custom (₦${customBudget})` : 'Custom Budget') : budget;

    const message = `*DS TECH AGENCY - CUSTOM SERVICE BRIEF & QUOTE REQUEST*

*Client Name:* ${fullName}
*Phone/WhatsApp:* ${phone}
${email ? `*Email:* ${email}\n` : ''}${company ? `*Company/Brand:* ${company}\n` : ''}
*Service Selected:* ${serviceTitle}
*Target Budget:* ${finalBudget}
*Preferred Timeline:* ${timeline}

*Custom Project Description & Requirements:*
${description}

----------------------------------------
*Sent via DS Tech Digital Platform*`;

    const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(message)}`;
    
    setSubmitted(true);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setSubmitted(false);
      onClose();
    }, 800);
  };

  // Motion Font Word Variant
  const titleWords = serviceTitle.split(' ');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };
  const wordVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 300, damping: 20 } }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative my-auto text-left"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#000E32] to-slate-900 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5 font-mono">
                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                DS Tech Custom Service Brief
              </span>
              
              {/* Motion Font Title */}
              <motion.h2 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-xl sm:text-2xl font-black uppercase font-serif text-white tracking-tight flex flex-wrap gap-1.5"
              >
                {titleWords.map((word, i) => (
                  <motion.span key={i} variants={wordVariants} className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    {word}
                  </motion.span>
                ))}
              </motion.h2>
            </div>

            <button 
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-extrabold uppercase font-serif text-white">Opening WhatsApp...</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto font-medium">
                  Your custom brief has been compiled and formatted. Redirecting you to chat directly with our senior consultant on WhatsApp.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSendToWhatsApp} className="space-y-5">
                
                {/* 1. Service Selection */}
                {allServices.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText size={12} className="text-orange-500" />
                      Select Target Service
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      {allServices.map((s) => (
                        <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                          {s.name} ({s.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2. Client Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User size={12} className="text-orange-500" />
                      Full Name *
                    </label>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Hassan Al-Amin"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Phone size={12} className="text-emerald-400" />
                      WhatsApp Phone Number *
                    </label>
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +234 812 345 6789"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Mail size={12} className="text-indigo-400" />
                      Email Address (Optional)
                    </label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building size={12} className="text-amber-400" />
                      Company / Brand Name (Optional)
                    </label>
                    <input 
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Tech Ltd"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Budget Range Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-emerald-400" />
                    Target Project Budget Range *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {budgetOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBudget(opt)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all text-center ${
                          budget === opt 
                            ? 'bg-orange-600 text-white border-orange-500 shadow-md scale-[1.02]' 
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
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
                        className="w-full bg-slate-950 border border-orange-500 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none font-mono"
                      />
                    </motion.div>
                  )}
                </div>

                {/* 4. Preferred Timeline */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock size={12} className="text-orange-400" />
                    Preferred Project Timeline
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timelineOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTimeline(opt)}
                        className={`px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          timeline === opt 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Custom Requirements & Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText size={12} className="text-orange-500" />
                    Custom Description & Specific Requirements *
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you need in detail: key features, goals, target audience, specific deliverables, or custom questions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
                  />
                </div>

                {/* Action Buttons: WhatsApp Brief + Custom Paystack Deposit */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <PaystackPayButton
                    amount={50000}
                    email={email || 'client@dstech.agency'}
                    customerName={fullName || 'Valued Client'}
                    phone={phone}
                    title={`Custom Project Deposit: ${serviceTitle}`}
                    description={`Initial Retainer Deposit for Custom Quote: ${serviceTitle}`}
                    variant="emerald"
                    className="w-full sm:w-auto"
                  >
                    <CreditCard size={15} />
                    <span>Pay ₦50,000 Deposit via Paystack</span>
                  </PaystackPayButton>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <MessageSquare size={16} className="text-emerald-400" />
                    <span>Send Brief to WhatsApp ➔</span>
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
