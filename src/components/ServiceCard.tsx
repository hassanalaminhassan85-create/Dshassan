import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Check } from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { getPolishedServiceImage, getEmergencyFallbackImage } from '../lib/mediaUtils';
import { LanguageCode } from '../lib/translations';
import { getServiceSlug } from '../lib/quoteUtils';

interface ServiceCardProps {
  svc: ServiceItem;
  index: number;
  language: LanguageCode;
  onSelect: (slug: string) => void;
  getCategoryIcon?: (category: string) => React.ReactNode;
  getServiceImage?: (svc: ServiceItem) => string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  svc,
  index,
  language,
  onSelect,
  getCategoryIcon,
  getServiceImage,
}) => {
  const [imgError, setImgError] = useState(false);

  const imgSrc = getServiceImage ? getServiceImage(svc) : getPolishedServiceImage(svc);
  const slug = getServiceSlug(svc);

  const handleCardClick = () => {
    onSelect(slug);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Explore ${svc.name} service and request quotation`}
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/80 dark:hover:border-orange-500/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group text-left h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 relative"
      id={`service-card-${svc.id}`}
    >
      <div>
        {/* 1. High-Quality Service Image */}
        <div className="relative h-32 sm:h-36 overflow-hidden bg-slate-950 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <img 
            src={imgSrc} 
            alt={svc.name} 
            decoding="async"
            loading={index < 6 ? "eager" : "lazy"}
            fetchPriority={index < 3 ? "high" : "auto"}
            referrerPolicy="no-referrer"
            onError={(e) => {
              setImgError(true);
              const fallback = getEmergencyFallbackImage(svc.category, svc.id, svc.name);
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Category Icon Badge (Top Right) */}
          {getCategoryIcon && (
            <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-800/80 shadow-xs z-10">
              {getCategoryIcon(svc.category)}
            </div>
          )}
        </div>

        {/* 2. Compact Info Body */}
        <div className="p-3.5 sm:p-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-wider uppercase text-orange-600 dark:text-orange-400">
            <span className="px-2 py-0.5 bg-orange-500/10 rounded">{svc.category}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">SLA Guaranteed</span>
          </div>

          <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 uppercase tracking-tight font-serif">
            {svc.name}
          </h3>

          <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs leading-relaxed line-clamp-2 font-light">
            {svc.description}
          </p>
        </div>
      </div>

      {/* 3. Single Understated Action: Explore Service ↗ */}
      <div className="p-3.5 sm:p-4 pt-0">
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-[#000E32] dark:text-orange-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all">
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
};
