import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, MessageSquare, CheckCircle2, ShieldCheck, 
  Sparkles, Calendar, Award, Phone, Mail, Clock
} from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { HOME_TRANSLATIONS } from '../lib/homeTranslations';

interface ServiceDetailViewProps {
  service: ServiceItem;
  language: LanguageCode;
  onBack: () => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({ service, language, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setNotes('');
    }, 4000);
  };

  const highlights = getHighlights(service.category);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -30 }}
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
        <div className="md:col-span-5 relative rounded-2xl overflow-hidden h-64 md:h-80 shadow-md">
          <img 
            src={service.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"} 
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
            <span className="text-[10px] font-mono font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full inline-block">
              {service.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase font-serif text-[#000E32] dark:text-white leading-tight">
              {service.name}
            </h1>
            <p className="text-slate-950 dark:text-slate-50 text-xs md:text-sm leading-relaxed font-bold">
              {service.description}
            </p>
          </div>

          {/* Deliverables / Highlights */}
          <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-6">
            <h3 className="text-xs font-black uppercase font-serif tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={14} className="text-orange-500" />
              <span>{language === 'zh' ? '核心交付标准' : 'Core Service Highlights'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2.5 items-start">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-950 dark:text-slate-50 text-xs leading-tight font-black">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call-To-Action Options */}
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <MessageSquare size={15} />
              <span>{language === 'zh' ? '在 WhatsApp 沟通订制' : 'Inquire on WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="bg-gradient-to-br from-[#000E32] to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-indigo-950 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-5 space-y-4">
            <span className="text-orange-400 text-xs uppercase tracking-widest font-black flex items-center gap-1">
              <Sparkles size={12} className="animate-pulse" />
              <span>{t.instantBookingSub}</span>
            </span>
            <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight leading-tight">
              {t.instantBookingTitle}
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed font-light">
              {language === 'zh' 
                ? '立即提交您的项目大纲与联络信息，系统安全节点将即时指派专属合规经理与您建联。' 
                : 'Submit your requirements instantly. Our legal-compliant consulting team will contact you back with targeted pricing structures.'}
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-orange-500" />
                <span>Response in &lt; 15 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-indigo-400" />
                <span>100% Privacy Secure</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            {submitted ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wide">{t.bookSuccess}</h3>
                <p className="text-slate-300 text-[11px] font-light">
                  {language === 'zh' 
                    ? '我们的合规专员正在为您草拟专属合作方案。' 
                    : 'Our account manager is preparing custom deliverables proposal.'}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">{t.fullNameLabel}</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Hassan Al-Amin"
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">{t.emailLabel}</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                    {language === 'zh' ? '项目附言/具体需求' : 'Requirements Notes'}
                  </label>
                  <textarea 
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={language === 'zh' ? '告诉我们您的项目需求、预算或时间节点...' : 'Briefly describe your timeline, scope or regulatory clearance milestones...'}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>{t.bookBtn}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

    </motion.div>
  );
};
