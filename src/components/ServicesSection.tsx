import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MessageSquare, ArrowUpRight, ArrowRight, Sparkles, 
  Layers, Database, Laptop, Bot, LineChart, Cpu, Fingerprint, HelpCircle,
  ArrowLeft, Sun, Moon
} from 'lucide-react';
import { SERVICES, ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { ServiceDetailView } from './ServiceDetailView';
import { ServiceCard } from './ServiceCard';
import { CustomQuoteModal } from './CustomQuoteModal';
import { apiGetServices, apiInitializeServices, resolveImageUrl, apiSubscribeToServices } from '../lib/api';
import { getPolishedServiceImage } from '../lib/mediaUtils';
import { Logo } from './Logo';

interface ServicesSectionProps {
  language: LanguageCode;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onBackToMain?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  language, 
  selectedId, 
  onSelectId,
  onBackToMain,
  theme,
  onToggleTheme
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (theme) return theme === 'dark';
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
      } catch (e) {}
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(8);
  const [quoteModalService, setQuoteModalService] = useState<ServiceItem | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Sync theme with parent prop
  useEffect(() => {
    if (theme) {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      setIsDarkMode(prev => {
        const next = !prev;
        if (next) {
          document.documentElement.classList.add('dark');
          try { localStorage.setItem('theme', 'dark'); } catch (e) {}
        } else {
          document.documentElement.classList.remove('dark');
          try { localStorage.setItem('theme', 'light'); } catch (e) {}
        }
        return next;
      });
    }
  };

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
      console.error('Failed to parse admin_services from localStorage:', e);
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

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'web':
      case 'software':
      case 'development': 
        return <Laptop className="w-4 h-4 text-sky-500" />;
      case 'marketing': 
        return <LineChart className="w-4 h-4 text-orange-500" />;
      case 'ai': 
        return <Bot className="w-4 h-4 text-teal-500" />;
      case 'branding':
      case 'business': 
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'ict':
      case 'security': 
        return <Fingerprint className="w-4 h-4 text-emerald-500" />;
      default: 
        return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  const getServiceImage = (svc: ServiceItem) => {
    return getPolishedServiceImage(svc);
  };

  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedId) || null;
  }, [selectedId, services]);

  const categories = useMemo(() => {
    const defaultCats = [
      { id: 'all', label: language === 'zh' ? '全部' : 'All Services' },
      { id: 'web', label: 'Web & Apps' },
      { id: 'marketing', label: 'Marketing & SEO' },
      { id: 'ai', label: 'AI & Automation' },
      { id: 'branding', label: 'Branding & Media' },
      { id: 'ict', label: 'CyberSecurity & IT' }
    ];
    return defaultCats;
  }, [language]);

  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      let matchCat = activeCategory === 'all';
      if (activeCategory === 'web') matchCat = svc.category === 'web' || svc.category === 'software';
      else if (activeCategory === 'marketing') matchCat = svc.category === 'marketing';
      else if (activeCategory === 'ai') matchCat = svc.category === 'ai';
      else if (activeCategory === 'branding') matchCat = svc.category === 'branding' || svc.category === 'business';
      else if (activeCategory === 'ict') matchCat = svc.category === 'ict';
      
      const matchSearch = (svc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (svc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: services.length };
    services.forEach(svc => {
      if (svc.category === 'web' || svc.category === 'software') counts['web'] = (counts['web'] || 0) + 1;
      if (svc.category === 'marketing') counts['marketing'] = (counts['marketing'] || 0) + 1;
      if (svc.category === 'ai') counts['ai'] = (counts['ai'] || 0) + 1;
      if (svc.category === 'branding' || svc.category === 'business') counts['branding'] = (counts['branding'] || 0) + 1;
      if (svc.category === 'ict') counts['ict'] = (counts['ict'] || 0) + 1;
    });
    return counts;
  }, [services]);

  if (selectedId && selectedService) {
    return (
      <ServiceDetailView 
        service={selectedService} 
        onBack={() => onSelectId(null)} 
        language={language}
        getServiceImage={getServiceImage}
        getCategoryIcon={getCategoryIcon}
      />
    );
  }

  const displayedServices = filteredServices.slice(0, visibleCount);

  const uiText = {
    en: {
      titlePrefix: 'Our',
      titleSuffix: 'Services',
      desc: 'Discover our comprehensive suite of digital solutions, engineered to transform businesses into industry leaders through advanced technology and strategic execution.',
      searchPlaceholder: 'Search all 26 professional services...',
      statusActive: 'active solutions',
      noFound: 'No matching services found',
      noFoundDesc: 'Try adjusting your filters or search terms.',
      loadMore: 'Load More Services'
    },
    zh: {
      titlePrefix: 'Iwe',
      titleSuffix: 'Iṣẹ',
      desc: 'Ṣawari iwe-akọsilẹ ode-oni, ti o gbooro, ati ti o ni ibamu ofin. Wo awọn idiyele ati ṣe iwe adehun pẹlu awọn alakoso wa nipasẹ WhatsApp.',
      searchPlaceholder: 'Ṣawari gbogbo awọn iṣẹ amọdaju 26...',
      statusActive: 'awọn ojutu lọwọ lọwọ',
      noFound: 'Ko si iṣẹ ti o baamu ti a rii',
      noFoundDesc: 'Gbiyanju lati ṣatunṣe awọn asẹ rẹ tabi awọn ọrọ bincike.',
      loadMore: 'Gba Diẹ Ninu Awọn Iṣẹ'
    }
  };

  const currentUi = uiText[language] || uiText.en;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative flex flex-col w-full`}>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-8 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToMain}>
            <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            type="button"
            onClick={() => {
              setQuoteModalService(services[0] || null);
              setIsQuoteModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <MessageSquare size={13} />
            <span className="hidden sm:inline">Request Quote</span>
            <span className="sm:hidden">Quote</span>
          </button>

          {onBackToMain && (
            <button
              type="button"
              onClick={onBackToMain}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              title="Back to Main Site"
            >
              <ArrowLeft size={15} className="text-orange-500" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-slate-500">Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-12 animate-fade-in text-left relative">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>ELITE CATALOG</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase font-display tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            {currentUi.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 font-extrabold italic">{currentUi.titleSuffix}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl font-normal">
            {currentUi.desc}
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="space-y-6">
          
          {/* Interactive Search input & Statistics bar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
            <div className="relative w-full md:max-w-md bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-1.5 flex items-center shadow-inner">
              <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(8); // reset pagination
                }}
                placeholder={currentUi.searchPlaceholder} 
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 py-1.5"
              />
            </div>
            
            <div className="flex items-center gap-2 px-1 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>{filteredServices.length} {language === 'zh' ? currentUi.statusActive : `of ${services.length} ${currentUi.statusActive}`}</span>
            </div>
          </div>

          {/* Elegant Bento Category Selector Grid - Restructured for supreme usability */}
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setVisibleCount(8); // reset pagination
                  }}
                  className={`p-3.5 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-24 border ${
                    isActive
                      ? 'bg-[#000E32] dark:bg-orange-600 text-white border-transparent shadow-lg shadow-orange-500/10'
                      : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-850 hover:border-orange-500/30'
                  }`}
                  type="button"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className={`p-1.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800'}`}>
                      {cat.id === 'all' ? <Layers className="w-4 h-4 text-orange-500" /> : getCategoryIcon(cat.id)}
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-850 text-slate-500'}`}>
                      {count}
                    </span>
                  </div>
                  <span className={`text-[11px] font-extrabold uppercase tracking-tight line-clamp-1 leading-none ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Custom Fade Track Mobile Scroller */}
          <div className="relative w-full block sm:hidden">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent pointer-events-none z-10" />
            
            <div className="flex overflow-x-auto scrollbar-none gap-2 py-1 px-4">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={`scroll-${cat.id}`}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setVisibleCount(8);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 text-slate-600 dark:text-slate-300'
                    }`}
                    type="button"
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SERVICES BENTO GRID */}
        {filteredServices.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900/35 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle size={36} className="mx-auto text-slate-400 animate-bounce" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{currentUi.noFound}</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px]">{currentUi.noFoundDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <AnimatePresence mode="popLayout">
              {displayedServices.map((svc, index) => (
                <ServiceCard 
                  key={svc.id}
                  svc={svc}
                  index={index}
                  language={language}
                  onSelect={onSelectId}
                  getCategoryIcon={getCategoryIcon}
                  getServiceImage={getServiceImage}
                  onCustomQuote={(s) => {
                    setQuoteModalService(s);
                    setIsQuoteModalOpen(true);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Custom Quote Modal */}
        <CustomQuoteModal 
          isOpen={isQuoteModalOpen} 
          onClose={() => setIsQuoteModalOpen(false)} 
          initialService={quoteModalService} 
          allServices={services} 
          language={language} 
        />

        {/* LOAD MORE BUTTON */}
        {filteredServices.length > visibleCount && (
          <div className="flex justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-2"
            >
              <span>{currentUi.loadMore}</span>
              <Layers size={13} />
            </motion.button>
          </div>
        )}
      </main>
    </div>
  );
};
