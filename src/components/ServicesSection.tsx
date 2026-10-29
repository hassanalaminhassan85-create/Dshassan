import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MessageSquare, Sparkles, 
  Layers, Laptop, Bot, LineChart, Cpu, Fingerprint, HelpCircle,
  ArrowLeft, Sun, Moon
} from 'lucide-react';
import { SERVICES, ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';
import { ServiceCard } from './ServiceCard';
import { apiSubscribeToServices } from '../lib/api';
import { getPolishedServiceImage } from '../lib/mediaUtils';
import { getServiceSlug } from '../lib/quoteUtils';
import { Logo } from './Logo';

interface ServicesSectionProps {
  language: LanguageCode;
  onNavigateToQuote?: (slug: string) => void;
  onBackToMain?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  language, 
  onNavigateToQuote,
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

  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'All Services' },
      { id: 'web', label: 'Web & Apps' },
      { id: 'marketing', label: 'Marketing & Ads' },
      { id: 'ai', label: 'AI & Automation' },
      { id: 'branding', label: 'Branding & Media' },
      { id: 'ict', label: 'CyberSecurity & IT' }
    ];
  }, []);

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

  const handleSelectServiceSlug = (slug: string) => {
    if (onNavigateToQuote) {
      onNavigateToQuote(slug);
    } else {
      const path = `/quote/${slug}`;
      try {
        window.history.pushState(null, '', path);
        window.dispatchEvent(new Event('popstate'));
      } catch (e) {
        window.location.href = path;
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative flex flex-col w-full`}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-8 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToMain}>
            <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onBackToMain && (
            <button
              type="button"
              onClick={onBackToMain}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              title="Back to Main Site"
            >
              <ArrowLeft size={15} className="text-orange-500" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Back Home</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-xs"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 animate-fade-in text-left relative">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* Page Header matching Careers Page Styling */}
        <div className="space-y-3">
          <span className="text-orange-500 text-xs uppercase tracking-widest font-black">CORE SERVICES MARKETPLACE</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
            Digital Solutions &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Engineering Catalog</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl font-light">
            Explore our 16 core services. Click any service card or action below to open its dedicated quotation portal.
          </p>
        </div>

        {/* Search & Category Filter Chips styled to match Careers page design language */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/80 dark:bg-slate-900/80 p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Search Box */}
          <div className="relative w-full md:max-w-xs bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-1.5 flex items-center shadow-inner">
            <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search core services..." 
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 py-1"
            />
          </div>

          {/* Category Filter Chips matching Careers Page */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#000E32] dark:bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60'
                  }`}
                  type="button"
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SERVICES RESPONSIVE GRID */}
        {/* Mobile: 2 columns when available width permits comfortable cards; Tablet: 2 or 3; Desktop: 3 or 4 */}
        {filteredServices.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900/35 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle size={36} className="mx-auto text-slate-400 animate-pulse" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">No matching services found</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px]">Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((svc, index) => (
                <ServiceCard 
                  key={svc.id}
                  svc={svc}
                  index={index}
                  language={language}
                  onSelect={(slug) => handleSelectServiceSlug(slug)}
                  getCategoryIcon={getCategoryIcon}
                  getServiceImage={getServiceImage}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>
    </div>
  );
};
