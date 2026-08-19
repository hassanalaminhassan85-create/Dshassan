import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, ShieldCheck, Download, Share2, Eye, Search, Filter,
  RotateCw, ZoomIn, ZoomOut, RefreshCw, Printer, ExternalLink, X, Sparkles, CheckCircle2
} from 'lucide-react';
import { apiSubscribeToRecognitionCertificates } from '../lib/api';
import { RECOGNITION_CERTIFICATES, RecognitionCertificate } from '../lib/data';
import { StandalonePageHeader } from './StandalonePageHeader';
import { StandalonePageFooter } from './StandalonePageFooter';

interface RecognitionSectionProps {
  onBackToPortal?: () => void;
}

export const RecognitionSection: React.FC<RecognitionSectionProps> = ({ onBackToPortal }) => {
  const [certificates, setCertificates] = useState<RecognitionCertificate[]>(() => {
    try {
      const saved = localStorage.getItem('admin_recognition_certificates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return RECOGNITION_CERTIFICATES;
    } catch (e) {
      return RECOGNITION_CERTIFICATES;
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'custom' | 'newest' | 'oldest'>('custom');
  
  // Modal viewer state
  const [previewCert, setPreviewCert] = useState<RecognitionCertificate | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const printFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const unsub = apiSubscribeToRecognitionCertificates((data) => {
      if (data && data.length > 0) {
        setCertificates(data);
      }
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(certificates.map(c => c.category || 'General')))];
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    let list = certificates.filter(c => {
      const matchesCategory = activeCategory === 'all' || (c.category || 'General') === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.title?.toLowerCase().includes(q) ||
        c.issuingOrganization?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.referenceId?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q));

      const matchesVerified = !verifiedOnly || c.isVerified;
      return matchesCategory && matchesSearch && matchesVerified;
    });

    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
    } else {
      list = [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }

    return list;
  }, [certificates, activeCategory, searchQuery, verifiedOnly, sortBy]);

  const handleShare = (cert: RecognitionCertificate) => {
    const shareUrl = cert.verifyUrl || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(cert.id);
      setTimeout(() => setIsCopied(null), 3000);
    }
  };

  const handlePrint = (cert: RecognitionCertificate) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${cert.title} - Official Certificate</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 40px; }
              img { max-width: 100%; height: auto; border: 2px solid #ccc; padding: 10px; }
              h1 { color: #000E32; font-size: 24px; margin-bottom: 5px; }
              p { color: #666; font-size: 14px; }
              .ref { font-family: monospace; font-weight: bold; color: #d97706; margin-top: 15px; }
            </style>
          </head>
          <body>
            <h1>${cert.title}</h1>
            <p>Issued by ${cert.issuingOrganization} on ${cert.issueDate}</p>
            <img src="${cert.imageUrl || cert.badgeUrl}" alt="Certificate" />
            <p className="ref">Reference ID: ${cert.referenceId || cert.id}</p>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-500 flex flex-col w-full selection:bg-orange-500 selection:text-white">
      {/* Standalone Header */}
      <StandalonePageHeader 
        activePage="recognition" 
        badgeText="ACCREDITATIONS" 
        onBackToMain={onBackToPortal} 
      />

      {/* Main Page Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in text-left">
        
        {/* HERO BANNER SECTION */}
        <section className="relative rounded-3xl bg-gradient-to-br from-[#000E32] via-[#011442] to-slate-950 text-white p-6 sm:p-10 md:p-12 overflow-hidden border border-indigo-950 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>OFFICIAL CORPORATE CREDENTIALS & COMPLIANCE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase font-serif">
              Government Registered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 font-extrabold italic">
                & Regulatory Verified
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-light">
              Review and independently verify our statutory business incorporations, tax compliance certs, SCUML anti-money laundering clearances, and official technology accreditations.
            </p>

            {/* Compliance Badge Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">Incorporation</span>
                <span className="text-lg font-black text-white font-serif">CAC RC: 1845921</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">Anti-Money Laundering</span>
                <span className="text-lg font-black text-white font-serif">SCUML Certified</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider block">Tax Compliance</span>
                <span className="text-lg font-black text-white font-serif">FIRS Cleared</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">Verification</span>
                <span className="text-lg font-black text-white font-serif">100% Authentic</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH AND FILTERS TOOLBAR */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-4 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search certificate title, organization, or reference ID..."
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all font-sans"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Controls Group */}
              <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
                {/* Verified Toggle */}
                <label className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Verified Only</span>
                </label>

                {/* Sort Order Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="custom">Standard Order</option>
                  <option value="newest">Newest Issued First</option>
                  <option value="oldest">Oldest Issued First</option>
                </select>
              </div>

            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {cat === 'all' ? 'All Credentials' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CERTIFICATES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCertificates.map((cert, idx) => (
                <motion.div
                  key={cert.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
                >
                  {/* Card Header & Badge */}
                  <div>
                    <div className="p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800 relative">
                      
                      {/* Organization & Verification Status */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          {cert.badgeUrl ? (
                            <img 
                              src={cert.badgeUrl} 
                              alt={cert.issuingOrganization}
                              className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold font-serif text-sm">
                              {cert.issuingOrganization?.charAt(0) || 'D'}
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 block">
                              {cert.issuingOrganization}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Issued: {cert.issueDate}
                            </span>
                          </div>
                        </div>

                        {cert.isVerified && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                            <CheckCircle2 size={12} />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg font-serif group-hover:text-amber-500 transition-colors leading-snug">
                        {cert.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mt-2 font-normal line-clamp-3">
                        {cert.description}
                      </p>
                    </div>

                    {/* Metadata Specs */}
                    <div className="p-6 space-y-3 text-xs">
                      {cert.referenceId && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/80 font-mono">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Reference ID:</span>
                          <span className="text-amber-500 font-bold">{cert.referenceId}</span>
                        </div>
                      )}

                      {cert.expiryDate && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Validity:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{cert.expiryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewCert(cert);
                        setZoomLevel(1);
                        setRotationAngle(0);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#000E32] dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 transition-all font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye size={14} />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShare(cert)}
                        className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-amber-500 transition-all cursor-pointer"
                        title={isCopied === cert.id ? 'Copied Share Link!' : 'Share Certificate Link'}
                      >
                        <Share2 size={14} className={isCopied === cert.id ? 'text-emerald-500' : ''} />
                      </button>

                      {cert.pdfUrl && (
                        <a
                          href={cert.pdfUrl}
                          download
                          className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-amber-500 transition-all cursor-pointer"
                          title="Download PDF Certificate"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>

            {filteredCertificates.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-4 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Award className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No accreditation records found matching your filters.</p>
                <button 
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); setVerifiedOnly(false); }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CERTIFICATE PREVIEW MODAL */}
        <AnimatePresence>
          {previewCert && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md"
              onClick={() => setPreviewCert(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full overflow-hidden shadow-2xl text-left flex flex-col max-h-[92vh]"
              >
                {/* Modal Toolbar Header */}
                <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-white font-serif tracking-tight">
                      {previewCert.title}
                    </h3>
                    <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                      Ref ID: {previewCert.referenceId || previewCert.id}
                    </p>
                  </div>

                  {/* Toolbar controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Zoom In"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Zoom Out"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <button
                      onClick={() => setRotationAngle(prev => (prev + 90) % 360)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Rotate 90°"
                    >
                      <RotateCw size={16} />
                    </button>
                    <button
                      onClick={() => { setZoomLevel(1); setRotationAngle(0); }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Reset View"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => handlePrint(previewCert)}
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                      title="Print Certificate"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => setPreviewCert(null)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-white ml-2"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Certificate Viewer Canvas */}
                <div className="p-6 bg-slate-950 flex items-center justify-center overflow-auto flex-1 min-h-[350px]">
                  <div 
                    className="transition-transform duration-300 max-w-full flex justify-center"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`
                    }}
                  >
                    <img 
                      src={previewCert.imageUrl || previewCert.badgeUrl} 
                      alt={previewCert.title} 
                      className="max-h-[60vh] object-contain rounded-xl shadow-2xl border border-slate-800"
                    />
                  </div>
                </div>

                {/* Footer Bar inside Modal */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Issued by {previewCert.issuingOrganization} ({previewCert.issueDate})</span>
                  </div>

                  {previewCert.verifyUrl && (
                    <a
                      href={previewCert.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-bold text-xs font-mono uppercase"
                    >
                      <span>Verify Online Ledger</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Standalone Footer */}
      <StandalonePageFooter />
    </div>
  );
};
