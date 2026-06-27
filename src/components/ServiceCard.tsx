import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Gauge, Zap, Brain, X, Check } from 'lucide-react';
import { ServiceItem } from '../lib/data';
import { LanguageCode } from '../lib/translations';

interface ServiceCardProps {
  svc: ServiceItem;
  index: number;
  language: LanguageCode;
  onSelect: (id: string) => void;
  bentoSpan: string;
  getCategoryIcon: (category: string) => React.ReactNode;
  getServiceImage: (svc: ServiceItem) => string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  svc,
  index,
  language,
  onSelect,
  bentoSpan,
  getCategoryIcon,
  getServiceImage,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  // Dynamic AI analytics based on service category
  const getAiStats = (category: string) => {
    switch (category) {
      case 'Digital Marketing':
        return {
          roi: '4.8x - 6.2x',
          cac: '-35%',
          confidence: '98%',
          speed: 'Real-Time Sync',
          focus: 'Regional High-Income Leads',
          benefit: 'Autonomous Bidding Optimization'
        };
      case 'Software Development':
        return {
          roi: '90% Less Overhead',
          cac: '-40% Server Cost',
          confidence: '99%',
          speed: '12ms Response Delay',
          focus: 'Elastic Edge Compute',
          benefit: 'Type-Safe Bundled React Models'
        };
      case 'Compliance Services':
        return {
          roi: '82% Shorter Cycles',
          cac: 'Zero regulatory risk',
          confidence: '100%',
          speed: 'Parallel CAC Pipeline',
          focus: 'CAC & SCUML Clearance',
          benefit: 'Direct API Legal Verification'
        };
      case 'AI Solutions':
        return {
          roi: '12x Automation Velocity',
          cac: '-70% Manual Drag',
          confidence: '97.5%',
          speed: '12M Tokens/Sec',
          focus: 'Generative Intelligence Hubs',
          benefit: 'Offline-Capable Vector Embeddings'
        };
      default:
        return {
          roi: '3.5x Projected Growth',
          cac: '-25% Waste Removed',
          confidence: '95%',
          speed: 'Edge Acceleration',
          focus: 'Full-Stack Performance',
          benefit: 'Next-Gen Workflow Optimization'
        };
    }
  };

  const aiStats = getAiStats(svc.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ 
        y: -10, 
        scale: 1.025,
        boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -6px rgba(0, 0, 0, 0.15)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 280, 
        damping: 18 
      }}
      onClick={() => onSelect(svc.id)}
      className={`relative bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-md hover:border-orange-500 dark:hover:border-orange-400 group flex flex-col justify-between cursor-pointer transition-colors duration-300 ${bentoSpan}`}
      id={`service-card-${svc.id}`}
    >
      {/* Card Image Section */}
      <div className="relative h-48 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        {!imgError ? (
          <>
            {/* Shimmer effect while loading */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse" />
            )}
            <img 
              src={getServiceImage(svc)} 
              alt={svc.name} 
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          /* Beautiful Gradient Fallback */
          <div className="absolute inset-0 bg-gradient-to-br from-[#000E32] via-[#051c54] to-indigo-950 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="p-3 bg-white/10 rounded-2xl text-white backdrop-blur-md animate-pulse">
              {getCategoryIcon(svc.category)}
            </div>
            <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase font-bold">
              {svc.category} Service
            </span>
          </div>
        )}

        {/* Labels & Icons overlay */}
        <div className="absolute top-3 left-3 bg-[#000E32]/95 backdrop-blur-md border border-white/15 px-3 py-1 rounded-xl text-[10px] uppercase font-black text-orange-400 tracking-wider shadow-md">
          {svc.price}
        </div>
        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/15 p-2 rounded-xl text-white shadow-md">
          {getCategoryIcon(svc.category)}
        </div>

        {/* AI Predictor Floating Mini Tag */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowAiAnalysis(!showAiAnalysis);
          }}
          className="absolute bottom-3 right-3 bg-slate-950/90 text-amber-400 border border-amber-500/50 hover:border-amber-400 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg z-20 backdrop-blur-md"
        >
          <Sparkles size={11} className="animate-spin-slow text-amber-400 fill-amber-400" />
          <span>AI Insight</span>
        </motion.button>

        {/* Interactive AI HUD Overlay inside the image container */}
        <AnimatePresence>
          {showAiAnalysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.85, rotateX: -15 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 bg-[#000E32]/95 backdrop-blur-xl p-4 flex flex-col justify-between text-white z-30 overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-[9px] uppercase tracking-widest font-mono text-amber-400 flex items-center gap-1 font-black">
                  <Brain size={12} className="text-amber-400" />
                  DS-AI Predictive Engine
                </span>
                <button
                  onClick={() => setShowAiAnalysis(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={13} className="text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-left">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    <TrendingUp size={10} className="text-emerald-400" />
                    Projected ROI
                  </div>
                  <span className="text-xs font-black text-emerald-400 font-mono block">{aiStats.roi}</span>
                </div>
                
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-left">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    <Gauge size={10} className="text-orange-400" />
                    Delivery Velocity
                  </div>
                  <span className="text-xs font-black text-orange-400 font-mono block truncate">{aiStats.speed}</span>
                </div>

                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-left">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    <Zap size={10} className="text-indigo-400" />
                    Match Score
                  </div>
                  <span className="text-xs font-black text-indigo-400 font-mono block">{aiStats.confidence} confidence</span>
                </div>

                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-left">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    <Check size={10} className="text-amber-400" />
                    Target Fit
                  </div>
                  <span className="text-xs font-black text-amber-400 block truncate">{aiStats.focus}</span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-left">
                <span className="text-[8px] font-black uppercase text-amber-400 tracking-widest block mb-0.5">AI Recommendation Summary</span>
                <p className="text-[10px] text-amber-100 font-medium leading-normal">{aiStats.benefit}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Info Section */}
      <div className="p-6 text-left flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-600 dark:text-indigo-400 font-extrabold block">
            // {svc.category}
          </span>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base line-clamp-2 leading-snug font-serif uppercase tracking-tight group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
            {svc.name}
          </h3>
          <p className="text-slate-950 dark:text-slate-50 text-xs leading-relaxed font-bold line-clamp-3">
            {svc.description}
          </p>
        </div>

        {/* Learn Details & ID footer */}
        <div className="space-y-2 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:underline uppercase tracking-wider flex items-center gap-1.5">
              <span>{language === 'zh' ? '查看详情内容 ➔' : 'Learn Details ➔'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              {svc.id}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
