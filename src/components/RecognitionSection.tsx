import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, ShieldCheck, Award, FileText, Globe, CheckCircle2, 
  ExternalLink, Download, Share2, ZoomIn, ZoomOut, RotateCw, RotateCcw, 
  X, Maximize2, Minimize2, Printer, AlertTriangle, Calendar, Building, FileDigit, Loader2, ArrowRight, Sun, Moon, ArrowLeft, Sparkles
} from 'lucide-react';
import { apiGetRecognitionCertificates, RecognitionCertificate, apiSubscribeToRecognitionCertificates, resolveImageUrl } from '../lib/api';
import { generateDynamicSvgUrl } from '../lib/mediaUtils';
import { Logo } from './Logo';

// Supported Categories
const CATEGORIES = [
  'All',
  'Awards',
  'Professional Certifications',
  'Government Recognition',
  'Industry Recognition',
  'Technology Certifications',
  'Strategic Partnerships',
  'Memberships',
  'Appreciation Certificates',
  'Other Recognitions'
];

interface RecognitionSectionProps {
  onBackToPortal?: () => void;
}

export const RecognitionSection: React.FC<RecognitionSectionProps> = ({ onBackToPortal }) => {
  const [certs, setCerts] = useState<RecognitionCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'order'>('order');

  // Previewer modal state
  const [activePreviewCert, setActivePreviewCert] = useState<RecognitionCertificate | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load certificates
  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetRecognitionCertificates(false);
      setCerts(data);
    } catch (err: any) {
      console.error("Failed to load certificates:", err);
      setError("Unable to sync recognition credentials from D1 network database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = apiSubscribeToRecognitionCertificates((data) => {
      setCerts(data as RecognitionCertificate[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter and sort certificates
  const filteredAndSortedCerts = useMemo(() => {
    let result = [...certs];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.issuing_organization.toLowerCase().includes(q) || 
        (c.description || '').toLowerCase().includes(q) ||
        (c.certificate_number || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(c => c.category === activeCategory);
    }

    // Verified only filter
    if (showOnlyVerified) {
      result = result.filter(c => c.verification_url || c.certificate_number);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime();
      }
      // Default: display_order ASC, then created_at DESC
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [certs, searchQuery, activeCategory, showOnlyVerified, sortBy]);

  // Keyboard shortcut listener for preview modal
  useEffect(() => {
    if (!activePreviewCert) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
      } else if (e.key === '=' || e.key === '+') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotateCw();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePreviewCert]);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Zoom / Rotate handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const resetZoomRotate = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotateCw = () => setRotation(prev => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation(prev => (prev - 90) % 360);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const closePreview = () => {
    setActivePreviewCert(null);
    resetZoomRotate();
    setIsFullscreen(false);
  };

  const handleShare = (cert: RecognitionCertificate, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/api/recognition/file?key=${encodeURIComponent(cert.r2_object_key || '')}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      triggerToast("Secure verification link copied to clipboard!");
    }).catch(() => {
      triggerToast("Sharing failed. Please copy manually.");
    });
  };

  const handlePrint = () => {
    if (!activePreviewCert) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const fileUrl = resolveImageUrl(activePreviewCert.r2_object_key, generateDynamicSvgUrl(activePreviewCert.title, activePreviewCert.category, 'certificate'));
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print - ${activePreviewCert.title}</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: white; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${fileUrl}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Get image source for standard certificate
  const getCertImageSrc = (cert: RecognitionCertificate) => {
    return resolveImageUrl(cert.r2_object_key, generateDynamicSvgUrl(cert.title, cert.category, 'certificate'));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-500 relative overflow-hidden`} id="recognition-certifications-section">
      {/* Ambient background lights with smooth animation */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-indigo-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-orange-500/10 rounded-full blur-[130px] pointer-events-none" />

      {onBackToPortal && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToPortal}
          className="absolute top-6 left-6 p-2.5 sm:px-4 sm:py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 backdrop-blur-md cursor-pointer shadow-lg flex items-center gap-2 z-50 font-serif font-bold text-xs uppercase tracking-wider"
          title="Back to Main Site"
        >
          <ArrowLeft size={16} className="text-orange-500" />
          <span className="hidden sm:inline">Back to Portal</span>
        </motion.button>
      )}

      {/* Theme Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 backdrop-blur-md cursor-pointer shadow-lg flex items-center gap-1.5 z-50"
      >
        {isDarkMode ? <Sun size={16} className="text-orange-400" /> : <Moon size={16} className="text-indigo-500" />}
      </motion.button>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-5 max-w-3xl mx-auto flex flex-col items-center">
          <Logo size="md" variant={isDarkMode ? 'light' : 'dark'} className="mx-auto mb-2" />
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-orange-500 dark:text-orange-400 text-[11px] font-extrabold uppercase tracking-widest shadow-inner"
          >
            <ShieldCheck size={15} className="animate-pulse" />
            <span>Enterprise Quality & Credibility Matrix</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tight font-serif uppercase text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-orange-400 dark:via-orange-500 dark:to-amber-400 leading-[1.1]"
          >
            Recognition & Accreditations
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-600 dark:text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-2xl font-sans"
          >
            Explore our verified licensing credentials, global technological partnerships, academic standard achievements, and national governmental recognitions demonstrating uncompromised excellence.
          </motion.p>
        </div>

        {/* Filter Center Control Deck with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white/90 dark:bg-[#031336]/80 border border-slate-200/80 dark:border-indigo-950/80 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-500 opacity-80" />

          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
            {/* Search Input with Focus Animation */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search award, certificate number, or description..."
                className="w-full bg-slate-100 dark:bg-[#01091b] border border-slate-200 dark:border-indigo-900/60 rounded-2xl pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner font-sans"
              />
              {searchQuery && (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={15} />
                </motion.button>
              )}
            </div>

            {/* Verification & Sorting Options */}
            <div className="flex flex-wrap items-center gap-5 w-full lg:w-auto justify-start lg:justify-end">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={showOnlyVerified}
                  onChange={(e) => setShowOnlyVerified(e.target.checked)}
                  className="rounded-lg w-4 h-4 bg-slate-100 dark:bg-[#01091b] border-slate-300 dark:border-indigo-900 text-orange-500 focus:ring-orange-500/30 cursor-pointer"
                />
                <span className="group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors flex items-center gap-1.5 font-serif">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  Verified Credentials Only
                </span>
              </label>

              <div className="h-5 w-[1px] bg-slate-200 dark:bg-indigo-900/80 hidden sm:block" />

              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-bold">
                <Filter size={15} className="text-orange-500" />
                <span className="font-serif">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-100 dark:bg-[#01091b] border border-slate-200 dark:border-indigo-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
                >
                  <option value="order">Custom Order</option>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Scrolling Horizontal Tabs with High Motion */}
          <div className="border-t border-slate-200 dark:border-indigo-950 pt-4 overflow-x-auto scrollbar-none flex items-center gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap tracking-wide transition-all relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400' 
                      : 'bg-slate-100 dark:bg-[#01091b] hover:bg-slate-200 dark:hover:bg-[#02102c] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-indigo-900/50'
                  }`}
                >
                  <span className="font-sans relative z-10">{cat}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeCategoryIndicator"
                      className="absolute inset-0 rounded-2xl bg-white/20 pointer-events-none"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Display State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-100 dark:bg-[#031336]/40 border border-slate-200 dark:border-indigo-950/50 rounded-3xl p-6 space-y-4 animate-pulse">
                <div className="h-52 bg-slate-200 dark:bg-[#01091b]/80 rounded-2xl" />
                <div className="h-6 bg-slate-200 dark:bg-[#01091b]/80 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-[#01091b]/80 rounded w-1/2" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-slate-200 dark:bg-[#01091b]/80 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-[#01091b]/80 rounded w-5/6" />
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-indigo-950/20">
                  <div className="h-9 bg-slate-200 dark:bg-[#01091b]/80 rounded-xl w-1/3" />
                  <div className="h-9 bg-slate-200 dark:bg-[#01091b]/80 rounded-xl w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-500/30 rounded-3xl text-center space-y-4 max-w-xl mx-auto shadow-xl"
          >
            <AlertTriangle className="text-rose-500 w-14 h-14 animate-bounce" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-serif uppercase tracking-tight">Security Hub Disrupted</h3>
            <p className="text-xs text-rose-600 dark:text-rose-300/80 leading-relaxed font-sans">{error}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchCertificates}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
            >
              Retry Secure Sync
            </motion.button>
          </motion.div>
        ) : filteredAndSortedCerts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-16 bg-slate-100/80 dark:bg-[#031336]/40 border-2 border-dashed border-slate-200 dark:border-indigo-950 rounded-3xl text-center space-y-4 max-w-xl mx-auto"
          >
            <FileText className="text-slate-400 dark:text-slate-500 w-14 h-14 opacity-60" />
            <h3 className="text-xl font-extrabold text-slate-700 dark:text-slate-200 font-serif uppercase tracking-tight">No Credentials Located</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400/85 leading-relaxed font-sans">
              We couldn't locate any active, published certificates matching your search query or active category filter.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setShowOnlyVerified(false);
              }}
              className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl transition-all shadow-sm"
            >
              Reset All Filters
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedCerts.map((cert, idx) => {
                const verified = !!(cert.verification_url || cert.certificate_number);
                return (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, y: 35, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08, type: "spring", stiffness: 260, damping: 20 }}
                    whileHover={{ 
                      y: -12, 
                      scale: 1.02,
                      boxShadow: "0 25px 40px -10px rgba(0, 0, 0, 0.2), 0 0 25px rgba(249, 115, 22, 0.12)"
                    }}
                    className="group relative bg-white dark:bg-[#031336]/60 border border-slate-200/90 dark:border-indigo-950 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between cursor-pointer"
                    onClick={() => setActivePreviewCert(cert)}
                  >
                    
                    {/* Top Glowing Gradient Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-6 space-y-5">
                      
                      {/* Interactive Thumbnail frame */}
                      <div className="relative h-52 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-indigo-900/60 flex items-center justify-center">
                        <img 
                          src={getCertImageSrc(cert)}
                          alt={cert.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 border rounded-xl shadow-md font-sans backdrop-blur-md ${
                            verified 
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' 
                              : 'bg-orange-950/80 border-orange-500/50 text-orange-300'
                          }`}>
                            {verified ? 'Verified Credential' : 'Award Certificate'}
                          </span>

                          <span className="bg-slate-950/80 border border-white/10 text-orange-400 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
                            {cert.category}
                          </span>
                        </div>
                        
                        {/* Hover Overlay Button */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <motion.div
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl shadow-orange-500/40"
                          >
                            <Maximize2 size={14} />
                            <span>Preview Certificate</span>
                          </motion.div>
                        </div>
                      </div>

                      {/* Header and title text */}
                      <div className="space-y-2 text-left">
                        <p className="text-[10px] font-mono tracking-widest text-orange-500 dark:text-orange-400 uppercase flex items-center gap-1.5 font-bold">
                          <Building size={12} />
                          {cert.issuing_organization}
                        </p>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1 font-serif group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                          {cert.title}
                        </h3>
                      </div>

                      {/* Dynamic Issue & Expiry Dates */}
                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-[#01091b]/80 border border-slate-200/80 dark:border-indigo-900/60 p-2.5 rounded-xl shadow-inner">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-orange-500" />
                          Issued: <strong className="text-slate-900 dark:text-slate-100">{cert.issue_date}</strong>
                        </span>
                        {cert.expiry_date && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            Exp: {cert.expiry_date}
                          </span>
                        )}
                      </div>

                      {/* Brief description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 text-left leading-relaxed font-sans font-normal">
                        {cert.description || 'No digital metadata description provided for this certificate record.'}
                      </p>

                      {/* Certificate Registration Number Block */}
                      {cert.certificate_number && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-mono text-left bg-orange-500/5 dark:bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                          <FileDigit size={14} className="text-orange-500 shrink-0" />
                          <span>Ref ID: <strong className="text-slate-900 dark:text-white font-bold">{cert.certificate_number}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Footer Interactive Actions Row with Luxury Buttons */}
                    <div className="p-4 px-6 border-t border-slate-200 dark:border-indigo-950 bg-slate-50/80 dark:bg-[#02102c]/60 flex items-center justify-between gap-3 rounded-b-3xl">
                      <span className="text-xs font-serif font-extrabold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles size={13} />
                        <span>Inspect Specs</span>
                      </span>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShare(cert, e)}
                          className="p-2 rounded-xl bg-white dark:bg-[#01091b] hover:bg-orange-50 dark:hover:bg-orange-500/20 hover:text-orange-500 border border-slate-200 dark:border-indigo-900 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                          title="Copy Shareable URL"
                        >
                          <Share2 size={14} />
                        </motion.button>
                        
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          href={resolveImageUrl(cert.r2_object_key, generateDynamicSvgUrl(cert.title, cert.category, 'certificate'))}
                          download={cert.file_name || 'certificate.png'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white dark:bg-[#01091b] hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-500 border border-slate-200 dark:border-indigo-900 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm"
                          title="Download Document"
                        >
                          <Download size={14} />
                        </motion.a>

                        <motion.div
                          whileHover={{ x: 3 }}
                          className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30"
                        >
                          <ArrowRight size={14} />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Full-Screen Premium Certificate Viewer Modal Backdrop */}
      <AnimatePresence>
        {activePreviewCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-6"
            onClick={closePreview}
          >
            {/* Control Bar */}
            <motion.div 
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`border rounded-2xl px-6 py-3 mb-4 flex items-center gap-4 shadow-2xl relative z-10 max-w-4xl w-full justify-between ${isDarkMode ? 'bg-[#031336]/95 border-indigo-900/80 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping shrink-0" />
                <span className={`font-extrabold max-w-[180px] md:max-w-xs truncate font-serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activePreviewCert.title}</span>
              </div>

              {/* View control deck */}
              <div className="flex items-center gap-2 md:gap-3">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleZoomIn}
                  className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:text-white bg-[#01091b] hover:bg-orange-500/20 text-slate-300 border border-indigo-900/50' : 'hover:text-orange-500 bg-slate-100 hover:bg-orange-500/10 text-slate-700 border border-slate-200'}`}
                  title="Zoom In (+)"
                >
                  <ZoomIn size={16} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleZoomOut}
                  className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:text-white bg-[#01091b] hover:bg-orange-500/20 text-slate-300 border border-indigo-900/50' : 'hover:text-orange-500 bg-slate-100 hover:bg-orange-500/10 text-slate-700 border border-slate-200'}`}
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={16} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRotateCw}
                  className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:text-white bg-[#01091b] hover:bg-orange-500/20 text-slate-300 border border-indigo-900/50' : 'hover:text-orange-500 bg-slate-100 hover:bg-orange-500/10 text-slate-700 border border-slate-200'}`}
                  title="Rotate Right (R)"
                >
                  <RotateCw size={16} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetZoomRotate}
                  className={`text-xs uppercase font-extrabold px-3 py-2 rounded-xl transition-all font-mono ${isDarkMode ? 'bg-[#01091b] hover:text-white hover:bg-indigo-950 border border-indigo-900/50 text-slate-300' : 'bg-slate-100 hover:text-orange-500 hover:bg-slate-200 border border-slate-200 text-slate-700'}`}
                  title="Reset view adjustments"
                >
                  Reset
                </motion.button>

                <div className={`h-5 w-[1px] ${isDarkMode ? 'bg-indigo-900' : 'bg-slate-200'}`} />

                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrint}
                  className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:text-white bg-[#01091b] hover:bg-indigo-950 text-slate-300 border border-indigo-900/50' : 'hover:text-orange-500 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}`}
                  title="Print Document"
                >
                  <Printer size={16} />
                </motion.button>
                
                <motion.a 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={resolveImageUrl(activePreviewCert.r2_object_key, generateDynamicSvgUrl(activePreviewCert.title, activePreviewCert.category, 'certificate'))}
                  download={activePreviewCert.file_name || 'certificate.png'}
                  className={`p-2 rounded-xl transition-all flex items-center justify-center ${isDarkMode ? 'hover:text-emerald-400 bg-[#01091b] hover:bg-indigo-950 text-slate-300 border border-indigo-900/50' : 'hover:text-emerald-500 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}`}
                  title="Direct download file"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={16} />
                </motion.a>

                {activePreviewCert.verification_url && (
                  <motion.a 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={activePreviewCert.verification_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-2 rounded-xl transition-all flex items-center justify-center ${isDarkMode ? 'hover:text-orange-400 bg-[#01091b] hover:bg-indigo-950 text-slate-300 border border-indigo-900/50' : 'hover:text-orange-500 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}`}
                    title="Visit Verification Portal"
                  >
                    <Globe size={16} />
                  </motion.a>
                )}
              </div>

              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closePreview}
                className={`p-2 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-rose-950/60 hover:text-rose-400 text-rose-400 bg-[#01091b] border border-rose-950' : 'hover:bg-rose-100 hover:text-rose-600 text-rose-500 bg-slate-100 border border-rose-200'}`}
                title="Close (ESC)"
              >
                <X size={18} />
              </motion.button>
            </motion.div>

            {/* Immersive Certificate Rendering Stage */}
            <div className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-2 md:p-6 relative">
              <motion.div 
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  maxHeight: '75vh',
                  maxWidth: '100%'
                }}
                className={`border-2 rounded-2xl overflow-hidden shadow-2xl relative select-none ${isDarkMode ? 'bg-slate-900 border-indigo-950' : 'bg-white border-slate-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={getCertImageSrc(activePreviewCert)}
                  alt="High-resolution certificate content preview"
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-auto max-w-full object-contain mx-auto pointer-events-none"
                />
              </motion.div>
            </div>

            {/* Explanatory Details Box in Previewer */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`border rounded-2xl p-5 mt-4 shadow-2xl max-w-3xl w-full text-xs md:text-sm text-left relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${isDarkMode ? 'bg-[#031336]/95 border-indigo-900/80 text-slate-300' : 'bg-white/95 border-slate-200 text-slate-700'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1.5">
                <span className={`text-[10px] uppercase font-extrabold tracking-widest font-mono ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                  {activePreviewCert.category} • Reference No: {activePreviewCert.certificate_number || 'N/A'}
                </span>
                <p className={`font-extrabold font-serif text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activePreviewCert.title}</p>
                <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {activePreviewCert.description || 'No digital metadata description provided.'}
                </p>
              </div>

              {activePreviewCert.verification_url && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={activePreviewCert.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 shrink-0 self-end md:self-center"
                >
                  <Globe size={14} />
                  <span>Verify Online</span>
                  <ArrowRight size={14} />
                </motion.a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating System Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#031336] border border-orange-500/40 text-slate-800 dark:text-slate-100 font-sans text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
