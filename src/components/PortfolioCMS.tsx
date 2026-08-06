import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderOpen, Plus, Edit3, Trash2, Sparkles, Filter, Check, 
  Search, Eye, Loader2, Image as ImageIcon, Save, X, 
  Target, ShieldCheck, Video, ExternalLink, Calendar,
  Globe, User, Layout, Briefcase, ChevronRight, BarChart3
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  apiGetPortfolio, apiSavePortfolio, apiUpdatePortfolio, apiDeletePortfolio 
} from '../lib/api';
import { AnimatedHomeSectionImagePreview } from './AnimatedHomeSectionImagePreview';

export const PortfolioCMS: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    category: 'Software Development',
    client: '',
    date: '',
    stats: '',
    description: '',
    image: '',
    video: '',
    tags: [] as string[],
    content: '',
    client_logo: '',
    testimonial_text: '',
    testimonial_author: '',
    live_website_url: '',
    display_client_name: true,
    display_client_logo: true,
    display_testimonial: true,
    display_live_website: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const categories = ['Digital Marketing', 'Software Development', 'Compliance Services', 'AI Solutions'];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiGetPortfolio();
      setProjects(data || []);
    } catch (e) {
      console.error("Failed to load portfolio:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (proj: any) => {
    setActiveProject(proj);
    setFormState({
      title: proj.title || '',
      category: proj.category || 'Software Development',
      client: proj.client || '',
      date: proj.date || '',
      stats: proj.stats || '',
      description: proj.description || '',
      image: proj.image || '',
      video: proj.video || '',
      tags: Array.isArray(proj.tags) ? proj.tags : [],
      content: proj.content || '',
      client_logo: proj.client_logo || '',
      testimonial_text: proj.testimonial_text || '',
      testimonial_author: proj.testimonial_author || '',
      live_website_url: proj.live_website_url || '',
      display_client_name: proj.display_client_name ?? true,
      display_client_logo: proj.display_client_logo ?? true,
      display_testimonial: proj.display_testimonial ?? true,
      display_live_website: proj.display_live_website ?? true
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setActiveProject(null);
    setFormState({
      title: '',
      category: 'Software Development',
      client: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      stats: '',
      description: '',
      image: '',
      video: '',
      tags: [],
      content: '',
      client_logo: '',
      testimonial_text: '',
      testimonial_author: '',
      live_website_url: '',
      display_client_name: true,
      display_client_logo: true,
      display_testimonial: true,
      display_live_website: true
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formState,
        id: activeProject?.id || `proj_${Math.random().toString(36).substring(2, 8)}`
      };

      if (activeProject) {
        await apiUpdatePortfolio(activeProject.id, payload);
      } else {
        await apiSavePortfolio(payload);
      }
      
      await loadProjects();
      setIsEditing(false);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently archive this case study node?")) return;
    try {
      await apiDeletePortfolio(id);
      await loadProjects();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formState.tags.includes(tagInput.trim())) {
      setFormState({ ...formState, tags: [...formState.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormState({ ...formState, tags: formState.tags.filter(t => t !== tag) });
  };

  const filteredProjects = projects.filter(p => {
    const matchesCat = filterCat === 'All' || p.category === filterCat;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] -mr-40 -mt-40" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
            <FolderOpen className="text-orange-400" size={32} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-white uppercase font-serif tracking-tight">Ecosystem Portfolio</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Case Study Deployment & Performance Verification Center
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="relative z-10 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>Launch Case Study</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <button 
            onClick={() => setFilterCat('All')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filterCat === 'All' ? 'bg-[#000E32] text-white' : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            All Work
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                filterCat === cat ? 'bg-[#000E32] text-white' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Search deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3.5 pl-12 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-orange-500 transition-all"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Case Study Architect */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Layout size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-black text-[#000E32] uppercase font-serif">Deployment Architect</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Case Study Node / {activeProject?.id || 'new_init'}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Project Name</label>
                      <input 
                        type="text" required
                        value={formState.title}
                        onChange={e => setFormState({...formState, title: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. Lagos Port API Integration"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Client Ecosystem</label>
                      <input 
                        type="text" required
                        value={formState.client}
                        onChange={e => setFormState({...formState, client: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. West African Logistics"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Sector</label>
                      <select 
                        value={formState.category}
                        onChange={e => setFormState({...formState, category: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Deployment Date</label>
                      <input 
                        type="text"
                        value={formState.date}
                        onChange={e => setFormState({...formState, date: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. May 2026"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Core Performance Metric</label>
                      <input 
                        type="text"
                        value={formState.stats}
                        onChange={e => setFormState({...formState, stats: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold font-mono focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. 5.4x ROAS / 99.9% Uptime"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Executive Summary</label>
                    <textarea 
                      rows={2} required
                      value={formState.description}
                      onChange={e => setFormState({...formState, description: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium leading-relaxed focus:bg-white focus:border-orange-500 transition-all outline-none resize-none"
                      placeholder="Brief overview of the challenge and results..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Visual Asset URL</label>
                      <input 
                        type="text"
                        value={formState.image}
                        onChange={e => setFormState({...formState, image: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Video Case URL (Optional)</label>
                      <input 
                        type="text"
                        value={formState.video}
                        onChange={e => setFormState({...formState, video: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="https://www.w3schools.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Technical Specifications (Markdown)</label>
                    <textarea 
                      rows={8} required
                      value={formState.content}
                      onChange={e => setFormState({...formState, content: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed focus:bg-white focus:border-orange-500 transition-all outline-none resize-none"
                      placeholder="# Problem Statement\nDetail the tech stack and implementation hurdles here..."
                    />
                  </div>

                  <div className="pt-8 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <ShieldCheck className="text-emerald-500" size={24} />
                      <div className="text-left">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block leading-none">Security Node</span>
                        <span className="text-[10px] font-bold text-emerald-600">Enterprise Verified</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-10 py-4 bg-[#000E32] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Commit Deployment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Case Study Rendering */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-slate-50 p-1 rounded-[3rem] border border-slate-200 overflow-hidden shadow-inner flex flex-col h-full">
                <div className="bg-white p-10 rounded-[2.5rem] space-y-8 flex-1 overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Eye size={12} className="text-orange-500" />
                      Client-Facing Preview
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* Hero Preview */}
                    <div className="relative h-64 rounded-3xl overflow-hidden group shadow-2xl">
                      {formState.image ? (
                        <img src={formState.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><ImageIcon size={48} strokeWidth={1} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-6 left-6 text-left">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{formState.category}</span>
                        <h1 className="text-2xl font-black text-white uppercase font-serif tracking-tight mt-1 leading-tight">{formState.title || 'Insight Node Headline'}</h1>
                      </div>
                    </div>

                    {/* Stats Grid Preview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-left">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Growth Index</span>
                        <span className="text-lg font-black text-indigo-900 font-mono">{formState.stats || '0.0x ROAS'}</span>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-left">
                        <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest block mb-1">Deployment</span>
                        <span className="text-lg font-black text-orange-900 font-mono">{formState.date || 'Pending'}</span>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><User size={12} className="text-indigo-500" /> {formState.client || 'Client Node'}</span>
                        <span className="flex items-center gap-1.5"><Target size={12} className="text-orange-500" /> Active System</span>
                      </div>
                      <div className="prose prose-sm max-w-none prose-slate">
                        <div className="text-slate-600 leading-relaxed font-medium markdown-body">
                          <ReactMarkdown>{formState.content || 'Initialize the technical specifications to render the detailed case study narrative here...'}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#000E32] text-white rounded-b-[2.5rem]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><BarChart3 size={16} className="text-orange-400" /></div>
                      <div className="text-left">
                        <span className="text-[8px] font-black uppercase text-slate-400 block">Ecosystem Impact</span>
                        <span className="text-[10px] font-bold">Top 5% Performance</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Live Node</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="text-orange-500 animate-spin" size={40} />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Decrypting Portfolio Vault...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full py-24 bg-white border border-slate-200 rounded-[4rem] flex flex-col items-center justify-center gap-6 text-center px-10">
                <FolderOpen size={48} className="text-slate-200" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-800 uppercase font-serif">No Deployments Found</h3>
                  <p className="text-xs text-slate-400 font-medium">Your portfolio ecosystem is currently waiting for case study initialization.</p>
                </div>
                <button onClick={handleAddNew} className="px-8 py-3 bg-[#000E32] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl">Launch New Node</button>
              </div>
            ) : (
              filteredProjects.map(proj => (
                <motion.div
                  layout
                  key={proj.id}
                  whileHover={{ y: -10 }}
                  className="group bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all flex flex-col h-full"
                >
                  <div className="h-56 relative bg-slate-900 overflow-hidden shrink-0">
                    <img 
                      src={proj.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'} 
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[9px] font-black text-[#000E32] shadow-xl uppercase tracking-widest">
                      {proj.category}
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 text-left">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">{proj.stats || 'Performance High'}</span>
                      <h4 className="text-xl font-black text-white uppercase font-serif tracking-tight leading-tight mt-1 line-clamp-2">{proj.title}</h4>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        <span className="flex items-center gap-1.5"><User size={12} className="text-indigo-500" /> {proj.client}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-orange-500" /> {proj.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                        {proj.description}
                      </p>
                    </div>
                    <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                      <div className="flex gap-1">
                        {Array.isArray(proj.tags) && proj.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[8px] font-bold text-slate-300 uppercase">#{tag}</span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(proj)}
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(proj.id)}
                          className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
