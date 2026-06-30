import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CareersForm } from './components/CareersForm';
import { ApplicationView } from './components/ApplicationView';
import { AdminDashboard } from './components/AdminDashboard';
import { PremiumContactSection } from './components/PremiumContactSection';
import { UserDashboard } from './components/UserDashboard';

// Website Ecosystem Modules
import { HomeSection } from './components/HomeSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioSection } from './components/PortfolioSection';
import { BlogSection } from './components/BlogSection';
import { TrainingAcademySection } from './components/TrainingAcademySection';
import { ClientPortalSection } from './components/ClientPortalSection';
import { CareersSection } from './components/CareersSection';
import { JobApplication } from './types';
import { FileDown, Sparkles, Building2, ClipboardEdit, AlertCircle, Play, Heart, Send, Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, ArrowUp, Globe, ShieldAlert, Cpu, Palette, Sun, Moon, ChevronDown, Check, Search, Filter, Fingerprint } from 'lucide-react';
import { Logo } from './components/Logo';
import { apiGetApplication, apiSaveApplication, apiUpdateApplication } from './lib/storage';
import { CAREER_ROLES, CATEGORIES, CareerRole } from './lib/roles';
import { TRANSLATIONS, LANGUAGES, LanguageCode } from './lib/translations';
import { RolesCatalog } from './components/RolesCatalog';

const journeyStepsMap: Record<LanguageCode, { label: string; desc: string }[]> = {
  en: [
    { label: "Profile Registration", desc: "Submit contact details, educational achievements, work experiences, and reference details." },
    { label: "Electronic Verification", desc: "Designate guarantor credentials and approve declarations with secure signatures." },
    { label: "Instant Offer Issuance", desc: "Preview and sign your generated Appointment Letter immediately for campaign onboarding." }
  ],
  fr: [
    { label: "Enregistrement du Profil", desc: "Soumettez vos coordonnées, vos diplômes, vos expériences professionnelles et vos références." },
    { label: "Vérification Électronique", desc: "Désignez des garants et approuvez les déclarations avec des signatures sécurisées." },
    { label: "Émission d'Offre Instantanée", desc: "Visualisez et signez immédiatement votre lettre de nomination pour commencer." }
  ],
  ha: [
    { label: "Rijistar Bayanan Kanka", desc: "Aika bayanan tuntuɓi, matakin karatu, ayyukan baya, da bayanan shaidu." },
    { label: "Tabbatarwa ta Lantarki", desc: "Sanya bayanan lamuni da amincewa da bayanin kansa tare da sa hannu na lantarki." },
    { label: "Fitar da Wasiƙar Nadin Aiki", desc: "Duba kuma sanya hannu a kan wasiƙar naɗin aiki nan take don fara aiki." }
  ],
  yo: [
    { label: "Iforukọsilẹ Profaili", desc: "Fi awọn alaye olubasọrọ rẹ, awọn aṣeyọri ẹkọ, awọn iriri iṣẹ, ati awọn alaye itọkasi silẹ." },
    { label: "Ijẹrisi Itanna", desc: "Pinnu awọn alaye onigbọwọ rẹ ki o fọwọsi awọn ikede pẹlu awọn ibuwọlu to ni aabo." },
    { label: "Ipinfunni Lẹsẹkẹsẹ", desc: "Wo ati forukọsilẹ lẹsẹkẹsẹ lẹta ipinnu rẹ lati bẹrẹ iṣẹ rẹ." }
  ],
  es: [
    { label: "Registro de Perfil", desc: "Envíe sus datos de contacto, logros educativos, experiencias laborales y referencias." },
    { label: "Verificación Electrónica", desc: "Designe garantes y apruebe las declaraciones con firmas electrónicas seguras." },
    { label: "Emisión de Oferta Instantánea", desc: "Previsualice y firme inmediatamente su carta de nombramiento oficial para comenzar." }
  ],
  ar: [
    { label: "تسجيل الملف الشخصي", desc: "تقديم تفاصيل الاتصال، الإنجازات التعليمية، الخبرات المهنية وتفاصيل المراجع الرسمية." },
    { label: "التحقق الإلكتروني الآمن", desc: "تحديد بيانات الضامن والموافقة على الإقرارات الرسمية باستخدام توقيعات إلكترونية آمنة." },
    { label: "إصدار قرار التعيين الفوري", desc: "معاينة وتوقيع خطاب التعيين الرسمي الصادر فوراً للانضمام إلى حملاتنا الاستقطابية." }
  ],
  de: [
    { label: "Profilregistrierung", desc: "Geben Sie Kontaktdaten, Bildungsweg, Berufserfahrung und Referenzen an." },
    { label: "Elektronische Verifizierung", desc: "Benennen Sie Bürgen und stimmen Sie den Erklärungen mit sicheren Unterschriften zu." },
    { label: "Sofortige Vertragsausgabe", desc: "Prüfen und unterschreiben Sie Ihr offizielles Ernennungsschreiben sofort, um zu beginnen." }
  ],
  ru: [
    { label: "Регистрация профиля", desc: "Укажите контактные данные, образование, опыт работы и информацию о рекомендациях." },
    { label: "Электронная верификация", desc: "Укажите поручителей и подтвердите заявления безопасными электронными подписями." },
    { label: "Мгновенное предложение", desc: "Просмотрите и подпишите официальное письмо о назначении для быстрого начала работы." }
  ],
  pt: [
    { label: "Registro do Perfil", desc: "Envie seus dados de contato, conquistas educacionais, experiências de trabalho e referências." },
    { label: "Verificação Eletrônica", desc: "Designe fiadores e aprove as declarações com assinaturas eletrônicas seguras." },
    { label: "Emissão de Oferta Instantânea", desc: "Visualize e assine imediatamente sua carta de nomeação oficial para integração rápida." }
  ],
  zh: [
    { label: "提交个人档案", desc: "提交完整的联系方式、教育背景经历、工作实践经验以及推荐证明人信息。" },
    { label: "官方电子核验", desc: "指定合规的担保人凭证，并使用安全数字签名签署确认个人声明条款。" },
    { label: "即时录用签约", desc: "在线预览并签署系统实时生成的正式录用聘书，完成签约并即刻入职上岗。" }
  ]
};

const navMenuTranslations: Record<LanguageCode, { label: string; value: string }[]> = {
  en: [
    { label: "Home", value: "home" },
    { label: "About", value: "about" },
    { label: "Services", value: "services" },
    { label: "Portfolio", value: "portfolio" },
    { label: "Blog", value: "blog" },
    { label: "Academy", value: "training" },
    { label: "Clients", value: "clients" },
    { label: "Careers", value: "careers" }
  ],
  fr: [
    { label: "Accueil", value: "home" },
    { label: "À Propos", value: "about" },
    { label: "Services", value: "services" },
    { label: "Portfolio", value: "portfolio" },
    { label: "Blog", value: "blog" },
    { label: "Académie", value: "training" },
    { label: "Clients", value: "clients" },
    { label: "Carrières", value: "careers" }
  ],
  ha: [
    { label: "Gida", value: "home" },
    { label: "Game da Mu", value: "about" },
    { label: "Ayyuka", value: "services" },
    { label: "Ayyukan Baya", value: "portfolio" },
    { label: "Blog", value: "blog" },
    { label: "Makaranta", value: "training" },
    { label: "Abokan Ciniki", value: "clients" },
    { label: "Ayyuka Buɗe", value: "careers" }
  ],
  yo: [
    { label: "Ile", value: "home" },
    { label: "Nipa Wa", value: "about" },
    { label: "Awọn iṣẹ", value: "services" },
    { label: "Awọn iṣẹ Atijọ", value: "portfolio" },
    { label: "Blog", value: "blog" },
    { label: "Ile-ẹkọ", value: "training" },
    { label: "Awọn alabara", value: "clients" },
    { label: "Iṣẹ-ṣiṣe", value: "careers" }
  ],
  es: [
    { label: "Inicio", value: "home" },
    { label: "Nosotros", value: "about" },
    { label: "Servicios", value: "services" },
    { label: "Portafolio", value: "portfolio" },
    { label: "Blog", value: "blog" },
    { label: "Academia", value: "training" },
    { label: "Clientes", value: "clients" },
    { label: "Carreras", value: "careers" }
  ],
  ar: [
    { label: "الرئيسية", value: "home" },
    { label: "من نحن", value: "about" },
    { label: "خدماتنا", value: "services" },
    { label: "أعمالنا", value: "portfolio" },
    { label: "المدونة", value: "blog" },
    { label: "الأكاديمية", value: "training" },
    { label: "العملاء", value: "clients" },
    { label: "الوظائف", value: "careers" }
  ],
  de: [
    { label: "Startseite", value: "home" },
    { label: "Über Uns", value: "about" },
    { label: "Dienste", value: "services" },
    { label: "Portfolio", value: "portfolio" },
    { label: "Blog", value: "blog" },
    { label: "Akademie", value: "training" },
    { label: "Kunden", value: "clients" },
    { label: "Karriere", value: "careers" }
  ],
  ru: [
    { label: "Главная", value: "home" },
    { label: "О нас", value: "about" },
    { label: "Услуги", value: "services" },
    { label: "Портфолио", value: "portfolio" },
    { label: "Блог", value: "blog" },
    { label: "Академия", value: "training" },
    { label: "Клиенты", value: "clients" },
    { label: "Вакансии", value: "careers" }
  ],
  pt: [
    { label: "Início", value: "home" },
    { label: "Sobre Nós", value: "about" },
    { label: "Serviços", value: "services" },
    { label: "Portfólio", value: "portfolio" },
    { label: "Blog", value: "blog" },
    { label: "Academia", value: "training" },
    { label: "Clientes", value: "clients" },
    { label: "Carreiras", value: "careers" }
  ],
  zh: [
    { label: "首页", value: "home" },
    { label: "关于我们", value: "about" },
    { label: "核心业务", value: "services" },
    { label: "成功案例", value: "portfolio" },
    { label: "博客资讯", value: "blog" },
    { label: "培训学院", value: "training" },
    { label: "客户门户", value: "clients" },
    { label: "人才招聘", value: "careers" }
  ]
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>('');

  // Active website ecosystem page routing state
  const [activePage, setActivePage] = useState<'home' | 'about' | 'services' | 'portfolio' | 'blog' | 'training' | 'clients' | 'careers' | 'account'>('home');

  // Interactive 2027 App Shell full-screen state
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);

  // Settings & Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      return (localStorage.getItem('language') as LanguageCode) || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Catalog Filters
  const [roleSearch, setRoleSearch] = useState('');
  const [roleCategory, setRoleCategory] = useState<string>('all');

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on page shift and reset service details selection
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSelectedServiceId(null);
  }, [activePage]);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  // Sync language
  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (e) {}
  }, [language]);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideDesktop = !desktopLangRef.current || !desktopLangRef.current.contains(event.target as Node);
      const clickedOutsideMobile = !mobileLangRef.current || !mobileLangRef.current.contains(event.target as Node);
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = TRANSLATIONS[language];

  // Initialize path from window.location
  useEffect(() => {
    try {
      setCurrentPath(window.location.pathname || '/');
    } catch (e) {
      setCurrentPath('/');
    }
  }, []);

  // Instant snap scroll to top to prevent dizziness on navigation transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTo({ top: 0, behavior: 'auto' });
    document.body.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPath, activePage, currentAppId, isAdminView, isApplying]);

  // Dynamic Routing Handler
  useEffect(() => {
    const handleRoute = async () => {
      const path = currentPath;

      if (path === '/admin') {
        setIsAdminView(true);
        setCurrentAppId(null);
        setApplication(null);
        setIsApplying(false);
        return;
      } else {
        setIsAdminView(false);
      }

      // Check for /application/:id pattern
      const appMatch = path.match(/^\/application\/([\w\-]+)/);
      if (appMatch && appMatch[1]) {
        const id = appMatch[1];
        setCurrentAppId(id);
        setLoading(true);
        setErrorMsg(null);
        try {
          const data = await apiGetApplication(id);
          setApplication(data);
          setIsApplying(false);
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to read document metadata.');
        } finally {
          setLoading(false);
        }
      } else {
        // Root page and other custom pages - resets application view
        setCurrentAppId(null);
        setApplication(null);

        // Sub-pages matching path to activePage state
        if (path === '/' || path === '/home') {
          setActivePage('home');
        } else if (path === '/about') {
          setActivePage('about');
        } else if (path === '/services') {
          setActivePage('services');
        } else if (path === '/portfolio') {
          setActivePage('portfolio');
        } else if (path === '/blog') {
          setActivePage('blog');
        } else if (path === '/training') {
          setActivePage('training');
        } else if (path === '/clients') {
          setActivePage('clients');
        } else if (path === '/careers') {
          setActivePage('careers');
        } else if (path === '/account') {
          setActivePage('account');
        }
      }
    };

    handleRoute();
  }, [currentPath]);

  // Sync state on back/forward browser history changes
  useEffect(() => {
    const handlePopState = () => {
      try {
        setCurrentPath(window.location.pathname || '/');
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sandbox-safe pushState wrapper
  const safeNavigate = (path: string) => {
    try {
      window.history.pushState(null, '', path);
    } catch (e) {
      console.warn('History pushState is disabled or restricted in this environment:', e);
    }
    setCurrentPath(path);
  };

  // Submit Application Form Action handler
  const handleFormSubmit = async (formData: Omit<JobApplication, 'id' | 'createdAt'>) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const savedApp = await apiSaveApplication(formData);
      setApplication(savedApp);
      setCurrentAppId(savedApp.id);
      
      // Update browser URL silently without reloading to activate `/application/:id` path
      safeNavigate(`/application/${savedApp.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update contract acceptance (e.g., signing the offer letters and account routes)
  const handleUpdateApplication = async (id: string, updatedFields: Partial<JobApplication>) => {
    setSubmitting(true);
    try {
      const updatedApp = await apiUpdateApplication(id, updatedFields);
      setApplication(updatedApp);
    } catch (err: any) {
      console.error('Failed to update contract agreements:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Seeding Demonstration Handler to let developers/reviewers view a completed document instantly!
  const loadDemoSeed = () => {
    safeNavigate(`/application/seed-hassan-demo`);
  };

  const navigateToRoot = () => {
    safeNavigate('/');
  };

  const navigateToAdmin = () => {
    safeNavigate('/admin');
  };

  const isAtRoot = !currentAppId && !isAdminView && !application;
  const isFormFilling = isAtRoot && isApplying;

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300"
    >
      {/* Upper Navigation Header Bar */}
      {!isAdminView && !isUserLoggedIn && activePage !== 'account' && (
        <header className="no-print bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-indigo-100/50 dark:border-slate-800 sticky top-0 z-50 shadow-sm px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col lg:flex-row gap-3 lg:gap-4 justify-between items-center transition-colors duration-300 animate-fade-in">
          
          {/* Logo Container and Mobile Controls (Language + Theme + Menu Toggle) */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-2">
            <div className="flex items-center gap-2 cursor-pointer max-w-[50%] xs:max-w-[60%] sm:max-w-[70%] overflow-hidden shrink" onClick={navigateToRoot}>
              <Logo size="sm" showText={true} className="max-w-full" variant={theme === 'dark' ? 'light' : 'dark'} />
            </div>
            
            {/* Mobile Buttons Group (Language Dropdown, Theme Toggle, Three Branded Dots) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Language Selector */}
              <div className="relative lg:hidden" ref={mobileLangRef}>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/40 dark:border-slate-700/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  type="button"
                >
                  <motion.div
                    animate={isLangDropdownOpen ? { rotate: 360, scale: 1.2 } : { rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <Globe size={13} className="text-indigo-500" />
                  </motion.div>
                  <span className="text-[10px] font-mono uppercase font-black">{language}</span>
                  <ChevronDown size={9} className={`text-slate-400 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>
                
                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, y: -25, rotateX: -30, rotateY: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.75, y: -20, rotateX: -20, rotateY: 10 }}
                      transition={{ type: "spring", stiffness: 450, damping: 14, mass: 0.8 }}
                      className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 origin-top-right"
                    >
                      {LANGUAGES.map((lang, idx) => (
                        <motion.button
                          key={lang.code}
                          initial={{ opacity: 0, x: -30, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 12 }}
                          whileHover={{ x: 6, scale: 1.05, backgroundColor: 'rgba(249, 115, 22, 0.08)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                            language === lang.code
                              ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                          }`}
                          type="button"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs">{lang.flag}</span>
                            <span className="text-[11px]">{lang.label}</span>
                          </span>
                          {language === lang.code && (
                            <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 600, damping: 10 }}>
                              <Check size={11} className="text-orange-500" />
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Theme Toggle Button with High Modern Motion */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.85, rotate: -30 }}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="lg:hidden relative p-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/60 shadow-md flex items-center justify-center cursor-pointer"
                type="button"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {/* Dynamic colored background flare */}
                <motion.div 
                  className="absolute inset-0 opacity-10 bg-gradient-to-tr from-amber-400 to-orange-500 dark:from-indigo-500 dark:to-purple-600"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'light' ? (
                    <motion.div
                      key="sun-mobile"
                      initial={{ scale: 0, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: 180, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Sun size={14} className="text-amber-500 fill-amber-500 drop-shadow-md" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon-mobile"
                      initial={{ scale: 0, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: 180, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Moon size={14} className="text-indigo-400 fill-indigo-400 drop-shadow-md" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Custom Modern "Three Slash Dots" Menu Button - Branded with DS Tech Logo motifs */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="lg:hidden flex items-center justify-center p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all border border-slate-200/40 dark:border-slate-700/50 shadow-sm"
                title="Toggle Menu"
              >
                <div className="flex items-center gap-1.5 px-1 py-0.5">
                  {/* Dot 1: Miniature Orange Arc Orb */}
                  <motion.div
                    className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0"
                    animate={isMobileMenuOpen 
                      ? { rotate: 360, scale: [1, 1.15, 1] }
                      : { y: [0, -4, 0] }
                    }
                    transition={isMobileMenuOpen
                      ? { rotate: { repeat: Infinity, duration: 2.5, ease: "linear" }, scale: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }
                      : { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0 }
                    }
                  >
                    <div className="absolute inset-0 rounded-full border-1.5 border-orange-500 border-t-transparent animate-spin-slow" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                  </motion.div>

                  {/* Dot 2: Branded Blue Shield with Mini White 'DS' monogram */}
                  <motion.div
                    className="relative w-4 h-4 rounded-full bg-[#000E32] border border-blue-400/80 flex items-center justify-center shrink-0 shadow-md overflow-hidden"
                    animate={isMobileMenuOpen
                      ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] }
                      : { y: [0, -4, 0] }
                    }
                    transition={isMobileMenuOpen
                      ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
                      : { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }
                    }
                  >
                    <span className="text-[7px] font-black tracking-tighter text-white font-sans scale-90 leading-none select-none">
                      DS
                    </span>
                  </motion.div>

                  {/* Dot 3: Miniature Glowing Amber Diamond Crown */}
                  <motion.div
                    className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0"
                    animate={isMobileMenuOpen
                      ? { y: [0, -3, 0], scale: [1, 1.15, 1] }
                      : { y: [0, -4, 0] }
                    }
                    transition={isMobileMenuOpen
                      ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
                      : { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                    }
                  >
                    <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 drop-shadow-sm" fill="none">
                      <path 
                        d="M 6 1 L 9.5 4.5 L 6 8 L 2.5 4.5 Z" 
                        fill="#FBBF24" 
                        stroke="#EA580C" 
                        strokeWidth="0.8" 
                      />
                      <path d="M 2.5 4.5 L 9.5 4.5" stroke="#EA580C" strokeWidth="0.8" />
                      <path d="M 6 1 L 6 8" stroke="#EA580C" strokeWidth="0.5" />
                    </svg>
                  </motion.div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Responsive Desktop Ecosystem Navigation Menu */}
          <nav className="hidden lg:flex items-center lg:w-auto gap-2">
            <div className="flex items-center gap-1 xl:gap-2">
              {navMenuTranslations[language as LanguageCode].map((item, idx) => {
                const isActive = activePage === item.value;
                return (
                  <motion.button
                    key={item.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => safeNavigate(item.value === 'home' ? '/' : `/${item.value}`)}
                    className={`relative px-3 py-1.5 text-xs font-extrabold rounded-xl transition-colors duration-300 cursor-pointer select-none`}
                    style={{ color: isActive ? '#FFFFFF' : 'inherit' }}
                    type="button"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBackground"
                        className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl shadow-lg shadow-orange-500/20 z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                      {item.label}
                      {item.value === 'careers' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Desktop-Only Action Widgets Row */}
          <div className="hidden lg:flex items-center gap-2.5 sm:gap-3">
            
            {/* Animated Language Toggle with High Motion */}
            <div className="relative" ref={desktopLangRef}>
              <motion.button
                whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                type="button"
              >
                <motion.div
                  animate={isLangDropdownOpen ? { rotate: 360, scale: 1.25 } : { rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 10 }}
                >
                  <Globe size={13} className="text-indigo-500" />
                </motion.div>
                <span>{LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.label}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: -25, rotateX: -30, rotateY: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.75, y: -20, rotateX: -20, rotateY: 10 }}
                    transition={{ type: "spring", stiffness: 450, damping: 14, mass: 0.8 }}
                    className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 origin-top-right"
                  >
                    <div className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-slate-500 px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                      Select Language
                    </div>
                    {LANGUAGES.map((lang, idx) => (
                      <motion.button
                        key={lang.code}
                        initial={{ opacity: 0, x: -30, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 12 }}
                        whileHover={{ x: 6, scale: 1.05, backgroundColor: 'rgba(249, 115, 22, 0.08)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                          language === lang.code
                            ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                        }`}
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {language === lang.code && (
                          <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 600, damping: 10 }}>
                            <Check size={12} className="text-orange-500" />
                          </motion.span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Animated Dark/Light Sliding Toggle with dynamic gradient background */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1 w-16 h-9 rounded-full flex items-center relative cursor-pointer shadow-lg overflow-hidden border border-slate-200/60 dark:border-slate-700/80 transition-colors duration-500"
              type="button"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {/* Dynamic Sliding Gradient Background */}
              <motion.div 
                className="absolute inset-0 w-[200%] h-full flex"
                animate={{ x: theme === 'light' ? '0%' : '-50%' }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              >
                <div className="w-1/2 h-full bg-gradient-to-r from-amber-200 via-sky-200 to-sky-300" />
                <div className="w-1/2 h-full bg-gradient-to-r from-indigo-950 via-slate-900 to-[#000E32]" />
              </motion.div>

              {/* Glowing orbs inside the toggle background */}
              <div className="absolute inset-y-0 left-2.5 flex items-center opacity-60 pointer-events-none">
                <Sun size={10} className="text-amber-600" />
              </div>
              <div className="absolute inset-y-0 right-2.5 flex items-center opacity-60 pointer-events-none">
                <Moon size={10} className="text-indigo-300" />
              </div>

              {/* Elastic Slider Thumb */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md border border-slate-200/20 z-10"
                animate={{ x: theme === 'light' ? 0 : '26px' }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'light' ? (
                    <motion.div
                      key="sun-desk"
                      initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Sun size={13} className="text-amber-500 fill-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon-desk"
                      initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Moon size={13} className="text-indigo-400 fill-indigo-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-750 mx-0.5" />

            {/* Admin Suite Toggle */}
            {isAdminView ? (
              <button
                onClick={navigateToRoot}
                type="button"
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm"
              >
                <ClipboardEdit size={12} className="text-orange-600" />
                <span>{t.portalTitle}</span>
              </button>
            ) : (
              <button
                onClick={navigateToAdmin}
                type="button"
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-[#000E32] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm"
              >
                <ShieldAlert size={12} className="text-orange-600 animate-pulse" />
                <span>{t.adminTitle}</span>
              </button>
            )}

            <button
              onClick={() => safeNavigate('/account')}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm border ${
                activePage === 'account'
                  ? 'bg-gradient-to-r from-orange-600 to-indigo-600 text-white border-transparent'
                  : 'bg-indigo-50/50 hover:bg-indigo-100/60 dark:bg-slate-800 dark:hover:bg-slate-700 border-indigo-100/50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Fingerprint size={12} className={activePage === 'account' ? 'text-white' : 'text-orange-500'} />
              <span>Candidate Hub (2026)</span>
            </button>

            {!currentAppId && !isAdminView && !isApplying && (
              <button
                onClick={loadDemoSeed}
                type="button"
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 hover:text-orange-800 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm border border-orange-100 dark:border-orange-900"
              >
                <Play size={12} className="fill-current text-orange-600" />
                {t.demoAutofill}
              </button>
            )}

            {currentAppId && !isAdminView && (
              <button
                onClick={navigateToRoot}
                type="button"
                className="px-3.5 py-1.5 bg-[#000E32] dark:bg-orange-600 dark:hover:bg-orange-500 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-blue-900/10"
              >
                <ClipboardEdit size={12} />
                {t.applyAccreditation}
              </button>
            )}
          </div>

          {/* Mobile Collapsible Menu Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className="lg:hidden w-full overflow-hidden border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col gap-4 py-4"
              >
                {/* Navigation Links List */}
                <div className="flex flex-col gap-1 px-2">
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 px-3 py-1 font-mono">NAVIGATION</span>
                  {navMenuTranslations[language as LanguageCode].map((item, idx) => {
                    const isActive = activePage === item.value;
                    return (
                      <motion.button
                        key={item.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                        whileHover={{ x: 6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          safeNavigate(item.value === 'home' ? '/' : `/${item.value}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`relative w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between overflow-hidden`}
                        type="button"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeMobileNavBackground"
                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 z-0"
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          />
                        )}
                        <span className={`relative z-10 ${isActive ? 'text-white font-black' : 'text-slate-700 dark:text-slate-300'}`}>{item.label}</span>
                        {item.value === 'careers' && (
                          <span className="relative z-10 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4" />

                {/* Mobile System Utilities Block */}
                <div className="flex flex-col gap-3 px-4">
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 py-1 font-mono">SYSTEM CONTROLS</span>


                  {/* Portals and Seed Helper buttons */}
                  <div className="flex flex-col gap-2 mt-1">
                    {isAdminView ? (
                      <button
                        onClick={() => {
                          navigateToRoot();
                          setIsMobileMenuOpen(false);
                        }}
                        type="button"
                        className="w-full justify-center py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <ClipboardEdit size={12} className="text-orange-600" />
                        <span>{t.portalTitle}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigateToAdmin();
                          setIsMobileMenuOpen(false);
                        }}
                        type="button"
                        className="w-full justify-center py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-[#000E32] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <ShieldAlert size={12} className="text-orange-600 animate-pulse" />
                        <span>{t.adminTitle}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        safeNavigate('/account');
                        setIsMobileMenuOpen(false);
                      }}
                      type="button"
                      className={`w-full justify-center py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${
                        activePage === 'account'
                          ? 'bg-gradient-to-r from-orange-600 to-indigo-600 text-white border-transparent'
                          : 'bg-indigo-50/50 hover:bg-indigo-100/60 dark:bg-slate-800 dark:hover:bg-slate-700 border-indigo-100/50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Fingerprint size={12} className={activePage === 'account' ? 'text-white' : 'text-orange-500'} />
                      <span>Candidate Hub (2026)</span>
                    </button>

                    {!currentAppId && !isAdminView && !isApplying && (
                      <button
                        onClick={() => {
                          loadDemoSeed();
                          setIsMobileMenuOpen(false);
                        }}
                        type="button"
                        className="w-full justify-center py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border border-orange-100 dark:border-orange-900"
                      >
                        <Play size={12} className="fill-current text-orange-600" />
                        <span>{t.demoAutofill}</span>
                      </button>
                    )}

                    {currentAppId && !isAdminView && (
                      <button
                        onClick={() => {
                          navigateToRoot();
                          setIsMobileMenuOpen(false);
                        }}
                        type="button"
                        className="w-full justify-center py-2 bg-[#000E32] dark:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <ClipboardEdit size={12} />
                        <span>{t.applyAccreditation}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {/* Main Core View Area */}
      <main className="flex-grow flex flex-col justify-start pb-12">
        {loading && (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#000E32]/20 border-t-orange-600 rounded-full animate-spin" />
              <Logo size="sm" showText={false} className="absolute inset-0 m-auto" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse mt-2">
              Validating Signed Digital Hashing...
            </p>
          </div>
        )}

        {errorMsg && !loading && (
          <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-extrabold text-[#000E32] text-sm uppercase tracking-wide">Document Error</h3>
            <p className="text-slate-600 text-xs leading-relaxed">{errorMsg}</p>
            <button
              onClick={navigateToRoot}
              className="px-4 py-2 bg-[#000E32] hover:bg-blue-950 text-white text-xs font-bold rounded-xl uppercase transition-colors"
            >
              Start New Application
            </button>
          </div>
        )}

        {/* Dynamic State views mapping with AnimatePresence */}
        {!loading && !errorMsg && (
          <div className="flex-grow">
            {isAdminView ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <AdminDashboard
                  onBackToPortal={navigateToRoot}
                  onViewApplicant={(id) => {
                    window.history.pushState(null, '', `/application/${id}`);
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  language={language}
                  setLanguage={setLanguage}
                  theme={theme}
                  setTheme={setTheme}
                />
              </motion.div>
            ) : application ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <ApplicationView
                  application={application}
                  onUpdateApplication={handleUpdateApplication}
                  isUpdating={submitting}
                />
              </motion.div>
             ) : activePage === 'home' ? (
              <motion.div
                key="home-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <HomeSection 
                  onNavigate={(path) => {
                    if (path === '/services') {
                      setSelectedServiceId(null);
                    }
                    safeNavigate(path);
                  }}
                  language={language}
                  onSelectService={(id) => {
                    setSelectedServiceId(id);
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    document.documentElement.scrollTo({ top: 0, behavior: 'auto' });
                    document.body.scrollTo({ top: 0, behavior: 'auto' });
                    const mainContainer = document.querySelector('main') || document.getElementById('root');
                    if (mainContainer) {
                      mainContainer.scrollTo({ top: 0, behavior: 'auto' });
                    }
                    safeNavigate('/services');
                  }}
                  onApplyForJob={(role) => {
                    if (role) {
                      setSelectedRoleTitle(role);
                    }
                    setIsApplying(true);
                    safeNavigate('/careers');
                  }} 
                />
              </motion.div>
             ) : activePage === 'about' ? (
              <motion.div
                key="about-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <AboutSection />
              </motion.div>
             ) : activePage === 'services' ? (
              <motion.div
                key="services-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <ServicesSection 
                  language={language}
                  selectedId={selectedServiceId}
                  onSelectId={setSelectedServiceId}
                />
              </motion.div>
             ) : activePage === 'portfolio' ? (
              <motion.div
                key="portfolio-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <PortfolioSection />
              </motion.div>
             ) : activePage === 'blog' ? (
              <motion.div
                key="blog-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <BlogSection />
              </motion.div>
             ) : activePage === 'training' ? (
              <motion.div
                key="training-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <TrainingAcademySection />
              </motion.div>
             ) : activePage === 'clients' ? (
              <motion.div
                key="clients-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <ClientPortalSection />
              </motion.div>
             ) : activePage === 'account' ? (
              <motion.div
                key="account-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <UserDashboard 
                  onLoginStatusChange={setIsUserLoggedIn} 
                  onBackToPortal={() => {
                    setActivePage('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              </motion.div>
             ) : !isApplying ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-6">
                  
                  {/* Majestic, Premium Corporate Hero Banner */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 text-white p-5 md:p-8 overflow-hidden border border-indigo-950 shadow-2xl">
                    {/* Glowing dynamic background lights */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-orange-500/20 to-transparent rounded-full filter blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-40 -left-20 w-[300px] h-[300px] bg-blue-600/10 rounded-full filter blur-[80px] pointer-events-none" />

                    {/* Animated Logo at Top Middle */}
                    <div className="flex flex-col items-center justify-center text-center mb-6 pb-6 border-b border-white/5 relative z-10 w-full">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Logo size="lg" variant="light" showText={true} className="mx-auto" />
                      </motion.div>
                      
                      <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-orange-400/80 mt-2 font-bold animate-pulse">
                        Secure Authentication & Issuance Node
                      </p>
                    </div>

                    <div className="relative max-w-3xl space-y-3.5 text-left z-10">
                      <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest shadow-inner">
                        <Sparkles size={12} className="animate-pulse text-orange-400" />
                        <span className="font-hand text-xs normal-case tracking-wide text-orange-300">verified recruitment channel</span>
                        <span className="text-[9px] border-l border-orange-500/30 pl-2">ACCREDITATION 2026</span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className="font-hand text-xl text-orange-500 block">Empowering Brands & Talents</span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight uppercase font-serif">
                          DS Tech & Digital <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 font-extrabold italic">Marketing Agency</span>
                        </h1>
                      </div>
                      
                      <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-light">
                        Welcome to our elite staff recruitment and accreditation portal. Design your corporate identity, review official terms of engagement, seal your records with secure electronic signatures, and instantly download your generated Appointment Letters.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setIsApplying(true)}
                          className="group px-5 py-2.5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xl shadow-orange-600/10 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ClipboardEdit size={14} className="group-hover:rotate-6 transition-transform text-orange-200" />
                          <span>Apply For Accreditation</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={loadDemoSeed}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play size={12} className="fill-current text-orange-400 animate-pulse" />
                          <span>Launch Demo Profile</span>
                        </motion.button>
                      </div>

                      {/* Relevant Portal Features list with gorgeous hover and motion effects */}
                      <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                          }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-white/5 text-left w-full"
                      >
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                          className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex gap-3 items-start transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                            <Cpu size={15} className="animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Flow</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">Smart profile analysis and automated recruitment credentials generation.</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                          className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex gap-3 items-start transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                            <Globe size={15} className="animate-spin-slow" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live QR System</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">Accreditation verified via printed scannable QR badge & scanner.</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                          className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex gap-3 items-start transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                            <FileDown size={15} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cryptographic Sign</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">Digitally seal contracts to immediately output official appointment letters.</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Stunning Bento Grid with HQ Info & Live Drive */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* 1. Abuja Corporate Headquarters Bento Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/95 dark:border-slate-800 rounded-2xl p-4 md:p-5 space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden text-left"
                    >
                      {/* Floating glow ring on hover */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/[0.02] rounded-full filter blur-xl pointer-events-none group-hover:bg-orange-500/[0.04] transition-colors duration-300" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl shadow-sm">
                            <Logo size="sm" showText={false} variant={theme === 'dark' ? 'light' : 'dark'} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest block leading-none">{t.hqTitle}</span>
                            <h2 className="text-lg font-black text-[#000E32] dark:text-white uppercase tracking-tight mt-1">{t.hqCity}</h2>
                          </div>
                        </div>
                        <span className="self-start sm:self-center inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                          <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-ping" />
                          {t.hqActive}
                        </span>
                      </div>

                      <PremiumContactSection />

                      {/* Official Social Media Channels Row */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">{t.hqSocials}</span>
                        <div className="flex items-center gap-2.5">
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://facebook.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-blue-50/80 dark:bg-slate-850 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-sm border border-blue-100/40 dark:border-blue-900/30"
                          >
                            <Facebook size={14} className="fill-current" />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-pink-50/80 dark:bg-slate-850 text-[#E4405F] hover:bg-gradient-to-tr hover:from-[#FD1D1D] hover:via-[#E4405F] hover:to-[#C13584] hover:text-white transition-all duration-300 shadow-sm border border-pink-100/40 dark:border-pink-900/30"
                          >
                            <Instagram size={14} />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://twitter.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-sky-50/80 dark:bg-slate-850 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all duration-300 shadow-sm border border-sky-100/40 dark:border-sky-900/30"
                          >
                            <Twitter size={14} className="fill-current" />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://linkedin.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-indigo-50/80 dark:bg-slate-850 text-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all duration-300 shadow-sm border border-indigo-100/40 dark:border-indigo-900/30"
                          >
                            <Linkedin size={14} className="fill-current" />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://youtube.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-red-50/80 dark:bg-slate-850 text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all duration-300 shadow-sm border border-red-100/40 dark:border-red-900/30"
                          >
                            <Youtube size={14} className="fill-current" />
                          </motion.a>
                        </div>
                      </div>

                      {/* GPS Verification with Map-like Coordinate Tag */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Globe size={13} className="text-[#000E32] dark:text-orange-400 animate-spin-slow shrink-0" />
                          <span className="text-[11px]">{t.hqGps}</span>
                        </div>
                        <span className="text-[9px] font-black text-[#000E32] dark:text-orange-400 font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800 shadow-sm shrink-0">
                          9.0272° N, 7.4913° E
                        </span>
                      </div>
                    </motion.div>

                    {/* 2. Interactive Recruitment Stats Bento Card */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-[#011442] to-[#000E32] text-white rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-indigo-950/80 text-left">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none" />
                      
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider leading-none">
                          <span className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                          Live Portal Status
                        </div>
                        <h3 className="text-base font-bold tracking-tight font-serif leading-tight">{t.campaignTitle}</h3>
                        <p className="text-slate-300 text-[11px] leading-relaxed font-light">
                          {t.campaignDesc}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 mt-3">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">{t.availableAreas}</span>
                          <span className="text-base font-black text-white block leading-none mt-1">5+ <span className="text-xs font-normal text-orange-400 font-hand">Fields</span></span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">{t.reviewCycle}</span>
                          <span className="text-base font-black text-orange-400 block leading-none mt-1">24 <span className="text-xs font-normal text-white">Hours</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Open Tracks / Department Listings */}
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                    <RolesCatalog
                      language={language}
                      onSelectRole={(title) => {
                        setSelectedRoleTitle(title);
                        setIsApplying(true);
                      }}
                    />
                  </div>

                  {/* Guided Journey Pathway Block */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] p-6 md:p-8 space-y-6">
                    <div className="text-center max-w-xl mx-auto space-y-1.5">
                      <span className="font-hand text-xl text-orange-600 dark:text-orange-400 block">{t.journeySubtitle}</span>
                      <h3 className="text-lg font-bold text-[#000E32] dark:text-white uppercase tracking-wide font-serif">{t.journeyTitle}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.journeyDesc}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      {(journeyStepsMap[language as LanguageCode] || journeyStepsMap.en).map((milestone, i) => (
                        <div key={i} className="flex gap-4 items-start text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800 relative shadow-sm hover:shadow-md transition-all">
                          <span className="text-3xl font-black text-orange-500/15 font-mono leading-none">0{i + 1}</span>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-serif">{milestone.label}</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{milestone.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <CareersForm  
                  onSubmit={handleFormSubmit} 
                  isSubmitting={submitting} 
                  onLoadDemo={loadDemoSeed} 
                  onCancel={() => {
                    setIsApplying(false);
                    setSelectedRoleTitle('');
                  }}
                  initialRole={selectedRoleTitle}
                  language={language}
                />
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Document bottom footer info */}
      {!isUserLoggedIn && !isAdminView && activePage !== 'account' && (
        <footer className="no-print bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto pt-16 pb-12 px-6 md:px-12 relative overflow-hidden font-sans">
        {/* Decorative ambient background light */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Main Footer Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            
            {/* Column 1: Agency Brand Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 space-y-5"
            >
              <div className="flex items-center gap-3">
                <Logo size="md" showText={true} variant="light" className="bg-slate-800 p-1.5 rounded-xl border border-slate-700/50" />
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-sm font-medium">
                Amplifying digital footprints and building next-generation digital products across West Africa and beyond. We combine high-performance marketing, creative brand storytelling, and modern React/Web engineering.
              </p>
              <div className="text-[11px] text-slate-400 font-bold space-y-1">
                <div>RC Number: <span className="text-slate-200 font-mono">1845921</span></div>
                <div>Status: <span className="text-emerald-400">Incorporated & Active</span></div>
              </div>
            </motion.div>

            {/* Column 2: Agency Service Verticals */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-4 space-y-4"
            >
              <h4 className="text-white text-xs font-extrabold uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                Agency Verticals
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
                <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer group">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-orange-400 transition-all" />
                  Website & Full-Stack Web Apps
                </li>
                <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer group">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-orange-400 transition-all" />
                  Mobile App Engineering & Prototyping
                </li>
                <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer group">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-orange-400 transition-all" />
                  Social Media Strategy & Ad Campaigns
                </li>
                <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer group">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-orange-400 transition-all" />
                  Content Presentation & Video Production
                </li>
                <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer group">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-orange-400 transition-all" />
                  SEO & Search Engine Optimization
                </li>
              </ul>
            </motion.div>

            {/* Column 3: Contact & Connect Social Channels */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-3 space-y-4"
            >
              <h4 className="text-white text-xs font-extrabold uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                Connect & Follow
              </h4>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Stay updated with our creative drives, tech innovations, and ongoing professional staff assessments.
              </p>
              
              {/* Interactive Social Media Platforms Row */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {[
                  { icon: Facebook, href: 'https://facebook.com/dstech', label: 'Facebook', hoverClass: 'hover:bg-blue-600 hover:text-white hover:shadow-blue-600/30' },
                  { icon: Instagram, href: 'https://instagram.com/dstech', label: 'Instagram', hoverClass: 'hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600 hover:text-white hover:shadow-purple-500/30' },
                  { icon: Twitter, href: 'https://twitter.com/dstech', label: 'Twitter/X', hoverClass: 'hover:bg-slate-950 hover:text-white hover:shadow-white/10 border-slate-700' },
                  { icon: Linkedin, href: 'https://linkedin.com/company/dstech', label: 'LinkedIn', hoverClass: 'hover:bg-blue-700 hover:text-white hover:shadow-blue-700/30' },
                  { icon: Youtube, href: 'https://youtube.com/dstech', label: 'YouTube', hoverClass: 'hover:bg-red-600 hover:text-white hover:shadow-red-600/30' },
                ].map((social, index) => {
                  const SocialIcon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.label}
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-300 flex items-center justify-center transition-all duration-300 shadow-md ${social.hoverClass}`}
                    >
                      <SocialIcon size={16} />
                    </motion.a>
                  );
                })}
              </div>

              {/* Fast Scroll to Top Button */}
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                className="mt-4 text-[10px] uppercase font-extrabold tracking-widest text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5 group"
              >
                <ArrowUp size={12} className="group-hover:-translate-y-1 transition-transform duration-300" />
                Back to View Top
              </button>
            </motion.div>

          </div>

          {/* Sub Footer Copyright & Ingress status */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-300 font-medium border-t border-slate-800/80 mt-2">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
              <span className="text-slate-400">© 2026</span>
              <span className="text-orange-400 font-extrabold">DS TECH & DIGITAL MARKETING AGENCY LIMITED</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-300">All Rights Reserved. Registered in Garki, Abuja, Nigeria.</span>
            </div>
          </div>

        </div>
      </footer>
      )}
    </div>
  );
}
