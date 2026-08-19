import React from 'react';
import { motion } from 'motion/react';

interface ProfessionalHamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const ProfessionalHamburgerButton: React.FC<ProfessionalHamburgerButtonProps> = ({
  isOpen,
  onClick,
  className = '',
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      type="button"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      className={`relative flex items-center justify-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer select-none group ${
        isOpen
          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
          : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      } ${className}`}
    >
      {/* 3-Line Animated Hamburger Morph Icon */}
      <div className="relative w-4 h-3.5 flex flex-col justify-between items-center shrink-0">
        {/* Top bar */}
        <motion.span
          className={`w-4 h-0.5 rounded-full transition-colors ${
            isOpen ? 'bg-white dark:bg-slate-900' : 'bg-slate-700 dark:bg-slate-200 group-hover:bg-orange-500'
          }`}
          animate={
            isOpen
              ? { rotate: 45, y: 6 }
              : { rotate: 0, y: 0 }
          }
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        />

        {/* Middle bar */}
        <motion.span
          className={`w-4 h-0.5 rounded-full transition-colors ${
            isOpen ? 'bg-transparent' : 'bg-orange-500'
          }`}
          animate={
            isOpen
              ? { opacity: 0, scaleX: 0 }
              : { opacity: 1, scaleX: 1 }
          }
          transition={{ duration: 0.15 }}
        />

        {/* Bottom bar */}
        <motion.span
          className={`w-4 h-0.5 rounded-full transition-colors ${
            isOpen ? 'bg-white dark:bg-slate-900' : 'bg-slate-700 dark:bg-slate-200 group-hover:bg-orange-500'
          }`}
          animate={
            isOpen
              ? { rotate: -45, y: -6 }
              : { rotate: 0, y: 0 }
          }
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        />
      </div>

      {/* Label Badge */}
      <span className="text-[11px] font-semibold tracking-wide uppercase font-sans">
        {isOpen ? 'Close' : 'Menu'}
      </span>
    </motion.button>
  );
};

