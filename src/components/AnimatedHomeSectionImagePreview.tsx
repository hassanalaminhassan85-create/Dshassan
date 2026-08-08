import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Eye, CheckCircle2, Sliders, ShieldCheck, 
  ArrowUpRight, Monitor, Moon, Sun, Layers, Image as ImageIcon,
  Zap, Award, RefreshCw, Check
} from 'lucide-react';
import { resolveImageUrl, generateDynamicSvgUrl } from '../lib/api';

interface AnimatedHomeSectionImagePreviewProps {
  imageSrc?: string | null;
  title?: string;
  category?: string;
  status?: string;
  progress?: number;
  shortDescription?: string;
  technologies?: string;
  isFeatured?: boolean;
  fileName?: string;
  fileSize?: number;
  className?: string;
}

export const AnimatedHomeSectionImagePreview: React.FC<AnimatedHomeSectionImagePreviewProps> = ({
  imageSrc,
  title = "Nimc Biometric Bridge v2",
  category = "Government Tech",
  status = "Deployment",
  progress = 85,
  shortDescription = "High-throughput enterprise biometric authentication and compliance gateway deployed across national nodes.",
  technologies = "React 19, Cloudflare R2, WebAuthn, D1 SQLite",
  isFeatured = true,
  fileName,
  fileSize,
  className = ""
}) => {
  const [previewMode, setPreviewMode] = useState<'card' | 'hero' | 'cac'>('card');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fallback SVG image if none provided or on error
  const resolvedSrc = imageSrc ? resolveImageUrl(imageSrc) : '';
  const defaultFallback = generateDynamicSvgUrl(title || 'DS Tech Enterprise Asset', category || 'software', 'hero');
  const effectiveImage = (!resolvedSrc || imageError) ? defaultFallback : resolvedSrc;

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageSrc]);

  return (
    <div className={`bg-slate-900/90 dark:bg-slate-950/90 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-4 backdrop-blur-md ${className}`}>
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl">
            <Sparkles size={16} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-400">Live Motion Preview</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Home Section Renderer
              </span>
            </div>
            <h4 className="text-xs font-bold text-white tracking-tight">How Image Appears on Public Home Section</h4>
          </div>
        </div>

        {/* View Mode & Theme Toggles */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Layout Selector */}
          <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setPreviewMode('card')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                previewMode === 'card' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={12} />
              <span>Project Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode('hero')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                previewMode === 'hero' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={12} />
              <span>Hero Banner</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode('cac')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                previewMode === 'cac' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award size={12} />
              <span>Accreditation</span>
            </button>
          </div>

          {/* Theme Canvas Switcher */}
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title={`Switch preview background to ${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {themeMode === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Frame */}
      <div 
        className={`relative rounded-2xl p-4 sm:p-6 transition-colors duration-500 border overflow-hidden ${
          themeMode === 'dark' 
            ? 'bg-slate-950 border-slate-800 text-white shadow-inner' 
            : 'bg-slate-100 border-slate-300 text-slate-900 shadow-inner'
        }`}
      >
        {/* Subtle grid background pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle, ${themeMode === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Live File Info Pill */}
        {fileName && (
          <div className="mb-3 flex items-center justify-between text-[10px] font-mono bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-orange-400">
            <span className="truncate max-w-[200px] sm:max-w-xs font-bold">File: {fileName}</span>
            {fileSize && <span>{(fileSize / 1024 / 1024).toFixed(2)} MB • Motion Ready</span>}
          </div>
        )}

        {/* MODE 1: PROJECT CARD VIEW */}
        {previewMode === 'card' && (
          <div className="max-w-md mx-auto">
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`rounded-2xl border overflow-hidden shadow-2xl relative group transition-all duration-300 ${
                themeMode === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-orange-500/50'
                  : 'bg-white border-slate-200 hover:border-orange-500/50'
              }`}
            >
              {/* Card Image Header */}
              <div className="relative h-52 w-full bg-slate-800 overflow-hidden">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500 animate-pulse">
                    <ImageIcon size={24} className="animate-bounce" />
                  </div>
                )}
                
                <motion.img 
                  src={effectiveImage} 
                  alt={title}
                  referrerPolicy="no-referrer"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Shimmer / Shading Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <motion.span 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-orange-500/90 text-white shadow-lg backdrop-blur-md"
                  >
                    {category}
                  </motion.span>

                  <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-900/90 text-emerald-400 border border-emerald-500/30 shadow-lg backdrop-blur-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {status}
                  </span>
                </div>

                {/* Image Overlay Title */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-extrabold text-white tracking-tight line-clamp-1 drop-shadow-md">
                    {title}
                  </h3>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-4 space-y-3">
                <p className={`text-xs font-medium line-clamp-2 leading-relaxed ${
                  themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {shortDescription}
                </p>

                {/* Tech Tags */}
                {technologies && (
                  <div className="flex flex-wrap gap-1">
                    {technologies.split(',').map((tech, i) => (
                      <span 
                        key={i} 
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                          themeMode === 'dark' 
                            ? 'bg-slate-800 text-slate-300 border-slate-700' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1 pt-2 border-t border-slate-800/50">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                      Development Sprint Progress
                    </span>
                    <span className="text-orange-500 font-mono font-extrabold">{progress}%</span>
                  </div>
                  
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    themeMode === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
                  }`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODE 2: HERO BANNER VIEW */}
        {previewMode === 'hero' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-6 relative overflow-hidden shadow-2xl ${
              themeMode === 'dark' 
                ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Ambient Background Aura */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                  <Zap size={12} className="animate-pulse" />
                  <span>Featured Case Study</span>
                </div>

                <h3 className={`text-xl font-extrabold tracking-tight ${
                  themeMode === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {title}
                </h3>

                <p className={`text-xs leading-relaxed ${
                  themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {shortDescription}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <div className="px-3 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-1.5">
                    <span>Explore Project</span>
                    <ArrowUpRight size={14} />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Live Deployed
                  </span>
                </div>
              </div>

              {/* Hero Image Frame with Animated Border Shimmer */}
              <div className="relative h-48 rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl group">
                <motion.img 
                  src={effectiveImage} 
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-white/90 bg-slate-950/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
                  <span>DS TECH ASSET RENDER</span>
                  <span className="text-orange-400 font-bold">100% PERSISTENT</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* MODE 3: ACCREDITATION / CAC VIEW */}
        {previewMode === 'cac' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border p-6 relative overflow-hidden shadow-2xl max-w-lg mx-auto ${
              themeMode === 'dark'
                ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-amber-500/30'
                : 'bg-amber-50/50 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-4 border-b border-amber-500/20 pb-4 mb-4">
              <div className="relative h-16 w-24 rounded-lg overflow-hidden border border-amber-500/40 bg-slate-950 shrink-0">
                <img 
                  src={effectiveImage} 
                  alt="Certificate Seal" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  <span>CAC Federal License Seal</span>
                </div>
                <h4 className={`text-sm font-bold ${
                  themeMode === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {title}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  RC: 7849103 • Verified Official Corporate Certificate
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                <span>R2 Persistent File Verified Active</span>
              </span>
              <span className="text-slate-400">Federal Registry Synced</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span>Uploaded images sync with Cloudflare R2 & D1 SQLite permanently</span>
        </span>
        <span className="text-slate-500">DS Tech Engine v4.2</span>
      </div>
    </div>
  );
};
