import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, ArrowRight, BarChart3, Users, Star, ArrowUpRight, 
  ChevronRight, Calendar, Heart, ShieldCheck, Mail, MessageSquare, Phone
} from 'lucide-react';
import { SERVICES, TESTIMONIALS, PARTNERS } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { HOME_TRANSLATIONS } from '../lib/homeTranslations';

interface HomeSectionProps {
  onNavigate: (path: string) => void;
  onApplyForJob: (role?: string) => void;
  language: LanguageCode;
  onSelectService: (serviceId: string) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ 
  onNavigate, 
  onApplyForJob, 
  language, 
  onSelectService 
}) => {
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingService, setBookingService] = useState('Digital Marketing');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_services');
      return saved ? JSON.parse(saved) : SERVICES;
    } catch (e) {
      return SERVICES;
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('admin_services');
        if (saved) {
          setServices(JSON.parse(saved));
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = HOME_TRANSLATIONS[language] || HOME_TRANSLATIONS.en;

  // Translated features based on language
  const getTranslatedFeatures = () => {
    switch (language) {
      case 'fr':
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-6 h-6" />,
            title: "Décisions Basées sur les Données",
            desc: "Chaque campagne, entonnoir de conversion et nœud d'application est suivi, modélisé et optimisé pour un rendement maximal."
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-6 h-6" />,
            title: "100% Légal & Conforme",
            desc: "Nous relions le déploiement de logiciels aux autorisations d'entreprise (CAC, TIN, SCUML) afin que vous opériez en toute légalité."
          },
          {
            icon: <Sparkles className="text-amber-500 w-6 h-6" />,
            title: "Intégrations d'IA de Nouvelle Génération",
            desc: "Déployez de manière autonome des systèmes intelligents basés sur Gemini, des bots WhatsApp personnalisés et des flux d'enchères publicitaires programmatiques."
          }
        ];
      case 'ha':
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-6 h-6" />,
            title: "Yanke Shawara Dangane da Bayanai",
            desc: "Kowane kamfen, hanyar canzawa, da kumburin aikace-aikacen ana bin diddigin su, ƙirar su, da inganta su don matsakaicin amfanin gona."
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-6 h-6" />,
            title: "100% Halal & Masu Kiyaye Dokoki",
            desc: "Muna haɗa tura sassan software tare da izinin kamfanoni (CAC, TIN, SCUML) don ku gudanar da ayyukanku cikin cikakken izini."
          },
          {
            icon: <Sparkles className="text-amber-500 w-6 h-6" />,
            title: "Haɗin gwiwar AI Na Gaba",
            desc: "Tura tsarin Gemini mai hankali, bots na WhatsApp na al'ada, da tsarin tallan talla ta atomatik."
          }
        ];
      case 'yo':
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-6 h-6" />,
            title: "Awọn Ipinnu Ti O Da Lori Data",
            desc: "Gbogbo ipolongo, eefin iyipada, ati oju-iwe ohun elo jẹ titele, awoṣe, ati iṣapeye fun ikore ti o pọju."
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-6 h-6" />,
            title: "100% Ofin & Ibamu",
            desc: "A so imuṣiṣẹ sọfitiwia pẹlu awọn iyọọda ile-iṣẹ (CAC, TIN, SCUML) ki o le ṣiṣẹ pẹlu aṣẹ to ni aabo."
          },
          {
            icon: <Sparkles className="text-amber-500 w-6 h-6" />,
            title: "Awọn Iṣọkan AI Ti Akoko Tuntun",
            desc: "Mule awọn eto agbara Gemini smati, awọn bot WhatsApp ti adani, ati awọn ṣiṣan ipolowo oni-nọmba."
          }
        ];
      case 'zh':
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-6 h-6" />,
            title: "数据驱动决策",
            desc: "对每一个在线推广活动、转化漏斗和应用节点进行精确追踪与算法分析，确保ROI收益最大化。"
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-6 h-6" />,
            title: "100% 合规与合法准入",
            desc: "无缝对接尼日利亚合规企业监管（CAC 执照、FIRS 税号、SCUML 证书），确保商业运营完全合法。"
          },
          {
            icon: <Sparkles className="text-amber-500 w-6 h-6" />,
            title: "下一代生成式 AI 整合",
            desc: "自主编写和部署 Gemini 智能系统、WhatsApp 智能交互机器人以及广告实时自动竞价流程。"
          }
        ];
      default:
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-6 h-6" />,
            title: "Data-Driven Decisions",
            desc: "Every campaign, conversion funnel, and application node is tracked, modeled, and optimized for maximum yield."
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-6 h-6" />,
            title: "100% Legal & Compliant",
            desc: "We bridge software deployment with corporate clearances (CAC, TIN, SCUML) so you operate fully authorized."
          },
          {
            icon: <Sparkles className="text-amber-500 w-6 h-6" />,
            title: "Next-Gen AI Integrations",
            desc: "Deploy smart Gemini-powered systems, custom WhatsApp bots, and programmatic ad bid flows autonomously."
          }
        ];
    }
  };

  const getTranslatedStats = () => {
    switch (language) {
      case 'fr':
        return [
          { value: "500+", label: "Campagnes Réussies" },
          { value: "98%", label: "Satisfaction Client" },
          { value: "10+", label: "Ans d'Expérience" },
          { value: "₦1.2B+", label: "Revenus Publicitaires" }
        ];
      case 'ha':
        return [
          { value: "500+", label: "Kamfen Masu Nasara" },
          { value: "98%", label: "Abokan Ciniki Sun Gamsu" },
          { value: "10+", label: "Shekaru na Kwarewa" },
          { value: "₦1.2B+", label: "Kudaden Talla Da Aka Samu" }
        ];
      case 'yo':
        return [
          { value: "500+", label: "Awọn Ipolongo Aṣeyọri" },
          { value: "98%", label: "Itelorun Onibara" },
          { value: "10+", label: "Ọdun ti Iriri" },
          { value: "₦1.2B+", label: "Owo Ipolowo ti A Sọ Di Otitọ" }
        ];
      case 'zh':
        return [
          { value: "500+", label: "个成功商业活动" },
          { value: "98%", label: "真实客户满意度" },
          { value: "10+", label: "年行业深耕经验" },
          { value: "₦12亿+", label: "广告销售总收益" }
        ];
      default:
        return [
          { value: "500+", label: "Successful Campaigns" },
          { value: "98%", label: "Client Satisfaction" },
          { value: "10+", label: "Years Experience" },
          { value: "₦1.2B+", label: "Ad Revenue Generated" }
        ];
    }
  };

  const stats = getTranslatedStats();
  const features = getTranslatedFeatures();

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingEmail) return;
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setBookingName('');
      setBookingEmail('');
    }, 4000);
  };

  return (
    <div className="w-full space-y-20 pb-16 animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 text-white rounded-3xl mx-4 md:mx-6 p-6 md:p-12 lg:p-16 border border-indigo-950 shadow-2xl mt-4">
        {/* Animated Background Lights */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-orange-500/25 to-transparent rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[300px] h-[300px] bg-indigo-50/15 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6 text-left">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest shadow-inner">
            <Sparkles size={12} className="animate-pulse" />
            <span className="font-hand text-xs normal-case tracking-wide text-orange-200">{t.heroBadge}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none uppercase font-serif">
            {t.heroTitlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 font-extrabold italic">{t.heroTitleSuffix}</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-light">
            {t.heroDesc}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('/services')}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-orange-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.exploreServices}</span>
              <ArrowRight size={14} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('/client')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.clientDashboard}</span>
              <ArrowUpRight size={14} />
            </motion.button>
          </div>
        </div>

        {/* Statistics Counter */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 mt-12 border-t border-white/5">
          {stats.map((stat, i) => (
            <div key={i} className="text-left space-y-1">
              <span className="text-2xl md:text-3xl font-extrabold text-orange-400 block font-serif tracking-tight">{stat.value}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. PARTNERS (TRUST LOGOS) */}
      <section className="max-w-6xl mx-auto px-6 text-center space-y-6">
        <p className="text-slate-500 dark:text-slate-300 text-[10px] uppercase tracking-widest font-bold">
          {t.trustSubtitle}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-85">
          {PARTNERS.map((p) => (
            <div 
              key={p.id} 
              className="px-4 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span>{p.logo}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. COMPANY INTRODUCTION */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Heart size={12} />
            <span>{t.whoWeAre}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#000E32] dark:text-white uppercase font-serif tracking-tight leading-tight">
            {t.missionVisionTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed font-light">
            {t.missionVisionDesc}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 bg-indigo-50/45 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 rounded-2xl space-y-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400 font-serif">{t.missionTitle}</span>
              <p className="text-slate-500 dark:text-slate-300 text-xs leading-relaxed">
                {t.missionDesc}
              </p>
            </div>
            <div className="p-4 bg-orange-50/45 dark:bg-orange-950/20 border border-orange-100/30 dark:border-orange-900/30 rounded-2xl space-y-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-orange-600 dark:text-orange-400 font-serif">{t.visionTitle}</span>
              <p className="text-slate-500 dark:text-slate-300 text-xs leading-relaxed">
                {t.visionDesc}
              </p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-orange-500 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000" />
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60" 
            alt="DS Tech Team" 
            referrerPolicy="no-referrer"
            className="relative rounded-3xl object-cover w-full h-[320px] md:h-[400px] border border-slate-200 dark:border-slate-800 shadow-xl"
          />
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="bg-white dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800/40">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-orange-500 text-xs uppercase tracking-widest font-black">{t.whyBrandsTrustSub}</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#000E32] dark:text-white uppercase font-serif tracking-tight">
              {t.whyBrandsTrust}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.04,
                  borderColor: 'rgba(249, 115, 22, 0.45)',
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all space-y-4 text-left group cursor-pointer relative overflow-hidden"
              >
                {/* Modern AI Indicator Line on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-all duration-300">
                  {feat.icon}
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-mono tracking-widest text-orange-500 uppercase font-black block group-hover:animate-pulse">// INSTANT ACTION MATRIX</span>
                  <h3 className="font-extrabold text-[#000E32] dark:text-white text-sm uppercase tracking-wide font-serif">{feat.title}</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-300 text-xs leading-relaxed font-light">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED SERVICES PREVIEW */}
      <section className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="text-left space-y-3">
            <span className="text-orange-500 text-xs uppercase tracking-widest font-black">{t.featuredSolutionsSub}</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#000E32] dark:text-white uppercase font-serif tracking-tight">
              {t.featuredSolutions}
            </h2>
          </div>
          <button 
            onClick={() => onNavigate('/services')}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-indigo-100/50 dark:border-indigo-900/30"
          >
            <span>{t.viewAllServicesBtn}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.slice(0, 3).map((svc) => (
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectService(svc.id)}
              key={svc.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/40 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={svc.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"} 
                  alt={svc.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-[#000E32]/85 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] uppercase font-black text-orange-400 border border-white/5">
                  {svc.price}
                </div>
              </div>
              <div className="p-5 text-left flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-500 dark:text-indigo-400 font-bold block">{svc.category}</span>
                  <h3 className="font-extrabold text-[#000E32] dark:text-white text-sm line-clamp-1 group-hover:text-orange-500 transition-colors font-serif uppercase">{svc.name}</h3>
                  <p className="text-slate-500 dark:text-slate-300 text-xs leading-relaxed line-clamp-2">{svc.description}</p>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-orange-500 group-hover:underline">
                    {language === 'zh' ? '查看详情内容 →' : 'Learn Details →'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ID: {svc.id}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. CAREERS PREVIEW */}
      <section className="bg-gradient-to-br from-indigo-950 to-slate-950 text-white py-16 rounded-3xl mx-4 md:mx-6 border border-indigo-900 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="text-orange-400 text-xs uppercase tracking-widest font-black">{t.joinTalentNodeSub}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase font-serif tracking-tight leading-tight">
            {t.joinTalentNode}
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            {t.joinTalentNodeDesc}
          </p>

          <div className="flex justify-center gap-4 pt-2">
            <button 
              onClick={() => onNavigate('/careers')}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>{t.exploreRolesBtn}</span>
              <ChevronRight size={14} />
            </button>
            <button 
              onClick={() => onApplyForJob()}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              <span>{t.quickApplyBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. CLIENT TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-orange-500 text-xs uppercase tracking-widest font-black">{t.verifiedSuccessStoriesSub}</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#000E32] dark:text-white uppercase font-serif tracking-tight">
            {t.verifiedSuccessStories}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((tst, idx) => (
            <motion.div 
              key={tst.id} 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, type: "spring", stiffness: 280, damping: 20 }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                borderColor: 'rgba(249, 115, 22, 0.4)',
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden"
            >
              {/* Decorative AI verified badge */}
              <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Verified Match</span>
              </div>

              <div className="space-y-3">
                <div className="flex gap-1">
                  {[...Array(tst.rating)].map((_, i) => (
                    <Star key={i} size={13} className="fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic font-light pt-1">
                  "{tst.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <img 
                  src={tst.avatar} 
                  alt={tst.clientName} 
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-[#000E32] dark:text-white block font-serif uppercase tracking-tight">{tst.clientName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300 block font-bold leading-none">{tst.role} • {tst.company}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. CALL-TO-ACTION (CONSULTATION BOOKING) */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl border border-slate-200/40 dark:border-slate-800 shadow-lg text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="md:col-span-7 space-y-4">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-widest font-black">{t.instantBookingSub}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#000E32] dark:text-white uppercase font-serif tracking-tight">
              {t.instantBookingTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light">
              {language === 'zh' 
                ? '在线提交您的具体商务诉求，系统安全节点将分配专属客户经理，于15分钟内与您即时联系建联。' 
                : 'Submit your inquiry and our consultant manager will schedule a 30-minute strategic branding and tech audit call.'}
            </p>
            <div className="space-y-2 pt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-orange-500" />
                <span>+234 902 348 9111</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-orange-500" />
                <span>consult@dstech.example.com</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="md:col-span-5 space-y-3 relative z-10 w-full">
            {bookingSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl text-center space-y-2"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 font-bold">✓</div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white block uppercase tracking-wide">{t.bookSuccess}</span>
                <p className="text-slate-500 dark:text-slate-300 text-[10px] leading-relaxed">
                  {language === 'zh' ? '合规顾问正在快马加鞭为您定制方案，请保持通信畅通！' : 'Our manager will message your email within 24 hours.'}
                </p>
              </motion.div>
            ) : (
              <>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.fullNameLabel}</label>
                  <input 
                    type="text" 
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. David Alao"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.emailLabel}</label>
                  <input 
                    type="email" 
                    required
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="david@example.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.selectServiceLabel}</label>
                  <select 
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Digital Marketing">{language === 'zh' ? '数字营销与广告投放' : 'Digital Marketing & Social Ads'}</option>
                    <option value="Web & Software">{language === 'zh' ? '网站及应用软件开发' : 'Website & Software Development'}</option>
                    <option value="AI Solutions">{language === 'zh' ? 'AI 机器人及自动化流程' : 'AI Chatbots & Automation'}</option>
                    <option value="CAC & Regulatory">{language === 'zh' ? 'CAC 及企业税务合规' : 'CAC Legal Registration'}</option>
                    <option value="Consultancy">{language === 'zh' ? '企业级科技决策与咨询' : 'Enterprise Technology Consultancy'}</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Calendar size={13} />
                  <span>{t.bookBtn}</span>
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};
