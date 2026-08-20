import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApplicationView } from './components/ApplicationView';
import { PremiumContactSection } from './components/PremiumContactSection';
import { PWAPrompt } from './components/PWAPrompt';

import { CareersForm } from './components/CareersForm';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { StaffPortal } from './components/StaffPortal';

// Website Ecosystem Modules
import { HomeSection } from './components/HomeSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioSection } from './components/PortfolioSection';
import { MeetOurTeamSection } from './components/MeetOurTeamSection';
import { BlogSection } from './components/BlogSection';
import { ClientPortalSection } from './components/ClientPortalSection';
import { CareersSection } from './components/CareersSection';
import { RecognitionSection } from './components/RecognitionSection';
import { TrainingAcademySection } from './components/TrainingAcademySection';
import { AcademyOverview } from './components/AcademyOverview';
import { StudentRegistrationForm } from './components/StudentRegistration/StudentRegistrationForm';
import { TutorRegistrationForm } from './components/TutorRegistration/TutorRegistrationForm';
import { ScholarshipApplicationForm } from './components/ScholarshipApplication/ScholarshipApplicationForm';
import { InternshipApplicationForm } from './components/InternshipApplication/InternshipApplicationForm';
import { CorporateTrainingForm } from './components/CorporateTraining/CorporateTrainingForm';
import { MentorshipApplicationForm } from './components/MentorshipApplication/MentorshipApplicationForm';
import { StudentDashboard } from './components/StudentDashboard';
import { TutorDashboard } from './components/TutorDashboard';
import { PaystackPayButton, PaystackPaymentConfig } from './components/PaystackMotionCheckout';
import { PaystackPaymentPage } from './components/PaystackPaymentPage';
import { JobApplication } from './types';
import { FileDown, Sparkles, Building2, ClipboardEdit, AlertCircle, Play, Heart, Send, Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, ArrowUp, ArrowLeft, ArrowRight, Globe, ShieldAlert, Cpu, Palette, Sun, Moon, ChevronDown, Check, Search, Filter, Fingerprint, Briefcase, FileCheck, UserCheck, CreditCard, Bot, GraduationCap, Award, BookOpen } from 'lucide-react';
import { EnterpriseAiAssistantModal } from './components/AiAssistant/EnterpriseAiAssistantModal';
import { FloatingAiLauncher, PageContext } from './components/FloatingAiLauncher';
import { Logo } from './components/Logo';
import { MainFooter } from './components/MainFooter';
import { MobileNavigationDrawer } from './components/MobileNavigationDrawer';
import { ProfessionalHamburgerButton } from './components/ProfessionalHamburgerButton';
import { 
  FacebookIcon, 
  InstagramIcon, 
  XIcon, 
  LinkedInIcon, 
  YouTubeIcon, 
  TikTokIcon 
} from './components/SocialIcons';
import { apiGetApplication, apiSaveApplication, apiUpdateApplication } from './lib/storage';
import { apiGetCacMetadata, apiSubscribeToCacMetadata, apiSubscribeToRealtimeSync } from './lib/api';
import { CAREER_ROLES, CATEGORIES, CareerRole } from './lib/roles';
import { TRANSLATIONS, LANGUAGES, LanguageCode } from './lib/translations';
import { RolesCatalog } from './components/RolesCatalog';

const journeyStepsMap: Record<LanguageCode, { label: string; desc: string }[]> = {
  en: [
    { label: "Application Submission", desc: "Submit contact details, educational achievements, work experiences, and reference details." },
    { label: "Electronic Verification", desc: "Designate guarantor credentials and approve declarations with secure signatures." },
    { label: "Instant Offer Issuance", desc: "Preview and sign your generated Appointment Letter immediately for campaign onboarding." }
  ],
  fr: [
    { label: "Soumission de Candidature", desc: "Soumettez vos coordonnées, vos diplômes, vos expériences professionnelles et vos références." },
    { label: "Vérification Électronique", desc: "Désignez des garants et approuvez les déclarations avec des signatures sécurisées." },
    { label: "Émission d'Offre Instantanée", desc: "Visualisez et signez immédiatement votre lettre de nomination pour commencer." }
  ],
  ha: [
    { label: "Aika Takardar Neman Aiki", desc: "Aika bayanan tuntuɓi, matakin karatu, ayyukan baya, da bayanan shaidu." },
    { label: "Tabbatarwa ta Lantarki", desc: "Sanya bayanan lamuni da amincewa da bayanin kansa tare da sa hannu na lantarki." },
    { label: "Fitar da Wasiƙar Nadin Aiki", desc: "Duba kuma sanya hannu a kan wasiƙar naɗin aiki nan take don fara aiki." }
  ],
  yo: [
    { label: "Ifisilẹ Ohun elo", desc: "Fi awọn alaye olubasọrọ rẹ, awọn aṣeyọri ẹkọ, awọn iriri iṣẹ, ati awọn alaye itọkasi silẹ." },
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
    { label: "Our Team", value: "team" },
    { label: "Blog", value: "blog" },
    { label: "Academy", value: "training" },
    { label: "Clients", value: "clients" },
    { label: "Recognition", value: "recognition" },
    { label: "Careers", value: "careers" }
  ],
  fr: [
    { label: "Accueil", value: "home" },
    { label: "À Propos", value: "about" },
    { label: "Services", value: "services" },
    { label: "Portfolio", value: "portfolio" },
    { label: "Notre Équipe", value: "team" },
    { label: "Blog", value: "blog" },
    { label: "Académie", value: "training" },
    { label: "Clients", value: "clients" },
    { label: "Reconnaissance", value: "recognition" },
    { label: "Carrières", value: "careers" }
  ],
  ha: [
    { label: "Gida", value: "home" },
    { label: "Game da Mu", value: "about" },
    { label: "Ayyuka", value: "services" },
    { label: "Ayyukan Baya", value: "portfolio" },
    { label: "Kungiyarmu", value: "team" },
    { label: "Blog", value: "blog" },
    { label: "Makaranta", value: "training" },
    { label: "Abokan Ciniki", value: "clients" },
    { label: "Yabo da Kyaututtuka", value: "recognition" },
    { label: "Ayyuka Buɗe", value: "careers" }
  ],
  yo: [
    { label: "Ile", value: "home" },
    { label: "Nipa Wa", value: "about" },
    { label: "Awọn iṣẹ", value: "services" },
    { label: "Awọn iṣẹ Atijọ", value: "portfolio" },
    { label: "Ẹgbẹ Wa", value: "team" },
    { label: "Blog", value: "blog" },
    { label: "Ile-ẹkọ", value: "training" },
    { label: "Awọn alabara", value: "clients" },
    { label: "Idanimọ", value: "recognition" },
    { label: "Iṣẹ-ṣiṣe", value: "careers" }
  ],
  es: [
    { label: "Inicio", value: "home" },
    { label: "Nosotros", value: "about" },
    { label: "Servicios", value: "services" },
    { label: "Portafolio", value: "portfolio" },
    { label: "Equipo", value: "team" },
    { label: "Blog", value: "blog" },
    { label: "Academia", value: "training" },
    { label: "Clientes", value: "clients" },
    { label: "Reconocimientos", value: "recognition" },
    { label: "Carreras", value: "careers" }
  ],
  ar: [
    { label: "الرئيسية", value: "home" },
    { label: "من نحن", value: "about" },
    { label: "خدماتنا", value: "services" },
    { label: "أعمالنا", value: "portfolio" },
    { label: "فريقنا", value: "team" },
    { label: "المدونة", value: "blog" },
    { label: "الأكاديمية", value: "training" },
    { label: "العملاء", value: "clients" },
    { label: "شهادات التقدير", value: "recognition" },
    { label: "الوظائف", value: "careers" }
  ],
  de: [
    { label: "Startseite", value: "home" },
    { label: "Über Uns", value: "about" },
    { label: "Dienste", value: "services" },
    { label: "Portfolio", value: "portfolio" },
    { label: "Unser Team", value: "team" },
    { label: "Blog", value: "blog" },
    { label: "Akademie", value: "training" },
    { label: "Kunden", value: "clients" },
    { label: "Anerkennung", value: "recognition" },
    { label: "Karriere", value: "careers" }
  ],
  ru: [
    { label: "Главная", value: "home" },
    { label: "О нас", value: "about" },
    { label: "Услуги", value: "services" },
    { label: "Портфолио", value: "portfolio" },
    { label: "Наша команда", value: "team" },
    { label: "Блог", value: "blog" },
    { label: "Академия", value: "training" },
    { label: "Клиенты", value: "clients" },
    { label: "Признание", value: "recognition" },
    { label: "Вакансии", value: "careers" }
  ],
  pt: [
    { label: "Início", value: "home" },
    { label: "Sobre Nós", value: "about" },
    { label: "Serviços", value: "services" },
    { label: "Portfólio", value: "portfolio" },
    { label: "Nossa Equipe", value: "team" },
    { label: "Blog", value: "blog" },
    { label: "Academia", value: "training" },
    { label: "Clientes", value: "clients" },
    { label: "Reconhecimento", value: "recognition" },
    { label: "Carreiras", value: "careers" }
  ],
  zh: [
    { label: "首页", value: "home" },
    { label: "关于我们", value: "about" },
    { label: "核心业务", value: "services" },
    { label: "成功案例", value: "portfolio" },
    { label: "我们的团队", value: "team" },
    { label: "博客资讯", value: "blog" },
    { label: "培训学院", value: "training" },
    { label: "客户门户", value: "clients" },
    { label: "资质荣誉", value: "recognition" },
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
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>('');

  // Active website ecosystem page routing state
  const [activePage, setActivePage] = useState<'home' | 'about' | 'services' | 'portfolio' | 'team' | 'blog' | 'training' | 'academy-overview' | 'student-registration' | 'tutor-application' | 'scholarship-application' | 'internship-application' | 'corporate-training' | 'mentorship-application' | 'student-dashboard' | 'clients' | 'careers' | 'account' | 'recognition' | 'staff-portal' | 'tutor-dashboard'>('home');

  const [publishedCac, setPublishedCac] = useState<any>(null);

  // Dynamic Context-Aware Page State for DS TECH AI Copilot
  const currentPageContext: PageContext = React.useMemo(() => {
    let pageTitle = 'DS TECH Home & Agency Portal';
    let section = 'Main Overview';
    let programmeOrCourse = '';
    let pricing = '';
    let workflowState = 'Browsing';

    if (isAdminView) {
      pageTitle = 'Admin Portal & Executive Control Center';
      section = 'Administrative Control';
      workflowState = 'Admin Management';
    } else {
      switch (activePage) {
        case 'home':
          pageTitle = 'DS TECH Home Page';
          section = 'Agency Overview & Core Offerings';
          workflowState = 'Browsing Home';
          break;
        case 'about':
          pageTitle = 'About DS TECH & CAC Compliance';
          section = 'Corporate Registration RC-1849204';
          workflowState = 'Viewing Corporate Verification';
          break;
        case 'services':
          pageTitle = 'Digital Services & Engineering Catalog';
          section = 'Agency Solutions';
          workflowState = 'Exploring Tech & Marketing Services';
          break;
        case 'portfolio':
          pageTitle = 'DS TECH Engineering & Campaign Portfolio';
          section = 'Case Studies';
          workflowState = 'Viewing Case Studies';
          break;
        case 'team':
          pageTitle = 'DS TECH Leadership & Technical Team';
          section = 'Team Profiles';
          workflowState = 'Viewing Team Roster';
          break;
        case 'blog':
          pageTitle = 'DS TECH Industry Insights & Blog';
          section = 'Articles & Technical Publications';
          workflowState = 'Reading Articles';
          break;
        case 'academy-overview':
        case 'training':
          pageTitle = 'DS TECH Training Academy & Course Catalog';
          section = 'Academy Programmes';
          programmeOrCourse = 'Academy Programmes (1, 3, 6 Months Tracks)';
          pricing = 'Virtual: ₦50k-₦200k | Physical: ₦100k-₦300k | Hybrid: ₦150k-₦400k';
          workflowState = 'Exploring Academy Courses & Pricing';
          break;
        case 'student-registration':
          pageTitle = 'Student Registration & Academy Enrollment';
          section = 'Enrollment Form';
          workflowState = 'Completing Student Application';
          break;
        case 'tutor-application':
          pageTitle = 'Tutor & Instructor Faculty Application';
          section = 'Faculty Recruitment';
          workflowState = 'Applying for Tutor Role';
          break;
        case 'scholarship-application':
          pageTitle = 'Scholarship & Financial Assistance Application';
          section = 'Tuition Assistance';
          workflowState = 'Applying for Scholarship';
          break;
        case 'internship-application':
          pageTitle = 'Graduate Internship Application';
          section = 'Industrial Placement';
          workflowState = 'Applying for Internship';
          break;
        case 'corporate-training':
          pageTitle = 'Corporate B2B Workforce Upskilling';
          section = 'Enterprise Solutions';
          workflowState = 'Requesting Corporate Proposal';
          break;
        case 'mentorship-application':
          pageTitle = '1-on-1 Executive Mentorship Programme';
          section = 'Advisory';
          workflowState = 'Applying for Mentorship';
          break;
        case 'student-dashboard':
          pageTitle = 'Student Learning Dashboard';
          section = 'Active Student Workspace';
          workflowState = 'In Student Dashboard';
          break;
        case 'tutor-dashboard':
          pageTitle = 'Tutor & Faculty Dashboard';
          section = 'Teaching Workspace';
          workflowState = 'In Faculty Workspace';
          break;
        case 'staff-portal':
          pageTitle = 'Staff Internal Portal';
          section = 'Employee Workspace';
          workflowState = 'In Staff Workspace';
          break;
        case 'clients':
          pageTitle = 'Client Portal & Project Milestones';
          section = 'Client Area';
          workflowState = 'Viewing Client Milestones';
          break;
        case 'careers':
          pageTitle = selectedRoleTitle ? `Career Opportunity: ${selectedRoleTitle}` : 'Careers at DS TECH';
          section = 'Job Openings';
          workflowState = 'Browsing Careers';
          break;
        case 'account':
          pageTitle = 'User Account & Candidate Portal';
          section = 'Account Settings';
          workflowState = 'Managing Candidate Credentials';
          break;
        case 'recognition':
          pageTitle = 'CAC Credentials & Industry Recognition';
          section = 'Verification & Clearance';
          workflowState = 'Viewing CAC Compliance';
          break;
      }
    }

    const role = isAdminView 
      ? 'Admin' 
      : activePage === 'staff-portal' 
        ? 'Staff' 
        : activePage === 'tutor-dashboard' 
          ? 'Tutor' 
          : activePage === 'student-dashboard' || activePage === 'training' 
            ? 'Student' 
            : activePage === 'clients' 
              ? 'Client' 
              : activePage === 'account' 
                ? 'Applicant' 
                : 'Public';

    let userObj = null;
    try {
      const u = localStorage.getItem('currentUser');
      if (u) userObj = JSON.parse(u);
    } catch (e) {}

    return {
      route: activePage,
      pageTitle,
      section,
      programmeOrCourse,
      pricing,
      userRole: role,
      userData: userObj,
      workflowState
    };
  }, [activePage, isAdminView, selectedRoleTitle]);

  useEffect(() => {
    async function loadCac() {
      try {
        const data = await apiGetCacMetadata(false);
        if (data && data.length > 0) {
          const published = data.find((c: any) => c.is_published === 1) || data[0];
          if (published) {
            setPublishedCac(published);
          }
        }
      } catch (e) {}
    }
    loadCac();

    const unsubCac = apiSubscribeToCacMetadata((cacData) => {
      if (cacData && cacData.length > 0) {
        const published = cacData.find((c: any) => c.is_published === 1) || cacData[0];
        if (published) {
          setPublishedCac(published);
        }
      }
    });

    const unsubSSE = apiSubscribeToRealtimeSync((event) => {
      if (event?.type?.startsWith('CAC_')) {
        loadCac();
      }
    });

    return () => {
      unsubCac();
      unsubSSE();
    };
  }, []);

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

  // Global Paystack Payment Page Redirect State
  const [paymentCheckoutConfig, setPaymentCheckoutConfig] = useState<PaystackPaymentConfig | null>(null);

  // Listen to global Paystack payment redirect trigger
  useEffect(() => {
    const handlePaystackEvent = (e: Event) => {
      const customEvent = e as CustomEvent<PaystackPaymentConfig>;
      if (customEvent.detail) {
        setPaymentCheckoutConfig(customEvent.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('dstech_paystack_pay', handlePaystackEvent);
    return () => {
      window.removeEventListener('dstech_paystack_pay', handlePaystackEvent);
    };
  }, []);

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
      const rawPath = currentPath || window.location.pathname || '/';
      let path = '/';
      try {
        path = decodeURIComponent(rawPath).trim();
      } catch (e) {
        path = rawPath;
      }

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
        } else if (path === '/team' || path === '/our-team' || path === '/our team') {
          setActivePage('team');
        } else if (path === '/blog') {
          setActivePage('blog');
        } else if (path === '/academy-overview' || path === '/academy' || path === '/training' || path === '/courses') {
          setActivePage('academy-overview');
        } else if (path === '/student-registration' || path === '/student-apply' || path === '/register-student' || path === '/student-register' || path === '/enroll') {
          setActivePage('student-registration');
        } else if (path === '/tutor-application' || path === '/tutor-apply' || path === '/apply-tutor' || path === '/become-a-tutor' || path === '/instructor-apply' || path === '/faculty-apply') {
          setActivePage('tutor-application');
        } else if (path === '/scholarship-application' || path === '/scholarship' || path === '/apply-scholarship' || path === '/scholarships') {
          setActivePage('scholarship-application');
        } else if (path === '/internship-application' || path === '/internship' || path === '/apply-internship' || path === '/internships' || path === '/placement') {
          setActivePage('internship-application');
        } else if (path === '/corporate-training' || path === '/corporate' || path === '/corporate-request' || path === '/rfp' || path === '/enterprise-training') {
          setActivePage('corporate-training');
        } else if (path === '/mentorship-application' || path === '/mentorship' || path === '/apply-mentorship' || path === '/1-on-1-mentorship' || path === '/advisory') {
          setActivePage('mentorship-application');
        } else if (path === '/student-dashboard' || path === '/student' || path === '/student-portal' || path === '/my-courses') {
          setActivePage('student-dashboard');
        } else if (path === '/tutor-dashboard' || path === '/tutor' || path === '/tutor-portal' || path === '/instructor-dashboard' || path === '/faculty') {
          setActivePage('tutor-dashboard');
        } else if (path === '/clients' || path === '/client') {
          setActivePage('clients');
        } else if (path === '/careers') {
          setActivePage('careers');
        } else if (path === '/recognition') {
          setActivePage('recognition');
        } else if (path === '/account') {
          setActivePage('account');
        } else if (path === '/staff-portal' || path === '/staff') {
          setActivePage('staff-portal');
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
      
      // Synchronize "My Application" dashboard by creating the recruiter account automatically
      localStorage.setItem('currentUser', JSON.stringify({
        id: `usr-${savedApp.id}`,
        email: formData.personalInfo.emailAddress,
        fullName: formData.personalInfo.fullName,
        role: 'Recruiter',
        applicationId: savedApp.id
      }));

      // Directly open the recruiter dashboard (activePage = 'account') instead of the application preview
      setIsApplying(false);
      safeNavigate('/account');
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

  if (paymentCheckoutConfig) {
    return (
      <PaystackPaymentPage
        config={paymentCheckoutConfig}
        onBack={() => setPaymentCheckoutConfig(null)}
        onSuccess={(ref, res) => {
          if (paymentCheckoutConfig.onSuccess) {
            paymentCheckoutConfig.onSuccess(ref, res);
          }
        }}
      />
    );
  }

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300"
    >
      <PWAPrompt />
      {/* Upper Navigation Header Bar */}
      {!isAdminView && !isUserLoggedIn && activePage === 'home' && !currentAppId && !isApplying && (
        <header className="no-print bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Logo Container */}
            <div 
              className="flex items-center cursor-pointer select-none shrink-0 group" 
              onClick={navigateToRoot}
              title="DS TECH & Digital Marketing Agency"
            >
              <Logo size="sm" showText={true} variant={theme === 'dark' ? 'light' : 'dark'} />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {navMenuTranslations[language as LanguageCode].map((item) => {
                const isActive = activePage === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => safeNavigate(item.value === 'home' ? '/' : `/${item.value}`)}
                    className={`relative px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none flex items-center gap-1.5 focus:outline-none ${
                      isActive
                        ? 'text-slate-950 dark:text-white font-bold bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                    type="button"
                  >
                    <span>{item.label}</span>
                    {item.value === 'careers' && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Unified Control Suite (Language + Theme + Menu) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Language Selector Dropdown */}
              <div className="relative" ref={desktopLangRef}>
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="h-9 sm:h-9.5 px-3 rounded-full border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                  aria-label="Select language"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px] font-bold">
                    {language}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 overflow-hidden origin-top-right"
                    >
                      <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                        Select Language
                      </div>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                            language === lang.code
                              ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                          }`}
                          type="button"
                        >
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                          </span>
                          {language === lang.code && (
                            <Check className="w-3.5 h-3.5 text-orange-500" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="h-9 sm:h-9.5 w-9 sm:w-9.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20 transition-transform duration-200 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20 transition-transform duration-200 hover:-rotate-12" />
                )}
              </button>

              {/* Menu Button */}
              <ProfessionalHamburgerButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>

          {/* Mobile Navigation Drawer Overlay */}
          <MobileNavigationDrawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            activePage={activePage}
            onNavigate={safeNavigate}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            isAdminView={isAdminView}
            navigateToAdmin={navigateToAdmin}
            navigateToRoot={navigateToRoot}
            t={t}
          />
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
                  setLanguage={(l) => setLanguage(l as LanguageCode)}
                  theme={theme}
                  setTheme={(th) => setTheme(th as 'light' | 'dark')}
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
                <AboutSection 
                  isAdmin={isAdminView} 
                  onBackToMain={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
                />
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
                  onBackToMain={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
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
                <PortfolioSection onBackToMain={navigateToRoot} />
              </motion.div>
             ) : activePage === 'team' ? (
              <motion.div
                key="meet-our-team-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <MeetOurTeamSection language={language} onBackToPortal={() => {
                  setActivePage('home');
                  window.scrollTo(0, 0);
                }} />
              </motion.div>
             ) : activePage === 'staff-portal' ? (
              <motion.div
                key="staff-portal-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <StaffPortal 
                  onBackToPortal={() => {
                    setActivePage('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              </motion.div>
             ) : activePage === 'blog' ? (
              <motion.div
                key="blog-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <BlogSection 
                  onBackToMain={() => {
                    setActivePage('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              </motion.div>
             ) : activePage === 'academy-overview' || activePage === 'training' ? (
              <motion.div
                key="academy-overview-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <AcademyOverview 
                  onNavigate={(p) => safeNavigate(p)} 
                />
              </motion.div>
             ) : activePage === 'student-registration' ? (
              <motion.div
                key="student-registration-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <StudentRegistrationForm
                  onNavigateHome={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
                  onNavigateCourses={() => {
                    setActivePage('academy-overview');
                    window.scrollTo(0, 0);
                  }}
                />
              </motion.div>
             ) : activePage === 'tutor-application' ? (
              <motion.div
                key="tutor-application-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <TutorRegistrationForm
                  onNavigateHome={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
                  onNavigateCourses={() => {
                    setActivePage('academy-overview');
                    window.scrollTo(0, 0);
                  }}
                />
              </motion.div>
             ) : activePage === 'scholarship-application' ? (
              <motion.div
                key="scholarship-application-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-screen bg-slate-950 text-slate-100"
              >
                {/* Career-styled Header for Scholarship */}
                <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800 shadow-md">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div 
                      onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Logo size="sm" showText={false} />
                      <div>
                        <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                          <span>DS TECH ACADEMY</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">CSR SCHOLARSHIP</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Tuition Assistance & Talent Fund Application</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setActivePage('academy-overview'); window.scrollTo(0, 0); }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                      >
                        <BookOpen size={13} className="text-emerald-400" />
                        <span className="hidden sm:inline">115+ Courses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                        className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border border-slate-700 text-xs font-bold"
                        title="Back to Main Site"
                      >
                        <ArrowLeft size={14} className="text-emerald-500" />
                        <span className="hidden sm:inline uppercase tracking-widest text-slate-400">Back to Main</span>
                      </button>
                    </div>
                  </div>
                </header>

                <ScholarshipApplicationForm
                  onNavigateHome={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
                  onNavigateCourses={() => {
                    setActivePage('academy-overview');
                    window.scrollTo(0, 0);
                  }}
                />
              </motion.div>
             ) : activePage === 'internship-application' ? (
              <motion.div
                key="internship-application-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-screen bg-slate-950 text-slate-100"
              >
                {/* Career-styled Header for Internship */}
                <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800 shadow-md">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div 
                      onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Logo size="sm" showText={false} />
                      <div>
                        <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                          <span>DS TECH ACADEMY</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-[9px] font-bold">PLACEMENT</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Graduate Industrial Internship Placement Docket</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setActivePage('academy-overview'); window.scrollTo(0, 0); }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                      >
                        <BookOpen size={13} className="text-blue-400" />
                        <span className="hidden sm:inline">115+ Courses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                        className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border border-slate-700 text-xs font-bold"
                        title="Back to Main Site"
                      >
                        <ArrowLeft size={14} className="text-blue-500" />
                        <span className="hidden sm:inline uppercase tracking-widest text-slate-400">Back to Main</span>
                      </button>
                    </div>
                  </div>
                </header>

                <InternshipApplicationForm
                  onNavigateHome={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
                  onNavigateCourses={() => {
                    setActivePage('academy-overview');
                    window.scrollTo(0, 0);
                  }}
                />
              </motion.div>
             ) : activePage === 'corporate-training' ? (
              <motion.div
                key="corporate-training-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-screen bg-slate-950 text-slate-100"
              >
                {/* Career-styled Header for Corporate */}
                <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800 shadow-md">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div 
                      onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Logo size="sm" showText={false} />
                      <div>
                        <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                          <span>DS TECH ACADEMY</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold">ENTERPRISE</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Custom Corporate Upskilling & RFP Submission</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setActivePage('academy-overview'); window.scrollTo(0, 0); }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                      >
                        <BookOpen size={13} className="text-amber-400" />
                        <span className="hidden sm:inline">115+ Courses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                        className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border border-slate-700 text-xs font-bold"
                        title="Back to Main Site"
                      >
                        <ArrowLeft size={14} className="text-amber-500" />
                        <span className="hidden sm:inline uppercase tracking-widest text-slate-400">Back to Main</span>
                      </button>
                    </div>
                  </div>
                </header>

                <CorporateTrainingForm
                  onNavigateHome={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
                  onNavigateCourses={() => {
                    setActivePage('academy-overview');
                    window.scrollTo(0, 0);
                  }}
                />
              </motion.div>
             ) : activePage === 'mentorship-application' ? (
              <motion.div
                key="mentorship-application-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-screen bg-slate-950 text-slate-100"
              >
                {/* Career-styled Header for Mentorship */}
                <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800 shadow-md">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div 
                      onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Logo size="sm" showText={false} />
                      <div>
                        <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                          <span>DS TECH ACADEMY</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-mono text-[9px] font-bold">1-ON-1 ADVISORY</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Individual Professional Mentorship Program</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setActivePage('academy-overview'); window.scrollTo(0, 0); }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                      >
                        <BookOpen size={13} className="text-purple-400" />
                        <span className="hidden sm:inline">115+ Courses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                        className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border border-slate-700 text-xs font-bold"
                        title="Back to Main Site"
                      >
                        <ArrowLeft size={14} className="text-purple-500" />
                        <span className="hidden sm:inline uppercase tracking-widest text-slate-400">Back to Main</span>
                      </button>
                    </div>
                  </div>
                </header>

                <MentorshipApplicationForm
                  onNavigateHome={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }}
                  onNavigateCourses={() => {
                    setActivePage('academy-overview');
                    window.scrollTo(0, 0);
                  }}
                />
              </motion.div>
              ) : activePage === 'student-dashboard' ? (
              <motion.div
                key="student-dashboard-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <StudentDashboard 
                  onBackToPortal={() => {
                    setActivePage('academy-overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onNavigatePathway={(pathwayPath) => {
                    safeNavigate(pathwayPath);
                  }}
                />
              </motion.div>
             ) : activePage === 'tutor-dashboard' ? (
              <motion.div
                key="tutor-dashboard-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <TutorDashboard 
                  onBackToPortal={() => {
                    setActivePage('academy-overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
             ) : activePage === 'clients' ? (
              <motion.div
                key="clients-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <ClientPortalSection onBackToPortal={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }} />
              </motion.div>
             ) : activePage === 'recognition' ? (
              <motion.div
                key="recognition-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <RecognitionSection onBackToPortal={() => {
                    setActivePage('home');
                    window.scrollTo(0, 0);
                  }} />
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
             ) : activePage === 'careers' ? (
              <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative flex flex-col w-full`}>
                <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-8 flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}>
                      <Logo size="sm" showText={true} variant={theme === 'dark' ? 'light' : 'dark'} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setActivePage('home'); window.scrollTo(0, 0); }}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                      title="Back to Main Site"
                    >
                      <ArrowLeft size={15} className="text-orange-500" />
                      <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500">Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
                    >
                      {theme === 'dark' ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
                    </button>
                  </div>
                </header>
                <main className="flex-1 flex flex-col w-full">
                  {!isApplying ? (
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
                          onClick={() => setActivePage('account')}
                          className="group px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck size={14} className="text-orange-400 group-hover:scale-110 transition-transform" />
                          <span>My Application</span>
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
                          <div className="p-1.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl shadow-sm">
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
                            href="https://www.facebook.com/share/1DUwq656cM/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-blue-50/80 dark:bg-slate-850 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-sm border border-blue-100/40 dark:border-blue-900/30"
                          >
                            <Facebook size={14} className="fill-current" />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://www.instagram.com/dstechltd3?igsh=Y2xmb3BhODk4eGF3&utm_source=qr" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-pink-50/80 dark:bg-slate-850 text-[#E4405F] hover:bg-gradient-to-tr hover:from-[#FD1D1D] hover:via-[#E4405F] hover:to-[#C13584] hover:text-white transition-all duration-300 shadow-sm border border-pink-100/40 dark:border-pink-900/30"
                          >
                            <Instagram size={14} />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://x.com/DigitalDs18246" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-sky-50/80 dark:bg-slate-850 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all duration-300 shadow-sm border border-sky-100/40 dark:border-sky-900/30"
                          >
                            <Twitter size={14} className="fill-current" />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://www.linkedin.com/company/dstechanddigitaltd" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-indigo-50/80 dark:bg-slate-850 text-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all duration-300 shadow-sm border border-indigo-100/40 dark:border-indigo-900/30"
                          >
                            <Linkedin size={14} className="fill-current" />
                          </motion.a>
                          <motion.a 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://www.youtube.com/@DSTECHANDDIGITALMARKETINGLTD" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center p-2 rounded-xl bg-red-50/80 dark:bg-slate-850 text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all duration-300 shadow-sm border border-red-100/40 dark:border-red-900/30"
                          >
                            <Youtube size={14} className="fill-current" />
                          </motion.a>
                        </div>
                      </div>

                      {/* GPS Verification with Map-like Coordinate Tag */}
                      <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-300 gap-2">
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
                    <CareersSection
                      onApplyForJob={(title) => {
                        setSelectedRoleTitle(title);
                        setIsApplying(true);
                      }}
                      onOpenMyApplication={() => {
                        setActivePage('account');
                      }}
                      onPreviewApplication={(vacancy) => {
                        setSelectedRoleTitle(vacancy.title);
                        setIsApplying(true);
                      }}
                    />
                  </div>

                  {/* Guided Journey Pathway Block */}
                  <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 rounded-[2rem] p-6 md:p-8 space-y-6">
                    <div className="text-center max-w-xl mx-auto space-y-1.5">
                      <span className="font-hand text-xl text-orange-600 dark:text-orange-400 block">{t.journeySubtitle}</span>
                      <h3 className="text-lg font-bold text-[#000E32] dark:text-white uppercase tracking-wide font-serif">{t.journeyTitle}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-300">{t.journeyDesc}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      {(journeyStepsMap[language as LanguageCode] || journeyStepsMap.en).map((milestone, i) => (
                        <div key={i} className="flex gap-4 items-start text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800 relative shadow-sm hover:shadow-md transition-all">
                          <span className="text-3xl font-black text-orange-500/15 font-mono leading-none">0{i + 1}</span>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-serif">{milestone.label}</h4>
                            <p className="text-slate-500 dark:text-slate-300 text-[11px] leading-relaxed">{milestone.desc}</p>
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
                </main>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Document bottom footer info */}
      {!isUserLoggedIn && !isAdminView && !['account', 'clients', 'training', 'academy-overview', 'student-registration', 'tutor-application', 'scholarship-application', 'internship-application', 'corporate-training', 'mentorship-application', 'student-dashboard', 'tutor-dashboard', 'staff-portal', 'recognition', 'team', 'portfolio', 'careers', 'services', 'about', 'blog'].includes(activePage) && (
        <MainFooter publishedCac={publishedCac} />
      )}
      {/* Premium Circular Floating AI Assistant Launcher */}
      <FloatingAiLauncher
        onClick={() => setIsAiModalOpen(!isAiModalOpen)}
        isModalOpen={isAiModalOpen}
        pageContext={currentPageContext}
      />

      {/* Enterprise AI Assistant Workspace Modal */}
      <EnterpriseAiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        userRole={currentPageContext.userRole}
        currentUser={currentPageContext.userData}
        pageContext={currentPageContext}
      />
    </div>
  );
}
