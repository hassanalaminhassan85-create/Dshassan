import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, BarChart3, Users, Star, ArrowUpRight, 
  ChevronRight, Calendar, Heart, ShieldCheck, Mail, MessageSquare, Phone,
  Shield, Target, Smile, Briefcase, TrendingUp, Zap, Award, CheckCircle2,
  FileText, X, ExternalLink
} from 'lucide-react';

const OrbitalVisualNode: React.FC = () => {
  return (
    <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] mx-auto flex items-center justify-center select-none pointer-events-none">
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/25 via-orange-500/20 to-transparent rounded-full filter blur-3xl opacity-80 animate-pulse" />

      {/* Orbit Ring 1 - Blue Outer Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[88%] h-[88%] rounded-full border border-blue-500/25 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      >
        <div className="absolute -top-1.5 left-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_12px_#3b82f6]" />
      </motion.div>

      {/* Orbit Ring 2 - Orange Middle Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="absolute w-[72%] h-[72%] rounded-full border border-orange-500/30 rotate-45 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
      >
        <div className="absolute -bottom-2 right-1/4 w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 shadow-[0_0_14px_#f97316]" />
      </motion.div>

      {/* Orbit Ring 3 - Inner Subtle Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute w-[56%] h-[56%] rounded-full border border-blue-400/30 -rotate-12"
      >
        <div className="absolute top-1/4 -left-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
      </motion.div>

      {/* Center Sphere Emblem */}
      <motion.div 
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-950/90 border-2 border-blue-500/60 shadow-[0_0_50px_rgba(37,99,235,0.4),inset_0_0_20px_rgba(249,115,22,0.25)] flex flex-col items-center justify-center text-center backdrop-blur-xl z-10"
      >
        <div className="absolute inset-1 rounded-full border border-orange-500/30 pointer-events-none" />
        <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white font-sans drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
          DS
        </span>
        <span className="text-[10px] sm:text-[11px] font-black tracking-[0.3em] text-slate-300 uppercase mt-0.5">
          TECH
        </span>
      </motion.div>
    </div>
  );
};

import { SERVICES, TESTIMONIALS, ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { HOME_TRANSLATIONS } from '../lib/homeTranslations';
import { CacTrustSection } from './CacTrustSection';
import { CustomQuoteModal } from './CustomQuoteModal';
import { resolveImageUrl, apiSubscribeToServices } from '../lib/api';

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

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('admin_services');
      return saved ? JSON.parse(saved) : SERVICES;
    } catch (e) {
      return SERVICES;
    }
  });

  const [quoteModalService, setQuoteModalService] = useState<any | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCacModalOpen, setIsCacModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = apiSubscribeToServices((fetchedServices) => {
      if (fetchedServices && fetchedServices.length > 0) {
        setServices(fetchedServices);
        localStorage.setItem('admin_services', JSON.stringify(fetchedServices));
      }
    });
    return () => unsubscribe();
  }, []);

  const t = HOME_TRANSLATIONS[language] || HOME_TRANSLATIONS.en;

  const getTranslatedFeatures = () => {
    switch (language) {
      case 'fr':
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-5 h-5" />,
            title: "Décisions Basées sur les Données",
            desc: "Chaque campagne, entonnoir de conversion et application est modélisé et optimisé pour un rendement maximal."
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-5 h-5" />,
            title: "100% Légal & Conforme",
            desc: "Nous relions le déploiement de logiciels aux autorisations d'entreprise (CAC, TIN, SCUML) pour une opération légale."
          },
          {
            icon: <Sparkles className="text-amber-500 w-5 h-5" />,
            title: "Intégrations d'IA de Nouvelle Génération",
            desc: "Déployez de manière autonome des systèmes intelligents Gemini, bots WhatsApp et enchères publicitaires."
          }
        ];
      case 'ha':
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-5 h-5" />,
            title: "Yanke Shawara Dangane da Bayanai",
            desc: "Kowane kamfen, hanyar canzawa, da aikace-aikace ana bin diddigin su don matsakaicin amfani."
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-5 h-5" />,
            title: "100% Halal & Masu Kiyaye Dokoki",
            desc: "Muna haɗa tura sassan software tare da izinin kamfanoni (CAC, TIN, SCUML) don aiki cikin izini."
          },
          {
            icon: <Sparkles className="text-amber-500 w-5 h-5" />,
            title: "Haɗin gwiwar AI Na Gaba",
            desc: "Tura tsarin Gemini mai hankali, bots na WhatsApp, da tsarin tallan talla ta atomatik."
          }
        ];
      default:
        return [
          {
            icon: <BarChart3 className="text-orange-500 w-5 h-5" />,
            title: "Data-Driven Decisions",
            desc: "Every campaign, conversion funnel, and application node is tracked, modeled, and optimized for maximum yield."
          },
          {
            icon: <ShieldCheck className="text-indigo-500 w-5 h-5" />,
            title: "100% Legal & Compliant",
            desc: "We bridge software deployment with corporate clearances (CAC, TIN, SCUML) so you operate fully authorized."
          },
          {
            icon: <Sparkles className="text-amber-500 w-5 h-5" />,
            title: "Next-Gen AI Integrations",
            desc: "Deploy smart Gemini-powered systems, custom WhatsApp bots, and programmatic ad flows autonomously."
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
      case 'zh':
        return [
          { value: "500+", label: "个成功商业项目" },
          { value: "98%", label: "真实客户满意度" },
          { value: "10+", label: "年行业深耕经验" },
          { value: "₦12亿+", label: "广告销售收益" }
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
    <div className="w-full space-y-12 sm:space-y-16 pb-12 animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#020817] text-white rounded-2xl sm:rounded-3xl mx-3 sm:mx-5 lg:mx-8 p-6 sm:p-8 lg:p-10 border border-slate-800/80 shadow-2xl mt-2">
        {/* Subtle Background Radial Lights */}
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-blue-600/15 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 -left-24 w-[350px] h-[350px] bg-orange-500/10 rounded-full filter blur-[100px] pointer-events-none" />

        {/* Top Split: Hero Content & Orbital Art */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-950/70 border border-blue-500/30 px-3 py-1 rounded-full shadow-inner">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-300 tracking-wider uppercase font-mono">
                {t.heroBadge || "DIGITAL EXCELLENCE. MEASURABLE IMPACT."}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white font-sans">
              {t.heroTitlePrefix || "We Build Brands That Lead"}{" "}
              <span className="text-orange-500 block sm:inline">
                {t.heroTitleSuffix || "and Scale."}
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-300/90 text-sm md:text-base leading-relaxed max-w-xl font-normal">
              {t.heroDesc}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('/services')}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>{t.exploreServices}</span>
                <ArrowRight size={15} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('/portfolio')}
                className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>{t.clientDashboard || "View Case Studies"}</span>
                <ArrowUpRight size={15} />
              </motion.button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 shrink-0">
                <Shield size={14} className="text-emerald-400" />
                <span className="text-[11px] text-slate-300 font-medium">
                  {t.trustedByTag || "Trusted across West Africa"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column Orbital Graphic */}
          <div className="lg:col-span-5 flex justify-center items-center py-2 lg:py-0">
            <OrbitalVisualNode />
          </div>
        </div>

        {/* Integrated Partner Logos & Statistics Bar */}
        <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Partner Brand Logos (Left 5 Cols) */}
          <div className="md:col-span-5 space-y-2 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              {t.brandsTrustText || "Trusted Technology & Media Partners"}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-slate-300 text-xs font-bold opacity-85">
              <span className="hover:text-white transition-colors">Meta</span>
              <span className="text-slate-600">•</span>
              <span className="hover:text-white transition-colors">Google Partner</span>
              <span className="text-slate-600">•</span>
              <span className="hover:text-white transition-colors">AWS</span>
              <span className="text-slate-600">•</span>
              <span className="hover:text-white transition-colors">Paystack</span>
            </div>
          </div>

          {/* Key Metrics Grid (Right 7 Cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
            {stats.map((st, i) => (
              <div key={i} className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans block">
                  {st.value}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight block">
                  {st.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. ENTERPRISE CAC ACCREDITATION TRUST BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 via-[#031338] to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  DS TECH & DIGITAL MARKETING LTD
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                  CAC RC: 7850720
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono font-bold">
                  TIN & SCUML VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Official Federal Corporate Registration & SCUML Anti-Money Laundering Security Clearance.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCacModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <FileText size={14} />
            <span>Inspect CAC Credentials</span>
          </button>
        </div>
      </section>

      {/* 3. COMPANY OVERVIEW ("WHO WE ARE") */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Mission & Vision */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
                <Heart size={13} className="text-indigo-500 animate-pulse" />
                <span>{t.whoWeAre}</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white uppercase font-serif tracking-tight">
                  {t.missionVisionTitle}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  {t.missionVisionDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Mission Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-indigo-500" />
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-serif">
                      {t.missionTitle}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {t.missionDesc}
                  </p>
                </div>

                {/* Vision Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-orange-500" />
                    <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-serif">
                      {t.visionTitle}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {t.visionDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: High-Tech Team Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60" 
                  alt="DS Tech Team" 
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-[280px] sm:h-[320px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 backdrop-blur-md bg-slate-950/85 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-left">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-orange-400 font-mono">Engineering & Growth Core</span>
                    <span className="block text-[10px] text-slate-300">Multi-Discipline Specialist Team</span>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (3 CORE PILLARS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-orange-500 text-[11px] font-extrabold uppercase tracking-widest font-mono">
            {t.whyBrandsTrustSub}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase font-serif tracking-tight">
            {t.whyBrandsTrust}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <div 
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-left flex flex-col justify-between hover:border-orange-500/50 transition-colors"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {feat.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif font-extrabold text-slate-900 dark:text-white text-base uppercase tracking-wide">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                <span>Verified Standard</span>
                <span className="text-orange-500">Pillar 0{i+1}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED SOLUTIONS PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-orange-500 text-[11px] uppercase tracking-widest font-extrabold font-mono flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              {t.featuredSolutionsSub}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase font-serif tracking-tight mt-1">
              {t.featuredSolutions}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQuoteModalService(null);
                setIsQuoteModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare size={13} />
              <span>Custom Quote</span>
            </button>

            <button 
              onClick={() => onNavigate('/services')}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-indigo-200/50 dark:border-indigo-900/50"
            >
              <span>{t.viewAllServicesBtn}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Top 3 Core Featured Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.slice(0, 3).map((svc) => (
            <div 
              key={svc.id}
              onClick={() => onSelectService(svc.id)}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-orange-500/80 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-40 overflow-hidden bg-slate-950">
                  <img 
                    src={resolveImageUrl(svc.image)} 
                    alt={svc.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/90 px-2.5 py-1 rounded-lg text-[9px] uppercase font-mono font-bold text-orange-400 border border-slate-800">
                    {svc.price}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] uppercase font-bold text-white border border-white/20">
                    {svc.category}
                  </div>
                </div>

                <div className="p-4 space-y-2 text-left">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-600 dark:text-indigo-400 font-extrabold block">
                    {svc.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-orange-500 transition-colors uppercase font-serif">
                    {svc.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-2">
                    {svc.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1">
                    <span>Learn Details ➔</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuoteModalService(svc);
                      setIsQuoteModalOpen(true);
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1"
                  >
                    <MessageSquare size={10} />
                    <span>Quote</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Quote Modal */}
      <CustomQuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
        initialService={quoteModalService} 
        allServices={services} 
        language={language} 
      />

      {/* 6. CAREERS PREVIEW GATEWAY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl border border-indigo-900/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-orange-400 text-[10px] uppercase tracking-widest font-extrabold font-mono">
              {t.joinTalentNodeSub}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-serif tracking-tight">
              {t.joinTalentNode}
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed font-light">
              {t.joinTalentNodeDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('/careers')}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.exploreRolesBtn}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 7. CLIENT TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-orange-500 text-[11px] uppercase tracking-widest font-extrabold font-mono">
            {t.verifiedSuccessStoriesSub}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase font-serif tracking-tight">
            {t.verifiedSuccessStories}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((tst) => (
            <div 
              key={tst.id} 
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[...Array(tst.rating)].map((_, i) => (
                    <Star key={i} size={12} className="fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic font-light">
                  "{tst.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <img 
                  src={tst.avatar} 
                  alt={tst.clientName} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block font-serif uppercase tracking-tight">
                    {tst.clientName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold leading-none">
                    {tst.role} • {tst.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CONSULTATION BOOKING CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-7 space-y-3">
            <span className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest font-extrabold font-mono">
              {t.instantBookingSub}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase font-serif tracking-tight">
              {t.instantBookingTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-normal">
              Submit your inquiry and our consultant manager will schedule a 30-minute strategic audit call.
            </p>
            <div className="space-y-1.5 pt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-orange-500" />
                <span>+234 902 348 9111</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-orange-500" />
                <span>dstechanddigitalmarketingltd@gmail.com</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="md:col-span-5 space-y-3 w-full">
            {bookingSubmitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 font-bold">✓</div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white block uppercase tracking-wide">
                  {t.bookSuccess}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Our manager will message your email within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {t.fullNameLabel}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. David Alao"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {t.emailLabel}
                  </label>
                  <input 
                    type="email" 
                    required
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="david@example.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {t.selectServiceLabel}
                  </label>
                  <select 
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Digital Marketing">Digital Marketing & Social Ads</option>
                    <option value="Web & Software">Website & Software Development</option>
                    <option value="AI Solutions">AI Chatbots & Automation</option>
                    <option value="CAC & Regulatory">CAC Legal Registration</option>
                    <option value="Consultancy">Enterprise Technology Consultancy</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>{t.bookBtn}</span>
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* CAC CERTIFICATE INSPECTION MODAL */}
      <AnimatePresence>
        {isCacModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setIsCacModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wide font-serif">
                    Official CAC Accreditation Credentials
                  </span>
                </div>
                <button
                  onClick={() => setIsCacModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                <CacTrustSection language={language} onBack={() => setIsCacModalOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
