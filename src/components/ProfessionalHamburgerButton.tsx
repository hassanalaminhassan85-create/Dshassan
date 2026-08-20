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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      type="button"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      className={`relative inline-flex items-center justify-center gap-2 px-3.5 h-9 sm:h-9.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${
        isOpen
          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
          : 'bg-slate-50/90 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-none'
      } ${className}`}
    >
      {/* 3-Line Animated Hamburger Morph Icon */}
      <div className="relative w-4 h-3 flex flex-col justify-between items-center shrink-0">
        {/* Top bar */}
        <motion.span
          className={`w-4 h-[2px] rounded-full transition-colors ${
            isOpen ? 'bg-white dark:bg-slate-900' : 'bg-slate-800 dark:bg-slate-200 group-hover:bg-orange-500'
          }`}
          animate={
            isOpen
              ? { rotate: 45, y: 5 }
              : { rotate: 0, y: 0 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />

        {/* Middle bar */}
        <motion.span
          className={`w-4 h-[2px] rounded-full transition-colors ${
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
          className={`w-4 h-[2px] rounded-full transition-colors ${
            isOpen ? 'bg-white dark:bg-slate-900' : 'bg-slate-800 dark:bg-slate-200 group-hover:bg-orange-500'
          }`}
          animate={
            isOpen
              ? { rotate: -45, y: -5 }
              : { rotate: 0, y: 0 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </div>

      {/* Label Badge */}
      <span className="text-[11px] font-bold tracking-wider uppercase font-sans">
        {isOpen ? 'Close' : 'Menu'}
      </span>
    </motion.button>
  );
};

