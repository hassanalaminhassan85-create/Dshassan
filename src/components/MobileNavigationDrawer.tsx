import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Home, Info, Briefcase, Image as ImageIcon, Users, Star, FileText, 
  GraduationCap, Award, UserCheck, Building2, ChevronRight, CreditCard, 
  ShieldAlert, BookOpen, Globe, Sun, Moon, Check, Search, 
  Sparkles, Layers, UserPlus, ArrowUpRight
} from 'lucide-react';
import { Logo } from './Logo';
import { PaystackPayButton } from './PaystackMotionCheckout';
import { LANGUAGES, LanguageCode } from '../lib/translations';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (path: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isAdminView: boolean;
  navigateToAdmin: () => void;
  navigateToRoot: () => void;
  t: any;
  onOpenContact?: () => void;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  language,
  setLanguage,
  theme,
  setTheme,
  isAdminView,
  navigateToAdmin,
  navigateToRoot,
  t,
  onOpenContact
}) => {
  const [isLangExpanded, setIsLangExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'main' | 'academy' | 'portals'>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    } else {
      setSearchQuery('');
      setIsLangExpanded(false);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  // Structured Menu Items Catalog
  const mainNavItems = [
    { label: 'Home', value: 'home', path: '/', icon: Home, category: 'main' },
    { label: 'About Us', value: 'about', path: '/about', icon: Info, category: 'main' },
    { label: 'Services', value: 'services', path: '/services', icon: Layers, category: 'main' },
    { label: 'Portfolio', value: 'portfolio', path: '/portfolio', icon: ImageIcon, category: 'main' },
    { label: 'Our Team', value: 'team', path: '/team', icon: Users, category: 'main' },
    { label: 'Clients & Partners', value: 'clients', path: '/clients', icon: Star, category: 'main' },
    { label: 'Blog & News', value: 'blog', path: '/blog', icon: FileText, category: 'main' },
  ];

  const resourceNavItems = [
    { label: 'DS TECH Academy', value: 'academy-overview', path: '/academy-overview', icon: GraduationCap, category: 'academy' },
    { label: 'Recognition & Trust', value: 'recognition', path: '/recognition', icon: Award, category: 'main' },
    { label: 'Careers & Vacancies', value: 'careers', path: '/careers', icon: Briefcase, badge: 'Hiring', category: 'main' },
  ];

  const applicationNavItems = [
    { label: 'Student Registration (10 Steps)', value: 'student-registration', path: '/student-registration', icon: UserCheck, tag: 'Enroll', category: 'academy' },
    { label: 'Faculty & Tutor Application', value: 'tutor-application', path: '/tutor-application', icon: Award, tag: '24 Roles', category: 'academy' },
  ];

  // 4 Official Academy Forms Catalog
  const academyFourForms = [
    {
      id: 'form-1',
      formNumber: 'Form 01',
      title: 'Student Registration Form',
      subtitle: '10-Step Online Course Enrollment & Physical Desk Reservation',
      path: '/student-registration',
      value: 'student-registration',
      icon: UserCheck,
      badge: 'Enroll',
      category: 'academy'
    },
    {
      id: 'form-2',
      formNumber: 'Form 02',
      title: 'Faculty & Tutor Application',
      subtitle: '24 Specialized Disciplines across Technical & Digital Sectors',
      path: '/tutor-application',
      value: 'tutor-application',
      icon: Award,
      badge: 'Faculty',
      category: 'academy'
    },
    {
      id: 'form-3',
      formNumber: 'Form 03',
      title: 'CSR Scholarship Fund',
      subtitle: 'Full & Partial Tuition Assistance Grants for Eligible Scholars',
      path: '/scholarship-application',
      value: 'scholarship-application',
      icon: GraduationCap,
      badge: 'Grant',
      category: 'academy'
    },
    {
      id: 'form-4',
      formNumber: 'Form 04',
      title: 'Corporate Training RFP',
      subtitle: 'Enterprise Workforce Upskilling Proposals & Retainer Specs',
      path: '/corporate-training',
      value: 'corporate-training',
      icon: Building2,
      badge: 'Enterprise',
      category: 'academy'
    }
  ];

  const gridProgramItems = [
    { label: 'Internship Form', value: 'internship-application', path: '/internship-application', icon: Briefcase, category: 'academy' },
    { label: '1-on-1 Mentorship', value: 'mentorship-application', path: '/mentorship-application', icon: UserPlus, category: 'academy' },
  ];

  const systemPortals = [
    { label: 'Student Dashboard', value: 'student-dashboard', path: '/student-dashboard', icon: BookOpen, category: 'portals' },
    { label: 'Faculty / Tutor Portal', value: 'tutor-dashboard', path: '/tutor-dashboard', icon: Award, category: 'portals' },
    { label: 'Client Dashboard', value: 'account', path: '/account', icon: Briefcase, category: 'portals' },
    { label: 'Staff Cockpit', value: 'staff-portal', path: '/staff-portal', icon: Layers, category: 'portals' },
  ];

  // Flattened items for instant search matching
  const allSearchableItems = useMemo(() => {
    return [
      ...mainNavItems.map(i => ({ ...i, section: 'Main Navigation' })),
      ...resourceNavItems.map(i => ({ ...i, section: 'Resources' })),
      ...applicationNavItems.map(i => ({ ...i, section: 'Admissions' })),
      ...gridProgramItems.map(i => ({ ...i, section: 'Programs' })),
      ...systemPortals.map(i => ({ ...i, section: 'Portals' })),
    ];
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return allSearchableItems.filter(item => 
      item.label.toLowerCase().includes(query) || 
      item.section.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query)
    );
  }, [searchQuery, allSearchableItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[99] bg-slate-950/20 dark:bg-black/50 backdrop-blur-[2px] cursor-pointer"
            aria-hidden="true"
          />

          {/* Floating Premium Menu Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
            className="fixed top-16 sm:top-20 right-3 sm:right-6 lg:right-10 z-[100] w-[92vw] sm:w-[72vw] md:w-[54vw] lg:w-[48vw] xl:w-[42vw] max-w-[620px] min-w-[320px] h-[58vh] min-h-[460px] max-h-[640px] sm:max-h-[680px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/10 dark:shadow-black/70 flex flex-col justify-between overflow-hidden font-sans selection:bg-orange-500 selection:text-white"
          >
            {/* PANEL HEADER */}
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
              <div 
                className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-85 shrink min-w-0"
                onClick={() => handleLinkClick('/')}
              >
                <Logo size="sm" showText={true} variant={theme === 'dark' ? 'light' : 'dark'} className="shrink min-w-0" />
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
                  Menu
                </span>
              </div>

              {/* Close Button & Shortcut */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  ESC
                </span>
                <button
                  onClick={onClose}
                  type="button"
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* SEARCH / FILTER COMMAND BAR */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, courses, portals..."
                  className="w-full bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/80 dark:border-slate-700/60 rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:border-orange-500/60 dark:focus:border-orange-500/60 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    type="button"
                    className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Segmented Pills (Visible when not searching) */}
              {!searchQuery && (
                <div className="flex items-center gap-1 mt-2 overflow-x-auto no-scrollbar pt-0.5">
                  {(['all', 'main', 'academy', 'portals'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      type="button"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-tight transition-all shrink-0 capitalize ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat === 'all' ? 'All Sections' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SCROLLABLE MENU BODY */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              
              {/* SEARCH RESULTS VIEW */}
              {searchQuery ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1 mb-2">
                    Found {filteredItems.length} matching result{filteredItems.length === 1 ? '' : 's'}
                  </div>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isActive = activePage === item.value;
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleLinkClick(item.path)}
                          type="button"
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                            isActive
                              ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComponent size={15} className={isActive ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'} />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                              {item.section}
                            </span>
                            <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      No menu items match "{searchQuery}"
                    </div>
                  )}
                </div>
              ) : (
                /* NORMAL CATEGORIZED VIEW */
                <>
                  {/* SECTION 1: MAIN NAVIGATION */}
                  {(selectedCategory === 'all' || selectedCategory === 'main') && (
                    <div className="space-y-1">
                      <div className="px-1 mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                        <span>MAIN PAGES</span>
                      </div>
                      <div className="space-y-0.5">
                        {mainNavItems.map((item) => {
                          const isActive = activePage === item.value;
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={item.value}
                              onClick={() => handleLinkClick(item.path)}
                              type="button"
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between relative group ${
                                isActive
                                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isActive && (
                                  <div className="w-0.5 h-3.5 bg-orange-500 rounded-full" />
                                )}
                                <IconComponent 
                                  size={15} 
                                  className={isActive ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors'} 
                                />
                                <span>{item.label}</span>
                              </div>
                              <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: ACADEMY & ADMISSIONS */}
                  {(selectedCategory === 'all' || selectedCategory === 'academy') && (
                    <div className="space-y-2">
                      <div className="px-1 mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                        <span>RESOURCES & ACADEMY</span>
                      </div>

                      {/* Clean DS TECH Academy Spotlight Banner */}
                      <div
                        onClick={() => handleLinkClick('/academy-overview')}
                        className="p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white cursor-pointer hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                              <GraduationCap size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                                DS TECH ACADEMY
                              </div>
                              <p className="text-[11px] text-slate-400">
                                115+ Practical Courses • 22 Sectors
                              </p>
                            </div>
                          </div>
                          <ArrowUpRight size={14} className="text-slate-400 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </div>

                      {/* Resource Items */}
                      <div className="space-y-0.5">
                        {resourceNavItems.map((item) => {
                          const isActive = activePage === item.value;
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={item.value}
                              onClick={() => handleLinkClick(item.path)}
                              type="button"
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                                isActive
                                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isActive && (
                                  <div className="w-0.5 h-3.5 bg-orange-500 rounded-full" />
                                )}
                                <IconComponent size={15} className={isActive ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'} />
                                <span>{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.badge && (
                                  <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 border border-orange-200/50 dark:border-orange-800/50">
                                    {item.badge}
                                  </span>
                                )}
                                <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Admissions Grid - 4 Official Forms */}
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                            4 OFFICIAL ACADEMY FORMS
                          </span>
                          <span className="text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-200/50 dark:border-orange-800/40">
                            Verified
                          </span>
                        </div>

                        {/* 4 Official Forms Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {academyFourForms.map((form) => {
                            const isActive = activePage === form.value;
                            const IconComponent = form.icon;
                            return (
                              <button
                                key={form.id}
                                onClick={() => handleLinkClick(form.path)}
                                type="button"
                                className={`w-full text-left p-2.5 rounded-xl transition-all border group relative overflow-hidden ${
                                  isActive
                                    ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
                                    : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/70 text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <IconComponent 
                                      size={14} 
                                      className={isActive ? 'text-white' : 'text-orange-500'} 
                                    />
                                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                                      isActive ? 'text-orange-100' : 'text-orange-600 dark:text-orange-400'
                                    }`}>
                                      {form.formNumber}
                                    </span>
                                  </div>
                                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                    isActive 
                                      ? 'bg-white/20 text-white' 
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}>
                                    {form.badge}
                                  </span>
                                </div>
                                <div className={`text-xs font-bold truncate ${
                                  isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                                }`}>
                                  {form.title}
                                </div>
                                <div className={`text-[10px] truncate mt-0.5 ${
                                  isActive ? 'text-orange-100' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                  {form.subtitle}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Secondary Program Pathways */}
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          {gridProgramItems.map((item) => {
                            const isActive = activePage === item.value;
                            const IconComponent = item.icon;
                            return (
                              <button
                                key={item.value}
                                onClick={() => handleLinkClick(item.path)}
                                type="button"
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] transition-all flex items-center gap-1.5 border truncate ${
                                  isActive
                                    ? 'bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-semibold border-slate-300 dark:border-slate-700'
                                    : 'border-slate-200/70 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                <IconComponent size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: SYSTEM PORTALS */}
                  {(selectedCategory === 'all' || selectedCategory === 'portals') && (
                    <div className="space-y-1">
                      <div className="px-1 mb-1.5 flex items-center justify-between text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                        <span>SYSTEM PORTALS</span>
                      </div>
                      <div className="space-y-0.5">
                        {systemPortals.map((item) => {
                          const isActive = activePage === item.value;
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={item.value}
                              onClick={() => handleLinkClick(item.path)}
                              type="button"
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                                isActive
                                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isActive && (
                                  <div className="w-0.5 h-3.5 bg-orange-500 rounded-full" />
                                )}
                                <IconComponent size={15} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                                <span>{item.label}</span>
                              </div>
                              <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })}

                        {/* Admin Suite Button */}
                        <button
                          onClick={() => {
                            if (isAdminView) {
                              navigateToRoot();
                            } else {
                              navigateToAdmin();
                            }
                            onClose();
                          }}
                          type="button"
                          className="w-full mt-1 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert size={14} className="text-orange-400" />
                            <span>{isAdminView ? t.portalTitle : t.adminTitle}</span>
                          </div>
                          <span className="text-[9px] font-mono text-orange-400 uppercase font-bold">Access</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* RETAINER & CONTACT CARD */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">DS TECH Client Retainers</span>
                      <Sparkles size={14} className="text-orange-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Instant settlement for milestones, retainer deposits, or custom engineering inquiries.
                    </p>
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <PaystackPayButton
                        amount={50000}
                        email="client@dstech.agency"
                        customerName="DS Tech Client"
                        title="DS Tech Instant Deposit"
                        description="Service retainer or milestone deposit"
                        variant="dark"
                        className="px-3 py-1.5 text-[11px] font-medium"
                      >
                        <CreditCard size={12} />
                        <span>Retainer Settlement</span>
                      </PaystackPayButton>

                      <button
                        onClick={() => {
                          if (onOpenContact) {
                            onOpenContact();
                          } else {
                            handleLinkClick('/about');
                          }
                        }}
                        type="button"
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        Contact Us
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* PANEL UTILITY FOOTER */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 space-y-2 shrink-0">
              
              <div className="flex items-center justify-between gap-2">
                {/* Language Selector Dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setIsLangExpanded(!isLangExpanded)}
                    type="button"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-1.5">
                      <Globe size={13} className="text-slate-400" />
                      <span className="text-xs">
                        {LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.label}
                      </span>
                    </div>
                    <ChevronRight size={12} className={`text-slate-400 transition-transform ${isLangExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isLangExpanded && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full mb-1.5 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1 max-h-44 overflow-y-auto z-50"
                      >
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLangExpanded(false);
                            }}
                            type="button"
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                              language === lang.code
                                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </span>
                            {language === lang.code && <Check size={12} className="text-orange-500" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme Switcher Toggle */}
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  type="button"
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  {theme === 'light' ? (
                    <>
                      <Sun size={13} className="text-amber-500" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={13} className="text-indigo-400" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sub-footer Metadata */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>© {new Date().getFullYear()} DS TECH AGENCY</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Systems
                </span>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
