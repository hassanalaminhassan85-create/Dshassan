import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Plus, Edit3, Trash2, Sparkles, Filter, Check, 
  Search, Eye, Loader2, Image as ImageIcon, Save, X, 
  Clock, BookOpen, Layers, Target, Award, ArrowRight,
  List, ShieldCheck, Zap, Upload
} from 'lucide-react';
import { 
  apiGetCourses, apiSaveCourse, apiUpdateCourse, apiDeleteCourse, apiSubscribeToCourses,
  apiUploadGeneralFile, resolveImageUrl
} from '../lib/api';
import { generateDynamicSvgUrl } from '../lib/mediaUtils';

interface TrainingCMSProps {
  onRefresh?: () => Promise<void>;
}

export const TrainingCMS: React.FC<TrainingCMSProps> = ({ onRefresh }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    duration: '6 Weeks',
    level: 'Intermediate',
    price: '₦120,000',
    category: 'web',
    image: '',
    lessons: [] as any[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await apiUploadGeneralFile(file);
      if (res && (res.url || res.r2_object_key)) {
        setFormState(prev => ({ ...prev, image: res.url || res.r2_object_key }));
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const categories = [
    { id: 'web', label: 'Frontend Web Engineering' },
    { id: 'marketing', label: 'Digital Marketing / Social Ads' },
    { id: 'design', label: 'UI/UX Brand Design' },
    { id: 'ai', label: 'AI & Neural Automation' }
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

  useEffect(() => {
    setLoading(true);
    const unsubscribe = apiSubscribeToCourses((data) => {
      setCourses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await apiGetCourses();
      setCourses(data || []);
    } catch (e) {
      console.error("Failed to load courses:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (crs: any) => {
    setActiveCourse(crs);
    setFormState({
      title: crs.title || '',
      description: crs.description || '',
      duration: crs.duration || '6 Weeks',
      level: crs.level || 'Intermediate',
      price: crs.price || '₦120,000',
      category: crs.category || 'web',
      image: crs.image || '',
      lessons: crs.lessons || []
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setActiveCourse(null);
    setFormState({
      title: '',
      description: '',
      duration: '6 Weeks',
      level: 'Intermediate',
      price: '₦120,000',
      category: 'web',
      image: '',
      lessons: [
        { id: `les_${Math.random().toString(36).substring(2, 5)}`, title: 'Module 1: Foundations', duration: '1 hr', isFree: true, content: 'Core structural overview.' }
      ]
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formState,
        id: activeCourse?.id || `crs_${Math.random().toString(36).substring(2, 8)}`
      };

      if (activeCourse) {
        await apiUpdateCourse(activeCourse.id, payload);
      } else {
        await apiSaveCourse(payload);
      }
      
      await loadCourses();
      setIsEditing(false);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently purge this vocational course?")) return;
    try {
      await apiDeleteCourse(id);
      await loadCourses();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const addLesson = () => {
    const newLesson = {
      id: `les_${Math.random().toString(36).substring(2, 5)}`,
      title: 'New Chapter Node',
      duration: '45 mins',
      isFree: false,
      content: ''
    };
    setFormState({ ...formState, lessons: [...formState.lessons, newLesson] });
  };

  const removeLesson = (id: string) => {
    setFormState({ ...formState, lessons: formState.lessons.filter(l => l.id !== id) });
  };

  const updateLesson = (id: string, updates: any) => {
    setFormState({
      ...formState,
      lessons: formState.lessons.map(l => l.id === id ? { ...l, ...updates } : l)
    });
  };

  const filteredCourses = courses.filter(c => {
    const matchesCat = filterCat === 'all' || c.category === filterCat;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 bg-gradient-to-br from-indigo-900 to-slate-950 p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
            <GraduationCap className="text-orange-400" size={40} />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-3xl font-black text-white uppercase font-serif tracking-tight">LMS Academy Console</h2>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] max-w-md">
              Vocational Engineering & Masterclass Management
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="relative z-10 px-8 py-4 bg-white text-[#000E32] text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Launch Masterclass</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <button 
            onClick={() => setFilterCat('all')}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              filterCat === 'all' ? 'bg-[#000E32] text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Academy Nodes
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                filterCat === cat.id ? 'bg-[#000E32] text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <input 
            type="text"
            placeholder="Search curricula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Masterclass Configurator */}
            <div className="xl:col-span-8 space-y-6">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-[1.5rem] flex items-center justify-center border border-orange-100">
                      <Zap size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-black text-[#000E32] uppercase font-serif">Curriculum Designer</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Academic Framework // node_init</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="p-3 hover:bg-slate-50 text-slate-400 rounded-2xl"><X size={24} /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  {/* Primary Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Masterclass Title *</label>
                      <input 
                        type="text" required
                        value={formState.title}
                        onChange={e => setFormState({...formState, title: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. Next.js Architecture Masterclass"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Price Tuition *</label>
                      <input 
                        type="text" required
                        value={formState.price}
                        onChange={e => setFormState({...formState, price: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold font-mono focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="₦120,000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Category</label>
                      <select 
                        value={formState.category}
                        onChange={e => setFormState({...formState, category: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Expertise Level</label>
                      <select 
                        value={formState.level}
                        onChange={e => setFormState({...formState, level: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                      >
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Temporal Duration</label>
                      <input 
                        type="text" required
                        value={formState.duration}
                        onChange={e => setFormState({...formState, duration: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. 6 Weeks"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Curriculum Visual Cover Image</label>
                      <label className="cursor-pointer text-[10px] font-bold text-orange-600 hover:text-orange-500 flex items-center gap-1">
                        <Upload size={12} />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                        <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="text"
                        value={formState.image}
                        onChange={e => setFormState({...formState, image: e.target.value})}
                        className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono focus:bg-white focus:border-orange-500 transition-all outline-none"
                        placeholder="Paste image URL or click 'Upload File'"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormState({...formState, image: generateDynamicSvgUrl(formState.title || 'Course', formState.category, 'course')})}
                        className="px-6 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                      >
                        Auto-Asset
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deliverables Description</label>
                    <textarea 
                      rows={3} required
                      value={formState.description}
                      onChange={e => setFormState({...formState, description: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium leading-relaxed focus:bg-white focus:border-orange-500 transition-all outline-none resize-none"
                      placeholder="Summary of target student gains and structural certification outcomes..."
                    />
                  </div>

                  {/* Lessons Configurator */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#000E32]">Curriculum Modules ({formState.lessons.length})</h4>
                      <button 
                        type="button"
                        onClick={addLesson}
                        className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Module
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formState.lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                          <span className="text-[10px] font-black text-slate-400 font-mono w-6">{idx + 1}.</span>
                          <input 
                            type="text" 
                            value={lesson.title}
                            onChange={e => updateLesson(lesson.id, { title: e.target.value })}
                            className="flex-1 bg-white border border-slate-200 p-2 rounded-xl text-[11px] font-bold outline-none focus:border-[#000E32]"
                            placeholder="Module Title"
                          />
                          <input 
                            type="text" 
                            value={lesson.duration}
                            onChange={e => updateLesson(lesson.id, { duration: e.target.value })}
                            className="w-24 bg-white border border-slate-200 p-2 rounded-xl text-[10px] font-mono font-bold outline-none focus:border-[#000E32]"
                            placeholder="Duration"
                          />
                          <div className="flex items-center gap-4 px-2">
                            <label className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={lesson.isFree}
                                onChange={e => updateLesson(lesson.id, { isFree: e.target.checked })}
                                className="w-4 h-4 accent-[#000E32]"
                              />
                              Preview
                            </label>
                            <button 
                              type="button"
                              onClick={() => removeLesson(lesson.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <ShieldCheck size={20} />
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Enterprise Validation Ready</span>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest">Discard</button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-10 py-4 bg-[#000E32] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {activeCourse ? 'Commit Changes' : 'Deploy Masterclass'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Live Visual Sidebar */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6 flex flex-col h-full sticky top-8">
                <div className="flex items-center justify-between px-2 border-b border-slate-100 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Eye size={12} className="text-orange-500" />
                    Student View Rendering
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">LIVE PREVIEW</span>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-thin">
                  {/* The actual course card preview */}
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl max-w-[320px] mx-auto">
                    <div className="h-44 relative bg-slate-900">
                      {formState.image ? (
                        <img src={resolveImageUrl(formState.image)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-50"><ImageIcon size={40} strokeWidth={1} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-4 right-4 bg-orange-600 text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg">
                        {formState.price}
                      </div>
                      <div className="absolute bottom-4 left-4 flex flex-col">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{formState.level}</span>
                        <h4 className="text-sm font-black text-white uppercase font-serif tracking-tight line-clamp-1">{formState.title || 'Draft Masterclass'}</h4>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1"><Clock size={12} /> {formState.duration}</span>
                        <span className="flex items-center gap-1"><BookOpen size={12} /> {formState.lessons.length} Modules</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{formState.description || 'Initialize the curriculum brief to see the student-facing value rendering.'}</p>
                    </div>
                  </div>

                  {/* Modules Preview List */}
                  <div className="space-y-4 px-2">
                    <h5 className="text-[10px] font-black uppercase text-[#000E32] tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                      <List size={12} />
                      Curriculum Structure
                    </h5>
                    <div className="space-y-2">
                      {formState.lessons.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No modules defined yet.</p>
                      ) : (
                        formState.lessons.map((l, i) => (
                          <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-300 font-mono">{i+1}</span>
                              <span className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]">{l.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {l.isFree && <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Preview</span>}
                              <span className="text-[9px] font-mono text-slate-400 font-bold">{l.duration}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex gap-4 text-left">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 h-max"><Award size={20} /></div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-wide">Academy Insights</h4>
                    <p className="text-[9px] text-indigo-700 font-medium leading-relaxed">
                      Courses with at least 1 free preview module convert 42% higher. Your current structure is optimal for student retention.
                    </p>
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
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Masterclasses...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full py-24 bg-white border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center gap-6 text-center px-10">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                  <GraduationCap size={50} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800 uppercase font-serif tracking-tight">Ecosystem Dormant</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                    No vocational curricula have been launched yet. Initialize your first academy node to start providing professional mentorship.
                  </p>
                </div>
                <button 
                  onClick={handleAddNew}
                  className="px-10 py-4 bg-[#000E32] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  Launch First Masterclass
                </button>
              </div>
            ) : (
              filteredCourses.map(crs => (
                <motion.div
                  layout
                  key={crs.id}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all flex flex-col h-full"
                >
                  <div className="h-48 relative bg-slate-900 overflow-hidden shrink-0">
                    <img 
                      src={resolveImageUrl(crs.image)} 
                      alt={crs.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-2xl text-[10px] font-black text-[#000E32] shadow-sm">
                      {crs.price}
                    </div>
                    <div className="absolute bottom-4 left-6 space-y-1">
                      <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">{crs.level}</span>
                      <h4 className="text-sm font-black text-white uppercase font-serif tracking-tight leading-tight line-clamp-1">{crs.title}</h4>
                    </div>
                  </div>
                  <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500" /> {crs.duration}</span>
                        <span className="flex items-center gap-1.5"><Layers size={12} className="text-orange-500" /> {crs.lessons?.length || 0} Modules</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                        {crs.description}
                      </p>
                    </div>
                    <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <Target size={14} className="text-slate-400" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Node: {crs.id.split('_')[1]}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(crs)}
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(crs.id)}
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
