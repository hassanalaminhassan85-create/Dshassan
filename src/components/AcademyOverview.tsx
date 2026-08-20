import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Globe,
  Award,
  Users,
  Briefcase,
  Laptop,
  Building2,
  Building,
  HeartPulse,
  Bot,
  Sprout,
  TrendingUp,
  Palette,
  Code,
  BarChart3,
  Crown,
  Utensils,
  Scale,
  Landmark,
  Shirt,
  HardHat,
  Flame,
  Cross,
  Factory,
  Film,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  DollarSign,
  X,
  CreditCard,
  UserCheck,
  Send,
  HelpCircle,
  FileCheck2,
  Check,
  ShieldCheck,
  ExternalLink,
  Share2,
  Lock,
  Layers,
  ChevronRight,
  ChevronLeft,
  Filter,
  Sun,
  Moon,
  Menu,
  ArrowLeft,
  Compass,
  BookCheck,
  CheckCircle,
  LayoutDashboard,
  BadgeCheck,
  Sliders
} from 'lucide-react';
import {
  ACADEMY_CATEGORIES,
  ACADEMY_COURSES,
  QUICK_STATS,
  CORE_VALUES,
  WHY_CHOOSE_US_ACCORDIONS,
  CEO_MESSAGE,
  CONTACT_DETAILS,
  AcademyCategory,
  AcademyCourse
} from '../lib/academyCoursesData';
import { Logo } from './Logo';
import { ProfessionalHamburgerButton } from './ProfessionalHamburgerButton';
import { MobileNavigationDrawer } from './MobileNavigationDrawer';
import { TRANSLATIONS, LanguageCode } from '../lib/translations';
import { AcademyEnrollmentModal } from './AcademyEnrollmentModal';

interface AcademyOverviewProps {
  onNavigate?: (page: string) => void;
  onApplyForCourse?: (courseCode: string, courseTitle: string, price: number) => void;
}

export const AcademyOverview: React.FC<AcademyOverviewProps> = ({
  onNavigate,
  onApplyForCourse
}) => {
  // Local theme state synced with document root
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // State for search and category filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Category Filter Modal State
  const [isCategoryFilterModalOpen, setIsCategoryFilterModalOpen] = useState<boolean>(false);
  const [categoryFilterSearch, setCategoryFilterSearch] = useState<string>('');

  // Course List Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const coursesPerPage = 12;

  // Program Discovery Search State
  const [programSearchQuery, setProgramSearchQuery] = useState<string>('');
  
  // Modal states
  const [selectedCourseModal, setSelectedCourseModal] = useState<AcademyCourse | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('why-1');
  const [pathwayModal, setPathwayModal] = useState<'student' | 'tutor' | 'corporate' | 'scholarship' | 'internship' | 'mentorship' | null>(null);
  
  // Direct Quick Enrollment Modal State (Managed via AcademyEnrollmentModal)
  const [enrollModalCourse, setEnrollModalCourse] = useState<AcademyCourse | null>(null);

  // Keyboard accessibility for modal Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCategoryFilterModalOpen) setIsCategoryFilterModalOpen(false);
        if (selectedCourseModal) setSelectedCourseModal(null);
        if (enrollModalCourse) setEnrollModalCourse(null);
        if (pathwayModal) setPathwayModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCategoryFilterModalOpen, selectedCourseModal, enrollModalCourse, pathwayModal]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLevel]);

  // Filter courses dynamically
  const filteredCourses = useMemo(() => {
    return ACADEMY_COURSES.filter((course) => {
      const matchesCategory =
        selectedCategory === 'all' || course.categoryId === selectedCategory;
      const matchesLevel =
        selectedLevel === 'all' || course.level === selectedLevel;
      const matchesSearch =
        searchQuery.trim() === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  // Paginated Courses slice
  const totalCoursesCount = filteredCourses.length;
  const totalPages = Math.ceil(totalCoursesCount / coursesPerPage) || 1;
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, currentPage, coursesPerPage]);

  // Official Coloured Vector SVG Icons for each category
  const renderOfficialProgramSvg = (catId: string, className = "w-6 h-6") => {
    switch (catId) {
      case 'ai':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#4F46E5" fillOpacity="0.15" />
            <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="#6366F1" strokeWidth="2" fill="#818CF8" fillOpacity="0.25" />
            <circle cx="12" cy="12" r="2" fill="#4F46E5" />
          </svg>
        );
      case 'healthcare':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#059669" fillOpacity="0.15" />
            <path d="M19 14C19 17.866 15.866 21 12 21C8.13401 21 5 17.866 5 14C5 10.134 12 3 12 3C12 3 19 10.134 19 14Z" stroke="#059669" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 11V16M9.5 13.5H14.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'education':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#7C3AED" fillOpacity="0.15" />
            <path d="M22 10L12 5L2 10L12 15L22 10Z" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12.5V17C6 17 9 19 12 19C15 19 18 17 18 17V12.5" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'agriculture':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#16A34A" fillOpacity="0.15" />
            <path d="M12 21V11" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 11C12 11 10 6 5 6C5 11 10 13 12 13" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#22C55E" fillOpacity="0.2" />
            <path d="M12 11C12 11 14 5 19 5C19 10 14 12 12 12" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#16A34A" fillOpacity="0.2" />
          </svg>
        );
      case 'marketing':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#EA580C" fillOpacity="0.15" />
            <path d="M4.5 16.5L9.5 11.5L13.5 15.5L19.5 8.5" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 8.5H19.5V13" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'creative':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#E11D48" fillOpacity="0.15" />
            <circle cx="12" cy="12" r="8" stroke="#E11D48" strokeWidth="2" />
            <circle cx="9" cy="10" r="1.5" fill="#F43F5E" />
            <circle cx="15" cy="10" r="1.5" fill="#FB7185" />
            <circle cx="12" cy="15" r="1.5" fill="#E11D48" />
          </svg>
        );
      case 'tech':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#0284C7" fillOpacity="0.15" />
            <path d="M7 8L3 12L7 16" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 8L21 12L17 16" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 4L10 20" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'fintech':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#0D9488" fillOpacity="0.15" />
            <path d="M3 3V21H21" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="7" y="10" width="3" height="7" rx="1" fill="#14B8A6" />
            <rect x="12" y="6" width="3" height="11" rx="1" fill="#0D9488" />
            <rect x="17" y="13" width="3" height="4" rx="1" fill="#2DD4BF" />
          </svg>
        );
      case 'business':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#D97706" fillOpacity="0.15" />
            <rect x="3" y="7" width="18" height="13" rx="2" stroke="#D97706" strokeWidth="2" />
            <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="#F59E0B" strokeWidth="2" />
          </svg>
        );
      case 'executive':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#B45309" fillOpacity="0.15" />
            <path d="M3 17L5 7L12 12L19 7L21 17H3Z" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#D97706" fillOpacity="0.2" />
            <circle cx="5" cy="6" r="1.5" fill="#F59E0B" />
            <circle cx="12" cy="10" r="1.5" fill="#F59E0B" />
            <circle cx="19" cy="6" r="1.5" fill="#F59E0B" />
          </svg>
        );
      case 'realestate':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#4338CA" fillOpacity="0.15" />
            <path d="M3 21H21" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 21V9L12 3L19 9V21" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="9" y="13" width="6" height="8" rx="1" stroke="#4338CA" strokeWidth="2" />
          </svg>
        );
      case 'hospitality':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#C026D3" fillOpacity="0.15" />
            <path d="M12 4C7.58172 4 4 7.58172 4 12V18H20V12C20 7.58172 16.4183 4 12 4Z" stroke="#C026D3" strokeWidth="2" strokeLinejoin="round" />
            <path d="M2 18H22" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="3" r="1.5" fill="#C026D3" />
          </svg>
        );
      case 'legal':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#334155" fillOpacity="0.15" />
            <path d="M12 3V21M12 3H5M12 3H19" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 9L2 14C2 15.6569 3.34315 17 5 17C6.65685 17 8 15.6569 8 14L5 9Z" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
            <path d="M19 9L16 14C16 15.6569 17.3431 17 19 17C20.6569 17 22 15.6569 22 14L19 9Z" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        );
      case 'government':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#047857" fillOpacity="0.15" />
            <path d="M3 21H21M3 10L12 4L21 10V12H3V10Z" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12V18M9 12V18M15 12V18M19 12V18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'ngo':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#0369A1" fillOpacity="0.15" />
            <circle cx="12" cy="12" r="9" stroke="#0369A1" strokeWidth="2" />
            <path d="M3.6 9H20.4M3.6 15H20.4M12 3C14.5 6 15.5 9 15.5 12C15.5 15 14.5 18 12 21C9.5 18 8.5 15 8.5 12C8.5 9 9.5 6 12 3Z" stroke="#38BDF8" strokeWidth="1.5" />
          </svg>
        );
      case 'fashion':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#E11D48" fillOpacity="0.15" />
            <path d="M12 4C12 4 9 7 9 10C9 12 11 13 12 13C13 13 15 12 15 10C15 7 12 4 12 4Z" stroke="#E11D48" strokeWidth="2" strokeLinejoin="round" />
            <path d="M4 14L8 12L12 14L16 12L20 14V20H4V14Z" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'construction':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#C2410C" fillOpacity="0.15" />
            <path d="M4 15V13C4 9 7 6 12 6C17 6 20 9 20 13V15H4Z" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" fill="#EA580C" fillOpacity="0.2" />
            <path d="M2 15H22V18H2V15Z" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        );
      case 'energy':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#DC2626" fillOpacity="0.15" />
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#EF4444" fillOpacity="0.2" />
          </svg>
        );
      case 'faith':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#6D28D9" fillOpacity="0.15" />
            <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 7H16" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 11H14" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'manufacturing':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#52525B" fillOpacity="0.15" />
            <path d="M2 21V12L7 9V14L12 11V16L17 13V21H2Z" stroke="#52525B" strokeWidth="2" strokeLinejoin="round" fill="#71717A" fillOpacity="0.2" />
          </svg>
        );
      case 'entertainment':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#9333EA" fillOpacity="0.15" />
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#9333EA" strokeWidth="2" />
            <path d="M10 9L15 12L10 15V9Z" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#C084FC" />
          </svg>
        );
      case 'remote':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#10B981" fillOpacity="0.15" />
            <rect x="4" y="5" width="16" height="10" rx="1.5" stroke="#10B981" strokeWidth="2" />
            <path d="M2 19H22" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#EA580C" fillOpacity="0.15" />
            <path d="M12 3L14.5 9.5L21 10.5L16 15.5L17.5 22L12 18.5L6.5 22L8 15.5L3 10.5L9.5 9.5L12 3Z" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" fill="#F97316" fillOpacity="0.2" />
          </svg>
        );
    }
  };

  // Dynamic icon helper fallback
  const renderCategoryIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Bot': return <Bot className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Sprout': return <Sprout className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'Code': return <Code className={className} />;
      case 'BarChart3': return <BarChart3 className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Building': return <Building className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'Landmark': return <Landmark className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Shirt': return <Shirt className={className} />;
      case 'HardHat': return <HardHat className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Cross': return <BookOpen className={className} />;
      case 'Factory': return <Factory className={className} />;
      case 'Film': return <Film className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-orange-500 selection:text-white transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* DEDICATED STANDALONE ACADEMY HEADER & NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Dedicated Academy Tag */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onNavigate?.('/academy-overview')} 
              className="flex items-center gap-2.5 cursor-pointer group"
              title="DS Tech Academy Home"
            >
              <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
              <div className="hidden xs:flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] tracking-wider uppercase border border-orange-500/30 flex items-center gap-1 shadow-2xs">
                  <BadgeCheck className="w-3 h-3 text-orange-500" />
                  <span>ACADEMY</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Quick Category / Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#registration-portals" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 py-1">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Registration Portals</span>
            </a>
            <a href="#courses-catalog" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 py-1">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>115+ Courses</span>
            </a>
            <a href="#pathways" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 py-1">
              <Compass className="w-4 h-4 text-blue-500" />
              <span>Special Pathways</span>
            </a>
            <a href="#faculty" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 py-1">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Faculty</span>
            </a>
            <a href="#campuses" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 py-1">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Physical Hubs</span>
            </a>
            <a href="#why-us" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 py-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Why DSTA</span>
            </a>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Student Dashboard Quick Link */}
            <button
              type="button"
              onClick={() => onNavigate?.('/student-dashboard')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
              title="Open Student Portal"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
              <span>Student Portal</span>
            </button>

            {/* Light / Dark Mode Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700/60 shadow-2xs cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Student Admissions CTA */}
            <button
              type="button"
              onClick={() => onNavigate?.('/student-registration')}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Apply / Enroll</span>
              <span className="sm:hidden">Enroll</span>
            </button>

            {/* Professional Hamburger Menu Button matching main site UI/UX & size */}
            <ProfessionalHamburgerButton
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* WORLD-CLASS STANDALONE ACADEMY FLOATING NAVIGATION PANEL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end sm:items-center sm:justify-center sm:p-6">
            {/* Minimalist Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Elegant Mobile Drawer (full-height right-side on mobile, centered modal on desktop) */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-10 w-full sm:w-[500px] md:w-[550px] h-full sm:h-auto sm:max-h-[85vh] sm:rounded-2xl bg-white dark:bg-slate-900 border-l sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Refined Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
                  <div className="hidden xs:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Navigation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close Navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Clean Navigation Grid */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  
                  {/* Group 1: Portals & Account */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Portals</span>
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate?.('/student-dashboard'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <BookCheck className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Student Portal</span>
                      </button>
                      <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate?.('/tutor-dashboard'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Tutor Dashboard</span>
                      </button>
                    </div>
                  </div>

                  {/* Group 2: Applications & Forms */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Applications</span>
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate?.('/student-registration'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Student Registration</span>
                      </button>
                      <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate?.('/tutor-application'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <Users className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Faculty Application</span>
                      </button>
                      <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate?.('/scholarship-application'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <Award className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">CSR Scholarship</span>
                      </button>
                      <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate?.('/corporate-training'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <Building2 className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Corporate Upskilling</span>
                      </button>
                      <button
                        onClick={() => { setMobileMenuOpen(false); onNavigate?.('/internship-application'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Graduate Internship</span>
                      </button>
                    </div>
                  </div>

                  {/* Group 3: Explore Academy */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Explore</span>
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          document.getElementById('courses-catalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Courses Catalog</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          document.getElementById('pathways')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <Layers className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Special Pathways</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          document.getElementById('faculty')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <Users className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Faculty Directory</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          document.getElementById('campuses')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Physical Hubs</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group text-left"
                      >
                        <Award className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-medium">Why Choose Us</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Minimalist Footer Action */}
              <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-between sm:justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate?.('/');
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Main Website</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. SOPHISTICATED HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 transition-colors">
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-orange-500/10 via-amber-500/10 to-indigo-500/5 blur-[120px] rounded-full" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/5 blur-[90px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Accreditation Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold tracking-wide shadow-sm mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FCT ABUJA & ADAMAWA CAMPUSES • CAC ACCREDITED IT ACADEMY (RC: 95)</span>
            </motion.div>

            {/* Hero Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] font-display"
            >
              Transform Your Career with High-Impact Tech & Digital Leadership Programs
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              Master in-demand skills across <strong className="text-orange-600 dark:text-orange-400">115+ certified programs</strong> and <strong className="text-slate-900 dark:text-white">22 specialized faculties</strong>. 70% practical computer lab training, expert faculty mentorship, and direct graduate job placement pipelines.
            </motion.p>

            {/* Search & Level Filter Command Center */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl max-w-3xl mx-auto text-left"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3">
                
                {/* Search Box */}
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, e.g. AI, Cyber Security, Web Dev, Python, Data..."
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Level Select Dropdown */}
                <div className="w-full sm:w-48 shrink-0">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full py-3 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Difficulty Levels</option>
                    <option value="Beginner">Beginner Level</option>
                    <option value="Intermediate">Intermediate Level</option>
                    <option value="Advanced">Advanced Level</option>
                    <option value="All Levels">All Levels Welcome</option>
                    <option value="Executive">Executive / CEO Level</option>
                  </select>
                </div>

              </div>

              {/* Course Counter Bar */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>
                  Showing <strong className="text-orange-600 dark:text-orange-400 font-extrabold">{filteredCourses.length}</strong> of 115 Accredited Programs
                </span>
                {(searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedLevel('all');
                    }}
                    className="text-orange-600 dark:text-orange-400 hover:underline font-bold"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </motion.div>

            {/* Quick CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <a
                href="#courses-catalog"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore All 115+ Courses</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setPathwayModal('student')}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-orange-500" />
                <span>Student Admission Docket</span>
              </button>

              <a
                href="https://wa.me/2349023489111?text=Hello%20DS%20Tech%20Academy,%20I%20would%20like%20to%20speak%20with%20an%20academic%20advisor."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Talk to Academic Advisor</span>
              </a>
            </motion.div>

          </div>

          {/* Key Metrics Trust Bento Bar */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center flex flex-col justify-center items-center group hover:border-orange-500/40 transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {stat.subtext}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* REGISTRATION PORTALS — HIGH VISIBILITY DUAL ADMISSIONS SECTION */}
      {/* ========================================================================= */}
      <section id="registration-portals" className="py-12 lg:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-extrabold uppercase tracking-widest border border-orange-500/30 mb-3 shadow-2xs">
              <UserCheck className="w-4 h-4 text-orange-500" />
              <span>OFFICIAL REGISTRATION PORTALS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
              Begin Your Journey — Student & Tutor Admissions
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2.5 max-w-2xl mx-auto leading-relaxed">
              Select your registration portal below to access official online application forms, campus lab options, and portal dashboards.
            </p>
          </div>

          {/* Dual Registration Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* CARD 1: Student Registration Portal */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-orange-500/80 dark:border-orange-500/60 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-orange-500 transition-all duration-300">
              {/* Subtle Brand Ambient Backlight */}
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                {/* Badge & Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[11px] font-extrabold uppercase tracking-wider border border-orange-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Student Admissions Open • 2026 Cohorts
                  </span>
                  <span className="text-[10px] font-mono font-extrabold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    DSTA-STU-PORTAL
                  </span>
                </div>

                {/* Card Title & Icon */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                      Student Registration Portal
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Start your official 10-step online enrollment for physical lab training (Abuja / Adamawa) or live virtual cohorts across 115+ certified programs.
                    </p>
                  </div>
                </div>

                {/* Key Student Perks */}
                <div className="my-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>70% Practical Training</strong> in state-of-the-art computer labs</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Flexible Installment:</strong> Pay 70% deposit & 30% balance at graduation</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Accredited Diploma:</strong> CAC Registered Institution (RC: 95)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/student-registration');
                    } else {
                      setPathwayModal('student');
                    }
                  }}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Register as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.('/student-dashboard')}
                  className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-orange-500" />
                  <span>Student Login</span>
                </button>
              </div>
            </div>

            {/* CARD 2: Tutor & Faculty Registration Portal */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-amber-500/80 dark:border-amber-500/60 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500 transition-all duration-300">
              {/* Subtle Ambient Backlight */}
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Badge & Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Faculty Recruitment • Active across 24 Domains
                  </span>
                  <span className="text-[10px] font-mono font-extrabold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    DSTA-TUT-PORTAL
                  </span>
                </div>

                {/* Card Title & Icon */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                      Tutor & Faculty Registration Portal
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Join our distinguished faculty network. Deliver high-impact practical computer lab sessions or live virtual lectures across 24 teaching domains.
                    </p>
                  </div>
                </div>

                {/* Key Faculty Perks */}
                <div className="my-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Competitive Remuneration</strong> & milestone honorariums</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Dedicated Lab Workstations</strong> & AI assistant teaching tools</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Flexible Schedules:</strong> Physical (Abuja/Adamawa) or Remote Virtual</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/tutor-application');
                    } else {
                      setPathwayModal('tutor');
                    }
                  }}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Register as Tutor / Faculty</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.('/tutor-dashboard')}
                  className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-500" />
                  <span>Tutor Login</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Access Bar for Additional Special Pathways */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Other Special Admission Frameworks:</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.('/scholarship-application')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-orange-500/10 hover:text-orange-600 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Scholarship Fund
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('/corporate-training')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-orange-500/10 hover:text-orange-600 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Corporate RFP
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('/internship-application')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-orange-500/10 hover:text-orange-600 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Graduate Internship
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('/mentorship-application')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-orange-500/10 hover:text-orange-600 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Executive Mentorship
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROGRAM DISCOVERY INTERFACE (22 SPECIALIZED FACULTIES) */}
      {/* ========================================================================= */}
      <section id="faculty" className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20 mb-3">
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span>22 SPECIALIZED FACULTIES • 115 ACCREDITED DIPLOMAS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                Explore Academic Programs & Faculties
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
                Discover structured diploma blueprints across 22 industry sectors. Select a program track below to filter courses and view curriculum details.
              </p>
            </div>

            {/* Discovery Control Toolbar */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Filter Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsCategoryFilterModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Category Filter Modal</span>
                {selectedCategory !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>

              {/* Program Filter Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={programSearchQuery}
                  onChange={(e) => setProgramSearchQuery(e.target.value)}
                  placeholder="Filter programs..."
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-orange-500"
                />
                {programSearchQuery && (
                  <button
                    onClick={() => setProgramSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Program Cards Discovery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACADEMY_CATEGORIES.filter(cat => cat.id !== 'all').filter(cat => 
              programSearchQuery.trim() === '' ||
              cat.name.toLowerCase().includes(programSearchQuery.toLowerCase()) ||
              cat.shortName.toLowerCase().includes(programSearchQuery.toLowerCase()) ||
              cat.description.toLowerCase().includes(programSearchQuery.toLowerCase())
            ).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? 'border-orange-500/80 ring-2 ring-orange-500/20 shadow-lg bg-white dark:bg-slate-800'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-orange-500/40 hover:bg-white dark:hover:bg-slate-800/90 shadow-2xs hover:shadow-xl'
                  }`}
                >
                  {/* Subtle Top Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
                    isSelected ? 'bg-gradient-to-r from-orange-500 to-amber-500 opacity-100' : 'bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100'
                  }`} />

                  <div>
                    {/* Top Row: SVG Icon & Course Counter */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {renderOfficialProgramSvg(cat.id, "w-7 h-7")}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-xs border border-orange-500/30">
                          {cat.courseCount} Courses
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Program Title */}
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors font-display leading-snug">
                      {cat.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedLevel('all');
                        setSearchQuery('');
                        setCurrentPage(1);
                        const catalogElem = document.getElementById('courses-catalog');
                        if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-white dark:bg-slate-900 hover:bg-orange-600 hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{isSelected ? 'Viewing Category Courses' : 'Explore Program Courses'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MASTER COURSE CARDS CATALOG & PAGINATION SYSTEM */}
      {/* ========================================================================= */}
      <section id="courses-catalog" className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20">
                  Course Catalog
                </span>
                {selectedCategory !== 'all' && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Category: <strong className="text-slate-900 dark:text-white">{ACADEMY_CATEGORIES.find(c => c.id === selectedCategory)?.shortName}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 font-display">
                Accredited Course Curriculum ({filteredCourses.length})
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCategoryFilterModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-orange-500" />
                <span>Filter Categories</span>
              </button>

              {(selectedCategory !== 'all' || selectedLevel !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin scrollbar-thumb-orange-500">
            {ACADEMY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedLevel('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800'
                  }`}
                >
                  {renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                  <span>{cat.shortName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {cat.courseCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Category Programme -> Category -> Courses Hierarchy Banner */}
          {selectedCategory !== 'all' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-3xl bg-slate-900 text-white border border-orange-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/80 text-orange-400 flex items-center justify-center shrink-0 shadow-md">
                  {renderOfficialProgramSvg(selectedCategory, "w-8 h-8")}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/15 px-2.5 py-0.5 rounded border border-orange-500/30">
                      PROGRAMME CATEGORY
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Showing {filteredCourses.length} Accredited Courses
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                    {ACADEMY_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    {ACADEMY_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold border border-slate-700 transition-colors shrink-0 cursor-pointer flex items-center gap-2 shadow-sm relative z-10"
              >
                <X className="w-4 h-4 text-orange-400" />
                <span>Show All 115 Courses</span>
              </button>
            </motion.div>
          )}

          {/* Course Cards Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Programs Match Your Filter</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                Try searching for a broader term or reset category filters to view all 115 courses.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
              >
                Clear All Search Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Subtle top accent line on hover */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Header Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                            {renderCategoryIcon(course.iconBadge, 'w-4 h-4')}
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-extrabold border border-slate-200 dark:border-slate-700">
                            {course.code}
                          </span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                          course.level === 'Executive'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : course.level === 'Advanced'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                            : course.level === 'Intermediate'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {course.level}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug font-display">
                        {course.title}
                      </h3>

                      {/* Industry Tag & Format */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 mb-3">
                        <span className="text-orange-600 dark:text-orange-400 font-bold">{course.industry}</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>70% Practical</span>
                      </div>

                      {/* Course Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-6">
                        {course.description}
                      </p>
                    </div>

                    {/* Card Bottom: Pricing & Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex flex-col gap-1.5 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Tuition Fee</span>
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                            Fixed Matrix Rates
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs text-slate-400 font-semibold">From</span>
                          <div className="text-xl font-black text-slate-900 dark:text-white font-display">
                            ₦50,000
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                          1, 3, or 6 Months • Virtual, Physical or Hybrid
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedCourseModal(course)}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                          <span>Syllabus</span>
                        </button>

                        <button
                          onClick={() => setEnrollModalCourse(course)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Enroll Now</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Course Catalog Pagination Controls */}
              <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Showing <strong className="text-slate-900 dark:text-white">{((currentPage - 1) * coursesPerPage) + 1}</strong>–<strong className="text-slate-900 dark:text-white">{Math.min(currentPage * coursesPerPage, totalCoursesCount)}</strong> of <strong className="text-orange-600 dark:text-orange-400">{totalCoursesCount}</strong> Accredited Courses
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      const catalogElem = document.getElementById('courses-catalog');
                      if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          const catalogElem = document.getElementById('courses-catalog');
                          if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      const catalogElem = document.getElementById('courses-catalog');
                      if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* OFFICIAL FIXED ACADEMY TUITION & PRICING SCHEDULE */}
      {/* ========================================================================= */}
      <section id="pricing-matrix" className="py-20 bg-white dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
              OFFICIAL DSTA TUITION MATRIX • TRANSPARENT PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 font-display tracking-tight">
              Official Fixed Tuition Schedule
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Pricing for ALL 115+ DS Tech Academy courses is fixed and determined solely by your chosen <strong>programme duration</strong> and <strong>training mode</strong>. No hidden fees, no individual course markup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1 Month Card */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md hover:border-orange-500/50 transition-all flex flex-col justify-between relative">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider mb-4 border border-orange-500/20">
                  1-Month Intensive Foundations
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">1 Month Programme</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fast-track foundational mastery and core practical skill building.</p>

                <div className="my-6 space-y-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Virtual (Online Live)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦50,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Physical (Campus Lab)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦100,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Hybrid (Combined)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦150,000</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Comprehensive Core Syllabus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>70% Practical Lab Work & Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>DSTA Certificate of Completion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>24/7 Access to Student LMS Portal</span>
                  </li>
                </ul>
              </div>

              <a
                href="#courses-catalog"
                className="mt-8 w-full py-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-orange-600 dark:hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center"
              >
                <span>Select 1-Month Course</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* 3 Months Card (Featured) */}
            <div className="p-4 sm:p-8 rounded-3xl bg-gradient-to-b from-orange-500/5 via-amber-500/5 to-transparent border-2 border-orange-500 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                MOST POPULAR
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider mb-4 border border-orange-500/30">
                  3-Month Professional Diploma
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">3 Months Programme</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Professional masterclass with real-world capstone project & mentorship.</p>

                <div className="my-6 space-y-3 pt-6 border-t border-orange-500/20">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-orange-500/20">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Virtual (Online Live)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦100,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-orange-500/20">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Physical (Campus Lab)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦200,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-orange-500/20">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Hybrid (Combined)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦300,000</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Full Hands-on Practicals & Real Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Weekly 1-on-1 Faculty Mentorship</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Portfolio Defense & Industry Review</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Official CAC-Accredited DSTA Diploma (RC: 95)</span>
                  </li>
                </ul>
              </div>

              <a
                href="#courses-catalog"
                className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Select 3-Month Course</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* 6 Months Card */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md hover:border-orange-500/50 transition-all flex flex-col justify-between relative">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider mb-4 border border-purple-500/20">
                  6-Month Executive Mastery
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">6 Months Programme</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deep-dive apprenticeship with guaranteed paid internship placement pipeline.</p>

                <div className="my-6 space-y-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Virtual (Online Live)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦200,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Physical (Campus Lab)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦300,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Hybrid (Combined)</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-display">₦400,000</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Deep-dive Industry Apprenticeship</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Paid Graduate Internship Placement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Executive Leadership & Client Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Lifetime Alumni Network & Career Support</span>
                  </li>
                </ul>
              </div>

              <a
                href="#courses-catalog"
                className="mt-8 w-full py-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-orange-600 dark:hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center"
              >
                <span>Select 6-Month Course</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Payment Terms Callout */}
          <div className="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white font-bold text-sm block">Flexible 70% / 30% Tuition Payment Plan</strong>
                <span>Pay 70% initial deposit before classes commence, and complete the 30% balance before graduation.</span>
              </div>
            </div>
            <button
              onClick={() => setPathwayModal('student')}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm"
            >
              Enroll Now
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SPECIAL PATHWAYS & APPLICATION DOCKETS */}
      {/* ========================================================================= */}
      <section id="pathways" className="py-20 bg-white dark:bg-slate-900/50 border-t border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20">
              Special Programs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3 font-display">
              Select Your Learning & Career Pathway
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-3">
              Whether you are a new student, seasoned tutor, corporate team, or scholarship applicant, we have structured admission frameworks for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Pathway 1: Student Portal */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Student Admissions Portal</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Start your 10-step student registration docket. Select physical campuses in Abuja/Adamawa or join live virtual cohorts.
                </p>
              </div>
              <button
                onClick={() => setPathwayModal('student')}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-orange-600 dark:hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Student Admission Docket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pathway 2: Faculty Network */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Join DSTA Faculty Network</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Are you an experienced software engineer, cybersecurity lead, or creative media tutor? Apply across 24 faculty roles.
                </p>
              </div>
              <button
                onClick={() => setPathwayModal('tutor')}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-amber-600 dark:hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Faculty & Tutor Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pathway 3: Corporate Training */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-yellow-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Corporate & Executive Training</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Custom AI workflow automation, executive leadership retreats, digital transformation, and staff upskilling RFPs.
                </p>
              </div>
              <button
                onClick={() => setPathwayModal('corporate')}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-yellow-600 dark:hover:bg-yellow-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Corporate RFP Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pathway 4: Scholarship Fund */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">DSTA Scholarship Fund</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Partial and full tuition grant funding for passionate youth seeking 6-month digital diploma qualifications.
                </p>
              </div>
              <button
                onClick={() => setPathwayModal('scholarship')}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply for Scholarship Grant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pathway 5: Graduate Internship */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Graduate Internship Placement</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Automatic paid 3 to 6-month internship placements across DS Tech Agency and enterprise partner network for top graduates.
                </p>
              </div>
              <button
                onClick={() => setPathwayModal('internship')}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Internship Placement Docket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pathway 6: 1-on-1 Mentorship */}
            <div className="p-4 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">1-on-1 Executive Mentorship</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Weekly 1-on-1 advisory with senior tech directors for project code audits, career pathing, and CTO guidance.
                </p>
              </div>
              <button
                onClick={() => setPathwayModal('mentorship')}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-purple-600 dark:hover:bg-purple-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Executive Advisory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. EXECUTIVE LEADERSHIP & CEO MESSAGE */}
      {/* ========================================================================= */}
      <section id="faculty" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-4 sm:p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* CEO Info Column */}
              <div className="lg:col-span-5">
                <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20">
                  {CEO_MESSAGE.headline}
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display">
                  {CEO_MESSAGE.author}
                </h2>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {CEO_MESSAGE.title} • {CEO_MESSAGE.company}
                </div>
                
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic">
                  "{CEO_MESSAGE.quote}"
                </div>
              </div>

              {/* Message Content */}
              <div className="lg:col-span-7 space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {CEO_MESSAGE.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

            </div>

            {/* Core Values Grid */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CORE_VALUES.map((val, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    <span>{val.title}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHY CHOOSE DS TECH ACADEMY (ACCORDIONS) */}
      {/* ========================================================================= */}
      <section id="why-us" className="py-20 bg-white dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20">
              Institution Advantage
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display">
              Why Choose DS Tech Academy
            </h2>
          </div>

          <div className="space-y-4">
            {WHY_CHOOSE_US_ACCORDIONS.map((acc) => {
              const isOpen = activeAccordion === acc.id;
              return (
                <div
                  key={acc.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : acc.id)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-display">{acc.title}</span>
                    <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 sm:px-6 sm:pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/80 dark:border-slate-800 pt-4"
                      >
                        {acc.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PHYSICAL HUBS & CONSULTATION CONTACT */}
      {/* ========================================================================= */}
      <section id="campuses" className="py-20 bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20">
                Physical Campuses & Computer Hubs
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-display">
                Hands-on Computer Labs in Abuja & Adamawa
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed mb-8">
                Visit our physical campuses for high-speed fiber internet, dedicated computer workstations, podcast studio rooms, and direct instructor support.
              </p>

              <div className="space-y-6">
                
                {/* Abuja Head Office */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">Abuja Head Office (FCT)</h4>
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">Main Campus</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">
                      {CONTACT_DETAILS.headOffice}
                    </p>
                  </div>
                </div>

                {/* Adamawa Branch */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">Adamawa State Regional Hub</h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">North-East Campus</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">
                      {CONTACT_DETAILS.branchOffice}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Consultation Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative">
              <h3 className="text-2xl font-bold text-white mb-2 font-display">
                Need Help Selecting the Right Course?
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Our academic counselors will evaluate your current skill background and recommend the highest-yield career path for you.
              </p>

              <div className="space-y-4 mb-8">
                <a
                  href={`tel:${CONTACT_DETAILS.phone}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-orange-500/40 text-slate-200 transition-colors"
                >
                  <Phone className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-xs text-slate-400">Direct Admissions Hotline</div>
                    <div className="text-sm font-bold text-white">{CONTACT_DETAILS.phone}</div>
                  </div>
                </a>

                <a
                  href={`mailto:${CONTACT_DETAILS.emails[0]}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-orange-500/40 text-slate-200 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs text-slate-400">Official Admissions Desk Email</div>
                    <div className="text-sm font-bold text-white">{CONTACT_DETAILS.emails[0]}</div>
                  </div>
                </a>
              </div>

              <a
                href="https://wa.me/2349023489111?text=Hello%20DS%20Tech%20Academy,%20I%20need%20academic%20counseling%20to%20select%20the%20best%20course."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/30 flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat with Academic Counselor on WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DEDICATED ACADEMY FOOTER */}
      {/* ========================================================================= */}
      <footer className="no-print bg-slate-950 text-slate-400 border-t border-slate-800/80 py-12 sm:py-16 px-5 sm:px-8 lg:px-12 font-sans antialiased text-xs relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 sm:pb-12 border-b border-slate-800/70">
          
          <div className="md:col-span-5 space-y-4">
            <div className="inline-block cursor-pointer" onClick={() => onNavigate?.('/')}>
              <Logo size="sm" showText={true} variant="light" className="transition-opacity duration-200 hover:opacity-90" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
              DS Tech Academy (DSTA) is the official training division of DS Tech & Digital Marketing Ltd (RC: 95). Certified IT, AI, and digital media education with campuses in FCT Abuja and Adamawa State.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-200">Academic Navigation</h4>
            <ul className="text-xs space-y-2 text-slate-400 font-normal">
              <li><a href="#courses-catalog" className="hover:text-slate-100 transition-colors duration-150 block py-0.5">115+ Accredited Courses</a></li>
              <li><button onClick={() => setPathwayModal('student')} className="hover:text-slate-100 transition-colors duration-150 text-left cursor-pointer py-0.5">Student Admissions Portal</button></li>
              <li><button onClick={() => setPathwayModal('tutor')} className="hover:text-slate-100 transition-colors duration-150 text-left cursor-pointer py-0.5">Faculty Application</button></li>
              <li><button onClick={() => setPathwayModal('scholarship')} className="hover:text-slate-100 transition-colors duration-150 text-left cursor-pointer py-0.5">Scholarship Fund</button></li>
              <li><button onClick={() => setPathwayModal('corporate')} className="hover:text-slate-100 transition-colors duration-150 text-left cursor-pointer py-0.5">Corporate Upskilling RFPs</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-200">Campus Locations</h4>
            <div className="text-xs space-y-2.5 text-slate-400 font-normal">
              <p><strong className="text-slate-200 font-medium">Abuja Main Campus:</strong> {CONTACT_DETAILS.headOffice}</p>
              <p><strong className="text-slate-200 font-medium">Adamawa Regional Hub:</strong> {CONTACT_DETAILS.branchOffice}</p>
              <p><strong className="text-slate-200 font-medium">Direct Line:</strong> {CONTACT_DETAILS.phone}</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} DS Tech Academy. All Rights Reserved. CAC Reg: RC 95.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate?.('/')} className="hover:text-slate-300 transition-colors cursor-pointer">
              DS Tech Agency Main Site
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: PROGRAM SYLLABUS & DETAILS MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedCourseModal && (
          <div 
            onClick={() => setSelectedCourseModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 border-b border-slate-800 relative">
                <button
                  onClick={() => setSelectedCourseModal(null)}
                  className="absolute right-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4 pr-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
                    {renderCategoryIcon(selectedCourseModal.iconBadge, 'w-7 h-7')}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-xs font-bold font-mono">
                        {selectedCourseModal.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                        {selectedCourseModal.categoryName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                        70% Practical / 30% Theory
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                      {selectedCourseModal.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-300 text-sm">
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-orange-400 mb-2">
                    Program Overview
                  </h4>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedCourseModal.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-orange-400 mb-3">
                    What You Will Master (Learning Outcomes)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedCourseModal.learningOutcomes.map((outcome, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-300">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-orange-400 mb-3">
                    Curriculum & Lab Modules Breakdown
                  </h4>
                  <div className="space-y-3">
                    {selectedCourseModal.modules.map((mod, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-orange-400 font-mono">{mod.weekOrModule}</span>
                          <span className="text-xs font-bold text-white">{mod.title}</span>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-400 mt-2">
                          {mod.topics.map((t, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Target Audience</span>
                    </h5>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {selectedCourseModal.targetAudience.map((aud, i) => (
                        <li key={i}>• {aud}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Verifiable Certification</span>
                    </h5>
                    <p className="text-xs text-slate-300 font-medium">
                      {selectedCourseModal.certificateType}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Includes cryptographic QR verification & official CAC institution seal.
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-extrabold tracking-wider block">Official Tuition Matrix Rate</span>
                  <div className="text-2xl font-black text-orange-400 font-display">
                    From ₦50,000
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Select 1, 3, or 6 Months & Virtual, Physical, or Hybrid mode upon enrollment.
                  </span>
                </div>

                <button
                  onClick={() => {
                    const course = selectedCourseModal;
                    setSelectedCourseModal(null);
                    setEnrollModalCourse(course);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Enroll In This Program</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: DIRECT ENROLLMENT & MANDATORY STUDENT VERIFICATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {enrollModalCourse && (
          <AcademyEnrollmentModal
            course={enrollModalCourse}
            isOpen={Boolean(enrollModalCourse)}
            onClose={() => setEnrollModalCourse(null)}
            onNavigateToRegistration={(courseId) => {
              setEnrollModalCourse(null);
              onNavigate?.('/student-registration');
            }}
            onNavigateToDashboard={() => {
              setEnrollModalCourse(null);
              onNavigate?.('/student-dashboard');
            }}
          />
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: PATHWAY MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {pathwayModal && (
          <div 
            onClick={() => setPathwayModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100"
            >
              <button
                onClick={() => setPathwayModal(null)}
                className="absolute right-5 top-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {pathwayModal === 'student' && (
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Student Admission Portal</h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Ready to begin your training? Browse the 115+ course list, choose your physical or virtual cohort, and reserve your desk.
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPathwayModal(null);
                        onNavigate?.('/student-registration');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Start 10-Step Student Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a
                      href="#courses-catalog"
                      onClick={() => setPathwayModal(null)}
                      className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <span>Browse All 115+ Courses</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {pathwayModal === 'tutor' && (
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Join DSTA Faculty Network</h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    We invite seasoned software engineers, digital marketing leads, certified cybersecurity analysts, and media creators to join our faculty network across 24 instructor categories.
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPathwayModal(null);
                        onNavigate?.('/tutor-application');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Start 9-Step Faculty Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {pathwayModal === 'corporate' && (
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Corporate & Executive Training</h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Empower your company or government agency with bespoke digital literacy, AI workflow automation, executive leadership, and cybersecurity workshops tailored specifically to your goals.
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPathwayModal(null);
                        onNavigate?.('/corporate-training');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Open Corporate RFP Request Form</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                </div>
              )}

              {pathwayModal === 'scholarship' && (
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">DSTA Scholarship Fund</h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Through the DS Tech CSR initiative, we provide partial and full tuition scholarships for passionate, underprivileged youth seeking high-income tech skills.
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPathwayModal(null);
                        onNavigate?.('/scholarship-application');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Start Scholarship Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {pathwayModal === 'internship' && (
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Graduate Internship Placement</h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Outstanding graduates of DS Tech Academy receive automatic 3 to 6-month paid internship placements across the DS Tech Agency and our network of enterprise partners.
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPathwayModal(null);
                        onNavigate?.('/internship-application');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Complete Internship Placement Docket</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {pathwayModal === 'mentorship' && (
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">1-on-1 Executive Mentorship</h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Get paired with senior tech directors and researchers for personalized weekly advisory, project code audits, and targeted career progression strategies.
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPathwayModal(null);
                        onNavigate?.('/mentorship-application');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Open Mentorship Booking Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: CATEGORY & FACULTY FILTER MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCategoryFilterModalOpen && (
          <div 
            onClick={() => setIsCategoryFilterModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                    <Sliders className="w-4 h-4" />
                    <span>PROGRAM FILTER SYSTEM</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-display">
                    Filter Faculties & Course Tracks
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select a faculty or difficulty level to narrow down our 115 accredited courses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCategoryFilterModalOpen(false)}
                  className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search & Filter Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                
                {/* Search Bar & Level Selector */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={categoryFilterSearch}
                      onChange={(e) => setCategoryFilterSearch(e.target.value)}
                      placeholder="Search faculty or category name..."
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                    {categoryFilterSearch && (
                      <button
                        onClick={() => setCategoryFilterSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-orange-500"
                    >
                      <option value="all">All Difficulty Levels</option>
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Advanced">Advanced Level</option>
                      <option value="All Levels">All Levels Welcome</option>
                      <option value="Executive">Executive / CEO Level</option>
                    </select>
                  </div>
                </div>

                {/* Faculties Selection Grid */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Choose Faculty Category ({ACADEMY_CATEGORIES.length - 1} Faculties Available)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ACADEMY_CATEGORIES.filter(cat => 
                      categoryFilterSearch.trim() === '' ||
                      cat.name.toLowerCase().includes(categoryFilterSearch.toLowerCase()) ||
                      cat.shortName.toLowerCase().includes(categoryFilterSearch.toLowerCase()) ||
                      cat.description.toLowerCase().includes(categoryFilterSearch.toLowerCase())
                    ).map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setCurrentPage(1);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/30'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-orange-500/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            {renderOfficialProgramSvg(cat.id, "w-5 h-5")}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                {cat.shortName}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                                isSelected
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                                {cat.courseCount}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Action Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Matches <strong className="text-orange-600 dark:text-orange-400 font-extrabold">{filteredCourses.length}</strong> accredited courses
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedLevel('all');
                      setSearchQuery('');
                      setCategoryFilterSearch('');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryFilterModalOpen(false);
                      const catalogElem = document.getElementById('courses-catalog');
                      if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    Apply Filter ({filteredCourses.length} Courses)
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
