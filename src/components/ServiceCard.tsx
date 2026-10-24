import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, CreditCard } from 'lucide-react';
import { ServiceItem, parsePriceToNumeric } from '../lib/data';
import { getPolishedServiceImage, getEmergencyFallbackImage } from '../lib/mediaUtils';
import { LanguageCode } from '../lib/translations';
import { PaystackPayButton } from './PaystackMotionCheckout';

interface ServiceCardProps {
  svc: ServiceItem;
  index: number;
  language: LanguageCode;
  onSelect: (id: string) => void;
  bentoSpan?: string;
  getCategoryIcon?: (category: string) => React.ReactNode;
  getServiceImage?: (svc: ServiceItem) => string;
  onCustomQuote?: (svc: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  svc,
  index,
  language,
  onSelect,
  getCategoryIcon,
  getServiceImage,
  onCustomQuote,
}) => {
  const [imgError, setImgError] = useState(false);

  const imgSrc = getServiceImage ? getServiceImage(svc) : getPolishedServiceImage(svc);

  // Fallback deliverables if not specified in dataset
  const deliverables = svc.deliverables && svc.deliverables.length > 0 
    ? svc.deliverables.slice(0, 3)
    : [
        'Enterprise Specification & Architecture',
        'Continuous Quality & Performance Audits',
        'Direct SLA & Dedicated Engineering Support'
      ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(svc.id)}
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 hover:border-orange-500/80 dark:hover:border-orange-500/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group text-left h-full"
      id={`service-card-${svc.id}`}
    >
      {/* 1. Real High-Definition Photography Container */}
      <div>
        <div className="relative h-36 sm:h-40 overflow-hidden bg-slate-950 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <img 
            src={imgSrc} 
            alt={svc.name} 
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              setImgError(true);
              const fallback = getEmergencyFallbackImage(svc.category);
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Prominent Pricing Tag */}
          <div className="absolute top-2.5 left-2.5 bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black text-white border border-orange-500/70 shadow-lg flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
            <span className="font-extrabold text-orange-400 font-sans tracking-tight">{svc.price}</span>
          </div>

          {/* Category Icon */}
          {getCategoryIcon && (
            <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-xs">
              {getCategoryIcon(svc.category)}
            </div>
          )}
        </div>

        {/* 2. Structured Information Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-wider uppercase text-orange-600 dark:text-orange-400">
            <span>{svc.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">SLA Guaranteed</span>
          </div>

          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {svc.name}
          </h3>

          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-2 font-normal">
            {svc.description}
          </p>

          {/* Bold Prominent Pricing Row */}
          <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Pricing:
            </span>
            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 tracking-tight font-sans">
              {svc.price}
            </span>
          </div>

          {/* 3. Decision-Friendly Key Deliverables */}
          <div className="pt-1 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Core Deliverables:
            </span>
            <ul className="space-y-1">
              {deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                  <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Action Row */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>{language === 'zh' ? '查看详情' : 'Inspect Service'}</span>
            <ArrowRight size={12} />
          </span>

          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCustomQuote) {
                  onCustomQuote(svc);
                } else {
                  onSelect(svc.id);
                }
              }}
              className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Get Quote
            </button>

            <PaystackPayButton
              amount={parsePriceToNumeric(svc.price, 100000)}
              email="client@dstechagency.com"
              customerName="Valued Client"
              title={`Retainer: ${svc.name}`}
              description={`Fast-Track Service Retainer Deposit for ${svc.name}`}
              variant="emerald"
              className="px-2.5 py-1.5 text-[10px] font-bold"
            >
              <CreditCard size={11} />
              <span>Deposit</span>
            </PaystackPayButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
