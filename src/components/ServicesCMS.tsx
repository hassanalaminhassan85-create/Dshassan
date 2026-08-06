import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Plus, Edit3, Trash2, Sparkles, Filter, Check, Briefcase, 
  FileSpreadsheet, Landmark, Heart, QrCode, GraduationCap, ShieldAlert,
  Search, Eye, ExternalLink, ArrowRight, Loader2, Image as ImageIcon, Save, X
} from 'lucide-react';
import { 
  apiGetServices, apiSaveService, apiUpdateService, apiDeleteService 
} from '../lib/api';

interface ServicesCMSProps {
  onRefresh?: () => Promise<void>;
}

export const CATEGORY_META: Record<string, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  marketing: { label: 'Digital Marketing', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-100 dark:border-orange-900/30', desc: 'Social ads, strategy campaigns, and copy content management.' },
  web: { label: 'Web Development', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-100 dark:border-blue-900/30', desc: 'Corporate websites, landing pages, and web engines.' },
  software: { label: 'Software Development', icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/30', desc: 'Custom enterprise softwares, mobile apps, and parallel APIs.' },
  ai: { label: 'AI Solutions', icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-100 dark:border-indigo-900/30', desc: 'Generative models, custom cognitive pipelines, and automation.' },
  business: { label: 'Business Services', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-900/30', desc: 'Business plan frameworks, investment pitches, and consultation.' },
  branding: { label: 'Branding & Graphics', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-100 dark:border-rose-900/30', desc: 'Logos, physical flyers, and visual branding identities.' },
  ict: { label: 'ICT Solutions', icon: QrCode, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', border: 'border-cyan-100 dark:border-cyan-900/30', desc: 'Network setups, hardware sourcing, and workstation configurations.' },
  training: { label: 'Training Academy', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-100 dark:border-purple-900/30', desc: 'Full engineering masterclasses, digital advertising, and mentorship.' },
  compliance: { label: 'Legal Compliance', icon: ShieldAlert, color: 'text-slate-500', bg: 'bg-white dark:bg-slate-950/20', border: 'border-slate-100 dark:border-slate-900/30', desc: 'CAC incorporation files, annual returns, and tax registrations.' }
};

export const ServicesCMS: React.FC<ServicesCMSProps> = ({ onRefresh }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [activeService, setActiveService] = useState<any | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    price: '₦150,000',
    category: 'marketing',
    description: '',
    image: '',
    url: '',
    order: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await apiGetServices();
      setServices(data || []);
    } catch (e) {
      console.error("Failed to load services:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (svc: any) => {
    setActiveService(svc);
    setFormState({
      name: svc.name || '',
      price: svc.price || '₦150,000',
      category: svc.category || 'marketing',
      description: svc.description || '',
      image: svc.image || '',
      url: svc.url || '',
      order: svc.order || 0
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setActiveService(null);
    const maxOrder = services.reduce((max, s) => Math.max(max, s.order || 0), -1);
    setFormState({
      name: '',
      price: '₦150,000',
      category: filterCat !== 'all' ? filterCat : 'marketing',
      description: '',
      image: '',
      url: '',
      order: maxOrder + 1
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formState,
        id: activeService?.id || `svc_${Math.random().toString(36).substring(2, 8)}`
      };

      if (activeService) {
        await apiUpdateService(activeService.id, payload);
      } else {
        await apiSaveService(payload);
      }
      
      await loadServices();
      if (onRefresh) await onRefresh();
      setIsEditing(false);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this service node?")) return;
    try {
      await apiDeleteService(id);
      await loadServices();
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const filteredServices = services
    .filter(s => {
      const matchesCat = filterCat === 'all' || s.category === filterCat;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 animate-fade-in text-left pb-12">
      {/* Module Header - Compacted & Modernized */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 blur-[60px] -mr-24 -mt-24" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
            <Layers className="text-orange-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Services Directory</h2>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest mt-0.5">
              Service Ecosystem Node Manager
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Total Active Nodes</span>
            <span className="text-lg font-black text-white leading-none">{services.length}</span>
          </div>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Node</span>
          </button>
        </div>
      </div>

      {/* Modern Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full md:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button 
              onClick={() => setFilterCat('all')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                filterCat === 'all' 
                ? 'bg-[#000E32] text-white' 
                : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {Object.entries(CATEGORY_META).map(([id, meta]) => (
              <button
                key={id}
                onClick={() => setFilterCat(id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                  filterCat === id 
                  ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' 
                  : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <meta.icon size={10} />
                {meta.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: List or Editor */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Editor Form */}
            <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#000E32]">
                      {activeService ? 'Edit Node' : 'Initialize Node'}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Configuration Engine</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Title</label>
                    <input 
                      type="text" 
                      required
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      placeholder="e.g. Enterprise Cloud Deployment"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Price Tier</label>
                    <input 
                      type="text" 
                      required
                      value={formState.price}
                      onChange={e => setFormState({...formState, price: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      placeholder="₦150,000+"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                    <select 
                      value={formState.category}
                      onChange={e => setFormState({...formState, category: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {Object.entries(CATEGORY_META).map(([id, meta]) => (
                        <option key={id} value={id}>{meta.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Order (Live Position)</label>
                    <input 
                      type="number" 
                      required
                      value={formState.order}
                      onChange={e => setFormState({...formState, order: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Deliverables Brief</label>
                  <textarea 
                    rows={3}
                    required
                    value={formState.description}
                    onChange={e => setFormState({...formState, description: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium leading-relaxed focus:outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"
                    placeholder="Describe the technical scope..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Cover Asset URL</label>
                    <input 
                      type="text" 
                      value={formState.image}
                      onChange={e => setFormState({...formState, image: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Action Link</label>
                    <input 
                      type="text" 
                      value={formState.url}
                      onChange={e => setFormState({...formState, url: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      placeholder="https://wa.me/..."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="hidden sm:flex items-center gap-2 text-[8px] text-slate-400 font-black uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Cloud Sync
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 sm:flex-none px-6 py-2.5 text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 sm:flex-none px-8 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      {activeService ? 'Update' : 'Launch'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Live Preview Pane */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Eye size={12} className="text-orange-500" />
                    Live Preview
                  </h3>
                  <span className="text-[8px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Active Rendering</span>
                </div>
                
                {/* The actual service card preview */}
                <div className="flex items-center justify-center py-4">
                  <motion.div
                    layout
                    className="w-full max-w-[280px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl"
                  >
                    <div className="h-40 relative bg-slate-900 overflow-hidden">
                      {formState.image ? (
                        <img 
                          src={formState.image} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-700">
                          <ImageIcon size={28} strokeWidth={1} />
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Empty Asset</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 bg-slate-900 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-lg border border-white/10">
                        {formState.price || '₦0'}
                      </div>
                      <div className="absolute top-3 left-3 flex gap-1.5 items-center bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-sm">
                        {(() => {
                          const meta = CATEGORY_META[formState.category] || CATEGORY_META.marketing;
                          return (
                            <>
                              <meta.icon size={10} className={meta.color} />
                              <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">
                                {meta.label}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="p-5 space-y-3 text-left">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-tight">
                          {formState.name || 'Service Title Placeholder'}
                        </h4>
                        <p className="text-[9px] text-slate-500 leading-relaxed font-medium line-clamp-3">
                          {formState.description || 'Deliverables brief rendering...'}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[8px] font-black uppercase text-orange-600 tracking-widest">
                        <span>Initiate Node</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="p-3.5 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 text-left">
                  <div className="p-1.5 bg-orange-600 text-white rounded-lg shrink-0 h-max">
                    <Sparkles size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[9px] font-black text-orange-900 uppercase tracking-widest">UI Tip</h4>
                    <p className="text-[8px] text-orange-700 font-medium leading-relaxed">
                      Service nodes with images convert 40% faster in the digital ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="text-orange-500 animate-spin" size={32} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Ecosystem...</span>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="col-span-full py-16 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Layers size={24} strokeWidth={1} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 uppercase">No Nodes Found</h3>
                  <p className="text-[10px] text-slate-400 font-medium max-w-[200px] mx-auto">
                    Initialize a new node to expand your service ecosystem.
                  </p>
                </div>
                <button 
                  onClick={handleAddNew}
                  className="mt-2 px-5 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all"
                >
                  Create Node
                </button>
              </div>
            ) : (
              filteredServices.map(svc => {
                const meta = CATEGORY_META[svc.category] || CATEGORY_META.marketing;
                return (
                  <motion.div
                    layout
                    key={svc.id}
                    whileHover={{ y: -4 }}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all relative"
                  >
                    <div className="h-32 relative bg-slate-900 overflow-hidden">
                      <img 
                        src={svc.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60"} 
                        alt={svc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[8px] font-black text-white border border-white/10 font-mono">
                        {svc.price}
                      </div>
                      <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                        <meta.icon size={10} className="text-white" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest font-mono">
                          {meta.label.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2 text-left">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight leading-tight line-clamp-1">
                        {svc.name}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-medium leading-relaxed line-clamp-2 h-[26px]">
                        {svc.description}
                      </p>
                      <div className="pt-3 flex items-center justify-between border-t border-slate-50 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">Pos: {svc.order || 0}</span>
                          <span className="text-[7px] font-mono font-bold text-slate-300 uppercase tracking-tighter">ID: {svc.id.split('_')[1]}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleEdit(svc)}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDelete(svc.id)}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
