import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, ShieldCheck, Award, FileText, Globe, CheckCircle2, 
  ExternalLink, Download, Share2, ZoomIn, ZoomOut, RotateCw, RotateCcw, 
  X, Maximize2, Minimize2, Printer, AlertTriangle, Calendar, Building, FileDigit, Loader2, ArrowRight
} from 'lucide-react';
import { apiGetRecognitionCertificates, RecognitionCertificate } from '../lib/api';

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

export const RecognitionSection: React.FC = () => {
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
    fetchCertificates();
  }, []);

  // Listen to custom broad sync event from SSE
  useEffect(() => {
    const handleSync = () => {
      fetchCertificates();
    };
    window.addEventListener('RECOGNITION_CERTIFICATE_SAVED', handleSync);
    window.addEventListener('RECOGNITION_CERTIFICATE_DELETED', handleSync);
    window.addEventListener('RECOGNITION_PUBLISH_TOGGLED', handleSync);
    return () => {
      window.removeEventListener('RECOGNITION_CERTIFICATE_SAVED', handleSync);
      window.removeEventListener('RECOGNITION_CERTIFICATE_DELETED', handleSync);
      window.removeEventListener('RECOGNITION_PUBLISH_TOGGLED', handleSync);
    };
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
    const fileUrl = activePreviewCert.r2_object_key 
      ? `/api/recognition/file?key=${encodeURIComponent(activePreviewCert.r2_object_key)}`
      : 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200';
    
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
    if (cert.r2_object_key) {
      if (cert.r2_object_key.startsWith('seeds/')) {
        // High quality design presets matching categories
        if (cert.category === 'Awards') return 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80';
        if (cert.category === 'Strategic Partnerships') return 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80';
        if (cert.category === 'Government Recognition') return 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80';
        return 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=600&auto=format&fit=crop&q=80';
      }
      return `/api/recognition/file?key=${encodeURIComponent(cert.r2_object_key)}`;
    }
    return 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=600&auto=format&fit=crop&q=80';
  };

  return (
    <div className="w-full bg-[#000a21] text-slate-100 min-h-screen py-10" id="recognition-certifications-section">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest"
          >
            <ShieldCheck size={14} className="animate-pulse" />
            <span>Enterprise Quality & Credibility Node</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight font-serif uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"
          >
            Recognition & Certifications
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm md:text-base font-light leading-relaxed"
          >
            Browse our accredited licensing, technological partnerships, academic standard achievements, and national governmental recognitions demonstrating premium excellence.
          </motion.p>
        </div>

        {/* Filter Center Control Deck */}
        <div className="bg-[#031336]/65 border border-indigo-950 p-6 rounded-2xl shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search award, certificate number, description..."
                className="w-full bg-[#01091b] border border-slate-700/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Verification & Sorting Options */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-start lg:justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none group text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={showOnlyVerified}
                  onChange={(e) => setShowOnlyVerified(e.target.checked)}
                  className="rounded bg-[#01091b] border-slate-700 text-orange-500 focus:ring-orange-500/20"
                />
                <span className="group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Verified Credentials Only
                </span>
              </label>

              <div className="h-4 w-[1px] bg-indigo-950 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Filter size={14} className="text-orange-500" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#01091b] border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="order">Custom Order</option>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Scrolling Horizontal Tabs */}
          <div className="border-t border-indigo-950/40 pt-4 overflow-x-auto scrollbar-none flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap tracking-wide transition-all ${
                  activeCategory === cat 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/10' 
                    : 'bg-[#01091b] hover:bg-[#02102c] text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#031336]/40 border border-indigo-950/50 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="h-48 bg-[#01091b]/80 rounded-xl" />
                <div className="h-6 bg-[#01091b]/80 rounded w-3/4" />
                <div className="h-4 bg-[#01091b]/80 rounded w-1/2" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-[#01091b]/80 rounded w-full" />
                  <div className="h-3 bg-[#01091b]/80 rounded w-5/6" />
                </div>
                <div className="flex justify-between pt-4 border-t border-indigo-950/20">
                  <div className="h-8 bg-[#01091b]/80 rounded w-1/3" />
                  <div className="h-8 bg-[#01091b]/80 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-red-950/10 border border-red-500/20 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
            <AlertTriangle className="text-rose-500 w-12 h-12 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-100 font-serif">Security Hub Disrupted</h3>
            <p className="text-xs text-rose-300/80 leading-relaxed">{error}</p>
            <button 
              onClick={fetchCertificates}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-md transition-all shadow-md"
            >
              Retry Secure Sync
            </button>
          </div>
        ) : filteredAndSortedCerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#031336]/30 border border-indigo-950/60 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
            <FileText className="text-slate-500 w-12 h-12 opacity-60" />
            <h3 className="text-lg font-bold text-slate-200 font-serif">No Credentials Located</h3>
            <p className="text-xs text-slate-400/85">
              We couldn't locate any active, published certificates matching your search or category filter.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setShowOnlyVerified(false);
              }}
              className="bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 font-bold text-xs uppercase px-4 py-2 rounded-md transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedCerts.map((cert) => {
                const verified = !!(cert.verification_url || cert.certificate_number);
                return (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.08)" }}
                    className="group relative bg-[#031336]/45 border border-indigo-950 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
                  >
                    
                    {/* Upper decorative glow block */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-5 space-y-4">
                      
                      {/* Interactive Thumbnail frame */}
                      <div className="relative h-48 w-full bg-[#01091b] rounded-xl overflow-hidden border border-indigo-950 flex items-center justify-center group-hover:border-orange-500/40 transition-colors">
                        <img 
                          src={getCertImageSrc(cert)}
                          alt={cert.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Overlay elements */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {verified && (
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md">
                              <ShieldCheck size={11} className="text-emerald-400" />
                              VERIFIED
                            </span>
                          )}
                          <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
                            {cert.category}
                          </span>
                        </div>
                        
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                          <button 
                            onClick={() => setActivePreviewCert(cert)}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                          >
                            <Maximize2 size={13} />
                            Preview Certificate
                          </button>
                        </div>
                      </div>

                      {/* Header and title text */}
                      <div className="space-y-1.5 text-left">
                        <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                          <Building size={11} className="text-orange-500" />
                          {cert.issuing_organization}
                        </p>
                        <h3 className="text-base font-bold text-slate-100 line-clamp-1 font-serif group-hover:text-orange-400 transition-colors">
                          {cert.title}
                        </h3>
                      </div>

                      {/* Dynamic Issue & Expiry Dates */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-[#01091b]/60 border border-indigo-950/40 p-2 rounded-lg">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-orange-500" />
                          Issued: {cert.issue_date}
                        </span>
                        {cert.expiry_date && (
                          <span className="text-yellow-500/90">
                            Exp: {cert.expiry_date}
                          </span>
                        )}
                      </div>

                      {/* Brief description */}
                      <p className="text-xs text-slate-400/90 line-clamp-3 text-left leading-relaxed">
                        {cert.description || 'No digital metadata description provided for this certificate record.'}
                      </p>

                      {/* Certificate Registration Number Block */}
                      {cert.certificate_number && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono text-left bg-[#01091b]/30 p-1.5 rounded border border-indigo-950/20">
                          <FileDigit size={12} className="text-orange-400 shrink-0" />
                          <span>Ref: <strong className="text-slate-200">{cert.certificate_number}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Footer Interactive Actions Row */}
                    <div className="p-4 border-t border-indigo-950/60 bg-[#02102c]/50 flex items-center justify-between gap-2 rounded-b-2xl">
                      <button
                        onClick={() => setActivePreviewCert(cert)}
                        className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink size={12} className="text-orange-500" />
                        Preview
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleShare(cert, e)}
                          className="p-1.5 rounded-lg bg-[#01091b] hover:bg-orange-500/10 hover:text-orange-400 border border-slate-800 text-slate-400 transition-all"
                          title="Copy Shareable URL"
                        >
                          <Share2 size={13} />
                        </button>
                        
                        <a
                          href={cert.r2_object_key ? `/api/recognition/file?key=${encodeURIComponent(cert.r2_object_key)}` : 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200'}
                          download={cert.file_name || 'certificate.png'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#01091b] hover:bg-emerald-500/10 hover:text-emerald-400 border border-slate-800 text-slate-400 transition-all flex items-center justify-center"
                          title="Download Document"
                        >
                          <Download size={13} />
                        </a>
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
            className="fixed inset-0 z-50 bg-[#00040fb8] backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-6"
            onClick={closePreview}
          >
            {/* Control Bar */}
            <motion.div 
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="bg-[#031336] border border-indigo-900/60 rounded-full px-5 py-2 mb-4 flex items-center gap-4 text-slate-300 shadow-2xl relative z-10 max-w-4xl w-full justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                <span className="text-slate-100 font-bold max-w-[180px] md:max-w-xs truncate">{activePreviewCert.title}</span>
              </div>

              {/* View control deck */}
              <div className="flex items-center gap-1.5 md:gap-3">
                <button 
                  onClick={handleZoomIn}
                  className="p-1.5 hover:text-white rounded-md bg-[#01091b] hover:bg-orange-500/20 text-slate-300 transition-all"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={15} />
                </button>
                <button 
                  onClick={handleZoomOut}
                  className="p-1.5 hover:text-white rounded-md bg-[#01091b] hover:bg-orange-500/20 text-slate-300 transition-all"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={15} />
                </button>
                <button 
                  onClick={handleRotateCw}
                  className="p-1.5 hover:text-white rounded-md bg-[#01091b] hover:bg-orange-500/20 text-slate-300 transition-all"
                  title="Rotate Right (R)"
                >
                  <RotateCw size={15} />
                </button>
                <button 
                  onClick={resetZoomRotate}
                  className="text-xs uppercase px-2 py-1.5 rounded-md bg-[#01091b] hover:text-white transition-all hover:bg-slate-800 font-mono"
                  title="Reset view adjustments"
                >
                  Reset
                </button>

                <div className="h-4 w-[1px] bg-slate-700/50" />

                <button 
                  onClick={handlePrint}
                  className="p-1.5 hover:text-white rounded-md bg-[#01091b] hover:bg-slate-800 transition-all"
                  title="Print Document"
                >
                  <Printer size={15} />
                </button>
                
                <a 
                  href={activePreviewCert.r2_object_key ? `/api/recognition/file?key=${encodeURIComponent(activePreviewCert.r2_object_key)}` : 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200'}
                  download={activePreviewCert.file_name || 'certificate.png'}
                  className="p-1.5 hover:text-emerald-400 rounded-md bg-[#01091b] hover:bg-slate-800 transition-all flex items-center justify-center text-slate-300"
                  title="Direct download file"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={15} />
                </a>

                {activePreviewCert.verification_url && (
                  <a 
                    href={activePreviewCert.verification_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:text-orange-400 rounded-md bg-[#01091b] hover:bg-slate-800 transition-all flex items-center justify-center text-slate-300"
                    title="Visit Verification Portal"
                  >
                    <Globe size={15} />
                  </a>
                )}
              </div>

              <button 
                onClick={closePreview}
                className="p-1.5 hover:bg-rose-950/40 hover:text-rose-400 text-rose-500 rounded-full transition-colors bg-[#01091b]"
                title="Close (ESC)"
              >
                <X size={15} />
              </button>
            </motion.div>

            {/* Immersive Certificate Rendering Stage */}
            <div className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-2 md:p-6 relative">
              <motion.div 
                layout
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  maxHeight: '75vh',
                  maxWidth: '100%'
                }}
                className="bg-slate-900 border border-indigo-900/40 rounded-xl overflow-hidden shadow-2xl relative select-none"
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
              className="bg-[#031336]/90 border border-indigo-900/40 rounded-xl p-4 mt-4 shadow-2xl max-w-2xl w-full text-slate-300 text-xs md:text-sm text-left relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 font-mono">
                  {activePreviewCert.category} • Reference No: {activePreviewCert.certificate_number || 'N/A'}
                </span>
                <p className="text-slate-100 font-bold font-serif">{activePreviewCert.title}</p>
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                  {activePreviewCert.description || 'No digital metadata description provided.'}
                </p>
              </div>

              {activePreviewCert.verification_url && (
                <a
                  href={activePreviewCert.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-end md:self-center"
                >
                  <Globe size={11} />
                  Verify Online
                  <ArrowRight size={11} />
                </a>
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
            className="fixed bottom-6 right-6 z-50 bg-[#031336] border border-orange-500 text-slate-100 font-sans text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
