import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Plus, Upload, Search, Filter, Trash2, Edit3, Eye, 
  Download, Globe, Lock, RefreshCw, AlertCircle, CheckCircle2, 
  HardDrive, Layers, ArrowUpDown, X, Check, FileCheck, ArrowUpRight,
  Sparkles, ShieldCheck, Copy, Clock, Calendar, AlertTriangle
} from 'lucide-react';
import { ProposalRecord, ProposalStatus } from '../../types';
import { 
  apiGetProposals, 
  apiUploadProposalDocument, 
  apiSaveProposal, 
  apiUpdateProposalMetadata, 
  apiReplaceProposalDocument, 
  apiToggleProposalPublish, 
  apiDeleteProposal, 
  apiSubscribeToProposals 
} from '../../lib/api';
import { ProposalDocumentReader } from './ProposalDocumentReader';

interface AdminProposalsManagerProps {
  theme?: string;
}

export const AdminProposalsManager: React.FC<AdminProposalsManagerProps> = ({
  theme = 'dark'
}) => {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search, filter, and sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc'>('newest');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingProposal, setEditingProposal] = useState<ProposalRecord | null>(null);
  const [replacingProposal, setReplacingProposal] = useState<ProposalRecord | null>(null);
  const [deletingProposal, setDeletingProposal] = useState<ProposalRecord | null>(null);
  const [readingProposal, setReadingProposal] = useState<ProposalRecord | null>(null);

  // Form states for Create Proposal
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Enterprise Solutions');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [formStatus, setFormStatus] = useState<ProposalStatus>('published');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form states for Replace Document
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementProgress, setReplacementProgress] = useState<number>(0);
  const [replacementError, setReplacementError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Predefined category choices
  const suggestedCategories = [
    'Enterprise Solutions',
    'Software Engineering',
    'AI & Automation',
    'Cloud & DevOps',
    'Digital Marketing',
    'Cybersecurity',
    'IT Academy Training',
    'Corporate Consulting'
  ];

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Fetch proposals
  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await apiGetProposals(true);
      setProposals(data);
    } catch (err: any) {
      console.error('Error fetching admin proposals:', err);
      showToast('error', 'Failed to retrieve proposal records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
    const unsub = apiSubscribeToProposals((data) => {
      setProposals(data);
    }, true);
    return () => unsub();
  }, []);

  // Compute live library metrics
  const stats = useMemo(() => {
    const total = proposals.length;
    const published = proposals.filter(p => p.status === 'published').length;
    const drafts = proposals.filter(p => p.status === 'draft').length;
    const totalBytes = proposals.reduce((acc, p) => acc + (p.file_size || 0), 0);
    return { total, published, drafts, totalBytes };
  }, [proposals]);

  // Unique categories
  const allCategories = useMemo(() => {
    const s = new Set<string>();
    proposals.forEach(p => {
      if (p.category) s.add(p.category.trim());
    });
    return ['All', ...Array.from(s)];
  }, [proposals]);

  // Filter & sort proposals
  const filteredProposals = useMemo(() => {
    let result = [...proposals];

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.original_filename && p.original_filename.toLowerCase().includes(q))
      );
    }

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
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [proposals, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Handle Document Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    const lower = file.name.toLowerCase();
    const isValid = lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.doc');
    if (!isValid) {
      setFormErrors(prev => ({ ...prev, file: 'Only PDF (.pdf) and Word (.docx, .doc) files are supported.' }));
      return;
    }
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFormErrors(prev => ({ ...prev, file: 'File size exceeds maximum 25MB limit.' }));
      return;
    }
    setFormErrors(prev => {
      const c = { ...prev };
      delete c.file;
      return c;
    });
    setSelectedFile(file);
  };

  // Submit New Proposal Form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formTitle.trim()) {
      errors.title = 'Proposal title is strictly required.';
    }
    if (!selectedFile) {
      errors.file = 'Please upload a proposal document.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const finalCategory = formCategory === '__custom__'
      ? (customCategoryInput.trim() || 'General')
      : formCategory;

    setActionLoading(true);
    setUploadProgress(10);

    try {
      // 1. Upload file to R2 / storage
      const uploadRes = await apiUploadProposalDocument(selectedFile!, (progress) => {
        setUploadProgress(progress);
      });

      // 2. Persist exact title and metadata in D1
      const newProposal: Partial<ProposalRecord> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: finalCategory,
        status: formStatus,
        file_key: uploadRes.file_key,
        original_filename: uploadRes.original_filename,
        file_size: uploadRes.file_size,
        mime_type: uploadRes.mime_type,
        created_by: 'Platform Administrator'
      };

      const saved = await apiSaveProposal(newProposal);

      showToast('success', `Proposal "${saved.title}" created successfully!`);
      setIsCreateModalOpen(false);
      resetCreateForm();
      loadProposals();
    } catch (err: any) {
      console.error('Proposal creation error:', err);
      showToast('error', err.message || 'Failed to upload proposal. Please check document and retry.');
    } finally {
      setActionLoading(false);
      setUploadProgress(0);
    }
  };

  const resetCreateForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Enterprise Solutions');
    setCustomCategoryInput('');
    setFormStatus('published');
    setSelectedFile(null);
    setFormErrors({});
  };

  // Update Metadata
  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;

    if (!editingProposal.title.trim()) {
      showToast('error', 'Proposal title cannot be empty.');
      return;
    }

    setActionLoading(true);
    try {
      await apiUpdateProposalMetadata(editingProposal.id, {
        title: editingProposal.title.trim(),
        description: editingProposal.description?.trim() || '',
        category: editingProposal.category?.trim() || 'General',
        status: editingProposal.status
      });

      showToast('success', `Proposal "${editingProposal.title}" updated successfully.`);
      setEditingProposal(null);
      loadProposals();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update proposal metadata.');
    } finally {
      setActionLoading(false);
    }
  };

  // Replace Document
  const handleReplaceDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingProposal || !replacementFile) return;

    setActionLoading(true);
    setReplacementProgress(15);
    setReplacementError(null);

    try {
      // 1. Upload new document
      const uploadRes = await apiUploadProposalDocument(replacementFile, (p) => {
        setReplacementProgress(p);
      });

      // 2. Update proposal record to point to new document
      await apiReplaceProposalDocument(replacingProposal.id, {
        file_key: uploadRes.file_key,
        original_filename: uploadRes.original_filename,
        file_size: uploadRes.file_size,
        mime_type: uploadRes.mime_type
      });

      showToast('success', `Document replaced successfully for "${replacingProposal.title}".`);
      setReplacingProposal(null);
      setReplacementFile(null);
      loadProposals();
    } catch (err: any) {
      console.error('Replace document error:', err);
      setReplacementError(err.message || 'Failed to replace document.');
      showToast('error', 'Replacement failed. The previous document remains active.');
    } finally {
      setActionLoading(false);
      setReplacementProgress(0);
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (proposal: ProposalRecord) => {
    const nextPublished = proposal.status !== 'published';
    try {
      await apiToggleProposalPublish(proposal.id, nextPublished);
      showToast('success', `Proposal "${proposal.title}" is now ${nextPublished ? 'Published' : 'Draft'}.`);
      loadProposals();
    } catch (err: any) {
      showToast('error', 'Failed to update publication status.');
    }
  };

  // Delete Proposal
  const handleDeleteProposal = async () => {
    if (!deletingProposal) return;
    setActionLoading(true);
    try {
      await apiDeleteProposal(deletingProposal.id);
      showToast('success', `Proposal "${deletingProposal.title}" deleted safely.`);
      setDeletingProposal(null);
      loadProposals();
    } catch (err: any) {
      showToast('error', 'Failed to delete proposal.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 KB';
    const k = 1024;
    if (bytes < k * k) return (bytes / k).toFixed(1) + ' KB';
    return (bytes / (k * k)).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
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
    <div className="space-y-6 animate-fade-in text-left">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl ${
              feedback.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Main Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>Proposal Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload, publish, replace, and govern company proposals and capability documents stored in Cloudflare D1 & R2.
          </p>
        </div>

        {/* Upload New Proposal Trigger */}
        <button
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Proposal</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Proposals</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold mt-2 font-mono text-slate-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">In D1 database</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Published</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold mt-2 font-mono text-emerald-500">
            {stats.published}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Publicly accessible</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Drafts</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold mt-2 font-mono text-amber-500">
            {stats.drafts}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Admin-only review</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Storage Volume</span>
            <HardDrive className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold mt-2 font-mono text-blue-400">
            {formatFileSize(stats.totalBytes)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Persistent R2 storage</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className={`p-3 sm:p-4 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, filename, or category..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`text-xs px-3 py-2 rounded-lg border cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Status: All</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`text-xs px-3 py-2 rounded-lg border cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {allCategories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'Category: All' : c}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-xs px-3 py-2 rounded-lg border cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="title_asc">Title A–Z</option>
              <option value="title_desc">Title Z–A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Management Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Loading proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No proposals match your criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {proposals.length === 0
                ? "Click 'Upload Proposal' above to add your first proposal document."
                : "Try adjusting your search query or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[10px] uppercase font-bold font-mono tracking-wider border-b ${
                isDark ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <tr>
                  <th className="px-4 py-3">Proposal Title</th>
                  <th className="px-3 py-3">Type & Size</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Created / Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                {filteredProposals.map((proposal) => {
                  const isPdf = proposal.mime_type === 'application/pdf' || proposal.original_filename.toLowerCase().endsWith('.pdf');
                  const isPublished = proposal.status === 'published';

                  return (
                    <tr 
                      key={proposal.id}
                      className={`hover:bg-slate-500/5 transition-colors ${
                        !isPublished ? (isDark ? 'bg-slate-950/30' : 'bg-slate-50/50') : ''
                      }`}
                    >
                      {/* Exact Title & Description */}
                      <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1" title={proposal.title}>
                          {proposal.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {proposal.original_filename}
                        </div>
                      </td>

                      {/* Format & Size */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isPdf ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}>
                            {isPdf ? 'PDF' : 'DOCX'}
                          </span>
                          <span className="text-slate-400">{formatFileSize(proposal.file_size)}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {proposal.category || 'General'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {isPublished ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                        <div>{formatDate(proposal.created_at)}</div>
                        {proposal.published_at && (
                          <div className="text-[9px] text-emerald-500">Live {formatDate(proposal.published_at)}</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview Online */}
                          <button
                            onClick={() => setReadingProposal(proposal)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title="Preview Document Online"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Metadata */}
                          <button
                            onClick={() => setEditingProposal({ ...proposal })}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Edit Title & Metadata"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Replace Document */}
                          <button
                            onClick={() => {
                              setReplacingProposal(proposal);
                              setReplacementFile(null);
                              setReplacementError(null);
                            }}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Replace File"
                          >
                            <Upload className="w-4 h-4" />
                          </button>

                          {/* Publish / Unpublish Toggle */}
                          <button
                            onClick={() => handleTogglePublish(proposal)}
                            className={`p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ${
                              isPublished ? 'text-emerald-400 hover:text-amber-400' : 'text-amber-400 hover:text-emerald-400'
                            }`}
                            title={isPublished ? "Unpublish to Draft" : "Publish to Library"}
                          >
                            {isPublished ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          </button>

                          {/* Download File */}
                          <a
                            href={`/api/proposals/file?id=${encodeURIComponent(proposal.id)}&download=true&admin=true`}
                            download={proposal.original_filename}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingProposal(proposal)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Proposal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / UPLOAD PROPOSAL MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>Upload & Create Proposal</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the exact title and upload the document to store it permanently in Cloudflare D1 & R2.
                  </p>
                </div>

                {/* 1. Exact Proposal Title (Mandatory) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Proposal Title <span className="text-red-400">*</span></span>
                    <span className="text-[10px] text-slate-500">Exact casing & punctuation will be preserved</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (formErrors.title) {
                        setFormErrors(prev => {
                          const n = { ...prev };
                          delete n.title;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g. Enterprise Cloud Infrastructure & Multi-Agent AI Architecture Proposal"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      formErrors.title
                        ? 'border-red-500 bg-red-500/5 text-white'
                        : isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.title}</span>
                    </p>
                  )}
                </div>

                {/* 2. Proposal Document Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Proposal Document <span className="text-red-400">*</span>
                  </label>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        validateAndSetFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-2 ${
                      selectedFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : formErrors.file
                        ? 'border-red-500/50 bg-red-500/5'
                        : isDark
                        ? 'border-slate-800 hover:border-amber-500/50 bg-slate-950/60'
                        : 'border-slate-300 hover:border-amber-500/50 bg-slate-50'
                    }`}
                  >
                    {selectedFile ? (
                      <div className="space-y-1">
                        <FileCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="text-xs font-bold text-white truncate max-w-sm">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatFileSize(selectedFile.size)} • Ready to upload
                        </p>
                        <p className="text-[10px] text-amber-400 underline pt-1">
                          Click to select different file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-7 h-7 text-amber-500 mx-auto" />
                        <p className="text-xs font-semibold text-slate-200">
                          Click to browse or drag & drop document
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Supports PDF (.pdf) or Word (.docx, .doc) up to 25MB
                        </p>
                      </div>
                    )}
                  </div>

                  {formErrors.file && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.file}</span>
                    </p>
                  )}
                </div>

                {/* 3. Description (Optional) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Description <span className="text-slate-500 text-[10px]">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief scope, target client industry, executive summary, or key deliverable highlights..."
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                {/* 4. Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border ${
                          formCategory === cat
                            ? 'bg-amber-500 text-white border-amber-500 font-bold'
                            : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormCategory('__custom__')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border ${
                        formCategory === '__custom__'
                          ? 'bg-amber-500 text-white border-amber-500 font-bold'
                          : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      + Custom Category
                    </button>
                  </div>

                  {formCategory === '__custom__' && (
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="Type custom category name..."
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  )}
                </div>

                {/* 5. Publication Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Initial Publication Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs transition-colors ${
                      formStatus === 'published'
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-white font-bold'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="formStatus"
                        checked={formStatus === 'published'}
                        onChange={() => setFormStatus('published')}
                        className="text-emerald-500"
                      />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Publish Immediately</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Visible in public library</p>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs transition-colors ${
                      formStatus === 'draft'
                        ? 'border-amber-500/50 bg-amber-500/10 text-white font-bold'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="formStatus"
                        checked={formStatus === 'draft'}
                        onChange={() => setFormStatus('draft')}
                        className="text-amber-500"
                      />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Save as Draft</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Private to admins only</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Upload Progress Indicator */}
                {actionLoading && uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Uploading & Securing Document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{actionLoading ? 'Uploading...' : 'Confirm & Save Proposal'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT METADATA MODAL */}
      <AnimatePresence>
        {editingProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => setEditingProposal(null)}
                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleUpdateMetadata} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-500" />
                    <span>Edit Proposal Metadata</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update the title, category, or description. The underlying document remains untouched.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Proposal Title</label>
                  <input
                    type="text"
                    value={editingProposal.title}
                    onChange={(e) => setEditingProposal({ ...editingProposal, title: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <input
                    type="text"
                    value={editingProposal.category || ''}
                    onChange={(e) => setEditingProposal({ ...editingProposal, category: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Description</label>
                  <textarea
                    rows={3}
                    value={editingProposal.description || ''}
                    onChange={(e) => setEditingProposal({ ...editingProposal, description: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingProposal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPLACE DOCUMENT MODAL */}
      <AnimatePresence>
        {replacingProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => setReplacingProposal(null)}
                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleReplaceDocument} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Replace Proposal Document</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload a new version for <span className="font-bold text-white">"{replacingProposal.title}"</span>. The existing document will stay available until replacement is confirmed.
                  </p>
                </div>

                <div className="p-3 rounded-xl border bg-slate-950/60 border-slate-800 text-xs space-y-1 font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Current Document:</span>
                    <span className="text-white truncate max-w-[200px]">{replacingProposal.original_filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Size:</span>
                    <span>{formatFileSize(replacingProposal.file_size)}</span>
                  </div>
                </div>

                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setReplacementFile(f);
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 cursor-pointer text-center bg-slate-950/60"
                >
                  {replacementFile ? (
                    <div className="space-y-1">
                      <FileCheck className="w-7 h-7 text-cyan-400 mx-auto" />
                      <p className="text-xs font-bold text-white truncate max-w-sm">{replacementFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(replacementFile.size)} • Ready to swap</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-200">Select replacement document</p>
                      <p className="text-[10px] text-slate-500">PDF, DOCX, DOC up to 25MB</p>
                    </div>
                  )}
                </div>

                {replacementError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{replacementError}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReplacingProposal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replacementFile || actionLoading}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md disabled:opacity-40 cursor-pointer"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Replacement</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deletingProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 text-white shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Delete Proposal Record</h3>
                  <p className="text-[10px] text-slate-400">This operation cannot be undone</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete proposal:
                <br />
                <span className="font-bold text-white block mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  "{deletingProposal.title}"
                </span>
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeletingProposal(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProposal}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proposal Reader Modal for Admin Preview */}
      {readingProposal && (
        <ProposalDocumentReader
          proposal={readingProposal}
          isOpen={!!readingProposal}
          onClose={() => setReadingProposal(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
};
