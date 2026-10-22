import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Download, Eye, Share2, ExternalLink, FileText, 
  LayoutGrid, List, Calendar, HardDrive, Check, Copy, AlertCircle, 
  RefreshCw, ArrowRight, Sparkles, BookOpen, ChevronRight, X
} from 'lucide-react';
import { ProposalRecord } from '../../types';
import { apiGetProposals, apiSubscribeToProposals } from '../../lib/api';
import { ProposalDocumentReader } from './ProposalDocumentReader';

interface OurProposalsSectionProps {
  initialProposalId?: string | null;
  onNavigateHome?: () => void;
  theme?: string;
}

export const OurProposalsSection: React.FC<OurProposalsSectionProps> = ({
  initialProposalId,
  onNavigateHome,
  theme = 'dark'
}) => {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter, search, and sort states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Reader & Details Modals
  const [activeReadingProposal, setActiveReadingProposal] = useState<ProposalRecord | null>(null);
  const [selectedDetailsProposal, setSelectedDetailsProposal] = useState<ProposalRecord | null>(null);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  // Fetch proposals & subscribe to real-time sync
  const loadProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetProposals(false);
      setProposals(data);
    } catch (err: any) {
      console.error('Failed to load proposals:', err);
      setError('Unable to load proposals library right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
    const unsubscribe = apiSubscribeToProposals((data) => {
      setProposals(data.filter(p => p.status === 'published'));
    }, false);
    return () => unsubscribe();
  }, []);

  // Handle direct permalink or query parameter
  useEffect(() => {
    if (initialProposalId && proposals.length > 0) {
      const match = proposals.find(p => p.id === initialProposalId);
      if (match) {
        setSelectedDetailsProposal(match);
      }
    }
  }, [initialProposalId, proposals]);

  // Extract unique categories from actual data
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    proposals.forEach(p => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return ['All', ...Array.from(cats)];
  }, [proposals]);

  // Filter and sort proposals
  const filteredProposals = useMemo(() => {
    let result = [...proposals];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query filter (title, description, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'title_desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      // default: newest
      return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
    });

    return result;
  }, [proposals, selectedCategory, searchQuery, sortBy]);

  // Share proposal link handler
  const handleShare = async (proposal: ProposalRecord) => {
    const shareUrl = `${window.location.origin}/proposals?id=${encodeURIComponent(proposal.id)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: proposal.title,
          text: proposal.description || `Check out this proposal: ${proposal.title}`,
          url: shareUrl
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Navigator share error, falling back to clipboard copy:', err);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccessId(proposal.id);
      setTimeout(() => setCopySuccessId(null), 3000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    if (bytes < k * k) {
      return (bytes / k).toFixed(1) + ' KB';
    }
    return (bytes / (k * k)).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      {/* Hero Header */}
      <section className={`relative border-b ${isDark ? 'border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950' : 'border-slate-200 bg-white'} py-12 sm:py-16 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Technical & Corporate Library</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">Proposals</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Explore verified corporate briefs, software engineering blueprints, digital marketing proposals, and enterprise solution roadmaps from DS TECH & Digital Marketing Agency Limited.
          </p>

          {/* Genuine Calculated Proposal Counter */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span className="font-bold">{proposals.length}</span>
              <span className="text-slate-500 dark:text-slate-400">Published Proposal{proposals.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery, Search & Filters Toolbar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className={`p-4 rounded-2xl border shadow-xl backdrop-blur-xl ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals by exact title, category, or keywords..."
                className={`w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                  isDark 
                    ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`text-xs px-3 py-2.5 rounded-xl border appearance-none pr-8 cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`text-xs px-3 py-2.5 rounded-xl border appearance-none pr-8 cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="title_asc">Title A–Z</option>
                <option value="title_desc">Title Z–A</option>
              </select>

              {/* Grid / List Switcher */}
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Clear Filters (if active) */}
              {(searchQuery || selectedCategory !== 'All' || sortBy !== 'newest') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSortBy('newest');
                  }}
                  className="px-2.5 py-2 text-xs font-semibold text-amber-500 hover:text-amber-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Main Proposal Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Retrieving verified proposals...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-slate-900 border-red-500/20' : 'bg-red-50/50 border-red-200'} max-w-lg mx-auto space-y-3`}>
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="font-bold text-sm text-red-500">Communication Error</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button
              onClick={loadProposals}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Empty State: Zero Proposals in Library */}
        {!loading && !error && proposals.length === 0 && (
          <div className={`py-16 text-center rounded-3xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} p-8 max-w-lg mx-auto space-y-3`}>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base">No Published Proposals Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Official corporate proposals and capability documents will appear here once published by our platform administrators.
            </p>
          </div>
        )}

        {/* Empty State: Search / Filter Returned No Results */}
        {!loading && !error && proposals.length > 0 && filteredProposals.length === 0 && (
          <div className={`py-16 text-center rounded-3xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} p-8 max-w-lg mx-auto space-y-3`}>
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base">No Matching Proposals Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No proposal matched the query <span className="font-mono text-amber-500 font-bold">"{searchQuery}"</span> under <span className="font-bold">{selectedCategory}</span>.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2 mt-2"
            >
              <span>Clear Search Filters</span>
            </button>
          </div>
        )}

        {/* Proposals Grid View */}
        {!loading && !error && filteredProposals.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProposals.map((proposal) => {
              const isPdf = proposal.mime_type === 'application/pdf' || proposal.original_filename.toLowerCase().endsWith('.pdf');
              const docUrl = `/api/proposals/file?id=${encodeURIComponent(proposal.id)}`;
              const downloadUrl = `/api/proposals/file?id=${encodeURIComponent(proposal.id)}&download=true`;

              return (
                <div
                  key={proposal.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-amber-500/50 hover:shadow-xl ${
                    isDark ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-900' : 'bg-white border-slate-200/90 hover:bg-white'
                  }`}
                >
                  {/* Card Header Top Row */}
                  <div className="p-5 pb-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider ${
                        isPdf
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {isPdf ? 'PDF' : 'DOCX'}
                      </span>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatFileSize(proposal.file_size)}
                      </span>
                    </div>

                    {/* Exact Title Entered by Administrator */}
                    <h3 
                      onClick={() => setSelectedDetailsProposal(proposal)}
                      className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-amber-500 transition-colors leading-snug"
                      title={proposal.title}
                    >
                      {proposal.title}
                    </h3>

                    {/* Optional Description */}
                    {proposal.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {proposal.description}
                      </p>
                    )}

                    {/* Metadata tags: Category & Published Date */}
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px]">
                      {proposal.category && (
                        <span className={`px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          {proposal.category}
                        </span>
                      )}
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(proposal.published_at || proposal.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Working Action Buttons */}
                  <div className={`p-3 border-t flex items-center justify-between gap-1.5 ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex items-center gap-1">
                      {/* 1. Read Online Action */}
                      <button
                        onClick={() => setActiveReadingProposal(proposal)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                        title="Read Online"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>

                      {/* 2. Download Action */}
                      <a
                        href={downloadUrl}
                        download={proposal.original_filename}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                        title="Download Original"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* 3. View Details */}
                      <button
                        onClick={() => setSelectedDetailsProposal(proposal)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                        title="View Details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* 4. Share Action */}
                      <button
                        onClick={() => handleShare(proposal)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer relative ${
                          copySuccessId === proposal.id
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Share Proposal Link"
                      >
                        {copySuccessId === proposal.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* 5. Open Original in Browser */}
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Open Original in New Tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Proposals List View */}
        {!loading && !error && filteredProposals.length > 0 && viewMode === 'list' && (
          <div className="space-y-3">
            {filteredProposals.map((proposal) => {
              const isPdf = proposal.mime_type === 'application/pdf' || proposal.original_filename.toLowerCase().endsWith('.pdf');
              const docUrl = `/api/proposals/file?id=${encodeURIComponent(proposal.id)}`;
              const downloadUrl = `/api/proposals/file?id=${encodeURIComponent(proposal.id)}&download=true`;

              return (
                <div
                  key={proposal.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-150 ${
                    isDark ? 'bg-slate-900/70 border-slate-800 hover:bg-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isPdf ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          isPdf ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {isPdf ? 'PDF' : 'DOCX'}
                        </span>
                        {proposal.category && (
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {proposal.category}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatFileSize(proposal.file_size)}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedDetailsProposal(proposal)}
                        className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-amber-500 mt-1"
                        title={proposal.title}
                      >
                        {proposal.title}
                      </h3>

                      {proposal.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl mt-0.5">
                          {proposal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Working Action Row */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setActiveReadingProposal(proposal)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Online</span>
                    </button>

                    <a
                      href={downloadUrl}
                      download={proposal.original_filename}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => setSelectedDetailsProposal(proposal)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                      title="Details"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleShare(proposal)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        copySuccessId === proposal.id
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Share"
                    >
                      {copySuccessId === proposal.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>

                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Open Original"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Proposal Details Modal */}
      <AnimatePresence>
        {selectedDetailsProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => setSelectedDetailsProposal(null)}
                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold uppercase">
                    Proposal Details
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">{selectedDetailsProposal.id}</span>
                </div>

                <h3 className="text-lg font-bold leading-snug">
                  {selectedDetailsProposal.title}
                </h3>

                {selectedDetailsProposal.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedDetailsProposal.description}
                  </p>
                )}

                <div className={`p-4 rounded-xl border text-xs space-y-2 font-mono ${
                  isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-sans font-medium">{selectedDetailsProposal.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original Document:</span>
                    <span className="truncate max-w-[200px]">{selectedDetailsProposal.original_filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Size:</span>
                    <span>{formatFileSize(selectedDetailsProposal.file_size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format:</span>
                    <span className="uppercase">{selectedDetailsProposal.mime_type.split('/').pop()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Published Date:</span>
                    <span>{formatDate(selectedDetailsProposal.published_at || selectedDetailsProposal.created_at)}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      const prop = selectedDetailsProposal;
                      setSelectedDetailsProposal(null);
                      setActiveReadingProposal(prop);
                    }}
                    className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Read Document</span>
                  </button>

                  <a
                    href={`/api/proposals/file?id=${encodeURIComponent(selectedDetailsProposal.id)}&download=true`}
                    download={selectedDetailsProposal.original_filename}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-300 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => handleShare(selectedDetailsProposal)}
                    className={`py-2.5 px-3 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      copySuccessId === selectedDetailsProposal.id
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                    title="Copy Public Link"
                  >
                    {copySuccessId === selectedDetailsProposal.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copySuccessId === selectedDetailsProposal.id ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Online Document Reader Modal */}
      {activeReadingProposal && (
        <ProposalDocumentReader
          proposal={activeReadingProposal}
          isOpen={!!activeReadingProposal}
          onClose={() => setActiveReadingProposal(null)}
          isAdmin={false}
        />
      )}
    </div>
  );
};
