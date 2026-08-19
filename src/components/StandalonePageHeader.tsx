import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, ArrowLeft, Menu, X, ChevronRight, Sparkles, 
  Briefcase, Award, Info, BookOpen, Layers, PhoneCall
} from 'lucide-react';
import { Logo } from './Logo';

interface StandalonePageHeaderProps {
  activePage: 'portfolio' | 'recognition' | 'about' | 'blog' | string;
  badgeText?: string;
  onBackToMain?: () => void;
  extraActions?: React.ReactNode;
}

export const StandalonePageHeader: React.FC<StandalonePageHeaderProps> = ({
  activePage,
  badgeText,
  onBackToMain,
  extraActions
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    } catch {
      return true;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navigate = (path: string) => {
    setIsMobileMenuOpen(false);
    try {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      window.location.href = path;
    }
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Layers, key: 'home' },
    { label: 'Portfolio', path: '/portfolio', icon: Briefcase, key: 'portfolio' },
    { label: 'Accreditations', path: '/recognition', icon: Award, key: 'recognition' },
    { label: 'About Us', path: '/about', icon: Info, key: 'about' },
    { label: 'Blog Intel', path: '/blog', icon: BookOpen, key: 'blog' },
    { label: 'Services', path: '/services', icon: Sparkles, key: 'services' },
    { label: 'Careers', path: '/careers', icon: PhoneCall, key: 'careers' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Branding & Category Badge */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <div 
            onClick={() => onBackToMain ? onBackToMain() : navigate('/')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <Logo size="sm" showText={true} variant={isDarkMode ? 'light' : 'dark'} />
          </div>

          {badgeText && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />
              <span>{badgeText}</span>
            </div>
          )}
        </div>

        {/* Middle: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/60 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {extraActions}

          {/* Back to Portal / Home Button */}
          <button
            type="button"
            onClick={() => onBackToMain ? onBackToMain() : navigate('/')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:scale-[1.02] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold"
            title="Return to Main Portal"
          >
            <ArrowLeft size={14} className="text-orange-500" />
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider">Main Site</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer shadow-sm border border-slate-200/60 dark:border-slate-700/60"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={15} className="text-orange-400" /> : <Moon size={15} className="text-indigo-500" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 overflow-hidden shadow-xl"
          >
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
