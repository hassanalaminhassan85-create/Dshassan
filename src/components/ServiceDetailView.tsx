import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, MessageSquare, CheckCircle2, ShieldCheck, 
  Sparkles, Calendar, Award, Phone, Mail, Clock, DollarSign, FileText, CreditCard
} from 'lucide-react';
import { ServiceItem, parsePriceToNumeric } from '../lib/data';
import { resolveImageUrl } from '../lib/api';
import { generateDynamicSvgUrl } from '../lib/mediaUtils';
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

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('₦300,000 - ₦1,000,000');
  const [customBudget, setCustomBudget] = useState('');
  const [timeline, setTimeline] = useState('Immediate (1-2 Weeks)');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const mainContainer = document.querySelector('main') || document.getElementById('root');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [service.id]);

  const t = HOME_TRANSLATIONS[language] || HOME_TRANSLATIONS.en;

  // Custom highlights based on category
  const getHighlights = (category: string) => {
    switch (category) {
      case 'marketing':
        return [
          language === 'zh' ? '全渠道广告投放与转化监测像素配置' : 'Full-funnel ad targeting & conversion pixel tracking',
          language === 'zh' ? '高点击率视频创意策划与文案撰写' : 'High-CTR video creatives & persuasive copywriting',
          language === 'zh' ? '每周多维度精准数据分析与ROI优化报告' : 'Weekly multi-dimensional reports & continuous ROI optimization',
          language === 'zh' ? '官方Meta与Google代理账户快速开通' : 'Direct Meta & Google agency ad-account onboarding'
        ];
      case 'web':
      case 'software':
        return [
          language === 'zh' ? '响应式移动端优先高精度页面排版' : 'Blazing-fast mobile-first responsive architecture',
          language === 'zh' ? '企业级双端数字加密签名及信息录入节点' : 'Enterprise dual digital encryption signatures',
          language === 'zh' ? '秒级数据库检索响应与安全后端部署' : 'Sub-second database query rendering & robust server API',
          language === 'zh' ? '12个月官方技术安全维护与升级服务保障' : '12-month security patch guarantees & tech maintenance'
        ];
      case 'ai':
        return [
          language === 'zh' ? '高智能大语言模型知识库本地微调与整合' : 'Intelligent LLM direct local knowledge fine-tuning',
          language === 'zh' ? 'WhatsApp及网页端自动客服聊天机器人搭建' : 'Automated WhatsApp & Web chatbot CRM deployment',
          language === 'zh' ? '语义相似度智能意图检索与精准工单路由' : 'Semantic intent mapping & immediate customer help desks',
          language === 'zh' ? '数据隐私完全隔离，确保企业机密不泄露' : 'Complete data privacy isolation & secure local keys encryption'
        ];
      case 'compliance':
        return [
          language === 'zh' ? 'CAC公司注册一站式快速电子档案归档' : 'CAC incorporation fast e-filing node submission',
          language === 'zh' ? 'SCUML反洗钱合规证书申请专项指导' : 'SCUML anti-money laundering certifications guidance',
          language === 'zh' ? 'FIRS企业税号与官方税收减免核验' : 'FIRS corporate tax registration (TIN) processing',
          language === 'zh' ? '100%全权代理，5个工作日内完成注册闭环' : '100% legal agent representation with 5-day delivery'
        ];
      default:
        return [
          language === 'zh' ? '专业商业模式可行性论证与流程设计' : 'Custom high-performance workflow diagnostics',
          language === 'zh' ? '西非及全球化运营资质核准协助' : 'West-African regional operational clearance audits',
          language === 'zh' ? '1对1专属高级项目经理策略推进跟进' : '1-on-1 strategic advisor oversight & progress updates',
          language === 'zh' ? '官方合规证书及多部门备案绿色通道' : 'Official registration clearance & digital licensing keys'
        ];
    }
  };

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    const finalBudget = budget === 'Custom Amount' ? (customBudget ? `Custom (₦${customBudget})` : 'Custom Budget') : budget;

    const message = `*DS TECH AGENCY - SERVICE INQUIRY & BRIEF*

*Service Name:* ${service.name}
*Price Range:* ${service.price}
*Category:* ${service.category}

*Client Name:* ${fullName}
*Phone/WhatsApp:* ${phone}
${email ? `*Email:* ${email}\n` : ''}*Target Budget:* ${finalBudget}
*Timeline:* ${timeline}

*Custom Description & Requirements:*
${notes || 'Client requested consultation for this service.'}

----------------------------------------
*Sent via DS Tech Digital Platform*`;

    const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(message)}`;
    
    setSubmitted(true);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setSubmitted(false);
    }, 1000);
  };

  const highlights = getHighlights(service.category);

  // Motion Font Word Variants for Title
  const titleWords = (service.name || '').split(' ');
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const wordVariants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 300, damping: 20 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 25 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -25 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-left text-slate-900 dark:text-slate-100"
    >
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-orange-500 transition-colors"
        type="button"
      >
        <ArrowLeft size={16} />
        <span>{language === 'zh' ? '返回上一页' : 'Back to Listings'}</span>
      </button>

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-md">
        {/* Service Image */}
        <div className="md:col-span-5 relative rounded-2xl overflow-hidden h-64 md:h-80 shadow-md bg-slate-950">
          <img 
            src={resolveImageUrl(service.image) || generateDynamicSvgUrl(service.name, service.category, "service")} 
            alt={service.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-orange-600 px-3.5 py-1 rounded-xl text-xs font-black text-white tracking-wider border border-orange-500 shadow-lg">
            {service.price}
          </div>
        </div>

        {/* Core Content */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full inline-block border border-indigo-200/50 dark:border-indigo-800/40">
              {service.category}
            </span>

            {/* Motion Font Staggered Title */}
            <motion.h1 
              variants={titleContainerVariants}
              initial="hidden"
              animate="visible"
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-slate-900 dark:text-white leading-tight flex flex-wrap gap-2 tracking-tight"
            >
              {titleWords.map((w, idx) => (
                <motion.span key={idx} variants={wordVariants} className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {w}
                </motion.span>
              ))}
            </motion.h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed font-normal">
              {service.description}
            </p>
          </div>

          {/* Deliverables / Highlights */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
            <h3 className="text-xs font-bold uppercase font-display tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={15} className="text-orange-500" />
              <span>{language === 'zh' ? '核心交付标准' : 'Core Service Highlights'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2.5 items-start bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200 text-xs sm:text-[13px] leading-snug font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Actions: WhatsApp Brief + High Motion Paystack Checkout */}
          <div className="flex flex-wrap gap-3 pt-2 items-center">
            <PaystackPayButton
              amount={parsePriceToNumeric(service.price, 30000)}
              email={email || 'client@dstech.agency'}
              customerName={fullName || 'Valued Client'}
              title={`Service Retainer: ${service.name}`}
              description={`30% Initial Retainer Deposit for ${service.name} (${service.category})`}
              metadata={{
                service_id: service.id,
                category: service.category
              }}
              variant="emerald"
            >
              <CreditCard size={15} />
              <span>{language === 'zh' ? '通过 Paystack 极速支付预付款' : 'Pay Deposit via Custom Paystack'}</span>
            </PaystackPayButton>

            <button
              onClick={() => {
                const el = document.getElementById('brief-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              <MessageSquare size={15} className="text-emerald-400" />
              <span>{language === 'zh' ? '在 WhatsApp 沟通提交需求' : 'Submit Custom Brief on WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking / Custom Brief Form Card */}
      <div id="brief-form" className="bg-gradient-to-br from-[#000E32] to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-indigo-950 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-orange-400 text-xs uppercase tracking-widest font-black flex items-center gap-1.5 font-mono">
              <Sparkles size={14} className="animate-pulse text-amber-400" />
              <span>{t.instantBookingSub}</span>
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold uppercase font-serif tracking-tight leading-tight text-white">
              Request Custom Brief & WhatsApp Consultation
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed font-medium max-w-2xl">
              Fill in your project specifics, custom budget range, and requirements below. Your brief will be formatted instantly and routed directly to our senior project lead on WhatsApp.
            </p>
          </div>

          <div>
            {submitted ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-extrabold text-white text-base uppercase tracking-wide">Opening WhatsApp...</h3>
                <p className="text-slate-300 text-xs font-light max-w-md mx-auto">
                  Your brief for <strong className="text-orange-400">{service.name}</strong> is pre-filled. You are being redirected to chat on WhatsApp.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSendToWhatsApp} className="space-y-5">
                
                {/* 1. Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1">
                      <Mail size={11} className="text-orange-400" />
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Hassan Al-Amin"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1">
                      <Phone size={11} className="text-emerald-400" />
                      WhatsApp Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +234 812 345 6789"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1">
                      <Mail size={11} className="text-indigo-400" />
                      Email Address (Optional)
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                {/* 2. Budget Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1">
                    <DollarSign size={11} className="text-emerald-400" />
                    Target Budget Range *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      '₦100,000 - ₦300,000',
                      '₦300,000 - ₦1,000,000',
                      '₦1,000,000 - ₦5,000,000',
                      'Custom Amount'
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBudget(opt)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center ${
                          budget === opt 
                            ? 'bg-orange-600 text-white border-orange-500 shadow-md' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {budget === 'Custom Amount' && (
                    <div className="pt-2">
                      <input 
                        type="text"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value)}
                        placeholder="Enter specific budget in ₦ (e.g., 850,000)"
                        className="w-full bg-slate-900 border border-orange-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Custom Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1">
                    <FileText size={11} className="text-orange-400" />
                    Custom Description & Specific Project Requirements
                  </label>
                  <textarea 
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us about key features, target timeline, branding preferences, or custom questions..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors leading-relaxed resize-none"
                  />
                </div>

                {/* Action Submit Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-orange-400" /> Instant WhatsApp Connect
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} className="text-indigo-400" /> Encrypted Direct Channel
                    </span>
                  </div>

                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-emerald-400/30"
                  >
                    <MessageSquare size={16} />
                    <span>Send Custom Brief to WhatsApp ➔</span>
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>
      </div>

    </motion.div>
  );
};
