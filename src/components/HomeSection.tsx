import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, BarChart3, Users, Star, ArrowUpRight, 
  ChevronRight, Calendar, Heart, ShieldCheck, Mail, MessageSquare, Phone,
  Shield, Target, Smile, Briefcase, TrendingUp, Zap, Award, CheckCircle2,
  FileText, X, ExternalLink, Globe, ShoppingBag, Send, Layers
} from 'lucide-react';

import { SERVICES, TESTIMONIALS, ServiceItem } from '../lib/data';
import { COMPANY_CAC_RC_LABEL } from '../lib/companyConstants';
import { LanguageCode } from '../lib/translations';
import { HOME_TRANSLATIONS } from '../lib/homeTranslations';
import { CacTrustSection } from './CacTrustSection';
import { CustomQuoteModal } from './CustomQuoteModal';
import { resolveImageUrl, apiSubscribeToServices } from '../lib/api';
import { getPolishedServiceImage, getEmergencyFallbackImage } from '../lib/mediaUtils';
import { getServiceSlug } from '../lib/quoteUtils';

interface HomeSectionProps {
  onNavigate: (path: string) => void;
  onApplyForJob: (role?: string) => void;
  language: LanguageCode;
  onSelectService: (serviceId: string) => void;
  onOpenAppMenu?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ 
  onNavigate, 
  onApplyForJob, 
  language, 
  onSelectService,
  onOpenAppMenu
}) => {
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingService, setBookingService] = useState('Digital Marketing');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [isCacModalOpen, setIsCacModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Custom Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteModalService, setQuoteModalService] = useState<ServiceItem | null>(null);

  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  // Dynamic Realtime Services Sync with fresh image fallback
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('admin_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((svc: ServiceItem) => {
          if (!svc.image || svc.image.startsWith('data:image/svg+xml') || svc.image.includes('svg')) {
            return { ...svc, image: getPolishedServiceImage(svc) };
          }
          return svc;
        });
      }
      return SERVICES;
    } catch (e) {
      return SERVICES;
    }
  });

  useEffect(() => {
    const unsubscribe = apiSubscribeToServices((data) => {
      if (data && data.length > 0) {
        const cleaned = data.map((svc: ServiceItem) => {
          if (!svc.image || svc.image.startsWith('data:image/svg+xml') || svc.image.includes('svg')) {
            return { ...svc, image: getPolishedServiceImage(svc) };
          }
          return svc;
        });
        setServices(cleaned);
        localStorage.setItem('admin_services', JSON.stringify(cleaned));
      }
    });
    return () => unsubscribe();
  }, []);

  const t = HOME_TRANSLATIONS[language] || HOME_TRANSLATIONS.en;

  const features = [
    {
      title: t.missionTitle || 'End-to-End Execution',
      desc: t.missionDesc || 'From strategic blueprinting to high-scale digital rollout.',
      icon: <Target className="w-5 h-5 text-indigo-500" />
    },
    {
      title: t.visionTitle || 'Data-Driven ROI',
      desc: t.visionDesc || 'Transparent metrics, performance analytics, and lead optimization.',
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />
    },
    {
      title: t.whyBrandsTrust || 'CAC & Legal Compliance',
      desc: t.whyBrandsTrustSub || 'Incorporated agency providing verified corporate governance.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />
    }
  ];

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

  const filteredServices = services.filter(svc => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'web') return svc.category === 'web' || svc.category === 'software';
    if (activeCategory === 'marketing') return svc.category === 'marketing';
    if (activeCategory === 'ai') return svc.category === 'ai';
    if (activeCategory === 'branding') return svc.category === 'branding' || svc.category === 'ict';
    return true;
  });

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-12 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* 1. CLEAN AGENCY HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 text-left">
        <div className="space-y-5">
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white font-sans max-w-4xl">
            We Build Brands That <br className="hidden sm:block" />
            Lead <br />
            <span className="text-orange-500 dark:text-orange-400 font-italian-italic font-normal tracking-wide text-[1.08em] block sm:inline mt-1 sm:mt-0">
              and Scale.
            </span>
          </h1>

          {/* Premium Technology Hero Visual (Replacing Description Paragraph) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl relative group overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 dark:border-amber-500/30 bg-[#030d22] dark:bg-[#020817] shadow-[0_12px_36px_-10px_rgba(245,158,11,0.22)] dark:shadow-[0_16px_40px_-12px_rgba(245,158,11,0.25)] motion-reduce:transform-none motion-reduce:transition-none"
          >
            {/* Ambient orange-gold & tech-navy backlight highlights */}
            <div 
              aria-hidden="true" 
              className="absolute -top-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent blur-2xl pointer-events-none" 
            />
            <div 
              aria-hidden="true" 
              className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-indigo-600/15 blur-2xl pointer-events-none" 
            />

            {/* Responsive Sharp Hero Visual Frame */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              <img
                src="/assets/aistudio/file_00000000225c820ea8c78c7421d11c6a_af58dd55.png"
                alt="DS Tech Enterprise Technology, AI Automation, and Global Digital Marketing Visual"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform group-hover:scale-[1.015] transition-transform duration-700 ease-out motion-reduce:transform-none"
              />
              {/* Subtle edge scrim & orange-gold highlight ring */}
              <div 
                aria-hidden="true" 
                className="absolute inset-0 bg-gradient-to-t from-[#030d22]/50 via-transparent to-transparent pointer-events-none" 
              />
              <div 
                aria-hidden="true" 
                className="absolute inset-0 ring-1 ring-inset ring-amber-500/20 rounded-2xl sm:rounded-3xl pointer-events-none" 
              />
            </div>
          </motion.div>

          {/* Main Action CTAs: Explore Services, View Case Studies, Request Custom Quote */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('/services')}
              className="px-4.5 py-2.5 sm:px-5 sm:py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-orange-600"
            >
              <span>Explore Our Services</span>
              <ArrowRight size={15} className="text-white" />
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('/portfolio')}
              className="px-4.5 py-2.5 sm:px-5 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-900 dark:border-slate-700 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>View Case Studies</span>
              <ArrowUpRight size={15} className="text-slate-300 dark:text-slate-400" />
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setQuoteModalService(null);
                setIsQuoteModalOpen(true);
              }}
              className="px-4.5 py-2.5 sm:px-5 sm:py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
            >
              <MessageSquare size={15} className="text-slate-500 dark:text-slate-400" />
              <span>Request Custom Quote</span>
            </motion.button>
          </div>

        </div>
      </section>

      {/* 2. CORE SERVICE DISCOVERY CATALOGUE (NO DARK BOX CONTAINER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        


        {/* Category Pills Filter */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'All Core Services' },
            { id: 'web', label: 'Web & Mobile Apps' },
            { id: 'marketing', label: 'Ads & Digital Marketing' },
            { id: 'ai', label: 'AI & Automation' },
            { id: 'branding', label: 'Branding & ICT' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Core Services Responsive Grid (2 cols mobile, 3 tablet, 4 desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredServices.map((svc, idx) => {
            const slug = getServiceSlug(svc);
            return (
              <motion.div 
                key={svc.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => onNavigate(`/quote/${slug}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate(`/quote/${slug}`);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Explore ${svc.name} service and request quotation`}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <div>
                  <div className="relative h-36 sm:h-44 overflow-hidden bg-slate-950">
                    <img 
                      src={getPolishedServiceImage(svc)} 
                      alt={svc.name} 
                      decoding="async"
                      loading={idx < 4 ? "eager" : "lazy"}
                      fetchPriority={idx < 4 ? "high" : "auto"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = getEmergencyFallbackImage(svc.category, svc.id, svc.name);
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                        {svc.category}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                        Active
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight sm:leading-snug break-words group-hover:text-orange-500 transition-colors uppercase font-serif line-clamp-2">
                      {svc.name}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-2 font-normal">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 pt-0">
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-extrabold text-[#000E32] dark:text-orange-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-orange-500 transition-all">
                      <span>Explore Service</span>
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                      Quote Route
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* 3. ENTERPRISE CAC ACCREDITATION TRUST BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
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
                  {COMPANY_CAC_RC_LABEL}
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

      {/* 4. COMPANY OVERVIEW ("WHO WE ARE") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* 5. WHY CHOOSE US (3 CORE PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
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

      {/* Custom Quote Modal */}
      <CustomQuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
        initialService={quoteModalService} 
        allServices={services} 
        language={language} 
      />

      {/* 6. CAREERS PREVIEW GATEWAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
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
                <Globe size={13} className="text-orange-500" />
                <a href="https://www.dstechagency.com/" className="hover:text-orange-500 transition-colors">www.dstechagency.com</a>
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
