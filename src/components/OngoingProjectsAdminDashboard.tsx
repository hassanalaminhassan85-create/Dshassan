import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Check, X, Eye, RefreshCw, Calendar, Loader2, Plus, 
  Settings, EyeOff, Folder, Trash2, Edit, CheckCircle2, Sliders, 
  Layers, Hammer, LayoutGrid, CheckCircle, Clock, AlertTriangle, Info
} from 'lucide-react';
import { 
  apiGetOngoingProjects, 
  apiSaveOngoingProject, 
  apiDeleteOngoingProject, 
  apiToggleOngoingProjectPublish, 
  apiUpdateOngoingProjectProgress,
  apiUploadOngoingProjectFile,
  OngoingProject 
} from '../lib/api';

const CATEGORIES = [
  'Cyber Security',
  'Enterprise Cloud',
  'Government Tech',
  'AI & Automation',
  'Web3 & Ledger',
  'Other Projects'
];

const STATUSES = [
  'Planning',
  'UI/UX Design',
  'Frontend Development',
  'Backend Development',
  'Testing',
  'Deployment',
  'Completed'
];

export const OngoingProjectsAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [projects, setProjects] = useState<OngoingProject[]>([]);
  const [editingProject, setEditingProject] = useState<Partial<OngoingProject> | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Slug auto-generation state
  const [autoGenSlug, setAutoGenSlug] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiGetOngoingProjects(true); // admin = true, gets unpublished
      setProjects(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching admin ongoing projects:', err);
      setError('Could not connect to Cloudflare D1. Running in local fallback.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, isError: boolean = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Invalid file type. Please upload a standard web image (JPG, PNG, GIF, WebP).', true);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      showNotification('File size exceeds the 10MB limit.', true);
      return;
    }

    setSelectedFile(file);
    showNotification(`Selected file: ${file.name}`);
  };

  const handleUploadAndSave = async () => {
    if (!editingProject) return;
    
    let imageKey = editingProject.cover_image_key || '';

    if (selectedFile) {
      try {
        setUploading(true);
        showNotification('Uploading image asset to secure Cloudflare R2 bucket...');
        const uploadRes = await apiUploadOngoingProjectFile(selectedFile);
        if (uploadRes.success) {
          imageKey = uploadRes.r2_object_key;
          showNotification('R2 Asset secure. Preparing database state update...');
        }
      } catch (err: any) {
        console.error('R2 Upload error:', err);
        showNotification('Cloudflare R2 R/W binding failed. Storing image path locally as fallback.', true);
        imageKey = `seeds/${Date.now()}_${selectedFile.name}`;
      } finally {
        setUploading(false);
        setSelectedFile(null);
      }
    }

    try {
      const finalRecord: Partial<OngoingProject> = {
        ...editingProject,
        cover_image_key: imageKey,
        slug: editingProject.slug || editingProject.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled'
      };

      const saved = await apiSaveOngoingProject(finalRecord);
      showNotification(`Successfully saved project: ${saved.title}`);
      
      // Update local state list
      setProjects(prev => {
        const exists = prev.some(p => p.id === saved.id);
        if (exists) {
          return prev.map(p => p.id === saved.id ? saved : p);
        } else {
          return [saved, ...prev];
        }
      });
      setEditingProject(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save ongoing project.', true);
    }
  };

  const startNewProject = () => {
    setEditingProject({
      title: '',
      slug: '',
      category: CATEGORIES[0],
      short_description: '',
      full_description: '',
      status: STATUSES[0],
      progress_percentage: 0,
      technologies: '',
      estimated_completion: '',
      is_featured: 0,
      is_published: 1,
      display_order: projects.length + 1
    });
    setAutoGenSlug(true);
    setSelectedFile(null);
  };

  const startEditProject = (p: OngoingProject) => {
    setEditingProject(p);
    setAutoGenSlug(false);
    setSelectedFile(null);
  };

  const handleTitleChange = (val: string) => {
    if (!editingProject) return;
    const slugVal = autoGenSlug 
      ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
      : editingProject.slug || '';
    
    setEditingProject(prev => ({
      ...prev,
      title: val,
      slug: slugVal
    }));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This action is irreversible.`)) return;

    try {
      await apiDeleteOngoingProject(id);
      showNotification(`Deleted "${name}" successfully.`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete project.', true);
    }
  };

  const handleTogglePublish = async (id: string, currentPublished: number) => {
    try {
      const nextVal = currentPublished === 1 ? 0 : 1;
      await apiToggleOngoingProjectPublish(id, nextVal === 1);
      
      setProjects(prev => prev.map(p => p.id === id ? { ...p, is_published: nextVal } : p));
      showNotification(`Publish status updated.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to toggle publish status.', true);
    }
  };

  const handleProgressSliderChange = async (id: string, nextProgress: number) => {
    // Optimistic state update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, progress_percentage: nextProgress } : p));
    
    try {
      await apiUpdateOngoingProjectProgress(id, nextProgress);
    } catch (err: any) {
      console.error('Failed to save slider update to D1:', err);
    }
  };

  // Filter & Search logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.technologies && p.technologies.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800';
      case 'UI/UX Design': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50';
      case 'Frontend Development': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50';
      case 'Backend Development': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50';
      case 'Testing': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50';
      case 'Deployment': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-rose-50 border border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-xs sm:text-sm rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-xs sm:text-sm rounded-xl flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      {!editingProject ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search projects, stack, slugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 font-medium"
                />
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin-slow" />
                </span>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-slate-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-slate-500"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
              </select>
            </div>

            <button
              onClick={startNewProject}
              className="w-full md:w-auto px-4 py-2 text-xs sm:text-sm bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Launch New Project</span>
            </button>
          </div>

          {/* Grid Layout of Ongoing Projects */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              <p className="text-xs text-slate-400 font-medium font-mono animate-pulse">Syncing system state from D1 storage...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              <Folder className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No projects found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Adjust your filters or create a new project to start demonstrating ongoing engineering operations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => {
                const coverUrl = p.cover_image_key 
                  ? (p.cover_image_key.startsWith('seeds/') ? `/api/ongoing-projects/file?key=${encodeURIComponent(p.cover_image_key)}` : `/api/ongoing-projects/file?key=${encodeURIComponent(p.cover_image_key)}`)
                  : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80';

                return (
                  <motion.div
                    key={p.id}
                    layout
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group"
                  >
                    {/* Cover Photo */}
                    <div className="relative h-44 w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
                      <img 
                        src={coverUrl} 
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Unsplash fallback
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      
                      {/* Floating badging */}
                      <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-lg shadow-sm ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>

                      <button
                        onClick={() => handleTogglePublish(p.id, p.is_published)}
                        className={`absolute top-3 right-3 p-1.5 rounded-lg border shadow-sm transition-all ${
                          p.is_published === 1 
                            ? 'bg-emerald-500/90 text-white border-emerald-400' 
                            : 'bg-slate-800/90 text-slate-300 border-slate-700'
                        }`}
                        title={p.is_published === 1 ? "Click to Unpublish" : "Click to Publish"}
                      >
                        {p.is_published === 1 ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{p.category}</span>
                        <h3 className="font-bold text-sm line-clamp-1">{p.title}</h3>
                      </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                          {p.short_description}
                        </p>
                        
                        {p.technologies && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {p.technologies.split(',').map((tech, idx) => (
                              <span key={idx} className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Interactive Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Sliders className="h-3 w-3" />
                            <span>Sprint Completion</span>
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono">{p.progress_percentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={p.progress_percentage}
                          onChange={(e) => handleProgressSliderChange(p.id, Number(e.target.value))}
                          className="w-full accent-slate-900 dark:accent-slate-100 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 font-mono">
                        {p.estimated_completion && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>ETA: {p.estimated_completion}</span>
                          </span>
                        )}
                        {p.is_featured === 1 && (
                          <span className="text-amber-500 bg-amber-500/10 px-1 rounded uppercase tracking-wider">Featured</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditProject(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit metadata"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Form Creator / Editor */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {editingProject.id ? `Modify: ${editingProject.title}` : 'Launch New Ongoing Project'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">Define metadata, upload cover photos, and set delivery metrics.</p>
            </div>
            <button
              onClick={() => setEditingProject(null)}
              className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side form fields */}
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Nimc Biometric Bridge v2"
                  value={editingProject.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">URL Slug / Identifier</label>
                  <label className="flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-slate-400">
                    <input
                      type="checkbox"
                      checked={autoGenSlug}
                      onChange={(e) => setAutoGenSlug(e.target.checked)}
                      className="accent-slate-900 rounded"
                    />
                    <span>Auto-generate</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. nimc-biometric-bridge-v2"
                  value={editingProject.slug || ''}
                  disabled={autoGenSlug}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-800 dark:disabled:bg-slate-950 font-mono"
                />
              </div>

              {/* Grid 2 column */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                  <select
                    value={editingProject.category || CATEGORIES[0]}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project Status</label>
                  <select
                    value={editingProject.status || STATUSES[0]}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800"
                  >
                    {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Technologies (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, SQLite, WebAuthn, Tailwind"
                  value={editingProject.technologies || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, technologies: e.target.value }))}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Estimated Completion */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Completion</label>
                  <input
                    type="date"
                    value={editingProject.estimated_completion || ''}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, estimated_completion: e.target.value }))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProject.display_order || 0}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Sprint Completion Metric</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{editingProject.progress_percentage || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingProject.progress_percentage || 0}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, progress_percentage: Number(e.target.value) }))}
                  className="w-full accent-slate-900 dark:accent-slate-100 cursor-pointer h-1.5"
                />
              </div>

              {/* Featured & Published */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={editingProject.is_featured === 1}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, is_featured: e.target.checked ? 1 : 0 }))}
                    className="accent-slate-900 rounded scale-110"
                  />
                  <span>Feature on homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={editingProject.is_published === 1}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, is_published: e.target.checked ? 1 : 0 }))}
                    className="accent-slate-900 rounded scale-110"
                  />
                  <span>Publish and show publicly</span>
                </label>
              </div>
            </div>

            {/* Right side Rich Description & Image Uploader */}
            <div className="space-y-4">
              {/* Short Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Short Card Summary</label>
                <textarea
                  rows={2}
                  placeholder="Enter a brief 1-2 sentence hook for the preview card..."
                  value={editingProject.short_description || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, short_description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 dark:bg-slate-800 resize-none"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Project Specifications</label>
                <textarea
                  rows={4}
                  placeholder="Describe the full engineering scope, milestones, client details, challenges overcome, and system architecture..."
                  value={editingProject.full_description || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, full_description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 dark:bg-slate-800"
                />
              </div>

              {/* Cover Image Uploader */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>Cover Image Asset</span>
                  <Info className="h-3 w-3 text-slate-400" title="Upload directly to Cloudflare R2" />
                </label>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    dragActive 
                      ? 'border-slate-600 bg-slate-50 dark:bg-slate-850' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  {editingProject.cover_image_key && !selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <img 
                        src={`/api/ongoing-projects/file?key=${encodeURIComponent(editingProject.cover_image_key)}`}
                        alt="Current Cover"
                        className="h-20 w-32 object-cover rounded-lg border border-slate-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="text-[10px] text-slate-500 font-medium max-w-xs truncate font-mono">{editingProject.cover_image_key}</span>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-xs">{selectedFile.name}</span>
                      <span className="text-[10px] text-slate-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB) - Ready to save</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Drag & drop or click to upload cover image</span>
                      <span className="text-[10px] text-slate-400">Only standard images (JPG, PNG, WebP) up to 10MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              onClick={() => setEditingProject(null)}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadAndSave}
              disabled={uploading || !editingProject.title}
              className="px-5 py-2 text-xs sm:text-sm bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading Asset...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save State changes</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
