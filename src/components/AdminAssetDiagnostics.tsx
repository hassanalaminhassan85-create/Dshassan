import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, CheckCircle, AlertTriangle, RefreshCw, Eye, Sparkles, 
  FolderOpen, Clock, HelpCircle, Save, Globe, Code, ArrowRight, Loader2, Info,
  Layers, BookOpen, ShieldCheck, FileText, Image as ImageIcon, Check, Filter,
  User, Search, Copy, ExternalLink, Grid, List, Shield, Camera, Layout
} from 'lucide-react';
import { apiGetApplications, apiUpdateApplication } from '../lib/storage';
import { 
  apiGetOngoingProjects, 
  apiSaveOngoingProject, 
  apiGetPortfolio, 
  apiUpdatePortfolio,
  apiGetServices,
  apiUpdateService,
  apiGetBlogs,
  apiUpdateBlog,
  apiGetRecognitionCertificates,
  apiSaveRecognitionCertificate,
  apiGetCacMetadata,
  apiSaveCacMetadata,
  resolveImageUrl,
  OngoingProject,
  RecognitionCertificate,
  CacMetadata
} from '../lib/api';
import { JobApplication } from '../types';

export interface DiagnosticItem {
  id: string;
  title: string;
  type: 'passports' | 'ongoing' | 'portfolio' | 'services' | 'blogs' | 'recognition' | 'cac';
  rawKey: string;
  renderUrl: string;
  category: string;
  originalRecord: any;
  subtext?: string;
}

export const AdminAssetDiagnostics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DiagnosticItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statuses, setStatuses] = useState<Record<string, { state: 'checking' | 'loaded' | 'failed'; detail: string }>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewModalItem, setPreviewModalItem] = useState<DiagnosticItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);

  // Load diagnostics data from all D1 database collections + candidate applications
  const loadDiagnosticsData = async () => {
    try {
      setLoading(true);
      const allItems: DiagnosticItem[] = [];

      // 1. Fetch Candidate Applications (Passport Photos)
      try {
        const apps = await apiGetApplications();
        apps.forEach(app => {
          const rawKey = app.personalInfo?.passportPhoto || '';
          if (rawKey) {
            allItems.push({
              id: app.id,
              title: app.personalInfo?.fullName || 'Candidate Applicant',
              type: 'passports',
              rawKey,
              renderUrl: resolveImageUrl(rawKey),
              category: 'Applicant Passport',
              subtext: app.positionSkills?.majorRole || 'Applicant',
              originalRecord: app
            });
          }
        });
      } catch (e) {
        console.warn("Diagnostics: Failed to fetch candidate applications:", e);
      }

      // 2. Fetch Ongoing Projects (Covers)
      try {
        const ongoing = await apiGetOngoingProjects(true);
        ongoing.forEach(p => {
          const rawKey = p.cover_image_key || '';
          allItems.push({
            id: p.id,
            title: p.title,
            type: 'ongoing',
            rawKey,
            renderUrl: resolveImageUrl(rawKey),
            category: p.category || 'Ongoing Project',
            subtext: `Progress: ${p.progress_percentage || 0}%`,
            originalRecord: p
          });
        });
      } catch (e) {
        console.warn("Diagnostics: Failed to fetch ongoing projects:", e);
      }

      // 3. Fetch Portfolio Projects (Covers)
      try {
        const portfolio = await apiGetPortfolio();
        portfolio.forEach(p => {
          const rawKey = p.image || '';
          allItems.push({
            id: p.id,
            title: p.title,
            type: 'portfolio',
            rawKey,
            renderUrl: resolveImageUrl(rawKey),
            category: p.category || 'Portfolio Case Study',
            subtext: p.client || 'Enterprise Client',
            originalRecord: p
          });
        });
      } catch (e) {
        console.warn("Diagnostics: Failed to fetch portfolio:", e);
      }

      // 4. Fetch Services Catalog
      try {
        const services = await apiGetServices();
        services.forEach(s => {
          const rawKey = s.image || '';
          allItems.push({
            id: s.id,
            title: s.name,
            type: 'services',
            rawKey,
            renderUrl: resolveImageUrl(rawKey),
            category: s.category || 'Service Offering',
            subtext: s.price || 'Catalog Item',
            originalRecord: s
          });
        });
      } catch (e) {
        console.warn("Diagnostics: Failed to fetch services:", e);
      }

      // 5. Fetch Blog Posts
      try {
        const blogs = await apiGetBlogs();
        blogs.forEach(b => {
          const rawKey = b.image || '';
          allItems.push({
            id: b.id,
            title: b.title,
            type: 'blogs',
            rawKey,
            renderUrl: resolveImageUrl(rawKey),
            category: b.category || 'Blog Post',
            subtext: b.readTime || 'Article',
            originalRecord: b
          });
        });
      } catch (e) {
        console.warn("Diagnostics: Failed to fetch blogs:", e);
      }

      // 6. Fetch Recognition Certificates
      try {
        const certs = await apiGetRecognitionCertificates(true);
        certs.forEach(c => {
          const rawKey = c.r2_object_key || '';
          allItems.push({
            id: c.id,
            title: c.title,
            type: 'recognition',
            rawKey,
            renderUrl: resolveImageUrl(rawKey),
            category: c.category || 'Recognition Cert',
            subtext: c.issuing_organization || 'Award',
            originalRecord: c
          });
        });
      } catch (e) {
        console.warn("Diagnostics: Failed to fetch recognition certs:", e);
      }

      // 7. Fetch CAC Metadata
      try {
        const cac = await apiGetCacMetadata(true);
        cac.forEach(c => {
          const rawKey = c.r2_object_key || '';
          allItems.push({
            id: c.id,
            title: c.company_name,
            type: 'cac',
            rawKey,
            renderUrl: resolveImageUrl(rawKey),
            category: 'CAC Certificate',
            subtext: `RC: ${(c as any).registration_number || (c as any).rc_number || 'N/A'}`,
            originalRecord: c
          });
        });
      } catch (e) {
        console.warn("Diagnostics: Failed to fetch CAC metadata:", e);
      }

      setItems(allItems);

      // Initialize audit statuses
      const initialStatuses: typeof statuses = {};
      allItems.forEach(item => {
        initialStatuses[item.id] = { state: 'checking', detail: 'Auditing secure image loading stream...' };
      });
      setStatuses(initialStatuses);

      // Audit image load streams in parallel
      allItems.forEach(item => {
        auditImage(item);
      });

    } catch (err: any) {
      showMsg("Failed to run diagnostics query: " + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const auditImage = (item: DiagnosticItem) => {
    if (!item.renderUrl) {
      setStatuses(prev => ({
        ...prev,
        [item.id]: { state: 'failed', detail: 'Empty D1 key/URL value. Default placeholder active on UI.' }
      }));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      const isUnsplashUrl = item.rawKey.includes('unsplash.com');
      const isR2Key = !item.rawKey.startsWith('http://') && !item.rawKey.startsWith('https://') && !item.rawKey.startsWith('data:') && item.rawKey !== '';
      
      let detail = 'HTTP image resolved and rendered successfully.';
      if (isR2Key) {
        detail = 'R2 Secure asset stream verified and loaded live by browser.';
      } else if (isUnsplashUrl) {
        detail = 'Pristine Unsplash reference resolved and rendered.';
      } else if (item.rawKey.startsWith('data:')) {
        detail = 'Inline Data URI embedded and verified.';
      }

      setStatuses(prev => ({
        ...prev,
        [item.id]: { state: 'loaded', detail }
      }));
    };

    img.onerror = () => {
      setStatuses(prev => ({
        ...prev,
        [item.id]: { 
          state: 'failed', 
          detail: 'Asset unreachable or R2 object key missing. Graceful fallback active.' 
        }
      }));
    };

    img.src = item.renderUrl;
  };

  const showMsg = (text: string, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateImage = async (item: DiagnosticItem) => {
    if (!editValue.trim()) return;
    try {
      setSaving(true);
      showMsg("Saving updated asset reference to Cloudflare D1 database...");
      
      const newKey = editValue.trim();

      if (item.type === 'passports') {
        await apiUpdateApplication(item.id, {
          personalInfo: {
            ...item.originalRecord.personalInfo,
            passportPhoto: newKey
          }
        });
      } else if (item.type === 'ongoing') {
        await apiSaveOngoingProject({
          ...item.originalRecord,
          cover_image_key: newKey
        });
      } else if (item.type === 'portfolio') {
        await apiUpdatePortfolio(item.id, {
          ...item.originalRecord,
          image: newKey
        });
      } else if (item.type === 'services') {
        await apiUpdateService(item.id, {
          ...item.originalRecord,
          image: newKey
        });
      } else if (item.type === 'blogs') {
        await apiUpdateBlog(item.id, {
          ...item.originalRecord,
          image: newKey
        });
      } else if (item.type === 'recognition') {
        await apiSaveRecognitionCertificate({
          ...item.originalRecord,
          r2_object_key: newKey
        });
      } else if (item.type === 'cac') {
        await apiSaveCacMetadata({
          ...item.originalRecord,
          r2_object_key: newKey
        });
      }

      showMsg(`✅ Successfully updated ${item.title} image reference in D1 SQL!`);
      setEditingId(null);
      loadDiagnosticsData();
    } catch (err: any) {
      showMsg("Failed to update database record: " + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadDiagnosticsData();
  }, []);

  // Filter & search calculations
  const filteredItems = items.filter(item => {
    // Type filter
    let matchesType = true;
    if (filterType === 'passports') matchesType = item.type === 'passports';
    else if (filterType === 'projects') matchesType = item.type === 'ongoing' || item.type === 'portfolio';
    else if (filterType === 'services_blogs') matchesType = item.type === 'services' || item.type === 'blogs';
    else if (filterType === 'certs') matchesType = item.type === 'recognition' || item.type === 'cac';
    else if (filterType !== 'all') matchesType = item.type === filterType;

    // Status filter
    let matchesStatus = true;
    const status = statuses[item.id];
    const isR2Key = item.rawKey && !item.rawKey.startsWith('http://') && !item.rawKey.startsWith('https://') && !item.rawKey.startsWith('data:');
    if (statusFilter === 'live_r2') matchesStatus = status?.state === 'loaded' && isR2Key;
    else if (statusFilter === 'live_http') matchesStatus = status?.state === 'loaded' && !isR2Key;
    else if (statusFilter === 'fallback') matchesStatus = status?.state === 'failed';

    // Search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch = 
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.rawKey.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
    }

    return matchesType && matchesStatus && matchesSearch;
  });

  // Calculate live verification counters
  const totalCount = items.length;
  const passportCount = items.filter(i => i.type === 'passports').length;
  const projectCoversCount = items.filter(i => i.type === 'ongoing' || i.type === 'portfolio').length;
  const liveR2Count = items.filter(i => {
    const isR2Key = i.rawKey && !i.rawKey.startsWith('http://') && !i.rawKey.startsWith('https://') && !i.rawKey.startsWith('data:');
    return statuses[i.id]?.state === 'loaded' && isR2Key;
  }).length;
  const fallbackCount = items.filter(i => statuses[i.id]?.state === 'failed').length;

  const getTypeBadge = (type: DiagnosticItem['type']) => {
    switch (type) {
      case 'passports':
        return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1"><Camera size={10} /> Passport Photo</span>;
      case 'ongoing':
        return <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1"><Clock size={10} /> Ongoing Cover</span>;
      case 'portfolio':
        return <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1"><FolderOpen size={10} /> Portfolio Cover</span>;
      case 'services':
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1"><Layers size={10} /> Service Asset</span>;
      case 'blogs':
        return <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1"><BookOpen size={10} /> Blog Cover</span>;
      case 'recognition':
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1"><ShieldCheck size={10} /> Recognition Cert</span>;
      case 'cac':
        return <span className="bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-violet-500/20 flex items-center gap-1"><FileText size={10} /> CAC Cert</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* 1. Header Banner & Live Telemetry Summary */}
      <div className="bg-[#000E32] text-white p-6 sm:p-8 rounded-3xl border border-blue-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-blue-950/80 rounded-2xl border border-blue-800 text-orange-400 shrink-0 shadow-inner">
              <Camera size={28} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 font-mono">Real-Time Verification Engine</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  R2 & D1 Live Stream Active
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold font-serif uppercase tracking-wider text-white">
                Image Verification Gallery & Asset Diagnostics
              </h2>
              <p className="text-slate-300 text-xs font-light max-w-3xl leading-relaxed">
                Live verification gallery rendering uploaded applicant passport photos, ongoing project covers, portfolio case studies, and corporate certificates directly from Cloudflare R2 object links.
              </p>
            </div>
          </div>

          <button
            onClick={loadDiagnosticsData}
            disabled={loading}
            className="px-5 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-2xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20 active:scale-95 shrink-0 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Verification Gallery</span>
          </button>
        </div>

        {/* Live Counters Metric Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t border-blue-900/40">
          <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Audited Assets</span>
            <span className="text-xl font-extrabold font-mono text-white">{totalCount}</span>
          </div>
          <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider font-mono block">Passport Photos</span>
            <span className="text-xl font-extrabold font-mono text-rose-300">{passportCount}</span>
          </div>
          <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono block">Project Covers</span>
            <span className="text-xl font-extrabold font-mono text-amber-300">{projectCoversCount}</span>
          </div>
          <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono block">Live R2 Stream</span>
            <span className="text-xl font-extrabold font-mono text-emerald-400">{liveR2Count}</span>
          </div>
          <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider font-mono block">Fallback / Missing</span>
            <span className="text-xl font-extrabold font-mono text-orange-400">{fallbackCount}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-xs font-mono flex items-center gap-2 border shadow-sm ${
              notification.isError 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}
          >
            {notification.isError ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter, Search & View Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: `All (${items.length})` },
              { id: 'passports', label: `Passports (${passportCount})` },
              { id: 'projects', label: `Project Covers (${projectCoversCount})` },
              { id: 'services_blogs', label: `Services & Blogs` },
              { id: 'certs', label: `Certs & CAC` },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setFilterType(pill.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  filterType === pill.id 
                    ? 'bg-[#000E32] text-orange-400 border border-orange-500/40 shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Search, Status & View Toggle */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search title, ID, key..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">All Live Statuses</option>
              <option value="live_r2">🟢 Live R2 Keys</option>
              <option value="live_http">🔵 Live HTTP Links</option>
              <option value="fallback">🟡 Fallbacks Active</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-[#000E32] dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid Verification Gallery"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-[#000E32] dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Detailed Audit Table"
              >
                <List size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Verification View */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
          <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">Auditing Cloudflare D1 SQL Schema and checking R2 stream links...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-3 shadow-sm">
          <ImageIcon size={40} className="text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">No Assets Matching Current Filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Try clearing your search query or selecting a different section filter tab above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID VERIFICATION GALLERY VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map(item => {
            const status = statuses[item.id] || { state: 'checking', detail: 'Auditing...' };
            const isR2Key = item.rawKey && !item.rawKey.startsWith('http://') && !item.rawKey.startsWith('https://') && !item.rawKey.startsWith('data:');
            const isEditing = editingId === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Image Preview Container */}
                <div className="relative h-48 bg-slate-950 overflow-hidden group/img">
                  <img
                    src={item.renderUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Top Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                    <div className="shadow-md">
                      {getTypeBadge(item.type)}
                    </div>

                    {/* Live Status Indicator Badge */}
                    <div className="shadow-md">
                      {status.state === 'checking' && (
                        <span className="px-2 py-0.5 bg-amber-500/90 text-white text-[8px] font-mono rounded-full font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs">
                          <Loader2 size={9} className="animate-spin" />
                          <span>Auditing</span>
                        </span>
                      )}
                      {status.state === 'loaded' && isR2Key && (
                        <span className="px-2 py-0.5 bg-emerald-600/90 text-white text-[8px] font-mono rounded-full font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>LIVE R2 STREAM</span>
                        </span>
                      )}
                      {status.state === 'loaded' && !isR2Key && (
                        <span className="px-2 py-0.5 bg-sky-600/90 text-white text-[8px] font-mono rounded-full font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs">
                          <Globe size={9} />
                          <span>HTTP URL</span>
                        </span>
                      )}
                      {status.state === 'failed' && (
                        <span className="px-2 py-0.5 bg-orange-600/90 text-white text-[8px] font-mono rounded-full font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs">
                          <AlertTriangle size={9} />
                          <span>FALLBACK ACTIVE</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Zoom Preview Hover Action */}
                  <button
                    onClick={() => setPreviewModalItem(item)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white font-mono text-xs font-bold gap-1.5"
                  >
                    <Eye size={16} />
                    <span>Inspect Full Asset</span>
                  </button>
                </div>

                {/* Card Info & Details Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-serif font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide line-clamp-1 text-left" title={item.title}>
                      {item.title}
                    </h4>
                    {item.subtext && (
                      <p className="text-[10px] text-slate-400 font-mono text-left font-medium">
                        {item.subtext}
                      </p>
                    )}
                  </div>

                  {/* Raw DB Key Box */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-slate-400 font-mono uppercase tracking-wider">Raw D1 Key</span>
                      <button
                        onClick={() => copyToClipboard(item.rawKey, item.id)}
                        className="text-[9px] text-indigo-500 hover:text-indigo-600 font-mono font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedId === item.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[9.5px] font-mono text-slate-700 dark:text-slate-300 truncate select-all" title={item.rawKey}>
                      {item.rawKey || <span className="text-rose-500 italic">[Empty Value]</span>}
                    </p>
                  </div>

                  {/* Quick-Fix Editor or Action Button */}
                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-full p-2 text-[10px] font-mono bg-white dark:bg-slate-950 border border-orange-500 rounded-xl focus:outline-none"
                        placeholder="Paste R2 key or HTTP URL..."
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateImage(item)}
                          disabled={saving}
                          className="px-3 py-1 bg-orange-600 text-white text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                          <span>Save D1</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.rawKey);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/50"
                    >
                      <Code size={11} className="text-orange-400" />
                      <span>Fix D1 Key</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      ) : (

        /* DETAILED AUDIT TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-serif">Cloudflare D1 SQL Raw Image Directory Audit</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2.5 py-1 text-slate-600 dark:text-slate-300 font-mono font-bold rounded-lg border border-slate-300/40 dark:border-slate-700">
              Entries Filtered: {filteredItems.length} / {items.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-150 dark:border-slate-800">
                  <th className="py-3 px-6 w-1/4">Metadata & Section</th>
                  <th className="py-3 px-4 w-1/4">Raw D1 SQL Entry</th>
                  <th className="py-3 px-4">Live Preview & Stream URL</th>
                  <th className="py-3 px-6 text-right">Database Quick-Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                {filteredItems.map(item => {
                  const status = statuses[item.id] || { state: 'checking', detail: 'Auditing...' };
                  const isR2Key = item.rawKey && !item.rawKey.startsWith('http://') && !item.rawKey.startsWith('https://') && !item.rawKey.startsWith('data:');
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/30 transition-colors">
                      {/* Metadata */}
                      <td className="py-4 px-6 text-left">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            {getTypeBadge(item.type)}
                            <span className="text-[9px] text-slate-400 font-mono uppercase">{item.category}</span>
                          </div>
                          <span className="text-slate-900 dark:text-white uppercase font-serif text-xs block leading-tight font-extrabold">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono block font-light">ID: {item.id}</span>
                        </div>
                      </td>

                      {/* Raw DB Entry */}
                      <td className="py-4 px-4 font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all select-all leading-normal">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Code size={12} className="text-indigo-500 shrink-0" />
                            <span className="font-bold text-slate-500 uppercase text-[8px] tracking-wider">D1 SQL Stored Value:</span>
                          </div>
                          <span className="font-semibold block text-slate-800 dark:text-slate-200 select-all font-mono">
                            {item.rawKey || <span className="text-rose-500 italic font-medium">[Empty / Null]</span>}
                          </span>
                          {isR2Key && item.rawKey && (
                            <span className="text-[8px] text-emerald-500 font-sans font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                              <Sparkles size={9} />
                              <span>R2 Storage Key Reference</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Verification & Preview Thumbnail */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="flex items-start gap-3">
                          <div 
                            onClick={() => setPreviewModalItem(item)}
                            className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 cursor-pointer group shadow-sm"
                          >
                            <img 
                              src={item.renderUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={12} className="text-white" />
                            </div>
                          </div>

                          <div className="space-y-1 flex-grow">
                            <div className="flex items-center gap-1.5">
                              {status.state === 'checking' && (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-mono rounded border border-amber-500/20 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                                  <Loader2 size={10} className="animate-spin" />
                                  <span>Auditing</span>
                                </span>
                              )}
                              {status.state === 'loaded' && (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-mono rounded border border-emerald-500/20 flex items-center gap-1 uppercase tracking-wider">
                                  <CheckCircle size={10} />
                                  <span>OK / Verified Stream</span>
                                </span>
                              )}
                              {status.state === 'failed' && (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[9px] font-mono rounded border border-rose-500/20 flex items-center gap-1 uppercase tracking-wider">
                                  <AlertTriangle size={10} />
                                  <span>Fail / Fallback Active</span>
                                </span>
                              )}
                            </div>

                            <span className="font-mono text-[9px] text-slate-400 block break-all leading-tight max-w-xs truncate" title={item.renderUrl}>
                              {item.renderUrl || <span className="italic">[None]</span>}
                            </span>
                            <p className="font-medium text-slate-600 dark:text-slate-400 italic font-sans text-[10px]">
                              &ldquo;{status.detail}&rdquo;
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Quick Fix Action */}
                      <td className="py-4 px-6 text-right">
                        {editingId === item.id ? (
                          <div className="space-y-2">
                            <input 
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="w-full max-w-xs p-2 text-[10px] font-mono bg-white dark:bg-slate-950 border border-indigo-500 rounded-lg focus:outline-none"
                              placeholder="Paste persistent HTTP image URL or R2 key..."
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded-md transition-all font-sans"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateImage(item)}
                                disabled={saving}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] rounded-md transition-all font-sans flex items-center gap-1"
                              >
                                {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                                <span>Save to D1</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditValue(item.rawKey);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] transition-all font-mono font-bold hover:shadow-md flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Code size={11} className="text-orange-400" />
                            <span>Fix DB String</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalItem(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#000E32] border border-blue-900 text-white max-w-xl w-full rounded-3xl p-6 space-y-4 relative shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider">Asset Stream Inspection</span>
                  <h3 className="font-serif font-extrabold uppercase text-sm text-white">{previewModalItem.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewModalItem(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black h-72 border border-slate-800 flex items-center justify-center">
                <img 
                  src={previewModalItem.renderUrl} 
                  alt={previewModalItem.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[10px] space-y-2 text-left">
                <div className="flex justify-between text-slate-400">
                  <span>Record Type:</span>
                  <span className="text-white font-bold">{previewModalItem.category}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Raw D1 Field:</span>
                  <span className="text-amber-400 select-all font-bold">{previewModalItem.rawKey || '[Empty]'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Target Stream URL:</span>
                  <span className="text-indigo-400 select-all break-all truncate max-w-xs">{previewModalItem.renderUrl}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
