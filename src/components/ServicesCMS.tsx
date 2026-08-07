import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Plus, Edit3, Trash2, Sparkles, Filter, Check, Briefcase, 
  FileSpreadsheet, Landmark, Heart, QrCode, GraduationCap, ShieldAlert,
  Search, Eye, ExternalLink, ArrowRight, Loader2, Image as ImageIcon, Save, X,
  Upload, Copy, ArrowUp, ArrowDown, RefreshCw, CheckCircle2
} from 'lucide-react';
import { 
  apiGetServices, apiSaveService, apiUpdateService, apiDeleteService,
  apiInitializeServices, apiUploadGeneralFile, resolveImageUrl, apiSubscribeToServices 
} from '../lib/api';
import { SERVICES, ServiceItem } from '../lib/data';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
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
    setLoading(true);
    const unsubscribe = apiSubscribeToServices((data) => {
      setServices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await apiGetServices();
      if (data && data.length > 0) {
        setServices(data);
        localStorage.setItem('admin_services', JSON.stringify(data));
      } else {
        const saved = localStorage.getItem('admin_services');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
              setServices(parsed);
              apiInitializeServices(parsed).catch(() => {});
              return;
            }
          } catch (e) {}
        }
        // Fallback to default 26 services dataset
        setServices(SERVICES);
        localStorage.setItem('admin_services', JSON.stringify(SERVICES));
        apiInitializeServices(SERVICES).catch(() => {});
      }
    } catch (e) {
      console.error("Failed to load services, checking localStorage:", e);
      const saved = localStorage.getItem('admin_services');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) setServices(parsed);
          else setServices(SERVICES);
        } catch (err) { setServices(SERVICES); }
      } else {
        setServices(SERVICES);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm("Restore the complete 26 Default Services catalog into the database? This will refresh your services directory.")) return;
    try {
      setLoading(true);
      await apiInitializeServices(SERVICES);
      setServices(SERVICES);
      localStorage.setItem('admin_services', JSON.stringify(SERVICES));
      if (onRefresh) await onRefresh();
      showToast("Successfully restored all 26 Services!");
    } catch (e) {
      console.error("Failed to seed services:", e);
      // Even if server init fails, update local state
      setServices(SERVICES);
      localStorage.setItem('admin_services', JSON.stringify(SERVICES));
      showToast("Restored 26 services locally!");
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
      order: svc.order !== undefined ? svc.order : (svc.display_order || 0)
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setActiveService(null);
    const maxOrder = services.reduce((max, s) => Math.max(max, s.order || s.display_order || 0), -1);
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

  const handleDuplicate = async (svc: any) => {
    const newService = {
      ...svc,
      id: `svc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${svc.name} (Copy)`,
      order: (svc.order || 0) + 1
    };
    try {
      await apiSaveService(newService);
      await loadServices();
      if (onRefresh) await onRefresh();
      showToast("Service duplicated successfully!");
    } catch (e) {
      const updated = [...services, newService];
      setServices(updated);
      localStorage.setItem('admin_services', JSON.stringify(updated));
      showToast("Duplicated service locally!");
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      // Attempt server upload
      try {
        const res = await apiUploadGeneralFile(file);
        if (res && res.url) {
          setFormState(prev => ({ ...prev, image: res.url }));
          showToast("Image uploaded successfully!");
          return;
        }
      } catch (err) {
        console.warn("Server upload failed, converting to DataURL:", err);
      }

      // FileReader base64 fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormState(prev => ({ ...prev, image: reader.result as string }));
          showToast("Image attached!");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Could not attach image. Please check file format.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formState,
        id: activeService?.id || `svc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      };

      if (activeService) {
        await apiUpdateService(activeService.id, payload);
      } else {
        await apiSaveService(payload);
      }
      
      // Update local storage for immediate offline / preview consistency
      const existingIdx = services.findIndex(s => s.id === payload.id);
      let newServicesList = [...services];
      if (existingIdx >= 0) {
        newServicesList[existingIdx] = payload;
      } else {
        newServicesList.push(payload);
      }
      setServices(newServicesList);
      localStorage.setItem('admin_services', JSON.stringify(newServicesList));

      await loadServices();
      if (onRefresh) await onRefresh();
      setIsEditing(false);
      showToast(activeService ? "Service updated!" : "New service node launched!");
    } catch (e) {
      console.error("Save failed:", e);
      // Fallback local update
      const payload = {
        ...formState,
        id: activeService?.id || `svc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      };
      const existingIdx = services.findIndex(s => s.id === payload.id);
      let newServicesList = [...services];
      if (existingIdx >= 0) {
        newServicesList[existingIdx] = payload;
      } else {
        newServicesList.push(payload);
      }
      setServices(newServicesList);
      localStorage.setItem('admin_services', JSON.stringify(newServicesList));
      setIsEditing(false);
      showToast("Service saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this service node from the catalogue?")) return;
    try {
      await apiDeleteService(id);
      const remaining = services.filter(s => s.id !== id);
      setServices(remaining);
      localStorage.setItem('admin_services', JSON.stringify(remaining));
      if (onRefresh) await onRefresh();
      showToast("Service node deleted!");
    } catch (e) {
      console.error("Delete failed:", e);
      const remaining = services.filter(s => s.id !== id);
      setServices(remaining);
      localStorage.setItem('admin_services', JSON.stringify(remaining));
      showToast("Deleted locally!");
    }
  };

  const filteredServices = services
    .filter(s => {
      const matchesCat = filterCat === 'all' || s.category === filterCat;
      const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => (a.order || a.display_order || 0) - (b.order || b.display_order || 0));

  return (
    <div className="space-y-6 text-left pb-12 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 text-xs font-black uppercase tracking-wider"
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module Header - Compacted & Modernized */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 blur-[60px] -mr-24 -mt-24 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <Layers className="text-orange-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase font-serif">Services Catalogue Manager</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Live Ecosystem • 26 Core Service Nodes Configured
            </p>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap gap-2.5 relative z-10">
          <div className="hidden sm:flex flex-col items-end mr-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Services</span>
            <span className="text-2xl font-black text-orange-400 leading-none font-mono">{services.length}</span>
          </div>

          <button
            onClick={handleSeedDefaults}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 active:scale-95 flex items-center gap-2"
            title="Restore full 26 service catalog"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Restore 26 Defaults</span>
          </button>

          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Modern Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full md:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by service name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
            <button 
              onClick={() => setFilterCat('all')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filterCat === 'all' 
                ? 'bg-slate-900 dark:bg-orange-500 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All (26)
            </button>
            {Object.entries(CATEGORY_META).map(([id, meta]) => {
              const countInCat = services.filter(s => s.category === id).length;
              return (
                <button
                  key={id}
                  onClick={() => setFilterCat(id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    filterCat === id 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <meta.icon size={11} />
                  <span>{meta.label.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-75 font-mono">({countInCat})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area: List or Editor */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Editor Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase font-serif">
                      {activeService ? 'Edit Service Node' : 'Create New Service'}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                      {activeService ? `Node ID: ${activeService.id}` : 'Drafting New Ecosystem Service'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                      Service Title *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="e.g. Sponsored Ads Campaign Management"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                      Price Range / Tier *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formState.price}
                      onChange={e => setFormState({...formState, price: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="₦50,000 – ₦1,000,000+"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                      Category *
                    </label>
                    <select 
                      value={formState.category}
                      onChange={e => setFormState({...formState, category: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                      {Object.entries(CATEGORY_META).map(([id, meta]) => (
                        <option key={id} value={id}>{meta.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                      Display Position Index
                    </label>
                    <input 
                      type="number" 
                      required
                      value={formState.order}
                      onChange={e => setFormState({...formState, order: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                    Deliverables Brief & Scope *
                  </label>
                  <textarea 
                    rows={4}
                    required
                    value={formState.description}
                    onChange={e => setFormState({...formState, description: e.target.value})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-orange-500 transition-all resize-none"
                    placeholder="Describe the technical scope and client deliverables..."
                  />
                </div>

                {/* File Upload / Image Picker */}
                <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Cover Photo / Image Asset</span>
                    <span className="text-[9px] text-orange-500 font-bold">Upload file or enter URL</span>
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <label className="w-full sm:w-auto px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all shrink-0">
                      {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      <span>{uploadingImage ? 'Processing File...' : 'Choose Image File'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileUpload}
                        className="hidden" 
                      />
                    </label>

                    <input 
                      type="text" 
                      value={formState.image}
                      onChange={e => setFormState({...formState, image: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="https://images.unsplash.com/... or data:image/..."
                    />
                  </div>

                  {formState.image && (
                    <div className="relative mt-2 h-28 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
                      <img 
                        src={resolveImageUrl(formState.image)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        Asset Ready
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                    WhatsApp / Direct Action Link
                  </label>
                  <input 
                    type="text" 
                    value={formState.url}
                    onChange={e => setFormState({...formState, url: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="https://wa.me/p/... or https://dstech.ng/services/..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="hidden sm:flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-Sync Enabled
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 sm:flex-none px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-black uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 sm:flex-none px-8 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      <span>{activeService ? 'Update Node' : 'Publish Node'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Live Preview Pane */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Eye size={14} className="text-orange-500" />
                    Live Card Render
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Active Output</span>
                </div>
                
                {/* Real-time Service Card Preview */}
                <div className="flex items-center justify-center py-4">
                  <motion.div
                    layout
                    className="w-full max-w-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl"
                  >
                    <div className="h-44 relative bg-slate-950 overflow-hidden">
                      {formState.image ? (
                        <img 
                          src={resolveImageUrl(formState.image)} 
                          alt="Preview"
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                          <ImageIcon size={32} strokeWidth={1.5} />
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Cover Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-3 right-3 bg-slate-900/90 text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                        {formState.price || '₦0'}
                      </div>
                      <div className="absolute top-3 left-3 flex gap-1.5 items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                        {(() => {
                          const meta = CATEGORY_META[formState.category] || CATEGORY_META.marketing;
                          return (
                            <>
                              <meta.icon size={11} className={meta.color} />
                              <span className="text-[9px] font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                {meta.label}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="p-5 space-y-3 text-left">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                          {formState.name || 'Service Title Placeholder'}
                        </h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                          {formState.description || 'Service deliverables description preview will render here in real time...'}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-widest">
                        <span>Book Service Node</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {loading ? (
              <div className="col-span-full py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="text-orange-500 animate-spin" size={36} />
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Querying 26 Service Nodes...</span>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="col-span-full py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                  <Layers size={28} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase font-serif">No Services Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                    No service matched filter "{filterCat}". Restore the 26 default services or add a custom service node.
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={handleSeedDefaults}
                    className="px-5 py-2.5 bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>Restore 26 Defaults</span>
                  </button>
                  <button 
                    onClick={handleAddNew}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    Add Service
                  </button>
                </div>
              </div>
            ) : (
              filteredServices.map((svc, idx) => {
                const meta = CATEGORY_META[svc.category] || CATEGORY_META.marketing;
                return (
                  <motion.div
                    layout
                    key={svc.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header Image */}
                      <div className="h-40 relative bg-slate-950 overflow-hidden">
                        <img 
                          src={resolveImageUrl(svc.image)} 
                          alt={svc.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-85"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        
                        <div className="absolute top-3 right-3 bg-slate-900/90 text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                          {svc.price}
                        </div>

                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                          <meta.icon size={11} className={meta.color} />
                          <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            {meta.label.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-2.5 text-left">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug line-clamp-2 min-h-[32px]">
                          {svc.name}
                        </h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-3 min-h-[42px]">
                          {svc.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Controls */}
                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">Pos #{svc.order !== undefined ? svc.order : idx + 1}</span>
                          <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">{svc.id}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleDuplicate(svc)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-all"
                            title="Duplicate Node"
                          >
                            <Copy size={13} />
                          </button>
                          <button 
                            onClick={() => handleEdit(svc)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all"
                            title="Edit Node"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDelete(svc.id)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                            title="Delete Node"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

